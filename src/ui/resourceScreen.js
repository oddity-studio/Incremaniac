// Factory for the five resource micro-management screens. Each one is a
// header, a CRT diagnostic panel, optional advisory boxes, and a shop.

import { h, panel, setHTML } from './dom.js';
import { makeShop } from './shop.js';

export function resourceScreen(cfg) {
  return {
    id: cfg.id,
    title: cfg.title,
    icon: cfg.icon,
    nav: cfg.nav || cfg.title,
    mount(root, game) {
      const diag = h('div', { class: 'crt-box' });
      const notes = h('div', {});
      const shop = makeShop(cfg.cat, game);

      root.replaceChildren(
        h('div', { class: 'screen-head' },
          h('h1', {}, `${cfg.icon}  ${cfg.title}`),
          h('p', {}, cfg.blurb)),
        notes,
        panel(cfg.diagTitle || 'DIAGNOSTICS', cfg.diagRight || null, diag),
        h('div', { class: 'panel' },
          h('div', { class: 'panel-title' },
            h('span', {}, cfg.shopTitle || 'PROCUREMENT'),
            h('span', { class: 'pt-right' }, 'prices rise with each unit')),
          shop.root),
      );

      return {
        update() {
          const s = game.state, d = game.d;
          setHTML(diag, cfg.stats(s, d).map(([k, v, cls]) =>
            `<div class="stat-line"><span class="k">${k}</span>` +
            `<span class="${cls || ''}">${v}</span></div>`).join(''));
          setHTML(notes, cfg.notes ? (cfg.notes(s, d) || '') : '');
          shop.update();
        },
      };
    },
  };
}
