import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { AuthForm } from '../AuthForm/AuthForm.jsx';
import { AuthModal } from '../AuthModal/AuthModal.jsx';
import { Footer } from '../Footer/Footer.jsx';
import { Navbar } from '../Navbar/Navbar.jsx';
import { OnboardingWizard } from '../OnboardingWizard/OnboardingWizard.jsx';
import { SkipLink } from '../ui/SkipLink.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ModalProvider, useModals } from '../../context/ModalContext.jsx';
import { I18nProvider, useI18n } from '../../utils/i18n.jsx';
import { fetchCatalogFromApi } from '../../utils/catalogLoader.js';
import {
  catalogHasExpectedCode,
  isCatalogCacheFresh,
  isCatalogCacheUsable,
  readCatalogCache,
  setCatalogData,
  writeCatalogCache,
} from '../../utils/benefitsRepository.js';

const StyledShell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const StyledMain = styled.main`
  max-width: ${({ theme }) => theme.layout.maxWidth}px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  padding: 16px clamp(12px, 4vw, 16px) 40px;

  @media (min-width: ${({ theme }) => theme.breakpoints.navDesktopMin}px) {
    padding-top: 18px;
  }
`;

const StyledCatalogNotice = styled.div`
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.72);
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
`;

export function AppLayout() {
  return (
    <I18nProvider initialLanguage="ru">
      <ModalProvider>
        <AppLayoutInner />
      </ModalProvider>
    </I18nProvider>
  );
}

function AppLayoutInner() {
  const { language, setLanguage, t } = useI18n();
  const { login, logout, user } = useAuth();
  const { authOpen, onboardingOpen, closeAuthModal, openOnboardingModal, closeOnboardingModal } = useModals();
  const [catalogStatus, setCatalogStatus] = useState({ state: 'ready', source: 'local' });
  const [catalogNonce, setCatalogNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const EXPECTED_SUBCATEGORY_ID = 'ind-family-birth-allowance';

    (async () => {
      let usedCache = false;
      try {
        setCatalogStatus({ state: 'loading', source: 'local' });

        const cached = readCatalogCache(language);
        if (cached && isCatalogCacheUsable(cached.fetchedAt)) {
          const ok = catalogHasExpectedCode(cached.catalog, EXPECTED_SUBCATEGORY_ID);
          if (ok) {
            usedCache = true;
            setCatalogData(cached.catalog);
            setCatalogNonce((n) => n + 1);
            setCatalogStatus({
              state: isCatalogCacheFresh(cached.fetchedAt) ? 'ready' : 'stale',
              source: 'cache',
            });
          }
        }

        const catalog = await fetchCatalogFromApi(language);
        if (cancelled) return;

        const ok = catalogHasExpectedCode(catalog, EXPECTED_SUBCATEGORY_ID);
        if (ok) {
          setCatalogData(catalog);
          setCatalogNonce((n) => n + 1);
          writeCatalogCache(language, catalog);
          setCatalogStatus({ state: 'ready', source: 'api' });
        } else {
          // API is valid but seems stale (e.g. DB not reseeded yet).
          setCatalogStatus({ state: usedCache ? 'stale' : 'stale', source: 'api-stale' });
        }
      } catch {
        // keep local bundled catalog as fallback
        setCatalogStatus({ state: usedCache ? 'stale' : 'error', source: usedCache ? 'cache' : 'local' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [language]);

  return (
    <StyledShell>
      <SkipLink />
      <Navbar
        user={user}
        onAuthClick={openOnboardingModal}
        onLogout={logout}
        language={language}
        onLanguageChange={setLanguage}
      />
      <StyledMain id="main-content" tabIndex={-1}>
        {catalogStatus.state === 'loading' ? <StyledCatalogNotice aria-live="polite">{t('common.catalogLoading')}</StyledCatalogNotice> : null}
        {catalogStatus.state === 'error' ? <StyledCatalogNotice aria-live="polite">{t('common.catalogError')}</StyledCatalogNotice> : null}
        <Outlet />
      </StyledMain>
      <AuthModal open={authOpen} onClose={closeAuthModal} title={t('auth.titleLogin')}>
        <AuthForm
          onSuccess={async (phone) => {
            try {
              const res = await fetch('/api/auth/ensure-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
              });
              if (res.ok) {
                const data = await res.json();
                login(data.phone ?? phone, data.role);
              } else {
                login(phone);
              }
            } catch {
              login(phone);
            }
            closeAuthModal();
          }}
        />
      </AuthModal>
      <AuthModal open={onboardingOpen} onClose={closeOnboardingModal} title={t('nav.pickForYou')}>
        <OnboardingWizard
          onDone={() => {
            closeOnboardingModal();
          }}
        />
      </AuthModal>
      <Footer />
    </StyledShell>
  );
}

