-- Базовий скрипт створення таблиці продуктів
-- @file: basic-create-products.sql
-- @description: Максимально простий скрипт без складних обмежень
-- @created: 2024-12-19

-- Створюємо таблицю продуктів
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost DECIMAL(10,2) DEFAULT 0 CHECK (cost >= 0),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'шт',
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Створюємо базові індекси
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Включаємо RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Базова політика для всіх операцій (можна розширити пізніше)
CREATE POLICY "Enable all access for authenticated users" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Повідомлення про успіх
SELECT 'Таблиця products успішно створена!' as status;
