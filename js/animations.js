/* animations.js - per-page effects: GSAP text reveals, tsParticles, fireworks-js, canvas-confetti, lottie-web,
   plus the Page 4 interactions. Every effect starts when its page is entered and is destroyed/paused when left. */
(function () {
  'use strict';
  const DW = (window.DW = window.DW || {});
  const rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReduced = () => rmq.matches;
  const isMobile = () => window.innerWidth < 768;
  const rand = (a, b) => a + Math.random() * (b - a);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- inline SVG sprites (data URIs, no network) ---------- */
  const uri = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  const SPR = {
    petalOrange: uri('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><radialGradient id="g" cx=".4" cy=".3"><stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#FF7A00"/></radialGradient></defs><path d="M16 2C25 8 27 20 16 30 5 20 7 8 16 2Z" fill="url(#g)"/><path d="M16 6v20" stroke="#C2410C" stroke-opacity=".35" stroke-width="1"/></svg>'),
    petalPink: uri('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><radialGradient id="g" cx=".4" cy=".3"><stop offset="0" stop-color="#FFE0EC"/><stop offset="1" stop-color="#F0508A"/></radialGradient></defs><path d="M16 2C25 8 27 20 16 30 5 20 7 8 16 2Z" fill="url(#g)"/></svg>'),
    marigold: uri('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><g fill="#FF9933">' + Array.from({ length: 10 }, (_, i) => '<ellipse cx="20" cy="9" rx="5" ry="9" transform="rotate(' + i * 36 + ' 20 20)"/>').join('') + '</g><g fill="#FFC107">' + Array.from({ length: 8 }, (_, i) => '<ellipse cx="20" cy="12" rx="3.5" ry="6" transform="rotate(' + (i * 45 + 20) + ' 20 20)"/>').join('') + '</g><circle cx="20" cy="20" r="4" fill="#B45309"/></svg>'),
    coin: uri('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><defs><radialGradient id="g" cx=".35" cy=".3"><stop offset="0" stop-color="#FFF6B0"/><stop offset=".6" stop-color="#FFD700"/><stop offset="1" stop-color="#B8860B"/></radialGradient></defs><circle cx="20" cy="20" r="18" fill="url(#g)" stroke="#8A6508" stroke-width="1.5"/><circle cx="20" cy="20" r="13" fill="none" stroke="#B8860B" stroke-width="1.5"/><path d="M20 11l2.6 6.4 6.6.5-5 4.4 1.6 6.6L20 25l-5.8 3.9 1.6-6.6-5-4.4 6.6-.5z" fill="#B8860B" opacity=".75"/></svg>'),
    lantern: uri('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="56" viewBox="0 0 40 56"><defs><radialGradient id="g" cx=".5" cy=".5"><stop offset="0" stop-color="#FFE066"/><stop offset=".5" stop-color="#FF8A00"/><stop offset="1" stop-color="#C2171F"/></radialGradient></defs><path d="M20 1v7" stroke="#FFD700" stroke-width="2"/><rect x="11" y="7" width="18" height="5" rx="2" fill="#FFD700"/><path d="M11 12C-2 22-2 38 11 46h18c13-8 13-24 0-34z" fill="url(#g)"/><path d="M20 12v34M11 12c-6 12-6 22 0 34M29 12c6 12 6 22 0 34" stroke="#7A1010" stroke-opacity=".35" fill="none"/><rect x="11" y="46" width="18" height="5" rx="2" fill="#FFD700"/><path d="M20 51v5" stroke="#FFD700" stroke-width="2"/></svg>'),
    diya: uri('<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><defs><radialGradient id="f" cx=".5" cy=".7"><stop offset="0" stop-color="#FFF6B0"/><stop offset="1" stop-color="#FF8A00"/></radialGradient></defs><circle cx="22" cy="16" r="13" fill="#FFB300" opacity=".25"/><path d="M22 4c5 6 6 10 0 16-6-6-5-10 0-16z" fill="url(#f)"/><path d="M5 24h34c0 9-7 15-17 15S5 33 5 24z" fill="#C2410C"/><rect x="5" y="22" width="34" height="4" rx="2" fill="#FFD700"/></svg>'),
    heart: uri('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><defs><radialGradient id="g" cx=".35" cy=".3"><stop offset="0" stop-color="#FF9BB5"/><stop offset="1" stop-color="#E11D48"/></radialGradient></defs><path d="M18 33C4 23 2 14 8 8c4-4 9-2 10 2 1-4 6-6 10-2 6 6 4 15-10 25z" fill="url(#g)"/></svg>'),
    sparkle: uri('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" fill="#FFE066"/></svg>')
  };
  DW.sprites = SPR;

  /* ---------- tsParticles ---------- */
  const containers = {};
  const tok = {};
  function destroyFx(id) { tok[id] = (tok[id] || 0) + 1; if (containers[id]) { try { containers[id].destroy(); } catch (e) {} delete containers[id]; } }
  async function tsp(id, opts) {
    if (!window.tsParticles || !document.getElementById(id)) return null;
    destroyFx(id); const my = tok[id];
    try {
      const c = await tsParticles.load({ id, options: Object.assign({ fullScreen: { enable: false }, background: { color: 'transparent' }, detectRetina: true, fpsLimit: isMobile() ? 40 : 60, pauseOnBlur: true, pauseOnOutsideViewport: true }, opts) });
      if (tok[id] !== my) { try { c.destroy(); } catch (e) {} return null; } // page was left while loading
      containers[id] = c; return c;
    } catch (e) { console.warn('tsParticles failed', e); return null; }
  }
  const imgShape = (list) => ({ type: 'image', options: { image: list.map((s) => ({ src: s.src, width: s.w || 32, height: s.h || 32 })) } });
  const countFor = (n) => (isReduced() ? Math.round(n * 0.25) : isMobile() ? Math.round(n * 0.45) : n);

  function fallRain(id, sprites, n, size, speed) {
    return tsp(id, { particles: {
      number: { value: countFor(n) }, shape: imgShape(sprites), opacity: { value: { min: 0.55, max: 1 } },
      size: { value: size }, rotate: { value: { min: 0, max: 360 }, direction: 'random', animation: { enable: !isReduced(), speed: 6 } },
      move: { enable: !isReduced(), direction: 'bottom', speed: speed || { min: 0.8, max: 2.2 }, straight: false, drift: { min: -1.4, max: 1.4 }, outModes: { default: 'out' } }
    } });
  }
  function floatUp(id, sprites, n, size, speed) {
    return tsp(id, { particles: {
      number: { value: countFor(n) }, shape: imgShape(sprites), opacity: { value: { min: 0.5, max: 0.95 } },
      size: { value: size }, move: { enable: !isReduced(), direction: 'top', speed: speed || { min: 0.4, max: 1.1 }, straight: false, drift: { min: -0.8, max: 0.8 }, outModes: { default: 'out' } }
    } });
  }
  function goldDust(id, n) {
    return tsp(id, { particles: {
      number: { value: countFor(n) }, color: { value: ['#FFD700', '#FFB300', '#FFF2D5', '#FF9933'] }, shape: { type: 'circle' },
      opacity: { value: { min: 0.2, max: 0.9 }, animation: { enable: !isReduced(), speed: 0.8, sync: false } },
      size: { value: { min: 0.8, max: 2.6 } },
      move: { enable: !isReduced(), direction: 'top', speed: { min: 0.15, max: 0.6 }, straight: false, outModes: { default: 'out' } }
    } });
  }

  /* ---------- confetti (canvas-confetti, own canvas) ---------- */
  let confettiFire = null;
  function cf(opts) {
    if (isReduced() || !window.confetti) return;
    if (!confettiFire) confettiFire = confetti.create($('#confetti-canvas'), { resize: true, useWorker: false });
    confettiFire(Object.assign({ disableForReducedMotion: true }, opts));
  }
  const GOLD = ['#FFD700', '#FFB300', '#FF9933', '#FFF2D5', '#A51C30'];
  const FUN = ['#FFD700', '#FF4D6D', '#38BDF8', '#34D399', '#A78BFA', '#FF9933'];
  function confettiBurst(colors, n) { const k = isMobile() ? 0.55 : 1; cf({ particleCount: Math.round(n * k), spread: 80, startVelocity: 45, origin: { x: 0.5, y: 0.7 }, colors }); }
  function confettiSides(colors, ms) {
    if (isReduced()) return () => {};
    let on = true; const end = Date.now() + ms, k = isMobile() ? 2 : 4;
    (function frame() {
      if (!on) return;
      cf({ particleCount: k, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors });
      cf({ particleCount: k, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    return () => { on = false; };
  }

  /* ---------- fireworks-js (pages 3, 6, 8) ---------- */
  const fwLib = {};
  function fwStart(id, opts) {
    const el = document.getElementById(id); const Lib = window.Fireworks && (window.Fireworks.default || window.Fireworks.Fireworks);
    if (!el || !Lib || isReduced()) return null;
    fwStop(id);
    const m = isMobile();
    const fw = new Lib(el, Object.assign({
      autoresize: true, opacity: 0.45, acceleration: 1.05, friction: 0.97, gravity: 1.5, particles: m ? 34 : 60, traceLength: 3, traceSpeed: 9,
      explosion: m ? 4 : 6, intensity: m ? 14 : 28, flickering: 50, lineStyle: 'round', hue: { min: 20, max: 60 }, delay: { min: 40, max: 80 },
      rocketsPoint: { min: 25, max: 75 }, lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } }, brightness: { min: 50, max: 80 },
      decay: { min: 0.015, max: 0.03 }, mouse: { click: false, move: false, max: 1 }, sound: { enabled: false }
    }, opts || {}));
    fw.start(); fwLib[id] = fw; return fw;
  }
  function fwStop(id) { const f = fwLib[id]; if (f) { try { f.stop(true); } catch (e) { try { f.stop(); } catch (e2) {} } const el = document.getElementById(id); if (el) el.innerHTML = ''; delete fwLib[id]; } }

  /* ---------- lottie ---------- */
  const lotties = [];
  function loadLottie(el, name, loop) {
    if (!window.lottie || !el || el.dataset.loaded) return;
    el.dataset.loaded = '1';
    const a = lottie.loadAnimation({ container: el, renderer: 'svg', loop: loop !== false, autoplay: !isReduced(), path: 'assets/lottie/' + name + '.json', rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
    a.addEventListener('data_failed', () => { el.dataset.loaded = ''; el.classList.add('lottie--failed'); });
    lotties.push(a); return a;
  }
  function lottieIn(root) { $$('[data-lottie]', root).forEach((el) => loadLottie(el, el.dataset.lottie)); }

  /* ---------- GSAP text reveals ---------- */
  const splits = new Map();
  function revert(root) { $$('[data-split]', root).forEach((el) => { const s = splits.get(el); if (s) { s.revert(); splits.delete(el); } }); }
  function reveal(page, delay) {
    if (!window.gsap) return null;
    revert(page);
    const reduced = isReduced();
    const tl = gsap.timeline({ delay: delay == null ? 0.35 : delay });
    if (reduced) { gsap.set($$('[data-reveal],[data-split]', page), { clearProps: 'all' }); return tl; }
    $$('[data-split]', page).forEach((el) => {
      // English titles only: SplitText must never split Gujarati (it would break matras / conjuncts).
      if (window.SplitText) {
        const s = SplitText.create(el, { type: 'chars,words', aria: 'auto' }); splits.set(el, s);
        tl.from(s.chars, { yPercent: 110, rotateX: -80, opacity: 0, transformOrigin: '50% 100%', duration: 0.9, ease: 'back.out(1.6)', stagger: { amount: 0.9, from: 'start' } }, 0);
      } else tl.from(el, { opacity: 0, y: 30, duration: 1 }, 0);
    });
    const items = $$('[data-reveal]', page);
    if (items.length) tl.from(items, { opacity: 0, y: 26, filter: 'blur(8px)', duration: 1, ease: 'power3.out', stagger: 0.22, clearProps: 'filter,transform,opacity' }, 0.55);
    return tl;
  }

  /* ---------- Page 4: Main Diwali ---------- */
  const P4 = { engine: null, bound: false, celebrating: false, lastClick: 0 };
  function buildDiyas(page) {
    const field = $('.diya-field', page); if (!field || field.dataset.built) return; field.dataset.built = '1';
    const m = isMobile();
    const rows = m ? [9, 10, 12, 13] : [30, 34, 38, 42];
    const label = (DW.ui && DW.ui.diya) || 'Diya';
    rows.forEach((n, r) => {
      const row = document.createElement('div'); row.className = 'diya-row diya-row--' + r;
      for (let i = 0; i < n; i++) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'diya' + (Math.random() < 0.42 ? ' lit' : '');
        b.setAttribute('aria-label', label); b.setAttribute('aria-pressed', b.classList.contains('lit') ? 'true' : 'false');
        b.style.setProperty('--d', (Math.random() * 2).toFixed(2) + 's'); b.style.setProperty('--s', (0.8 + Math.random() * 0.4).toFixed(2));
        b.innerHTML = '<i class="diya__flame"></i><i class="diya__bowl"></i>';
        row.appendChild(b);
      }
      field.appendChild(row);
    });
  }
  function lightDiya(btn, page, silent) {
    if (btn.classList.contains('lit')) return;
    btn.classList.add('lit'); btn.setAttribute('aria-pressed', 'true');
    if (!silent) {
      if (DW.audio) DW.audio.sfx('diya');
      const pr = page.getBoundingClientRect(), br = btn.getBoundingClientRect();
      if (P4.engine) P4.engine.fountain(br.left - pr.left + br.width / 2, br.top - pr.top + 4, 0.9);
      if (window.gsap && !isReduced()) gsap.fromTo(btn, { scale: 1.6 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
    }
    const all = $$('.diya', page);
    if (!silent && all.every((d) => d.classList.contains('lit')) && P4.engine) { P4.engine.burst(); cf({ particleCount: 120, spread: 100, origin: { y: 0.8 }, colors: GOLD }); }
  }
  function setCelebration(page, on) {
    P4.celebrating = on; page.classList.toggle('celebrating', on);
    const t = $('.js-celebrate', page); if (t) t.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (P4.engine) P4.engine.setAuto(on);
    if (on) {
      if (DW.audio) DW.audio.sfx('celebration');
      confettiBurst(GOLD, 140);
      $$('.diya:not(.lit)', page).forEach((d, i) => setTimeout(() => lightDiya(d, page, true), Math.min(2500, i * 18)));
    }
  }
  function page4Enter(page) {
    buildDiyas(page);
    const canvas = $('#fw-canvas', page);
    if (!P4.engine) {
      P4.engine = new DW.Fireworks(canvas, {
        mobile: isMobile(), reduced: isReduced(),
        onBurst: (x, y, col) => { const fl = $('.sky-flash', page); if (fl && window.gsap && !isReduced()) { fl.style.background = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(' + col.join(',') + ',.35), transparent 60%)'; gsap.fromTo(fl, { opacity: 1 }, { opacity: 0, duration: 0.9, overwrite: true }); } }
      });
    } else { P4.engine.o.mobile = isMobile(); P4.engine.o.reduced = isReduced(); P4.engine.resize(); }
    if (!P4.bound) {
      P4.bound = true;
      page.addEventListener('pointerdown', (e) => {
        if (!(DW.fire && DW.fire.on) || e.target.closest('button,a,input,label')) return;
        const now = performance.now(); if (now - P4.lastClick < 140) return; P4.lastClick = now;
        const r = page.getBoundingClientRect(); P4.engine.launch(e.clientX - r.left, Math.max(40, e.clientY - r.top));
      });
      page.addEventListener('click', (e) => {
        const d = e.target.closest('.diya'); if (d) { if (d.classList.contains('lit')) { d.classList.remove('lit'); d.setAttribute('aria-pressed', 'false'); } else lightDiya(d, page); return; }
        if (e.target.closest('.js-burst')) { P4.engine.burst(); }
        else if (e.target.closest('.js-celebrate')) setCelebration(page, !P4.celebrating);
      });
      window.addEventListener('resize', () => { if (P4.engine && $('#page-4').classList.contains('active')) { P4.engine.o.mobile = isMobile(); P4.engine.resize(); } });
    }
    P4.engine.start();
    // opening salute + rangoli reveal
    const salute = isReduced() ? 1 : 3;
    for (let i = 0; i < salute; i++) setTimeout(() => P4.engine && P4.engine.launch(P4.engine.w * (0.25 + 0.25 * i), P4.engine.h * rand(0.15, 0.3)), 1200 + i * 650);
    if (window.gsap && !isReduced()) {
      const paths = $$('.rangoli .rg', page);
      gsap.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', stagger: 0.08, delay: 0.6 });
      gsap.fromTo($$('.rangoli .rf', page), { opacity: 0 }, { opacity: 1, duration: 1.4, stagger: 0.06, delay: 2.2 });
    }
    $$('.p4-lights i', page).forEach((b, i) => b.style.setProperty('--i', i));
    P4.stars = P4.stars || buildStars($('.stars', page));
  }
  function buildStars(el) {
    if (!el) return true; const n = isMobile() ? 45 : 110; let h = '';
    for (let i = 0; i < n; i++) h += '<i style="left:' + rand(0, 100).toFixed(1) + '%;top:' + rand(0, 62).toFixed(1) + '%;--t:' + rand(1.8, 5).toFixed(1) + 's;--d:' + rand(0, 4).toFixed(1) + 's;--z:' + rand(1, 2.6).toFixed(1) + 'px"></i>';
    el.innerHTML = h; return true;
  }
  function page4Leave(page) {
    setCelebration(page, false);
    if (P4.engine) { P4.engine.stop(); P4.engine.clear(); }
  }

  /* ---------- Page 5: Dhoko Day cards ---------- */
  function page5Pop(page) {
    const els = $$('.dhead,.dcard,.dpunch', page);
    if (!window.gsap || isReduced()) { gsap.set(els, { clearProps: 'all' }); return; }
    gsap.fromTo(els, { opacity: 0, scale: 0.7, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.8)', stagger: 0.16, delay: 0.5, clearProps: 'transform,opacity' });
  }
  function page5Bind(page) {
    if (page.dataset.bound) return; page.dataset.bound = '1';
    $$('.dcard', page).forEach((card) => {
      card.addEventListener('click', () => {
        const r = card.getBoundingClientRect();
        cf({ particleCount: isMobile() ? 25 : 45, spread: 70, startVelocity: 28, origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight }, colors: FUN });
        if (window.gsap && !isReduced()) gsap.fromTo($('.dcard__emoji', card), { y: 0, scale: 1 }, { y: -18, scale: 1.3, duration: 0.2, yoyo: true, repeat: 3, ease: 'power1.inOut', clearProps: 'transform' });
        if (DW.audio) DW.audio.sfx('celebration');
      });
    });
  }

  /* ---------- Page 7: tilak ceremony ---------- */
  function page7Enter(page) {
    const tl = gsap.timeline({ delay: 1.4 });
    if (isReduced()) { gsap.set($$('.tilak-dot,.rice', page), { opacity: 1 }); return tl; }
    tl.fromTo($('.sis-hand', page), { x: -50, y: 40, rotate: -12, opacity: 0 }, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 1.1, ease: 'power2.out' })
      .fromTo($('.tilak-dot', page), { scale: 0, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(3)' }, '+=0.15')
      .fromTo($$('.rice', page), { scale: 0, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.07, ease: 'back.out(3)' }, '-=0.2')
      .to($('.sis-hand', page), { x: -22, y: 24, rotate: -6, duration: 1, ease: 'power2.inOut', delay: 0.7 })
      .add(() => { if (DW.audio) DW.audio.sfx('bell'); cf({ particleCount: 40, spread: 90, origin: { y: 0.5 }, colors: ['#FF6F91', '#FFD700', '#FFB3C0'], scalar: 0.9 }); });
    return tl;
  }

  /* ---------- Page 8: wishes sequence ---------- */
  const P8 = { tl: null, stopSides: null };
  function page8Enter(page) {
    const stage = $('.wishes-stage', page), msgs = $$('.wish--msg', stage), finals = $$('.wish--final', stage), closing = $('.wish--closing', stage);
    if (P8.tl) P8.tl.kill();
    if (isReduced() || !window.gsap) { stage.classList.add('is-static'); return; }
    stage.classList.remove('is-static');
    gsap.set([...msgs, ...finals, closing], { opacity: 0, y: 24 });
    const tl = (P8.tl = gsap.timeline({ delay: 1.2 }));
    msgs.forEach((m) => { tl.to(m, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }).to(m, { opacity: 0, y: -18, duration: 0.8, ease: 'power2.in' }, '+=3.2'); });
    tl.add(() => { if (DW.audio) DW.audio.sfx('celebration'); cf({ particleCount: 160, spread: 110, origin: { y: 0.65 }, colors: GOLD }); });
    tl.to(finals, { opacity: 1, y: 0, duration: 0.9, stagger: 0.7, ease: 'power3.out' });
    tl.to(finals, { opacity: 0, y: -16, duration: 1, ease: 'power2.in' }, '+=3.6');
    tl.to(closing, { opacity: 1, y: 0, duration: 1.6, ease: 'power2.out' }).add(() => confettiBurst(GOLD, 120));
  }

  /* ---------- Page 3: Kali Chaudas (haunted folklore night -> devotional section) ---------- */
  const P3 = { bound: false };
  function page3Reset(page) {
    const q = (x) => $(x, page); if (!q('#kc-a')) return;
    if (window.gsap) gsap.killTweensOf(page.querySelectorAll('#kc-a *, #kc-b *, #kc-blessing, #kc-mantra span'));
    page.classList.remove('kc-devout');
    q('#kc-diya').classList.remove('is-lit'); q('#kc-diya').setAttribute('aria-pressed', 'false'); $('.cdiya', q('#kc-diya')).classList.remove('lit');
    const t = q('.kc-a__text'); t.classList.remove('is-open'); t.style.cssText = '';
    q('#kc-b').hidden = true; q('#kc-b').style.cssText = '';
    q('#kc-blessing').hidden = true; q('#kc-bless').setAttribute('aria-expanded', 'false');
    const m = q('#kc-mantra'); if (m.dataset.built) { m.textContent = m.dataset.text; delete m.dataset.built; m.removeAttribute('aria-label'); }
    if (DW.audio) DW.audio.ambience(false);
    const amb = q('#kc-amb'); amb.setAttribute('aria-pressed', 'false'); amb.textContent = DW.ui.kc_amb_off;
    const sc = page.querySelector('.page__inner'); if (sc) sc.scrollTop = 0;
  }
  function page3Bind(page) {
    if (P3.bound) return; P3.bound = true;
    const q = (x) => $(x, page), U = DW.ui, sm = () => (isReduced() ? 'auto' : 'smooth');
    const diya = q('#kc-diya'), a = q('#kc-a'), b = q('#kc-b'), bl = q('#kc-blessing'), amb = q('#kc-amb');
    diya.addEventListener('click', () => {
      const on = !diya.classList.contains('is-lit'); diya.classList.toggle('is-lit', on); $('.cdiya', diya).classList.toggle('lit', on); diya.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on && DW.audio) DW.audio.sfx('diya');
    });
    q('#kc-mystery').addEventListener('click', () => {
      a.scrollIntoView({ behavior: sm(), block: 'start' });
      const txt = $('.kc-a__text', a); if (txt.classList.contains('is-open')) return;
      txt.classList.add('is-open');
      if (!window.gsap || isReduced()) return;
      const clr = $('.kc-clear', a);
      gsap.fromTo(txt, { opacity: 0, filter: 'blur(18px)', y: 20 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 2.6, ease: 'power2.out', delay: 0.5, clearProps: 'filter,transform' });
      gsap.fromTo(clr, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1.3, duration: 1.1, ease: 'power1.in', yoyo: true, repeat: 1, onComplete: () => gsap.set(clr, { opacity: 0 }) });
    });
    q('#kc-darshan').addEventListener('click', () => {
      if (DW.audio) { DW.audio.ambience(false); DW.audio.sfx('bell'); }
      amb.setAttribute('aria-pressed', 'false'); amb.textContent = U.kc_amb_off;
      page.classList.add('kc-devout');
      const first = b.hidden; b.hidden = false;
      const m = q('#kc-mantra'), full = m.dataset.text;
      if (!m.dataset.built) {
        m.dataset.built = '1'; m.setAttribute('aria-label', full); m.textContent = '';
        const parts = window.Intl && Intl.Segmenter ? Array.from(new Intl.Segmenter('gu', { granularity: 'grapheme' }).segment(full), (x) => x.segment) : Array.from(full);
        parts.forEach((ch) => { const sp = document.createElement('span'); sp.textContent = ch; sp.setAttribute('aria-hidden', 'true'); m.appendChild(sp); });
      }
      const spans = Array.from(m.children);
      b.scrollIntoView({ behavior: sm(), block: 'start' });
      if (!window.gsap || isReduced()) { spans.forEach((x) => (x.style.opacity = 1)); return; }
      if (first) {
        gsap.fromTo(b, { opacity: 0, scale: 0.94, filter: 'brightness(.35)' }, { opacity: 1, scale: 1, filter: 'brightness(1)', duration: 2.2, ease: 'power2.out', clearProps: 'filter,transform' });
        gsap.fromTo($('.kc-rays', b), { opacity: 0 }, { opacity: 1, duration: 3, ease: 'power1.out' });
      }
      gsap.set(spans, { opacity: 0 });
      gsap.to(spans, { opacity: 1, duration: 0.6, stagger: 0.16, delay: 1.4, ease: 'power1.out' });
    });
    q('#kc-bless').addEventListener('click', () => {
      const show = bl.hidden; const nm = $('.kc-name', bl); nm.textContent = DW.name || ''; nm.hidden = !DW.name;
      bl.hidden = !show; q('#kc-bless').setAttribute('aria-expanded', show ? 'true' : 'false');
      if (show) { if (window.gsap && !isReduced()) gsap.fromTo(bl, { opacity: 0, scale: 0.9, y: 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'back.out(1.5)', clearProps: 'transform' }); bl.scrollIntoView({ behavior: sm(), block: 'center' }); }
    });
    amb.addEventListener('click', () => {
      if (!DW.audio) return; const on = DW.audio.ambience(amb.getAttribute('aria-pressed') !== 'true');
      amb.setAttribute('aria-pressed', on ? 'true' : 'false'); amb.textContent = on ? U.kc_amb_on : U.kc_amb_off;
    });
  }

  /* ---------- Page 6: "Wish Together" character scene ---------- */
  const WS = { bound: false, stop: null };
  function wsRender() {
    const r = $('#ws-right'); if (!r || !DW.wsSVG) return; const g = DW.gender;
    r.innerHTML = DW.wsSVG(g === 'Male' ? 'boyR' : g === 'Female' ? 'girl' : 'neutral');
    $('#ws-tag-r').textContent = DW.name || DW.ui.ws_you;
  }
  function wsShake(s) { // both characters walk together and shake hands, then go back to waving
    const ch = s.querySelectorAll('.ws-char'); if (ch.length < 2 || s.hidden || !window.gsap || isReduced()) return;
    const L = ch[0], R = ch[1], lr = $('.ws-svg', L).getBoundingClientRect(), rr = $('.ws-svg', R).getBoundingClientRect(), u = lr.width / 120;
    const lh = lr.left + 145.6 * u, rh = rr.left - 25.6 * u, gap = rh - lh;
    L.classList.add('hs'); R.classList.add('hs');
    gsap.to(L, { x: gap / 2, duration: 0.9, ease: 'power2.inOut' }); gsap.to(R, { x: -gap / 2, duration: 0.9, ease: 'power2.inOut' });
    setTimeout(() => cf({ particleCount: isMobile() ? 24 : 40, spread: 70, startVelocity: 22, origin: { x: (lh + rh) / 2 / innerWidth, y: (lr.top + lr.height * 0.3) / innerHeight }, colors: GOLD }), 900);
    WS.hs = setTimeout(() => gsap.to([L, R], { x: 0, duration: 0.9, ease: 'power2.inOut', onComplete: () => { L.classList.remove('hs'); R.classList.remove('hs'); gsap.set([L, R], { clearProps: 'x' }); } }), 4200);
  }
  function wsClose(page, instant) {
    const s = $('#ws', page); if (!s || s.hidden) return;
    if (WS.stop) { WS.stop(); WS.stop = null; }
    clearTimeout(WS.hsStart); clearTimeout(WS.hs); s.querySelectorAll('.ws-char').forEach((c) => { c.classList.remove('hs'); if (window.gsap) { gsap.killTweensOf(c); gsap.set(c, { clearProps: 'x' }); } });
    $('#ws-open', page).setAttribute('aria-expanded', 'false');
    const done = () => { s.hidden = true; s.classList.remove('is-on'); if (window.gsap) gsap.set(s, { clearProps: 'opacity,transform' }); };
    if (instant || !window.gsap || isReduced()) done(); else gsap.to(s, { opacity: 0, duration: 0.45, onComplete: done });
  }
  function wsBind(page) {
    if (WS.bound) return; WS.bound = true;
    const s = $('#ws', page), btn = $('#ws-open', page);
    btn.addEventListener('click', () => {
      if (!s.hidden) { wsClose(page); return; }
      if (DW.track) DW.track('wish');
      wsRender(); s.hidden = false; s.classList.add('is-on'); btn.setAttribute('aria-expanded', 'true');
      s.scrollIntoView({ behavior: isReduced() ? 'auto' : 'smooth', block: 'start' });
      if (window.gsap && !isReduced()) {
        gsap.fromTo(s, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out', clearProps: 'transform' });
        gsap.from(s.querySelectorAll('.ws-char'), { y: 50, opacity: 0, duration: 0.9, stagger: 0.2, delay: 0.4, ease: 'back.out(1.5)', clearProps: 'transform,opacity' });
        gsap.from(s.querySelector('.ws-title'), { opacity: 0, scale: 0.8, duration: 1, delay: 0.3, ease: 'back.out(1.7)', clearProps: 'transform,opacity' });
        confettiBurst(GOLD, 140); WS.stop = confettiSides(GOLD, 2600);
        cf({ particleCount: isMobile() ? 30 : 60, spread: 130, origin: { y: 0.25 }, gravity: 0.6, ticks: 320, colors: ['#FF9933', '#FFC107', '#FFB6C1', '#FFF2D5'] });
        if (DW.fire && DW.fire.on && DW.fire.ensure) setTimeout(() => DW.fire.ensure().burst(isMobile() ? 2 : 4), 600);
      }
      if (DW.audio && DW.audio.state.musicOn && !DW.audio.state.muted) { DW.audio.sfx('bell'); DW.audio.sfx('celebration'); }
      clearTimeout(WS.hsStart); WS.hsStart = setTimeout(() => wsShake(s), 2400);
    });
    $('#ws-close', page).addEventListener('click', () => { wsClose(page); btn.focus(); });
  }

  /* ---------- page effect table ---------- */
  const FX = {
    'vagh-baras': {
      enter(p) { fallRain('fx-1', [{ src: SPR.petalOrange }, { src: SPR.petalPink }, { src: SPR.marigold, w: 40, h: 40 }], 26, { min: 9, max: 20 }); },
      leave() { destroyFx('fx-1'); }
    },
    dhanteras: {
      enter(p) { fallRain('fx-2', [{ src: SPR.coin, w: 40, h: 40 }, { src: SPR.sparkle, w: 24, h: 24 }], 24, { min: 8, max: 18 }, { min: 1, max: 2.6 }); lottieIn(p); },
      leave() { destroyFx('fx-2'); }
    },
    'kali-chaudas': {
      enter(p) { page3Bind(p); page3Reset(p); },
      leave(p) { page3Reset(p); }
    },
    'main-diwali': { enter: page4Enter, leave: page4Leave },
    'gujarati-fun-day': {
      enter(p) { page5Bind(p); page5Pop(p); setTimeout(() => confettiBurst(FUN, 150), 700); const s = confettiSides(FUN, 2500); FX['gujarati-fun-day']._s = s; },
      leave() { if (FX['gujarati-fun-day']._s) FX['gujarati-fun-day']._s(); }
    },
    'gujarati-new-year': {
      enter(p) {
        wsBind(p); wsRender();
        fallRain('fx-6', [{ src: SPR.marigold, w: 40, h: 40 }, { src: SPR.petalOrange }, { src: SPR.petalPink }], 28, { min: 9, max: 20 });
        fwStart('fw-6', { hue: { min: 30, max: 55 }, intensity: isMobile() ? 10 : 20 });
        setTimeout(() => confettiBurst(GOLD, 160), 1400); FX['gujarati-new-year']._s = confettiSides(GOLD, 3000);
      },
      leave(p) { destroyFx('fx-6'); fwStop('fw-6'); if (FX['gujarati-new-year']._s) FX['gujarati-new-year']._s(); wsClose(p, true); }
    },
    'bhai-bij': {
      enter(p) { floatUp('fx-7', [{ src: SPR.heart, w: 36, h: 36 }, { src: SPR.petalPink }, { src: SPR.petalOrange }], 22, { min: 10, max: 24 }); lottieIn(p); page7Enter(p); },
      leave() { destroyFx('fx-7'); }
    },
    'greeting-card': {
      enter(p) { floatUp('fx-9', [{ src: SPR.diya, w: 44, h: 44 }, { src: SPR.marigold, w: 40, h: 40 }, { src: SPR.sparkle, w: 24, h: 24 }], 10, { min: 14, max: 30 }); setTimeout(() => confettiBurst(GOLD, 50), 600); },
      leave() { destroyFx('fx-9'); }
    },
    'find-me': {
      enter(p) {
        floatUp('fx-10', [{ src: SPR.diya, w: 44, h: 44 }, { src: SPR.marigold, w: 40, h: 40 }, { src: SPR.petalOrange }], 14, { min: 14, max: 30 });
        if (DW.fire && DW.fire.on && DW.fire.ensure && !isReduced()) setTimeout(() => { if (DW.nav.visible && DW.nav.content.pages[DW.nav.index].id === 'find-me') DW.fire.ensure().burst(isMobile() ? 2 : 4); }, 900);
      },
      leave() { destroyFx('fx-10'); }
    },
    'family-wishes': {
      enter(p) {
        fwStart('fw-8', { intensity: isMobile() ? 24 : 46, particles: isMobile() ? 40 : 80, opacity: 0.5, hue: { min: 0, max: 360 }, mouse: { click: true, move: false, max: 3 } });
        floatUp('fx-8', [{ src: SPR.diya, w: 44, h: 44 }, { src: SPR.marigold, w: 40, h: 40 }], 14, { min: 14, max: 30 });
        page8Enter(p);
      },
      leave() { destroyFx('fx-8'); fwStop('fw-8'); if (P8.tl) P8.tl.kill(); }
    }
  };

  /* ---------- opening screen ---------- */
  function openingIn() {
    goldDust('fx-opening', 70);
    const op = $('#opening'); lottieIn(op);
    if (!window.gsap || isReduced()) return;
    const tl = gsap.timeline();
    tl.from('.opening__diyas', { opacity: 0, scale: 0.8, duration: 1.4, ease: 'power3.out' }, 0.1);
    if (DW._osplit) { DW._osplit.revert(); DW._osplit = null; }
    const s = (DW._osplit = window.SplitText ? SplitText.create('#opening-title', { type: 'words,chars', aria: 'auto' }) : null);
    if (s) tl.from(s.chars, { opacity: 0, yPercent: 120, rotateX: -90, transformOrigin: '50% 100%', duration: 0.9, ease: 'back.out(1.7)', stagger: { amount: 1.4 } }, 0.5);
    tl.from('#opening-sub', { opacity: 0, y: 24, filter: 'blur(10px)', duration: 1.2, ease: 'power3.out' }, 1.8)
      ;
    DW._openingTl = tl;
  }
  function openingOut() { destroyFx('fx-opening'); }

  /* ---------- pause / resume everything (tab hidden) ---------- */
  function pauseAll() {
    document.body.classList.add('is-hidden');
    Object.values(containers).forEach((c) => { try { c.pause(); } catch (e) {} });
    Object.values(fwLib).forEach((f) => { try { f.stop(); } catch (e) {} });
    lotties.forEach((a) => a.pause());
    if (window.gsap) gsap.globalTimeline.pause();
  }
  function resumeAll() {
    document.body.classList.remove('is-hidden');
    Object.values(containers).forEach((c) => { try { c.play(); } catch (e) {} });
    Object.values(fwLib).forEach((f) => { try { f.start(); } catch (e) {} });
    if (!isReduced()) lotties.forEach((a) => a.play());
    if (window.gsap) gsap.globalTimeline.resume();
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? pauseAll() : resumeAll()));

  /* ---------- public ---------- */
  DW.fx = {
    reduced: isReduced, mobile: isMobile, refreshScene: () => { try { wsRender(); } catch (e) {} }, cf, confettiBurst, GOLD, FUN, openingIn, openingOut,
    enter(id, page) {
      reveal(page);
      const f = FX[id]; if (f && f.enter) { try { f.enter(page); } catch (e) { console.error('fx enter', id, e); } }
    },
    leave(id, page) {
      const f = FX[id]; if (f && f.leave) { try { f.leave(page); } catch (e) { console.error('fx leave', id, e); } }
      revert(page);
    },
    p4: P4
  };
})();
