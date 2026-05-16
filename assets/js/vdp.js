/* ──────────────────────────────────────────────────────────
   VDP — page interactions
   ────────────────────────────────────────────────────────── */

/* Finance Calculator
   Loan amount = vehicle price − down payment   (updates live)
   Monthly pmt = standard amortization formula  (on "Calculate") */
(function () {
    const form = document.querySelector('.vdp-calc');
    if (!form) return;

    const priceEl    = form.querySelector('#calc-price');
    const downEl     = form.querySelector('#calc-down');
    const aprEl      = form.querySelector('#calc-apr');
    const termEl     = form.querySelector('#calc-term');
    const loanOut    = form.querySelector('#calc-loan');
    const monthlyOut = form.querySelector('#calc-monthly');

    /* Pull a clean number out of a free-text field */
    const toNumber = (el) => {
        const n = parseFloat(String(el.value).replace(/[^0-9.]/g, ''));
        return Number.isFinite(n) ? n : 0;
    };
    const format = (n) =>
        n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const loanAmount = () => Math.max(toNumber(priceEl) - toNumber(downEl), 0);

    function updateLoan() {
        loanOut.textContent = format(loanAmount());
    }

    function calculate() {
        const principal   = loanAmount();
        const months      = parseInt(termEl.value, 10) || 0;
        const monthlyRate = toNumber(aprEl) / 100 / 12;
        let monthly = 0;
        if (principal > 0 && months > 0) {
            monthly = monthlyRate > 0
                ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
                : principal / months;
        }
        loanOut.textContent = format(principal);
        monthlyOut.textContent = format(monthly);
    }

    priceEl.addEventListener('input', updateLoan);
    downEl.addEventListener('input', updateLoan);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        calculate();
    });

    /* reset() clears the inputs after this handler runs — defer the
       output reset one frame so it isn't immediately overwritten. */
    form.addEventListener('reset', () => {
        requestAnimationFrame(() => {
            loanOut.textContent = '0.00';
            monthlyOut.textContent = '0.00';
        });
    });
})();

/* Related Vehicles — prev / next scroll the card track one card at a time */
(function () {
    const track = document.querySelector('[data-related-track]');
    if (!track) return;
    const prev = document.querySelector('[data-related-prev]');
    const next = document.querySelector('[data-related-next]');

    const step = () => {
        const card = track.querySelector('li');
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    };

    function update() {
        const max = track.scrollWidth - track.clientWidth - 1;
        if (prev) prev.disabled = track.scrollLeft <= 0;
        if (next) next.disabled = track.scrollLeft >= max;
    }

    if (prev) prev.addEventListener('click', () =>
        track.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () =>
        track.scrollBy({ left: step(), behavior: 'smooth' }));

    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
})();
