import React, { useMemo, useState } from 'react';
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
  Divider,
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

function ServiceForm({ tree, initial, onSave, onCancel, busy }) {
  const [groupId, setGroupId] = useState(String(initial?.group_id ?? tree.category_groups[0]?.id ?? ''));
  const [code, setCode] = useState(initial?.code ?? '');
  const [titleRu, setTitleRu] = useState(initial?.title_ru ?? '');
  const [titleKz, setTitleKz] = useState(initial?.title_kz ?? '');
  const [descRu, setDescRu] = useState(initial?.description_ru ?? '');
  const [descKz, setDescKz] = useState(initial?.description_kz ?? '');
  const isEdit = Boolean(initial);

  const handleSubmit = () => {
    onSave({
      group_id: Number(groupId),
      code,
      title_ru: titleRu,
      title_kz: titleKz,
      description_ru: descRu,
      description_kz: descKz,
      ...(isEdit ? {} : { add_placeholder_question: false }),
    });
  };

  return (
    <Card style={{ border: `1.5px solid ${adm.primary}` }}>
      <CardTitle>{isEdit ? '✏️ Редактировать услугу' : '➕ Новая услуга'}</CardTitle>

      <FormGrid $cols={2}>
        <FormField>
          <Label htmlFor="svc-group">Категория</Label>
          <Select
            id="svc-group"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            disabled={isEdit}
          >
            {tree.category_groups.map((g) => (
              <option key={g.id} value={g.id}>{g.title_ru}</option>
            ))}
          </Select>
        </FormField>
        <FormField>
          <Label htmlFor="svc-code">Код (латиница, дефисы)</Label>
          <Input
            id="svc-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ind-family-housing"
            disabled={isEdit}
          />
        </FormField>
      </FormGrid>

      <FormGrid $cols={2} style={{ marginTop: 12 }}>
        <FormField>
          <Label htmlFor="svc-title-ru">Название RU</Label>
          <Input id="svc-title-ru" value={titleRu} onChange={(e) => setTitleRu(e.target.value)} />
        </FormField>
        <FormField>
          <Label htmlFor="svc-title-kz">Название KZ</Label>
          <Input id="svc-title-kz" value={titleKz} onChange={(e) => setTitleKz(e.target.value)} />
        </FormField>
        <FormField>
          <Label htmlFor="svc-desc-ru">Описание RU</Label>
          <Textarea id="svc-desc-ru" value={descRu} onChange={(e) => setDescRu(e.target.value)} style={{ minHeight: 60 }} />
        </FormField>
        <FormField>
          <Label htmlFor="svc-desc-kz">Описание KZ</Label>
          <Textarea id="svc-desc-kz" value={descKz} onChange={(e) => setDescKz(e.target.value)} style={{ minHeight: 60 }} />
        </FormField>
      </FormGrid>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <BtnPrimary type="button" onClick={handleSubmit} disabled={busy}>
          {busy ? 'Сохранение…' : (isEdit ? 'Сохранить' : 'Создать')}
        </BtnPrimary>
        <BtnSecondary type="button" onClick={onCancel}>
          Отмена
        </BtnSecondary>
      </div>
    </Card>
  );
}

ServiceForm.propTypes = {
  tree: PropTypes.object.isRequired,
  initial: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  busy: PropTypes.bool,
};

export function AdminServicesTab({ tree, adminRequest, onReload, setError, setOk }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filterGroup, setFilterGroup] = useState('');
  const [localError, setLocalError] = useState('');

  const groupMap = useMemo(
    () => Object.fromEntries((tree.category_groups ?? []).map((g) => [g.id, g])),
    [tree.category_groups],
  );

  const services = useMemo(() => {
    const all = tree.subcategories ?? [];
    if (!filterGroup) return all;
    return all.filter((s) => String(s.group_id) === filterGroup);
  }, [tree.subcategories, filterGroup]);

  const handleSave = async (data) => {
    setBusy(true);
    setLocalError('');
    try {
      const isEdit = Boolean(editItem);
      const url = isEdit ? ADMIN_API.subcategory(editItem.id) : ADMIN_API.subcategories;
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await adminRequest(method, url, { json: data });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setLocalError(j.error ?? `Ошибка ${res.status}`); return; }
      setOk(isEdit ? 'Услуга обновлена' : 'Услуга создана');
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
    if (!window.confirm(`Удалить услугу «${name}»? Вместе с ней удалятся все вопросы.`)) return;
    setBusy(true);
    try {
      const res = await adminRequest('DELETE', ADMIN_API.subcategory(id));
      if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error ?? 'Ошибка'); return; }
      setOk('Услуга удалена');
      await onReload();
    } catch {
      setError('Сеть недоступна');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader>
        <PageTitle>Услуги ({services.length})</PageTitle>
        <BtnPrimary type="button" onClick={() => { setShowForm(true); setEditItem(null); }}>
          + Добавить услугу
        </BtnPrimary>
      </PageHeader>

      {localError ? <AlertBanner $type="error">{localError}</AlertBanner> : null}

      {(showForm && !editItem) && (
        <ServiceForm
          tree={tree}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          busy={busy}
        />
      )}

      <Card $compact $mb={12}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Label style={{ margin: 0, whiteSpace: 'nowrap' }}>Категория:</Label>
          <Select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} style={{ flex: 1, maxWidth: 320 }}>
            <option value="">Все категории</option>
            {tree.category_groups?.map((g) => (
              <option key={g.id} value={String(g.id)}>{g.title_ru}</option>
            ))}
          </Select>
        </div>
      </Card>

      {editItem && (
        <ServiceForm
          tree={tree}
          initial={editItem}
          onSave={handleSave}
          onCancel={() => setEditItem(null)}
          busy={busy}
        />
      )}

      {services.length > 0 ? (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Категория</th>
                <th>Код</th>
                <th style={{ width: 130 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => {
                const grp = groupMap[s.group_id];
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.title_ru}</div>
                      <div style={{ fontSize: 12, color: adm.muted }}>{s.title_kz}</div>
                    </td>
                    <td>
                      <Badge $variant="blue">{grp?.title_ru ?? '—'}</Badge>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, color: adm.muted }}>{s.code}</code>
                    </td>
                    <td>
                      <TableActions>
                        <BtnEdit
                          type="button"
                          onClick={() => { setEditItem(s); setShowForm(false); }}
                        >
                          ✏
                        </BtnEdit>
                        <BtnDanger
                          type="button"
                          onClick={() => handleDelete(s.id, s.title_ru)}
                          disabled={busy}
                        >
                          🗑
                        </BtnDanger>
                      </TableActions>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      ) : (
        <EmptyState>
          {filterGroup ? 'В этой категории нет услуг.' : 'Услуг нет. Нажмите «Добавить услугу».'}
        </EmptyState>
      )}
    </div>
  );
}

AdminServicesTab.propTypes = {
  tree: PropTypes.object.isRequired,
  adminRequest: PropTypes.func.isRequired,
  onReload: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  setOk: PropTypes.func.isRequired,
};
