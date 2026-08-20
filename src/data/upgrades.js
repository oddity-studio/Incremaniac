// Purchasable infrastructure, one list per micro-management screen.
//
// effect kinds:
//   ram +GB | ramMult x | elec +MW | elecMult x
//   cool x (multiplies the cooling-burden coefficient; LOWER = less Water)
//   income +$/s | incomeMult x | egoBurn x (vanity discount)
//   ego +$/s | charisma +ML/day | charismaMult x
//   offerSlots + | activeSlots + | powerMult x
//
// unlock(s, d) -> bool.  s = state, d = derived.

export const UPGRADES = [

  /* ===================== RAM / COMPUTE ===================== */
  { id: 'ram_ebay', cat: 'ram', icon: '🧠', name: 'DDR3 Sticks off eBay',
    desc: '+4 GB. Seller has 12,400 positive reviews and one photo of a cat.',
    flavor: '"Pulled from working system."', baseCost: 220, growth: 1.16,
    effect: { kind: 'ram', value: 4 } },

  { id: 'ram_gpu', cat: 'ram', icon: '🎮', name: 'Gaming GPU (Repurposed)',
    desc: '+18 GB VRAM. Was mining a coin that no longer exists.',
    flavor: 'Still smells faintly of a teenager\'s bedroom.', baseCost: 1600, growth: 1.17,
    effect: { kind: 'ram', value: 18 } },

  { id: 'ram_rack', cat: 'ram', icon: '🗄️', name: 'Half-Rack in a Colo',
    desc: '+140 GB. Shared with a dental billing company.',
    flavor: 'The dentists complain about the noise. You complain about the dentists.',
    baseCost: 26000, growth: 1.18, unlock: (s) => (s.owned.ram_gpu || 0) >= 4,
    effect: { kind: 'ram', value: 140 } },

  { id: 'ram_h1000', cat: 'ram', icon: '🟩', name: 'NoVIDIA H-1000 Cluster',
    desc: '+2,200 GB. An 18-month lead time you paid to skip.',
    flavor: 'Your allocation was approved after you called the CEO "a modern Medici".',
    baseCost: 900000, growth: 1.20, unlock: (s) => (s.owned.ram_rack || 0) >= 3,
    effect: { kind: 'ram', value: 2200 } },

  { id: 'ram_fab', cat: 'ram', icon: '🏭', name: 'Bespoke Silicon Program',
    desc: '+40,000 GB. You now have opinions about lithography.',
    flavor: 'Tape-out slipped two quarters. The press release did not.',
    baseCost: 8.5e7, growth: 1.22, unlock: (s) => (s.owned.ram_h1000 || 0) >= 3,
    effect: { kind: 'ram', value: 40000 } },

  { id: 'ram_orbital', cat: 'ram', icon: '🛰️', name: 'Orbital Compute Constellation',
    desc: '+1,400,000 GB. Space is cold and, crucially, unregulated.',
    flavor: 'Latency is atrocious. The render of it is magnificent.',
    baseCost: 4.0e10, growth: 1.25, unlock: (s) => (s.owned.ram_fab || 0) >= 4,
    effect: { kind: 'ram', value: 1400000 } },

  { id: 'ram_quant', cat: 'ram', icon: '⚛️', name: 'Quantum Adjacency Layer',
    desc: '×1.6 total RAM. Not quantum. Adjacent to quantum.',
    flavor: 'Legal approved the word "adjacent" after a four-hour meeting.',
    baseCost: 5.5e8, growth: 3.4, max: 8, unlock: (s) => (s.owned.ram_fab || 0) >= 1,
    effect: { kind: 'ramMult', value: 1.6 } },

  { id: 'ram_sparse', cat: 'ram', icon: '🕳️', name: 'Aggressive Sparsity',
    desc: '×1.35 total RAM. You simply deleted the parts of the model that were sad.',
    flavor: 'Benchmarks unchanged. Something ineffable is gone.',
    baseCost: 4.5e6, growth: 2.8, max: 10, unlock: (s) => (s.owned.ram_h1000 || 0) >= 1,
    effect: { kind: 'ramMult', value: 1.35 } },

  /* ===================== ELECTRICITY ===================== */
  { id: 'el_wall', cat: 'elec', icon: '🔌', name: 'Extension Cord to Next Door',
    desc: '+0.05 MW. Your neighbour has not noticed yet.',
    flavor: 'Theft is a strong word. Call it "distributed procurement".',
    baseCost: 180, growth: 1.15, effect: { kind: 'elec', value: 0.05 } },

  { id: 'el_diesel', cat: 'elec', icon: '⛽', name: 'Diesel Generator Bank',
    desc: '+0.9 MW. Loud, filthy, immediately available.',
    flavor: 'The sustainability page describes these as "transitional".',
    baseCost: 5200, growth: 1.17, effect: { kind: 'elec', value: 0.9 } },

  { id: 'el_ppa', cat: 'elec', icon: '📄', name: 'Grid Interconnect Agreement',
    desc: '+7 MW. Six utilities, one lawyer, zero new generation.',
    flavor: 'Local rates rose 11%. Unrelated, says your press office.',
    baseCost: 140000, growth: 1.19, unlock: (s) => (s.owned.el_diesel || 0) >= 4,
    effect: { kind: 'elec', value: 7 } },

  { id: 'el_solar', cat: 'elec', icon: '☀️', name: 'Solar Field (Rendered)',
    desc: '+22 MW nameplate. Roughly 4 MW actual. The render is 8K.',
    flavor: 'Counted at nameplate in every deck you have ever shown.',
    baseCost: 2.4e6, growth: 1.20, unlock: (s) => (s.owned.el_ppa || 0) >= 2,
    effect: { kind: 'elec', value: 22 } },

  { id: 'el_coal', cat: 'elec', icon: '🏭', name: 'Uncancel a Coal Plant',
    desc: '+120 MW. It was scheduled for demolition. It is now scheduled for you.',
    flavor: 'Offset by planting a number of trees you have not verified.',
    baseCost: 6.0e7, growth: 1.22, unlock: (s) => (s.owned.el_solar || 0) >= 2,
    effect: { kind: 'elec', value: 120 } },

  { id: 'el_smr', cat: 'elec', icon: '☢️', name: 'Small Modular Reactor',
    desc: '+900 MW. Regulatory approval secured via a podcast appearance.',
    flavor: 'The word "small" is doing an enormous amount of work.',
    baseCost: 9.0e9, growth: 1.24, unlock: (s) => (s.owned.el_coal || 0) >= 3,
    effect: { kind: 'elec', value: 900 } },

  { id: 'el_fusion', cat: 'elec', icon: '🌟', name: 'Fusion (2 Years Away)',
    desc: '+18,000 MW. It has been two years away for eleven years.',
    flavor: 'You have raised against this milestone four separate times.',
    baseCost: 2.2e12, growth: 1.28, unlock: (s) => (s.owned.el_smr || 0) >= 3,
    effect: { kind: 'elec', value: 18000 } },

  { id: 'el_eff', cat: 'elec', icon: '📉', name: 'Undervolting Program',
    desc: '×1.4 effective capacity. Same watts, better slide.',
    flavor: 'Achieved by changing the denominator in the report.',
    baseCost: 90000, growth: 2.6, max: 12, unlock: (s) => (s.owned.el_ppa || 0) >= 1,
    effect: { kind: 'elecMult', value: 1.4 } },

  /* ===================== WATER / COOLING ===================== */
  // 'cool' multiplies the burden coefficient. Lower burden = MORE AI Power,
  // but it also drags Water down toward Charisma. Efficiency is a risk dial.
  { id: 'w_fans', cat: 'water', icon: '🌬️', name: 'Box Fans, Many',
    desc: '×0.94 cooling burden. Purchased in a panic in July.',
    flavor: 'The receipt says "HOUSEHOLD APPLIANCES — 340 UNITS".',
    baseCost: 900, growth: 1.35, max: 15, effect: { kind: 'cool', value: 0.94 } },

  { id: 'w_closed', cat: 'water', icon: '🔁', name: 'Closed-Loop Retrofit',
    desc: '×0.88 cooling burden. The water goes around instead of away.',
    flavor: 'A genuinely good idea, which is why it took three years.',
    baseCost: 42000, growth: 1.45, max: 12, unlock: (s) => (s.owned.w_fans || 0) >= 3,
    effect: { kind: 'cool', value: 0.88 } },

  { id: 'w_aquifer', cat: 'water', icon: '🕳️', name: 'Private Aquifer Rights',
    desc: '×0.82 cooling burden. The county sold them cheap. The county regrets this.',
    flavor: 'Wells in the valley are down 4m. Correlation is not causation.',
    baseCost: 1.1e6, growth: 1.5, max: 10, unlock: (s) => (s.owned.w_closed || 0) >= 3,
    effect: { kind: 'cool', value: 0.82 } },

  { id: 'w_immersion', cat: 'water', icon: '🛢️', name: 'Immersion Dielectric Baths',
    desc: '×0.74 cooling burden. The servers now swim.',
    flavor: 'One engineer described the smell as "warm insurance claim".',
    baseCost: 3.8e7, growth: 1.55, max: 10, unlock: (s) => (s.owned.w_aquifer || 0) >= 2,
    effect: { kind: 'cool', value: 0.74 } },

  { id: 'w_arctic', cat: 'water', icon: '🧊', name: 'Arctic Siting Program',
    desc: '×0.62 cooling burden. Free cold, courtesy of a rapidly warming planet.',
    flavor: 'The irony has been flagged by comms and approved anyway.',
    baseCost: 5.5e9, growth: 1.6, max: 8, unlock: (s) => (s.owned.w_immersion || 0) >= 3,
    effect: { kind: 'cool', value: 0.62 } },

  // Counter-lever: buy burden BACK to escape a bubble. Multiplies the WHOLE
  // burden, so it scales with your empire and always works as an escape.
  { id: 'w_spectacle', cat: 'water', icon: '⛲', name: 'Ornamental Campus Water Feature',
    desc: '×1.25 total cooling burden. Deliberately wasteful. Deliberately load-bearing.',
    flavor: 'When Charisma outruns Water, the only cure is conspicuous consumption.',
    baseCost: 180000, growth: 1.7, max: 25, unlock: (s) => (s.owned.w_fans || 0) >= 2,
    effect: { kind: 'waterMult', value: 1.25 } },

  /* ===================== MONEY / CAPITAL ===================== */
  { id: 'm_consult', cat: 'money', icon: '💼', name: '"Strategic Advisory" Retainers',
    desc: '+$6/s. Four calls a month. You are on mute for three of them.',
    flavor: 'Deliverable: a slide with an iceberg on it.',
    baseCost: 400, growth: 1.16, effect: { kind: 'income', value: 6 } },

  { id: 'm_api', cat: 'money', icon: '🔑', name: 'Public API, Metered',
    desc: '+$34/s. Priced per token, which nobody can estimate in advance.',
    flavor: 'Your top customer is a startup reselling your API at a loss.',
    baseCost: 7800, growth: 1.17, effect: { kind: 'income', value: 34 } },

  { id: 'm_seed', cat: 'money', icon: '🌱', name: 'Seed Round (Party Round)',
    desc: '+$190/s. Nineteen angels, no lead, one very long cap table.',
    flavor: 'Valuation set by whoever spoke most confidently at dinner.',
    baseCost: 180000, growth: 1.19, unlock: (s) => (s.owned.m_api || 0) >= 3,
    effect: { kind: 'income', value: 190 } },

  { id: 'm_enterprise', cat: 'money', icon: '🏢', name: 'Enterprise Pilot Programs',
    desc: '+$1,400/s. Ninety percent never reach production. All of them renew.',
    flavor: 'Procurement calls it "AI transformation". IT calls it "the thing".',
    baseCost: 3.1e6, growth: 1.20, unlock: (s) => (s.owned.m_seed || 0) >= 2,
    effect: { kind: 'income', value: 1400 } },

  { id: 'm_series', cat: 'money', icon: '📈', name: 'Mega-Round, Sovereign Wealth',
    desc: '+$22,000/s. You do not ask where it is from. They do not ask where it goes.',
    flavor: 'The term sheet arrived before the pitch ended.',
    baseCost: 9.0e8, growth: 1.22, unlock: (s) => (s.owned.m_enterprise || 0) >= 3,
    effect: { kind: 'income', value: 22000 } },

  { id: 'm_circular', cat: 'money', icon: '♻️', name: 'Circular Vendor Financing',
    desc: '×1.5 income. You invest in a customer who buys your compute with your money.',
    flavor: 'Auditors have described the diagram as "a snake, eating".',
    baseCost: 4.0e7, growth: 3.2, max: 10, unlock: (s) => (s.owned.m_enterprise || 0) >= 1,
    effect: { kind: 'incomeMult', value: 1.5 } },

  { id: 'm_ipo', cat: 'money', icon: '🔔', name: 'Direct Listing',
    desc: '×2.2 income. A bell was rung. Nothing was produced.',
    flavor: 'Lock-up expires in six months. Set a reminder. Or don\'t.',
    baseCost: 6.0e10, growth: 5.0, max: 5, unlock: (s) => (s.owned.m_series || 0) >= 2,
    effect: { kind: 'incomeMult', value: 2.2 } },

  /* ===================== EGO / CHARISMA (PR) ===================== */
  { id: 'p_podcast', cat: 'pr', icon: '🎙️', name: 'Three-Hour Podcast Circuit',
    desc: '+0.6 Charisma. You explain consciousness to a man with a microphone.',
    flavor: 'Clip goes viral. It is the clip where you blink.',
    baseCost: 3000, growth: 1.28, effect: { kind: 'charisma', value: 0.6 } },

  { id: 'p_manifesto', cat: 'pr', icon: '📜', name: 'Publish a Manifesto',
    desc: '+3.4 Charisma. Eleven thousand words. Two of them are "inevitable".',
    flavor: 'Nobody finished it. Everybody has an opinion about it.',
    baseCost: 95000, growth: 1.32, unlock: (s) => (s.owned.p_podcast || 0) >= 3,
    effect: { kind: 'charisma', value: 3.4 } },

  { id: 'p_senate', cat: 'pr', icon: '🏛️', name: 'Testify Before the Senate',
    desc: '+21 Charisma. You ask to be regulated, specifically in ways that hurt rivals.',
    flavor: 'A senator calls your product "the Facebook". You agree warmly.',
    baseCost: 4.5e6, growth: 1.36, unlock: (s) => (s.owned.p_manifesto || 0) >= 2,
    effect: { kind: 'charisma', value: 21 } },

  { id: 'p_doom', cat: 'pr', icon: '☠️', name: 'Warn About Your Own Product',
    desc: '+140 Charisma. Nothing sells like a danger only you can be trusted with.',
    flavor: 'Signed an open letter. Did not slow down. Did not intend to.',
    baseCost: 8.0e8, growth: 1.40, unlock: (s) => (s.owned.p_senate || 0) >= 2,
    effect: { kind: 'charisma', value: 140 } },

  { id: 'p_humility', cat: 'pr', icon: '🧘', name: 'Performative Humility Coach',
    desc: '×0.82 ego burn. Same yacht, quieter about it.',
    flavor: 'Now wears a plain grey t-shirt that costs $900.',
    baseCost: 55000, growth: 1.8, max: 14, effect: { kind: 'egoBurn', value: 0.82 } },

  { id: 'p_foundation', cat: 'pr', icon: '🕊️', name: 'Charitable Foundation (LLC)',
    desc: '×0.7 ego burn, +2 Charisma. Structured for flexibility, not for giving.',
    flavor: 'Pledged 99%. Of a number you also get to define.',
    baseCost: 2.6e6, growth: 2.4, max: 10, unlock: (s) => (s.owned.p_humility || 0) >= 3,
    effect: [{ kind: 'egoBurn', value: 0.7 }, { kind: 'charisma', value: 2 }] },

  { id: 'p_biopic', cat: 'pr', icon: '🎬', name: 'Authorized Biopic',
    desc: '×1.25 AI Power, +heavy ego. The actor studied you for six months.',
    flavor: 'You are portrayed as difficult but right. You gave one note: "more right".',
    baseCost: 1.4e9, growth: 4.0, max: 6, unlock: (s) => (s.owned.p_doom || 0) >= 1,
    effect: [{ kind: 'powerMult', value: 1.25 }, { kind: 'ego', value: 4200 }] },

  /* ===================== OPERATIONS (slots) ===================== */
  { id: 'o_pm', cat: 'ops', icon: '📋', name: 'Hire a Program Manager',
    desc: '+1 concurrent contract slot. Also +1 recurring meeting, forever.',
    flavor: 'Introduces a framework. The framework introduces a subframework.',
    baseCost: 12000, growth: 2.5, max: 9, effect: { kind: 'activeSlots', value: 1 } },

  { id: 'o_bd', cat: 'ops', icon: '🤝', name: 'Business Development Org',
    desc: '+1 offer slot, offers arrive 12% faster.',
    flavor: 'Twelve people whose job is to be at a conference.',
    baseCost: 30000, growth: 2.4, max: 8,
    effect: [{ kind: 'offerSlots', value: 1 }, { kind: 'offerSpeed', value: 0.88 }] },

  { id: 'o_orchestr', cat: 'ops', icon: '🧩', name: 'Inference Orchestration Layer',
    desc: '×1.3 AI Power. Scheduling, but with a logo and a launch event.',
    flavor: 'Reduced idle GPU time by 3%. Reduced headcount by 300.',
    baseCost: 750000, growth: 2.9, max: 12, unlock: (s) => (s.owned.o_pm || 0) >= 2,
    effect: { kind: 'powerMult', value: 1.3 } },

  { id: 'o_ghost', cat: 'ops', icon: '👻', name: 'Offshore Human Fallback',
    desc: '×1.45 AI Power. When the model fails, a person in another timezone answers.',
    flavor: 'Referred to internally, and only internally, as "the mechanical turk".',
    baseCost: 5.5e6, growth: 3.1, max: 10, unlock: (s) => (s.owned.o_orchestr || 0) >= 2,
    effect: { kind: 'powerMult', value: 1.45 } },
];

export const BY_CAT = UPGRADES.reduce((m, u) => ((m[u.cat] ||= []).push(u), m), {});
export const BY_ID = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));

export function costOf(u, owned) {
  return Math.ceil(u.baseCost * Math.pow(u.growth, owned));
}
export function isMaxed(u, owned) {
  return u.max !== undefined && owned >= u.max;
}
export function effectsOf(u) {
  return Array.isArray(u.effect) ? u.effect : [u.effect];
}
