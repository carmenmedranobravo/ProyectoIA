/* ==========================================================================
   BLACKSITE OS · anomalies.js
   Eventos aleatorios: interferencias, apagones, fallos de contención,
   anomalías temporales y contactos no identificados.
   Se activan tras el arranque cada 25–55 s (si la preferencia lo permite)
   y pueden lanzarse a mano: BS.anomalies.trigger('interference').
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  let noiseLayer = null;
  let timer = null;

  const flashClass = (cls, ms) => {
    if (BS.reducedMotion) return;
    root.classList.remove(cls);
    void root.offsetWidth;
    root.classList.add(cls);
    setTimeout(() => root.classList.remove(cls), ms);
  };

  const EVENTS = {
    interference() {
      const sector = BS.pick(['S-02', 'S-06', 'S-09', 'S-11', 'N −7']);
      flashClass('fx-interference', 950);
      BS.sfx.play('glitch');
      BS.notify({ level: 'warn', title: 'Interferencia electromagnética', msg: `Origen probable: ${sector}. Los sensores se recalibran.` });
    },
    blackout() {
      flashClass('fx-blackout', 1450);
      BS.sfx.play('glitch');
      BS.notify({ level: 'warn', title: 'Caída de tensión', msg: 'Microcorte de 1,4 s en la red principal. Generadores auxiliares en línea.' });
    },
    containment() {
      const exp = BS.pick(BS.data.experiments);
      const drop = BS.rand(4, 11);
      BS.monitor.bump(exp.id, -drop);
      flashClass('fx-interference', 600);
      BS.notify({
        level: 'crit',
        title: `Fallo de contención · ${exp.id}`,
        msg: `${exp.name}: integridad −${drop.toFixed(1)}% en ${exp.cell}.`,
        action: { label: 'Ir al panel de control', href: 'control.html' },
      });
    },
    temporal() {
      BS.emit('anomaly:time', 3500);
      BS.notify({ level: 'warn', title: 'Anomalía temporal', msg: 'Los relojes de la instalación se han desincronizado. Origen: EXP-002.' });
    },
    contact() {
      BS.notify({ level: 'info', title: 'Contacto no identificado', msg: `Radar de perímetro: señal UNK-${BS.randInt(10, 99)} a ${BS.rand(0.4, 3.1).toFixed(1)} km. Desaparece tras ${BS.randInt(2, 9)} s.` });
    },
    voice() {
      BS.notify({ level: 'warn', title: 'Audio no autorizado · B-12', msg: 'El micrófono interno registra una voz que pide abrir la puerta. Ignórela.' });
    },
  };
  const WEIGHTED = ['interference', 'interference', 'blackout', 'containment', 'containment', 'temporal', 'contact', 'voice'];

  const schedule = (delay = BS.rand(25000, 55000)) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (BS.prefs.get('events') && !document.hidden) BS.anomalies.trigger(BS.pick(WEIGHTED));
      schedule();
    }, delay);
  };

  BS.anomalies = {
    types: Object.keys(EVENTS),
    trigger(type) {
      const fn = EVENTS[type];
      if (!fn) return false;
      fn();
      BS.emit('anomaly', { type });
      return true;
    },
  };

  BS.register('anomalies', {
    init() {
      noiseLayer = BS.el('div', { class: 'fx-noise', 'aria-hidden': 'true' });
      document.body.append(noiseLayer);
      const start = () => schedule(BS.rand(14000, 24000));
      if (BS.booted) start(); else BS.on('boot:done', start);
    },
  });
})();
