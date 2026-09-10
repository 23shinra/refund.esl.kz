# Refund (Qoldau) — полное описание проекта

**Домен:** `refund.esl.kz`  
**Пакет npm:** `benefits-picker` (v0.1.0)  
**Назначение:** веб-сервис подбора льгот и государственных услуг для Казахстана (RU/KZ).

---

## 1. Кратко о продукте

Refund помогает пользователю быстро найти нужную тему по льготам и госуслугам:

1. Выбрать аудиторию (физлица / юрлица).
2. Открыть раздел и подкатегорию каталога.
3. Получить список вопросов и подробный ответ.
4. Связаться со специалистом (WhatsApp / заявка) или пройти AI-онбординг «подобрать для вас».

Отдельные роли:

| Роль | Назначение |
|------|------------|
| **Клиент** | Просмотр каталога, поиск, заявки, онбординг |
| **Партнёр** | Кабинет `/partner`: до 5 услуг, заявки, аналитика |
| **Админ панели** | Отдельный вход `/admin` (логин/пароль + JWT) |

Партнёрская подписка (маркетинг на сайте): **9 990 ₸ / месяц**, до **5 услуг** в базовом тарифе.

Брендинг в коде и ассетах часто фигурирует как **Qoldau** (логотип `public/qoldau-logo.png`, Docker-сервис `qoldau-mysql`).

---

## 2. Технологический стек

### Frontend
| Технология | Версия / заметки |
|------------|------------------|
| React | 18 |
| React Router | 6 (SPA) |
| Vite | 5 |
| styled-components | 6 |
| PropTypes | валидация пропсов |
| i18n | свой словарь `src/utils/i18n.jsx` (ru / kz) |

### Backend
| Технология | Версия / заметки |
|------------|------------------|
| Node.js (ESM) | `"type": "module"` |
| Express | 4 |
| Knex | 3 (миграции + запросы) |
| SQLite3 / MySQL | sqlite3 или mysql2 |
| Zod | валидация тел запросов |
| bcryptjs | хеш пароля админки |
| jsonwebtoken | JWT админ-панели |
| OpenAI API | опционально для онбординга |

### Инфраструктура
- `docker-compose.yml` — MySQL 8.4 (`qoldau`)
- Vite proxy: `/api` → `http://localhost:3001`
- Сборка фронта в `dist/`
- Локальные SQLite: `server/dev.sqlite3`, `data/app.sqlite3`

---

## 3. Архитектура

```
┌─────────────────────┐         ┌──────────────────────────┐
│  React SPA (Vite)   │  /api   │  Express API (:3001)     │
│  src/               │ ──────► │  server/                 │
│  - pages            │         │  - routes                │
│  - components       │         │  - knex migrations       │
│  - features         │         │  - seed из benefitsData  │
│  - context / utils  │         └───────────┬──────────────┘
└─────────────────────┘                     │
                                            ▼
                              SQLite  или  MySQL (docker)
```

При старте API:

1. Подключается к БД (`server/src/db.js` + `knexfile.js`).
2. Прогоняет миграции (`db.migrate.latest()`).
3. Опционально выдаёт роль `admin` по `ADMIN_BOOTSTRAP_PHONE`.
4. Сидит каталог из `src/data/benefitsData.js`, если аудитории ещё нет.
5. Слушает `API_PORT` (по умолчанию `3001`).

Фронт ходит в `/api/...` (в dev — через Vite proxy).

---

## 4. Структура репозитория

```
/
├── package.json              # скрипты и зависимости
├── vite.config.js            # React + proxy /api
├── index.html
├── docker-compose.yml        # MySQL
├── .env / .env.example
├── README.md
├── PROJECT.md                # этот файл
│
├── public/                   # статика (логотип)
├── dist/                     # production-сборка фронта
├── data/                     # app.sqlite3 (runtime)
│
├── docs/
│   ├── IMPROVEMENTS.md       # рефакторинг админки/партнёра
│   ├── ROLES.md              # роли
│   ├── SEO-PLAN.md           # план SEO
│   ├── MOBILE-MENU-PLAN.md
│   └── refund-pitch-deck/    # pitch decks + генераторы
│
├── src/                      # Frontend
│   ├── App.jsx               # маршруты
│   ├── main.jsx
│   ├── pages/                # страницы (lazy)
│   ├── components/           # UI-блоки
│   ├── features/             # admin / partner hooks & clients
│   ├── context/              # Auth, Modal
│   ├── data/                 # benefitsData, helpersData
│   ├── styles/               # theme, globalStyles
│   ├── constants/
│   └── utils/                # catalog, i18n, auth, meta
│
└── server/                   # Backend API
    ├── index.js              # точка входа
    ├── knexfile.js
    ├── migrations/
    ├── scripts/              # hash/set admin credentials
    └── src/
        ├── db.js, env.js, phone.js
        ├── adminPanelAuth.js
        ├── seed.js
        ├── constants/
        ├── middleware/
        └── routes/
```

