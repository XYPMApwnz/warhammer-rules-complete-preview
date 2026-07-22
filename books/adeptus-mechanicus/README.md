# Adeptus Mechanicus Rules — Complete Codex Reference

Локальный интерактивный справочник Adeptus Mechanicus: кодексный слой, официальный `Faction Pack v1.0` для 11-й редакции и Warhammer Legends. Проект сохраняет красно-синюю палитру армии, консоль Doctrina и навигационную модель Death Guard v5.

## Состав

- полная обновлённая Army Rule `Doctrina Imperatives` с переключателем Protector / Conqueror;
- 10 Detachments: 5 из Codex и 5 из Faction Pack, со всеми правилами, Enhancements и Stratagems;
- 39 Datasheets по категориям: Epic Heroes, Characters, Battleline, Dedicated Transports, Other и Warhammer Legends;
- Rules Updates и FAQ со страниц 17–18;
- 226 терминов, datasheet abilities и weapon profiles в поисковом Glossary;
- встроенные транскрипты всех 26 страниц и прямые ссылки на локальный PDF;
- глобальный поиск, поиск по оглавлению, popup-цепочки, Journey/Back;
- адаптивные таблицы оружия и мобильная навигация;
- PWA/offline-кэш, включая PDF-источник.

## Воспроизводимые слои данных

Официальный слой: `content/adeptus-mechanicus-rules.en.json`. Кодексные Detachments: `content/adeptus-mechanicus-codex-detachments.en.json`. Полный набор Datasheets: `content/adeptus-mechanicus-codex-datasheets.en.json`.

Он генерирует `index.html`, `scripts/data.js` и `service-worker.js`.

Сборка:

```powershell
& 'C:\Users\denis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' .\tools\build-full-content.mjs
```

Проверка:

```powershell
& 'C:\Users\denis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' .\tools\build-full-content.mjs --check
& 'C:\Users\denis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' .\tests\qa.mjs
```

`tools/extract-faction-pack.py` воспроизводимо извлекает текст PDF в `content/adeptus-mechanicus-source.en.json`. `tools/extract-bsdata.py` нормализует закреплённый каталог `sources/bsdata-adeptus-mechanicus.cat`; официальный Faction Pack затем заменяет совпадающие восемь Datasheets.

## Официальный источник

Локальная копия: `sources/adeptus-mechanicus-faction-pack-v1.0.pdf`.

- 26 страниц;
- legal for matched play from 20 June 2026;
- SHA-256 `7F01DD2CE7E35C762B0AB625ADE779022275574CF2D01EE46EE16B2F5582341C`.

## Источники и граница достоверности

Проект покрывает 10 Detachments и полный доступный состав из 39 Datasheets. Текст и профили восьми листов Faction Pack/Legends берутся из локального официального PDF. Остальные кодексные Datasheets являются закреплённой community-транскрипцией BSData revision 106; ссылка на источник показывается в каждой карточке. Это не выдаётся за официальный PDF Codex. Значения из Faction Pack имеют приоритет над транскрипцией.
