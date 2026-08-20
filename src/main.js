// Bootstrap: load, wire, and run the loop.

import { createGame } from './engine.js';
import { load, save } from './save.js';
import { makeHud, makeTicker, makeToasts } from './ui/hud.js';
import { makeRouter, SCREENS } from './ui/router.js';
import { money, clock } from './format.js';

const loaded = load();
const game = createGame(loaded);

const toast = makeToasts();
game.on('toast', toast);

const hud = makeHud(game);
const ticker = makeTicker(game);
const router = makeRouter(game);

/* --- offline progress --- */
if (loaded && loaded.lastSave) {
  const away = (Date.now() - loaded.lastSave) / 1000;
  const res = game.applyOffline(away);
  if (res) {
    toast({
      kind: 'info', title: 'WHILE YOU WERE OUT',
      text: `${clock(res.seconds)} elapsed. Revenue accrued at half rate: ` +
        `${money(res.cash, 0)}. No contracts advanced — nobody works when you are not watching.`,
    });
  }
} else if (!loaded) {
  toast({
    kind: 'info', title: 'WELCOME TO ' + game.state.company,
    text: 'You have a laptop, $2,500, and an unshakeable sense that you are early. ' +
      'Go to the CONTRACT BOARD and accept something small.',
  });
}

/* --- simulation loop ---------------------------------------------------
   Deliberately NOT on requestAnimationFrame. rAF is suspended entirely in a
   backgrounded tab, and an idle game that stops idling when you look away is
   not an idle game. setInterval keeps firing (throttled to ~1Hz when hidden),
   and the accumulator below turns each late wake-up into the right number of
   fixed sub-steps, so simulation fidelity does not depend on frame rate.   */

const SUBSTEP = 0.25;      // seconds of simulation per sub-step
const MAX_CATCHUP = 60;    // never process more than a minute in one wake-up

let lastSim = performance.now();
let sinceSave = 0;

function simulate() {
  const now = performance.now();
  let elapsed = Math.min((now - lastSim) / 1000, MAX_CATCHUP);
  lastSim = now;
  while (elapsed > 0) {
    const dt = Math.min(elapsed, SUBSTEP);
    game.tick(dt);
    elapsed -= dt;
    sinceSave += dt;
  }
  if (sinceSave > 15) { sinceSave = 0; save(game.state); }
}
setInterval(simulate, 100);

/* --- render loop (visible tabs only; nothing to draw when hidden) --- */
let lastDraw = performance.now();
function render(now = performance.now()) {
  const dt = Math.min((now - lastDraw) / 1000, 0.5);
  lastDraw = now;
  hud.update();
  router.update();
  ticker.update(dt);
}
function frame(now) { render(now); requestAnimationFrame(frame); }
requestAnimationFrame(frame);

/* --- niceties --- */
window.addEventListener('beforeunload', () => save(game.state));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) save(game.state);
  else lastDraw = performance.now();
});

// Number keys jump between screens; 0 is the tenth.
const navigable = SCREENS.filter((s) => !s.sep);
window.addEventListener('keydown', (e) => {
  const t = e.target;
  if (t && typeof t.matches === 'function' && t.matches('input, textarea')) return;
  if (!/^[0-9]$/.test(e.key)) return;
  const i = e.key === '0' ? 10 : Number(e.key);
  if (i <= navigable.length) router.go(navigable[i - 1].id);
});

// Handy for tuning and for driving a render by hand when debugging.
// Not cheating if you wrote the game.
window.INCREMANIAC = game;
window.INCREMANIAC.render = render;