---

## 5. Каталог данных

### Иерархия
```
audiences (individual | legal)
  └── category_groups          # разделы, напр. «Семья и дети»
        └── subcategories      # услуги/темы, напр. «Пособия и выплаты»
              └── questions    # вопрос + развёрнутый ответ + теги
```

### Объём seed-каталога (`src/data/benefitsData.js`)
| Сущность | Количество |
|----------|------------|
| Аудитории | 2 (`individual`, `legal`) |
| Группы категорий | 16 |
| Подкатегории (услуги) | 75 |
| Вопросы | 76 |

Контент двуязычный: поля `title` / `question` / `answer` / `tags` в формате `{ ru, kz }`.

Ответы — справочные инструкции (как получить, документы, куда обращаться, типичные отказы, ориентиры по суммам). Это **не юридическая консультация**; на сайте подразумеваются дисклеймеры и контакты специалистов.

### Специалисты (`src/data/helpersData.js`)
Статический список хелперов (имя, цена в ₸, WhatsApp, список услуг помощи). Показываются на страницах вопросов через `HelperContacts`.

---

## 6. Frontend: маршруты и страницы

| URL | Страница | Описание |
|-----|----------|----------|
| `/` | `HomePage` | Выбор аудитории, вход в разделы |
| `/category/:categoryId` | `CategoryPage` | Список вопросов + поиск в разделе |
| `/category/:categoryId/question/:questionId` | `QuestionDetailPage` | Ответ, теги, контакты, форма заявки |
| `/partners` | `PartnersPage` | Описание партнёрской подписки |
| `/partner` | `PartnerPage` | Кабинет партнёра |
| `/about` | `AboutPage` | О сервисе |
| `/legal/:doc` | `LegalDocPage` | Terms / Offer / Privacy |
| `/admin` | `AdminPage` | Админ-панель (вне `AppLayout`) |
| `/404` | `NotFoundPage` | 404; остальные пути → редирект сюда |

Особенности UI:

- Lazy-load страниц + `Suspense` / `PageLoader`
- `ErrorBoundary` на публичных маршрутах и админке
- `SkipLink` для a11y
- Navbar: глобальный поиск (в т.ч. режим «ИИ»), язык RU/KZ, вход, онбординг «Подобрать для вас»
- Тема: светлая, primary `#2563EB`, шрифт Open Sans
- Динамические `title` / `description` через `documentMeta`

### Ключевые компоненты
| Компонент | Роль |
|-----------|------|
| `Navbar` | Навигация, поиск, меню, auth |
| `OnboardingWizard` | Пошаговый подбор через `/api/onboarding/next` |
| `ApplicationForm` | Заявка + WhatsApp с предзаполненным текстом |
| `AuthForm` / `AuthModal` | Демо-вход по телефону + SMS-код |
| `QuestionList` / `QuestionItem` | Список вопросов |
| `HelperContacts` | Контакты специалистов |

### Features
- `src/features/admin/` — `adminClient`, `useAdminPanel`, константы API
- `src/features/partner/` — `usePartnerDashboard`

---

## 7. Авторизация

### Клиент / партнёр (сайт)
1. Пользователь вводит телефон в `AuthForm`.
2. **Демо-SMS:** принимается только код `123456` (`DEMO_SMS_CODE`) — реальной отправки SMS нет.
3. После входа вызывается `POST /api/auth/ensure-user` → создаётся/читается запись в `users`.
4. Сессия хранится на клиенте (`authSession` + `AuthContext`): `{ phone, role }`.
5. Партнёрский API идентифицирует пользователя заголовком **`X-User-Phone`**.

### Админ-панель (`/admin`)
- Отдельный вход (не SMS).
- Учётные данные в таблице `admin_panel_credentials` (логин + bcrypt-хеш).
- `POST /api/admin/auth/login` → JWT.
- Дальнейшие запросы: `Authorization: Bearer <token>`.
- Секрет: `ADMIN_JWT_SECRET` (минимум 16 символов).
- Скрипт настройки:
  ```bash
  node --env-file=.env server/scripts/set-admin-credentials.mjs <логин> <пароль>
  ```
- Смена логина/пароля из UI: `PATCH /api/admin/credentials`.

