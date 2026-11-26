# P3 · Reviewed game with contextual hints

**540 minutes:** Thursday afternoon 180 minutes and Friday 360 minutes. Build a tested hint feature into
your game, refactor one bounded component behind a clear interface, and demonstrate that play continues
when advice fails. Work in a pair with a personal branch and individual explanation. Use only synthetic
game state in this local exercise.

## Starting point and setup

Bring your working Week 2 game, its rules/tests, and your W3.10 design. Reuse the W3.07 context
projection, W3.08 validation/fallback and W3.09 instrumentation. The complete runnable reference is
`../starter` (that is, [`labs/w3-10/starter`](../../labs/w3-10/starter)); its server adapter, rule evaluator
and browser hint flow are supplied, not your authored evidence.

From `learner/units/w03-software-design-and-ai/labs/w3-10`, copy the working starter to a new folder and
establish the baseline:

```bash
cp -R starter project/game
make test CANDIDATE=project/game
make serve CANDIDATE=project/game MODE=success
```

Use a fresh `project/game` destination; if it already exists, retain it and continue there rather than
nesting another copy. Open http://127.0.0.1:4310. The initial supplied suite passes 29 adapter checks.
Ctrl+C stops the local server. All modes use deterministic local responses; `source: model` names an
adapter path, not proof of a live model call. No credentials, live model setup or BP environment is needed.

Windows without make (PowerShell, from the same `labs/w3-10` directory):

```powershell
Copy-Item -Recurse starter project/game
python lab.py test --candidate project/game
python lab.py serve --candidate project/game --mode success
```

`lab.py` runs `npm ci` in the candidate the first time if no TypeScript compiler is found. Serve modes:
`success`, `validation`, `timeout`, `malformed`, `provider-failure`, `irrelevant`.

For your own game, migrate one browser component at a time into this supplied host, or connect its existing
host to the supplied `/api/hint` route. Keep the browser and API on the same origin. The reference rule
evaluator is the default; a different game requires corresponding state, allowed-action and validator tests.
Do not replace the supplied adapter with a browser-side model call.

If you use the reference game throughout, implement a visible change: show the allowed moves for the
current state and explain why an offered hint is permitted. Refactor that presentation into an independently
testable function, and add your own game-specific acceptance tests. Simply copying the complete supplied
browser is insufficient project work.

## Before changing code

A rule interface accepts state/action and returns a decision without mutating its input. A hint interface
accepts selected context and returns advisory data. Keep them separate: requesting or displaying advice
cannot apply a move. The server computes permitted actions, checks the response and selects deterministic
fallback. When the browser state changes while awaiting advice, discard that old response.

Use the branch, small-commit and pull-request workflow from W3.01–W3.06. If AI assistance is unavailable,
complete the bounded change manually. If used, retain the prompt or request summary
([`starter/assistance-record.md`](starter/assistance-record.md)), identify generated changes, inspect the
diff and run tests yourself. No live model call is required for project completion.

## Milestones and checkpoints

| Time | Owned work | Observable checkpoint |
|---|---|---|
| Thursday 0–30 · 30 min | Confirm baseline; select feature, criteria and one refactor | Existing game runs; baseline test result; named files/interface |
| Thursday 30–90 · 60 min | Extract or adapt one rule/service/presentation boundary | Pure operation has independent normal and boundary tests; existing behaviour preserved |
| Thursday 90–150 · 60 min | Integrate hint button with current state and server route | Valid advice displayed without changing position, budget or score |
| Thursday 150–180 · 30 min | Commit working checkpoint and review context/ownership | Peer traces browser → adapter → validator → display; unfinished work listed |
| Friday 0–75 · 75 min | Complete rejection, deterministic fallback and UI failure states | Invalid advice and simulated timeout keep game playable; stale response discarded |
| Friday 75–150 · 75 min | Add unit/integration checks and evaluate representative advice | Own normal and failure checks pass; legal versus useful results recorded separately |
| Friday 150–210 · 60 min | Instrument outcomes and diagnose a seeded failure | Actual request ID links symptom to timeout or validation-failure event |
| Friday 210–270 · 60 min | Review assisted/manual changes in a PR and resolve essential findings | Diff explanation, test evidence and reviewer decision; local review record if remote unavailable |
| Friday 270–330 · 60 min | Run release candidate in supplied local host; test success/failure | Runnable final game and local URL; restart procedure and failure observations |
| Friday 330–360 · 30 min | Individual demonstrations and handover | Each learner explains own change and demonstrates preserved playability |

