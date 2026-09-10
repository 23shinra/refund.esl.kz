import React, { useEffect, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { PageRoot } from '../../components/PageLayout/PageLayout.jsx';
import { getAudiences, getCategoryGroupsByAudience, getSubcategoryById } from '../../utils/benefitsRepository.js';
import { useDocumentMeta } from '../../utils/documentMeta.js';
import { useI18n } from '../../utils/i18n.jsx';
import { readOnboardingProfile } from '../../utils/onboardingProfile.js';

const StyledHero = styled.header`
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const StyledHeroText = styled.div`
  flex: 1 1 320px;
  min-width: 260px;
`;

const StyledHeroLogo = styled.img`
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  object-fit: contain;
  margin-top: 2px;
  user-select: none;
  -webkit-user-drag: none;
`;

const StyledHeroTitle = styled.h1`
  margin: 0 0 8px;
  font-size: clamp(22px, 4.5vw, 28px);
  font-weight: 700;
  letter-spacing: -0.4px;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledHeroSubtitle = styled.p`
  margin: 0;
  max-width: 520px;
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledAudienceCard = styled.section`
  margin-bottom: 28px;
  padding: 16px 16px 14px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
`;

const StyledAudienceLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 4px;
`;

const StyledAudienceQuestion = styled.h2`
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 650;
  letter-spacing: -0.2px;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledAudienceHint = styled.p`
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledTabList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;

  @media (min-width: 480px) {
    gap: 10px;
  }
`;

const StyledTab = styled.button.attrs({ type: 'button' })`
  position: relative;
  min-height: 52px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 2px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) => ($active ? 'rgba(37, 99, 235, 0.08)' : '#fff')};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;

  &:hover {
    border-color: rgba(37, 99, 235, 0.45);
    background: ${({ $active }) => ($active ? 'rgba(37, 99, 235, 0.11)' : 'rgba(37, 99, 235, 0.04)')};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  ${({ $active }) =>
    $active &&
    `
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.15);
    font-weight: 700;
  `}
`;

const StyledTabTitle = styled.span`
  font-size: 14px;
  line-height: 1.25;
  font-weight: inherit;

  @media (min-width: 400px) {
    font-size: 15px;
  }
`;

const StyledTabShort = styled.span`
  display: block;
  font-size: 12px;
  font-weight: 500;
  opacity: 0.85;

  @media (min-width: 520px) {
    display: none;
  }
`;

const StyledTabFull = styled.span`
  display: none;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.9;

  @media (min-width: 520px) {
    display: block;
  }
`;

const StyledSectionsHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const StyledSectionsTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.2px;
`;

const StyledSectionsMeta = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;

  @media (max-width: 520px) {
    white-space: normal;
    text-align: right;
  }
`;

const StyledPersonal = styled.section`
  margin-bottom: 32px;
  padding: 16px 16px 14px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid rgba(37, 99, 235, 0.22);
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.10), rgba(255, 255, 255, 0.88));
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
`;

const StyledPersonalTitle = styled.h2`
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.25px;
`;

const StyledPersonalHint = styled.p`
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledGroup = styled.section`
  margin-top: 20px;

  &:first-of-type {
    margin-top: 0;
  }
`;

const StyledGroupTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -0.15px;
`;

const StyledRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;
`;

const StyledPill = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.72);
  color: ${({ theme }) => theme.colors.text};
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;

  @media (max-width: 520px) {
    width: 100%;
  }

  &:hover {
    border-color: rgba(37, 99, 235, 0.35);
    background: rgba(37, 99, 235, 0.1);
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadow.md};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StyledPillTitle = styled.span`
  font-weight: 650;
  min-width: 0;
  overflow-wrap: anywhere;
`;

const StyledPillMeta = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
`;

const StyledFeatured = styled(Link)`
  display: block;
  margin: 0 0 20px;
  padding: 16px 16px 14px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid rgba(37, 99, 235, 0.28);
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #ecfeff 100%);
  text-decoration: none;
  color: inherit;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.08);
  transition: transform 220ms ease, box-shadow 220ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.14);
  }
`;

const StyledFeaturedBadge = styled.div`
  display: inline-block;
  margin-bottom: 8px;
  padding: 4px 9px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: rgba(37, 99, 235, 0.12);
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 650;
`;

const StyledFeaturedTitle = styled.h2`
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -0.25px;
`;

const StyledFeaturedText = styled.p`
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledFeaturedCta = styled.span`
  font-size: 14px;
  font-weight: 650;
  color: ${({ theme }) => theme.colors.primary};
`;

