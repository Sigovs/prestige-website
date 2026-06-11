# WORKING RULES — Prestige Imports

## Reuse > Recreate

When working on this project, always reuse existing CSS tokens, classes, and HTML patterns. Do not create parallel ones.

### Why
The project has a mature, deliberate design system (tokens in `:root`, BEM-style components, magazine-rhythm spacing, monochrome editorial palette). Parallel styles fragment the system, break visual consistency, make refactors painful, and contradict the editorial-restraint philosophy of "fewer, stronger elements" (see `DESIGN_PRINCIPLES.md`).

### How to apply

1. **Before writing any CSS**, grep the active stylesheet for related selectors, tokens, and patterns.
   - Active homepage stylesheet: `assets/css/home-v5.css`
   - SRP: `assets/css/search.css` · VDP: `assets/css/vdp.css` · Sell: `assets/css/sell-your-car.css`

2. **Reuse existing CSS variables.** Never invent a new color, font, or spacing value when a token exists.

   - **Surfaces:** `--bg`, `--bg-soft`, `--bg-deep`, `--cream`, `--header-bg`
   - **Ink:** `--ink`, `--ink-soft`, `--ink-muted`
   - **Hairlines:** `--rule`, `--rule-strong`
   - **Type:** `--font-display`, `--font-serif`, `--font-sans`
   - **Spacing:** `--sp-1` (8px) … `--sp-8` (160px), `--section-py` (140px)
   - **Headers:** `--header-h` (107px), `--srp-header-h` (72px)
   - **Motion:** `--ease` (cubic-bezier(0.22, 1, 0.36, 1))
   - **Elevation:** `--pop`
   - **Container:** `--container-max` (1440px), `--container-wide` (1684px)

3. **Reuse existing component classes** when they fit:
   - `.container` — page-width track
   - `.eyebrow` / `.eyebrow-stamp` — small caps section labels
   - `.btn` + variants `.btn--solid`, `.btn--on-dark`, `.btn--ghost`
   - `.site-header` (transparent over hero) / `.srp-header` (compact utility)
   - `.hero`, `.hero__brand`, `.hero__brands`, `.hero__brand-link`
   - `.brand-card`, `.brand-card__media`, `.brand-card__link`

4. **If something doesn't exist**, extend the existing system in the same file. Follow naming conventions already in use (BEM with `__` element and `--` modifier). Place new rules near related rules, not as orphans at the bottom.

5. **If tempted to add a new color, font weight, shadow, or spacing value**, first check whether a near-equivalent token already exists. Use it. Only if the design truly demands something new, surface that decision explicitly before committing.

6. **HTML structure too.** Match existing markup patterns (hero brand list, brand-card structure, button markup) rather than inventing parallel ones.

### Smell test before writing CSS
- "Is there already a class doing 90% of this?" → extend with a modifier, don't duplicate.
- "Is this color/spacing 1-2px off from a token?" → use the token.
- "Am I writing `<div class="card">` again with new styles?" → grep for `.brand-card`, `.spec-card`, etc. first.
