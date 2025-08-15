/**
 * @file: supabase/test-subcategory-creation.sql
 * @description: Тестування створення підкатегорії
 * @created: 2024-12-19
 */

-- 1. Перевіряємо поточну категорію "Парфуми"
SELECT 
    'Поточна категорія:' as info,
    id,
    name,
    parent_id,
    level,
    sort_order,
    is_active
FROM categories 
WHERE name = 'Парфуми';

-- 2. Тестуємо створення підкатегорії
-- Використовуємо існуючу категорію "Парфуми" як батьківську
INSERT INTO categories (
    business_id, 
    name, 
    description, 
    parent_id, 
    level, 
    sort_order, 
    is_active
) VALUES (
    (SELECT business_id FROM categories WHERE name = 'Парфуми' LIMIT 1),
    'Чоловічі парфуми',
    'Парфуми для чоловіків',
    (SELECT id FROM categories WHERE name = 'Парфуми' LIMIT 1),
    1, -- level буде автоматично встановлено тригером
    1,
    true
);

-- 3. Перевіряємо результат
SELECT 
    'Підкатегорія створена:' as info,
    id,
    name,
    description,
    parent_id,
    level,
    sort_order,
    is_active,
    created_at
FROM categories 
WHERE name = 'Чоловічі парфуми';

-- 4. Перевіряємо ієрархію
SELECT 
    'Ієрархія категорій:' as info,
    c1.name as main_category,
    c1.level as main_level,
    c2.name as subcategory,
    c2.level as sub_level
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id
WHERE c1.name = 'Парфуми'
ORDER BY c1.sort_order, c2.sort_order;

-- 5. Перевіряємо статистику
SELECT 
    'Статистика категорій:' as info,
    COUNT(*) as total_categories,
    COUNT(CASE WHEN level = 0 THEN 1 END) as main_categories,
    COUNT(CASE WHEN level = 1 THEN 1 END) as subcategories,
    COUNT(CASE WHEN level = 2 THEN 1 END) as sub_subcategories
FROM categories;

-- 6. Тестуємо створення ще однієї підкатегорії
INSERT INTO categories (
    business_id, 
    name, 
    description, 
    parent_id, 
    level, 
    sort_order, 
    is_active
) VALUES (
    (SELECT business_id FROM categories WHERE name = 'Парфуми' LIMIT 1),
    'Жіночі парфуми',
    'Парфуми для жінок',
    (SELECT id FROM categories WHERE name = 'Парфуми' LIMIT 1),
    1,
    2,
    true
);

-- 7. Фінальна перевірка
SELECT 
    'Фінальна ієрархія:' as info,
    c1.name as main_category,
    c1.level as main_level,
    c2.name as subcategory,
    c2.level as sub_level
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id
WHERE c1.name = 'Парфуми'
ORDER BY c1.sort_order, c2.sort_order;
