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
       4. Filter chip removal — click chip → fade + remove + shuffle
       ────────────────────────────────────────────────────────── */
    function bindChipRemoval(scope) {
        (scope || document).querySelectorAll('.filter-chips .chip').forEach(function (chip) {
            if (chip.dataset.bound) return;
            chip.dataset.bound = '1';
            chip.addEventListener('click', function (e) {
                e.preventDefault();
                chip.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                chip.style.opacity    = '0';
                chip.style.transform  = 'translateX(-6px)';
                setTimeout(function () { chip.remove(); }, 230);
                reshuffleDebounced();
            });
        });
    }
    bindChipRemoval();


    /* ──────────────────────────────────────────────────────────
       5. "Clear all" chips
       ────────────────────────────────────────────────────────── */
    document.querySelectorAll('.chip-clear').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var chips = btn.parentElement.querySelectorAll('.chip');
            chips.forEach(function (c) {
                c.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                c.style.opacity    = '0';
                c.style.transform  = 'translateX(-6px)';
            });
            setTimeout(function () {
                chips.forEach(function (c) { c.remove(); });
            }, 230);
            reshuffleDebounced();
        });
    });


    /* ──────────────────────────────────────────────────────────
       6. Filter trigger count badge + reshuffle on checkbox change
       ────────────────────────────────────────────────────────── */
    document.querySelectorAll('.filter-bar .filter').forEach(function (f) {
        var labelEl = f.querySelector('.filter__trigger > span:first-child');
        if (!labelEl) return;
        var originalLabel = labelEl.textContent;
        var inputs = f.querySelectorAll('.filter__option input[type="checkbox"]');

        function update() {
            var count = f.querySelectorAll('.filter__option input:checked').length;
            labelEl.textContent = count > 0
                ? originalLabel + ' (' + count + ')'
                : originalLabel;
            if (count > 0) f.classList.add('filter--has-value');
            else           f.classList.remove('filter--has-value');
        }

        inputs.forEach(function (input) {
            input.addEventListener('change', function () {
                update();
                reshuffleDebounced();
            });
        });

        var clearBtn = f.querySelector('.filter__clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                inputs.forEach(function (i) { i.checked = false; });
                update();
                reshuffleDebounced();
            });
        }

        update();  /* initialize for any pre-checked filters */
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
