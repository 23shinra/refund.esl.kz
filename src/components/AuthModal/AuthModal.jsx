import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useI18n } from '../../utils/i18n.jsx';

const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(246, 249, 255, 0.40);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  padding: 18px;
`;

const StyledDialog = styled.div`
  width: 100%;
  max-width: 520px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow.md};
  overflow: hidden;
  transform: translateY(0);
`;

const StyledTop = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const StyledTopTitle = styled.div`
  grid-column: 2;
  justify-self: center;
  font-weight: 800;
  letter-spacing: -0.2px;
`;

const StyledClose = styled.button.attrs({ type: 'button' })`
  grid-column: 3;
  justify-self: end;
  width: 34px;
  height: 34px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.70);
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    color 240ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: rgba(37, 99, 235, 0.35);
    background: rgba(37, 99, 235, 0.10);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StyledBody = styled.div`
  padding: 14px;
`;

export function AuthModal({ open, onClose, title, children }) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <StyledOverlay
      role="dialog"
      aria-modal="true"
      aria-label="Авторизация"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <StyledDialog>
        <StyledTop>
          <StyledTopTitle>{title}</StyledTopTitle>
          <StyledClose onClick={onClose} aria-label={t('common.close')}>
            ×
          </StyledClose>
        </StyledTop>
        <StyledBody>{children}</StyledBody>
      </StyledDialog>
    </StyledOverlay>
  );
}

AuthModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

