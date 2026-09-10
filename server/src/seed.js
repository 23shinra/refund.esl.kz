import { benefitsCatalog } from '../../src/data/benefitsData.js';

function pickLang(obj, lang) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] ?? obj.ru ?? '';
}

function pickTags(tags, lang) {
  if (!Array.isArray(tags)) return [];
  return tags.map((t) => (typeof t === 'string' ? t : (t?.[lang] ?? t?.ru ?? ''))).filter(Boolean);
}

export async function seedCatalog(db, { force = false } = {}) {
  const existing = await db('audiences').count({ c: '*' }).first();
  const count = Number(existing?.c ?? 0);
  if (!force && count > 0) return { ok: true, seeded: false };

  const trx = await db.transaction();
  try {
    // wipe order (FK)
    await trx('applications').del();
    await trx('questions').del();
    await trx('subcategories').del();
    await trx('category_groups').del();
    await trx('audiences').del();

    const audienceRows = [
      { code: 'individual', title_ru: 'Физические лица', title_kz: 'Жеке тұлғалар' },
      { code: 'legal', title_ru: 'Для юридических лиц', title_kz: 'Заңды тұлғаларға' },
    ];
    await trx('audiences').insert(audienceRows);
    const audiences = await trx('audiences').select('id', 'code');
    const audienceIdByCode = Object.fromEntries(audiences.map((a) => [a.code, a.id]));

    for (let gi = 0; gi < benefitsCatalog.length; gi += 1) {
      const g = benefitsCatalog[gi];
      const [groupId] = await trx('category_groups').insert({
        audience_id: audienceIdByCode[g.audience],
        code: g.id,
        title_ru: pickLang(g.title, 'ru'),
        title_kz: pickLang(g.title, 'kz'),
        description_ru: pickLang(g.description, 'ru'),
        description_kz: pickLang(g.description, 'kz'),
        sort_order: gi,
      });

      for (let si = 0; si < (g.subcategories ?? []).length; si += 1) {
        const s = g.subcategories[si];
        const [subId] = await trx('subcategories').insert({
          group_id: groupId,
          code: s.id,
          title_ru: pickLang(s.title, 'ru'),
          title_kz: pickLang(s.title, 'kz'),
          description_ru: pickLang(s.description, 'ru'),
          description_kz: pickLang(s.description, 'kz'),
          sort_order: si,
        });

        for (let qi = 0; qi < (s.questions ?? []).length; qi += 1) {
          const q = s.questions[qi];
          await trx('questions').insert({
            subcategory_id: subId,
            code: q.id,
            question_ru: pickLang(q.question, 'ru'),
            question_kz: pickLang(q.question, 'kz'),
            answer_ru: pickLang(q.answer, 'ru'),
            answer_kz: pickLang(q.answer, 'kz'),
            tags_ru: JSON.stringify(pickTags(q.tags, 'ru')),
            tags_kz: JSON.stringify(pickTags(q.tags, 'kz')),
            sort_order: qi,
          });
        }
      }
    }

    await trx.commit();
    return { ok: true, seeded: true };
  } catch (e) {
    await trx.rollback();
    throw e;
  }
}

