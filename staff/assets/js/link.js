/* =========================================================
   VIGN Staff Office: shared shell, same roles as SMK Flow
     includes/smui_top.php    -> header: logo, Find (Ctrl K), New job (type it in / Import),
                                 the places that wait on a person (Review, Chase, Alerts), your menu
     includes/smui_nav_v2.php -> sidebar: Work / Money / Setup
   plus shared helpers (lookups, status, table with checkboxes, modal, toast).
   A page sets <body data-page="..."> and defines VS.init().
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
V.dayShort = function (off) { return V.date(off).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
V.iso = function (off) { var d = V.date(off), p = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };
V.fromIso = function (s) { if (!s) return null; return Math.round((new Date(s + 'T12:00:00') - V.date(0)) / 864e5); };
V.money = function (n) { return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
V.client = function (id) { return V.clients.filter(function (c) { return c.id === id; })[0] || { name: '?' }; };
V.ins = function (id) { return V.inspectors.filter(function (i) { return i.id === id; })[0] || null; };
V.job = function (id) { return V.jobs.filter(function (j) { return j.id === id; })[0] || null; };
// invoices (shared with the Admin Menu)
V.inv = function (id) { return V.invoices.filter(function (i) { return i.id === id; })[0] || null; };
V.invBal = function (i) { return Math.max(0, i.amount - i.paid); };
V.invLate = function (i) { return V.invBal(i) > 0 && i.due < 0 ? -i.due : 0; };
V.invPill = function (i) { if (!V.invBal(i)) return V.pill('Paid', 'st-paid'); if (V.invLate(i)) return V.pill(V.invLate(i) + ' days past due', 'due-late'); return V.pill(i.paid ? 'Part paid' : 'Open', 'st-invoiced'); };
V.owedBy = function (cid) { return V.invoices.filter(function (i) { return i.client === cid; }).reduce(function (t, i) { return t + V.invBal(i); }, 0); };
V.payInv = function (i, amt, how, ref) {
    amt = Math.min(amt, V.invBal(i)); if (amt <= 0) return 0;
    i.paid += amt; V.payments.unshift({ id: 'PAY-' + (900 + V.payments.length), on: 0, inv: i.id, client: i.client, amount: amt, how: how, ref: ref || '' });
    if (!V.invBal(i)) V.jobs.forEach(function (j) { if (j.inv === i.id && j.status === 'invoiced') { j.status = 'paid'; j.payDate = 0; j.payHow = how; } });
    return amt;
};
V.sum = function (a, k) { return a.reduce(function (t, j) { return t + (j[k || 'price'] || 0); }, 0); };
V.open = function (j) { return j.status === 'new' || j.status === 'assigned' || j.status === 'in_field' || j.status === 'returned'; };
V.late = function (j) { return V.open(j) && j.due < 0; };
V.STATUS = {
    new: ['New', 'st-new', 'fa-inbox'], assigned: ['Assigned', 'st-assigned', 'fa-user-check'], in_field: ['In field', 'st-field', 'fa-person-walking'],
    submitted: ['Submitted', 'st-submitted', 'fa-paper-plane'], returned: ['Sent back', 'st-returned', 'fa-rotate-left'],
    approved: ['Delivered', 'st-approved', 'fa-circle-check'], invoiced: ['Invoiced', 'st-invoiced', 'fa-file-invoice-dollar'], paid: ['Paid', 'st-paid', 'fa-money-bill-wave']
};
V.pill = function (txt, cls) { return '<span class="pill ' + cls + '">' + V.esc(txt) + '</span>'; };
V.stPill = function (j) { var s = V.STATUS[j.status]; return V.pill(s[0], s[1]); };
V.svc = function (j) { var s = V.services[j.svc]; return '<span class="svc"><i class="fa-solid ' + s[1] + '"></i>' + V.esc(s[0]) + '</span>'; };
V.dueTxt = function (j) {
    if (!V.open(j)) return V.day(j.due);
    var d = j.due, t = d < 0 ? (d === -1 ? 'Overdue 1 day' : 'Overdue ' + (-d) + ' days') : d === 0 ? 'Due today' : d === 1 ? 'Tomorrow' : 'In ' + d + ' days';
    return V.day(d) + '<small>' + V.pill(t, d < 0 ? 'due-late' : d === 0 ? 'due-today' : d <= 2 ? 'due-soon' : 'due-later') + '</small>';
};
V.score = function (j) { if (!j.answers) return null; var t = 0, c = 0; j.answers.forEach(function (a) { if (V.points[a] != null) { t += V.points[a]; c++; } }); return c ? Math.round(t / c) : null; };
V.scoreCls = function (s) { return s >= 85 ? 'r1' : s >= 65 ? 'r2' : s >= 40 ? 'r3' : 'r4'; };
V.scorePill = function (j) { var s = V.score(j); return s == null ? '–' : '<span class="score rate ' + V.scoreCls(s) + '">' + s + '</span>'; };
V.insName = function (j) { var i = V.ins(j.ins); return i ? V.esc(i.name) : '<span class="unassigned">Unassigned</span>'; };
V.toast = function (msg) {
    var t = V.$('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 2800);
};

// The checks a submitted report goes through before a person approves it (SMK flow_review checks)
V.checks = function (j) {
    var f = V.forms[j.form][1], out = [];
    var unrated = j.answers.filter(function (a) { return !a; }).length;
    out.push([unrated === 0, 'Every item is rated (' + f.length + ' of ' + f.length + ')']);
    var miss = []; j.answers.forEach(function (a, i) { if ((a === '3' || a === '4') && !j.photo[i]) miss.push(i + 1); });
    out.push([!miss.length, miss.length ? 'No photo on item ' + miss.join(', ') + ' (rated 3 or 4)' : 'Every item rated 3 or 4 has a photo']);
    out.push([j.gps < 150, j.gps < 150 ? 'Photos taken at the address (' + V.dist(j.gps) + ' away)' : 'Photos taken ' + V.dist(j.gps) + ' from the address']);
    out.push([j.sent <= j.due, j.sent <= j.due ? 'Sent in on time' : 'Sent in ' + (j.sent - j.due) + ' day(s) late']);
    var urgent = j.answers.filter(function (a) { return a === '4'; }).length;
    out.push([!urgent, urgent ? urgent + ' urgent safety item(s): tell the client today' : 'No urgent safety items']);
    return out;
};
// distance for US users: feet when close, miles when far (the data keeps meters)
V.dist = function (m) { var ft = Math.round(m * 3.28084); return ft < 1000 ? ft + ' ft' : (m / 1609.34).toFixed(1) + ' miles'; };
V.clean = function (j) { return V.checks(j).every(function (c) { return c[0]; }); };

/* ---------- R-14 what this staff account may see (set by an admin in Admin Menu > Admins & Staff) ----------
   Preview: read from the preview database in this browser; the sample default for Jenny Park is
   billing off, inspector pay off, clients & rates on, documents off. Real system: the server sends
   only the allowed areas and blocks the rest (a hidden link is not security). */
