# Berry POS

**Система управління бізнес-процесами для ресторанів, кафе, барів та торговельних точок**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

## 📋 Огляд

Berry POS - це комплексний веб-сервіс для управління бізнес-процесами в сфері роздрібної торгівлі та громадського харчування. Система надає власникам повний контроль над усіма аспектами бізнесу, від управління персоналом до фінансового аналізу.

### 🎯 Основні можливості

- **POS система** - швидке оформлення замовлень та транзакцій
- **Управління меню** - повний контроль над каталогом товарів
- **Система запасів** - автоматичне замовлення та контроль термінів
- **Управління персоналом** - розклад, відпустки, мотивація
- **Фінансова аналітика** - детальні звіти та прогнозування
- **CRM система** - управління клієнтами та лояльністю
- **Мобільний додаток** - робота з планшетів та телефонів

### 🏗️ Архітектура

Система побудована на мікросервісній архітектурі з використанням сучасних технологій:

- **Backend**: Node.js, Express.js, PostgreSQL, Redis
- **Frontend**: React.js, TypeScript, Material-UI
- **Mobile**: React Native
- **Infrastructure**: Docker, Kubernetes, AWS/Azure

## 🚀 Швидкий старт

### Вимоги

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### Встановлення

```bash
# Клонування репозиторію
git clone https://github.com/your-username/berry-pos.git
cd berry-pos

# Встановлення залежностей
npm install

# Налаштування середовища
cp .env.example .env
# Відредагуйте .env файл з вашими налаштуваннями

# Запуск бази даних
docker-compose up -d postgres redis

# Міграції бази даних
npm run migrate

# Запуск в режимі розробки
npm run dev
```

### Структура проєкту

```
berry_pos/
├── docs/                    # 📚 Документація
│   ├── Project.md          # Детальний опис проєкту
│   ├── Tasktracker.md      # Відстеження завдань
│   ├── Diary.md           # Щоденник спостережень
│   ├── qa.md              # Питання та відповіді
│   └── changelog.md       # Журнал змін
├── backend/                 # 🔧 Backend сервіси
│   ├── auth-service/       # Сервіс аутентифікації
│   ├── pos-service/        # POS сервіс
│   ├── inventory-service/  # Сервіс запасів
│   └── analytics-service/  # Сервіс аналітики
├── frontend/               # 🎨 Frontend додатки
│   ├── admin-panel/        # Адміністративна панель
│   ├── pos-interface/      # POS інтерфейс
│   └── mobile-app/         # Мобільний додаток
├── shared/                 # 🔗 Спільні ресурси
│   ├── types/             # TypeScript типи
│   ├── utils/             # Утиліти
│   └── constants/         # Константи
└── infrastructure/        # 🏗️ Інфраструктура
    ├── docker/            # Docker конфігурації
    ├── k8s/               # Kubernetes манифести
    └── terraform/         # Terraform конфігурації
```

## 📖 Документація

- **[Project.md](docs/Project.md)** - Детальний опис проєкту та архітектури
- **[Tasktracker.md](docs/Tasktracker.md)** - Відстеження прогресу розробки
- **[Diary.md](docs/Diary.md)** - Щоденник технічних рішень
- **[qa.md](docs/qa.md)** - Питання та відповіді
- **[Changelog.md](docs/changelog.md)** - Журнал змін

## 🛠️ Розробка

### Команди

```bash
# Розробка
npm run dev          # Запуск в режимі розробки
npm run build        # Збірка проєкту
npm run test         # Запуск тестів
npm run lint         # Лінтінг коду

# Docker
docker-compose up -d    # Запуск всіх сервісів
docker-compose down     # Зупинка сервісів
docker-compose logs     # Перегляд логів

# База даних
npm run migrate        # Запуск міграцій
npm run seed           # Заповнення тестовими даними
```

### Стандарти кодування

- TypeScript для типізації
- ESLint + Prettier для форматування
- Jest для тестування
- Conventional Commits для commit повідомлень

## 🔒 Безпека

Система реалізує найкращі практики безпеки:

- JWT токени для аутентифікації
- Шифрування чутливих даних
- Rate limiting для API
- Валідація всіх вхідних даних
- Аудит дій користувачів

## 📊 Статус проєкту

**Поточна фаза**: Розробка MVP  
**Прогрес**: 70%  
**Наступна веха**: Тестування та поліпшення  

### Етапи розробки

- [x] **Фаза 0**: Планування та архітектура
- [x] **Фаза 1**: MVP Development (базова функціональність)
- [ ] **Фаза 2**: Розширений функціонал (4-5 місяців)
- [ ] **Фаза 3**: Аналітика та оптимізація (3-4 місяці)
- [ ] **Фаза 4**: Enterprise функції (4-6 місяців)

## 🤝 Внесок

Ми вітаємо внесок у розробку Berry POS! Будь ласка, ознайомтеся з нашими [правилами внеску](CONTRIBUTING.md).

### Процес внеску

1. Fork проєкту
2. Створіть feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit зміни (`git commit -m 'Add some AmazingFeature'`)
4. Push до branch (`git push origin feature/AmazingFeature`)
5. Відкрийте Pull Request

## 📄 Ліцензія

Цей проєкт ліцензовано під MIT License - дивіться файл [LICENSE](LICENSE) для деталей.

## 📞 Контакти

- **Проєкт**: [Berry POS](https://github.com/your-username/berry-pos)
- **Документація**: [docs/](docs/)
- **Питання**: [Issues](https://github.com/your-username/berry-pos/issues)

## 🙏 Подяки

Дякуємо всім, хто долучився до розробки Berry POS!

---

**Розроблено з ❤️ для бізнесу**
