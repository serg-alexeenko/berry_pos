-- Тестування створення продуктів
-- @file: test-product-creation.sql
-- @description: SQL скрипт для тестування створення продуктів
-- @created: 2024-12-19

-- Спочатку перевіряємо структуру таблиці продуктів
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Перевіряємо індекси
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'products';

-- Перевіряємо тригери
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'products';

-- Перевіряємо RLS політики
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Тестуємо створення продукту (замініть 'your-business-id' на реальний ID бізнесу)
-- Отримайте ID бізнесу з таблиці businesses:
-- SELECT id, name FROM businesses LIMIT 1;

-- Приклад створення продукту:
/*
INSERT INTO products (
    business_id,
    name,
    description,
    price,
    cost,
    sku,
    barcode,
    stock_quantity,
    min_stock_level,
    unit,
    category_id
) VALUES (
    'your-business-id', -- Замініть на реальний ID бізнесу
    'Тестовий продукт',
    'Опис тестового продукту',
    99.99,
    50.00,
    'TEST-001',
    '1234567890123',
    100,
    10,
    'шт',
    NULL -- або ID категорії, якщо є
);
*/

-- Перевіряємо створений продукт
-- SELECT * FROM products WHERE name = 'Тестовий продукт';

-- Перевіряємо зв'язок з категоріями (якщо є)
/*
SELECT 
    p.id,
    p.name,
    p.price,
    p.stock_quantity,
    c.name as category_name,
    c.level as category_level
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.business_id = 'your-business-id'
ORDER BY p.created_at DESC;
*/
