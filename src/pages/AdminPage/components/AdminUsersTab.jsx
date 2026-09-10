import React from 'react';
import PropTypes from 'prop-types';

import {
  adm,
  Badge,
  BtnEdit,
  EmptyState,
  PageHeader,
  PageTitle,
  Select,
  Table,
  TableActions,
  TableWrap,
} from '../adminStyles.js';

const ROLE_LABELS = { admin: 'Админ', partner: 'Партнёр', client: 'Клиент' };
const ROLE_VARIANTS = { admin: 'red', partner: 'green', client: 'default' };
const ALL_ROLES = ['client', 'partner', 'admin'];

export function AdminUsersTab({ users, loading, pending, onUpdateRole }) {
  if (loading && !users.length) return <EmptyState>Загрузка…</EmptyState>;

  return (
    <div>
      <PageHeader>
        <PageTitle>Пользователи ({users.length})</PageTitle>
      </PageHeader>

      {users.length > 0 ? (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Телефон</th>
                <th>Роль</th>
                <th>Зарегистрирован</th>
                <th style={{ width: 160 }}>Изменить роль</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ color: adm.muted, fontSize: 12 }}>{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.phone}</td>
                  <td>
                    <Badge $variant={ROLE_VARIANTS[u.role] ?? 'default'}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </Badge>
                  </td>
                  <td style={{ fontSize: 12, color: adm.muted }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('ru') : '—'}
                  </td>
                  <td>
                    <TableActions>
                      <Select
                        value={u.role}
                        onChange={(e) => onUpdateRole(u.id, e.target.value)}
                        disabled={pending[u.id]}
                        style={{ fontSize: 12, padding: '6px 8px' }}
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </Select>
                    </TableActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      ) : (
        <EmptyState>Нет зарегистрированных пользователей.</EmptyState>
      )}
    </div>
  );
}

AdminUsersTab.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  pending: PropTypes.object.isRequired,
  onUpdateRole: PropTypes.func.isRequired,
};
