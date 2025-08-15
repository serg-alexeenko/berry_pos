-- Перевірка та виправлення структури таблиці products
-- @file: check-products-table.sql
-- @description: Перевірка та виправлення структури таблиці products
-- @created: 2024-12-19

-- Перевіряємо поточну структуру таблиці
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Перевіряємо, чи існує колонка image_url
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'image_url'
) as has_image_url;

-- Додаємо колонку image_url, якщо її немає
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Додано колонку image_url до таблиці products';
    ELSE
        RAISE NOTICE 'Колонка image_url вже існує в таблиці products';
    END IF;
END $$;

-- Перевіряємо, чи існує колонка is_active
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_active'
) as has_is_active;

-- Додаємо колонку is_active, якщо її немає
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Додано колонку is_active до таблиці products';
    ELSE
        RAISE NOTICE 'Колонка is_active вже існує в таблиці products';
    END IF;
END $$;

-- Перевіряємо, чи існує колонка unit
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'unit'
) as has_unit;

-- Додаємо колонку unit, якщо її немає
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'unit'
    ) THEN
        ALTER TABLE products ADD COLUMN unit VARCHAR(50) DEFAULT 'шт';
        RAISE NOTICE 'Додано колонку unit до таблиці products';
    ELSE
        RAISE NOTICE 'Колонка unit вже існує в таблиці products';
    END IF;
END $$;

-- Фінальна перевірка структури
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
