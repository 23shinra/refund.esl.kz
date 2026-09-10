import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { ADMIN_API } from '../../../features/admin/constants.js';
import {
  adm,
  AlertBanner,
  Badge,
  BtnDanger,
  BtnEdit,
  BtnPrimary,
  BtnSecondary,
  Card,
  CardTitle,
  EmptyState,
  FormField,
  FormGrid,
  Input,
  Label,
  PageHeader,
  PageTitle,
  Select,
  Table,
  TableActions,
  TableWrap,
  Textarea,
} from '../adminStyles.js';

function CategoryForm({ tree, initial, onSave, onCancel, busy }) {
  const [audienceId, setAudienceId] = useState(String(initial?.audience_id ?? tree.audiences[0]?.id ?? ''));
  const [code, setCode] = useState(initial?.code ?? '');
  const [titleRu, setTitleRu] = useState(initial?.title_ru ?? '');
  const [titleKz, setTitleKz] = useState(initial?.title_kz ?? '');
  const [descRu, setDescRu] = useState(initial?.description_ru ?? '');
  const [descKz, setDescKz] = useState(initial?.description_kz ?? '');
  const isEdit = Boolean(initial);

  const handleSubmit = () =>
    onSave({ audience_id: Number(audienceId), code, title_ru: titleRu, title_kz: titleKz, description_ru: descRu, description_kz: descKz });

  return (
    <Card style={{ border: `1.5px solid ${adm.primary}` }}>
      <CardTitle>{isEdit ? '✏️ Редактировать категорию' : '➕ Новая категория'}</CardTitle>
      <FormGrid $cols={2}>
        <FormField>
          <Label>Аудитория</Label>
          <Select value={audienceId} onChange={(e) => setAudienceId(e.target.value)}>
            {tree.audiences.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code === 'individual' ? 'Физические лица' : 'Юридические лица / Бизнес'}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField>
          <Label>Код (латиница, дефисы)</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ind-housing"
            disabled={isEdit}
          />
        </FormField>
      </FormGrid>
      <FormGrid $cols={2} style={{ marginTop: 12 }}>
        <FormField>
          <Label>Название RU</Label>
          <Input value={titleRu} onChange={(e) => setTitleRu(e.target.value)} />
        </FormField>
        <FormField>
          <Label>Название KZ</Label>
          <Input value={titleKz} onChange={(e) => setTitleKz(e.target.value)} />
        </FormField>
        <FormField>
          <Label>Описание RU</Label>
          <Textarea value={descRu} onChange={(e) => setDescRu(e.target.value)} style={{ minHeight: 60 }} />
        </FormField>
        <FormField>
          <Label>Описание KZ</Label>
          <Textarea value={descKz} onChange={(e) => setDescKz(e.target.value)} style={{ minHeight: 60 }} />
        </FormField>
      </FormGrid>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <BtnPrimary type="button" onClick={handleSubmit} disabled={busy}>
          {busy ? 'Сохранение…' : (isEdit ? 'Сохранить' : 'Создать')}
        </BtnPrimary>
        <BtnSecondary type="button" onClick={onCancel}>Отмена</BtnSecondary>
      </div>
    </Card>
  );
}

CategoryForm.propTypes = {
  tree: PropTypes.object.isRequired,
  initial: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  busy: PropTypes.bool,
};

export function AdminCategoriesTab({ tree, adminRequest, onReload, setError, setOk }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSave = async (data) => {
    setBusy(true);
    setLocalError('');
    try {
      const isEdit = Boolean(editItem);
      const url = isEdit ? ADMIN_API.categoryGroup(editItem.id) : ADMIN_API.categoryGroups;
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await adminRequest(method, url, { json: data });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setLocalError(j.error ?? `Ошибка ${res.status}`); return; }
      setOk(isEdit ? 'Категория обновлена' : 'Категория создана');
      setShowForm(false);
      setEditItem(null);
      await onReload();
    } catch {
      setLocalError('Сеть недоступна');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Удалить категорию «${name}»? Вместе с ней удалятся все услуги и вопросы.`)) return;
    setBusy(true);
    try {
      const res = await adminRequest('DELETE', ADMIN_API.categoryGroup(id));
      if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error ?? 'Ошибка'); return; }
      setOk('Категория удалена');
      await onReload();
    } catch {
      setError('Сеть недоступна');
    } finally {
      setBusy(false);
    }
  };

  const audiences = tree.audiences ?? [];
  const groups = tree.category_groups ?? [];

  return (
    <div>
      <PageHeader>
        <PageTitle>Категории ({groups.length})</PageTitle>
        <BtnPrimary type="button" onClick={() => { setShowForm(true); setEditItem(null); }}>
          + Добавить категорию
        </BtnPrimary>
      </PageHeader>

      {localError ? <AlertBanner $type="error">{localError}</AlertBanner> : null}

      {(showForm && !editItem) && (
        <CategoryForm tree={tree} onSave={handleSave} onCancel={() => setShowForm(false)} busy={busy} />
      )}
      {editItem && (
        <CategoryForm tree={tree} initial={editItem} onSave={handleSave} onCancel={() => setEditItem(null)} busy={busy} />
      )}

      {groups.length > 0 ? (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Категория</th>
                <th>Аудитория</th>
                <th>Код</th>
                <th style={{ width: 130 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                const aud = audiences.find((a) => a.id === g.audience_id);
                const isIndividual = aud?.code === 'individual';
                return (
                  <tr key={g.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{g.title_ru}</div>
                      <div style={{ fontSize: 12, color: adm.muted }}>{g.title_kz}</div>
                    </td>
                    <td>
                      <Badge $variant={isIndividual ? 'blue' : 'amber'}>
                        {isIndividual ? 'Физлица' : 'Бизнес'}
                      </Badge>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, color: adm.muted }}>{g.code}</code>
                    </td>
                    <td>
                      <TableActions>
                        <BtnEdit type="button" onClick={() => { setEditItem(g); setShowForm(false); }}>✏</BtnEdit>
                        <BtnDanger type="button" onClick={() => handleDelete(g.id, g.title_ru)} disabled={busy}>🗑</BtnDanger>
                      </TableActions>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      ) : (
        <EmptyState>Категорий нет. Нажмите «Добавить категорию».</EmptyState>
      )}
    </div>
  );
}

AdminCategoriesTab.propTypes = {
  tree: PropTypes.object.isRequired,
  adminRequest: PropTypes.func.isRequired,
  onReload: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  setOk: PropTypes.func.isRequired,
};
