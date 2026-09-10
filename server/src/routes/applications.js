import express from 'express';
import { z } from 'zod';

export function applicationsRouter(db) {
  const r = express.Router();

  const createSchema = z.object({
    subcategoryCode: z.string().min(1),
    questionCode: z.string().min(1),
    lang: z.enum(['ru', 'kz']).default('ru'),
    name: z.string().trim().min(1).max(120).optional(),
    phone: z.string().trim().min(6).max(32),
    comment: z.string().trim().max(2000).optional(),
  });

  r.post('/applications', async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });

    const { subcategoryCode, questionCode, lang, name, phone, comment } = parsed.data;

    const sub = await db('subcategories').select('id').where({ code: subcategoryCode }).first();
    if (!sub) return res.status(400).json({ error: 'Unknown subcategory' });

    const q = await db('questions').select('id').where({ code: questionCode, subcategory_id: sub.id }).first();
    if (!q) return res.status(400).json({ error: 'Unknown question' });

    const [id] = await db('applications').insert({
      subcategory_id: sub.id,
      question_id: q.id,
      lang,
      name: name ?? null,
      phone,
      comment: comment ?? null,
    });

    return res.json({ ok: true, id });
  });

  return r;
}

