-- Перевірка та виправлення функції та тригера
-- Виконайте цей скрипт в Supabase SQL Editor

-- 1. Перевірка поточної функції handle_new_user
SELECT 
    routine_name,
    routine_definition,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';

-- 2. Перевірка тригера on_auth_user_created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created' AND trigger_schema = 'public';

-- 3. Якщо функція не існує або неправильна, створюємо її заново
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Вставляємо запис в таблицю users з UUID з Supabase Auth
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    NEW.id,  -- Використовуємо UUID з Supabase Auth
    NEW.email,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Якщо тригер не існує, створюємо його заново
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 5. Перевірка, чи правильно створена функція
SELECT 
    routine_name,
    routine_definition,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';

-- 6. Перевірка, чи правильно створений тригер
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created' AND trigger_schema = 'public';

-- 7. Перевірка, чи таблиця users має правильну структуру
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
