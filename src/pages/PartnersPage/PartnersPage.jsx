import React from 'react';
import styled from 'styled-components';

import {
  PageBack,
  PageCard,
  PageCardTitle,
  PageHero,
  PageLead,
  PageRoot,
  PageText,
  PageTitle,
} from '../../components/PageLayout/PageLayout.jsx';
import { useDocumentMeta } from '../../utils/documentMeta.js';
import { useI18n } from '../../utils/i18n.jsx';

const StyledPriceBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 14px;
  margin-bottom: 18px;
  padding: 16px 18px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(6, 182, 212, 0.08));
  border: 1px solid rgba(37, 99, 235, 0.22);
`;

const StyledPriceLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  width: 100%;
`;

const StyledPriceAmount = styled.span`
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledPricePeriod = styled.span`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StyledList = styled.ul`
  margin: 0 0 0 1.1em;
  padding: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.65;

  li {
    margin-bottom: 8px;
  }
`;

const StyledCta = styled.div`
  margin-top: 20px;
  padding: 16px 18px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(6, 182, 212, 0.06));
  border: 1px solid rgba(37, 99, 235, 0.2);
`;

const StyledCtaText = styled.p`
  margin: 0 0 12px;
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledMail = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(37, 99, 235, 0.14);
  border: 1px solid rgba(37, 99, 235, 0.35);
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  text-decoration: none;
  transition: transform 200ms ease, background 200ms ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(37, 99, 235, 0.2);
  }
`;

const PARTNER_EMAIL = '4zz1m0v@gmail.com';

export function PartnersPage() {
  const { t } = useI18n();

  const benefits = [
    t('partners.benefit1'),
    t('partners.benefit2'),
    t('partners.benefit3'),
    t('partners.benefit4'),
  ];

  useDocumentMeta({
    title: `${t('partners.title')} — Refund`,
    description: t('partners.lead'),
  });

  return (
    <PageRoot>
      <PageHero>
        <PageTitle>{t('partners.title')}</PageTitle>
        <PageLead>{t('partners.lead')}</PageLead>
      </PageHero>

      <PageCard>
        <PageCardTitle>{t('partners.subscriptionHeading')}</PageCardTitle>
        <StyledPriceBox>
          <StyledPriceLabel>{t('partners.priceLabel')}</StyledPriceLabel>
          <StyledPriceAmount>{t('partners.priceAmount')}</StyledPriceAmount>
          <StyledPricePeriod>{t('partners.pricePeriod')}</StyledPricePeriod>
        </StyledPriceBox>
        <PageText>{t('partners.subscriptionP1')}</PageText>
        <PageText>{t('partners.subscriptionP2')}</PageText>
        <PageText>{t('partners.subscriptionP3')}</PageText>
        <PageText>{t('partners.subscriptionP4')}</PageText>
      </PageCard>

      <PageCard>
        <PageCardTitle>{t('partners.joinHeading')}</PageCardTitle>
        <PageText>{t('partners.joinIntro')}</PageText>
        <StyledList>
          {benefits.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </StyledList>
        <PageText style={{ marginTop: 14 }}>{t('partners.joinOutro')}</PageText>
      </PageCard>

      <StyledCta>
        <StyledCtaText>{t('partners.cta')}</StyledCtaText>
        <StyledMail href={`mailto:${PARTNER_EMAIL}?subject=${encodeURIComponent(t('partners.mailSubject'))}`}>
          {PARTNER_EMAIL}
        </StyledMail>
      </StyledCta>

      <PageBack to="/">{t('common.backToHome')}</PageBack>
    </PageRoot>
  );
}
