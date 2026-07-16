# План: заливка нового Astro-сайта на chendev1.ru (SpringHost)

## 📊 Текущий статус (обновлено 16.07.2026)

| Шаг | Статус |
| --- | --- |
| Git-репозиторий | ✅ Готов: `github.com/Nikitaa2333333/chendev-portfolio`, ветка `main` |
| `.gitignore` | ✅ Готов (dist, node_modules, .env, _raw исключены) |
| `deploy.yml` | ✅ Готов, путь `/domains/chendev1.ru/public_html/`, clean-slate включён |
| Секреты FTP на GitHub | ❓ Проверить в репо chendev-portfolio (Шаг 3) |
| Очистка public_html | ✅ Не нужна руками — `dangerous-clean-slate: true` сделает сам |
| Первый деплой | ⏳ Закоммитить изменения и запушить (Шаг 5) |
| После деплоя | ⏳ Убрать clean-slate, отключить workflow в старом репо (Шаг 7) |

**Осталось по сути 3 действия: секреты → push → убрать clean-slate.**

---

Цель: заменить старый React-сайт на новый Astro-сайт. Хостинг тот же (SpringHost),
домен тот же (chendev1.ru). После настройки любой `git push` будет автоматически
обновлять сайт.

```
git push → GitHub Actions → npm run build → FTP upload → сайт обновлён
```

---

## Шаг 0. Что понадобится

- [ ] Папка с Astro-проектом (собирается командой `npm run build`, результат в `dist/`)
- [ ] Аккаунт GitHub
- [ ] Данные от SpringHost (письмо при покупке хостинга):
  - Панель управления: **cp.sprinthost.ru**, логин вида `aXXXXXXX` + пароль
  - FTP: сервер (IP), логин, пароль — обычно совпадают с данными панели

> Если письмо с FTP-данными потерялось — см. Шаг 1.2, пароль можно пересоздать.

---

## Шаг 1. SpringHost: вход и подготовка

### 1.1 Вход в панель

1. Открыть **https://cp.sprinthost.ru**
2. Ввести логин (`aXXXXXXX`) и пароль из письма SpringHost
3. Если пароль от панели утерян — «Забыли пароль?» на странице входа,
   восстановление на почту

### 1.2 Проверить / получить FTP-данные

1. В панели: раздел **«FTP и SSH»** (или «Аккаунты FTP»)
2. Записать: **сервер FTP** (IP-адрес), **логин**, **пароль**
3. Если пароль неизвестен — там же можно **сменить пароль FTP** (задать новый)
4. Эти три значения пойдут в секреты GitHub (Шаг 3)

### 1.3 Очистить старый сайт (обязательно!)

Чтобы от старого React-сайта не осталось мусора (старые JS/CSS-чанки):

1. В панели: **«Файловый менеджер»**
2. Перейти в `domains/chendev1.ru/public_html/`
3. Выделить всё содержимое → удалить
   (домен и папку НЕ трогать — только содержимое `public_html`)

> Альтернатива: не чистить руками, а в первый деплой добавить
> `dangerous-clean-slate: true` в workflow (см. Шаг 4) — экшен сам всё сотрёт
> и зальёт начисто. После первого успешного деплоя строку убрать.

⚠️ Сайт будет недоступен с момента очистки до первого деплоя (5–10 минут,
если делать по порядку). Лучше сначала подготовить Шаги 2–4, а чистить перед
самым пушем.

---

## Шаг 2. GitHub: новый репозиторий для Astro-проекта

В папке Astro-проекта (в терминале):

```bash
# если git ещё не инициализирован
git init
git add .
git commit -m "feat: initial Astro site"

# создать репозиторий на GitHub (через сайт github.com → New repository,
# БЕЗ галочек README/.gitignore) и привязать:
git remote add origin https://github.com/<твой-логин>/<имя-репо>.git
git branch -M main
```

> ⚠️ ПОКА НЕ ПУШИТЬ — сначала добавить workflow и секреты (Шаги 3–4),
> иначе первый push уедет без деплоя или деплой упадёт.

Проверить `.gitignore` — в нём должны быть:

```
node_modules/
dist/
.env
```

---

## Шаг 3. GitHub: секреты FTP

В новом репозитории на GitHub:

