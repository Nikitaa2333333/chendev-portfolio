export type TileSize = 'small' | 'middle'; // small = 1 юнит (≈2:3 портрет), middle = 2 юнита (≈4:3 ландшафт)

// ── Контент-блоки страницы кейса (см. src/pages/works/[slug].astro) ──
// Гибкий массив: страница рендерит блоки по порядку. Любой кейс = набор кубиков.
//   image — большая картинка во всю ширину секции (нет src → плейсхолдер surface-цветом)
//   text  — текстовая врезка (опц. заголовок + абзац)
//   quote — цитата
export interface CaseImageBlock { type: 'image'; src?: string; alt?: string; caption?: string; }
export interface CaseTextBlock { type: 'text'; heading?: string; body: string; }
export interface CaseQuoteBlock { type: 'quote'; text: string; author?: string; }
export type CaseBlock = CaseImageBlock | CaseTextBlock | CaseQuoteBlock;

export interface Work {
  slug: string;
  index: string;
  title: string;
  client: string;
  year: number;
  category: string;
  tags: string[];
  surface: string;   // CSS-цвет плитки: фон + цвет полей при fit:'contain' + красит градиент
  size: TileSize;    // размер плитки в юнитах сетки (см. модель в CLAUDE.md)
  row: number;       // номер ряда (ряд = flex-строка, сумма юнитов = 4)
  // Как медиа лежит в плитке:
  //   'cover'   (по умолчанию) — full-bleed, обрезка под край (скрин/видео во всю плитку).
  //   'contain' — объект по центру, surface-цвет заливает свободные поля (лого/мокап/прозрачный PNG).
  fit?: 'cover' | 'contain';
  // Спец-плитка: вместо медиа — анимированное синее свечение на CSS (orbit+pulse)
  // + минимальный glass-пилюль с откликом на нажатие. См. Works.astro.
  variant?: 'glow';
  // Медиа плитки (приоритет: video → image → только surface-цвет).
  // video автоплеится ТОЛЬКО в зоне видимости (IntersectionObserver в Works.astro),
  // при prefers-reduced-motion видео не запускается — остаётся poster.
  image?: string;    // путь к статике/гифке (jpg/png/webp/gif)
  video?: string;    // путь к .mp4 (muted/loop/playsinline, autoplay по видимости)
  poster?: string;   // кадр-заглушка под видео (показывается до загрузки/при reduce-motion)

  // ── Поля страницы кейса (необязательные; см. [slug].astro) ──
  siteUrl?: string;     // ссылка на живой сайт проекта — гиперссылка в обзоре
  overview?: string;    // лид-абзац: что за проект, задача, результат
  blocks?: CaseBlock[]; // контент-блоки страницы по порядку (медиа + текст)
}

