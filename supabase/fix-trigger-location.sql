-- Виправлення розташування тригера on_auth_user_created
-- Виконайте цей скрипт в Supabase SQL Editor

-- 1. Видаляємо всі існуючі тригери з назвою on_auth_user_created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON public.users;

-- 2. Перевіряємо, чи правильно створена функція handle_new_user
SELECT 
    routine_name,
    routine_definition,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';

-- 3. Створюємо правильний тригер на таблиці auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. Перевіряємо, чи правильно створений тригер
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created' AND trigger_schema = 'public';

-- 5. Перевіряємо, чи тригер дійсно створений на auth.users
SELECT 
    trigger_name,
    event_object_schema,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 6. Тестуємо функцію (опціонально - для перевірки синтаксису)
-- SELECT handle_new_user();
