# Week 3 Project — P3: Reviewed game with contextual hints

Adds a tested, server-validated hint feature to the treasure-hunt game, with one bounded refactor and
graceful failure (deterministic fallback, stale-response discard, playable when advice is unavailable).

## Layout

| Path | Contents |
|---|---|
| `p3/README.md` | Project brief |
| `p3/starter/` | Evidence templates (evidence, evaluation, browser checks, review, assistance) |
| `w3-10/` | W3.10 lab: `lab.py`, `Makefile`, design template (`evidence.md`), rubric |
| `w3-10/starter/` | Supplied reference game + hint flow (unchanged baseline) |
| `w3-10/project/game/` | **Working candidate** — all P3 changes go here |

## Run (from `w3-10/`)

```bash
python lab.py test --candidate project/game                   # 29 supplied adapter checks
python lab.py serve --candidate project/game --mode success   # http://127.0.0.1:4310
```

Modes: `success`, `validation`, `timeout`, `malformed`, `provider-failure`, `irrelevant`.
All modes are deterministic local stubs; no live model or credentials are used.
