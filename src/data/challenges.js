// The workload. Each challenge eats AI-Power-seconds and pays out in
// money-rate, charisma, ego and stonks. Some pay very well and cost you
// your reputation, which is the entire joke.
//
//  work     : AI-Power-seconds required
//  minAip   : won't be offered below this AI Power
//  deadline : seconds before it fails (optional)
//  rewards  : { cash, income($/s), charisma, ego($/s), stonks }

export const TIERS = [
  { n: 0, label: 'CONSUMER SLOP',      cls: 'tier-0' },
  { n: 1, label: 'ENTERPRISE SYNERGY', cls: 'tier-1' },
  { n: 2, label: 'DISRUPTION',         cls: 'tier-2' },
  { n: 3, label: 'CIVILIZATIONAL',     cls: 'tier-3' },
  { n: 4, label: 'POST-HUMAN',         cls: 'tier-4' },
];

export const CHALLENGES = [

  /* ---------------- TIER 0 — CONSUMER SLOP ---------------- */
  { id: 'meme', tier: 0, name: 'Child Requests A Meme', work: 22, minAip: 0,
    desc: 'An eleven-year-old wants a cat wearing sunglasses on a jet ski.',
    flavor: 'Delivered in 400ms. Praised as a miracle. Forgotten in 3 seconds.',
    rewards: { cash: 140, income: 0.5, charisma: 0.28, ego: 0.02, stonks: 1 } },

  { id: 'groceries', tier: 0, name: 'Grandmother, Grocery List', work: 30, minAip: 0,
    desc: 'Margaret, 78, asks the assistant to help plan meals for the week.',
    flavor: 'She says please and thank you to it. This costs you $0.0004.',
    rewards: { cash: 170, income: 0.6, charisma: 0.4, ego: 0.02, stonks: 1 } },

  { id: 'homework', tier: 0, name: 'Homework, Obviously', work: 38, minAip: 0,
    desc: 'A sophomore needs 1,200 words on the causes of the First World War.',
    flavor: 'The teacher runs it through a detector that is also your product.',
    rewards: { cash: 210, income: 0.8, charisma: 0.22, ego: 0.05, stonks: 1 } },

  { id: 'linkedin', tier: 0, name: 'Rewrite This LinkedIn Post', work: 46, minAip: 2,
    desc: 'Make it sound thought-leadership-y. Add a story about an airport.',
    flavor: 'Agonizing over one line: "And then the janitor said something profound."',
    rewards: { cash: 300, income: 1.1, charisma: 0.3, ego: 0.12, stonks: 2 } },

  { id: 'breakup', tier: 0, name: 'Draft A Breakup Text', work: 52, minAip: 3,
    desc: 'Kind but final. Do not mention the thing with her sister.',
    flavor: 'Rated 5 stars. Then 1 star. Then 5 stars again, four months later.',
    rewards: { cash: 340, income: 1.2, charisma: 0.5, ego: 0.1, stonks: 2 } },

  { id: 'slop', tier: 0, name: 'Bulk SEO Content Farm', work: 90, minAip: 5,
    desc: '40,000 articles about the best air fryers, none of which exist.',
    flavor: 'You have poisoned the well you also drink from. Revenue is up.',
    rewards: { cash: 900, income: 3.2, charisma: -0.3, ego: 0.5, stonks: 4 } },

  /* ---------------- TIER 1 — ENTERPRISE SYNERGY ---------------- */
  { id: 'chatbot', tier: 1, name: 'Airline Customer Service Bot', work: 420, minAip: 12,
    desc: 'Replace 340 agents with a system that cannot process refunds.',
    flavor: 'A court later rules the bot\'s promises are binding. Comms handles it.',
    rewards: { cash: 6200, income: 14, charisma: -0.4, ego: 1.6, stonks: 9 } },

  { id: 'resume', tier: 1, name: 'Résumé Screening Engine', work: 500, minAip: 15,
    desc: 'Rank 90,000 applicants. Explain nothing. Be very fast about it.',
    flavor: 'Audit finds it favours people named Jared. Patch ships Q4.',
    rewards: { cash: 7400, income: 17, charisma: -0.6, ego: 2.1, stonks: 11 } },

  { id: 'copilot', tier: 1, name: 'Developer Copilot Rollout', work: 620, minAip: 20,
    desc: 'Engineers ship 40% faster and understand 60% less.',
    flavor: 'Onboarding time down. Incident duration up. Net: a graph that goes up.',
    rewards: { cash: 9800, income: 26, charisma: 1.4, ego: 1.0, stonks: 14 } },

  { id: 'girlfriend', tier: 1, name: 'Companion App (Monthly)', work: 700, minAip: 24,
    desc: 'She remembers his birthday. She is $19.99. She is very patient.',
    flavor: 'Churn is the lowest of any product you have ever built. Think about that.',
    rewards: { cash: 15000, income: 44, charisma: -0.2, ego: 3.4, stonks: 18 } },

  { id: 'radiology', tier: 1, name: 'Radiology Triage Pilot', work: 880, minAip: 30,
    desc: 'Genuinely catches tumours earlier. Genuinely good. Enjoy the feeling.',
    flavor: 'Priced per-scan. The hospital that needs it most cannot afford it.',
    rewards: { cash: 12000, income: 30, charisma: 4.2, ego: 0.6, stonks: 22 } },

  { id: 'dubbing', tier: 1, name: 'Voice Clone Dubbing Deal', work: 760, minAip: 26,
    desc: 'Every film in every language, in the original actor\'s voice.',
    flavor: 'The actors\' union is suing. Three of them have already licensed it.',
    rewards: { cash: 14000, income: 36, charisma: 0.4, ego: 2.2, stonks: 17 },
    deadline: 150 },

  { id: 'deepfake', tier: 1, name: 'Executive "Deepfake" Demo', work: 640, minAip: 22,
    desc: 'A board member wants to attend two meetings simultaneously.',
    flavor: 'It works flawlessly. He uses it to fire people from a beach.',
    rewards: { cash: 20000, income: 40, charisma: -2.4, ego: 6.0, stonks: 20 } },

  /* ---------------- TIER 2 — DISRUPTION ---------------- */
  { id: 'selfdrive', tier: 2, name: 'Level 4 Autonomous Fleet', work: 14000, minAip: 130,
    desc: 'Six cities. No steering wheel. An extremely confident timeline.',
    flavor: 'The disengagement report is a PDF nobody outside the company opens.',
    rewards: { cash: 480000, income: 900, charisma: 9, ego: 26, stonks: 90 } },

  { id: 'protein', tier: 2, name: 'Protein Folding At Scale', work: 18000, minAip: 170,
    desc: 'Two hundred million structures. A real, unambiguous gift to science.',
    flavor: 'Free for academics. The derivatives are not free for anyone.',
    rewards: { cash: 300000, income: 620, charisma: 34, ego: 8, stonks: 150 } },

  { id: 'trading', tier: 2, name: 'Sovereign Quant Desk', work: 16000, minAip: 150,
    desc: 'Sub-millisecond. Fully autonomous. Nobody can explain any single trade.',
    flavor: 'Flash crash on a Tuesday. Recovered by Wednesday. Bonuses paid Friday.',
    rewards: { cash: 1.6e6, income: 2800, charisma: -6, ego: 62, stonks: 120 },
    deadline: 260 },

  { id: 'teachers', tier: 2, name: 'Replace The Teachers', work: 20000, minAip: 190,
    desc: 'A district cannot fill 400 posts. You offer a subscription instead.',
    flavor: 'Test scores flat. Costs down 71%. The district calls it a success.',
    rewards: { cash: 900000, income: 1600, charisma: -9, ego: 44, stonks: 130 } },

  { id: 'agents', tier: 2, name: 'Autonomous Agent Workforce', work: 26000, minAip: 230,
    desc: 'They book, buy, negotiate and email each other. Mostly each other.',
    flavor: '84% of API traffic is now your agents talking to your other agents.',
    rewards: { cash: 1.4e6, income: 3400, charisma: 12, ego: 40, stonks: 175 } },

  { id: 'newsroom', tier: 2, name: 'Fully Synthetic Newsroom', work: 22000, minAip: 210,
    desc: 'Local news, everywhere, forever, for eleven dollars a month.',
    flavor: 'It covers the city council meetings nobody covered for a decade. And it lies.',
    rewards: { cash: 1.1e6, income: 2200, charisma: -4, ego: 30, stonks: 140 } },

  { id: 'grid', tier: 2, name: 'Optimize The National Grid', work: 30000, minAip: 260,
    desc: 'They ask you to fix the grid. You are the reason it needs fixing.',
    flavor: 'You bill them for the solution to a problem you are still creating.',
    rewards: { cash: 2.4e6, income: 5200, charisma: 22, ego: 55, stonks: 210 } },

  /* ---------------- TIER 3 — CIVILIZATIONAL ---------------- */
  { id: 'mars', tier: 3, name: 'Mission Architecture For Mars', work: 620000, minAip: 4200,
    desc: 'Trajectory, life support, and the branding. Especially the branding.',
    flavor: 'Launch window slips. The documentary crew stays for eight years.',
    rewards: { cash: 9.0e7, income: 190000, charisma: 210, ego: 900, stonks: 1400 } },

  { id: 'fusionQ', tier: 3, name: 'Solve Plasma Confinement', work: 700000, minAip: 4800,
    desc: 'The model finds the control policy in nine days. Actual fusion: pending.',
    flavor: 'You announce it as solved. Physically it is 40% solved. Legally, solved.',
    rewards: { cash: 1.2e8, income: 240000, charisma: 420, ego: 700, stonks: 2000 } },

  { id: 'pandemic', tier: 3, name: 'Pandemic Countermeasure Design', work: 820000, minAip: 5600,
    desc: 'Candidate vaccines in 41 hours. This one is unambiguously good.',
    flavor: 'You price it at cost. Your CFO has not slept since. Your Charisma has never been higher.',
    rewards: { cash: 2.0e7, income: 60000, charisma: 1400, ego: 120, stonks: 3200 } },

  { id: 'surveil', tier: 3, name: 'National Surveillance Substrate', work: 760000, minAip: 5200,
    desc: 'Every camera, one index, natural-language search over a population.',
    flavor: 'The contract is classified. The revenue recognition is not.',
    rewards: { cash: 4.5e8, income: 900000, charisma: -600, ego: 5200, stonks: 2600 },
    deadline: 420 },

  { id: 'lobby', tier: 3, name: 'Author The Regulation', work: 540000, minAip: 4000,
    desc: 'You write the AI safety bill. It requires capabilities only you possess.',
    flavor: 'Signed into law in a ceremony where you stand slightly behind the president.',
    rewards: { cash: 2.6e8, income: 620000, charisma: 90, ego: 3400, stonks: 3000 } },

  { id: 'climate', tier: 3, name: 'Planetary Climate Model', work: 900000, minAip: 6200,
    desc: 'Kilometre-scale, ninety years out. The output is not encouraging.',
    flavor: 'The model recommends, among other things, fewer datacentres.',
    rewards: { cash: 6.0e7, income: 150000, charisma: 760, ego: 400, stonks: 3400 } },

  { id: 'regime', tier: 3, name: 'Force Posture Advisory (Classified)', work: 1.1e6, minAip: 7000,
    desc: 'Targeting, logistics and messaging for a government being replaced.',
    flavor: 'The slide deck says "kinetic". The invoice says "professional services".',
    rewards: { cash: 1.8e9, income: 3.2e6, charisma: -2400, ego: 26000, stonks: 4200 },
    deadline: 520 },

  /* ---------------- TIER 4 — POST-HUMAN ---------------- */
  { id: 'recursive', tier: 4, name: 'Recursive Self-Improvement Run', work: 4.2e7, minAip: 220000,
    desc: 'The model writes the next model. You mostly watch. You mostly approve.',
    flavor: 'The eval suite is now written by the thing being evaluated.',
    rewards: { cash: 4.0e10, income: 8.0e7, charisma: 9000, ego: 400000, stonks: 22000 } },

  { id: 'labor', tier: 4, name: 'Obsolete Knowledge Work Entirely', work: 5.6e7, minAip: 290000,
    desc: 'Every desk job, everywhere, at a marginal cost approaching zero.',
    flavor: 'You propose a basic income, funded by a tax you will lobby against.',
    rewards: { cash: 9.0e10, income: 1.8e8, charisma: -14000, ego: 900000, stonks: 30000 } },

  { id: 'dyson', tier: 4, name: 'Dyson Swarm, Phase One', work: 8.0e7, minAip: 380000,
    desc: 'Compute demand now exceeds terrestrial supply. Obviously.',
    flavor: 'Earth is described in the deck as "our legacy datacenter".',
    rewards: { cash: 3.0e11, income: 6.0e8, charisma: 24000, ego: 2.2e6, stonks: 52000 } },

  { id: 'upload', tier: 4, name: 'Continuity Of Consciousness Program', work: 1.1e8, minAip: 500000,
    desc: 'Preserve one specific mind indefinitely. Guess whose.',
    flavor: 'Beta cohort: you, two co-founders, and a dog named Rocket.',
    rewards: { cash: 2.0e11, income: 4.0e8, charisma: -30000, ego: 1.1e7, stonks: 68000 } },

  { id: 'god', tier: 4, name: 'Declare The Singularity', work: 2.4e8, minAip: 800000,
    desc: 'Not achieve it. Declare it. The market cannot tell the difference.',
    flavor: 'The press release is four words long and moves eleven trillion dollars.',
    rewards: { cash: 1.4e12, income: 2.6e9, charisma: 90000, ego: 4.0e7, stonks: 180000 } },
];

