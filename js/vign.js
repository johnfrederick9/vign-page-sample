// VIGN site scripts (plain JS, no build step)
document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (toggle && nav) {
        var close = function () {
            nav.classList.remove('open');
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        };
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            toggle.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    }

    // Header shadow on scroll
    var header = document.querySelector('.site-header');
    if (header) {
        var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // Demo rating buttons on the hero card: one active at a time
    document.querySelectorAll('.rate-buttons').forEach(function (group) {
        group.querySelectorAll('.rb').forEach(function (btn) {
            btn.addEventListener('click', function () {
                group.querySelectorAll('.rb').forEach(function (b) { b.classList.remove('is-on'); b.setAttribute('aria-pressed', 'false'); });
                btn.classList.add('is-on');
                btn.setAttribute('aria-pressed', 'true');
            });
        });
    });

    // Show / hide password
    document.querySelectorAll('.pw-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var input = document.getElementById(btn.getAttribute('data-target'));
            if (!input) return;
            var show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            btn.textContent = show ? 'Hide' : 'Show';
            btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        });
    });
    // Request form: show the fields that match the chosen service
    var reqForm = document.querySelector(".request-form");
    if (reqForm) {
        var applyGroup = function () {
            var picked = reqForm.querySelector("input[name=service]:checked");
            reqForm.setAttribute("data-group", picked ? picked.getAttribute("data-group") : "property");
        };
        reqForm.querySelectorAll("input[name=service]").forEach(function (r) { r.addEventListener("change", applyGroup); });
        applyGroup();
    }

    // BUSINESSES and INDUSTRIES SERVICED: plain <details> box, no script needed. Escape closes it.
    document.querySelectorAll('.biz-drop').forEach(function (drop) {
        drop.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drop.open) { drop.open = false; drop.querySelector('summary').focus(); }
        });
    });

    // In the field: previous / next buttons for the sliding photo cards
    document.querySelectorAll('.shop-section').forEach(function (sec) {
        var track = sec.querySelector('.shop-track');
        var prev = sec.querySelector('.shop-prev');
        var next = sec.querySelector('.shop-next');
        if (!track || !prev || !next) return;
        var step = function () {
            var card = track.querySelector('.shop-card');
            return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
        };
        var update = function () {
            prev.disabled = track.scrollLeft <= 2;
            next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
        };
        var go = function (dir) {
            track.scrollBy({ left: dir * step(), behavior: 'smooth' });
            setTimeout(update, 400);   // also refresh after the slide, in case scroll events are late
            setTimeout(update, 800);
        };
        prev.addEventListener('click', function () { go(-1); });
        next.addEventListener('click', function () { go(1); });
        track.addEventListener('scroll', update, { passive: true });
        track.addEventListener('scrollend', update);
        window.addEventListener('resize', update);
        update();
    });
});
