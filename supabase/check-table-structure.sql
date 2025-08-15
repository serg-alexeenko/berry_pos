-- Перевірка структури таблиць POS системи
-- Виконайте цей скрипт в Supabase SQL Editor

-- 1. Перевірка структури таблиці customers
SELECT '=== СТРУКТУРА ТАБЛИЦІ customers ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- 2. Перевірка структури таблиці orders
SELECT '=== СТРУКТУРА ТАБЛИЦІ orders ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 3. Перевірка структури таблиці order_items
SELECT '=== СТРУКТУРА ТАБЛИЦІ order_items ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- 4. Перевірка наявності таблиць
SELECT '=== НАЯВНІСТЬ ТАБЛИЦЬ ===' as info;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_name IN ('customers', 'orders', 'order_items')
ORDER BY table_name;

-- 5. Перевірка RLS політик
SELECT '=== RLS ПОЛІТИКИ ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('customers', 'orders', 'order_items')
ORDER BY tablename, policyname;
