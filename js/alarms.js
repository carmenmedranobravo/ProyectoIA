/* ==========================================================================
   BLACKSITE OS · alarms.js
   Simulación de alarmas y estados de emergencia, compartida por todas las
   páginas (el estado se conserva al navegar durante la sesión).
     nivel 0 · Normal
     nivel 1 · Alerta      (borde rojo, banner)
     nivel 2 · Lockdown    (luces de emergencia, sirena)
     nivel 3 · Omega       (cuenta atrás de autodestrucción simulada)
   API: BS.alarm.set(nivel, motivo) · BS.alarm.clear() · BS.alarm.omega()
   ========================================================================== */
(() => {
  'use strict';

  const LABELS = ['Normal', 'Estado de alerta', 'Emergencia · Lockdown', 'Protocolo Omega'];
  const OMEGA_SECONDS = 30;
  const root = document.documentElement;
  let saved = BS.session.get('alarm', { level: 0, reason: '', silenced: false, omegaEnd: 0 });
  let els = null;
  let countdown = null;

  const build = () => {
    const text = BS.el('span');
    const count = BS.el('span', { class: 'emergency__count' });
    const silence = BS.el('button', { type: 'button', class: 'btn btn--ghost btn--sm', text: 'Silenciar' });
    const reset = BS.el('button', { type: 'button', class: 'btn btn--sm', text: 'Restablecer' });
    const bar = BS.el('div', { class: 'emergency__bar', role: 'alert' }, [
      BS.el('span', { class: 'led led--red led--blink', 'aria-hidden': 'true' }),
      text,
      count,
      BS.el('div', { class: 'emergency__actions' }, [silence, reset]),
    ]);
    const wrap = BS.el('div', { class: 'emergency' }, [BS.el('div', { class: 'emergency__glow', 'aria-hidden': 'true' }), bar]);
    document.body.append(wrap);

    silence.addEventListener('click', () => {
      saved.silenced = !saved.silenced;
      persist();
      apply();
    });
    reset.addEventListener('click', () => BS.alarm.clear());
    return { text, count, silence, reset };
  };

  const persist = () => BS.session.set('alarm', saved);

  const apply = () => {
    const { level, reason, silenced } = saved;
    [1, 2, 3].forEach((n) => root.classList.toggle(`alarm-${n}`, level === n));
    if (!els) return;
    els.text.innerHTML = `<strong>${LABELS[level]}</strong>${reason ? ` · ${BS.escape(reason)}` : ''}`;
    els.silence.textContent = silenced ? 'Activar sirena' : 'Silenciar';
    els.silence.hidden = level < 2;
    els.reset.textContent = level === 3 ? 'Abortar secuencia' : 'Restablecer';
    els.count.hidden = level !== 3;
    BS.sfx.siren(level >= 2 && !silenced);
  };

  const tickOmega = () => {
    clearInterval(countdown);
    const update = () => {
      const left = Math.max(0, Math.ceil((saved.omegaEnd - Date.now()) / 1000));
      els.count.textContent = `00:${BS.pad(left)}`;
      if (left <= 5 && left > 0) BS.sfx.play('beep');
      if (left === 0) {
        clearInterval(countdown);
        finishOmega();
      }
    };
    update();
    countdown = setInterval(update, 1000);
  };

  const finishOmega = () => {
    BS.alarm.clear(true);
    root.classList.add('fx-blackout');
    setTimeout(() => root.classList.remove('fx-blackout'), 1500);
    BS.sfx.play('glitch');
    BS.ui.modal({
      kicker: 'Protocolo Omega · Simulación',
      title: 'Instalación <span class="text-red">destruida</span>',
      danger: true,
      body: '<p>La secuencia Ω-7 ha llegado a cero. En una situación real, la Instalación 07 y todo su contenido habrían dejado de existir.</p><p>Esto ha sido una simulación. Ningún calcetín, experimento ni operador ha resultado herido.</p>',
      actions: [{ label: 'Reiniciar sistema', primary: true, onClick: () => location.reload() }, { label: 'Cerrar' }],
    });
  };

  BS.alarm = {
    level: () => saved.level,
    set(level, reason = '') {
      level = BS.clamp(Number(level) || 0, 0, 3);
      if (level === 3) return BS.alarm.omega();
      const changed = level !== saved.level;
      clearInterval(countdown);
      saved = { level, reason, silenced: false, omegaEnd: 0 };
      persist();
      apply();
      if (changed) {
        BS.emit('alarm:change', level);
        if (level > 0) BS.notify({ level: level === 2 ? 'crit' : 'warn', title: LABELS[level], msg: reason || 'Estado activado desde la terminal T-01.' });
        else BS.notify({ level: 'ok', title: 'Estado normal restablecido', msg: 'Todas las alarmas han sido desactivadas.' });
      }
      return true;
    },
    clear(silent = false) {
      if (silent) {
        clearInterval(countdown);
        saved = { level: 0, reason: '', silenced: false, omegaEnd: 0 };
        persist();
        apply();
        BS.emit('alarm:change', 0);
        return;
      }
      BS.alarm.set(0);
    },
    /** Cuenta atrás Omega: requiere la "Llave del Director" (secreto) */
    omega() {
      if (!BS.secrets.has('omega')) {
        BS.sfx.play('error');
        BS.notify({ level: 'crit', title: 'Protocolo Omega denegado', msg: 'Se requiere la llave física del Director. Intento registrado: INC-2047-0119.' });
        return false;
      }
      saved = { level: 3, reason: 'Autodestrucción simulada', silenced: false, omegaEnd: Date.now() + OMEGA_SECONDS * 1000 };
      persist();
      apply();
      tickOmega();
      BS.emit('alarm:change', 3);
      BS.notify({ level: 'crit', title: 'Protocolo Omega iniciado', msg: `Autodestrucción simulada en ${OMEGA_SECONDS} s. Pulse "Abortar secuencia" para cancelar.` });
      return true;
    },
  };

  BS.register('alarms', {
    init() {
      els = build();
      /* Omega caducado mientras se navegaba: se cierra sin drama */
      if (saved.level === 3 && saved.omegaEnd < Date.now()) saved = { level: 0, reason: '', silenced: false, omegaEnd: 0 };
      apply();
      if (saved.level === 3) tickOmega();
      /* La sirena solo puede sonar tras un gesto del usuario: reintento al primer clic */
      document.addEventListener('pointerdown', () => apply(), { once: true });
    },
  });
})();
