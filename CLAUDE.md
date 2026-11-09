# Project: Gujarati Diwali Week 2026

A premium, cinematic, fully responsive celebration website: an opening screen plus 8 full-screen festival pages.

## Stack (strict)
- HTML5, CSS3, vanilla JavaScript only. No React, Angular, Vue or build tools.
- Libraries: GSAP, Howler.js, lottie-web. Download them into `assets/vendor/`. Do NOT use CDN links.
- Fireworks and particles: Canvas API.
- Flames, lights, floating items: CSS keyframes.

## Content rules (most important)
- ALL text comes from `content.json`. Read it before writing any code.
- NEVER rewrite, translate, shorten, fix or "improve" any Gujarati or English text.
- Load text into the pages from content.json (fetch a local JSON, or inline it at build time). If fetch fails on `file://`, tell me and suggest running `python3 -m http.server`.
- Dates in content.json are as supplied by the owner. Do not change them. Flag doubts in README.md.

## Design system
- Colors: Deep Maroon #4A0E16, Royal Red #A51C30, Gold #FFD700, Saffron #FF9933, Warm Cream #FFF2D5, Night Purple #170E2D.
- Fonts: Playfair Display + Poppins (English), Noto Sans Gujarati (Gujarati). Self-host the font files in `assets/fonts/`.
- Style: premium gradients, glassmorphism where suitable, golden borders, soft shadows, festive patterns.
- Gujarati text needs generous line-height (1.6 or more) so matras are never clipped.

## Audio rules
- NO autoplay. Audio starts only after the "START CELEBRATION" click.
- Persistent controls on every page: music ON/OFF, volume slider, mute.
- Per-page tracks with crossfade, plus one default track.
- Sound effects: diya, rocket, burst, bell, celebration. If an audio file is missing, synthesize a simple fallback with the Web Audio API.
- Only use royalty-free or original audio. No copyrighted movie songs.

## Assets rules
- Use only local files. No hotlinked images, no broken external URLs.
- If an image or track is missing, build an SVG/CSS/Canvas fallback and add the item to `ASSETS_NEEDED.md` (what, which page, suggested source).
- Keep `CREDITS.md` with source and license for every image, track and Lottie file.
- Images: WebP, under 300 KB each. Music: MP3 ~128 kbps.

## Quality rules
- Mobile first. Test at 360px, 768px and 1280px widths.
- Performance: lower the particle count on mobile, pause canvas loops when the tab is hidden, use requestAnimationFrame only.
- Respect `prefers-reduced-motion` (reduce or disable heavy effects).
- Navigation: Next/Prev buttons, left/right arrow keys, touch swipe, page indicator (1/8), progress bar, timeline, Home button.
- Add Open Graph and Twitter meta tags (title, description, 1200x630 preview image) for WhatsApp sharing.
- Accessibility: alt text, visible focus states, buttons with aria-labels, sufficient text contrast.

## Working style
- Work in phases. After each phase, STOP, summarise what was done, and tell me exactly how to test it.
- Run the site locally after each phase and check the browser console for errors.
- Do not start the next phase until I say "continue".
- Make small, focused changes. Do not rewrite files that already work.

## Folder structure
```
diwali-week-2026/
├── index.html
├── content.json
├── CLAUDE.md
├── README.md
├── ASSETS_NEEDED.md
├── CREDITS.md
├── css/        style.css, animations.css, responsive.css
├── js/         main.js, navigation.js, fireworks.js, audio.js, animations.js
└── assets/     images/, backgrounds/, music/, sounds/, lottie/, icons/, fonts/, vendor/
```
**Core**
- HTML5, CSS3 (keyframes, gradients, glassmorphism, responsive)
- Vanilla JavaScript (ES6)

**Animation libraries**
- GSAP + SplitText: transitions, text reveals
- Lottie-web: animated illustrations
- tsParticles: petals, golden dust, lanterns
- canvas-confetti: confetti
- fireworks-js: fireworks (pages 3, 6, 8)
- Custom Canvas API: page 4 fireworks and rockets

**Audio**
- Howler.js: music and sound effects
- Web Audio API: fallback sounds

**Extra features**
- html2canvas: greeting card download
- Web Share API / WhatsApp link: sharing

**Fonts**
- Playfair Display, Poppins, Noto Sans Gujarati

**Assets**
- Images: Unsplash, Pexels, Pixabay, Wikimedia (WebP format)
- Animations: LottieFiles (JSON)
- Audio: Pixabay Music, Mixkit (MP3)
- SVG for fallback art

**Dev tools**
- Claude Code (AI builder)
- Node.js + npm (to get the libraries)
- Git (version control)
- Python or `npx serve` (local test server)
- Chrome DevTools + Lighthouse (testing, performance)

**Deploy**
- Netlify Drop, Cloudflare Pages, Vercel, or GitHub Pages