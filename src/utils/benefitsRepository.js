import { benefitsCatalog } from '../data/benefitsData.js';

/**
 * Pure data access functions.
 * Keeps UI independent from data storage (JS, JSON, API later).
 */

let catalogCache = benefitsCatalog;

const CATALOG_CACHE_PREFIX = 'qoldau.catalog.v1';
const CATALOG_CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12h
const CATALOG_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30d

export function getCatalogCacheKey(language) {
  const lang = language === 'kz' ? 'kz' : 'ru';
  return `${CATALOG_CACHE_PREFIX}.${lang}`;
}

function safeGetLocalStorageItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorageItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function readCatalogCache(language) {
  const key = getCatalogCacheKey(language);
  const raw = safeGetLocalStorageItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.catalog)) return null;
    if (typeof parsed.fetchedAt !== 'number') return null;
    return { catalog: parsed.catalog, fetchedAt: parsed.fetchedAt };
  } catch {
    return null;
  }
}

export function writeCatalogCache(language, catalog) {
  if (!Array.isArray(catalog) || catalog.length === 0) return;
  const key = getCatalogCacheKey(language);
  safeSetLocalStorageItem(
    key,
    JSON.stringify({
      fetchedAt: Date.now(),
      catalog,
    }),
  );
}

export function isCatalogCacheFresh(fetchedAt) {
  if (typeof fetchedAt !== 'number') return false;
  return Date.now() - fetchedAt <= CATALOG_CACHE_TTL_MS;
}

export function isCatalogCacheUsable(fetchedAt) {
  if (typeof fetchedAt !== 'number') return false;
  return Date.now() - fetchedAt <= CATALOG_CACHE_MAX_AGE_MS;
}

export function catalogHasExpectedCode(catalog, expectedSubcategoryId = 'ind-family-birth-allowance') {
  if (!Array.isArray(catalog)) return false;
  return catalog.some((g) => (g.subcategories ?? []).some((s) => s.id === expectedSubcategoryId));
}

export function setCatalogData(nextCatalog) {
  if (!Array.isArray(nextCatalog) || nextCatalog.length === 0) return;
  catalogCache = nextCatalog;
}

export function getCatalogData() {
  return catalogCache;
}

export function getAudiences() {
  return [
    { id: 'individual', title: 'Физические лица' },
    { id: 'legal', title: 'Для юридических лиц' },
  ];
}

export function getCategoryGroupsByAudience(audienceId) {
  return catalogCache.filter((g) => g.audience === audienceId);
}

export function getSubcategoriesByAudience(audienceId) {
  return getCategoryGroupsByAudience(audienceId).flatMap((g) =>
    (g.subcategories ?? []).map((s) => ({
      ...s,
      group: { id: g.id, title: g.title, description: g.description, audience: g.audience },
    })),
  );
}

export function getSubcategoryById(subcategoryId) {
  for (const g of catalogCache) {
    for (const s of g.subcategories ?? []) {
      if (s.id === subcategoryId) {
        return { ...s, group: { id: g.id, title: g.title, description: g.description, audience: g.audience } };
      }
    }
  }
  return null;
}

export function getAllSubcategories() {
  const out = [];
  for (const g of catalogCache) {
    for (const s of g.subcategories ?? []) {
      out.push({
        ...s,
        group: { id: g.id, title: g.title, description: g.description, audience: g.audience },
      });
    }
  }
  return out;
}

export function getQuestionsBySubcategoryId(subcategoryId) {
  const sub = getSubcategoryById(subcategoryId);
  return sub?.questions ?? [];
}

export function getQuestionBySubcategoryAndId(subcategoryId, questionId) {
  const questions = getQuestionsBySubcategoryId(subcategoryId);
  return questions.find((q) => q.id === questionId) ?? null;
}

function asSearchableStrings(value, languageId) {
  if (!value) return [];
  if (typeof value === 'string') return [value];
  if (typeof value === 'object') {
    const ru = value.ru ? String(value.ru) : '';
    const kz = value.kz ? String(value.kz) : '';
    const current = value[languageId] ? String(value[languageId]) : '';
    return [current, ru, kz].filter(Boolean);
  }
  return [String(value)];
}

