# Adeptus Mechanicus Rules — Codex Prototype

Локальный интерактивный справочник по Adeptus Mechanicus для 11-й редакции. Визуальная система сохраняет красно-синюю идентичность армии и консоль Doctrina; общий runtime синхронизирован с актуальными решениями Death Guard v5 и Core Rules Prototype.

## Что входит

- Army Rule `Doctrina Imperatives` с переключателем Protector / Conqueror;
- 5 Detachments с отдельными целями Rule, Enhancements и Stratagems;
- 4 новых Datasheets из Faction Pack v1.0;
- Glossary, цепочки popup, Journey/Back и точное восстановление позиции;
- поиск по оглавлению, разделам и терминам;
- адаптивные профили оружия с подписями на мобильных экранах;
- desktop navigation и mobile drawer с focus trap, inert fallback и popup-first Escape;
- PWA/offline shell при открытии через HTTP(S). При прямом `file://` страница продолжает работать без установки.

## Архитектура

- `index.html` — документ и дерево целей прототипа;
- `content/adeptus-mechanicus-prototype.en.json` — версия, структура аудита и проверяемый источник Faction Pack;
- `scripts/navigation-controller.js` — единый scroll owner, кешированная геометрия и программные переходы;
- `scripts/popup-controller.js` и `scripts/journey-controller.js` — контекстные popup-действия и Back;
- `scripts/ui-controllers.js` — поиск, Glossary, тема, Doctrina и ARIA таблиц;
- `tools/build-offline.mjs` — детерминированная версия offline-кеша с `--check`;
- `tests/qa.mjs` — структурные и поведенческие проверки.

## Источник

`../Материалы Warhammer 40000/Правила/Adeptus Mechanicus - Faction Pack v1.0 - 11ed.pdf`

- 26 страниц;
- legal for matched play from 20 June 2026;
- SHA-256 `7F01DD2CE7E35C762B0AB625ADE779022275574CF2D01EE46EE16B2F5582341C`.

Прототип не заменяет полный Codex: базовые Codex Datasheets, отсутствующие в Faction Pack, здесь не выдумываются.
