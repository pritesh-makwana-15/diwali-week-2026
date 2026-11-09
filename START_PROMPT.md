# Prompts for Claude Code

## How to start
1. Put this whole `diwali-week-2026` folder on your computer.
2. Run `git init` inside it.
3. Add your music files to `assets/music/` and any downloaded images to `assets/images/`.
4. Open a terminal in the folder and run `claude`.
5. Paste the MAIN PROMPT below.

---

## MAIN PROMPT (paste this first)

```text
Read CLAUDE.md and content.json first.

Build a premium, responsive, cinematic "Gujarati Diwali Week 2026" website:
an opening screen plus 8 full-screen festival pages (Vagh Baras, Dhanteras,
Choti Diwali, Main Diwali, Gujarati Fun Day, Gujarati New Year, Bhai Bij,
Final Family Wishes). Each page has its own theme, colors, background and
animations, as described in content.json.

Work in these phases. Do ONE phase at a time and stop for my approval:

PHASE 1 - Plan: Show your file plan, how content.json is loaded, and anything you need from me. No code yet.
PHASE 2 - Skeleton: Opening screen, navigation (Next/Prev, arrow keys, swipe, 1/8 indicator,
          progress bar, timeline, Home), GSAP page transitions. 8 pages with the real text
          but simple gradient backgrounds.
PHASE 3 - Audio: Howler.js music with ON/OFF, volume, mute; per-page tracks with crossfade;
          sound effects (diya, rocket, burst, bell) with Web Audio fallback.
PHASE 4 - Pages 1-3: visuals and animations.
PHASE 5 - Page 4 (main Diwali): Canvas fireworks, rockets, click-to-launch, clickable diyas,
          BURST OF FIREWORKS button, celebration mode. This must be the best page.
PHASE 6 - Pages 5-8: visuals and animations. Page 8 includes the "Create Your Family Greeting"
          generator (name input -> card -> download image / share on WhatsApp).
PHASE 7 - Polish: responsive fixes, performance, accessibility, Open Graph tags,
          README.md with setup and deploy steps, CREDITS.md.

After each phase, run the site locally, check for console errors, and tell me exactly how to test it.
Start with PHASE 1 now.
```

## Between phases
- Test in the browser. If it is good, run `git commit -am "phase N done"`, then type: `continue`
- If the chat gets long, run `/clear`, then say: `Read CLAUDE.md and continue with PHASE N.`

---

## Useful follow-up prompts

**Fix problems**
- `Gujarati text on page 6 is cut off at 360px width. Fix the layout without changing the text.`
- `Page 4 is slow on my phone. Profile it and reduce particles on small screens.`
- `Music starts before I click Start. Fix it so there is no autoplay.`
- `Review the whole project for broken paths, missing assets and console errors, then fix them.`

**Improve**
- `Make the page transitions feel like opening a festival greeting card.`
- `Add Open Graph tags and a 1200x630 preview image so the link looks good on WhatsApp.`
- `Add prefers-reduced-motion support and pause all canvas loops when the tab is hidden.`

**Before launch**
- `Run a final check: all 8 pages, navigation, audio controls, Gujarati rendering, mobile layout. Give me a pass/fail list.`
- `Write ASSETS_NEEDED.md and CREDITS.md based on every file in /assets.`

---

## After development is complete

**Test**
- Real Android phone, iPhone, Chrome and Safari on desktop.
- No music before the Start click. Mute, volume and Next/Prev work on every page.
- A Gujarati-speaking family member proofreads every message and date label.
- Test on mobile data, not only Wi-Fi.

**Optimize**
- Images to WebP (under 300 KB). Music MP3 ~128 kbps (under 3 MB each).
- Chrome DevTools -> Lighthouse: aim for 80+ on mobile.

**Legal**
- Check CREDITS.md. Remove anything you are not sure you can use.

**Deploy (free)**
- Easiest: drag the folder into Netlify Drop (app.netlify.com/drop).
- Others: Cloudflare Pages, Vercel, GitHub Pages.

**Share**
- Paste the link in WhatsApp to confirm the preview image and title show up.
- Send to family groups with a personal message. Keep a zip and git backup.