export function suggestSubcategories(query, languageId = 'ru', limit = 10, audienceId = null) {
  const q = String(query ?? '').trim();
  if (!q) return [];

  const subs = getAllSubcategories().filter((s) => !audienceId || s.group?.audience === audienceId);
  const scored = subs
    .map((s) => {
      const titleTexts = asSearchableStrings(s.title, languageId);
      const descTexts = asSearchableStrings(s.description, languageId);
      const groupTitleTexts = asSearchableStrings(s.group?.title, languageId);
      const bestTitle = Math.max(0, ...titleTexts.map((t) => trigramSimilarity(q, t)));
      const bestDesc = Math.max(0, ...descTexts.map((t) => trigramSimilarity(q, t))) * 0.85;
      const bestGroup = Math.max(0, ...groupTitleTexts.map((t) => trigramSimilarity(q, t))) * 0.65;
      const score = bestTitle * 1.25 + bestDesc + bestGroup;
      return { id: s.id, score };
    })
    .filter((x) => x.score > 0.12);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.id);
}

export function searchQuestions(subcategoryId, query, languageId = 'ru') {
  const q = (query ?? '').trim().toLowerCase();
  const questions = getQuestionsBySubcategoryId(subcategoryId);
  if (!q) return questions;

  return questions.filter((item) => {
    const questionTexts = asSearchableStrings(item.question, languageId);
    const answerTexts = asSearchableStrings(item.answer, languageId);
    const tagTexts = (item.tags ?? []).flatMap((tag) => asSearchableStrings(tag, languageId));

    const inText =
      questionTexts.some((s) => s.toLowerCase().includes(q)) ||
      answerTexts.some((s) => s.toLowerCase().includes(q));
    const inTags = tagTexts.some((s) => s.toLowerCase().includes(q));
    return inText || inTags;
  });
}

export function searchAllQuestions(query, languageId = 'ru', limit = 8) {
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return [];

  const out = [];

  for (const g of catalogCache) {
    for (const s of g.subcategories ?? []) {
      for (const item of s.questions ?? []) {
        const questionTexts = asSearchableStrings(item.question, languageId);
        const answerTexts = asSearchableStrings(item.answer, languageId);
        const tagTexts = (item.tags ?? []).flatMap((tag) => asSearchableStrings(tag, languageId));

        const inText =
          questionTexts.some((t) => t.toLowerCase().includes(q)) ||
          answerTexts.some((t) => t.toLowerCase().includes(q));
        const inTags = tagTexts.some((t) => t.toLowerCase().includes(q));
        if (!inText && !inTags) continue;

        out.push({
          subcategoryId: s.id,
          groupTitle: g.title,
          subcategoryTitle: s.title,
          question: item.question,
        });
        if (out.length >= limit) return out;
      }
    }
  }

  return out;
}

function normalizeForSimilarity(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9қғңәөұүһі\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function trigrams(s) {
  const str = `  ${s}  `;
  const grams = new Set();
  for (let i = 0; i < str.length - 2; i += 1) grams.add(str.slice(i, i + 3));
  return grams;
}

function trigramSimilarity(a, b) {
  const aa = normalizeForSimilarity(a);
  const bb = normalizeForSimilarity(b);
  if (!aa || !bb) return 0;
  const A = trigrams(aa);
  const B = trigrams(bb);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  const denom = A.size + B.size;
  if (!denom) return 0;
  return (2 * inter) / denom;
}

export function aiSuggestAllQuestions(query, languageId = 'ru', limit = 6) {
  const q = (query ?? '').trim();
  if (!q) return [];

  const scored = [];

  for (const g of catalogCache) {
    for (const s of g.subcategories ?? []) {
      for (const item of s.questions ?? []) {
        const questionTexts = asSearchableStrings(item.question, languageId);
        const answerTexts = asSearchableStrings(item.answer, languageId);
        const tagTexts = (item.tags ?? []).flatMap((tag) => asSearchableStrings(tag, languageId));

        const bestQuestion = Math.max(0, ...questionTexts.map((t) => trigramSimilarity(q, t)));
        const bestTags = Math.max(0, ...tagTexts.map((t) => trigramSimilarity(q, t)));
        const bestAnswer = Math.max(0, ...answerTexts.map((t) => trigramSimilarity(q, t))) * 0.55;

        const score = bestQuestion * 1.25 + bestTags * 1.1 + bestAnswer;
        if (score < 0.18) continue;

        scored.push({
          score,
          subcategoryId: s.id,
          groupTitle: g.title,
          subcategoryTitle: s.title,
          question: item.question,
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

