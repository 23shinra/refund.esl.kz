import express from 'express';
import { z } from 'zod';

const BodySchema = z.object({
  language: z.enum(['ru', 'kz']).optional().default('ru'),
  answers: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
  askedQuestionIds: z.array(z.string()).optional().default([]),
});

function asSafeString(v) {
  const s = String(v ?? '').trim();
  if (!s) return '';
  return s.slice(0, 120);
}

function buildPrompt({ language, answers, askedQuestionIds, subcategories }) {
  const langLabel = language === 'kz' ? 'Kazakh' : 'Russian';
  const profileLines = Object.entries(answers)
    .slice(0, 30)
    .map(([k, v]) => `- ${k}: ${asSafeString(v)}`)
    .join('\n');

  const subsLines = subcategories
    .slice(0, 340)
    .map((s) => `- [${s.audience}] ${s.groupTitle} → ${s.title} (${s.code}) — ${s.subDesc || ''}`.trim())
    .join('\n');

  const askedLines = (askedQuestionIds ?? []).slice(0, 24).map((x) => `- ${asSafeString(x)}`).join('\n');

  return `
You are an onboarding assistant for a benefits/services catalog website in Kazakhstan.

Goal:
1) Ask ONE next question that helps determine which catalog subcategories are most relevant.
2) Recommend up to 10 subcategory codes from the catalog that fit the current profile.

Rules:
- Language: respond in ${langLabel}.
- The question must be short, respectful, and non-sensitive.
- Avoid collecting exact address, IIN/ID numbers, medical diagnosis, or other highly sensitive personal data.
- Prefer multiple-choice when possible.
- Use previous answers to ask a better next question (do NOT ask what is already answered).
- Do NOT repeat questions with ids from the "Already asked question ids" list.
- If enough info is already present, still return a final question but keep it generic (e.g. "Что сейчас актуальнее всего?").
- Output MUST be valid JSON, nothing else (no markdown).
- Always provide BOTH ru and kz texts. If you can't translate, copy ru into kz.

Current answers:
${profileLines || '- (no answers yet)'}

Already asked question ids:
${askedLines || '- (none)'}

Catalog subcategories (audience/group/subcategory/code/description):
${subsLines}

JSON schema:
{
  "question": {
    "id": "string",
    "type": "single_choice" | "number" | "text",
    "text": { "ru": "string", "kz": "string" },
    "hint": { "ru": "string", "kz": "string" },
    "options": [ { "id": "string", "text": { "ru": "string", "kz": "string" } } ]
  },
  "recommendations": ["subcategory_code", "..."]
}
`.trim();
}

function lc(s) {
  return String(s ?? '').toLowerCase();
}

function fallbackQuestion(language) {
  return {
    id: 'priority',
    type: 'single_choice',
    text: {
      ru: 'Что сейчас для вас актуальнее всего?',
      kz: 'Қазір сіз үшін ең өзекті мәселе қайсысы?',
    },
    hint: {
      ru: 'Выберите один вариант — мы подберём подходящие разделы.',
      kz: 'Бір нұсқаны таңдаңыз — біз сәйкес бөлімдерді ұсынамыз.',
    },
    options: [
      { id: 'family', text: { ru: 'Семья и дети', kz: 'Отбасы және балалар' } },
      { id: 'work', text: { ru: 'Работа/доход', kz: 'Жұмыс/табыс' } },
      { id: 'health', text: { ru: 'Здоровье/инвалидность', kz: 'Денсаулық/мүгедектік' } },
      { id: 'housing', text: { ru: 'Жильё/коммунальные', kz: 'Тұрғын үй/коммуналдық' } },
      { id: 'education', text: { ru: 'Образование', kz: 'Білім' } },
      { id: 'other', text: { ru: 'Другое', kz: 'Басқа' } },
    ],
  };
}

