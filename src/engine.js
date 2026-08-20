// Simulation. Pure-ish: every function takes the game context and mutates
// state; the UI never writes to state directly, it calls these.

import { C, newState } from './state.js';
import { derive } from './formula.js';
import { BY_ID, costOf, isMaxed } from './data/upgrades.js';
import { CH_BY_ID, eligible } from './data/challenges.js';
import { RIVALS, initRivals } from './data/rivals.js';

export function createGame(loaded) {
  const state = loaded || newState();
  if (!state.rivals || !Object.keys(state.rivals).length) state.rivals = initRivals();

  const listeners = {};
  const game = {
    state,
    d: derive(state),
    won: false,
    on(evt, cb) { (listeners[evt] ||= []).push(cb); },
    emit(evt, payload) { (listeners[evt] || []).forEach((cb) => cb(payload)); },
  };

  const toast = (kind, title, text) => game.emit('toast', { kind, title, text });
  game.toast = toast;

  /* =================== PURCHASING =================== */
  game.canAfford = (id) => {
    const u = BY_ID[id]; if (!u) return false;
    const owned = state.owned[id] || 0;
    return !isMaxed(u, owned) && state.cash >= costOf(u, owned);
  };

  game.buy = (id) => {
    const u = BY_ID[id]; if (!u) return false;
    const owned = state.owned[id] || 0;
    if (isMaxed(u, owned)) return false;
    const cost = costOf(u, owned);
    if (state.cash < cost) return false;
    state.cash -= cost;
    state.owned[id] = owned + 1;
    // Some purchases hand you ego directly; that lives in the effect list.
    game.d = derive(state);
    game.emit('bought', { id, cost });
    return true;
  };

  /** Buy as many as affordable, up to n. Returns count bought. */
  game.buyMany = (id, n) => {
    let k = 0;
    while (k < n && game.buy(id)) k++;
    return k;
  };

  /* =================== CHALLENGES =================== */
  const rollOffer = () => {
    const pool = eligible(game.d.aip, state);
    if (!pool.length) return;
    // Weight toward the highest tier the player can actually reach.
    const pick = pool[Math.floor(Math.random() * pool.length)];
    state.offers.push({ id: pick.id, uid: state.uidSeq++, age: 0 });
    game.emit('offer', pick);
  };

  game.accept = (offerUid) => {
    const i = state.offers.findIndex((o) => o.uid === offerUid);
    if (i < 0) return false;
    if (state.active.length >= game.d.activeSlots) {
      toast('bad', 'NO CAPACITY', 'All contract slots are full. Hire a program manager, or finish something.');
      return false;
    }
    const [o] = state.offers.splice(i, 1);
    const ch = CH_BY_ID[o.id];
    state.active.push({
      uid: state.uidSeq++, id: o.id, progress: 0, elapsed: 0,
      alloc: state.active.length === 0 ? 1 : 0.25,
    });
    game.emit('accepted', ch);
    return true;
  };

  game.declineOffer = (offerUid) => {
    const i = state.offers.findIndex((o) => o.uid === offerUid);
    if (i >= 0) state.offers.splice(i, 1);
  };

  game.abandon = (uid) => {
    const i = state.active.findIndex((a) => a.uid === uid);
    if (i < 0) return;
    const ch = CH_BY_ID[state.active[i].id];
    state.active.splice(i, 1);
    state.charisma = Math.max(0, state.charisma - Math.abs(ch.rewards.charisma || 0) * 0.5);
    toast('bad', 'CONTRACT ABANDONED', `${ch.name} — the client tells people. Charisma down.`);
  };

  game.setAlloc = (uid, v) => {
    const a = state.active.find((x) => x.uid === uid);
    if (a) a.alloc = Math.max(0, Math.min(1, v));
  };

  /** Split 100% evenly across every active contract. */
  game.autoBalance = () => {
    const n = state.active.length;
    if (!n) return;
    for (const a of state.active) a.alloc = 1 / n;
  };

  /** Total requested share. Over 1.0 means everyone gets diluted. */
  game.allocSum = () => state.active.reduce((s, a) => s + a.alloc, 0);

  const complete = (a) => {
    const ch = CH_BY_ID[a.id];
    const r = ch.rewards;
    const d = game.d;

    const cash = r.cash || 0;
    const inc = r.income || 0;
    // Positive charisma is scaled by credibility — the closer your story
    // already is to your physical cooling burden, the less anyone believes
    // the next chapter — and then hard-clamped to half the remaining margin.
    // Scaling alone is not enough: one big contract reward will happily leap
    // a small margin in a single delivery. With the clamp, work can only ever
    // halve the gap, so shipping can never pop the bubble on its own.
    // Crossing the line is always a deliberate PRESS & PERSONA purchase.
    // Reputational damage is not discounted.
    let cha = r.charisma > 0
      ? r.charisma * d.charismaMult * d.charismaYield
      : (r.charisma || 0);
    if (cha > 0) cha = Math.min(cha, Math.max(0, d.denominator) * 0.5);
    const ego = (r.ego || 0) * d.egoMult;
    const stk = r.stonks || 0;

    state.cash += cash;
    state.contractIncome += inc;
    state.charisma = Math.max(0, state.charisma + cha);
    state.ego = Math.max(0, state.ego + ego);
    state.stonks += stk;
    state.stats.challengesDone++;
    state.stats.totalEarned += cash;
    state.completed[a.id] = (state.completed[a.id] || 0) + 1;

    toast('good', 'DELIVERED: ' + ch.name,
      `+$${Math.round(cash).toLocaleString()} · +${stk} stonks · ` +
      `charisma ${cha >= 0 ? '+' : ''}${cha.toFixed(2)} · ego +${ego.toFixed(2)}/s`);
    game.emit('completed', ch);
  };

  const fail = (a) => {
    const ch = CH_BY_ID[a.id];
    state.stats.challengesFailed++;
    const loss = Math.max(0.4, state.charisma * 0.08);
    state.charisma = Math.max(0, state.charisma - loss);
    state.stonks = Math.max(0, state.stonks - Math.ceil((ch.rewards.stonks || 0) * 0.4));
    toast('bad', 'MISSED DEADLINE: ' + ch.name,
      `The client went to a rival. Charisma −${loss.toFixed(2)}.`);
    game.emit('failed', ch);
  };

  /* =================== RIVALS =================== */
  const stepRivals = (dt) => {
    let alive = 0;
    for (const r of RIVALS) {
      const rs = state.rivals[r.id];
      if (!rs || !rs.alive) continue;
      alive++;
      // Random walk, biased upward — everyone's valuation goes up in a bubble.
      rs.drift += (Math.random() - 0.48) * dt * 0.004;
      rs.drift = Math.max(-0.5, Math.min(0.9, rs.drift));
      rs.cap = r.cap * (1 + rs.drift) * (1 + state.t / 90000);

      if (state.stonks >= r.need) {
        rs.alive = false;
        toast('good', `${r.name.toUpperCase()} CAPITULATES`, r.death);
        game.emit('rivalDown', r);
      }
    }
    if (alive === 0 && !state.flags.won) {
      state.flags.won = true;
      game.won = true;
      toast('good', 'TOTAL ADDRESSABLE VICTORY',
        'Every competitor has folded into your cap table. There is nobody left to disrupt. ' +
        'You are, at last, hungry for nothing in particular.');
      game.emit('won');
    }
  };

  /* =================== STATUS TRANSITIONS =================== */
  let lastStatus = state.status;
  const stepStatus = () => {
    const s = game.d.status;
    if (s !== lastStatus) {
      if (s === 'BUBBLE POPPED') {
        state.stats.bubblePops++;
        toast('bad', 'THE BUBBLE POPPED',
          'Charisma exceeded your cooling burden. The story is now larger than the ' +
          'building. AI Power at 5% until physical reality catches up.');
      } else if (s === 'INSOLVENT') {
        state.stats.insolvencies++;
        toast('bad', 'VANITY INSOLVENCY',
          'Your ego burn now exceeds gross income. (MONEY − EGO) is negative.');
      } else if (lastStatus === 'BUBBLE POPPED' || lastStatus === 'INSOLVENT') {
        toast('good', 'REALITY RESTORED', 'The formula is positive again. Nobody will mention this.');
      }
      lastStatus = s;
      state.status = s;
    }
  };

  /* =================== MAIN TICK =================== */
  let liqTimer = 0;
  game.tick = (dt) => {
    dt = Math.min(dt, 0.5);            // never let a stalled tab dump a burst
    state.t += dt;
    game.d = derive(state);
    const d = game.d;

    state.cash += d.netCashFlow * dt;
    if (d.netCashFlow > 0) state.stats.totalEarned += d.netCashFlow * dt;
    if (d.aip > state.stats.peakAip) state.stats.peakAip = d.aip;

    // Out of cash and still burning? Assets get sold to cover the burn.
    // This is the only thing that stops an ego spiral being unrecoverable —
    // the market will forcibly make you humbler than you chose to be.
    if (state.cash < 0) {
      state.cash = 0;
      if (d.moneyTerm < 0 && state.ego > 0) {
        // Shed toward 60% of gross income, not toward break-even. Targeting
        // zero converges on zero and never crosses it, which would strand the
        // player at 5% AI Power forever; targeting something close to zero
        // leaves them technically solvent with nothing left to rebuild on.
        const target = d.incomeGross * 0.6;
        const excess = Math.max(0, d.egoBurn - target) / Math.max(d.egoDiscount, 1e-9);
        const shed = Math.min(state.ego, excess * dt * C.LIQUIDATION_RATE);
        state.ego = Math.max(0, state.ego - shed);
        liqTimer -= dt;
        if (liqTimer <= 0) {
          liqTimer = 25;
          toast('bad', 'FORCED LIQUIDATION',
            'Cash is gone and the burn continues. Assets are being sold to cover it. ' +
            'Ego is falling, involuntarily, which is the only way it ever falls.');
        }
      }
    }

    // --- offers ---
    state.nextOfferIn -= dt;
    if (state.nextOfferIn <= 0) {
      if (state.offers.length < d.offerSlots) rollOffer();
      state.nextOfferIn = d.offerInterval * (0.75 + Math.random() * 0.5);
    }
    for (const o of state.offers) o.age += dt;

    // --- work ---
    const sum = game.allocSum();
    const divisor = Math.max(sum, 1);   // over-allocating dilutes everyone
    const done = [], failed = [];
    for (const a of state.active) {
      const ch = CH_BY_ID[a.id];
      if (!ch) { done.push(a); continue; }
      a.share = a.alloc / divisor;
      a.rate = d.aip * a.share;
      a.progress += a.rate * dt;
      a.elapsed += dt;
      if (a.progress >= ch.work) done.push(a);
      else if (ch.deadline && a.elapsed >= ch.deadline) failed.push(a);
    }
    for (const a of done) { complete(a); state.active.splice(state.active.indexOf(a), 1); }
    for (const a of failed) { fail(a); state.active.splice(state.active.indexOf(a), 1); }
    if (done.length || failed.length) game.d = derive(state);

    stepRivals(dt);
    stepStatus();
  };

  /* =================== OFFLINE =================== */
  game.applyOffline = (seconds) => {
    if (seconds < 60) return null;
    const capped = Math.min(seconds, 4 * 3600);
    const d = derive(state);
    const gained = Math.max(0, d.netCashFlow) * capped * 0.5;
    state.cash += gained;
    state.t += capped;
    return { seconds: capped, cash: gained };
  };

  game.hardReset = () => {
    const fresh = newState();
    fresh.rivals = initRivals();
    Object.keys(state).forEach((k) => delete state[k]);
    Object.assign(state, fresh);
    game.d = derive(state);
    game.won = false;
    lastStatus = state.status;
  };

  return game;
}
