import { SAVE_KEY, SAVE_VERSION, newState } from './state.js';

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.v !== SAVE_VERSION) {
      console.warn('[incremaniac] save version mismatch, starting fresh');
      return null;
    }
    // Fill in anything a newer build added.
    return Object.assign(newState(), data);
  } catch (e) {
    console.error('[incremaniac] save corrupt', e);
    return null;
  }
}

export function save(state) {
  try {
    state.lastSave = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('[incremaniac] could not save', e);
    return false;
  }
}

export function wipe() { localStorage.removeItem(SAVE_KEY); }

export function exportSave(state) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function importSave(text) {
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(text.trim()))));
    if (data.v !== SAVE_VERSION) throw new Error('version mismatch');
    return Object.assign(newState(), data);
  } catch (e) {
    return null;
  }
}
