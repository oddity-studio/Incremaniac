import { resourceScreen } from '../resourceScreen.js';
import { fmt, pct } from '../../format.js';
import { C } from '../../state.js';

export default resourceScreen({
  id: 'water', icon: '💧', title: 'THERMAL & HYDROLOGY', nav: 'WATER', cat: 'water',
  blurb: 'Cooling is the tax reality charges on compute. Efficiency shrinks ' +
    'that tax and raises AI Power — right up until what you really consume ' +
    'falls below what you have publicly promised, at which point the whole ' +
    'story inverts and the bubble pops.',
  diagTitle: 'COOLING LOOP',
  shopTitle: 'THERMAL MANAGEMENT',

  stats: (s, d) => {
    const margin = d.denominator / Math.max(d.waterBurden, 1e-9);
    return [
      ['Baseline facility load', fmt(C.BASE_WATER) + ' ML/day'],
      ['Compute-driven load', fmt(d.waterCompute) + ' ML/day'],
      ['Cooling coefficient', '×' + d.coolCoef.toFixed(3) +
        (d.coolCoef <= C.COOLING_FLOOR ? ' [FLOOR]' : '')],
      ['Conspicuous waste multiplier', '×' + d.waterMult.toFixed(2)],
      ['WATER (total burden)', fmt(d.waterBurden) + ' ML/day'],
      ['CHARISMA (narratively removed)', fmt(d.charisma) + ' ML/day'],
      ['REALITY REMAINING', fmt(d.denominator),
        d.bubble ? 'bad' : margin < 0.18 ? 'warn' : ''],
      ['Reality margin', pct(Math.max(0, margin), 1), d.bubble ? 'bad' : margin < 0.18 ? 'warn' : ''],
      ['Charisma gains scaled to', '×' + d.charismaYield.toFixed(2),
        d.charismaYield < 0.5 ? 'warn' : ''],
      ['Olympic pools per day', fmt(d.waterBurden * 400, 0)],
    ];
  },

  notes: (s, d) => {
    if (d.bubble) {
      return `<div class="critbox"><b>THE BUBBLE HAS POPPED.</b> Your CHARISMA
        (${fmt(d.charisma)}) now exceeds your actual cooling burden
        (${fmt(d.waterBurden)}). You have promised away more physical reality than
        you consume. AI Power is running at 5%.<br><br>
        <b>Two ways out:</b> scale up genuinely (more RAM &rarr; more draw &rarr; more
        burden), or buy the <i>Ornamental Campus Water Feature</i> below and become
        conspicuously, deliberately wasteful. Both work. Only one is honest, and
        the honest one is slower.</div>`;
    }
    const margin = d.denominator / Math.max(d.waterBurden, 1e-9);
    if (margin < 0.18) {
      return `<div class="warnbox"><b>HYPE OVERHANG.</b> Charisma is at
        ${pct(1 - margin, 0)} of your real cooling burden. AI Power is spiking
        because you are running out of reality to divide by. This is the most
        profitable and least stable moment in the life of any company.</div>`;
    }
    return '';
  },
});
