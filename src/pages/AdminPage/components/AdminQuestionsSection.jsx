import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  LangTab,
  LangTabs,
  PageHeader,
  PageTitle,
  Select,
  Spinner,
  Table,
  TableActions,
  TableWrap,
  Textarea,
} from '../adminStyles.js';

function QuestionForm({ subcategory, initial, onSave, onCancel, busy }) {
  const [lang, setLang] = useState('ru');
  const [questionRu, setQuestionRu] = useState(initial?.question_ru ?? '');
  const [questionKz, setQuestionKz] = useState(initial?.question_kz ?? '');
  const [answerRu, setAnswerRu] = useState(initial?.answer_ru ?? '');
  const [answerKz, setAnswerKz] = useState(initial?.answer_kz ?? '');
  const isEdit = Boolean(initial);

  const handleSubmit = () => {
    onSave({
      subcategory_id: subcategory.id,
      question_ru: questionRu,
      question_kz: questionKz,
      answer_ru: answerRu,
      answer_kz: answerKz,
    });
  };

  return (
    <Card style={{ border: `1.5px solid ${adm.primary}` }}>
      <CardTitle>{isEdit ? '✏️ Редактировать льготу' : '➕ Новая льгота / вопрос'}</CardTitle>
      <div style={{ fontSize: 13, color: adm.muted, marginBottom: 14 }}>
        Услуга: <strong>{subcategory.title_ru}</strong>
      </div>

      <LangTabs>
        <LangTab $active={lang === 'ru'} onClick={() => setLang('ru')}>🇷🇺 Русский</LangTab>
        <LangTab $active={lang === 'kz'} onClick={() => setLang('kz')}>🇰🇿 Казахский</LangTab>
      </LangTabs>

      {lang === 'ru' ? (
        <FormGrid>
          <FormField>
            <Label>Вопрос (RU)</Label>
            <Input
              value={questionRu}
              onChange={(e) => setQuestionRu(e.target.value)}
              placeholder="Есть право на льготу?"
            />
          </FormField>
          <FormField>
            <Label>Ответ / описание льготы (RU)</Label>
            <Textarea
              value={answerRu}
              onChange={(e) => setAnswerRu(e.target.value)}
              placeholder="Как получить, документы, сроки..."
              style={{ minHeight: 160 }}
            />
          </FormField>
        </FormGrid>
      ) : (
        <FormGrid>
          <FormField>
            <Label>Вопрос (KZ)</Label>
            <Input
              value={questionKz}
              onChange={(e) => setQuestionKz(e.target.value)}
              placeholder="Жеңілдік алуға құқығы бар ма?"
            />
          </FormField>
          <FormField>
            <Label>Жауап / жеңілдік сипаттамасы (KZ)</Label>
            <Textarea
              value={answerKz}
              onChange={(e) => setAnswerKz(e.target.value)}
              placeholder="Қалай алуға болады..."
              style={{ minHeight: 160 }}
            />
          </FormField>
        </FormGrid>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <BtnPrimary type="button" onClick={handleSubmit} disabled={busy}>
          {busy ? 'Сохранение…' : (isEdit ? 'Сохранить' : 'Добавить')}
        </BtnPrimary>
        <BtnSecondary type="button" onClick={onCancel}>Отмена</BtnSecondary>
      </div>
    </Card>
  );
}

QuestionForm.propTypes = {
  subcategory: PropTypes.object.isRequired,
  initial: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  busy: PropTypes.bool,
};

export function AdminQuestionsSection({ tree, adminRequest, setError, setOk }) {
  const [selectedSubId, setSelectedSubId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const subcategory = useMemo(
    () => (tree.subcategories ?? []).find((s) => String(s.id) === selectedSubId),
    [tree.subcategories, selectedSubId],
  );

  const groupMap = useMemo(
    () => Object.fromEntries((tree.category_groups ?? []).map((g) => [g.id, g])),
    [tree.category_groups],
  );

  const loadQuestions = useCallback(async (subId) => {
    if (!subId) return;
    setLoading(true);
    setLocalError('');
    try {
      const res = await adminRequest('GET', ADMIN_API.questionsByService(subId));
      if (!res.ok) { const j = await res.json().catch(() => ({})); setLocalError(j.error ?? 'Ошибка'); return; }
      const j = await res.json();
      setQuestions(j.questions ?? []);
    } catch {
      setLocalError('Сеть недоступна');
    } finally {
      setLoading(false);
    }
  }, [adminRequest]);

  useEffect(() => {
    if (selectedSubId) loadQuestions(selectedSubId);
    else setQuestions([]);
  }, [selectedSubId, loadQuestions]);

  const handleSave = async (data) => {
    setBusy(true);
    setLocalError('');
    try {
      const isEdit = Boolean(editItem);
      const url = isEdit ? ADMIN_API.question(editItem.id) : ADMIN_API.questions;
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await adminRequest(method, url, { json: data });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setLocalError(j.error ?? `Ошибка ${res.status}`); return; }
      setOk(isEdit ? 'Льгота обновлена' : 'Льгота добавлена');
      setShowForm(false);
      setEditItem(null);
      await loadQuestions(selectedSubId);
    } catch {
      setLocalError('Сеть недоступна');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Удалить льготу «${name}»?`)) return;
    setBusy(true);
    try {
      const res = await adminRequest('DELETE', ADMIN_API.question(id));
      if (!res.ok) { const j = await res.json().catch(() => ({})); setLocalError(j.error ?? 'Ошибка'); return; }
      setOk('Льгота удалена');
      await loadQuestions(selectedSubId);
    } catch {
      setLocalError('Сеть недоступна');
    } finally {
      setBusy(false);
    }
  };

  const subcategoriesByGroup = useMemo(() => {
    const groups = tree.category_groups ?? [];
    const subs = tree.subcategories ?? [];
    return groups.map((g) => ({
      ...g,
      subs: subs.filter((s) => s.group_id === g.id),
    }));
  }, [tree]);

  return (
    <div>
      <PageHeader>
        <PageTitle>Льготы и вопросы</PageTitle>
        {subcategory && (
          <BtnPrimary type="button" onClick={() => { setShowForm(true); setEditItem(null); }}>
            + Добавить льготу
          </BtnPrimary>
        )}
      </PageHeader>

      {localError ? <AlertBanner $type="error">{localError}</AlertBanner> : null}

      <Card $compact $mb={16}>
        <FormField>
          <Label htmlFor="q-service">Выберите услугу</Label>
          <Select
            id="q-service"
            value={selectedSubId}
            onChange={(e) => {
              setSelectedSubId(e.target.value);
              setShowForm(false);
              setEditItem(null);
            }}
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

      {subcategory && showForm && !editItem && (
        <QuestionForm
          subcategory={subcategory}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          busy={busy}
        />
      )}

      {editItem && subcategory && (
        <QuestionForm
          subcategory={subcategory}
          initial={editItem}
          onSave={handleSave}
          onCancel={() => setEditItem(null)}
          busy={busy}
        />
      )}

      {!selectedSubId && (
        <EmptyState>
          Выберите услугу выше, чтобы увидеть и управлять её льготами.
        </EmptyState>
      )}

      {selectedSubId && loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
          <Spinner />
        </div>
      )}

      {selectedSubId && !loading && questions.length === 0 && !showForm && (
        <EmptyState>
          У этой услуги пока нет льгот.{' '}
          <BtnPrimary
            type="button"
            style={{ fontSize: 12 }}
            onClick={() => setShowForm(true)}
          >
            + Добавить первую
          </BtnPrimary>
        </EmptyState>
      )}

      {questions.length > 0 && (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Вопрос / льгота</th>
                <th style={{ width: 120 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{q.question_ru}</div>
                    {q.question_kz && q.question_kz !== q.question_ru ? (
                      <div style={{ fontSize: 12, color: adm.muted }}>{q.question_kz}</div>
                    ) : null}
                    {q.answer_ru && (
                      <div style={{ fontSize: 12, color: adm.muted, marginTop: 4, maxWidth: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.answer_ru.slice(0, 120)}{q.answer_ru.length > 120 ? '…' : ''}
                      </div>
                    )}
                  </td>
                  <td>
                    <TableActions>
                      <BtnEdit
                        type="button"
                        onClick={() => { setEditItem(q); setShowForm(false); }}
                      >
                        ✏
                      </BtnEdit>
                      <BtnDanger
                        type="button"
                        onClick={() => handleDelete(q.id, q.question_ru)}
                        disabled={busy}
                      >
                        🗑
                      </BtnDanger>
                    </TableActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </div>
  );
}

AdminQuestionsSection.propTypes = {
  tree: PropTypes.object.isRequired,
  adminRequest: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  setOk: PropTypes.func.isRequired,
};
