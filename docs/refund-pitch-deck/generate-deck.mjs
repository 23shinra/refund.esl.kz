import pptxgen from '/tmp/refund-presentation/node_modules/pptxgenjs/dist/pptxgen.es.js';
import QRCode from '/tmp/refund-presentation/node_modules/qrcode/lib/index.js';

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Refund';
pptx.company = 'Refund';
pptx.subject = 'Инвесторская презентация Refund';
pptx.title = 'Refund — Pitch Deck';
pptx.lang = 'ru-KZ';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'ru-KZ',
};
pptx.defineLayout({ name: 'CUSTOM_WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'CUSTOM_WIDE';
pptx.defineSlideMaster({
  title: 'BASE',
  background: { color: 'FFFFFF' },
  objects: [
    { rect: { x: 0.48, y: 0.38, w: 0.08, h: 0.08, fill: { color: '0D7A5F' }, line: { color: '0D7A5F' } } },
    { text: { text: 'REFUND', options: { x: 0.68, y: 0.25, w: 1.25, h: 0.25, fontFace: 'Aptos', fontSize: 8, bold: true, color: '0D7A5F', charSpacing: 1.5, margin: 0 } } },
    { text: { text: '01', options: { x: 12.25, y: 7.08, w: 0.55, h: 0.16, fontFace: 'Aptos', fontSize: 7, color: '9AA6A1', align: 'right', margin: 0 } } },
  ],
  slideNumber: { x: 12.25, y: 7.08, color: '9AA6A1', fontFace: 'Aptos', fontSize: 7 },
});

const C = {
  green: '0D7A5F',
  green2: '138B6D',
  dark: '10221E',
  ink: '18231F',
  gray: 'F4F6F5',
  gray2: 'E5EBE8',
  mid: '68756F',
  mint: 'E6F4EF',
  coral: 'F26D5B',
  white: 'FFFFFF',
};
const asset = (name) => new URL(`./${name}`, import.meta.url).pathname;
const addText = (slide, text, x, y, w, h, opts = {}) =>
  slide.addText(text, {
    x, y, w, h, margin: 0,
    fontFace: opts.fontFace || 'Aptos',
    fontSize: opts.fontSize || 12,
    color: opts.color || C.ink,
    bold: opts.bold ?? false,
    breakLine: false,
    fit: 'shrink',
    valign: opts.valign || 'mid',
    align: opts.align || 'left',
    ...opts,
  });
const rect = (slide, x, y, w, h, fill, radius = 0.16, line = fill) =>
  slide.addShape(radius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, {
    x, y, w, h, rectRadius: radius, fill: { color: fill }, line: { color: line, transparency: line === fill ? 100 : 0 },
  });
const line = (slide, x1, y1, x2, y2, color = C.gray2, width = 1.2, dash = 'solid') =>
  slide.addShape(pptx.ShapeType.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width, dashType: dash, beginArrowType: 'none', endArrowType: 'none' } });
const circle = (slide, x, y, d, fill, lineColor = fill, lineWidth = 0) =>
  slide.addShape(pptx.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: { color: lineColor, width: lineWidth } });
const arrow = (slide, x1, y1, x2, y2, color = C.green) =>
  slide.addShape(pptx.ShapeType.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width: 1.4, endArrowType: 'triangle' } });
const logo = (slide, x, y, inverse = false) => {
  circle(slide, x, y + 0.04, 0.12, inverse ? C.white : C.green);
  addText(slide, 'refund', x + 0.19, y, 1.1, 0.24, { fontSize: 10, bold: true, color: inverse ? C.white : C.green, charSpacing: 0.2 });
};
const iconCircle = (slide, x, y, glyph, color = C.green) => {
  circle(slide, x, y, 0.47, C.white, C.gray2, 1);
  addText(slide, glyph, x, y + 0.01, 0.47, 0.38, { fontSize: 15, color, bold: true, align: 'center' });
};
const card = (slide, x, y, w, h, title, body, num) => {
  rect(slide, x, y, w, h, C.gray);
  addText(slide, num, x + 0.28, y + 0.25, 0.45, 0.25, { fontSize: 8, color: C.green, bold: true, charSpacing: 1 });
  addText(slide, title, x + 0.28, y + 0.68, w - 0.56, 0.33, { fontSize: 18, bold: true });
  addText(slide, body, x + 0.28, y + 1.18, w - 0.56, 0.66, { fontSize: 11, color: C.mid, breakLine: true, valign: 'top', breakLine: true });
};

