/* Consign With Prestige — prototype behaviour for the demo's form.
   The site keeps its own Contact Form 7 submit + reCAPTCHA; this only shows the design. */
(function () {
    var form = document.querySelector('[data-consign]');
    if (!form) return;
    var status = form.querySelector('[data-status]');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.reportValidity()) return;
        if (status) status.textContent = 'Prototype: this form is not connected.';
    });

    /* Image upload: "Upload" or drop on the zone. Images only, at most data-max (8).
       Files are kept in the real <input type=file> (DataTransfer), so a multipart POST carries them. */
    var box = form.querySelector('[data-upload]');
    if (!box) return;
    var input = box.querySelector('[data-upload-input]');
    var zone = box.querySelector('[data-upload-zone]');
    var list = box.querySelector('[data-upload-list]');
    var max = parseInt(box.getAttribute('data-max'), 10) || 8;
    var files = [];

    function sync() {
        try {
            var dt = new DataTransfer();
            files.forEach(function (f) { dt.items.add(f); });
            input.files = dt.files;
        } catch (err) { /* very old browsers keep their own last pick */ }
        list.querySelectorAll('img').forEach(function (img) { URL.revokeObjectURL(img.src); });
        list.innerHTML = '';
        files.forEach(function (f, i) {
            var li = document.createElement('li');
            li.className = 'upload__item';
            var img = document.createElement('img');
            img.src = URL.createObjectURL(f);
            img.alt = f.name;
            var rm = document.createElement('button');
            rm.type = 'button';
            rm.className = 'upload__rm';
            rm.setAttribute('aria-label', 'Remove ' + f.name);
            rm.innerHTML = '&times;';
            rm.addEventListener('click', function () { files.splice(i, 1); sync(); });
            li.appendChild(img);
            li.appendChild(rm);
            list.appendChild(li);
        });
        box.classList.toggle('is-full', files.length >= max);
    }

    function add(fileList) {
        Array.prototype.forEach.call(fileList, function (f) {
            if (files.length < max && /^image\//.test(f.type)) files.push(f);
        });
        sync();
    }

    box.querySelector('[data-upload-pick]').addEventListener('click', function () {
        if (files.length < max) input.click();
    });
    input.addEventListener('change', function () { add(Array.prototype.slice.call(input.files)); });
    ['dragenter', 'dragover'].forEach(function (t) {
        zone.addEventListener(t, function (e) { e.preventDefault(); zone.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (t) {
        zone.addEventListener(t, function (e) { e.preventDefault(); zone.classList.remove('is-over'); });
    });
    zone.addEventListener('drop', function (e) { if (e.dataTransfer) add(e.dataTransfer.files); });
})();