V.perms = (function () {
    var p = { billing: false, pay: false, rates: true, docs: false };
    try {
        var d = JSON.parse(localStorage.getItem('vign-db') || 'null'), u = d && d.tables && d.tables.users;
        var me = u && u.filter(function (x) { return !x._del && String(x.email).toLowerCase() === String(V.me.email).toLowerCase(); })[0];
        if (me) { var all = me.role === 'Admin'; ['billing', 'pay', 'rates', 'docs'].forEach(function (k) { p[k] = all || me[k] === 'Yes'; }); p.off = me.active === 'No'; }
    } catch (e) {}
    return p;
})();
V.can = function (k) { return !k || !!V.perms[k]; };
V.PERMNAME = { billing: 'Billing (invoices, payments, aging)', pay: 'Inspector Pay', rates: 'Clients & rates', docs: 'Documents' };
V.locked = function (k) {
    return '<div class="card2" style="margin-top:24px;padding:40px 24px;text-align:center"><i class="fa-solid fa-lock" style="font-size:2.2rem;color:var(--r)"></i>' +
        '<h2 style="margin:12px 0 6px">' + V.esc(V.PERMNAME[k] || 'This area') + ' is turned off for your account</h2>' +
        '<p class="muted" style="max-width:520px;margin:0 auto">Only a VIGN admin can turn it on (Admin Menu &rsaquo; Admins &amp; Staff). Ask your admin if you need it.</p>' +
        '<a class="btn btn-primary btn-sm" style="margin-top:16px" href="command.html">Back to Home</a></div>';
};

