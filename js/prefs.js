/* ==========================================================================
   BLACKSITE OS · prefs.js
   Preferencias del operador y favoritos, guardados en localStorage.
   Emite "prefs:change" ({ key, value }) y "favorites:change".
   ========================================================================== */
(() => {
  'use strict';

  const DEFAULTS = {
    sound: false,     // efectos de sonido (desactivados por defecto)
    volume: 0.5,      // 0 – 1
    cursor: true,     // cursor personalizado en escritorio
    fx: true,         // scanlines y viñeta CRT
    events: true,     // eventos aleatorios de anomalías
    boot: 'once',     // secuencia de arranque: 'once' | 'always' | 'never'
  };

  let prefs = { ...DEFAULTS, ...BS.store.get('prefs', {}) };

  const applyClasses = () => {
    document.documentElement.classList.toggle('no-fx', !prefs.fx);
  };
  applyClasses();

  BS.prefs = {
    defaults: DEFAULTS,
    get: (key) => prefs[key],
    all: () => ({ ...prefs }),
    set(key, value) {
      prefs[key] = value;
      BS.store.set('prefs', prefs);
      applyClasses();
      BS.emit('prefs:change', { key, value });
    },
    reset() {
      prefs = { ...DEFAULTS };
      BS.store.set('prefs', prefs);
      applyClasses();
      Object.keys(prefs).forEach((key) => BS.emit('prefs:change', { key, value: prefs[key] }));
    },
  };

  /* ---------- Favoritos ----------
     Cada favorito: { id, type: 'experiment' | 'incident', title, href } */
  let favorites = BS.store.get('favorites', []);

  BS.favorites = {
    list: () => favorites.slice(),
    has: (id) => favorites.some((f) => f.id === id),
    toggle(item) {
      if (BS.favorites.has(item.id)) favorites = favorites.filter((f) => f.id !== item.id);
      else favorites.push(item);
      BS.store.set('favorites', favorites);
      BS.emit('favorites:change', favorites);
      return BS.favorites.has(item.id);
    },
    clear() {
      favorites = [];
      BS.store.set('favorites', favorites);
      BS.emit('favorites:change', favorites);
    },
  };

  /** Crea un botón ★ ligado a un favorito */
  BS.favButton = (item, extraClass = '') => {
    const btn = BS.el('button', {
      type: 'button',
      class: `fav-btn ${extraClass}`.trim(),
      'aria-label': `Marcar ${item.title} como favorito`,
      'aria-pressed': String(BS.favorites.has(item.id)),
      text: '★',
      on: {
        click: (e) => {
          e.preventDefault();
          e.stopPropagation();
          const on = BS.favorites.toggle(item);
          btn.setAttribute('aria-pressed', String(on));
          if (BS.sfx) BS.sfx.play(on ? 'confirm' : 'click');
          if (BS.notify) BS.notify({ level: 'info', title: on ? 'Añadido a favoritos' : 'Eliminado de favoritos', msg: item.title, timeout: 2500, log: false });
        },
      },
    });
    BS.on('favorites:change', () => btn.setAttribute('aria-pressed', String(BS.favorites.has(item.id))));
    return btn;
  };
})();
