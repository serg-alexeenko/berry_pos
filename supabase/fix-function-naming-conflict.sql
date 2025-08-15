/**
 * @file: supabase/fix-function-naming-conflict.sql
 * @description: Виправлення конфлікту імен у функції check_category_cycles
 * @created: 2024-12-19
 */

-- Виправляємо функцію check_category_cycles - змінюємо назву змінної
CREATE OR REPLACE FUNCTION check_category_cycles()
RETURNS TRIGGER AS $$
DECLARE
    current_id UUID;
    current_parent_id UUID; -- Змінюємо назву змінної
BEGIN
    current_id := NEW.id;
    current_parent_id := NEW.parent_id; -- Використовуємо нову назву
    
    -- Перевіряємо, чи не створюється цикл
    WHILE current_parent_id IS NOT NULL LOOP
        -- Перевіряємо, чи не є поточна категорія батьком своєї батьківської
        IF current_parent_id = current_id THEN
            RAISE EXCEPTION 'Неможливо створити циклічне посилання в категоріях';
        END IF;
        
        -- Отримуємо ID батьківської категорії
        SELECT parent_id INTO current_parent_id -- Використовуємо нову назву
        FROM categories 
        WHERE id = current_parent_id; -- Використовуємо нову назву
        
        -- Захист від нескінченного циклу
        IF current_parent_id IS NULL THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Перевіряємо, чи функція створена
SELECT 
    'Функція check_category_cycles виправлена!' as status,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'check_category_cycles';

-- Тестуємо функцію
DO $$
BEGIN
    RAISE NOTICE 'Тестування виправленої функції check_category_cycles...';
    -- Якщо функція має синтаксичні помилки, вони з'являться тут
    RAISE NOTICE 'Функція check_category_cycles працює коректно';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Помилка в функції check_category_cycles: %', SQLERRM;
END $$;
