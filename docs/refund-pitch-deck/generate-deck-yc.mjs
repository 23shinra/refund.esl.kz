import pptxgen from '/tmp/refund-presentation/node_modules/pptxgenjs/dist/pptxgen.es.js';
import QRCode from '/tmp/refund-presentation/node_modules/qrcode/lib/index.js';

const pptx = new pptxgen();
pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE';
pptx.author = 'Refund';
pptx.company = 'Refund';
pptx.title = 'Refund — Demo Day';
pptx.subject = 'Инвесторская презентация';
pptx.lang = 'ru-KZ';

const C = {
  green: '0D7A5F',
  dark: '0A201A',
  ink: '13221E',
  mid: '6E7C76',
  faint: 'A8B2AE',
  canvas: 'FAFAFA',
  gray: 'F4F6F5',
  line: 'E2E9E6',
  mint: 'E7F4EF',
  coral: 'E96859',
  white: 'FFFFFF',
};
const file = (name) => new URL(`./${name}`, import.meta.url).pathname;
const shadow = { type: 'outer', color: '1B2A25', opacity: 0.11, blur: 2, angle: 45, distance: 1 };

const text = (slide, value, x, y, w, h, opts = {}) =>
  slide.addText(value, {
    x, y, w, h, margin: 0, breakLine: true, fit: 'shrink',
    fontFace: 'Arial', fontSize: opts.size ?? 12, color: opts.color ?? C.ink,
    bold: opts.bold ?? false, align: opts.align ?? 'left', valign: opts.valign ?? 'mid',
    ...opts,
  });

const box = (slide, x, y, w, h, fill, opts = {}) =>
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: opts.radius ?? 0.16,
    fill: { color: fill },
    line: { color: opts.line ?? fill, transparency: opts.line ? 0 : 100, width: opts.width ?? 0.6 },
    shadow: opts.shadow,
  });

const circle = (slide, x, y, d, fill, opts = {}) =>
  slide.addShape(pptx.ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color: fill },
    line: { color: opts.line ?? fill, width: opts.width ?? 0 },
  });

const line = (slide, x, y, w, h, color = C.line, end = 'none', width = 1) =>
  slide.addShape(pptx.ShapeType.line, { x, y, w, h, line: { color, width, endArrowType: end } });

const brand = (slide, n) => {
  circle(slide, 0.55, 0.34, 0.12, C.green);
  text(slide, 'REFUND', 0.78, 0.28, 1.45, 0.24, { size: 8.5, bold: true, color: C.green, charSpacing: 2 });
  // A continuous visual route: its active point moves through every slide.
  line(slide, 0.55, 6.86, 10.58, 0, C.line, 'none', 1.2);
  line(slide, 0.55, 6.86, n * 2.0, 0, C.green, 'none', 1.4);
  circle(slide, 0.55 + n * 2.0, 6.79, 0.14, C.green, { line: C.white, width: 1 });
  text(slide, `${String(n).padStart(2, '0')} / 05`, 11.62, 7.06, 1.15, 0.18, { size: 7.5, color: C.faint, align: 'right' });
};

const check = (slide, x, y, size = 0.22, fill = C.green) => {
  circle(slide, x, y, size, fill);
  text(slide, '✓', x, y + 0.005, size, size - 0.02, { size: size * 38, bold: true, color: C.white, align: 'center' });
};

