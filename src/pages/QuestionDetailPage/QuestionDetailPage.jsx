import React from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { PageCard, PageRoot } from '../../components/PageLayout/PageLayout.jsx';
import { HelperContacts } from '../../components/HelperContacts/HelperContacts.jsx';
import { BenefitDetailView } from '../../components/BenefitDetailView/BenefitDetailView.jsx';
import { realBenefitPages } from '../../data/realBenefitPages.js';
import { getQuestionBySubcategoryAndId, getSubcategoryById } from '../../utils/benefitsRepository.js';
import { useDocumentMeta } from '../../utils/documentMeta.js';
import { useI18n } from '../../utils/i18n.jsx';

const visuallyHidden = `
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin: 8px 0 18px;
  flex-wrap: wrap;
`;

const StyledBack = styled(Link)`
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.72);
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
  text-decoration: none;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    color 240ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: rgba(37, 99, 235, 0.35);
    background: rgba(37, 99, 235, 0.1);
    transform: translateY(-1px);
  }
`;

const StyledTitle = styled.h1`
  margin: 0 0 8px;
  font-size: 22px;
  line-height: 1.3;
  letter-spacing: -0.3px;
`;

const StyledMeta = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
`;

const StyledSectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 10px;
`;

const StyledBody = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: pre-line;
  line-height: 1.55;
  font-size: 15px;
`;

const StyledTags = styled.div`
  ${visuallyHidden}
`;

const StyledTag = styled.span`
  margin-right: 8px;
`;

const StyledEmpty = styled.div`
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 20px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StyledContactsWrap = styled.section`
  margin-top: 14px;
`;

export function QuestionDetailPage() {
  const { t, tl } = useI18n();
  const { categoryId, questionId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchQueryFromUrl = searchParams.get('q') ?? '';
  const stateQuery = location.state?.searchQuery;
  const searchQuery = typeof stateQuery === 'string' ? stateQuery : searchQueryFromUrl;

  const subcategory = categoryId ? getSubcategoryById(categoryId) : null;
  const item = categoryId && questionId ? getQuestionBySubcategoryAndId(categoryId, questionId) : null;

  const metaTitle = item ? `${tl(item.question)} — Refund` : t('category.notFoundTitle');
  const metaAnswer = item?.answer ? tl(item.answer) : '';
  const metaDescription = item
    ? (metaAnswer ? String(metaAnswer).split('\n')[0].slice(0, 160) : t('question.noAnswer'))
    : t('category.notFoundDesc');

  useDocumentMeta({ title: metaTitle, description: metaDescription });

  const listHref =
    searchQuery !== ''
      ? `/category/${categoryId}?q=${encodeURIComponent(searchQuery)}`
      : `/category/${categoryId}`;

  if (!subcategory || !item) {
    return (
      <PageRoot>
        <StyledHeader>
          <StyledBack to={categoryId ? listHref : '/'}>{t('question.backToList')}</StyledBack>
        </StyledHeader>
        <StyledEmpty>{t('category.notFoundDesc')}</StyledEmpty>
      </PageRoot>
    );
  }

  const answerText = (item.answer ? tl(item.answer) : '') || t('question.noAnswer');
  const realPage = realBenefitPages[questionId] ?? null;

  return (
    <PageRoot>
      <StyledHeader>
        <div>
          <StyledTitle>{tl(item.question)}</StyledTitle>
          <StyledMeta>
            {subcategory.group?.title ? `${tl(subcategory.group.title)} • ` : null}
            {tl(subcategory.title)}
          </StyledMeta>
        </div>
        <StyledBack to={listHref}>{t('question.backToList')}</StyledBack>
      </StyledHeader>

      <PageCard as="article">
        <StyledSectionLabel>{t('question.fullInfo')}</StyledSectionLabel>
        {realPage ? (
          <BenefitDetailView
            page={realPage}
            tl={tl}
            labels={{
              howToGet: t('question.howToGet'),
              documents: t('question.documents'),
            }}
          />
        ) : (
          <StyledBody>{answerText}</StyledBody>
        )}

        {item.tags?.length ? (
          <StyledTags aria-label={t('question.tags')}>
            {(item.tags ?? []).map((tag, i) => (
              <StyledTag key={i}>{tl(tag)}</StyledTag>
            ))}
          </StyledTags>
        ) : null}

        <StyledContactsWrap>
          <StyledSectionLabel>{t('contacts.title')}</StyledSectionLabel>
          <HelperContacts subcategoryCode={categoryId} questionCode={questionId} />
        </StyledContactsWrap>
      </PageCard>
    </PageRoot>
  );
}
