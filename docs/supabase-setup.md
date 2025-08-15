# Supabase Setup Guide

## 📋 Огляд

Цей документ описує налаштування Supabase для проєкту Berry POS. Supabase використовується як основна база даних та система аутентифікації.

**Версія**: 2.0.0  
**Останнє оновлення**: 2024-08-14  
**Статус**: Активний

---

## 🚀 Швидкий старт

### **1. Створення проєкту Supabase**

1. Перейдіть на [supabase.com](https://supabase.com)
2. Увійдіть або створіть обліковий запис
3. Натисніть "New Project"
4. Заповніть форму:
   - **Name**: `berry-pos` або ваша назва
   - **Database Password**: Створіть надійний пароль
   - **Region**: Виберіть найближчий регіон
   - **Pricing Plan**: Free tier для початку

### **2. Отримання ключів**

Після створення проєкту:

1. Перейдіть в **Settings** → **API**
2. Скопіюйте:
   - **Project URL** (потрібен для `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** (потрібен для `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** (потрібен для `SUPABASE_SERVICE_ROLE_KEY`)

### **3. Налаштування змінних середовища**

Створіть файл `.env.local` в корені проєкту:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## 🗄️ Налаштування бази даних

### **Автоматичне створення (Рекомендовано)**

Запустіть API endpoint для автоматичного створення всіх таблиць:

```bash
# Створення схеми бази даних
curl -X POST http://localhost:3000/api/supabase/rebuild-database

# Створення тестових даних
curl -X POST http://localhost:3000/api/supabase/seed-data
```

### **Ручне створення (Для розробників)**

Якщо потрібно створити таблиці вручну:

1. Перейдіть в **SQL Editor** в Supabase Dashboard
2. Виконайте SQL скрипти з папки `supabase/`

---

## 🔐 Налаштування аутентифікації

### **1. Email Auth**

1. Перейдіть в **Authentication** → **Providers**
2. Увімкніть **Email** провайдер
3. Налаштуйте:
   - **Enable email confirmations**: Вимкнено для розробки
   - **Secure email change**: Увімкнено
   - **Double confirm changes**: Увімкнено

### **2. Row Level Security (RLS)**

RLS автоматично налаштовується через API endpoints. Основні політики:

```sql
-- Приклад політики для таблиці products
CREATE POLICY "Users can view products from their tenant" ON products
FOR SELECT USING (tenant_id IN (
  SELECT tenant_id FROM users WHERE id = auth.uid()
));
```

---

## 📊 Структура бази даних

### **Основні таблиці**

#### **tenants** - Ресторани/заклади
```sql
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  website VARCHAR(255),
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#8B5CF6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **users** - Користувачі системи
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role user_role DEFAULT 'employee',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **categories** - Категорії продуктів
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **products** - Продукти меню
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  category_id UUID REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **customers** - Клієнти
```sql
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR(255),
  phone VARCHAR(50),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  loyalty_points INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  visits_count INTEGER DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **orders** - Замовлення
```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  customer_id UUID REFERENCES customers(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Типи даних**

```sql
-- Ролі користувачів
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'employee');

-- Статуси замовлень
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
);

-- Способи оплати
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'online');
```

---

## 🔧 API Endpoints

### **1. Перебудова бази даних**

```bash
POST /api/supabase/rebuild-database
```

**Функція**: Створює всю схему бази даних з нуля

**Відповідь**:
```json
{
  "success": true,
  "message": "База даних успішно перебудована",
  "summary": {
    "tables_created": 7,
    "types_created": 3,
    "indexes_created": 8
  }
}
```

### **2. Створення тестових даних**

```bash
POST /api/supabase/seed-data
```

**Функція**: Створює тестові дані для розробки

**Відповідь**:
```json
{
  "success": true,
  "message": "Тестові дані успішно створено",
  "summary": {
    "tenant": {...},
    "categories": 4,
    "products": 7,
    "customers": 3,
    "orders": 3
  }
}
```

### **3. Перевірка стану**

```bash
POST /api/supabase/check-status
```

**Функція**: Перевіряє поточний стан бази даних

**Відповідь**:
```json
{
  "success": true,
  "data": {
    "tenants": 1,
    "users": 1,
    "categories": 4,
    "products": 7,
    "customers": 3,
    "orders": 3
  }
}
```

---

## 🚨 Безпека

### **Row Level Security (RLS)**

Всі таблиці мають увімкнене RLS для захисту даних:

```sql
-- Приклад для таблиці products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view products from their tenant" ON products
FOR SELECT USING (tenant_id IN (
  SELECT tenant_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can insert products to their tenant" ON products
FOR INSERT WITH CHECK (tenant_id IN (
  SELECT tenant_id FROM users WHERE id = auth.uid()
));
```

### **Service Role Key**

- **Використання**: Тільки для адміністративних операцій
- **Безпека**: Ніколи не використовуйте в клієнтському коді
- **Доступ**: Тільки через API endpoints на сервері

---

## 🧪 Тестування

### **1. Перевірка підключення**

```bash
# Перевірка доступності API
curl -X POST http://localhost:3000/api/supabase/check-status
```

### **2. Тестування аутентифікації**

1. Відкрийте `/sign-up`
2. Створіть новий акаунт
3. Перевірте створення в Supabase Dashboard

### **3. Тестування даних**

1. Створіть тестові дані через API
2. Перевірте відображення на сторінках
3. Тестуйте фільтрацію та пошук

---

## 🐛 Розв'язання проблем

### **Проблема: "Database not found"**

**Рішення**:
```bash
# Перевірте змінні середовища
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Запустіть перебудову бази
curl -X POST http://localhost:3000/api/supabase/rebuild-database
```

### **Проблема: "RLS policy violation"**

**Рішення**:
1. Перевірте, чи користувач авторизований
2. Перевірте, чи створений профіль користувача
3. Запустіть створення тестових даних

### **Проблема: "Service role key invalid"**

**Рішення**:
1. Перевірте правильність ключа в `.env.local`
2. Перезапустіть сервер розробки
3. Перевірте права доступу в Supabase Dashboard

---

## 📚 Додаткові ресурси

### **Документація**
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### **Приклади коду**
- [Supabase Examples](https://github.com/supabase/supabase/tree/master/examples)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

### **Підтримка**
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**Останнє оновлення**: 2024-08-14  
**Версія документації**: 2.0.0  
**Статус**: Активний