Роль `admin` в таблице `users` — для сценариев сайта; **панель `/admin` от неё не зависит**.

---

## 8. Backend API

Базовый префикс: `/api`. Health: `GET /api/health`.

### Публичные / общие

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/catalog?lang=ru\|kz` | Полный каталог |
| GET | `/subcategories/:code?lang=` | Подкатегория + вопросы |
| POST | `/applications` | Создать заявку |
| POST | `/auth/ensure-user` | Создать/вернуть пользователя по телефону |
| POST | `/onboarding/next` | Следующий вопрос онбординга + рекомендации |

**Тело заявки (`POST /applications`):**
```json
{
  "subcategoryCode": "ind-family-payments",
  "questionCode": "ind-family-payments-1",
  "lang": "ru",
  "name": "Имя",
  "phone": "+77001234567",
  "comment": "опционально"
}
```

### Онбординг (`POST /onboarding/next`)
- Вход: `language`, `answers`, `askedQuestionIds`.
- Если задан `OPENAI_API_KEY` — запрос к OpenAI (модель по умолчанию `gpt-4o-mini`), ответ JSON: следующий вопрос + до 10 кодов подкатегорий.
- Без ключа или при ошибке формы — **fallback** (эвристики по возрасту, семье, приоритету и т.д.).
- Не собирает ИИН, точный адрес, диагнозы (правила в промпте).

### Партнёр (заголовок `X-User-Phone`, роль `partner`)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/partner/catalog` | Каталог услуг + флаг `linked` |
| POST | `/partner/services` | Подключить услугу (`subcategoryId`) |
| DELETE | `/partner/services/:subcategoryId` | Отключить |
| GET | `/partner/applications` | Заявки по своим услугам |
| PATCH | `/partner/applications/:id` | Статус: `new` \| `in_progress` \| `done` |
| GET | `/partner/analytics` | Сводка, bySubcategory, last7Days |

Лимит: `PARTNER_MAX_SERVICES = 5`.

### Админ (JWT)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/admin/auth/login` | Логин → token |
| POST | `/admin/seed` | Принудительный reseeding каталога |
| GET/PATCH | `/admin/users`, `/admin/users/:id` | Список / смена роли |
| PATCH | `/admin/credentials` | Смена логина/пароля панели |
| GET | `/admin/catalog-tree` | Дерево каталога |
| GET | `/admin/stats` | Статистика |
| GET | `/admin/partners` | Партнёры |
| CRUD | `/admin/category-groups` | Группы |
| CRUD | `/admin/subcategories` | Подкатегории |
| GET/PUT | `/admin/subcategories/:id/partners` | Привязка партнёров к услуге |
| CRUD | `/admin/questions` | Вопросы |

Вкладки UI админки: Dashboard, Categories, Services, Questions, Partners, Users, Credentials.

---

## 9. База данных

### Выбор движка (`server/knexfile.js`)
- Если задан **`MYSQL_DATABASE`** → MySQL (`mysql2`).
- Иначе → SQLite (`SQLITE_FILENAME` или `./server/dev.sqlite3`).

### Таблицы

| Таблица | Назначение |
|--------|------------|
| `audiences` | Физлица / юрлица |
| `category_groups` | Разделы каталога |
| `subcategories` | Услуги / темы |
| `questions` | Вопросы и ответы (RU/KZ, tags JSON) |
| `applications` | Заявки пользователей (`status`: new / in_progress / done) |
| `users` | Телефон + роль |
| `partner_service_assignments` | Связь партнёр ↔ подкатегория |
| `admin_panel_credentials` | Логин/хеш админ-панели (id=1) |

### Миграции
```
server/migrations/
  20260318_01_init.js
  20260319_users.js
  20260320_partner_services.js
  20260321_admin_panel_credentials.js
  20260327_add_custom_services.js
  20260327_add_custom_services_more.js   # доп. услуги/контент
```

Команды:
```bash
npm run migrate
npm run migrate:rollback
```

---

## 10. Переменные окружения

Шаблон: `.env.example`.

| Переменная | Назначение |
|------------|------------|
| `API_PORT` | Порт API (default 3001) |
| `SQLITE_FILENAME` | Путь к SQLite |
| `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` | MySQL |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Онбординг ИИ |
| `ADMIN_JWT_SECRET` | Секрет JWT админки |
| `ADMIN_JWT_EXPIRES` | Срок JWT (опционально, напр. `12h`) |
| `ADMIN_BOOTSTRAP_PHONE` | Выдать роль admin пользователю с этим телефоном при старте |

Устаревшие (больше не используются для панели): `ADMIN_PANEL_LOGIN`, `ADMIN_PANEL_PASSWORD_HASH`, `ADMIN_PANEL_PASSWORD`.

