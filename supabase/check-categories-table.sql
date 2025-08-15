/**
 * @file: supabase/check-categories-table.sql
 * @description: Простий скрипт для перевірки структури таблиці categories
 * @created: 2024-12-19
 */

-- 1. Перевіряємо, чи існує таблиця categories
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') 
        THEN '✅ Таблиця categories існує'
        ELSE '❌ Таблиця categories НЕ існує'
    END as table_status;

-- 2. Перевіряємо структуру таблиці
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('parent_id', 'level') THEN '🆕 НОВЕ ПОЛЕ'
        ELSE '📋 Стандартне поле'
    END as field_status
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- 3. Перевіряємо наявність обов'язкових полів
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'parent_id')
        THEN '✅ parent_id існує'
        ELSE '❌ parent_id НЕ існує'
    END as parent_id_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'level')
        THEN '✅ level існує'
        ELSE '❌ level НЕ існує'
    END as level_status;

-- 4. Перевіряємо поточні дані
SELECT 
    COUNT(*) as total_categories,
    COUNT(CASE WHEN level = 0 THEN 1 END) as main_categories,
    COUNT(CASE WHEN level = 1 THEN 1 END) as subcategories,
    COUNT(CASE WHEN level = 2 THEN 1 END) as sub_subcategories
FROM categories;

-- 5. Перевіряємо приклад категорії
SELECT 
    id,
    name,
    parent_id,
    level,
    sort_order,
    is_active
FROM categories 
LIMIT 3;
