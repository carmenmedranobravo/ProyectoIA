/* ==========================================================================
   BLACKSITE OS · database.js            (página: experiments.html)
   - Buscador de texto, ordenación y filtro de favoritos que se combinan con
     el filtro de amenaza CSS existente (radios + :has()).
   - Botón ★ de favoritos y "Vista rápida" (modal con información ampliada).
   - Aparición del experimento oculto EXP-005 al descubrir su código.
   ========================================================================== */
(() => {
  'use strict';

  const RADIO_RULES = {
    'flt-all': () => true,
    'flt-critical': (card) => card.dataset.threat === 'critical',
    'flt-breach': (card) => card.dataset.breach === 'true',
    'flt-stable': (card) => card.dataset.breach === 'false',
  };

  let grid, cards, search, sortSelect, favChip, countLabel, empty;

  const expFor = (card) => BS.data.findExperiment(card.dataset.exp);

  /* ---------- Vista rápida ---------- */
  const quickView = (exp) => {
    const restricted = exp.clearance > 4 && !BS.secrets.has('clr5');
    const integrity = BS.state.integrity[exp.id];
    const fill = BS.el('span', { class: 'bar__fill', style: `--value:${integrity || 0}%` });
    const value = BS.el('strong', { text: integrity ? `${integrity.toFixed(1)}%` : '—' });

    const info = BS.el('div', { class: 'qv__info' }, [
      BS.el('div', {}, [
        BS.el('p', { class: 'xcard__id', text: `${exp.id} · ${exp.cell}` }),
        BS.el('h2', { class: 'qv__name', text: exp.name }),
      ]),
      BS.el('p', { class: 'qv__text', text: exp.summary }),
      BS.el('p', { class: 'qv__text' }, restricted
        ? ['Informe ampliado: ', BS.el('span', { class: 'redacted', tabindex: '0', text: exp.detail })]
        : [exp.detail]),
      BS.el('dl', { class: 'spec' }, [
        ['Amenaza', BS.el('span', {}, [BS.el('span', { class: 'threat', 'data-level': String(exp.threat), html: '<span></span>'.repeat(5) }), ` ${exp.threat}/5 · ${exp.threatLabel}`])],
        ['Contención', exp.statusLabel],
        ['Clase', exp.cls],
        ['Autorización', `CLR-${exp.clearance}`],
        ...Object.entries(exp.facts),
      ].map(([k, v]) => BS.el('div', { class: 'spec__row' }, [BS.el('dt', { text: k }), BS.el('dd', {}, [v])]))),
      integrity ? BS.el('div', { class: 'meter' }, [
        BS.el('div', { class: 'meter__row' }, [BS.el('span', { text: 'Integridad en tiempo real' }), value]),
        BS.el('div', { class: `bar bar--seg${integrity < 50 ? ' bar--red' : ''}` }, [fill]),
      ]) : null,
      BS.el('div', { class: 'modal__actions' }, [
        BS.el('a', { class: 'btn btn--primary', href: exp.dossier, text: 'Consultar expediente →' }),
        BS.favButton({ id: exp.id, type: 'experiment', title: `${exp.id} · ${exp.name}`, href: 'experiments.html' }),
      ]),
    ]);

    const body = BS.el('div', { class: 'qv' }, [
      BS.el('div', { class: 'qv__media scan' }, [
        BS.el('div', { class: `visual visual--${exp.visual}`, role: 'img', 'aria-label': exp.name }),
        BS.el('div', { class: 'hud-frame', 'aria-hidden': 'true' }),
        BS.el('div', { class: 'crosshair', 'aria-hidden': 'true' }),
      ]),
      info,
    ]);

    const off = BS.on('state:update', (s) => {
      const v = s.integrity[exp.id];
      if (!v) return;
      fill.style.setProperty('--value', `${v}%`);
      value.textContent = `${v.toFixed(1)}%`;
    });
    BS.ui.modal({ kicker: `Vista rápida · ${exp.id}`, body, raw: true, wide: true, onClose: off });
  };

  /* ---------- Mejora de cada tarjeta ---------- */
  const enhanceCard = (card) => {
    const exp = expFor(card);
    if (!exp) return;
    const top = BS.$('.xcard__top', card);
    const firstTag = top.firstElementChild;
    const left = BS.el('div', { class: 'xcard__top-left' });
    top.prepend(left);
    left.append(firstTag, BS.favButton({ id: exp.id, type: 'experiment', title: `${exp.id} · ${exp.name}`, href: 'experiments.html' }));

    const foot = BS.$('.xcard__foot', card);
    const link = BS.$('a.btn', foot);
    const actions = BS.el('div', { style: 'display:flex;gap:.5rem;flex-wrap:wrap' });
    foot.append(actions);
    actions.append(
      BS.el('button', { type: 'button', class: 'btn btn--ghost btn--sm', text: 'Vista rápida', on: { click: () => quickView(exp) } }),
      link,
    );
    card.dataset.search = BS.normalize(`${exp.id} ${exp.name} ${exp.cls} ${exp.cell} ${exp.statusLabel} ${card.textContent}`);
  };

  /* ---------- Filtrado combinado ---------- */
  const apply = () => {
    const term = BS.normalize(search.value);
    const onlyFav = favChip.getAttribute('aria-pressed') === 'true';
    const radio = BS.$('.filters__input:checked');
    const rule = RADIO_RULES[radio ? radio.id : 'flt-all'] || (() => true);
    let visible = 0;

    cards.forEach((card) => {
      const exp = expFor(card);
      const show = (!term || card.dataset.search.includes(term)) && (!onlyFav || BS.favorites.has(exp.id));
      card.classList.toggle('is-filtered-out', !show);
      if (show && rule(card)) visible++;
    });
    countLabel.textContent = `EXP-INDEX // ${BS.pad(visible, 3)} entradas`;
    empty.hidden = visible > 0;
  };

  const sort = () => {
    const mode = sortSelect.value;
    const value = (card) => {
      const exp = expFor(card);
      if (mode === 'threat') return -exp.threat;
      if (mode === 'integrity') return BS.state.integrity[exp.id] ?? 0;
      return exp.id;
    };
    cards.slice().sort((a, b) => (value(a) > value(b) ? 1 : value(a) < value(b) ? -1 : 0)).forEach((c) => grid.append(c));
  };

  /* ---------- Experimento oculto EXP-005 ----------
     Se clona la tarjeta de EXP-003 tal como venía en el HTML (sin mejoras)
     y se rellena con los datos del experimento oculto. */
  let pristine = null;

  const revealHidden = (animate) => {
    if (!pristine || BS.$('[data-exp="EXP-005"]', grid)) return;
    const exp = BS.data.hiddenExperiment;
    const card = pristine.cloneNode(true);
    const set = (sel, text) => { const n = BS.$(sel, card); if (n) n.textContent = text; };
    card.dataset.exp = exp.id;
    card.dataset.threat = 'critical';
    card.dataset.breach = 'true';
    set('.xcard__id', exp.id);
    set('.xcard__name', exp.name);
    set('.xcard__desc', exp.summary);
    set('.xcard__top .tag', 'Sin ubicación');
    set('.xcard__stamp', 'Does not exist');
    BS.$('.threat', card).dataset.level = '5';
    const dds = BS.$$('.xcard__specs dd', card);
    dds[1].textContent = 'No registrado';
    dds[2].textContent = 'Desconocida';
    BS.$('.xcard__more dl', card).innerHTML = Object.entries(exp.facts).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    BS.$('.xcard__foot', card).innerHTML = `<span class="label"><span class="led led--red led--blink" aria-hidden="true"></span> Registro creado mañana</span><a class="btn btn--primary btn--sm" href="${exp.dossier}">Ver archivo <span class="btn__arrow" aria-hidden="true">→</span></a>`;
    BS.$('.xcard__media .visual', card).style.filter = 'grayscale(1) contrast(1.6) brightness(.6)';
    if (animate) card.style.animation = 'page-in 1s var(--ease-out)';
    grid.append(card);
    cards.push(card);
    enhanceCard(card);
    apply();
  };

  BS.register('database', {
    pages: ['database'],
    init() {
      grid = BS.$('.xgrid');
      const filters = BS.$('.filters');
      if (!grid || !filters) return;

      cards = BS.$$('.xcard', grid);
      cards.forEach((card) => { card.dataset.exp = BS.$('.xcard__id', card).textContent.trim(); });
      const base = cards.find((c) => c.dataset.exp === 'EXP-003');
      pristine = base ? base.cloneNode(true) : null;
      cards.forEach(enhanceCard);

      /* Barra de herramientas: buscador + orden + favoritos */
      search = BS.el('input', { class: 'search__input', type: 'search', placeholder: 'Buscar experimento', 'aria-label': 'Buscar experimento por nombre, ID o clase' });
      sortSelect = BS.el('select', { class: 'select', 'aria-label': 'Ordenar' }, [
        BS.el('option', { value: 'id', text: 'Orden: ID' }),
        BS.el('option', { value: 'threat', text: 'Orden: amenaza' }),
        BS.el('option', { value: 'integrity', text: 'Orden: contención' }),
      ]);
      favChip = BS.el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', text: '★ Favoritos' });
      countLabel = BS.$('.filters__count', filters);
      empty = BS.el('div', { class: 'empty-state', hidden: true }, [BS.el('strong', { text: 'Sin resultados' }), 'Ningún experimento coincide con la búsqueda']);
      grid.after(empty);

      const toolbar = BS.el('div', { class: 'toolbar' }, [
        BS.el('label', { class: 'search' }, [search, BS.el('span', { class: 'search__kbd', 'aria-hidden': 'true', text: '/' })]),
        sortSelect,
        favChip,
      ]);
      filters.before(toolbar);

      search.addEventListener('input', apply);
      sortSelect.addEventListener('change', () => { sort(); BS.store.set('dbSort', sortSelect.value); });
      favChip.addEventListener('click', () => {
        favChip.setAttribute('aria-pressed', String(favChip.getAttribute('aria-pressed') !== 'true'));
        apply();
      });
      BS.$$('.filters__input').forEach((r) => r.addEventListener('change', apply));
      BS.on('favorites:change', apply);

      document.addEventListener('keydown', (e) => {
        if (e.key === '/' && !BS.isTyping(e.target)) { e.preventDefault(); search.focus(); }
      });

      sortSelect.value = BS.store.get('dbSort', 'id');
      sort();
      if (BS.secrets.has('exp005')) revealHidden(false);
      BS.on('secret:unlocked', ({ id }) => id === 'exp005' && revealHidden(true));
      apply();
    },
  });
})();
