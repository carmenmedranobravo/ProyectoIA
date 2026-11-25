/* ==========================================================================
   BLACKSITE OS · notify.js
   Sistema de notificaciones (toasts) con registro persistente por sesión.
   BS.notify({ level: 'info'|'ok'|'warn'|'crit', title, msg, timeout, action, log })
   ========================================================================== */
(() => {
  'use strict';

  const MAX_VISIBLE = 4;
  const MAX_LOG = 40;
  const LEVEL_LABEL = { info: 'Sistema', ok: 'Confirmado', warn: 'Aviso', crit: 'Alerta crítica' };
  let container = null;
  let log = BS.session.get('notifications', []);
  let unread = BS.session.get('unread', 0);

  const getContainer = () => {
    if (!container) {
      container = BS.el('div', { class: 'toasts', 'aria-live': 'polite', 'aria-label': 'Notificaciones' });
      document.body.append(container);
    }
    return container;
  };

  const dismiss = (toast) => {
    if (!toast || toast.classList.contains('is-leaving')) return;
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 350);
  };

  const setUnread = (n) => {
    unread = n;
    BS.session.set('unread', n);
    BS.emit('notify:count', n);
  };

  function notify({ level = 'info', title = '', msg = '', timeout = 6000, action = null, log: keep = true } = {}) {
    const time = BS.time();

    if (keep) {
      log.unshift({ level, title, msg, time });
      log = log.slice(0, MAX_LOG);
      BS.session.set('notifications', log);
      setUnread(unread + 1);
    }

    /* Con el apagón de comunicaciones activo solo pasan las alertas críticas */
    if (notify.muted && level !== 'crit') return null;

    const box = getContainer();
    const toast = BS.el('div', {
      class: `toast toast--${level}`,
      role: level === 'crit' ? 'alert' : 'status',
      style: `--life:${timeout}ms`,
    }, [
      BS.el('div', { class: 'toast__head' }, [BS.el('span', { text: LEVEL_LABEL[level] || 'Sistema' }), BS.el('time', { text: time })]),
      title ? BS.el('p', { class: 'toast__title', text: title }) : null,
      msg ? BS.el('p', { class: 'toast__msg', text: msg }) : null,
      action ? BS.el('div', { class: 'toast__action' }, [
        action.href
          ? BS.el('a', { class: 'btn btn--sm', href: action.href, text: action.label })
          : BS.el('button', { type: 'button', class: 'btn btn--sm', text: action.label, on: { click: () => { action.onClick(); dismiss(toast); } } }),
      ]) : null,
      BS.el('button', { type: 'button', class: 'toast__close', 'aria-label': 'Cerrar notificación', text: '✕', on: { click: () => dismiss(toast) } }),
      timeout ? BS.el('span', { class: 'toast__life', 'aria-hidden': 'true' }) : null,
    ]);

    box.prepend(toast);
    Array.from(box.children).slice(MAX_VISIBLE).forEach(dismiss);

    if (timeout) {
      const life = toast.querySelector('.toast__life');
      life.addEventListener('animationend', () => dismiss(toast));
    }

    if (BS.sfx) BS.sfx.play(level === 'crit' ? 'alert' : level === 'warn' ? 'beep' : 'click');
    BS.emit('notify', { level, title, msg, time });
    return toast;
  }

  notify.muted = false;
  notify.log = () => log.slice();
  notify.unread = () => unread;
  notify.markRead = () => setUnread(0);
  notify.clear = () => {
    log = [];
    BS.session.set('notifications', log);
    setUnread(0);
  };

  BS.notify = notify;
})();
