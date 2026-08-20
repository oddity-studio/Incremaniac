import { h, setText, setClass } from './dom.js';

import overview from './screens/overview.js';
import challenges from './screens/challenges.js';
import ram from './screens/ram.js';
import power from './screens/power.js';
import water from './screens/water.js';
import moneyScreen from './screens/money.js';
import pr from './screens/pr.js';
import ops from './screens/ops.js';
import stonks from './screens/stonks.js';

export const SCREENS = [
  overview,
  challenges,
  { sep: true },
  ram, power, water, moneyScreen, pr,
  { sep: true },
  ops, stonks,
];

export function makeRouter(game) {
  const nav = document.getElementById('nav');
  const host = document.getElementById('screen');
  const buttons = new Map();
  let current = null, instance = null;

  for (const s of SCREENS) {
    if (s.sep) { nav.append(h('div', { class: 'nav-sep' })); continue; }
    const badge = h('span', { class: 'nb-badge', style: { display: 'none' } });
    const btn = h('button', { class: 'navbtn', onclick: () => go(s.id) },
      h('span', { class: 'nb-icon' }, s.icon),
      h('span', { class: 'nb-name' }, s.nav || s.title),
      badge);
    buttons.set(s.id, { btn, badge });
    nav.append(btn);
  }
  nav.append(h('div', { class: 'nav-foot' },
    h('div', {}, 'INCREMANIAC v0.1'),
    h('div', {}, 'a game about the'),
    h('div', {}, 'denominator')));

  function go(id) {
    const s = SCREENS.find((x) => x.id === id);
    if (!s || current === id) return;
    current = id;
    instance = s.mount(host, game);
    host.scrollTop = 0;
    for (const [k, v] of buttons) setClass(v.btn, 'navbtn' + (k === id ? ' active' : ''));
    instance.update();
  }

  function update() {
    if (instance) instance.update();
    // Badges: pending offers, and anything actively on fire.
    const offers = game.state.offers.length;
    const b = buttons.get('challenges');
    if (b) {
      b.badge.style.display = offers ? '' : 'none';
      setText(b.badge, String(offers));
    }
    const alarms = { water: game.d.bubble, money: game.d.insolvent, power: game.d.throttle < 0.999 };
    for (const id in alarms) {
      const t = buttons.get(id);
      if (!t) continue;
      t.badge.style.display = alarms[id] ? '' : 'none';
      if (alarms[id]) setText(t.badge, '!');
    }
  }

  go('overview');
  return { go, update, get current() { return current; } };
}
