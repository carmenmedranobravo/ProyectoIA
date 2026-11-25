/* ==========================================================================
   BLACKSITE OS · boot.js
   SYSTEM BOOT SEQUENCE: pantalla de arranque con líneas de diagnóstico,
   barra de progreso, escáner biométrico y "ACCESS GRANTED".
   - Se muestra según la preferencia "boot" (una vez por sesión / siempre / nunca).
   - Cualquier tecla o clic la omite.
   - Al terminar añade <html class="booted"> y emite "boot:done".
   ========================================================================== */
(() => {
  'use strict';

  const STEPS = [
    ['INIT KERNEL', 'BS-OS 4.7.2', 260],
    ['MEMORY CHECK', '65536 TB OK', 220],
    ['MOUNTING /VAR/BS7/ARCHIVE', 'OK', 200],
    ['CONTAINMENT GRID', '4 / 4 CELLS', 260],
    ['SATELLITE UPLINK AURORA-2', 'LINKED', 300],
    ['DECRYPTING MAINFRAME', 'AES-1024', 320],
  ];

  const finish = () => {
    document.documentElement.classList.add('booted');
    BS.booted = true;
    BS.emit('boot:done');
  };

  const shouldRun = () => {
    const mode = BS.prefs.get('boot');
    if (BS.reducedMotion || mode === 'never') return false;
    if (mode === 'always') return true;
    return !BS.session.get('booted');
  };

  BS.register('boot', {
    init() {
      /* Si llegamos por una transición entre páginas no repetimos el arranque */
      if (!shouldRun() || BS.session.get('transition')) { finish(); return; }
      BS.session.set('booted', true);

      const lines = BS.el('div', { class: 'sysboot__lines', 'aria-live': 'polite' });
      const fill = BS.el('span', { class: 'bar__fill', style: 'width:0' });
      const pct = BS.el('span', { class: 'label', text: '000%' });
      const scan = BS.el('div', { class: 'sysboot__scan' }, [
        BS.el('div', { class: 'sysboot__print', 'aria-hidden': 'true' }),
        BS.el('div', {}, [BS.el('p', { class: 'label', text: 'Verificando biometría' }), BS.el('p', { text: 'DR. M. VOSS · 7741-K · CLR-4' })]),
      ]);
      const granted = BS.el('p', { class: 'sysboot__granted', text: 'Access granted' });
      const screen = BS.el('div', { class: 'sysboot', role: 'dialog', 'aria-label': 'Secuencia de arranque del sistema' }, [
        BS.el('div', { class: 'sysboot__inner' }, [
          BS.el('div', { class: 'sysboot__head' }, [
            BS.el('p', { class: 'sysboot__logo', text: 'BLACKSITE' }),
            BS.el('p', { class: 'label', text: 'System boot sequence' }),
          ]),
          lines,
          BS.el('div', { class: 'sysboot__progress' }, [BS.el('div', { class: 'bar' }, [fill]), pct]),
          scan,
          granted,
        ]),
        BS.el('p', { class: 'sysboot__skip', text: 'Pulse cualquier tecla para omitir' }),
      ]);
      document.body.append(screen);

      let done = false;
      const close = () => {
        if (done) return;
        done = true;
        document.removeEventListener('keydown', close);
        screen.removeEventListener('click', close);
        screen.classList.add('is-leaving');
        setTimeout(() => { screen.remove(); finish(); }, 550);
      };
      document.addEventListener('keydown', close);
      screen.addEventListener('click', close);

      const setProgress = (p) => {
        fill.style.width = `${p}%`;
        pct.textContent = `${BS.pad(Math.round(p), 3)}%`;
      };

      (async () => {
        BS.sfx.play('boot');
        for (let i = 0; i < STEPS.length && !done; i++) {
          const [label, result, ms] = STEPS[i];
          const value = BS.el('b', { text: '...' });
          lines.append(BS.el('p', { class: 'sysboot__line' }, [BS.el('span', { text: `> ${label}` }), value]));
          await BS.wait(ms);
          value.textContent = result;
          BS.sfx.play('type');
          setProgress(((i + 1) / (STEPS.length + 2)) * 100);
        }
        if (done) return;
        lines.append(BS.el('p', { class: 'sysboot__line' }, [BS.el('span', { class: 'is-warn', text: '> WARNING: 1 ANOMALÍA SIN REGISTRAR EN SECTOR 09' })]));
        scan.classList.add('is-active');
        await BS.wait(1100);
        if (done) return;
        setProgress(100);
        granted.classList.add('is-visible');
        BS.sfx.play('unlock');
        await BS.wait(900);
        close();
      })();
    },
  });
})();
