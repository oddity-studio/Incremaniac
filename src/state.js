// Canonical game state + tuning constants.
// Everything the save file cares about lives in newState().

export const SAVE_KEY = 'incremaniac.save.v1';
export const SAVE_VERSION = 1;

export const C = {
  // --- base endowment (a garage, a laptop, an unearned confidence) ---
  BASE_RAM: 8,              // GB
  BASE_ELEC: 0.06,          // MW of grid capacity
  BASE_INCOME: 9,           // $/s from "consulting"
  BASE_EGO: 0.9,            // $/s of vanity burn
  BASE_CHARISMA: 0.35,      // ML/day of cooling you have narratively eliminated
  START_CASH: 2500,

  // --- physical coupling (the "mutual connections" ) ---
  MW_PER_GB: 0.0009,        // electricity drawn per GB of RAM online
  WATER_PER_MW: 34,         // ML/day of cooling burden per MW actually drawn
  BASE_WATER: 8,            // the building sweats even when idle; also the
                            // early-game headroom that keeps contract charisma
                            // from popping the bubble before you own anything
  COOLING_FLOOR: 0.04,      // best achievable cooling multiplier
  POWER_SCALE: 60,          // pure units fudge so AI Power reads nicely
  HEADROOM_K: 0.15,         // burst-headroom bonus per unit of spare capacity
  HEADROOM_CAP: 4,

  // --- economics ---
  CHARISMA_INCOME_K: 0.16,  // each point of charisma multiplies investor inflow
  CHARISMA_INCOME_EXP: 0.35,
  DENOM_EPS: 0.05,          // (Water - Charisma) at or below this = bubble
  MARKET_K: 1.2e4,          // "market delirium constant" (see stonks screen)
  LIQUIDATION_RATE: 0.25,   // how fast the yacht gets repossessed at $0 cash

  // --- ego / charisma balance curve ---
  // Charisma lands ~3x fast at the start and decays; ego does the opposite.
  // They cross at roughly 220 stonks, which is "the turn".
  CHARISMA_MULT_BASE: 3.0,
  CHARISMA_HALFLIFE: 400,
  EGO_MULT_K: 1 / 12,       // egoMult = 1 + sqrt(stonks) * EGO_MULT_K
  CREDIBILITY_EXP: 1.0,     // charisma gains choke as you approach the bubble

  // --- challenge flow ---
  OFFER_INTERVAL: 26,       // seconds between new offers
  BASE_OFFER_SLOTS: 3,
  BASE_ACTIVE_SLOTS: 3,
};

export function newState() {
  return {
    v: SAVE_VERSION,
    t: 0,                 // seconds of playtime
    lastSave: Date.now(),
    company: pickCompanyName(),

    cash: C.START_CASH,
    stonks: 0,
    ego: C.BASE_EGO,
    charisma: C.BASE_CHARISMA,
    contractIncome: 0,    // recurring $/s won from completed challenges

    owned: {},            // upgradeId -> count
    flags: {},            // one-off events / unlocks

    offers: [],           // [{id, seed, expires}]
    active: [],           // [{uid, id, progress, alloc, elapsed}]
    completed: {},        // challengeId -> times completed
    nextOfferIn: 6,
    uidSeq: 1,

    rivals: {},           // rivalId -> {cap, alive, mood}
    tickerSeed: Math.random(),

    stats: {
      challengesDone: 0, challengesFailed: 0,
      peakAip: 0, totalEarned: 0, bubblePops: 0, insolvencies: 0,
    },

    // transient-but-persisted status
    status: 'NOMINAL',    // NOMINAL | STRAINED | BUBBLE | INSOLVENT
  };
}

const ADJ = ['Recursive', 'Synthetic', 'Emergent', 'Latent', 'Frontier', 'Sovereign', 'Infinite', 'Terminal'];
const NOUN = ['Cognition', 'Alignment', 'Substrate', 'Inference', 'Scale', 'Compute', 'Sentience', 'Labs'];
const SUF = ['Labs', 'AI', 'Systems', 'Dynamics', 'Group', 'Holdings'];

export function pickCompanyName() {
  const p = (a) => a[Math.floor(Math.random() * a.length)];
  return `${p(ADJ)} ${p(NOUN)} ${p(SUF)}`.toUpperCase();
}
