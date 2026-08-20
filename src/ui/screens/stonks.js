// Score, competition, and the save controls. Winning means every rival on
// this list has folded into your cap table.

import { h, panel, setHTML } from '../dom.js';
import { fmt, money, clock } from '../../format.js';
import { RIVALS } from '../../data/rivals.js';
import {
  save, wipe, exportSave, importSave, saveStatus,
  downloadSave, readSaveFile,
} from '../../save.js';

export default {
  id: 'stonks', icon: '📊', title: 'STONKS', nav: 'STONKS',

  mount(root, game) {
    const winBox = h('div', {});
    const valBox = h('div', { class: 'crt-box' });
    const rivalBox = h('div', { class: 'panel-body tight' });
    const chartBox = h('canvas', { width: '640', height: '130', style: { width: '100%', height: '130px', imageRendering: 'pixelated' } });
    const io = h('textarea', {
      style: { width: '100%', height: '52px', fontFamily: 'inherit', fontSize: '10px' },
      placeholder: 'paste a save string here, then press IMPORT TEXT',
    });

    const applyState = (st, what) => {
      Object.keys(game.state).forEach((k) => delete game.state[k]);
      Object.assign(game.state, st);
      save(game.state);
      game.toast('good', 'LOADED', `${what} restored. Nobody will mention the gap.`);
    };

    const fileInput = h('input', {
      type: 'file', accept: '.json,application/json', style: { display: 'none' },
      onchange: (e) => {
        const f = e.target.files && e.target.files[0];
        e.target.value = '';                       // allow re-picking the same file
        if (!f) return;
        readSaveFile(f)
          .then((st) => applyState(st, f.name))
          .catch((err) => game.toast('bad', 'LOAD FAILED', err.message));
      },
    });

    const statusLine = h('div', { class: 'sr-cost', style: { marginTop: '6px', lineHeight: '1.6' } });

    const saveBox = h('div', {},
      h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
        h('button', {
          class: 'primary',
          onclick: () => {
            save(game.state);
            game.toast('info', 'SAVED', `Written to ${saveStatus.wroteTo.join(' + ') || 'nowhere'}.`);
          },
        }, 'SAVE NOW'),
        h('button', {
          class: 'primary',
          onclick: () => {
            const name = downloadSave(game.state);
            game.toast('good', 'SAVE FILE CREATED', name);
          },
        }, '⬇ DOWNLOAD SAVE FILE'),
        h('button', { onclick: () => fileInput.click() }, '⬆ LOAD SAVE FILE'),
        h('button', {
          class: 'small',
          onclick: () => { io.value = exportSave(game.state); io.select(); },
        }, 'EXPORT TEXT'),
        h('button', {
          class: 'small',
          onclick: () => {
            const st = importSave(io.value);
            if (!st) return game.toast('bad', 'IMPORT FAILED', 'That string is not a valid save.');
            applyState(st, 'Pasted save');
          },
        }, 'IMPORT TEXT'),
        h('button', {
          class: 'danger',
          onclick: () => {
            if (!confirm('Wipe the save and start over? Every rival comes back.')) return;
            wipe(); game.hardReset();
            game.toast('info', 'RESET', 'A fresh garage. A fresh confidence.');
          },
        }, 'HARD RESET')),
      statusLine);

    root.replaceChildren(
      h('div', { class: 'screen-head' },
        h('h1', {}, '📊  STONKS'),
        h('p', {}, 'Your score is Stonks. Your valuation is a function of revenue, ' +
          'charisma and — mostly — ego. Beat a rival\'s market cap by 15% and they ' +
          'stop competing and start investing. Do that to all nine and the game is over.')),
      winBox,
      h('div', { class: 'grid2' },
        panel('VALUATION', 'unaudited', valBox),
        panel('SHARE PRICE', 'illustrative', chartBox)),
      h('div', { class: 'panel' },
        h('div', { class: 'panel-title' }, h('span', {}, 'THE COMPETITION'),
          h('span', { class: 'pt-right' }, 'beat cap × 1.15 to acquire')),
        rivalBox),
      panel('SAVE', 'autosaves every 15s', saveBox, fileInput, io),
    );

    // --- share price history ---
    const hist = [];
    let lastSample = -99;
    const ctx = chartBox.getContext('2d');

    function drawChart() {
      const w = chartBox.width, hgt = chartBox.height;
      ctx.fillStyle = '#04140b'; ctx.fillRect(0, 0, w, hgt);
      ctx.strokeStyle = '#123'; ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) {
        const y = (hgt / 5) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      if (hist.length < 2) return;
      const max = Math.max(...hist), min = Math.min(...hist);
      const span = Math.max(max - min, 1e-9);
      ctx.strokeStyle = hist[hist.length - 1] >= hist[0] ? '#2bff88' : '#ff5252';
      ctx.lineWidth = 2;
      ctx.beginPath();
      hist.forEach((v, i) => {
        const x = (i / (hist.length - 1)) * w;
        const y = hgt - 6 - ((v - min) / span) * (hgt - 14);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke();
    }

    return {
      update() {
        const s = game.state, d = game.d;

        if (s.t - lastSample > 1.5) {
          lastSample = s.t;
          hist.push(d.sharePrice);
          if (hist.length > 160) hist.shift();
          drawChart();
        }

        setHTML(winBox, s.flags.won
          ? `<div class="crt-box" style="border-color:#2bff88">
              <b>TOTAL ADDRESSABLE VICTORY.</b><br><br>
              Every competitor has folded into your cap table. There is nobody left
              to disrupt, nobody left to warn about, and nobody left to raise
              against. Peak AI Power: <b>${fmt(s.stats.peakAip)}</b>. Time in
              business: <b>${clock(s.t)}</b>. Contracts delivered:
              <b>${fmt(s.stats.challengesDone, 0)}</b>.<br><br>
              <span class="warn">You are, at last, hungry for nothing in particular.
              This feeling lasts about four seconds.</span></div>`
          : '');

        setHTML(valBox, [
          ['STONKS (score)', fmt(s.stonks, 0)],
          ['Share price', '$' + fmt(d.sharePrice)],
          ['Market capitalisation', money(d.marketCap, 0)],
          ['Revenue run-rate (daily)', money(d.dailyRevenue, 0)],
          ['Revenue multiple', d.multiple.toFixed(1) + '×'],
          ['&nbsp;&nbsp;↳ from ego', '+' + Math.sqrt(d.egoRaw).toFixed(1) + '×'],
          ['&nbsp;&nbsp;↳ from charisma', '+' + (d.charisma * 0.25).toFixed(1) + '×'],
          ['Market delirium constant', '×' + fmt(12000, 0)],
          ['Actual net cash flow', money(d.netCashFlow) + '/s', d.netCashFlow < 0 ? 'bad' : ''],
        ].map(([k, v, c]) => `<div class="stat-line"><span class="k">${k}</span><span class="${c || ''}">${v}</span></div>`).join(''));

        const ago = saveStatus.at ? Math.max(0, Math.round((Date.now() - saveStatus.at) / 1000)) : null;
        const where = saveStatus.wroteTo.length ? saveStatus.wroteTo.join(' + ') : 'not yet saved';
        const kb = (saveStatus.bytes / 1024).toFixed(1);
        let note = '';
        if (saveStatus.wroteTo.length === 1 && saveStatus.wroteTo[0] === 'memory') {
          note = '<br><span style="color:#a11">Browser storage is blocked — progress will be lost when ' +
                 'you close this tab. Download a save file.</span>';
        } else if (!saveStatus.cookieFits && saveStatus.wroteTo.includes('localStorage')) {
          note = '<br><span style="color:#7a5a2a">This run is now too large for the 4KB cookie fallback; ' +
                 'localStorage is carrying it. Download a save file if you care about it.</span>';
        }
        setHTML(statusLine,
          `Autosaving to <b>${where}</b> · ${kb} KB` +
          (ago === null ? '' : ` · last saved ${ago}s ago`) +
          `<br>Save files are the only copy your browser cannot clear.${note}`);

        setHTML(rivalBox, RIVALS.map((r) => {
          const rs = s.rivals[r.id];
          if (!rs) return '';
          const prog = s.stonks / r.need;
          return `<div class="rival ${rs.alive ? '' : 'dead'}">
            <div class="rival-logo">${r.logo}</div>
            <div class="rival-main">
              <div class="rival-name">${r.name}${r.supplier ? ' <span class="muted">(supplier)</span>' : ''}</div>
              <div class="rival-tag">${rs.alive ? r.tag : r.death}</div>
            </div>
            <div class="rival-cap">${rs.alive
              ? `${money(rs.cap, 0)}<br><span class="delta ${prog >= 1 ? 'up' : 'dn'}">${fmt(s.stonks, 0)} / ${fmt(r.need, 0)} stonks</span>`
              : '<span class="delta up">ACQUIRED</span>'}</div>
          </div>`;
        }).join(''));
      },
    };
  },
};
