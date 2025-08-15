# Berry POS - Налаштування Supabase

## 🚀 **Швидке налаштування бази даних**

### **Крок 1: Очищення бази даних (якщо потрібно)**

Якщо у вас вже є старі таблиці або виникають помилки, спочатку очистіть базу даних:

1. **Відкрийте** Supabase Dashboard → SQL Editor
2. **Скопіюйте** весь вміст файлу `clean-and-rebuild.sql`
3. **Вставте** в SQL Editor та натисніть "Run" (▶️)
4. **Перевірте**, що всі запити повернули 0 рядків

### **Крок 2: Створення таблиць та налаштування**

1. **В SQL Editor** скопіюйте весь вміст файлу `quick-setup.sql`
2. **Вставте** в SQL Editor та натисніть "Run" (▶️)
3. **Перевірте результати** - має бути створено:
   - 7 таблиць (tenants, users, categories, products, customers, orders, order_items)
   - 3 типи (user_role, order_status, payment_method)
   - Функція handle_new_user
   - Тригер on_auth_user_created на auth.users
   - RLS політики для всіх таблиць

### **Крок 3: Перевірка налаштування**

Після виконання `quick-setup.sql` ви маєте побачити:

#### **Таблиці:**
```
| schemaname | tablename    | tableowner |
| ---------- | ------------ | ---------- |
| public     | tenants      | postgres   |
| public     | users        | postgres   |
| public     | categories   | postgres   |
| public     | products     | postgres   |
| public     | customers    | postgres   |
| public     | orders       | postgres   |
| public     | order_items  | postgres   |
```

#### **Функція:**
```
| routine_name    | routine_schema | security_type |
| --------------- | -------------- | ------------- |
| handle_new_user | public         | DEFINER       |
```

#### **Тригер:**
```
| trigger_name         | event_manipulation | event_object_table | action_timing | action_statement                   |
| -------------------- | ------------------ | ------------------ | ------------- | ---------------------------------- |
| on_auth_user_created | INSERT             | auth.users         | AFTER         | EXECUTE FUNCTION handle_new_user() |
```

### **Крок 4: Тестування реєстрації**

1. **Відкрийте** [localhost:3000/sign-up](http://localhost:3000/sign-up)
2. **Створіть новий акаунт** з новим email
3. **Перевірте**, що реєстрація пройшла успішно
4. **Перевірте статус бази даних:**
   ```bash
   curl -X POST http://localhost:3000/api/supabase/check-status
   ```

## 🎯 **Що має працювати автоматично:**

- **Реєстрація користувача** створює автоматично:
  - Новий tenant (ресторан) в `public.tenants`
  - Профіль користувача в `public.users` з роллю "owner"
- **Кожен користувач** має свій власний tenant
- **Дані ізольовані** між різними користувачами через RLS

## 🔧 **Якщо виникають помилки:**

1. **Перевірте логи** в Supabase Dashboard → Logs → Database
2. **Перевірте RLS політики** та права доступу
3. **Перевірте, чи правильно створений тригер** на `auth.users`
4. **Перевірте, чи функція handle_new_user** має права DEFINER

## 📁 **Файли:**

- `clean-and-rebuild.sql` - очищення всіх даних
- `quick-setup.sql` - створення таблиць та налаштування
- `quick-seed.sql` - створення тестових даних (опціонально)

## 🚀 **Після налаштування:**

Система має працювати "з коробки"! Кожен новий користувач автоматично отримає:
- Власний tenant (ресторан)
- Профіль користувача з роллю "owner"
- Повний доступ до системи
- Ізольовані дані від інших користувачів
