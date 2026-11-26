# W3.10 · Project preparation: contextual hints and graceful failure

**Duration:** 120 minutes — 10 min retrieval (W3.08 validator, W3.09 signals), 20 min concepts, 20 min
demonstrations, 45 min challenge, 15 min individual checks, 10 min recovery/debrief.

A hint offers a possible next action. Your game remains responsible for deciding whether a move is legal.
Today you design one contextual hint flow, run its reference implementation, and write acceptance criteria
you can test during P3.

## Outcomes

- Choose a small advice question with an observable answer for your game.
- Name the selected state (context), who derives permitted actions and what the model may see.
- Keep hints separate from rule enforcement: advice never changes position, score, collected items or moves.
- Specify what the player sees while advice is loading, invalid, unavailable or stale.
- Write concrete acceptance examples and say which are automatic checks and which need human review.

## What is supplied and what you own

| Supplied (reference, not your authored evidence) | You own |
|---|---|
| `starter/` — runnable reference game + hint flow (TypeScript server adapter, rule evaluator, validator, fallback, instrumentation, browser) | The design and acceptance examples in [`evidence.md`](evidence.md) (the Lab brief template) |
| `demo/` — the same flow as plain JavaScript for the demonstrations (`demo/browser/app.mjs`, `demo/browser/client.mjs`, `demo/supplied/handler.mjs`) | One bounded P3 change you identify |
| `Makefile` and `lab.py` (same commands without make), [`rubric.md`](rubric.md) | |

The starter intentionally passes all 29 fixed adapter checks (`tests/evaluation.test.mjs`: 24 response
checks H01–H06; `tests/signals.test.mjs`: 5 signal checks). Today's owned work is the design, not repairing
a seeded code defect. **No live model, API key, account or BP environment is involved**: every mode is a
deterministic local stub. `source: model` names the accepted adapter path, not proof of a model call.

## Prerequisites

Node 22.23.2 / npm 10.9.8 (course pin; Node 24 also works), TypeScript 5.9.3 (pinned in
`starter/package.json`), Python 3, and optionally GNU Make. A browser for http://127.0.0.1:4310.

## Setup

From this lab directory (`learner/units/w03-software-design-and-ai/labs/w3-10`):

```bash
cd starter && npm ci && cd ..      # once: installs the pinned TypeScript 5.9.3 compiler
make test                          # compiles starter and runs the 29 supplied adapter checks
make serve MODE=success            # then open http://127.0.0.1:4310 ; Ctrl+C stops the server
```

Without make (Windows PowerShell or any shell):

```bash
python lab.py test                       # = make test
python lab.py serve --mode success       # = make serve MODE=success
python lab.py demo --mode success        # = make demo MODE=success (plain-JavaScript demonstration)
```

or inside `starter/`: `npm test`, `npm run serve -- --mode success`, `npm run fixtures` (checks the rule
evaluator against the shared fixtures F01–F11).

Modes (`MODE=`): `success`, `validation` (well-shaped but illegal advice), `timeout` (abort-aware hanging
stub, reference 2-second deadline), `malformed` (`{not json`), `provider-failure`, `irrelevant`
(legal east, "Bananas are yellow."). Each completed request prints one terminal event, for example
`{"requestId":"hint-…","latencyMs":1.2,"outcome":"validation-failure","fallback":true}`.

## Concepts to keep in view

- **Context and snapshot.** The browser posts a board identifier and a state snapshot (`boardId`, `state`,
  `stateVersion`) to `POST /api/hint`. The handler derives permitted moves with the rule evaluator, then
  projects only board ID, position, remaining moves and permitted actions into model input.
- At (0,0), north and west leave the board; east and south are permitted. A completed game has no
  permitted actions: no hint and no model call.
- The adapter returns an envelope `{ hint, source, requestId }`; `source` is `model` or `fallback`;
  `hint` can be null. Returning advice leaves position, score, collected items and moves unchanged.
- `await askForHint(...)` waits without blocking move buttons. The browser saves `stateVersion` before the
  request and compares it afterwards; `try/catch/finally` shows success, handles failure and re-enables
  the hint button on either path (see `starter/browser/app.mjs`, function `onHint`).
- Deterministic fallback: the first permitted move in north/east/south/west order, or null. A legal
  default, not a promise of winning.

