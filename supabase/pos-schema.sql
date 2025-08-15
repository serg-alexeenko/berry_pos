-- POS System Schema
-- Створення таблиць для системи замовлень та клієнтів

-- Таблиця клієнтів
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця замовлень
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'processing', 'ready', 'completed', 'cancelled')),
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця товарів замовлення
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- RLS політики для customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view customers from their business" ON customers
    FOR SELECT USING (business_id = auth.jwt() ->> 'business_id'::text);

CREATE POLICY "Users can insert customers to their business" ON customers
    FOR INSERT WITH CHECK (business_id = auth.jwt() ->> 'business_id'::text);

CREATE POLICY "Users can update customers from their business" ON customers
    FOR UPDATE USING (business_id = auth.jwt() ->> 'business_id'::text);

CREATE POLICY "Users can delete customers from their business" ON customers
    FOR DELETE USING (business_id = auth.jwt() ->> 'business_id'::text);

-- RLS політики для orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view orders from their business" ON orders
    FOR SELECT USING (business_id = auth.jwt() ->> 'business_id'::text);

CREATE POLICY "Users can insert orders to their business" ON orders
    FOR INSERT WITH CHECK (business_id = auth.jwt() ->> 'business_id'::text);

CREATE POLICY "Users can update orders from their business" ON orders
    FOR UPDATE USING (business_id = auth.jwt() ->> 'business_id'::text);

CREATE POLICY "Users can delete orders from their business" ON orders
    FOR DELETE USING (business_id = auth.jwt() ->> 'business_id'::text);

-- RLS політики для order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order items from their business" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.business_id = auth.jwt() ->> 'business_id'::text
        )
    );

CREATE POLICY "Users can insert order items to their business" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id_id 
            AND orders.business_id = auth.jwt() ->> 'business_id'::text
        )
    );

CREATE POLICY "Users can update order items from their business" ON order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.business_id = auth.jwt() ->> 'business_id'::text
        )
    );

CREATE POLICY "Users can delete order items from their business" ON order_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.business_id = auth.jwt() ->> 'business_id'::text
        )
    );

-- Функція для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Тригери для оновлення updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функція для генерації номера замовлення
CREATE OR REPLACE FUNCTION generate_order_number(business_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    next_number INTEGER;
    order_number VARCHAR;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM orders
    WHERE business_id = $1;
    
    order_number := 'ORD-' || LPAD(next_number::TEXT, 6, '0');
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Функція для оновлення загальної суми замовлення
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE orders 
        SET total_amount = (
            SELECT COALESCE(SUM(total_price), 0.00)
            FROM order_items 
            WHERE order_id = OLD.order_id
        ),
        final_amount = total_amount - COALESCE(discount_amount, 0.00)
        WHERE id = OLD.order_id;
        RETURN OLD;
    ELSE
        UPDATE orders 
        SET total_amount = (
            SELECT COALESCE(SUM(total_price), 0.00)
            FROM order_items 
            WHERE order_id = NEW.order_id
        ),
        final_amount = total_amount - COALESCE(discount_amount, 0.00)
        WHERE id = NEW.order_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Тригери для оновлення загальної суми
CREATE TRIGGER update_order_total_after_insert
    AFTER INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE TRIGGER update_order_total_after_update
    AFTER UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE TRIGGER update_order_total_after_delete
    AFTER DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_order_total();

-- Додавання колонки image_url до products якщо її немає
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Оновлення типу для products
INSERT INTO products (id, business_id, name, description, price, category_id, sku, stock_quantity, image_url, created_at, updated_at)
VALUES 
    (gen_random_uuid(), (SELECT id FROM businesses LIMIT 1), 'Тестовий продукт 1', 'Опис тестового продукту 1', 99.99, (SELECT id FROM categories LIMIT 1), 'SKU001', 100, 'https://via.placeholder.com/150', NOW(), NOW()),
    (gen_random_uuid(), (SELECT id FROM businesses LIMIT 1), 'Тестовий продукт 2', 'Опис тестового продукту 2', 149.99, (SELECT id FROM categories LIMIT 1), 'SKU002', 50, 'https://via.placeholder.com/150', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Додавання тестових клієнтів
INSERT INTO customers (id, business_id, name, phone, email, address, loyalty_points)
VALUES 
    (gen_random_uuid(), (SELECT id FROM businesses LIMIT 1), 'Іван Петренко', '+380991234567', 'ivan@example.com', 'Київ, вул. Хрещатик, 1', 100),
    (gen_random_uuid(), (SELECT id FROM businesses LIMIT 1), 'Марія Коваленко', '+380992345678', 'maria@example.com', 'Львів, вул. Сихівська, 15', 250)
ON CONFLICT DO NOTHING;
