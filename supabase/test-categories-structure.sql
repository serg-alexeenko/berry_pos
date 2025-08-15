/**
 * @file: supabase/test-categories-structure.sql
 * @description: Тестовий SQL скрипт для перевірки структури таблиці categories
 * @dependencies: quick-update-categories.sql
 * @created: 2024-12-19
 */

-- Перевіряємо структуру таблиці categories
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- Перевіряємо наявність індексів
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'categories';

-- Перевіряємо наявність обмежень
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public' 
AND constraint_name LIKE '%categories%';

-- Перевіряємо наявність тригерів
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'categories';

-- Перевіряємо поточні дані в таблиці
SELECT 
    id,
    business_id,
    parent_id,
    name,
    level,
    sort_order,
    is_active,
    created_at,
    updated_at
FROM categories 
ORDER BY level, sort_order, name;

-- Перевіряємо зв'язки між категоріями
SELECT 
    c1.name as main_category,
    c1.level as main_level,
    c2.name as subcategory,
    c2.level as sub_level,
    c3.name as sub_subcategory,
    c3.level as sub_sub_level
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id
LEFT JOIN categories c3 ON c3.parent_id = c2.id
WHERE c1.level = 0
ORDER BY c1.sort_order, c2.sort_order, c3.sort_order;

-- Перевіряємо статистику по рівнях
SELECT 
    level,
    COUNT(*) as count,
    MIN(sort_order) as min_sort,
    MAX(sort_order) as max_sort
FROM categories 
GROUP BY level 
ORDER BY level;
