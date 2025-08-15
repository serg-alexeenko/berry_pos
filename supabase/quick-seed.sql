-- Berry POS Quick Seed Data
-- Виконайте цей SQL в Supabase SQL Editor після створення таблиць

-- 1. Створюємо тестовий tenant
INSERT INTO tenants (name, slug, description, contact_email, primary_color, secondary_color)
VALUES (
  'Тестовий Ресторан',
  'test-restaurant',
  'Тестовий ресторан для демонстрації',
  'test@restaurant.com',
  '#3B82F6',
  '#8B5CF6'
) ON CONFLICT (slug) DO NOTHING;

-- 2. Отримуємо ID створеного tenant
DO $$
DECLARE
  tenant_id UUID;
BEGIN
  SELECT id INTO tenant_id FROM tenants WHERE slug = 'test-restaurant';
  
  -- 3. Створюємо тестові категорії
  INSERT INTO categories (tenant_id, name, description, color, sort_order, is_active)
  VALUES 
    (tenant_id, 'Гарячі страви', 'Основні страви', '#EF4444', 1, true),
    (tenant_id, 'Салати', 'Свіжі салати', '#10B981', 2, true),
    (tenant_id, 'Напої', 'Гарячі та холодні напої', '#3B82F6', 3, true),
    (tenant_id, 'Десерти', 'Солодощі', '#8B5CF6', 4, true)
  ON CONFLICT DO NOTHING;
  
  -- 4. Створюємо тестові продукти
  INSERT INTO products (tenant_id, category_id, name, description, price, cost, is_available, stock_quantity)
  SELECT 
    tenant_id,
    c.id,
    CASE 
      WHEN c.name = 'Гарячі страви' THEN 'Борщ український'
      WHEN c.name = 'Салати' THEN 'Цезар з куркою'
      WHEN c.name = 'Напої' THEN 'Кава американо'
      WHEN c.name = 'Десерти' THEN 'Тірамісу'
    END,
    CASE 
      WHEN c.name = 'Гарячі страви' THEN 'Традиційний український борщ'
      WHEN c.name = 'Салати' THEN 'Класичний салат Цезар'
      WHEN c.name = 'Напої' THEN 'Класична кава'
      WHEN c.name = 'Десерти' THEN 'Італійський десерт'
    END,
    CASE 
      WHEN c.name = 'Гарячі страви' THEN 120.00
      WHEN c.name = 'Салати' THEN 85.00
      WHEN c.name = 'Напої' THEN 35.00
      WHEN c.name = 'Десерти' THEN 95.00
    END,
    CASE 
      WHEN c.name = 'Гарячі страви' THEN 60.00
      WHEN c.name = 'Салати' THEN 40.00
      WHEN c.name = 'Напої' THEN 15.00
      WHEN c.name = 'Десерти' THEN 45.00
    END,
    true,
    CASE 
      WHEN c.name = 'Гарячі страви' THEN 50
      WHEN c.name = 'Салати' THEN 30
      WHEN c.name = 'Напої' THEN 100
      WHEN c.name = 'Десерти' THEN 20
    END
  FROM categories c
  WHERE c.tenant_id = tenant_id
  ON CONFLICT DO NOTHING;
  
  -- 5. Створюємо тестових клієнтів
  INSERT INTO customers (tenant_id, email, phone, first_name, last_name, loyalty_points, total_spent, visits_count)
  VALUES 
    (tenant_id, 'ivan@example.com', '+380501234567', 'Іван', 'Петренко', 150, 1250.00, 8),
    (tenant_id, 'maria@example.com', '+380672345678', 'Марія', 'Іваненко', 320, 2800.00, 15),
    (tenant_id, 'oleg@example.com', '+380633456789', 'Олег', 'Сидоренко', 75, 650.00, 4)
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Тестові дані створено для tenant: %', tenant_id;
END $$;

-- 6. Перевіряємо створені дані
SELECT 'tenants' as table_name, COUNT(*) as count FROM tenants
UNION ALL
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'customers' as table_name, COUNT(*) as count FROM customers;
