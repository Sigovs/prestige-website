/* ============================================================
   PRESTIGE IMPORTS — SRP interaction (inventory.html)
   Light, no-dependency JS that brings the static mockup to life:
   close dropdowns on outside click, ensure only one filter panel
   is open at a time, update Sort label, removable filter chips,
   filter trigger count badges, "Clear all" reset, pagination
   active state, plus a "reshuffle" effect that fades the grid
   out, shuffles + hides random cards, updates the result count,
   and fades the grid back in with a staggered cascade — gives
   every interaction the *feel* of live filtering without any
   real filter logic.
   ============================================================ */

(function () {
    'use strict';

    /* ──────────────────────────────────────────────────────────
       HELPERS
       ────────────────────────────────────────────────────────── */
    function shuffleArray(arr) {
        var out = arr.slice();
        for (var i = out.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
        }
        return out;
    }

    /* Reshuffle the results grid + update count. Fades the cards
       out, reorders + hides a random subset, updates the count
       and fades back in with a staggered cascade. */
    var isShuffling = false;
    function reshuffleResults() {
        if (isShuffling) return;
        var grid     = document.querySelector('.srp-grid');
        var countEl  = document.querySelector('.srp-intro__count b');
        if (!grid) return;
        isShuffling = true;
        grid.setAttribute('aria-busy', 'true');

        var cards = Array.from(grid.children);

        /* Fade out — all at once */
        cards.forEach(function (li) {
            li.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            li.style.opacity    = '0';
            li.style.transform  = 'translateY(6px)';
        });

        setTimeout(function () {
            /* Shuffle DOM order + decide a visible subset */
            var shuffled  = shuffleArray(cards);
            var showCount = Math.min(cards.length,
                                     Math.floor(Math.random() * 6) + 4);  /* 4–9 */
            shuffled.forEach(function (li, idx) {
                grid.appendChild(li);
                li.style.display = (idx < showCount) ? '' : 'none';
            });

            /* Update the result count — plausible 20–149 */
            if (countEl) {
                countEl.textContent = Math.floor(Math.random() * 130) + 20;
            }

            /* Stagger fade back in */
            requestAnimationFrame(function () {
                shuffled.forEach(function (li, idx) {
                    if (idx >= showCount) return;
                    li.style.transitionDelay = (idx * 40) + 'ms';
                    li.style.opacity         = '1';
                    li.style.transform       = 'translateY(0)';

                    /* Strip inline styles after the card lands so CSS
                       hover transitions (.vehicle-card--extended:hover)
                       can take over again cleanly. */
                    setTimeout(function () {
                        li.style.transition      = '';
                        li.style.transitionDelay = '';
                        li.style.transform       = '';
                        li.style.opacity         = '';
                    }, idx * 40 + 450);
                });

                setTimeout(function () {
                    isShuffling = false;
                    grid.removeAttribute('aria-busy');
                }, showCount * 40 + 500);
            });
        }, 260);
    }

    /* Debounced wrapper — multiple rapid changes collapse to one */
    var reshuffleTimer;
    function reshuffleDebounced() {
        clearTimeout(reshuffleTimer);
        reshuffleTimer = setTimeout(reshuffleResults, 220);
    }


    /* ──────────────────────────────────────────────────────────
       1. Close <details> dropdowns on outside click
       ────────────────────────────────────────────────────────── */
    document.addEventListener('click', function (e) {
        document.querySelectorAll('details[open]').forEach(function (d) {
            if (!d.contains(e.target)) d.removeAttribute('open');
        });
    });


    /* ──────────────────────────────────────────────────────────
       2. Only one filter-bar dropdown open at a time
       ────────────────────────────────────────────────────────── */
    var barDropdowns = document.querySelectorAll('.filter-bar .filter, .filter-bar .sort');
    barDropdowns.forEach(function (d) {
        d.addEventListener('toggle', function () {
            if (!d.open) return;
            barDropdowns.forEach(function (other) {
                if (other !== d) other.removeAttribute('open');
            });
        });
    });


    /* ──────────────────────────────────────────────────────────
       3. Sort option click → update trigger label + close + shuffle
       ────────────────────────────────────────────────────────── */
    document.querySelectorAll('.sort').forEach(function (sort) {
        var trigger = sort.querySelector('.sort__value');
        sort.querySelectorAll('.sort__option').forEach(function (opt) {
            opt.addEventListener('click', function (e) {
                e.preventDefault();
                if (trigger) trigger.textContent = opt.textContent;
                sort.querySelectorAll('.sort__option').forEach(function (o) {
                    o.classList.remove('sort__option--active');
                });
                opt.classList.add('sort__option--active');
                sort.removeAttribute('open');
                reshuffleResults();
            });
        });
    });


    /* ──────────────────────────────────────────────────────────
       4–6. Filter options ⇄ active chips ⇄ trigger badges
       Selecting any option (Make / Model / Year / Price / …)
       spawns a chip in the filter-chips row; unchecking the box —
       or removing the chip — clears it both ways. Per-filter
       "Clear" and the "Clear all" button drop the matching chips.
       Pre-checked options seed their chips on load.
       ────────────────────────────────────────────────────────── */
    var chipsBox    = document.querySelector('.filter-chips');
    var clearAllBtn = chipsBox ? chipsBox.querySelector('.chip-clear') : null;
    var inputByKey  = {};

    /* Readable label for an option — its text minus the count badge */
    function optionLabel(input) {
        var opt = input.closest('.filter__option');
        if (!opt) return 'Filter';
        var clone = opt.cloneNode(true);
        var cnt = clone.querySelector('.filter__option-count');
        if (cnt) cnt.remove();
        return clone.textContent.trim();
    }

    function fadeRemove(el) {
        el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        el.style.opacity    = '0';
        el.style.transform  = 'translateX(-6px)';
        setTimeout(function () { el.remove(); }, 230);
    }

    function chipFor(key) {
        return chipsBox
            ? chipsBox.querySelector('.chip[data-for="' + key + '"]')
            : null;
    }

    function addChip(input) {
        if (!chipsBox) return;
        var key = input.dataset.chipKey;
        if (chipFor(key)) return;

        var chip = document.createElement('a');
        chip.className = 'chip';
        chip.href = '#';
        chip.dataset.for = key;
        var txt = document.createElement('span');
        txt.textContent = optionLabel(input);
        var x = document.createElement('span');
        x.className = 'chip__x';
        x.setAttribute('aria-hidden', 'true');
        x.textContent = '✕';
        chip.appendChild(txt);
        chip.appendChild(x);

        if (clearAllBtn) chipsBox.insertBefore(chip, clearAllBtn);
        else             chipsBox.appendChild(chip);

        /* slide + fade in */
        chip.style.opacity   = '0';
        chip.style.transform = 'translateX(-6px)';
        requestAnimationFrame(function () {
            chip.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            chip.style.opacity    = '1';
            chip.style.transform  = 'translateX(0)';
            setTimeout(function () {
                chip.style.transition = '';
                chip.style.transform  = '';
            }, 300);
        });
    }

    var filters = document.querySelectorAll('.filter-bar .filter');

    function updateBadge(filterEl) {
        var labelEl = filterEl.querySelector('.filter__trigger > span:first-child');
        if (!labelEl) return;
        var count = filterEl.querySelectorAll('.filter__option input:checked').length;
        labelEl.textContent = count > 0
            ? filterEl.dataset.baseLabel + ' (' + count + ')'
            : filterEl.dataset.baseLabel;
        filterEl.classList.toggle('filter--has-value', count > 0);
    }

    filters.forEach(function (f, fi) {
        var labelEl = f.querySelector('.filter__trigger > span:first-child');
        f.dataset.baseLabel = labelEl ? labelEl.textContent.trim() : '';
        var inputs = f.querySelectorAll('.filter__option input[type="checkbox"]');

        inputs.forEach(function (input, oi) {
            var key = 'f' + fi + '-' + oi;
            input.dataset.chipKey = key;
            inputByKey[key] = input;
            input.addEventListener('change', function () {
                if (input.checked) addChip(input);
                else { var c = chipFor(key); if (c) fadeRemove(c); }
                updateBadge(f);
                reshuffleDebounced();
            });
        });

        var clearBtn = f.querySelector('.filter__clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                inputs.forEach(function (input) {
                    if (!input.checked) return;
                    input.checked = false;
                    var c = chipFor(input.dataset.chipKey);
                    if (c) fadeRemove(c);
                });
                updateBadge(f);
                reshuffleDebounced();
            });
        }

        updateBadge(f);
    });

    /* Chip clicks (delegated) — remove chip ⇒ uncheck its option.
       "Clear all" drops every chip + unchecks every option. */
    if (chipsBox) {
        chipsBox.addEventListener('click', function (e) {
            if (e.target.closest('.chip-clear')) {
                Object.keys(inputByKey).forEach(function (k) {
                    inputByKey[k].checked = false;
                });
                filters.forEach(updateBadge);
                chipsBox.querySelectorAll('.chip').forEach(fadeRemove);
                reshuffleDebounced();
                return;
            }
            var chip = e.target.closest('.chip');
            if (!chip) return;
            e.preventDefault();
            var input = inputByKey[chip.dataset.for];
            if (input) {
                input.checked = false;
                var f = input.closest('.filter');
                if (f) updateBadge(f);
            }
            fadeRemove(chip);
            reshuffleDebounced();
        });
    }

    /* Seed chips for options that start checked */
    Object.keys(inputByKey).forEach(function (k) {
        if (inputByKey[k].checked) addChip(inputByKey[k]);
    });


    /* ──────────────────────────────────────────────────────────
       7. "Show 149 results" button in All filters closes the panel + shuffle
       ────────────────────────────────────────────────────────── */
    document.querySelectorAll('.filter__panel--all .btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var details = btn.closest('details');
            if (details) details.removeAttribute('open');
            reshuffleResults();
        });
    });


    /* ──────────────────────────────────────────────────────────
       8. Search input — ESC clears + Enter triggers reshuffle
       ────────────────────────────────────────────────────────── */
    document.querySelectorAll('.srp-search__input').forEach(function (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                input.value = '';
                input.blur();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                reshuffleResults();
                input.blur();
            }
        });
    });


    /* ──────────────────────────────────────────────────────────
       9. Pagination — click → active + reshuffle + scroll to top
       ────────────────────────────────────────────────────────── */
    document.querySelectorAll('.pagination').forEach(function (nav) {
        var pageLinks = nav.querySelectorAll(
            '.pagination__link:not(.pagination__link--nav):not(.pagination__link--disabled)'
        );
        pageLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                nav.querySelectorAll('.pagination__link--active').forEach(function (a) {
                    a.classList.remove('pagination__link--active');
                    a.removeAttribute('aria-current');
                });
                link.classList.add('pagination__link--active');
                link.setAttribute('aria-current', 'page');
                reshuffleResults();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    });


    /* ──────────────────────────────────────────────────────────
       10. Brand pill click — toggle active visual + reshuffle
       ────────────────────────────────────────────────────────── */
    document.querySelectorAll('.brand-strip__row .brand-pill:not(.brand-pill--more)').forEach(function (pill) {
        pill.addEventListener('click', function (e) {
            e.preventDefault();
            pill.classList.toggle('brand-pill--active');
            reshuffleDebounced();
        });
    });


    /* ──────────────────────────────────────────────────────────
       11. Vehicle card SAVE button — toggle saved (heart fill)
       ────────────────────────────────────────────────────────── */
    document.querySelectorAll('.vehicle-card__action').forEach(function (btn) {
        var icon = btn.querySelector('i');
        if (!icon || !icon.classList.contains('ph-heart')) return;
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var saved = btn.dataset.active === 'true';
            if (saved) {
                btn.dataset.active = 'false';
                icon.classList.remove('ph-heart-fill');
                icon.classList.add('ph-heart');
            } else {
                btn.dataset.active = 'true';
                icon.classList.remove('ph-heart');
                icon.classList.add('ph-heart-fill');
            }
        });
    });

})();
