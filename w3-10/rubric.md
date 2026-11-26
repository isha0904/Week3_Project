# W3.10 rubric — design one contextual hint flow

| Criterion | Meets | Not yet |
|---|---|---|
| Feature | Names game, objective, one observable advice question and one useful example | "Play better" style goal, or several suggestions at once |
| State contract | Lists posted fields, projected model fields and that the server derives permitted actions from rules | Model or browser list treated as the authority for legality |
| Failure examples | Concrete state/input/result for valid, illegal-but-well-shaped, timeout and unavailable server | Generic statements without a state or observable result |
| Unchanged state, null and stale | Includes unchanged move budget after advice, null hint with no model call, discarded stale response | Any of the three missing |
| Fallback order | First permitted in north/east/south/west order, or null | Random, "best" or model-chosen fallback |
| UI states | Waiting, valid, rejected, client failure, server unreachable, stale, no action | Missing unavailable or stale state |
| Automatic vs human | Separates automatic checks (shape, legality, unchanged state) from human usefulness review | Claims tests prove usefulness |
| Evidence | Displayed request IDs correlated with terminal events for success, validation and timeout, or marked unverified | Copied output or uncorrelated rows |
| P3 change | One bounded component with an interface and a test idea | Rewrite of the whole game or replacing the server adapter with a browser model call |
| Individual | Each peer explains rejected north at (0,0) and why advice never calls the move operation | Only one peer can explain |
