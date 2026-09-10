import React from 'react';

import {
  PageBack,
  PageCard,
  PageRoot,
  PageText,
  PageTitle,
} from '../../components/PageLayout/PageLayout.jsx';
import { useI18n } from '../../utils/i18n.jsx';
import { useDocumentMeta } from '../../utils/documentMeta.js';

export function NotFoundPage() {
  const { t } = useI18n();

  useDocumentMeta({
    title: `${t('notFound.title')} — Refund`,
    description: t('notFound.text'),
  });

  return (
    <PageRoot>
      <PageCard>
        <PageTitle style={{ fontSize: 22, marginBottom: 12 }}>{t('notFound.title')}</PageTitle>
        <PageText>{t('notFound.text')}</PageText>
        <PageBack to="/">{t('common.backToHome')}</PageBack>
      </PageCard>
    </PageRoot>
  );
}
