// Top readouts, the live formula strip, and the bottom stonks ticker.

import { h, setText, setClass } from './dom.js';
import { fmt, money, bytes, absurdLabel } from '../format.js';
import { RIVALS, HEADLINES } from '../data/rivals.js';

const READOUTS = [
  { key: 'cash',     name: 'CASH',      get: (s, d) => money(s.cash, 0),
    sub: (s, d) => (d.netCashFlow >= 0 ? '+' : '') + money(d.netCashFlow) + '/s' },
  { key: 'stonks',   name: 'STONKS',    get: (s) => fmt(s.stonks, 0),
    sub: (s, d) => '$' + fmt(d.sharePrice) + '/sh' },
  { key: 'ram',      name: 'RAM',       get: (s, d) => bytes(d.ramEffective),
    sub: (s, d) => d.throttle < 0.999 ? `THROTTLED ${(d.throttle * 100).toFixed(0)}%` : bytes(d.ramTotal) + ' inst.' },
  { key: 'money',    name: 'MONEY',     get: (s, d) => money(d.incomeGross) + '/s',
    sub: (s, d) => '×' + d.charismaIncomeMult.toFixed(2) + ' charisma' },
  { key: 'elec',     name: 'ELECTRICITY', get: (s, d) => fmt(d.powerUsed) + ' MW',
    sub: (s, d) => 'cap ' + fmt(d.elecCapacity) + ' MW' },
  { key: 'water',    name: 'WATER',     get: (s, d) => fmt(d.waterBurden) + ' ML/d',
    sub: (s, d) => 'cool ×' + d.coolCoef.toFixed(2) },
  { key: 'ego',      name: 'EGO',       get: (s, d) => money(d.egoBurn) + '/s',
    sub: (s, d) => 'gain ×' + d.egoMult.toFixed(2) },
  { key: 'charisma', name: 'CHARISMA',  get: (s, d) => fmt(d.charisma) + ' ML/d',
    sub: (s, d) => 'gain ×' + d.charismaMult.toFixed(2) },
];

export function makeHud(game) {
  const host = document.getElementById('hud-readouts');
  const cells = {};
  for (const r of READOUTS) {
    const val = h('div', { class: 'r-val' });
    const sub = h('div', { class: 'r-sub' });
    const box = h('div', { class: 'readout', title: r.name },
      h('div', { class: 'r-name' }, r.name), val, sub);
    cells[r.key] = { box, val, sub, def: r };
    host.append(box);
  }

  const aipEl = document.getElementById('aip-value');
  const aipState = document.getElementById('aip-state');
  const powerBox = document.querySelector('.hud-power');
  const nameEl = document.getElementById('company-name');

  function update() {
    const s = game.state, d = game.d;
    setText(nameEl, s.company);

    for (const key in cells) {
      const c = cells[key];
      setText(c.val, c.def.get(s, d));
      setText(c.sub, c.def.sub(s, d));
      let cls = 'readout';
      if (key === 'water' && d.bubble) cls += ' crit';
      else if (key === 'water' && d.denominator < d.waterBurden * 0.18) cls += ' warn';
      if (key === 'ego' && d.insolvent) cls += ' crit';
      else if (key === 'ego' && d.moneyTerm < d.incomeGross * 0.18) cls += ' warn';
      if (key === 'ram' && d.throttle < 0.999) cls += ' warn';
      if (key === 'cash' && s.cash < 0) cls += ' warn';
      setClass(c.box, cls);
    }

    setText(aipEl, fmt(d.aip));
    const label = absurdLabel(d.aip);
    setText(aipState, label || d.status);
    setClass(powerBox, 'hud-power' +
      (d.bubble || d.insolvent ? ' crit' : d.status === 'STRAINED' ? ' warn' : ''));
  }

  return { update };
}

/* ============================ TICKER ============================ */
export function makeTicker(game) {
  const track = document.getElementById('ticker-track');
  let offset = 0, rebuiltAt = -999, width = 1;

  function build() {
    const s = game.state, d = game.d;
    const parts = [];
    parts.push(`<span class="tk"><b>${s.company.split(' ')[0]}</b> ` +
      `<span class="up">$${fmt(d.sharePrice)}</span> · MKT CAP ${money(d.marketCap, 0)} · ` +
      `${d.multiple.toFixed(0)}× REVENUE</span>`);
    for (const r of RIVALS) {
      const rs = s.rivals[r.id];
      if (!rs) continue;
      if (!rs.alive) {
        parts.push(`<span class="tk"><b>${r.name}</b> <span class="dn">ACQUIRED — DELISTED</span></span>`);
      } else {
        const up = rs.drift >= 0;
        parts.push(`<span class="tk"><b>${r.name}</b> ${money(rs.cap, 0)} ` +
          `<span class="${up ? 'up' : 'dn'}">${up ? '▲' : '▼'}${Math.abs(rs.drift * 100).toFixed(1)}%</span></span>`);
      }
    }
    const hl = HEADLINES[Math.floor((s.t / 20 + s.tickerSeed * 100) % HEADLINES.length)];
    parts.push(`<span class="tk">📰 ${hl}</span>`);
    track.innerHTML = parts.join('') + parts.join('');
    width = track.scrollWidth / 2 || 1;
  }

  function update(dt) {
    if (game.state.t - rebuiltAt > 12) { rebuiltAt = game.state.t; build(); offset = offset % width; }
    offset += dt * 70;
    if (offset > width) offset -= width;
    track.style.transform = `translateX(${-offset}px)`;
  }

  return { update };
}

/* ============================ TOASTS ============================ */
export function makeToasts() {
  const host = document.getElementById('toasts');
  return function toast({ kind, title, text }) {
    const el = h('div', { class: 'toast ' + (kind || 'info') },
      h('div', { class: 't-title' }, title), h('div', {}, text));
    host.append(el);
    while (host.children.length > 5) host.firstChild.remove();
    setTimeout(() => {
      el.style.transition = 'opacity .4s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 420);
    }, 7000);
  };
}
