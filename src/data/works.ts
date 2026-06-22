export type TileSize = 'small' | 'middle'; // small = 1 юнит (≈2:3 портрет), middle = 2 юнита (≈4:3 ландшафт)

export interface Work {
  slug: string;
  index: string;
  title: string;
  client: string;
  year: number;
  category: string;
  tags: string[];
  surface: string;   // CSS-цвет плитки (плейсхолдер, пока нет картинки/видео)
  size: TileSize;    // размер плитки в юнитах сетки (см. модель в CLAUDE.md)
  row: number;       // номер ряда (ряд = flex-строка, сумма юнитов = 4)
  image?: string;    // путь к картинке (jpg/png/webp/gif)
  video?: string;    // путь к .mp4
  poster?: string;   // заглушка под видео
}

export const categories = ['Все', 'Веб', 'Мобильные', 'Брендинг', 'Эксперименты'];

export const works: Work[] = [
  // ряд 1: middle + small + small = 2+1+1 = 4 юнита (как ряд artlebedev: ландшафт + 2 портрета)
  { slug: 'case-1', index: '01', title: 'Дашборд для финтех-стартапа', client: 'Orbital', year: 2026, category: 'Веб', tags: ['SaaS', 'Дашборд'], surface: '#3B73B9', size: 'middle', row: 1 /*, video: '/works/orbital.mp4', poster: '/works/orbital.jpg' */ },
  { slug: 'case-2', index: '02', title: 'Мобильная читалка', client: 'Halftone', year: 2025, category: 'Мобильные', tags: ['iOS', 'Чтение'], surface: '#7C4A1E', size: 'small', row: 1 },
  { slug: 'case-3', index: '03', title: 'Айдентика devtool-компании', client: 'Tally', year: 2025, category: 'Брендинг', tags: ['Бренд', 'Motion'], surface: '#2C568B', size: 'small', row: 1 },

  // ряд 2: small + small + middle = 1+1+2 = 4 юнита (зеркальный ритм: 2 портрета + ландшафт)
  { slug: 'case-4', index: '04', title: 'CSS-движок для вёрстки', client: 'Open source', year: 2025, category: 'Эксперименты', tags: ['CSS', 'Тулинг'], surface: '#1E3A5D', size: 'small', row: 2 },
  { slug: 'case-5', index: '05', title: 'Ambient-дисплей умного дома', client: 'Sundial', year: 2024, category: 'Веб', tags: ['IoT', 'Дашборд'], surface: '#3B73B9', size: 'small', row: 2 },
  { slug: 'case-6', index: '06', title: 'Камера с растровой печатью', client: 'Self', year: 2024, category: 'Мобильные', tags: ['iOS', 'Камера'], surface: '#7C4A1E', size: 'middle', row: 2 },
];
