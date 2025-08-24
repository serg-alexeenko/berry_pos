# Berry POS 🍓

**Сучасна система управління рестораном та закладами харчування**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-0.0.0-000000?style=for-the-badge&logo=shadcnui)](https://ui.shadcn.com/)

## ✨ Особливості

### 🎨 **Новий дизайн з shadcn/ui**
- **Сучасний UI/UX** на базі офіційних компонентів
- **Система темізації** - світла/темна/системна теми
- **Анімації та ефекти** - fade-in, slide-in, hover ефекти
- **Glass ефекти** - backdrop-blur та прозорість
- **Адаптивний дизайн** для всіх пристроїв

### 🛒 **POS Система**
- Швидке оформлення замовлень
- Пошук товарів по назві/категорії/SKU
- Корзина замовлення з підрахунком
- Різні способи оплати
- Управління запасами

### 📊 **Аналітика та звіти**
- Детальні звіти по продажах
- Аналіз популярності товарів
- KPI метрики бізнесу
- Статистика відвідувачів

### 👥 **CRM система**
- Управління клієнтами
- Програма лояльності
- Маркетингові кампанії
- Персональні пропозиції

## 🚀 Швидкий старт

### Вимоги
- Node.js 18+
- npm або yarn
- Supabase акаунт

### Встановлення

1. **Клонуйте репозиторій**
```bash
git clone https://github.com/serg-alexeenko/berry_pos.git
cd berry_pos
```

2. **Встановіть залежності**
```bash
npm install
```

3. **Налаштуйте змінні середовища**
```bash
cp env.example .env.local
```

4. **Заповніть `.env.local` вашими даними Supabase**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. **Запустіть проєкт**
```bash
npm run dev
```

6. **Відкрийте браузер**
```
http://localhost:3000
```

## 🎨 Дизайн система

### shadcn/ui компоненти
Berry POS використовує [shadcn/ui](https://ui.shadcn.com/) - сучасну бібліотеку компонентів:

- **Card** - картки для контенту
- **Button** - кнопки з різними варіантами
- **Badge** - бейджі для статусів
- **Progress** - прогрес-бари
- **Sheet** - мобільний sidebar
- **ThemeToggle** - перемикач тем

### Темізація
- **Світла тема** - класичний дизайн
- **Темна тема** - сучасний темний режим
- **Системна тема** - автоматичне перемикання

### Анімації
- **fade-in** - плавна поява
- **slide-in** - ковзання з різних сторін
- **hover ефекти** - інтерактивність
- **переходи** - плавні зміни

## 🏗️ Архітектура

### Frontend
- **Next.js 14** з App Router
- **TypeScript** для типізації
- **Tailwind CSS** для стилізації
- **shadcn/ui** для компонентів
- **next-themes** для темізації

### Backend
- **Next.js API Routes**
- **Supabase** для бази даних
- **PostgreSQL** як основна БД
- **Row Level Security (RLS)**

### База даних
- **users** - користувачі та бізнес
- **categories** - категорії товарів
- **products** - товари
- **customers** - клієнти
- **orders** - замовлення
- **order_items** - позиції замовлень

## 📱 Сторінки

- **`/`** - Головна сторінка з новим дизайном
- **`/dashboard`** - Панель управління
- **`/pos`** - POS інтерфейс
- **`/menu`** - Управління меню
- **`/orders`** - Замовлення
- **`/customers`** - Клієнти
- **`/analytics`** - Аналітика
- **`/settings`** - Налаштування

## 🛠️ Розробка

### Команди
```bash
npm run dev          # Запуск в режимі розробки
npm run build        # Збірка для продакшену
npm run start        # Запуск продакшен версії
npm run lint         # Лінтінг коду
```

### Структура проєкту
```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard сторінка
│   ├── pos/              # POS інтерфейс
│   ├── menu/             # Управління меню
│   └── ...
├── components/            # React компоненти
│   ├── ui/               # shadcn/ui компоненти
│   ├── layout/           # Layout компоненти
│   └── providers/        # Context провайдери
├── lib/                  # Утиліти та конфігурація
└── types/                # TypeScript типи
```

## 🎯 Roadmap

### Версія 2.2.0 (Планується)
- [ ] Система оплати (готівка, карта, онлайн)
- [ ] Чеки та квитанції
- [ ] Знижки та акції
- [ ] Відстеження запасів

### Версія 2.3.0 (Планується)
- [ ] Детальна аналітика
- [ ] Прогнозування попиту
- [ ] KPI метрики
- [ ] Експорт звітів

### Версія 3.0.0 (Планується)
- [ ] React Native мобільний додаток
- [ ] Офлайн режим
- [ ] Push повідомлення
- [ ] Multi-tenant архітектура

## 🤝 Внесок

1. Fork проєкт
2. Створіть feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit зміни (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Відкрийте Pull Request

## 📄 Ліцензія

Цей проєкт розповсюджується під ліцензією MIT. Дивіться `LICENSE` для деталей.

## 🙏 Подяки

- [shadcn/ui](https://ui.shadcn.com/) - за чудові компоненти
- [Next.js](https://nextjs.org/) - за потужний фреймворк
- [Supabase](https://supabase.com/) - за backend інфраструктуру
- [Tailwind CSS](https://tailwindcss.com/) - за CSS фреймворк

## 📞 Контакти

- **GitHub**: [@serg-alexeenko](https://github.com/serg-alexeenko)
- **Проєкт**: [Berry POS](https://github.com/serg-alexeenko/berry_pos)

---

**Berry POS** - сучасна система управління рестораном з красивим дизайном! 🍓✨
