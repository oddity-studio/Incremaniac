// Save management. Its own screen because persistence is not a footnote to
// the scoreboard — it is the thing people come looking for in a panic.

import { h, panel, setHTML } from '../dom.js';
import { clock, fmt } from '../../format.js';
import {
  save, wipe, exportSave, importSave, saveStatus,
  downloadSave, readSaveFile,
} from '../../save.js';

export default {
  id: 'save', icon: '💾', title: 'SAVE & RESTORE', nav: 'SAVE',

  mount(root, game) {
    const statusBox = h('div', { class: 'crt-box' });
    const noteBox = h('div', {});
    const io = h('textarea', {
      style: { width: '100%', height: '54px', fontFamily: 'inherit', fontSize: '10px' },
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

    const row = (...kids) => h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } }, ...kids);

    root.replaceChildren(
      h('div', { class: 'screen-head' },
        h('h1', {}, '💾  SAVE & RESTORE'),
        h('p', {}, 'The game autosaves every 15 seconds into your browser. That is ' +
          'convenient and it is not a backup — clearing site data takes it with ' +
          'everything else. A save file is the only copy you actually own.')),

      noteBox,

      panel('AUTOSAVE', 'every 15 seconds',
        statusBox,
        h('div', { style: { marginTop: '8px' } },
          row(h('button', {
            class: 'primary',
            onclick: () => {
              save(game.state);
              game.toast('info', 'SAVED', `Written to ${saveStatus.wroteTo.join(' + ') || 'nowhere'}.`);
            },
          }, 'SAVE NOW')))),

      panel('SAVE FILE', 'the copy you own',
        h('p', { class: 'sr-desc', style: { margin: '0 0 8px' } },
          'Downloads readable JSON named after your company and the date. Keep it ' +
          'somewhere your browser cannot reach.'),
        row(
          h('button', {
            class: 'primary',
            onclick: () => {
              const name = downloadSave(game.state);
              game.toast('good', 'SAVE FILE CREATED', name);
            },
          }, '⬇  DOWNLOAD SAVE FILE'),
          h('button', { onclick: () => fileInput.click() }, '⬆  LOAD SAVE FILE')),
        fileInput),

      panel('TRANSFER AS TEXT', 'for sharing a run',
        h('p', { class: 'sr-desc', style: { margin: '0 0 8px' } },
          'The same save as a single paste-able string, for moving between browsers ' +
          'or sending to someone who will not believe your numbers.'),
        row(
          h('button', { onclick: () => { io.value = exportSave(game.state); io.select(); } }, 'EXPORT TEXT'),
          h('button', {
            onclick: () => {
              const st = importSave(io.value);
              if (!st) return game.toast('bad', 'IMPORT FAILED', 'That string is not a valid save.');
              applyState(st, 'Pasted save');
            },
          }, 'IMPORT TEXT')),
        h('div', { style: { marginTop: '6px' } }, io)),

      panel('DANGER', 'no confirmation beyond the one',
        h('p', { class: 'sr-desc', style: { margin: '0 0 8px' } },
          'Wipes browser storage and starts a new company. Every rival comes back. ' +
          'Download a save file first if there is any doubt at all.'),
        row(h('button', {
          class: 'danger',
          onclick: () => {
            if (!confirm('Wipe the save and start over? Every rival comes back.')) return;
            wipe(); game.hardReset();
            game.toast('info', 'RESET', 'A fresh garage. A fresh confidence.');
          },
        }, 'HARD RESET'))),
    );

    return {
      update() {
        const s = game.state;
        const ago = saveStatus.at ? Math.max(0, Math.round((Date.now() - saveStatus.at) / 1000)) : null;
        const where = saveStatus.wroteTo.length ? saveStatus.wroteTo.join(' + ') : 'not yet saved';

        setHTML(statusBox, [
          ['Writing to', where],
          ['Restored this session from', saveStatus.loadedFrom || 'a fresh start'],
          ['Payload size', saveStatus.bytes ? (saveStatus.bytes / 1024).toFixed(2) + ' KB' : '—'],
          ['Cookie fallback', saveStatus.bytes
            ? (saveStatus.cookieFits ? 'fits (under 4 KB)' : 'TOO LARGE — localStorage only')
            : '—', saveStatus.bytes && !saveStatus.cookieFits ? 'warn' : ''],
          ['Last written', ago === null ? '—' : ago + 's ago'],
          ['Company', s.company],
          ['Playtime', clock(s.t)],
          ['Stonks', fmt(s.stonks, 0)],
        ].map(([k, v, c]) =>
          `<div class="stat-line"><span class="k">${k}</span><span class="${c || ''}">${v}</span></div>`).join(''));

        let note = '';
        if (saveStatus.wroteTo.length === 1 && saveStatus.wroteTo[0] === 'memory') {
          note = `<div class="critbox"><b>BROWSER STORAGE IS BLOCKED.</b> Nothing is being
            written to disk — this run exists only in the tab and dies with it.
            Download a save file now.</div>`;
        } else if (saveStatus.bytes && !saveStatus.cookieFits && saveStatus.wroteTo.includes('localStorage')) {
          note = `<div class="warnbox"><b>OUTGREW THE COOKIE.</b> This run no longer fits
            the 4 KB cookie fallback, so localStorage is carrying it alone. That is fine
            until something clears it. Download a save file.</div>`;
        }
        setHTML(noteBox, note);
      },
    };
  },
};
