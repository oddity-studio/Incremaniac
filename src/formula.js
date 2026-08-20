// THE GRAND INCREMENTAL FORMULA
//
//        RAM × (MONEY − EGO) × ELECTRICITY
//   AIP = ─────────────────────────────────
//              (WATER − CHARISMA)
//
// Units are chosen so the subtractions mean something:
//   MONEY     $/s of income          EGO      $/s of vanity burn
//   WATER     ML/day cooling burden  CHARISMA ML/day of burden you have
//                                             narratively explained away
//
// Both subtractions can flip sign. That is not a bug, it is the endgame:
//   MONEY − EGO   <= 0  ->  VANITY INSOLVENCY
//   WATER − CHARISMA <= 0  ->  THE BUBBLE POPS
//
// Everything is recomputed from scratch every frame. No incremental
// bookkeeping, no drift, no "why is my RAM 3.0000004".

import { C } from './state.js';
import { UPGRADES, BY_ID, effectsOf } from './data/upgrades.js';

function accumulate(state) {
  const a = {
    ram: 0, ramMult: 1, elec: 0, elecMult: 1, cool: 1, waterMult: 1,
    income: 0, incomeMult: 1, egoBurn: 1, ego: 0, charisma: 0,
    powerMult: 1, activeSlots: 0, offerSlots: 0, offerSpeed: 1,
  };
  for (const id in state.owned) {
    const n = state.owned[id];
    if (!n) continue;
    const u = BY_ID[id];
    if (!u) continue;
    for (const e of effectsOf(u)) {
      switch (e.kind) {
        case 'ram': case 'elec': case 'income': case 'ego':
        case 'charisma': case 'activeSlots': case 'offerSlots':
          a[e.kind] += e.value * n; break;
        case 'ramMult': case 'elecMult': case 'cool': case 'waterMult':
        case 'incomeMult': case 'egoBurn': case 'powerMult': case 'offerSpeed':
          a[e.kind] *= Math.pow(e.value, n); break;
      }
    }
  }
  return a;
}