// ---------- client messages: kept in this browser so replies stay after a reload ----------
V.SETKEY = 'vign-staff-settings';
V.prefs = (function () { try { return JSON.parse(localStorage.getItem('vign-staff-settings') || 'null') || {}; } catch (e) { return {}; } })();
if (V.prefs.name) V.me.name = V.prefs.name; if (V.prefs.phone) V.me.phone = V.prefs.phone;
V.MSGKEY = 'vign-staff-msgs';
V.loadMsgs = function () {
    if (V._msgsLoaded) return V.threads; V._msgsLoaded = true;
    try { var s = JSON.parse(localStorage.getItem(V.MSGKEY) || 'null'); if (s && s.threads) { V.threads = s.threads; V.readMsgs = s.read || {}; } } catch (e) {}
    V.readMsgs = V.readMsgs || {};
    return V.threads;
};
V.saveMsgs = function () { try { localStorage.setItem(V.MSGKEY, JSON.stringify({ threads: V.threads, read: V.readMsgs })); return true; } catch (e) { return false; } };
V.lastMsg = function (t) { var m = t.msgs.filter(function (x) { return x.from !== 'note'; }); return m[m.length - 1] || t.msgs[t.msgs.length - 1] || { from: 'none', on: 0, at: '', text: 'No messages yet' }; };
// "waiting on us" = the client wrote last and the office has not answered yet
V.isWaiting = function (t) { var m = V.lastMsg(t); return !!m && m.from === 'client'; };
V.waitingMsgs = function () { V.loadMsgs(); return (V.threads || []).filter(V.isWaiting).length; };

