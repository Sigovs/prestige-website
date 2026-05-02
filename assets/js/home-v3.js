/**
 * Prestige Imports — home-v3.js
 *
 * Premium motion system + interactions for index_3.html.
 *
 * Sections:
 *   1. Setup       — GSAP + ScrollTrigger registration, defaults, reduced-motion guard
 *   2. Footer year — populate copyright year
 *   3. Header      — fixed header background condenses on scroll
 *   4. Hero        — staggered text rise on load, video parallax on scroll
 *   5. Reveals     — generic staggered fade-up for [data-fade-up] inside [data-reveal-stagger]
 *   6. Image reveal— clip-path inset wipe for [data-image-reveal]
 *   7. Cards       — vehicle card grid staggered entry
 *   8. Parallax    — soft Y-translate for [data-parallax] and [data-parallax-bg]
 *   9. Sell video  — slow scrub-zoom on the sell section
 *  10. Events swap — featured-card crossfade when clicking a row in the list
 *  11. Reviews drag — pointer-driven horizontal scroll on the reviews track
 *  12. Smooth scroll — internal anchor links
 *  13. Nav active   — highlight the nav link of the section currently in view
 */

(() => {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasGSAP = typeof window.gsap !== 'undefined';
    const hasST   = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

    /* ──────────────────────────────────────────────────────────
       1. Setup
       ────────────────────────────────────────────────────────── */
    if (hasST) {
        gsap.registerPlugin(ScrollTrigger);
        gsap.defaults({ ease: 'power3.out' });
    }

    // Reveal initial states immediately if motion is disabled or GSAP is missing.
    // (CSS provides safe fallbacks via .no-js, but if the script loads and GSAP
    // doesn't, we still want the page to be readable.)
    const showAllReveals = () => {
        document.querySelectorAll('[data-reveal-stagger] > *, [data-fade-up], [data-fade-in]')
            .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
        document.querySelectorAll('[data-image-reveal]')
            .forEach(el => { el.style.clipPath = 'inset(0)'; });
    };

    document.addEventListener('DOMContentLoaded', () => {

        /* ──────────────────────────────────────────────────────
           2. Footer year
           ────────────────────────────────────────────────────── */
        document.querySelectorAll('[data-footer-year]').forEach(el => {
            el.textContent = new Date().getFullYear();
        });


        /* ──────────────────────────────────────────────────────
           3. Header — condenses on scroll
           ────────────────────────────────────────────────────── */
        const header = document.querySelector('[data-header]');
        if (header) {
            const updateHeader = () => {
                header.classList.toggle('is-scrolled', window.scrollY > 24);
            };
            window.addEventListener('scroll', updateHeader, { passive: true });
            updateHeader();
        }


        // If GSAP is missing, just make everything visible and bail on motion.
        // Slider controllers still wire up so prev/next + pagination work.
        if (!hasGSAP || reducedMotion) {
            showAllReveals();
            initHeroDeck(document.querySelector('.hero3'));
            initEventsSwap();
            initReviewsDrag();
            initReviewsPagination();
            initSmoothScroll();
            initNavActive();
            return;
        }


        /* ──────────────────────────────────────────────────────
           4. Hero — staggered text rise on load, video parallax
           ────────────────────────────────────────────────────── */
        const heroRoot = document.querySelector('.hero3');
        if (heroRoot) {
            // Only fade in the currently-active slide's items on load.
            // Other slides start invisible and reveal via the deck swap.
            const activeSlide = heroRoot.querySelector('.hero3__slide.is-active');
            const heroItems = activeSlide?.querySelectorAll('[data-fade-up]');
            if (heroItems?.length) {
                gsap.fromTo(heroItems,
                    { y: 40, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1.1,
                        stagger: 0.12,
                        ease: 'power3.out',
                        delay: 0.25,
                    }
                );
            }
            // Inactive slides — instantly land their items at final
            // state so when their slide becomes active, only the slide
            // crossfade plays (no second stagger).
            heroRoot.querySelectorAll('.hero3__slide:not(.is-active) [data-fade-up]')
                .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });

            // Contact pills + scroll indicator + pagination fade in later
            const heroChrome = heroRoot.querySelectorAll('.hero3__contact, .hero3__scroll, .hero3__pagination');
            if (heroChrome.length) {
                gsap.fromTo(heroChrome,
                    { opacity: 0, y: 12 },
                    { opacity: 1, y: 0, duration: 1.0, stagger: 0.12, delay: 1.1, ease: 'power3.out' }
                );
            }

            if (hasST) {
                // Soft parallax on the bg container (covers both videos).
                const bg = heroRoot.querySelector('.hero3__bg');
                if (bg) {
                    gsap.to(bg, {
                        yPercent: 10,
                        scale: 1.04,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: heroRoot,
                            start: 'top top',
                            end: 'bottom top',
                            scrub: true,
                        },
                    });
                }
            }

            // Wire up the slide deck — auto-advance + click pagination
            initHeroDeck(heroRoot);
        }


        /* ──────────────────────────────────────────────────────
           5. Reveals — generic staggered fade-up
              For each [data-reveal-stagger] block, when it enters the
              viewport, fade-up its [data-fade-up] children with stagger.
              Skips the hero (already fired on load).
           ────────────────────────────────────────────────────── */
        if (hasST) {
            const staggerHosts = document.querySelectorAll('[data-reveal-stagger]');
            staggerHosts.forEach(host => {
                if (host.closest('.hero3')) return; // hero handled on load
                const items = host.querySelectorAll('[data-fade-up]');
                if (!items.length) return;

                gsap.fromTo(items,
                    { y: 30, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1.0,
                        stagger: 0.1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: host,
                            start: 'top 80%',
                            once: true,
                        },
                    }
                );
            });

            // Stand-alone fade-ups not inside a stagger host
            document.querySelectorAll('[data-fade-up]').forEach(el => {
                if (el.closest('[data-reveal-stagger]')) return;
                if (el.closest('.hero3')) return;
                gsap.fromTo(el,
                    { y: 30, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1.0,
                        ease: 'power3.out',
                        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
                    }
                );
            });
        }


        /* ──────────────────────────────────────────────────────
           6. Image reveal — clip-path inset wipe
              Image already at full opacity; clip-path animates from
              an inset frame to flush. Reads as a "premium reveal."
           ────────────────────────────────────────────────────── */
        if (hasST) {
            document.querySelectorAll('[data-image-reveal]').forEach(el => {
                gsap.fromTo(el,
                    { clipPath: 'inset(8% 12%)' },
                    {
                        clipPath: 'inset(0% 0%)',
                        duration: 1.4,
                        ease: 'power2.out',
                        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
                    }
                );
            });
        }


        /* ──────────────────────────────────────────────────────
           7. Vehicle card grid — staggered entry per card
              The image-reveal above already wipes the image; this
              adds a subtle Y-rise + opacity to the card body so the
              whole card lands together.
           ────────────────────────────────────────────────────── */
        if (hasST) {
            const cards = document.querySelectorAll('[data-card-reveal]');
            if (cards.length) {
                ScrollTrigger.batch(cards, {
                    start: 'top 85%',
                    onEnter: batch => {
                        gsap.fromTo(batch,
                            { y: 50, opacity: 0 },
                            {
                                y: 0, opacity: 1,
                                duration: 1.1,
                                stagger: 0.1,
                                ease: 'power3.out',
                                overwrite: 'auto',
                            }
                        );
                    },
                    once: true,
                });
            }
        }


        /* ──────────────────────────────────────────────────────
           8. Parallax — soft Y translate on scroll
              Used on the services media slab, the cinematic break
              image, and the about bg. Subtle, not jarring.
           ────────────────────────────────────────────────────── */
        if (hasST) {
            document.querySelectorAll('[data-parallax]').forEach(el => {
                gsap.to(el, {
                    yPercent: -8,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.6,
                    },
                });
            });

            document.querySelectorAll('[data-parallax-bg]').forEach(el => {
                gsap.fromTo(el,
                    { yPercent: -6, scale: 1.04 },
                    {
                        yPercent: 6,
                        scale: 1.04,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: el.closest('section') || el,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 0.8,
                        },
                    }
                );
            });
        }


        /* ──────────────────────────────────────────────────────
           9. Sell video — slow scrub-zoom while section is pinned
           ────────────────────────────────────────────────────── */
        if (hasST) {
            const sellSection = document.querySelector('.sell3');
            const sellVideo = document.querySelector('[data-sell-video]');
            if (sellSection && sellVideo) {
                gsap.fromTo(sellVideo,
                    { scale: 1.0 },
                    {
                        scale: 1.08,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: sellSection,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 0.8,
                        },
                    }
                );
            }
        }


        /* ──────────────────────────────────────────────────────
           10–14. Interactions (always run, regardless of GSAP)
           ────────────────────────────────────────────────────── */
        initEventsSwap();
        initReviewsDrag();
        initReviewsPagination();
        initSmoothScroll();
        initNavActive();
    });


    /* ============================================================
       Hero deck — auto-rotate slides + click pagination
       ============================================================ */
    function initHeroDeck(heroRoot) {
        const slides = Array.from(heroRoot.querySelectorAll('.hero3__slide'));
        const videos = Array.from(heroRoot.querySelectorAll('[data-slide-video]'));
        const dots   = Array.from(heroRoot.querySelectorAll('[data-slide-to]'));
        if (slides.length < 2) return;

        let active = 0;
        let timer = null;
        const ROTATE_MS = 8000;
        const PAUSE_AFTER_INTERACT = 14000;

        const setActive = (idx) => {
            if (idx === active) return;
            active = idx;
            slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
            videos.forEach((v, i) => {
                v.classList.toggle('is-active', i === idx);
                if (i === idx) {
                    v.play().catch(() => {});
                } else {
                    try { v.pause(); } catch {}
                }
            });
            dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
        };

        const advance = () => setActive((active + 1) % slides.length);
        const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
        const start = () => { stop(); if (!reducedMotion) timer = setInterval(advance, ROTATE_MS); };

        const onUserStep = () => { stop(); window.setTimeout(start, PAUSE_AFTER_INTERACT); };

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => { setActive(i); onUserStep(); });
        });

        // Prev / next buttons on the right edge
        const prevBtn = heroRoot.querySelector('[data-hero-prev]');
        const nextBtn = heroRoot.querySelector('[data-hero-next]');
        const prev = () => setActive((active - 1 + slides.length) % slides.length);
        const next = () => setActive((active + 1) % slides.length);
        prevBtn?.addEventListener('click', () => { prev(); onUserStep(); });
        nextBtn?.addEventListener('click', () => { next(); onUserStep(); });

        // Pause when tab is hidden, resume when visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stop();
            else start();
        });

        start();
    }


    /* ============================================================
       Reviews pagination — sync dots with track scroll, click to jump
       ============================================================ */
    function initReviewsPagination() {
        const track = document.querySelector('[data-reviews-track]');
        const pag   = document.querySelector('[data-reviews-pagination]');
        if (!track || !pag) return;
        const dots  = Array.from(pag.querySelectorAll('[data-card]'));
        const cards = Array.from(track.children);
        if (!dots.length || !cards.length) return;

        let rafPending = false;
        const updateActive = () => {
            rafPending = false;
            const trackRect = track.getBoundingClientRect();
            const center = trackRect.left + trackRect.width / 2;
            let bestIdx = 0;
            let bestDist = Infinity;
            cards.forEach((c, i) => {
                const r = c.getBoundingClientRect();
                const cardCenter = r.left + r.width / 2;
                const dist = Math.abs(cardCenter - center);
                if (dist < bestDist) { bestDist = dist; bestIdx = i; }
            });
            dots.forEach((d, i) => d.classList.toggle('is-active', i === bestIdx));
        };

        const onScroll = () => {
            if (rafPending) return;
            rafPending = true;
            requestAnimationFrame(updateActive);
        };

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                const card = cards[i];
                if (!card) return;
                // Scroll so the chosen card sits at the track's left
                // padding (matches scroll-padding-left in CSS).
                const trackRect = track.getBoundingClientRect();
                const cardRect  = card.getBoundingClientRect();
                const offset = (cardRect.left - trackRect.left) + track.scrollLeft - 20;
                track.scrollTo({
                    left: Math.max(0, offset),
                    behavior: reducedMotion ? 'auto' : 'smooth',
                });
            });
        });

        track.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        updateActive();
    }


    /* ============================================================
       10. Events featured swap
       Click a row in the upcoming list → fade out featured card,
       replace src + text + meta, fade back in. Hover preview
       overlay shows the row's image without committing the swap.
       ============================================================ */
    function initEventsSwap() {
        const featured = document.querySelector('[data-events-featured]');
        const media    = document.querySelector('[data-events-media]');
        const body     = document.querySelector('[data-events-body]');
        const titleEl  = document.querySelector('[data-events-title]');
        const dateEl   = document.querySelector('[data-events-date]');
        const catEl    = document.querySelector('[data-events-cat]');
        const textEl   = document.querySelector('[data-events-text]');
        const baseImg  = media?.querySelector('img');
        const rows     = document.querySelectorAll('.event-row3__link[data-event-img]');

        if (!featured || !media || !baseImg || !rows.length) return;

        // Build a hover-preview <img> overlay layered above the base
        const hoverImg = document.createElement('img');
        hoverImg.className = 'event-featured3__hover';
        hoverImg.alt = '';
        hoverImg.setAttribute('aria-hidden', 'true');
        hoverImg.decoding = 'async';
        media.appendChild(hoverImg);

        // Preload all preview images so hover swaps feel instant
        const preloaded = new Map();

        const applyRow = (row) => {
            const d = row.dataset;
            // mark active immediately so the hairline+arrow track the click
            rows.forEach(r => r.classList.toggle('is-active', r === row));
            media.classList.remove('is-previewing');

            // Crossfade: fade body + base img, swap content, fade back
            featured.classList.add('is-swapping');
            window.setTimeout(() => {
                if (d.eventImg)   baseImg.src       = d.eventImg;
                if (d.eventTitle) titleEl.textContent = d.eventTitle;
                if (d.eventDate)  dateEl.textContent  = d.eventDate;
                if (d.eventCat)   catEl.textContent   = d.eventCat;
                if (d.eventBody)  textEl.textContent  = d.eventBody;
                featured.classList.remove('is-swapping');
            }, 380);
        };

        rows.forEach(row => {
            const src = row.dataset.eventImg;
            if (src && !preloaded.has(src)) {
                const img = new Image();
                img.src = src;
                preloaded.set(src, img);
            }
            row.addEventListener('pointerenter', () => {
                if (row.classList.contains('is-active')) return;
                if (src) hoverImg.src = src;
                media.classList.add('is-previewing');
            });
            row.addEventListener('pointerleave', () => {
                media.classList.remove('is-previewing');
            });
            row.addEventListener('click', e => {
                e.preventDefault();
                applyRow(row);
            });
        });
    }


    /* ============================================================
       11. Reviews drag — pointer-driven horizontal scroll
       Mouse/pen drag (touch handled natively). Snap suspended
       while dragging to avoid jumpy feel.
       ============================================================ */
    function initReviewsDrag() {
        const track = document.querySelector('[data-reviews-track]');
        if (!track) return;

        let dragging = false;
        let startX = 0;
        let startScroll = 0;
        let moved = 0;
        const DRAG_THRESHOLD = 5;

        track.addEventListener('pointerdown', e => {
            if (e.pointerType === 'touch') return;
            dragging = true;
            moved = 0;
            startX = e.clientX;
            startScroll = track.scrollLeft;
            track.classList.add('is-dragging');
            track.style.scrollSnapType = 'none';
            try { track.setPointerCapture(e.pointerId); } catch {}
        });

        track.addEventListener('pointermove', e => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            moved = Math.abs(dx);
            track.scrollLeft = startScroll - dx;
        });

        const endDrag = e => {
            if (!dragging) return;
            dragging = false;
            track.classList.remove('is-dragging');
            track.style.scrollSnapType = '';
            try { track.releasePointerCapture(e.pointerId); } catch {}
        };
        track.addEventListener('pointerup', endDrag);
        track.addEventListener('pointercancel', endDrag);
        track.addEventListener('pointerleave', endDrag);

        // Suppress click-through after a meaningful drag
        track.addEventListener('click', e => {
            if (moved > DRAG_THRESHOLD) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }


    /* ============================================================
       12. Smooth scroll for internal anchor links
       Accounts for the fixed header height so targets aren't
       hidden underneath.
       ============================================================ */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const id = anchor.getAttribute('href');
                if (!id || id === '#') return;
                const target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                const headerH = document.querySelector('[data-header]')?.offsetHeight || 0;
                const top = target.getBoundingClientRect().top + window.scrollY - headerH + 1;
                window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
            });
        });
    }


    /* ============================================================
       13. Nav active section highlight
       The nav link whose target section is most visible gets the
       .is-active class.
       ============================================================ */
    function initNavActive() {
        if (!('IntersectionObserver' in window)) return;

        const links = Array.from(document.querySelectorAll('.site-header3__nav-link'));
        const targets = links
            .map(link => {
                const href = link.getAttribute('href') || '';
                if (!href.startsWith('#') || href === '#') return null;
                const el = document.querySelector(href);
                return el ? { link, el } : null;
            })
            .filter(Boolean);
        if (!targets.length) return;

        const ratios = new Map(targets.map(t => [t.el, 0]));
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => ratios.set(e.target, e.intersectionRatio));
            let bestEl = null, best = 0;
            ratios.forEach((r, el) => {
                if (r > best) { best = r; bestEl = el; }
            });
            links.forEach(l => l.classList.remove('is-active'));
            if (bestEl && best > 0.2) {
                const t = targets.find(t => t.el === bestEl);
                if (t) t.link.classList.add('is-active');
            }
        }, { threshold: [0.2, 0.4, 0.6, 0.8] });

        targets.forEach(t => observer.observe(t.el));
    }

})();