// 1. Problem + solution
{
  const s = pptx.addSlide('BASE');
  addText(s, 'Государственная\nподдержка\nслишком сложна.', 0.68, 1.06, 5.55, 2.45, {
    fontSize: 31, bold: true, breakLine: true, valign: 'top', breakLine: true, color: C.dark, paraSpaceAfterPt: 0,
  });
  addText(s, 'Refund помогает за несколько минут понять,\nкакие меры поддержки доступны именно вам.', 0.72, 4.09, 5.35, 0.7, {
    fontSize: 14, color: C.mid, breakLine: true, valign: 'top',
  });
  rect(s, 0.7, 5.45, 4.85, 0.56, C.green);
  addText(s, 'Простая навигация по государственным услугам', 0.96, 5.59, 4.35, 0.2, { fontSize: 10.5, bold: true, color: C.white });
  rect(s, 6.55, 0.78, 6.1, 5.95, C.gray);
  s.addImage({ path: asset('service-journey.png'), x: 6.76, y: 1.08, w: 5.68, h: 4.26, sizing: { type: 'contain', x: 6.76, y: 1.08, w: 5.68, h: 4.26 } });
  rect(s, 7.15, 5.5, 4.85, 0.72, C.white);
  circle(s, 7.39, 5.73, 0.19, C.green);
  addText(s, 'Из хаоса — к понятному следующему шагу', 7.72, 5.67, 3.9, 0.28, { fontSize: 12, bold: true });
}

// 2. Product flow
{
  const s = pptx.addSlide('BASE');
  addText(s, 'От вопроса —\nк результату.', 0.68, 0.96, 4.55, 1.28, { fontSize: 30, bold: true, breakLine: true, valign: 'top', color: C.dark });
  const steps = ['Кто вы?', 'Категория', 'Льготы', 'Инструкция', 'Специалист', 'Результат'];
  const xs = [0.75, 1.72, 2.69, 3.66, 4.63, 5.6];
  line(s, 0.98, 3.12, 6.3, 3.12, C.gray2, 1.5);
  steps.forEach((step, i) => {
    circle(s, xs[i], 2.9, 0.44, i === steps.length - 1 ? C.green : C.white, i === steps.length - 1 ? C.green : C.green, 1.2);
    addText(s, String(i + 1).padStart(2, '0'), xs[i], 3.01, 0.44, 0.13, { fontSize: 7, bold: true, color: i === steps.length - 1 ? C.white : C.green, align: 'center' });
    addText(s, step, xs[i] - 0.32, 3.53, 1.08, 0.24, { fontSize: 9, bold: i === steps.length - 1, align: 'center', color: i === steps.length - 1 ? C.green : C.mid });
  });
  // phone mockup
  rect(s, 8.3, 0.78, 3.22, 5.95, C.dark, 0.38);
  rect(s, 8.48, 1.0, 2.86, 5.52, C.white, 0.29);
  rect(s, 9.4, 1.17, 1.02, 0.12, C.dark, 0.08);
  logo(s, 8.78, 1.62);
  addText(s, 'Подберём\nваши возможности', 8.78, 2.08, 2.1, 0.55, { fontSize: 13, bold: true, breakLine: true, valign: 'top' });
  rect(s, 8.76, 2.91, 2.3, 0.7, C.mint);
  iconCircle(s, 8.91, 3.03, '✓');
  addText(s, 'Семья и дети', 9.5, 3.04, 1.36, 0.17, { fontSize: 9, bold: true });
  addText(s, 'Подходит вам', 9.5, 3.25, 1.25, 0.13, { fontSize: 7.5, color: C.green });
  rect(s, 8.76, 3.88, 2.3, 0.62, C.gray);
  addText(s, 'Пошаговый план', 8.96, 4.08, 1.3, 0.14, { fontSize: 9, bold: true });
  rect(s, 8.76, 4.74, 2.3, 0.74, C.green);
  addText(s, 'Получить помощь', 8.76, 4.98, 2.3, 0.15, { fontSize: 9, bold: true, color: C.white, align: 'center' });
  addText(s, 'Один экран.\nОдин следующий шаг.', 6.75, 5.67, 1.23, 0.55, { fontSize: 11, bold: true, color: C.green, breakLine: true, valign: 'top' });
  arrow(s, 7.82, 5.95, 8.15, 5.95);
}

