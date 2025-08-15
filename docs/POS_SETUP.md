# Налаштування POS системи - Berry POS

## Огляд

Цей документ описує кроки по налаштуванню POS системи Berry POS, включаючи створення необхідних таблиць в базі даних та налаштування компонентів.

## Передумови

Перед налаштуванням POS системи переконайтеся, що у вас є:

✅ **Завершений MVP** - система аутентифікації, управління бізнесами, категоріями та продуктами  
✅ **Доступ до Supabase** - активний проєкт з базою даних  
✅ **Запущений проєкт** - локальна розробка або розгортання  

## Крок 1: Створення таблиць в базі даних

### Варіант A: Використання поетапного SQL скрипта (РЕКОМЕНДУЄТЬСЯ)

1. **Відкрийте Supabase Dashboard**
   - Перейдіть на [supabase.com](https://supabase.com)
   - Виберіть ваш проєкт

2. **Відкрийте SQL Editor**
   - В лівому меню натисніть "SQL Editor"
   - Натисніть "New query"

3. **Скопіюйте та виконайте поетапний скрипт**
   ```sql
   -- Вставте вміст файлу supabase/create-pos-tables-step-by-step.sql
   ```

4. **Перевірте результат**
   - Після кожного кроку ви повинні бачити повідомлення про успішне створення
   - В кінці скрипта буде фінальна перевірка з кількістю створених таблиць

### Варіант B: Використання оригінального SQL скрипта

Якщо поетапний скрипт не спрацював, спробуйте оригінальний:

```sql
-- Вставте вміст файлу supabase/create-pos-tables.sql
```

### Варіант C: Перестворення таблиць (якщо є проблеми зі структурою)

Якщо виникають помилки типу "column does not exist" або "Could not find column", це означає, що таблиці створені з неправильною структурою. Використайте скрипт перестворення:

```sql
-- Вставте вміст файлу supabase/recreate-pos-tables.sql
```

**УВАГА**: Цей скрипт видалить існуючі таблиці та створить їх заново з правильною структурою!

### Варіант B: Ручне створення таблиць

Якщо автоматичний скрипт не спрацював, створіть таблиці вручну:

#### 1. Таблиця customers
```sql
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Таблиця orders
```sql
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'processing', 'ready', 'completed', 'cancelled')),
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Таблиця order_items
```sql
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Крок 2: Налаштування Row Level Security (RLS)

### 1. Включення RLS
```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
```

### 2. Створення політик безпеки

#### Для customers:
```sql
CREATE POLICY "Users can view customers from their business" ON customers
    FOR SELECT USING (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can insert customers to their business" ON customers
    FOR INSERT WITH CHECK (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can update customers from their business" ON customers
    FOR UPDATE USING (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can delete customers from their business" ON customers
    FOR DELETE USING (business_id::text = auth.jwt() ->> 'business_id');
```

#### Для orders:
```sql
CREATE POLICY "Users can view orders from their business" ON orders
    FOR SELECT USING (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can insert orders to their business" ON orders
    FOR INSERT WITH CHECK (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can insert orders to their business" ON orders
    FOR UPDATE USING (business_id::text = auth.jwt() ->> 'business_id');

CREATE POLICY "Users can delete orders from their business" ON orders
    FOR DELETE USING (business_id::text = auth.jwt() ->> 'business_id');
```

#### Для order_items:
```sql
CREATE POLICY "Users can view order items from their business" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.business_id::text = auth.jwt() ->> 'business_id'
        )
    );

CREATE POLICY "Users can insert order items to their business" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.business_id::text = auth.jwt() ->> 'business_id'
        )
    );
```

## Крок 3: Створення індексів

Для швидкого пошуку створіть індекси:

```sql
-- Індекси для customers
CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);

