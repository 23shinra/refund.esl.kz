import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeProvider } from 'styled-components';

import { theme } from '../../../styles/theme.js';
import {
  adm,
  AlertBanner,
  BtnPrimary,
  FormField,
  Input,
  Label,
} from '../adminStyles.js';

const LoginShell = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${adm.sidebar};
  padding: 24px;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 18px;
  padding: 36px 32px 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
`;

const LoginBrand = styled.div`
  text-align: center;
  margin-bottom: 28px;
`;

const LoginLogo = styled.div`
  font-size: 32px;
  font-weight: 900;
  color: ${adm.primary};
  letter-spacing: -1px;
`;

const LoginSub = styled.div`
  font-size: 13px;
  color: ${adm.muted};
  margin-top: 4px;
`;

const LoginTitle = styled.h1`
  margin: 0 0 24px;
  font-size: 20px;
  font-weight: 700;
  color: ${adm.text};
`;

export function AdminLoginForm({ onLogin, busy, error }) {
  const [loginVal, setLoginVal] = useState('');
  const [passwordVal, setPasswordVal] = useState('');

  const submit = async () => {
    const ok = await onLogin(loginVal, passwordVal);
    if (ok) setPasswordVal('');
  };

  return (
    <ThemeProvider theme={theme}>
      <LoginShell>
        <LoginCard>
          <LoginBrand>
            <LoginLogo>Refund</LoginLogo>
            <LoginSub>Панель управления</LoginSub>
          </LoginBrand>

          <LoginTitle>Вход в систему</LoginTitle>

          {error ? (
            <AlertBanner $type="error" role="alert" style={{ marginBottom: 20 }}>
              {error}
            </AlertBanner>
          ) : null}

          <FormField style={{ marginBottom: 16 }}>
            <Label htmlFor="adm-login">Логин</Label>
            <Input
              id="adm-login"
              name="username"
              autoComplete="username"
              value={loginVal}
              onChange={(e) => setLoginVal(e.target.value)}
              placeholder="admin"
            />
          </FormField>

          <FormField style={{ marginBottom: 24 }}>
            <Label htmlFor="adm-pass">Пароль</Label>
            <Input
              id="adm-pass"
              name="password"
              type="password"
              autoComplete="current-password"
              value={passwordVal}
              onChange={(e) => setPasswordVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="••••••••"
            />
          </FormField>

          <BtnPrimary
            type="button"
            onClick={submit}
            disabled={busy}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            {busy ? 'Вход…' : 'Войти'}
          </BtnPrimary>
        </LoginCard>
      </LoginShell>
    </ThemeProvider>
  );
}

AdminLoginForm.propTypes = {
  onLogin: PropTypes.func.isRequired,
  busy: PropTypes.bool,
  error: PropTypes.string,
};
