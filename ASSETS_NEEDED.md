# Assets needed / gaps

Nothing is broken: every gap below already has a working fallback. Replace them whenever you have better files (keep the same file names).

| What | Page | Current fallback | Suggested source |
|---|---|---|---|
| Lottie animations (diya, lotus, hearts, train/road) | Opening, 2, 7 | Four original hand-generated Lottie JSON files in `assets/lottie/` (simple flat style). LottieFiles needs a login to download, so nothing was taken from there. | Free animations on lottiefiles.com (check each license), then overwrite `diya.json`, `lotus.json`, `heart.json`, `journey-home.json` |
| Goddess Lakshmi artwork | 2 | A Wikimedia photo of a home Lakshmi puja corner as the blurred background. No dedicated Lakshmi illustration. | A licensed Lakshmi illustration (Pixabay / Unsplash / commissioned artwork) |
| Gold coins, kalash, lotus, pujan thali photos | 2 | Canvas/SVG gold coins falling (tsParticles), lotus Lottie, no kalash image | Pixabay / Pexels photos or your own |
| Funny Gujarati cartoon illustrations (characters) | 5 | SVG/CSS bouncing food characters (dhokla, fafda, jalebi, laddu) + a real jalebi-fafda photo background | Commissioned cartoons or free vector packs (check license) |
| Shubh Labh artwork | 6 | SVG swastik tiles (no text added, because the text is not in content.json) | Your own Shubh Labh graphic |
| Traditional Gujarati house photo | 4, 6 | SVG illustrated haveli silhouette with glowing windows | A licensed night photo of a decorated house |
| Family celebration illustration | 8 | Fireworks photo background + diyas + the greeting-card feature | Your family photo / illustration |
| Brother-sister tilak illustration | 7 | Original SVG with animated tilak ceremony | A licensed illustration if preferred |
| Pixabay music/SFX | all | Pixabay blocks automated downloads (HTTP 403), so Mixkit was used instead (see CREDITS.md) | Optional: swap in your preferred royalty-free tracks |
| Music "feel" check | all | Tracks were chosen by title/tags, not by listening | Listen to each page's track and swap if one does not suit; file names are in CREDITS.md |
| Absolute URL for the WhatsApp preview image | share | `og:image` is a relative path `assets/images/og-image.jpg` | After hosting, edit the `og:image` / `twitter:image` meta tags in `index.html` to the full `https://...` URL and add `og:url` |

Notes
- Images are WebP under 300 KB. The OG preview is a **JPG** (1200x630, ~80 KB) because WhatsApp does not reliably read WebP previews.
- Music was re-encoded to MP3 128 kbps (1.6-3.3 MB per track). Only the current page's track is streamed.

## Round 5 (optional upgrades; the site works without them)
- assets/images/kali-mata.webp - owner's own or preferred Maa Kali artwork (any file with this name is used automatically). Search: "Kalighat painting Kali" on Wikimedia Commons.
- assets/images/haunted-house.webp - the current file is a 704 px black silhouette. Suggested: a larger haunted-house or haveli-at-night image (Wikimedia Commons / Pexels).
- assets/images/dark-forest.webp - not foggy. Suggested search: "foggy forest moon night" (Pexels / Pixabay).
- assets/music/bhai.mp3 (page 7) and the page 10 music: page 7 still uses bhai-bij.mp3; page 10 shares page 8's track.
- assets/images/pritesh.webp - your own photo for page 10 (optional, under 300 KB). Without it, an original SVG avatar is shown. A downloaded Openclipart avatar was tried and rejected (not a good match).
