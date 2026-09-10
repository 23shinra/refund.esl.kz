import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';

import { ADMIN_NAV } from '../../features/admin/constants.js';
import { useAdminPanel } from '../../features/admin/useAdminPanel.js';
import { theme } from '../../styles/theme.js';
import {
  AdminContent,
  AdminMain,
  AdminShell,
  AdminTopBar,
  AdminTopBarTitle,
  AlertBanner,
  HamburgerBtn,
  BtnSecondary,
  Spinner,
} from './adminStyles.js';
import { AdminSidebar } from './components/AdminSidebar.jsx';
import { AdminLoginForm } from './components/AdminLoginForm.jsx';
import { AdminDashboard } from './components/AdminDashboard.jsx';
import { AdminCategoriesTab } from './components/AdminCategoriesTab.jsx';
import { AdminServicesTab } from './components/AdminServicesTab.jsx';
import { AdminQuestionsSection } from './components/AdminQuestionsSection.jsx';
import { AdminPartnersTab } from './components/AdminPartnersTab.jsx';
import { AdminUsersTab } from './components/AdminUsersTab.jsx';
import { AdminCredentialsTab } from './components/AdminCredentialsTab.jsx';

const NAV_LABELS = Object.fromEntries(ADMIN_NAV.map((n) => [n.id, n.label]));

function AdminPageInner() {
  const panel = useAdminPanel();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!panel.token) {
    return <AdminLoginForm onLogin={panel.login} busy={panel.loginBusy} error={panel.error} />;
  }

  const section = panel.section;

  return (
    <AdminShell>
      <AdminSidebar
        activeSection={section}
        onSectionChange={panel.setSection}
        onLogout={panel.logout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <AdminMain>
        <AdminTopBar>
          <HamburgerBtn type="button" aria-label="Открыть меню" onClick={() => setSidebarOpen((v) => !v)}>
            ☰
          </HamburgerBtn>
          <AdminTopBarTitle>{NAV_LABELS[section] ?? 'Админка'}</AdminTopBarTitle>
          <BtnSecondary type="button" onClick={panel.refresh} disabled={panel.loading} style={{ fontSize: 13 }}>
            {panel.loading ? <Spinner /> : '↺'} Обновить
          </BtnSecondary>
        </AdminTopBar>

        <AdminContent>
          {panel.error ? (
            <AlertBanner $type="error" role="alert">
              ⚠ {panel.error}
            </AlertBanner>
          ) : null}
          {panel.okMsg && !panel.error ? (
            <AlertBanner $type="success" role="status">
              ✓ {panel.okMsg}
            </AlertBanner>
          ) : null}

          {section === 'dashboard' && (
            <AdminDashboard
              stats={panel.stats}
              tree={panel.tree}
              loading={panel.loading}
              onNavigate={panel.setSection}
            />
          )}
          {section === 'categories' && panel.tree && (
            <AdminCategoriesTab
              tree={panel.tree}
              adminRequest={panel.adminRequest}
              onReload={panel.loadCatalog}
              setError={panel.setError}
              setOk={panel.setOkMsg}
            />
          )}
          {section === 'services' && panel.tree && (
            <AdminServicesTab
              tree={panel.tree}
              adminRequest={panel.adminRequest}
              onReload={panel.loadCatalog}
              setError={panel.setError}
              setOk={panel.setOkMsg}
            />
          )}
          {section === 'questions' && panel.tree && (
            <AdminQuestionsSection
              tree={panel.tree}
              adminRequest={panel.adminRequest}
              setError={panel.setError}
              setOk={panel.setOkMsg}
            />
          )}
          {section === 'partners' && panel.tree && (
            <AdminPartnersTab
              tree={panel.tree}
              partners={panel.partnersOnly}
              adminRequest={panel.adminRequest}
              setError={panel.setError}
              setOk={panel.setOkMsg}
            />
          )}
          {section === 'users' && (
            <AdminUsersTab
              users={panel.users}
              loading={panel.loading}
              error={panel.error}
              pending={panel.pending}
              onUpdateRole={panel.updateRole}
            />
          )}
          {section === 'account' && (
            <AdminCredentialsTab
              adminRequest={panel.adminRequest}
              setError={panel.setError}
              setOk={panel.setOkMsg}
            />
          )}
          {(section === 'categories' || section === 'services' || section === 'partners' || section === 'questions') && !panel.tree && panel.loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Spinner />
            </div>
          )}
        </AdminContent>
      </AdminMain>
    </AdminShell>
  );
}

export function AdminPage() {
  return (
    <ThemeProvider theme={theme}>
      <AdminPageInner />
    </ThemeProvider>
  );
}
