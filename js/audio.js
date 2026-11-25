/* ==========================================================================
   BLACKSITE OS · audio.js
   Efectos de sonido sintetizados con Web Audio API (sin archivos de audio).
   Desactivados por defecto; se activan desde el dock o los ajustes.
   API: BS.sfx.play('beep'), BS.sfx.siren(true|false), BS.sfx.enabled()
   ========================================================================== */
(() => {
  'use strict';

  let ctx = null;
  let master = null;
  let sirenNodes = null;
  let sirenWanted = false;

  const enabled = () => !!BS.prefs.get('sound');

  /** El contexto de audio solo puede crearse tras un gesto del usuario */
  const ensureCtx = () => {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.value = BS.prefs.get('volume') * 0.6;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };

  /** Tono simple con envolvente */
  const tone = ({ freq = 880, to = null, type = 'square', dur = 0.08, gain = 0.15, delay = 0 }) => {
    const c = ensureCtx();
    if (!c) return;
    const t = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  };

  /** Ráfaga de ruido blanco (interferencias) */
  const noise = (dur = 0.3, gain = 0.12) => {
    const c = ensureCtx();
    if (!c) return;
    const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = c.createBufferSource();
    const g = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    g.gain.value = gain;
    src.buffer = buffer;
    src.connect(filter).connect(g).connect(master);
    src.start();
  };

  const SOUNDS = {
    click:   () => tone({ freq: 1400, dur: 0.03, gain: 0.06 }),
    hover:   () => tone({ freq: 2200, dur: 0.015, gain: 0.02, type: 'sine' }),
    type:    () => tone({ freq: BS.rand(1700, 2100), dur: 0.012, gain: 0.025 }),
    beep:    () => tone({ freq: 880, dur: 0.12, type: 'sine', gain: 0.12 }),
    confirm: () => { tone({ freq: 660, dur: 0.07, type: 'sine' }); tone({ freq: 990, dur: 0.1, type: 'sine', delay: 0.07 }); },
    error:   () => { tone({ freq: 180, dur: 0.14, type: 'sawtooth', gain: 0.1 }); tone({ freq: 140, dur: 0.18, type: 'sawtooth', gain: 0.1, delay: 0.15 }); },
    alert:   () => { tone({ freq: 740, to: 520, dur: 0.25, type: 'triangle', gain: 0.16 }); tone({ freq: 740, to: 520, dur: 0.25, type: 'triangle', gain: 0.16, delay: 0.3 }); },
    unlock:  () => [523, 659, 784, 1046].forEach((f, i) => tone({ freq: f, dur: 0.12, type: 'sine', gain: 0.12, delay: i * 0.08 })),
    boot:    () => tone({ freq: 120, to: 1200, dur: 0.9, type: 'sawtooth', gain: 0.07 }),
    whoosh:  () => { tone({ freq: 400, to: 60, dur: 0.45, type: 'sine', gain: 0.12 }); noise(0.35, 0.05); },
    glitch:  () => { noise(0.25, 0.14); tone({ freq: 90, dur: 0.2, type: 'square', gain: 0.05 }); },
  };

  /* ---------- Sirena en bucle (alarmas) ---------- */
  const startSiren = () => {
    const c = ensureCtx();
    if (!c || sirenNodes) return;
    const osc = c.createOscillator();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 620;
    lfo.frequency.value = 0.8;
    lfoGain.gain.value = 180;
    g.gain.value = 0.07;
    lfo.connect(lfoGain).connect(osc.frequency);
    osc.connect(g).connect(master);
    osc.start();
    lfo.start();
    sirenNodes = { osc, lfo, g };
  };
  const stopSiren = () => {
    if (!sirenNodes) return;
    const { osc, lfo, g } = sirenNodes;
    g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.1);
    osc.stop(ctx.currentTime + 0.4);
    lfo.stop(ctx.currentTime + 0.4);
    sirenNodes = null;
  };

  BS.sfx = {
    enabled,
    play(name) {
      if (!enabled() || !SOUNDS[name]) return;
      try { SOUNDS[name](); } catch (e) { /* audio no disponible */ }
    },
    siren(on) {
      sirenWanted = on;
      if (on && enabled()) startSiren();
      else stopSiren();
    },
  };

  BS.on('prefs:change', ({ key, value }) => {
    if (key === 'volume' && master) master.gain.value = value * 0.6;
    if (key === 'sound') {
      if (value) { ensureCtx(); if (sirenWanted) startSiren(); }
      else stopSiren();
    }
  });

  /* Sonidos de interfaz: clic en elementos interactivos y hover en enlaces de navegación */
  BS.register('audio-ui', {
    init() {
      document.addEventListener('click', (e) => {
        if (e.target.closest('a, button, label, summary')) BS.sfx.play('click');
      });
      document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('.nav__link, .dropdown__link, .module, .btn');
        if (link && !link.contains(e.relatedTarget)) BS.sfx.play('hover');
      });
    },
  });
})();
