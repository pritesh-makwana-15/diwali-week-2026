/* fireworks.js - custom Canvas fireworks + rockets for Page 4 (Main Diwali).
   Time-based, requestAnimationFrame only, paused when the tab is hidden. */
(function () {
  'use strict';
  const DW = (window.DW = window.DW || {});
  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[(Math.random() * a.length) | 0];

  const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const PALETTES = [
    ['#FFD700', '#FF9933'], ['#FF9933', '#FF3D00'], ['#FF3B5C', '#FFB3C0'], ['#7DF9FF', '#2E8BFF'],
    ['#B388FF', '#F06BFF'], ['#69F0AE', '#00C853'], ['#FFF2D5', '#FFD700'], ['#FF6F91', '#FFC75F'], ['#FFD700', '#A51C30']
  ].map((p) => p.map(hex));
  const TYPES = ['peony', 'chrysanthemum', 'ring', 'willow', 'palm', 'crackle', 'heart', 'double'];

  class Engine {
    constructor(canvas, opts) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.o = Object.assign({ mobile: false, reduced: false, onBurst: null, onLaunch: null }, opts || {});
      this.rockets = []; this.parts = []; this.flashes = []; this.emitters = []; this.queue = [];
      this.running = false; this.raf = 0; this.last = 0; this.clock = 0;
      this.auto = false; this.autoT = 0; this.wasRunning = false; this.dirty = false;
      this.max = this.o.mobile ? 650 : 1700;
      this._loop = this._loop.bind(this);
      this._vis = () => { if (document.hidden) { this.wasRunning = this.running; this.stop(); } else if (this.wasRunning) { this.start(); } };
      document.addEventListener('visibilitychange', this._vis);
      this.resize();
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, this.o.mobile ? 1.5 : 2);
      const w = this.c.clientWidth || window.innerWidth, h = this.c.clientHeight || window.innerHeight;
      this.w = w; this.h = h; this.dpr = dpr;
      this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.scale = Math.max(0.55, Math.min(1.35, Math.min(w, h * 1.3) / 800));
    }

    start() { if (this.running) return; this.running = true; this.last = performance.now(); this.raf = requestAnimationFrame(this._loop); }
    stop() { this.running = false; cancelAnimationFrame(this.raf); }
    destroy() { this.stop(); document.removeEventListener('visibilitychange', this._vis); this.rockets.length = this.parts.length = this.flashes.length = this.queue.length = 0; this.ctx.clearRect(0, 0, this.w, this.h); }
    clear() { this.rockets.length = this.parts.length = this.flashes.length = this.emitters.length = this.queue.length = 0; this.ctx.clearRect(0, 0, this.w, this.h); }
    schedule(ms, fn) { this.queue.push({ t: this.clock + ms / 1000, fn }); this.start(); }

    /* ---------- public actions ---------- */
    launch(tx, ty, type, x0) {
      this.start();
      const w = this.w, h = this.h;
      if (tx == null) { tx = rand(w * 0.1, w * 0.9); }
      if (ty == null) { ty = rand(h * 0.1, h * 0.42); }
      const sx = x0 != null ? x0 : Math.max(20, Math.min(w - 20, tx + rand(-90, 90)));
      const T = rand(0.75, 1.15) + (h - ty) / h * 0.45;
      this.rockets.push({ x0: sx, y0: h + 6, tx, ty, t: 0, T, x: sx, y: h, type: type || pick(TYPES), pal: pick(PALETTES), wob: rand(0, TAU) });
      if (this.o.onLaunch) this.o.onLaunch(sx, h);
      if (DW.audio) DW.audio.sfx('rocket');
    }
    burst(count) {
      // BURST OF FIREWORKS button: a staggered volley across the sky + a finale
      const n = count || (this.o.reduced ? 4 : this.o.mobile ? 9 : 14);
      for (let i = 0; i < n; i++) {
        const fx = (i + 0.5) / n;
        this.schedule(i * rand(160, 300), () => this.launch(this.w * (0.08 + 0.84 * fx + rand(-0.04, 0.04)), rand(this.h * 0.1, this.h * 0.45)));
      }
      const fin = n * 260 + 500;
      const k = this.o.reduced ? 2 : 5;
      for (let j = 0; j < k; j++) this.schedule(fin + j * 90, () => this.launch(this.w * (0.2 + 0.15 * j + rand(-0.03, 0.03)), rand(this.h * 0.12, this.h * 0.3), j % 2 ? 'chrysanthemum' : 'willow'));
      if (DW.audio) DW.audio.sfx('celebration');
    }
    setAuto(on) { this.auto = !!on && !this.o.reduced; this.autoT = 0; if (this.auto) this.start(); }
    fountain(x, y, dur) { this.emitters.push({ x, y, life: dur || 1.1, acc: 0 }); this.start(); }

    /* ---------- internals ---------- */
    _add(p) { if (this.parts.length < this.max) this.parts.push(p); }

    _explode(x, y, type, pal) {
      const f = (this.o.mobile ? 0.55 : 1) * (this.o.reduced ? 0.5 : 1), s = this.scale;
      const c1 = pal[0], c2 = pal[1];
      const mk = (ang, sp, col, o) => {
        const p = Object.assign({ x, y, px: x, py: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, col, life: 1, max: rand(1.5, 2.3), size: rand(1.1, 1.9), drag: 1.9, g: 55 * s, flick: Math.random() < 0.35, w: 1 }, o || {});
        this._add(p);
      };
      switch (type) {
        case 'ring': {
          const n = (72 * f) | 0, tilt = rand(0.25, 1);
          for (let i = 0; i < n; i++) { const a = (i / n) * TAU; mk(a, 250 * s, c1, { vy: Math.sin(a) * 250 * s * tilt, size: 1.8, max: 2 }); }
          for (let i = 0; i < n / 2; i++) { const a = (i / (n / 2)) * TAU; mk(a, 120 * s, c2, { vy: Math.sin(a) * 120 * s * tilt, size: 1.4, max: 1.7 }); }
          break;
        }
        case 'heart': {
          const n = (80 * f) | 0;
          for (let i = 0; i < n; i++) {
            const t = (i / n) * TAU, hx = 16 * Math.pow(Math.sin(t), 3), hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            this._add({ x, y, px: x, py: y, vx: hx * 13 * s, vy: hy * 13 * s, col: pick([[255, 59, 92], [255, 179, 192], [255, 215, 0]]), life: 1, max: 2.3, size: 2, drag: 2.1, g: 35 * s, flick: false, w: 1 });
          }
          break;
        }
        case 'willow': {
          const n = (80 * f) | 0;
          for (let i = 0; i < n; i++) mk(rand(0, TAU), rand(90, 260) * s, i % 5 ? hex('#FFD700') : hex('#FFF2D5'), { drag: 1.1, g: 120 * s, max: rand(2.8, 4), size: 1.5, flick: true });
          break;
        }
        case 'palm': {
          const arms = 9, per = Math.round(9 * f) + 4;
          for (let a = 0; a < arms; a++) { const ang = (a / arms) * TAU + rand(-0.08, 0.08); for (let k = 0; k < Math.max(4, per); k++) mk(ang + rand(-0.03, 0.03), (150 + k * 22) * s, k % 2 ? c1 : c2, { drag: 1.5, g: 140 * s, max: 2.4, size: 2 }); }
          break;
        }
        case 'crackle': {
          const n = (70 * f) | 0;
          for (let i = 0; i < n; i++) mk(rand(0, TAU), rand(120, 300) * s, i % 3 ? c1 : [255, 255, 255], { crackle: true, max: rand(1.1, 1.7), size: 2 });
          break;
        }
        case 'chrysanthemum': {
          const n = (120 * f) | 0;
          for (let i = 0; i < n; i++) mk(rand(0, TAU), rand(100, 330) * s, i % 3 ? c1 : c2, { max: rand(1.8, 2.6), drag: 1.7, size: 1.6, glow: true });
          break;
        }
        case 'double': {
          const n = (80 * f) | 0, alt = pick(PALETTES);
          for (let i = 0; i < n; i++) mk((i / n) * TAU, 300 * s, c1, { size: 1.8 });
          for (let i = 0; i < n * 0.7; i++) mk((i / (n * 0.7)) * TAU + 0.1, 150 * s, alt[0], { size: 1.5, max: 1.9 });
          break;
        }
        default: { // peony
          const n = (110 * f) | 0;
          for (let i = 0; i < n; i++) { const sp = (0.82 + 0.18 * Math.random()) * 310 * s; mk((i / n) * TAU + rand(-0.04, 0.04), sp, i % 2 ? c1 : c2, { size: 1.8 }); }
        }
      }
      this.flashes.push({ x, y, r: 120 * s * (type === 'willow' ? 1.3 : 1), life: 0.45, max: 0.45, col: c1 });
      if (this.o.onBurst) this.o.onBurst(x, y, c1);
      if (DW.audio) DW.audio.sfx('burst', { volume: rand(0.7, 1) });
    }

    _loop(now) {
      if (!this.running) return;
      const dt = Math.min(0.033, (now - this.last) / 1000 || 0.016); this.last = now; this.clock += dt;
      const ctx = this.ctx;

      // scheduled events (RAF clock => pauses with the tab)
      for (let i = this.queue.length - 1; i >= 0; i--) if (this.queue[i].t <= this.clock) { const q = this.queue.splice(i, 1)[0]; q.fn(); }
      if (this.auto) { this.autoT -= dt; if (this.autoT <= 0) { this.autoT = rand(0.35, 0.85); this.launch(); if (Math.random() < 0.3) this.launch(); } }

      // rockets
      for (let i = this.rockets.length - 1; i >= 0; i--) {
        const r = this.rockets[i]; r.t += dt; const p = Math.min(1, r.t / r.T), e = 1 - Math.pow(1 - p, 2.4);
        r.px = r.x; r.py = r.y;
        r.x = r.x0 + (r.tx - r.x0) * e + Math.sin(r.t * 22 + r.wob) * 2.2 * (1 - p);
        r.y = r.y0 + (r.ty - r.y0) * e;
        if (!this.o.reduced || Math.random() < 0.4) this._add({ x: r.x, y: r.y, px: r.x, py: r.y, vx: rand(-14, 14), vy: rand(10, 50), col: [255, 190, 90], life: 1, max: rand(0.35, 0.6), size: rand(0.9, 1.5), drag: 2, g: 20, flick: false, w: 1 });
        if (p >= 1) { this.rockets.splice(i, 1); this._explode(r.x, r.y, r.type, r.pal); }
      }
      // fountains (anar) from clicked diyas
      for (let i = this.emitters.length - 1; i >= 0; i--) {
        const em = this.emitters[i]; em.life -= dt; em.acc += dt * 70;
        while (em.acc >= 1) { em.acc--; this._add({ x: em.x, y: em.y, px: em.x, py: em.y, vx: rand(-45, 45), vy: -rand(120, 230), col: pick([[255, 215, 0], [255, 153, 51], [255, 242, 213]]), life: 1, max: rand(0.7, 1.2), size: 1.4, drag: 0.6, g: 330, flick: true, w: 1 }); }
        if (em.life <= 0) this.emitters.splice(i, 1);
      }

      // fade previous frame (creates the trails)
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,' + (1 - Math.exp(-dt * 7.5)).toFixed(3) + ')';
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      // flashes
      for (let i = this.flashes.length - 1; i >= 0; i--) {
        const f = this.flashes[i]; f.life -= dt; if (f.life <= 0) { this.flashes.splice(i, 1); continue; }
        const a = (f.life / f.max), g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * (1.4 - a * 0.4));
        g.addColorStop(0, 'rgba(255,255,255,' + (0.55 * a).toFixed(3) + ')');
        g.addColorStop(0.35, 'rgba(' + f.col[0] + ',' + f.col[1] + ',' + f.col[2] + ',' + (0.28 * a).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + f.col[0] + ',' + f.col[1] + ',' + f.col[2] + ',0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 1.4, 0, TAU); ctx.fill();
      }
      // rocket heads
      for (const r of this.rockets) {
        ctx.strokeStyle = 'rgba(255,230,170,0.95)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(r.px != null ? r.px : r.x, r.py != null ? r.py : r.y); ctx.lineTo(r.x, r.y); ctx.stroke();
        ctx.fillStyle = 'rgba(255,200,120,0.35)'; ctx.beginPath(); ctx.arc(r.x, r.y, 5, 0, TAU); ctx.fill();
      }
      // particles
      const parts = this.parts, drag = [0, 0];
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.life -= dt / p.max;
        if (p.life <= 0) {
          if (p.crackle) { const k = this.o.mobile ? 2 : 4; for (let j = 0; j < k; j++) this._add({ x: p.x, y: p.y, px: p.x, py: p.y, vx: rand(-90, 90), vy: rand(-90, 90), col: [255, 255, 255], life: 1, max: rand(0.18, 0.35), size: 1.2, drag: 3, g: 0, flick: true, w: 1 }); }
          parts[i] = parts[parts.length - 1]; parts.pop(); continue;
        }
        p.px = p.x; p.py = p.y;
        const k = Math.exp(-p.drag * dt); p.vx *= k; p.vy = p.vy * k + p.g * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        let a = Math.pow(p.life, 0.7); if (p.flick && Math.random() < 0.3) a *= 0.35;
        const white = p.life > 0.88 ? (p.life - 0.88) / 0.12 : 0; // starts white-hot, then takes its colour
        const col = p.col, r = (col[0] + (255 - col[0]) * white) | 0, g = (col[1] + (255 - col[1]) * white) | 0, b = (col[2] + (255 - col[2]) * white) | 0;
        ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(3) + ')';
        ctx.lineWidth = p.size; ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
        if (p.glow && a > 0.3) { ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (a * 0.18).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3.2, 0, TAU); ctx.fill(); }
      }
      ctx.globalCompositeOperation = 'source-over';

      const idle = !parts.length && !this.rockets.length && !this.flashes.length && !this.emitters.length && !this.queue.length && !this.auto;
      if (idle) { ctx.clearRect(0, 0, this.w, this.h); this.running = false; return; } // nothing to animate: stop the loop completely
      this.raf = requestAnimationFrame(this._loop);
    }
  }

  DW.Fireworks = Engine;
})();
