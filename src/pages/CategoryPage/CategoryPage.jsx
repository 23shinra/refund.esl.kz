import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { PageRoot } from '../../components/PageLayout/PageLayout.jsx';
import { QuestionList } from '../../components/QuestionList/QuestionList.jsx';
import { getSubcategoryById, searchQuestions } from '../../utils/benefitsRepository.js';
import { useDocumentMeta } from '../../utils/documentMeta.js';
import { useI18n } from '../../utils/i18n.jsx';

const StyledHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin: 8px 0 14px;
  flex-wrap: wrap;
`;

const StyledTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  letter-spacing: -0.3px;
`;

const StyledDesc = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StyledBack = styled(Link)`
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.72);
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
  max-width: 100%;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    color 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: rgba(37, 99, 235, 0.35);
    background: rgba(37, 99, 235, 0.10);
    transform: translateY(-1px);
  }
`;

const StyledControls = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin: 0 0 12px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.82);
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 220ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &::placeholder {
    color: #000000;
    opacity: 1;
  }

  &:hover {
    border-color: rgba(96, 165, 250, 0.40);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    box-shadow: 0 0 0 6px rgba(96, 165, 250, 0.12);
  }
`;

const StyledMeta = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
`;

const StyledEmpty = styled.div`
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export function CategoryPage() {
  const { t, tl, language } = useI18n();
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const subcategory = getSubcategoryById(categoryId);
  const [query, setQuery] = useState('');

  useDocumentMeta({
    title: subcategory ? `${tl(subcategory.title)} — Refund` : t('category.notFoundTitle'),
    description: subcategory ? tl(subcategory.description) : t('category.notFoundDesc'),
  });

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [categoryId, searchParams]);

  const filtered = useMemo(() => {
    if (!subcategory) return [];
    return searchQuestions(subcategory.id, query, language);
  }, [subcategory, query, language]);

  if (!subcategory) {
    return (
      <PageRoot>
        <StyledHeader>
          <div>
            <StyledTitle>{t('category.notFoundTitle')}</StyledTitle>
            <StyledDesc>{t('category.notFoundDesc')}</StyledDesc>
          </div>
          <StyledBack to="/">{t('common.backToHome')}</StyledBack>
        </StyledHeader>
      </PageRoot>
    );
  }

  return (
    <PageRoot>
      <StyledHeader>
        <div>
          <StyledTitle>{tl(subcategory.title)}</StyledTitle>
          <StyledDesc>
            {subcategory.group?.title ? `${tl(subcategory.group.title)} • ` : null}
            {tl(subcategory.description)}
          </StyledDesc>
        </div>
        <StyledBack to="/">{t('common.categoriesBack')}</StyledBack>
      </StyledHeader>

      <StyledControls>
        <StyledInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('common.searchPlaceholder')}
          aria-label={t('common.search')}
        />
        <StyledMeta>
          {t('common.shownOf', { shown: filtered.length, total: subcategory.questions.length })}
        </StyledMeta>
      </StyledControls>

      {filtered.length ? (
        <QuestionList items={filtered} subcategoryCode={subcategory.id} searchQuery={query} />
      ) : (
        <StyledEmpty>{t('common.nothingFound')}</StyledEmpty>
      )}
    </PageRoot>
  );
}

