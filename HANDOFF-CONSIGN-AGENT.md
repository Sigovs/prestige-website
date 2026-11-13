# Task for a coding agent: Prestige Imports — Consign With Prestige page

Update one existing WordPress page (theme by All Auto Network) to match an approved prototype. **Reproduce it; do not redesign it.**

- Site page: `https://prestigeimports.aandemo.com/consign_with_prestige/` (staging, behind a password). It has an H1 and a Contact Form 7 form.
- Prototype: https://sigovs.github.io/prestige-website/consign-with-prestige.html
- Repo: https://github.com/Sigovs/prestige-website (branch `main`). Human handoff: `HANDOFF-CONSIGN.md`.
- Markup: `consign-with-prestige.html` (`<main class="page-consign">`). Styles, in order: `assets/css/home-v6.css`, `assets/css/vdp6.css`,
  `assets/css/consign.css`. Script: `assets/js/consign.js`.

## Rules
1. **Keep the existing CF7 form**: its fields, field names, placeholders, order, required flags, consent checkbox, reCAPTCHA and submit.
   Only restyle it to the prototype (`.vdp-calc__grid`, `.vdp-calc__field`, `.vdp-calc__input`, `.vdp-calc__select` + chevron; 4 columns
   for Vehicle Information, 2 for Contact Information; headings `.t-h2`; Send = `.btn.btn--solid` with a caret icon).
2. **Replace the upload block** with the prototype's `.upload` (drop zone, `ph-images` icon, "Upload Images (up to 8)", "Drag and Drop Here",
   `.btn` "Upload", thumbnails with remove). Images only, max 8; connect it to the form's existing file field.
3. **Add the sections** in this order, with these anchors: `#hero`, `#consign-form`, `#how-it-works`, `#retail-your-ride`, `#why-prestige`,
   `#looking-for`. Copy every string exactly from the prototype (they are the live page's words; keep "doesn’t", the plain hyphen in
   "sold - collect your cash", "We're Looking For..."). Add no headings or copy.
4. **Use the design system**, not new styles: `.t-display`, `.t-h1`, `.t-h2`, `.t-h4`, `.t-body`, `.t-small`, `.t-micro`, `.t-caption`, `.stack`,
   `.eyebrow-stamp(--light)`, `.btn`, `.service` (+ `.service--static`), `.brands__grid` (+ `.brands__grid--ten`), `.brand-card`.
   `consign.css` holds the only page-specific rules; port it as is.
5. **How it works photo** stretches to the height of the text column at 901 px and wider; at 900 and below it sits above the text at 5:4.
   Use the trimmed `consign-carrera-gt.jpg` from the repo, not the live page's original (that one has a black fade and a watermark).
6. **Retail Your Ride picture** uses `mix-blend-mode: multiply` so its white background disappears into the page.
7. **Brand logos**: the files listed in `HANDOFF-CONSIGN.md`, one colour via `.brand-card__media img { filter: brightness(0) }`, sizes per
   logo as in `consign.css`. Not links.
8. Header and footer: the site's own. Do not mark any menu item active on this page (Consign is its own page).

## Acceptance checks (report each)
- [ ] 1920, 1440, 1024, 768, 390 px: no horizontal scroll (`scrollWidth - clientWidth === 0`).
- [ ] Visual match with the prototype at 1440 and 390: blocks, order, words, photos and crops.
- [ ] The form still submits through CF7 with all its fields, reCAPTCHA and the success message; uploaded images arrive (up to 8).
- [ ] Upload: 10 files dropped → 8 images kept, non-images refused, remove works.
- [ ] The How it works photo's top and bottom line up with the heading and the last card at 1024 px and wider.
- [ ] No console errors.