-- Індекси для orders
CREATE INDEX idx_orders_business_id ON orders(business_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Індекси для order_items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

## Крок 4: Додавання тестових даних

### 1. Тестові клієнти
```sql
INSERT INTO customers (id, business_id, name, phone, email, address, loyalty_points)
SELECT 
    gen_random_uuid(),
    b.id,
    'Тестовий клієнт ' || i,
    '+38099' || LPAD(i::TEXT, 6, '0'),
    'client' || i || '@example.com',
    'Адреса клієнта ' || i,
    (i * 10)
FROM businesses b
CROSS JOIN generate_series(1, 3) i
ON CONFLICT DO NOTHING;
```

### 2. Перевірка створення
```sql
-- Перевірка клієнтів
SELECT COUNT(*) as customers_count FROM customers;

-- Перевірка структури таблиць
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('customers', 'orders', 'order_items')
ORDER BY table_name, ordinal_position;
```

## Крок 5: Перевірка налаштування

### 1. Перевірте створення таблиць
В Supabase Dashboard перейдіть до "Table Editor" та переконайтеся, що створені таблиці:
- `customers`
- `orders` 
- `order_items`

### 2. Перевірте RLS політики
В "Authentication" → "Policies" переконайтеся, що створені політики для всіх таблиць.

### 3. Діагностика проблем
Якщо виникають помилки, використайте скрипт діагностики:

```sql
-- Вставте вміст файлу supabase/check-table-structure.sql
```

Цей скрипт покаже структуру всіх таблиць та допоможе знайти проблеми.

### 4. Тестування в додатку
1. **Відкрийте POS інтерфейс** (`/pos`)
2. **Перевірте завантаження даних** - не повинно бути помилок
3. **Спробуйте створити замовлення** - воно повинно зберегтися в базі

## Крок 6: Налаштування додаткових функцій

### 1. Автоматична генерація номерів замовлень
```sql
-- Функція для генерації номера замовлення
CREATE OR REPLACE FUNCTION generate_order_number(business_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    next_number INTEGER;
    order_number VARCHAR;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM orders
    WHERE business_id = $1;
    
    order_number := 'ORD-' || LPAD(next_number::TEXT, 6, '0');
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;
```

### 2. Автоматичне оновлення сум замовлень
```sql
-- Функція для оновлення загальної суми замовлення
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE orders 
        SET total_amount = (
            SELECT COALESCE(SUM(total_price), 0.00)
            FROM order_items 
            WHERE order_id = OLD.order_id
        ),
        final_amount = total_amount - COALESCE(discount_amount, 0.00)
        WHERE id = OLD.order_id;
        RETURN OLD;
    ELSE
        UPDATE orders 
        SET total_amount = (
            SELECT COALESCE(SUM(total_price), 0.00)
            FROM order_items 
            WHERE order_id = NEW.order_id
        ),
        final_amount = total_amount - COALESCE(discount_amount, 0.00)
        WHERE id = NEW.order_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Тригери для автоматичного оновлення
CREATE TRIGGER update_order_total_after_insert
    AFTER INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE TRIGGER update_order_total_after_update
    AFTER UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE TRIGGER update_order_total_after_delete
    AFTER DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_order_total();
```

## Крок 7: Перевірка роботи

### 1. Тестування POS інтерфейсу
- [ ] Завантаження товарів
- [ ] Завантаження категорій
- [ ] Завантаження клієнтів
- [ ] Додавання товарів в корзину
- [ ] Створення замовлення

### 2. Тестування управління замовленнями
- [ ] Перегляд замовлень
- [ ] Фільтрація та пошук
- [ ] Оновлення статусів
- [ ] Детальний перегляд

### 3. Тестування управління клієнтами
- [ ] Перегляд клієнтів
- [ ] Створення нового клієнта
- [ ] Редагування клієнта
- [ ] Видалення клієнта

## Вирішення проблем

### Проблема: "Таблиця не існує"
**Рішення**: Виконайте SQL скрипт створення таблиць

### Проблема: "Доступ заборонено"
**Рішення**: Перевірте RLS політики та налаштування auth

### Проблема: "Помилка валідації"
**Рішення**: Перевірте структуру таблиць та обмеження

### Проблема: "Повільна робота"
**Рішення**: Створіть індекси для таблиць

### Проблема: "operator does not exist: uuid = text"
**Рішення**: Це помилка в RLS політиках. Використовуйте поетапний скрипт `create-pos-tables-step-by-step.sql`

### Проблема: "column does not exist"
**Рішення**: Таблиця ще не створена. Виконайте спочатку команди створення таблиць, а потім вже команди з даними

### Проблема: "function does not exist"
**Рішення**: Деякі функції можуть не існувати в старіших версіях PostgreSQL. Використовуйте базовий скрипт без додаткових функцій

## Наступні кроки

Після успішного налаштування POS системи:

1. **Тестування** - перевірте всі функції
2. **Налаштування** - налаштуйте параметри під ваші потреби
3. **Тренування** - навчіть персонал роботі з системою
4. **Розгортання** - підготуйте систему до production

## Підтримка

Якщо виникли проблеми:

1. **Перевірте логи** в браузері (F12 → Console)
2. **Перевірте Supabase logs** в Dashboard
3. **Створіть Issue** на GitHub з детальним описом проблеми
4. **Зверніться до команди розробки** через Discord або email

---

**Останнє оновлення**: 2025-08-15  
**Версія документа**: 1.0.0  
**Автор**: Berry POS Development Team
