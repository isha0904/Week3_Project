// P3 owned tests for the presentation component (describeMoves).
// Expected values come from board facts on the reference board (start (0,0), wall (1,1), 3x3),
// worked out by hand — not from running describeMoves.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeMoves } from '../dist/presentation.js';
import { allowedActions, initialState, REFERENCE_BOARD } from '../dist/rules.js';

const moves = (...directions) => directions.map((direction) => ({ type: 'move', direction }));
const hint = (direction) => ({ action: { type: 'move', direction }, explanation: 'Synthetic test hint.' });
const at = (x, y, movesRemaining, extra = {}) => ({
  position: { x, y }, movesRemaining, score: 0, collected: [], status: 'playing', ...extra,
});

// Normal: start (0,0). North and west are off the board, so east and south are permitted.
test('P01 normal: permitted east at the start is explained', () => {
  const view = describeMoves(moves('east', 'south'), hint('east'));
  assert.deepEqual(view, {
    allowed: ['east', 'south'],
    blocked: ['north', 'west'],
    hintPermitted: true,
    reason: 'east is permitted: the rules allow east, south from this position.',
  });
});

// Boundary: completed game — no permitted moves and no hint (the server returns hint: null).
test('P02 boundary: no permitted moves and no hint', () => {
  const view = describeMoves([], null);
  assert.deepEqual(view, {
    allowed: [],
    blocked: ['north', 'east', 'south', 'west'],
    hintPermitted: null,
    reason: 'No permitted moves for this state.',
  });
});

// A hint outside the permitted list is reported as not permitted (north is off the board at (0,0)).
test('P03 hint outside the permitted list is not permitted', () => {
  const view = describeMoves(moves('east', 'south'), hint('north'));
  assert.equal(view.hintPermitted, false);
  assert.equal(view.reason, 'north is not permitted: the rules allow only east, south from this position.');
});

// Before any hint is shown the permitted moves are still listed.
test('P04 permitted moves are listed when there is no hint yet', () => {
  const view = describeMoves(moves('east', 'south'), null);
  assert.deepEqual(view.allowed, ['east', 'south']);
  assert.equal(view.hintPermitted, null);
  assert.equal(view.reason, 'Request a hint to see why it is permitted.');
});

// Output order is always north/east/south/west, whatever order the input list uses.
test('P05 output uses north/east/south/west order', () => {
  const view = describeMoves(moves('west', 'south', 'north'), hint('south'));
  assert.deepEqual(view.allowed, ['north', 'south', 'west']);
  assert.deepEqual(view.blocked, ['east']);
});

// Inputs are not mutated.
test('P06 inputs are unchanged after describing', () => {
  const allowed = moves('south', 'east');
  const offered = hint('east');
  const before = structuredClone({ allowed, offered });
  describeMoves(allowed, offered);
  assert.deepEqual({ allowed, offered }, before);
});

// Integration with the real rules: beside the wall at (1,0) — north is the edge, south is the wall (1,1).
test('P07 beside a wall: real permitted list at (1,0) is east, west', () => {
  const view = describeMoves(allowedActions(REFERENCE_BOARD, at(1, 0, 5)), hint('east'));
  assert.deepEqual(view.allowed, ['east', 'west']);
  assert.deepEqual(view.blocked, ['north', 'south']);
  assert.equal(view.hintPermitted, true);
});

// Integration with the real rules: a won game has no permitted moves.
test('P08 completed game: real permitted list is empty', () => {
  const won = at(2, 2, 2, { score: 10, collected: ['t1'], status: 'won' });
  const view = describeMoves(allowedActions(REFERENCE_BOARD, won), null);
  assert.deepEqual(view.allowed, []);
  assert.equal(view.reason, 'No permitted moves for this state.');
});

// Integration with the real rules at the start state.
test('P09 start state: real permitted list matches the board facts', () => {
  const view = describeMoves(allowedActions(REFERENCE_BOARD, initialState()), null);
  assert.deepEqual(view.allowed, ['east', 'south']);
});
