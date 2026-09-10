import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { useI18n } from '../../utils/i18n.jsx';
import { answerSummary } from '../../utils/answerSummary.js';

const StyledCard = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
  padding: 14px 14px 16px;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;

  &:hover {
    border-color: rgba(96, 165, 250, 0.4);
    box-shadow: ${({ theme }) => theme.shadow.md};
    transform: translateY(-1px);
  }
`;

const StyledQuestion = styled.h3`
  margin: 0 0 10px;
  font-size: 16px;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledSummary = styled.p`
  margin: 0 0 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  line-height: 1.5;
`;

const StyledMoreLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 9px 14px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid rgba(37, 99, 235, 0.35);
  background: rgba(37, 99, 235, 0.12);
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 240ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
    background: rgba(37, 99, 235, 0.18);
    border-color: rgba(37, 99, 235, 0.5);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const QuestionItem = memo(function QuestionItem({ item, subcategoryCode, searchQuery }) {
  const { t, tl, language } = useI18n();

  const summary = answerSummary(item.answer, language);
  const q = String(searchQuery ?? '').trim();
  const detailTo = {
    pathname: `/category/${subcategoryCode}/question/${item.id}`,
    search: q ? `?q=${encodeURIComponent(q)}` : '',
  };
  const detailState = { searchQuery: q };

  return (
    <StyledCard>
      <StyledQuestion>{tl(item.question)}</StyledQuestion>
      {summary ? <StyledSummary>{summary}</StyledSummary> : null}
      <StyledMoreLink to={detailTo} state={detailState}>
        {t('question.moreDetails')}
      </StyledMoreLink>
    </StyledCard>
  );
});

QuestionItem.propTypes = {
  subcategoryCode: PropTypes.string.isRequired,
  searchQuery: PropTypes.string,
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    question: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ ru: PropTypes.string, kz: PropTypes.string }),
    ]).isRequired,
    answer: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ ru: PropTypes.string, kz: PropTypes.string })]),
    tags: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ ru: PropTypes.string, kz: PropTypes.string })])),
  }).isRequired,
};

QuestionItem.defaultProps = {
  searchQuery: '',
};