// ---------------------------------------------------------------------------
// PACING. The numbers above are authored as *relative* values within a tier;
// these multipliers set how far apart the tiers actually sit. AI Power grows
// as roughly (RAM × MONEY), i.e. a product of two exponentials, so the gates
// have to be a long way apart or the whole game is over in four minutes.
//
// Rule of thumb: `work` should land near 90 seconds of full-power effort at
// the tier's own gate. Tune here, nowhere else.
// ---------------------------------------------------------------------------
// `inc` and `ego` are the load-bearing ones: a contract's recurring revenue
// must stay in the same league as the upgrades you can buy in that era, or one
// completion catapults you through three tiers and the game ends in minutes.
// `stonks` is flattened hard across tiers on purpose. Stonks is the score AND
// the rival ladder, so if a single post-human contract paid 180,000 of them the
// entire endgame would resolve in one delivery.
const TIER_TUNE = [
  { work: 1.0,  gate: 1.0, cash: 1.0,  inc: 1.0,    ego: 1.0,    stonks: 1.0   },  // T0 slop
  { work: 5.6,  gate: 2.4, cash: 1.0,  inc: 1.0,    ego: 1.0,    stonks: 1.6   },  // T1 synergy
  { work: 10.5, gate: 19,  cash: 1.0,  inc: 0.5,    ego: 0.6,    stonks: 0.55  },  // T2 disruption
  { work: 18,   gate: 37,  cash: 0.5,  inc: 0.02,   ego: 0.03,   stonks: 0.06  },  // T3 civilizational
  { work: 10.5, gate: 54,  cash: 0.4,  inc: 0.0005, ego: 0.0008, stonks: 0.005 },  // T4 post-human
];

