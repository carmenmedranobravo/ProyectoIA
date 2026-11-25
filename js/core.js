/* ==========================================================================
   BLACKSITE OS · core.js
   Núcleo compartido por todos los módulos:
   - espacio de nombres global BS
   - utilidades DOM y matemáticas
   - almacenamiento seguro (localStorage / sessionStorage)
   - bus de eventos (on / emit)
   - registro y arranque de módulos (cada uno aislado en try/catch)
   Se carga en <head> SIN defer para marcar <html class="js"> antes de pintar.
   ========================================================================== */
(() => {
  'use strict';

  const BS = (window.BS = window.BS || {});
  const root = document.documentElement;

  BS.version = '2.0.0';
  root.classList.add('js');

  /* ---------- DOM ---------- */
  BS.$ = (sel, ctx = document) => ctx.querySelector(sel);
  BS.$$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /**
   * Crea un elemento.  BS.el('button', { class: 'btn', text: 'OK', on: { click } }, [hijos])
   */
  BS.el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'html') node.innerHTML = value;
      else if (key === 'dataset') Object.assign(node.dataset, value);
      else if (key === 'style') node.style.cssText = value;
      else if (key === 'on') Object.entries(value).forEach(([evt, fn]) => node.addEventListener(evt, fn));
      else node.setAttribute(key, value === true ? '' : value);
    });
    [].concat(children).forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return node;
  };

  BS.escape = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** Normaliza texto para búsquedas: minúsculas y sin tildes */
  BS.normalize = (str) =>
    String(str).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

  /* ---------- Matemáticas y tiempo ---------- */
  BS.rand = (min, max) => Math.random() * (max - min) + min;
  BS.randInt = (min, max) => Math.floor(BS.rand(min, max + 1));
  BS.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  BS.clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  BS.pad = (n, len = 2) => String(n).padStart(len, '0');
  BS.wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  BS.time = (d = new Date()) => `${BS.pad(d.getUTCHours())}:${BS.pad(d.getUTCMinutes())}:${BS.pad(d.getUTCSeconds())}`;

  /* ---------- Entorno ---------- */
  const mq = (q) => (window.matchMedia ? window.matchMedia(q).matches : false);
  BS.reducedMotion = mq('(prefers-reduced-motion: reduce)');
  BS.finePointer = mq('(hover: hover) and (pointer: fine)');
  BS.isTyping = (target = document.activeElement) =>
    !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

  /* ---------- Almacenamiento seguro ---------- */
  const makeStore = (getArea) => ({
    get(key, fallback = null) {
      try {
        const raw = getArea().getItem(`bs7.${key}`);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try { getArea().setItem(`bs7.${key}`, JSON.stringify(value)); } catch (e) { /* almacenamiento no disponible */ }
      return value;
    },
    remove(key) {
      try { getArea().removeItem(`bs7.${key}`); } catch (e) { /* idem */ }
    },
    clear() {
      try {
        const area = getArea();
        Object.keys(area).filter((k) => k.startsWith('bs7.')).forEach((k) => area.removeItem(k));
      } catch (e) { /* idem */ }
    },
  });
  BS.store = makeStore(() => window.localStorage);
  BS.session = makeStore(() => window.sessionStorage);

  /* ---------- Bus de eventos ---------- */
  const listeners = {};
  BS.on = (evt, fn) => {
    (listeners[evt] = listeners[evt] || []).push(fn);
    return () => BS.off(evt, fn);
  };
  BS.off = (evt, fn) => {
    listeners[evt] = (listeners[evt] || []).filter((f) => f !== fn);
  };
  BS.emit = (evt, detail) => {
    (listeners[evt] || []).slice().forEach((fn) => {
      try { fn(detail); } catch (e) { console.warn(`[BS] error en el evento "${evt}"`, e); }
    });
  };

  /* ---------- Entrada cinematográfica ----------
     Si venimos de otra página por una transición, ocultamos el contenido
     desde el primer pintado (transitions.js abre el obturador después). */
  if (BS.session.get('transition') && !BS.reducedMotion) root.classList.add('is-entering');

  /* ---------- Registro de módulos ---------- */
  const modules = [];
  BS.modules = {};

  /**
   * BS.register('nombre', { pages: ['control'], init() {...} })
   * Si "pages" se omite, el módulo se ejecuta en todas las páginas.
   */
  BS.register = (name, def) => modules.push({ name, ...def });

  BS.start = () => {
    BS.page = (document.body && document.body.dataset.page) || 'unknown';
    modules.forEach((mod) => {
      if (mod.pages && !mod.pages.includes(BS.page)) return;
      try {
        mod.init();
        BS.modules[mod.name] = true;
      } catch (e) {
        BS.modules[mod.name] = false;
        console.warn(`[BS] el módulo "${mod.name}" no ha podido iniciarse`, e);
      }
    });
    BS.emit('ready');
  };
})();