// Slide 1 — problem. One visual hero: the bureaucracy maze.
{
  const s = pptx.addSlide();
  s.background = { color: C.canvas };
  brand(s, 1);
  text(s, 'Государственная поддержка есть.\\nНайти её — проблема.', 0.55, 0.88, 7.1, 1.25, {
    size: 29, bold: true, color: C.dark, valign: 'top',
  });
  text(s, 'Путь к помощи сегодня — бюрократический лабиринт.', 0.57, 2.28, 5.4, 0.3, {
    size: 13, color: C.mid,
  });

  // Hero image driven by a single bright path.
  s.addImage({ path: file('human-maze-final.png'), x: 0.48, y: 2.68, w: 8.15, h: 4.15, sizing: { type: 'contain', w: 8.15, h: 4.15 } });

  // The exit, not a second equal object.
  box(s, 8.95, 1.55, 3.83, 4.78, C.green, { radius: 0.26, shadow });
  text(s, 'REFUND', 9.35, 1.95, 2.6, 0.22, { size: 10, bold: true, color: 'BFE7D8', charSpacing: 2 });
  text(s, 'Один\\nпонятный\\nмаршрут.', 9.35, 2.42, 2.5, 1.65, {
    size: 27, bold: true, color: C.white, valign: 'top',
  });
  const journey = ['Найти', 'Понять', 'Оформить', 'Получить'];
  journey.forEach((label, i) => {
    const y = 4.38 + i * 0.38;
    check(s, 9.38, y, 0.19, C.white);
    text(s, label, 9.72, y - 0.01, 1.65, 0.22, { size: 11, bold: true, color: C.white });
  });
  text(s, 'Без поиска между Google, законами\\nи очередями в ЦОН.', 9.35, 5.98, 2.9, 0.37, {
    size: 9.4, color: 'CBECE1', valign: 'top',
  });
}

// Slide 2 — solution. One visual hero: an iPhone with a real product-style user scenario.
{
  const s = pptx.addSlide();
  s.background = { color: C.canvas };
  brand(s, 2);
  text(s, 'Один вопрос.\\nГотовый план действий.', 0.55, 0.88, 5.8, 1.05, {
    size: 31, bold: true, color: C.dark, valign: 'top',
  });
  text(s, '«У меня родился ребёнок»', 0.58, 2.35, 3.4, 0.34, { size: 15, color: C.green, bold: true });
  line(s, 0.58, 2.92, 3.15, 0, C.green, 'triangle', 1.4);

  // Supporting proof cards, kept deliberately quiet.
  const proof = [
    ['01', 'Подбирает', 'меры поддержки'],
    ['02', 'Показывает', 'план и документы'],
    ['03', 'Подключает', 'специалиста'],
  ];
  proof.forEach(([num, a, b], i) => {
    const y = 3.45 + i * 0.78;
    box(s, 0.55, y, 3.45, 0.6, C.gray, { radius: 0.13 });
    text(s, num, 0.78, y + 0.16, 0.38, 0.18, { size: 8, bold: true, color: C.green });
    text(s, a, 1.3, y + 0.11, 1.1, 0.23, { size: 12.5, bold: true });
    text(s, b, 2.39, y + 0.11, 1.3, 0.23, { size: 11.5, color: C.mid });
  });

  // iPhone mockup. UI wording comes from existing product flows and catalog.
  box(s, 7.45, 0.45, 4.35, 6.66, C.dark, { radius: 0.46, shadow: { type: 'outer', color: '0A201A', opacity: 0.22, blur: 4, angle: 45, distance: 2 } });
  box(s, 7.68, 0.7, 3.89, 6.15, C.white, { radius: 0.34 });
  box(s, 8.85, 0.84, 1.56, 0.13, C.dark, { radius: 0.08 });
  circle(s, 8.08, 1.28, 0.15, C.green);
  text(s, 'refund', 8.34, 1.21, 1.4, 0.25, { size: 13, bold: true, color: C.green });
  text(s, 'Подобрано для вас', 8.08, 1.76, 2.7, 0.27, { size: 16, bold: true });
  box(s, 8.08, 2.25, 3.08, 0.88, C.mint, { radius: 0.16 });
  check(s, 8.28, 2.5, 0.26);
  text(s, 'Вам доступны 3 меры\\nподдержки', 8.72, 2.36, 2.12, 0.46, { size: 12.5, bold: true, valign: 'top' });
  const rows = [
    ['Пособие до 3 лет', 'Пошаговый план'],
    ['Документы', '5 из 5 готовы'],
    ['Помощь специалиста', 'Подключить'],
  ];
  rows.forEach(([a, b], i) => {
    const y = 3.42 + i * 0.72;
    box(s, 8.08, y, 3.08, 0.57, C.gray, { radius: 0.12 });
    text(s, a, 8.26, y + 0.09, 2.0, 0.19, { size: 10.5, bold: true });
    text(s, b, 8.26, y + 0.28, 2.35, 0.16, { size: 8.6, color: C.green });
    text(s, '›', 10.78, y + 0.14, 0.16, 0.2, { size: 17, color: C.green, bold: true, align: 'center' });
  });
  box(s, 8.08, 5.78, 3.08, 0.58, C.green, { radius: 0.13 });
  text(s, 'Получить помощь', 8.08, 5.93, 3.08, 0.2, { size: 11.5, bold: true, color: C.white, align: 'center' });
  text(s, 'Работающий интерфейс Refund', 7.72, 7.0, 3.8, 0.16, { size: 8.5, color: C.faint, align: 'center' });
}

