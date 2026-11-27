// Supplied browser hint flow. Moves are applied locally by the rule evaluator; advice is display data.
import { allowedActions, evaluate, initialState, REFERENCE_BOARD } from '/dist/rules.js';
import { describeMoves } from '/dist/presentation.js'; // P3 owned presentation component
import { askForHint } from './client.mjs';

const board = REFERENCE_BOARD;
let state = initialState(board);
let stateVersion = 0; // changes whenever the player's state changes (accepted move or reset)

const $ = (selector) => document.querySelector(selector);
const hintButton = $('#hint');

function cellLabel(x, y) {
  if (state.position.x === x && state.position.y === y) return 'P';
  if (board.walls.some((w) => w.x === x && w.y === y)) return '#';
  const treasure = board.treasures.find((t) => t.x === x && t.y === y);
  if (treasure && !state.collected.includes(treasure.id)) return 'T';
  if (board.exit.x === x && board.exit.y === y) return 'E';
  return '.';
}

function render(message) {
  const rows = [];
  for (let y = 0; y < board.height; y += 1) {
    const cells = [];
    for (let x = 0; x < board.width; x += 1) cells.push(`<td>${cellLabel(x, y)}</td>`);
    rows.push(`<tr>${cells.join('')}</tr>`);
  }
  $('#board').innerHTML = rows.join('');
  $('#state').textContent = JSON.stringify(state);
  $('#status').textContent = `Status: ${state.status} | moves remaining: ${state.movesRemaining} | score: ${state.score}`;
  const view = describeMoves(allowedActions(board, state), null); // display only; never applies a move
  $('#allowed').textContent = view.allowed.length === 0
    ? 'Allowed moves: none.'
    : `Allowed moves: ${view.allowed.join(', ')} (blocked: ${view.blocked.join(', ') || 'none'})`;
  if (message !== undefined) $('#message').textContent = message;
}

function showAdvice(text) {
  $('#advice').textContent = text;
}

// Why the displayed hint is permitted, for the state the hint was requested for.
function showWhy(text) {
  $('#why').textContent = text;
}

// Only the player's move action invokes the rule evaluator to update state.
function move(direction) {
  const result = evaluate(board, state, { type: 'move', direction });
  if (result.accepted) {
    state = result.state;
    stateVersion += 1;
    showWhy(''); // the explanation belonged to the previous state
  }
  render(result.accepted ? `Moved ${direction}.` : `Rejected (${result.reason}); state unchanged.`);
}

function reset() {
  state = initialState(board); // restart is a fresh initial state, never a mutated completed one
  stateVersion += 1;
  render('New game.');
  showAdvice('');
  showWhy('');
}

// Optional lab controls (W3.09 scenario and wait) are sent only when the page provides them.
function controls() {
  const scenario = $('#scenario');
  const wait = $('#wait');
  return scenario && wait ? { scenario: scenario.value, waitMs: Number(wait.value) } : undefined;
}

async function onHint() {
  const version = stateVersion;           // saved before the request
  const snapshot = structuredClone(state); // copy at request time
  hintButton.disabled = true;
  showAdvice('Loading advice...');
  showWhy('');
  try {
    const envelope = await askForHint({ boardId: board.id, state: snapshot, stateVersion: version, control: controls() });
    if (version !== stateVersion) {
      showAdvice('State changed while waiting; request fresh advice.');
      return;
    }
    if (envelope.hint === null) {
      showAdvice(`No permitted action. (source: ${envelope.source}, request ID: ${envelope.requestId})`);
    } else {
      showAdvice(`Suggested: ${envelope.hint.action.direction} - ${envelope.hint.explanation} (source: ${envelope.source}, request ID: ${envelope.requestId})`);
    }
    // Explained against the snapshot the hint was requested for (unchanged, as checked above).
    showWhy(describeMoves(allowedActions(board, snapshot), envelope.hint).reason);
  } catch {
    showAdvice('Advice unavailable; keep playing.');
  } finally {
    hintButton.disabled = false; // re-enabled on either path
  }
}

for (const button of document.querySelectorAll('[data-move]')) {
  button.addEventListener('click', () => move(button.dataset.move));
}
$('#reset').addEventListener('click', reset);
hintButton.addEventListener('click', onHint);
render('Collect t1 and reach the exit before the move budget runs out.');
