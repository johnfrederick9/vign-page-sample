/* =========================================================
   VIGN Client portal: shared shell, same roles as the SMK client portal (requestor/)
     includes/shell.php REQ_shell_head -> top bar: logo + company, "Find a job" (Ctrl K), your name, Sign out
                                          menu: Home, Jobs, Invoices (VIGN keeps only the main pages in the menu;
                                          Settings and Help are under your name, top right. Messages hidden for now)
   VIGN adds Documents (the customer's R-10: agreements, instructions to view and download).
   A page sets <body data-page="..."> and defines VC.init().
   ========================================================= */
(function (V) {
'use strict';

// ---------- helpers ----------
V.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
V.$ = function (s, r) { return (r || document).querySelector(s); };
V.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
V.param = function (k) { return new URLSearchParams(location.search).get(k); };
V.date = function (off) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + off); return d; };
V.day = function (off) { return off == null ? '' : V.date(off).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }); };
V.dayLong = function (off) { return V.date(off).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); };
V.iso = function (off) { var d = V.date(off), p = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };
V.fromIso = function (s) { if (!s) return null; return Math.round((new Date(s + 'T12:00:00') - V.date(0)) / 864e5); };
V.ago = function (off) { return off === 0 ? 'Today' : off === -1 ? 'Yesterday' : V.dayLong(off); };
V.money = function (n) { return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
V.job = function (id) { return V.jobs.filter(function (j) { return j.id === id; })[0] || null; };
V.open = function (j) { return j.status !== 'ready' && j.status !== 'cancelled'; };
V.late = function (j) { return V.open(j) && j.status !== 'checking' && j.due < 0; };
V.needs = function (j) { return !!j.needs && V.open(j); };
V.pill = function (txt, cls) { return '<span class="pill ' + cls + '">' + V.esc(txt) + '</span>'; };
V.stPill = function (j) { var s = V.STATUS[j.status]; return V.pill(s[0], s[1]) + (V.needs(j) ? ' ' + V.pill('Needs you', 'due-late') : ''); };
V.svc = function (j) { var s = V.services[j.svc]; return '<span class="svc"><i class="fa-solid ' + s[1] + '"></i>' + V.esc(s[0]) + '</span>'; };
V.dueTxt = function (j) {
    if (!V.open(j) || j.status === 'checking') return V.day(j.due);
    var d = j.due, t = d < 0 ? (d === -1 ? 'Late 1 day' : 'Late ' + (-d) + ' days') : d === 0 ? 'Due today' : d === 1 ? 'Tomorrow' : 'In ' + d + ' days';
    return V.day(d) + '<small>' + V.pill(t, d < 0 ? 'due-late' : d === 0 ? 'due-today' : d <= 2 ? 'due-soon' : 'due-later') + '</small>';
};
V.score = function (j) { if (!j.answers) return null; var t = 0, c = 0; j.answers.forEach(function (a) { if (V.points[a] != null) { t += V.points[a]; c++; } }); return c ? Math.round(t / c) : null; };
V.scoreCls = function (s) { return s >= 85 ? 'r1' : s >= 65 ? 'r2' : s >= 40 ? 'r3' : 'r4'; };
V.scorePill = function (j) { var s = V.score(j); return s == null ? '<span class="muted">–</span>' : '<span class="score rate ' + V.scoreCls(s) + '" title="Sample score formula">' + s + '</span>'; };
V.prep = function () { V.invoices.forEach(function (r) { r.bal = Math.max(0, r.amount - (r.paid || 0)); r.status = r.billed == null ? 'Bills next' : r.bal === 0 ? 'Paid' : r.due < 0 ? 'Past due' : 'Open'; }); };
V.owed = function () { V.prep(); return V.invoices.filter(function (r) { return r.billed != null; }).reduce(function (t, r) { return t + r.bal; }, 0); };
V.unread = function () { return V.threads.filter(function (t) { return t.unread; }).length; };
V.toast = function (msg) {
    var t = V.$('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 3200);
};
V.download = function (name, text, type) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain' })); a.download = name; a.click();
};

// ---------- top bar + menu (SMK requestor REQ_shell_head) ----------
var NAV = [
    ['home', 'command.html', 'fa-house', 'Home'],
    ['jobs', 'jobs.html', 'fa-briefcase', 'Jobs'],
    ['invoices', 'invoices.html', 'fa-file-invoice-dollar', 'Invoices'],
    ['documents', 'documents.html', 'fa-folder-open', 'Documents']
];
// saved in Settings (this browser): your details and the page to open after sign in
V.prefsKey = function () { return 'vign-client-settings-' + V.company.id; };
V.prefs = function () { try { return JSON.parse(localStorage.getItem(V.prefsKey()) || 'null') || {}; } catch (e) { return {}; } };
V.shell = function () {
    var page = document.body.dataset.page, P = V.prefs();
    ['name', 'title', 'phone'].forEach(function (k) { if (P[k]) V.me[k] = P[k]; });
    var on = { job: 'jobs', newjob: 'jobs', upload: 'jobs', activity: 'home' }[page] || page;
    var hdr = '<header class="hdr"><a class="hdr-brand" href="command.html" title="Home"><img src="../images/vign-mark.png" alt="VignUSA.com"><span>' + V.esc(V.company.name) + '<br>Client portal</span></a>' +
        '<button class="top-burger" id="burger" aria-label="Open menu"><i class="fa-solid fa-bars"></i></button>' +
        '<div class="top-search"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="q" placeholder="Find a job: address, ' + V.refLabel.toLowerCase() + ' or job #" autocomplete="off" aria-label="Find a job"><span class="kbd">Ctrl K</span><div class="top-results" id="qr"></div></div>' +
        '<a class="newjob" href="newjob.html"><i class="fa-solid fa-plus"></i><span class="t">Request an inspection</span></a>' +
        '<div class="req-me" id="me"><button type="button" class="req-name" id="meBtn" aria-haspopup="true" aria-expanded="false"><i class="fa-regular fa-circle-user"></i> <span>' + V.esc(V.me.name) + '</span> <i class="fa-solid fa-chevron-down caret"></i></button>' +
        '<div class="me-menu" id="meMenu" role="menu"><div class="me-who"><b>' + V.esc(V.me.name) + '</b><small>' + V.esc(V.company.name) + '</small></div>' +
        '<a role="menuitem" href="account.html"' + (page === 'account' ? ' class="on"' : '') + '><i class="fa-solid fa-gear"></i> Settings</a>' +
        '<a role="menuitem" href="help.html"' + (page === 'help' ? ' class="on"' : '') + '><i class="fa-regular fa-circle-question"></i> Help</a>' +
        '<a role="menuitem" href="tel:' + V.vign.phone.replace(/[^0-9+]/g, '') + '"><i class="fa-solid fa-phone"></i> Call VIGN <small>' + V.esc(V.vign.phone) + '</small></a>' +
        '<hr><a role="menuitem" href="index.html" class="out"><i class="fa-solid fa-right-from-bracket"></i> Sign out</a></div></div></header>';
    var sb = '<aside class="sb" id="sb"><nav class="sb-nav" aria-label="Client menu">' + NAV.map(function (m) {
            return '<a class="sb-link' + (m[0] === on ? ' on" aria-current="page' : '') + '" href="' + m[1] + '"><i class="fa-solid ' + m[2] + '"></i>' + m[3] + '</a>';
    }).join('') + '</nav><div class="sb-foot"><b>' + V.esc(V.vign.name) + '</b><br><i class="fa-solid fa-phone"></i> ' + V.esc(V.vign.phone) + '<br><i class="fa-regular fa-envelope"></i> ' + V.esc(V.vign.email) + '</div></aside><div class="sb-backdrop" id="sbBack"></div>';
    document.body.insertAdjacentHTML('afterbegin', hdr + sb);

    V.$('#burger').addEventListener('click', function () { document.body.classList.add('sb-open'); });
    // account menu
    var meB = V.$('#meBtn'), meM = V.$('#meMenu');
    function meOpen(o) { meM.classList.toggle('open', o); meB.setAttribute('aria-expanded', o); }
    meB.addEventListener('click', function (e) { e.stopPropagation(); meOpen(!meM.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (!e.target.closest('#me')) meOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && meM.classList.contains('open')) { meOpen(false); meB.focus(); } });
    V.$('#sbBack').addEventListener('click', function () { document.body.classList.remove('sb-open'); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.top-search')) V.$('#qr').classList.remove('open'); });

    // Find a job (Ctrl K)
    var q = V.$('#q'), qr = V.$('#qr');
    document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); q.focus(); } });
    q.addEventListener('input', function () {
        var t = q.value.trim().toLowerCase();
        if (t.length < 2) { qr.classList.remove('open'); return; }
        var hits = V.jobs.filter(function (j) { return (j.id + ' ' + j.addr + ' ' + j.city + ' ' + j.ref).toLowerCase().indexOf(t) > -1; }).slice(0, 7);
        qr.innerHTML = hits.length ? hits.map(function (j) { return '<a href="job.html?job=' + j.id + '"><b>' + j.id + '</b> · ' + V.esc(j.addr) + '<small>' + V.esc(j.ref) + ' · ' + V.STATUS[j.status][0] + '</small></a>'; }).join('') : '<a>No matching jobs</a>';
        qr.classList.add('open');
    });
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter' && q.value.trim()) location.href = 'jobs.html?q=' + encodeURIComponent(q.value.trim()); });
};