// Slide 3 — business. One visual hero: the Refund ecosystem.
{
  const s = pptx.addSlide();
  s.background = { color: C.canvas };
  brand(s, 3);
  text(s, 'Refund соединяет спрос,\\nэкспертизу и государство.', 0.55, 0.88, 7.4, 1.1, {
    size: 29, bold: true, color: C.dark, valign: 'top',
  });

  s.addImage({ path: file('ecosystem.png'), x: 2.75, y: 1.86, w: 7.9, h: 4.95, sizing: { type: 'contain', w: 7.9, h: 4.95 } });

  // Quiet labels establish the system at a glance.
  box(s, 0.55, 3.05, 2.3, 1.1, C.gray, { radius: 0.17 });
  text(s, 'Пользователь', 0.82, 3.3, 1.8, 0.2, { size: 13.5, bold: true });
  text(s, 'информация бесплатно', 0.82, 3.58, 1.8, 0.16, { size: 9.2, color: C.mid });
  line(s, 2.88, 3.58, 1.12, 0.05, C.green, 'triangle', 1.3);

  box(s, 10.5, 3.05, 2.28, 1.1, C.gray, { radius: 0.17 });
  text(s, 'Партнёр', 10.78, 3.3, 1.8, 0.2, { size: 13.5, bold: true });
  text(s, 'готовые обращения', 10.78, 3.58, 1.8, 0.16, { size: 9.2, color: C.mid });
  line(s, 9.45, 3.58, 1.02, 0.05, C.green, 'triangle', 1.3);

  box(s, 5.42, 5.9, 2.45, 0.7, C.green, { radius: 0.15, shadow });
  text(s, 'Подписка 9 990 ₸ / месяц', 5.42, 6.11, 2.45, 0.2, { size: 10.2, bold: true, color: C.white, align: 'center' });
  text(s, 'пользователь → заявка → партнёр → выручка', 2.05, 6.91, 9.25, 0.19, { size: 10.2, color: C.green, bold: true, align: 'center' });
}

// Slide 4 — why now. One hero card, four large proof points around it.
{
  const s = pptx.addSlide();
  s.background = { color: C.canvas };
  brand(s, 4);
  text(s, 'Рынок готов\\nк новой точке входа.', 0.55, 0.88, 6.2, 1.1, {
    size: 31, bold: true, color: C.dark, valign: 'top',
  });
  box(s, 5.05, 1.18, 3.23, 1.1, C.green, { radius: 0.22, shadow });
  text(s, '— млн', 5.36, 1.42, 2.5, 0.34, { size: 25, bold: true, color: C.white, align: 'center' });
  text(s, 'добавить подтверждённые данные', 5.28, 1.8, 2.75, 0.16, { size: 8.3, color: 'C3E8DA', align: 'center' });

  const cards = [
    ['▱', 'Государство\\nцифровизируется', 'путь уже переходит онлайн'],
    ['✦', 'ИИ делает подбор\\nперсональным', 'теперь возможно в масштабе'],
    ['↗', 'Программ\\nстановится больше', 'сложность растёт'],
    ['→', 'Люди хотят ответы\\nмгновенно', 'ожидание нового стандарта'],
  ];
  cards.forEach(([icon, title, note], i) => {
    const x = i % 2 === 0 ? 0.55 : 6.93;
    const y = i < 2 ? 2.92 : 5.0;
    box(s, x, y, 5.85, 1.7, i === 1 ? C.mint : C.gray, { radius: 0.2 });
    circle(s, x + 0.32, y + 0.34, 0.55, C.white, { line: C.line, width: 0.6 });
    text(s, icon, x + 0.32, y + 0.42, 0.55, 0.26, { size: 19, bold: true, color: C.green, align: 'center' });
    text(s, title, x + 1.15, y + 0.28, 3.0, 0.6, { size: 17, bold: true, color: C.dark, valign: 'top' });
    text(s, note, x + 1.15, y + 1.12, 3.75, 0.18, { size: 10.2, color: C.mid });
  });
}

