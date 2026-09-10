import React from 'react';

import {
  PageBack,
  PageBody,
  PageCard,
  PageHero,
  PageRoot,
  PageTitle,
} from '../../components/PageLayout/PageLayout.jsx';
import { useDocumentMeta } from '../../utils/documentMeta.js';
import { useI18n } from '../../utils/i18n.jsx';

export function AboutPage() {
  const { t } = useI18n();
  const blocks = String(t('about.body')).split('\n\n').filter(Boolean);

  useDocumentMeta({
    title: `${t('about.title')} — Refund`,
    description: blocks[0] ?? t('about.title'),
  });

  return (
    <PageRoot>
      <PageHero>
        <PageTitle>{t('about.title')}</PageTitle>
      </PageHero>
      <PageCard as="article">
        <PageBody>
          {blocks.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </PageBody>
      </PageCard>
      <PageBack to="/">{t('common.backToHome')}</PageBack>
    </PageRoot>
  );
}
