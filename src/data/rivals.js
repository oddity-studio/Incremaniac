// The competition. Every one of them is a loving parody and none of them
// are real. Your win condition is that all of them capitulate and invest
// in you instead.

// `need` is the Stonks score at which they fold. Stonks is a *counted* score —
// it only moves when you actually deliver something — which makes it the one
// quantity in this game that cannot run away from the designer.
export const RIVALS = [
  { id: 'openbrane', name: 'OpenBrane',        logo: '◎', cap: 3.4e11, need: 25000,
    tag: 'Nonprofit. Technically. In the way a shark is technically a fish.',
    death: 'The board fires the CEO. Then unfires him. Then joins your cap table.' },

  { id: 'anthropomorphic', name: 'Anthropomorphic', logo: '✳', cap: 1.9e11, need: 15500,
    tag: 'Writes a 60-page constitution, then trains on your homework anyway.',
    death: 'Publishes a paper proving your dominance was inevitable, then invests.' },

  { id: 'goggle', name: 'Goggle DeepMime',     logo: '◐', cap: 8.1e11, need: 63000,
    tag: 'Invented the transformer. Shipped it eighth.',
    death: 'Reorgs into you. Announced in a blog post nobody reads.' },

  { id: 'meat', name: 'Meat Platforms',        logo: '∞', cap: 5.6e11, need: 39000,
    tag: 'Gives the model away free purely to ruin everyone else\'s business.',
    death: 'Pivots to legs again. Wires you the compute budget on the way out.' },

  { id: 'exai', name: 'ex.AI',                 logo: '𝕏', cap: 6.0e10, need: 9000,
    tag: 'Announced at 3am. Trained on a social network. Behaves like it.',
    death: 'Merges with a rocket company, a car company, and finally with you.' },

  { id: 'deepsneak', name: 'DeepSneak',        logo: '🐋', cap: 4.2e10, need: 4800,
    tag: 'Did it for six million dollars and wiped a trillion off the market.',
    death: 'Open-sources everything, including its own obituary, then funds you.' },

  { id: 'mistrale', name: 'Mistrale',          logo: '⚜', cap: 1.4e10, need: 2400,
    tag: 'European. Sovereign. Extremely well-regulated. Very small.',
    death: 'Receives a state bailout, which it immediately invests in you.' },

  { id: 'perplexed', name: 'Perplexed',        logo: '❓', cap: 9.0e9, need: 1000,
    tag: 'A search box wrapped around somebody else\'s model.',
    death: 'Tries to acquire a browser, a newspaper, and you. Settles for you.' },

  { id: 'novidia', name: 'NoVIDIA',            logo: '🟩', cap: 3.2e12, need: 100000,
    tag: 'Sells shovels. Owns the gold. Owns the mine. Owns you, currently.',
    death: 'The final holdout. Takes an equity stake instead of payment. You win.',
    supplier: true },
];

export const HEADLINES = [
  'ANALYSTS: "THE FUNDAMENTALS ARE VIBES, BUT THEY ARE STRONG VIBES"',
  'DATACENTER APPROVED IN TOWN OF 400; TOWN NOT INFORMED',
  'STUDY FINDS 71% OF AI PILOTS FAIL; FUNDING UP 340%',
  'CEO SAYS JOBS WILL NOT BE LOST, ONLY "REALLOCATED TO NOTHING"',
  'ELECTRICITY BILLS RISE 34%; UTILITY CITES "UNKNOWN LARGE CUSTOMER"',
  'NEW BENCHMARK RELEASED; SATURATED BY THURSDAY',
  'SOVEREIGN FUND INVESTS $40B, ASKS NO QUESTIONS, RECEIVES NO ANSWERS',
  'RESERVOIR AT 12%; SPOKESPERSON NOTES WATER IS "TECHNICALLY RETURNED"',
  'RESEARCHER QUITS OVER SAFETY, JOINS SAFETY-FOCUSED LAB, LAB SHIPS FASTER',
  'MODEL PASSES BAR EXAM; STILL CANNOT COUNT THE Rs IN "STRAWBERRY"',
  'BUBBLE? "NO," SAYS MAN WHOSE ENTIRE NET WORTH IS THE BUBBLE',
  'GPU SHORTAGE ENTERS FOURTH YEAR; SHOVEL SALESMAN BUYS SIXTH ISLAND',
  'OPEN LETTER SIGNED BY 1,100 EXPERTS; NOBODY PAUSES ANYTHING',
  'TOWN VOTES DOWN DATACENTER; STATE OVERRIDES TOWN BY FRIDAY',
  'AI SAFETY SUMMIT ENDS WITH NON-BINDING AGREEMENT TO MEET AGAIN',
];

export function initRivals() {
  const out = {};
  for (const r of RIVALS) out[r.id] = { cap: r.cap, alive: true, drift: 0 };
  return out;
}
