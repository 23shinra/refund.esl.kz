import React, { lazy, Suspense } from 'react';

import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary.jsx';
import { PageLoader } from '../../components/ui/PageLoader.jsx';

const AdminPageLazy = lazy(() =>
  import('./AdminPage.jsx').then((m) => ({ default: m.AdminPage })),
);

export function AdminPageRoute() {
  return (
    <ErrorBoundary
      title="Ошибка админ-панели"
      message="Обновите страницу. Если проблема сохраняется, проверьте консоль браузера и логи API."
    >
      <Suspense fallback={<PageLoader message="Загрузка админки…" />}>
        <AdminPageLazy />
      </Suspense>
    </ErrorBoundary>
  );
}
