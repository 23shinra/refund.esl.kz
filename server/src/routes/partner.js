import express from 'express';
import { z } from 'zod';

import { PARTNER_MAX_SERVICES } from '../constants/partnerLimits.js';
import { partnerAuthMiddleware } from '../middleware/partnerAuth.js';

export function partnerRouter(db) {
  const r = express.Router();
  const need = partnerAuthMiddleware(db);

  async function getAssignedSubIds(userId) {
    const rows = await db('partner_service_assignments').where({ user_id: userId }).select('subcategory_id');
    return rows.map((x) => x.subcategory_id);
  }

  /** Каталог услуг + отметка «подключён» */
  r.get('/partner/catalog', need, async (req, res) => {
    try {
      const assigned = new Set(await getAssignedSubIds(req.partnerUserId));
      const rows = await db('subcategories as s')
        .join('category_groups as g', 'g.id', 's.group_id')
        .select(
          's.id',
          's.code',
          's.title_ru',
          's.title_kz',
          'g.title_ru as group_title_ru',
          'g.code as group_code',
        )
        .orderBy([{ column: 'g.sort_order', order: 'asc' }, { column: 's.sort_order', order: 'asc' }]);

      return res.json({
        maxServices: PARTNER_MAX_SERVICES,
        linkedCount: assigned.size,
        items: rows.map((row) => ({
          ...row,
          linked: assigned.has(row.id),
        })),
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.post('/partner/services', need, async (req, res) => {
    try {
      const schema = z.object({ subcategoryId: z.number().int().positive() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Invalid body', details: parsed.error.flatten() });

      const { subcategoryId } = parsed.data;
      const sub = await db('subcategories').where({ id: subcategoryId }).first();
      if (!sub) return res.status(404).json({ error: 'Услуга не найдена' });

      const countRow = await db('partner_service_assignments')
        .where({ user_id: req.partnerUserId })
        .count('* as c')
        .first();
      const n = Number(countRow?.c ?? 0);
      if (n >= PARTNER_MAX_SERVICES) {
        return res.status(400).json({ error: `Максимум ${PARTNER_MAX_SERVICES} услуг` });
      }

      try {
        await db('partner_service_assignments').insert({
          user_id: req.partnerUserId,
          subcategory_id: subcategoryId,
          created_at: db.fn.now(),
        });
      } catch (err) {
        if (String(err.message).includes('UNIQUE')) {
          return res.json({ ok: true, already: true });
        }
        throw err;
      }
      return res.json({ ok: true });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.delete('/partner/services/:subcategoryId', need, async (req, res) => {
    try {
      const subcategoryId = Number.parseInt(String(req.params.subcategoryId), 10);
      if (!Number.isFinite(subcategoryId)) return res.status(400).json({ error: 'Invalid id' });
      const del = await db('partner_service_assignments')
        .where({ user_id: req.partnerUserId, subcategory_id: subcategoryId })
        .del();
      return res.json({ ok: true, removed: del });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.get('/partner/applications', need, async (req, res) => {
    try {
      const subIds = await getAssignedSubIds(req.partnerUserId);
      if (!subIds.length) {
        return res.json({ applications: [], total: 0, limit: 50, offset: 0 });
      }
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
      const offset = Math.max(0, Number(req.query.offset) || 0);

      const totalRow = await db('applications').whereIn('subcategory_id', subIds).count('* as c').first();
      const total = Number(totalRow?.c ?? 0);

      const applications = await db('applications as a')
        .whereIn('a.subcategory_id', subIds)
        .join('subcategories as s', 's.id', 'a.subcategory_id')
        .join('questions as q', 'q.id', 'a.question_id')
        .select(
          'a.id',
          'a.phone',
          'a.name',
          'a.comment',
          'a.lang',
          'a.status',
          'a.created_at',
          's.code as subcategory_code',
          's.title_ru as subcategory_title',
          'q.code as question_code',
          db.raw('substr(q.question_ru, 1, 120) as question_preview'),
        )
        .orderBy('a.created_at', 'desc')
        .limit(limit)
        .offset(offset);

      return res.json({ applications, total, limit, offset });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  const statusSchema = z.enum(['new', 'in_progress', 'done']);

  r.patch('/partner/applications/:id', need, async (req, res) => {
    try {
      const id = Number.parseInt(String(req.params.id), 10);
      if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
      const body = z.object({ status: statusSchema }).safeParse(req.body);
      if (!body.success) return res.status(400).json({ error: 'Invalid status' });

      const subIds = await getAssignedSubIds(req.partnerUserId);
      const app = await db('applications').where({ id }).first();
      if (!app) return res.status(404).json({ error: 'Not found' });
      if (!subIds.includes(app.subcategory_id)) return res.status(403).json({ error: 'Forbidden' });

      await db('applications').where({ id }).update({ status: body.data.status });
      const row = await db('applications').where({ id }).first();
      return res.json({ application: row });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.get('/partner/analytics', need, async (req, res) => {
    try {
      const subIds = await getAssignedSubIds(req.partnerUserId);
      if (!subIds.length) {
        return res.json({
          linkedServices: 0,
          totalApplications: 0,
          bySubcategory: [],
          last7Days: [],
        });
      }

      const totalRow = await db('applications').whereIn('subcategory_id', subIds).count('* as c').first();
      const totalApplications = Number(totalRow?.c ?? 0);

      const bySub = await db('applications as a')
        .join('subcategories as s', 's.id', 'a.subcategory_id')
        .whereIn('a.subcategory_id', subIds)
        .select('s.id', 's.code', 's.title_ru')
        .count('a.id as applications')
        .groupBy('s.id', 's.code', 's.title_ru');

      const last7Rows = await db('applications as a')
        .whereIn('a.subcategory_id', subIds)
        .whereRaw("datetime(a.created_at) >= datetime('now', '-6 days')")
        .select(db.raw(`strftime('%Y-%m-%d', a.created_at) as day`))
        .count('* as cnt')
        .groupByRaw(`strftime('%Y-%m-%d', a.created_at)`)
        .orderBy('day', 'asc');

      return res.json({
        linkedServices: subIds.length,
        maxServices: PARTNER_MAX_SERVICES,
        totalApplications,
        bySubcategory: bySub.map((row) => ({
          subcategoryId: row.id,
          code: row.code,
          title: row.title_ru,
          applications: Number(row.applications ?? row.cnt ?? 0),
        })),
        last7Days: last7Rows.map((row) => ({
          day: row.day,
          count: Number(row.cnt ?? row['count(*)'] ?? 0),
        })),
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  return r;
}
