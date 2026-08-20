// The dashboard: the formula, evaluated, with every term shown at its
// current value and a short note on what is currently choking you.

import { h, panel, setHTML } from '../dom.js';
import { fmt, money, bytes, pct, clock, absurdLabel } from '../../format.js';

function advice(s, d) {
  if (d.bubble) return ['bad', 'The denominator has inverted. Fix WATER before anything else.'];
  if (d.insolvent) return ['bad', 'The numerator has inverted. Fix MONEY or EGO before anything else.'];
  if (d.throttle < 0.999) return ['warn', 'You are grid-limited. Buy ELECTRICITY — throttling costs you twice.'];
  if (s.active.length === 0 && s.offers.length > 0) return ['warn', 'You have unclaimed offers and idle compute.'];
  if (s.active.length >= d.activeSlots) return ['warn', 'Every contract slot is full. OPERATIONS sells more.'];
  const sum = s.active.reduce((a, x) => a + x.alloc, 0);
  if (s.active.length && sum < 0.85) return ['warn', `Only ${pct(sum, 0)} of your AI Power is assigned to anything.`];
  if (d.headroom > 4) return ['', 'Enormous grid headroom and not enough silicon to use it. Buy RAM.'];
  if (d.charisma > d.waterBurden * 0.7) return ['warn', 'Charisma is approaching your cooling burden. Scale up, or slow down the podcasts.'];
  return ['', 'All systems nominal. Statistically, this will not last.'];
}

export default {
  id: 'overview', icon: '🏛️', title: 'HEADQUARTERS', nav: 'HQ',

  mount(root, game) {
    const formulaBox = h('div', { class: 'crt-box' });
    const warnBox = h('div', {});
    const adviceBox = h('div', {});
    const summaryBox = h('div', { class: 'crt-box' });
    const runBox = h('div', { class: 'crt-box' });

    root.replaceChildren(
      h('div', { class: 'screen-head' },
        h('h1', {}, '🏛️  HEADQUARTERS'),
        h('p', {}, 'One number matters. Everything on every other screen exists ' +
          'to move it. The two subtractions can go negative; when they do, they ' +
          'take the whole company with them.')),
      warnBox,
      panel('THE GRAND INCREMENTAL FORMULA', 'evaluated live', formulaBox),
      adviceBox,
      h('div', { class: 'grid2' },
        panel('POSITION', null, summaryBox),
        panel('THIS RUN', null, runBox)),
    );

    return {
      update() {
        const s = game.state, d = game.d;

        setHTML(formulaBox, `
<div class="stat-line"><span class="k">RAM (effective)</span><span>${bytes(d.ramEffective)}</span></div>
<div class="stat-line"><span class="k">× ( MONEY ${money(d.incomeGross)}/s − EGO ${money(d.egoBurn)}/s )</span><span class="${d.insolvent ? 'bad' : ''}">${money(d.moneyTerm)}/s</span></div>
<div class="stat-line"><span class="k">× ELECTRICITY (drawn)</span><span>${fmt(d.powerUsed)} MW</span></div>
<div class="stat-line"><span class="k">= NUMERATOR</span><span>${fmt(d.numerator)}</span></div>
<div class="stat-line"><span class="k">÷ ( WATER ${fmt(d.waterBurden)} − CHARISMA ${fmt(d.charisma)} )</span><span class="${d.bubble ? 'bad' : ''}">${fmt(d.denominator)}</span></div>
<div class="stat-line"><span class="k">× multipliers (orchestration · headroom)</span><span>×${d.powerMult.toFixed(3)}</span></div>
${d.collapse < 1 ? `<div class="stat-line"><span class="k">× COLLAPSE PENALTY</span><span class="bad">×${d.collapse.toFixed(2)}</span></div>` : ''}
<div class="stat-line" style="border-top:1px solid #2bff88;margin-top:4px;padding-top:4px">
  <span class="k"><b>= AI POWER</b></span><span><b>${fmt(d.aip)}</b> ${absurdLabel(d.aip) ? '<span class="warn">' + absurdLabel(d.aip) + '</span>' : ''}</span></div>`);

        setHTML(warnBox, d.warnings.map((w) =>
          `<div class="${w.level === 'crit' ? 'critbox' : 'warnbox'}"><b>${w.title}</b><br>${w.text}</div>`).join(''));

        const [lvl, txt] = advice(s, d);
        setHTML(adviceBox, `<div class="${lvl === 'bad' ? 'critbox' : lvl === 'warn' ? 'warnbox' : 'crt-box'}">
          <b>NEXT MOVE:</b> ${txt}</div>`);

        const aliveRivals = Object.values(s.rivals).filter((r) => r.alive).length;
        setHTML(summaryBox, [
          ['Market capitalisation', money(d.marketCap, 0)],
          ['Share price', '$' + fmt(d.sharePrice)],
          ['Revenue multiple', d.multiple.toFixed(0) + '×'],
          ['Stonks', fmt(s.stonks, 0)],
          ['Rivals remaining', aliveRivals + ' / ' + Object.keys(s.rivals).length],
          ['Status', d.status, d.bubble || d.insolvent ? 'bad' : d.status === 'STRAINED' ? 'warn' : ''],
        ].map(([k, v, c]) => `<div class="stat-line"><span class="k">${k}</span><span class="${c || ''}">${v}</span></div>`).join(''));

        setHTML(runBox, [
          ['Time in business', clock(s.t)],
          ['Contracts delivered', fmt(s.stats.challengesDone, 0)],
          ['Contracts missed', fmt(s.stats.challengesFailed, 0), s.stats.challengesFailed ? 'warn' : ''],
          ['Peak AI Power', fmt(s.stats.peakAip)],
          ['Lifetime revenue', money(s.stats.totalEarned, 0)],
          ['Bubbles popped', fmt(s.stats.bubblePops, 0), s.stats.bubblePops ? 'warn' : ''],
          ['Insolvency events', fmt(s.stats.insolvencies, 0), s.stats.insolvencies ? 'warn' : ''],
        ].map(([k, v, c]) => `<div class="stat-line"><span class="k">${k}</span><span class="${c || ''}">${v}</span></div>`).join(''));
      },
    };
  },
};
