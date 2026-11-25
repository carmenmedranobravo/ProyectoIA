/* ==========================================================================
   BLACKSITE OS · main.js
   Punto de entrada. Se carga el último (defer) y arranca todos los módulos
   registrados que correspondan a la página actual (<body data-page="…">).
   ========================================================================== */
(() => {
  'use strict';
  if (!window.BS || !BS.start) return;
  BS.start();
})();
