# Роли пользователей

| Роль       | Код        | Назначение |
|-----------|------------|------------|
| Админ     | `admin`    | Управление каталогом, заявками, партнёрами |
| Партнёр   | `partner`  | Кабинет `/partner`: до 5 услуг, заявки, аналитика |
| Клиент    | `client`   | Просмотр льгот, личный кабинет гражданина |

## Фронтенд

- Константы: `src/constants/userRoles.js`
- Сессия: `src/utils/authSession.js` (`phone`, `role`)
- Контекст: `src/context/AuthContext.jsx` — `useAuth()` → `{ user, login, logout }`
- После SMS-входа пока всегда выставляется **`client`**. Роль с бэкенда: `login(phone, role)` при ответе verify.

## Бэкенд

- Константы: `server/src/constants/userRoles.js`
- Таблица `users` (телефон, роль): запись создаётся при `POST /api/auth/ensure-user` после входа по SMS.
- **Админка:** `/admin` — **отдельный вход** (логин/пароль в `.env`: `ADMIN_PANEL_LOGIN`, `ADMIN_PANEL_PASSWORD_HASH`, `ADMIN_JWT_SECRET`). API: `POST /api/admin/auth/login`, далее `Authorization: Bearer <jwt>`. Роль `admin` в `users` — для доступа к сайту, не для панели.
- **Партнёр:** `/partner` — заголовок `X-User-Phone`. API: `GET/POST/DELETE /api/partner/services`, заявки, аналитика. Таблица `partner_service_assignments` (макс. 5 услуг на партнёра).
