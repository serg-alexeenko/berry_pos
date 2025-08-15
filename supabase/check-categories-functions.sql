/**
 * @file: supabase/check-categories-functions.sql
 * @description: Перевірка наявності всіх необхідних функцій для категорій
 * @created: 2024-12-19
 */

-- 1. Перевіряємо наявність функції update_category_level
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_category_level')
        THEN '✅ Функція update_category_level існує'
        ELSE '❌ Функція update_category_level НЕ існує'
    END as update_category_level_status;

-- 2. Перевіряємо наявність функції check_category_cycles
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'check_category_cycles')
        THEN '✅ Функція check_category_cycles існує'
        ELSE '❌ Функція check_category_cycles НЕ існує'
    END as check_category_cycles_status;

-- 3. Перевіряємо наявність функції update_categories_updated_at
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_categories_updated_at')
        THEN '✅ Функція update_categories_updated_at існує'
        ELSE '❌ Функція update_categories_updated_at НЕ існує'
    END as update_categories_updated_at_status;

-- 4. Перевіряємо деталі функції update_category_level
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_category_level';

-- 5. Перевіряємо деталі функції check_category_cycles
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'check_category_cycles';

-- 6. Тестуємо функцію update_category_level
-- Це допоможе виявити синтаксичні помилки
DO $$
BEGIN
    -- Перевіряємо, чи функція може бути викликана
    PERFORM update_category_level();
    RAISE NOTICE 'Функція update_category_level працює коректно';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Помилка в функції update_category_level: %', SQLERRM;
END $$;

-- 7. Перевіряємо поточну структуру таблиці categories
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

-- 8. Перевіряємо наявність обмежень
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public' 
AND constraint_name LIKE '%categories%';

-- 9. Перевіряємо наявність індексів
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'categories';
