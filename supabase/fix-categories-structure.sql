/**
 * @file: supabase/fix-categories-structure.sql
 * @description: Скрипт для швидкого виправлення структури таблиці categories
 * @created: 2024-12-19
 */

-- Крок 1: Додаємо поля parent_id та level (якщо їх немає)
DO $$ 
BEGIN
    -- Додаємо parent_id якщо колонки немає
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'parent_id') THEN
        ALTER TABLE categories ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;
        RAISE NOTICE 'Додано поле parent_id';
    ELSE
        RAISE NOTICE 'Поле parent_id вже існує';
    END IF;
    
    -- Додаємо level якщо колонки немає
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'level') THEN
        ALTER TABLE categories ADD COLUMN level INTEGER DEFAULT 0;
        RAISE NOTICE 'Додано поле level';
    ELSE
        RAISE NOTICE 'Поле level вже існує';
    END IF;
END $$;

-- Крок 2: Встановлюємо level = 0 для всіх існуючих категорій
UPDATE categories SET level = 0 WHERE parent_id IS NULL;

-- Крок 3: Створюємо індекси (якщо їх немає)
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);

-- Крок 4: Додаємо обмеження для level (якщо його немає)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'check_category_level') THEN
        ALTER TABLE categories ADD CONSTRAINT check_category_level 
        CHECK (level >= 0 AND level <= 2);
        RAISE NOTICE 'Додано обмеження check_category_level';
    ELSE
        RAISE NOTICE 'Обмеження check_category_level вже існує';
    END IF;
END $$;

-- Крок 5: Створюємо функцію для автоматичного оновлення level
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

-- Крок 6: Створюємо тригер (якщо його немає)
DROP TRIGGER IF EXISTS trigger_update_category_level ON categories;
CREATE TRIGGER trigger_update_category_level
    BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_category_level();

-- Крок 7: Перевіряємо результат
SELECT 
    'Структура таблиці categories оновлено!' as status,
    COUNT(*) as total_categories,
    COUNT(CASE WHEN level = 0 THEN 1 END) as main_categories,
    COUNT(CASE WHEN level = 1 THEN 1 END) as subcategories,
    COUNT(CASE WHEN level = 2 THEN 1 END) as sub_subcategories
FROM categories;

-- ПРИМІТКА: Для тестування створення категорії використовуйте файл test-insert-category.sql