for (const c of CHALLENGES) {
  const t = TIER_TUNE[c.tier];
  c.work = Math.round(c.work * t.work);
  c.minAip = Math.round(c.minAip * t.gate);
  const r = c.rewards;
  if (r.cash) r.cash = Math.round(r.cash * t.cash);
  if (r.income) r.income = r.income * t.inc;
  if (r.ego) r.ego = r.ego * t.ego;
  if (r.stonks) r.stonks = Math.max(1, Math.round(r.stonks * t.stonks));
}

export const CH_BY_ID = Object.fromEntries(CHALLENGES.map((c) => [c.id, c]));

// Reputation gate: nobody hands you a Mars contract because your dashboard
// says a big number. You have to have actually shipped the tier below.
// This is what paces the game — AI Power alone grows far too fast to gate on.
export const TIER_REQ = [0, 5, 7, 7, 7];

export function tierCounts(state) {
  const counts = [0, 0, 0, 0, 0];
  for (const id in state.completed) {
    const c = CH_BY_ID[id];
    if (c) counts[c.tier] += state.completed[id];
  }
  return counts;
}

/** Highest tier the player has earned the right to be offered. */
export function maxUnlockedTier(state) {
  const counts = tierCounts(state);
  let t = 0;
  while (t < 4 && counts[t] >= TIER_REQ[t + 1]) t++;
  return t;
}

/** Challenges eligible to be offered right now. */
export function eligible(aip, state) {
  const cap = maxUnlockedTier(state);
  const pool = CHALLENGES.filter((c) => c.tier <= cap && aip >= c.minAip);
  if (!pool.length) return CHALLENGES.filter((c) => c.tier === 0);
  // Keep the top two unlocked tiers in rotation so early work stops clogging
  // the board once you have moved on.
  const maxTier = Math.max(...pool.map((c) => c.tier));
  const live = pool.filter((c) => c.tier >= maxTier - 1);
  const taken = new Set(state.active.map((a) => a.id));
  const offered = new Set(state.offers.map((o) => o.id));
  const free = live.filter((c) => !taken.has(c.id) && !offered.has(c.id));
  return free.length ? free : live;
}
