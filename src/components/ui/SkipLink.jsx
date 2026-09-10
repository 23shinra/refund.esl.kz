import React from 'react';
import styled from 'styled-components';

const Link = styled.a`
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 10000;
  padding: 12px 20px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 600;
  border-radius: 0 0 8px 8px;
  text-decoration: none;

  &:focus {
    left: 12px;
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
`;

/** Переход к основному контенту (клавиатура / screen readers). */
export function SkipLink({ targetId = 'main-content', label = 'К основному содержимому' }) {
  return (
    <Link href={`#${targetId}`}>
      {label}
    </Link>
  );
}
