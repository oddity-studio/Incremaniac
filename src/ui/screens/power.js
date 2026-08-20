import { resourceScreen } from '../resourceScreen.js';
import { fmt, money } from '../../format.js';

export default resourceScreen({
  id: 'power', icon: '⚡', title: 'GRID & GENERATION', nav: 'ELECTRICITY', cat: 'elec',
  blurb: 'The numerator\'s third term. Capacity you do not draw is called ' +
    '"headroom" in your deck and "nothing" in the formula. Capacity you cannot ' +
    'supply is called "throttling", and it costs you twice.',
  diagTitle: 'SUBSTATION READOUT',
  shopTitle: 'GENERATION & INTERCONNECT',

  stats: (s, d) => [
    ['Contracted capacity', fmt(d.elecCapacity) + ' MW'],
    ['Demand from silicon', fmt(d.powerDraw) + ' MW'],
    ['ACTUALLY DRAWN &rarr; formula', fmt(d.powerUsed) + ' MW'],
    ['Utilisation', (Math.min(1, 1 / Math.max(d.headroom, 1e-9)) * 100).toFixed(1) + '%'],
    ['Burst headroom', '×' + d.headroom.toFixed(2)],
    ['Headroom bonus to AI Power', '×' + d.headroomBonus.toFixed(3)],
    ['Cooling burden generated', fmt(d.powerUsed * 34 * d.coolCoef) + ' ML/day'],
    ['Annualised at $84/MWh', money(d.powerUsed * 8760 * 84, 0)],
    ['Households equivalent', fmt(d.powerUsed * 900, 0) + ' homes'],
  ],

  notes: (s, d) => {
    if (d.throttle < 0.999) {
      return `<div class="critbox"><b>BROWNOUT.</b> Demand is ${fmt(d.powerDraw)} MW against
        ${fmt(d.elecCapacity)} MW contracted. Your racks are running at
        ${(d.throttle * 100).toFixed(0)}%. Buy generation before you buy another GPU.</div>`;
    }
    if (d.powerUsed * 900 > 200000) {
      return `<div class="warnbox">Your campus now draws more power than
        ${fmt(d.powerUsed * 900, 0)} households. Three separate local election
        campaigns are being fought about you. Your comms team has prepared a
        statement using the phrase <i>"good neighbour"</i> four times.</div>`;
    }
    return '';
  },
});
