/* navigation.js - Next/Prev, arrow keys, touch swipe, page indicator (1/N), progress bar, timeline, Home. */
(function () {
  'use strict';
  const DW = (window.DW = window.DW || {});
  const $ = (s, r) => (r || document).querySelector(s);

  const nav = (DW.nav = {
    index: -1, total: 8, busy: false, pages: [], content: null, ui: null, visible: false,

    init(content, ui) {
      nav.content = content; nav.ui = ui; nav.total = content.pages.length;
      nav.pages = Array.from(document.querySelectorAll('#stage .page'));
      $('#pi-total').textContent = nav.total;
      const ol = $('#timeline ol');
      content.pages.forEach((p, i) => {
        const li = document.createElement('li');
        const b = document.createElement('button'); b.type = 'button'; b.className = 'tl-dot';
        const label = p.number + '. ' + p.title_en + (p.date_label ? ' - ' + p.date_label : '');
        b.setAttribute('aria-label', label); b.title = label; b.innerHTML = '<span>' + p.number + '</span>';
        b.addEventListener('click', () => nav.go(i));
        li.appendChild(b); ol.appendChild(li);
      });
      $('#btn-next').addEventListener('click', () => (nav.index >= nav.total - 1 ? DW.reset && DW.reset() : nav.next()));
      $('#btn-prev').addEventListener('click', () => nav.prev());
      $('#btn-home').addEventListener('click', () => nav.home());

      document.addEventListener('keydown', (e) => {
        if (!nav.visible || e.altKey || e.ctrlKey || e.metaKey) return;
        const t = e.target && e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA') return;
        if (e.key === 'ArrowRight') { nav.next(); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { nav.prev(); e.preventDefault(); }
        else if (e.key === 'Home') { nav.go(0); e.preventDefault(); }
        else if (e.key === 'End') { nav.go(nav.total - 1); e.preventDefault(); }
      });

      // touch swipe (horizontal intent only, so vertical scrolling of tall pages still works)
      let sx = 0, sy = 0, st = 0, ok = false;
      const stage = $('#stage');
      stage.addEventListener('touchstart', (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); ok = !e.target.closest('input,textarea,.no-swipe'); }, { passive: true });
      stage.addEventListener('touchend', (e) => {
        if (!ok) return; const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - st < 900) (dx < 0 ? nav.next() : nav.prev());
      }, { passive: true });

      window.addEventListener('hashchange', () => { const i = nav.fromHash(); if (nav.visible && i != null && i !== nav.index) nav.go(i); });
    },

    fromHash() { const m = /^#p(?:age)?-?(\d+)$/.exec(location.hash); const i = m ? +m[1] - 1 : null; return i != null && i >= 0 && i < nav.total ? i : null; },
    next() { nav.go(nav.index + 1); },
    prev() { nav.go(nav.index - 1); },

    updateUI() {
      const i = nav.index;
      $('#pi-now').textContent = i + 1;
      const pct = ((i + 1) / nav.total) * 100;
      $('#progress-bar').style.width = pct + '%';
      $('.progress').setAttribute('aria-valuenow', Math.round(pct));
      document.querySelectorAll('.tl-dot').forEach((b, k) => { b.classList.toggle('is-active', k === i); b.classList.toggle('is-done', k < i); if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      $('#btn-prev').disabled = i <= 0;
      const last = i >= nav.total - 1, nb = $('#btn-next'), lab = last ? nav.ui.back_welcome : nav.content.ui_labels.next;
      nb.disabled = false; nb.classList.toggle('is-back', last); $('.btn__label', nb).textContent = lab; nb.setAttribute('aria-label', lab);
      if (history.replaceState) history.replaceState(null, '', '#p' + (i + 1));
      try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: '/page-' + (i + 1), title: nav.content.pages[i].title_en }); } catch (e) {}
      if (DW.track) DW.track('page', i + 1);
    },

    go(i, opts) {
      opts = opts || {};
      if (i < 0 || i >= nav.total || (i === nav.index && !opts.force)) return;
      if (nav.busy && !opts.force) return;
      const from = nav.index, dir = i > from ? 1 : -1;
      const prevEl = from >= 0 ? nav.pages[from] : null, nextEl = nav.pages[i];
      nav.busy = true; nav.index = i;
      if (prevEl) DW.fx.leave(nav.content.pages[from].id, prevEl);
      nextEl.classList.add('active'); nextEl.scrollTop = 0; const inner = nextEl.querySelector('.page__inner'); if (inner) inner.scrollTop = 0;
      nav.updateUI();
      if (DW.audio) DW.audio.setPage(nav.content.pages[i].id);
      const done = () => { if (prevEl && prevEl !== nextEl) prevEl.classList.remove('active'); nav.busy = false; };
      if (window.gsap && !DW.fx.reduced()) {
        if (prevEl) gsap.to(prevEl, { opacity: 0, x: -40 * dir, scale: 1.03, duration: 0.7, ease: 'power2.in', onComplete: () => { gsap.set(prevEl, { clearProps: 'all' }); } });
        gsap.fromTo(nextEl, { opacity: 0, x: 40 * dir, scale: 0.97 }, { opacity: 1, x: 0, scale: 1, duration: 0.95, ease: 'power3.out', delay: prevEl ? 0.25 : 0, clearProps: 'transform,opacity', onComplete: done });
        if (prevEl) setTimeout(() => prevEl.classList.remove('active'), 760);
      } else done();
      DW.fx.enter(nav.content.pages[i].id, nextEl);
    },

    showSite(first) {
      nav.visible = true;
      document.body.classList.remove('is-opening');
      $('#site').hidden = false;
      nav.go(first, { force: true });
      const op = $('#opening');
      if (window.gsap && !DW.fx.reduced()) gsap.to(op, { opacity: 0, duration: 0.9, ease: 'power2.inOut', onComplete: () => { op.hidden = true; DW.fx.openingOut(); } });
      else { op.hidden = true; DW.fx.openingOut(); }
    },

    home() {
      if (!nav.visible) return;
      const el = nav.pages[nav.index];
      if (el) DW.fx.leave(nav.content.pages[nav.index].id, el);
      nav.visible = false;
      document.body.classList.add('is-opening');
      const op = $('#opening'); op.hidden = false; if (window.gsap) gsap.set(op, { opacity: 1 });
      const done = () => { $('#site').hidden = true; nav.pages.forEach((p) => p.classList.remove('active')); nav.index = -1; nav.busy = false; };
      if (window.gsap && !DW.fx.reduced()) gsap.to('#site', { opacity: 0, duration: 0.6, onComplete: () => { done(); gsap.set('#site', { clearProps: 'opacity' }); } }); else done();
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
      if (DW.audio) DW.audio.setPage('default');
      DW.fx.openingIn();
    }
  });
})();
