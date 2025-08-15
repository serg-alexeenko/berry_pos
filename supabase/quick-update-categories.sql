/**
 * @file: supabase/quick-update-categories.sql
 * @description: Спрощений SQL скрипт для оновлення таблиці categories з підтримкою підкатегорій
 * @dependencies: new-schema.sql
 * @created: 2024-12-19
 */

-- Додаємо нові колонки до існуючої таблиці categories (якщо їх немає)
DO $$ 
BEGIN
    -- Додаємо parent_id якщо колонки немає
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'parent_id') THEN
        ALTER TABLE categories ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;
    END IF;
    
    -- Додаємо level якщо колонки немає
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'level') THEN
        ALTER TABLE categories ADD COLUMN level INTEGER DEFAULT 0;
    END IF;
END $$;

-- Встановлюємо level = 0 для всіх існуючих категорій
UPDATE categories SET level = 0 WHERE parent_id IS NULL;

-- Створюємо індекси для кращої продуктивності
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);

-- Додаємо перевірку для level (якщо її немає)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'check_category_level') THEN
        ALTER TABLE categories ADD CONSTRAINT check_category_level 
        CHECK (level >= 0 AND level <= 2);
    END IF;
END $$;

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

-- Коментарі до таблиці
COMMENT ON TABLE categories IS 'Таблиця категорій з підтримкою підкатегорій';
COMMENT ON COLUMN categories.parent_id IS 'ID батьківської категорії (NULL для головних категорій)';
COMMENT ON COLUMN categories.level IS 'Рівень вкладеності (0 - головна, 1 - підкатегорія, 2 - під-підкатегорія)';

-- Перевіряємо результат
SELECT 
    'Категорії оновлено успішно!' as status,
    COUNT(*) as total_categories,
    COUNT(CASE WHEN level = 0 THEN 1 END) as main_categories,
    COUNT(CASE WHEN level = 1 THEN 1 END) as subcategories,
    COUNT(CASE WHEN level = 2 THEN 1 END) as sub_subcategories
FROM categories;
