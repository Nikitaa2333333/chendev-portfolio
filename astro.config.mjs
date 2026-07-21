import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Боевой домен (Sprinthost, деплой по FTP из GitHub Actions — см. ASTRO_DEPLOY_PLAN.md).
  // Сайт живёт в корне домена, base не нужен (withBase-хелперы становятся no-op).
  site: 'https://chendev1.ru',
  // Карта сайта для Яндекс.Вебмастера и Search Console.
  // /ds (эталоны) и /order (форма) — служебные, стоят noindex: в карту не кладём,
  // иначе поиску уходят противоречивые сигналы «не индексируй» + «вот адрес».
  integrations: [sitemap({ filter: (page) => !page.includes('/ds/') && !page.includes('/order/') })],
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
