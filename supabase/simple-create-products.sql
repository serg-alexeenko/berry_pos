-- Простий скрипт створення таблиці продуктів
-- @file: simple-create-products.sql
-- @description: Максимально простий скрипт без складних елементів
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

-- Додаємо унікальні обмеження (без WHERE, оскільки PostgreSQL не підтримує)
-- SKU та штрих-код можуть бути NULL, але якщо вказані - мають бути унікальними в межах бізнесу
ALTER TABLE products ADD CONSTRAINT unique_product_sku_per_business 
    UNIQUE (business_id, sku);
ALTER TABLE products ADD CONSTRAINT unique_product_barcode_per_business 
    UNIQUE (business_id, barcode);

-- Створюємо базові індекси
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Включаємо RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Базова політика для читання (можна розширити пізніше)
CREATE POLICY "Enable read access for authenticated users" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

-- Базова політика для запису (можна розширити пізніше)
CREATE POLICY "Enable insert access for authenticated users" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Базова політика для оновлення (можна розширити пізніше)
CREATE POLICY "Enable update access for authenticated users" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Базова політика для видалення (можна розширити пізніше)
CREATE POLICY "Enable delete access for authenticated users" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Повідомлення про успіх
SELECT 'Таблиця products успішно створена!' as status;
