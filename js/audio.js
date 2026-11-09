/* audio.js - music (per-page tracks + crossfade) and sound effects (Howler.js, Web Audio fallback).
   NO autoplay: nothing plays until DW.audio.start() is called from the START CELEBRATION click. */
(function () {
  'use strict';
  const DW = (window.DW = window.DW || {});

  const TRACKS = {
    default: 'assets/music/default.mp3',
    'vagh-baras': 'assets/music/vagh-baras.mp3',
    dhanteras: 'assets/music/laxmi.mp3',
    'kali-chaudas': 'assets/music/khali.mp3',
    'main-diwali': 'assets/music/diwali.mp3',
    'gujarati-fun-day': 'assets/music/dhoko.mp3',
    'gujarati-new-year': 'assets/music/newyear1.mp3',
    'bhai-bij': 'assets/music/bhai-bij.mp3',
    'family-wishes': 'assets/music/family.mp3'
  };
  const SFX = {
    diya: { src: ['assets/sounds/diya.mp3'], vol: 0.55, gap: 120 },
    rocket: { src: ['assets/sounds/rocket.mp3'], vol: 0.45, gap: 110 },
    burst: { src: ['assets/sounds/burst.mp3', 'assets/sounds/burst2.mp3', 'assets/sounds/pop.mp3'], vol: 0.6, gap: 70 },
    bell: { src: ['assets/sounds/bell.mp3'], vol: 0.6, gap: 200 },
    celebration: { src: ['assets/sounds/celebration.mp3'], vol: 0.55, gap: 400 }
  };
  const FADE_IN = 2000, FADE_OUT = 1600;

  const st = { started: false, musicOn: true, muted: false, volume: 0.6, key: null, wanted: 'default', music: {}, sfx: {}, last: {}, failed: {}, listeners: [] };
  try {
    const v = parseFloat(localStorage.getItem('dw.volume'));
    if (!isNaN(v)) st.volume = Math.min(1, Math.max(0, v));
  } catch (e) { /* storage may be blocked */ }

  try { if (sessionStorage.getItem('dw.musicOn') === '0') st.musicOn = false; if (sessionStorage.getItem('dw.muted') === '1') st.muted = true; } catch (e) {}
  const keep = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} };
  function emit() { st.listeners.forEach((f) => f(st)); if (typeof ambLevel === 'function') ambLevel(); }

  /* ---------------- Music ---------------- */
  function music(key) {
    if (!st.music[key]) {
      st.music[key] = new Howl({
        src: [TRACKS[key]], html5: true, loop: true, volume: 0, preload: key === 'default',
        onloaderror: () => { st.failed['m:' + key] = true; }
      });
    }
    return st.music[key];
  }
  function stopLater(h) {
    setTimeout(() => { if (h !== st.music[st.key] || !st.musicOn) { h.pause(); h.volume(0); } }, FADE_OUT + 80);
  }
  function crossfadeTo(key) {
    if (!TRACKS[key]) key = 'default';
    const prevKey = st.key;
    if (prevKey === key && st.music[key] && st.music[key].playing()) return;
    const next = music(key);
    st.key = key;
    if (!next.playing()) next.play();
    next.fade(next.volume(), st.volume, FADE_IN);
    if (prevKey && prevKey !== key && st.music[prevKey]) {
      const p = st.music[prevKey];
      p.fade(p.volume(), 0, FADE_OUT);
      stopLater(p);
    }
  }
  function setPage(key) {
    if (key === 'greeting-card' || key === 'find-me') key = 'family-wishes';
    st.wanted = TRACKS[key] ? key : 'default';
    if (st.started && st.musicOn) crossfadeTo(st.wanted);
  }
  function pauseAllMusic() {
    Object.keys(st.music).forEach((k) => { const h = st.music[k]; h.fade(h.volume(), 0, 500); setTimeout(() => { if (!st.musicOn) h.pause(); }, 560); });
  }

  /* ---------------- Controls ---------------- */
  function start() {
    if (st.started) return;
    st.started = true;
    try { if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume(); } catch (e) {}
    Howler.volume(1);
    Howler.mute(st.muted);
    if (st.musicOn) crossfadeTo(st.wanted);
    sfx('bell');
    emit();
  }
  function toggleMusic(force) {
    st.musicOn = typeof force === 'boolean' ? force : !st.musicOn; keep('dw.musicOn', st.musicOn ? '1' : '0');
    if (st.started) { if (st.musicOn) crossfadeTo(st.wanted); else pauseAllMusic(); }
    emit();
  }
  function toggleMute(force) {
    st.muted = typeof force === 'boolean' ? force : !st.muted; keep('dw.muted', st.muted ? '1' : '0');
    Howler.mute(st.muted);
    emit();
  }
  function setVolume(v) {
    st.volume = Math.min(1, Math.max(0, v));
    try { localStorage.setItem('dw.volume', String(st.volume)); } catch (e) {}
    if (st.key && st.music[st.key] && st.musicOn && st.started) st.music[st.key].volume(st.volume);
    if (st.muted && st.volume > 0) { st.muted = false; Howler.mute(false); }
    emit();
  }

  /* ---------------- Sound effects ---------------- */
  function sfxHowl(name, i) {
    const id = name + i;
    if (!st.sfx[id]) {
      const d = SFX[name];
      st.sfx[id] = new Howl({ src: [d.src[i]], volume: d.vol, preload: true, onloaderror: () => { st.failed[id] = true; } });
    }
    return st.sfx[id];
  }
  function sfx(name, opts) {
    opts = opts || {};
    const d = SFX[name];
    if (!d || !st.started) return;
    const now = performance.now();
    if (st.last[name] && now - st.last[name] < d.gap) return;
    st.last[name] = now;
    const i = Math.floor(Math.random() * d.src.length);
    const id = name + i;
    const vol = (opts.volume == null ? 1 : opts.volume) * d.vol;
    const h = sfxHowl(name, i);
    if (st.failed[id] || h.state() === 'unloaded' && st.failed[id]) { synth(name, vol, opts); return; }
    if (h.state() !== 'loaded') { // not ready yet -> play synth instead of silence
      h.once('load', () => {});
      synth(name, vol, opts);
      return;
    }
    const sid = h.play();
    h.volume(Math.min(1, vol), sid);
    h.rate(opts.rate || 0.92 + Math.random() * 0.2, sid);
  }

  /* ---------------- Web Audio fallback synth ---------------- */
  function actx() { return Howler.ctx || null; }
  function out() { return Howler.masterGain || (actx() && actx().destination); }
  function noise(ctx, dur) {
    const b = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = b; return s;
  }
  function env(ctx, g, t0, a, d, peak) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }
  function tone(ctx, type, f0, f1, t0, dur, peak) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t0);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    env(ctx, g, t0, 0.01, dur, peak); o.connect(g); g.connect(out()); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function synth(name, vol) {
    const ctx = actx(); if (!ctx || !out()) return;
    const t = ctx.currentTime + 0.01;
    try {
      if (name === 'diya') {
        for (let i = 0; i < 4; i++) {
          const n = noise(ctx, 0.08), f = ctx.createBiquadFilter(), g = ctx.createGain();
          f.type = 'bandpass'; f.frequency.value = 2500 + Math.random() * 3000;
          env(ctx, g, t + i * 0.05 + Math.random() * 0.03, 0.005, 0.06, vol * 0.5);
          n.connect(f); f.connect(g); g.connect(out()); n.start(t + i * 0.05); n.stop(t + i * 0.05 + 0.1);
        }
        tone(ctx, 'sine', 300, 600, t, 0.25, vol * 0.25);
      } else if (name === 'rocket') {
        tone(ctx, 'sawtooth', 300, 2200, t, 0.9, vol * 0.18);
        const n = noise(ctx, 1), f = ctx.createBiquadFilter(), g = ctx.createGain();
        f.type = 'highpass'; f.frequency.value = 2500; env(ctx, g, t, 0.05, 0.9, vol * 0.25);
        n.connect(f); f.connect(g); g.connect(out()); n.start(t); n.stop(t + 1);
      } else if (name === 'burst') {
        const n = noise(ctx, 1.2), f = ctx.createBiquadFilter(), g = ctx.createGain();
        f.type = 'lowpass'; f.frequency.setValueAtTime(5000, t); f.frequency.exponentialRampToValueAtTime(180, t + 0.9);
        env(ctx, g, t, 0.004, 1.0, vol * 1.1); n.connect(f); f.connect(g); g.connect(out()); n.start(t); n.stop(t + 1.2);
        tone(ctx, 'sine', 140, 40, t, 0.5, vol * 1.0);
        for (let i = 0; i < 6; i++) { // crackle tail
          const c = noise(ctx, 0.04), cg = ctx.createGain(), s = t + 0.25 + Math.random() * 0.7;
          env(ctx, cg, s, 0.002, 0.03, vol * 0.25); c.connect(cg); cg.connect(out()); c.start(s); c.stop(s + 0.05);
        }
      } else if (name === 'bell') {
        const f = 880;
        [[1, 1], [2.76, 0.5], [5.4, 0.3], [8.93, 0.15]].forEach((p) => tone(ctx, 'sine', f * p[0], f * p[0], t, 2.4 / p[0] + 0.4, vol * 0.35 * p[1]));
      } else if (name === 'celebration') {
        [523, 659, 784, 1047, 1319].forEach((fr, i) => tone(ctx, 'triangle', fr, fr, t + i * 0.09, 0.9, vol * 0.3));
        for (let i = 0; i < 10; i++) {
          const c = noise(ctx, 0.05), cg = ctx.createGain(), s = t + 0.1 + Math.random() * 1.2;
          env(ctx, cg, s, 0.002, 0.04, vol * 0.3); c.connect(cg); cg.connect(out()); c.start(s); c.stop(s + 0.06);
        }
      }
    } catch (e) { /* audio is optional */ }
  }

  document.addEventListener('visibilitychange', () => {
    // music is paused while the tab is hidden so it never plays in the background
    if (!st.started) return;
    if (document.hidden) { Object.keys(st.music).forEach((k) => st.music[k].playing() && st.music[k].pause()); }
    else if (st.musicOn && st.key && st.music[st.key]) { st.music[st.key].play(); }
  });

  // warm up SFX so they are decoded before the first click (creating a Howl never plays anything)
  setTimeout(() => Object.keys(SFX).forEach((n) => SFX[n].src.forEach((_, i) => sfxHowl(n, i))), 300);

  /* ---------------- optional spooky ambience (page 3 only): synthesized, user-controlled, OFF by default ---------------- */
  const amb = { on: false, ctx: null, g: null, nodes: [] };
  function ambLevel() { if (amb.g) amb.g.gain.setTargetAtTime(amb.on && !st.muted ? st.volume * 0.5 : 0, amb.ctx.currentTime, 0.2); }
  function ambience(on) {
    if (!on) {
      amb.on = false;
      if (amb.g) { const g = amb.g, c = amb.ctx, n = amb.nodes; g.gain.setTargetAtTime(0, c.currentTime, 0.2); amb.g = null; amb.nodes = []; setTimeout(() => { n.forEach((x) => { try { x.stop(); } catch (e) {} }); try { g.disconnect(); } catch (e) {} }, 1200); }
      return false;
    }
    if (amb.on) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!amb.ctx) amb.ctx = new AC(); const c = amb.ctx; if (c.state === 'suspended') c.resume();
      const g = c.createGain(); g.gain.value = 0; g.connect(c.destination);
      const len = c.sampleRate * 3, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0); let last = 0;
      for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
      const ns = c.createBufferSource(); ns.buffer = buf; ns.loop = true;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380;
      const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.12; lg.gain.value = 160; lfo.connect(lg); lg.connect(lp.frequency);
      ns.connect(lp); lp.connect(g);
      const o1 = c.createOscillator(), o2 = c.createOscillator(), dg = c.createGain(); o1.frequency.value = 55; o2.frequency.value = 58.3; dg.gain.value = 0.22; o1.connect(dg); o2.connect(dg); dg.connect(g);
      [ns, lfo, o1, o2].forEach((x) => x.start());
      amb.g = g; amb.nodes = [ns, lfo, o1, o2]; amb.on = true; ambLevel(); return true;
    } catch (e) { return false; }
  }

  function reset() {
    ambience(false); // back to the welcome screen: silence everything, music restarts on the next Continue
    Object.keys(st.music).forEach((k) => { try { st.music[k].stop(); st.music[k].volume(0); } catch (e) {} });
    st.started = false; st.key = null; st.wanted = 'default'; emit();
  }

  DW.audio = { ambience, reset, state: st, start, setPage, toggleMusic, toggleMute, setVolume, sfx, onChange: (f) => st.listeners.push(f) };
})();
