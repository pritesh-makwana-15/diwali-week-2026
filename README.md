# Gujarati Diwali Week 2026

A cinematic, responsive celebration website: an opening screen and 8 full-screen festival pages. Plain HTML + CSS + vanilla JavaScript. No build step, no CDN.

## Run it

All text is loaded from `content.json` with `fetch()`, which browsers block on `file://`. Start any local web server in this folder:

```
python3 -m http.server 8080      # or:  npx serve
```

then open http://localhost:8080 (if you open `index.html` directly you will see a message explaining this).

Deep links: `http://localhost:8080/#p4` opens page 4 after you click START CELEBRATION.

## What is inside

```
index.html          page shell + Open Graph tags
content.json        ALL festival text (untouched, single source of truth)
ui-extra.json       a few functional button labels that content.json does not have (see "Text" below)
css/                style.css (design system + layout), animations.css (keyframes), responsive.css
js/                 main.js (loads content, builds pages), navigation.js, audio.js, animations.js (per-page effects),
                    fireworks.js (custom Canvas fireworks for page 4), card.js (greeting card)
assets/             backgrounds/ images/ music/ sounds/ lottie/ icons/ fonts/ vendor/
```

Libraries (all local in `assets/vendor/`): GSAP + SplitText, Howler.js, lottie-web, tsParticles (slim), canvas-confetti, fireworks-js, html2canvas.

## Pages and effects

| # | Page | Main effects |
|---|---|---|
| 1 | Vagh Baras | temple photo with slow zoom, string lights, floating diyas, falling petals/marigolds (tsParticles), text reveal |
| 2 | Dhanteras | falling gold coins, glowing lotus + animated "journey home" train (Lottie) |
| 3 | Choti Diwali | night sky, floating lanterns/diyas (tsParticles), small fireworks (fireworks-js), string lights |
| 4 | Happy Diwali 2026 | **custom Canvas fireworks engine** (8 shell types, rockets, trails, crackle, flashes), clickable diyas, rangoli reveal, haveli with glowing windows, toran, BURST button, celebration mode |
| 5 | Gujarati Fun Day | meme-style cards, bouncing SVG food characters, emoji reactions, confetti (tap a card) |
| 6 | Gujarati New Year 2083 | toran, Shubh Labh tiles, golden confetti, flower shower, fireworks, glowing wish |
| 7 | Bhai Bij | animated tilak ceremony (SVG + GSAP), floating hearts (Lottie + tsParticles) |
| 8 | Family wishes | grand fireworks (click the sky for more), timed wishes then closing line, **greeting card maker** |

### Page 4 controls
- Click/tap anywhere in the sky: a rocket launches to that point and bursts (with sound).
- Click/tap a diya: it lights (or goes out) and sprays a small spark fountain. Light them all for a bonus volley.
- **BURST OF FIREWORKS**: a staggered volley and finale.
- **Celebration Mode** (toggle): endless automatic fireworks, confetti, all diyas light up.

### Page 8 greeting card
Type a family name, press the create button, then download a 1080x1350 PNG (html2canvas) or share on WhatsApp. On phones the card image is shared through the native share sheet; on desktop it opens `wa.me` with the wishes text (download the image with the other button and attach it).

## Navigation
Next / Previous buttons, left/right arrow keys (Home/End too), touch swipe, page indicator (1/8), progress bar, timeline dots, Home button (returns to the opening screen).

## Audio
- No autoplay: nothing plays until you click **START CELEBRATION**.
- Persistent controls on every page: Music ON/OFF, Mute, Volume slider (volume is remembered).
- One track per page with a 2 s crossfade; the opening/Home uses the default track. Music pauses while the tab is hidden.
- Sound effects: diya, rocket, burst, bell, celebration. If a file cannot load, a Web Audio synthesized version plays instead.
- Credits for every track/effect are in `CREDITS.md`.

## Quality
- Mobile first; checked at 360, 768 and 1280 px wide (no horizontal scroll). Tall pages scroll vertically inside the frame.
- Fewer particles and smaller canvases on screens narrower than 768 px.
- All canvas loops use `requestAnimationFrame`, stop when the tab is hidden, and the page-4 engine stops completely when you leave the page or when nothing is animating.
- `prefers-reduced-motion`: particles, confetti, auto fireworks, Ken Burns and text animations are disabled/reduced (page 4 still answers to clicks, with lighter effects).
- Gujarati text uses Noto Sans Gujarati with line-height 1.85. SplitText is only applied to English titles, never to Gujarati (it would split conjuncts and matras).
- Accessibility: alt/aria labels, visible gold focus rings, 44 px touch targets, keyboard navigation.
- Open Graph + Twitter tags with a 1200x630 image (`assets/images/og-image.jpg`).

## Text rules
- Every Gujarati/English wish, title, date label and button label comes from `content.json`, exactly as supplied. Nothing was rewritten, shortened or translated.
- A few functional strings do not exist in `content.json` (for example "Celebration Mode", the family-name placeholder, "Create Card", "Download Card", "Share on WhatsApp", the diya aria-label). They live in `ui-extra.json` so `content.json` stays untouched. Please review/translate them if you want.
- The Shubh Labh decoration is drawn as symbols only (no new words were typed).

