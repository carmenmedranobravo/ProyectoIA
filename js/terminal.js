/* ==========================================================================
   BLACKSITE OS · terminal.js
   Terminal interactiva disponible en todas las páginas.
   Abrir/cerrar: tecla º (o `), botón ">_ Terminal" del dock o Escape.
   Historial con ↑ ↓, autocompletado con Tab. Comandos: escriba HELP.
   ========================================================================== */
(() => {
  'use strict';

  const PROMPT = 'VOSS@BS7:~$ ';
  let out, input, panel;
  let history = BS.store.get('termHistory', []);
  let hIndex = -1;

  /* ---------- Salida ---------- */
  const print = (text = '', cls = '') => {
    const line = BS.el('div', { class: `term__line ${cls}`.trim() });
    line.textContent = text;
    out.append(line);
    out.scrollTop = out.scrollHeight;
    return line;
  };
  const printHTML = (html, cls = '') => {
    const line = print('', cls);
    line.innerHTML = html;
    return line;
  };
  const head = (text) => print(text, 'is-head');
  const err = (text) => { BS.sfx.play('error'); return print(text, 'is-err'); };
  const table = (rows, widths) => rows.forEach((r) => print(r.map((c, i) => String(c).padEnd(widths[i] || 0)).join('  ')));

  /** Animación de progreso tipo "[#####.....] 50%" */
  const progress = async (label, ms = 1200) => {
    const line = print(`${label} [..........]   0%`, 'is-dim');
    for (let i = 1; i <= 10; i++) {
      await BS.wait(ms / 10);
      line.textContent = `${label} [${'#'.repeat(i)}${'.'.repeat(10 - i)}] ${String(i * 10).padStart(3)}%`;
      BS.sfx.play('type');
    }
  };

  /* ---------- Comandos ---------- */
  const COMMANDS = {
    HELP: {
      desc: 'Lista de comandos',
      run() {
        head('Comandos disponibles');
        Object.entries(COMMANDS).forEach(([name, c]) => !c.hidden && print(`  ${name.padEnd(13)} ${c.desc}`));
        print('');
        print('Atajos: ↑ ↓ historial · Tab autocompletar · Esc cerrar · º abrir', 'is-dim');
      },
    },
    STATUS: {
      desc: 'Estado de la instalación en tiempo real',
      run() {
        const s = BS.state;
        head(`Estado de la instalación · ${BS.clock ? BS.clock.stamp() : BS.time()}`);
        print(`  Integridad media ........ ${BS.monitor.average().toFixed(1)}%`);
        Object.entries(s.integrity).forEach(([id, v]) => print(`  ${id} ................. ${v.toFixed(1).padStart(5)}%  ${'█'.repeat(Math.round(v / 10))}${'░'.repeat(10 - Math.round(v / 10))}`, v < 45 ? 'is-err' : ''));
        print(`  Cámara criogénica C-3 ... ${s.temps.C3.toFixed(1)} °C`);
        print(`  Sector 09 ............... +${s.temps.S09.toFixed(1)} °C`);
        print(`  Reserva de baterías ..... ${Math.round(s.battery)}%`);
        print(`  Personal en instalación . ${s.personnel}`);
        print(`  Estado de alarma ........ ${['NORMAL', 'ALERTA', 'LOCKDOWN', 'OMEGA'][BS.alarm.level()]}`, BS.alarm.level() ? 'is-err' : 'is-ok');
        print(`  Comunicaciones .......... ${s.flags.commsDown ? 'APAGÓN ACTIVO' : 'AURORA-2 EN LÍNEA'}`);
      },
    },
    EXPERIMENTS: {
      desc: 'Catálogo de experimentos · EXPERIMENTS <ID> para detalle',
      args: () => BS.data.experiments.map((e) => e.id),
      run([id]) {
        if (id) {
          const e = BS.data.findExperiment(id);
          if (!e || (e.id === 'EXP-005' && !BS.secrets.has('exp005'))) return err(`ERR 404 · ${id.toUpperCase()} no existe en la base de datos.`);
          head(`${e.id} // ${e.name}`);
          print(`  Clase: ${e.cls} · Ubicación: ${e.cell} · Amenaza: ${'■'.repeat(e.threat)}${'□'.repeat(5 - e.threat)} ${e.threatLabel}`);
          print(`  Contención: ${e.statusLabel}${BS.state.integrity[e.id] ? ` (${BS.state.integrity[e.id].toFixed(1)}%)` : ''}`);
          print(`  ${e.summary}`);
          Object.entries(e.facts).forEach(([k, v]) => print(`  · ${k}: ${v}`, 'is-dim'));
          printHTML(`  → <a href="${e.dossier}">Consultar expediente</a>`);
          return;
        }
        head('Base de datos de experimentos');
        const list = BS.data.experiments.concat(BS.secrets.has('exp005') ? [BS.data.hiddenExperiment] : []);
        table([['ID', 'NOMBRE', 'AMENAZA', 'CONTENCIÓN']].concat(list.map((e) => [e.id, e.name.toUpperCase(), `${e.threat}/5`, e.statusLabel])), [9, 15, 8]);
        print('Escriba EXPERIMENTS <ID> para ver el detalle.', 'is-dim');
      },
    },
    INCIDENTS: {
      desc: 'Informes de incidentes · INCIDENTS <gravedad>',
      args: () => ['CRITICAL', 'SEVERE', 'MODERATE', 'MINOR'],
      run([sev]) {
        const map = { CRITICAL: 'critical', CRITICA: 'critical', SEVERE: 'severe', GRAVE: 'severe', MODERATE: 'moderate', MODERADA: 'moderate', MINOR: 'minor', LEVE: 'minor' };
        const filter = sev ? map[BS.normalize(sev).toUpperCase()] : null;
        if (sev && !filter) return err(`Gravedad desconocida: ${sev}. Use CRITICAL, SEVERE, MODERATE o MINOR.`);
        const list = BS.data.incidents.filter((i) => !filter || i.sev === filter);
        head(`Informes de incidentes${filter ? ` · ${BS.data.severityLabel[filter]}` : ''} (${list.length})`);
        table(list.map((i) => [i.id, i.date, BS.data.severityLabel[i.sev].toUpperCase(), i.status.toUpperCase(), i.title]), [14, 11, 9, 12]);
        printHTML('  → <a href="incidents.html">Abrir base de datos de incidentes</a>');
      },
    },
    ARCHIVES: {
      desc: 'Archivo clasificado · ARCHIVES <texto> para buscar',
      run(args) {
        const term = BS.normalize(args.join(' '));
        const items = BS.data.archives.filter((a) => !term || BS.normalize(`${a.title} ${a.tags}`).includes(term));
        head(term ? `Resultados para "${args.join(' ')}" (${items.length})` : 'Archivo clasificado');
        if (!items.length) return print('  Sin coincidencias.', 'is-dim');
        Object.entries(BS.data.archiveCategories).forEach(([cat, label]) => {
          const group = items.filter((a) => a.cat === cat);
          if (!group.length) return;
          print(`  [${label.toUpperCase()}]`, 'is-ok');
          group.forEach((a) => printHTML(`    <a href="archives.html#${a.id}">${BS.escape(a.title)}</a>`));
        });
      },
    },
    OPEN: {
      desc: 'Abrir un módulo · OPEN <módulo>',
      args: () => BS.data.pages.map((p) => p.key.toUpperCase()),
      run([name]) {
        if (!name) return err('Uso: OPEN <módulo>. Módulos: ' + BS.data.pages.map((p) => p.key.toUpperCase()).join(', '));
        const key = BS.normalize(name);
        const page = BS.data.pages.find((p) => p.key === key || p.num === key.padStart(2, '0') || BS.normalize(p.name).startsWith(key));
        if (!page) return err(`Módulo desconocido: ${name}`);
        print(`Abriendo ${page.num} // ${page.name}…`, 'is-ok');
        setTimeout(() => {
          const a = BS.el('a', { href: page.file });
          document.body.append(a);
          a.click(); // pasa por las transiciones cinematográficas
        }, 400);
      },
    },
    ALARM: {
      desc: 'Simular alarma · ALARM <0|1|2|OFF|OMEGA>',
      args: () => ['0', '1', '2', 'OFF', 'OMEGA'],
      run([lvl]) {
        if (!lvl) return print(`Nivel actual: ${BS.alarm.level()}. Uso: ALARM 1 · ALARM 2 · ALARM OFF · ALARM OMEGA`, 'is-dim');
        const v = lvl.toUpperCase();
        if (v === 'OMEGA') return BS.alarm.omega() ? print('Secuencia Ω-7 iniciada.', 'is-err') : err('Protocolo Omega denegado: falta la llave del Director.');
        const level = v === 'OFF' ? 0 : Number(v);
        if (![0, 1, 2].includes(level)) return err('Nivel no válido.');
        BS.alarm.set(level, 'Activado desde la terminal');
        print(`Estado de alarma → ${['NORMAL', 'ALERTA', 'LOCKDOWN'][level]}`, level ? 'is-err' : 'is-ok');
      },
    },
    SCAN: {
      desc: 'Escaneo completo de la instalación',
      async run() {
        await progress('Escaneando sectores');
        const worst = Object.entries(BS.state.integrity).sort((a, b) => a[1] - b[1])[0];
        print(`Sectores analizados: 11 · Anomalías: ${BS.randInt(1, 4)} · Celda más débil: ${worst[0]} (${worst[1].toFixed(1)}%)`, 'is-ok');
        if (Math.random() < 0.5) {
          print('El escaneo ha perturbado algo en el Sector 09…', 'is-err');
          BS.anomalies.trigger(BS.pick(['interference', 'temporal', 'contact']));
        }
      },
    },
    CODE: {
      desc: 'Introducir un código de acceso · CODE <código>',
      run([code]) {
        if (!code) return err('Uso: CODE <código>');
        const res = BS.secrets.tryCode(code);
        if (!res) return err(`Código ${code.toUpperCase()} rechazado. Intento registrado.`);
        if (res.already) return print(`Código ya utilizado: ${res.secret.name}.`, 'is-dim');
        print(`ACCESO CONCEDIDO · ${res.secret.name}`, 'is-ok');
        print(`  ${res.secret.reward}`);
      },
    },
    DISCOVERIES: {
      desc: 'Descubrimientos secretos encontrados',
      run() {
        const list = BS.secrets.list();
        head(`Descubrimientos ${list.filter((s) => s.unlocked).length}/${list.length}`);
        list.forEach((s) => print(s.unlocked ? `  ◆ ${s.name} — ${s.reward}` : `  ◇ ▒▒▒▒▒▒▒▒ — pista: ${s.hint}`, s.unlocked ? 'is-ok' : 'is-dim'));
      },
    },
    FAVORITES: {
      desc: 'Elementos marcados como favoritos',
      run() {
        const favs = BS.favorites.list();
        head(`Favoritos (${favs.length})`);
        if (!favs.length) return print('  Aún no hay favoritos. Márquelos con ★ en Database o Incidents.', 'is-dim');
        favs.forEach((f) => printHTML(`  ★ <a href="${f.href}">${BS.escape(f.title)}</a>`));
      },
    },
    SOUND: {
      desc: 'Sonido · SOUND <ON|OFF>',
      args: () => ['ON', 'OFF'],
      run([v]) {
        const on = v ? v.toUpperCase() === 'ON' : !BS.prefs.get('sound');
        BS.prefs.set('sound', on);
        BS.sfx.play('confirm');
        print(`Sonido ${on ? 'activado' : 'desactivado'}.`, 'is-ok');
      },
    },
    WHOAMI: { desc: 'Identidad del operador', run: () => print(`DR. M. VOSS · ID 7741-K · ${document.documentElement.classList.contains('clr5') ? 'CLR-5 (no autorizado)' : 'CLR-4'} · Terminal T-01`) },
    DATE:   { desc: 'Fecha y hora del sistema', run: () => print(BS.clock ? BS.clock.stamp() : BS.time()) },
    HISTORY: { desc: 'Historial de comandos', run: () => history.slice().reverse().forEach((h, i) => print(`  ${String(i + 1).padStart(3)}  ${h}`)) },
    CLEAR:  { desc: 'Limpiar la pantalla', run: () => out.replaceChildren() },
    EXIT:   { desc: 'Cerrar la terminal', run: () => BS.terminal.close() },
    SUDO:   { hidden: true, desc: '', run: () => err('Buen intento. Este incidente se notificará al Consejo.') },
  };

  const execute = async (raw) => {
    const line = raw.trim();
    if (!line) return;
    const cmdLine = print(line, 'is-cmd');
    cmdLine.dataset.prompt = PROMPT;
    history = [line].concat(history.filter((h) => h !== line)).slice(0, 40);
    BS.store.set('termHistory', history);
    hIndex = -1;

    const [name, ...args] = line.split(/\s+/);
    const cmd = COMMANDS[name.toUpperCase()];
    if (!cmd) {
      /* Un código secreto escrito directamente también funciona */
      const res = BS.secrets.tryCode(name);
      if (res && !res.already) { print(`ACCESO CONCEDIDO · ${res.secret.name}`, 'is-ok'); return; }
      err(`Comando no reconocido: ${name}. Escriba HELP.`);
      return;
    }
    input.disabled = true;
    try { await cmd.run(args); } catch (e) { err('Error interno del módulo.'); console.warn(e); }
    input.disabled = false;
    if (panel.classList.contains('is-open')) input.focus();
  };

  const autocomplete = () => {
    const parts = input.value.toUpperCase().split(/\s+/);
    if (parts.length === 1) {
      const matches = Object.keys(COMMANDS).filter((c) => !COMMANDS[c].hidden && c.startsWith(parts[0]));
      if (matches.length === 1) input.value = `${matches[0]} `;
      else if (matches.length) print(matches.join('   '), 'is-dim');
    } else {
      const cmd = COMMANDS[parts[0]];
      if (!cmd || !cmd.args) return;
      const matches = cmd.args().filter((a) => a.startsWith(parts[1] || ''));
      if (matches.length === 1) input.value = `${parts[0]} ${matches[0]}`;
      else if (matches.length) print(matches.join('   '), 'is-dim');
    }
  };

  BS.terminal = {
    open() {
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      input.focus({ preventScroll: true });
      BS.sfx.play('beep');
    },
    close() {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      input.blur();
    },
    toggle() { panel.classList.contains('is-open') ? BS.terminal.close() : BS.terminal.open(); },
    run: execute,
  };

  BS.register('terminal', {
    init() {
      out = BS.el('div', { class: 'term__out', role: 'log', 'aria-live': 'polite' });
      input = BS.el('input', { class: 'term__input', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Comando' });
      const form = BS.el('form', { class: 'term__form' }, [BS.el('span', { class: 'term__prompt', text: PROMPT.trim() }), input]);
      panel = BS.el('section', { class: 'term', 'aria-label': 'Terminal del sistema', 'aria-hidden': 'true' }, [
        BS.el('header', { class: 'term__head' }, [
          BS.el('span', {}, [BS.el('strong', { text: 'BS-OS TERMINAL' }), ' · T-01 · TTY/7']),
          BS.el('span', {}, ['HELP para ayuda · ', BS.el('button', { type: 'button', class: 'modal__close', 'aria-label': 'Cerrar terminal', text: '✕', style: 'display:inline-grid;vertical-align:middle', on: { click: () => BS.terminal.close() } })]),
        ]),
        out,
        form,
      ]);
      document.body.append(panel);

      print('BLACKSITE OS 4.7.2 — Terminal segura TTY/7', 'is-head');
      print('Conexión cifrada establecida. Escriba HELP para ver los comandos disponibles.', 'is-dim');

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = input.value;
        input.value = '';
        execute(value);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          hIndex = BS.clamp(hIndex + (e.key === 'ArrowUp' ? 1 : -1), -1, history.length - 1);
          input.value = hIndex === -1 ? '' : history[hIndex];
        } else if (e.key === 'Tab') {
          e.preventDefault();
          autocomplete();
        } else if (e.key === 'Escape') {
          BS.terminal.close();
        } else if (e.key.length === 1) {
          BS.sfx.play('type');
        }
      });
      out.addEventListener('click', (e) => { if (!e.target.closest('a')) input.focus(); });

      /* Tecla º / ` (misma tecla física en teclados ES y EN) */
      document.addEventListener('keydown', (e) => {
        if (BS.isTyping(e.target) && e.target !== input) return;
        if (e.code === 'Backquote' || e.key === 'º' || e.key === '`') {
          e.preventDefault();
          BS.terminal.toggle();
        }
      });
    },
  });
})();
