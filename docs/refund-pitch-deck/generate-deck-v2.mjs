import pptxgen from '/tmp/refund-presentation/node_modules/pptxgenjs/dist/pptxgen.es.js';
import QRCode from '/tmp/refund-presentation/node_modules/qrcode/lib/index.js';

const pptx = new pptxgen();
pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE';
pptx.author = 'Refund';
pptx.company = 'Refund';
pptx.title = 'Refund — Demo Day Pitch';
pptx.subject = 'Операционная система взаимодействия с государством';
pptx.lang = 'ru-KZ';

const C = {
  green: '0D7A5F',
  dark: '0B1F1A',
  ink: '14241F',
  mid: '6B7872',
  soft: '8A9691',
  gray: 'F3F6F4',
  line: 'E3EAE7',
  mint: 'E7F5F0',
  coral: 'E85D4C',
  white: 'FFFFFF',
};

const asset = (name) => new URL(`./${name}`, import.meta.url).pathname;

const t = (slide, text, x, y, w, h, o = {}) =>
  slide.addText(text, {
    x,
    y,
    w,
    h,
    margin: 0,
    fontFace: o.fontFace || 'Arial',
    fontSize: o.size || 12,
    color: o.color || C.ink,
    bold: o.bold || false,
    align: o.align || 'left',
    valign: o.valign || 'middle',
    breakLine: true,
    ...o,
  });

const r = (slide, x, y, w, h, fill, radius = 0.14) =>
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: radius,
    fill: { color: fill },
    line: { color: fill, transparency: 100 },
  });

const circ = (slide, x, y, d, fill, stroke = fill, sw = 0) =>
  slide.addShape(pptx.ShapeType.ellipse, {
    x,
    y,
    w: d,
    h: d,
    fill: { color: fill },
    line: { color: stroke, width: sw },
  });

const ln = (slide, x, y, w, h, color = C.line, width = 1.25, end = 'none') =>
  slide.addShape(pptx.ShapeType.line, {
    x,
    y,
    w,
    h,
    line: { color, width, endArrowType: end },
  });

const brand = (slide) => {
  circ(slide, 0.55, 0.36, 0.11, C.green);
  t(slide, 'REFUND', 0.78, 0.28, 1.4, 0.26, {
    size: 9,
    bold: true,
    color: C.green,
    charSpacing: 2,
  });
};

const footer = (slide, n) => {
  t(slide, String(n).padStart(2, '0') + ' / 05', 11.55, 7.08, 1.2, 0.2, {
    size: 8,
    color: C.soft,
    align: 'right',
  });
};

// ─────────────────────────────────────────
// SLIDE 1 — Большая проблема
// ─────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.white };
  brand(s);
  footer(s, 1);

  t(s, 'Государственная поддержка есть.\nНайти её — проблема.', 0.55, 0.85, 6.4, 1.55, {
    size: 30,
    bold: true,
    color: C.dark,
    valign: 'top',
  });

  // Chaos path
  const chaos = ['Google', 'Законы', 'eGov', 'ЦОН', 'Отказ', 'Снова'];
  chaos.forEach((label, i) => {
    const y = 2.65 + i * 0.68;
    r(s, 0.55, y, 2.35, 0.52, i === 4 ? 'FDECE9' : C.gray, 0.12);
    circ(s, 0.72, y + 0.13, 0.26, i === 4 ? C.coral : C.white, i === 4 ? C.coral : C.line, 1);
    t(s, i === 4 ? '×' : String(i + 1), 0.72, y + 0.14, 0.26, 0.24, {
      size: 10,
      bold: true,
      color: i === 4 ? C.white : C.mid,
      align: 'center',
    });
    t(s, label, 1.15, y + 0.1, 1.55, 0.32, {
      size: 13,
      bold: true,
      color: i === 4 ? C.coral : C.ink,
    });
    if (i < chaos.length - 1) {
      ln(s, 1.72, y + 0.52, 0, 0.16, C.line, 1.2, 'triangle');
    }
  });

  // VS divider
  circ(s, 3.35, 4.35, 0.55, C.mint);
  t(s, 'vs', 3.35, 4.45, 0.55, 0.35, {
    size: 12,
    bold: true,
    color: C.green,
    align: 'center',
  });

  // Refund path card
  r(s, 4.25, 2.65, 2.7, 4.0, C.green, 0.22);
  t(s, 'REFUND', 4.5, 2.95, 2.2, 0.28, {
    size: 11,
    bold: true,
    color: 'B8E0D2',
    charSpacing: 2,
  });
  const simple = ['Найти', 'Понять', 'Оформить', 'Получить'];
  simple.forEach((label, i) => {
    const y = 3.45 + i * 0.7;
    circ(s, 4.55, y, 0.32, C.white);
    t(s, String(i + 1), 4.55, y + 0.02, 0.32, 0.28, {
      size: 11,
      bold: true,
      color: C.green,
      align: 'center',
    });
    t(s, label, 5.05, y + 0.02, 1.55, 0.28, {
      size: 15,
      bold: true,
      color: C.white,
    });
  });

  // Metric placeholders
  r(s, 7.35, 0.85, 5.4, 5.85, C.gray, 0.22);
  s.addImage({
    path: asset('chaos-vs-clarity.png'),
    x: 7.55,
    y: 1.05,
    w: 5.0,
    h: 3.55,
    sizing: { type: 'cover', w: 5.0, h: 3.55 },
  });

  const metrics = [
    ['— млн', 'пользователей госуслуг\nдобавить данные'],
    ['— ч', 'средний путь до ответа\nдобавить данные'],
    ['— %', 'отказов из‑за ошибок\nдобавить данные'],
  ];
  metrics.forEach(([num, label], i) => {
    const x = 7.65 + i * 1.7;
    t(s, num, x, 4.8, 1.5, 0.4, { size: 22, bold: true, color: C.green });
    t(s, label, x, 5.25, 1.55, 0.7, { size: 10, color: C.mid, valign: 'top' });
  });
}

