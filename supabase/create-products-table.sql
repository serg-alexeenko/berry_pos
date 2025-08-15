-- Створення таблиці продуктів
-- @file: create-products-table.sql
-- @description: Створення таблиці продуктів з усіма необхідними полями
-- @created: 2024-12-19

-- Додаємо таблицю продуктів, якщо її немає
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

-- Створюємо індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Додаємо унікальні обмеження (безпечно, без WHERE)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_product_sku_per_business'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT unique_product_sku_per_business 
            UNIQUE (business_id, sku);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_product_barcode_per_business'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT unique_product_barcode_per_business 
            UNIQUE (business_id, barcode);
    END IF;
END $$;

-- Функція для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для автоматичного оновлення updated_at
DROP TRIGGER IF EXISTS trigger_update_products_updated_at ON products;
CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Функція для перевірки наявності продукту в замовленнях перед видаленням
CREATE OR REPLACE FUNCTION check_product_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Перевіряємо, чи є продукт в замовленнях (якщо таблиця order_items існує)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'order_items'
    ) THEN
        IF EXISTS (SELECT 1 FROM order_items WHERE product_id = OLD.id) THEN
            RAISE EXCEPTION 'Неможливо видалити продукт, який використовується в замовленнях';
        END IF;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Тригер для перевірки перед видаленням
DROP TRIGGER IF EXISTS trigger_check_product_deletion ON products;
CREATE TRIGGER trigger_check_product_deletion
    BEFORE DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION check_product_deletion();

-- Додаємо RLS політики
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Політики RLS (безпечно створюємо або замінюємо)
DO $$ 
BEGIN
    -- Політика для читання
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Users can view own business products'
    ) THEN
        CREATE POLICY "Users can view own business products" ON products
            FOR SELECT USING (business_id IN (
                SELECT id FROM businesses WHERE user_id = auth.uid()
            ));
    END IF;
    
    -- Політика для створення
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Users can create products for own business'
    ) THEN
        CREATE POLICY "Users can create products for own business" ON products
            FOR INSERT WITH CHECK (business_id IN (
                SELECT id FROM businesses WHERE user_id = auth.uid()
            ));
    END IF;
    
    -- Політика для оновлення
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Users can update own business products'
    ) THEN
        CREATE POLICY "Users can update own business products" ON products
            FOR UPDATE USING (business_id IN (
                SELECT id FROM businesses WHERE user_id = auth.uid()
            ));
    END IF;
    
    -- Політика для видалення
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Users can delete own business products'
    ) THEN
        CREATE POLICY "Users can delete own business products" ON products
            FOR DELETE USING (business_id IN (
                SELECT id FROM businesses WHERE user_id = auth.uid()
            ));
    END IF;
END $$;
