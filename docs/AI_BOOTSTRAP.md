# AI bootstrap

Use this short checklist when starting a fresh ChatGPT or Codex conversation. Never assume prior chat context.

## Start here

1. In `E:\Warhammer\warhammer-rules-complete-preview`, verify branch, HEAD and tree:

   ```text
   git branch --show-current
   git rev-parse HEAD
   git status --short --branch
   ```

2. Expected local milestone: branch `working/army-books-clean`, HEAD `8fc01265a18e6c367451d18a7b86bf522edf63e8`, clean tree.
3. Read `docs/CURRENT_HANDOFF.md`, then `docs/PROJECT_SOURCE_OF_TRUTH.md`, `AGENTS.md`, and the relevant `docs/certification/` record.
4. Treat current code and enrolled evidence as authoritative. Old chats and handoffs are historical.

## Operating rules

- Current milestone scope is Core, Death Guard, Adeptus Mechanicus, Tyranids, T'au Empire, Emperor's Children and Chaos Space Marines.
- Do not touch or describe Space Marines, Dark Angels or Blood Angels as currently certified.
- Preserve the chain `accepted source -> canonical fact -> effective contextual fact -> deterministic projection -> UI`.
- Wahapedia 11E is the operational completeness/content baseline; explicit stronger current GW evidence wins direct conflicts; Warhammer Community MFM v1.5 is the sole MFM owner.
- Generated output and tests are never factual owners. Source defects stay ledgered; evidence gaps stay unresolved.
- Distinguish content certification from roster certification.
- Do not reopen a certified class without new source evidence or a reproducible contradiction.
- Keep tasks bounded. Repair the factual owner or shared producer first, then run focused source-backed and mutation-resistant QA.
- Do not deploy until the independent Astra red team, adjudication, final aggregate/generated refresh and final release gate are complete.

## Fresh ChatGPT prompt

```text
Repository: E:\Warhammer\warhammer-rules-complete-preview

Start with zero assumed conversation context. Verify branch, HEAD and clean tree. Read docs/CURRENT_HANDOFF.md first, then docs/PROJECT_SOURCE_OF_TRUTH.md and the relevant certification records. Preserve the current milestone scope: Core, DG, AdMech, Tyranids, T'au, EC and CSM only. Do not inspect or modify SM/DA/BA. Use accepted sources and factual owners, distinguish content from roster certification, and do not reopen certified classes without new evidence. Wait for my bounded task.
```

## Fresh Codex prompt

```text
Repo: E:\Warhammer\warhammer-rules-complete-preview
Expected branch: working/army-books-clean
Expected HEAD: 8fc01265a18e6c367451d18a7b86bf522edf63e8
Require clean tree.

Read docs/CURRENT_HANDOFF.md, docs/PROJECT_SOURCE_OF_TRUTH.md, AGENTS.md and the relevant certification record before work. Assume no old chat context. Scope is Core, DG, AdMech, Tyranids, T'au, EC and CSM; do not touch SM/DA/BA. Keep work bounded and source-first, preserve certified shared runtime contracts, and do not reopen a certified class without new evidence. Do not push or deploy unless explicitly tasked after the final release gate.
```
