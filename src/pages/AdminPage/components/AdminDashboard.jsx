import React from 'react';
import PropTypes from 'prop-types';

import {
  BtnPrimary,
  Card,
  CardTitle,
  EmptyState,
  PageHeader,
  PageTitle,
  StatCard,
  StatLabel,
  StatValue,
  StatsGrid,
  Table,
  TableWrap,
  Badge,
} from '../adminStyles.js';

const STAT_ITEMS = [
  { key: 'categories', label: 'Категорий', icon: '📂', section: 'categories' },
  { key: 'services', label: 'Услуг', icon: '🗂', section: 'services' },
  { key: 'questions', label: 'Льгот', icon: '❓', section: 'questions' },
  { key: 'partners', label: 'Партнёров', icon: '🤝', section: 'partners' },
  { key: 'users', label: 'Пользователей', icon: '👥', section: 'users' },
];

export function AdminDashboard({ stats, tree, loading, onNavigate }) {
  return (
    <div>
      <PageHeader>
        <PageTitle>Обзор</PageTitle>
      </PageHeader>

      <StatsGrid>
        {STAT_ITEMS.map(({ key, label, icon, section }) => (
          <StatCard
            key={key}
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate?.(section)}
            title={`Перейти: ${label}`}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
            <StatValue>{stats ? (stats[key] ?? '—') : '…'}</StatValue>
            <StatLabel>{label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      {tree && (
        <Card>
          <CardTitle>📂 Структура каталога</CardTitle>
          {tree.category_groups?.length ? (
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Категория</th>
                    <th>Аудитория</th>
                    <th>Услуг</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tree.category_groups.map((g) => {
                    const aud = tree.audiences?.find((a) => a.id === g.audience_id);
                    const subsCount = tree.subcategories?.filter((s) => s.group_id === g.id).length ?? 0;
                    return (
                      <tr key={g.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{g.title_ru}</div>
                          <div style={{ fontSize: 12, opacity: 0.6 }}>{g.code}</div>
                        </td>
                        <td>
                          <Badge $variant={aud?.code === 'individual' ? 'blue' : 'amber'}>
                            {aud?.code === 'individual' ? 'Физлица' : 'Бизнес'}
                          </Badge>
                        </td>
                        <td>
                          <Badge $variant="green">{subsCount}</Badge>
                        </td>
                        <td>
                          <BtnPrimary
                            type="button"
                            style={{ fontSize: 12, padding: '5px 12px' }}
                            onClick={() => onNavigate?.('services')}
                          >
                            Услуги
                          </BtnPrimary>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrap>
          ) : (
            <EmptyState>Категорий нет. Добавьте их во вкладке «Категории».</EmptyState>
          )}
        </Card>
      )}

      {loading && !tree && (
        <EmptyState>Загрузка данных…</EmptyState>
      )}
    </div>
  );
}

AdminDashboard.propTypes = {
  stats: PropTypes.object,
  tree: PropTypes.object,
  loading: PropTypes.bool,
  onNavigate: PropTypes.func,
};
