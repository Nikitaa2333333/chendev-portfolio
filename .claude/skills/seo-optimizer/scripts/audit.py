#!/usr/bin/env python3
"""SEO-аудитор: сканирует HTML-страницы и файлы сайта, печатает что есть/чего нет.

Детерминированная проверка для скилла seo-optimizer. Только стандартная
библиотека Python 3. Запускать до правок (снимок) и после (доказать, что
применилось).

Использование:
    python audit.py <путь-к-сайту>                 # каталог: найдёт *.html + robots/sitemap
    python audit.py index.html trebovaniya.html    # конкретные файлы
    python audit.py <путь> --json                  # только JSON (для машинной обработки)

Проверяет по странице: title, meta description, h1 (ровно одна), canonical,
viewport, lang, Open Graph, Twitter Card, JSON-LD (+ типы), покрытие alt,
ссылки на фавикон, наличие счётчиков аналитики. По сайту: robots.txt (+ Sitemap:),
sitemap.xml, наличие <main>.
"""
import sys
import os
import re
import json
import argparse
from html.parser import HTMLParser

# Каталоги, не относящиеся к публичным страницам сайта (служебка, сборка, vcs).
IGNORE_DIRS = {"admin", "node_modules", ".git", ".github", "vendor", "dist", "build", "__pycache__"}


def _in_ignored_dir(path):
    parts = re.split(r"[\\/]+", path)
    return any(p in IGNORE_DIRS for p in parts)


