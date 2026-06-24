import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://nikitaa2333333.github.io',
  base: '/chendev-portfolio',
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    responsiveStyles: true,
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover', // грузим кейс при наведении, а не все 12 сразу по видимости
  },
  // Dev Toolbar делает forced-reflow аудит на каждом клиентском переходе → затуп ТОЛЬКО в dev.
  // В проде его нет; выключаем, чтобы локалка летала как боевой сайт.
  devToolbar: { enabled: false },
});
