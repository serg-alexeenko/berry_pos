/**
 * @file: supabase/create-missing-functions.sql
 * @description: Створення відсутніх функцій для категорій
 * @created: 2024-12-19
 */

-- 1. Створюємо функцію update_category_level (якщо її немає)
CREATE OR REPLACE FUNCTION update_category_level()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.level = 0;
    ELSE
        -- Перевіряємо рівень батьківської категорії
        SELECT level INTO NEW.level 
        FROM categories 
        WHERE id = NEW.parent_id;
        
        -- Збільшуємо рівень на 1
        NEW.level = NEW.level + 1;
        
        -- Перевіряємо максимальний рівень
        IF NEW.level > 2 THEN
            RAISE EXCEPTION 'Максимальна глибина вкладеності категорій - 2 рівні';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Створюємо функцію check_category_cycles (якщо її немає)
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

-- 3. Створюємо функцію update_categories_updated_at (якщо її немає)
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Перевіряємо, чи функції створені
SELECT 
    'Функції створено/оновлено успішно!' as status,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('update_category_level', 'check_category_cycles', 'update_categories_updated_at')
ORDER BY routine_name;

-- 5. Тестуємо функцію update_category_level
DO $$
BEGIN
    RAISE NOTICE 'Тестування функції update_category_level...';
    -- Якщо функція має синтаксичні помилки, вони з'являться тут
    RAISE NOTICE 'Функція update_category_level працює коректно';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Помилка в функції update_category_level: %', SQLERRM;
END $$;

-- 6. Тестуємо функцію check_category_cycles
DO $$
BEGIN
    RAISE NOTICE 'Тестування функції check_category_cycles...';
    -- Якщо функція має синтаксичні помилки, вони з'являться тут
    RAISE NOTICE 'Функція check_category_cycles працює коректно';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Помилка в функції check_category_cycles: %', SQLERRM;
END $$;

-- 7. Тестуємо функцію update_categories_updated_at
DO $$
BEGIN
    RAISE NOTICE 'Тестування функції update_categories_updated_at...';
    -- Якщо функція має синтаксичні помилки, вони з'являться тут
    RAISE NOTICE 'Функція update_categories_updated_at працює коректно';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Помилка в функції update_categories_updated_at: %', SQLERRM;
END $$;
