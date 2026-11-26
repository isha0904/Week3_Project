# Assistance record (complete only if assistance was used)

No specific AI tool is required; manual completion is equally valid.

| Field | Record |
|---|---|
| Tool category (chat assistant / agent / none) | Chat assistant — Claude |
| Prompt or request summary (no personal data, no credentials) | Some code corrections in case of errors and guidance. |
| Context supplied and context excluded | Week 3 – Project 3 files. Excluded: no personal data, credentials or BP systems; no live model (all modes are local stubs). |
| Files the assistance changed (from the diff) | p3 (`p3/starter/assistance-record.md`, `p3/starter/evidence.md`); `w3-10/evidence.md` (W3.10 design); repo setup `.gitignore`, `.gitattributes`, `README.md`. No game source code changed yet. |
| What I inspected and the independent checks I ran myself | - |
| What I rejected or corrected, and why | Some extra additions in code, rejected hallucinated code. Advice question changed from "Which win move…" to "Which permitted move…" because the flow can only guarantee legality, not a win. Assistant's claim that "going south first loses" was wrong (south, north, east, east, south, south still wins on move 6) — corrected in the design. |
