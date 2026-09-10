import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { ADMIN_API } from '../../../features/admin/constants.js';
import {
  adm,
  AlertBanner,
  Badge,
  BtnPrimary,
  Card,
  CardTitle,
  EmptyState,
  FormField,
  Label,
  PageHeader,
  PageTitle,
  Select,
  Spinner,
  Table,
  TableWrap,
} from '../adminStyles.js';

export function AdminPartnersTab({ tree, partners, adminRequest, setError, setOk }) {
  const [subId, setSubId] = useState('');
  const [assigned, setAssigned] = useState([]);
  const [localAssigned, setLocalAssigned] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const subcategory = useMemo(
    () => (tree.subcategories ?? []).find((s) => String(s.id) === subId),
    [tree.subcategories, subId],
  );

  const loadAssigned = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminRequest('GET', ADMIN_API.subcategoryPartners(id));
      if (!res.ok) return;
      const j = await res.json();
      const ids = (j.partner_user_ids ?? []).map(String);
      setAssigned(ids);
      setLocalAssigned(ids);
    } finally {
      setLoading(false);
    }
  }, [adminRequest]);

  useEffect(() => {
    if (subId) loadAssigned(subId);
    else { setAssigned([]); setLocalAssigned([]); }
  }, [subId, loadAssigned]);

  const togglePartner = (id) => {
    const sid = String(id);
    setLocalAssigned((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid],
    );
  };

  const handleSave = async () => {
    if (!subId) return;
    setBusy(true);
    setLocalError('');
    try {
      const res = await adminRequest('PUT', ADMIN_API.subcategoryPartners(subId), {
        json: { partner_user_ids: localAssigned.map(Number) },
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); setLocalError(j.error ?? 'Ошибка'); return; }
      setOk('Партнёры сохранены');
      await loadAssigned(subId);
    } catch {
      setLocalError('Сеть недоступна');
    } finally {
      setBusy(false);
    }
  };

  const subcategoriesByGroup = useMemo(() => {
    const groups = tree.category_groups ?? [];
    const subs = tree.subcategories ?? [];
    return groups.map((g) => ({ ...g, subs: subs.filter((s) => s.group_id === g.id) }));
  }, [tree]);

  const isDirty = JSON.stringify([...localAssigned].sort()) !== JSON.stringify([...assigned].sort());

  return (
    <div>
      <PageHeader>
        <PageTitle>Партнёры на услуги</PageTitle>
      </PageHeader>

      {localError ? <AlertBanner $type="error">{localError}</AlertBanner> : null}

      <Card $compact $mb={16}>
        <FormField>
          <Label htmlFor="p-service">Выберите услугу</Label>
          <Select
            id="p-service"
            value={subId}
            onChange={(e) => setSubId(e.target.value)}
            style={{ maxWidth: 480 }}
          >
            <option value="">— выберите услугу —</option>
            {subcategoriesByGroup.map((g) =>
              g.subs.length > 0 ? (
                <optgroup key={g.id} label={g.title_ru}>
                  {g.subs.map((s) => (
                    <option key={s.id} value={String(s.id)}>{s.title_ru}</option>
                  ))}
                </optgroup>
              ) : null
            )}
          </Select>
        </FormField>
      </Card>

      {!subId && <EmptyState>Выберите услугу для управления партнёрами.</EmptyState>}

      {subId && loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
          <Spinner />
        </div>
      )}

      {subId && !loading && partners.length === 0 && (
        <EmptyState>Нет партнёров. Назначьте роль «Партнёр» нужным пользователям во вкладке «Пользователи».</EmptyState>
      )}

      {subId && !loading && partners.length > 0 && (
        <Card>
          <CardTitle>Партнёры для «{subcategory?.title_ru ?? subId}»</CardTitle>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Телефон</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => {
                  const checked = localAssigned.includes(String(p.id));
                  return (
                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => togglePartner(p.id)}>
                      <td>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePartner(p.id)}
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                        />
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.phone}</td>
                      <td style={{ color: adm.muted, fontSize: 12 }}>{p.id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrap>
          <div style={{ marginTop: 16 }}>
            <BtnPrimary type="button" onClick={handleSave} disabled={busy || !isDirty}>
              {busy ? 'Сохранение…' : 'Сохранить партнёров'}
            </BtnPrimary>
          </div>
        </Card>
      )}
    </div>
  );
}

AdminPartnersTab.propTypes = {
  tree: PropTypes.object.isRequired,
  partners: PropTypes.array.isRequired,
  adminRequest: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  setOk: PropTypes.func.isRequired,
};
