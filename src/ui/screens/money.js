import { resourceScreen } from '../resourceScreen.js';
import { fmt, money, pct } from '../../format.js';
import { C } from '../../state.js';

export default resourceScreen({
  id: 'money', icon: '💵', title: 'CAPITAL MARKETS', nav: 'MONEY', cat: 'money',
  blurb: 'What matters here is the rate, not the pile: dollars per second of ' +
    'gross inflow. Your cash balance is a separate thing you spend. Your ' +
    'lifestyle comes straight off the top — and if it ever outruns revenue, ' +
    'the compute stops meaning anything at all.',
  diagTitle: 'P&L (UNAUDITED, UNAUDITABLE)',
  shopTitle: 'REVENUE & FUNDRAISING',

  stats: (s, d) => [
    ['Cash on hand', money(s.cash, 0), s.cash < 0 ? 'bad' : ''],
    ['Base &amp; product revenue', money(C.BASE_INCOME + d.acc.income) + '/s'],
    ['Recurring contract revenue', money(s.contractIncome) + '/s'],
    ['Structural multiplier', '×' + d.acc.incomeMult.toFixed(2)],
    ['Charisma multiplier', '×' + d.charismaIncomeMult.toFixed(2)],
    ['GROSS INCOME', money(d.incomeGross) + '/s'],
    ['EGO (vanity burn)', '−' + money(d.egoBurn) + '/s', d.insolvent ? 'bad' : ''],
    ['NET AFTER EGO', money(d.moneyTerm) + '/s',
      d.insolvent ? 'bad' : d.moneyTerm < d.incomeGross * 0.18 ? 'warn' : ''],
    ['Revenue run-rate (daily)', money(d.dailyRevenue, 0)],
    ['Lifetime earned', money(s.stats.totalEarned, 0)],
  ],

  notes: (s, d) => {
    if (d.insolvent) {
      return `<div class="critbox"><b>VANITY INSOLVENCY.</b> Ego burn
        (${money(d.egoBurn)}/s) exceeds gross income (${money(d.incomeGross)}/s).
        AI Power is running at 5%.<br><br>
        Buy revenue, or visit <b>PRESS &amp; PERSONA</b> and purchase some
        performative humility. The yacht stays. The yacht always stays.</div>`;
    }
    if (d.moneyTerm < d.incomeGross * 0.18) {
      return `<div class="warnbox"><b>BURN ADVISORY.</b> Ego consumes
        ${pct(d.egoBurn / d.incomeGross, 0)} of gross revenue. Your CFO has started
        a sentence with "so, structurally—" four times this week.</div>`;
    }
    if (s.cash < 0) {
      return `<div class="warnbox">Cash balance is negative. This is a credit
        facility, not a problem. Valuation is up ${pct(0.14, 0)} on the news.</div>`;
    }
    return '';
  },
});
