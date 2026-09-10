import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

import {
  PageBack,
  PageCard,
  PageHero,
  PageProse,
  PageRoot,
  PageTitle,
} from '../../components/PageLayout/PageLayout.jsx';
import { useI18n } from '../../utils/i18n.jsx';
import { useDocumentMeta } from '../../utils/documentMeta.js';

const DOCS = ['terms', 'offer', 'privacy'];

function parseLegalContent(text) {
  const chunks = String(text).split(/\n{2,}/);
  const nodes = [];
  chunks.forEach((chunk, idx) => {
    const c = chunk.trim();
    if (!c) return;
    if (c.startsWith('## ')) {
      const nl = c.indexOf('\n');
      if (nl === -1) {
        nodes.push({ type: 'h2', key: idx, text: c.slice(3).trim() });
      } else {
        nodes.push({ type: 'h2', key: `${idx}-h`, text: c.slice(3, nl).trim() });
        const rest = c.slice(nl + 1).trim();
        if (rest.startsWith('- ')) {
          const items = rest.split('\n').map((l) => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
          nodes.push({ type: 'ul', key: `${idx}-u`, items });
        } else if (rest) {
          nodes.push({ type: 'p', key: `${idx}-p`, text: rest });
        }
      }
      return;
    }
    if (c.split('\n').every((l) => !l.trim() || l.trim().startsWith('-'))) {
      const items = c
        .split('\n')
        .map((l) => l.replace(/^\s*-\s*/, '').trim())
        .filter(Boolean);
      if (items.length) nodes.push({ type: 'ul', key: idx, items });
      return;
    }
    nodes.push({ type: 'p', key: idx, text: c });
  });
  return nodes;
}

export function LegalDocPage() {
  const { doc } = useParams();
  const { t } = useI18n();

  const isValidDoc = DOCS.includes(doc);
  const title = isValidDoc ? t(`legal.${doc}.title`) : t('notFound.title');
  useDocumentMeta({
    title: `${title} — Refund`,
    description: isValidDoc ? t(`legal.${doc}.title`) : t('notFound.text'),
  });

  if (!isValidDoc) return <Navigate to="/404" replace />;

  const nodes = parseLegalContent(t(`legal.${doc}.content`));

  return (
    <PageRoot>
      <PageHero>
        <PageTitle>{title}</PageTitle>
      </PageHero>
      <PageCard as="article">
        <PageProse>
          {nodes.map((n) => {
            if (n.type === 'h2') return <h2 key={n.key}>{n.text}</h2>;
            if (n.type === 'ul')
              return (
                <ul key={n.key}>
                  {n.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              );
            return <p key={n.key}>{n.text}</p>;
          })}
        </PageProse>
      </PageCard>
      <PageBack to="/">{t('common.backToHome')}</PageBack>
    </PageRoot>
  );
}
