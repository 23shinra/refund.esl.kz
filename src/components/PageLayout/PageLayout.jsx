import { Link } from 'react-router-dom';
import styled from 'styled-components';

/** Корень страницы: полная ширина контейнера layout (как у /partners). */
export const PageRoot = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

export const PageHero = styled.div`
  margin-bottom: 22px;
`;

export const PageTitle = styled.h1`
  margin: 0 0 10px;
  font-size: 26px;
  letter-spacing: -0.4px;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.text};
`;

export const PageLead = styled.p`
  margin: 0;
  font-size: 17px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 640px;
`;

/** Карточка-секция (единый стиль с /partners). */
export const PageCard = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  padding: 20px 18px 22px;
  margin-bottom: 14px;
`;

export const PageCardTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;

export const PageText = styled.p`
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.6;
  white-space: pre-line;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const PageBody = styled.div`
  font-size: 15px;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.text};

  p {
    margin: 0 0 14px;
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const PageBack = styled(Link)`
  display: inline-block;
  margin-top: 18px;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  font-size: 14px;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: rgba(37, 99, 235, 0.35);
    background: rgba(37, 99, 235, 0.08);
  }
`;

export const PageProse = styled.div`
  font-size: 15px;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.text};

  h2 {
    margin: 22px 0 10px;
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};

    &:first-child {
      margin-top: 0;
    }
  }

  p {
    margin: 0 0 12px;
  }

  ul {
    margin: 0 0 14px;
    padding-left: 1.25em;
    line-height: 1.55;
  }
`;