// ---------- header + sidebar ----------
var NAV = [
    ['Work'],
    ['home', 'command.html', 'fa-house', 'Home'],
    ['jobs', 'flowjobs.html', 'fa-clipboard-list', 'Jobs'],
    ['clients', 'flowcustomers.html', 'fa-building', 'Clients'],
    ['inspectors', 'flowservers.html', 'fa-user-shield', 'Inspectors'],
    ['docs', 'flowdocs.html', 'fa-folder-open', 'Documents', 'docs'],
    ['Money'],
    ['accounting', 'flowinvoices.html?mode=bycustomer', 'fa-dollar-sign', 'Accounting', 'billing'],
    ['aging', 'flowinvoices.html?mode=bycustomer', 'fa-hand-holding-dollar', 'Aging', 'billing'],
    ['invoices', 'flowinvoices.html?mode=issued', 'fa-file-invoice-dollar', 'Invoices', 'billing'],
    ['payments', 'flowinvoices.html?mode=paid', 'fa-money-check-dollar', 'Payments', 'billing'],
    ['serverpay', 'flowserverpay.html', 'fa-sack-dollar', 'Inspector Pay', 'pay'],
    ['Account'],
    ['settings', 'flowsettings.html', 'fa-gear', 'Settings']
];
V.shell = function () {
    var page = document.body.dataset.page;
    var review = V.jobs.filter(function (j) { return j.status === 'submitted'; }).length;
    var chase = V.jobs.filter(V.late).length;
    var initials = V.me.name.split(' ').map(function (p) { return p[0]; }).join('');
    var waits = [['review', 'flowreview.html', 'fa-list-check', 'Review', review, true], ['chase', 'flowjobs.html?view=late', 'fa-person-running', 'Chase', chase, true]];

    var hdr = '<header class="hdr"><a class="hdr-brand" href="command.html"><img src="../images/vign-mark.png" alt="VignUSA.com"><span>Staff<br>Office</span></a>' +
        '<button class="top-burger" id="burger" aria-label="Open menu"><i class="fa-solid fa-bars"></i></button>' +
        '<div class="top-search"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="q" placeholder="Find a job, address, client..." autocomplete="off"><span class="kbd">Ctrl K</span><div class="top-results" id="qr"></div></div>' +
        // one bell for everything waiting on you: Review + Chase + Alerts (New job is on Home and Jobs)
        '<nav class="waits" aria-label="Notifications"><div class="dd" id="ddAlert"><button class="wait" data-dd="ddAlert" title="Notifications" aria-label="Notifications, ' + (review + chase) + ' waiting"><i class="fa-regular fa-bell"></i><span class="t">Notifications</span><span class="n' + (review + chase ? ' hot' : '') + '">' + (review + chase) + '</span></button>' +
        '<div class="dd-menu right nt-menu"><div class="nt-h">Waiting on you</div>' + waits.map(function (w) {
            var on = w[0] === page || (page === 'jobs' && w[0] === 'chase' && V.param('view') === 'late');
            return '<a href="' + w[1] + '"' + (on ? ' class="on"' : '') + '><i class="fa-solid ' + w[2] + '"></i><span>' + (w[0] === 'review' ? 'Reports to review' : 'Late jobs to chase') + '<small>' + (w[0] === 'review' ? 'Approve or send back' : 'Need a new date or a new inspector') + '</small></span><b class="nt-n' + (w[4] ? ' hot' : '') + '">' + w[4] + '</b></a>';
        }).join('') + '<div class="nt-h">Alerts</div>' + V.alerts.map(function (a) {
            var href = a[3] === 'chase' ? 'flowjobs.html?view=late' : a[3] === 'review' ? 'flowreview.html' : 'flowimport.html';
            return '<a href="' + href + '"><i class="fa-solid ' + a[1] + '" style="color:var(--' + (a[0] === 'red' ? 'r' : a[0] === 'amber' ? 'a' : a[0] === 'green' ? 'g' : 'blue') + ')"></i><span>' + V.esc(a[2]) + '</span></a>';
        }).join('') + '</div></div></nav>' +
        '<div class="dd" id="ddMe"><button class="top-user" data-dd="ddMe" style="background:#fff;cursor:pointer;font:inherit"><span><b>' + V.esc(V.me.name) + '</b><small>' + V.esc(V.me.role) + '</small></span><span class="av">' + initials + '</span></button>' +
        '<div class="dd-menu right"><div class="dd-who"><b>' + V.esc(V.me.name) + '</b><small>' + V.esc(V.me.email) + '</small></div><a href="flowsettings.html"><i class="fa-solid fa-gear"></i><span>Settings</span></a><hr><a href="index.html" class="dd-out"><i class="fa-solid fa-right-from-bracket"></i><span>Log out</span></a></div></div></header>';

    // hide what the admin has not turned on; drop a heading that has nothing under it
    var nav = NAV.filter(function (m) { return m.length === 1 || V.can(m[4]); }).filter(function (m, i, a) { return m.length > 1 || (a[i + 1] && a[i + 1].length > 1); });
    var off = ['billing', 'pay', 'docs'].filter(function (k) { return !V.can(k); }).map(function (k) { return V.PERMNAME[k].replace(/ \(.*/, ''); });
    var sb = '<aside class="sb" id="sb"><nav class="sb-nav" aria-label="Staff menu">' + nav.map(function (m) {
        if (m.length === 1) return '<div class="sb-label">' + m[0] + '</div>';
        var on = m[0] === page || (page === 'invoices-' + (V.param('mode') || '') && false);
        if (page === 'acct') { var mode = V.param('mode') || 'bycustomer'; on = (m[0] === 'aging' && mode === 'bycustomer') || (m[0] === 'invoices' && mode === 'issued') || (m[0] === 'payments' && mode === 'paid'); }
        if (page === 'jobdetail' && m[0] === 'jobs') on = true;
        if ((page === 'addjob' || page === 'import') && m[0] === 'jobs') on = true;
        var cnt = m[0] === 'messages' ? V.waitingMsgs() : 0;
        return '<a class="sb-link' + (on ? ' on" aria-current="page' : '') + '" href="' + m[1] + '"><i class="fa-solid ' + m[2] + '"></i>' + m[3] + (cnt ? '<span class="sb-n" title="Waiting for an answer">' + cnt + '</span>' : '') + '</a>';
    }).join('') + '</nav><div class="sb-foot"><i class="fa-solid fa-lock"></i> Staff account. ' + (off.length ? 'Turned off for you: ' + V.esc(off.join(', ')) + '. ' : '') + 'Billing plans, cards, rates, users and settings are set by the admin.</div></aside><div class="sb-backdrop" id="sbBack"></div>';

    document.body.insertAdjacentHTML('afterbegin', hdr + sb);
    document.body.insertAdjacentHTML('beforeend', '<div class="ps-demo">Preview · sample data · <a href="../index.html">website</a></div>');

    // dropdowns
    V.$$('[data-dd]').forEach(function (b) {
        b.addEventListener('click', function (e) { e.stopPropagation(); var d = V.$('#' + b.dataset.dd), was = d.classList.contains('open'); V.$$('.dd').forEach(function (x) { x.classList.remove('open'); }); if (!was) d.classList.add('open'); });
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.dd')) V.$$('.dd').forEach(function (x) { x.classList.remove('open'); }); if (!e.target.closest('.top-search')) V.$('#qr').classList.remove('open'); });
    V.$('#burger').addEventListener('click', function () { document.body.classList.add('sb-open'); });
    V.$('#sbBack').addEventListener('click', function () { document.body.classList.remove('sb-open'); });

    // Find (Ctrl K) searches the jobs list
    var q = V.$('#q'), qr = V.$('#qr');
    document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); q.focus(); } });
    q.addEventListener('input', function () {
        var t = q.value.trim().toLowerCase();
        if (t.length < 2) { qr.classList.remove('open'); return; }
        var hits = V.jobs.filter(function (j) { return (j.id + ' ' + j.addr + ' ' + j.city + ' ' + V.client(j.client).name + ' ' + j.ref + ' ' + (V.ins(j.ins) || {}).name).toLowerCase().indexOf(t) > -1; }).slice(0, 7);
        qr.innerHTML = hits.length ? hits.map(function (j) { return '<a href="flowjob.html?job=' + j.id + '"><b>' + j.id + '</b> · ' + V.esc(j.addr) + '<small>' + V.esc(V.client(j.client).name) + ' · ' + V.STATUS[j.status][0] + '</small></a>'; }).join('') : '<a>No matching jobs</a>';
        qr.classList.add('open');
    });
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter' && q.value.trim()) location.href = 'flowjobs.html?q=' + encodeURIComponent(q.value.trim()); });
};