| Condition | Player sees | State/rule behaviour |
|---|---|---|
| Waiting | Loading advice; hint button disabled | Move controls remain usable |
| Valid current advice | Suggested direction, source and request ID | No move is applied |
| Returned advice fails shape or legality checks | Deterministic permitted fallback | Same state remains playable |
| Model client times out/fails | Same fallback through the server | Event identifies the distinct cause |
| Browser cannot reach server | Advice unavailable; keep playing | Local move controls still work |
| State changed during request | Request fresh advice | Old response is discarded |
| No permitted actions | No permitted action | No invented move or model call |

## Demonstration 1: connect the hint button

Run `make demo MODE=success` (or `python lab.py demo --mode success`) and open http://127.0.0.1:4310.
Read the click handler in `demo/browser/app.mjs`: it copies state, records its version, displays loading,
awaits `askForHint`, and displays the envelope. `demo/browser/client.mjs` sends the POST;
`demo/supplied/handler.mjs` derives permitted actions and validates advice. Trace one request through
these files, then click East yourself. The hint alone must not consume a move.

## Demonstration 2: valid, rejected and unavailable advice

Restart the demonstration with `MODE=success`, `MODE=validation` and `MODE=timeout`. At the initial state:
success returns model-source east; invalid advice returns fallback east with `validation-failure`; the
simulated timeout returns fallback east with `timeout` (after about two seconds). Compare each browser
request ID with its terminal event line. Stop the local server (Ctrl+C) after the page loads and request
again: "Advice unavailable; keep playing." appears and East still moves the player.

## Challenge: design one contextual hint flow — 45 minutes

Start with your working Week 2 game and the W3.07–W3.09 hint boundary, or use the supplied working
reference. Copy [`evidence.md`](evidence.md) into your working notes.

1. **Choose the feature — 8 minutes.** Name the game, player objective, one advice question, and one example
   of useful advice.
2. **Define the boundary — 10 minutes.** List the selected state fields and who derives permitted actions.
   Trace the reference POST through browser client, handler, validator and event. Identify one component to
   integrate or refactor in P3.
3. **Write acceptance examples — 12 minutes.** Supply concrete initial state, action/input and observable
   result for valid advice, structurally valid illegal advice, timeout and unavailable server. Include
   unchanged state, null/no-action and stale response behaviour. Distinguish automatic checks from human
   usefulness review.
4. **Try the design — 10 minutes.** Run `success` and `validation` modes against the initial reference
   state, then `timeout` mode. Correlate each displayed ID with its terminal event. Record any mismatch
   between your proposed criteria and supplied behaviour. For your own game, state which reference
   assumptions need changing.
5. **Explain individually — 5 minutes.** Demonstrate rejected north advice at (0,0) (`MODE=validation`),
   name `validation-failure`, and show that a player can still move. Explain why displaying advice must not
   invoke the move operation.

## Acceptance criteria

The template contains a concrete state contract, all failure examples, deterministic fallback order, UI
states and one bounded P3 change. Both peers can explain it. Use [`rubric.md`](rubric.md) to check your
evidence. A passing supplied suite is baseline evidence, not proof you implemented your chosen game feature.

## Hints

- **Hint 1:** start with "one permitted next move".
- **Hint 2:** use the rule evaluator (`allowedActions` in `starter/src/rules.ts`) to obtain legal actions.
- **Hint 3:** choose the first permitted action for fallback and null for an empty list. If your game has
  different rules, write one real state/action example before changing interfaces.

## Individual self-check

Answer with a reason before facilitator feedback.

1. At (0,0), advice has a valid JSON shape but suggests north. What must check it, what does the player
   receive, and which outcome should be recorded?
2. The player moves while a hint request is waiting. Why might the eventual answer be unsuitable even if it
   passed validation? What should the browser do?
3. The model client times out, then in a separate run the browser cannot reach the server. How do the two
   player experiences differ, and how can play continue?
4. A legal move passes every automated gate but its explanation does not help collect treasure. What
   additional evaluation is needed?
5. Show individually that asking for advice does not change the move budget. Explain which operation is
   permitted to change it.

## Recovery and teardown

If setup fails, retain the error and review the supplied code with a partner; mark runtime observations
unverified. Port 4310 busy: stop your own earlier server (Ctrl+C in its terminal) or use
`python lab.py serve --port 4311` and record the changed URL; do not stop a server you did not start.
Preserve your notes and changes before restoring a fresh starter. Stop the server with Ctrl+C when done.
Continue with P3 (`../../projects/p3/README.md`).

## Optional depth

For your own game, write the extra context your feature would need (for example the target or collected
items) and list the server projection, contract and tests that would have to change together.
