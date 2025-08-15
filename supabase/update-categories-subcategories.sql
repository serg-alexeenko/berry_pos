/**
 * @file: supabase/update-categories-subcategories.sql
 * @description: SQL скрипт для оновлення таблиці categories з підтримкою підкатегорій
 * @dependencies: new-schema.sql
 * @created: 2024-12-19
 */

-- Додаємо нові колонки до існуючої таблиці categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;

-- Оновлюємо існуючі категорії, встановлюючи level = 0 (головні категорії)
UPDATE categories 
SET level = 0 
WHERE parent_id IS NULL;

-- Створюємо індекси для кращої продуктивності
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);

-- Додаємо перевірку для level
ALTER TABLE categories 
ADD CONSTRAINT check_category_level 
CHECK (level >= 0 AND level <= 2);

-- Оновлюємо тригер для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_categories_updated_at ON categories;

CREATE TRIGGER trigger_update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_categories_updated_at();

-- Функція для автоматичного оновлення level при зміні parent_id
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

DROP TRIGGER IF EXISTS trigger_update_category_level ON categories;

CREATE TRIGGER trigger_update_category_level
    BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_category_level();

-- Функція для перевірки циклічних посилань
CREATE OR REPLACE FUNCTION check_category_cycles()
RETURNS TRIGGER AS $$
DECLARE
    parent_level INTEGER;
    current_id UUID;
    parent_id UUID;
BEGIN
    current_id := NEW.id;
    parent_id := NEW.parent_id;
    
    -- Перевіряємо, чи не створюється цикл
    WHILE parent_id IS NOT NULL LOOP
        -- Перевіряємо, чи не є поточна категорія батьком своєї батьківської
        IF parent_id = current_id THEN
            RAISE EXCEPTION 'Неможливо створити циклічне посилання в категоріях';
        END IF;
        
        -- Отримуємо ID батьківської категорії
        SELECT parent_id INTO parent_id 
        FROM categories 
        WHERE id = parent_id;
        
        -- Захист від нескінченного циклу
        IF parent_id IS NULL THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_category_cycles ON categories;

CREATE TRIGGER trigger_check_category_cycles
    BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION check_category_cycles();

-- Коментарі до таблиці
COMMENT ON TABLE categories IS 'Таблиця категорій з підтримкою підкатегорій';
COMMENT ON COLUMN categories.parent_id IS 'ID батьківської категорії (NULL для головних категорій)';
COMMENT ON COLUMN categories.level IS 'Рівень вкладеності (0 - головна, 1 - підкатегорія, 2 - під-підкатегорія)';

-- Приклади використання:
-- 1. Створення головної категорії:
-- INSERT INTO categories (business_id, name, description, sort_order, level) 
-- VALUES ('business-uuid', 'Напої', 'Гарячі та холодні напої', 1, 0);

-- 2. Створення підкатегорії:
-- INSERT INTO categories (business_id, parent_id, name, description, sort_order, level) 
-- VALUES ('business-uuid', 'parent-category-uuid', 'Гарячі напої', 'Кава, чай, какао', 1, 1);

-- 3. Отримання всіх категорій з їх підкатегоріями:
-- SELECT 
--     c1.name as main_category,
--     c2.name as subcategory,
--     c3.name as sub_subcategory
-- FROM categories c1
-- LEFT JOIN categories c2 ON c2.parent_id = c1.id
-- LEFT JOIN categories c3 ON c3.parent_id = c2.id
-- WHERE c1.level = 0
-- ORDER BY c1.sort_order, c2.sort_order, c3.sort_order;
