# Шаблоны: JSON-LD, head, robots, sitemap

Готовые к копированию шаблоны. Заменить `<ПЛЕЙСХОЛДЕРЫ>` реальными данными.
JSON-LD кладётся в `<script type="application/ld+json">` в `<head>` (или в конце
`<body>`). Поддерживается и Яндексом, и Google.

## Оглавление
- Организация / локальный бизнес
- FAQPage
- BreadcrumbList
- WebSite (+ поиск)
- Product / Service / Article
- Блок `<head>` (мета + OG + Twitter + canonical + favicon)
- robots.txt
- sitemap.xml

---

## Organization / LocalBusiness

Для бизнеса с физическим адресом используй `LocalBusiness` (или более точный
подтип: `Store`, `ProfessionalService`, и т.п.) — он включает адресный сниппет.
Без адреса — обычный `Organization`.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "<НАЗВАНИЕ>",
  "image": "https://<ДОМЕН>/<путь-к-лого-или-фото>.webp",
  "logo": "https://<ДОМЕН>/<путь-к-лого>.webp",
  "url": "https://<ДОМЕН>/",
  "telephone": "+7XXXXXXXXXX",
  "email": "<email>",
  "priceRange": "₽₽",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "<улица, дом, офис>",
    "addressLocality": "<город>",
    "postalCode": "<индекс>",
    "addressCountry": "RU"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "<шир>",
    "longitude": "<долг>"
  },
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    "opens": "09:00",
    "closes": "19:00"
  }],
  "sameAs": [
    "<https-ссылка на Telegram/VK/соцсети>"
  ]
}
</script>
```

Заполнять только реальными данными. `geo`, `priceRange`, `sameAs` — опциональны;
лучше опустить ключ, чем поставить выдуманное значение.

## FAQPage

Только если на странице реально есть видимые вопросы и ответы (текст в разметке
должен совпадать с текстом на странице — иначе это нарушение).

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "<вопрос>",
      "acceptedAnswer": { "@type": "Answer", "text": "<ответ>" }
    }
  ]
}
</script>
```

## BreadcrumbList

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://<ДОМЕН>/" },
    { "@type": "ListItem", "position": 2, "name": "<раздел>", "item": "https://<ДОМЕН>/<path>" }
  ]
}
</script>
```

## WebSite (+ строка поиска, если есть)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "<НАЗВАНИЕ>",
  "url": "https://<ДОМЕН>/"
}
</script>
```

## Product / Service / Article

Брать по тематике. Скелет `Service`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "<услуга>",
  "provider": { "@type": "Organization", "name": "<НАЗВАНИЕ>" },
  "areaServed": "<город/регион>",
  "description": "<кратко>"
}
</script>
```

---

## Блок `<head>` — мета, OG, Twitter, canonical, favicon

Вставлять как можно ближе к началу `<head>`. Аналитику — выше всего (см.
manual-steps.md), но не блокировать ею рендер.

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title><TITLE 50–60 знаков с ключом и гео></title>
<meta name="description" content="<DESCRIPTION 120–160 знаков с выгодой>" />
<link rel="canonical" href="https://<ДОМЕН>/<путь-страницы>" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="<НАЗВАНИЕ>" />
<meta property="og:title" content="<TITLE>" />
<meta property="og:description" content="<DESCRIPTION>" />
<meta property="og:url" content="https://<ДОМЕН>/<путь>" />
<meta property="og:image" content="https://<ДОМЕН>/<og-image-1200x630>.jpg" />
<meta property="og:locale" content="ru_RU" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="<TITLE>" />
<meta name="twitter:description" content="<DESCRIPTION>" />
<meta name="twitter:image" content="https://<ДОМЕН>/<og-image>.jpg" />

<!-- Фавикон: надёжный набор для Яндекса и Google -->
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

`<html lang="ru">` — на корневом теге.

## robots.txt

```
User-agent: *
Disallow: /admin
# НЕ закрывать CSS/JS — ботам нужен рендер.

Sitemap: https://<ДОМЕН>/sitemap.xml
```

Если есть отдельные технические разделы — добавить их в `Disallow`. Директива
`Host` устарела (Яндекс перешёл на 301-редиректы для определения главного
зеркала) — не добавлять.

## sitemap.xml

Проще генерировать `scripts/gen_sitemap.py`. Ручной минимум:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://<ДОМЕН>/</loc>
    <lastmod>2026-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://<ДОМЕН>/<страница></loc>
    <priority>0.8</priority>
  </url>
</urlset>
```
