-- Berry POS - Оновлене виправлення RLS політик та прав доступу
-- Виконайте цей SQL в Supabase SQL Editor для виправлення проблем з реєстрацією

-- 1. Видаляємо зайві права доступу для anon користувачів
-- Це необхідно для правильної роботи RLS політик

-- Видаляємо права INSERT для anon з таблиці users
REVOKE INSERT ON users FROM anon;

-- Видаляємо права INSERT для anon з таблиці businesses
REVOKE INSERT ON businesses FROM anon;

-- Видаляємо права INSERT для anon з таблиці employees
REVOKE INSERT ON employees FROM anon;

-- Видаляємо права INSERT для anon з таблиці categories
REVOKE INSERT ON categories FROM anon;

-- Видаляємо права INSERT для anon з таблиці products
REVOKE INSERT ON products FROM anon;

-- Видаляємо права INSERT для anon з таблиці customers
REVOKE INSERT ON customers FROM anon;

-- Видаляємо права INSERT для anon з таблиці orders
REVOKE INSERT ON orders FROM anon;

-- Видаляємо права INSERT для anon з таблиці order_items
REVOKE INSERT ON order_items FROM anon;

-- 2. Видаляємо всі існуючі RLS політики
-- Це дозволить створити нові без конфліктів

-- Видаляємо політики для таблиці users
DROP POLICY IF EXISTS "Users can create themselves" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Видаляємо політики для таблиці businesses
DROP POLICY IF EXISTS "Users can create own business" ON businesses;
DROP POLICY IF EXISTS "Users can read own business" ON businesses;
DROP POLICY IF EXISTS "Users can update own business" ON businesses;
DROP POLICY IF EXISTS "Users can delete own business" ON businesses;

-- Видаляємо політики для таблиці employees
DROP POLICY IF EXISTS "Users can manage own business employees" ON employees;

-- Видаляємо політики для таблиці categories
DROP POLICY IF EXISTS "Users can manage own business categories" ON categories;

-- Видаляємо політики для таблиці products
DROP POLICY IF EXISTS "Users can manage own business products" ON products;

-- Видаляємо політики для таблиці customers
DROP POLICY IF EXISTS "Users can manage own business customers" ON customers;

-- Видаляємо політики для таблиці orders
DROP POLICY IF EXISTS "Users can manage own business orders" ON orders;

-- Видаляємо політики для таблиці order_items
DROP POLICY IF EXISTS "Users can manage own business order items" ON order_items;

-- 3. Створюємо нові RLS політики для таблиці users
-- Включаємо RLS для таблиці users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Політика для створення користувачів (через тригер)
CREATE POLICY "Users can create themselves" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Політика для читання власних даних
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Політика для оновлення власних даних
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 4. Створюємо нові RLS політики для таблиці businesses
-- Включаємо RLS для таблиці businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Політика для створення бізнесу
CREATE POLICY "Users can create own business" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Політика для читання власного бізнесу
CREATE POLICY "Users can read own business" ON businesses
  FOR SELECT USING (auth.uid() = user_id);

-- Політика для оновлення власного бізнесу
CREATE POLICY "Users can update own business" ON businesses
  FOR UPDATE USING (auth.uid() = user_id);

-- Політика для видалення власного бізнесу
CREATE POLICY "Users can delete own business" ON businesses
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Створюємо нові RLS політики для таблиці employees
-- Включаємо RLS для таблиці employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Політика для управління працівниками власного бізнесу
CREATE POLICY "Users can manage own business employees" ON employees
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 6. Створюємо нові RLS політики для таблиці categories
-- Включаємо RLS для таблиці categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Політика для управління категоріями власного бізнесу
CREATE POLICY "Users can manage own business categories" ON categories
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 7. Створюємо нові RLS політики для таблиці products
-- Включаємо RLS для таблиці products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Політика для управління товарами власного бізнесу
CREATE POLICY "Users can manage own business products" ON products
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 8. Створюємо нові RLS політики для таблиці customers
-- Включаємо RLS для таблиці customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Політика для управління клієнтами власного бізнесу
CREATE POLICY "Users can manage own business customers" ON customers
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 9. Створюємо нові RLS політики для таблиці orders
-- Включаємо RLS для таблиці orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Політика для управління замовленнями власного бізнесу
CREATE POLICY "Users can manage own business orders" ON orders
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 10. Створюємо нові RLS політики для таблиці order_items
-- Включаємо RLS для таблиці order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Політика для управління елементами замовлень власного бізнесу
CREATE POLICY "Users can manage own business order items" ON order_items
  FOR ALL USING (
    order_id IN (
      SELECT id FROM orders WHERE business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
      )
    )
  );

-- 11. Перевіряємо функцію handle_new_user
-- Якщо функція не існує, створюємо її

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Вставляємо запис в таблицю users
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Перевіряємо тригер
-- Якщо тригер не існує, створюємо його

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 13. Перевіряємо, чи правильно налаштовані права
-- Даємо необхідні права для authenticated користувачів

-- Права для створення користувачів (через тригер)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON businesses TO authenticated;
GRANT ALL ON employees TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON customers TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;

-- 14. Перевіряємо структуру таблиць та налаштовуємо UUID
-- Створюємо розширення для UUID, якщо його немає

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Перевіряємо, чи правильно налаштовані UUID поля
-- Якщо потрібно, оновлюємо значення за замовчуванням

-- Для таблиці businesses (якщо id має тип uuid)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) THEN
    -- Якщо поле вже має UUID тип, не змінюємо його
    NULL;
  END IF;
END $$;

-- Для таблиці employees (якщо id має тип uuid)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) THEN
    -- Якщо поле вже має UUID тип, не змінюємо його
    NULL;
  END IF;
END $$;

-- Для таблиці categories (якщо id має тип uuid)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) THEN
    -- Якщо поле вже має UUID тип, не змінюємо його
    NULL;
  END IF;
END $$;

-- Для таблиці products (якщо id має тип uuid)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) THEN
    -- Якщо поле вже має UUID тип, не змінюємо його
    NULL;
  END IF;
END $$;

-- Для таблиці customers (якщо id має тип uuid)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) THEN
    -- Якщо поле вже має UUID тип, не змінюємо його
    NULL;
  END IF;
END $$;

-- Для таблиці orders (якщо id має тип uuid)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) THEN
    -- Якщо поле вже має UUID тип, не змінюємо його
    NULL;
  END IF;
END $$;

-- Для таблиці order_items (якщо id має тип uuid)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) THEN
    -- Якщо поле вже має UUID тип, не змінюємо його
    NULL;
  END IF;
END $$;

-- 15. Перевіряємо результат
-- Виводимо всі створені політики

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 16. Перевіряємо структуру таблиць
-- Виводимо інформацію про типи полів

SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'businesses', 'employees', 'categories', 'products', 'customers', 'orders', 'order_items')
  AND column_name = 'id'
ORDER BY table_name;
