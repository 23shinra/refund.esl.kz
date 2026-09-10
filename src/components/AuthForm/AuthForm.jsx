import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useI18n } from '../../utils/i18n.jsx';

/** Демо: принимается только этот код (без реальной SMS). */
export const DEMO_SMS_CODE = '123456';

const StyledBody = styled.form`
  display: grid;
  gap: 12px;
  margin-top: 4px;
`;

const StyledField = styled.label`
  display: grid;
  gap: 6px;
`;

const StyledLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.82);
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: ${({ $code }) => ($code ? '0.2em' : 'normal')};
  font-variant-numeric: tabular-nums;
  transition: border-color 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 220ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &::placeholder {
    color: #000000;
    opacity: 1;
    letter-spacing: normal;
  }

  &:hover {
    border-color: rgba(37, 99, 235, 0.35);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.1);
  }
`;

const StyledHint = styled.p`
  margin: 0;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.2);
  font-size: 13px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledError = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.danger};
`;

const StyledRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`;

const StyledPrimary = styled.button.attrs({ type: 'submit' })`
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid rgba(37, 99, 235, 0.35);
  background: rgba(37, 99, 235, 0.12);
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 600;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 240ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: rgba(37, 99, 235, 0.45);
    background: rgba(37, 99, 235, 0.18);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StyledGhost = styled.button.attrs({ type: 'button' })`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 14px;

  &:hover {
    border-color: rgba(37, 99, 235, 0.35);
    background: rgba(37, 99, 235, 0.06);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export function AuthForm({ onSuccess }) {
  const { t } = useI18n();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const phoneDigits = phone.replace(/\D/g, '');
  const phoneOk = phoneDigits.length >= 10;

  const handleSendCode = (e) => {
    e.preventDefault();
    setError('');
    if (!phoneOk) {
      setError(t('auth.enterPhone'));
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setStep('code');
      setCode('');
    }, 400);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');
    const trimmed = code.trim();
    if (trimmed !== DEMO_SMS_CODE) {
      setError(t('auth.wrongCode'));
      return;
    }
    onSuccess?.(phone.trim());
  };

  if (step === 'code') {
    return (
      <StyledBody onSubmit={handleVerify}>
        <StyledHint>{t('auth.demoHint')}</StyledHint>
        <StyledField>
          <StyledLabel>{t('auth.smsCode')}</StyledLabel>
          <StyledInput
            $code
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder={DEMO_SMS_CODE}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
          />
        </StyledField>
        {error ? <StyledError>{error}</StyledError> : null}
        <StyledRow>
          <StyledPrimary type="submit">{t('auth.submitLogin')}</StyledPrimary>
          <StyledGhost
            type="button"
            onClick={() => {
              setStep('phone');
              setError('');
              setCode('');
            }}
          >
            {t('auth.changePhone')}
          </StyledGhost>
        </StyledRow>
      </StyledBody>
    );
  }

  return (
    <StyledBody onSubmit={handleSendCode}>
      <StyledField>
        <StyledLabel>{t('auth.phone')}</StyledLabel>
        <StyledInput
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('auth.phonePlaceholder')}
          inputMode="tel"
          autoComplete="tel"
          autoFocus
        />
      </StyledField>
      {error ? <StyledError>{error}</StyledError> : null}
      <StyledPrimary type="submit" disabled={sending}>
        {sending ? t('auth.sendingCode') : t('auth.sendCode')}
      </StyledPrimary>
    </StyledBody>
  );
}

AuthForm.propTypes = {
  /** @param {string} phone */
  onSuccess: PropTypes.func,
};

AuthForm.defaultProps = {
  onSuccess: undefined,
};
