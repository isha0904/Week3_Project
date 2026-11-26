# W3.10 Lab brief — contextual hint design template

Copy this file into your working notes. Mark every runtime observation as **observed**, **predicted** or
**unverified (setup blocked)**. Use synthetic game state only.

## 1. Feature (8 min)

| Field | Your answer |
|---|---|
| Game | |
| Player objective | |
| One advice question (observable answer) | e.g. "Which permitted move can I try next?" |
| One example of useful advice (state + suggestion + why it helps) | |

## 2. Boundary (10 min)

| Item | Your answer |
|---|---|
| Selected state fields posted by the browser | |
| Fields projected into model input | |
| Who derives permitted actions (file/function) | |
| Trace: browser client → handler → validator → event (files) | |
| Extra context your own game needs (if any) and the projection/contract/tests that change with it | |
| One component to integrate or refactor in P3 (name, interface, why bounded) | |

## 3. Acceptance examples (12 min)

| # | Initial state | Action / input | Observable result | Automatic check or human review? |
|---|---|---|---|---|
| A1 valid advice | | | | |
| A2 structurally valid illegal advice | | | | |
| A3 timeout | | | | |
| A4 unavailable server | | | | |
| A5 unchanged state after advice | | | | |
| A6 null / no permitted action | | | | |
| A7 stale response (move or reset while waiting) | | | | |
| A8 usefulness of an explanation | | | | |

Deterministic fallback order: ______________________ (and the result when no action is permitted: ______)

## 4. UI states

| Condition | Player sees | State/rule behaviour |
|---|---|---|
| Waiting | | |
| Valid current advice | | |
| Fails shape/legality | | |
| Client timeout/failure | | |
| Server unreachable | | |
| State changed during request | | |
| No permitted actions | | |

## 5. Try the design (10 min)

| Mode | Displayed source | Displayed request ID | Terminal event (outcome, fallback) | Matches my criterion? |
|---|---|---|---|---|
| success | | | | |
| validation | | | | |
| timeout | | | | |

Mismatches between my criteria and supplied behaviour / reference assumptions that change for my game:

## 6. Individual explanation (5 min)

- Rejected north advice at (0,0): outcome recorded = ______; the player can still move because ______.
- Why displaying advice must not invoke the move operation:
- One difference between legal and useful advice:
- One concrete acceptance criterion and the test or observation that establishes it:

## Support used

Independent / prompted / guided / not yet demonstrated; environment blocked (describe):