/* ---------- the report's visit details (same fields as the main system and the Staff Office Review) ---------- */
V.isUrgent = function (j) { return !!(j.answers && j.answers.indexOf('4') > -1); };
V.visitOf = function (j) {
    if (j.visit) return j.visit;
    if (!j.answers) return null;
    var FM = window.VIGNFORMS, n = +String(j.id).replace(/\D/g, '') || 0, bad = j.answers.some(function (a) { return a === '3' || a === '4'; });
    var v = { sample: true, weather: FM.WEATHER[n % 5], access: j.access || 'Exterior only', accessNote: '', fu: bad ? 'Yes' : 'No',
        hazards: V.isUrgent(j) ? 'See the item(s) rated 4.' : '', limitations: j.access === 'Exterior only' ? 'Exterior only, as ordered.' : '' };
    FM.fields(j.form, 'before').concat(FM.fields(j.form, 'after')).forEach(function (sec) {
        sec.list.forEach(function (q) { if (q[4]) return; if (q[2] === 'sel') v[q[0]] = q[3][q[0] === 'occupancy' && j.form === 'vacant' ? 1 : 0]; else if (q[2] === 'yn') v[q[0]] = 'Yes'; });
    });
    return v;
};
V.visitRows = function (j) {
    var v = V.visitOf(j), FM = window.VIGNFORMS; if (!v) return [];
    var rows = [['Weather', v.weather], ['How the inspector got in', v.access + (v.accessNote ? ' · ' + v.accessNote : '')]];
    FM.fields(j.form, 'before').concat(FM.fields(j.form, 'after')).forEach(function (sec) {
        if (sec.ticks) { var t = sec.list.filter(function (q) { return v[q[0]] && v[q[0]] !== 'No'; }).map(function (q) { return q[2] === 'yn' ? q[1] : 'Other: ' + v[q[0]]; }); rows.push([sec.name, t.length ? t.join(', ') : 'None']); return; }
        sec.list.forEach(function (q) { if (v[q[0]]) rows.push([q[1], v[q[0]]]); });
    });
    rows.push(['Follow-up recommended', v.fu || '–']);
    if (v.hazards) rows.push(['Immediate hazards', v.hazards]);
    if (v.limitations) rows.push(['Notes / limitations', v.limitations]);
    return rows;
};
V.photoLabel = function (i) { return 'P-' + ('0' + (i + 1)).slice(-2); };   // main system photo_label

