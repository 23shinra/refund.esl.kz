import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledLead = styled.p`
  margin: 0 0 18px;
  font-size: 16px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledBadge = styled.span`
  display: inline-block;
  margin-bottom: 12px;
  padding: 5px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.22);
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.02em;
`;

const StyledAmounts = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin: 0 0 18px;

  @media (min-width: 560px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const StyledAmountCard = styled.div`
  padding: 14px 14px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: linear-gradient(160deg, #ffffff 0%, #eef5ff 100%);
`;

const StyledAmountLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 6px;
`;

const StyledAmountValue = styled.div`
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.15;
`;

const StyledAmountHint = styled.div`
  margin-top: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StyledFacts = styled.div`
  display: grid;
  gap: 10px;
  margin: 0 0 18px;
`;

const StyledFact = styled.div`
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.72);
`;

const StyledFactTitle = styled.div`
  font-size: 12px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 4px;
`;

const StyledFactText = styled.div`
  font-size: 14px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledSection = styled.section`
  margin: 0 0 18px;
`;

const StyledH2 = styled.h2`
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
`;

const StyledOl = styled.ol`
  margin: 0;
  padding-left: 1.25em;
  display: grid;
  gap: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledUl = styled.ul`
  margin: 0;
  padding-left: 1.25em;
  display: grid;
  gap: 6px;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledOfficial = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid rgba(37, 99, 235, 0.28);
  background: rgba(37, 99, 235, 0.08);
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: background 200ms ease, transform 200ms ease;

  &:hover {
    background: rgba(37, 99, 235, 0.14);
    transform: translateY(-1px);
  }
`;

const StyledDisclaimer = styled.p`
  margin: 0;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export function BenefitDetailView({ page, tl, labels }) {
  if (!page) return null;

  return (
    <div>
      {page.badge ? <StyledBadge>{tl(page.badge)}</StyledBadge> : null}
      {page.lead ? <StyledLead>{tl(page.lead)}</StyledLead> : null}

      {page.amounts?.length ? (
        <StyledAmounts>
          {page.amounts.map((a, i) => (
            <StyledAmountCard key={i}>
              <StyledAmountLabel>{tl(a.label)}</StyledAmountLabel>
              <StyledAmountValue>{tl(a.value)}</StyledAmountValue>
              {a.hint ? <StyledAmountHint>{tl(a.hint)}</StyledAmountHint> : null}
            </StyledAmountCard>
          ))}
        </StyledAmounts>
      ) : null}

      {page.facts?.length ? (
        <StyledFacts>
          {page.facts.map((f, i) => (
            <StyledFact key={i}>
              <StyledFactTitle>{tl(f.title)}</StyledFactTitle>
              <StyledFactText>{tl(f.text)}</StyledFactText>
            </StyledFact>
          ))}
        </StyledFacts>
      ) : null}

      {page.steps?.length ? (
        <StyledSection>
          <StyledH2>{labels.howToGet}</StyledH2>
          <StyledOl>
            {page.steps.map((s, i) => (
              <li key={i}>{tl(s)}</li>
            ))}
          </StyledOl>
        </StyledSection>
      ) : null}

      {page.documents?.length ? (
        <StyledSection>
          <StyledH2>{labels.documents}</StyledH2>
          <StyledUl>
            {page.documents.map((d, i) => (
              <li key={i}>{tl(d)}</li>
            ))}
          </StyledUl>
        </StyledSection>
      ) : null}

      {page.officialUrl ? (
        <StyledOfficial href={page.officialUrl} target="_blank" rel="noopener noreferrer">
          {page.officialLabel ? tl(page.officialLabel) : page.officialUrl}
          <span aria-hidden="true">↗</span>
        </StyledOfficial>
      ) : null}

      {page.disclaimer ? <StyledDisclaimer>{tl(page.disclaimer)}</StyledDisclaimer> : null}
    </div>
  );
}

BenefitDetailView.propTypes = {
  page: PropTypes.object,
  tl: PropTypes.func.isRequired,
  labels: PropTypes.shape({
    howToGet: PropTypes.string.isRequired,
    documents: PropTypes.string.isRequired,
  }).isRequired,
};
