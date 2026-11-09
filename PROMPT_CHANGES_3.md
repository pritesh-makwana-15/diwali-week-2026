# Prompt for Claude Code (copy everything inside the code block)

Before pasting: copy your image `OIP.webp` into `assets/images/` and save the screenshot of the Dhoko Day page as `assets/design-ref-dhoko.png` (optional design reference).

```text
Read CLAUDE.md, content.json, ui-extra.json and FAMILY_DETAILS.md. Do ALL changes below in one run. Edit existing files, don't rewrite working code. Keep it fast, minimal tokens, short final report. Keep everything responsive from 320px to 4K.

1. ALWAYS SHOW THE WELCOME MODAL ON LOAD
- Show the welcome modal on every page load and refresh. Pre-fill fields from sessionStorage if present, but still show the modal.

2. MODAL FIELDS
- Fields: Name and City (English or Gujarati typing, 16px+, max 30 characters each, trim, textContent only, no innerHTML). Keep the "How to use" guide and Skip.
- Save name and city in sessionStorage (try/catch). Use them in personalised wishes and on the greeting cards (see 7).

3. MUSIC ON THE WELCOME SCREEN
- Start a calm default track when the user clicks Continue/Skip in the modal (browsers block autoplay before a click, so no audio before that). It keeps playing through the opening screen. START CELEBRATION then crossfades to the page tracks.

4. FIREWORKS AND SOUND ALWAYS ON BY DEFAULT
- Fireworks toggle default ON and sound/music default ON on every page. If the user turns either OFF, keep it OFF until they turn it back ON (persist in sessionStorage). Update guide step 3 to match.

5. FOOTER = ONLY THE DEVELOPER NAME
- Footer on every page: only "Developed with ❤ by Pritesh R. Makwana" (and the Gujarati line, small). Remove Instagram, LinkedIn, Credits link and Change name from the footer. Keep "Change name" reachable from the menu or the top controls.

6. PAGE 5 (DHOKO DAY) - REPLACE ALL TEXT AND REDESIGN
- You may replace page 5 text in content.json (the owner asked for this). Use EXACTLY this text:
  Title: ધોકો ડે – DHOKO DAY SPECIAL 😂
  Header card line 1: DHOKO DAY SPECIAL 😂
  Header card line 2: દિવાળી પછીનો મજેદાર દિવસ! 🤣
  Header card line 3: રામ રામ, ધોકા અને મોજ-મસ્તી! 😜
  Card 1: 🙏😂 / આજે રામ રામ કરી લેવાના કે કાલે? 🤔
  Card 2: 🥳🎊 / કાલે તો બેસતું વર્ષ છે ભાઈ! નવા વર્ષની શુભેચ્છાઓ તૈયાર રાખજો! 😎
  Card 3: 🎆🤣 / દિવાળીમાં ફટાકડા ફોડીને થાકી ગયા હશો ને? 💥
  Card 4: 😎☕ / તો હવે થોડો બ્રેક લઈ લો ભાઈ! ધોકા ખાવા માટે એનર્જી બચાવી રાખો! 😂
  Footer punchline: "ધોકો ડે છે ભાઈ... એટલે આજે કોઈની વાતમાં આવતા નહીં, નહીં તો કાલે આખું વર્ષ યાદ રાખશો!" 🤣💥
- Design (follow assets/design-ref-dhoko.png if present): a wide cream header card with the 3 centred lines (line 1 large brown, line 2 bold, line 3 lighter), then four cream rounded cards in a 2x2 grid (1 column below 640px). Each card: emojis centred on top, then the text with the first sentence bold. Add the punchline as a full-width golden-bordered card at the bottom. Playful background, bouncing emojis, confetti, card pop-in animation with GSAP. Gujarati line-height 1.6+, no overflow at 320px, page scrolls inside itself on short screens.

7. LAST PAGE (PAGE 8) - REDESIGN, MOBILE-PERFECT, TWO CARD DESIGNS
- Replace the family image with assets/images/OIP.webp (golden frame, gentle float). If the file is missing, keep the current SVG. Resize to under 300 KB if larger, and note in CREDITS.md that it was provided by the site owner.
- Layout order, single centred column on mobile, two columns only on wide screens: heading "WITH LOVE FROM OUR FAMILY" > family image > "Makwana Family / મકવાણા પરિવાર" + place > personalised wish with visitor name and city > special wish card > greeting card section > "Find me on" row with Instagram and LinkedIn icon links (new tab, rel="noopener noreferrer", exact URLs from FAMILY_DETAILS.md) plus a small Credits link > "Developed with ❤ by Pritesh R. Makwana".
- Greeting card section: show TWO different card designs side by side (stacked on mobile) as live previews, e.g. Design A "Royal Gold" (maroon and gold, diya motif) and Design B "Festive Night" (purple night sky, fireworks motif). Both show: visitor name, city, "Happy Diwali / સાલ મુબારક", the Makwana family name and place, and the developer line. Clicking/tapping a design downloads that card as PNG (html2canvas, wait for fonts, scale 2 max). Name and city fields above the cards are editable and update both previews live.
- Fix every mobile layout problem on this page: no overflow, no overlapping, no cut-off Gujarati, tap targets 44px+, safe-area padding, scrolls smoothly on 320px, 360px, 414px and landscape 640x360.

8. FLOW AFTER THE LAST PAGE
- After a successful card download, wait about 1.5 seconds, then go back to the welcome modal (stop music, reset to the start).
- If the user does not download, the Next button on the last page becomes "Back to Welcome / શરૂઆત પર પાછા જાઓ" and does the same reset.

9. TEST QUICKLY (no screenshots unless something breaks)
- Check console errors, the modal on reload, page 5 and page 8 at 320/360/414/768/1280, both card downloads, and the reset flow.
- Update README.md and CREDITS.md briefly. Final report: 6 lines max, plus anything I must check manually.
```
