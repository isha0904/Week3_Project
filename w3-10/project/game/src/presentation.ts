// P3 owned component: presentation of permitted moves and why an offered hint is permitted.
// Pure: no DOM, no clock, no rule calls, and inputs are never mutated. It only describes data it is
// given; deciding legality stays with the rules (allowedActions) and the server-side validator.
import type { Direction, Hint, MoveAction } from './contracts.js';
import { DIRECTION_ORDER } from './rules.js';

export interface MovesView {
  allowed: Direction[];          // permitted directions, always in north/east/south/west order
  blocked: Direction[];          // the remaining directions, same order
  hintPermitted: boolean | null; // null when there is no hint to judge
  reason: string;                // one sentence for the player
}

const list = (directions: readonly Direction[]): string => directions.join(', ');

export function describeMoves(allowed: readonly MoveAction[], hint: Pick<Hint, 'action'> | null): MovesView {
  const permitted = new Set(allowed.map((action) => action.direction));
  const allowedDirections = DIRECTION_ORDER.filter((d) => permitted.has(d));
  const blocked = DIRECTION_ORDER.filter((d) => !permitted.has(d));

  if (allowedDirections.length === 0) {
    return { allowed: [], blocked, hintPermitted: null, reason: 'No permitted moves for this state.' };
  }
  if (hint === null) {
    return { allowed: allowedDirections, blocked, hintPermitted: null, reason: 'Request a hint to see why it is permitted.' };
  }
  const direction = hint.action.direction;
  if (permitted.has(direction)) {
    return {
      allowed: allowedDirections,
      blocked,
      hintPermitted: true,
      reason: `${direction} is permitted: the rules allow ${list(allowedDirections)} from this position.`,
    };
  }
  return {
    allowed: allowedDirections,
    blocked,
    hintPermitted: false,
    reason: `${direction} is not permitted: the rules allow only ${list(allowedDirections)} from this position.`,
  };
}
