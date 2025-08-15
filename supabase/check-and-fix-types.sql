-- Перевірка та виправлення типів даних
-- Виконайте цей скрипт в Supabase SQL Editor

-- 1. Перевіряємо, які типи дійсно створені
SELECT 
    typname,
    typtype,
    typcategory
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY typname;

-- 2. Перевіряємо, чи існує тип user_role
SELECT 
    typname,
    typtype,
    typcategory
FROM pg_type 
WHERE typname = 'user_role';

-- 3. Якщо тип user_role не існує, створюємо його
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_role'
  ) THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'manager');
  END IF;
END $$;

-- 4. Перевіряємо структуру таблиці users
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Оновлюємо функцію handle_new_user без використання user_role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Вставляємо запис в таблицю users з UUID з Supabase Auth
  -- Заповнюємо всі обов'язкові поля з метаданих або значеннями за замовчуванням
  INSERT INTO public.users (
    id,           -- UUID з Supabase Auth
    email,        -- email з Supabase Auth
    first_name,   -- обов'язкове поле з метаданих або значення за замовчуванням
    last_name,    -- обов'язкове поле з метаданих або значення за замовчуванням
    role,         -- має значення за замовчуванням 'user'
    created_at,   -- має значення за замовчуванням now()
    updated_at    -- має значення за замовчуванням now()
  )
  VALUES (
    NEW.id,                    -- UUID з Supabase Auth
    NEW.email,                 -- email з Supabase Auth
    COALESCE(
      NEW.raw_user_meta_data->>'first_name', 
      'Новий'
    ),                         -- first_name з метаданих або 'Новий'
    COALESCE(
      NEW.raw_user_meta_data->>'last_name', 
      'Користувач'
    ),                         -- last_name з метаданих або 'Новий Користувач'
    'user',                    -- роль за замовчуванням (без приведення типу)
    NOW(),                     -- поточний час
    NOW()                      -- поточний час
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Перевіряємо, чи правильно створена функція
SELECT 
    routine_name,
    routine_definition,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';
