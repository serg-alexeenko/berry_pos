-- Виправлення таблиці users та функції handle_new_user
-- Виконайте цей скрипт в Supabase SQL Editor

-- 1. Перевірка поточної структури таблиці users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Оновлення функції handle_new_user для роботи з усіма полями
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Вставляємо запис в таблицю users з UUID з Supabase Auth
  -- Заповнюємо всі обов'язкові поля
  INSERT INTO public.users (
    id,           -- UUID з Supabase Auth
    email,        -- email з Supabase Auth
    first_name,   -- обов'язкове поле, встановлюємо значення за замовчуванням
    last_name,    -- обов'язкове поле, встановлюємо значення за замовчуванням
    role,         -- має значення за замовчуванням 'user'
    created_at,   -- має значення за замовчуванням now()
    updated_at    -- має значення за замовчуванням now()
  )
  VALUES (
    NEW.id,                    -- UUID з Supabase Auth
    NEW.email,                 -- email з Supabase Auth
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),  -- first_name з метаданих або 'User'
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),   -- last_name з метаданих або 'User'
    'user'::user_role,         -- роль за замовчуванням
    NOW(),                     -- поточний час
    NOW()                      -- поточний час
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Перевірка, чи правильно створена функція
SELECT 
    routine_name,
    routine_definition,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';

-- 4. Перевірка, чи правильно створений тригер
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created' AND trigger_schema = 'public';

-- 5. Якщо тригер не існує, створюємо його
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND trigger_schema = 'public'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;
