# Berry POS - Налаштування Supabase

## 🚀 Швидке налаштування

### 1. Створення проекту в Supabase

1. Перейдіть на [supabase.com](https://supabase.com)
2. Створіть новий проект
3. Скопіюйте URL та anon key з налаштувань проекту

### 2. Налаштування змінних середовища

Створіть файл `.env.local` в корені проекту:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Виконання SQL скрипту

1. Відкрийте SQL Editor в Supabase Dashboard
2. Виконайте скрипт `supabase/clean-and-rebuild.sql`

Цей скрипт:
- Видалить всі існуючі таблиці та функції
- Створить нову структуру без тенантів
- Налаштує RLS політики
- Створить тригер для автоматичного створення користувачів

### 4. Перевірка налаштування

Після виконання скрипту перевірте:

```sql
-- Перевірка таблиць
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Перевірка функції
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'handle_new_user';

-- Перевірка тригера
SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
```

## 🏗️ Архітектура бази даних

### Основні таблиці

1. **users** - основна інформація про користувачів та їх бізнес
2. **categories** - категорії товарів
3. **products** - товари
4. **customers** - клієнти
5. **orders** - замовлення
6. **order_items** - позиції замовлень

### Row Level Security (RLS)

Кожен користувач має доступ тільки до своїх даних:

- `users`: користувач може переглядати та оновлювати тільки свій профіль
- `categories`, `products`, `customers`, `orders`: користувач може керувати тільки своїми даними
- `order_items`: доступ через зв'язок з замовленнями користувача

### Автоматичне створення користувачів

При реєстрації через Supabase Auth автоматично:
1. Створюється запис в таблиці `users`
2. Встановлюється роль `owner`
3. Створюється базовий бізнес-профіль

## 🔐 Аутентифікація

### Налаштування Auth в Supabase

1. Відкрийте Authentication > Settings
2. Налаштуйте Email Auth
3. Опціонально налаштуйте OAuth провайдери (Google, GitHub)

### Middleware

Middleware автоматично:
- Перенаправляє неавторизованих користувачів на `/sign-in`
- Перенаправляє авторизованих користувачів з `/sign-in` на `/dashboard`
- Захищає всі бізнес-сторінки

## 📱 Використання в коді

### Отримання поточного користувача

```typescript
import { useAuth } from '@/components/providers/AuthProvider';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Завантаження...</div>;
  if (!user) return <div>Не авторизовано</div>;
  
  return <div>Вітаємо, {user.email}!</div>;
}
```

### Запити до бази даних

```typescript
import { supabase } from '@/lib/supabase/client';

// Отримання категорій користувача
const { data: categories } = await supabase
  .from('categories')
  .select('*')
  .eq('user_id', user.id);

// Створення нового товару
const { data: product } = await supabase
  .from('products')
  .insert({
    name: 'Назва товару',
    price: 100,
    user_id: user.id
  })
  .select()
  .single();
```

## 🧪 Тестування

### Тестова реєстрація

1. Відкрийте додаток
2. Перейдіть на `/sign-up`
3. Створіть тестовий акаунт
4. Перевірте, що створився запис в таблиці `users`

### Тест RLS

1. Створіть два тестових акаунта
2. Додайте дані в кожен акаунт
3. Перевірте, що користувачі не бачать дані один одного

## 🚨 Поширені проблеми

### Помилка "RLS policy violation"

Перевірте:
- Чи правильно налаштовані RLS політики
- Чи передається `user_id` при створенні записів
- Чи правильно працює `auth.uid()`

### Помилка "function not found"

Перевірте:
- Чи створилася функція `handle_new_user`
- Чи створився тригер `on_auth_user_created`

### Проблеми з аутентифікацією

Перевірте:
- Чи правильно налаштовані змінні середовища
- Чи правильно налаштований Auth в Supabase Dashboard
- Чи правильно працює middleware

## 📚 Додаткові ресурси

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