V.band = function (icon, title, sub, actions) {
    return '<div class="band"><div><h1><i class="fa-solid ' + icon + '"></i>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (actions ? '<div class="band-actions">' + actions + '</div>' : '') + '</div>';
};

V.stat = function (cls, icon, val, label, href) {
    var tag = href ? 'a href="' + href + '"' : 'div';
    return '<' + tag + ' class="stat"><span class="ic ' + cls + '"><i class="fa-solid ' + icon + '"></i></span><span><b>' + val + '</b><span>' + label + '</span></span>' + (href ? '<i class="fa-solid fa-arrow-up-right-from-square go"></i>' : '') + '</' + (href ? 'a' : 'div') + '>';
};
V.card = function (title, right, body, flush) {
    return '<div class="card2"><div class="card2-h"><h3>' + title + '</h3>' + (right ? '<span class="muted">' + right + '</span>' : '') + '</div>' + (flush ? body : '<div class="card2-b">' + body + '</div>') + '</div>';
};

/* ---------- table (SMK uses DataTables) ----------
   V.table(el, { cols:[{k,label,render,cls,sort,sortVal}], rows:fn, search:fn, select:true, onSelect:fn(ids), sortKey, sortDir, show, foot:fn, info:'records' }) */
V.table = function (el, o) {
    var st = { q: '', sort: o.sortKey || null, dir: o.sortDir || 1, page: 0, show: +V.prefs.rows || o.show || 25 }; // the choice in Settings wins
    el.innerHTML = '<div class="toolbar"><div class="tb-search"><i class="fa-solid fa-magnifying-glass"></i><input type="search" placeholder="Search this list..." data-q></div>' + (o.toolbar || '') +
        '<div class="tb-right">Show <select class="tb-select" data-show>' + [10, 25, 50, 100].map(function (n) { return '<option' + (n === st.show ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></div></div>' +
        '<div class="tbl-wrap"><table class="tbl cards"><thead><tr>' + (o.select ? '<th style="width:34px"><input type="checkbox" data-all aria-label="Select all"></th>' : '') +
        o.cols.map(function (c) { return '<th' + (c.sort !== false ? ' data-sort="' + c.k + '"' : '') + (c.cls ? ' class="' + c.cls + '"' : '') + '>' + c.label + '</th>'; }).join('') +
        '</tr></thead><tbody></tbody><tfoot></tfoot></table></div><div class="tbl-foot"><span data-info></span><div class="pager" data-pager></div></div>';
    var tb = V.$('tbody', el);
    V.$('[data-q]', el).addEventListener('input', function (e) { st.q = e.target.value.toLowerCase(); st.page = 0; draw(); });
    V.$('[data-show]', el).addEventListener('change', function (e) { st.show = +e.target.value; st.page = 0; draw(); });
    V.$$('th[data-sort]', el).forEach(function (th) { th.addEventListener('click', function () { var k = th.dataset.sort; st.dir = st.sort === k ? -st.dir : 1; st.sort = k; draw(); }); });
    if (o.select) V.$('[data-all]', el).addEventListener('change', function (e) { V.$$('tbody [data-id]', el).forEach(function (c) { c.checked = e.target.checked; }); fire(); });
    function fire() { if (o.onSelect) o.onSelect(V.$$('tbody [data-id]:checked', el).map(function (c) { return c.dataset.id; })); }
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
            return '<tr>' + (o.select ? '<td class="ck"><input type="checkbox" data-id="' + V.esc(x.id) + '" aria-label="Select"></td>' : '') + o.cols.map(function (c) { var l = c.label.replace(/<[^>]*>/g, ''); return '<td' + (l ? ' data-l="' + l + '"' : '') + (c.cls ? ' class="' + c.cls + '"' : '') + '>' + c.render(x) + '</td>'; }).join('') + '</tr>';
        }).join('') : '<tr><td colspan="' + (o.cols.length + (o.select ? 1 : 0)) + '" class="empty">No records found</td></tr>';
        V.$('tfoot', el).innerHTML = o.foot && all.length ? o.foot(all) : '';
        if (o.select) { V.$('[data-all]', el).checked = false; V.$$('tbody [data-id]', el).forEach(function (c) { c.addEventListener('change', fire); }); fire(); }
        V.$$('th[data-sort]', el).forEach(function (th) { th.classList.toggle('asc', th.dataset.sort === st.sort && st.dir === 1); th.classList.toggle('desc', th.dataset.sort === st.sort && st.dir === -1); });
        V.$('[data-info]', el).textContent = 'Showing ' + (all.length ? st.page * st.show + 1 : 0) + '–' + (st.page * st.show + part.length) + ' of ' + all.length + ' ' + (o.info || 'records');
        var p = '<button data-p="' + (st.page - 1) + '"' + (st.page === 0 ? ' disabled' : '') + '>‹</button>';
        for (var i = 0; i < pages; i++) p += '<button data-p="' + i + '"' + (i === st.page ? ' class="on"' : '') + '>' + (i + 1) + '</button>';
        p += '<button data-p="' + (st.page + 1) + '"' + (st.page >= pages - 1 ? ' disabled' : '') + '>›</button>';
        V.$('[data-pager]', el).innerHTML = p;
        V.$$('[data-p]', el).forEach(function (b) { b.addEventListener('click', function () { st.page = +b.dataset.p; draw(); }); });
    }
    draw();
    return { redraw: draw };
};