export function HomePage() {
  const { t, tl } = useI18n();
  const audiences = getAudiences();
  const panelId = useId();
  const [audience, setAudience] = useState('individual');

  useDocumentMeta({
    title: `${t('home.heroTitle')} — Refund`,
    description: t('home.subtitle'),
  });

  const groups = useMemo(() => getCategoryGroupsByAudience(audience), [audience]);

  const subCount = useMemo(() => groups.reduce((n, g) => n + (g.subcategories?.length ?? 0), 0), [groups]);

  const [recommended, setRecommended] = useState(() => {
    const profile = readOnboardingProfile();
    const ids = Array.isArray(profile?.recommended) ? profile.recommended : [];
    return ids.filter((x) => typeof x === 'string' && x.trim());
  });

  useEffect(() => {
    const refresh = () => {
      const profile = readOnboardingProfile();
      const ids = Array.isArray(profile?.recommended) ? profile.recommended : [];
      setRecommended(ids.filter((x) => typeof x === 'string' && x.trim()));
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('qoldau:onboarding-updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('qoldau:onboarding-updated', refresh);
    };
  }, []);

  const audienceLabel =
    audience === 'individual' ? t('home.individuals') : t('home.legal');

  return (
    <PageRoot>
      <StyledHero>
        <StyledHeroText>
          <StyledHeroTitle>{t('home.heroTitle')}</StyledHeroTitle>
          <StyledHeroSubtitle>{t('home.subtitle')}</StyledHeroSubtitle>
        </StyledHeroText>
        <StyledHeroLogo src="/qoldau-logo.png" alt="Refund" />
      </StyledHero>

      <StyledAudienceCard aria-labelledby={`${panelId}-legend`}>
        <StyledAudienceLabel id={`${panelId}-legend`}>{t('home.audience')}</StyledAudienceLabel>
        <StyledAudienceQuestion>{t('home.audiencePrompt')}</StyledAudienceQuestion>
        <StyledAudienceHint>{t('home.audienceHint')}</StyledAudienceHint>

        <StyledTabList role="tablist" aria-label={t('home.audience')}>
          {audiences.map((a) => {
            const active = audience === a.id;
            const isInd = a.id === 'individual';
            return (
              <StyledTab
                key={a.id}
                role="tab"
                id={`tab-${a.id}`}
                aria-selected={active}
                aria-controls={`${panelId}-panel`}
                tabIndex={active ? 0 : -1}
                $active={active}
                onClick={() => setAudience(a.id)}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                  e.preventDefault();
                  const next = isInd ? 'legal' : 'individual';
                  setAudience(next);
                  document.getElementById(`tab-${next}`)?.focus();
                }}
              >
                <StyledTabTitle>
                  <StyledTabShort>{isInd ? t('home.individualsShort') : t('home.legalShort')}</StyledTabShort>
                  <StyledTabFull>{isInd ? t('home.individuals') : t('home.legal')}</StyledTabFull>
                </StyledTabTitle>
              </StyledTab>
            );
          })}
        </StyledTabList>
      </StyledAudienceCard>

      {audience === 'individual' ? (
        <StyledFeatured
          to="/category/ind-family-birth-allowance/question/ind-family-birth-allowance-1"
          aria-label={t('home.featuredTitle')}
        >
          <StyledFeaturedBadge>{t('home.featuredBadge')}</StyledFeaturedBadge>
          <StyledFeaturedTitle>{t('home.featuredTitle')}</StyledFeaturedTitle>
          <StyledFeaturedText>{t('home.featuredText')}</StyledFeaturedText>
          <StyledFeaturedCta>{t('home.featuredCta')} →</StyledFeaturedCta>
        </StyledFeatured>
      ) : null}

      {recommended.length ? (
        <StyledPersonal aria-label="Подобрано специально для вас">
          <StyledPersonalTitle>Подобрано специально для вас</StyledPersonalTitle>
          <StyledPersonalHint>
            На основе ваших ответов мы подняли наверх наиболее подходящие услуги.
          </StyledPersonalHint>
          <StyledRow>
            {recommended.slice(0, 10).map((id) => (
              <StyledPill key={id} to={`/category/${id}`}>
                <StyledPillTitle>{tl(getSubcategoryById(id)?.title) || id}</StyledPillTitle>
                <StyledPillMeta aria-hidden>→</StyledPillMeta>
              </StyledPill>
            ))}
          </StyledRow>
        </StyledPersonal>
      ) : null}

      <StyledSectionsHead>
        <StyledSectionsTitle id={`${panelId}-heading`}>{t('home.sectionsTitle')}</StyledSectionsTitle>
        <StyledSectionsMeta>
          {audienceLabel} · {subCount}
        </StyledSectionsMeta>
      </StyledSectionsHead>

      <div
        id={`${panelId}-panel`}
        role="tabpanel"
        aria-labelledby={`tab-${audience}`}
        aria-live="polite"
      >
        {groups.map((g) => (
          <StyledGroup key={g.id}>
            <StyledGroupTitle>{tl(g.title)}</StyledGroupTitle>
            <StyledRow>
              {g.subcategories.map((s) => (
                <StyledPill key={s.id} to={`/category/${s.id}`}>
                  <StyledPillTitle>{tl(s.title)}</StyledPillTitle>
                  <StyledPillMeta aria-hidden>→</StyledPillMeta>
                </StyledPill>
              ))}
            </StyledRow>
          </StyledGroup>
        ))}
      </div>
    </PageRoot>
  );
}
