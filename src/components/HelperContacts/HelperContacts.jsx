import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useI18n } from '../../utils/i18n.jsx';
import { getHelpersForCase } from '../../data/helpersData.js';

const StyledWrap = styled.div`
  display: grid;
  gap: 12px;
`;

const StyledCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: rgba(255, 255, 255, 0.72);
  padding: 12px;
`;

const StyledTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: baseline;
`;

const StyledName = styled.div`
  font-weight: 650;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledPrice = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
`;

const StyledList = styled.ul`
  margin: 10px 0 0;
  padding-left: 18px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StyledActions = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
`;

const StyledWhatsApp = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(37, 99, 235, 0.10);
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 240ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(37, 99, 235, 0.35);
    background: rgba(37, 99, 235, 0.14);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

function buildWaLink(phone, text) {
  const digits = String(phone ?? '').replace(/[^\d]/g, '');
  const qs = new URLSearchParams();
  if (text) qs.set('text', text);
  return `https://wa.me/${digits}${qs.toString() ? `?${qs.toString()}` : ''}`;
}

export function HelperContacts({ subcategoryCode, questionCode }) {
  const { t, tl, language } = useI18n();
  const people = getHelpersForCase(subcategoryCode, questionCode);

  return (
    <StyledWrap>
      {people.map((p) => (
        <StyledCard key={p.id}>
          <StyledTop>
            <StyledName>{tl(p.name)}</StyledName>
            <StyledPrice>{t('contacts.price', { kzt: p.priceKzt })}</StyledPrice>
          </StyledTop>
          <StyledList>
            {(p.helpsWith?.[language] ?? p.helpsWith?.ru ?? []).map((x, idx) => (
              <li key={idx}>{x}</li>
            ))}
          </StyledList>
          <StyledActions>
            <StyledWhatsApp
              href={buildWaLink(
                p.whatsapp,
                t('contacts.waPrefill', { helper: tl(p.name), subcategoryCode, questionCode }),
              )}
              target="_blank"
              rel="noreferrer"
            >
              {t('contacts.openWhatsApp')}
            </StyledWhatsApp>
          </StyledActions>
        </StyledCard>
      ))}
    </StyledWrap>
  );
}

HelperContacts.propTypes = {
  subcategoryCode: PropTypes.string.isRequired,
  questionCode: PropTypes.string.isRequired,
};