V.band = function (icon, title, sub, actions) {
    return '<div class="band"><div><h1><i class="fa-solid ' + icon + '"></i>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (actions ? '<div class="band-actions">' + actions + '</div>' : '') + '</div>';
};
V.card = function (title, right, body, flush, id) {
    return '<div class="card2"' + (id ? ' id="' + id + '"' : '') + '><div class="card2-h"><h3>' + title + '</h3>' + (right ? '<span class="muted">' + right + '</span>' : '') + '</div>' + (flush ? body : '<div class="card2-b">' + body + '</div>') + '</div>';
};

/* ---------- table: search, sort, pages ----------
   V.table(el, { cols:[{k,label,render,cls,sort,sortVal}], rows:fn, search:fn, sortKey, sortDir, show, foot:fn, info, toolbar }) */
V.table = function (el, o) {
    var st = { q: '', sort: o.sortKey || null, dir: o.sortDir || 1, page: 0, show: o.show || 25 };
    el.innerHTML = '<div class="toolbar"><div class="tb-search"><i class="fa-solid fa-magnifying-glass"></i><input type="search" placeholder="Search this list..." data-q></div>' + (o.toolbar || '') +
        '<div class="tb-right">Show <select class="tb-select" data-show><option>10</option><option selected>25</option><option>100</option></select></div></div>' +
        '<div class="tbl-wrap"><table class="tbl cards"><thead><tr>' +
        o.cols.map(function (c) { return '<th' + (c.sort !== false ? ' data-sort="' + c.k + '"' : '') + (c.cls ? ' class="' + c.cls + '"' : '') + '>' + c.label + '</th>'; }).join('') +
        '</tr></thead><tbody></tbody><tfoot></tfoot></table></div><div class="tbl-foot"><span data-info></span><div class="pager" data-pager></div></div>';
    var tb = V.$('tbody', el);
    V.$('[data-q]', el).addEventListener('input', function (e) { st.q = e.target.value.toLowerCase(); st.page = 0; draw(); });
    V.$('[data-show]', el).addEventListener('change', function (e) { st.show = +e.target.value; st.page = 0; draw(); });
    V.$$('th[data-sort]', el).forEach(function (th) { th.addEventListener('click', function () { var k = th.dataset.sort; st.dir = st.sort === k ? -st.dir : 1; st.sort = k; draw(); }); });
    function rows() {
        var r = o.rows().filter(function (x) { return !st.q || o.search(x).toLowerCase().indexOf(st.q) > -1; });
        if (st.sort) { var col = o.cols.filter(function (c) { return c.k === st.sort; })[0] || {}, key = col.sortVal || function (x) { return x[st.sort]; };
            r.sort(function (a, b) { var x = key(a), y = key(b); if (x == null) x = ''; if (y == null) y = ''; return (x > y ? 1 : x < y ? -1 : 0) * st.dir; }); }
        return r;
    }
    function draw() {
        var all = rows(), pages = Math.max(1, Math.ceil(all.length / st.show));
        st.page = Math.min(st.page, pages - 1);
        var part = all.slice(st.page * st.show, st.page * st.show + st.show);
        tb.innerHTML = part.length ? part.map(function (x) {
            return '<tr' + (o.rowCls ? ' class="' + o.rowCls(x) + '"' : '') + '>' + o.cols.map(function (c) { var l = c.label.replace(/<[^>]*>/g, ''); return '<td' + (l ? ' data-l="' + l + '"' : '') + (c.cls ? ' class="' + c.cls + '"' : '') + '>' + c.render(x) + '</td>'; }).join('') + '</tr>';
        }).join('') : '<tr><td colspan="' + o.cols.length + '" class="empty">No records found</td></tr>';
        V.$('tfoot', el).innerHTML = o.foot && all.length ? o.foot(all) : '';
        V.$$('th[data-sort]', el).forEach(function (th) { th.classList.toggle('asc', th.dataset.sort === st.sort && st.dir === 1); th.classList.toggle('desc', th.dataset.sort === st.sort && st.dir === -1); });
        V.$('[data-info]', el).textContent = 'Showing ' + (all.length ? st.page * st.show + 1 : 0) + '–' + (st.page * st.show + part.length) + ' of ' + all.length + ' ' + (o.info || 'records');
        var p = '<button data-p="' + (st.page - 1) + '"' + (st.page === 0 ? ' disabled' : '') + '>‹</button>';
        for (var i = 0; i < pages; i++) p += '<button data-p="' + i + '"' + (i === st.page ? ' class="on"' : '') + '>' + (i + 1) + '</button>';
        p += '<button data-p="' + (st.page + 1) + '"' + (st.page >= pages - 1 ? ' disabled' : '') + '>›</button>';
        V.$('[data-pager]', el).innerHTML = p;
        V.$$('[data-p]', el).forEach(function (b) { b.addEventListener('click', function () { st.page = +b.dataset.p; draw(); }); });
    }
    draw();
    return { redraw: draw, all: rows };
};