Файл `.env` в `.gitignore` — не коммитить секреты.

---

## 11. Скрипты npm

| Команда | Действие |
|---------|----------|
| `npm run dev` | Vite (фронт) |
| `npm run dev:api` | Express API |
| `npm run dev:all` | API + фронт параллельно (`concurrently`) |
| `npm run build` | Сборка в `dist/` |
| `npm run preview` | Превью сборки |
| `npm run migrate` | Knex migrate:latest |
| `npm run migrate:rollback` | Откат миграции |
| `npm test` | Jest |
| `npm run admin:hash-password` | Хелпер хеширования пароля |

Локальный стек с MySQL:
```bash
docker compose up -d
# заполнить .env (MYSQL_*)
npm run migrate
npm run dev:all
```

---

## 12. Бизнес-потоки

### A. Самостоятельный поиск льготы
Главная → аудитория → категория → вопрос → чтение ответа → WhatsApp / форма заявки.

### B. AI-подбор
Navbar «Подобрать для вас» → `OnboardingWizard` → серия вопросов → рекомендации подкатегорий → переход в каталог.

### C. Партнёр
Вход по телефону (роль `partner` в БД) → `/partner` → выбор до 5 услуг → просмотр/статусы заявок → аналитика.

### D. Админ
`/admin` → JWT → CRUD каталога, роли пользователей, партнёры по услугам, reseeding, смена пароля панели.

---

## 13. Документация в `docs/`

| Файл | Содержание |
|------|------------|
| `ROLES.md` | Роли admin / partner / client |
| `IMPROVEMENTS.md` | 10 архитектурных улучшений (хуки, lazy admin, a11y) |
| `SEO-PLAN.md` | План SEO (SSR/prerender, sitemap, hreflang, Schema.org) |
| `MOBILE-MENU-PLAN.md` | План мобильного меню |
| `refund-pitch-deck/` | PPTX pitch decks + скрипты генерации (`generate-deck*.mjs`) |

Краткий `README.md` в корне — продуктовое описание для команды.

---

## 14. Дизайн и UX

- Светлая тема (`theme.js`): фон `#F6F9FF`, primary blue/cyan.
- Карточки с мягкими тенями и скруглениями.
- Адаптив: desktop navbar от ~960px.
- Состояния загрузки/ошибок каталога (stale cache при сбое обновления).
- Поиск с дебаунсом и клавиатурной навигацией (по README).
- Юридические страницы: условия, оферта, персональные данные.

---

## 15. Текущие ограничения и особенности

1. **SMS-вход демо:** код всегда `123456`, без реального SMS-провайдера.
2. **SPA без SSR:** для SEO нужен prerender/SSR (см. `docs/SEO-PLAN.md`).
3. **Аналитика партнёра** использует SQLite-функции (`strftime` / `datetime`) — на чистом MySQL может потребоваться адаптация SQL.
4. **WhatsApp-номера хелперов** в `helpersData` — плейсхолдеры (`7700000000x`).
5. Контент seed — ориентировочный; точные условия льгот зависят от региона и нужно уточнять в ЦОН/на портале.
6. OpenAI ключ только на сервере; без него онбординг работает в режиме fallback.

---

## 16. Связанные имена и домены

| Имя | Где встречается |
|-----|-----------------|
| Refund | Продукт, pitch decks, партнёрские тексты |
| Qoldau | Логотип, MySQL DB/user, SEO-план (`qoldau.esl.kz`) |
| benefits-picker | `package.json` name |
| refund.esl.kz | Каталог деплоя на сервере |

---

## 17. Быстрый старт для разработчика

```bash
cd /var/www/refund.esl.kz
cp .env.example .env
# отредактировать ADMIN_JWT_SECRET, при необходимости MYSQL_* или SQLITE, OPENAI_*

npm install

# вариант A: SQLite (не задавать MYSQL_DATABASE)
npm run migrate
npm run dev:all

# вариант B: MySQL
docker compose up -d
# в .env указать MYSQL_DATABASE=qoldau и пароли из compose
npm run migrate
npm run dev:all

# админ-панель
node --env-file=.env server/scripts/set-admin-credentials.mjs admin 'your_secure_password'
# открыть http://localhost:5173/admin
```

Фронт (Vite): обычно `http://localhost:5173`  
API: `http://localhost:3001`  
Health: `GET http://localhost:3001/api/health`

---

*Документ сгенерирован по состоянию кодовой базы проекта. При изменении API или схемы БД обновляйте этот файл вместе с миграциями.*
