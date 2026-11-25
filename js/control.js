/* ==========================================================================
   BLACKSITE OS · control.js            (página: control.html)
   - Selector de modo (Normal / Alerta / Lockdown) conectado a BS.alarm.
   - Reconocimiento (ACK) real de alarmas.
   - Botones de acción con estado "ocupado" y efectos sobre el sistema.
   - Interruptores conectados al estado de la instalación.
   - Botón del Protocolo Omega (requiere la llave del Director).
   - Mapa interactivo: selección de sector, cámara, sellado y envío de equipos.
   ========================================================================== */
(() => {
  'use strict';

  let lastAction = null;
  const setLast = (text) => {
    if (lastAction) lastAction.textContent = `Última acción: ${text} · ${BS.time()}`;
    BS.monitor.log('CTRL', text);
  };

  /** Ejecuta una acción con barra de progreso dentro del botón */
  const busy = async (btn, ms, label) => {
    const original = btn.innerHTML;
    btn.classList.add('is-busy');
    btn.style.setProperty('--busy', `${ms}ms`);
    btn.textContent = label;
    await BS.wait(ms);
    btn.classList.remove('is-busy');
    btn.innerHTML = original;
  };

  /* ---------- Mapa ---------- */
  const CAMERAS = { 'S-02': 'organism', 'S-08': 'subject', 'S-01': 'photo-2', 'C-0': 'photo-1', ASC: 'photo-1', 'S-11': 'photo-5', 'S-05': 'photo-5' };

  const sectorCode = (sector) => BS.$('strong', sector).textContent.split('·')[0].replace('Corredor central', '').trim() || 'C-0';

  const openCamera = (sector) => {
    const code = sectorCode(sector);
    const lost = sector.classList.contains('map__sector--breach');
    const visual = CAMERAS[code] || 'photo-3';
    const body = BS.el('div', {}, [
      BS.el('div', { class: 'cam' }, [
        lost ? null : BS.el('div', { class: `visual visual--${visual}`, role: 'img', 'aria-label': `Imagen de la cámara del sector ${code}` }),
        BS.el('div', { class: 'cam__noise', 'aria-hidden': 'true' }),
        BS.el('div', { class: 'cam__osd' }, [
          BS.el('div', {}, [BS.el('span', { text: `CAM-${code}-0${BS.randInt(1, 4)}` }), BS.el('span', { class: 'text-red blink', text: '● REC' })]),
          BS.el('div', {}, [BS.el('span', { text: BS.clock ? BS.clock.stamp() : BS.time() }), BS.el('span', { text: '×1.0 · IR' })]),
        ]),
        lost ? BS.el('div', { class: 'cam__lost', text: 'Señal perdida' }) : null,
      ]),
      BS.el('p', { class: 'muted mono-small', style: 'margin-top:1rem', text: lost
        ? 'La cámara del Sector 09 dejó de transmitir a las 03:14:09. El último fotograma muestra el pasillo más largo que el anterior.'
        : 'Transmisión en directo. La imagen puede contener artefactos por interferencias.' }),
    ]);
    BS.ui.modal({ kicker: `Cámara de seguridad · ${code}`, title: BS.$('strong', sector).textContent, body, wide: true });
    if (lost) BS.sfx.play('glitch');
  };

  const initMap = () => {
    const map = BS.$('.map');
    if (!map) return;
    const sectors = BS.$$('.map__sector', map);
    const legend = BS.$('.map-legend');

    const name = BS.el('p', { class: 'map-detail__name', text: 'Seleccione un sector' });
    const text = BS.el('p', { class: 'map-detail__text', text: 'Haga clic o pulse Enter sobre cualquier sector del mapa para ver su estado y actuar sobre él.' });
    const meta = BS.el('div', { class: 'map-detail__meta' });
    const camBtn = BS.el('button', { type: 'button', class: 'btn btn--sm', text: 'Ver cámara', disabled: true });
    const sealBtn = BS.el('button', { type: 'button', class: 'btn btn--sm', text: 'Sellar sector', disabled: true });
    const teamBtn = BS.el('button', { type: 'button', class: 'btn btn--sm btn--primary', text: 'Enviar equipo', disabled: true });
    const panel = BS.el('div', { class: 'map-detail', 'aria-live': 'polite' }, [
      BS.el('div', {}, [BS.el('span', { class: 'label', text: 'Sector seleccionado' }), name, text, meta]),
      BS.el('div', { class: 'map-detail__actions' }, [camBtn, sealBtn, teamBtn]),
    ]);
    legend.after(panel);

    let current = null;
    const refresh = () => {
      if (!current) return;
      const tags = [];
      if (current.classList.contains('map__sector--breach')) tags.push(['Brecha activa', 'tag--solid']);
      if (current.classList.contains('map__sector--warn')) tags.push(['Vigilancia', 'tag--red']);
      if (current.classList.contains('is-sealed')) tags.push(['Sellado', 'tag--deep']);
      if (current.classList.contains('is-evacuated')) tags.push(['Evacuado', '']);
      if (BS.$('.map__team', current)) tags.push(['Equipo desplegado', 'tag--red']);
      if (!tags.length) tags.push(['Operativo', '']);
      meta.replaceChildren(...tags.map(([t, c]) => BS.el('span', { class: `tag ${c}`, text: t })));
      sealBtn.textContent = current.classList.contains('is-sealed') ? 'Abrir sector' : 'Sellar sector';
    };

    const select = (sector) => {
      sectors.forEach((s) => s.classList.toggle('is-selected', s === sector));
      current = sector;
      name.textContent = BS.$('strong', sector).textContent;
      const info = BS.$('.map__info', sector);
      text.textContent = info ? info.textContent : '';
      [camBtn, sealBtn, teamBtn].forEach((b) => { b.disabled = false; });
      refresh();
      BS.sfx.play('beep');
    };

    sectors.forEach((sector) => {
      sector.setAttribute('role', 'button');
      sector.addEventListener('click', () => select(sector));
      sector.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(sector); }
      });
    });

    camBtn.addEventListener('click', () => current && openCamera(current));
    sealBtn.addEventListener('click', () => {
      if (!current) return;
      const sealed = current.classList.toggle('is-sealed');
      const code = sectorCode(current);
      BS.notify({ level: sealed ? 'warn' : 'ok', title: sealed ? `Sector ${code} sellado` : `Sector ${code} reabierto`, msg: sealed ? 'Puertas blindadas cerradas. Acceso solo con CLR-5.' : 'Puertas blindadas abiertas.' });
      setLast(`${sealed ? 'Sellado' : 'Apertura'} de ${code}`);
      refresh();
    });
    teamBtn.addEventListener('click', async () => {
      if (!current) return;
      const sector = current;
      const code = sectorCode(sector);
      if (BS.$('.map__team', sector)) return;
      await busy(teamBtn, 1800, 'Desplegando…');
      const marker = BS.el('span', { class: 'map__team', style: `left:${BS.randInt(20, 70)}%;top:${BS.randInt(30, 70)}%`, 'aria-hidden': 'true' });
      sector.append(marker);
      BS.notify({ level: 'info', title: `Equipo táctico en ${code}`, msg: 'Unidad Kappa-3 en posición. Informe en 15 s.' });
      setLast(`Equipo enviado a ${code}`);
      refresh();
      setTimeout(() => {
        marker.remove();
        const breach = sector.classList.contains('map__sector--breach');
        BS.notify({ level: breach ? 'crit' : 'ok', title: `Informe de Kappa-3 · ${code}`, msg: breach ? 'Perdemos contacto con la unidad. Último mensaje: "el pasillo no se acaba".' : 'Sector inspeccionado. Sin novedad.' });
        if (current === sector) refresh();
      }, 15000);
    });

    /* Lockdown: todo el mapa queda sellado */
    BS.on('alarm:change', (level) => {
      sectors.forEach((s) => s.classList.toggle('is-sealed', level >= 2 && !s.classList.contains('map__sector--hall')));
      refresh();
    });
    if (BS.alarm.level() >= 2) sectors.forEach((s) => !s.classList.contains('map__sector--hall') && s.classList.add('is-sealed'));
  };

  /* ---------- Selector de modo ---------- */
  const initModes = () => {
    const radios = { 0: BS.$('#mode-normal'), 1: BS.$('#mode-alert'), 2: BS.$('#mode-lockdown') };
    if (!radios[0]) return;
    const sync = (level) => { const r = radios[Math.min(level, 2)]; if (r) r.checked = true; };
    sync(BS.alarm.level());
    Object.entries(radios).forEach(([level, radio]) => radio.addEventListener('change', () => {
      if (!radio.checked) return;
      BS.alarm.set(Number(level), Number(level) === 2 ? 'Lockdown ordenado desde Containment Control' : 'Modo seleccionado en Containment Control');
      setLast(`Modo ${['normal', 'alerta', 'lockdown'][level]}`);
    }));
    BS.on('alarm:change', sync);
  };

  /* ---------- Alarmas: reconocimiento ---------- */
  const initAck = () => {
    const panel = BS.$('.console__alarms');
    if (!panel) return;
    const code = BS.$('.panel__code', panel);
    const items = BS.$$('.alert-list .alert', panel);
    const update = () => {
      const active = items.filter((i) => !i.classList.contains('is-ack')).length;
      code.textContent = `ALM // ${active} ACTIVA${active === 1 ? '' : 'S'}`;
    };
    items.forEach((item) => {
      const btn = BS.$('a[href="#ack"]', item);
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const done = item.classList.toggle('is-ack');
        btn.textContent = done ? 'OK' : 'ACK';
        BS.$$('.led', item).forEach((l) => l.classList.toggle('led--red', !done));
        const title = BS.$('strong', item).textContent;
        BS.notify({ level: 'ok', title: done ? 'Alarma reconocida' : 'Alarma reactivada', msg: title, timeout: 3000 });
        setLast(`${done ? 'ACK' : 'Reactivación'} · ${title}`);
        update();
      });
    });
    update();
  };

  /* ---------- Botones de acción ---------- */
  const ACTIONS = {
    'reset-sensors': async (btn) => {
      await busy(btn, 2000, 'Reiniciando…');
      BS.monitor.reset();
      BS.notify({ level: 'ok', title: 'Sensores reiniciados', msg: 'Lecturas de contención y temperatura recalibradas.' });
      setLast('Reinicio de sensores');
    },
    'thermal-purge': async (btn) => {
      await busy(btn, 2600, 'Purgando…');
      BS.state.temps.S09 -= 25;
      BS.state.temps.B12 -= 8;
      BS.monitor.render();
      BS.notify({ level: 'ok', title: 'Purga térmica completada', msg: 'Sector 09 −25 °C · Celda B-12 −8 °C.' });
      setLast('Purga térmica');
    },
    'evacuate': async (btn) => {
      await busy(btn, 3000, 'Evacuando…');
      const s10 = BS.$$('.map__sector').find((s) => BS.$('strong', s).textContent.startsWith('S-10'));
      if (s10) s10.classList.add('is-evacuated');
      BS.state.personnel = Math.max(0, BS.state.personnel - 4);
      BS.notify({ level: 'warn', title: 'Sector S-10 evacuado', msg: '4 operarios trasladados al nivel −2.' });
      setLast('Evacuación de S-10');
    },
    'seal-lift': async (btn) => {
      const lift = BS.$('.map__sector--lift');
      await busy(btn, 1200, 'Procesando…');
      const sealed = lift ? lift.classList.toggle('is-sealed') : false;
      btn.textContent = sealed ? 'Liberar ascensor' : 'Sellar ascensor';
      BS.notify({ level: sealed ? 'warn' : 'ok', title: sealed ? 'Ascensor de carga sellado' : 'Ascensor de carga liberado', msg: 'Acceso al nivel −7 ' + (sealed ? 'bloqueado.' : 'restablecido.') });
      setLast(sealed ? 'Ascensor sellado' : 'Ascensor liberado');
    },
    'open-s09': async (btn) => {
      await busy(btn, 1500, 'Abriendo…');
      BS.monitor.bump('EXP-002', -15);
      BS.alarm.set(2, 'Brecha en S-09 abierta manualmente');
      setLast('Apertura de S-09 (CLR-5)');
    },
    'release-003': async (btn) => {
      await busy(btn, 1500, 'Liberando…');
      BS.monitor.bump('EXP-003', -12);
      BS.notify({ level: 'crit', title: 'EXP-003 · Subject Zero', msg: '"Gracias. Aunque ya sabía que lo haría. Nos vemos el jueves."' });
      setLast('Liberación de EXP-003 (CLR-5)');
    },
  };

  const initButtons = () => {
    BS.$$('[data-cmd]').forEach((btn) => {
      const locked = btn.classList.contains('btn--locked');
      const unlock = () => {
        btn.classList.remove('btn--locked');
        btn.removeAttribute('aria-disabled');
        btn.classList.add('btn--primary');
      };
      if (locked && BS.secrets.has('clr5')) unlock();
      BS.on('secret:unlocked', ({ id }) => id === 'clr5' && locked && unlock());

      btn.setAttribute('role', 'button');
      btn.tabIndex = 0;
      const run = (e) => {
        e.preventDefault();
        if (btn.classList.contains('btn--locked')) {
          BS.sfx.play('error');
          BS.notify({ level: 'warn', title: 'Acción bloqueada', msg: 'Requiere autorización CLR-5.', timeout: 3000 });
          return;
        }
        const fn = ACTIONS[btn.dataset.cmd];
        if (fn && !btn.classList.contains('is-busy')) fn(btn);
      };
      btn.addEventListener('click', run);
      btn.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && btn.tagName !== 'A') run(e); });
    });
  };

  /* ---------- Interruptores ---------- */
  const SWITCHES = {
    doors(on) {
      BS.monitor.setFlag('doorsOpen', !on);
      BS.notify({ level: on ? 'ok' : 'warn', title: on ? 'Puertas de seguridad selladas' : 'Puertas de seguridad abiertas', msg: on ? 'Nivel −4 aislado.' : 'El nivel −4 queda comunicado con el resto de la instalación.' });
    },
    async purge(on, input) {
      if (!on) return;
      BS.notify({ level: 'info', title: 'Purga de ventilación V-4', msg: 'Ciclo de limpieza en curso (8 s).' });
      await BS.wait(8000);
      input.checked = false;
      const v4 = BS.$$('.sys-list li').find((li) => li.textContent.includes('V-4'));
      if (v4) {
        v4.classList.remove('is-warn');
        BS.$('.led', v4).className = 'led led--on';
        BS.$('em', v4).textContent = 'Nominal';
      }
      BS.notify({ level: 'ok', title: 'Purga completada', msg: 'Ventilación V-4 sin esporas. Estado nominal.' });
      setLast('Purga de V-4 completada');
    },
    lights(on) {
      BS.monitor.setFlag('lightsOff', !on);
      if (on) BS.notify({ level: 'ok', title: 'Iluminación de B-12 restablecida', msg: 'El crecimiento de EXP-001 vuelve a valores normales.' });
      else BS.notify({ level: 'crit', title: 'B-12 a oscuras', msg: 'Sin observación, EXP-001 acelera su crecimiento. La contención bajará rápidamente.' });
    },
    comms(on) {
      if (on) BS.notify({ level: 'crit', title: 'Apagón de comunicaciones', msg: 'Instalación aislada. Solo se mostrarán alertas críticas.' });
      BS.notify.muted = on;
      BS.monitor.setFlag('commsDown', on);
      const aurora = BS.$$('.sys-list li').find((li) => li.textContent.includes('AURORA'));
      if (aurora) BS.$('em', aurora).textContent = on ? 'Cortado' : 'Standby';
      if (!on) BS.notify({ level: 'ok', title: 'Comunicaciones restablecidas', msg: 'Enlace AURORA-2 en standby.' });
    },
  };

  const initSwitches = () => {
    const flags = BS.state.flags;
    const initial = { doors: !flags.doorsOpen, lights: !flags.lightsOff, comms: flags.commsDown, purge: false };
    BS.$$('[data-switch]').forEach((input) => {
      const key = input.dataset.switch;
      input.checked = initial[key];
      if (key === 'comms') BS.notify.muted = input.checked;
      input.addEventListener('change', () => {
        SWITCHES[key](input.checked, input);
        if (key !== 'purge' || input.checked) setLast(`${BS.$('.switch__text', input.closest('.switch')).firstChild.textContent.trim()} → ${input.checked ? 'ON' : 'OFF'}`);
      });
    });
  };

  /* ---------- Protocolo Omega ---------- */
  const initOmega = () => {
    const button = BS.$('.omega__button');
    if (!button) return;
    button.addEventListener('click', (e) => {
      /* Sin la llave, se deja abrir el aviso CSS (#omega) y se registra el intento */
      if (BS.alarm.omega()) { e.preventDefault(); setLast('Protocolo Omega iniciado'); }
    });
  };

  BS.register('control', {
    pages: ['control'],
    init() {
      lastAction = BS.$('[data-bind="last-action"]');
      initModes();
      initAck();
      initButtons();
      initSwitches();
      initOmega();
      initMap();
    },
  });
})();