// 3. Why it works
{
  const s = pptx.addSlide('BASE');
  addText(s, 'Польза для каждого.\nЭкономика для Refund.', 0.68, 0.95, 8.3, 0.92, { fontSize: 29, bold: true, breakLine: true, valign: 'top', color: C.dark });
  card(s, 0.68, 2.35, 3.72, 2.75, 'Пользователь', 'Находит ответы за минуты\nвместо часов поиска.', '01');
  card(s, 4.8, 2.35, 3.72, 2.75, 'Партнёр', 'Получает готовых клиентов\nс конкретным запросом.', '02');
  card(s, 8.92, 2.35, 3.72, 2.75, 'Refund', 'Зарабатывает на подписке\nи сопровождении.', '03');
  // flow visual
  circle(s, 2.12, 5.86, 0.56, C.mint);
  iconCircle(s, 2.16, 5.9, '⌕');
  arrow(s, 2.9, 6.14, 5.17, 6.14);
  circle(s, 5.38, 5.86, 0.56, C.mint);
  iconCircle(s, 5.43, 5.9, '✓');
  arrow(s, 6.18, 6.14, 8.45, 6.14);
  circle(s, 8.66, 5.86, 0.56, C.green);
  addText(s, '₸', 8.66, 5.96, 0.56, 0.25, { fontSize: 14, bold: true, color: C.white, align: 'center' });
  addText(s, 'запрос', 1.76, 6.63, 1.3, 0.14, { fontSize: 8.5, color: C.mid, align: 'center' });
  addText(s, 'помощь', 5.02, 6.63, 1.3, 0.14, { fontSize: 8.5, color: C.mid, align: 'center' });
  addText(s, 'выручка', 8.29, 6.63, 1.3, 0.14, { fontSize: 8.5, color: C.mid, align: 'center' });
}

// 4. Why now
{
  const s = pptx.addSlide('BASE');
  addText(s, 'Время для Refund\nпришло.', 0.68, 0.96, 5.5, 1.2, { fontSize: 31, bold: true, breakLine: true, valign: 'top', color: C.dark });
  addText(s, 'Четыре сдвига, которые делают новый стандарт неизбежным.', 0.72, 2.38, 5.2, 0.42, { fontSize: 12, color: C.mid });
  const reasons = [
    ['▣', 'Цифровое\nгосударство'],
    ['+', 'Больше\nуслуг'],
    ['✦', 'Персональный\nИИ'],
    ['→', 'Ответы\nсразу'],
  ];
  reasons.forEach(([glyph, label], i) => {
    const x = 0.72 + i * 3.1;
    rect(s, x, 3.43, 2.65, 2.18, i === 2 ? C.green : C.gray);
    addText(s, glyph, x + 0.24, 3.75, 0.45, 0.38, { fontSize: 21, bold: true, color: i === 2 ? C.white : C.green, align: 'center' });
    addText(s, label, x + 0.27, 4.52, 1.95, 0.53, { fontSize: 16, bold: true, color: i === 2 ? C.white : C.dark, breakLine: true, valign: 'top' });
  });
  line(s, 0.72, 6.38, 12.58, 6.38, C.gray2, 1);
  addText(s, 'Навигация становится важнее информации.', 0.72, 6.58, 5.8, 0.22, { fontSize: 11, bold: true, color: C.green });
}

// 5. Vision
{
  const s = pptx.addSlide('BASE');
  s.addImage({ path: asset('kazakhstan-network.png'), x: 6.36, y: 0.46, w: 6.63, h: 6.6, sizing: { type: 'contain', x: 6.36, y: 0.46, w: 6.63, h: 6.6 } });
  // Fade area to keep visual secondary
  rect(s, 0, 0, 6.8, 7.5, C.white, 0, C.white);
  addText(s, 'Единая точка входа\nко всем государственным\nуслугам Казахстана.', 0.68, 1.0, 6.2, 1.72, { fontSize: 28, bold: true, breakLine: true, valign: 'top', color: C.dark });
  addText(s, 'Хотим, чтобы каждый человек начинал\nвзаимодействие с государством с Refund.', 0.72, 3.37, 5.32, 0.63, { fontSize: 14, color: C.mid, breakLine: true, valign: 'top' });
  rect(s, 0.72, 5.2, 4.72, 0.02, C.green, 0);
  logo(s, 0.72, 5.66);
  addText(s, 'refund.esl.kz', 0.72, 6.12, 1.55, 0.18, { fontSize: 9, color: C.mid });
  const qr = await QRCode.toDataURL('https://refund.esl.kz', { width: 256, margin: 1, color: { dark: '#0D7A5F', light: '#FFFFFF' } });
  s.addImage({ data: qr, x: 4.55, y: 5.48, w: 0.94, h: 0.94 });
}

await pptx.writeFile({ fileName: asset('Refund_Pitch_Deck_ru.pptx') });
