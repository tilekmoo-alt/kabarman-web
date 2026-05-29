# Кабарман — Веб-сайт

Сайт работает с той же PostgreSQL базой что и Telegram бот.

## Структура

```
kabarman-web/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── providers.js   # CRUD провайдеров
│   │   │   └── misc.js        # категории, районы, админ, статы
│   │   ├── middleware/auth.js  # JWT для админки
│   │   ├── db/pool.js         # PostgreSQL
│   │   └── index.js           # точка входа
│   ├── .env.example
│   ├── package.json
│   └── railway.toml
│
└── frontend/         # React + Vite
    └── src/
        ├── pages/
        │   ├── HomePage.jsx     # главная с категориями и районами
        │   ├── CatalogPage.jsx  # каталог с фильтрами
        │   ├── RegisterPage.jsx # регистрация бизнеса
        │   └── AdminPage.jsx    # панель администратора
        └── utils/api.js         # axios клиент
```

## Деплой на Railway

### Backend
1. New Service → GitHub repo (папка backend)
2. Переменные:
   - `DATABASE_URL` — та же база что у бота
   - `JWT_SECRET` — любая строка
   - `ADMIN_USERNAME` — логин для /admin
   - `ADMIN_PASSWORD` — пароль для /admin
   - `NODE_ENV=production`

### Frontend
1. New Service → GitHub repo (папка frontend)
2. Переменные:
   - `VITE_API_URL` — URL бэкенда + /api

## Страницы

| URL | Описание |
|-----|----------|
| `/` | Главная — категории и районы |
| `/catalog` | Каталог с фильтрами |
| `/register` | Регистрация бизнеса |
| `/admin` | Панель администратора |
