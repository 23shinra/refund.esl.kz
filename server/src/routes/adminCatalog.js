import { z } from 'zod';

const questionSchema = z.object({
  subcategory_id: z.number().int().positive().optional(),
  code: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Код: латиница, цифры, дефисы')
    .optional(),
  question_ru: z.string().min(1).max(512),
  question_kz: z.string().min(1).max(512),
  answer_ru: z.string().min(1),
  answer_kz: z.string().min(1),
  sort_order: z.number().int().optional(),
});

import { USER_ROLE } from '../constants/userRoles.js';

const codeSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Код: латиница, цифры, дефисы');

function parseId(param) {
  const id = Number.parseInt(String(param), 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/**
 * @param {import('express').Router} r
 * @param {import('knex').Knex} db
 * @param {import('express').RequestHandler} needAdmin
 */
export function registerAdminCatalogRoutes(r, db, needAdmin) {
  r.get('/admin/catalog-tree', needAdmin, async (_req, res) => {
    try {
      const audiences = await db('audiences').select('*').orderBy('id');
      const category_groups = await db('category_groups').select('*').orderBy([
        { column: 'sort_order', order: 'asc' },
        { column: 'id', order: 'asc' },
      ]);
      const subcategories = await db('subcategories').select('*').orderBy([
        { column: 'sort_order', order: 'asc' },
        { column: 'id', order: 'asc' },
      ]);
      const assignments = await db('partner_service_assignments as a')
        .join('users as u', 'u.id', 'a.user_id')
        .where('u.role', USER_ROLE.PARTNER)
        .select('a.subcategory_id', 'a.user_id', 'u.phone');
      return res.json({ audiences, category_groups, subcategories, partner_assignments: assignments });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.get('/admin/partners', needAdmin, async (_req, res) => {
    try {
      const users = await db('users')
        .where({ role: USER_ROLE.PARTNER })
        .select('id', 'phone', 'created_at')
        .orderBy('id', 'asc');
      return res.json({ partners: users });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.post('/admin/category-groups', needAdmin, async (req, res) => {
    try {
      const schema = z.object({
        audience_id: z.number().int().positive(),
        code: codeSchema,
        title_ru: z.string().min(1).max(255),
        title_kz: z.string().min(1).max(255),
        description_ru: z.string().min(1),
        description_kz: z.string().min(1),
        sort_order: z.number().int().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation', details: parsed.error.flatten() });
      }
      const aud = await db('audiences').where({ id: parsed.data.audience_id }).first();
      if (!aud) return res.status(400).json({ error: 'Аудитория не найдена' });

      let sort = parsed.data.sort_order;
      if (sort === undefined) {
        const row = await db('category_groups').max('sort_order as m').first();
        sort = Number(row?.m ?? -1) + 1;
      }

      const [id] = await db('category_groups').insert({
        audience_id: parsed.data.audience_id,
        code: parsed.data.code,
        title_ru: parsed.data.title_ru,
        title_kz: parsed.data.title_kz,
        description_ru: parsed.data.description_ru,
        description_kz: parsed.data.description_kz,
        sort_order: sort,
        created_at: db.fn.now(),
      });
      const row = await db('category_groups').where({ id }).first();
      return res.status(201).json({ category_group: row });
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) {
        return res.status(409).json({ error: 'Код категории уже занят' });
      }
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.patch('/admin/category-groups/:id', needAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      const schema = z.object({
        audience_id: z.number().int().positive().optional(),
        code: codeSchema.optional(),
        title_ru: z.string().min(1).max(255).optional(),
        title_kz: z.string().min(1).max(255).optional(),
        description_ru: z.string().min(1).optional(),
        description_kz: z.string().min(1).optional(),
        sort_order: z.number().int().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation', details: parsed.error.flatten() });
      }
      const patch = { ...parsed.data };
      if (patch.audience_id != null) {
        const aud = await db('audiences').where({ id: patch.audience_id }).first();
        if (!aud) return res.status(400).json({ error: 'Аудитория не найдена' });
      }
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'Нет полей для обновления' });
      }
      const n = await db('category_groups').where({ id }).update(patch);
      if (!n) return res.status(404).json({ error: 'Не найдено' });
      const row = await db('category_groups').where({ id }).first();
      return res.json({ category_group: row });
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) {
        return res.status(409).json({ error: 'Код категории уже занят' });
      }
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.delete('/admin/category-groups/:id', needAdmin, async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const trx = await db.transaction();
    try {
      const subs = await trx('subcategories').where({ group_id: id }).select('id');
      for (const { id: sid } of subs) {
        await trx('applications').where({ subcategory_id: sid }).del();
        await trx('questions').where({ subcategory_id: sid }).del();
        await trx('partner_service_assignments').where({ subcategory_id: sid }).del();
        await trx('subcategories').where({ id: sid }).del();
      }
      const n = await trx('category_groups').where({ id }).del();
      await trx.commit();
      if (!n) return res.status(404).json({ error: 'Не найдено' });
      return res.json({ ok: true });
    } catch (e) {
      await trx.rollback();
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.post('/admin/subcategories', needAdmin, async (req, res) => {
    try {
      const schema = z.object({
        group_id: z.number().int().positive(),
        code: codeSchema,
        title_ru: z.string().min(1).max(255),
        title_kz: z.string().min(1).max(255),
        description_ru: z.string().min(1),
        description_kz: z.string().min(1),
        sort_order: z.number().int().optional(),
        add_placeholder_question: z.boolean().optional().default(true),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation', details: parsed.error.flatten() });
      }
      const grp = await db('category_groups').where({ id: parsed.data.group_id }).first();
      if (!grp) return res.status(400).json({ error: 'Категория не найдена' });

      let sort = parsed.data.sort_order;
      if (sort === undefined) {
        const row = await db('subcategories').where({ group_id: parsed.data.group_id }).max('sort_order as m').first();
        sort = Number(row?.m ?? -1) + 1;
      }

      const trx = await db.transaction();
      try {
        const [subId] = await trx('subcategories').insert({
          group_id: parsed.data.group_id,
          code: parsed.data.code,
          title_ru: parsed.data.title_ru,
          title_kz: parsed.data.title_kz,
          description_ru: parsed.data.description_ru,
          description_kz: parsed.data.description_kz,
          sort_order: sort,
          created_at: db.fn.now(),
        });
        if (parsed.data.add_placeholder_question) {
          const qCode = `${parsed.data.code}-placeholder`;
          await trx('questions').insert({
            subcategory_id: subId,
            code: qCode,
            question_ru: 'Подробная информация',
            question_kz: 'Толық ақпарат',
            answer_ru: 'Содержание будет дополнено.',
            answer_kz: 'Мазмұны толықтырылады.',
            tags_ru: '[]',
            tags_kz: '[]',
            sort_order: 0,
            created_at: db.fn.now(),
          });
        }
        await trx.commit();
        const row = await db('subcategories').where({ id: subId }).first();
        return res.status(201).json({ subcategory: row });
      } catch (err) {
        await trx.rollback();
        throw err;
      }
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) {
        return res.status(409).json({ error: 'Код услуги уже занят' });
      }
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.patch('/admin/subcategories/:id', needAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      const schema = z.object({
        group_id: z.number().int().positive().optional(),
        code: codeSchema.optional(),
        title_ru: z.string().min(1).max(255).optional(),
        title_kz: z.string().min(1).max(255).optional(),
        description_ru: z.string().min(1).optional(),
        description_kz: z.string().min(1).optional(),
        sort_order: z.number().int().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation', details: parsed.error.flatten() });
      }
      const patch = { ...parsed.data };
      if (patch.group_id != null) {
        const grp = await db('category_groups').where({ id: patch.group_id }).first();
        if (!grp) return res.status(400).json({ error: 'Категория не найдена' });
      }
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'Нет полей для обновления' });
      }
      const n = await db('subcategories').where({ id }).update(patch);
      if (!n) return res.status(404).json({ error: 'Не найдено' });
      const row = await db('subcategories').where({ id }).first();
      return res.json({ subcategory: row });
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) {
        return res.status(409).json({ error: 'Код услуги уже занят' });
      }
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.delete('/admin/subcategories/:id', needAdmin, async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const trx = await db.transaction();
    try {
      await trx('applications').where({ subcategory_id: id }).del();
      await trx('questions').where({ subcategory_id: id }).del();
      await trx('partner_service_assignments').where({ subcategory_id: id }).del();
      const n = await trx('subcategories').where({ id }).del();
      await trx.commit();
      if (!n) return res.status(404).json({ error: 'Не найдено' });
      return res.json({ ok: true });
    } catch (e) {
      await trx.rollback();
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.get('/admin/subcategories/:id/partners', needAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      const sub = await db('subcategories').where({ id }).first();
      if (!sub) return res.status(404).json({ error: 'Услуга не найдена' });
      const rows = await db('partner_service_assignments')
        .where({ subcategory_id: id })
        .pluck('user_id');
      return res.json({ subcategory_id: id, partner_user_ids: rows });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.put('/admin/subcategories/:id/partners', needAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      const schema = z.object({
        partner_user_ids: z.array(z.number().int().positive()),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation', details: parsed.error.flatten() });
      }
      const sub = await db('subcategories').where({ id }).first();
      if (!sub) return res.status(404).json({ error: 'Услуга не найдена' });

      const ids = [...new Set(parsed.data.partner_user_ids)];
      if (ids.length) {
        const partners = await db('users').whereIn('id', ids).where({ role: USER_ROLE.PARTNER }).pluck('id');
        if (partners.length !== ids.length) {
          return res.status(400).json({ error: 'Все ID должны быть пользователями с ролью partner' });
        }
      }

      const trx = await db.transaction();
      try {
        await trx('partner_service_assignments').where({ subcategory_id: id }).del();
        for (const userId of ids) {
          await trx('partner_service_assignments').insert({
            user_id: userId,
            subcategory_id: id,
            created_at: db.fn.now(),
          });
        }
        await trx.commit();
      } catch (err) {
        await trx.rollback();
        throw err;
      }
      return res.json({ ok: true, subcategory_id: id, partner_user_ids: ids });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  // --- Questions CRUD ---

  r.get('/admin/questions', needAdmin, async (req, res) => {
    try {
      const subId = parseId(req.query.subcategory_id);
      if (!subId) return res.status(400).json({ error: 'subcategory_id обязателен' });
      const questions = await db('questions')
        .where({ subcategory_id: subId })
        .orderBy([
          { column: 'sort_order', order: 'asc' },
          { column: 'id', order: 'asc' },
        ]);
      return res.json({ questions });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.post('/admin/questions', needAdmin, async (req, res) => {
    try {
      const schema = questionSchema
        .required({ subcategory_id: true, question_ru: true, question_kz: true, answer_ru: true, answer_kz: true });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation', details: parsed.error.flatten() });
      }
      const sub = await db('subcategories').where({ id: parsed.data.subcategory_id }).first();
      if (!sub) return res.status(400).json({ error: 'Услуга не найдена' });

      let sort = parsed.data.sort_order;
      if (sort === undefined) {
        const row = await db('questions')
          .where({ subcategory_id: parsed.data.subcategory_id })
          .max('sort_order as m')
          .first();
        sort = Number(row?.m ?? -1) + 1;
      }

      const code = parsed.data.code ?? `${sub.code}-q${Date.now()}`;
      const [id] = await db('questions').insert({
        subcategory_id: parsed.data.subcategory_id,
        code,
        question_ru: parsed.data.question_ru,
        question_kz: parsed.data.question_kz,
        answer_ru: parsed.data.answer_ru,
        answer_kz: parsed.data.answer_kz,
        tags_ru: '[]',
        tags_kz: '[]',
        sort_order: sort,
        created_at: db.fn.now(),
      });
      const row = await db('questions').where({ id }).first();
      return res.status(201).json({ question: row });
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) {
        return res.status(409).json({ error: 'Код вопроса уже занят' });
      }
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.patch('/admin/questions/:id', needAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      const schema = questionSchema.partial();
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation', details: parsed.error.flatten() });
      }
      const patch = { ...parsed.data };
      delete patch.subcategory_id;
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'Нет полей для обновления' });
      }
      const n = await db('questions').where({ id }).update(patch);
      if (!n) return res.status(404).json({ error: 'Вопрос не найден' });
      const row = await db('questions').where({ id }).first();
      return res.json({ question: row });
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) {
        return res.status(409).json({ error: 'Код вопроса уже занят' });
      }
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.delete('/admin/questions/:id', needAdmin, async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      const n = await db('questions').where({ id }).del();
      if (!n) return res.status(404).json({ error: 'Вопрос не найден' });
      return res.json({ ok: true });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.get('/admin/stats', needAdmin, async (_req, res) => {
    try {
      const [[{ c: users }], [{ c: categories }], [{ c: services }], [{ c: questions }], [{ c: partners }]] =
        await Promise.all([
          db('users').count({ c: '*' }),
          db('category_groups').count({ c: '*' }),
          db('subcategories').count({ c: '*' }),
          db('questions').count({ c: '*' }),
          db('users').where({ role: 'partner' }).count({ c: '*' }),
        ]);
      return res.json({ users: Number(users), categories: Number(categories), services: Number(services), questions: Number(questions), partners: Number(partners) });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });
}
