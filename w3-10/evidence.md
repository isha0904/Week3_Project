# W3.10 Lab brief — contextual hint design template

Copy this file into your working notes. Mark every runtime observation as **observed**, **predicted** or
**unverified (setup blocked)**. Use synthetic game state only.

## 1. Feature (8 min)

| Field | Your answer |
|---|---|
| Game | Treasure Hunt (reference 3×3 board: start (0,0), wall (1,1), treasure t1 at (2,0) worth 10, exit (2,2)) |
| Player objective | Collect treasure t1 and reach the exit before the 6-move budget runs out |
| One advice question (observable answer) | "Which permitted move should I make next to get to the treasure?" — answer is exactly one direction from the server-derived permitted list |
| One example of useful advice (state + suggestion + why it helps) | State (0,0), 6 moves, collected [], playing → suggest **east**. Why: east, east collects t1 at (2,0) in 2 moves, then south, south reaches the exit in 4 total (2 spare). South first wastes a move: the only winning continuation is north, east, east, south, south — 6 moves in total, no spare — and following south, south, east, east reaches the exit without t1, after which t1 and the exit need 8 moves in total > 6, so that route cannot win. |

## 2. Boundary (10 min)

| Item | Your answer |
|---|---|
| Selected state fields posted by the browser | `boardId` ("reference"), `state` = { `position` {x, y}, `movesRemaining`, `score`, `collected`, `status` } (a `structuredClone` snapshot taken when Hint is clicked), `stateVersion`. Optional `control` (W3.09 scenario/wait) only if the page has those inputs — this page does not. (`browser/app.mjs` `onHint`, `HintRequestBody` in `src/contracts.ts`) |
| Fields projected into model input | `context` = { `boardId`, `position` {x, y}, `movesRemaining` } + `allowedActions` [{type, direction}]. **Not sent to the model:** `score`, `collected`, `status`, `stateVersion`, the request ID, or any extra/display properties (leaf fields are copied one by one in `src/request-hint.ts`, not spread). |
| Who derives permitted actions (file/function) | The **server**: `allowedActions(board, state)` in `src/rules.ts`, called by `handleHint` in `src/handler.ts` on the posted state. It tries N, E, S, W against `evaluate()` and keeps the accepted ones. Neither the browser nor the model supplies this list; the model only receives a copy, and `validHint` checks the answer against the server's own list. |
| Trace: browser client → handler → validator → event (files) | `browser/app.mjs` `onHint` → `browser/client.mjs` `askForHint` (POST `/api/hint`, same origin) → `src/server.ts` (assigns `hint-xxxxxxxx` request ID) → `src/handler.ts` `handleHint` (`readRequest`, `allowedActions`, 2000 ms `withTimeout`) → `src/request-hint.ts` `requestHint` (projection) → model client (`src/scenarios.ts` stub) → `src/validation.ts` `validHint` / `fallbackHint` → `src/instrumentation.ts` `recordHint` (one terminal JSON line) → envelope back to `app.mjs` (stale check, `showAdvice`) |
| Extra context your own game needs (if any) and the projection/contract/tests that change with it | Using the reference game, so no new state fields. **Gap noted:** the advice question mentions the treasure, but the model does not receive `collected`, so after t1 is picked up it cannot tell that the goal has become the exit. Adding it would change `GameContext` (`contracts.ts`), the `requestHint` projection and need a test asserting the exact model payload. **Decision for P3:** keep the supplied projection (fixed adapter expectations); legality is unaffected, and the gap is recorded as a usefulness limitation in the evaluation record. |
| One component to integrate or refactor in P3 (name, interface, why bounded) | **`describeMoves`** in a new `src/presentation.ts` (built in P3 as `src/presentation.ts`, the name already on the server's browser-module allowlist; originally planned as `hint-view.ts`): `describeMoves(allowed: readonly MoveAction[], hint: Hint \| null) → { allowed: Direction[]; blocked: Direction[]; hintPermitted: boolean \| null; reason: string }`. Pure presentation: no DOM, no rule calls, does not mutate inputs. Drives the visible change (show allowed moves for the current state and why the offered hint is permitted). Bounded: one new module + a few lines in `app.mjs`; server adapter, validator and rules untouched. Test idea: normal — allowed [east, south], hint east → blocked [north, west], `hintPermitted` true; boundary — allowed [], hint null → `hintPermitted` null, "no permitted moves". |

## 3. Acceptance examples (12 min)

All states use the reference board. Notation: (x,y), moves remaining, collected, status.

| # | Initial state | Action / input | Observable result | Automatic check or human review? |
|---|---|---|---|---|
| A1 valid advice | (0,0), 6, [], playing | `MODE=success`, click Hint | "Suggested: east - Explore the open eastern square. (source: model, request ID: hint-…)"; event `model-success`, `fallback:false` | Automatic (shape + legality + envelope); browser display by observation |
| A2 structurally valid illegal advice | (0,0), 6, [], playing | `MODE=validation` (stub returns well-shaped **north**, which is off the board) | North rejected; shows "Suggested: east - A permitted next move. (source: fallback, …)"; event `validation-failure`, `fallback:true` | Automatic |
| A3 timeout | (0,0), 6, [], playing | `MODE=timeout` (stub never answers), click Hint | "Loading advice..." and Hint disabled ~2 s while move buttons still work; then fallback east, source fallback; event `timeout`, `fallback:true`, latency ≈ 2000 ms | Automatic (handler outcome); loading UI by browser observation |
| A4 unavailable server | (0,0), 6, [], playing; page loaded | Stop the server (Ctrl+C), click Hint, then East | "Advice unavailable; keep playing."; East is accepted → (1,0), 5 moves; Hint re-enabled; no server event (server is down) | Human review (real browser) |
| A5 unchanged state after advice | (0,0), 6, [], score 0, playing | Click Hint (any mode) | Position (0,0), 6 moves, score 0, collected [] and `stateVersion` all unchanged after advice is shown | Automatic (posted state not mutated by `handleHint`) + browser observation |
| A6 null / no permitted action | (2,2), 2, [t1], score 10, **won** | Click Hint | "No permitted action. (source: fallback, …)"; hint `null`; model client **not called**; event `no-action`, `fallback:true` | Automatic (`client.calls.length === 0`) |
| A7 stale response (move or reset while waiting) | (0,0), 6, [], playing | `MODE=timeout`, click Hint, then East (or Reset) before it returns | "State changed while waiting; request fresh advice."; the old east advice is never displayed; state is (1,0), 5 (or fresh start after Reset) | Human review (real browser; fixed suite has no DOM test) |
| A8 usefulness of an explanation | (0,0), 6, [], playing | `MODE=irrelevant` | "Suggested: east - Bananas are yellow. (source: model)" — passes every automatic check (legal, well-shaped) but tells the player nothing about the board | Human review (legal ≠ useful) |

Deterministic fallback order: **first permitted action in north → east → south → west order** (and the result when no action is permitted: **`hint: null`, `source: fallback`, no model call**)

## 4. UI states

| Condition | Player sees | State/rule behaviour |
|---|---|---|
| Waiting | "Loading advice..."; Hint button disabled | Move and Reset buttons still work; `stateVersion` saved before the request |
| Valid current advice | "Suggested: \<direction\> - \<explanation\> (source: model, request ID: hint-…)" | Display only; no move applied; state unchanged |
| Fails shape/legality | "Suggested: \<first permitted\> - A permitted next move. (source: fallback, request ID: …)" | Server replaced the answer; event `validation-failure`; state unchanged |
| Client timeout/failure | Same fallback text (source: fallback) after the 2 s deadline | Event `timeout` (or `provider-failure` / `validation-failure` for malformed JSON); state unchanged |
| Server unreachable | "Advice unavailable; keep playing." | `fetch` rejects → caught in `onHint`; Hint re-enabled in `finally`; moves still work |
| State changed during request | "State changed while waiting; request fresh advice." | Response discarded because saved version ≠ current `stateVersion` |
| No permitted actions | "No permitted action. (source: fallback, request ID: …)" | Game is won/lost; no model call; event `no-action` |

## 5. Try the design (10 min)

**Observed 2026-11-26** by POSTing the initial state (0,0), 6, [], playing to `/api/hint` on the supplied host
(`node dist/server.js --mode <mode>`, the same server `lab.py serve` starts). Source and request ID below are
from the HTTP response envelope (what `app.mjs` displays); the in-browser display itself is **not yet observed**
and is recorded in P3 `browser-checks.md`.

| Mode | Displayed source | Displayed request ID | Terminal event (outcome, fallback) | Matches my criterion? |
|---|---|---|---|---|
| success | model (east, "Explore the open eastern square.") | hint-72cd6ba9 | `{"requestId":"hint-72cd6ba9","latencyMs":0.63,"outcome":"model-success","fallback":false}` | Yes — A1 |
| validation | fallback (east, "A permitted next move.") | hint-8eec9984 | `{"requestId":"hint-8eec9984","latencyMs":0.54,"outcome":"validation-failure","fallback":true}` | Yes — A2 |
| timeout | fallback (east, "A permitted next move.") | hint-4f6a49fa | `{"requestId":"hint-4f6a49fa","latencyMs":2004.82,"outcome":"timeout","fallback":true}` | Yes — A3 (≈ 2000 ms deadline) |

Also observed: completed game (2,2), [t1], won → `hint: null`, source fallback, event `no-action` (hint-5a6ed9fe);
`MODE=irrelevant` → east, "Bananas are yellow.", source model, event `model-success` (hint-53913bfb) — legal but not useful (A8).

Mismatches between my criteria and supplied behaviour / reference assumptions that change for my game:

- The model context has no `collected`, so it cannot know whether t1 is already taken; my treasure-focused advice question can only be judged useful by a human, not guaranteed by the flow.
- The success stub does not reason about the map: it picks the first permitted move in east → south → west → north preference. At (0,0) this happens to be the useful move (east); in other states it may not be, which the P3 evaluation record must show.
- Same request ID appears in the envelope, the `x-request-id` header and the terminal event, so a visible failure can be linked to its event without extra work.

## 6. Individual explanation (5 min)

- Rejected north advice at (0,0): outcome recorded = **`validation-failure`, `fallback: true`** (observed, hint-8eec9984); the player can still move because **the server replaced north with the first permitted move (east, source: fallback), the advice is only text in the advice area, and the move buttons call `evaluate()` locally in `move()` — completely separate from the hint flow; the Hint button is re-enabled in `finally`.**
- Why displaying advice must not invoke the move operation: advice comes from an untrusted source and may be wrong, late or stale. Only the player's own action may change position, moves, score or collected items; if showing a hint applied a move, a bad or out-of-date hint could spend the move budget or break the game. `onHint` only calls `showAdvice`, never `move()` or `evaluate()`.
- One difference between legal and useful advice: legal = the move is in the server's permitted list (checked automatically). Useful = it actually helps the objective (human judgement). "east — Bananas are yellow." is legal but useless; south from (0,0) is legal but wastes a move, leaving no spare moves (the only win after it uses all 6).
- One concrete acceptance criterion and the test or observation that establishes it: A2 — at (0,0) a well-shaped north hint is rejected and the player sees fallback east with source fallback; established automatically by the handler test (outcome `validation-failure`, hint east) and observed on the running host (hint-8eec9984).

## Support used

**Guided / AI-assisted.** Section 1: learner's answers (game, objective, advice question, east example), refined with an AI
assistant (Claude Code). Sections 2–6: drafted by the AI assistant at the learner's request from the supplied code and
the runtime checks in section 5; to be reviewed and explained by the learner. Recorded in `p3/starter/assistance-record.md`.
Environment: no setup blocks; all modes are deterministic local stubs.