export function derive(state) {
  const a = accumulate(state);
  const d = { acc: a, warnings: [] };

  /* ---------- RAM ---------- */
  d.ramRaw = C.BASE_RAM + a.ram;
  d.ramMult = a.ramMult;
  d.ramTotal = d.ramRaw * d.ramMult;

  /* ---------- ELECTRICITY ---------- */
  d.elecCapacity = (C.BASE_ELEC + a.elec) * a.elecMult;
  d.powerDraw = d.ramTotal * C.MW_PER_GB;                    // what it wants
  d.throttle = Math.min(1, d.elecCapacity / Math.max(d.powerDraw, 1e-12));
  d.powerUsed = Math.min(d.powerDraw, d.elecCapacity);       // what it gets
  d.ramEffective = d.ramTotal * d.throttle;                  // throttled silicon

  // Overbuilt capacity is not wasted — it is "burst headroom", and it is
  // the single most quotable number in your investor deck.
  d.headroom = d.elecCapacity / Math.max(d.powerDraw, 1e-12);
  d.headroomBonus = 1 + C.HEADROOM_K *
    Math.min(C.HEADROOM_CAP, Math.max(0, d.headroom - 1));

  /* ---------- WATER ---------- */
  d.coolCoef = Math.max(C.COOLING_FLOOR, a.cool);
  d.waterMult = a.waterMult;   // deliberate waste, bought to escape a bubble
  d.waterCompute = d.powerUsed * C.WATER_PER_MW * d.coolCoef;
  d.waterBurden = (C.BASE_WATER + d.waterCompute) * d.waterMult;

  /* ---------- MONEY ---------- */
  d.charisma = Math.max(0, state.charisma + a.charisma);
  // Compressed deliberately: charisma feeds income, income feeds compute,
  // compute feeds charisma. On a square root that loop runs away inside five
  // minutes. On ^0.35 it stays a strong incentive without eating the game.
  d.charismaIncomeMult = 1 + C.CHARISMA_INCOME_K * Math.pow(d.charisma, C.CHARISMA_INCOME_EXP);
  d.incomeBase = C.BASE_INCOME + a.income + (state.contractIncome || 0);
  d.incomeGross = d.incomeBase * a.incomeMult * d.charismaIncomeMult;

  /* ---------- EGO ---------- */
  d.egoRaw = Math.max(0, state.ego + a.ego);
  d.egoDiscount = a.egoBurn;
  d.egoBurn = d.egoRaw * d.egoDiscount;

  /* ---------- THE TWO SUBTRACTIONS ---------- */
  d.moneyTerm = d.incomeGross - d.egoBurn;
  d.denominator = d.waterBurden - d.charisma;

  d.insolvent = d.moneyTerm <= 0;
  d.bubble = d.denominator <= C.DENOM_EPS;

  let collapse = 1;
  let moneyTerm = d.moneyTerm;

  // Charisma can buy you at most a 20x divisor advantage: below 5% of the
  // real burden the denominator stops shrinking. Without this floor,
  // threading the needle just short of the bubble is worth more than the
  // whole rest of the game, and popping it is worth more still.
  d.denomFloor = d.waterBurden * 0.05;
  let denom = Math.max(d.denominator, d.denomFloor);

  if (d.insolvent) {
    // Your lifestyle now costs more than your company earns. The compute
    // stays on, technically, on a credit facility nobody has read.
    moneyTerm = Math.max(0.1, d.incomeGross * 0.02);
    collapse *= 0.05;
    d.warnings.push({
      level: 'crit', key: 'insolvent', title: 'VANITY INSOLVENCY',
      text: 'Ego burn exceeds gross income. (MONEY − EGO) has gone negative. ' +
            'Cut ego, or raise income — until then AI Power runs at 5%.',
    });
  }
  if (d.bubble) {
    // You have talked away more cooling than you actually consume. The
    // narrative is now larger than the datacenter. Charisma stops counting
    // for anything at all, and you eat a 20x penalty on top.
    denom = d.waterBurden;
    collapse *= 0.05;
    d.warnings.push({
      level: 'crit', key: 'bubble', title: 'THE BUBBLE HAS POPPED',
      text: 'Charisma exceeds your real cooling burden. The story outgrew the ' +
            'building. Scale up physically — or buy something wasteful — to restore reality.',
    });
  }

  // Approach warnings (the interesting part of the game)
  if (!d.bubble && d.denominator < d.waterBurden * 0.18) {
    d.warnings.push({
      level: 'warn', key: 'nearbubble', title: 'HYPE OVERHANG',
      text: `Charisma (${d.charisma.toFixed(1)}) is closing on Water ` +
            `(${d.waterBurden.toFixed(1)}). AI Power is spiking because you are ` +
            'nearly out of physical reality to divide by.',
    });
  }
  if (!d.insolvent && d.moneyTerm < d.incomeGross * 0.18) {
    d.warnings.push({
      level: 'warn', key: 'nearinsolvent', title: 'BURN ADVISORY',
      text: `Ego burn is ${((d.egoBurn / d.incomeGross) * 100).toFixed(0)}% of gross income.`,
    });
  }
  if (d.throttle < 0.999) {
    d.warnings.push({
      level: 'warn', key: 'throttle', title: 'POWER THROTTLING',
      text: `Grid capacity covers only ${(d.throttle * 100).toFixed(1)}% of demand. ` +
            'Throttled RAM hits the formula twice — buy electricity.',
    });
  }

  /* ---------- ASSEMBLE ---------- */
  d.powerMult = a.powerMult * d.headroomBonus;
  d.numerator = d.ramEffective * moneyTerm * d.powerUsed;
  d.aip = Math.max(0, (d.numerator / denom) * C.POWER_SCALE * d.powerMult * collapse);
  d.collapse = collapse;

  d.status = d.bubble ? 'BUBBLE POPPED'
    : d.insolvent ? 'INSOLVENT'
    : d.warnings.some((w) => w.level === 'warn') ? 'STRAINED'
    : 'NOMINAL';

  /* ---------- REWARD BALANCE CURVE ---------- */
  d.charismaMult = 1 + (C.CHARISMA_MULT_BASE - 1) / (1 + state.stonks / C.CHARISMA_HALFLIFE);
  d.egoMult = 1 + Math.sqrt(state.stonks) * C.EGO_MULT_K;

  // Credibility: how much physical reality is left between Water and Charisma.
  // Charisma won from contracts is scaled by this, so you asymptotically
  // approach the bubble instead of blundering across it. Crossing the line
  // takes a deliberate purchase on the PRESS & PERSONA screen.
  // No floor on the yield: as the margin closes, contract charisma trends to
  // zero, so delivering work can never on its own pop the bubble. Crossing the
  // line is always a deliberate purchase on the PRESS & PERSONA screen.
  const margin = Math.max(0, Math.min(1, d.denominator / Math.max(d.waterBurden, 1e-9)));
  d.credibility = margin;
  d.charismaYield = Math.pow(margin, C.CREDIBILITY_EXP);

  /* ---------- VALUATION ---------- */
  d.netCashFlow = d.moneyTerm;                 // may be negative; that is fine
  d.dailyRevenue = d.incomeGross * 86400;
  d.multiple = 40 + Math.sqrt(d.egoRaw) + d.charisma * 0.25;
  d.marketCap = d.incomeGross * d.multiple * C.MARKET_K * (1 + state.stonks / 4000);
  d.sharePrice = Math.max(0.01, d.marketCap / 2.4e8);

  /* ---------- OPS ---------- */
  d.activeSlots = C.BASE_ACTIVE_SLOTS + a.activeSlots;
  d.offerSlots = C.BASE_OFFER_SLOTS + a.offerSlots;
  d.offerInterval = C.OFFER_INTERVAL * a.offerSpeed;

  return d;
}

/** Which upgrades are visible right now. */
export function visibleUpgrades(cat, state, d) {
  return UPGRADES.filter((u) => u.cat === cat && (!u.unlock || u.unlock(state, d)));
}