// ---------- pop-up ----------
V.modal = function (title, body, buttons, onOpen, wide) {
    var m = V.$('#vcModal');
    if (!m) { m = document.createElement('div'); m.id = 'vcModal'; m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); document.body.appendChild(m); }
    m.innerHTML = '<div class="modal-box" style="background:#fff;max-width:' + (wide ? '820px' : '560px') + '"><div class="modal-h"><h2>' + title + '</h2><button class="modal-x" data-x aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div><div class="modal-b2">' + body + '</div>' +
        '<div class="modal-f"><button class="btn btn-ghost btn-sm" data-x>' + (buttons ? 'Cancel' : 'Close') + '</button>' + (buttons || '') + '</div></div>';
    m.classList.add('open');
    var close = function () { m.classList.remove('open'); };
    V.$$('[data-x]', m).forEach(function (b) { b.addEventListener('click', close); });
    if (onOpen) onOpen(m, close);
    return m;
};

// Pay invoices (SMK requestor invoices.php "Pay invoices": which ones, any amount, a card). Preview only, no real charge.
V.pay = function (ids, done) {
    V.prep();
    var list = V.invoices.filter(function (r) { return r.billed != null && r.bal > 0 && (!ids || ids.indexOf(r.id) > -1); });
    var total = list.reduce(function (t, r) { return t + r.bal; }, 0);
    V.modal('Pay invoices',
        list.map(function (r) { return '<label class="pick-inv"><input type="checkbox" checked value="' + r.id + '" data-bal="' + r.bal + '"><span><b>' + r.id + '</b> · ' + V.esc(r.period) + '<small>Due ' + V.day(r.due) + '</small></span><b>' + V.money(r.bal) + '</b></label>'; }).join('') +
        '<label class="fld">Amount to pay ($)<input type="number" id="amt" min="1" step="0.01" value="' + total.toFixed(2) + '"></label>' +
        '<label class="fld">Card<select><option>Use a new card (entered on the payment service\'s own secure page)</option></select></label>' +
        '<p class="note1"><i class="fa-solid fa-lock"></i> Card numbers are never typed into or stored by VIGN. Only the last 4 digits are shown. Preview: nothing is charged.</p>',
        '<button class="btn btn-primary btn-sm" data-ok><i class="fa-solid fa-credit-card"></i> Pay</button>', function (m, close) {
            var amt = V.$('#amt', m);
            V.$$('.pick-inv input', m).forEach(function (c) { c.addEventListener('change', function () { amt.value = V.$$('.pick-inv input:checked', m).reduce(function (t, x) { return t + (+x.dataset.bal); }, 0).toFixed(2); }); });
            V.$('[data-ok]', m).addEventListener('click', function () {
                var left = +amt.value || 0; if (left < 1) { V.toast('Enter an amount of $1 or more.'); return; }
                var paidTotal = 0;
                V.$$('.pick-inv input:checked', m).forEach(function (c) { var r = V.invoices.filter(function (x) { return x.id === c.value; })[0], a = Math.min(left, r.bal); if (a > 0) { r.paid += a; left -= a; paidTotal += a; V.payments.unshift({ id: 'PAY-' + (900 + V.payments.length), on: 0, inv: r.id, amount: a, how: 'Card', ref: 'Card (preview)' }); } });
                close(); V.toast(V.money(paidTotal) + ' paid (preview only, no real charge). A receipt is on the Invoices page.'); if (done) done();
            });
        });
};

