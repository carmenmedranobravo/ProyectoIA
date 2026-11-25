/* ==========================================================================
   BLACKSITE OS · monitor.js
   Estado vivo de la instalación (BS.state) y panel de monitorización:
   - los valores evolucionan con un paseo aleatorio y se guardan por sesión,
   - cualquier elemento con data-bind se actualiza solo,
   - el registro de actividad del Mainframe recibe eventos en directo.
   Emite "state:update" en cada ciclo.
   ========================================================================== */
(() => {
  'use strict';

  const DEFAULT_STATE = {
    integrity: { 'EXP-001': 72, 'EXP-002': 41, 'EXP-003': 96, 'EXP-004': 58 },
    temps: { C3: -196.4, B12: -20.1, S09: 61.0, A01: 21.3, N7: 34.8 },
    power: [78, 56, 94, 42, 67, 31],
    battery: 64,
    personnel: 142,
    flags: { lightsOff: false, doorsOpen: false, commsDown: false, purge: false },
  };

  const saved = BS.session.get('state');
  const state = (BS.state = saved ? { ...DEFAULT_STATE, ...saved, flags: { ...DEFAULT_STATE.flags, ...saved.flags } } : structuredCloneSafe(DEFAULT_STATE));
  function structuredCloneSafe(obj) { return JSON.parse(JSON.stringify(obj)); }

  const warned = {};
  const fmtTemp = (t) => `${t < 0 ? '−' : t > 0 ? '+' : ''}${Math.abs(t).toFixed(1)}`;
  const tempToPct = (t) => BS.clamp(((t + 40) / 120) * 100, 2, 100);

  /** Cambia solo el primer nodo de texto (respeta <small>, <span> internos) */
  const setText = (el, text) => {
    const node = Array.from(el.childNodes).find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    const target = node || el;
    if (target.textContent === text) return;
    target.textContent = text;
    el.classList.remove('is-flash');
    void el.offsetWidth; // reinicia la animación
    el.classList.add('is-flash');
  };

  /* ---------- API pública ---------- */
  BS.monitor = {
    bump(exp, delta) {
      if (!(exp in state.integrity)) return;
      state.integrity[exp] = BS.clamp(state.integrity[exp] + delta, 5, 99);
      BS.monitor.render();
    },
    setFlag(flag, value) {
      state.flags[flag] = value;
      BS.session.set('state', state);
    },
    reset() {
      Object.assign(state.integrity, DEFAULT_STATE.integrity);
      Object.assign(state.temps, DEFAULT_STATE.temps);
      BS.monitor.render();
    },
    average: () => {
      const v = Object.values(state.integrity);
      return v.reduce((a, b) => a + b, 0) / v.length;
    },
    log: () => {},   // se reemplaza si la página tiene registro de actividad
    render: () => {},
  };

  /* ---------- Simulación ---------- */
  const step = () => {
    Object.keys(state.integrity).forEach((id) => {
      let drift = BS.rand(-0.7, 0.7);
      if (id === 'EXP-002') drift -= 0.05;                                  // el Vacío siempre empeora un poco
      if (id === 'EXP-001' && state.flags.lightsOff) drift -= 1.2;          // sin luz, el Organismo crece
      if (state.integrity[id] < 30) drift += 0.6;                           // los sistemas compensan
      state.integrity[id] = BS.clamp(state.integrity[id] + drift, 5, 99);
    });
    Object.keys(state.temps).forEach((k) => {
      const range = k === 'C3' ? 0.15 : 0.6;
      const target = DEFAULT_STATE.temps[k];
      state.temps[k] += BS.rand(-range, range) + (target - state.temps[k]) * 0.05;
    });
    state.power = state.power.map((p) => BS.clamp(p + BS.rand(-6, 6), 15, 100));
    state.battery = BS.clamp(state.battery + BS.rand(-0.4, 0.3), 20, 100);
    if (Math.random() < 0.1) state.personnel += BS.pick([-1, 1]);
    BS.session.set('state', state);

    /* Aviso automático si una celda baja del umbral crítico */
    Object.entries(state.integrity).forEach(([id, v]) => {
      if (v < 35 && !warned[id]) {
        warned[id] = true;
        BS.notify({ level: 'crit', title: `Contención crítica · ${id}`, msg: `Integridad ${v.toFixed(0)}%. Umbral de seguridad: 35%.`, action: { label: 'Panel de control', href: 'control.html' } });
        BS.monitor.log('CRIT', `${id} — integridad por debajo del umbral (${v.toFixed(0)}%)`, 'crit');
      }
      if (v > 40) warned[id] = false;
    });

    BS.monitor.render();
    BS.emit('state:update', state);
  };

  /* ---------- Enlace con el DOM ---------- */
  const bindDom = () => {
    const q = (sel) => BS.$$(sel);
    BS.monitor.render = () => {
      q('[data-bind="integrity"]').forEach((el) => setText(el, `${Math.round(state.integrity[el.dataset.exp])}%`));
      q('[data-bind="integrity-bar"]').forEach((el) => el.style.setProperty('--value', `${state.integrity[el.dataset.exp].toFixed(1)}%`));
      q('[data-bind="gauge"]').forEach((el) => {
        const v = Math.round(state.integrity[el.dataset.exp]);
        el.style.setProperty('--value', v);
        const val = el.querySelector('.gauge__val');
        if (val) setText(val, String(v));
      });
      q('[data-bind="integrity-avg"]').forEach((el) => setText(el, BS.monitor.average().toFixed(1)));
      q('[data-bind="personnel"]').forEach((el) => setText(el, String(state.personnel)));
      q('[data-bind="temp"]').forEach((el) => setText(el, `${fmtTemp(state.temps[el.dataset.key])}${el.dataset.unit || ''}`));
      q('[data-bind="temp-bar"]').forEach((el) => el.style.setProperty('--value', `${tempToPct(state.temps[el.dataset.key])}%`));
      q('[data-bind="power-col"]').forEach((el, i) => el.style.setProperty('--h', `${state.power[i].toFixed(0)}%`));
      q('[data-bind="power-total"]').forEach((el) => setText(el, `PWR // ${Math.round(state.power.reduce((a, b) => a + b, 0) * 1.1)} MW`));
      q('[data-bind="battery"]').forEach((el) => setText(el, `${Math.round(state.battery)}%`));
      q('[data-bind="battery-bar"]').forEach((el) => el.style.setProperty('--value', `${state.battery.toFixed(1)}%`));
    };
  };

  /* ---------- Registro de actividad en directo ---------- */
  const LOG_TEMPLATES = [
    () => ['CTN', `Celda B-12 — presión interna ${BS.rand(1.9, 2.3).toFixed(1)} bar`],
    () => ['SYS', `Respaldo incremental completado — ${BS.rand(0.2, 3.9).toFixed(1)} TB`],
    () => ['NET', `Enlace AURORA-2 — latencia ${BS.randInt(3, 9)} ms`],
    () => ['CAM', `Cámara ${BS.randInt(2, 48)} — sin novedad`],
    () => ['AUTH', `Puerta ${BS.randInt(1, 9)}-${BS.pick(['A', 'B', 'C'])} — acceso autorizado (${BS.randInt(1000, 9999)}-${BS.pick(['K', 'B', 'M'])})`],
    () => ['MED', `Constantes del personal del nivel −7 dentro de rango`],
    () => ['WARN', `Sector 09 — deriva temporal de +0.00${BS.randInt(1, 9)} s`, 'warn'],
    () => ['CTN', `EXP-003 solicita papel y lápiz. Petición denegada.`],
  ];

  const bindLog = () => {
    const feed = BS.$('.monitor__feed');
    if (!feed) return;
    BS.$$('[aria-hidden="true"]', feed).forEach((n) => n.remove()); // fuera el duplicado del scroll CSS
    feed.setAttribute('aria-live', 'polite');

    BS.monitor.log = (tag, msg, level = '') => {
      const tagEl = level ? BS.el('em', { text: tag }) : BS.el('b', { text: tag });
      const line = BS.el('p', { class: 'monitor__line is-new' }, [BS.el('time', { text: BS.time() }), BS.el('span', {}, [tagEl, ` ${msg}`])]);
      feed.prepend(line);
      Array.from(feed.children).slice(14).forEach((n) => n.remove());
    };

    const schedule = () => setTimeout(() => {
      const [tag, msg, level] = BS.pick(LOG_TEMPLATES)();
      BS.monitor.log(tag, msg, level);
      schedule();
    }, BS.rand(3500, 7500));
    schedule();

    BS.on('notify', (n) => {
      if (n.level === 'warn' || n.level === 'crit') BS.monitor.log(n.level === 'crit' ? 'CRIT' : 'WARN', n.title || n.msg, n.level);
    });
  };

  BS.register('monitor', {
    init() {
      bindDom();
      bindLog();
      BS.monitor.render();
      setInterval(step, 2200);
    },
  });
})();
