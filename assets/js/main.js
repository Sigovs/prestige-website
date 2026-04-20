/**
 * Prestige Imports — main.js
 * Handles: FAQ accordion, smooth scroll, footer year
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Footer year -------------------------------------------------------
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();


    // --- Header scroll state -----------------------------------------------
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
        const updateHeaderScroll = () => {
            siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
        };
        window.addEventListener('scroll', updateHeaderScroll, { passive: true });
        updateHeaderScroll();
    }


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
