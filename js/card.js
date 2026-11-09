/* card.js - Page 9: two greeting-card designs (live preview). Click a card -> PNG download (html2canvas), then back to Welcome. */
(function () {
  'use strict';
  const DW = (window.DW = window.DW || {});
  const $ = (s, r) => (r || document).querySelector(s);
  const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, 30);
  const slug = (s) => (s || 'family').trim().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 40) || 'family';

  async function render(cardEl) {
    if (document.fonts) { try { await Promise.all([document.fonts.load('700 40px "Noto Sans Gujarati"', 'મકવાણા'), document.fonts.load('900 30px "Playfair Display"', 'HAPPY')]); } catch (e) {} await document.fonts.ready; }
    const clone = cardEl.cloneNode(true); clone.classList.add('gcard--export'); clone.style.transform = 'none';
    const holder = document.createElement('div'); holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:540px;height:675px;pointer-events:none';
    holder.appendChild(clone); document.body.appendChild(holder);
    try { return await html2canvas(clone, { scale: 2, backgroundColor: null, useCORS: true, logging: false, width: 540, height: 675 }); }
    finally { holder.remove(); }
  }
  const toBlob = (c) => new Promise((res) => c.toBlob(res, 'image/png'));

  DW.card = {
    init(content, ui) {
      const page = $('#page-9'), wa = $('#btn-wa', page), forEl = $('#c-for', page);
      const wraps = Array.from(page.querySelectorAll('.card-wrap')), fw = content.pages[7].final_wishes, closing = content.pages[7].closing_en;
      const info = { name: '', city: '' };
      const fit = () => wraps.forEach((w) => { const k = w.clientWidth / 540; if (k > 0) w.firstElementChild.style.transform = 'scale(' + k + ')'; });
      if (window.ResizeObserver) wraps.forEach((w) => new ResizeObserver(fit).observe(w)); window.addEventListener('resize', fit); fit();
      const paint = () => { page.querySelectorAll('.g-name').forEach((e) => (e.textContent = info.name)); page.querySelectorAll('.g-city').forEach((e) => (e.textContent = info.city ? '📍 ' + info.city : '')); };
      DW.card.setInfo = (o) => { info.name = clean(o.name); info.city = clean(o.city); paint(); const t = [info.name, info.city].filter(Boolean).join(', '); forEl.textContent = t ? ui.card_for + ' ' + t : ''; forEl.hidden = !t; };

      DW.card.setInfo({ name: DW.name, city: DW.city });
      let busy = false;
      async function download(w) {
        if (busy) return; busy = true; w.classList.add('busy');
        try {
          const blob = await toBlob(await render(w.querySelector('.gcard')));
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'diwali-greeting-' + w.dataset.design + '-' + slug(info.name) + '.png';
          document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
          DW.fx.confettiBurst(DW.fx.GOLD, 80);
          setTimeout(() => { if (DW.nav) DW.nav.go(DW.nav.total - 1); }, 1500); // flow: on to the last page (Find Me)
        } catch (e) { console.error('card download failed', e); }
        busy = false; w.classList.remove('busy');
      }
      wraps.forEach((w) => { w.addEventListener('click', () => download(w)); w.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); download(w); } }); });

      wa.addEventListener('click', async () => {
        const text = [fw[0], fw[1], fw[3], fw[2] + ' ' + info.name + (info.city ? ', ' + info.city : ''), '', closing].join('\n');
        wa.classList.add('busy');
        try {
          const blob = await toBlob(await render(wraps[0].querySelector('.gcard')));
          const file = new File([blob], 'diwali-greeting.png', { type: 'image/png' });
          if (matchMedia('(pointer: coarse)').matches && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); wa.classList.remove('busy'); return; }
        } catch (e) { if (e && e.name === 'AbortError') { wa.classList.remove('busy'); return; } }
        const url = location.href.split('#')[0];
        window.open('https://wa.me/?text=' + encodeURIComponent(text + (url.startsWith('http') ? '\n' + url : '')), '_blank', 'noopener');
        wa.classList.remove('busy');
      });
    }
  };
})();