/* A few choices carry from page to page in this browser tab (signed agreements, sample card, read messages).
   Everything else resets when a page reloads. */
V.save = function () {
    try { sessionStorage.setItem('vc-state', JSON.stringify({ card: V.company.card, signed: V.documents.filter(function (d) { return d.signed === 'Signed'; }).map(function (d) { return [d.id, d.signedOn]; }), read: V.threads.filter(function (x) { return !x.unread; }).map(function (x) { return x.job; }) })); } catch (e) {}
};
function load() {
    try {
        var s = JSON.parse(sessionStorage.getItem('vc-state') || 'null'); if (!s) return;
        if (s.card) V.company.card = s.card;
        (s.signed || []).forEach(function (p) { V.documents.forEach(function (d) { if (d.id === p[0]) { d.signed = 'Signed'; d.signedOn = p[1]; } }); });
        (s.read || []).forEach(function (j) { V.threads.forEach(function (x) { if (x.job === j) x.unread = false; }); });
    } catch (e) {}
}
// Mystery-shopping client (Bright Brew): the same pages, with shop words instead of inspection words
V.shopWords = function (root) {
    if (V.kind !== 'shop' || !root) return;
    var W = [[/Request an inspection/g, 'Request a mystery shop'], [/Request inspections/g, 'Request mystery shops'], [/Send many inspections/g, 'Send many shops'], [/The inspector needs you/g, 'The shopper needs you'],
        [/Inspections due/g, 'Shops due'], [/where the inspector/g, 'where the shopper'], [/The inspector,/g, 'The shopper,'], [/one inspection per row/g, 'one shop per row'], [/Every inspection you sent/g, 'Every mystery shop you sent'],
        [/inspections sent to VIGN/g, 'shops sent to VIGN'], [/Send (\d+) inspection/g, 'Send $1 shop'], [/Anything the inspector should know/g, 'When to visit, what to buy, what to watch for']];
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n;
    while ((n = tw.nextNode())) { var t = n.nodeValue, o = t; W.forEach(function (w) { t = t.replace(w[0], w[1]); }); if (t !== o) n.nodeValue = t; }
    root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(function (el) { ['placeholder', 'title', 'aria-label'].forEach(function (k) { var v = el.getAttribute(k); if (v) { var t = v; W.forEach(function (w) { t = t.replace(w[0], w[1]); }); if (t !== v) el.setAttribute(k, t); } }); });
};
document.addEventListener('DOMContentLoaded', function () {
    load(); V.shell(); if (typeof V.init === 'function') V.init();
    if (V.kind === 'shop') { V.shopWords(document.body); new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(function (nd) { if (nd.nodeType === 1) V.shopWords(nd); }); }); }).observe(document.body, { childList: true, subtree: true }); }
});
})(window.VC);
