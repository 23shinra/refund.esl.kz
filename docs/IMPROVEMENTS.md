# 10 улучшений архитектуры (реализовано)

1. **Централизованный клиент админки** — `features/admin/adminClient.js`: единые заголовки, обработка 401, константы URL.
2. **Хук `useAdminPanel`** — состояние и загрузка вынесены из JSX в `features/admin/useAdminPanel.js`.
3. **Композиция админки** — вкладки как отдельные компоненты в `pages/AdminPage/components/`.
4. **Стили админки** — `adminStyles.js`, без дублирования styled в каждом табе.
5. **Lazy-load `/admin`** — отложенная загрузка бандла админки (`React.lazy` + `Suspense`).
6. **ErrorBoundary на админ-маршруте** — падение админки не ломает всё приложение.
7. **A11y: skip-link** — переход к основному контенту с клавиатуры (`SkipLink`, `main#main-content`).
8. **`usePartnerDashboard`** — загрузка и мутации кабинета партнёра в одном хуке.
9. **Секции PartnerPage** — `PartnerGate`, Services / Analytics / Applications как отдельные компоненты.
10. **UI-атомы** — `PageLoader` для Suspense, `AdminMessageBanner` для ошибок/успеха (роль `status`).

## Структура файлов

| Область | Путь |
|---------|------|
| Константы / API админки | `src/features/admin/constants.js`, `adminClient.js` |
| Хук админки | `src/features/admin/useAdminPanel.js` |
| Вкладки админки | `src/pages/AdminPage/components/*.jsx` |
| Стили админки | `src/pages/AdminPage/adminStyles.js` |
| Ленивый маршрут | `src/pages/AdminPage/AdminPage.lazy.jsx` |
| Хук партнёра | `src/features/partner/usePartnerDashboard.js` |
| Секции партнёра | `src/pages/PartnerPage/components/*.jsx` |
| UI | `src/components/ui/SkipLink.jsx`, `PageLoader.jsx` |
