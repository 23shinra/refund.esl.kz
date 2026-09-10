import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { ADMIN_API } from '../../../features/admin/constants.js';
import {
  AlertBanner,
  BtnPrimary,
  Card,
  CardTitle,
  FormField,
  FormGrid,
  Input,
  Label,
  PageHeader,
  PageTitle,
} from '../adminStyles.js';

export function AdminCredentialsTab({ adminRequest, setError, setOk }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async () => {
    if (!currentPassword) { setLocalError('Введите текущий пароль'); return; }
    if (!newLogin && !newPassword) { setLocalError('Укажите новый логин или новый пароль'); return; }
    if (newPassword && newPassword !== confirmPassword) { setLocalError('Пароль и подтверждение не совпадают'); return; }

    setBusy(true);
    setLocalError('');
    try {
      const body = { currentPassword };
      if (newLogin.trim()) body.newLogin = newLogin.trim();
      if (newPassword) body.newPassword = newPassword;

      const res = await adminRequest('PATCH', ADMIN_API.CREDENTIALS, { json: body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setLocalError(data.error ?? `Ошибка ${res.status}`); return; }

      setOk('Учётные данные обновлены');
      setCurrentPassword('');
      setNewLogin('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setLocalError('Сеть недоступна');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader>
        <PageTitle>Учётная запись</PageTitle>
      </PageHeader>

      {localError ? <AlertBanner $type="error">{localError}</AlertBanner> : null}

      <Card style={{ maxWidth: 480 }}>
        <CardTitle>🔐 Смена логина / пароля</CardTitle>

        <FormField style={{ marginBottom: 16 }}>
          <Label htmlFor="cred-current">Текущий пароль *</Label>
          <Input
            id="cred-current"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
        </FormField>

        <FormGrid $cols={2} style={{ marginBottom: 16 }}>
          <FormField>
            <Label htmlFor="cred-new-login">Новый логин (опционально)</Label>
            <Input
              id="cred-new-login"
              autoComplete="username"
              value={newLogin}
              onChange={(e) => setNewLogin(e.target.value)}
              placeholder="admin"
            />
          </FormField>
        </FormGrid>

        <FormGrid $cols={2} style={{ marginBottom: 20 }}>
          <FormField>
            <Label htmlFor="cred-new-pass">Новый пароль</Label>
            <Input
              id="cred-new-pass"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Мин. 8 символов"
            />
          </FormField>
          <FormField>
            <Label htmlFor="cred-confirm">Подтверждение</Label>
            <Input
              id="cred-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </FormField>
        </FormGrid>

        <BtnPrimary type="button" onClick={handleSubmit} disabled={busy}>
          {busy ? 'Сохранение…' : 'Сохранить изменения'}
        </BtnPrimary>
      </Card>
    </div>
  );
}

AdminCredentialsTab.propTypes = {
  adminRequest: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  setOk: PropTypes.func.isRequired,
};
