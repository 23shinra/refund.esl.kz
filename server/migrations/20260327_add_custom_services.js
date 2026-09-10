/**
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  const ensureAudiences = async () => {
    const existing = await knex('audiences').select('id', 'code');
    const have = new Set(existing.map((a) => a.code));
    const toInsert = [];
    if (!have.has('individual')) toInsert.push({ code: 'individual', title_ru: 'Физические лица', title_kz: 'Жеке тұлғалар', created_at: knex.fn.now() });
    if (!have.has('legal')) toInsert.push({ code: 'legal', title_ru: 'Для юридических лиц', title_kz: 'Заңды тұлғаларға', created_at: knex.fn.now() });
    if (toInsert.length) await knex('audiences').insert(toInsert);
  };

  await ensureAudiences();

  const audienceRows = await knex('audiences').select('id', 'code');
  const audienceIdByCode = Object.fromEntries(audienceRows.map((a) => [a.code, a.id]));

  const groups = [
    {
      audience: 'individual',
      code: 'ind-money',
      title_ru: 'Деньги / выплаты',
      title_kz: 'Ақша / төлемдер',
      description_ru: 'Возвраты, компенсации и выплаты для физических лиц.',
      description_kz: 'Жеке тұлғаларға қайтарымдар, өтемақылар және төлемдер.',
      subcategories: [
        {
          code: 'ind-money-foreign-bookmakers-refund',
          title_ru: 'Возврат денег от иностранных букмекеров',
          title_kz: 'Шетелдік букмекерлерден ақша қайтару',
          description_ru: 'Возврат средств от букмекеров, не зарегистрированных в РК.',
          description_kz: 'ҚР-да тіркелмеген букмекерлерден қаражат қайтару.',
          q: {
            code: 'ind-money-foreign-bookmakers-refund-1',
            question_ru: 'Возврат денег от иностранных букмекеров',
            question_kz: 'Шетелдік букмекерлерден ақша қайтару',
            answer_ru:
              'Собираем подтверждения платежей и переписку, формируем претензию/запросы, сопровождаем процедуру возврата по правилам платёжных систем и сервисов.',
            answer_kz:
              'Собираем подтверждения платежей и переписку, формируем претензию/запросы, сопровождаем процедуру возврата по правилам платёжных систем и сервисов.',
            tags_ru: JSON.stringify(['букмекер', 'возврат', 'зарубежные', 'chargeback']),
            tags_kz: JSON.stringify(['букмекер', 'қайтару', 'шетел', 'chargeback']),
          },
        },
        {
          code: 'ind-money-tax-overpayment-refund',
          title_ru: 'Возврат переплаченных налогов',
          title_kz: 'Артық төленген салықтарды қайтару',
          description_ru: 'Проверка и возврат переплат по ИПН/транспорт/имущество.',
          description_kz: 'ЖТС/көлік/мүлік бойынша артық төлемді тексеру және қайтару.',
          q: {
            code: 'ind-money-tax-overpayment-refund-1',
            question_ru: 'Проверка и возврат переплаченных налогов',
            question_kz: 'Артық төленген салықтарды тексеру және қайтару',
            answer_ru: 'Проверяем начисления и платежи, находим переплату, готовим заявление и сопровождаем возврат или зачет.',
            answer_kz: 'Проверяем начисления и платежи, находим переплату, готовим заявление и сопровождаем возврат или зачет.',
            tags_ru: JSON.stringify(['налоги', 'ИПН', 'переплата', 'возврат']),
            tags_kz: JSON.stringify(['салық', 'ЖТС', 'артық төлем', 'қайтару']),
          },
        },
        {
          code: 'ind-money-utilities-subsidy',
          title_ru: 'Компенсации по ЖКХ (субсидии)',
          title_kz: 'ЖКХ өтемақысы (субсидия)',
          description_ru: 'Помощь в получении компенсаций/субсидий на коммуналку.',
          description_kz: 'Коммуналдық төлемге субсидия/өтемақы алуға көмек.',
          q: {
            code: 'ind-money-utilities-subsidy-1',
            question_ru: 'Компенсации по ЖКХ (субсидии)',
            question_kz: 'Коммуналдық субсидия',
            answer_ru: 'Проверяем критерии, собираем документы, подаем заявку и контролируем статус до решения.',
            answer_kz: 'Проверяем критерии, собираем документы, подаем заявку и контролируем статус до решения.',
            tags_ru: JSON.stringify(['ЖКХ', 'субсидия', 'коммуналка']),
            tags_kz: JSON.stringify(['коммуналдық', 'субсидия', 'коммуналка']),
          },
        },
        {
          code: 'ind-money-unemployment-payments',
          title_ru: 'Выплаты при потере работы',
          title_kz: 'Жұмыстан айырылғанда төлем',
          description_ru: 'Оформление выплат при сокращении/потере работы.',
          description_kz: 'Қысқарту/жұмыстан айырылу кезінде төлем рәсімдеу.',
          q: {
            code: 'ind-money-unemployment-payments-1',
            question_ru: 'Выплаты при потере работы',
            question_kz: 'Жұмыстан айырылғанда төлем',
            answer_ru: 'Проверяем право, готовим пакет документов, подаем заявку и сопровождаем до назначения.',
            answer_kz: 'Проверяем право, готовим пакет документов, подаем заявку и сопровождаем до назначения.',
            tags_ru: JSON.stringify(['безработица', 'сокращение', 'пособие']),
            tags_kz: JSON.stringify(['жұмыссыздық', 'қысқарту', 'жәрдемақы']),
          },
        },
        {
          code: 'ind-money-enpf-stuck-funds',
          title_ru: 'Возврат/поиск зависших пенсионных (ЕНПФ)',
          title_kz: 'ЕНПФ “тұрып қалған” қаражатты табу/қайтару',
          description_ru: 'Поиск и возврат зависших пенсионных/ЕНПФ средств.',
          description_kz: 'Зейнетақы/ЕНПФ қаражатын іздеу және қайтару.',
          q: {
            code: 'ind-money-enpf-stuck-funds-1',
            question_ru: 'Поиск и возврат зависших пенсионных/ЕНПФ средств',
            question_kz: 'ЕНПФ қаражатын іздеу және қайтару',
            answer_ru: 'Проверяем начисления/перечисления, находим расхождения, готовим обращения и сопровождаем корректировку/возврат.',
            answer_kz: 'Проверяем начисления/перечисления, находим расхождения, готовим обращения и сопровождаем корректировку/возврат.',
            tags_ru: JSON.stringify(['ЕНПФ', 'пенсионные', 'возврат']),
            tags_kz: JSON.stringify(['ЕНПФ', 'зейнетақы', 'қайтару']),
          },
        },
      ],
    },
    {
      audience: 'individual',
      code: 'ind-realty',
      title_ru: 'Недвижимость / земля',
      title_kz: 'Жылжымайтын мүлік / жер',
      description_ru: 'Земля, ИЖС, легализация и изменения категорий.',
      description_kz: 'Жер, жеке үй, заңдастыру және санат өзгерту.',
      subcategories: [
        {
          code: 'ind-realty-izhs-land-queue',
          title_ru: 'Земельный участок под ИЖС (очередь)',
          title_kz: 'Жеке үйге жер (кезек)',
          description_ru: 'Очередь и контроль статуса на участок под ИЖС.',
          description_kz: 'Жеке үйге жер кезегі мен статус бақылау.',
          q: {
            code: 'ind-realty-izhs-land-queue-1',
            question_ru: 'Получение земельного участка под ИЖС',
            question_kz: 'Жеке үйге жер алу',
            answer_ru: 'Проверяем очередь/статус, готовим обращения, сопровождаем процесс до результата.',
            answer_kz: 'Проверяем очередь/статус, готовим обращения, сопровождаем процесс до результата.',
            tags_ru: JSON.stringify(['ИЖС', 'земля', 'акимат', 'очередь']),
            tags_kz: JSON.stringify(['ИЖС', 'жер', 'әкімдік', 'кезек']),
          },
        },
        {
          code: 'ind-realty-land-allocation-speedup',
          title_ru: 'Ускорение выделения земли от акимата',
          title_kz: 'Әкімдіктен жер бөлуді жеделдету',
          description_ru: 'Проверка и ускорение выделения земли.',
          description_kz: 'Жер бөлуді тексеру және жеделдету.',
          q: {
            code: 'ind-realty-land-allocation-speedup-1',
            question_ru: 'Проверка и ускорение выделения земли',
            question_kz: 'Жер бөлуді тексеру және жеделдету',
            answer_ru: 'Анализируем этап, готовим запросы, помогаем пройти согласования.',
            answer_kz: 'Анализируем этап, готовим запросы, помогаем пройти согласования.',
            tags_ru: JSON.stringify(['земля', 'акимат', 'ускорение']),
            tags_kz: JSON.stringify(['жер', 'әкімдік', 'жеделдету']),
          },
        },
      ],
    },
    {
      audience: 'individual',
      code: 'ind-legal-help',
      title_ru: 'Юридическая помощь',
      title_kz: 'Құқықтық көмек',
      description_ru: 'Аресты, долги, штрафы, проверки.',
      description_kz: 'Тыйым, қарыз, айыппұл, тексеріс.',
      subcategories: [
        {
          code: 'ind-legal-unblock-accounts',
          title_ru: 'Снятие арестов/блокировок счетов',
          title_kz: 'Шоттағы тыйымды/бұғаттауды шешу',
          description_ru: 'Снятие арестов со счетов и разблокировка.',
          description_kz: 'Шот бұғаттауын шешу.',
          q: {
            code: 'ind-legal-unblock-accounts-1',
            question_ru: 'Снятие арестов/блокировок счетов',
            question_kz: 'Шот бұғаттауын шешу',
            answer_ru: 'Выясняем основание, готовим обращения/жалобы, сопровождаем снятие ограничений.',
            answer_kz: 'Выясняем основание, готовим обращения/жалобы, сопровождаем снятие ограничений.',
            tags_ru: JSON.stringify(['арест', 'блокировка', 'счета']),
            tags_kz: JSON.stringify(['тыйым', 'бұғаттау', 'шот']),
          },
        },
      ],
    },
    {
      audience: 'individual',
      code: 'ind-docs',
      title_ru: 'Иммиграция / документы',
      title_kz: 'Иммиграция / құжаттар',
      description_ru: 'ВНЖ, гражданство, ПМЖ, восстановление документов.',
      description_kz: 'ТЖК, азаматтық, ТТЖ, құжат қалпына келтіру.',
      subcategories: [
        {
          code: 'ind-docs-residence-citizenship',
          title_ru: 'ВНЖ / гражданство',
          title_kz: 'ТЖК / азаматтық',
          description_ru: 'Получение ВНЖ/гражданства с сопровождением.',
          description_kz: 'ТЖК/азаматтық алу (сүйемелдеу).',
          q: {
            code: 'ind-docs-residence-citizenship-1',
            question_ru: 'Получение ВНЖ / гражданства',
            question_kz: 'ТЖК / азаматтық алу',
            answer_ru: 'Определяем основание, готовим пакет документов, подаем и сопровождаем до решения.',
            answer_kz: 'Определяем основание, готовим пакет документов, подаем и сопровождаем до решения.',
            tags_ru: JSON.stringify(['ВНЖ', 'гражданство', 'миграция']),
            tags_kz: JSON.stringify(['ТЖК', 'азаматтық', 'көші-қон']),
          },
        },
      ],
    },
    {
      audience: 'individual',
      code: 'ind-other',
      title_ru: 'Прочее',
      title_kz: 'Басқа',
      description_ru: 'AI‑подбор, проверки выплат и обучение.',
      description_kz: 'AI‑таңдау, төлем тексеру және оқу.',
      subcategories: [
        {
          code: 'ind-other-ai-benefits',
          title_ru: 'AI‑подбор льгот под человека',
          title_kz: 'Адамға лайық жеңілдіктерді AI арқылы таңдау',
          description_ru: 'Подбор всех доступных льгот под конкретного человека.',
          description_kz: 'Нақты адамға қолжетімді жеңілдіктерді таңдау.',
          q: {
            code: 'ind-other-ai-benefits-1',
            question_ru: 'Подбор всех доступных льгот (AI)',
            question_kz: 'AI арқылы жеңілдіктерді таңдау',
            answer_ru: 'Задаём вопросы, формируем профиль и подбираем подходящие услуги/льготы из каталога.',
            answer_kz: 'Задаём вопросы, формируем профиль и подбираем подходящие услуги/льготы из каталога.',
            tags_ru: JSON.stringify(['AI', 'льготы', 'подбор']),
            tags_kz: JSON.stringify(['AI', 'жеңілдіктер', 'таңдау']),
          },
        },
      ],
    },
    {
      audience: 'legal',
      code: 'legal-money-optimization',
      title_ru: 'Деньги / оптимизация',
      title_kz: 'Ақша / оңтайландыру',
      description_ru: 'НДС, налоговая оптимизация, возвраты и выводы.',
      description_kz: 'ҚҚС, салықты оңтайландыру, қайтарымдар.',
      subcategories: [
        {
          code: 'legal-money-vat-refund',
          title_ru: 'Возврат переплаченного НДС',
          title_kz: 'Артық төленген ҚҚС қайтару',
          description_ru: 'Возврат переплаченного НДС.',
          description_kz: 'Артық төленген ҚҚС қайтару.',
          q: {
            code: 'legal-money-vat-refund-1',
            question_ru: 'Возврат переплаченного НДС',
            question_kz: 'ҚҚС қайтару',
            answer_ru: 'Проверяем учет/документы, готовим пакет и сопровождаем процесс возврата/зачета.',
            answer_kz: 'Проверяем учет/документы, готовим пакет и сопровождаем процесс возврата/зачета.',
            tags_ru: JSON.stringify(['НДС', 'возврат', 'налоги']),
            tags_kz: JSON.stringify(['ҚҚС', 'қайтару', 'салық']),
          },
        },
      ],
    },
  ];

  async function ensureGroup(trx, g, groupOrder) {
    const existing = await trx('category_groups').where({ code: g.code }).first();
    if (existing?.id) return existing.id;
    const max = await trx('category_groups').where({ audience_id: audienceIdByCode[g.audience] }).max({ m: 'sort_order' }).first();
    const sort = Number(max?.m ?? -1) + 1 + groupOrder * 0.01;
    const [id] = await trx('category_groups').insert({
      audience_id: audienceIdByCode[g.audience],
      code: g.code,
      title_ru: g.title_ru,
      title_kz: g.title_kz,
      description_ru: g.description_ru,
      description_kz: g.description_kz,
      sort_order: sort,
      created_at: trx.fn.now(),
    });
    return id;
  }

  async function ensureSubcategory(trx, groupId, s, subOrder) {
    const existing = await trx('subcategories').where({ code: s.code }).first();
    if (existing?.id) return existing.id;
    const max = await trx('subcategories').where({ group_id: groupId }).max({ m: 'sort_order' }).first();
    const sort = Number(max?.m ?? -1) + 1 + subOrder * 0.01;
    const [id] = await trx('subcategories').insert({
      group_id: groupId,
      code: s.code,
      title_ru: s.title_ru,
      title_kz: s.title_kz,
      description_ru: s.description_ru,
      description_kz: s.description_kz,
      sort_order: sort,
      created_at: trx.fn.now(),
    });
    return id;
  }

  async function ensureQuestion(trx, subcategoryId, q) {
    const existing = await trx('questions').where({ code: q.code }).first();
    if (existing?.id) return existing.id;
    const max = await trx('questions').where({ subcategory_id: subcategoryId }).max({ m: 'sort_order' }).first();
    const sort = Number(max?.m ?? -1) + 1;
    const [id] = await trx('questions').insert({
      subcategory_id: subcategoryId,
      code: q.code,
      question_ru: q.question_ru,
      question_kz: q.question_kz,
      answer_ru: q.answer_ru,
      answer_kz: q.answer_kz,
      tags_ru: q.tags_ru,
      tags_kz: q.tags_kz,
      sort_order: sort,
      created_at: trx.fn.now(),
    });
    return id;
  }

  await knex.transaction(async (trx) => {
    for (let gi = 0; gi < groups.length; gi += 1) {
      const g = groups[gi];
      const groupId = await ensureGroup(trx, g, gi);
      for (let si = 0; si < (g.subcategories ?? []).length; si += 1) {
        const s = g.subcategories[si];
        const subId = await ensureSubcategory(trx, groupId, s, si);
        if (s.q) await ensureQuestion(trx, subId, s.q);
      }
    }
  });
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  const groupCodes = [
    'ind-money',
    'ind-realty',
    'ind-legal-help',
    'ind-docs',
    'ind-other',
    'legal-money-optimization',
  ];
  const subCodes = [
    'ind-money-foreign-bookmakers-refund',
    'ind-money-tax-overpayment-refund',
    'ind-money-utilities-subsidy',
    'ind-money-unemployment-payments',
    'ind-money-enpf-stuck-funds',
    'ind-realty-izhs-land-queue',
    'ind-realty-land-allocation-speedup',
    'ind-legal-unblock-accounts',
    'ind-docs-residence-citizenship',
    'ind-other-ai-benefits',
    'legal-money-vat-refund',
  ];
  const qCodes = [
    'ind-money-foreign-bookmakers-refund-1',
    'ind-money-tax-overpayment-refund-1',
    'ind-money-utilities-subsidy-1',
    'ind-money-unemployment-payments-1',
    'ind-money-enpf-stuck-funds-1',
    'ind-realty-izhs-land-queue-1',
    'ind-realty-land-allocation-speedup-1',
    'ind-legal-unblock-accounts-1',
    'ind-docs-residence-citizenship-1',
    'ind-other-ai-benefits-1',
    'legal-money-vat-refund-1',
  ];

  await knex.transaction(async (trx) => {
    await trx('questions').whereIn('code', qCodes).del();
    await trx('subcategories').whereIn('code', subCodes).del();
    await trx('category_groups').whereIn('code', groupCodes).del();
  });
}

