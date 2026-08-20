import { resourceScreen } from '../resourceScreen.js';
import { fmt } from '../../format.js';

export default resourceScreen({
  id: 'ops', icon: '🏢', title: 'OPERATIONS', nav: 'OPS', cat: 'ops',
  blurb: 'Headcount, process, and the multipliers that do not appear anywhere ' +
    'in the formula but quietly scale all of it. Every hire here buys you the ' +
    'ability to be overcommitted in more places simultaneously.',
  diagTitle: 'ORG CHART (SIMPLIFIED)',
  shopTitle: 'HEADCOUNT & TOOLING',

  stats: (s, d) => [
    ['Concurrent contract slots', `${s.active.length} / ${d.activeSlots}`,
      s.active.length >= d.activeSlots ? 'warn' : ''],
    ['Open offer slots', `${s.offers.length} / ${d.offerSlots}`],
    ['Seconds between offers', d.offerInterval.toFixed(1) + 's'],
    ['Orchestration multiplier', '×' + d.acc.powerMult.toFixed(2)],
    ['Burst headroom bonus', '×' + d.headroomBonus.toFixed(3)],
    ['TOTAL AI POWER MULTIPLIER', '×' + d.powerMult.toFixed(3)],
    ['Contracts delivered', fmt(s.stats.challengesDone, 0)],
    ['Contracts missed', fmt(s.stats.challengesFailed, 0),
      s.stats.challengesFailed > 0 ? 'warn' : ''],
  ],

  notes: (s, d) => s.active.length >= d.activeSlots
    ? `<div class="warnbox">All contract slots are occupied. New offers will expire
       unclaimed. Hire a program manager, or accept that you are at capacity —
       a thing you have never accepted before and will not start now.</div>`
    : '',
});
