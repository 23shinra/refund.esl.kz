import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  50% { opacity: 0.5; }
`;

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
  animation: ${pulse} 1.2s ease-in-out infinite;
`;

export function PageLoader({ message = 'Загрузка…' }) {
  return (
    <Wrap role="status" aria-live="polite">
      {message}
    </Wrap>
  );
}
