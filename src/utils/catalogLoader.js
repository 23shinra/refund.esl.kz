function safeJsonParseArray(maybeJson) {
  if (Array.isArray(maybeJson)) return maybeJson;
  if (typeof maybeJson !== 'string') return [];
  try {
    const parsed = JSON.parse(maybeJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toLocalized(language, value) {
  if (value == null) return {};
  if (typeof value === 'object') return value;
  return { [language]: String(value) };
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isLocalizedValue(v) {
  if (typeof v === 'string') return true;
  if (!v || typeof v !== 'object') return false;
  // supports { ru: '...', kz: '...' } and also any shape with at least one key
  return Object.values(v).some((x) => typeof x === 'string' && x.trim().length > 0);
}

function validateCatalogApiPayload(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Catalog payload is not an object');

  const audiences = payload.audiences;
  const groups = payload.groups;
  const subcategories = payload.subcategories;
  const questions = payload.questions;

  if (!Array.isArray(audiences)) throw new Error('Catalog payload.audiences must be an array');
  if (!Array.isArray(groups)) throw new Error('Catalog payload.groups must be an array');
  if (!Array.isArray(subcategories)) throw new Error('Catalog payload.subcategories must be an array');
  if (!Array.isArray(questions)) throw new Error('Catalog payload.questions must be an array');

  for (const a of audiences) {
    if (!a) continue;
    if (!isNonEmptyString(a.code)) throw new Error('Catalog audience.code must be a non-empty string');
    if (a.id == null) throw new Error('Catalog audience.id is required');
  }

  for (const g of groups) {
    if (!g) continue;
    if (!isNonEmptyString(g.code)) throw new Error('Catalog group.code must be a non-empty string');
    if (!isNonEmptyString(g.title)) {
      // server sends title_${lang} as title; could be null but then fallback is unlikely useful
      throw new Error('Catalog group.title must be a non-empty string');
    }
  }

  for (const s of subcategories) {
    if (!s) continue;
    if (!isNonEmptyString(s.code)) throw new Error('Catalog subcategory.code must be a non-empty string');
    if (!isNonEmptyString(s.title)) {
      throw new Error('Catalog subcategory.title must be a non-empty string');
    }
  }

  for (const q of questions) {
    if (!q) continue;
    if (!isNonEmptyString(q.code)) throw new Error('Catalog question.code must be a non-empty string');
    if (!isNonEmptyString(q.question)) {
      throw new Error('Catalog question.question must be a non-empty string');
    }
    // answer may be empty for some questions, so we only validate type at this stage
    if (q.answer != null && typeof q.answer !== 'string') {
      throw new Error('Catalog question.answer must be a string when present');
    }
  }
}

export function validateCatalogModel(catalog) {
  if (!Array.isArray(catalog)) throw new Error('Catalog model must be an array');

  for (const g of catalog) {
    if (!g || typeof g !== 'object') throw new Error('Catalog group must be an object');
    if (!isNonEmptyString(g.id)) throw new Error('Catalog group.id is required');
    if (!isNonEmptyString(g.audience)) throw new Error('Catalog group.audience is required');
    if (!isLocalizedValue(g.title) && !isLocalizedValue(g.description)) {
      throw new Error('Catalog group title/description must be localized values');
    }

    const subs = g.subcategories;
    if (!Array.isArray(subs)) throw new Error('Catalog group.subcategories must be an array');
    for (const s of subs) {
      if (!s || typeof s !== 'object') throw new Error('Catalog subcategory must be an object');
      if (!isNonEmptyString(s.id)) throw new Error('Catalog subcategory.id is required');
      if (!isLocalizedValue(s.title) && !isLocalizedValue(s.description)) {
        throw new Error('Catalog subcategory title/description must be localized values');
      }
      if (!Array.isArray(s.questions)) throw new Error('Catalog subcategory.questions must be an array');

      for (const q of s.questions) {
        if (!q || typeof q !== 'object') throw new Error('Catalog question must be an object');
        if (!isNonEmptyString(q.id)) throw new Error('Catalog question.id is required');
        if (!isLocalizedValue(q.question)) throw new Error('Catalog question.question must be localized');
        if (!('answer' in q)) throw new Error('Catalog question.answer is required');
        if (q.tags != null && !Array.isArray(q.tags)) throw new Error('Catalog question.tags must be an array');
      }
    }
  }

  return true;
}

export async function fetchCatalogFromApi(language = 'ru') {
  const lang = language === 'kz' ? 'kz' : 'ru';
  const res = await fetch(`/api/catalog?lang=${encodeURIComponent(lang)}`);
  if (!res.ok) throw new Error(`Failed to fetch catalog (${res.status})`);
  const payload = await res.json().catch(() => null);
  validateCatalogApiPayload(payload);

  const audiencesById = new Map((payload.audiences ?? []).map((a) => [a.id, a.code]));

  const groups = payload.groups ?? [];
  const subcategories = payload.subcategories ?? [];
  const questions = payload.questions ?? [];

  const subIdByCode = new Map(subcategories.map((s) => [s.code, s.id]));

  const subsByGroupId = new Map();
  for (const s of subcategories) {
    const list = subsByGroupId.get(s.group_id) ?? [];
    list.push({
      id: s.code,
      title: toLocalized(lang, s.title),
      description: toLocalized(lang, s.description),
      questions: [],
    });
    subsByGroupId.set(s.group_id, list);
  }

  const qsBySubId = new Map();
  for (const q of questions) {
    const list = qsBySubId.get(q.subcategory_id) ?? [];
    list.push({
      id: q.code,
      question: toLocalized(lang, q.question),
      answer: toLocalized(lang, q.answer),
      tags: safeJsonParseArray(q.tags).map((t) => toLocalized(lang, t)),
    });
    qsBySubId.set(q.subcategory_id, list);
  }

  const out = [];
  for (const g of groups) {
    const audienceCode = audiencesById.get(g.audience_id);
    const subs = subsByGroupId.get(g.id) ?? [];
    for (const sub of subs) {
      const srcSubId = subIdByCode.get(sub.id);
      if (srcSubId) sub.questions = qsBySubId.get(srcSubId) ?? [];
    }

    out.push({
      id: g.code,
      audience: audienceCode,
      title: toLocalized(lang, g.title),
      description: toLocalized(lang, g.description),
      subcategories: subs,
    });
  }

  const filtered = out.filter((g) => g.audience === 'individual' || g.audience === 'legal');
  validateCatalogModel(filtered);
  return filtered;
}

