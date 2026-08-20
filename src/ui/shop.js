// Shared purchase-list renderer used by every resource screen.

import { h, setText, setClass } from './dom.js';
import { costOf, isMaxed, effectsOf } from '../data/upgrades.js';
import { money, fmt } from '../format.js';
import { visibleUpgrades } from '../formula.js';

const EFFECT_TEXT = {
  ram: (v) => `+${fmt(v)} GB RAM`,
  ramMult: (v) => `×${v} total RAM`,
  elec: (v) => `+${fmt(v)} MW capacity`,
  elecMult: (v) => `×${v} capacity`,
  cool: (v) => `×${v} compute cooling burden`,
  waterMult: (v) => `×${v} TOTAL cooling burden`,
  income: (v) => `+${money(v)}/s`,
  incomeMult: (v) => `×${v} income`,
  egoBurn: (v) => `×${v} ego burn`,
  ego: (v) => `+${money(v)}/s ego`,
  charisma: (v) => `+${fmt(v)} charisma`,
  powerMult: (v) => `×${v} AI Power`,
  activeSlots: (v) => `+${v} contract slot`,
  offerSlots: (v) => `+${v} offer slot`,
  offerSpeed: (v) => `offers ${((1 - v) * 100).toFixed(0)}% faster`,
};

function effectSummary(u) {
  return effectsOf(u).map((e) => (EFFECT_TEXT[e.kind] || (() => e.kind))(e.value)).join('  ·  ');
}

export function makeShop(cat, game) {
  const root = h('div', { class: 'panel-body tight' });
  const rows = new Map();
  let lastIds = '';

  function rebuild(list) {
    root.replaceChildren();
    rows.clear();
    if (!list.length) {
      root.append(h('div', { class: 'empty' }, 'Nothing available yet. Grow something else first.'));
      return;
    }
    for (const u of list) {
      const buyBtn = h('button', { class: 'primary', onclick: () => game.buy(u.id) }, 'BUY');
      const costEl = h('div', { class: 'sr-cost' });
      const nameEl = h('div', { class: 'sr-name' });
      const row = h('div', { class: 'shop-row' },
        h('div', { class: 'sr-icon' }, u.icon),
        h('div', { class: 'sr-main' },
          nameEl,
          h('div', { class: 'sr-desc' }, u.desc),
          h('div', { class: 'sr-effect' }, effectSummary(u)),
          h('div', { class: 'sr-flavor' }, u.flavor)),
        h('div', { class: 'sr-buy' }, buyBtn, costEl));
      rows.set(u.id, { row, buyBtn, costEl, nameEl, u });
      root.append(row);
    }
  }

  function update() {
    const list = visibleUpgrades(cat, game.state, game.d);
    const ids = list.map((u) => u.id).join(',');
    if (ids !== lastIds) { lastIds = ids; rebuild(list); }

    for (const { row, buyBtn, costEl, nameEl, u } of rows.values()) {
      const owned = game.state.owned[u.id] || 0;
      const maxed = isMaxed(u, owned);
      setText(nameEl, u.name + (owned ? `  ×${owned}` : '') + (maxed ? '  [MAX]' : ''));
      if (maxed) {
        setText(costEl, '—');
        buyBtn.disabled = true;
        setText(buyBtn, 'MAXED');
        setClass(row, 'shop-row maxed');
      } else {
        const cost = costOf(u, owned);
        const can = game.state.cash >= cost;
        setText(costEl, money(cost, 0));
        buyBtn.disabled = !can;
        setText(buyBtn, 'BUY');
        setClass(row, 'shop-row' + (can ? ' affordable' : ''));
      }
    }
  }

  return { root, update };
}
