// Persistence.
//
// Three layers, in order of preference:
//   1. localStorage  — primary. No practical size limit, survives everything.
//   2. cookie        — fallback for when localStorage is blocked (private
//                      browsing, hardened settings). Hard 4KB ceiling, so the
//                      payload is compacted and we refuse to write a partial
//                      save rather than write one that cannot be restored.
//   3. memory        — last resort so the session at least keeps playing.
//
// Plus a downloadable save file, which is the only one of these the player
// actually controls and the only one that survives clearing site data.

import { SAVE_KEY, SAVE_VERSION, newState } from './state.js';

const COOKIE_NAME = 'incremaniac_save';
const COOKIE_BUDGET = 3900;          // leave room for name + attributes
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 5;

/* ===================== base64url =====================
   Plain base64 contains + / = which percent-encode to three bytes each in a
   cookie, inflating a 3.7KB payload past the limit. base64url does not. */
const b64urlEncode = (str) =>
  btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const b64urlDecode = (s) =>
  decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

/* ===================== compaction =====================
   Full-precision doubles are the single biggest waste in the payload:
   `elapsed: 412.50000000000006` is 20 bytes to say "412.5". */
const round = (n, p = 2) => {
  if (typeof n !== 'number' || !Number.isFinite(n)) return 0;
  const m = 10 ** p;
  return Math.round(n * m) / m;
};
const sig = (n, d = 8) => {
  if (typeof n !== 'number' || !Number.isFinite(n)) return 0;
  return n === 0 ? 0 : Number(n.toPrecision(d));
};

function compact(state) {
  const c = {
    v: state.v, t: round(state.t), lastSave: state.lastSave, company: state.company,
    cash: sig(state.cash), stonks: Math.round(state.stonks),
    ego: sig(state.ego), charisma: sig(state.charisma),
    contractIncome: sig(state.contractIncome),
    owned: state.owned, flags: state.flags, completed: state.completed,
    nextOfferIn: round(state.nextOfferIn), uidSeq: state.uidSeq,
    tickerSeed: round(state.tickerSeed, 4),
    status: state.status,
    // `share` and `rate` are recomputed every tick; never persist them.
    active: state.active.map((a) => ({
      uid: a.uid, id: a.id, progress: sig(a.progress),
      alloc: round(a.alloc, 4), elapsed: round(a.elapsed),
    })),
    offers: state.offers.map((o) => ({ id: o.id, uid: o.uid, age: round(o.age) })),
    // Rival market caps are recomputed from base cap + drift on the next tick,
    // and dead rivals never render a cap at all, so only drift needs storing.
    rivals: Object.fromEntries(Object.entries(state.rivals || {})
      .map(([k, r]) => [k, { a: r.alive ? 1 : 0, d: round(r.drift, 4) }])),
    stats: {
      challengesDone: state.stats.challengesDone,
      challengesFailed: state.stats.challengesFailed,
      peakAip: sig(state.stats.peakAip, 6),
      totalEarned: sig(state.stats.totalEarned, 6),
      bubblePops: state.stats.bubblePops,
      insolvencies: state.stats.insolvencies,
    },
  };
  return c;
}

function expand(c) {
  const s = Object.assign(newState(), c);
  if (c.rivals) {
    s.rivals = Object.fromEntries(Object.entries(c.rivals).map(([k, r]) =>
      // Accept both the compact form and a full uncompacted one from a file.
      [k, ('a' in r || 'd' in r)
        ? { cap: 0, alive: !!r.a, drift: r.d || 0 }
        : { cap: r.cap || 0, alive: r.alive !== false, drift: r.drift || 0 }]));
  }
  s.stats = Object.assign(newState().stats, c.stats || {});
  return s;
}

const serialize = (state) => JSON.stringify(compact(state));

function deserialize(text) {
  const data = JSON.parse(text);
  const raw = data && data.state ? data.state : data;   // unwrap a save file
  if (!raw || raw.v !== SAVE_VERSION) throw new Error('version mismatch');
  return expand(raw);
}

/* ===================== backends ===================== */

const localBackend = {
  name: 'localStorage',
  available() {
    try {
      localStorage.setItem('__inc_probe', '1');
      localStorage.removeItem('__inc_probe');
      return true;
    } catch { return false; }
  },
  read() { try { return localStorage.getItem(SAVE_KEY); } catch { return null; } },
  write(str) { try { localStorage.setItem(SAVE_KEY, str); return true; } catch { return false; } },
  clear() { try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ } },
};

