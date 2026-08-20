// Tiny DOM helper. No framework; screens build once and patch per frame.

export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const k in props) {
    const v = props[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v);
  }
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); };

/** Only touch the DOM when the value actually changed — keeps 60fps honest. */
export function setText(el, v) {
  const s = String(v);
  if (el && el.__last !== s) { el.textContent = s; el.__last = s; }
}
export function setHTML(el, v) {
  if (el && el.__lastH !== v) { el.innerHTML = v; el.__lastH = v; }
}
export function setClass(el, cls) {
  if (el && el.__lastC !== cls) { el.className = cls; el.__lastC = cls; }
}

export function panel(title, right, ...body) {
  return h('div', { class: 'panel' },
    h('div', { class: 'panel-title' }, h('span', { text: title }),
      right ? h('span', { class: 'pt-right' }, right) : null),
    h('div', { class: 'panel-body' }, ...body));
}

export function statLine(k, v, cls) {
  const val = h('span', { class: 'sl-v' + (cls ? ' ' + cls : '') }, v);
  return { el: h('div', { class: 'stat-line' }, h('span', { class: 'sl-k' }, k), val), val };
}
