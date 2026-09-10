/**
 * Adds remaining custom services (non-destructive).
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
      code: 'ind-realty',
      title_ru: 'Недвижимость / земля',
      title_kz: 'Жылжымайтын мүлік / жер',
      description_ru: 'Земля, ИЖС, легализация и изменения категорий.',
      description_kz: 'Жер, жеке үй, заңдастыру және санат өзгерту.',
      subcategories: [
        {
          code: 'ind-realty-state-land-rent-business',
          title_ru: 'Аренда госземли под бизнес',
          title_kz: 'Мемжерді бизнеске жалға алу',
          description_ru: 'Помощь в получении аренды госземли под бизнес.',
          description_kz: 'Бизнес үшін мемжерді жалға алуға көмек.',
          q: {
            code: 'ind-realty-state-land-rent-business-1',
            question_ru: 'Аренда госземли под бизнес',
            question_kz: 'Мемжерді бизнеске жалға алу',
            answer_ru: 'Подбираем участок/условия, готовим документы и сопровождаем получение аренды.',
            answer_kz: 'Подбираем участок/условия, готовим документы и сопровождаем получение аренды.',
            tags_ru: JSON.stringify(['аренда', 'земля', 'госземля', 'бизнес']),
            tags_kz: JSON.stringify(['жалдау', 'жер', 'мемжер', 'бизнес']),
          },
        },
        {
          code: 'ind-realty-selfbuild-legalization',
          title_ru: 'Легализация самостроя',
          title_kz: 'Өз бетінше салынған үйді заңдастыру',
          description_ru: 'Оформление легализации самостроя.',
          description_kz: 'Самостройды заңдастыру.',
          q: {
            code: 'ind-realty-selfbuild-legalization-1',
            question_ru: 'Легализация самостроя',
            question_kz: 'Самостройды заңдастыру',
            answer_ru: 'Проверяем документы/статус, формируем шаги легализации и сопровождаем согласования.',
            answer_kz: 'Проверяем документы/статус, формируем шаги легализации и сопровождаем согласования.',
            tags_ru: JSON.stringify(['самострой', 'легализация', 'недвижимость']),
            tags_kz: JSON.stringify(['самострой', 'заңдастыру', 'мүлік']),
          },
        },
        {
          code: 'ind-realty-land-category-change',
          title_ru: 'Перевод земли в другую категорию',
          title_kz: 'Жер санатын өзгерту',
          description_ru: 'Перевод земли из одной категории в другую.',
          description_kz: 'Жерді бір санаттан екіншісіне ауыстыру.',
          q: {
            code: 'ind-realty-land-category-change-1',
            question_ru: 'Перевод земли в другую категорию',
            question_kz: 'Жер санатын өзгерту',
            answer_ru: 'Проверяем ограничения, готовим пакет и сопровождаем процедуру смены назначения.',
            answer_kz: 'Проверяем ограничения, готовим пакет и сопровождаем процедуру смены назначения.',
            tags_ru: JSON.stringify(['назначение земли', 'перевод', 'акимат']),
            tags_kz: JSON.stringify(['жер мақсаты', 'ауыстыру', 'әкімдік']),
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
          code: 'ind-legal-debt-writeoff-support',
          title_ru: 'Списание долгов (с сопровождением)',
          title_kz: 'Қарызды есептен шығару (сүйемелдеу)',
          description_ru: 'Сопровождение процесса списания/реструктуризации долгов.',
          description_kz: 'Қарызды есептен шығару/қайта құрылымдау.',
          q: {
            code: 'ind-legal-debt-writeoff-support-1',
            question_ru: 'Помощь в списании долгов',
            question_kz: 'Қарызды есептен шығаруға көмек',
            answer_ru: 'Оцениваем ситуацию, подбираем стратегию, готовим документы и сопровождаем процесс.',
            answer_kz: 'Оцениваем ситуацию, подбираем стратегию, готовим документы и сопровождаем процесс.',
            tags_ru: JSON.stringify(['долги', 'банкротство', 'реструктуризация']),
            tags_kz: JSON.stringify(['қарыз', 'банкроттық', 'қайта құрылымдау']),
          },
        },
        {
          code: 'ind-legal-fines-appeal',
          title_ru: 'Обжалование штрафов',
          title_kz: 'Айыппұлға шағым',
          description_ru: 'ПДД, налоги, административные штрафы.',
          description_kz: 'Жол ережесі, салық, әкімшілік айыппұл.',
          q: {
            code: 'ind-legal-fines-appeal-1',
            question_ru: 'Обжалование штрафов (ПДД/налоги/административка)',
            question_kz: 'Айыппұлға шағым',
            answer_ru: 'Анализируем постановление, собираем доказательства, готовим жалобу и сопровождаем рассмотрение.',
            answer_kz: 'Анализируем постановление, собираем доказательства, готовим жалобу и сопровождаем рассмотрение.',
            tags_ru: JSON.stringify(['штраф', 'ПДД', 'жалоба']),
            tags_kz: JSON.stringify(['айыппұл', 'жол ережесі', 'шағым']),
          },
        },
        {
          code: 'ind-legal-check-debts-courts',
          title_ru: 'Проверка на долги и суды',
          title_kz: 'Қарыз және сот бойынша тексеру',
          description_ru: 'Проверка человека/компании на долги и суды.',
          description_kz: 'Адам/компания бойынша қарыз және сот тексеруі.',
          q: {
            code: 'ind-legal-check-debts-courts-1',
            question_ru: 'Проверка на долги и суды',
            question_kz: 'Қарыз және сот бойынша тексеру',
            answer_ru: 'Собираем данные из доступных источников, формируем отчёт и рекомендации по рискам.',
            answer_kz: 'Собираем данные из доступных источников, формируем отчёт и рекомендации по рискам.',
            tags_ru: JSON.stringify(['проверка', 'долги', 'суды', 'риски']),
            tags_kz: JSON.stringify(['тексеру', 'қарыз', 'сот', 'тәуекел']),
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
          code: 'ind-docs-restore-online',
          title_ru: 'Восстановление документов онлайн',
          title_kz: 'Құжаттарды онлайн қалпына келтіру',
          description_ru: 'Восстановление утерянных документов онлайн.',
          description_kz: 'Жоғалған құжаттарды онлайн қалпына келтіру.',
          q: {
            code: 'ind-docs-restore-online-1',
            question_ru: 'Восстановление утерянных документов онлайн',
            question_kz: 'Жоғалған құжаттарды онлайн қалпына келтіру',
            answer_ru: 'Определяем тип документа, оформляем запрос и сопровождаем получение результата.',
            answer_kz: 'Определяем тип документа, оформляем запрос и сопровождаем получение результата.',
            tags_ru: JSON.stringify(['восстановление', 'документы', 'онлайн']),
            tags_kz: JSON.stringify(['қалпына келтіру', 'құжаттар', 'онлайн']),
          },
        },
        {
          code: 'ind-docs-emigration-permanent',
          title_ru: 'Выезд на ПМЖ',
          title_kz: 'ТТЖ-ға шығу',
          description_ru: 'Оформление выезда на ПМЖ.',
          description_kz: 'Тұрақты тұруға шығуды рәсімдеу.',
          q: {
            code: 'ind-docs-emigration-permanent-1',
            question_ru: 'Оформление выезда на ПМЖ',
            question_kz: 'ТТЖ-ға шығуды рәсімдеу',
            answer_ru: 'Определяем требования и основание, готовим пакет документов, подаем и сопровождаем до завершения.',
            answer_kz: 'Определяем требования и основание, готовим пакет документов, подаем и сопровождаем до завершения.',
            tags_ru: JSON.stringify(['ПМЖ', 'выезд', 'документы']),
            tags_kz: JSON.stringify(['ТТЖ', 'шығу', 'құжаттар']),
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
          code: 'ind-other-missing-payments-check',
          title_ru: 'Проверка “какие выплаты положены”',
          title_kz: '“Қандай төлемдер тиесілі” тексеру',
          description_ru: 'Проверка, какие выплаты положены, но не получаются.',
          description_kz: 'Тиесілі төлемдерді тексеру (алынбай жатқан).',
          q: {
            code: 'ind-other-missing-payments-check-1',
            question_ru: 'Проверка положенных, но не получаемых выплат',
            question_kz: 'Тиесілі төлемдерді тексеру',
            answer_ru: 'Анализируем профиль и статус, сравниваем с программами, подсказываем шаги для оформления.',
            answer_kz: 'Анализируем профиль и статус, сравниваем с программами, подсказываем шаги для оформления.',
            tags_ru: JSON.stringify(['выплаты', 'пособия', 'проверка']),
            tags_kz: JSON.stringify(['төлемдер', 'жәрдемақы', 'тексеру']),
          },
        },
        {
          code: 'ind-other-education-grants',
          title_ru: 'Гранты / госпрограммы для обучения',
          title_kz: 'Оқу гранттары / мембағдарламалар',
          description_ru: 'Помощь в получении грантов/программ для обучения.',
          description_kz: 'Оқу гранттары/бағдарламаларын алуға көмек.',
          q: {
            code: 'ind-other-education-grants-1',
            question_ru: 'Гранты / госпрограммы для обучения',
            question_kz: 'Оқу гранттары / бағдарламалар',
            answer_ru: 'Подбираем программы, проверяем требования, готовим документы и сопровождаем подачу.',
            answer_kz: 'Подбираем программы, проверяем требования, готовим документы и сопровождаем подачу.',
            tags_ru: JSON.stringify(['гранты', 'обучение', 'госпрограмма']),
            tags_kz: JSON.stringify(['грант', 'оқу', 'бағдарлама']),
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
          code: 'legal-money-tax-optimization',
          title_ru: 'Оптимизация налогов (легально)',
          title_kz: 'Салықты оңтайландыру (заңды)',
          description_ru: 'Легальные схемы оптимизации налогов.',
          description_kz: 'Салықты заңды оңтайландыру.',
          q: {
            code: 'legal-money-tax-optimization-1',
            question_ru: 'Оптимизация налогов (легальные схемы)',
            question_kz: 'Салықты оңтайландыру',
            answer_ru: 'Анализируем модель бизнеса и риски, подбираем легальные решения и план внедрения.',
            answer_kz: 'Анализируем модель бизнеса и риски, подбираем легальные решения и план внедрения.',
            tags_ru: JSON.stringify(['оптимизация', 'налоги', 'схемы']),
            tags_kz: JSON.stringify(['оңтайландыру', 'салық', 'жоспар']),
          },
        },
        {
          code: 'legal-money-grants-subsidies',
          title_ru: 'Госгранты и субсидии (не агро)',
          title_kz: 'Мемгранттар және субсидия (агро емес)',
          description_ru: 'Получение госгрантов и субсидий.',
          description_kz: 'Мемгрант/субсидия алу.',
          q: {
            code: 'legal-money-grants-subsidies-1',
            question_ru: 'Получение госгрантов и субсидий',
            question_kz: 'Мемгрант/субсидия алу',
            answer_ru: 'Подбираем программу, готовим заявку и финансовую модель, сопровождаем подачу/защиту.',
            answer_kz: 'Подбираем программу, готовим заявку и финансовую модель, сопровождаем подачу/защиту.',
            tags_ru: JSON.stringify(['гранты', 'субсидии', 'господдержка']),
            tags_kz: JSON.stringify(['грант', 'субсидия', 'мемқолдау']),
          },
        },
        {
          code: 'legal-money-foreign-payments-unlock',
          title_ru: 'Возврат средств с зарубежных платёжек / блокировок',
          title_kz: 'Шетелдік төлем сервистерінен қаражат қайтару',
          description_ru: 'Разблокировки и возвраты средств с зарубежных платёжных сервисов.',
          description_kz: 'Шетелдік төлем сервистерінен бұғатты шешу/қайтару.',
          q: {
            code: 'legal-money-foreign-payments-unlock-1',
            question_ru: 'Возврат средств с зарубежных платёжек / блокировок',
            question_kz: 'Шетелдік төлем сервистерінен қаражат қайтару',
            answer_ru: 'Анализируем причину блокировки, готовим документы/appeal и сопровождаем возврат/разблокировку.',
            answer_kz: 'Анализируем причину блокировки, готовим документы/appeal и сопровождаем возврат/разблокировку.',
            tags_ru: JSON.stringify(['зарубежные платежки', 'блокировка', 'возврат']),
            tags_kz: JSON.stringify(['шетел төлем', 'бұғаттау', 'қайтару']),
          },
        },
        {
          code: 'legal-money-foreign-services-withdraw',
          title_ru: 'Вывод денег от зарубежных сервисов',
          title_kz: 'Шетелдік сервистерден ақша шығару',
          description_ru: 'Вывод денег от зарубежных сервисов (беттинг/гейминг и др.).',
          description_kz: 'Шетелдік сервистерден ақша шығару (беттинг/гейминг).',
          q: {
            code: 'legal-money-foreign-services-withdraw-1',
            question_ru: 'Вывод денег от зарубежных сервисов',
            question_kz: 'Шетелдік сервистерден ақша шығару',
            answer_ru: 'Подбираем легальный маршрут, документы и сопровождение по комплаенсу/банку.',
            answer_kz: 'Подбираем легальный маршрут, документы и сопровождение по комплаенсу/банку.',
            tags_ru: JSON.stringify(['вывод', 'зарубежные сервисы', 'беттинг', 'гейминг']),
            tags_kz: JSON.stringify(['шығару', 'шетел сервистері', 'беттинг', 'гейминг']),
          },
        },
      ],
    },
    {
      audience: 'legal',
      code: 'legal-realty',
      title_ru: 'Земля / недвижимость',
      title_kz: 'Жер / мүлік',
      description_ru: 'Земля под бизнес, назначения, коммуникации и стройка.',
      description_kz: 'Бизнеске жер, мақсат, коммуникация, құрылыс.',
      subcategories: [
        {
          code: 'legal-realty-land-for-business',
          title_ru: 'Земля под строительство бизнеса',
          title_kz: 'Бизнес құрылысына жер',
          description_ru: 'Получение земли под строительство бизнеса.',
          description_kz: 'Бизнес құрылысына жер алу.',
          q: {
            code: 'legal-realty-land-for-business-1',
            question_ru: 'Получение земли под строительство бизнеса',
            question_kz: 'Бизнеске жер алу',
            answer_ru: 'Подбираем формат, готовим документы и сопровождаем получение/аукцион/аренду.',
            answer_kz: 'Подбираем формат, готовим документы и сопровождаем получение/аукцион/аренду.',
            tags_ru: JSON.stringify(['земля', 'строительство', 'бизнес']),
            tags_kz: JSON.stringify(['жер', 'құрылыс', 'бизнес']),
          },
        },
        {
          code: 'legal-realty-land-purpose-change',
          title_ru: 'Изменение назначения земли',
          title_kz: 'Жер мақсатын өзгерту',
          description_ru: 'Например склад → коммерция.',
          description_kz: 'Мысалы қойма → коммерция.',
          q: {
            code: 'legal-realty-land-purpose-change-1',
            question_ru: 'Изменение назначения земли',
            question_kz: 'Жер мақсатын өзгерту',
            answer_ru: 'Оцениваем ограничения, готовим пакет, сопровождаем согласования и изменения.',
            answer_kz: 'Оцениваем ограничения, готовим пакет, сопровождаем согласования и изменения.',
            tags_ru: JSON.stringify(['назначение', 'земля', 'коммерция']),
            tags_kz: JSON.stringify(['мақсат', 'жер', 'коммерция']),
          },
        },
        {
          code: 'legal-realty-utilities-connection',
          title_ru: 'Подключение к коммуникациям через госорганы',
          title_kz: 'Коммуникацияға қосу (меморгандар)',
          description_ru: 'Свет, вода, газ — сопровождение подключения.',
          description_kz: 'Жарық, су, газ қосу сүйемелдеу.',
          q: {
            code: 'legal-realty-utilities-connection-1',
            question_ru: 'Подключение к коммуникациям (свет/вода/газ)',
            question_kz: 'Коммуникацияға қосу',
            answer_ru: 'Собираем требования, подаем заявки, сопровождаем согласования и подключение.',
            answer_kz: 'Собираем требования, подаем заявки, сопровождаем согласования и подключение.',
            tags_ru: JSON.stringify(['коммуникации', 'свет', 'вода', 'газ']),
            tags_kz: JSON.stringify(['коммуникация', 'жарық', 'су', 'газ']),
          },
        },
        {
          code: 'legal-realty-industrial-zones',
          title_ru: 'Индустриальные зоны / технопарки',
          title_kz: 'Индустриялық аймақ / технопарк',
          description_ru: 'Оформление индустриальных зон/технопарков.',
          description_kz: 'Индустриалды аймақ/технопарк рәсімдеу.',
          q: {
            code: 'legal-realty-industrial-zones-1',
            question_ru: 'Оформление индустриальных зон / технопарков',
            question_kz: 'Индустриялық аймақ / технопарк',
            answer_ru: 'Подбираем площадку/условия, готовим документы и сопровождаем включение.',
            answer_kz: 'Подбираем площадку/условия, готовим документы и сопровождаем включение.',
            tags_ru: JSON.stringify(['индустриальная зона', 'технопарк']),
            tags_kz: JSON.stringify(['индустриялық аймақ', 'технопарк']),
          },
        },
        {
          code: 'legal-realty-construction-permits-fast',
          title_ru: 'Ускорение разрешений на строительство',
          title_kz: 'Құрылыс рұқсатын жеделдету',
          description_ru: 'Ускорение разрешительных процедур.',
          description_kz: 'Рұқсат рәсімдерін жеделдету.',
          q: {
            code: 'legal-realty-construction-permits-fast-1',
            question_ru: 'Ускорение разрешений на строительство',
            question_kz: 'Құрылыс рұқсатын жеделдету',
            answer_ru: 'Фиксируем этап, готовим запросы, сопровождаем согласования до выдачи разрешения.',
            answer_kz: 'Фиксируем этап, готовим запросы, сопровождаем согласования до выдачи разрешения.',
            tags_ru: JSON.stringify(['разрешение', 'строительство', 'ускорение']),
            tags_kz: JSON.stringify(['рұқсат', 'құрылыс', 'жеделдету']),
          },
        },
      ],
    },
    {
      audience: 'legal',
      code: 'legal-licenses',
      title_ru: 'Документы / лицензии',
      title_kz: 'Құжат / лицензия',
      description_ru: 'Лицензии, регистрация, экспорт/импорт, сертификация, тендеры.',
      description_kz: 'Лицензия, тіркеу, экспорт/импорт, сертификат, тендер.',
      subcategories: [
        {
          code: 'legal-licenses-obtain',
          title_ru: 'Получение лицензий',
          title_kz: 'Лицензия алу',
          description_ru: 'Финансы, образование, медицина и т.д.',
          description_kz: 'Қаржы, білім, медицина және т.б.',
          q: {
            code: 'legal-licenses-obtain-1',
            question_ru: 'Получение лицензий (финансы/образование/медицина и др.)',
            question_kz: 'Лицензия алу',
            answer_ru: 'Определяем тип лицензии, требования, готовим пакет и сопровождаем получение.',
            answer_kz: 'Определяем тип лицензии, требования, готовим пакет и сопровождаем получение.',
            tags_ru: JSON.stringify(['лицензия', 'разрешение']),
            tags_kz: JSON.stringify(['лицензия', 'рұқсат']),
          },
        },
        {
          code: 'legal-licenses-company-registration',
          title_ru: 'Регистрация компании под ключ',
          title_kz: 'Компанияны толық тіркеу',
          description_ru: 'Включая иностранцев.',
          description_kz: 'Шетелдіктерді қоса.',
          q: {
            code: 'legal-licenses-company-registration-1',
            question_ru: 'Регистрация компании под ключ',
            question_kz: 'Компанияны тіркеу',
            answer_ru: 'Подбираем форму, готовим документы, регистрируем и настраиваем базовые процессы.',
            answer_kz: 'Подбираем форму, готовим документы, регистрируем и настраиваем базовые процессы.',
            tags_ru: JSON.stringify(['регистрация', 'ТОО', 'иностранцы']),
            tags_kz: JSON.stringify(['тіркеу', 'ЖШС', 'шетелдік']),
          },
        },
        {
          code: 'legal-licenses-export-import',
          title_ru: 'Разрешения на экспорт/импорт',
          title_kz: 'Экспорт/импорт рұқсаты',
          description_ru: 'Помощь в получении разрешений.',
          description_kz: 'Рұқсат алуға көмек.',
          q: {
            code: 'legal-licenses-export-import-1',
            question_ru: 'Разрешения на экспорт/импорт',
            question_kz: 'Экспорт/импорт рұқсаты',
            answer_ru: 'Определяем требования, готовим пакет и сопровождаем получение разрешений/согласований.',
            answer_kz: 'Определяем требования, готовим пакет и сопровождаем получение разрешений/согласований.',
            tags_ru: JSON.stringify(['экспорт', 'импорт', 'разрешение']),
            tags_kz: JSON.stringify(['экспорт', 'импорт', 'рұқсат']),
          },
        },
        {
          code: 'legal-licenses-certification',
          title_ru: 'Сертификация продукции',
          title_kz: 'Өнім сертификаты',
          description_ru: 'Сертификация продукции.',
          description_kz: 'Өнімді сертификаттау.',
          q: {
            code: 'legal-licenses-certification-1',
            question_ru: 'Сертификация продукции',
            question_kz: 'Өнім сертификаты',
            answer_ru: 'Подбираем схему сертификации, готовим документы и сопровождаем процедуру.',
            answer_kz: 'Подбираем схему сертификации, готовим документы и сопровождаем процедуру.',
            tags_ru: JSON.stringify(['сертификация', 'документы']),
            tags_kz: JSON.stringify(['сертификаттау', 'құжат']),
          },
        },
        {
          code: 'legal-licenses-tenders-support',
          title_ru: 'Тендеры и госзакупки (сопровождение)',
          title_kz: 'Тендер/сатып алу (сүйемелдеу)',
          description_ru: 'Оформление тендеров и участие в госзакупках.',
          description_kz: 'Тендер рәсімдеу және қатысу.',
          q: {
            code: 'legal-licenses-tenders-support-1',
            question_ru: 'Оформление тендеров и участие в госзакупках',
            question_kz: 'Тендер/сатып алу',
            answer_ru: 'Анализируем требования, готовим заявку/обеспечение, сопровождаем подачу и контракт.',
            answer_kz: 'Анализируем требования, готовим заявку/обеспечение, сопровождаем подачу и контракт.',
            tags_ru: JSON.stringify(['тендер', 'госзакупки', 'заявка']),
            tags_kz: JSON.stringify(['тендер', 'сатып алу', 'өтінім']),
          },
        },
      ],
    },
    {
      audience: 'legal',
      code: 'legal-legal-support',
      title_ru: 'Юридическое сопровождение',
      title_kz: 'Құқықтық сүйемелдеу',
      description_ru: 'Долги, блокировки, контрагенты, проверки.',
      description_kz: 'Қарыз, бұғат, контрагент, тексеріс.',
      subcategories: [
        {
          code: 'legal-legal-debt-collection',
          title_ru: 'Работа с долгами (взыскание)',
          title_kz: 'Қарыз өндіру',
          description_ru: 'Досудебка и взыскание.',
          description_kz: 'Дауды сотқа дейін және өндіру.',
          q: {
            code: 'legal-legal-debt-collection-1',
            question_ru: 'Работа с долгами (досудебка, взыскание)',
            question_kz: 'Қарыз өндіру',
            answer_ru: 'Претензия, переговоры, подготовка документов и сопровождение взыскания.',
            answer_kz: 'Претензия, переговоры, подготовка документов и сопровождение взыскания.',
            tags_ru: JSON.stringify(['долги', 'взыскание', 'претензия']),
            tags_kz: JSON.stringify(['қарыз', 'өндіру', 'талап']),
          },
        },
        {
          code: 'legal-legal-unblock-accounts',
          title_ru: 'Разблокировка счетов компании',
          title_kz: 'Компания шотын бұғаттан шығару',
          description_ru: 'Разблокировка счетов компании.',
          description_kz: 'Компания шотын бұғаттан шығару.',
          q: {
            code: 'legal-legal-unblock-accounts-1',
            question_ru: 'Разблокировка счетов компании',
            question_kz: 'Компания шотын бұғаттан шығару',
            answer_ru: 'Выясняем основание, готовим пакет/обращения и сопровождаем снятие ограничений.',
            answer_kz: 'Выясняем основание, готовим пакет/обращения и сопровождаем снятие ограничений.',
            tags_ru: JSON.stringify(['блокировка', 'счета', 'компания']),
            tags_kz: JSON.stringify(['бұғаттау', 'шот', 'компания']),
          },
        },
        {
          code: 'legal-legal-counterparty-check',
          title_ru: 'Проверка контрагентов (due diligence)',
          title_kz: 'Контрагент тексеру (due diligence)',
          description_ru: 'Проверка контрагентов.',
          description_kz: 'Контрагенттерді тексеру.',
          q: {
            code: 'legal-legal-counterparty-check-1',
            question_ru: 'Проверка контрагентов (due diligence)',
            question_kz: 'Контрагент тексеру',
            answer_ru: 'Проверяем риски, связи, суды/долги, формируем отчёт и рекомендации.',
            answer_kz: 'Проверяем риски, связи, суды/долги, формируем отчёт и рекомендации.',
            tags_ru: JSON.stringify(['контрагенты', 'due diligence', 'проверка']),
            tags_kz: JSON.stringify(['контрагент', 'due diligence', 'тексеру']),
          },
        },
        {
          code: 'legal-legal-tax-audit-defense',
          title_ru: 'Защита при налоговых проверках',
          title_kz: 'Салық тексерісінде қорғау',
          description_ru: 'Защита при налоговых проверках.',
          description_kz: 'Салық тексерісінде қорғау.',
          q: {
            code: 'legal-legal-tax-audit-defense-1',
            question_ru: 'Защита при налоговых проверках',
            question_kz: 'Салық тексерісінде қорғау',
            answer_ru: 'Готовим ответы/документы, сопровождаем коммуникации и защиту позиции.',
            answer_kz: 'Готовим ответы/документы, сопровождаем коммуникации и защиту позиции.',
            tags_ru: JSON.stringify(['налоговая проверка', 'защита']),
            tags_kz: JSON.stringify(['салық тексерісі', 'қорғау']),
          },
        },
        {
          code: 'legal-legal-government-inspections',
          title_ru: 'Сопровождение проверок госорганов',
          title_kz: 'Меморган тексерісін сүйемелдеу',
          description_ru: 'Сопровождение при проверках госорганов.',
          description_kz: 'Меморган тексерісін сүйемелдеу.',
          q: {
            code: 'legal-legal-government-inspections-1',
            question_ru: 'Сопровождение при проверках госорганов',
            question_kz: 'Меморган тексерісі',
            answer_ru: 'Готовим пакет, сопровождаем проверки, фиксируем действия и защищаем позицию.',
            answer_kz: 'Готовим пакет, сопровождаем проверки, фиксируем действия и защищаем позицию.',
            tags_ru: JSON.stringify(['проверки', 'госорганы', 'сопровождение']),
            tags_kz: JSON.stringify(['тексеріс', 'меморгандар', 'сүйемелдеу']),
          },
        },
      ],
    },
  ];

  async function ensureGroup(trx, g, groupOrder) {
    const existing = await trx('category_groups').where({ code: g.code }).first();
    if (existing?.id) return existing.id;
    const audienceId = audienceIdByCode[g.audience];
    const max = await trx('category_groups').where({ audience_id: audienceId }).max({ m: 'sort_order' }).first();
    const sort = Number(max?.m ?? -1) + 1 + groupOrder * 0.01;
    const [id] = await trx('category_groups').insert({
      audience_id: audienceId,
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
  const subCodes = [
    'ind-realty-state-land-rent-business',
    'ind-realty-selfbuild-legalization',
    'ind-realty-land-category-change',
    'ind-legal-debt-writeoff-support',
    'ind-legal-fines-appeal',
    'ind-legal-check-debts-courts',
    'ind-docs-restore-online',
    'ind-docs-emigration-permanent',
    'ind-other-missing-payments-check',
    'ind-other-education-grants',
    'legal-money-tax-optimization',
    'legal-money-grants-subsidies',
    'legal-money-foreign-payments-unlock',
    'legal-money-foreign-services-withdraw',
    'legal-realty-land-for-business',
    'legal-realty-land-purpose-change',
    'legal-realty-utilities-connection',
    'legal-realty-industrial-zones',
    'legal-realty-construction-permits-fast',
    'legal-licenses-obtain',
    'legal-licenses-company-registration',
    'legal-licenses-export-import',
    'legal-licenses-certification',
    'legal-licenses-tenders-support',
    'legal-legal-debt-collection',
    'legal-legal-unblock-accounts',
    'legal-legal-counterparty-check',
    'legal-legal-tax-audit-defense',
    'legal-legal-government-inspections',
  ];
  const qCodes = subCodes.map((c) => `${c}-1`);
  await knex.transaction(async (trx) => {
    await trx('questions').whereIn('code', qCodes).del();
    await trx('subcategories').whereIn('code', subCodes).del();
  });
}

