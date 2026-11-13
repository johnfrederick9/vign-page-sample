/* =========================================================
   VIGN Inspector portal: shared shell (same job as SMK ps/link.php).
   Draws the sidebar + top bar on every page and holds shared helpers.
   A page sets <body data-page="..."> and calls VIGN.page(title, ...) .
   ========================================================= */
(function (V) {
'use strict';

// ---------- helpers ----------
V.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
V.$ = function (s, r) { return (r || document).querySelector(s); };
V.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
V.param = function (k) { return new URLSearchParams(location.search).get(k); };
V.job = function (id) { for (var i = 0; i < V.jobs.length; i++) if (V.jobs[i].id === id) return V.jobs[i]; return null; };
V.date = function (off) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + off); return d; };
V.day = function (off) { return V.date(off).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }); };
V.dayShort = function (off) { return V.date(off).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); };
V.money = function (n) { return '$' + Number(n).toFixed(2); };
V.store = function (k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } };
V.isOpen = function (j) { return j.status === 'assigned' || j.status === 'in_field'; };
V.status = { assigned: ['Assigned', 'st-assigned'], in_field: ['In progress', 'st-field'], submitted: ['Waiting for review', 'st-submitted'], returned: ['Needs changes', 'st-returned'], approved: ['Approved', 'st-approved'] };
V.due = function (d) {
    if (d < 0) return [d === -1 ? 'Overdue 1 day' : 'Overdue ' + (-d) + ' days', 'due-late'];
    if (d === 0) return ['Due today', 'due-today'];
    if (d === 1) return ['Due tomorrow', 'due-soon'];
    return [V.dayShort(d), 'due-later'];
};
V.scoreCls = function (s) { return s >= 85 ? 'r1' : s >= 65 ? 'r2' : s >= 40 ? 'r3' : 'r4'; };
V.svc = function (j) { var s = V.services[j.svc]; return '<span class="svc"><i class="fa-solid ' + s[1] + '"></i>' + V.esc(s[0]) + '</span>'; };
V.maps = function (j) { return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(j.addr + ', ' + j.city); };
V.pill = function (p) { return '<span class="pill ' + p[1] + '">' + V.esc(p[0]) + '</span>'; };
V.sum = function (a) { return a.reduce(function (t, j) { return t + j.fee; }, 0); };

