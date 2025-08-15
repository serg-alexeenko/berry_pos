-- Berry POS - Виправлення RLS політик та прав доступу
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

-- 2. Перевіряємо та створюємо RLS політики для таблиці users
-- Ця таблиця має особливі права - користувачі можуть створювати себе через тригер

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

-- 3. Перевіряємо та створюємо RLS політики для таблиці businesses
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

-- 4. Перевіряємо та створюємо RLS політики для таблиці employees
-- Включаємо RLS для таблиці employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Політика для управління працівниками власного бізнесу
CREATE POLICY "Users can manage own business employees" ON employees
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 5. Перевіряємо та створюємо RLS політики для таблиці categories
-- Включаємо RLS для таблиці categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Політика для управління категоріями власного бізнесу
CREATE POLICY "Users can manage own business categories" ON categories
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 6. Перевіряємо та створюємо RLS політики для таблиці products
-- Включаємо RLS для таблиці products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Політика для управління товарами власного бізнесу
CREATE POLICY "Users can manage own business products" ON products
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 7. Перевіряємо та створюємо RLS політики для таблиці customers
-- Включаємо RLS для таблиці customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Політика для управління клієнтами власного бізнесу
CREATE POLICY "Users can manage own business customers" ON customers
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 8. Перевіряємо та створюємо RLS політики для таблиці orders
-- Включаємо RLS для таблиці orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Політика для управління замовленнями власного бізнесу
CREATE POLICY "Users can manage own business orders" ON orders
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- 9. Перевіряємо та створюємо RLS політики для таблиці order_items
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

-- 10. Перевіряємо функцію handle_new_user
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

-- 11. Перевіряємо тригер
-- Якщо тригер не існує, створюємо його

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 12. Перевіряємо, чи правильно налаштовані права
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

-- 13. Перевіряємо послідовності для автоінкрементних полів
-- Створюємо послідовності, якщо їх немає

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'businesses_id_seq') THEN
    CREATE SEQUENCE businesses_id_seq START 1;
    ALTER TABLE businesses ALTER COLUMN id SET DEFAULT nextval('businesses_id_seq');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'employees_id_seq') THEN
    CREATE SEQUENCE employees_id_seq START 1;
    ALTER TABLE employees ALTER COLUMN id SET DEFAULT nextval('employees_id_seq');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'categories_id_seq') THEN
    CREATE SEQUENCE categories_id_seq START 1;
    ALTER TABLE categories ALTER COLUMN id SET DEFAULT nextval('categories_id_seq');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'products_id_seq') THEN
    CREATE SEQUENCE products_id_seq START 1;
    ALTER TABLE products ALTER COLUMN id SET DEFAULT nextval('products_id_seq');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'customers_id_seq') THEN
    CREATE SEQUENCE customers_id_seq START 1;
    ALTER TABLE customers ALTER COLUMN id SET DEFAULT nextval('customers_id_seq');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'orders_id_seq') THEN
    CREATE SEQUENCE orders_id_seq START 1;
    ALTER TABLE orders ALTER COLUMN id SET DEFAULT nextval('orders_id_seq');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'order_items_id_seq') THEN
    CREATE SEQUENCE order_items_id_seq START 1;
    ALTER TABLE order_items ALTER COLUMN id SET DEFAULT nextval('order_items_id_seq');
  END IF;
END $$;
