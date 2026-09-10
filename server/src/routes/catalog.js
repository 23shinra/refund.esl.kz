import express from 'express';

export function catalogRouter(db) {
  const r = express.Router();

  r.get('/catalog', async (req, res) => {
    try {
      const lang = (req.query.lang === 'kz' ? 'kz' : 'ru');

      const audiences = await db('audiences').select('id', 'code', `title_${lang} as title`).orderBy('id');
      const groups = await db('category_groups')
        .select('id', 'audience_id', 'code', `title_${lang} as title`, `description_${lang} as description`, 'sort_order')
        .orderBy([{ column: 'sort_order', order: 'asc' }, { column: 'id', order: 'asc' }]);
      const subcategories = await db('subcategories')
        .select('id', 'group_id', 'code', `title_${lang} as title`, `description_${lang} as description`, 'sort_order')
        .orderBy([{ column: 'sort_order', order: 'asc' }, { column: 'id', order: 'asc' }]);
      const questions = await db('questions')
        .select(
          'id',
          'subcategory_id',
          'code',
          `question_${lang} as question`,
          `answer_${lang} as answer`,
          `tags_${lang} as tags`,
          'sort_order',
        )
        .orderBy([{ column: 'sort_order', order: 'asc' }, { column: 'id', order: 'asc' }]);

      return res.json({ lang, audiences, groups, subcategories, questions });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.get('/subcategories/:code', async (req, res) => {
    try {
      const lang = (req.query.lang === 'kz' ? 'kz' : 'ru');
      const code = req.params.code;

      const sub = await db('subcategories')
        .select('id', 'group_id', 'code', `title_${lang} as title`, `description_${lang} as description`)
        .where({ code })
        .first();
      if (!sub) return res.status(404).json({ error: 'Not found' });

      const group = await db('category_groups')
        .select('id', 'audience_id', 'code', `title_${lang} as title`, `description_${lang} as description`)
        .where({ id: sub.group_id })
        .first();

      const questions = await db('questions')
        .select('id', 'subcategory_id', 'code', `question_${lang} as question`, `answer_${lang} as answer`, `tags_${lang} as tags`)
        .where({ subcategory_id: sub.id })
        .orderBy([{ column: 'sort_order', order: 'asc' }, { column: 'id', order: 'asc' }]);

      return res.json({ lang, subcategory: sub, group, questions });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  return r;
}

