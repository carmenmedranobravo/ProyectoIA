/* ==========================================================================
   BLACKSITE OS · dossier.js            (página: dossier.html)
   - Convierte las 4 secciones del expediente en pestañas accesibles
     (ratón, flechas del teclado, enlaces #ancla) y recuerda la última.
   - Documento clasificado "Autopsias INC-2046-0031": se desbloquea con código.
   ========================================================================== */
(() => {
  'use strict';

  const AUTOPSY_HTML = `
    <div class="prose">
      <p><strong>Informe forense FX-0031 · Dr. P. Salo · 19.03.2046</strong></p>
      <p>Víctimas: J. Arenas, T. Nakamura, L. Ferreira. Ninguna presenta heridas externas. La actividad eléctrica cerebral persistió <strong>41 horas</strong> después de la muerte clínica, con un patrón idéntico al registrado en EXP-001.</p>
      <p>El tejido cerebral de las tres víctimas había sido sustituido por material coloidal del espécimen, organizado con la forma exacta del órgano original. El micrófono de la sala de autopsias registró la voz de J. Arenas durante el examen: <em>"Hace frío aquí dentro"</em>.</p>
      <p class="text-red">Recomendación: incinerar los restos. Estado: recomendación denegada por el Consejo.</p>
    </div>`;

  BS.register('dossier', {
    pages: ['dossier'],
    init() {
      const main = BS.$('.dossier-main');
      if (!main) return;
      const blocks = BS.$$('.dossier-block', main);

      /* ---------- Pestañas ---------- */
      const tablist = BS.el('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Secciones del expediente' });
      const tabs = blocks.map((block, i) => {
        const h3 = BS.$('h3', block);
        const num = BS.$('span', h3).textContent;
        const title = h3.textContent.replace(num, '').trim();
        block.id = block.id || `panel-${h3.id}`;
        block.classList.add('is-tab');
        block.setAttribute('role', 'tabpanel');
        block.setAttribute('aria-labelledby', `tab-${i}`);
        block.tabIndex = -1;
        return BS.el('button', {
          type: 'button', class: 'tabs__btn', role: 'tab', id: `tab-${i}`,
          'aria-controls': block.id, 'aria-selected': 'false', tabindex: '-1',
          dataset: { anchor: h3.id },
        }, [BS.el('span', { text: num }), title]);
      });
      tablist.append(...tabs);
      main.prepend(tablist);

      const select = (index, { focus = false, save = true } = {}) => {
        tabs.forEach((tab, i) => {
          const on = i === index;
          tab.setAttribute('aria-selected', String(on));
          tab.tabIndex = on ? 0 : -1;
          blocks[i].hidden = !on;
        });
        if (focus) tabs[index].focus();
        if (save) BS.store.set('dossierTab', index);
      };

      tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));
      tablist.addEventListener('keydown', (e) => {
        const current = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
        const keys = { ArrowRight: 1, ArrowLeft: -1, Home: -current, End: tabs.length - 1 - current };
        if (!(e.key in keys)) return;
        e.preventDefault();
        select((current + keys[e.key] + tabs.length) % tabs.length, { focus: true });
      });

      /* Los enlaces a #d-desc, #d-docs… abren su pestaña */
      const fromHash = () => {
        const i = tabs.findIndex((t) => `#${t.dataset.anchor}` === location.hash);
        if (i >= 0) { select(i); tablist.scrollIntoView({ block: 'start' }); return true; }
        return false;
      };
      if (!fromHash()) select(BS.clamp(BS.store.get('dossierTab', 0), 0, tabs.length - 1), { save: false });
      window.addEventListener('hashchange', fromHash);

      /* ---------- Documento desbloqueable ---------- */
      const lockedBtn = BS.$('a[href="#doc-locked"]');
      if (!lockedBtn) return;
      const details = lockedBtn.closest('details');
      const body = lockedBtn.closest('.expand__body');

      const unlockDoc = (animate) => {
        details.classList.add('doc-unlocked');
        BS.$$('.doc-icon--locked', details).forEach((i) => i.classList.remove('doc-icon--locked'));
        const name = BS.$('.doc-row__name small', details);
        if (name) name.textContent = '3 archivos · Desbloqueado con código';
        body.innerHTML = AUTOPSY_HTML;
        details.open = true;
        if (animate) body.classList.add('is-flash');
      };

      if (BS.secrets.has('autopsias')) unlockDoc(false);
      else {
        lockedBtn.textContent = 'Introducir código';
        lockedBtn.addEventListener('click', (e) => {
          e.preventDefault();
          BS.secrets.prompt({
            kicker: 'Documento CLR-5 · Autopsias',
            title: 'Acceso <span class="text-red">restringido</span>',
            text: 'Introduzca el código de autorización del expediente. <span class="muted">Pista: el apellido del técnico que oyó su propia voz.</span>',
            expected: 'autopsias',
            onSuccess: () => unlockDoc(true),
          });
        });
      }
      BS.on('secret:unlocked', ({ id }) => id === 'autopsias' && unlockDoc(true));
    },
  });
})();