const cookieBackend = {
  name: 'cookie',
  available() { return typeof document !== 'undefined' && navigator.cookieEnabled; },
  read() {
    const hit = document.cookie.split('; ').find((c) => c.startsWith(COOKIE_NAME + '='));
    if (!hit) return null;
    try { return b64urlDecode(hit.slice(COOKIE_NAME.length + 1)); } catch { return null; }
  },
  write(str) {
    const packed = b64urlEncode(str);
    // Never write a truncated save. A cookie that cannot be restored is worse
    // than no cookie, because it looks like progress.
    if (packed.length > COOKIE_BUDGET) { cookieBackend.clear(); return false; }
    document.cookie = `${COOKIE_NAME}=${packed}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    return true;
  },
  clear() { document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`; },
};

let memoryBackend = { name: 'memory', _v: null,
  available: () => true, read() { return this._v; },
  write(str) { this._v = str; return true; }, clear() { this._v = null; } };

/** Where the last save actually landed, for the UI to report honestly. */
export const saveStatus = {
  wroteTo: [], bytes: 0, cookieFits: true, at: 0, loadedFrom: null,
};

export function save(state) {
  state.lastSave = Date.now();
  let str;
  try { str = serialize(state); }
  catch (e) { console.error('[incremaniac] could not serialize', e); return false; }

  const wrote = [];
  if (localBackend.available() && localBackend.write(str)) wrote.push('localStorage');
  if (cookieBackend.available() && cookieBackend.write(str)) wrote.push('cookie');
  if (!wrote.length) { memoryBackend.write(str); wrote.push('memory'); }

  saveStatus.wroteTo = wrote;
  saveStatus.bytes = str.length;
  saveStatus.cookieFits = b64urlEncode(str).length <= COOKIE_BUDGET;
  saveStatus.at = state.lastSave;
  return true;
}

export function load() {
  for (const b of [localBackend, cookieBackend, memoryBackend]) {
    let raw = null;
    try { raw = b.available() ? b.read() : null; } catch { raw = null; }
    if (!raw) continue;
    try {
      const s = deserialize(raw);
      saveStatus.loadedFrom = b.name;
      return s;
    } catch (e) {
      console.warn(`[incremaniac] save in ${b.name} unreadable:`, e.message);
    }
  }
  return null;
}

export function wipe() {
  localBackend.clear();
  cookieBackend.clear();
  memoryBackend.clear();
  saveStatus.wroteTo = [];
  saveStatus.loadedFrom = null;
}

/* ===================== manual save file ===================== */

const stamp = (d) => [
  d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0'),
].join('-') + '-' + [
  String(d.getHours()).padStart(2, '0'), String(d.getMinutes()).padStart(2, '0'),
].join('');

export function saveFileName(state) {
  const slug = String(state.company || 'incremaniac')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `incremaniac-${slug}-${stamp(new Date())}.json`;
}

/** Pretty, self-describing, and readable — unlike what goes in the cookie. */
export function toFileText(state) {
  const hrs = Math.floor(state.t / 3600);
  const mins = Math.floor((state.t % 3600) / 60);
  return JSON.stringify({
    _: 'INCREMANIAC save file — keep this somewhere your browser cannot clear it.',
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    company: state.company,
    summary: {
      stonks: Math.round(state.stonks),
      playtime: `${hrs}h ${mins}m`,
      contractsDelivered: state.stats.challengesDone,
      rivalsRemaining: Object.values(state.rivals || {}).filter((r) => r.alive).length,
    },
    state: compact(state),
  }, null, 2);
}

export function downloadSave(state) {
  const blob = new Blob([toFileText(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = saveFileName(state);
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return a.download;
}

/** Reads a File/Blob from an <input type="file">. Resolves to a state. */
export function readSaveFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('no file selected'));
    if (file.size > 1024 * 1024) return reject(new Error('that file is far too large to be a save'));
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('could not read that file'));
    fr.onload = () => {
      try { resolve(deserialize(String(fr.result))); }
      catch (e) {
        reject(new Error(e.message === 'version mismatch'
          ? 'that save is from a different version of the game'
          : 'that file is not a valid Incremaniac save'));
      }
    };
    fr.readAsText(file);
  });
}

/* ===================== text export/import (share a run as a string) ===== */

export const exportSave = (state) => b64urlEncode(serialize(state));

export function importSave(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  try { return deserialize(b64urlDecode(t)); } catch { /* try raw JSON below */ }
  try { return deserialize(t); } catch { return null; }
}