function fallbackRecommendations({ answers, subcategories }) {
  const age = typeof answers.age === 'number' ? answers.age : Number(answers.age);
  const marital = lc(answers.maritalStatus);
  const children = lc(answers.children);
  const employment = lc(answers.employment);
  const priority = lc(answers.priority);

  const boosts = [];
  if (Number.isFinite(age) && age >= 60) boosts.push('пенс', 'pension', 'зейнет');
  if (Number.isFinite(age) && age < 18) boosts.push('дет', 'child', 'бал');
  if (children === 'yes') boosts.push('дет', 'child', 'бал', 'матер', 'maternity', 'жәрдем');
  if (marital === 'married') boosts.push('сем', 'family', 'отбас');
  if (employment === 'unemployed') boosts.push('безработ', 'жұмыссыз', 'жәрдем', 'пособ');
  if (employment === 'student') boosts.push('студ', 'оқу', 'education', 'білім');
  if (priority === 'housing') boosts.push('жиль', 'housing', 'тұрғын', 'ипот', 'коммун');
  if (priority === 'health') boosts.push('инвалид', 'health', 'денсау');
  if (priority === 'work') boosts.push('работ', 'work', 'табыс', 'доход');
  if (priority === 'education') boosts.push('образ', 'education', 'оқу', 'білім');
  if (priority === 'family') boosts.push('сем', 'family', 'отбас', 'дет', 'child', 'бал');

  const scored = subcategories.map((s) => {
    const text = lc(`${s.code} ${s.title} ${s.groupCode}`);
    let score = 0;
    for (const b of boosts) if (text.includes(b)) score += 1;
    // slight preference for individual audience-like codes
    if (text.includes('ind-')) score += 0.2;
    return { code: String(s.code), score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((x) => x.score > 0).slice(0, 10).map((x) => x.code);
  if (top.length) return top;
  return scored.slice(0, 8).map((x) => x.code);
}

async function callOpenAI({ apiKey, model, prompt }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Return strictly valid JSON according to the schema.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI error: ${res.status} ${text}`.slice(0, 600));
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI empty response');
  return content;
}

const ResponseSchema = z.object({
  question: z
    .object({
      id: z.string().min(1).max(64),
      type: z.enum(['single_choice', 'number', 'text']),
      text: z.object({ ru: z.string().min(1), kz: z.string().min(1) }),
      hint: z.object({ ru: z.string().optional(), kz: z.string().optional() }).optional(),
      options: z
        .array(
          z.object({
            id: z.string().min(1).max(64),
            text: z.object({ ru: z.string().min(1), kz: z.string().min(1) }),
          }),
        )
        .optional(),
    })
    .strict(),
  recommendations: z.array(z.string()).optional(),
});

function coerceAiResponse(json, language) {
  const q = json?.question && typeof json.question === 'object' ? json.question : null;
  if (!q) return null;

  const type = q.type === 'single_choice' || q.type === 'number' || q.type === 'text' ? q.type : 'single_choice';
  const id = typeof q.id === 'string' && q.id.trim() ? q.id.trim().slice(0, 64) : 'priority';

  const rawText = q.text && typeof q.text === 'object' ? q.text : null;
  const ruText =
    typeof rawText?.ru === 'string' && rawText.ru.trim()
      ? rawText.ru.trim()
      : typeof rawText?.kz === 'string' && rawText.kz.trim()
        ? rawText.kz.trim()
        : language === 'kz'
          ? 'Қазір сіз үшін ең өзекті мәселе қайсысы?'
          : 'Что сейчас для вас актуальнее всего?';
  const kzText =
    typeof rawText?.kz === 'string' && rawText.kz.trim()
      ? rawText.kz.trim()
      : typeof rawText?.ru === 'string' && rawText.ru.trim()
        ? rawText.ru.trim()
        : 'Қазір сіз үшін ең өзекті мәселе қайсысы?';

  const rawHint = q.hint && typeof q.hint === 'object' ? q.hint : null;
  const ruHint = typeof rawHint?.ru === 'string' ? rawHint.ru.trim() : '';
  const kzHint = typeof rawHint?.kz === 'string' ? rawHint.kz.trim() : '';

  let options = undefined;
  if (type === 'single_choice') {
    const rawOptions = Array.isArray(q.options) ? q.options : [];
    const cleaned = rawOptions
      .map((o) => {
        if (!o || typeof o !== 'object') return null;
        const oid = typeof o.id === 'string' && o.id.trim() ? o.id.trim().slice(0, 64) : '';
        const ot = o.text && typeof o.text === 'object' ? o.text : {};
        const oru = typeof ot.ru === 'string' && ot.ru.trim() ? ot.ru.trim() : '';
        const okz = typeof ot.kz === 'string' && ot.kz.trim() ? ot.kz.trim() : '';
        if (!oid || (!oru && !okz)) return null;
        return { id: oid, text: { ru: oru || okz, kz: okz || oru } };
      })
      .filter(Boolean)
      .slice(0, 10);

    options = cleaned.length ? cleaned : fallbackQuestion(language).options;
  }

  const rec = Array.isArray(json?.recommendations) ? json.recommendations : [];
  const recommendations = rec.filter((x) => typeof x === 'string').slice(0, 10);

  return {
    question: {
      id,
      type,
      text: { ru: ruText, kz: kzText },
      hint: ruHint || kzHint ? { ru: ruHint, kz: kzHint } : undefined,
      options,
    },
    recommendations,
  };
}

function uniqueQuestionId(base, used) {
  const set = used instanceof Set ? used : new Set((used ?? []).map((x) => String(x)));
  const rawBase = String(base ?? 'ai').slice(0, 40) || 'ai';
  let id = rawBase;
  let n = 2;
  while (set.has(id)) {
    id = `${rawBase}-${n}`;
    n += 1;
    if (id.length > 64) id = id.slice(0, 64);
    if (n > 50) break;
  }
  return id;
}

export function onboardingRouter(db, env) {
  const r = express.Router();

  r.post('/onboarding/next', async (req, res) => {
    try {
      const parsedBody = BodySchema.safeParse(req.body ?? {});
      if (!parsedBody.success) return res.status(400).json({ error: 'Invalid payload' });

      const { language, answers, askedQuestionIds } = parsedBody.data;

      const subcategories = await db('subcategories')
        .join('category_groups', 'subcategories.group_id', 'category_groups.id')
        .join('audiences', 'category_groups.audience_id', 'audiences.id')
        .select(
          'subcategories.code as code',
          `subcategories.title_${language} as title`,
          `subcategories.description_${language} as subDesc`,
          'category_groups.code as groupCode',
          `category_groups.title_${language} as groupTitle`,
          `category_groups.description_${language} as groupDesc`,
          'audiences.code as audience',
        )
        .orderBy([{ column: 'category_groups.sort_order', order: 'asc' }, { column: 'subcategories.sort_order', order: 'asc' }]);

      if (!env?.openai?.apiKey) {
        return res.json({
          question: fallbackQuestion(language),
          recommendations: fallbackRecommendations({ answers, subcategories }),
          mode: 'fallback',
        });
      }

      const prompt = buildPrompt({ language, answers, askedQuestionIds, subcategories });
      const rawJson = await callOpenAI({ apiKey: env.openai.apiKey, model: env.openai.model, prompt });

      let json;
      try {
        json = JSON.parse(rawJson);
      } catch {
        return res.status(502).json({ error: 'Bad AI JSON' });
      }

      const parsed = ResponseSchema.safeParse(json);
      const coerced = parsed.success ? parsed.data : coerceAiResponse(json, language);
      if (!coerced) {
        // eslint-disable-next-line no-console
        console.error('[onboarding] bad AI shape, fallback used');
        return res.json({
          question: fallbackQuestion(language),
          recommendations: fallbackRecommendations({ answers, subcategories }),
          mode: 'openai_fallback',
        });
      }

      const askedSet = new Set((askedQuestionIds ?? []).map((x) => String(x)));
      if (askedSet.has(String(coerced.question?.id))) {
        const q = fallbackQuestion(language);
        const safeId = uniqueQuestionId(q.id, askedSet);
        q.id = safeId;
        coerced.question = q;
      }

      const allowedCodes = new Set(subcategories.map((s) => String(s.code)));
      const cleaned = (coerced.recommendations ?? []).filter((c) => allowedCodes.has(String(c))).slice(0, 10);

      return res.json({ question: coerced.question, recommendations: cleaned, mode: parsed.success ? 'openai' : 'openai_coerced' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  return r;
}

