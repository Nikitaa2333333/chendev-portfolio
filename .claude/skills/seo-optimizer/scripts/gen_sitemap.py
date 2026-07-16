#!/usr/bin/env python3
"""Генератор sitemap.xml для скилла seo-optimizer. Только стандартная библиотека.

Использование:
    # из списка путей/URL
    python gen_sitemap.py --base https://example.com / /about /contacts

    # просканировать каталог и взять все .html (служебные verification — пропустить)
    python gen_sitemap.py --base https://example.com --scan ./site

    # записать в файл (по умолчанию печатает в stdout)
    python gen_sitemap.py --base https://example.com --scan ./site -o ./site/sitemap.xml

Замечания:
- Главная (корень) получает priority 1.0, остальные — 0.8.
- index.html маппится на "/" (а не "/index.html").
- lastmod не выставляется по умолчанию (нет надёжной даты); добавь --lastmod ГГГГ-ММ-ДД при желании.
"""
import os
import re
import sys
import argparse
from xml.sax.saxutils import escape


def normalize(base, path):
    base = base.rstrip("/")
    # уже абсолютный URL
    if path.startswith("http://") or path.startswith("https://"):
        return path
    # файловый путь -> URL-путь
    path = path.replace("\\", "/")
    path = re.sub(r"(^|/)index\.html$", "/", path)   # index.html -> /
    if not path.startswith("/"):
        path = "/" + path
    path = re.sub(r"/{2,}", "/", path)
    return base + path


# Служебные/непубличные каталоги — не включать в sitemap.
IGNORE_DIRS = {"admin", "node_modules", ".git", ".github", "vendor", "dist", "build", "__pycache__"}


def scan_dir(d):
    out = []
    for root, dirs, files in os.walk(d):
        dirs[:] = [x for x in dirs if x not in IGNORE_DIRS]
        for fn in files:
            if fn.endswith(".html") and not re.match(r"^(yandex_|google)", fn):
                rel = os.path.relpath(os.path.join(root, fn), d)
                out.append(rel)
    return sorted(out)


def build(base, paths, lastmod=None):
    seen = set()
    urls = []
    for p in paths:
        loc = normalize(base, p)
        if loc in seen:
            continue
        seen.add(loc)
        urls.append(loc)

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    base_root = base.rstrip("/") + "/"
    for loc in urls:
        is_home = loc.rstrip("/") + "/" == base_root
        lines.append("  <url>")
        lines.append(f"    <loc>{escape(loc)}</loc>")
        if lastmod:
            lines.append(f"    <lastmod>{escape(lastmod)}</lastmod>")
        lines.append(f"    <priority>{'1.0' if is_home else '0.8'}</priority>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def main():
    ap = argparse.ArgumentParser(description="Генератор sitemap.xml")
    ap.add_argument("--base", required=True, help="базовый URL, напр. https://example.com")
    ap.add_argument("paths", nargs="*", help="пути или URL страниц")
    ap.add_argument("--scan", help="каталог для поиска .html")
    ap.add_argument("--lastmod", help="дата ГГГГ-ММ-ДД для всех URL (опционально)")
    ap.add_argument("-o", "--output", help="файл вывода (по умолчанию stdout)")
    args = ap.parse_args()

    paths = list(args.paths)
    if args.scan:
        paths += scan_dir(args.scan)
    if not paths:
        print("Нет страниц. Укажи пути или --scan <каталог>.", file=sys.stderr)
        sys.exit(1)

    xml = build(args.base, paths, args.lastmod)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(xml)
        print(f"Записано {args.output}")
    else:
        print(xml)


if __name__ == "__main__":
    main()