// ─────────────────────────────────────────
// SLIDE 2 — Решение
// ─────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.white };
  brand(s);
  footer(s, 2);

  t(s, 'Операционная система\nвзаимодействия\nс государством.', 0.55, 0.9, 5.8, 2.0, {
    size: 30,
    bold: true,
    color: C.dark,
    valign: 'top',
  });

  t(s, 'Не каталог. Маршрут от вопроса к результату.', 0.55, 3.1, 5.5, 0.4, {
    size: 14,
    color: C.mid,
  });

  const steps = [
    'Кто вы?',
    'Меры поддержки',
    'Инструкция',
    'Документы',
    'Специалист',
    'Результат',
  ];
  steps.forEach((label, i) => {
    const y = 3.7 + (i % 3) * 0.95;
    const x = i < 3 ? 0.55 : 3.35;
    r(s, x, y, 2.5, 0.78, i === 5 ? C.green : C.gray, 0.14);
    circ(s, x + 0.18, y + 0.22, 0.34, i === 5 ? C.white : C.mint);
    t(s, String(i + 1), x + 0.18, y + 0.25, 0.34, 0.28, {
      size: 12,
      bold: true,
      color: C.green,
      align: 'center',
    });
    t(s, label, x + 0.65, y + 0.22, 1.65, 0.35, {
      size: 14,
      bold: true,
      color: i === 5 ? C.white : C.ink,
    });
  });

  // Phone mockup
  r(s, 8.55, 0.55, 3.95, 6.5, C.dark, 0.42);
  r(s, 8.75, 0.78, 3.55, 6.05, C.white, 0.32);
  r(s, 9.85, 0.95, 1.35, 0.14, C.dark, 0.08);

  circ(s, 9.0, 1.4, 0.16, C.green);
  t(s, 'refund', 9.25, 1.35, 1.4, 0.26, { size: 13, bold: true, color: C.green });

  t(s, 'Ваш маршрут\nк поддержке', 9.0, 1.85, 2.9, 0.75, {
    size: 18,
    bold: true,
    color: C.dark,
    valign: 'top',
  });

  const ui = [
    ['Семья и дети', '3 меры подходят'],
    ['Пособие до 3 лет', 'Пошаговый план'],
    ['Документы собраны', '5 из 5'],
  ];
  ui.forEach(([a, b], i) => {
    const y = 2.85 + i * 0.85;
    r(s, 9.0, y, 3.05, 0.72, C.gray, 0.12);
    t(s, a, 9.2, y + 0.1, 2.6, 0.25, { size: 13, bold: true });
    t(s, b, 9.2, y + 0.38, 2.6, 0.22, { size: 11, color: C.green });
  });

  r(s, 9.0, 5.55, 3.05, 0.7, C.green, 0.14);
  t(s, 'Получить помощь', 9.0, 5.7, 3.05, 0.4, {
    size: 14,
    bold: true,
    color: C.white,
    align: 'center',
  });
}

