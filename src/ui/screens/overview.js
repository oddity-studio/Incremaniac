// The dashboard. Deliberately does NOT show how AI Power is calculated —
// the relationship between compute, money, power, cooling and hype is the
// thing the player is supposed to work out by running the company. What it
// shows is what a founder would actually see: a number, what is on fire,
// and what to do next.

import { h, panel, setHTML } from '../dom.js';
import { fmt, money, bytes, pct, clock, absurdLabel } from '../../format.js';
import { CH_BY_ID } from '../../data/challenges.js';

function advice(s, d) {
  if (d.bubble) return ['bad', 'Your story has outrun your infrastructure. Go to THERMAL & HYDROLOGY.'];
  if (d.insolvent) return ['bad', 'You are spending more on yourself than the company earns. Go to CAPITAL MARKETS.'];
  if (d.throttle < 0.999) return ['warn', 'You own silicon you cannot power. Buy generation before you buy another rack.'];
  if (s.active.length === 0 && s.offers.length > 0) return ['warn', 'Unclaimed offers on the board and nothing in flight.'];
  if (s.active.length >= d.activeSlots) return ['warn', 'Every contract slot is full. OPERATIONS sells more.'];
  const sum = s.active.reduce((a, x) => a + x.alloc, 0);
  if (s.active.length && sum < 0.85) return ['warn', `Only ${pct(sum, 0)} of your AI Power is assigned to anything.`];
  if (d.headroom > 4) return ['', 'Enormous grid headroom and not enough silicon to use it. Buy compute.'];
  if (d.charisma > d.waterBurden * 0.7) return ['warn', 'Your public story is running well ahead of your physical plant. Scale up, or slow down the podcasts.'];
  if (!s.active.length) return ['warn', 'Nothing in flight. Idle compute costs exactly as much as busy compute.'];
  return ['', 'All systems nominal. Statistically, this will not last.'];
}

const rows = (list) => list.map(([k, v, c]) =>
  `<div class="stat-line"><span class="k">${k}</span><span class="${c || ''}">${v}</span></div>`).join('');

export default {
  id: 'overview', icon: '🏛️', title: 'HEADQUARTERS', nav: 'HQ',

  mount(root, game) {
    const warnBox = h('div', {});
    const adviceBox = h('div', {});
    const plantBox = h('div', { class: 'crt-box' });
    const summaryBox = h('div', { class: 'crt-box' });
    const runBox = h('div', { class: 'crt-box' });
    const flightBox = h('div', { class: 'crt-box' });

    root.replaceChildren(
      h('div', { class: 'screen-head' },
        h('h1', {}, '🏛️  HEADQUARTERS'),
        h('p', {}, 'One number matters. Everything on every other screen exists ' +
          'to move it — though nobody will tell you how, and the people who ' +
          'claim to know are selling something.')),
      warnBox,
      adviceBox,
      h('div', { class: 'grid2' },
        panel('PLANT', 'physical', plantBox),
        panel('POSITION', 'financial', summaryBox)),
      h('div', { class: 'grid2' },
        panel('IN FLIGHT', null, flightBox),
        panel('THIS RUN', null, runBox)),
    );

    return {
      update() {
        const s = game.state, d = game.d;

        setHTML(warnBox, d.warnings.map((w) =>
          `<div class="${w.level === 'crit' ? 'critbox' : 'warnbox'}"><b>${w.title}</b><br>${w.text}</div>`).join(''));

        const [lvl, txt] = advice(s, d);
        setHTML(adviceBox, `<div class="${lvl === 'bad' ? 'critbox' : lvl === 'warn' ? 'warnbox' : 'crt-box'}">
          <b>NEXT MOVE:</b> ${txt}</div>`);

        setHTML(plantBox, rows([
          ['AI Power', `<b>${fmt(d.aip)}</b>` +
            (absurdLabel(d.aip) ? ` <span class="warn">${absurdLabel(d.aip)}</span>` : '')],
          ['Compute online', bytes(d.ramEffective), d.throttle < 0.999 ? 'warn' : ''],
          ['Power drawn', fmt(d.powerUsed) + ' MW'],
          ['Cooling burden', fmt(d.waterBurden) + ' ML/day'],
          ['Public standing', fmt(d.charisma), d.bubble ? 'bad' : ''],
          ['Status', d.status, d.bubble || d.insolvent ? 'bad' : d.status === 'STRAINED' ? 'warn' : ''],
        ]));

        const aliveRivals = Object.values(s.rivals).filter((r) => r.alive).length;
        setHTML(summaryBox, rows([
          ['Cash on hand', money(s.cash, 0)],
          ['Net income', money(d.netCashFlow) + '/s', d.netCashFlow < 0 ? 'bad' : ''],
          ['Market capitalisation', money(d.marketCap, 0)],
          ['Share price', '$' + fmt(d.sharePrice)],
          ['Stonks', fmt(s.stonks, 0)],
          ['Rivals remaining', aliveRivals + ' / ' + Object.keys(s.rivals).length],
        ]));

        const sum = s.active.reduce((a, x) => a + x.alloc, 0);
        const divisor = Math.max(sum, 1);
        setHTML(flightBox, s.active.length
          ? rows(s.active.map((a) => {
            const ch = CH_BY_ID[a.id];
            const rate = d.aip * (a.alloc / divisor);
            const eta = rate > 0 ? (ch.work - a.progress) / rate : Infinity;
            return [ch.name, `${pct(Math.min(1, a.progress / ch.work), 0)} · ` +
              (Number.isFinite(eta) ? clock(eta) : '<span class="bad">STALLED</span>')];
          })) + `<div class="stat-line"><span class="k">Assigned</span>` +
            `<span class="${sum > 1.0001 ? 'warn' : ''}">${pct(sum, 0)}</span></div>`
          : '<div class="empty">Nothing in flight.</div>');

        setHTML(runBox, rows([
          ['Time in business', clock(s.t)],
          ['Contracts delivered', fmt(s.stats.challengesDone, 0)],
          ['Contracts missed', fmt(s.stats.challengesFailed, 0), s.stats.challengesFailed ? 'warn' : ''],
          ['Peak AI Power', fmt(s.stats.peakAip)],
          ['Lifetime revenue', money(s.stats.totalEarned, 0)],
          ['Bubbles popped', fmt(s.stats.bubblePops, 0), s.stats.bubblePops ? 'warn' : ''],
          ['Insolvency events', fmt(s.stats.insolvencies, 0), s.stats.insolvencies ? 'warn' : ''],
        ]));
      },
    };
  },
};
