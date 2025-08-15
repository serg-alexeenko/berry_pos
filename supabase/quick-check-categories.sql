/**
 * @file: supabase/quick-check-categories.sql
 * @description: Спрощений скрипт для швидкої перевірки всіх компонентів системи категорій
 * @created: 2024-12-19
 */

-- 1. Перевіряємо структуру таблиці
SELECT 
    'Структура таблиці categories:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- 2. Перевіряємо наявність обов'язкових полів
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

-- 3. Перевіряємо наявність функцій
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_category_level')
        THEN '✅ update_category_level існує'
        ELSE '❌ update_category_level НЕ існує'
    END as update_category_level_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'check_category_cycles')
        THEN '✅ check_category_cycles існує'
        ELSE '❌ check_category_cycles НЕ існує'
    END as check_category_cycles_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_categories_updated_at')
        THEN '✅ update_categories_updated_at існує'
        ELSE '❌ update_categories_updated_at НЕ існує'
    END as update_categories_updated_at_status;

-- 4. Перевіряємо наявність тригерів
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'categories'
ORDER BY trigger_name, event_manipulation;

-- 5. Перевіряємо наявність індексів
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'categories';

-- 6. Перевіряємо наявність обмежень
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public' 
AND constraint_name LIKE '%categories%';

-- 7. Перевіряємо поточні дані
SELECT 
    'Поточні категорії:' as info,
    COUNT(*) as total_categories,
    COUNT(CASE WHEN level = 0 THEN 1 END) as main_categories,
    COUNT(CASE WHEN level = 1 THEN 1 END) as subcategories,
    COUNT(CASE WHEN level = 2 THEN 1 END) as sub_subcategories
FROM categories;

-- 8. Перевіряємо приклад категорії
SELECT 
    'Приклад категорії:' as info,
    id,
    name,
    parent_id,
    level,
    sort_order,
    is_active
FROM categories 
LIMIT 1;
