/* ==========================================================================
   BLACKSITE OS · ui.js
   Componentes de interfaz reutilizables:
   - BS.ui.modal()   ventana modal con la misma piel que los modales :target
   - BS.ui.drawer()  panel lateral (ajustes / registro de alertas)
   - Dock del sistema (terminal, alertas, sonido, ajustes)
   - Cierre con Escape de los modales :target existentes sin perder el scroll
   ========================================================================== */
(() => {
  'use strict';

  BS.ui = {};

  /* ---------- Modal ---------- */
  BS.ui.modal = ({ kicker = '', title = '', body = '', wide = false, danger = false, actions = [], onClose = null, raw = false } = {}) => {
    const previous = document.activeElement;
    const closeBtn = BS.el('button', { type: 'button', class: 'modal__close', 'aria-label': 'Cerrar', text: '✕' });
    const content = typeof body === 'string' ? BS.el('div', { html: body }) : body;
    const titleId = `m-${Date.now()}`;

    const box = BS.el('div', { class: `modal__box${danger ? ' alarm-flash' : ''}` }, [
      danger ? BS.el('div', { class: 'hazard', 'aria-hidden': 'true' }) : null,
      BS.el('header', { class: 'modal__head' }, [BS.el('span', { text: kicker || 'BLACKSITE OS' }), closeBtn]),
      raw
        ? content
        : BS.el('div', { class: 'modal__body' }, [
            title ? BS.el('h2', { class: 'modal__title', id: titleId, html: title }) : null,
            content,
            actions.length
              ? BS.el('div', { class: 'modal__actions' }, actions.map((a) =>
                  a.href
                    ? BS.el('a', { class: `btn ${a.primary ? 'btn--primary' : 'btn--ghost'}`, href: a.href, text: a.label })
                    : BS.el('button', { type: 'button', class: `btn ${a.primary ? 'btn--primary' : 'btn--ghost'}`, text: a.label, on: { click: () => (a.onClick ? a.onClick(api) : api.close()) } })))
              : null,
          ]),
    ]);

    const overlay = BS.el('div', { class: `modal${wide ? ' modal--wide' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': title ? titleId : null }, [box]);

    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); api.close(); } };
    const api = {
      el: overlay,
      box,
      close() {
        overlay.classList.remove('is-open');
        document.removeEventListener('keydown', onKey, true);
        setTimeout(() => overlay.remove(), 350);
        if (previous && previous.focus) previous.focus({ preventScroll: true });
        if (onClose) onClose();
      },
    };

    closeBtn.addEventListener('click', api.close);
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) api.close(); });
    document.addEventListener('keydown', onKey, true);
    document.body.append(overlay);
    if (BS.applyPhotos) BS.applyPhotos(overlay);
    void overlay.offsetWidth; // fuerza el estilo inicial para que la transición de apertura se vea
    overlay.classList.add('is-open');
    (box.querySelector('input, .modal__actions .btn') || closeBtn).focus({ preventScroll: true });
    if (BS.sfx) BS.sfx.play(danger ? 'alert' : 'beep');
    return api;
  };

  /* ---------- Panel lateral ---------- */
  const backdrop = BS.el('div', { class: 'drawer-backdrop' });
  let openDrawer = null;

  BS.ui.drawer = (id, title, render) => {
    const body = BS.el('div', { class: 'drawer__body' });
    const panel = BS.el('aside', { class: 'drawer', id, 'aria-label': title, tabindex: '-1' }, [
      BS.el('header', { class: 'drawer__head' }, [
        BS.el('h2', { class: 'drawer__title', text: title }),
        BS.el('button', { type: 'button', class: 'modal__close', 'aria-label': 'Cerrar panel', text: '✕', on: { click: () => api.close() } }),
      ]),
      body,
    ]);
    const api = {
      el: panel,
      isOpen: () => panel.classList.contains('is-open'),
      render: () => { body.replaceChildren(render(api)); },
      open() {
        if (openDrawer && openDrawer !== api) openDrawer.close();
        api.render();
        panel.classList.add('is-open');
        backdrop.classList.add('is-open');
        openDrawer = api;
        panel.focus({ preventScroll: true });
      },
      close() {
        panel.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        if (openDrawer === api) openDrawer = null;
      },
      toggle: () => (api.isOpen() ? api.close() : api.open()),
    };
    document.body.append(panel);
    return api;
  };

  /* Interruptor con la misma piel que los de control.html */
  BS.ui.switch = (label, hint, checked, onChange, disabled = false) => {
    const input = BS.el('input', { type: 'checkbox', class: 'switch__input visually-hidden', disabled });
    input.checked = !!checked;
    input.addEventListener('change', () => onChange(input.checked));
    return BS.el('label', { class: 'switch' }, [
      BS.el('span', { class: 'switch__text' }, [label, hint ? BS.el('small', { text: hint }) : null]),
      input,
      BS.el('span', { class: 'switch__track', 'aria-hidden': 'true' }),
    ]);
  };

  const section = (label, children) =>
    BS.el('section', { class: 'drawer__section' }, [BS.el('span', { class: 'label', text: label }), ...children]);

  /* ---------- Contenido del panel de ajustes ---------- */
  const renderSettings = (drawer) => {
    const p = BS.prefs;
    const frag = document.createDocumentFragment();

    const volume = BS.el('input', { type: 'range', class: 'range', min: '0', max: '1', step: '0.05', value: String(p.get('volume')), 'aria-label': 'Volumen' });
    volume.addEventListener('input', () => p.set('volume', Number(volume.value)));
    volume.addEventListener('change', () => BS.sfx.play('beep'));

    const bootSelect = BS.el('select', { class: 'select', 'aria-label': 'Secuencia de arranque' },
      [['once', 'Una vez por sesión'], ['always', 'Siempre'], ['never', 'Nunca']].map(([v, t]) => BS.el('option', { value: v, text: t })));
    bootSelect.value = p.get('boot');
    bootSelect.addEventListener('change', () => p.set('boot', bootSelect.value));

    frag.append(section('Audio', [
      BS.ui.switch('Efectos de sonido', 'Sintetizados en tiempo real', p.get('sound'), (v) => { p.set('sound', v); BS.sfx.play('confirm'); }),
      BS.el('div', { class: 'pref-row' }, [BS.el('span', { text: 'Volumen' }), volume]),
    ]));

    frag.append(section('Interfaz', [
      BS.ui.switch('Cursor táctico', BS.finePointer ? 'Solo escritorio' : 'No disponible en pantallas táctiles', p.get('cursor'), (v) => p.set('cursor', v), !BS.finePointer),
      BS.ui.switch('Efectos CRT', 'Scanlines, viñeta y marca de agua', p.get('fx'), (v) => p.set('fx', v)),
      BS.ui.switch('Eventos aleatorios', 'Anomalías, fallos e interferencias', p.get('events'), (v) => p.set('events', v)),
      BS.el('div', { class: 'pref-row' }, [BS.el('span', {}, ['Secuencia de arranque', BS.el('small', { text: 'System boot sequence' })]), bootSelect]),
    ]));

    const favs = BS.favorites.list();
    frag.append(section(`Favoritos (${favs.length})`, [
      favs.length
        ? BS.el('ul', { class: 'item-list' }, favs.map((f) => BS.el('li', {}, [
            BS.el('a', { href: f.href }, [f.title, BS.el('small', { text: f.type === 'experiment' ? 'Experimento' : 'Informe de incidente' })]),
            BS.el('button', { type: 'button', class: 'fav-btn', 'aria-pressed': 'true', 'aria-label': `Quitar ${f.title}`, text: '★', on: { click: () => { BS.favorites.toggle(f); drawer.render(); } } }),
          ])))
        : BS.el('p', { class: 'drawer__empty', text: 'Marque experimentos o informes con ★ para guardarlos aquí.' }),
    ]));

    if (BS.secrets) {
      const list = BS.secrets.list();
      const found = list.filter((s) => s.unlocked).length;
      frag.append(section(`Descubrimientos (${found}/${list.length})`, [
        BS.el('ul', { class: 'item-list' }, list.map((s) => BS.el('li', {}, s.unlocked
          ? [BS.el('span', {}, [s.name, BS.el('small', { text: s.reward })]), BS.el('span', { class: 'tag tag--red', text: 'OK' })]
          : [BS.el('span', { class: 'is-locked', text: '▒▒▒▒▒▒▒▒' }), BS.el('small', { text: s.hint })]))),
        BS.el('p', { class: 'drawer__empty', text: 'Los códigos pueden escribirse en cualquier página, en la terminal (CODE …) o en los documentos bloqueados.' }),
      ]));
    }

    frag.append(section('Datos de sesión', [
      BS.el('button', {
        type: 'button', class: 'btn btn--ghost btn--block', text: 'Restablecer preferencias y progreso',
        on: { click: () => { BS.store.clear(); BS.session.clear(); location.reload(); } },
      }),
    ]));
    return frag;
  };

  /* ---------- Contenido del registro de alertas ---------- */
  const renderLog = (drawer) => {
    const items = BS.notify.log();
    BS.notify.markRead();
    return BS.el('div', {}, [
      section(`Registro de la sesión (${items.length})`, [
        items.length
          ? BS.el('ul', { class: 'item-list' }, items.map((n) => BS.el('li', { class: `log-item log-item--${n.level}` }, [
              BS.el('span', {}, [n.title || n.msg, BS.el('small', { text: n.title ? n.msg : '' })]),
              BS.el('time', { class: 'label', text: n.time }),
            ])))
          : BS.el('p', { class: 'drawer__empty', text: 'Sin alertas registradas en esta sesión.' }),
      ]),
      items.length ? BS.el('button', { type: 'button', class: 'btn btn--ghost btn--block', text: 'Vaciar registro', on: { click: () => { BS.notify.clear(); drawer.render(); } } }) : null,
    ]);
  };

  /* ---------- Dock ---------- */
  const dockButton = (icon, label, extra = {}) =>
    BS.el('button', { type: 'button', class: 'dock__btn', ...extra }, [
      BS.el('span', { class: 'dock__icon', 'aria-hidden': 'true', text: icon }),
      BS.el('span', { class: 'dock__label', text: label }),
    ]);

  BS.register('ui', {
    init() {
      document.body.append(backdrop);
      backdrop.addEventListener('click', () => openDrawer && openDrawer.close());

      const settings = BS.ui.drawer('bs-settings', 'Ajustes del operador', renderSettings);
      const alerts = BS.ui.drawer('bs-alerts', 'Registro de alertas', renderLog);
      BS.ui.settings = settings;
      BS.ui.alerts = alerts;

      const termBtn = dockButton('>_', 'Terminal', { 'aria-label': 'Abrir terminal (tecla º)', title: 'Terminal · tecla º o `' });
      const alertBtn = dockButton('▲', 'Alertas', { 'aria-label': 'Registro de alertas' });
      const badge = BS.el('span', { class: 'dock__badge', 'data-count': String(BS.notify.unread()), text: String(BS.notify.unread() || '') });
      alertBtn.append(badge);
      const soundBtn = dockButton('♪', 'Sonido', { 'aria-pressed': String(BS.prefs.get('sound')), 'aria-label': 'Activar o desactivar sonido' });
      const setBtn = dockButton('⚙', 'Ajustes', { 'aria-label': 'Ajustes y favoritos' });

      termBtn.addEventListener('click', () => BS.terminal && BS.terminal.toggle());
      alertBtn.addEventListener('click', () => alerts.toggle());
      soundBtn.addEventListener('click', () => {
        BS.prefs.set('sound', !BS.prefs.get('sound'));
        BS.sfx.play('confirm');
      });
      setBtn.addEventListener('click', () => settings.toggle());

      BS.on('notify:count', (n) => { badge.dataset.count = String(n); badge.textContent = n ? String(n) : ''; });
      BS.on('prefs:change', ({ key, value }) => {
        if (key === 'sound') soundBtn.setAttribute('aria-pressed', String(value));
        if (settings.isOpen() && key !== 'volume') settings.render();
      });
      BS.on('secret:unlocked', () => settings.isOpen() && settings.render());

      document.body.append(BS.el('nav', { class: 'dock', 'aria-label': 'Herramientas del sistema' }, [termBtn, alertBtn, soundBtn, setBtn]));

      /* Botones del HTML con data-action (p. ej. "Abrir terminal" del Mainframe) */
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-action]');
        if (!trigger) return;
        const action = trigger.dataset.action;
        if (action === 'terminal' && BS.terminal) { e.preventDefault(); BS.terminal.open(); }
        if (action === 'settings') { e.preventDefault(); settings.open(); }
      });

      /* Escape cierra paneles y modales :target sin saltar al principio de la página */
      const closeTargetModal = () => {
        /* "#_" no existe: el :target desaparece y el navegador no hace scroll */
        const y = window.scrollY;
        location.hash = '_';
        window.scrollTo(0, y);
      };
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (openDrawer) { openDrawer.close(); return; }
        if (document.querySelector('.modal:target')) closeTargetModal();
      });
      document.addEventListener('click', (e) => {
        const link = e.target.closest('.modal:target a[href="#"]');
        if (link) { e.preventDefault(); closeTargetModal(); }
      });
    },
  });
})();
