import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import { AppLayout } from './components/AppLayout/AppLayout.jsx';
import { AdminPageRoute } from './pages/AdminPage/AdminPage.lazy.jsx';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary.jsx';
import { PageLoader } from './components/ui/PageLoader.jsx';

const HomePageLazy = lazy(() => import('./pages/HomePage/HomePage.jsx').then((m) => ({ default: m.HomePage })));
const CategoryPageLazy = lazy(() =>
  import('./pages/CategoryPage/CategoryPage.jsx').then((m) => ({ default: m.CategoryPage })),
);
const QuestionDetailPageLazy = lazy(() =>
  import('./pages/QuestionDetailPage/QuestionDetailPage.jsx').then((m) => ({ default: m.QuestionDetailPage })),
);
const PartnersPageLazy = lazy(() => import('./pages/PartnersPage/PartnersPage.jsx').then((m) => ({ default: m.PartnersPage })));
const PartnerPageLazy = lazy(() => import('./pages/PartnerPage/PartnerPage.jsx').then((m) => ({ default: m.PartnerPage })));
const AboutPageLazy = lazy(() => import('./pages/AboutPage/AboutPage.jsx').then((m) => ({ default: m.AboutPage })));
const LegalDocPageLazy = lazy(() =>
  import('./pages/LegalDocPage/LegalDocPage.jsx').then((m) => ({ default: m.LegalDocPage })),
);
const NotFoundPageLazy = lazy(() => import('./pages/NotFoundPage/NotFoundPage.jsx').then((m) => ({ default: m.NotFoundPage })));

function PublicPageRoute({ LazyComponent, title }) {
  return (
    <ErrorBoundary title={title}>
      <Suspense fallback={<PageLoader message="Загрузка…" />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
    <Routes>
      <Route path="/admin" element={<AdminPageRoute />} />
      <Route element={<AppLayout />}>
        <Route index element={<PublicPageRoute LazyComponent={HomePageLazy} title="Ошибка загрузки главной" />} />
        <Route path="/about" element={<PublicPageRoute LazyComponent={AboutPageLazy} title="Ошибка загрузки страницы «О нас»" />} />
        <Route path="/legal/:doc" element={<PublicPageRoute LazyComponent={LegalDocPageLazy} title="Ошибка загрузки документов" />} />
        <Route path="/partners" element={<PublicPageRoute LazyComponent={PartnersPageLazy} title="Ошибка загрузки страницы партнёров" />} />
        <Route path="/partner" element={<PublicPageRoute LazyComponent={PartnerPageLazy} title="Ошибка загрузки кабинета партнёра" />} />
        <Route
          path="/category/:categoryId/question/:questionId"
          element={<PublicPageRoute LazyComponent={QuestionDetailPageLazy} title="Ошибка загрузки вопроса" />}
        />
        <Route
          path="/category/:categoryId"
          element={<PublicPageRoute LazyComponent={CategoryPageLazy} title="Ошибка загрузки категории" />}
        />
        <Route path="/404" element={<PublicPageRoute LazyComponent={NotFoundPageLazy} title="Ошибка загрузки страницы 404" />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
    </AuthProvider>
  );
}

