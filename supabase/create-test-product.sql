-- Створення тестового продукту
-- @file: create-test-product.sql
-- @description: SQL скрипт для створення тестового продукту
-- @created: 2024-12-19

-- Використовуємо реальний business_id з вашої системи
-- business_id: 89ca305e-8a55-4f1a-a44c-2eb08f140ef8 (з категорії "Парфуми")

-- Створюємо тестовий продукт
INSERT INTO products (
    business_id,
    name,
    description,
    price,
    cost,
    sku,
    barcode,
    stock_quantity,
    min_stock_level,
    unit,
    category_id
) VALUES (
    '89ca305e-8a55-4f1a-a44c-2eb08f140ef8', -- ID бізнесу
    'Тестовий парфум',
    'Опис тестового парфуму для перевірки функціональності системи',
    299.99,
    150.00,
    'PERF-001',
    '1234567890124',
    50,
    5,
    'шт',
    '89ca305e-8a55-4f1a-a44c-2eb08f140ef8' -- ID категорії "Парфуми"
);

-- Перевіряємо створений продукт
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.cost,
    p.sku,
    p.barcode,
    p.stock_quantity,
    p.min_stock_level,
    p.unit,
    p.is_active,
    c.name as category_name,
    c.level as category_level
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.name = 'Тестовий парфум';

-- Перевіряємо всі продукти в системі
SELECT 
    p.id,
    p.name,
    p.price,
    p.stock_quantity,
    p.sku,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC;
