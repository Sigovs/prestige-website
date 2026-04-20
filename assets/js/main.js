/**
 * Prestige Imports — main.js
 * Handles: FAQ accordion, smooth scroll, footer year
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Footer year -------------------------------------------------------
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();


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

});
