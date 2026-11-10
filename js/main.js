/* main.js - loads content.json (single source of truth for ALL text), builds the opening + 8 pages, wires the UI. */
(function () {
  'use strict';
  const DW = (window.DW = window.DW || {});
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const range = (n) => Array.from({ length: n }, (_, i) => i);

  /* ---------- small SVG / HTML snippets ---------- */
  const cdiya = (n, cls) => range(n).map((i) => '<span class="cdiya ' + (cls || '') + '" style="--d:' + (i * 0.37).toFixed(2) + 's;--s:' + (0.85 + (i % 3) * 0.15).toFixed(2) + '"><i class="diya__flame"></i><i class="diya__bowl"></i></span>').join('');
  const bulbs = (n, cls) => '<div class="' + cls + '" aria-hidden="true">' + range(n).map((i) => '<i style="--i:' + i + '"></i>').join('') + '</div>';
  const dustHTML = () => range(26).map(() => '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;--t:' + (8 + Math.random() * 12).toFixed(1) + 's;--d:-' + (Math.random() * 14).toFixed(1) + 's;--z:' + (1 + Math.random() * 2.5).toFixed(1) + 'px"></i>').join('');
  const swastik = (id) => '<svg class="shubh" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="sg' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF2D5"/><stop offset=".5" stop-color="#FFD700"/><stop offset="1" stop-color="#B8860B"/></linearGradient></defs><rect x="4" y="4" width="92" height="92" rx="14" fill="#A51C30" stroke="#FFD700" stroke-width="3"/><g fill="none" stroke="url(#sg' + id + ')" stroke-width="7" stroke-linecap="square"><path d="M50 22v56M22 50h56M50 22h20M78 50v20M50 78H30M22 50V30"/></g><g fill="#FFD700"><circle cx="34" cy="34" r="4"/><circle cx="66" cy="34" r="4"/><circle cx="34" cy="66" r="4"/><circle cx="66" cy="66" r="4"/></g></svg>';

  function character(kind) {
    const eyes = '<g><circle cx="42" cy="58" r="7" fill="#fff"/><circle cx="68" cy="58" r="7" fill="#fff"/><circle cx="43" cy="59" r="3.4" fill="#2A1740"/><circle cx="69" cy="59" r="3.4" fill="#2A1740"/></g><path d="M44 72q11 12 22 0" fill="#7A1010" stroke="#2A1740" stroke-width="2" stroke-linecap="round"/><circle cx="34" cy="70" r="5" fill="#FF6F91" opacity=".6"/><circle cx="76" cy="70" r="5" fill="#FF6F91" opacity=".6"/>';
    const body = {
      dhokla: '<rect x="12" y="26" width="86" height="72" rx="16" fill="#FFD84A" stroke="#E0A800" stroke-width="3"/><g fill="#2E7D32"><circle cx="30" cy="34" r="2.5"/><circle cx="55" cy="31" r="2.5"/><circle cx="80" cy="35" r="2.5"/></g>',
      jalebi: '<circle cx="55" cy="60" r="44" fill="#FF8A00" stroke="#C2410C" stroke-width="3"/><path d="M55 60m-34 0a34 34 0 1 1 34 34M55 60m-20 0a20 20 0 1 1 20 20" fill="none" stroke="#FFC107" stroke-width="6" stroke-linecap="round" opacity=".7"/>',
      fafda: '<path d="M10 40q20-24 45-8t45 4l-6 56q-22 14-42 0t-36 6z" fill="#F6C453" stroke="#C8901A" stroke-width="3"/>',
      laddu: '<circle cx="55" cy="60" r="44" fill="#FF9933" stroke="#C2410C" stroke-width="3"/><g fill="#FFE29A" opacity=".8"><circle cx="30" cy="40" r="3"/><circle cx="78" cy="38" r="3"/><circle cx="82" cy="78" r="3"/><circle cx="28" cy="82" r="3"/><circle cx="55" cy="26" r="3"/></g>'
    }[kind];
    return '<svg class="meme__svg" viewBox="0 0 110 120" aria-hidden="true">' + body + eyes + '</svg>';
  }

  function familySVG(label) {
    const person = (cx, s, cloth, hair, fem, skin) => {
      const b = 86 * s, y = 236, hy = y - b - 22 * s;
      return '<g><path d="M' + (cx - 26 * s) + ' ' + y + 'L' + (cx - 18 * s) + ' ' + (y - b) + 'H' + (cx + 18 * s) + 'L' + (cx + 26 * s) + ' ' + y + 'Z" fill="' + cloth + '" stroke="#FFD700" stroke-width="2"/>' +
        '<rect x="' + (cx - 5 * s) + '" y="' + (y - b - 8 * s) + '" width="' + 10 * s + '" height="' + 12 * s + '" fill="' + skin + '"/>' +
        (fem ? '<rect x="' + (cx - 25 * s) + '" y="' + (hy - 6 * s) + '" width="' + 50 * s + '" height="' + 46 * s + '" rx="' + 20 * s + '" fill="' + hair + '"/>' : '') +
        '<circle cx="' + cx + '" cy="' + hy + '" r="' + 22 * s + '" fill="' + skin + '"/>' +
        (fem ? '<path d="M' + (cx - 22 * s) + ' ' + (hy - 2 * s) + 'a' + 22 * s + ' ' + 22 * s + ' 0 0 1 ' + 44 * s + ' 0q-' + 22 * s + ' -' + 8 * s + ' -' + 44 * s + ' 0z" fill="' + hair + '"/>' : '<path d="M' + (cx - 22 * s) + ' ' + hy + 'a' + 22 * s + ' ' + 22 * s + ' 0 0 1 ' + 44 * s + ' 0q-' + 22 * s + ' -' + 14 * s + ' -' + 44 * s + ' 0z" fill="' + hair + '"/>') +
        '<circle cx="' + (cx - 8 * s) + '" cy="' + (hy + 2 * s) + '" r="' + 2.6 * s + '" fill="#2A1740"/><circle cx="' + (cx + 8 * s) + '" cy="' + (hy + 2 * s) + '" r="' + 2.6 * s + '" fill="#2A1740"/>' +
        '<path d="M' + (cx - 8 * s) + ' ' + (hy + 11 * s) + 'q' + 8 * s + ' ' + 8 * s + ' ' + 16 * s + ' 0" fill="none" stroke="#7A1010" stroke-width="2" stroke-linecap="round"/>' +
        (fem ? '<circle cx="' + cx + '" cy="' + (hy - 9 * s) + '" r="' + 2.2 * s + '" fill="#D81B3C"/>' : '') + '</g>';
    };
    const diya = (x) => '<g transform="translate(' + x + ' 236)"><path d="M0 -26c6 7 7 12 0 18-7-6-6-11 0-18z" fill="#FFB300"/><path d="M-16 -8h32c0 10-7 14-16 14s-16-4-16-14z" fill="#E4572E" stroke="#FFD700" stroke-width="2"/></g>';
    return '<svg class="family-art" viewBox="0 0 400 260" role="img" aria-label="' + esc(label) + '"><defs><radialGradient id="fg" cx=".5" cy=".6"><stop offset="0" stop-color="#FFD700" stop-opacity=".4"/><stop offset="1" stop-color="#FFD700" stop-opacity="0"/></radialGradient></defs><ellipse cx="200" cy="140" rx="190" ry="120" fill="url(#fg)"/><ellipse cx="200" cy="244" rx="180" ry="9" fill="#000" opacity=".25"/>' +
      person(110, 1.05, '#FFF2D5', '#2A1740', false, '#F2B98F') + person(290, 1, '#A51C30', '#1c1030', true, '#F2B98F') + person(186, 0.62, '#FF9933', '#1c1030', true, '#F2B98F') + person(228, 0.6, '#38BDF8', '#2A1740', false, '#F2B98F') + diya(40) + diya(360) + '</svg>';
  }

  function houseSVG() {
    let w = '', lights = '';
    for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) { const x = 170 + i * 66 + (i > 4 ? 40 : 0); if (x > 360 && x < 540) continue; w += '<path class="win" style="--w:' + ((i * 7 + r * 3) % 9) * 0.4 + 's" d="M' + x + ',' + (170 + r * 62) + 'v-22a9,9 0 0 1 18,0v22z"/>'; }
    for (let i = 0; i <= 40; i++) { const x = 130 + i * 16.5; lights += '<circle class="bulb" style="--i:' + i + '" cx="' + x + '" cy="132" r="3.2"/>'; }
    for (let i = 0; i <= 14; i++) { const x = 380 + i * 10; lights += '<circle class="bulb" style="--i:' + (i + 5) + '" cx="' + x + '" cy="82" r="2.8"/>'; }
    return '<svg class="house" viewBox="0 0 900 300" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' +
      '<defs><linearGradient id="hw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A2A7A"/><stop offset="1" stop-color="#2A1650"/></linearGradient><radialGradient id="hd" cx=".5" cy="1"><stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#FF8A00"/></radialGradient></defs>' +
      '<path d="M0 300V250q120-60 260-30t240-20q150 20 400-10v110z" fill="#0f0a1f"/>' +
      '<g fill="url(#hw)" stroke="#FFD700" stroke-opacity=".75" stroke-width="2">' +
      '<rect x="130" y="140" width="640" height="160"/><rect x="380" y="86" width="140" height="214"/>' +
      '<path d="M380 86a70 52 0 0 1 140 0z"/><rect x="150" y="116" width="60" height="26"/><rect x="690" y="116" width="60" height="26"/>' +
      '<path d="M150 116a30 24 0 0 1 60 0z"/><path d="M690 116a30 24 0 0 1 60 0z"/><path d="M280 140a20 14 0 0 1 40 0z"/><path d="M580 140a20 14 0 0 1 40 0z"/></g>' +
      '<g fill="#FFD700"><path d="M450 34l6 14h-12z"/><circle cx="450" cy="50" r="5"/><path d="M180 82l4 9h-8z"/><path d="M720 82l4 9h-8z"/></g>' +
      '<path d="M424 300v-70a26 26 0 0 1 52 0v70z" fill="url(#hd)" class="door"/>' +
      '<g class="wins" fill="#FFB347">' + w + '</g>' +
      '<g class="rails" fill="#FFD700" fill-opacity=".6"><rect x="130" y="142" width="640" height="3"/><rect x="380" y="88" width="140" height="3"/></g>' +
      '<g class="bulbs">' + lights + '</g></svg>';
  }

  function rangoliSVG() {
    const petals = (n, d, cls, col, sw) => range(n).map((i) => '<path class="' + cls + '" ' + (cls === 'rg' ? 'pathLength="1"' : '') + ' d="' + d + '" transform="rotate(' + (i * 360 / n) + ')" fill="' + (cls === 'rf' ? col : 'none') + '" stroke="' + (cls === 'rg' ? col : 'none') + '" stroke-width="' + sw + '" fill-opacity=".85"/>').join('');
    return '<svg class="rangoli" viewBox="-100 -100 200 200" aria-hidden="true"><g stroke-linecap="round" stroke-linejoin="round">' +
      '<circle class="rg" pathLength="1" r="96" fill="none" stroke="#FFD700" stroke-width="1.6"/><circle class="rg" pathLength="1" r="88" fill="none" stroke="#FF9933" stroke-width="1" stroke-dasharray="1"/>' +
      petals(24, 'M0 -62C9 -72 9 -82 0 -90C-9 -82 -9 -72 0 -62Z', 'rf', '#FF3D71', 1) + petals(24, 'M0 -62C9 -72 9 -82 0 -90C-9 -82 -9 -72 0 -62Z', 'rg', '#FFD700', 1.2) +
      petals(12, 'M0 -34C14 -46 14 -60 0 -70C-14 -60 -14 -46 0 -34Z', 'rf', '#FF9933', 1) + petals(12, 'M0 -34C14 -46 14 -60 0 -70C-14 -60 -14 -46 0 -34Z', 'rg', '#FFF2D5', 1.2) +
      petals(8, 'M0 -8C8 -16 8 -26 0 -32C-8 -26 -8 -16 0 -8Z', 'rf', '#FFD700', 1) + petals(8, 'M0 -8C8 -16 8 -26 0 -32C-8 -26 -8 -16 0 -8Z', 'rg', '#A51C30', 1.4) +
      '<circle class="rf" r="6" fill="#A51C30"/>' + range(36).map((i) => '<circle class="rf" r="1.9" fill="#FFF2D5" cx="' + (Math.cos(i / 36 * 6.2832) * 80).toFixed(1) + '" cy="' + (Math.sin(i / 36 * 6.2832) * 80).toFixed(1) + '"/>').join('') +
      '</g></svg>';
  }

  function toranSVG() {
    let s = '<svg class="toran" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8Q500 40 1000 8" stroke="#FFD700" stroke-width="3" fill="none"/>';
    for (let i = 0; i < 17; i++) {
      const x = 30 + i * 58.5, y = 8 + 32 * Math.sin((x / 1000) * Math.PI) * 0.98 + 0;
      s += '<g transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')"><g class="tor" style="--i:' + i + '"><path d="M0 4C-14 18 -12 44 0 62C12 44 14 18 0 4Z" fill="#2E7D32"/><path d="M0 8V58" stroke="#1B5E20" stroke-width="1.5"/><circle cy="70" r="12" fill="' + (i % 2 ? '#FF9933' : '#FFC107') + '"/><circle cy="70" r="5" fill="#B45309"/></g></g>';
    }
    return s + '</svg>';
  }

  function brotherSisterSVG() {
    return '<svg class="duo-art" viewBox="0 0 420 280" role="img" aria-label="Brother and sister tilak ceremony">' +
      '<defs><radialGradient id="bg7" cx=".5" cy=".5"><stop offset="0" stop-color="#FFD700" stop-opacity=".45"/><stop offset="1" stop-color="#FFD700" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="210" cy="130" r="150" fill="url(#bg7)"/><ellipse cx="210" cy="262" rx="170" ry="10" fill="#000" opacity=".18"/>' +
      /* brother */
      '<g class="bro"><path d="M262 150q28-12 56 0l10 108h-76z" fill="#FFF2D5" stroke="#E0B25B" stroke-width="2"/><path d="M290 150v108" stroke="#E0B25B"/><circle cx="290" cy="170" r="3" fill="#A51C30"/><circle cx="290" cy="196" r="3" fill="#A51C30"/><rect x="282" y="132" width="16" height="22" rx="6" fill="#E8A87C"/><circle cx="290" cy="102" r="33" fill="#F2B98F"/><path d="M257 100c-4-30 18-42 36-40 20 0 38 14 30 40-4-14-16-22-33-22s-29 8-33 22z" fill="#2A1740"/><circle cx="279" cy="106" r="3.2" fill="#2A1740"/><circle cx="301" cy="106" r="3.2" fill="#2A1740"/><path d="M280 120q10 9 20 0" fill="none" stroke="#7A1010" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="290" cy="82" rx="6" ry="4" fill="#E8A87C" opacity=".0"/>' +
      '<circle class="tilak-dot" cx="290" cy="85" r="4.6" fill="#D81B3C"/><g class="rices" fill="#FFF8E7"><ellipse class="rice" cx="283" cy="83" rx="1.8" ry="1"/><ellipse class="rice" cx="297" cy="83" rx="1.8" ry="1"/><ellipse class="rice" cx="290" cy="79" rx="1.8" ry="1"/><ellipse class="rice" cx="290" cy="90" rx="1.8" ry="1"/></g></g>' +
      /* sister */
      '<g class="sis"><path d="M62 154q28-14 58 0l20 104H42z" fill="#A51C30" stroke="#FFD700" stroke-width="2.5"/><path d="M62 154q30 40 78 104" fill="none" stroke="#FFD700" stroke-width="5" opacity=".8"/><rect x="92" y="134" width="16" height="22" rx="6" fill="#E8A87C"/><circle cx="100" cy="106" r="33" fill="#F2B98F"/><path d="M66 106c-6-36 20-48 36-46 22 2 38 16 30 46-6-18-18-28-34-28s-26 10-32 28z" fill="#1c1030"/><circle cx="100" cy="70" r="13" fill="#1c1030"/><circle cx="89" cy="110" r="3.2" fill="#2A1740"/><circle cx="111" cy="110" r="3.2" fill="#2A1740"/><path d="M90 124q10 9 20 0" fill="none" stroke="#7A1010" stroke-width="2.4" stroke-linecap="round"/><circle cx="100" cy="94" r="3" fill="#D81B3C"/><circle cx="66" cy="120" r="3.4" fill="#FFD700"/><circle cx="134" cy="120" r="3.4" fill="#FFD700"/></g>' +
      /* sister arm + thali (animated) */
      '<g class="sis-hand"><path d="M130 168Q170 150 214 112" fill="none" stroke="#E8A87C" stroke-width="13" stroke-linecap="round"/><circle cx="216" cy="110" r="8" fill="#F2B98F"/><g transform="translate(214 126)"><ellipse rx="38" ry="9" fill="#FFD700" stroke="#B8860B" stroke-width="2"/><ellipse rx="30" ry="6" fill="#FFB300"/><circle cx="-14" cy="-3" r="4" fill="#D81B3C"/><circle cx="2" cy="-3" r="4" fill="#FFF8E7"/><g transform="translate(16 -3)"><path d="M0 -3c3-5 3-8 0-12-3 4-3 7 0 12z" fill="#FF8A00"/><ellipse cy="0" rx="6" ry="3" fill="#C2410C"/></g></g></g></svg>';
  }

  /* ---------- page builders ---------- */
  const head = (p, extra) => (p.date_label ? '<div class="date-badge" data-reveal>' + esc(p.date_label) + '</div>' : '') + '<h2 class="title-en ' + (extra || '') + '" data-split>' + esc(p.title_en) + '</h2>' + (p.subtitle_gu ? '<p class="subtitle gu" data-reveal>' + esc(p.subtitle_gu) + '</p>' : '');
  const msgs = (p, cls) => p.messages_gu.map((m) => '<div class="glass msg ' + (cls || '') + '" data-reveal><p class="gu">' + esc(m) + '</p></div>').join('');
  const shell = (p, n, inner, deco) => '<section class="page page--' + n + '" id="page-' + n + '" data-id="' + esc(p.id) + '" aria-label="' + esc(p.title_en) + '"><div class="bg"></div><div class="bg-shade"></div><div class="dust" aria-hidden="true">' + dustHTML() + '</div>' + (deco || '') + '<div class="frame" aria-hidden="true"></div><div class="page__inner">' + inner + '</div></section>';

  function wsSVG(kind) {
    const SK = '#C68642', DK = '#1a0f0f';
    const arm = (side, sleeve, bangles) => { const x = side === 'l' ? 31 : 75, ox = side === 'l' ? 38 : 82;
      return '<g class="arm arm-' + side + '" style="transform-origin:' + ox + 'px 82px"><rect x="' + x + '" y="22" width="14" height="62" rx="7" fill="' + SK + '"/><rect x="' + x + '" y="54" width="14" height="30" rx="6" fill="' + sleeve + '"/>' +
        (bangles ? '<rect x="' + (x - 1) + '" y="38" width="16" height="4" rx="2" fill="#FFD700"/><rect x="' + (x - 1) + '" y="44" width="16" height="3" rx="1.5" fill="#FFB300"/>' : '') + '<circle cx="' + ox + '" cy="18" r="8" fill="' + SK + '"/></g>'; };
    const wrap = (inner) => '<svg class="ws-svg" viewBox="0 0 120 260" aria-hidden="true"><g class="ws-sway">' + inner + '</g></svg>';
    const legs = (c) => '<rect x="40" y="166" width="17" height="82" rx="4" fill="' + c + '"/><rect x="63" y="166" width="17" height="82" rx="4" fill="' + c + '"/><rect x="38" y="244" width="21" height="11" rx="5" fill="#3a2a20"/><rect x="61" y="244" width="21" height="11" rx="5" fill="#3a2a20"/>';
    const neck = '<rect x="53" y="56" width="14" height="18" rx="5" fill="' + SK + '"/>';
    const torso = (c) => '<path d="M34 80q26-14 52 0l6 92H28z" fill="' + c + '"/>';
    const boy = (kurta, turban, sash, trou) => wrap(legs(trou) + torso(kurta) + '<path d="M36 82l10-6 44 82-12 8z" fill="' + sash + '"/>' + neck + arm('l', kurta) + arm('r', kurta) +
      '<path d="M52 52h16l5 46-14-4z" fill="' + turban + '"/><ellipse cx="60" cy="40" rx="21" ry="19" fill="' + turban + '"/><path d="M40 38q20-12 40 0" fill="none" stroke="#FFD700" stroke-width="3"/>');
    if (kind === 'boyL') return boy('#F4EFE6', '#7A1020', '#D4AF37', '#E8E2D0');
    if (kind === 'boyR') return boy('#FF9933', '#C1121F', '#FFD700', '#F1E6CF');
    if (kind === 'girl') return wrap('<path d="M36 114h48l22 124H14z" fill="#8B1A2B"/><path d="M14 238h92l2 12H12z" fill="#D4AF37"/><path d="M26 196h68" stroke="#FFD700" stroke-width="3" stroke-dasharray="5 4"/><path d="M26 160h68" stroke="#FFD700" stroke-width="2" stroke-dasharray="3 5" opacity=".7"/>' +
      '<path d="M34 80q26-14 52 0l2 36H32z" fill="#8B1A2B"/><path d="M33 112h54" stroke="#FFD700" stroke-width="3"/>' + neck + arm('l', '#8B1A2B', 1) + arm('r', '#8B1A2B', 1) +
      '<path d="M32 82q28-16 56 0l-4 62-12 26-8-36-12 42-16-32z" fill="#FFD700" opacity=".6"/>' +
      '<path d="M60 58Q68 100 58 140T60 184" fill="none" stroke="' + DK + '" stroke-width="10" stroke-linecap="round"/><rect x="53" y="94" width="14" height="4" rx="2" fill="#FFD700"/><rect x="53" y="124" width="14" height="4" rx="2" fill="#FFD700"/><rect x="53" y="154" width="14" height="4" rx="2" fill="#FFD700"/><circle cx="60" cy="190" r="4.5" fill="#FFD700"/>' +
      '<ellipse cx="60" cy="40" rx="21" ry="22" fill="' + DK + '"/><circle cx="60" cy="24" r="3.5" fill="#FFD700"/>');
    return wrap(legs('#EFE3C8') + torso('#FFF2D5') + '<path d="M32 80q28-16 56 0l2 24q-30-10-60 0z" fill="#D4AF37"/><path d="M84 92l7 78-13 4z" fill="#C9A227"/>' + neck + arm('l', '#FFF2D5') + arm('r', '#FFF2D5') +
      '<path d="M39 42a21 21 0 0 1 42 0v8q-21-8-42 0z" fill="' + DK + '"/><ellipse cx="60" cy="46" rx="20" ry="17" fill="' + DK + '"/>');
  }
  DW.wsSVG = wsSVG;
  const avatarSVG = () => '<svg class="fm-avatar" viewBox="0 0 200 200" role="img" aria-label="Pritesh R. Makwana"><rect width="200" height="200" fill="#FFD9A0"/><path d="M22 200q0-50 78-58 78 8 78 58z" fill="#FF9933"/><path d="M22 200q2-38 46-56l24 20-6 36z" fill="#FFD700" opacity=".92"/><path d="M100 152v48" stroke="#E07B12" stroke-width="3"/><circle cx="106" cy="166" r="3" fill="#FFF2D5"/><circle cx="106" cy="182" r="3" fill="#FFF2D5"/><path d="M80 142q20 16 40 0v-10H80z" fill="#FFF2D5"/><rect x="87" y="112" width="26" height="28" rx="9" fill="#C68642"/><ellipse cx="61" cy="88" rx="6.5" ry="10" fill="#B87636"/><ellipse cx="139" cy="88" rx="6.5" ry="10" fill="#B87636"/><path d="M62 82Q62 136 100 140Q138 136 138 82Q138 44 100 42Q62 44 62 82Z" fill="#C68642"/><path d="M59 86Q48 34 100 28Q152 32 141 86Q136 58 112 52Q86 47 72 62Q62 70 59 86Z" fill="#1a0f0f"/><path d="M74 80q9-6 18-1M108 79q9-5 18 1" stroke="#1a0f0f" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="84" cy="90" rx="4.5" ry="5.5" fill="#1a0f0f"/><ellipse cx="116" cy="90" rx="4.5" ry="5.5" fill="#1a0f0f"/><circle cx="85.5" cy="88" r="1.5" fill="#fff"/><circle cx="117.5" cy="88" r="1.5" fill="#fff"/><path d="M100 94v13" stroke="#A8662A" stroke-width="3" stroke-linecap="round"/><path d="M86 112q14-7 28 0q-14 4-28 0z" fill="#1a0f0f"/><path d="M84 118q16 15 32 0" stroke="#7A1010" stroke-width="4.5" fill="none" stroke-linecap="round"/></svg>';
  DW.avatarSVG = avatarSVG;

  function buildPages(C, U) {
    const P = C.pages, L = C.ui_labels;
    const out = [];
    // 1 Vagh Baras
    out.push(shell(P[0], 1, head(P[0]) + msgs(P[0]), '<div class="fx" id="fx-1" aria-hidden="true"></div>' + bulbs(16, 'string-lights') + '<div class="float-diyas" aria-hidden="true">' + cdiya(7, 'lit') + '</div>'));
    // 2 Dhanteras
    const s = P[1].sections;
    out.push(shell(P[1], 2, head(P[1], 'title-en--long') + msgs(P[1]) + '<div class="duo">' +
      '<article class="glass card-sec" data-reveal><div class="lottie lottie--lotus" data-lottie="lotus" aria-hidden="true"></div><h3 class="sec-title">' + esc(s[0].title_en) + '</h3><p class="gu">' + esc(s[0].message_gu) + '</p></article>' +
      '<article class="glass card-sec" data-reveal><div class="lottie lottie--train" data-lottie="journey-home" role="img" aria-label="' + esc(s[1].visual) + '"></div><h3 class="sec-title">' + esc(s[1].title_en) + '</h3><p class="gu">' + esc(s[1].message_gu) + '</p></article></div>',
      '<div class="fx" id="fx-2" aria-hidden="true"></div><div class="float-diyas" aria-hidden="true">' + cdiya(5, 'lit') + '</div>'));
    // 3 Kali Chaudas: hero + Section A (haunted folklore night) + Section B (devotional, revealed by "Maa Kali Darshan")
    const p3 = P[2], sa = p3.section_a, sb = p3.section_b;
    const house = '<svg class="kc-house" viewBox="0 0 400 190" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><g fill="#050505"><path d="M0 190V150l30-10 14-34 14 34 26 4V190z"/><path d="M60 190V96h14l-7-22-7 22h14V82l-7-14-7 14V190z" opacity="0"/><rect x="110" y="92" width="180" height="98"/><path d="M104 92l96-44 96 44z"/><rect x="186" y="26" width="28" height="30"/><path d="M180 28l20-18 20 18z"/><rect x="118" y="60" width="26" height="34"/><path d="M114 62l17-14 17 14z"/><rect x="256" y="60" width="26" height="34"/><path d="M252 62l17-14 17 14z"/><path d="M330 190v-60l10-14 10 14v60zM356 190v-40l14-10 14 10v40z"/><path d="M0 190h400v-8H0z"/></g><g fill="#D4AF37" opacity=".55"><rect x="126" y="108" width="12" height="18" rx="6"/><rect x="262" y="108" width="12" height="18" rx="6"/><rect x="194" y="110" width="12" height="22" rx="6" opacity=".9"/><rect x="156" y="130" width="10" height="16" rx="5" opacity=".4"/><rect x="234" y="130" width="10" height="16" rx="5" opacity=".4"/></g></svg>';
    const abstract = '<div class="kc-abstract" aria-hidden="true"><svg viewBox="0 0 120 160"><defs><radialGradient id="kca" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#FFE08A"/><stop offset=".45" stop-color="#C1121F"/><stop offset="1" stop-color="#2A0000"/></radialGradient></defs><rect width="120" height="160" fill="url(#kca)"/><g fill="none" stroke="#FFD700" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M60 30v96M60 30c-12 0-18 8-18 20M60 30c12 0 18 8 18 20M42 50c0 8 8 12 18 12s18-4 18-12"/><path d="M56 126h8"/></g><path d="M60 14l5 12h-10z" fill="#FFD700"/><g transform="translate(60 140)"><path d="M-16 0h32c0 9-7 14-16 14S-16 9-16 0z" fill="#E4572E" stroke="#FFD700" stroke-width="1.5"/><path d="M0-14c5 5 6 9 0 14-6-5-5-9 0-14z" fill="#FFE066"/></g></svg></div>';
    out.push(shell(p3, 3,
      '<div class="kc">' +
        '<section class="kc-hero">' +
          '<h2 class="kc-title gu" data-reveal>' + esc(p3.title_en) + '</h2>' +
          '<p class="subtitle gu" data-reveal>' + esc(p3.subtitle_gu) + '</p>' +
          '<p class="kc-date gu" data-reveal>' + esc(p3.date_line_gu) + '</p>' +
          '<button id="kc-diya" class="kc-diya no-swipe" type="button" aria-pressed="false" aria-label="' + esc(U.kc_diya_aria) + '" data-reveal><span class="cdiya"><i class="diya__flame"></i><i class="diya__bowl"></i></span></button>' +
          '<p class="kc-hint" data-reveal>' + esc(U.kc_diya_hint) + '</p>' +
          '<div class="kc-actions no-swipe" data-reveal><button id="kc-mystery" class="btn kc-btn" type="button">' + esc(U.kc_mystery) + '</button><button id="kc-darshan" class="btn kc-btn kc-btn--gold" type="button">' + esc(U.kc_darshan) + '</button><button id="kc-bless" class="btn kc-btn" type="button" aria-expanded="false">' + esc(U.kc_blessing) + '</button><button id="kc-amb" class="btn kc-btn kc-btn--small" type="button" aria-pressed="false">' + esc(U.kc_amb_off) + '</button></div>' +
          '<div id="kc-blessing" class="kc-blessing glass" hidden><p class="kc-name gu" hidden></p><p class="gu">' + esc(p3.welcome_gu) + '</p></div>' +
        '</section>' +
        '<section id="kc-a" class="kc-sec kc-a" aria-label="' + esc(sa.label_gu) + '">' +
          '<div class="kc-a__bg" aria-hidden="true"></div>' + house + '<div class="kc-moon" aria-hidden="true"></div>' +
          '<div class="fog f1" aria-hidden="true"></div><div class="fog f2" aria-hidden="true"></div><div class="fog f3" aria-hidden="true"></div>' +
          '<img class="kc-ghost g1" src="assets/images/ghost.webp" alt="' + esc(U.alt_ghost) + '" width="180" height="252" loading="lazy" decoding="async"><img class="kc-ghost g2" src="assets/images/ghost.webp" alt="" aria-hidden="true" width="180" height="252" loading="lazy" decoding="async">' +
          '<div class="kc-motes" aria-hidden="true">' + range(12).map((i) => '<i style="--l:' + (6 + i * 8) + '%;--t:' + (7 + (i % 5) * 2) + 's;--d:-' + (i * 0.9).toFixed(1) + 's"></i>').join('') + '</div>' +
          '<div class="kc-a__text"><h3 class="kc-h gu">' + esc(sa.heading_gu) + '</h3><p class="gu">' + esc(sa.text_gu) + '</p></div><div class="kc-clear" aria-hidden="true"></div>' +
        '</section>' +
        '<section id="kc-b" class="kc-sec kc-b" aria-label="' + esc(sb.label_gu) + '" hidden>' +
          '<div class="kc-rays" aria-hidden="true"></div>' +
          '<h3 class="kc-h kc-h--gold gu">' + esc(sb.heading_gu) + '</h3>' +
          '<figure class="kc-frame"><img src="assets/images/kali-mata.webp" alt="' + esc(U.alt_kali) + '" width="1200" height="1366" loading="lazy" decoding="async">' + abstract + '</figure>' +
          '<span class="kc-bigdiya" aria-hidden="true"><span class="cdiya lit"><i class="diya__flame"></i><i class="diya__bowl"></i></span></span>' +
          '<p class="gu kc-btext">' + esc(sb.text_gu) + '</p>' +
          '<p id="kc-mantra" class="kc-mantra gu" data-text="' + esc(sb.mantra_gu) + '">' + esc(sb.mantra_gu) + '</p>' +
          '<p class="gu kc-mline">' + esc(sb.mantra_line_gu) + '</p>' +
        '</section>' +
      '</div>', '<div class="fx" id="fx-3" aria-hidden="true"></div>'));
    // 4 Main Diwali (hero page)
    out.push('<section class="page page--4" id="page-4" data-id="' + esc(P[3].id) + '" aria-label="' + esc(P[3].title_en) + '">' +
      '<div class="sky"></div><div class="stars" aria-hidden="true"></div><div class="moon" aria-hidden="true"></div><div class="dust" aria-hidden="true">' + dustHTML() + '</div>' +
      '<div class="sky-flash" aria-hidden="true"></div><canvas id="fw-canvas" class="fw-canvas" aria-hidden="true"></canvas>' +
      '<div class="hills" aria-hidden="true"></div><div class="house-wrap" aria-hidden="true">' + houseSVG() + '</div>' +
      '<div class="rangoli-wrap" aria-hidden="true">' + rangoliSVG() + '</div>' +
      toranSVG().replace('class="toran"', 'class="toran toran--l"') + bulbs(26, 'p4-lights') +
      '<div class="diya-field"></div><div class="frame" aria-hidden="true"></div>' +
      '<div class="page__inner p4-inner"><div class="date-badge" data-reveal>' + esc(P[3].date_label) + '</div><h2 class="title-en title-en--hero" data-split>' + esc(P[3].title_en) + '</h2><p class="subtitle gu" data-reveal>' + esc(P[3].subtitle_gu) + '</p>' +
      '<p class="hello hello--4" data-tpl="diwali" data-reveal hidden></p><p class="p4-msg gu" data-reveal>' + esc(P[3].messages_gu[0]) + '</p>' +
      '<div class="p4-controls" data-reveal><button type="button" class="btn btn--burst js-burst"><span class="burst-ico" aria-hidden="true">✦</span> ' + esc(L.burst_button) + '</button><button type="button" class="btn btn--toggle js-celebrate" aria-pressed="false"><span class="tog" aria-hidden="true"></span> ' + esc(U.celebration_mode) + '</button></div></div></section>');
    // 5 Dhoko Day
    const D = P[4], split1 = (t) => { const m = /^(.*?[!?])(\s[\s\S]*)?$/.exec(t); return m ? [m[1], m[2] || ''] : [t, '']; };
    out.push(shell(D, 5, '<h2 class="sr-only">' + esc(D.title_en) + '</h2>' + (D.date_label ? '<div class="date-badge" data-reveal>' + esc(D.date_label) + '</div>' : '') +
      '<section class="dhead"><p class="dh1">' + esc(D.header_lines[0]) + '</p><p class="dh2 gu">' + esc(D.header_lines[1]) + '</p><p class="dh3 gu">' + esc(D.header_lines[2]) + '</p></section>' +
      '<div class="dgrid">' + D.cards.map((c) => { const a = split1(c.text_gu); return '<article class="dcard" tabindex="0"><p class="dcard__emoji" aria-hidden="true">' + esc(c.emoji) + '</p><p class="gu"><b>' + esc(a[0]) + '</b>' + esc(a[1]) + '</p></article>'; }).join('') + '</div>' +
      '<section class="dpunch gu"><p>' + esc(D.punchline_gu) + '</p></section>'));
    const diyaS = '<span class="cdiya lit"><i class="diya__flame"></i><i class="diya__bowl"></i></span>';
    const wsBtn = '<button id="ws-open" class="btn kc-btn kc-btn--gold ws-open no-swipe" type="button" aria-expanded="false" data-reveal>' + esc(U.ws_btn) + '</button>';
    const wsScene = '<section id="ws" class="ws no-swipe" hidden aria-label="' + esc(U.ws_btn) + '"><div class="ws-toran" aria-hidden="true"></div><div class="ws-lights" aria-hidden="true"></div><div class="ws-floor" aria-hidden="true"></div><span class="ws-diya ws-diya--l" aria-hidden="true">' + diyaS + '</span><span class="ws-diya ws-diya--r" aria-hidden="true">' + diyaS + '</span>' +
      '<p class="ws-title"><span class="title-en">' + esc(U.ws_title_en) + '</span><span class="gu">' + esc(U.ws_title_gu) + '</span></p>' +
      '<div class="ws-chars"><div class="ws-char"><div class="ws-tagwrap"><span class="ws-tag">' + esc(U.ws_left) + '</span></div>' + wsSVG('boyL') + '</div><div class="ws-char"><div class="ws-tagwrap"><span class="ws-tag" id="ws-tag-r"></span></div><div id="ws-right"></div></div></div>' +
      '<p class="hello hello--ws" data-tpl="ny" hidden></p><button id="ws-close" class="btn kc-btn" type="button">' + esc(U.ws_close) + '</button></section>';
    // 6 New Year
    out.push(shell(P[5], 6, '<div class="shubh-row" data-reveal>' + swastik(1) + '<div class="shubh-mid">' + '' + '</div>' + swastik(2) + '</div>' + head(P[5], 'title-en--gold') + wsBtn + wsScene + '<div class="msgs-col">' + msgs(P[5]) + '</div><p class="special-wish gu" data-reveal>' + esc(P[5].special_wish_gu) + '</p><p class="hello hello--6" data-tpl="ny" data-reveal hidden></p>',
      '<div class="fw" id="fw-6" aria-hidden="true"></div><div class="fx" id="fx-6" aria-hidden="true"></div>' + toranSVG() + '<div class="float-diyas" aria-hidden="true">' + cdiya(7, 'lit') + '</div>'));
    // 7 Bhai Bij
    out.push(shell(P[6], 7, head(P[6]) + '<div class="bij-wrap"><div class="bij-art" data-reveal>' + brotherSisterSVG() + '<div class="lottie lottie--heart h1" data-lottie="heart" aria-hidden="true"></div><div class="lottie lottie--heart h2" data-lottie="heart" aria-hidden="true"></div><div class="lottie lottie--heart h3" data-lottie="heart" aria-hidden="true"></div></div><div class="bij-text">' + msgs(P[6]) + '</div></div>', '<div class="fx" id="fx-7" aria-hidden="true"></div>'));
    // 8 Family wishes + two greeting-card designs
    const p8 = P[7], fw8 = p8.final_wishes;
    const wishes = '<div class="wishes-stage" role="group">' + p8.messages_gu.map((m) => '<p class="wish wish--msg gu">' + esc(m) + '</p>').join('') +
      '<div class="wish wish--final">' + fw8.map((w, i) => '<p class="' + (i === 0 ? 'fw-big' : i === 1 ? 'fw-gu gu' : i === 2 ? 'fw-sm gu' : 'fw-end gu') + '">' + esc(w) + '</p>').join('') + '</div>' +
      '<p class="wish wish--closing title-en">' + esc(p8.closing_en) + '</p></div>';
    const bursts = () => { let g = ''; for (let i = 0; i < 46; i++) g += '<circle cx="' + ((i * 97) % 540) + '" cy="' + ((i * 53) % 675) + '" r="' + (1 + (i % 3) * 0.6) + '" fill="#FFF2D5" opacity="' + (0.3 + (i % 4) * 0.15) + '"/>';
      [[92, 120, 66, '#FFD700'], [452, 150, 54, '#FF6F91'], [80, 560, 48, '#7DF9FF'], [462, 545, 60, '#FF9933']].forEach((b) => { for (let k = 0; k < 18; k++) { const a = k / 18 * 6.2832, x1 = b[0] + Math.cos(a) * b[2] * 0.25, y1 = b[1] + Math.sin(a) * b[2] * 0.25, x2 = b[0] + Math.cos(a) * b[2], y2 = b[1] + Math.sin(a) * b[2];
        g += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + b[3] + '" stroke-width="3" stroke-linecap="round"/><circle cx="' + x2.toFixed(1) + '" cy="' + y2.toFixed(1) + '" r="3" fill="' + b[3] + '"/>'; } });
      return '<svg class="gcard__bg" viewBox="0 0 540 675" aria-hidden="true">' + g + '</svg>'; };
    const gcard = (d, nm) => '<figure class="cardopt"><div class="card-wrap" role="button" tabindex="0" data-design="' + d + '" aria-label="' + esc(nm + ' - ' + U.card_hint) + '"><div class="gcard gcard--' + d + '"><div class="gcard__in">' + (d === 'a' ? '<div class="gcard__orn" aria-hidden="true"></div>' : bursts()) +
      '<p class="gcard__t1">' + esc(fw8[0]) + '</p>' + (d === 'a' ? '<div class="gcard__diya" aria-hidden="true">' + cdiya(3, 'lit big') + '</div>' : '') + '<p class="gcard__t2 gu">' + esc(fw8[1]) + '</p><p class="gcard__name gu g-name"></p><p class="gcard__city gu g-city"></p>' +
      '<p class="gcard__t4 gu">' + esc(fw8[2]) + '</p><p class="gcard__fam gu">' + esc(U.family_gu) + '</p><p class="gcard__famen">' + esc(U.family_en) + '</p><p class="gcard__place gu">' + esc(U.place_gu) + '</p><p class="gcard__dev">' + esc(U.dev_credit_en) + '</p></div></div></div><figcaption>' + esc(nm) + '</figcaption></figure>';
    const p9t = P[8].title_en; const card = '<section class="card-maker glass no-swipe" aria-labelledby="cm-title"><p id="cm-title" class="sr-only">' + esc(p9t) + '</p><p class="cm__for"><span id="c-for" class="cm__forT"></span> <button id="c-change" type="button" class="welcome__skip">' + esc(U.change_details) + '</button></p>' +
      '<p class="cm__hint">' + esc(U.card_hint) + '</p><div class="cards2">' + gcard('a', U.design_a) + gcard('b', U.design_b) + '</div>' +
      '<div class="cm__actions"><button id="btn-wa" type="button" class="btn btn--wa">' + esc(U.share_whatsapp) + '</button></div></section>';
    const fam = '<section class="family"><div class="family__art" data-reveal><img class="family__img" src="assets/images/OIP.webp" alt="' + esc(U.family_art_label) + '" decoding="async"></div><div class="family__txt"><p class="family__en" data-split>' + esc(U.family_en) + '</p><p class="family__gu gu" data-reveal>' + esc(U.family_gu) + '</p><p class="family__pl" data-reveal>' + esc(U.place_en) + '</p><p class="family__pl gu" data-reveal>' + esc(U.place_gu) + '</p></div></section>';
    const special = '<div class="glass special" data-reveal><p class="gu">' + esc(U.special_gu) + '</p><p>' + esc(U.special_en) + '</p></div>';
    const findme = '<div class="findme"><span class="findme__t">' + esc(U.find_me) + '</span><span class="findme__row"><a id="f-ig" class="btn btn--gold fm-btn" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg><span>' + esc(U.instagram) + '</span></a><a id="f-li" class="btn btn--gold fm-btn" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9.5h3V20H5zM6.5 4a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM10.5 9.5h2.9v1.5c.5-.9 1.7-1.7 3.3-1.7 3.2 0 3.8 2.1 3.8 4.9V20h-3v-5.1c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6V20h-3z" fill="currentColor"/></svg><span>' + esc(U.linkedin) + '</span></a></span></div>';
    out.push(shell(p8, 8, '<h2 class="title-en title-en--long" data-split>' + esc(p8.title_en) + '</h2>' + fam + '<p class="hello hello--8" data-tpl="diwali" data-reveal hidden></p>' + special + '<p class="subtitle gu" data-reveal>' + esc(p8.subtitle_gu) + '</p>' + wishes,
      '<div class="fw fw--click" id="fw-8"></div><div class="fx" id="fx-8" aria-hidden="true"></div>'));
    // 9 Greeting card (name + city come from the welcome modal)
    const p9 = P[8];
    out.push(shell(p9, 9, '<h2 class="title-en title-en--long" data-split>' + esc(p9.title_en) + '</h2><p class="subtitle gu" data-reveal>' + esc(p9.subtitle_gu) + '</p>' + card,
      '<div class="fx" id="fx-9" aria-hidden="true"></div>'));
    // 10 Find Me
    const p10 = P[9];
    out.push(shell(p10, 10, '<h2 class="title-en title-en--long" data-split>' + esc(p10.title_en) + '</h2><p class="subtitle gu" data-reveal>' + esc(p10.subtitle_gu) + '</p>' +
      '<section class="fm-top"><figure class="fm-photo" data-reveal><img data-srcs="pritesh.webp" alt="' + esc(U.alt_avatar) + '" width="600" height="600" loading="lazy" decoding="async"></figure><div class="fm-right"><div class="fm-who"><p class="fm-name">' + esc(U.dev_name_en) + '</p><p class="fm-name gu">' + esc(U.dev_name_gu) + '</p><p class="family__en">' + esc(U.family_en) + '</p><p class="family__gu gu">' + esc(U.family_gu) + '</p><p class="family__pl">' + esc(U.place_en) + '</p><p class="family__pl gu">' + esc(U.place_gu) + '</p></div>' + findme + '</div></section>' +
      '<p class="hello hello--10" data-tpl="diwali" data-reveal hidden></p>' +
      '<div class="glass fm-wish" data-reveal><h3 class="cm__title">' + esc(U.wishes_me) + '</h3><p class="gu">' + esc(p10.wish_gu) + '</p><p>' + esc(p10.wish_en) + '</p><p class="fm-sign">' + esc(p10.signature) + '</p></div>' +
      '<button id="f-credits" class="foot__btn fm-credits" type="button"></button><p class="title-en fm-thanks">' + esc(P[7].closing_en) + '</p>',
      '<div class="fx" id="fx-10" aria-hidden="true"></div>'));
    return out.join('');
  }

  function fatal(U, err) {
    const el = $('#fatal'); el.hidden = false;
    el.innerHTML = '<h1>' + esc((U && U.fetch_error_title) || 'Could not load content.json') + '</h1><p>' + esc((U && U.fetch_error_body) || 'Please run a local web server in this folder, for example: python3 -m http.server 8080 (or: npx serve), then open http://localhost:8080') + '</p><pre>' + esc(String(err)) + '</pre>';
    $('#opening').hidden = true; document.body.classList.remove('is-opening');
    console.error(err);
  }

  async function load(url) { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw new Error(url + ' -> HTTP ' + r.status); return r.json(); }

  async function boot() {
    let C, U;
    try { [C, U] = await Promise.all([load('content.json'), load('ui-extra.json')]); }
    catch (e) { return fatal(U, e); }
    DW.content = C; DW.ui = U;
    document.title = C.site.title; document.documentElement.lang = C.site.language || 'gu';
    const L = C.ui_labels;

    // opening
    $('#opening-title').textContent = C.opening.title; $('#opening-sub').textContent = C.opening.subtitle_gu;
    const sb = $('#start-btn'); sb.textContent = C.opening.button; sb.disabled = false;
    $('#mandala-petals').innerHTML = range(16).map((i) => '<ellipse cx="200" cy="70" rx="14" ry="48" transform="rotate(' + i * 22.5 + ' 200 200)"/>').join('');
    $('.dust', $('#opening')).innerHTML = dustHTML();

    // pages + HUD labels
    $('#stage').innerHTML = buildPages(C, U);
    document.querySelectorAll('.kc-frame img').forEach((im) => im.addEventListener('error', () => im.parentElement.classList.add('no-img')));
    document.querySelectorAll('.kc-ghost').forEach((im) => im.addEventListener('error', () => (im.style.display = 'none')));
    document.querySelectorAll('img[data-srcs]').forEach((im) => { const list = im.dataset.srcs.split(','); let i = 0;
      const next = () => { if (i < list.length) im.src = 'assets/images/' + list[i++]; else { const d = document.createElement('div'); d.innerHTML = avatarSVG(); im.replaceWith(d.firstChild); } };
      im.addEventListener('error', next); im.addEventListener('load', () => im.parentElement.classList.add('has-photo')); next(); });
    const fi = $('.family__img'); if (fi) fi.addEventListener('error', () => { const d = document.createElement('div'); d.innerHTML = familySVG(U.family_art_label); fi.replaceWith(d.firstChild); });
    $('#btn-home .btn__label').textContent = L.home; $('#btn-home').setAttribute('aria-label', L.home);
    $('#btn-next .btn__label').textContent = L.next; $('#btn-next').setAttribute('aria-label', L.next);
    $('#btn-prev .btn__label').textContent = L.previous; $('#btn-prev').setAttribute('aria-label', L.previous);
    $('#btn-mute .btn__label').textContent = L.mute; $('#btn-mute').setAttribute('aria-label', L.mute);
    $('#vol-label').textContent = L.volume; $('#volume').setAttribute('aria-label', L.volume);
    $('#timeline').setAttribute('aria-label', U.timeline);

    // audio UI
    const A = DW.audio, mb = $('#btn-music'), mu = $('#btn-mute'), vol = $('#volume');
    vol.value = Math.round(A.state.volume * 100);
    const paint = (s) => {
      mb.setAttribute('aria-pressed', s.musicOn ? 'true' : 'false'); mb.classList.toggle('is-off', !s.musicOn);
      const t = s.musicOn ? L.music_on : L.music_off; $('.btn__label', mb).textContent = t; mb.setAttribute('aria-label', t);
      mu.setAttribute('aria-pressed', s.muted ? 'true' : 'false'); mu.classList.toggle('is-off', s.muted);
      vol.style.setProperty('--v', vol.value + '%');
    };
    A.onChange(paint); paint(A.state);
    mb.addEventListener('click', () => A.toggleMusic());
    mu.addEventListener('click', () => A.toggleMute());
    vol.addEventListener('input', () => A.setVolume(vol.value / 100));

    $('.foot__en').textContent = U.dev_credit_en; $('.foot__gu').textContent = U.dev_credit_gu;
    $('#f-ig').href = U.instagram_url; $('#f-ig').setAttribute('aria-label', U.instagram); $('#f-ig').title = U.instagram;
    $('#f-li').href = U.linkedin_url; $('#f-li').setAttribute('aria-label', U.linkedin); $('#f-li').title = U.linkedin;
    $('#f-credits').textContent = U.credits; $('#cr-title').textContent = U.credits; $('#cr-close').textContent = U.close;
    $('#cr-body').innerHTML = '<h3>Images</h3><ul><li>Page 3: Kali Chaudas artwork - anonymous 19th-century Kalighat painting (Cleveland Museum of Art, CC0, via Wikimedia Commons); forest painting by Julius von Klever (public domain); ghost illustration "Ghost (dark)" by Editor B, Wikimedia Commons, CC BY 4.0; haunted house silhouette by cactus_cowboy (Openclipart, CC0).</li><li>Photos from Wikimedia Commons, CC BY-SA: Rupeshsarkar (Sun Temple, Modhera), humdingor (Lakshmi puja), Pinakpani (Diwali lamps), Sarika 1410 (Jalebi Fafda), Alokjain19883105 (Flower Rangoli), Khushboo Goel (Bhai Dooj), Ashwin Kumar (Diwali fireworks).</li><li>Family image (OIP.webp): provided by the site owner. Houses, rangoli, characters and Lottie files: original artwork made for this project (SVG/CSS/Lottie).</li></ul><h3>Music &amp; sound effects</h3><ul><li>Mixkit free music and sound effects (Mixkit License) - mixkit.co</li></ul><h3>Fonts</h3><ul><li>Playfair Display, Poppins, Noto Sans Gujarati (SIL OFL)</li></ul><h3>Libraries</h3><ul><li>GSAP + SplitText, Howler.js, lottie-web, tsParticles, canvas-confetti, fireworks-js, html2canvas</li></ul><p>Full details: CREDITS.md</p>';
    const cm = $('#credits-modal'); $('#f-credits').addEventListener('click', () => { cm.hidden = false; $('#cr-close').focus(); });
    const cc = () => { cm.hidden = true; $('#f-credits').focus(); }; $('#cr-close').addEventListener('click', cc); cm.addEventListener('click', (e) => { if (e.target === cm) cc(); }); document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cm.hidden) cc(); });
    DW.nav.init(C, U); DW.card.init(C, U);

    // ---- welcome modal + personalised wishes (name is only ever inserted via textContent)
    const wm = $('#welcome'), wi = $('#w-name');
    $('.w-en', wm).textContent = U.welcome_en; $('.w-gu', wm).textContent = U.welcome_gu;
    $('.l-en', wm).textContent = U.name_label_en; $('.l-gu', wm).textContent = U.name_label_gu;
    wi.placeholder = U.name_label_en + ' / ' + U.name_label_gu;
    $('#w-go').textContent = U.continue_en + ' / ' + U.continue_gu;
    $('.h-en', wm).textContent = U.how_title_en; $('.h-gu', wm).textContent = U.how_title_gu;
    U.guide.forEach((g) => { const li = document.createElement('li'); const ic = document.createElement('span'); ic.className = 'guide__ic'; ic.textContent = g.icon; ic.setAttribute('aria-hidden', 'true');
      const t = document.createElement('span'); t.className = 'guide__t'; const a = document.createElement('span'); a.textContent = g.en; const b = document.createElement('span'); b.className = 'gu'; b.textContent = g.gu; t.append(a, b); li.append(ic, t); $('#w-guide').appendChild(li); });
    $('#w-priv').textContent = U.privacy;
    ['#f-name', '#op-name'].forEach((q) => { const b = $(q); b.setAttribute('aria-label', U.change_name); b.title = U.change_name; });
    $('#op-name .btn__label').textContent = U.change_name;
    const store = { get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} } };
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, 30);
    let nameTw = [];
    function setNames(name) {
      DW.name = name; nameTw.forEach((t) => t.kill()); nameTw = [];
      document.querySelectorAll('.hello').forEach((el) => {
        el.textContent = '';
        if (!name) { el.hidden = true; return; }
        const k = el.dataset.tpl;
        ['en', 'gu'].forEach((lg) => { const parts = U['hello_' + k + '_' + lg].split('{name}'); const line = document.createElement('span'); line.className = 'hello__l' + (lg === 'gu' ? ' gu' : '');
          const n = document.createElement('b'); n.className = 'nm'; n.textContent = name; line.append(document.createTextNode(parts[0]), n, document.createTextNode(parts[1] || '')); el.appendChild(line); });
        if (DW.city) { const c = document.createElement('span'); c.className = 'hello__l hello__city'; c.textContent = '📍 ' + DW.city; el.appendChild(c); }
        el.hidden = false;
      });
      const nm = document.querySelectorAll('.hello .nm');
      if (name && window.gsap && !DW.fx.reduced()) nameTw.push(gsap.fromTo(nm, { color: '#FFF2D5', textShadow: '0 0 0 rgba(255,215,0,0)' }, { color: '#FFD700', textShadow: '0 0 14px #FFD700,0 0 34px #FF9933', duration: 1.3, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
      if (DW.card.setInfo) DW.card.setInfo({ name, city: DW.city || '' });
    }
    const wg = $('#w-gender'); $('.g-en', wm).textContent = U.gender_label_en; $('.g-gu', wm).textContent = U.gender_label_gu;
    U.gender_opts.forEach((o) => { const op = document.createElement('option'); op.value = o.v; op.textContent = o.en + ' / ' + o.gu; wg.appendChild(op); });
    const okGender = (v) => (U.gender_opts.some((o) => o.v && o.v === v) ? v : '');
    DW.gender = okGender(store.get('dw.gender'));
    const wc = $('#w-city'); $('.c-en', wm).textContent = U.city_label_en; $('.c-gu', wm).textContent = U.city_label_gu; wc.placeholder = U.city_label_en + ' / ' + U.city_label_gu;
    function openWelcome() { wi.value = DW.name || ''; wc.value = DW.city || ''; wg.value = DW.gender || ''; wm.hidden = false; setTimeout(() => wi.focus(), 50); }
    // fire-and-forget save to the Google Sheet (never blocks or shows errors; once per name+city per session)
    function saveSheet(name, city, gender) {
      try {
        if (navigator.doNotTrack === '1' || !window.SHEET_URL || ($('#w-website') && $('#w-website').value)) return;
        // every START click adds one row (refresh + START counts again), even if the form was skipped
        DW.vid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        fetch(window.SHEET_URL, { method: 'POST', mode: 'no-cors', keepalive: true, body: JSON.stringify({ event: 'start', id: DW.vid, name, city, gender, website: '' }) }).catch(() => {});
      } catch (e) {}
    }
    // later events for the same visit: page number visited, Wish Together clicked
    DW.track = (event, page) => { try { if (!DW.vid || !window.SHEET_URL) return; fetch(window.SHEET_URL, { method: 'POST', mode: 'no-cors', keepalive: true, body: JSON.stringify({ event, id: DW.vid, page: page || 0 }) }).catch(() => {}); } catch (e) {} };
    function closeWelcome(save) {
      if (save) { DW.city = clean(wc.value); DW.gender = okGender(wg.value); store.set('dw.gender', DW.gender); setNames(clean(wi.value)); if (DW.fx.refreshScene) DW.fx.refreshScene(); }
      store.set('dw.name', DW.name || ''); store.set('dw.city', DW.city || ''); wm.hidden = true;
      A.start(); // user click => calm default track starts (browsers block audio before this)
    }
    DW.openWelcome = openWelcome;
    DW.reset = () => { DW.nav.home(); A.reset(); openWelcome(); };
    $('#w-form').addEventListener('submit', (e) => { e.preventDefault(); closeWelcome(true); });
    ['#f-name', '#op-name'].forEach((q) => $(q).addEventListener('click', openWelcome));
    $('#c-change').addEventListener('click', openWelcome);
    // visitor count read from the Google Sheet (doGet); hidden if it fails
    try { if (window.SHEET_URL) fetch(window.SHEET_URL + '?t=' + Date.now()).then((r) => r.json()).then((j) => { const n = j && j.count; if (n || n === 0) { const o = $('#o-views'); o.querySelector('.vcount__n').textContent = n; o.querySelector('.vcount__l').textContent = U.views; o.hidden = false; const f = $('#f-views'); f.textContent = U.views + ': ' + n; f.hidden = false; } }).catch(() => {}); } catch (e) {}
    DW.city = clean(store.get('dw.city')); setNames(clean(store.get('dw.name')));
    openWelcome(); // always shown on load / refresh

    // opening-screen Prev / Music / Next (Next = start)
    $('#op-prev .btn__label').textContent = L.previous; $('#op-next .btn__label').textContent = L.next; $('#op-prev').setAttribute('aria-label', L.previous); $('#op-next').setAttribute('aria-label', L.next);
    $('#op-music').addEventListener('click', () => A.toggleMusic());
    A.onChange((s) => { const t = s.musicOn ? L.music_on : L.music_off; $('#op-music .btn__label').textContent = t; $('#op-music').setAttribute('aria-pressed', s.musicOn ? 'true' : 'false'); $('#op-music').classList.toggle('is-off', !s.musicOn); });
    A.toggleMusic(A.state.musicOn);

    // Fireworks ON/OFF: when ON, a click/tap anywhere launches a firework; when OFF, clicks do nothing
    DW.fire = { on: store.get('dw.fireOn') !== '0', engine: null };
    const paintFire = () => document.querySelectorAll('.js-fire').forEach((x) => { x.setAttribute('aria-pressed', DW.fire.on); x.classList.toggle('is-off', !DW.fire.on); }); paintFire();
    document.querySelectorAll('.js-fire .btn__label').forEach((e) => (e.textContent = U.fireworks_toggle));
    document.querySelectorAll('.js-fire').forEach((b) => { b.setAttribute('aria-label', U.fireworks_toggle); b.addEventListener('click', () => {
      DW.fire.on = !DW.fire.on; store.set('dw.fireOn', DW.fire.on ? '1' : '0'); document.querySelectorAll('.js-fire').forEach((x) => { x.setAttribute('aria-pressed', DW.fire.on); x.classList.toggle('is-off', !DW.fire.on); });
    }); });
    DW.fire.ensure = () => { if (!DW.fire.engine) { DW.fire.engine = new DW.Fireworks($('#fire-canvas'), { mobile: DW.fx.mobile(), reduced: DW.fx.reduced() }); window.addEventListener('resize', () => DW.fire.engine.resize()); } return DW.fire.engine; };
    document.addEventListener('click', (e) => {
      if (!DW.fire.on || (DW.nav.visible && /^(main-diwali|kali-chaudas)$/.test(DW.nav.content.pages[DW.nav.index].id)) || e.target.closest('button,a,input,label,.card-maker,.modal,[role=button]')) return;
      DW.fire.ensure().launch(e.clientX, e.clientY);
    });
    DW.fx.openingIn();

    const go = () => {
      A.start(); saveSheet(DW.name || '', DW.city || '', DW.gender || '');
      const i = DW.nav.fromHash();
      DW.nav.showSite(i == null ? 0 : i);
    };
    sb.addEventListener('click', go); $('#op-next').addEventListener('click', go);
    document.body.dataset.ready = '1';
  }

  if (document.fonts && document.fonts.load) { Promise.all([document.fonts.load('900 1em "Playfair Display"'), document.fonts.load('400 1em "Noto Sans Gujarati"', 'આ')]).catch(() => {}); }
  boot();
})();