Total: 180 + 360 = 540 minutes. Commit at the end of each working milestone. Use the last known working
commit if an integration breaks; reapply only the small owned change. Keep a short evidence record
([`starter/evidence.md`](starter/evidence.md)), not a separate long report.

## Tests and evaluation

Keep the fixed adapter expectations. From the lab root run:

```bash
make test CANDIDATE=project/game
cd project/game
tsc -p tsconfig.json
node --test tests/*.test.mjs
```

(Windows: `python lab.py test --candidate project/game`, then in `project/game`:
`npx tsc -p tsconfig.json` and `node --test tests/*.test.mjs`.)

The second command runs any new tests you add as well as the fixed tests; `make test` deliberately runs
only the supplied named files. Use Node's `node:test` and `node:assert/strict` style from
`tests/evaluation.test.mjs`. Import compiled TypeScript from `../dist/...js`. Choose independent expected
results from your acceptance examples, not from the function under test.

Required coverage: your extracted component with a normal and boundary input; the integrated hint request
with a permitted response; a valid-shaped but illegal action; timeout/failure with deterministic fallback;
no permitted action; and unchanged state after advice. Exercise the real browser for loading, unavailable
server and state changes while waiting (record these in [`starter/browser-checks.md`](starter/browser-checks.md)).
Do not claim the fixed suite covers a new DOM component.

Evaluate at least four representative cases — initial state, a state beside a wall, a near-goal state and a
completed game — in [`starter/evaluation-record.md`](starter/evaluation-record.md): actual suggestion,
whether legal, whether helpful and why. Include a deliberately irrelevant explanation (`MODE=irrelevant`)
to show that legality alone is insufficient. A local stub validates your application flow; it does not
establish real model quality.

## Completion and failure checks

- A player can use the game and request advice about its current state through the supplied server boundary.
- One bounded refactor has a documented interface and independent tests. Explain exactly what you changed from supplied code.
- Valid advice is displayed without changing game state; only player actions apply rules.
- Invalid advice and simulated model failures produce a deterministic legal fallback, or null when no action is available. The unavailable-server message also leaves move controls usable.
- Loading and stale-state behaviour are demonstrated in the browser. A reset during a request cannot display outdated advice.
- Outcomes record only request ID, handler latency, outcome and fallback. Link one user-visible failure to its own event and distinguish timeout from validation failure. Terminal events are local evidence and must not be called Grafana evidence (use the W3.09 view where prepared).
- Tests and human usefulness judgments are recorded separately. Preserve actual failures and fixes; do not change expectations merely to obtain a pass.
- The PR or local review ([`starter/review-record.md`](starter/review-record.md)) records the design decision, authored/assisted changes, checks and remaining limitations. Do not publish externally without the delivery environment's authorisation.
- The final candidate runs in the supplied local host. Record the URL and restart command. This is local deployment evidence; BP or externally hosted deployment is unverified unless separately performed in an authorised environment.

## Hints and recovery

- **Hint 1:** trace a single request before adding another feature.
- **Hint 2:** reuse the server-derived action list for validation and fallback.
- **Hint 3:** keep advice as display data; compare the saved state version after awaiting the response and
  leave rule mutation in the move handler.

If time is tight, finish one complete hint flow with failure handling before adding richer explanations.
The reference baseline remains available for comparison. Record an unfinished criterion honestly; a video
or partner's passing run does not replace your own execution. Port 4310 busy: stop your own earlier server
or use `python lab.py serve --candidate project/game --port 4311` and record the URL.

## Individual demonstration — within the final 30 minutes

Each learner has five minutes: identify and explain their owned function or diff; request a hint without
consuming a move; force a valid-shaped illegal response (`MODE=validation`) and locate its matching
terminal event; then show a playable game after the service is stopped. Explain the fallback choice, one
meaningful test and one human usefulness judgment. State which work was independent, guided or supplied.
