import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { useI18n } from '../../utils/i18n.jsx';

const EMAIL = '4zz1m0v@gmail.com';
const PHONE = '87066697215';

const StyledFooter = styled.footer`
  margin-top: auto;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.55);
`;

const StyledInner = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth}px;
  margin: 0 auto;
  padding: 14px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const StyledTitle = styled.div`
  font-weight: 600;
  letter-spacing: -0.2px;
`;

const StyledLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
`;

const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  transition: color 220ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`;

const StyledRouterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  font-size: 13px;
  transition: color 220ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`;

export function Footer() {
  const { t } = useI18n();

  return (
    <StyledFooter>
      <StyledInner>
        <StyledTitle>{t('footer.contactTitle')}</StyledTitle>
        <StyledLinks>
          <StyledRouterLink to="/about">{t('footer.aboutLink')}</StyledRouterLink>
          <StyledRouterLink to="/partners">{t('footer.partnersLink')}</StyledRouterLink>
          <StyledRouterLink to="/legal/terms">{t('footer.termsLink')}</StyledRouterLink>
          <StyledRouterLink to="/legal/offer">{t('footer.offerLink')}</StyledRouterLink>
          <StyledRouterLink to="/legal/privacy">{t('footer.privacyLink')}</StyledRouterLink>
          <span>
            {t('footer.email')}: <StyledLink href={`mailto:${EMAIL}`}>{EMAIL}</StyledLink>
          </span>
          <span>
            {t('footer.phone')}: <StyledLink href={`tel:${PHONE}`}>{PHONE}</StyledLink>
          </span>
        </StyledLinks>
      </StyledInner>
    </StyledFooter>
  );
}

