import React, { useMemo } from 'react';

import {
  PageBack,
  PageHero,
  PageLead,
  PageRoot,
  PageTitle,
} from '../../components/PageLayout/PageLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { USER_ROLE } from '../../constants/userRoles.js';
import { usePartnerDashboard } from '../../features/partner/usePartnerDashboard.js';
import { useI18n } from '../../utils/i18n.jsx';
import { useDocumentMeta } from '../../utils/documentMeta.js';
import { PartnerApplicationsSection } from './components/PartnerApplicationsSection.jsx';
import { PartnerAnalyticsSection } from './components/PartnerAnalyticsSection.jsx';
import { PartnerGateNeedLogin } from './components/PartnerGate.jsx';
import { PartnerServicesSection } from './components/PartnerServicesSection.jsx';
import { StyledErr } from './partnerStyles.js';

export function PartnerPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const phone = user?.phone ?? '';
  const isPartner = user?.role === USER_ROLE.PARTNER;

  useDocumentMeta({
    title: `${t('partner.title')} — Refund`,
    description: t('partner.lead'),
  });

  const onGeneric = useMemo(() => () => t('partner.loadError'), [t]);

  const dash = usePartnerDashboard(phone, isPartner, onGeneric);

  if (!user?.phone) {
    return (
      <PartnerGateNeedLogin
        title={t('partner.title')}
        message={t('partner.needLogin')}
        backLabel={t('common.backToHome')}
      />
    );
  }

  if (!isPartner) {
    return (
      <PartnerGateNeedLogin
        title={t('partner.title')}
        message={t('partner.needRole')}
        backLabel={t('common.backToHome')}
      />
    );
  }

  const appLabels = {
    colDate: t('partner.colDate'),
    colPhone: t('partner.colPhone'),
    colService: t('partner.colService'),
    colQuestion: t('partner.colQuestion'),
    colStatus: t('partner.colStatus'),
    statusNew: t('partner.statusNew'),
    statusProgress: t('partner.statusProgress'),
    statusDone: t('partner.statusDone'),
  };

  const analyticsLabels = {
    statApplications: t('partner.statApplications'),
    statServices: t('partner.statServices'),
    colService: t('partner.colService'),
    colApps: t('partner.colApps'),
  };

  return (
    <PageRoot>
      <PageHero>
        <PageTitle>{t('partner.title')}</PageTitle>
        <PageLead>{t('partner.lead')}</PageLead>
      </PageHero>
      {dash.error ? <StyledErr role="alert">{dash.error}</StyledErr> : null}

      <PartnerServicesSection
        title={t('partner.sectionServices')}
        limitLabel={t('partner.servicesLimit', {
          current: dash.catalog?.linkedCount ?? 0,
          max: dash.catalog?.maxServices ?? 5,
        })}
        items={dash.catalog?.items}
        busy={dash.busy}
        maxServices={dash.catalog?.maxServices ?? 5}
        linkedCount={dash.catalog?.linkedCount ?? 0}
        onToggle={dash.toggleService}
      />

      <PartnerAnalyticsSection
        title={t('partner.sectionAnalytics')}
        analytics={dash.analytics}
        labels={analyticsLabels}
        noServicesYet={t('partner.noServicesYet')}
        chartLabel={t('partner.chart7d')}
      />

      <PartnerApplicationsSection
        title={t('partner.sectionApplications')}
        applications={dash.applications}
        busy={dash.busy}
        noApplications={t('partner.noApplications')}
        labels={appLabels}
        onStatusChange={dash.setAppStatus}
      />

      <PageBack to="/">{t('common.backToHome')}</PageBack>
    </PageRoot>
  );
}
