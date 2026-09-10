import React from 'react';
import PropTypes from 'prop-types';

import { PageCard, PageCardTitle } from '../../../components/PageLayout/PageLayout.jsx';
import { StyledGrid, StyledMeta, StyledRow } from '../partnerStyles.js';

export function PartnerServicesSection({ title, limitLabel, items, busy, maxServices, linkedCount, onToggle }) {
  return (
    <PageCard>
      <PageCardTitle>{title}</PageCardTitle>
      <StyledMeta as="div" style={{ display: 'block', marginBottom: 12 }}>
        {limitLabel}
      </StyledMeta>
      <StyledGrid>
        {(items ?? []).map((item) => (
          <StyledRow key={item.id}>
            <input
              type="checkbox"
              checked={item.linked}
              disabled={
                busy[item.id] || (!item.linked && linkedCount >= maxServices)
              }
              onChange={() => onToggle(item.id, item.linked)}
              aria-label={`${item.title_ru} — ${item.group_title_ru}`}
            />
            <span>
              <strong>{item.title_ru}</strong>
              <StyledMeta as="div">
                {item.group_title_ru} · {item.code}
              </StyledMeta>
            </span>
          </StyledRow>
        ))}
      </StyledGrid>
    </PageCard>
  );
}

PartnerServicesSection.propTypes = {
  title: PropTypes.string.isRequired,
  limitLabel: PropTypes.string.isRequired,
  items: PropTypes.array,
  busy: PropTypes.object.isRequired,
  maxServices: PropTypes.number.isRequired,
  linkedCount: PropTypes.number.isRequired,
  onToggle: PropTypes.func.isRequired,
};