**Settings → Secrets and variables → Actions → New repository secret**

| Имя секрета    | Значение (из Шага 1.2)     |
| -------------- | -------------------------- |
| `FTP_SERVER`   | IP-адрес FTP-сервера       |
| `FTP_USERNAME` | Логин FTP (вида `aXXXXXXX`)|
| `FTP_PASSWORD` | Пароль FTP                 |

> Из старого репозитория секреты скопировать нельзя — GitHub их не показывает.
> Значения берутся только из панели SpringHost / письма.

---

## Шаг 4. Workflow автодеплоя

В Astro-проекте создать файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Springhost

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.x'

      - name: Install & Build
        run: |
          rm -rf package-lock.json node_modules
          npm install
          npm run build

      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.4
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./dist/
          server-dir: /domains/chendev1.ru/public_html/
          # dangerous-clean-slate: true   # ← раскомментировать ТОЛЬКО на первый
          #                                   деплой, если не чистил public_html
          #                                   руками. Потом убрать!
```

**Важные детали:**

- `server-dir: /domains/chendev1.ru/public_html/` — именно такой путь
  (проверено на прошлом сайте; вариант `/public_html/` из старых заметок —
  неправильный, файлы улетят не туда)
- `rm -rf package-lock.json node_modules` — лечит конфликт
  Windows-lockfile с Linux-сборкой на GitHub Actions
- `submodules: false` — защита от падения checkout, если в истории репо
  когда-то была папка-сабмодуль

**Отличие от React-сайта:** `.htaccess` с SPA-rewrite **НЕ нужен** —
Astro генерирует настоящие HTML-страницы для каждого маршрута, 404 не будет.

---

## Шаг 5. Первый деплой

```bash
git add .
git commit -m "feat: add deploy workflow"
git push -u origin main
```

Затем:

1. На GitHub: вкладка **Actions** → появится запуск «Deploy to Springhost»
2. Дождаться зелёной галочки (обычно 2–5 минут)
3. Если красный крест — открыть лог упавшего шага (см. «Частые ошибки» ниже)

---

## Шаг 6. Проверка на живом домене

После зелёной галочки проверить (в браузере в режиме инкогнито или curl):

- [ ] https://chendev1.ru открывается и показывает **новый** сайт
- [ ] Внутренние страницы открываются по прямым ссылкам (не 404)
- [ ] Нет остатков старого сайта (проверить: в исходном коде страницы
      Ctrl+U не должно быть `/src/main.tsx` и упоминаний React-чанков)
- [ ] Фавикон новый (если старый — почистить кеш браузера)

```bash
# быстрая проверка из терминала:
curl -I https://chendev1.ru            # ожидание: 200 OK
curl -s https://chendev1.ru | head -50 # ожидание: HTML нового сайта
```

---

## Шаг 7. После переезда (не забыть)

- [ ] Убрать `dangerous-clean-slate: true` из workflow (если включал)
- [ ] SEO: robots.txt, sitemap.xml, canonical, Open Graph, JSON-LD —
      прогнать `/seo-optimizer` уже по Astro-проекту (там это делается
      правильнее всего — на этапе сборки)
- [ ] Подключить Яндекс.Метрику и Вебмастер на новый сайт
- [ ] Старый репозиторий: отключить workflow (удалить `deploy.yml` или
      Actions → Disable), чтобы случайный push в старый репо
      не перезаписал новый сайт старым!

---

## Частые ошибки

| Ошибка | Решение |
| --- | --- |
| `Cannot find native binding` | Уже решено: `rm -rf package-lock.json node_modules` в workflow |
| `No url found for submodule` | Уже решено: `submodules: false` в checkout |
| Красный крест на шаге FTP | Проверить секреты: имена точно `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`; значения без пробелов в конце |
| Сайт показывает старую версию | Кеш браузера (Ctrl+Shift+R); проверить, что деплой был в `/domains/chendev1.ru/public_html/` |
| Залилось, но сайт пустой | Проверить, что у Astro сборка идёт в `dist/` (`outDir` в `astro.config.mjs` не переопределён) |
| 404 на внутренних страницах | Убедиться, что страницы реально сгенерированы в `dist/` (есть папки с `index.html`) |
