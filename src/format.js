// Number formatting. Incremental games live or die on this.

const SUFFIX = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No',
  'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg',
];

/** Absurdist labels for magnitudes no economy should reach. */
const ABSURD = [
  [1e33, 'GDP-EQUIVALENTS'],
  [1e39, 'PLANETARY'],
  [1e45, 'POST-SCARCITY'],
  [1e51, 'MEANINGLESS'],
];

export function fmt(n, dec = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  if (!Number.isFinite(n)) return '∞';
  const sign = n < 0 ? '-' : '';
  n = Math.abs(n);
  if (n < 1000) {
    if (n === 0) return '0';
    if (n < 0.01) return sign + n.toExponential(1);
    if (n < 10) return sign + n.toFixed(dec);
    return sign + n.toFixed(n < 100 ? 1 : 0);
  }
  const tier = Math.floor(Math.log10(n) / 3);
  if (tier >= SUFFIX.length) return sign + n.toExponential(2).replace('e+', 'e');
  const scaled = n / Math.pow(10, tier * 3);
  return sign + scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0) + SUFFIX[tier];
}

export const money = (n, dec = 2) => (n < 0 ? '-$' : '$') + fmt(Math.abs(n), dec);
export const rate = (n) => money(n) + '/s';

/** Flavour label shown next to gigantic AI Power values. */
export function absurdLabel(n) {
  let label = null;
  for (const [thr, txt] of ABSURD) if (n >= thr) label = txt;
  return label;
}

export function pct(x, dec = 0) { return (x * 100).toFixed(dec) + '%'; }

export function clock(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const p = (v) => String(v).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${m}:${p(s)}`;
}

/** "12.4 GB" -> picks GB/TB/PB automatically from a GB-denominated value. */
export function bytes(gb) {
  const units = ['GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let i = 0, v = gb;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return fmt(v) + ' ' + units[i];
}
