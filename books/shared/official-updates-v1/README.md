# Official updates

`apply.mjs` is the single transactional interpreter for all enrolled Army Books.
`book.mjs` reads the input and stage from the book passport. Python producers
call the same interpreter through `bridge.py`; they do not implement mutations.

Each document declares its exact record collection, identity and data path.
An entry identifies a record by stable ID or an exact source locator with an
identity guard, then identifies a typed field. Names never resolve targets.
Every non-addition carries a typed `expectedBefore`; absence is explicitly
`{"$absent": true}`. An update source specifies document, version and page.

The interpreter validates the entire schema and applies to an isolated copy.
Missing/duplicate targets, contradictory preconditions and conflicting writes
throw before any result is returned. Producers must finish the transaction
before writing their artifacts. Supersession must be explicit.

Metadata projections preserve existing provenance and audit output contracts.
They can write only the closed set of audit fields, never entity data. They
are declarations interpreted by the same code, not book-specific callbacks.

`BOOK_UPDATE_OFFICIAL_LOG` optionally collects successful applications outside
the checkout for the update command's report. It does not alter generated data.
