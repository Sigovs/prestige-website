"""Builds consign-with-prestige.html — a page of the Prestige portal (v6).

  * Header and footer: copied from index_6.html (the current portal), so they never drift.
  * The form: the demo's (prestigeimports.aandemo.com/consign_with_prestige/) as it is — same fields,
    placeholders, order, consent and Send button. Only the image-upload block is redrawn.
  * Content: the live page's (prestigeimports.com/consign_with_prestige), word for word, built only from
    the portal's own system (home-v6.css: .t-*, .stack, .eyebrow-stamp, .btn, .service, .brands__grid;
    vdp6.css: .vdp-calc__* fields). consign.css holds only modifiers of those, on the system's tokens.

Run from the repo root:  python _build/mkconsign.py
"""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
idx = (ROOT / 'index_6.html').read_text(encoding='utf-8')

header = re.search(r'\n(\s*<header class="site-header">.*?</header>)', idx, re.S).group(1)
footer = re.search(r'\n(\s*<!-- =+\s*\n\s*FOOTER.*?</footer>\s*<a href="#top" id="back-to-top".*?</a>\s*<script>.*?</script>)', idx, re.S).group(1)

# Header links point at the portal's pages. No item is marked active: Consign is its own page (the devs link the menu).
header = (header
          .replace('href="#sell"', 'href="index_6.html#sell"')
          .replace('href="#service"', 'href="index_6.html#service"')
          .replace('href="#store"', 'href="index_6.html#store"')
          .replace('href="#research"', 'href="index_6.html#research"')
          .replace('href="#about"', 'href="index_6.html#about"'))
footer = re.sub(r'href="#(inventory|service|sell|about|contact)"', r'href="index_6.html#\1"', footer)

YEARS = ''.join(f'<option>{y}</option>' for y in range(2027, 1959, -1))
MAKES = ['ACURA', 'ALFA ROMEO', 'ASTON MARTIN', 'AUDI', 'BENTLEY', 'BMW', 'BUGATTI', 'BUICK', 'CADILLAC', 'CHEVROLET',
         'CHRYSLER', 'CZINGER', 'DODGE', 'ECCENTRICA', 'FERRARI', 'FIAT', 'FORD', 'GENESIS', 'GMC', 'GUNTHER WERKS', 'HONDA',
         'HYUNDAI', 'INFINITI', 'JAGUAR', 'JEEP', 'KARMA', 'KIA', 'KOENIGSEGG', 'LAMBORGHINI', 'LAND ROVER', 'LEXUS',
         'LINCOLN', 'LOTUS', 'LUCID', 'MASERATI', 'MAYBACH', 'MAZDA', 'MCLAREN', 'MERCEDES-BENZ', 'MINI', 'NISSAN',
         'PAGANI', 'PORSCHE', 'RAM', 'RIVIAN', 'ROLLS-ROYCE', 'SUBARU', 'TESLA', 'TOYOTA', 'VOLKSWAGEN', 'VOLVO']
MAKE_OPTS = ''.join(f'<option>{m}</option>' for m in MAKES)
STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
          'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
          'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
          'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
          'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
          'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
          'West Virginia', 'Wisconsin', 'Wyoming']
STATE_OPTS = ''.join(f'<option>{s}</option>' for s in STATES)


def inp(name, ph, req=False, typ='text', auto=''):
    r = ' required' if req else ''
    a = f' autocomplete="{auto}"' if auto else ''
    return (f'<div class="vdp-calc__field"><input class="vdp-calc__input" type="{typ}" name="{name}" '
            f'placeholder="{ph}" aria-label="{ph.rstrip("*")}"{a}{r}></div>')


def sel(name, ph, opts, req=False):
    r = ' required' if req else ''
    return (f'<div class="vdp-calc__field"><select class="vdp-calc__input vdp-calc__select" name="{name}" '
            f'aria-label="{ph.rstrip("*")}"{r}><option value="" selected>{ph}</option>{opts}</select>'
            f'<i class="ph-thin ph-caret-down vdp-calc__chevron" aria-hidden="true"></i></div>')


LOGOS = [  # (name, file) — the live page's 10 makes
    ('Porsche', 'logos_brands/porsche.svg'),
    ('Rolls Royce', 'logos_brands/Group 1321314247.svg'),
    ('Land Rover', 'logos_brands/land-rover.svg'),
    ('Ferrari', 'logos_brands/Group 1321314250.svg'),
    ('McLaren', 'logos_brands/Group 1321314246.svg'),
    ('Lamborghini', 'Lamborghini_logo.svg'),
    ('BMW', 'logos_brands/bmw.svg'),
    ('Audi', 'logos_brands/audi.svg'),
    ('Tesla', 'logos_brands/tesla.svg'),  # Wikimedia Commons Tesla_Motors.svg (public domain), recoloured to --ink
    ('Mercedes-Benz', 'logos_brands/mercedes-benz.svg'),
]