## Dates to double-check (flagged, not changed)
`content.json` itself asks to verify these against a Gujarati panchang before publishing. They are displayed exactly as supplied:
- **Page 5, 09 November 2026 - Monday**: the source label was "Padatar Divas" (the page title shown is "GUJARATI FUN DAY").
- **Page 6, 10 November 2026**: the source label was "Bestu Varsh".
- Please also confirm Dhanteras (06 Nov), Choti Diwali (07 Nov), Diwali (08 Nov) and Bhai Bij (11 Nov) in the panchang, in particular around the Amavasya change of date.

## Before you publish
1. Host over **HTTPS** (needed for the Web Share API on phones).
2. In `index.html` change `og:image` and `twitter:image` to the full `https://...` URL of `assets/images/og-image.jpg` and add `<meta property="og:url" content="https://...">`. WhatsApp caches previews, so use its debugger/refresh if you change the image.
3. Check `CREDITS.md`: the photos are CC BY-SA, so keep the attribution available (for example link CREDITS.md from your page or caption).
4. Listen to each page's music and swap the MP3 (same file name) if a track does not fit.

## Round 3 changes
- Welcome modal (name + city) shows on every load; Continue/Skip starts a calm default track; START CELEBRATION then crossfades to page tracks.
- Fireworks and music default ON; turning either OFF is remembered for the session (sessionStorage).
- Footer: developer line only. Instagram / LinkedIn / Credits live at the bottom of page 8; "Change name" is in the top bar (desktop) and on the opening screen.
- Page 5 is now "Dhoko Day" (text replaced in content.json at the owner's request). Page 8 has two card designs (tap a card to download); after a download, or via the last page's "Back to Welcome" button, the site returns to the welcome modal.

## Round 4 changes
- New **page 9 "Create Your Greeting Card"** (cards moved off page 8; the site now has 9 pages). Name/city come from the welcome modal; "Change details" reopens it and updates both previews live. Page 9 shares page 8's music. Tap a card to download; after a download (or via the last page's "Back to Welcome" button) the site resets to the welcome modal.
- **GoatCounter** (the only external script): `index.html` loads `gc.zgo.at/count.js`; each page change calls `goatcounter.count({path:'/page-N'})`. The modal's "Views: N" line reads `/counter/TOTAL.json` and stays hidden until "Allow adding visitor counts on your website" is enabled in GoatCounter settings (until then it answers 403). GoatCounter ignores `localhost`.
- **Google Sheet save**: `js/config.js` holds `SHEET_URL`. On Continue with a non-empty name, `{name, city, website:""}` is POSTed (fire and forget, once per name+city per session, honeypot field `website`). Sheet row 1: `Time | Name | City`, tab `Sheet1`; the Apps Script `doPost` must be the updated version, redeployed as a **New version**. Keep the Sheet private: names and cities are personal data.

## Round 5 changes
- **Page 3 is now Kali Chaudas** (text replaced in content.json at the owner's request; date 07 Nov 2026 kept). Hero + Section A (haunted folklore night: house, forest, moon, fog, ghosts; text revealed by "Mystery Reveal") + Section B (devotional: revealed by "Maa Kali Darshan", with golden frame, light rays and a letter-by-letter mantra). Other buttons: virtual diya, Divine Blessing (shows the welcome message and the visitor's name) and an optional synthesized "spooky ambience" (OFF by default, separate from the music, switched off when Section B opens). No fireworks or confetti on this page; page music is `khali.mp3` for the whole page.
- **New page 10 "Find Me"** (after the card page): Pritesh R. Makwana / Makwana Family intro with an illustration, Instagram and LinkedIn buttons, a wishes card, the Credits link and the thank-you line. Same music as page 8. The page-8 "Find me" row moved here. After a card download the site goes to page 10 (no reset); page 10's Next button is "Back to Welcome".
- **Visitors** line is now also in the footer on every page ("Visitors: N", hidden until GoatCounter allows public counts).
- Images (`assets/images/`): kali-mata, ghost, haunted-house, dark-forest. If a file is missing the page uses an SVG/CSS fallback; a file you place with the same name is used. See ASSETS_NEEDED.md and CREDITS.md.

## Round 6 changes
- **Gender (optional)** field in the welcome modal (Male / Female / Other / Prefer not to say). Saved in sessionStorage and sent with name and city to the Sheet (`gender` field; the Apps Script `doPost` must be updated to write a 4th column). The Sheet POST is skipped when the browser sends Do Not Track.
- **Page 6 "Wish Together"** button: a character scene (original SVG, seen from behind, waving) with name tags. Left is always "Pritesh"; the right character follows the gender (boy, girl or neutral) and the visitor's name ("You / તમે" if empty). Confetti, a firework burst (fireworks toggle) and a bell/cheer (sound toggle) on reveal; Close button.
- **Page 10** restyled: avatar frame, big buttons, responsive from 320 px to 4K. The avatar is an original SVG illustration; put your own photo at `assets/images/pritesh.webp` and it is used instead (the page tries that file first).
"# diwali-week-2026" 