class PageParser(HTMLParser):
    """Лёгкий разбор HTML без зависимостей."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = None
        self._in_title = False
        self.meta = []            # список dict атрибутов <meta>
        self.links = []           # список dict атрибутов <link>
        self.h1_count = 0
        self.html_lang = None
        self.img_total = 0
        self.img_with_alt = 0
        self.jsonld_types = []    # типы из <script type=application/ld+json>
        self._in_jsonld = False
        self._jsonld_buf = []
        self.has_main = False
        self.scripts_src = []     # src внешних скриптов (для детекта аналитики)
        self._inline_script_buf = []
        self._in_inline_script = False

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            self.meta.append(d)
        elif tag == "link":
            self.links.append(d)
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "html":
            self.html_lang = d.get("lang")
        elif tag == "main":
            self.has_main = True
        elif tag == "img":
            self.img_total += 1
            if d.get("alt") is not None and d.get("alt").strip() != "":
                self.img_with_alt += 1
        elif tag == "script":
            stype = (d.get("type") or "").lower()
            if stype == "application/ld+json":
                self._in_jsonld = True
                self._jsonld_buf = []
            else:
                if d.get("src"):
                    self.scripts_src.append(d["src"])
                else:
                    self._in_inline_script = True
                    self._inline_script_buf = []

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "script":
            if self._in_jsonld:
                self._in_jsonld = False
                self._extract_jsonld("".join(self._jsonld_buf))
            elif self._in_inline_script:
                self._in_inline_script = False
                self.scripts_src.append("INLINE:" + "".join(self._inline_script_buf))

    def handle_data(self, data):
        if self._in_title:
            self.title = (self.title or "") + data
        if self._in_jsonld:
            self._jsonld_buf.append(data)
        if self._in_inline_script:
            self._inline_script_buf.append(data)

    def _extract_jsonld(self, raw):
        raw = raw.strip()
        if not raw:
            return
        try:
            data = json.loads(raw)
        except Exception:
            self.jsonld_types.append("<невалидный JSON>")
            return
        for obj in data if isinstance(data, list) else [data]:
            if isinstance(obj, dict):
                t = obj.get("@type")
                if isinstance(t, list):
                    self.jsonld_types.extend(str(x) for x in t)
                elif t:
                    self.jsonld_types.append(str(t))


def _meta_get(metas, *, name=None, prop=None):
    for m in metas:
        if name and (m.get("name") or "").lower() == name.lower():
            return m.get("content", "")
        if prop and (m.get("property") or "").lower() == prop.lower():
            return m.get("content", "")
    return None


def _detect_analytics(scripts):
    blob = " ".join(scripts).lower()
    found = []
    if "mc.yandex.ru" in blob or "ym(" in blob or "metrika" in blob:
        found.append("Яндекс.Метрика")
    if "googletagmanager.com/gtag" in blob or "gtag(" in blob or "google-analytics" in blob:
        found.append("Google Analytics")
    return found


def audit_page(path):
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        html = f.read()
    p = PageParser()
    try:
        p.feed(html)
    except Exception:
        pass

    title = (p.title or "").strip()
    desc = _meta_get(p.meta, name="description")
    viewport = _meta_get(p.meta, name="viewport")
    og = {k: _meta_get(p.meta, prop="og:" + k) for k in ("title", "description", "image", "url", "type")}
    tw = _meta_get(p.meta, name="twitter:card")
    canonical = next((l.get("href") for l in p.links if (l.get("rel") or "").lower() == "canonical"), None)
    favicon = [l for l in p.links if "icon" in (l.get("rel") or "").lower()]
    analytics = _detect_analytics(p.scripts_src)

    checks = {
        "title": {"ok": bool(title), "value": title, "len": len(title)},
        "title_len_ok": {"ok": 10 <= len(title) <= 65, "value": len(title)},
        "description": {"ok": bool(desc), "value": desc, "len": len(desc or "")},
        "description_len_ok": {"ok": bool(desc) and 50 <= len(desc) <= 165, "value": len(desc or "")},
        "h1_exactly_one": {"ok": p.h1_count == 1, "value": p.h1_count},
        "canonical": {"ok": bool(canonical), "value": canonical},
        "viewport": {"ok": bool(viewport), "value": viewport},
        "html_lang": {"ok": bool(p.html_lang), "value": p.html_lang},
        "open_graph": {"ok": bool(og["title"] and og["description"] and og["image"]), "value": og},
        "twitter_card": {"ok": bool(tw), "value": tw},
        "json_ld": {"ok": bool(p.jsonld_types), "value": p.jsonld_types},
        "has_main": {"ok": p.has_main, "value": p.has_main},
        "img_alt_coverage": {
            "ok": p.img_total == 0 or p.img_with_alt == p.img_total,
            "value": f"{p.img_with_alt}/{p.img_total}",
        },
        "favicon": {"ok": bool(favicon), "value": [f.get("href") for f in favicon]},
        "analytics": {"ok": bool(analytics), "value": analytics},
    }
    return checks


def audit_site(targets):
    html_files = []
    site_dir = None
    for t in targets:
        if os.path.isdir(t):
            site_dir = t
            for root, dirs, files in os.walk(t):
                dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]  # не спускаться в служебку
                # пропустить служебные verification-файлы вида yandex_*.html / google*.html
                for fn in files:
                    if fn.endswith(".html") and not re.match(r"^(yandex_|google)", fn):
                        html_files.append(os.path.join(root, fn))
        elif t.endswith(".html"):
            html_files.append(t)
            if site_dir is None:
                site_dir = os.path.dirname(os.path.abspath(t)) or "."

    report = {"pages": {}, "site": {}}
    for hf in sorted(set(html_files)):
        report["pages"][hf] = audit_page(hf)

    # Уровень сайта
    if site_dir:
        robots_path = os.path.join(site_dir, "robots.txt")
        sitemap_path = os.path.join(site_dir, "sitemap.xml")
        robots_txt = ""
        if os.path.isfile(robots_path):
            with open(robots_path, "r", encoding="utf-8", errors="replace") as f:
                robots_txt = f.read()
        report["site"] = {
            "robots_txt": {"ok": os.path.isfile(robots_path), "value": robots_path},
            "robots_has_sitemap": {"ok": "sitemap:" in robots_txt.lower(), "value": None},
            "sitemap_xml": {"ok": os.path.isfile(sitemap_path), "value": sitemap_path},
        }
    return report


def print_summary(report):
    def mark(ok):
        return "✅" if ok else "❌"

    for page, checks in report["pages"].items():
        print(f"\n=== {page} ===")
        for name, c in checks.items():
            val = c.get("value")
            if isinstance(val, (dict, list)):
                val = json.dumps(val, ensure_ascii=False)
            val = "" if val is None else str(val)
            if len(val) > 80:
                val = val[:77] + "..."
            print(f"  {mark(c['ok'])} {name:22} {val}")
    if report.get("site"):
        print("\n=== САЙТ ===")
        for name, c in report["site"].items():
            print(f"  {mark(c['ok'])} {name:22} {c.get('value') or ''}")

    # Сводка по проблемам
    problems = []
    for page, checks in report["pages"].items():
        for name, c in checks.items():
            if not c["ok"]:
                problems.append(f"{page}: {name}")
    for name, c in report.get("site", {}).items():
        if not c["ok"]:
            problems.append(f"САЙТ: {name}")
    print(f"\n{'-'*50}")
    print(f"Проблем найдено: {len(problems)}")


def main():
    ap = argparse.ArgumentParser(description="SEO-аудитор статических сайтов")
    ap.add_argument("targets", nargs="+", help="каталог сайта и/или .html файлы")
    ap.add_argument("--json", action="store_true", help="вывести только JSON")
    args = ap.parse_args()

    # Консоли Windows часто в cp1251 — принудительно UTF-8, чтобы не падать на ✅/❌.
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    report = audit_site(args.targets)
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print_summary(report)
        print("\n(JSON: повторить с флагом --json)")


if __name__ == "__main__":
    main()