def brand(name, f):
    if f:
        media = f'<img src="assets/images/{f.replace(" ", "%20")}" alt="{name}">'
    else:
        media = f'<span class="brand-card__missing">{name} logo — to come</span>'
    return (f'                    <li class="brand-card"><div class="brand-card__link">'
            f'<div class="brand-card__media">{media}</div>'
            f'<span class="brand-card__city" aria-hidden="true">{name}</span></div></li>\n')


STEPS = [
    ('01', 'Submit exotic car information', 'Share the make, model, mileage, vin and any unique information about your vehicle. Our experienced sales team researches the market value and an offer is made within 24 hours.'),
    ('02', 'Our sales team works for you to get your car sold', 'Once you agree on a selling price, and complete the consignment agreement, your car is inspected, detailed, professionally photographed, and placed online for sale.'),
    ('03', 'Get paid', 'Our sales team will present offers to you, sign the purchase agreement, and your car is sold - collect your cash.'),
]
WHY = [
    ('01', 'We know the true value of your exotic car.', 'You will receive our research backed listing price assessment for your vehicle within 24 hours.'),
    ('02', 'We know the market.', 'As experts in the industry, our trusted team knows how to market your vehicle to the right people.'),
    ('03', 'Avoid risk.', 'No more low offers and spam emails, leave the classified behind and get top dollar for your car in just 3 steps.'),
    ('04', '100% Satisfaction.', 'We are trusted experts in exotic auto sales and always strive for complete satisfaction, our clients expect nothing less.'),
]

STEP_HTML = ''.join(
    f'''                            <li class="service service--static">
                                <span class="service__num">{n}</span>
                                <h3 class="service__title">{t}</h3>
                                <p class="service__body">{b}</p>
                            </li>
''' for n, t, b in STEPS)
WHY_HTML = ''.join(
    f'''                    <li class="consign-why__item">
                        <span class="t-micro consign-why__num">{n}</span>
                        <h3 class="t-h4">{t}</h3>
                        <p class="t-small">{b}</p>
                    </li>
''' for n, t, b in WHY)

