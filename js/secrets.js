/* ==========================================================================
   BLACKSITE OS · secrets.js
   Sistema de descubrimientos secretos mediante códigos ocultos.
   Los códigos se pueden:
     - teclear en cualquier página (fuera de campos de texto),
     - introducir en la terminal:  CODE <código>,
     - escribir en los formularios de documentos bloqueados.
   Las pistas están repartidas por el contenido de la web.
   Emite "secret:unlocked" ({ id }) y guarda el progreso en localStorage.
   ========================================================================== */
(() => {
  'use strict';

  const SECRETS = [
    { id: 'clr5',          name: 'Modo CLR-5',              codes: [],            reward: 'El texto censurado queda a la vista', hint: 'Un viejo código de consola: ↑ ↑ ↓ ↓ …' },
    { id: 'espejo',        name: 'Proyecto ESPEJO',          codes: ['7741K'],     reward: 'Desbloquea LCK-03 en el archivo',     hint: 'Su propia credencial de operador' },
    { id: 'exp005',        name: 'EXP-005 · The Echo',       codes: ['0300'],      reward: 'Nuevo experimento y LCK-04',           hint: 'La hora a la que sale el sol rojo' },
    { id: 'autopsias',     name: 'Autopsias INC-2046-0031',  codes: ['ARENAS'],    reward: 'Documento CLR-5 del expediente',       hint: 'El técnico que oyó su propia voz' },
    { id: 'omega',         name: 'Llave del Director',       codes: ['HALVORSEN'], reward: 'Autoriza el Protocolo Omega',          hint: 'Quien firmó el memorándum Nº 0007' },
    { id: 'archivo-omega', name: 'Archivo Ω',                codes: [],            reward: 'Un mensaje enviado desde mañana',      hint: 'Un punto rojo casi invisible en el archivo' },
  ];

  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  const clean = (code) => String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');

  let unlocked = BS.store.get('secrets', []);

  const applyGlobalEffects = () => {
    const clr5 = unlocked.includes('clr5');
    document.documentElement.classList.toggle('clr5', clr5);
    BS.$$('.access__lvl').forEach((el) => { el.textContent = clr5 ? 'CLR-5' : 'CLR-4'; });
  };

  BS.secrets = {
    list: () => SECRETS.map((s) => ({ ...s, unlocked: unlocked.includes(s.id) })),
    has: (id) => unlocked.includes(id),
    get: (id) => SECRETS.find((s) => s.id === id),

    unlock(id, { silent = false } = {}) {
      const secret = BS.secrets.get(id);
      if (!secret) return null;
      if (unlocked.includes(id)) return { secret, already: true };
      unlocked.push(id);
      BS.store.set('secrets', unlocked);
      applyGlobalEffects();
      if (!silent) {
        BS.sfx.play('unlock');
        BS.notify({
          level: 'crit',
          title: `Descubrimiento ${unlocked.length}/${SECRETS.length}: ${secret.name}`,
          msg: secret.reward,
          timeout: 8000,
          action: { label: 'Ver descubrimientos', onClick: () => BS.ui.settings.open() },
        });
      }
      BS.emit('secret:unlocked', { id });
      return { secret, already: false };
    },

    /** Devuelve { secret, already } si el código es válido, o null */
    tryCode(code) {
      const value = clean(code);
      const secret = SECRETS.find((s) => s.codes.includes(value));
      return secret ? BS.secrets.unlock(secret.id) : null;
    },

    /**
     * Ventana para introducir un código (documentos bloqueados).
     * expected: id del secreto que desbloquea ese documento.
     */
    prompt({ title, kicker = 'Documento bloqueado', text = '', expected = null, onSuccess = null }) {
      const field = BS.el('input', { class: 'code-form__field', type: 'text', autocomplete: 'off', spellcheck: 'false', maxlength: '12', 'aria-label': 'Código de acceso', placeholder: '______' });
      const msg = BS.el('p', { class: 'code-form__msg', 'aria-live': 'assertive' });
      const form = BS.el('form', { class: 'code-form' }, [
        text ? BS.el('p', { html: text }) : null,
        field,
        msg,
        BS.el('div', { class: 'modal__actions' }, [
          BS.el('button', { type: 'submit', class: 'btn btn--primary', text: 'Verificar código' }),
        ]),
      ]);
      const modal = BS.ui.modal({ kicker, title, body: form });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.classList.remove('is-error');
        const res = BS.secrets.tryCode(field.value);
        if (res && (!expected || res.secret.id === expected)) {
          modal.close();
          if (onSuccess) onSuccess(res);
          return;
        }
        void form.offsetWidth;
        form.classList.add('is-error');
        msg.textContent = res ? `Código válido (${res.secret.name}), pero no abre este documento` : 'Código incorrecto · intento registrado';
        if (!res) BS.sfx.play('error');
        field.select();
      });
      return modal;
    },
  };

  BS.register('secrets', {
    init() {
      applyGlobalEffects();

      /* Códigos tecleados en cualquier parte + secuencia Konami */
      let buffer = '';
      let konami = 0;
      document.addEventListener('keydown', (e) => {
        if (BS.isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
        const key = e.key.toLowerCase();

        konami = key === KONAMI[konami] ? konami + 1 : key === KONAMI[0] ? 1 : 0;
        if (konami === KONAMI.length) {
          konami = 0;
          BS.secrets.unlock('clr5');
        }

        if (/^[a-z0-9]$/.test(key)) {
          buffer = (buffer + key.toUpperCase()).slice(-12);
          const match = SECRETS.find((s) => !unlocked.includes(s.id) && s.codes.some((c) => buffer.endsWith(c)));
          if (match) { buffer = ''; BS.secrets.unlock(match.id); }
        }
      });

      /* El enlace oculto del archivo lleva a #file-omega */
      const checkHash = () => { if (location.hash === '#file-omega') BS.secrets.unlock('archivo-omega'); };
      window.addEventListener('hashchange', checkHash);
      checkHash();

      /* Pista para curiosos que abren la consola del navegador */
      console.info('%cBLACKSITE OS 4.7.2', 'color:#E53935;font:700 14px monospace;letter-spacing:.2em');
      console.info('%cLos operadores veteranos recuerdan un viejo código: ↑ ↑ ↓ ↓ ← → ← → B A', 'color:#777;font:12px monospace');
    },
  });
})();
