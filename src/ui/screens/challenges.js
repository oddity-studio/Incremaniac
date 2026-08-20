// The core loop: a board of contracts competing for one pool of AI Power.
// Allocation is deliberately allowed to exceed 100% — over-commit and every
// contract slows down proportionally, which is the entire point.

import { h, setText, setHTML, setClass } from '../dom.js';
import { fmt, money, pct, clock } from '../../format.js';
import { CH_BY_ID, TIERS, TIER_REQ, tierCounts, maxUnlockedTier, CHALLENGES } from '../../data/challenges.js';

function rewardChips(ch, d) {
  const r = ch.rewards, out = [];
  if (r.cash) out.push(['pos', money(r.cash, 0)]);
  if (r.income) out.push(['pos', '+' + money(r.income) + '/s']);
  if (r.stonks) out.push(['pos', '+' + fmt(r.stonks, 0) + ' stonks']);
  if (r.charisma) {
    const v = r.charisma > 0 ? r.charisma * d.charismaMult : r.charisma;
    out.push([r.charisma > 0 ? 'pos' : 'neg',
      (v > 0 ? '+' : '') + fmt(v) + ' charisma']);
  }
  if (r.ego) out.push(['neg', '+' + money(r.ego * d.egoMult) + '/s ego']);
  if (ch.deadline) out.push(['neg', '⏱ ' + ch.deadline + 's deadline']);
  return out.map(([c, t]) => `<span class="rw ${c}">${t}</span>`).join('');
}

function tierTag(ch) {
  const t = TIERS[ch.tier];
  return `<span class="chal-tier ${t.cls}">T${t.n} ${t.label}</span>`;
}

