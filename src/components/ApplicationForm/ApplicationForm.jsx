import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useI18n } from '../../utils/i18n.jsx';
import { getHelpersForCase } from '../../data/helpersData.js';

const StyledForm = styled.form`
  display: grid;
  gap: 10px;
`;

const StyledField = styled.label`
  display: grid;
  gap: 6px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.82);
  color: ${({ theme }) => theme.colors.text};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    box-shadow: 0 0 0 6px rgba(96, 165, 250, 0.12);
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 96px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.82);
  color: ${({ theme }) => theme.colors.text};
  resize: vertical;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    box-shadow: 0 0 0 6px rgba(96, 165, 250, 0.12);
  }
`;

const StyledRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
`;

const StyledHint = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

const StyledButton = styled.button.attrs({ type: 'button' })`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(37, 99, 235, 0.10);
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 240ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(37, 99, 235, 0.35);
    background: rgba(37, 99, 235, 0.14);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StyledStatus = styled.div`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.72);
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
`;

export function ApplicationForm({ subcategoryCode, questionCode, onDone }) {
  const { t, language } = useI18n();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | ok | error
  const [errorMsg, setErrorMsg] = useState('');
  const [touchedPhone, setTouchedPhone] = useState(false);

  const phoneDigits = useMemo(() => String(phone ?? '').replace(/[^\d]/g, ''), [phone]);
  const phoneValid = phoneDigits.length >= 10 && phoneDigits.length <= 15;

  const phoneErrorId = 'application-phone-error';
  const phoneError = touchedPhone && !phoneValid ? t('application.phoneInvalid') : '';

  const canSubmit = useMemo(() => phoneValid && status !== 'submitting', [phoneValid, status]);

  function buildWaLink(helperPhone, text) {
    const digits = String(helperPhone ?? '').replace(/[^\d]/g, '');
    const qs = new URLSearchParams();
    if (text) qs.set('text', text);
    return `https://wa.me/${digits}${qs.toString() ? `?${qs.toString()}` : ''}`;
  }

  async function onWhatsAppClick() {
    if (!canSubmit) return;
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subcategoryCode,
          questionCode,
          lang: language,
          name: name.trim() ? name.trim() : undefined,
          phone: phoneDigits,
          comment: comment.trim() ? comment.trim() : undefined,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || `HTTP ${res.status}`);
      setStatus('ok');

      const helper = getHelpersForCase(subcategoryCode, questionCode)[0];
      const waText = t('application.waPrefill', { subcategoryCode, questionCode });
      const url = buildWaLink(helper?.whatsapp, waText);
      window.open(url, '_blank', 'noreferrer');

      onDone?.();
    } catch (err) {
      setStatus('error');
      setErrorMsg(String(err?.message || err));
    }
  }

  return (
    <StyledForm onSubmit={(e) => e.preventDefault()}>
      <StyledField>
        {t('application.name')}
        <StyledInput value={name} onChange={(e) => setName(e.target.value)} placeholder={t('application.namePlaceholder')} />
      </StyledField>

      <StyledField>
        {t('application.phone')}
        <StyledInput
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setTouchedPhone(true)}
          placeholder={t('application.phonePlaceholder')}
          aria-invalid={!!phoneError}
          aria-describedby={phoneError ? phoneErrorId : undefined}
        />
      </StyledField>

      <StyledField>
        {t('application.comment')}
        <StyledTextarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('application.commentPlaceholder')} />
      </StyledField>

      {status === 'error' ? <StyledStatus>{t('application.error', { msg: errorMsg })}</StyledStatus> : null}
      {phoneError ? <StyledStatus id={phoneErrorId}>{phoneError}</StyledStatus> : null}

      <StyledRow>
        <StyledHint>{t('application.disclaimer')}</StyledHint>
        <StyledButton onClick={onWhatsAppClick} disabled={!canSubmit}>
          {status === 'submitting' ? t('application.sending') : t('application.openWhatsApp')}
        </StyledButton>
      </StyledRow>
    </StyledForm>
  );
}

ApplicationForm.propTypes = {
  subcategoryCode: PropTypes.string.isRequired,
  questionCode: PropTypes.string.isRequired,
  onDone: PropTypes.func,
};