V.toast = function (msg) {
    var t = document.getElementById('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 3200);
};
// answer an offer; kept in this browser so the Admin Menu shows the same answer
V.answer = function (o, yes) {
    o.state = yes ? 'accepted' : 'declined';
    var a = V.store('vign-offer-answers') || {}; a[o.id] = o.state; V.store('vign-offer-answers', a);
    if (yes) V.addOfferJob(o);
};
// Don: the inspector gets an automatic reminder email on day 5 after accepting the job
V.reminder = function (j) { if (j.assigned == null || !V.isOpen(j)) return null; var r = j.assigned + 5; return r < j.due ? r : null; };
// counts used by the sidebar and dashboard
V.counts = function () {
    var open = V.jobs.filter(V.isOpen);
    return {
        open: open,
        today: open.filter(function (j) { return j.due === 0; }),
        due5: open.filter(function (j) { return j.due >= 0 && j.due <= 5; }),
        late: open.filter(function (j) { return j.due < 0; }),
        returned: V.jobs.filter(function (j) { return j.status === 'returned'; }),
        review: V.jobs.filter(function (j) { return j.status === 'submitted'; }),
        owed: V.jobs.filter(function (j) { return j.status === 'approved' && !j.paid; }),
        paid: V.jobs.filter(function (j) { return j.paid; }),
        offers: (V.offers || []).filter(function (o) { return o.state === 'open'; })
    };
};

// alerts: "new" until the inspector opens the bell and taps Mark all as read (kept in this browser)
V.alertsNew = function () { var seen = V.store('vign-ins-alerts-seen') || 0; return Math.max(0, (V.alerts || []).length - seen); };

// ---------- shell ----------
var MENU = [
    ['Main'],
    ['command', 'command.html', 'fa-gauge-high', 'Dashboard'],
    ['offers', 'offers.html', 'fa-bullhorn', 'New Offers', 'offers'],
    ['openjobs', 'openjobsdetail.html', 'fa-briefcase', 'Open Jobs', 'open'],
    ['due5', 'dueinsdaysdetail.html', 'fa-calendar-day', 'Due in 5 Days', 'due5'],
    ['results', 'results.html', 'fa-file-circle-check', 'My Reports', 'returned'],
    ['Field work'],
    ['upload', 'uploadphoto.html', 'fa-camera', 'Upload Photo'],
    ['Money'],
    ['commissions', 'commissions.html', 'fa-sack-dollar', 'Commissions Owed'],
    ['payments', 'payments.html', 'fa-money-check-dollar', 'Payments Received']
];   // Settings is in the account menu (your name, top right), same as the Staff Office and Client portal

V.shell = function () {
    var saved = V.store('vign-ins-settings'); if (saved) { if (saved.name) V.me.name = saved.name; if (saved.area) V.me.area = saved.area; }
    var page = document.body.dataset.page, c = V.counts();
    var nav = MENU.map(function (m) {
        if (m.length === 1) return '<div class="sb-label">' + m[0] + '</div>';
        var n = m[4] ? c[m[4]].length : 0;
        var cnt = n ? '<span class="cnt' + (m[4] === 'returned' || m[4] === 'offers' ? ' red' : '') + '">' + n + '</span>' : '';
        return '<a class="sb-link' + (m[0] === page ? ' on" aria-current="page' : '') + '" href="' + m[1] + '"><i class="fa-solid ' + m[2] + '"></i>' + m[3] + cnt + '</a>';
    }).join('');
    var initials = V.me.name.split(' ').map(function (p) { return p[0]; }).join('');

    document.body.insertAdjacentHTML('afterbegin',
        '<aside class="sb" id="sb"><a class="sb-brand" href="command.html"><img src="../images/vign-mark.png" alt="VignUSA.com"><span>Inspector<br>Portal</span></a>' +
        '<nav class="sb-nav" aria-label="Inspector menu">' + nav + '</nav>' +
        '<div class="sb-foot">Need help? Call the office<br><a href="tel:' + V.me.tel + '"><i class="fa-solid fa-phone"></i> ' + V.me.phone + '</a></div>' +
        '<a class="sb-link sb-out" href="index.html"><i class="fa-solid fa-right-from-bracket"></i>Log out</a></aside>' +
        '<div class="sb-backdrop" id="sbBack"></div>' +
        '<header class="top"><button class="top-burger" id="burger" aria-label="Open menu"><i class="fa-solid fa-bars"></i></button>' +
        '<div class="top-search"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="q" placeholder="Search job #, address or client..." autocomplete="off"><div class="top-results" id="qr"></div></div>' +
        '<div class="top-right"><div class="top-bell"><button type="button" class="top-icon" id="bellBtn" aria-haspopup="true" aria-expanded="false" aria-label="Alerts"><i class="fa-regular fa-bell"></i><span class="bell-n" id="bellN"></span></button>' +
        '<div class="bell-menu" id="bellMenu"><div class="bell-h"><b>Alerts</b><button type="button" class="bell-read" id="bellRead">Mark all as read</button></div><ul class="alerts bell-list">' +
        (V.alerts || []).map(function (a, i) { return '<li data-i="' + i + '"><span class="ic ' + a[0] + '"><i class="fa-solid ' + a[1] + '"></i></span><span><a href="' + a[4] + '"><b>' + V.esc(a[2]) + '</b></a><small>' + V.esc(a[3]) + '</small></span></li>'; }).join('') +
        '</ul><a class="bell-all" href="command.html#alerts">See all on the Dashboard <i class="fa-solid fa-arrow-right"></i></a></div></div>' +
        '<div class="top-acct"><button type="button" class="top-user" id="acctBtn" aria-haspopup="menu" aria-expanded="false" title="My account"><span><b>' + V.esc(V.me.name) + '</b><small>' + V.me.id + ' · ' + V.esc(V.me.area) + '</small></span><span class="av">' + initials + '</span><i class="fa-solid fa-chevron-down caret"></i></button>' +
        '<div class="acct-menu" id="acctMenu" role="menu"><div class="acct-h"><b>' + V.esc(V.me.name) + '</b><small>' + V.me.id + ' · Inspector</small></div>' +
        '<a role="menuitem" href="settings.html"' + (page === 'settings' ? ' class="on" aria-current="page"' : '') + '><i class="fa-solid fa-gear"></i> Settings</a><a role="menuitem" href="payments.html"><i class="fa-solid fa-money-check-dollar"></i> My payments</a>' +
        '<a role="menuitem" href="tel:' + V.me.tel + '"><i class="fa-solid fa-phone"></i> Call the office</a><a role="menuitem" class="out" href="index.html"><i class="fa-solid fa-right-from-bracket"></i> Log out</a></div></div></div></header>');
    document.body.insertAdjacentHTML('beforeend', '<div class="ps-demo">Preview · sample data · <a href="../index.html">website</a></div>');

    // bell: dropdown of the alerts
    var bb = V.$('#bellBtn'), bm = V.$('#bellMenu');
    function bellDraw() { var n = V.alertsNew(), el = V.$('#bellN'); el.textContent = n; el.hidden = !n; bb.setAttribute('aria-label', n ? 'Alerts, ' + n + ' new' : 'Alerts');
        V.$$('.bell-list li').forEach(function (li) { li.classList.toggle('new', +li.dataset.i < n); }); V.$('#bellRead').hidden = !n;
        var c = V.$('#alertsNew'); if (c) c.textContent = n ? n + ' new' : 'All read'; }
    bellDraw();
    bb.addEventListener('click', function (e) { e.stopPropagation(); V.$('#acctMenu').classList.remove('open'); var o = bm.classList.toggle('open'); bb.setAttribute('aria-expanded', o); });
    V.$('#bellRead').addEventListener('click', function (e) { e.stopPropagation(); V.store('vign-ins-alerts-seen', (V.alerts || []).length); bellDraw(); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.top-bell')) { bm.classList.remove('open'); bb.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { bm.classList.remove('open'); bb.setAttribute('aria-expanded', 'false'); } });

    // account menu on the name chip
    var ab = V.$('#acctBtn'), am = V.$('#acctMenu');
    ab.addEventListener('click', function (e) { e.stopPropagation(); bm.classList.remove('open'); var o = am.classList.toggle('open'); ab.setAttribute('aria-expanded', o); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.top-acct')) { am.classList.remove('open'); ab.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { am.classList.remove('open'); ab.setAttribute('aria-expanded', 'false'); } });

    // mobile sidebar
    V.$('#burger').addEventListener('click', function () { document.body.classList.add('sb-open'); });
    V.$('#sbBack').addEventListener('click', function () { document.body.classList.remove('sb-open'); });

    // top search (SMK ps/ajax_search)
    var q = V.$('#q'), qr = V.$('#qr');
    q.addEventListener('input', function () {
        var t = q.value.trim().toLowerCase();
        if (t.length < 2) { qr.classList.remove('open'); return; }
        var hits = V.jobs.filter(function (j) { return (j.id + ' ' + j.addr + ' ' + j.city + ' ' + j.client + ' ' + j.ref).toLowerCase().indexOf(t) > -1; }).slice(0, 6);
        qr.innerHTML = hits.length ? hits.map(function (j) { return '<a href="fulljobstatus.html?job=' + j.id + '"><b>' + j.id + '</b> · ' + V.esc(j.addr) + '<small>' + V.esc(j.client) + ' · ' + V.status[j.status][0] + '</small></a>'; }).join('') : '<a>No matching jobs</a>';
        qr.classList.add('open');
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.top-search')) qr.classList.remove('open'); });
};

// Page header band: VIGN.band(icon, title, subtitle, actionsHtml)
V.band = function (icon, title, sub, actions) {
    return '<div class="band"><div><h1><i class="fa-solid ' + icon + '"></i>' + V.esc(title) + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' +
        (actions ? '<div class="band-actions">' + actions + '</div>' : '') + '</div>';
};
V.stat = function (cls, icon, val, label, href) {
    var tag = href ? 'a href="' + href + '"' : 'div';
    return '<' + tag + ' class="stat"><span class="ic ' + cls + '"><i class="fa-solid ' + icon + '"></i></span><span><b>' + val + '</b><span>' + label + '</span></span>' + (href ? '<i class="fa-solid fa-arrow-up-right-from-square go"></i>' : '') + '</' + (href ? 'a' : 'div') + '>';
};

/* ---------- Small DataTable (SMK uses jQuery DataTables) ----------
   V.table(el, { cols: [{k,label,sort,render,cls}], rows, search: fn(row)->text, show: 10, foot: fn(rows)->html, toolbar: html }) */
V.table = function (el, o) {
    var st = { q: '', sort: o.sortKey || null, dir: o.sortDir || 1, page: 0, show: o.show || 10 };
    el.innerHTML = '<div class="toolbar"><div class="tb-search"><i class="fa-solid fa-magnifying-glass"></i><input type="search" placeholder="Search..." data-q></div>' + (o.toolbar || '') +
        '<div class="tb-right">Show <select class="tb-select" data-show><option>10</option><option>25</option><option>100</option></select></div></div>' +
        '<div class="tbl-wrap"><table class="tbl cards"><thead><tr>' + o.cols.map(function (c) { return '<th' + (c.sort !== false ? ' data-sort="' + c.k + '"' : '') + (c.cls ? ' class="' + c.cls + '"' : '') + '>' + c.label + '</th>'; }).join('') + '</tr></thead><tbody></tbody><tfoot></tfoot></table></div>' +
        '<div class="tbl-foot"><span data-info></span><div class="pager" data-pager></div></div>';
    var tb = V.$('tbody', el), tf = V.$('tfoot', el);
    V.$('[data-q]', el).addEventListener('input', function (e) { st.q = e.target.value.toLowerCase(); st.page = 0; draw(); });
    V.$('[data-show]', el).addEventListener('change', function (e) { st.show = +e.target.value; st.page = 0; draw(); });
    V.$$('th[data-sort]', el).forEach(function (th) {
        th.addEventListener('click', function () { var k = th.dataset.sort; st.dir = st.sort === k ? -st.dir : 1; st.sort = k; draw(); });
    });
    function rows() {
        var r = (typeof o.rows === 'function' ? o.rows() : o.rows).filter(function (x) { return !st.q || o.search(x).toLowerCase().indexOf(st.q) > -1; });
        if (st.sort) { var col = o.cols.filter(function (c) { return c.k === st.sort; })[0], key = col.sortVal || function (x) { return x[st.sort]; };
            r.sort(function (a, b) { var x = key(a), y = key(b); return (x > y ? 1 : x < y ? -1 : 0) * st.dir; }); }
        return r;
    }
    function draw() {
        var all = rows(), pages = Math.max(1, Math.ceil(all.length / st.show));
        st.page = Math.min(st.page, pages - 1);
        var part = all.slice(st.page * st.show, st.page * st.show + st.show);
        tb.innerHTML = part.length ? part.map(function (x) { return '<tr>' + o.cols.map(function (c) { return '<td data-l="' + c.label + '"' + (c.cls ? ' class="' + c.cls + '"' : '') + '>' + c.render(x) + '</td>'; }).join('') + '</tr>'; }).join('')
            : '<tr><td colspan="' + o.cols.length + '" class="empty">No records found</td></tr>';
        tf.innerHTML = o.foot && all.length ? o.foot(all) : '';
        V.$$('th[data-sort]', el).forEach(function (th) { th.classList.toggle('asc', th.dataset.sort === st.sort && st.dir === 1); th.classList.toggle('desc', th.dataset.sort === st.sort && st.dir === -1); });
        V.$('[data-info]', el).textContent = 'Showing ' + (all.length ? st.page * st.show + 1 : 0) + '–' + (st.page * st.show + part.length) + ' of ' + all.length + ' records';
        var p = '<button data-p="' + (st.page - 1) + '"' + (st.page === 0 ? ' disabled' : '') + '>‹</button>';
        for (var i = 0; i < pages; i++) p += '<button data-p="' + i + '"' + (i === st.page ? ' class="on"' : '') + '>' + (i + 1) + '</button>';
        p += '<button data-p="' + (st.page + 1) + '"' + (st.page >= pages - 1 ? ' disabled' : '') + '>›</button>';
        V.$('[data-pager]', el).innerHTML = p;
        V.$$('[data-p]', el).forEach(function (b) { b.addEventListener('click', function () { st.page = +b.dataset.p; draw(); }); });
    }
    draw();
    return { redraw: draw };
};

/* Job list table used by Open Jobs and Due in N Days (SMK openjobsdetail / dueinsdaysdetail) */
V.jobTable = function (el, rowsFn, toolbar) {
    return V.table(el, {
        rows: rowsFn, toolbar: toolbar, sortKey: 'due',
        search: function (j) { return j.id + ' ' + j.addr + ' ' + j.city + ' ' + j.client + ' ' + j.ref + ' ' + V.services[j.svc][0]; },
        cols: [
            { k: 'id', label: 'Job #', render: function (j) { return '<a href="fulljobstatus.html?job=' + j.id + '"><b>' + j.id + '</b></a><small>' + V.esc(j.ref) + '</small>'; } },
            { k: 'svc', label: 'Service', render: function (j) { return V.svc(j) + '<small>' + V.esc(V.forms[j.form].title) + '</small>'; } },
            { k: 'addr', label: 'Address', render: function (j) { return V.esc(j.addr) + '<small>' + V.esc(j.city) + ' · ' + j.mi + ' mi</small>'; } },
            { k: 'client', label: 'Client', render: function (j) { return V.esc(j.client); } },
            { k: 'due', label: 'Due Date', render: function (j) { return V.day(j.due) + '<small>' + V.pill(V.due(j.due)) + '</small>'; } },
            { k: 'win', label: 'Time Window', render: function (j) { return V.esc(j.win); } },
            { k: 'fee', label: 'Fee <span class=\"samp\">sample</span>', cls: 'r', render: function (j) { return V.money(j.fee); } },
            { k: 'go', label: '', sort: false, render: function (j) { return '<a class="lnk-btn" href="fulljobstatus.html?job=' + j.id + '">Go to job <i class="fa-solid fa-arrow-right"></i></a>'; } }
        ]
    });
};

/* Period filter used by Commissions / Payments (SMK: All Dates, Previous Day, ... Year to Date) */
V.periods = [
    ['all', 'All Dates'], ['pday', 'Previous Day'], ['pweek', 'Previous Week'], ['pmonth', 'Previous Month'],
    ['cmonth', 'Current Month'], ['mtd', 'Month to Date'], ['qtd', 'Quarter to Date'], ['ytd', 'Year to Date']
];
V.inPeriod = function (off, p) {
    var d = V.date(off), now = V.date(0), y = now.getFullYear(), m = now.getMonth();
    switch (p) {
        case 'pday': return off === -1;
        case 'pweek': return off >= -7 && off < 0;
        case 'pmonth': return d.getFullYear() === (m ? y : y - 1) && d.getMonth() === (m ? m - 1 : 11);
        case 'cmonth': case 'mtd': return d.getFullYear() === y && d.getMonth() === m;
        case 'qtd': return d.getFullYear() === y && Math.floor(d.getMonth() / 3) === Math.floor(m / 3);
        case 'ytd': return d.getFullYear() === y;
        default: return true;
    }
};

// ---------- start ----------
document.addEventListener('DOMContentLoaded', function () {
    if (document.body.dataset.shell !== 'none') V.shell();
    if (typeof V.init === 'function') V.init();
});
})(window.VIGN);
