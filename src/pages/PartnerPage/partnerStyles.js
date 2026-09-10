import styled from 'styled-components';

export const StyledGrid = styled.div`
  display: grid;
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
`;

export const StyledRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: rgba(37, 99, 235, 0.04);
  }

  input {
    margin-top: 3px;
  }
`;

export const StyledMeta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.85;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    text-align: left;
    padding: 8px 6px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    vertical-align: top;
  }

  th {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
`;

export const StyledSelect = styled.select`
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font: inherit;
  font-size: 12px;
`;

export const StyledStatRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 16px;
`;

export const StyledStat = styled.div`
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.15);
`;

export const StyledStatVal = styled.div`
  font-size: 22px;
  font-weight: 800;
`;

export const StyledStatLbl = styled.div`
  font-size: 12px;
  margin-top: 4px;
`;

export const StyledBars = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 120px;
  margin-top: 12px;
`;

export const StyledBar = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

export const StyledBarFill = styled.div`
  width: 100%;
  max-width: 36px;
  height: ${({ $h }) => $h}px;
  min-height: 4px;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.7), rgba(6, 182, 212, 0.5));
  border-radius: 6px 6px 0 0;
`;

export const StyledErr = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
  margin: 12px 0;
`;
