# Shared native V2 and factual producer code

- Read [README](../../README.md), the affected native book config/bindings and the repository map before tracing shared code.
- Accepted sources and canonical/effective producers own facts. Native bindings and runtime/presentation are consumers, not alternative factual owners.
- `roster-v2/` implements physical imports, selections, attachments and typed gameplay; `application-v2/` owns shell/routes; `army-book-app-v2/` owns book/Effective/Guide presentation.
- Retained tools and canonical contracts may remain necessary even when their former V1 UI was removed. Trace actual imports before deleting code.
- Preserve persistent identities, source conditions, physical UNIT/MODEL/weapon ownership, mixed-owner membership and attribution.
- Generated artifacts and glossary data must not feed authoritative facts back into source producers.
- For a local fix, begin with the affected owner; expand only when a shared mechanism or declared dependency is proved.
- Shared changes need regressions for affected consumers and `qa:integration`; use real browser QA for visible behavior.
- Use `qa:architecture` only when canonical/effective ownership or identity boundaries change.
- Do not add faction/name branches or rebuild architecture merely for uniformity.
- Legacy V1 UI, old URLs, Roster Guides and V1 roster/update compatibility are not current requirements.
