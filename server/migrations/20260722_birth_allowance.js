/**
 * Real benefit: state childbirth allowance (RK, 2026 amounts from egov.kz).
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  const group = await knex('category_groups').where({ code: 'ind-family' }).first();
  if (!group) return;

  const existing = await knex('subcategories').where({ code: 'ind-family-birth-allowance' }).first();
  if (existing) return;

  // Shift other family subcategories down so the real benefit is first in the list.
  await knex('subcategories').where({ group_id: group.id }).increment('sort_order', 1);

  const answerRu = `Государственное пособие на рождение ребёнка (единовременно)

Размер в 2026 году (МРП = 4 325 ₸):
• 1-й, 2-й или 3-й ребёнок — 38 МРП = 164 350 ₸
• 4-й и последующие — 63 МРП = 272 475 ₸

Кому положено:
• Работающим и неработающим женщинам (родителям)
• Не зависит от дохода семьи
• При рождении двух и более детей — на каждого ребёнка отдельно

Срок обращения:
• Не позднее 18 месяцев со дня рождения ребёнка

Как подать:
1) Портал egov.kz или приложение eGov mobile
2) ЦОН («Правительство для граждан»)
3) SMS по приглашению / приложения банков второго уровня

Документы (типичный пакет):
• Удостоверение личности
• Свидетельство о рождении ребёнка
• Реквизиты специального социального счёта

Официальный источник:
https://egov.kz/cms/ru/articles/allowance
(Социальный кодекс РК, ст. 80)

Важно: перед подачей сверьте актуальные условия на egov.kz — суммы ежегодно пересчитываются от МРП.`;

  const answerKz = `Бала туғандағы мемлекеттік жәрдемақы (біржолғы)

2026 жылғы мөлшері (АЕК = 4 325 ₸):
• 1-ші, 2-ші немесе 3-ші бала — 38 АЕК = 164 350 ₸
• 4-ші және одан кейінгі — 63 АЕК = 272 475 ₸

Кімге беріледі:
• Жұмыс істейтін және жұмыс істемейтін әйелдерге (ата-аналарға)
• Отбасы табысына байланысты емес
• Егіз және одан көп туса — әр балаға бөлек

Өтініш мерзімі:
• Бала туған күннен бастап 18 айдан кешіктірмей

Қалай беру керек:
1) egov.kz порталы немесе eGov mobile
2) ХҚКО («Азаматтарға арналған үкімет»)
3) SMS шақыру / екінші деңгейлі банк қосымшалары

Құжаттар (әдеттегі пакет):
• Жеке куәлік
• Баланың туу туралы куәлігі
• Арнайы әлеуметтік шот реквизиттері

Ресми дереккөз:
https://egov.kz/cms/ru/articles/allowance
(ҚР Әлеуметтік кодексі, 80-бап)

Ескерту: өтініш бермес бұрын egov.kz-тегі өзекті шарттарды тексеріңіз — сомалар жыл сайын АЕК бойынша қайта есептеледі.`;

  const tagsRu = JSON.stringify([
    'рождение',
    'пособие',
    'ребёнок',
    'единовременно',
    'семья',
    '2026',
    'egov',
    'МРП',
  ]);
  const tagsKz = JSON.stringify([
    'туу',
    'жәрдемақы',
    'бала',
    'біржолғы',
    'отбасы',
    '2026',
    'egov',
    'АЕК',
  ]);

  const [subId] = await knex('subcategories').insert({
    group_id: group.id,
    code: 'ind-family-birth-allowance',
    title_ru: 'Пособие на рождение ребёнка',
    title_kz: 'Бала туғандағы жәрдемақы',
    description_ru:
      'Единовременная государственная выплата при рождении ребёнка (актуальные суммы на 2026 год).',
    description_kz: 'Бала туғанда біржолғы мемлекеттік төлем (2026 жылғы өзекті сомалар).',
    sort_order: 0,
  });

  await knex('questions').insert({
    subcategory_id: subId,
    code: 'ind-family-birth-allowance-1',
    question_ru: 'Государственное пособие на рождение ребёнка — сколько платят в 2026 году?',
    question_kz: 'Бала туғандағы мемлекеттік жәрдемақы — 2026 жылы қанша төленеді?',
    answer_ru: answerRu,
    answer_kz: answerKz,
    tags_ru: tagsRu,
    tags_kz: tagsKz,
    sort_order: 0,
  });
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  const sub = await knex('subcategories').where({ code: 'ind-family-birth-allowance' }).first();
  if (!sub) return;
  await knex('questions').where({ subcategory_id: sub.id }).del();
  await knex('subcategories').where({ id: sub.id }).del();
}
