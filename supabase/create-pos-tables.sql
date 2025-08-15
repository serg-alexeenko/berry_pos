-- Простий скрипт для створення таблиць POS системи
-- Виконайте цей скрипт в Supabase SQL Editor

-- 1. Створення таблиці клієнтів
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

-- 2. Створення таблиці замовлень
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

-- 3. Створення таблиці товарів замовлення
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

-- 4. Додавання колонки image_url до products якщо її немає
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 5. Створення індексів для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 6. Включення RLS (Row Level Security)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 7. Створення RLS політик для customers
CREATE POLICY "Users can view customers from their business" ON customers
    FOR SELECT USING (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can insert customers to their business" ON customers
    FOR INSERT WITH CHECK (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can update customers from their business" ON customers
    FOR UPDATE USING (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can delete customers from their business" ON customers
    FOR DELETE USING (business_id::text = auth.jwt() ->> 'business_id');

-- 8. Створення RLS політик для orders
CREATE POLICY "Users can view orders from their business" ON orders
    FOR SELECT USING (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can insert orders to their business" ON orders
    FOR INSERT WITH CHECK (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can update orders from their business" ON orders
    FOR UPDATE USING (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can delete orders from their business" ON orders
    FOR DELETE USING (business_id::text = auth.jwt() ->> 'business_id');

-- 9. Створення RLS політик для order_items
CREATE POLICY "Users can view order items from their business" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.business_id::text = auth.jwt() ->> 'business_id'
        )
    );

CREATE POLICY "Users can insert order items to their business" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.business_id::text = auth.jwt() ->> 'business_id'
        )
    );

CREATE POLICY "Users can update order items from their business" ON order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.business_id::text = auth.jwt() ->> 'business_id'
        )
    );

CREATE POLICY "Users can delete order items from their business" ON order_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.business_id::text = auth.jwt() ->> 'business_id'
        )
    );

-- 10. Додавання тестових даних (тільки якщо таблиці існують)
DO $$
BEGIN
    -- Перевіряємо чи існує таблиця customers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        -- Перевіряємо чи є дані в businesses
        IF EXISTS (SELECT 1 FROM businesses LIMIT 1) THEN
            INSERT INTO customers (id, business_id, name, phone, email, address, loyalty_points)
            SELECT 
                gen_random_uuid(),
                b.id,
                'Тестовий клієнт ' || i,
                '+38099' || LPAD(i::TEXT, 6, '0'),
                'client' || i || '@example.com',
                'Адреса клієнта ' || i,
                (i * 10)
            FROM businesses b
            CROSS JOIN generate_series(1, 3) i
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Тестові клієнти створено';
        ELSE
            RAISE NOTICE 'Таблиця businesses порожня, тестові клієнти не створено';
        END IF;
    ELSE
        RAISE NOTICE 'Таблиця customers не існує, тестові клієнти не створено';
    END IF;
END $$;

-- 11. Повідомлення про успішне створення
SELECT 'POS таблиці успішно створено!' as status;
