-- Виправлення функції handle_new_user для правильної обробки метаданих
-- Виконайте цей скрипт в Supabase SQL Editor

-- 1. Оновлюємо функцію handle_new_user для правильної роботи з метаданими
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
    'user'::user_role,         -- роль за замовчуванням
    NOW(),                     -- поточний час
    NOW()                      -- поточний час
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Перевіряємо, чи правильно створена функція
SELECT 
    routine_name,
    routine_definition,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';

-- 3. Перевіряємо, чи правильно створений тригер
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created' AND trigger_schema = 'public';

-- 4. Тестуємо функцію (опціонально - для перевірки синтаксису)
-- SELECT handle_new_user();
