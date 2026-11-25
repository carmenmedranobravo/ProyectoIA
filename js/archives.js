/* ==========================================================================
   BLACKSITE OS · archives.js           (página: archives.html)
   - Buscador de texto completo y filtro por categorías.
   - Descifrado de expedientes LCK-01/02 con animación y memoria (localStorage).
   - Expedientes sellados LCK-03/04: se abren con códigos secretos.
   ========================================================================== */
(() => {
  'use strict';

  const SEALED = {
    espejo: {
      index: 2,
      html: `<h4>LCK-03 · Proyecto ESPEJO</h4>
        <p>Objetivo: reproducir artificialmente las capacidades de EXP-003. Resultado: 14 sujetos de prueba. Los 14 afirman ser el Dr. M. Voss.</p>
        <p class="text-red">Nota del Consejo: comprobar que el operador de la terminal T-01 es el original.</p>`,
    },
    exp005: {
      index: 3,
      html: `<h4>LCK-04 · EXP-005 · The Echo</h4>
        <p>Registro creado el 14.11.2047 desde la terminal T-01. Contenido: "Lo que bajó al nivel −7 a las 03:00 no es lo mismo que subió".</p>
        <p class="text-red">El experimento ya aparece en la base de datos.</p>`,
    },
  };

  const HEX = '0123456789ABCDEF';
  const scramble = (el, ms = 900) => new Promise((resolve) => {
    const original = el.innerHTML;
    const length = el.textContent.length;
    el.classList.add('is-scrambling');
    const timer = setInterval(() => {
      el.textContent = Array.from({ length: Math.min(length, 240) }, () => HEX[BS.randInt(0, 15)]).join('');
    }, 50);
    setTimeout(() => {
      clearInterval(timer);
      el.innerHTML = original;
      el.classList.remove('is-scrambling');
      resolve();
    }, ms);
  });

  /* ---------- Buscador y categorías ---------- */
  const initSearch = () => {
    const column = BS.$('.arch-layout > div');
    if (!column) return;
    const sections = BS.$$('.arch-section', column);
    const itemsOf = (section) => BS.$$('.paper, .photo, .locked, .expand:not(.folder)', section);

    const input = BS.el('input', { class: 'search__input', type: 'search', placeholder: 'Buscar en el archivo', 'aria-label': 'Buscar en el archivo clasificado' });
    const count = BS.el('span', { class: 'label', text: '' });
    const chips = [['all', 'Todo'], ['documents', 'Documentos'], ['photos', 'Fotografías'], ['logs', 'Registros'], ['locked', 'Bloqueados']]
      .map(([cat, label]) => BS.el('button', { type: 'button', class: 'chip', 'aria-pressed': String(cat === 'all'), dataset: { cat }, text: label }));
    const empty = BS.el('div', { class: 'empty-state', hidden: true }, [BS.el('strong', { text: 'Sin resultados' }), 'Ningún archivo coincide con la búsqueda']);
    column.prepend(BS.el('div', { class: 'toolbar' }, [BS.el('label', { class: 'search' }, [input]), ...chips, count]));
    column.append(empty);

    let category = 'all';
    const apply = () => {
      const term = BS.normalize(input.value);
      let total = 0;
      sections.forEach((section) => {
        const inCategory = category === 'all' || section.id === category;
        let found = 0;
        itemsOf(section).forEach((item) => {
          const match = !term || BS.normalize(item.textContent).includes(term);
          item.classList.toggle('is-filtered-out', !match);
          item.classList.toggle('is-match', !!term && match);
          if (match) found++;
        });
        /* Carpetas: visibles si contienen algo; se abren solas al buscar */
        BS.$$('.folder', section).forEach((folder) => {
          const hits = BS.$$('.paper:not(.is-filtered-out)', folder).length;
          const nameHit = term && BS.normalize(BS.$('summary', folder).textContent).includes(term);
          folder.classList.toggle('is-filtered-out', !!term && !hits && !nameHit);
          if (term && (hits || nameHit)) folder.open = true;
        });
        const show = inCategory && found > 0;
        section.classList.toggle('is-filtered-out', !show);
        if (show) total += found;
      });
      count.textContent = `${BS.pad(total, 2)} resultado${total === 1 ? '' : 's'}`;
      empty.hidden = total > 0;
    };

    input.addEventListener('input', apply);
    chips.forEach((chip) => chip.addEventListener('click', () => {
      category = chip.dataset.cat;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      apply();
    }));
    /* El índice lateral selecciona también la categoría */
    BS.$$('.arch-nav a').forEach((a) => a.addEventListener('click', () => {
      const chip = chips.find((c) => `#${c.dataset.cat}` === a.getAttribute('href'));
      if (chip && category !== 'all') chip.click();
    }));
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !BS.isTyping(e.target)) { e.preventDefault(); input.focus(); }
    });
    apply();
  };

  /* ---------- Descifrado (LCK-01 / LCK-02) ---------- */
  const initDecrypt = () => {
    const done = new Set(BS.store.get('decrypted', []));
    BS.$$('.locked__toggle').forEach((toggle) => {
      const content = BS.$('.locked__content', toggle.closest('.locked'));
      if (done.has(toggle.id)) toggle.checked = true;
      toggle.addEventListener('change', async () => {
        if (!toggle.checked) return;
        BS.sfx.play('beep');
        await scramble(content, 950);
        BS.sfx.play('unlock');
        done.add(toggle.id);
        BS.store.set('decrypted', [...done]);
        BS.notify({ level: 'ok', title: 'Expediente descifrado', msg: BS.$('h4', content).textContent, timeout: 3500 });
      });
    });
  };

  /* ---------- Expedientes sellados (LCK-03 / LCK-04) ---------- */
  const initSealed = () => {
    const cards = BS.$$('.locked');
    const open = (id, animate) => {
      const conf = SEALED[id];
      const card = cards[conf.index];
      if (!card || card.classList.contains('is-unsealed')) return;
      const content = BS.$('.locked__content', card);
      content.innerHTML = conf.html;
      card.classList.add('is-unsealed');
      if (animate) scramble(content, 1100);
    };

    Object.entries(SEALED).forEach(([id, conf]) => {
      const card = cards[conf.index];
      if (!card) return;
      if (BS.secrets.has(id)) { open(id, false); return; }
      const veil = BS.$('.locked__veil', card);
      const old = BS.$('.btn--locked', veil);
      if (old) old.remove();
      veil.append(BS.el('button', {
        type: 'button', class: 'btn btn--sm locked__code', text: 'Introducir código',
        on: {
          click: () => BS.secrets.prompt({
            kicker: `Expediente sellado · ${BS.$('h4', card).textContent.split('·')[0].trim()}`,
            title: 'Sellado · <span class="text-red">nivel 5</span>',
            text: id === 'espejo'
              ? 'Código de operador requerido. <span class="muted">Pista: aparece en la barra superior de todas las pantallas.</span>'
              : 'Código temporal requerido. <span class="muted">Pista: la hora a la que amanece en el nivel −7.</span>',
            expected: id,
            onSuccess: () => open(id, true),
          }),
        },
      }));
    });
    BS.on('secret:unlocked', ({ id }) => SEALED[id] && open(id, true));
  };

  BS.register('archives', {
    pages: ['archives'],
    init() {
      initSearch();
      initDecrypt();
      initSealed();
    },
  });
})();
