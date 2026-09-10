import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { QuestionItem } from '../QuestionItem/QuestionItem.jsx';

const StyledList = styled.div`
  display: grid;
  gap: 10px;
`;

export const QuestionList = memo(function QuestionList({ items, subcategoryCode, searchQuery }) {
  return (
    <StyledList>
      {items.map((q) => (
        <QuestionItem key={q.id} item={q} subcategoryCode={subcategoryCode} searchQuery={searchQuery} />
      ))}
    </StyledList>
  );
});

QuestionList.propTypes = {
  subcategoryCode: PropTypes.string.isRequired,
  searchQuery: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      question: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ ru: PropTypes.string, kz: PropTypes.string })])
        .isRequired,
      answer: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ ru: PropTypes.string, kz: PropTypes.string })]),
      tags: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ ru: PropTypes.string, kz: PropTypes.string })]),
      ),
    }),
  ).isRequired,
};

QuestionList.defaultProps = {
  searchQuery: '',
};

