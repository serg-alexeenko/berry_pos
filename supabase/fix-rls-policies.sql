-- ВИПРАВЛЕННЯ RLS ПОЛІТИК ДЛЯ ТЕСТУВАННЯ
-- Виконайте цей скрипт в Supabase SQL Editor

-- ========================================
-- КРОК 1: Видалення існуючих RLS політик
-- ========================================
DROP POLICY IF EXISTS "Users can view customers from their business" ON customers;
DROP POLICY IF EXISTS "Users can insert customers to their business" ON customers;
DROP POLICY IF EXISTS "Users can update customers from their business" ON customers;
DROP POLICY IF EXISTS "Users can delete customers from their business" ON customers;

DROP POLICY IF EXISTS "Users can view orders from their business" ON orders;
DROP POLICY IF EXISTS "Users can insert orders to their business" ON orders;
DROP POLICY IF EXISTS "Users can update orders from their business" ON orders;
DROP POLICY IF EXISTS "Users can delete orders from their business" ON orders;

DROP POLICY IF EXISTS "Users can view order items from their business" ON order_items;
DROP POLICY IF EXISTS "Users can insert order items to their business" ON order_items;
DROP POLICY IF EXISTS "Users can update order items from their business" ON order_items;
DROP POLICY IF EXISTS "Users can delete order items from their business" ON order_items;

SELECT 'Старі RLS політики видалені' as status;

-- ========================================
-- КРОК 2: Створення тимчасових RLS політик для тестування
-- ========================================

-- Політики для customers (тимчасово дозволяють всі операції)
CREATE POLICY "temp_customers_select" ON customers
    FOR SELECT USING (true);

CREATE POLICY "temp_customers_insert" ON customers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "temp_customers_update" ON customers
    FOR UPDATE USING (true);

CREATE POLICY "temp_customers_delete" ON customers
    FOR DELETE USING (true);

-- Політики для orders (тимчасово дозволяють всі операції)
CREATE POLICY "temp_orders_select" ON orders
    FOR SELECT USING (true);

CREATE POLICY "temp_orders_insert" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "temp_orders_update" ON orders
    FOR UPDATE USING (true);

CREATE POLICY "temp_orders_delete" ON orders
    FOR DELETE USING (true);

-- Політики для order_items (тимчасово дозволяють всі операції)
CREATE POLICY "temp_order_items_select" ON order_items
    FOR SELECT USING (true);

CREATE POLICY "temp_order_items_insert" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "temp_order_items_update" ON order_items
    FOR UPDATE USING (true);

CREATE POLICY "temp_order_items_delete" ON order_items
    FOR DELETE USING (true);

SELECT 'Тимчасові RLS політики створені' as status;

-- ========================================
-- КРОК 3: Перевірка створення політик
-- ========================================
SELECT '=== ПЕРЕВІРКА RLS ПОЛІТИК ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('customers', 'orders', 'order_items')
ORDER BY tablename, policyname;

-- ========================================
-- КРОК 4: Тестування доступу
-- ========================================
SELECT '=== ТЕСТУВАННЯ ДОСТУПУ ===' as info;

-- Тест чи можна читати customers
SELECT 'Тест читання customers:' as test, COUNT(*) as count FROM customers;

-- Тест чи можна читати orders
SELECT 'Тест читання orders:' as test, COUNT(*) as count FROM orders;

-- Тест чи можна читати order_items
SELECT 'Тест читання order_items:' as test, COUNT(*) as count FROM order_items;

-- ========================================
-- ПРИМІТКА: ЦЕ ТИМЧАСОВЕ РІШЕННЯ
-- ========================================
SELECT 'УВАГА: Це тимчасове рішення для тестування!' as warning;
SELECT 'Для production потрібно налаштувати правильні RLS політики з auth.jwt()' as note;
