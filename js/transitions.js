/* ==========================================================================
   BLACKSITE OS · transitions.js
   Transiciones cinematográficas entre páginas: un obturador se cierra con el
   nombre del módulo de destino y se abre al cargar la página nueva.
   Solo actúa en enlaces internos a otra página (.html) sin modificadores.
   ========================================================================== */
(() => {
  'use strict';

  const build = () => {
    const label = BS.el('div', { class: 'shutter__label' }, [
      BS.el('span', { text: 'Accediendo a módulo' }),
      BS.el('strong', { text: '' }),
      BS.el('div', { class: 'bar' }, [BS.el('span', { class: 'bar__fill' })]),
    ]);
    const shutter = BS.el('div', { class: 'shutter', 'aria-hidden': 'true' }, [
      BS.el('div', { class: 'shutter__half shutter__half--top' }),
      BS.el('div', { class: 'shutter__half shutter__half--bottom' }),
      label,
    ]);
    document.body.append(shutter);
    return { shutter, title: label.querySelector('strong') };
  };

  const pageFor = (url) => {
    const file = url.pathname.split('/').pop() || 'index.html';
    return BS.data.pages.find((p) => p.file === file);
  };

  BS.register('transitions', {
    init() {
      const { shutter, title } = build();
      const root = document.documentElement;

      /* --- Entrada: venimos de otra página --- */
      const incoming = BS.session.get('transition');
      if (incoming) {
        BS.session.remove('transition');
        title.textContent = incoming;
        shutter.classList.add('is-closed');
        root.classList.remove('is-entering');
        requestAnimationFrame(() => requestAnimationFrame(() => {
          setTimeout(() => shutter.classList.remove('is-closed'), 180);
        }));
        BS.sfx.play('whoosh');
      }

      if (BS.reducedMotion) return;

      /* --- Salida: interceptamos enlaces internos --- */
      document.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const link = e.target.closest('a[href]');
        if (!link || link.target || link.hasAttribute('download')) return;

        const url = new URL(link.href, location.href);
        if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
        const samePage = url.pathname === location.pathname;
        if (samePage) return; // anclas en la misma página: comportamiento normal (:target)

        const page = pageFor(url);
        e.preventDefault();
        const label = page ? `${page.num} // ${page.name}` : 'Módulo';
        title.textContent = label;
        BS.session.set('transition', label);
        shutter.classList.add('is-closed');
        BS.sfx.play('whoosh');
        setTimeout(() => { location.href = url.href; }, 620);
      });

      /* Al volver con el botón "atrás" (bfcache) el obturador no debe quedarse cerrado */
      window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
          shutter.classList.remove('is-closed');
          BS.session.remove('transition');
        }
      });
    },
  });
})();
