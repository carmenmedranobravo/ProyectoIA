/* ==========================================================================
   BLACKSITE OS · cursor.js
   Cursor táctico para escritorio: anillo con inercia, punto rojo y
   coordenadas. Crece sobre elementos interactivos.
   Solo con ratón (pointer: fine), respeta "reducir movimiento" y la preferencia.
   ========================================================================== */
(() => {
  'use strict';

  const INTERACTIVE = 'a, button, label, summary, select, input, [tabindex]:not([tabindex="-1"]), .map__sector';

  BS.register('cursor', {
    init() {
      if (!BS.finePointer || BS.reducedMotion) return;

      const root = document.documentElement;
      const ring = BS.el('span', { class: 'cursor__ring' });
      const dot = BS.el('span', { class: 'cursor__dot' });
      const label = BS.el('span', { class: 'cursor__label' });
      const cursor = BS.el('div', { class: 'cursor', 'aria-hidden': 'true' }, [ring, dot, label]);
      document.body.append(cursor);

      let x = -100, y = -100, rx = -100, ry = -100;
      let running = false;

      const loop = () => {
        rx += (x - rx) * 0.2;
        ry += (y - ry) * 0.2;
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        label.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        if (running) requestAnimationFrame(loop);
      };

      const onMove = (e) => {
        x = e.clientX;
        y = e.clientY;
        label.textContent = `X${BS.pad(Math.round(x), 4)} Y${BS.pad(Math.round(y), 4)}`;
        root.classList.add('cursor-in');
      };
      const onOver = (e) => cursor.classList.toggle('is-hover', !!e.target.closest(INTERACTIVE));
      const onDown = () => cursor.classList.add('is-down');
      const onUp = () => cursor.classList.remove('is-down');
      const onLeave = () => root.classList.remove('cursor-in');

      const enable = () => {
        if (running) return;
        running = true;
        root.classList.add('has-cursor');
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseover', onOver);
        document.addEventListener('mousedown', onDown);
        document.addEventListener('mouseup', onUp);
        document.documentElement.addEventListener('mouseleave', onLeave);
        requestAnimationFrame(loop);
      };
      const disable = () => {
        running = false;
        root.classList.remove('has-cursor', 'cursor-in');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseover', onOver);
        document.removeEventListener('mousedown', onDown);
        document.removeEventListener('mouseup', onUp);
        document.documentElement.removeEventListener('mouseleave', onLeave);
      };

      if (BS.prefs.get('cursor')) enable();
      BS.on('prefs:change', ({ key, value }) => {
        if (key === 'cursor') (value ? enable : disable)();
      });
    },
  });
})();
