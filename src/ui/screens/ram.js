import { resourceScreen } from '../resourceScreen.js';
import { fmt, bytes, money } from '../../format.js';
import { C } from '../../state.js';

export default resourceScreen({
  id: 'ram', icon: '🧠', title: 'COMPUTE & MEMORY', nav: 'RAM', cat: 'ram',
  blurb: 'The numerator\'s first term. Every gigabyte you install draws ' +
    'electricity, and every watt you draw becomes a cooling burden. There is ' +
    'no such thing as free memory; there is only memory whose bill has not arrived.',
  diagTitle: 'RACK DIAGNOSTICS',
  shopTitle: 'SILICON PROCUREMENT',

  stats: (s, d) => [
    ['Installed memory', bytes(d.ramRaw)],
    ['Architecture multiplier', '×' + d.ramMult.toFixed(2)],
    ['Total installed', bytes(d.ramTotal)],
    ['Power draw at full load', fmt(d.powerDraw) + ' MW'],
    ['Draw per GB', C.MW_PER_GB * 1000 + ' kW'],
    ['Throttle (grid-limited)', (d.throttle * 100).toFixed(1) + '%',
      d.throttle < 0.999 ? 'warn' : ''],
    ['EFFECTIVE RAM &rarr; formula', bytes(d.ramEffective),
      d.throttle < 0.999 ? 'warn' : ''],
    ['Silicon replacement cost', money(d.ramTotal * 41, 0)],
  ],

  notes: (s, d) => d.throttle < 0.999
    ? `<div class="warnbox"><b>THROTTLED.</b> You have ${bytes(d.ramTotal)} installed and only
       enough grid to run ${bytes(d.ramEffective)} of it. Throttling hits the formula
       <i>twice</i> &mdash; it shrinks the RAM term <i>and</i> the ELECTRICITY term.
       Idle silicon still depreciates, still appears in the deck, and still
       appears in the electricity bill of the town next door.</div>`
    : (d.headroom > 3
      ? `<div class="warnbox">You are running at ${(100 / d.headroom).toFixed(0)}% grid
         utilisation. Spare capacity earns a burst-headroom bonus, but capacity you
         never draw contributes nothing to the ELECTRICITY term. Buy memory.</div>`
      : ''),
});
