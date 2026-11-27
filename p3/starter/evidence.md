# P3 evidence record (keep it short)

Pair / personal branch: p3-isha  (synthetic identifiers only, e.g. p3-team-a)

| Milestone | Commit | Command(s) run | Actual result | Observed / unverified |
|---|---|---|---|---|
| Baseline (`make test CANDIDATE=project/game`) | 1468c10 (game code unchanged since) | `python lab.py test --candidate project/game` (Windows, from `w3-10/`) | 29 tests, 29 pass, 0 fail — "PASS supplied adapter checks" | Observed 2026-11-26 |
| Refactor: interface + normal/boundary tests | 9a32c6d | `python lab.py test --candidate project/game`; in `project/game`: `npx tsc -p tsconfig.json` and `node --test tests/*.test.mjs` | Supplied 29/29 pass; all 38/38 pass (29 supplied + 9 new P01–P09). Headless Chromium (Playwright): start shows "Allowed moves: east, south (blocked: north, west)"; after Hint "east is permitted: the rules allow east, south from this position.", moves remaining still 6 | Observed 2026-11-27 (automated browser run; manual browser check still to do) |
| Hint integrated (state unchanged after advice) | | | | |
| Peer trace browser → adapter → validator → display | | | | |
| Rejection, fallback, UI failure states, stale discard | | | | |
| Own unit/integration checks (`node --test tests/*.test.mjs`) | | | | |
| Seeded failure diagnosed (request ID → event) | | | | |
| PR / local review decision | | | | |
| Release candidate in local host (URL, restart command) | | | | |

## Bounded refactor

- Component and interface (signature, inputs, outputs, no mutation): `describeMoves(allowed: readonly MoveAction[], hint: Pick<Hint, 'action'> | null): MovesView` in `src/presentation.ts`, where `MovesView = { allowed: Direction[]; blocked: Direction[]; hintPermitted: boolean | null; reason: string }`. Pure: no DOM, no clock, no rule calls; inputs not mutated (test P06). It only describes the permitted list it is given — legality is still decided by `allowedActions` and the server validator.
- Exactly what changed from supplied code (files/functions): **New** `src/presentation.ts`, `tests/presentation.test.mjs`. **Changed** `browser/app.mjs`: import `allowedActions` and `describeMoves`; `render()` writes the allowed/blocked line; new `showWhy()`; `onHint()` shows the why line computed against the request snapshot (after the stale check); `move()` (accepted only) and `reset()` clear the why line. `browser/index.html`: added `#allowed` and `#why` elements. `browser/styles.css`: one rule for them. **Unchanged:** server, handler, adapter, validator, rules, fixed tests (`presentation.js` was already on the server's browser-module allowlist).
- Tests (normal, boundary) and their independent expectations: Expectations are board facts worked out by hand (3×3, wall (1,1)). Normal P01: allowed [east, south], hint east → blocked [north, west], permitted true. Boundary P02: allowed [], hint null → all four blocked, permitted null, "No permitted moves for this state." Also P03 illegal north → false; P05 N/E/S/W ordering; P06 no mutation; P07–P09 with the real rules: (1,0) beside the wall → [east, west]; won game → []; start → [east, south].

## Failure linked to its event

| Mode | Browser request ID | Displayed result | Terminal event line | Cause |
|---|---|---|---|---|
| validation | | | | |
| timeout | | | | |

Unfinished criteria (honest list):