export default {
  id: 'challenges', icon: '🎯', title: 'CONTRACT BOARD', nav: 'CHALLENGES',

  mount(root, game) {
    const summary = h('div', { class: 'alloc-summary' });
    const tierBox = h('div', { class: 'crt-box' });
    const activeHost = h('div', { class: 'panel-body tight' });
    const offerHost = h('div', { class: 'panel-body tight' });
    const activeTitle = h('span', { class: 'pt-right' });
    const offerTitle = h('span', { class: 'pt-right' });

    root.replaceChildren(
      h('div', { class: 'screen-head' },
        h('h1', {}, '🎯  CONTRACT BOARD'),
        h('p', {}, 'One pool of AI Power, many people who want it. Assign a share ' +
          'to each contract. Assign more than 100% in total and every contract is ' +
          'diluted proportionally — the work does not go faster, it just goes ' +
          'thinner. Delivering raises Charisma and Ego. Missing a deadline raises ' +
          'neither, loudly.')),
      summary,
      h('div', { class: 'panel' },
        h('div', { class: 'panel-title' }, h('span', {}, 'ACTIVE CONTRACTS'), activeTitle),
        activeHost),
      h('div', { class: 'panel' },
        h('div', { class: 'panel-title' }, h('span', {}, 'INBOUND OFFERS'), offerTitle),
        offerHost),
      h('div', { class: 'panel' },
        h('div', { class: 'panel-title' }, h('span', {}, 'CLIENT TIERS'),
          h('span', { class: 'pt-right' }, 'reputation, not dashboards')),
        h('div', { class: 'panel-body' }, tierBox)),
    );

    const rows = new Map();
    let activeKey = '', offerKey = '';

    function buildActive() {
      activeHost.replaceChildren();
      rows.clear();
      if (!game.state.active.length) {
        activeHost.append(h('div', { class: 'empty' },
          'No active contracts. Your AI Power is idling at full capacity, ' +
          'which costs exactly as much as using it.'));
        return;
      }
      for (const a of game.state.active) {
        const ch = CH_BY_ID[a.id];
        const fill = h('div', { class: 'bar-fill' });
        const barText = h('div', { class: 'bar-text' });
        const bar = h('div', { class: 'bar' }, fill, barText);
        const dlFill = h('div', { class: 'bar-fill' });
        const dlText = h('div', { class: 'bar-text' });
        const dlBar = ch.deadline
          ? h('div', { class: 'bar deadline', style: { marginTop: '3px', height: '10px' } }, dlFill, dlText)
          : null;
        const allocVal = h('div', { class: 'alloc-val' });
        const slider = h('input', {
          type: 'range', min: '0', max: '100', value: String(Math.round(a.alloc * 100)),
          oninput: (e) => game.setAlloc(a.uid, e.target.value / 100),
        });
        const card = h('div', { class: 'chal' },
          h('div', { class: 'chal-head' },
            h('span', { class: 'chal-name' }, ch.name),
            h('span', { html: tierTag(ch) }),
            h('button', { class: 'small danger', onclick: () => game.abandon(a.uid) }, 'DROP')),
          h('div', { class: 'chal-desc' }, ch.desc),
          h('div', { class: 'chal-flavor' }, ch.flavor),
          bar, dlBar,
          h('div', { class: 'alloc-row' }, slider, allocVal),
          h('div', { class: 'chal-rewards', html: rewardChips(ch, game.d) }));
        rows.set(a.uid, { fill, barText, dlFill, dlText, allocVal, slider, ch });
        activeHost.append(card);
      }
    }

    function buildOffers() {
      offerHost.replaceChildren();
      if (!game.state.offers.length) {
        offerHost.append(h('div', { class: 'empty' },
          'No inbound offers. Business development is at a conference.'));
        return;
      }
      for (const o of game.state.offers) {
        const ch = CH_BY_ID[o.id];
        offerHost.append(h('div', { class: 'chal' },
          h('div', { class: 'chal-head' },
            h('span', { class: 'chal-name' }, ch.name),
            h('span', { html: tierTag(ch) })),
          h('div', { class: 'chal-desc' }, ch.desc),
          h('div', { class: 'chal-flavor' }, ch.flavor),
          h('div', { class: 'chal-rewards', html: rewardChips(ch, game.d) }),
          h('div', { class: 'alloc-row' },
            h('span', { class: 'muted', style: { flex: '1', fontSize: '10px' } },
              `workload ${fmt(ch.work, 0)} AIP·s  ·  ` +
              `${game.d.aip > 0 ? clock(ch.work / game.d.aip) + ' at full power' : 'no power available'}`),
            h('button', { class: 'primary', onclick: () => game.accept(o.uid) }, 'ACCEPT'),
            h('button', { class: 'small', onclick: () => game.declineOffer(o.uid) }, 'PASS'))));
      }
    }

    return {
      update() {
        const s = game.state, d = game.d;

        const ak = s.active.map((a) => a.uid).join(',');
        if (ak !== activeKey) { activeKey = ak; buildActive(); }
        const ok = s.offers.map((o) => o.uid).join(',');
        if (ok !== offerKey) { offerKey = ok; buildOffers(); }

        const sum = game.allocSum();
        const over = sum > 1.0001;
        setHTML(summary,
          `<span>AI POWER POOL <b>${fmt(d.aip)}</b></span>` +
          `<span>ASSIGNED <b class="${over ? 'over' : ''}">${pct(sum, 0)}</b></span>` +
          (over
            ? `<span class="over">OVER-COMMITTED — everything diluted to ${pct(1 / sum, 0)}</span>`
            : `<span>IDLE <b>${pct(1 - sum, 0)}</b></span>`) +
          `<span class="spacer"></span>`);
        if (!summary.__wired) {
          summary.append(
            h('button', { class: 'small', onclick: () => game.autoBalance() }, 'AUTO-BALANCE'),
            h('button', {
              class: 'small',
              onclick: () => { for (const a of s.active) game.setAlloc(a.uid, 0); },
            }, 'CLEAR'));
          summary.__wired = true;
        }

        const counts = tierCounts(s);
        const cap = maxUnlockedTier(s);
        setHTML(tierBox, TIERS.map((t) => {
          const unlocked = t.n <= cap;
          const needPrev = TIER_REQ[t.n];
          const gate = Math.min(...CHALLENGES.filter((c) => c.tier === t.n).map((c) => c.minAip));
          let right;
          if (unlocked) {
            right = `${counts[t.n]} delivered` +
              (d.aip < gate ? `  <span class="warn">— needs ${fmt(gate)} AI Power</span>` : '');
          } else if (t.n === cap + 1) {
            right = `<span class="warn">locked — deliver ${counts[t.n - 1]}/${needPrev} ` +
              `at tier ${t.n - 1}</span>`;
          } else {
            right = '<span class="bad">locked</span>';
          }
          return `<div class="stat-line"><span class="k">T${t.n} ${t.label}</span><span>${right}</span></div>`;
        }).join(''));

        setText(activeTitle, `${s.active.length} / ${d.activeSlots} slots`);
        setText(offerTitle, `${s.offers.length} / ${d.offerSlots} · next in ${Math.max(0, s.nextOfferIn).toFixed(0)}s`);

        const divisor = Math.max(sum, 1);
        for (const a of s.active) {
          const r = rows.get(a.uid);
          if (!r) continue;
          const ch = r.ch;
          const p = Math.min(1, a.progress / ch.work);
          r.fill.style.width = (p * 100).toFixed(2) + '%';
          const share = a.alloc / divisor;
          const rate = d.aip * share;
          const eta = rate > 0 ? (ch.work - a.progress) / rate : Infinity;
          setText(r.barText,
            `${pct(p, 1)}  ·  ${fmt(a.progress, 0)} / ${fmt(ch.work, 0)} AIP·s  ·  ` +
            (Number.isFinite(eta) ? 'ETA ' + clock(eta) : 'STALLED'));
          setClass(r.fill, 'bar-fill' + (rate <= 0 ? ' dead' : ''));
          setHTML(r.allocVal,
            `<b>${pct(a.alloc, 0)}</b> → ${fmt(rate)} AIP` +
            (sum > 1 ? `<br><span class="muted">(diluted)</span>` : ''));
          if (Math.abs(r.slider.value / 100 - a.alloc) > 0.005 && document.activeElement !== r.slider) {
            r.slider.value = String(Math.round(a.alloc * 100));
          }
          if (ch.deadline) {
            const left = Math.max(0, ch.deadline - a.elapsed);
            r.dlFill.style.width = ((left / ch.deadline) * 100).toFixed(1) + '%';
            setText(r.dlText, 'DEADLINE ' + clock(left));
          }
        }
      },
    };
  },
};
