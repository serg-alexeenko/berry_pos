/**
 * @file: supabase/test-insert-category.sql
 * @description: Тестовий скрипт для перевірки створення категорії
 * @created: 2024-12-19
 */

-- 1. Спочатку отримаємо існуючий business_id
SELECT 
    'Поточні бізнеси:' as info,
    id,
    name,
    type
FROM businesses 
LIMIT 5;

-- 2. Тестуємо створення головної категорії (використовуйте реальний business_id з кроку 1)
-- ЗАМІНІТЬ 'your-business-id' на реальний UUID з кроку 1
/*
INSERT INTO categories (business_id, name, level, sort_order, is_active) 
VALUES (
    '00000000-0000-0000-0000-000000000000', -- ЗАМІНІТЬ на реальний business_id
    'Тестова головна категорія',
    0,
    1,
    true
);
*/

-- 3. Перевіряємо поточні категорії
SELECT 
    id,
    business_id,
    name,
    parent_id,
    level,
    sort_order,
    is_active,
    created_at
FROM categories 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Перевіряємо структуру таблиці
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- 5. Перевіряємо наявність тригерів
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'categories';

-- ІНСТРУКЦІЯ:
-- 1. Запустіть цей скрипт
-- 2. Скопіюйте business_id з результату кроку 1
-- 3. Розкоментуйте INSERT запит (крок 2) та замініть UUID на реальний
-- 4. Запустіть INSERT запит
-- 5. Перевірте результат кроку 3
