-- Швидке виправлення таблиці products
-- @file: fix-products-table.sql
-- @description: Додавання відсутніх колонок до таблиці products
-- @created: 2024-12-19

-- Додаємо відсутні колонки
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'шт';

-- Перевіряємо результат
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
