/* ==========================================================================
   BLACKSITE OS · clock.js
   Reloj digital en tiempo real (UTC) en la metabarra de todas las páginas.
   El año se fija en 2047 para mantener la ficción del sistema.
   También mantiene el contador "Actualizado hace" del Mainframe.
   ========================================================================== */
(() => {
  'use strict';

  const YEAR = 2047;

  const stamp = (d) => `${BS.pad(d.getUTCDate())}.${BS.pad(d.getUTCMonth() + 1)}.${YEAR} — ${BS.time(d)} UTC`;
  const scrambled = () => stamp(new Date()).replace(/\d/g, () => BS.randInt(0, 9));

  BS.register('clock', {
    init() {
      const targets = BS.$$('[data-clock]');
      const ago = BS.$('[data-updated]');
      let glitchUntil = 0;
      let lastUpdate = Date.now();

      const tick = () => {
        const now = Date.now();
        const text = now < glitchUntil ? scrambled() : stamp(new Date(now));
        targets.forEach((t) => { t.textContent = text; });
        if (ago) {
          const s = Math.floor((now - lastUpdate) / 1000);
          ago.textContent = `Actualizado hace ${BS.pad(Math.floor(s / 3600))}:${BS.pad(Math.floor(s / 60) % 60)}:${BS.pad(s % 60)}`;
        }
      };

      tick();
      /* Alineado al segundo para que no "salte" */
      setTimeout(() => { tick(); setInterval(tick, 1000); }, 1000 - (Date.now() % 1000));

      BS.on('state:update', () => { lastUpdate = Date.now(); });
      /* Anomalía temporal: el reloj se vuelve loco durante unos segundos */
      BS.on('anomaly:time', (ms = 3000) => { glitchUntil = Date.now() + ms; });

      BS.clock = { stamp: () => stamp(new Date()) };
    },
  });
})();
