/* ==========================================================================
   BLACKSITE OS · incidents.js          (página: incidents.html)
   - Buscador de texto que se combina con el filtro de gravedad CSS.
   - Favoritos (★) en cada informe y botones expandir / contraer todo.
   - Enlaces directos a un informe: incidents.html#INC-2047-0118
   ========================================================================== */
(() => {
  'use strict';

  BS.register('incidents', {
    pages: ['incidents'],
    init() {
      const wrap = BS.$('.reports-wrap');
      const filters = wrap && BS.$('.filters', wrap);
      if (!filters) return;
      const reports = BS.$$('.report', wrap);

      reports.forEach((report) => {
        const num = BS.$('.report__num', report);
        const id = num.textContent.trim();
        const title = BS.$('.report__title', report).firstChild.textContent.trim();
        report.id = id;
        report.dataset.search = BS.normalize(report.textContent);
        num.append(BS.favButton({ id, type: 'incident', title: `${id} · ${title}`, href: `incidents.html#${id}` }, 'report__fav'));
      });

      const input = BS.el('input', { class: 'search__input', type: 'search', placeholder: 'Buscar informe', 'aria-label': 'Buscar informe por número, lugar o texto' });
      const count = BS.el('span', { class: 'label' });
      const expandAll = BS.el('button', { type: 'button', class: 'chip', text: 'Expandir todo' });
      const collapseAll = BS.el('button', { type: 'button', class: 'chip', text: 'Contraer todo' });
      const empty = BS.el('div', { class: 'empty-state', hidden: true }, [BS.el('strong', { text: 'Sin resultados' }), 'Ningún informe coincide con la búsqueda']);
      filters.before(BS.el('div', { class: 'toolbar' }, [BS.el('label', { class: 'search' }, [input, BS.el('span', { class: 'search__kbd', 'aria-hidden': 'true', text: '/' })]), expandAll, collapseAll, count]));
      wrap.append(empty);

      const visible = () => reports.filter((r) => getComputedStyle(r).display !== 'none');
      const apply = () => {
        const term = BS.normalize(input.value);
        reports.forEach((r) => r.classList.toggle('is-filtered-out', !!term && !r.dataset.search.includes(term)));
        const n = visible().length;
        count.textContent = `${BS.pad(n, 2)} / ${BS.pad(reports.length, 2)} informes`;
        empty.hidden = n > 0;
      };

      input.addEventListener('input', apply);
      BS.$$('.filters__input', wrap).forEach((r) => r.addEventListener('change', apply));
      expandAll.addEventListener('click', () => visible().forEach((r) => { r.open = true; }));
      collapseAll.addEventListener('click', () => reports.forEach((r) => { r.open = false; }));
      document.addEventListener('keydown', (e) => {
        if (e.key === '/' && !BS.isTyping(e.target)) { e.preventDefault(); input.focus(); }
      });

      /* Enlace directo a un informe (desde favoritos o la terminal) */
      const fromHash = () => {
        const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target && target.classList.contains('report')) {
          target.open = true;
          target.scrollIntoView({ block: 'center' });
          target.classList.add('is-match');
          setTimeout(() => target.classList.remove('is-match'), 2500);
        }
      };
      window.addEventListener('hashchange', fromHash);
      fromHash();
      apply();
    },
  });
})();