// ─────────────────────────────────────────
// SLIDE 3 — Почему это бизнес
// ─────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.white };
  brand(s);
  footer(s, 3);

  t(s, 'Бесплатно для граждан.\nПлатно для специалистов.', 0.55, 0.85, 8.5, 1.35, {
    size: 30,
    bold: true,
    color: C.dark,
    valign: 'top',
  });

  // Three columns
  const cols = [
    {
      title: 'Пользователь',
      items: ['Информация бесплатно', 'Маршрут за минуты', 'Помощь по запросу'],
      accent: C.gray,
      titleColor: C.ink,
    },
    {
      title: 'Партнёр',
      items: ['Подписка 9 990 ₸/мес', 'До 5 направлений', 'Готовые заявки'],
      accent: C.mint,
      titleColor: C.green,
    },
    {
      title: 'Refund',
      items: ['Подписки', 'Сопровождение', 'Масштаб платформы'],
      accent: C.green,
      titleColor: C.white,
      light: true,
    },
  ];

  cols.forEach((col, i) => {
    const x = 0.55 + i * 4.15;
    r(s, x, 2.55, 3.9, 3.55, col.accent, 0.2);
    t(s, col.title, x + 0.35, 2.85, 3.2, 0.4, {
      size: 20,
      bold: true,
      color: col.titleColor,
    });
    col.items.forEach((item, j) => {
      const y = 3.55 + j * 0.7;
      circ(s, x + 0.35, y + 0.05, 0.22, col.light ? C.white : C.green);
      t(s, '→', x + 0.35, y + 0.02, 0.22, 0.28, {
        size: 10,
        bold: true,
        color: col.light ? C.green : C.white,
        align: 'center',
      });
      t(s, item, x + 0.72, y, 2.85, 0.35, {
        size: 15,
        bold: true,
        color: col.light ? C.white : C.ink,
      });
    });
  });

  // Money flow
  t(s, 'запрос  →  заявка  →  подписка  →  выручка', 0.55, 6.4, 12.2, 0.35, {
    size: 14,
    bold: true,
    color: C.green,
    align: 'center',
  });
}

// ─────────────────────────────────────────
// SLIDE 4 — Почему сейчас
// ─────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.white };
  brand(s);
  footer(s, 4);

  t(s, 'Рынок готов.\nОкно открыто.', 0.55, 0.85, 6.5, 1.4, {
    size: 32,
    bold: true,
    color: C.dark,
    valign: 'top',
  });

  const cards = [
    { num: '— млн', label: 'пользователей\nгосуслуг', note: 'добавить данные' },
    { num: '↗', label: 'цифровизация\nгосударства', note: 'тренд уже здесь' },
    { num: 'ИИ', label: 'персональный\nподбор', note: 'стало возможным' },
    { num: '∞', label: 'мер поддержки\nвсё больше', note: 'сложность растёт' },
  ];

  cards.forEach((c, i) => {
    const x = 0.55 + i * 3.15;
    r(s, x, 2.7, 2.95, 3.5, i === 1 ? C.green : C.gray, 0.2);
    t(s, c.num, x + 0.3, 3.1, 2.35, 0.7, {
      size: 34,
      bold: true,
      color: i === 1 ? C.white : C.green,
    });
    t(s, c.label, x + 0.3, 4.1, 2.35, 0.9, {
      size: 18,
      bold: true,
      color: i === 1 ? C.white : C.dark,
      valign: 'top',
    });
    t(s, c.note, x + 0.3, 5.4, 2.35, 0.4, {
      size: 12,
      color: i === 1 ? 'B8E0D2' : C.mid,
    });
  });
}

// ─────────────────────────────────────────
// SLIDE 5 — Видение
// ─────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.white };
  brand(s);
  footer(s, 5);

  s.addImage({
    path: asset('os-kazakhstan.png'),
    x: 6.2,
    y: 0.35,
    w: 6.8,
    h: 6.8,
    sizing: { type: 'contain', w: 6.8, h: 6.8 },
  });

  // Soft fade panel so text stays readable
  r(s, 0.35, 0.7, 6.5, 5.9, C.white, 0.1);

  t(s, 'Единая точка входа\nко всем государственным\nуслугам Казахстана.', 0.55, 1.1, 6.0, 2.0, {
    size: 28,
    bold: true,
    color: C.dark,
    valign: 'top',
  });

  t(
    s,
    'Мы хотим, чтобы первым шагом\nпри любом взаимодействии человека\nс государством был Refund.',
    0.55,
    3.5,
    5.6,
    1.2,
    {
      size: 16,
      color: C.mid,
      valign: 'top',
    },
  );

  ln(s, 0.55, 5.05, 3.2, 0, C.green, 2.5);

  circ(s, 0.55, 5.45, 0.18, C.green);
  t(s, 'refund', 0.85, 5.4, 1.4, 0.28, { size: 16, bold: true, color: C.green });
  t(s, 'refund.esl.kz', 0.55, 5.85, 2.0, 0.28, { size: 13, color: C.mid });

  const qr = await QRCode.toDataURL('https://refund.esl.kz', {
    width: 280,
    margin: 1,
    color: { dark: '#0D7A5F', light: '#FFFFFF' },
  });
  r(s, 4.35, 5.25, 1.35, 1.35, C.gray, 0.12);
  s.addImage({ data: qr, x: 4.5, y: 5.4, w: 1.05, h: 1.05 });
}

const out = asset('Refund_DemoDay_Pitch_ru.pptx');
await pptx.writeFile({ fileName: out });
console.log('OK', out);
