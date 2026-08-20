import { resourceScreen } from '../resourceScreen.js';
import { fmt, money, pct } from '../../format.js';

export default resourceScreen({
  id: 'pr', icon: '🎤', title: 'PRESS & PERSONA', nav: 'EGO / CHARISMA', cat: 'pr',
  blurb: 'The two soft variables, and the only two that grow on their own. ' +
    'CHARISMA is subtracted from your cooling burden — you are literally cooling ' +
    'the datacenter with narrative. EGO is subtracted from your revenue. Early on ' +
    'charisma arrives roughly three times faster than ego. That reverses.',
  diagTitle: 'REPUTATION TELEMETRY',
  shopTitle: 'NARRATIVE OPERATIONS',

  stats: (s, d) => [
    ['CHARISMA', fmt(d.charisma) + ' ML/day'],
    ['&nbsp;&nbsp;↳ charisma gain rate', '×' + d.charismaMult.toFixed(2) +
      (d.charismaMult > 1.8 ? '  (early-stage halo)' : '')],
    ['&nbsp;&nbsp;↳ credibility discount', '×' + d.charismaYield.toFixed(2),
      d.charismaYield < 0.5 ? 'warn' : ''],
    ['&nbsp;&nbsp;↳ revenue multiplier', '×' + d.charismaIncomeMult.toFixed(2)],
    ['&nbsp;&nbsp;↳ cooling burden erased', pct(Math.min(1, d.charisma / Math.max(d.waterBurden, 1e-9)), 1),
      d.bubble ? 'bad' : ''],
    ['EGO (raw)', money(d.egoRaw) + '/s'],
    ['&nbsp;&nbsp;↳ humility discount', '×' + d.egoDiscount.toFixed(2)],
    ['&nbsp;&nbsp;↳ effective burn', money(d.egoBurn) + '/s', d.insolvent ? 'bad' : ''],
    ['&nbsp;&nbsp;↳ ego gain rate', '×' + d.egoMult.toFixed(2)],
    ['&nbsp;&nbsp;↳ valuation multiple added', '+' + Math.sqrt(d.egoRaw).toFixed(1) + '×'],
    ['Ego : Charisma balance', d.egoMult > d.charismaMult ? 'EGO ASCENDANT' : 'CHARISMA ASCENDANT',
      d.egoMult > d.charismaMult ? 'warn' : ''],
  ],

  notes: (s, d) => {
    const notes = [];
    if (d.egoMult > d.charismaMult) {
      notes.push(`<div class="warnbox"><b>THE TURN.</b> Ego now accrues faster than
        charisma (×${d.egoMult.toFixed(2)} vs ×${d.charismaMult.toFixed(2)}). Early on,
        the world gave you credit for what you might do. It has stopped. From here
        every contract inflates your burn faster than your goodwill.</div>`);
    }
    if (d.charisma > d.waterBurden * 0.82 && !d.bubble) {
      notes.push(`<div class="warnbox">Charisma is at ${pct(d.charisma / d.waterBurden, 0)}
        of your physical cooling burden. Every podcast from here pushes the
        denominator closer to zero. Consider being briefly less impressive.</div>`);
    }
    return notes.join('');
  },
});
