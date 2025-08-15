-- Тест створення продукту
-- @file: test-create-product.sql
-- @description: Тестування створення продукту з усіма необхідними полями
-- @created: 2024-12-19

-- Спочатку отримаємо business_id та category_id для тесту
SELECT 'Поточні бізнеси:' as info;
SELECT id, name FROM businesses LIMIT 5;

SELECT 'Поточні категорії:' as info;
SELECT id, name, level FROM categories LIMIT 5;

-- Тестуємо створення продукту (замініть 'your-business-id' на реальний ID)
-- INSERT INTO products (
--   business_id,
--   category_id,
--   name,
--   description,
--   price,
--   cost,
--   sku,
--   barcode,
--   stock_quantity,
--   min_stock_level,
--   unit,
--   image_url,
--   is_active
-- ) VALUES (
--   'your-business-id'::uuid,
--   NULL,
--   'Тестовий продукт',
--   'Опис тестового продукту',
--   99.99,
--   50.00,
--   'TEST-001',
--   '1234567890123',
--   100,
--   10,
--   'шт',
--   'https://example.com/image.jpg',
--   true
-- );

-- Перевіряємо створений продукт
SELECT 'Останні продукти:' as info;
SELECT 
  id,
  name,
  price,
  sku,
  business_id,
  category_id,
  created_at
FROM products 
ORDER BY created_at DESC 
LIMIT 5;