// ---------- modal ----------
V.modal = function (title, body, buttons, onOpen) {
    var m = V.$('#vsModal');
    if (!m) { m = document.createElement('div'); m.id = 'vsModal'; m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); document.body.appendChild(m); }
    m.innerHTML = '<div class="modal-box" style="background:#fff;max-width:560px"><div class="modal-h"><h2>' + title + '</h2><button class="modal-x" data-x aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div><div class="modal-b2">' + body + '</div>' +
        '<div class="modal-f"><button class="btn btn-ghost btn-sm" data-x>Cancel</button>' + (buttons || '') + '</div></div>';
    m.classList.add('open');
    V.$$('[data-x]', m).forEach(function (b) { b.addEventListener('click', function () { m.classList.remove('open'); }); });
    if (onOpen) onOpen(m, function () { m.classList.remove('open'); });
};

// Assign / reassign inspector (used on Jobs and the job page)
V.assign = function (ids, done) {
    var jobs = ids.map(V.job), shop = jobs.some(function (j) { return j.svc === 'mystery' || j.svc === 'cx'; });
    var list = V.inspectors.filter(function (i) { return i.active; }).map(function (i) {
        var load = V.jobs.filter(function (j) { return j.ins === i.id && V.open(j); }).length;
        var fits = shop ? i.role !== 'Inspector' : i.role !== 'Mystery Shopper';
        return '<label class="pick-row" style="display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line-2);border-radius:10px;padding:10px 12px;cursor:pointer;' + (fits ? '' : 'opacity:.5') + '"><input type="radio" name="ins" value="' + i.id + '"' + (fits ? '' : ' disabled') + ' style="margin-top:4px"><span style="flex:1"><b>' + V.esc(i.name) + '</b> · ' + V.esc(i.role) +
            '<small style="display:block;color:var(--ink-3)">' + V.esc(i.area) + ' · ZIPs ' + V.esc(i.zips) + '</small></span><span style="text-align:right;font-size:.8rem;color:var(--ink-3)">' + load + ' open<br>score ' + i.score + '</span></label>';
    }).join('');
    V.modal('Assign ' + ids.length + ' job' + (ids.length > 1 ? 's' : ''), '<p class="muted small" style="margin:0">' + jobs.map(function (j) { return j.id + ' · ' + V.esc(j.addr); }).join('<br>') + '</p>' + list +
        '<label class="fld">Note to the inspector (optional)<textarea placeholder="Anything they need to know"></textarea></label>',
        '<button class="btn btn-primary btn-sm" data-ok><i class="fa-solid fa-user-check"></i> Assign</button>', function (m, close) {
            V.$('[data-ok]', m).addEventListener('click', function () {
                var r = V.$('input[name=ins]:checked', m); if (!r) { V.toast('Pick an inspector first.'); return; }
                jobs.forEach(function (j) { j.ins = r.value; if (j.status === 'new') j.status = 'assigned'; });
                close(); V.toast(ids.length + ' job(s) assigned to ' + V.ins(r.value).name + ' (preview only).'); if (done) done();
            });
        });
};