export const works: Work[] = [
  // ряд 1: middle + small + small = 2+1+1 = 4 юнита (как ряд artlebedev: ландшафт + 2 портрета)
  { slug: 'case-1', index: '01', title: 'Благородный Север', client: 'Сайт-энциклопедия · разведение благородного оленя', year: 2026, category: 'Веб', tags: ['Энциклопедия', 'Разведение оленей'], surface: '#3B73B9', size: 'middle', row: 1, video: '/works/0624.mp4', poster: '/works/0624.jpg',
    siteUrl: 'https://noble-farm.ru/',
    overview: '«Благородный Север» — живой сайт хозяйства, которое разводит благородных европейских оленей в Дмитровском районе Подмосковья по международным стандартам Новой Зеландии и Европы. Задача — показать новую для России отрасль как технологичную и премиальную: племенная работа, генетика стада, пантовое направление.\nСобрал многостраничный сайт — философия проекта, разделы направлений, карта хозяйства и живая лента новостей прямо с фермы.',
    blocks: [
      { type: 'text', heading: 'Задача', body: 'В России оленеводство пока ограничено традиционным северным форматом. Нужно было подать хозяйство как современную, инженерную отрасль — с заботой о каждом животном и опорой на мировой опыт, без аграрной кустарности.' },
      { type: 'image', caption: 'Главный экран — философия проекта' },
      { type: 'text', heading: 'Что сделал', body: 'Спроектировал и собрал сайт: структуру разделов (генетика, популяризация, пантовое направление, международный опыт), премиальную типографику, карту хозяйства и блок новостей, который тянет живую ленту с фермы.' },
      { type: 'image', caption: 'Разделы направлений проекта' },
      { type: 'image', caption: 'Лента новостей с фермы' },
    ],
  },
  { slug: 'case-2', index: '02', title: 'Мобильная читалка', client: 'Halftone', year: 2025, category: 'Мобильные', tags: ['iOS', 'Чтение'], surface: '#7C4A1E', size: 'small', row: 1 },
  { slug: 'management-pro', index: '03', title: 'МЕНЕДЖМЕНТ.PRO', client: 'B2B-аутрич через Telegram', year: 2026, category: 'Веб', tags: ['Лендинг', 'B2B'], surface: '#0a0b0d', size: 'small', row: 1, variant: 'glow',
    siteUrl: 'https://nikitaa2333333.github.io/management-pro-landing/',
    overview: 'МЕНЕДЖМЕНТ.PRO — система привлечения B2B-клиентов через холодный аутрич в Telegram. Выходим напрямую на ЛПР, минуя секретарей и холодные звонки: конверсия 8–15% в ответ против 1–2% у обзвона.\nСобрал лендинг: живой герой с анимированной воронкой лидов, блоки методики, кейсы и FAQ.',
    blocks: [
      { type: 'text', heading: 'Задача', body: 'Показать холодный аутрич не как спам, а как экспертную работу: каждое касание — персональное сообщение после изучения бизнеса получателя. Нужен лендинг, который сразу передаёт технологичность и «живость» системы.' },
      { type: 'text', heading: 'Что сделал', body: 'Собрал одностраничник с анимированным героем (воронка лидов + синее свечение на чистом CSS, без видео), блоками методики «4–5 касаний с нарастающей ценностью», кейсами (ВТБ, Т-Банк, Консоль.ПРО) и FAQ. Всё свечение и glassmorphism — код, поэтому грузится мгновенно и чётко на любом экране.' },
      { type: 'quote', text: 'Конверсия 8% → 32%. Цикл сделки 90 → 35 дней. +7,6 млн ₽ за квартал из спящей базы.' },
    ],
  },

  // ряд 2: small + small + middle = 1+1+2 = 4 юнита (зеркальный ритм: 2 портрета + ландшафт)
  { slug: 'case-4', index: '04', title: 'CSS-движок для вёрстки', client: 'Open source', year: 2025, category: 'Эксперименты', tags: ['CSS', 'Тулинг'], surface: '#1E3A5D', size: 'small', row: 2 },
  { slug: 'case-5', index: '05', title: 'Ambient-дисплей умного дома', client: 'Sundial', year: 2024, category: 'Веб', tags: ['IoT', 'Дашборд'], surface: '#3B73B9', size: 'small', row: 2 },
  { slug: 'case-6', index: '06', title: 'Камера с растровой печатью', client: 'Self', year: 2024, category: 'Мобильные', tags: ['iOS', 'Камера'], surface: '#7C4A1E', size: 'middle', row: 2 },

  // ряд 3: middle + small = 2+1 = 3 юнита → ВЫСОКИЙ, разреженный ряд (большой ландшафт + узкий портрет).
  // Контраст: тёплый коричневый × холодный тёмно-синий, крупное × мелкое.
  { slug: 'case-7', index: '07', title: 'Лендинг для эко-бренда', client: 'Verda', year: 2026, category: 'Веб', tags: ['Промо', 'Motion'], surface: '#7C4A1E', size: 'middle', row: 3 },
  { slug: 'case-8', index: '08', title: 'Дизайн-система банка', client: 'Nord', year: 2025, category: 'Брендинг', tags: ['UI Kit', 'Токены'], surface: '#1E3A5D', size: 'small', row: 3 },

  // ряд 4: small + small + middle + small = 1+1+2+1 = 5 юнитов → НИЗКИЙ, плотный ряд (4 плитки).
  // Контраст: чередование яркий ↔ тёмный, холодный ↔ тёплый по всему ряду.
  { slug: 'case-9', index: '09', title: 'Промо-страница игры', client: 'Pixel', year: 2025, category: 'Веб', tags: ['Промо', 'WebGL'], surface: '#3B73B9', size: 'small', row: 4 },
  { slug: 'case-10', index: '10', title: 'Логотип кофейни', client: 'Roast', year: 2024, category: 'Брендинг', tags: ['Лого', 'Айдентика'], surface: '#1E3A5D', size: 'small', row: 4 },
  { slug: 'case-11', index: '11', title: 'Интерфейс аналитики', client: 'Metric', year: 2025, category: 'Веб', tags: ['SaaS', 'Графики'], surface: '#7C4A1E', size: 'middle', row: 4 },
  { slug: 'case-12', index: '12', title: 'Иконки для ОС', client: 'Lumen', year: 2024, category: 'Эксперименты', tags: ['Иконки', 'Набор'], surface: '#2C568B', size: 'small', row: 4 },
];
