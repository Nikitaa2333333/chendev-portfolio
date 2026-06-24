export type TileSize = 'small' | 'middle'; // small = 1 юнит (≈2:3 портрет), middle = 2 юнита (≈4:3 ландшафт)

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
  // Медиа плитки (приоритет: video → image → только surface-цвет).
  // video автоплеится ТОЛЬКО в зоне видимости (IntersectionObserver в Works.astro),
  // при prefers-reduced-motion видео не запускается — остаётся poster.
  image?: string;    // путь к статике/гифке (jpg/png/webp/gif)
  video?: string;    // путь к .mp4 (muted/loop/playsinline, autoplay по видимости)
  poster?: string;   // кадр-заглушка под видео (показывается до загрузки/при reduce-motion)
}

export const categories = ['Все', 'Веб', 'Мобильные', 'Брендинг', 'Эксперименты'];

export const works: Work[] = [
  // ряд 1: middle + small + small = 2+1+1 = 4 юнита (как ряд artlebedev: ландшафт + 2 портрета)
  { slug: 'case-1', index: '01', title: 'Дашборд для финтех-стартапа', client: 'Orbital', year: 2026, category: 'Веб', tags: ['SaaS', 'Дашборд'], surface: '#3B73B9', size: 'middle', row: 1, video: '/works/0624.mp4', poster: '/works/0624.jpg' },
  { slug: 'case-2', index: '02', title: 'Мобильная читалка', client: 'Halftone', year: 2025, category: 'Мобильные', tags: ['iOS', 'Чтение'], surface: '#7C4A1E', size: 'small', row: 1 },
  { slug: 'case-3', index: '03', title: 'Айдентика devtool-компании', client: 'Tally', year: 2025, category: 'Брендинг', tags: ['Бренд', 'Motion'], surface: '#2C568B', size: 'small', row: 1 },

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
