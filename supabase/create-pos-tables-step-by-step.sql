-- ПОЕТАПНЕ СТВОРЕННЯ POS ТАБЛИЦЬ
-- Виконуйте цей скрипт по частинах в Supabase SQL Editor

-- ========================================
-- КРОК 1: Створення таблиці клієнтів
-- ========================================
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

-- Перевірка створення
SELECT 'Таблиця customers створена' as status;

-- ========================================
-- КРОК 2: Створення таблиці замовлень
-- ========================================
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

-- Перевірка створення
SELECT 'Таблиця orders створена' as status;

-- ========================================
-- КРОК 3: Створення таблиці товарів замовлення
-- ========================================
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

-- Перевірка створення
SELECT 'Таблиця order_items створена' as status;

-- ========================================
-- КРОК 4: Додавання колонки image_url до products
-- ========================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Колонка image_url додана до таблиці products';
    ELSE
        RAISE NOTICE 'Колонка image_url вже існує в таблиці products';
    END IF;
END $$;

-- ========================================
-- КРОК 5: Створення індексів
-- ========================================
-- Індекси для customers
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Індекси для orders
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Індекси для order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

SELECT 'Індекси створені' as status;

-- ========================================
-- КРОК 6: Включення RLS
-- ========================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

SELECT 'RLS включено' as status;

-- ========================================
-- КРОК 7: Створення RLS політик для customers
-- ========================================
CREATE POLICY "Users can view customers from their business" ON customers
    FOR SELECT USING (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can insert customers to their business" ON customers
    FOR INSERT WITH CHECK (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can update customers from their business" ON customers
    FOR UPDATE USING (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can delete customers from their business" ON customers
    FOR DELETE USING (business_id::text = auth.jwt() ->> 'business_id');

SELECT 'RLS політики для customers створені' as status;

-- ========================================
-- КРОК 8: Створення RLS політик для orders
-- ========================================
CREATE POLICY "Users can view orders from their business" ON orders
    FOR SELECT USING (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can insert orders to their business" ON orders
    FOR INSERT WITH CHECK (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can update orders from their business" ON orders
    FOR UPDATE USING (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can delete orders from their business" ON orders
    FOR DELETE USING (business_id::text = auth.jwt() ->> 'business_id');

SELECT 'RLS політики для orders створені' as status;

-- ========================================
-- КРОК 9: Створення RLS політик для order_items
-- ========================================
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

SELECT 'RLS політики для order_items створені' as status;

-- ========================================
-- КРОК 10: Додавання тестових даних (ОПЦІЙНО)
-- ========================================
-- Розкоментуйте наступні рядки, якщо хочете додати тестові дані

/*
-- Додавання тестових клієнтів
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

SELECT 'Тестові клієнти створені' as status;
*/

-- ========================================
-- ФІНАЛЬНА ПЕРЕВІРКА
-- ========================================
SELECT 
    'POS таблиці успішно створено!' as status,
    (SELECT COUNT(*) FROM customers) as customers_count,
    (SELECT COUNT(*) FROM orders) as orders_count,
    (SELECT COUNT(*) FROM order_items) as order_items_count;