// Slide 5 — vision. One visual hero: Kazakhstan connected to Refund.
{
  const s = pptx.addSlide();
  s.background = { color: C.canvas };
  brand(s, 5);
  s.addImage({ path: file('infrastructure-final.png'), x: 6.12, y: 0.34, w: 6.9, h: 6.3, sizing: { type: 'contain', w: 6.9, h: 6.3 } });
  box(s, 0.28, 0.7, 6.35, 5.78, C.white, { radius: 0.08 });
  text(s, 'Первая цифровая\\nточка входа\\nк государству.', 0.55, 1.0, 5.6, 1.63, {
    size: 30, bold: true, color: C.dark, valign: 'top',
  });
  text(s, 'Хотим, чтобы любое взаимодействие\\nчеловека с государством начиналось с Refund.', 0.56, 3.05, 5.25, 0.62, {
    size: 15, color: C.mid, valign: 'top',
  });
  line(s, 0.55, 4.23, 4.35, 0, C.green, 'none', 2);
  const trust = ['MVP готов', 'Каталог уже работает', 'Следующий этап — масштабирование'];
  trust.forEach((item, i) => {
    const y = 4.56 + i * 0.44;
    check(s, 0.57, y, 0.2);
    text(s, item, 0.92, y - 0.01, 3.85, 0.22, { size: 11, bold: true, color: C.ink });
  });
  const domains = [
    ['Жильё', 7.08, 1.58],
    ['Дети', 9.54, 0.95],
    ['Медицина', 11.52, 1.84],
    ['Бизнес', 11.45, 4.62],
    ['Выплаты', 9.55, 5.42],
    ['Налоги', 7.22, 4.86],
    ['Лицензии', 6.65, 3.12],
  ];
  domains.forEach(([label, x, y]) => {
    box(s, x, y, 0.9, 0.3, C.white, { radius: 0.15, line: C.line, width: 0.5, shadow: { type: 'outer', color: '1B2A25', opacity: 0.06, blur: 1, angle: 45, distance: 0.5 } });
    text(s, label, x, y + 0.06, 0.9, 0.12, { size: 7.3, bold: true, color: C.mid, align: 'center' });
  });
  circle(s, 0.55, 6.18, 0.14, C.green);
  text(s, 'refund', 0.78, 6.12, 1.4, 0.25, { size: 14, bold: true, color: C.green });
  text(s, 'refund.esl.kz', 0.55, 6.52, 1.8, 0.18, { size: 10, color: C.mid });
  const qr = await QRCode.toDataURL('https://refund.esl.kz', { width: 220, margin: 1, color: { dark: '#0D7A5F', light: '#FFFFFF' } });
  box(s, 4.43, 5.74, 1.02, 1.02, C.gray, { radius: 0.11 });
  s.addImage({ data: qr, x: 4.53, y: 5.84, w: 0.82, h: 0.82 });
}

await pptx.writeFile({ fileName: file('Refund_DemoDay_ArtDirected_ru.pptx') });
