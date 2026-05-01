/**
 * Prestige Imports — main.js
 * Handles: FAQ accordion, smooth scroll, footer year
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Footer year -------------------------------------------------------
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();


    // --- Full-screen menu toggle -------------------------------------------
    const navToggle = document.querySelector('.site-nav-toggle');
    const siteMenu  = document.getElementById('site-menu');

    if (navToggle && siteMenu) {
        const setOpen = open => {
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            siteMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
            siteMenu.classList.toggle('is-open', open);
            document.body.classList.toggle('menu-open', open);
            const label = navToggle.querySelector('.site-nav-toggle__label');
            if (label) {
                label.textContent = open
                    ? (label.dataset.whenOpen || 'Close')
                    : (label.dataset.whenClosed || 'Menu');
            }
        };

        navToggle.addEventListener('click', () => {
            const open = navToggle.getAttribute('aria-expanded') !== 'true';
            setOpen(open);
        });

        // Close on link click (so anchor jumps work)
        siteMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => setOpen(false));
        });

        // Esc closes
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
                setOpen(false);
            }
        });
    }


    // --- Header scroll state -----------------------------------------------
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
        const updateHeaderScroll = () => {
            siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
        };
        window.addEventListener('scroll', updateHeaderScroll, { passive: true });
        updateHeaderScroll();
    }


    // --- Inventory scroll-driven scrollytelling -----------------------------
    // While the inventory section is sticky-pinned to the viewport, scroll
    // progress (0..1 across its tall runway) drives:
    //   • the title block translating up and fading out
    //   • each card appearing from below in a staircase, one after the other
    const invSection = document.querySelector('.section--inventory');
    const invHeader  = invSection?.querySelector('.inventory__header');
    const invCards   = invSection ? Array.from(invSection.querySelectorAll('.inventory__grid > li')) : [];

    if (invSection && invHeader) {
        // Cards reveal once via CSS (triggered by [data-reveal] observer
        // adding .is-visible). JS only drives the title-out scroll effect.
        let rafId = null;
        const ease = t => 1 - Math.pow(1 - t, 2.2);

        const tick = () => {
            rafId = null;
            const rect = invSection.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            const total = rect.height - vh;
            const passed = -rect.top;
            const p = Math.max(0, Math.min(1, total > 0 ? passed / total : 0));

            // Header — slides up under the header bar and fades over 0..35%
            const HEADER_END = 0.35;
            const hp = Math.max(0, Math.min(1, p / HEADER_END));
            const hEased = ease(hp);
            invHeader.style.transform = `translateY(${(-hEased * 220).toFixed(2)}px)`;
            invHeader.style.opacity = (1 - hEased).toFixed(3);
        };

        const onScroll = () => {
            if (rafId === null) rafId = requestAnimationFrame(tick);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        tick();
    }


    // --- Nav active section highlight ---------------------------------------
    // Each nav link with href="#section-id" gets .is-active when its target
    // section is the dominant one in the viewport.
    const navLinks = Array.from(document.querySelectorAll('.site-nav__link'));
    const navTargets = navLinks
        .map(link => {
            const href = link.getAttribute('href') || '';
            if (!href.startsWith('#')) return null;
            const el = document.querySelector(href);
            return el ? { link, el } : null;
        })
        .filter(Boolean);

    if (navTargets.length && 'IntersectionObserver' in window) {
        // Track the most-visible target via its intersection ratio.
        const ratios = new Map(navTargets.map(t => [t.el, 0]));
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => ratios.set(e.target, e.intersectionRatio));
            // Pick the target with the highest current ratio
            let bestEl = null, best = 0;
            ratios.forEach((r, el) => {
                if (r > best) { best = r; bestEl = el; }
            });
            navLinks.forEach(l => l.classList.remove('is-active'));
            if (bestEl) {
                const t = navTargets.find(t => t.el === bestEl);
                if (t && best > 0.15) t.link.classList.add('is-active');
            }
        }, { threshold: [0.15, 0.35, 0.55, 0.75] });

        navTargets.forEach(t => observer.observe(t.el));
    }


    // --- Scroll-driven hero SLIDES (sticky pattern) -------------------------
    // Hero is a tall scroll runway with a sticky inner. As the user scrolls
    // through the section, the slide index advances. Once past the hero,
    // the next section reveals naturally.
    const scrubHosts = document.querySelectorAll('[data-scrub-video]');

    scrubHosts.forEach(host => {
        const slidesHost = host.querySelector('[data-hero-slides]');
        const slides = slidesHost ? Array.from(slidesHost.querySelectorAll('.hero__slide')) : [];
        if (!slides.length) return;

        let activeSlideIdx = 0;
        host.dataset.activeSlide = '0';
        const setActiveSlide = idx => {
            if (idx === activeSlideIdx) return;
            slides.forEach((s, i) => {
                s.classList.toggle('is-active', i === idx);
                s.classList.toggle('is-passed', i < idx);
            });
            host.dataset.activeSlide = String(idx);
            activeSlideIdx = idx;
        };

        let rafId = null;
        const tick = () => {
            rafId = null;
            const rect = host.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            const total = rect.height - vh;
            const passed = -rect.top;
            const p = Math.max(0, Math.min(1, total > 0 ? passed / total : 0));
            const idx = Math.min(slides.length - 1, Math.floor(p * slides.length));
            setActiveSlide(idx);
        };

        const onScroll = () => {
            if (rafId === null) rafId = requestAnimationFrame(tick);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        tick();
    });

    /* ============================================================
       VIDEO SCRUB (saved for later)
       ============================================================
       To bring the wheel-driven video scrub back:
         1. Remove `autoplay loop` attributes from <video class="hero__video">.
         2. Inside the scrubHosts loop, re-introduce:
              - video.removeAttribute('autoplay'); video.removeAttribute('loop'); video.pause();
              - SETTLE_FRAMES + SMOOTHING + SETTLE_EPSILON constants
              - target/current state, RAF lerp loop that writes video.currentTime
              - Wait for `loadedmetadata`, then duration = video.duration
              - In setProgress, also do: target = duration * progress; kick the loop.
       The lerp formula:
              current += (target - current) * SMOOTHING;
              SMOOTHING = 4.6 / SETTLE_FRAMES   // bigger frames = smoother
       ============================================================ */


    // --- Scroll-driven hero video (sticky-section variant) -----------------
    // Kept for any other section using [data-scroll-video].
    const scrollVideoHosts = document.querySelectorAll('[data-scroll-video]');

    scrollVideoHosts.forEach(host => {
        const video = host.querySelector('video');
        if (!video) return;

        video.removeAttribute('autoplay');
        video.removeAttribute('loop');
        video.pause();

        // Tweak this. BIGGER = smoother / silkier. SMALLER = snappier.
        // It's roughly "how many frames the video takes to catch up to scroll".
        //   30 = balanced silk, 60 = very smooth, 15 = quick, 5 = near instant.
        const SETTLE_FRAMES = 60;
        const SMOOTHING = Math.max(0.02, Math.min(1, 4.6 / Math.max(1, SETTLE_FRAMES)));
        const SETTLE_EPSILON = 0.004;

        let duration = 0;
        let target = 0;
        let current = 0;
        let running = false;

        const computeTarget = () => {
            const rect = host.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            const total = rect.height - vh;
            const passed = -rect.top;
            const p = Math.max(0, Math.min(1, total > 0 ? passed / total : 0));
            target = duration * p;
        };

        const loop = () => {
            current += (target - current) * SMOOTHING;
            const delta = target - current;

            if (Math.abs(delta) > SETTLE_EPSILON) {
                try { video.currentTime = current; } catch {}
                requestAnimationFrame(loop);
            } else {
                current = target;
                try { video.currentTime = current; } catch {}
                running = false;
            }
        };

        const kick = () => {
            if (!duration) return;
            computeTarget();
            if (!running) {
                running = true;
                requestAnimationFrame(loop);
            }
        };

        const init = () => {
            duration = video.duration;
            if (!isFinite(duration) || duration <= 0) return;
            current = 0;
            target = 0;
            kick();
        };

        if (video.readyState >= 1 && isFinite(video.duration) && video.duration > 0) {
            init();
        } else {
            video.addEventListener('loadedmetadata', init, { once: true });
        }

        window.addEventListener('scroll', kick, { passive: true });
        window.addEventListener('resize', kick, { passive: true });
    });


    // --- FAQ accordion -----------------------------------------------------
    const faqItems = document.querySelectorAll('[data-faq-item]');

    faqItems.forEach(item => {
        const trigger = item.querySelector('[data-faq-trigger]');
        const answer  = item.querySelector('[data-faq-answer]');

        if (!trigger || !answer) return;

        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('aria-expanded', 'false');

        const open = () => {
            const isOpen = item.classList.contains('is-open');

            // Close all
            faqItems.forEach(i => {
                i.classList.remove('is-open');
                i.querySelector('[data-faq-trigger]')?.setAttribute('aria-expanded', 'false');
            });

            // Toggle clicked item
            if (!isOpen) {
                item.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        };

        trigger.addEventListener('click', open);
        trigger.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
            }
        });
    });


    // --- Smooth scroll for anchor links ------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });


    // --- Process section entrance animations --------------------------------
    const processEls = document.querySelectorAll('.process__header, .process-step');

    if (processEls.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        processEls.forEach(el => observer.observe(el));
    } else {
        processEls.forEach(el => el.classList.add('is-visible'));
    }


    // --- Brands entrance + ribbon drift -------------------------------------
    const brandsGrid = document.querySelector('.brands-grid');

    if (brandsGrid && 'IntersectionObserver' in window) {
        brandsGrid.classList.add('js-anim');
        const brandsObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    brandsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        brandsObserver.observe(brandsGrid);
    }

    // --- Inventory entrance -------------------------------------------------
    const inventoryGrid = document.querySelector('.inventory-grid');

    if (inventoryGrid && 'IntersectionObserver' in window) {
        inventoryGrid.classList.add('js-anim');
        const invObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    invObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        invObserver.observe(inventoryGrid);
    }


    // --- Inventory card hover actions: Save / Share / Text ------------------
    const GARAGE_KEY = 'prestige:garage';
    const getGarage = () => {
        try { return JSON.parse(localStorage.getItem(GARAGE_KEY)) || []; }
        catch { return []; }
    };
    const setGarage = arr => {
        try { localStorage.setItem(GARAGE_KEY, JSON.stringify(arr)); } catch {}
    };

    document.querySelectorAll('.vehicle-card').forEach(card => {
        const media = card.querySelector('.vehicle-card__media');
        const name = card.querySelector('.vehicle-card__name')?.textContent.trim();
        if (!media || !name) return;

        const actions = document.createElement('div');
        actions.className = 'vehicle-card__actions';
        actions.innerHTML = `
            <button type="button" class="vehicle-card__action" data-action="save" aria-label="Save ${name} to My Garage">
                <i class="ph-thin ph-bookmark-simple" aria-hidden="true"></i><span>Save</span>
            </button>
            <button type="button" class="vehicle-card__action" data-action="share" aria-label="Share ${name} via email">
                <i class="ph-thin ph-envelope-simple" aria-hidden="true"></i><span>Share</span>
            </button>
            <button type="button" class="vehicle-card__action" data-action="text" aria-label="Text ${name} to a phone">
                <i class="ph-thin ph-chat-circle" aria-hidden="true"></i><span>Text</span>
            </button>
        `;
        media.appendChild(actions);

        const saveBtn = actions.querySelector('[data-action="save"]');
        const syncSavedState = () => {
            const saved = getGarage().includes(name);
            saveBtn.dataset.active = saved ? 'true' : 'false';
            saveBtn.querySelector('span').textContent = saved ? 'Saved' : 'Save';
            const icon = saveBtn.querySelector('i');
            icon.className = saved ? 'ph ph-bookmark-simple' : 'ph-thin ph-bookmark-simple';
        };
        syncSavedState();

        actions.addEventListener('click', e => {
            const btn = e.target.closest('.vehicle-card__action');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();

            const action = btn.dataset.action;
            const pageUrl = window.location.origin + window.location.pathname + '#inventory';

            if (action === 'save') {
                const garage = getGarage();
                const idx = garage.indexOf(name);
                if (idx === -1) garage.push(name);
                else garage.splice(idx, 1);
                setGarage(garage);
                syncSavedState();
            } else if (action === 'share') {
                const subject = encodeURIComponent(`${name} — Prestige Imports`);
                const body = encodeURIComponent(
                    `Take a look at this ${name} at Prestige Imports:\n${pageUrl}`
                );
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
            } else if (action === 'text') {
                const phone = window.prompt('Enter the phone number to text this vehicle to:');
                if (!phone) return;
                const cleaned = phone.replace(/[^\d+]/g, '');
                const body = encodeURIComponent(`${name} at Prestige Imports — ${pageUrl}`);
                window.location.href = `sms:${cleaned}?&body=${body}`;
            }
        });
    });


    // --- Generic scroll-reveal -------------------------------------------
    // Any element with [data-reveal] gets .is-visible when it enters view.
    const revealEls = document.querySelectorAll('[data-reveal]');

    if (revealEls.length && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealEls.forEach(el => revealObserver.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
    }


    // --- Services: direction-aware hover glow ----------------------------
    // On pointerenter, compute which edge the cursor came from and
    // expose it via --glow-x / --glow-y CSS vars for a subtle gradient.
    document.querySelectorAll('.service').forEach(card => {
        const setGlow = (e, opacity) => {
            const r = card.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * 100;
            const y = ((e.clientY - r.top) / r.height) * 100;
            card.style.setProperty('--glow-x', x + '%');
            card.style.setProperty('--glow-y', y + '%');
            card.style.setProperty('--glow-opacity', opacity);
        };
        card.addEventListener('pointerenter', e => setGlow(e, 1));
        card.addEventListener('pointermove',  e => setGlow(e, 1));
        card.addEventListener('pointerleave', e => setGlow(e, 0));
    });


    // --- Events list → featured card preview / swap -------------------------
    const eventsFeatured = document.querySelector('.event-featured');
    const eventsMedia = eventsFeatured?.querySelector('.event-featured__media');
    const eventsRows = document.querySelectorAll('.event-row__link[data-event-img]');

    if (eventsFeatured && eventsMedia && eventsRows.length) {
        const baseImg = eventsMedia.querySelector('img');
        const titleEl = eventsFeatured.querySelector('.event-featured__title');
        const dateEl  = eventsFeatured.querySelector('.event__date');
        const catEl   = eventsFeatured.querySelector('.event__cat');
        const textEl  = eventsFeatured.querySelector('.event-featured__text');
        const bodyEl  = eventsFeatured.querySelector('.event-featured__body');

        if (baseImg) {
            const hoverImg = document.createElement('img');
            hoverImg.className = 'event-featured__img-hover';
            hoverImg.alt = '';
            hoverImg.setAttribute('aria-hidden', 'true');
            hoverImg.decoding = 'async';
            eventsMedia.appendChild(hoverImg);

            // Preload all preview images
            const preloaded = new Map();

            const applyRow = row => {
                const d = row.dataset;
                if (d.eventImg) baseImg.src = d.eventImg;
                if (titleEl && d.eventTitle) titleEl.textContent = d.eventTitle;
                if (dateEl  && d.eventDate)  dateEl.textContent  = d.eventDate;
                if (catEl   && d.eventCat)   catEl.textContent   = d.eventCat;
                if (textEl  && d.eventBody)  textEl.textContent  = d.eventBody;

                // Clear hover preview since base image is now committed
                eventsMedia.classList.remove('is-previewing');

                // Briefly fade the featured card to signal the change
                if (bodyEl) {
                    eventsFeatured.classList.add('is-swapping');
                    setTimeout(() => eventsFeatured.classList.remove('is-swapping'), 550);
                }

                // Mark row active
                eventsRows.forEach(r => r.classList.toggle('is-active', r === row));
            };

            eventsRows.forEach(row => {
                const src = row.dataset.eventImg;
                if (!preloaded.has(src)) {
                    const img = new Image();
                    img.src = src;
                    preloaded.set(src, img);
                }
                row.addEventListener('pointerenter', () => {
                    if (row.classList.contains('is-active')) return;
                    hoverImg.src = src;
                    eventsMedia.classList.add('is-previewing');
                });
                row.addEventListener('pointerleave', () => {
                    eventsMedia.classList.remove('is-previewing');
                });
                row.addEventListener('click', e => {
                    e.preventDefault();
                    applyRow(row);
                });
            });
        }
    }


    // --- Recently purchased slider (sell-your-car) --------------------------
    const sliderTrack = document.querySelector('[data-slider-track]');
    const prevBtn = document.querySelector('[data-slider-prev]');
    const nextBtn = document.querySelector('[data-slider-next]');

    if (sliderTrack && prevBtn && nextBtn) {
        const firstItem = sliderTrack.firstElementChild;

        const stepSize = () => {
            if (!firstItem) return sliderTrack.clientWidth * 0.9;
            const style = window.getComputedStyle(sliderTrack);
            const gap = parseFloat(style.columnGap || style.gap) || 0;
            return firstItem.getBoundingClientRect().width + gap;
        };

        const syncButtons = () => {
            const max = sliderTrack.scrollWidth - sliderTrack.clientWidth - 1;
            prevBtn.disabled = sliderTrack.scrollLeft <= 0;
            nextBtn.disabled = sliderTrack.scrollLeft >= max;
        };

        prevBtn.addEventListener('click', () => {
            sliderTrack.scrollBy({ left: -stepSize(), behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            sliderTrack.scrollBy({ left: stepSize(), behavior: 'smooth' });
        });

        sliderTrack.addEventListener('scroll', syncButtons, { passive: true });
        window.addEventListener('resize', syncButtons, { passive: true });
        syncButtons();

        // Drag-to-scroll (mouse / pen; touch handled natively)
        let dragging = false;
        let startX = 0;
        let startScroll = 0;
        let moved = 0;
        const DRAG_THRESHOLD = 5;

        sliderTrack.addEventListener('pointerdown', e => {
            if (e.pointerType === 'touch') return;
            dragging = true;
            moved = 0;
            startX = e.clientX;
            startScroll = sliderTrack.scrollLeft;
            sliderTrack.classList.add('is-dragging');
            sliderTrack.style.scrollSnapType = 'none';
            sliderTrack.setPointerCapture(e.pointerId);
        });

        sliderTrack.addEventListener('pointermove', e => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            moved = Math.abs(dx);
            sliderTrack.scrollLeft = startScroll - dx;
        });

        const endDrag = e => {
            if (!dragging) return;
            dragging = false;
            sliderTrack.classList.remove('is-dragging');
            sliderTrack.style.scrollSnapType = '';
            try { sliderTrack.releasePointerCapture(e.pointerId); } catch {}
        };
        sliderTrack.addEventListener('pointerup', endDrag);
        sliderTrack.addEventListener('pointercancel', endDrag);
        sliderTrack.addEventListener('pointerleave', endDrag);

        // Prevent click-through on children after a drag
        sliderTrack.addEventListener('click', e => {
            if (moved > DRAG_THRESHOLD) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }


    // Ribbon drift: subtle horizontal motion tied to scroll position.
    // Skip if user prefers reduced motion.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (brandsGrid && !reduceMotion) {
        const brandsSection = brandsGrid.closest('.section--brands');
        const DRIFT = 18; // pixels, half-range either side
        let rafId = null;

        const updateDrift = () => {
            rafId = null;
            const rect = brandsSection.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            // Progress 0→1 as section traverses viewport (entry top → exit bottom)
            const total = vh + rect.height;
            const passed = vh - rect.top;
            const p = Math.max(0, Math.min(1, passed / total));
            const x = (p - 0.5) * 2 * DRIFT;
            brandsGrid.style.setProperty('--brands-drift', x.toFixed(2) + 'px');
        };

        const onScroll = () => {
            if (rafId === null) rafId = requestAnimationFrame(updateDrift);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        updateDrift();
    }

});
