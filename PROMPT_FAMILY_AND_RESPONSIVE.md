# Prompt for Claude Code (paste everything in the code block)

```text
Read CLAUDE.md, content.json and FAMILY_DETAILS.md first. Do ALL tasks below in one run without stopping. Do not change any existing text in content.json. Put new texts in ui-extra.json.

TASK A - FAMILY AND DEVELOPER DETAILS (use the exact text from FAMILY_DETAILS.md)

1. Page 8: under "WITH LOVE FROM OUR FAMILY" show "Makwana Family / મકવાણા પરિવાર" in large golden typography, and "Lathidad, Botad, Gujarat / લાઠીદડ, બોટાદ, ગુજરાત" beneath it, with an animated reveal. Add the special wish message (Gujarati and English) in a glass card.
2. Family cartoon: download a free-licensed cartoon family illustration into assets/images/family-cartoon.webp (under 300 KB), show it in a golden frame on page 8 with a gentle float animation. Record the source and license in CREDITS.md and show it in the visible Credits section. If no good image downloads, draw an original SVG cartoon family instead.
3. Greeting card maker: pre-fill the family name with "મકવાણા પરિવાર" and print the family name and place on the downloaded card. Check the Gujarati renders correctly in the PNG (fonts must be loaded before html2canvas runs).
4. Footer on EVERY page (small, elegant, never covering buttons or text):
   - "Developed with ❤ by Pritesh R. Makwana" (and the Gujarati line)
   - Two round icon links: Instagram and LinkedIn (inline SVG icons, no external icon files), opening in a new tab with rel="noopener noreferrer". Use the exact URLs from FAMILY_DETAILS.md.
   - A "Credits" link that opens the credits list.
5. Update the Open Graph title and description to mention "Makwana Family".

TASK B - FULLY RESPONSIVE ON EVERY SCREEN SIZE

Make the whole site work perfectly on: small phones (320px, 360px), large phones (414px), foldables, tablets portrait and landscape (768px, 1024px), laptops (1280px, 1366px), desktops (1440px, 1920px), ultrawide and 4K (2560px+). Also phones in landscape (short height, about 360px).

1. Mobile first CSS. Use fluid sizing: clamp() for fonts and spacing, rem/vw/vh units, CSS grid/flexbox. No fixed pixel widths for layout.
2. Use 100dvh (with a 100vh fallback) so mobile browser address bars don't cut off pages. Respect safe-area insets (env(safe-area-inset-*)) for notched phones.
3. Gujarati text: line-height at least 1.6, no clipped matras, no overflow, text always inside its container at every size. Long titles wrap cleanly.
4. Navigation, music controls, footer and page indicator: tap targets at least 44x44px, never overlapping text, adapted layout for small screens (compact icons) and large screens.
5. Short-height screens (landscape phones, small laptops): reduce spacing and illustration size so everything fits or scrolls inside the page without breaking animations.
6. Images and illustrations scale with the screen (object-fit, max-width:100%, srcset where useful). Page 4 canvas fills the screen and resizes on window resize and rotation, with devicePixelRatio handled and capped at 2 for performance.
7. Particle and firework counts scale by screen size and device power. Keep 60fps feel on low-end phones.
8. Prevent horizontal scroll everywhere. Prevent accidental zoom on inputs (inputs at least 16px font) and fix the greeting-card form for small screens.
9. Touch support: swipe for navigation, tap for fireworks and diyas. Mouse and keyboard still work on desktop.
10. Test yourself at these widths using a headless browser or Playwright screenshots: 320, 360, 414, 768, 1024, 1280, 1440, 1920, 2560, plus landscape 640x360. Check all 8 pages at each size for cut-off text, overlaps, horizontal scroll and console errors. Fix everything you find. Save screenshots in a /qa-screenshots folder.

FINISH
- Update README.md (how to run on Windows: npx serve -l 8080) and CREDITS.md.
- Give me a short report: what was added, what fell back, and what I must check manually (including Gujarati proofreading of the new special message).
```