/* ---------- LoyalServe way: click the name to edit; click the balance to see that client's invoices ---------- */
// fields: [key, label, type, options]; saves on screen only
V.editPopup = function (title, row, fields, done, extra) {
    var body = fields.map(function (f) {
        var v = row[f[0]] == null ? '' : row[f[0]];
        if (f[2] === 'select') return '<label class="fld">' + f[1] + '<select name="' + f[0] + '">' + f[3].map(function (o) { var val = Array.isArray(o) ? o[0] : o, lbl = Array.isArray(o) ? o[1] : o; return '<option value="' + V.esc(val) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + V.esc(lbl) + '</option>'; }).join('') + '</select></label>';
        return '<label class="fld">' + f[1] + '<input type="' + (f[2] === 'number' ? 'number' : 'text') + '" name="' + f[0] + '" value="' + V.esc(v) + '"></label>';
    }).join('') + (extra || '');
    V.modal(title, '<form data-ef>' + body + '</form>', '<button class="btn btn-primary btn-sm" data-ok><i class="fa-solid fa-floppy-disk"></i> Save</button>', function (m, close) {
        V.$('[data-ok]', m).addEventListener('click', function () {
            fields.forEach(function (f) { var el = V.$('[name="' + f[0] + '"]', m), v = el.value; if (f[2] === 'number') v = +v || 0; if (f[4] === 'bool') v = v === 'true'; row[f[0]] = v; });
            close(); V.toast('Saved (preview only, not stored).'); if (done) done();
        });
    });
};
V.balBox = function (amt, attr) { return '<a href="#" class="balbox ' + (amt > 0 ? 'due' : 'ok') + '" ' + attr + '>' + V.money(amt) + '</a>'; };
// SMK admin showinvoices.php: the client's invoices; click the invoice # to see it; Record payment per open invoice
V.clientInvoices = function (clientId, done) {
    var c = V.client(clientId);
    var list = V.invoices.filter(function (i) { return i.client === clientId; }).sort(function (a, b) { return b.billed - a.billed; });
    var nx = V.nextBills.filter(function (n) { return n.client === clientId; })[0];
    var owed = V.owedBy(clientId);
    var body = '<p style="margin:0">' + V.esc(c.name) + ' owes <b style="color:' + (owed ? 'var(--r)' : 'var(--g)') + '">' + V.money(owed) + '</b> · terms Net ' + c.terms + (nx ? ' · next bill ' + V.day(nx.next) + ' (' + V.money(nx.amount) + ', automatic)' : '') + '</p>' +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Invoice #</th><th>For</th><th>Sent</th><th>Due</th><th class="r">Amount</th><th class="r">Balance</th><th>Status</th><th></th></tr></thead><tbody>' +
        (list.length ? list.map(function (i) {
            return '<tr><td><a href="#" data-iv="' + i.id + '"><b>' + i.id + '</b></a></td><td class="small">' + V.esc(i.period) + '</td><td>' + V.day(i.billed) + '</td><td>' + V.day(i.due) + '</td><td class="r">' + V.money(i.amount) + '</td><td class="r"><b>' + V.money(V.invBal(i)) + '</b></td><td>' + V.invPill(i) + '</td>' +
                '<td>' + (V.invBal(i) ? '<button class="btn btn-primary btn-sm" data-rp="' + i.id + '">Record payment</button>' : '') + '</td></tr>';
        }).join('') : '<tr><td colspan="8" class="empty">No invoices yet</td></tr>') + '</tbody></table></div>';
    V.modal('Invoices for ' + V.esc(c.name), body, '', function (m, close) {
        m.querySelector('.modal-box').style.maxWidth = '900px';
        m.addEventListener('click', function (e) {
            var rp = e.target.closest('[data-rp]');
            if (rp) { var i = V.inv(rp.dataset.rp), a = V.payInv(i, V.invBal(i), 'Check'); close(); V.toast(V.money(a) + ' recorded on ' + i.id + ' (preview only).'); if (done) done(); return; }
            var iv = e.target.closest('[data-iv]');
            if (iv) { e.preventDefault(); var x = V.inv(iv.dataset.iv), n = V.jobs.filter(function (j) { return j.inv === x.id; }).length; V.toast(x.id + ': ' + x.period + ', ' + V.money(x.amount) + (n ? ' · ' + n + ' job(s) in this list' : '') + '. The invoice PDF would open here (preview only).'); }
        });
    });
};

document.addEventListener('DOMContentLoaded', function () {
    V.shell();
    var need = document.body.dataset.perm; // a page the admin must turn on (R-14)
    if (need && !V.can(need)) { var app = V.$('#app'); if (app) app.innerHTML = V.locked(need); document.title = 'Turned off | VIGN Staff Office'; return; }
    if (typeof V.init === 'function') V.init();
});
})(window.VS);