BODY = f'''
    <main class="page-consign">

        <!-- 01 — PAGE HERO. "Consignment" is the demo's H1; the headline is the live page's. -->
        <section class="page-hero" id="hero" aria-labelledby="consign-heading">
            <div class="page-hero__media" aria-hidden="true">
                <img src="assets/images/hero_d.jpg" alt="" loading="eager" fetchpriority="high">
            </div>
            <div class="container">
                <div class="stack page-hero__text">
                    <span class="eyebrow-stamp eyebrow-stamp--light">Consignment</span>
                    <h1 class="t-display" id="consign-heading">The Simple Way to Sell Your Exotic</h1>
                </div>
            </div>
        </section>


        <!-- 02 — THE FORM: the demo's fields, placeholders and order, in the portal's field style
             (.vdp-calc__* from vdp6.css). The site keeps its own Contact Form 7 + reCAPTCHA. -->
        <section class="section consign-form" id="consign-form" aria-label="Consignment form">
            <div class="container">
                <form class="consign-form__form" method="POST" action="#" enctype="multipart/form-data" data-consign>

                    <h2 class="t-h2">Vehicle Information</h2>
                    <div class="vdp-calc__grid vdp-calc__grid--4">
                        {sel('year', 'Select Year*', YEARS, True)}
                        {sel('make', 'Make*', MAKE_OPTS, True)}
                        {inp('model', 'Model*', True)}
                        {inp('trim', 'Trim')}
                        {inp('ext_color', 'Exterior Color')}
                        {inp('int_color', 'Interior Color')}
                        {inp('cylinders', 'Cylinders')}
                        {inp('litrs', 'Liters')}
                        {inp('mileage', 'Mileage')}
                        {sel('trans', 'Select Transmission', '<option>Automatic</option><option>Manual</option>')}
                        {inp('lienholder', 'Lien Holder').replace('class="vdp-calc__field"', 'class="vdp-calc__field vdp-calc__field--2"')}
                    </div>

                    <div class="upload" data-upload data-max="8">
                        <input class="upload__file" type="file" id="vehicle_images" name="vehicle_images[]" accept="image/*" multiple tabindex="-1" data-upload-input>
                        <div class="upload__zone" data-upload-zone>
                            <i class="ph-thin ph-images upload__icon" aria-hidden="true"></i>
                            <div class="upload__text">
                                <p class="t-h4">Upload Images (up to 8)</p>
                                <p class="t-caption">Drag and Drop Here</p>
                            </div>
                            <button class="btn" type="button" data-upload-pick aria-controls="vehicle_images">
                                <span>Upload</span>
                                <i class="ph-thin ph-upload-simple" aria-hidden="true"></i>
                            </button>
                        </div>
                        <ul class="upload__list" data-upload-list aria-label="Selected images"></ul>
                    </div>

                    <div class="vdp-calc__field"><textarea class="vdp-calc__input vdp-calc__input--area" name="add_options" rows="3" placeholder="Additional Options" aria-label="Additional Options"></textarea></div>

                    <h2 class="t-h2 consign-form__next">Contact Information</h2>
                    <div class="vdp-calc__grid">
                        {inp('fname', 'Enter your First Name*', True, auto='given-name')}
                        {inp('lname', 'Enter your Last Name*', True, auto='family-name')}
                        {inp('address', 'Enter your Address', auto='street-address')}
                        {inp('city', 'Enter your City', auto='address-level2')}
                        {sel('state', 'State*', STATE_OPTS, True)}
                        {inp('zip', 'Enter your Zip*', True, auto='postal-code')}
                        {inp('email', 'Enter your Email*', True, typ='email', auto='email')}
                        {inp('phone', 'Enter your Phone*', True, typ='tel', auto='tel')}
                    </div>

                    <label class="consign-form__agree t-small"><input type="checkbox" name="i_agree" required> <span>Please note that by completing this form, you agree to being contacted via text, phone and email.*</span></label>

                    <div class="consign-form__captcha t-caption" aria-hidden="true">reCAPTCHA — the site's own</div>

                    <div class="consign-form__actions">
                        <button class="btn btn--solid" type="submit"><span>Send</span><i class="ph-thin ph-caret-right" aria-hidden="true"></i></button>
                        <p class="t-small" role="status" aria-live="polite" data-status></p>
                    </div>
                </form>
            </div>
        </section>


        <!-- 03 — HOW IT WORKS: the Services split (copy + cards | media). The live page's text and its own photo. -->
        <section class="section consign-steps" id="how-it-works" aria-labelledby="steps-heading">
            <div class="container consign-split">
                <div class="consign-split__copy">
                    <div class="stack">
                        <h2 class="t-h1" id="steps-heading">How it works</h2>
                        <p class="t-body consign-steps__intro">Eliminate risk and get top dollar for your car in just 3 steps with Prestige Imports' Consignment Program. Selling your vehicle doesn’t have to be difficult, leverage our team of trusted industry experts and sell your car in 3 simple steps.</p>
                    </div>
                    <ol class="services__grid services__grid--steps">
{STEP_HTML}                    </ol>
                </div>
                <div class="consign-split__media" aria-hidden="true">
                    <img src="assets/images/consign/consign-carrera-gt.jpg" alt="" loading="lazy">
                </div>
            </div>
        </section>


        <!-- 04 — RETAIL YOUR RIDE: the live page's line and its own picture, set straight on the page. -->
        <section class="section consign-retail" id="retail-your-ride" aria-labelledby="ride-heading">
            <div class="container">
                <h2 class="consign-pair" id="ride-heading">
                    <span class="t-h1">Retail Your Ride.</span>
                    <span class="consign-pair__secondary">The Safe and Easy Way to Sell Your Car.</span>
                </h2>
                <img class="consign-retail__img" src="assets/images/consign/consign-retail.png" alt="Three Lamborghinis: red and black, yellow and blue" width="1920" height="640" loading="lazy">
            </div>
        </section>


        <!-- 05 — WHY: a dark section (the Difference / Reviews surface), the live page's 4 points. -->
        <section class="section consign-why" id="why-prestige" aria-labelledby="why-heading">
            <div class="container">
                <h2 class="consign-pair consign-pair--on-dark" id="why-heading">
                    <span class="t-h1">Why Choose Prestige Imports'</span>
                    <span class="consign-pair__secondary">Consignment Program?</span>
                </h2>
                <ol class="consign-why__list">
{WHY_HTML}                </ol>
            </div>
        </section>


        <!-- 06 — WE'RE LOOKING FOR: the Brands directory grid, the live page's 10 makes as logos. -->
        <section class="section consign-brands" id="looking-for" aria-labelledby="looking-heading">
            <div class="container">
                <h2 class="t-h1 consign-brands__heading" id="looking-heading">We're Looking For...</h2>
                <ul class="brands__grid brands__grid--ten" aria-label="Makes we are looking for">
''' + ''.join(brand(n, f) for n, f in LOGOS) + '''                </ul>
            </div>
        </section>

    </main>
'''

HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consign With Prestige | Prestige Imports</title>
    <meta name="description" content="Prestige Imports' Consignment Program — the simple way to sell your exotic.">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/thin/style.css">
    <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">

    <link rel="stylesheet" href="assets/css/home-v6.css">
    <link rel="stylesheet" href="assets/css/vdp6.css">
    <link rel="stylesheet" href="assets/css/consign.css">
</head>
<body class="page-consign">
<!-- GENERATED by _build/mkconsign.py — edit the script, not this file. -->

'''

TAIL = '''
    <script src="assets/js/main.js" defer></script>
    <script src="assets/js/consign.js" defer></script>
</body>
</html>
'''

out = HEAD + header + '\n' + BODY + '\n' + footer + '\n' + TAIL
(ROOT / 'consign-with-prestige.html').write_text(out, encoding='utf-8')
print('wrote consign-with-prestige.html', len(out))
