/* =========================================================
   VIGN Admin: shared shell (same role as SMK admin/link.php: top navbar)
   and the Admin Menu engine (same structure as SMK admin/index.php):
     - a "Needs you today" bar, then a grid of tiles, one per section
     - clicking a tile hides the other sections and shows its own
     - each section: "New ..." button, "Toggle Active", "Select Bulk Option",
       quick views (Open / Past due ...), checkbox table, row buttons, Edit pop-up
   Preview only: changes live in this page and are lost on reload.
   ========================================================= */
(function (V) {
'use strict';

V.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
V.$ = function (s, r) { return (r || document).querySelector(s); };
V.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
V.date = function (off) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + off); return d; };
V.day = function (off) { return V.date(off).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }); };
V.money = function (n) { return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
V.sec = function (k) { return V.sections.filter(function (s) { return s.key === k; })[0]; };
V.toast = function (msg) {
    var t = V.$('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 3000);
};
var PILL = { Yes: 'p-green', No: 'p-grey', Active: 'p-green', Published: 'p-green', Paid: 'p-green', Approved: 'p-green', Closed: 'p-grey', Resent: 'p-green', Signed: 'p-green', 'Made into job': 'p-green', Accepted: 'p-green',
    New: 'p-blue', Open: 'p-blue', Sent: 'p-blue', Assigned: 'p-blue', Pending: 'p-amber', Waiting: 'p-amber', Draft: 'p-amber', 'Waiting for VIGN': 'p-amber', 'In field': 'p-amber', 'Waiting review': 'p-amber', 'Sent back': 'p-amber', Offered: 'p-amber',
    Overdue: 'p-red', 'Past due': 'p-red', Declined: 'p-red', Failed: 'p-red', Unassigned: 'p-red', Inactive: 'p-grey', 'Bills next': 'p-grey' };
V.pill = function (v) { return '<span class="pill ' + (PILL[v] || 'p-grey') + '">' + V.esc(v) + '</span>'; };

/* ---------- R-15 job history: who did what, and when ---------- */
V.who = function () { return V.me.name + ' (admin)'; };
V.log = function (r, what, who) {
    var n = new Date();
    (r.hist = r.hist || []).push({ d: 0, tm: n.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), what: what, who: who || V.who() });
};
V.histHtml = function (r) {
    var h = (r.hist || []).slice().reverse();
    if (!h.length) return '<p class="muted">No history saved for this job yet.</p>';
    return '<ol class="hist1">' + h.map(function (e) {
        var sys = /^System/.test(e.who);
        return '<li><span class="hist1-dot' + (sys ? ' sys' : '') + '"></span><div><b>' + V.esc(e.what) + '</b><small><i class="fa-solid ' + (sys ? 'fa-gear' : 'fa-user') + '"></i> ' + V.esc(e.who) + ' · ' + V.day(e.d) + (e.tm ? ' ' + V.esc(e.tm) : '') + '</small></div></li>';
    }).join('') + '</ol>';
};
V.histPopup = function (r, sub) {
    V.modal('Job history · ' + V.esc(r.id), '<p class="muted small" style="margin:0 0 10px">' + V.esc(sub || '') + ' Newest first. Every step keeps who did it and when (it cannot be edited).</p>' + V.histHtml(r));
};

/* ---------- R-13 each client has its own rate: pilot first, then contract; can depend on store count ---------- */
V.tierRate = function (c) {
    var n = +c.stores || 0, hit = null;
    String(c.tiers || '').split(',').forEach(function (t) {
        var m = t.trim().match(/^(\d+)\s*(?:-\s*(\d+)|\+)\s*:\s*\$?(\d+(?:\.\d+)?)$/); if (!m) return;
        var lo = +m[1], hi = m[2] ? +m[2] : 1e9;
        if (n >= lo && n <= hi) hit = { amt: +m[3], label: m[1] + (m[2] ? '–' + m[2] : '+') + ' stores' };
    });
    return hit;
};
V.rateNow = function (c) {
    var per = /flat/.test(c.plan || '') ? (/Yearly/.test(c.plan) ? ' / year' : ' / month') : ' / job';
    var tier = V.tierRate(c), contract = tier ? tier.amt : +c.rate || 0;
    var cWhy = tier ? 'Contract · ' + tier.label + ' (' + c.stores + ' stores)' : 'Contract rate';
    if (c.pilot === 'Yes' && c.pilotEnds != null && c.pilotEnds >= 0) return { amt: +c.pilotRate || 0, per: per, pilot: true, why: 'Pilot until ' + V.day(c.pilotEnds) + ', then ' + V.money(contract) + per };
    return { amt: contract, per: per, pilot: false, why: cWhy + (c.pilot === 'Yes' ? ' · pilot ended ' + V.day(c.pilotEnds) : '') };
};
function ratesPopup(c) {
    var r = V.rateNow(c), tier = V.tierRate(c);
    var tiers = String(c.tiers || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
    V.modal('Rates · ' + V.esc(c.name),
        '<div class="rv1"><div class="rv1-score"><span class="pill ' + (r.pilot ? 'p-amber' : 'p-green') + '">' + V.money(r.amt) + '</span><small>' + V.esc(r.per.replace(' / ', 'per ')) + '<br>charged now</small></div>' +
        '<dl class="dl1"><dt>Billing plan</dt><dd>' + V.esc(c.plan) + '</dd><dt>Why this rate</dt><dd>' + V.esc(r.why) + '</dd>' +
        (c.pilot === 'Yes' ? '<dt>Pilot Program</dt><dd>' + V.money(c.pilotRate) + r.per + ' until ' + V.day(c.pilotEnds) + '</dd>' : '') +
        '<dt>Contract rate</dt><dd>' + (tier ? V.money(tier.amt) + r.per + ' (by store count)' : V.money(c.rate) + r.per) + '</dd><dt>Stores</dt><dd>' + (+c.stores || '—') + '</dd></dl></div>' +
        (tiers.length ? '<h4 class="h4">Rate by number of stores</h4><table class="tbl"><thead><tr><th>Stores</th><th class="r">Rate per job</th></tr></thead><tbody>' + tiers.map(function (t) {
            var p = t.split(':'), on = tier && tier.amt === +String(p[1]).replace('$', '');
            return '<tr' + (on ? ' class="hl2"' : '') + '><td>' + V.esc(p[0]) + (on ? ' <span class="pill p-green">this client</span>' : '') + '</td><td class="r">' + V.money(+String(p[1]).replace('$', '')) + '</td></tr>';
        }).join('') + '</tbody></table>' : '') +
        '<p class="note1"><i class="fa-solid fa-tags"></i> No fixed price list: the admin sets each client\'s rate. When the pilot ends, new jobs use the contract rate by themselves. Click the client name to change it. (Sample prices.)</p>');
}

// ---------- pop-up ----------
V.modal = function (title, body, okLabel, onOk, extra) {
    var m = V.$('#actModal');
    if (!m) { m = document.createElement('div'); m.id = 'actModal'; m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); document.body.appendChild(m); }
    m.innerHTML = '<div class="modal-box"><div class="modal-h"><h3>' + title + '</h3><button class="modal-x" data-x aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>' +
        '<div class="modal-b1">' + body + '</div><div class="modal-f"><button type="button" class="btn btn-ghost btn-xs" data-x>Close</button>' + (extra || '') +
        (okLabel ? '<button type="button" class="btn btn-primary btn-xs" data-ok>' + okLabel + '</button>' : '') + '</div></div>';
    m.classList.add('open');
    var close = function () { m.classList.remove('open'); };
    V.$$('[data-x]', m).forEach(function (b) { b.addEventListener('click', close); });
    if (onOk) V.$('[data-ok]', m).addEventListener('click', function () { if (onOk(m) !== false) close(); });
    return m;
};

/* ---------- what each section needs from you (tile count + "Needs you today") ---------- */
function prep(s) {
    if (s.key === 'invoices') s.rows.forEach(function (r) {
        r.bal = Math.max(0, (r.amount || 0) - (r.paid || 0));
        r.status = r.billed == null ? 'Bills next' : r.bal === 0 ? 'Paid' : r.due < 0 ? 'Past due' : 'Open';
    });
    if (s.key === 'commissions') { var inv = V.sec('invoices'); prep(inv); s.rows.forEach(function (c) {
        var i = inv.rows.filter(function (x) { return x.id === c.invoice; })[0];
        if (c.status === 'Waiting for client payment' && i && i.billed != null && i.bal === 0) { c.status = 'Owed'; }
    }); }
    if (s.key === 'affiliates') { var cm = V.sec('commissions'); prep(cm); s.rows.forEach(function (a) {
        a.rule = a.earn === 'One-time payment' ? V.money(a.amount) + ' one time' : (a.pct || 0) + '% of each payment' + (a.months ? ' · ' + a.months + ' months' : ' · no end');
        a.nClients = V.sec('clients').rows.filter(function (c) { return !c._del && V.sameCode(c.refCode, a.code); }).length;
        var mine = cm.rows.filter(function (c) { return !c._del && c.affiliate === a.name; });
        a.earned = mine.filter(function (c) { return c.status !== 'Waiting for client payment'; }).reduce(function (t, c) { return t + c.amount; }, 0);
        a.owed = mine.filter(function (c) { return c.status === 'Owed'; }).reduce(function (t, c) { return t + c.amount; }, 0);
    }); }
}
/* ---------- R-17 affiliates: codes + commissions ---------- */
V.cleanCode = function (c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); };
V.sameCode = function (a, b) { return !!a && V.cleanCode(a) === V.cleanCode(b); };
// the code works only between its Start and End date (end empty = no end)
V.affOn = function (a, day) { day = day || 0; return (a.start == null || day >= a.start) && (a.end == null || day <= a.end); };
V.aff = function (code) { return code ? V.sec('affiliates').rows.filter(function (a) { return !a._del && V.sameCode(a.code, code); })[0] : null; };
// a new invoice for a referred client makes its commission line by itself
V.makeCommission = function (inv) {
    var c = V.sec('clients').rows.filter(function (x) { return x.name === inv.client; })[0], a = c && V.aff(c.refCode);
    if (!a || a.active !== 'Yes' || !V.affOn(a, 0)) return null;   // outside the Start / End dates: no commission
    var cm = V.sec('commissions'), mine = cm.rows.filter(function (x) { return x.affiliate === a.name && x.client === c.name; });
    var line = { id: 'CM-' + (108 + cm.rows.length), affiliate: a.name, client: c.name, invoice: inv.id, base: inv.amount || 0, status: 'Waiting for client payment' };
    if (a.earn === 'One-time payment') { if (mine.length) return null; line.amount = +a.amount || 0; line.rule = 'One time, first payment'; }
    else {
        var month = Math.floor(-(c.refSince || 0) / 30) + 1;
        if (a.months && month > a.months) return null;
        line.amount = Math.round((inv.amount || 0) * (a.pct || 0)) / 100; line.rule = (a.pct || 0) + '% · month ' + month + (a.months ? ' of ' + a.months : '');
    }
    cm.rows.unshift(line); if (cm._draw) cm._draw();
    return line;
};
var NEED = {
    requests: function (r) { return r.status === 'New'; },
    jobs: function (r) { return !r.inspector && r.status !== 'Offered'; },
    signups: function (r) { return r.status === 'New'; },
    finished: function (r) { return r.status === 'Waiting review'; },
    invoices: function (r) { return r.status === 'Open' || r.status === 'Past due'; },
    statements: function (r) { return r.status === 'Pending'; },
    documents: function (r) { return r.signed === 'Waiting'; },
    commissions: function (r) { return r.status === 'Owed'; }
};
function shown() { return V.sections.filter(function (s) { return !s.hidden; }); }
function live(s) { return s.rows.filter(function (r) { return !r._del; }); }
function count(s) { prep(s); return NEED[s.key] ? live(s).filter(NEED[s.key]).length : live(s).length; }

// ---------- admin only ----------
// Preview: the Admin Menu opens only after the ADMIN sign-in in this tab. Signing in to the Staff Office,
// Inspector or Client portal replaces it, so those accounts can't open admin pages.
// Real system: the server checks the admin role on every admin page and request (a browser check is not security).
V.gate = function () {
    var role = ''; try { role = sessionStorage.getItem('vign-role') || ''; } catch (e) {}
    if (role === 'admin') return true;
    var who = { staff: 'a Staff Office account', inspector: 'an inspector account', client: 'a client account' }[role];
    document.body.innerHTML = '<div class="alogin"><div class="alogin-box" style="text-align:center"><i class="fa-solid fa-lock" style="font-size:2.4rem;color:#c8102e"></i>' +
        '<h1 style="font-size:1.5rem;margin:12px 0 6px">Admin only</h1><p class="muted">' + (who ? 'You are signed in with ' + who + '. The Admin Menu is for VIGN administrators only.' : 'Please sign in as a VIGN administrator to open the Admin Menu.') + '</p>' +
        '<a class="btn btn-primary btn-block" style="margin-top:16px" href="login.html' + (location.hash ? '?to=' + encodeURIComponent(location.hash.slice(1)) : '') + '">Admin sign in</a>' +
        '<p class="center small" style="margin-top:12px"><a href="../index.html">← Back to website</a></p></div></div>';
    document.title = 'Admin only | VIGN USA';
    return false;
};
// ---------- top navbar ----------
V.shell = function (page) {
    var links = [['menu', 'index.html', 'fa-table-cells-large', 'Admin Menu']];
    document.body.insertAdjacentHTML('afterbegin',
        '<header class="anav" id="anav"><div class="anav-in"><a class="anav-brand" href="index.html"><img src="../images/vign-mark.png" alt="VignUSA.com"><span>Admin</span></a>' +
        '<button class="anav-burger" id="burger" aria-label="Menu"><i class="fa-solid fa-bars"></i></button>' +
        '<nav class="anav-links" aria-label="Admin menu">' + links.map(function (l) {
            return '<a href="' + l[1] + '"' + (l[0] === page ? ' class="on"' : '') + ' data-nav="' + l[0] + '"><i class="fa-solid ' + l[2] + '"></i>' + l[3] + (l[4] ? '<span class="cnt">' + l[4] + '</span>' : '') + '</a>';
        }).join('') + '</nav>' +
        '<div class="anav-right"><a class="anav-user" href="login.html?out=1" title="Sign out"><span><b>' + V.esc(V.me.name) + '</b><small>' + V.esc(V.me.role) + '</small></span><span class="av">' + V.me.name.split(' ').map(function (p) { return p[0]; }).join('') + '</span></a></div></div></header>');
    V.$('#burger').addEventListener('click', function () { V.$('#anav').classList.toggle('open'); });
};

// ---------- Admin Menu ----------
V.menu = function (app) {
    try { var ans = JSON.parse(localStorage.getItem('vign-offer-answers') || '{}'); Object.keys(ans).forEach(function (id) { var j = V.sec('jobs').rows.filter(function (x) { return x.id === id; })[0]; if (j) V.answerOffer(j, 'Maria Lopez', ans[id] === 'accepted'); }); } catch (e) {}
    var html = '<div class="band"><div><h1><i class="fa-solid fa-table-cells-large"></i>Admin Menu</h1><p>Click a tile to open its list. Sample data. New requests and join requests from the website are saved in this browser: <a href="../database.html" style="color:inherit;text-decoration:underline">preview database</a>.</p></div></div>';
    html += '<div class="need" id="need"></div>';
    html += '<div class="tiles" role="tablist">' + shown().map(function (s) {
        return '<button class="tile" role="tab" data-tile="' + s.key + '" aria-controls="sec-' + s.key + '">' + '<span class="ic ' + s.color + '"><i class="fa-solid ' + s.icon + '"></i></span>' +
            '<span><h5>' + V.esc(s.title) + '</h5><p>Click to open up ' + V.esc(s.title) + '</p></span><span class="n" data-n="' + s.key + '"></span></button>';
    }).join('') + '</div>';
    html += shown().map(function (s) { return '<section class="sect" id="sec-' + s.key + '" role="tabpanel"></section>'; }).join('');
    app.innerHTML = html;

    shown().forEach(function (s) { s._draw = build(s, V.$('#sec-' + s.key)); });
    V.$$('[data-tile]').forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.tile, true); }); });
    V.refresh();

    var start = (location.hash || '').slice(1);
    var ok = function (k) { return V.sec(k) && !V.sec(k).hidden; };
    show(ok(start) ? start : shown()[0].key, !!start);
    window.addEventListener('hashchange', function () { var k = location.hash.slice(1); if (ok(k)) show(k, true); });
    app.addEventListener('click', function (e) { var a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); show(a.dataset.go, true); } });

    function show(key, scroll) {
        V.$$('[data-tile]').forEach(function (b) { var on = b.dataset.tile === key; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
        V.$$('.sect').forEach(function (x) { x.classList.toggle('on', x.id === 'sec-' + key); });
        var sk = V.sec(key); if (sk && sk._draw) sk._draw();
        if (scroll) V.$('#sec-' + key).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// tile numbers + "Needs you today" bar
V.refresh = function () {
    V.sections.forEach(function (s) { var n = V.$('[data-n="' + s.key + '"]'); if (n) { var c = count(s); n.textContent = c; n.classList.toggle('hot', !!NEED[s.key] && c > 0); } });
    var inv = V.sec('invoices'); prep(inv);
    var openAmt = live(inv).filter(NEED.invoices).reduce(function (t, r) { return t + r.bal; }, 0);
    var lateAmt = live(inv).filter(function (r) { return r.status === 'Past due'; }).reduce(function (t, r) { return t + r.bal; }, 0);
    var items = [['requests', 'fa-inbox', count(V.sec('requests')), 'new requests'], ['jobs', 'fa-user-check', count(V.sec('jobs')), 'jobs need an inspector (' + live(V.sec('jobs')).filter(function (r) { return r.status === 'Offered'; }).length + ' offered)'],
        ['signups', 'fa-user-plus', count(V.sec('signups')), 'inspectors to approve'], ['finished', 'fa-list-check', count(V.sec('finished')), 'reports to check'],
        ['invoices', 'fa-file-invoice-dollar', V.money(openAmt), 'open invoices · <b class="late">' + V.money(lateAmt) + ' past due</b>']];
    var el = V.$('#need'); if (!el) return;
    el.innerHTML = '<span class="need-t">Needs you today</span>' + items.map(function (i) { return '<a href="#' + i[0] + '" data-go="' + i[0] + '"><i class="fa-solid ' + i[1] + '"></i><b>' + i[2] + '</b> ' + i[3] + '</a>'; }).join('');
};

/* ---------- row buttons per section (the work the customer asked for) ---------- */
function btn(act, icon, label, cls) { return '<button class="edit-btn ' + (cls || '') + '" data-act="' + act + '"><i class="fa-solid ' + icon + '"></i> ' + label + '</button>'; }
function inspectorsFor(service) {
    var shop = /Mystery/.test(service || '');
    return V.sec('inspectors').rows.filter(function (i) { return !i._del && i.active === 'Yes' && (shop ? i.role !== 'Inspector' : i.role !== 'Mystery Shopper'); });
}
function assignPopup(jobs, done) {
    var list = inspectorsFor(jobs[0].service);
    V.modal('Assign ' + jobs.length + ' job' + (jobs.length > 1 ? 's' : ''),
        '<p class="muted small" style="margin:0 0 10px">' + jobs.map(function (j) { return '<b>' + V.esc(j.id) + '</b> · ' + V.esc(j.addr); }).join('<br>') + '</p>' +
        list.map(function (i) { return '<label class="pick"><input type="radio" name="ins" value="' + V.esc(i.name) + '"><span><b>' + V.esc(i.name) + '</b> · ' + V.esc(i.role) + '<small>' + V.esc(i.area) + ' · ZIPs ' + V.esc(i.zips) + '</small></span><span class="muted small">' + i.open + ' open<br>score ' + i.score + '</span></label>'; }).join('') +
        '<label class="fld1">Note to the inspector (optional)<textarea></textarea></label>',
        '<i class="fa-solid fa-user-check"></i> Assign', function (m) {
            var r = V.$('input[name=ins]:checked', m); if (!r) { V.toast('Pick an inspector first.'); return false; }
            jobs.forEach(function (j) { j.inspector = r.value; if (j.status !== 'In field') j.status = 'Assigned'; if (j.offers) j.offers.forEach(function (o) { if (o.ans === 'Waiting') o.ans = 'Taken'; }); V.log(j, 'Assigned to ' + r.value); });
            V.toast(jobs.length + ' job(s) assigned to ' + r.value + '. They see it in their portal now (preview only).'); done();
        });
}
/* ---------- coverage: ZIP codes, counties, or an entire state (Don 2026-11-11) ---------- */
function covList(i) { return String(i.zips || '').split(',').map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean); }
V.covers = function (i, job) {
    var l = covList(i), t = i.covType || 'ZIP codes';
    if (t === 'Entire state') return l.indexOf(String(job.st || 'NY').toLowerCase()) > -1;
    if (t === 'Counties') return l.indexOf(String(job.county || '').toLowerCase()) > -1;
    return l.indexOf(String(job.zip || '')) > -1;
};
V.covTxt = function (i) { var t = i.covType || 'ZIP codes'; return t === 'Entire state' ? 'All of ' + V.esc(i.zips) : t === 'Counties' ? V.esc(i.zips) + (covList(i).length > 1 ? ' counties' : ' County') : 'ZIPs ' + V.esc(i.zips); };
// "available" is not decided by Don yet: for now = active + right role + covers the job
function inArea(job) { return inspectorsFor(job.service).filter(function (i) { return V.covers(i, job); }); }
// repeat: next dates the system creates by itself
V.repeatNext = function (r) { if (!r.repeat || r.repeat === 'None') return []; var step = r.repeat === 'Twice a month' ? 15 : 30, d = r.due == null ? (r.wanted || 0) : r.due; return [d + step, d + 2 * step, d + 3 * step]; };
function repeatBadge(r) { return r.repeat && r.repeat !== 'None' ? '<span class="rep" title="' + V.esc(r.repeat) + ': next ' + V.repeatNext(r).map(V.day).join(', ') + '"><i class="fa-solid fa-repeat"></i> ' + (r.repeat === 'Twice a month' ? '2× month' : 'Monthly') + '</span>' : ''; }
// Offer to area: every matching inspector gets it; first to accept wins ("When you snooze, you lose")
function offerPopup(jobs, done) {
    var groups = jobs.map(function (j) { return { j: j, list: inArea(j).filter(function (i) { return !(j.offers || []).some(function (o) { return o.name === i.name && o.ans === 'Declined'; }); }) }; });
    V.modal('Offer to area · ' + jobs.length + ' job' + (jobs.length > 1 ? 's' : ''),
        groups.map(function (g) {
            return '<div class="offer1"><p style="margin:0 0 6px"><b>' + V.esc(g.j.id) + '</b> · ' + V.esc(g.j.addr) + ' <small class="muted">(ZIP ' + V.esc(g.j.zip) + ' · ' + V.esc(g.j.county) + ' County)</small></p>' +
                (g.list.length ? '<ul class="offl">' + g.list.map(function (i) { return '<li><i class="fa-solid fa-user"></i><b>' + V.esc(i.name) + '</b> · ' + V.esc(i.role) + '<small>' + V.covTxt(i) + '</small></li>'; }).join('') + '</ul>'
                    : '<p class="note1" style="margin:0"><i class="fa-solid fa-triangle-exclamation"></i> No active inspector covers this place. Assign someone by hand, or add coverage in Inspectors List.</p>') + '</div>';
        }).join('') +
        '<p class="note1"><i class="fa-solid fa-bolt"></i> Each one sees it under <b>New offers</b> in their portal with Accept / Decline. <b>The first to accept gets the job</b>; the others see "Taken". If everyone declines, it comes back here as "Declined by …".</p>',
        '<i class="fa-solid fa-paper-plane"></i> Send offer', function () {
            var sent = 0;
            groups.forEach(function (g) { if (!g.list.length) return; g.j.offers = (g.j.offers || []).filter(function (o) { return o.ans === 'Declined'; }).concat(g.list.map(function (i) { return { name: i.name, ans: 'Waiting' }; })); g.j.status = 'Offered'; g.j.offeredOn = 0; g.j.inspector = ''; V.log(g.j, 'Offered to ' + g.list.length + ' inspector' + (g.list.length > 1 ? 's' : '') + ' in the area'); sent++; });
            V.toast(sent ? sent + ' job(s) offered. First to accept gets it (preview only).' : 'Nothing sent: no inspector covers these places.'); done();
        });
}
// the offer's answers; the preview buttons stand in for inspectors answering on their phone
function offerView(j, done) {
    var o = j.offers || [];
    var m = V.modal('Offer · ' + V.esc(j.id), '<p style="margin:0 0 8px">' + V.esc(j.addr) + ' · sent ' + V.day(j.offeredOn || 0) + '</p>' +
        '<table class="tbl"><thead><tr><th>Inspector</th><th>Answer</th><th>Preview: answer for them</th></tr></thead><tbody>' + o.map(function (x, k) {
            return '<tr><td><b>' + V.esc(x.name) + '</b></td><td>' + V.pill(x.ans) + '</td><td>' + (x.ans === 'Waiting' ? '<button class="edit-btn grn" data-oa="' + k + '"><i class="fa-solid fa-check"></i> Accepts</button><button class="edit-btn" data-od="' + k + '"><i class="fa-solid fa-xmark"></i> Declines</button>' : '') + '</td></tr>';
        }).join('') + '</tbody></table><p class="muted small">Inspectors answer in their own portal. Maria Lopez can try it in the <a href="../inspector/command.html">inspector portal</a>.</p>',
        '', null, '<button type="button" class="btn btn-ghost btn-xs" data-reassign><i class="fa-solid fa-user-check"></i> Assign someone instead</button>');
    m.addEventListener('click', function (e) {
        var a = e.target.closest('[data-oa]'), d = e.target.closest('[data-od]');
        if (a) { V.answerOffer(j, o[+a.dataset.oa].name, true); m.classList.remove('open'); done(); }
        else if (d) { V.answerOffer(j, o[+d.dataset.od].name, false); m.classList.remove('open'); done(); if (j.status === 'Offered') offerView(j, done); }
        else if (e.target.closest('[data-reassign]')) { m.classList.remove('open'); assignPopup([j], done); }
    });
}
V.answerOffer = function (j, name, yes) {
    if (j.status !== 'Offered') return;
    var me = (j.offers || []).filter(function (o) { return o.name === name; })[0]; if (!me) return;
    if (yes) {
        me.ans = 'Accepted'; j.offers.forEach(function (o) { if (o !== me && o.ans === 'Waiting') o.ans = 'Taken'; });
        j.inspector = name; j.status = 'Assigned'; V.log(j, 'Accepted the offer first', name + ' (inspector)'); V.toast(name + ' accepted ' + j.id + ' first. The others now see "Taken".');
    } else {
        me.ans = 'Declined'; V.log(j, 'Declined the offer', name + ' (inspector)');
        if (!j.offers.some(function (o) { return o.ans === 'Waiting'; })) { j.status = 'Declined'; j.declinedBy = j.offers.filter(function (o) { return o.ans === 'Declined'; }).map(function (o) { return o.name; }).join(', '); V.toast('Everyone declined ' + j.id + '. It is back in Assign Jobs.'); }
        else V.toast(name + ' declined ' + j.id + '.');
    }
};
// Accept Job (was "Make job"): due date max 10 days, repeat
function acceptPopup(r, done) {
    var want = Math.max(1, Math.min(10, r.wanted || 10));
    V.modal('Accept Job · ' + V.esc(r.id), '<p style="margin:0 0 8px"><b>' + V.esc(r.company) + '</b> · ' + V.esc(r.service) + '<br>' + V.esc(r.addr) + '</p>' +
        '<label class="fld1">Due date (at most 10 days from today)<input type="date" id="due" min="' + V.date(1).toISOString().slice(0, 10) + '" max="' + V.date(10).toISOString().slice(0, 10) + '" value="' + V.date(want).toISOString().slice(0, 10) + '"></label>' +
        (r.wanted > 10 ? '<p class="note1"><i class="fa-solid fa-circle-info"></i> The client asked for ' + V.day(r.wanted) + '. The longest allowed is 10 days, so it was set to ' + V.day(10) + '.</p>' : '') +
        '<label class="fld1">Repeat<select id="rep">' + ['None', 'Once a month', 'Twice a month'].map(function (o) { return '<option' + (o === (r.repeat || 'None') ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></label>' +
        '<p class="note1"><i class="fa-solid fa-envelope"></i> At day 5 the inspector gets an automatic reminder email (inspector only). You can watch it in Assign Jobs.</p>',
        '<i class="fa-solid fa-check"></i> Accept Job', function (m) {
            var v = V.$('#due', m).value, d = Math.round((new Date(v + 'T12:00:00') - V.date(0)) / 864e5);
            if (!v || d < 1 || d > 10) { V.toast('Pick a due date from 1 to 10 days from today.'); return false; }
            var id = 'VG-' + (24132 + V.sec('jobs').rows.length), z = (r.addr.match(/\b(\d{5})\b/) || [])[1] || '';
            var from = r.src || 'Website form';
            var nj = { id: id, client: r.company, service: r.service, addr: r.addr, zip: z, county: /Huntington|Hauppauge|Islip|Bohemia/.test(r.addr) ? 'Suffolk' : 'Nassau', st: 'NY', acc: 0, due: d, inspector: '', status: 'Unassigned', repeat: V.$('#rep', m).value,
                by: r.contact || r.company, byHow: from, hist: [{ d: r.date || 0, tm: '', what: 'Request ' + r.id + ' sent in (' + from + ')', who: (r.contact || 'Unknown') + ' (client, ' + r.company + ')' }] };
            V.log(nj, 'Accepted as a job, due ' + V.day(d)); V.sec('jobs').rows.unshift(nj);
            r.status = 'Accepted'; r.repeat = V.$('#rep', m).value; r.job = id; V.log(r, 'Accepted as job ' + id);
            V.toast(r.id + ' accepted as job ' + id + ', due ' + V.day(d) + '. Next: assign it or offer it to the area.'); done(); V.sec('jobs')._draw();
        });
}
V.ACTS = {
    requests: function (r) { return r.status === 'New' ? btn('job', 'fa-briefcase', 'Accept Job', 'pri') + btn('decline', 'fa-xmark', 'Decline') : btn('view', 'fa-eye', 'View'); },
    jobs: function (r) { var h = btn('hist', 'fa-clock-rotate-left', 'History'); if (r.status === 'Offered') return btn('offerview', 'fa-hourglass-half', 'See answers', 'pri') + btn('assign', 'fa-user-check', 'Assign') + h; return btn('assign', 'fa-user-check', r.inspector ? 'Reassign' : 'Assign', r.inspector ? '' : 'pri') + (r.inspector ? '' : btn('offer', 'fa-bullhorn', 'Offer to area')) + h; },
    clients: function (r) { return btn('rates', 'fa-tags', 'Rates'); },
    inspectors: function (r) { return btn('insjobs', 'fa-briefcase', 'Jobs'); },
    signups: function (r) { return r.status === 'New' ? btn('approve', 'fa-check', 'Approve', 'grn') + btn('decline', 'fa-xmark', 'Decline') : ''; },
    finished: function (r) { return btn('review', r.status === 'Waiting review' ? 'fa-magnifying-glass' : 'fa-eye', r.status === 'Waiting review' ? 'Check' : 'View', r.status === 'Waiting review' ? 'pri' : '') + btn('hist', 'fa-clock-rotate-left', 'History'); },
    invoices: function (r) { return r.billed == null ? '<span class="muted small">Automatic</span>' : (r.bal > 0 ? btn('pay', 'fa-money-check-dollar', 'Record payment') : '') + btn('pdf', 'fa-file-pdf', 'PDF'); },
    statements: function (r) { return r.status === 'Pending' ? btn('paid', 'fa-check', 'Mark paid', 'grn') : ''; },
    documents: function (r) { return btn('viewdoc', 'fa-eye', 'View') + btn('download', 'fa-download', 'Download'); },
    affiliates: function (r) { return btn('affcl', 'fa-building', 'Clients') + btn('affcm', 'fa-list', 'Commissions'); },
    commissions: function (r) { return r.status === 'Owed' ? btn('cpaid', 'fa-check', 'Mark paid', 'grn') : r.status === 'Waiting for client payment' ? '<span class="muted small">Client hasn\'t paid yet</span>' : ''; }
};
V.RUN = {
    job: function (r, s, done) { acceptPopup(r, done); },
    offer: function (r, s, done) { offerPopup([r], done); },
    offerview: function (r, s, done) { offerView(r, done); },
    insjobs: function (r) { var j = live(V.sec('jobs')).filter(function (x) { return x.inspector === r.name; }); V.modal('Open jobs · ' + V.esc(r.name), j.length ? '<ul class="offl">' + j.map(function (x) { return '<li><b>' + V.esc(x.id) + '</b> · ' + V.esc(x.addr) + '<small>due ' + V.day(x.due) + ' · ' + V.esc(x.status) + '</small></li>'; }).join('') + '</ul>' : '<p class="muted">No open jobs in this list.</p>'); },
    decline: function (r, s, done) { r.status = 'Declined'; V.log(r, s && s.key === 'signups' ? 'Join request declined' : 'Request declined'); V.toast(r.id + ' declined.'); done(); },
    hist: function (r, s) { V.histPopup(r, s.key === 'finished' ? r.client + ' · ' + r.form + '.' : r.client + ' · ' + r.addr + '.'); },
    rates: function (r) { ratesPopup(r); },
    affcl: function (a) {
        var cl = V.sec('clients').rows.filter(function (c) { return !c._del && V.sameCode(c.refCode, a.code); });
        var rq = V.sec('requests').rows.filter(function (q) { return V.sameCode(q.ref, a.code); });
        V.modal('Clients from ' + V.esc(a.name) + ' · code ' + V.esc(a.code),
            (cl.length ? '<ul class="offl">' + cl.map(function (c) { return '<li><i class="fa-solid fa-building"></i><b>' + V.esc(c.name) + '</b><small>referred since ' + V.day(c.refSince || 0) + ' · plan ' + V.esc(c.plan) + '</small></li>'; }).join('') + '</ul>' : '<p class="muted">No clients with this code yet.</p>') +
            (rq.length ? '<h4 class="h4">Requests that used the code</h4><ul class="offl">' + rq.map(function (q) { return '<li><b>' + V.esc(q.id) + '</b> · ' + V.esc(q.company) + '<small>' + V.esc(q.status) + ' · add the code to the client when you set them up</small></li>'; }).join('') + '</ul>' : ''));
    },
    affcm: function (a) {
        var cm = V.sec('commissions'); prep(cm);
        var mine = cm.rows.filter(function (c) { return !c._del && c.affiliate === a.name; });
        V.modal('Commissions · ' + V.esc(a.name), '<p class="muted small" style="margin:0 0 8px">Earns: ' + V.esc(a.rule) + '</p>' +
            (mine.length ? '<table class="tbl"><thead><tr><th>Client</th><th>Invoice</th><th class="r">Client paid</th><th class="r">Commission</th><th>Status</th></tr></thead><tbody>' + mine.map(function (c) { return '<tr><td>' + V.esc(c.client) + '</td><td>' + V.esc(c.invoice) + '</td><td class="r">' + V.money(c.base) + '</td><td class="r"><b>' + V.money(c.amount) + '</b></td><td>' + V.pill(c.status) + '</td></tr>'; }).join('') + '</tbody></table>' : '<p class="muted">No commissions yet.</p>') +
            '<p class="note1"><i class="fa-solid fa-circle-info"></i> Owed now: <b>' + V.money(a.owed) + '</b>. Pay them in Affiliate Commissions.</p>');
    },
    cpaid: function (r, s, done) {
        var a = V.sec('affiliates').rows.filter(function (x) { return x.name === r.affiliate; })[0];
        if (a && a.w9 !== 'Yes') { V.toast('No W-9 on file for ' + r.affiliate + ' yet. Upload it in Documents, then switch "W-9 on file" on.'); return; }
        r.status = 'Paid'; r.payday = 0; V.toast(V.money(r.amount) + ' to ' + r.affiliate + ' marked paid (preview only, no real payment).'); done();
    },
    view: function (r) { V.modal(V.esc(r.id) + ' · ' + V.esc(r.company), '<dl class="dl1"><dt>Service</dt><dd>' + V.esc(r.service) + '</dd><dt>Address</dt><dd>' + V.esc(r.addr) + '</dd><dt>Contact</dt><dd>' + V.esc(r.contact) + '</dd><dt>Wanted by</dt><dd>' + V.day(r.wanted) + '</dd><dt>Notes</dt><dd>' + V.esc(r.notes || '—') + '</dd>' + (r.ref ? '<dt>Referral code</dt><dd><span class="code1">' + V.esc(V.cleanCode(r.ref)) + '</span> ' + (V.aff(r.ref) ? '= ' + V.esc(V.aff(r.ref).name) + ' (' + V.esc(V.aff(r.ref).type) + ')' : '<span class="late">unknown code</span>') + '</dd>' : '') + '<dt>Status</dt><dd>' + V.pill(r.status) + '</dd></dl>' + (r.hist && r.hist.length ? '<h4 class="h4">History</h4>' + V.histHtml(r) : '')); },
    assign: function (r, s, done) { assignPopup([r], done); },
    approve: function (r, s, done) {
        r.status = 'Approved';
        var ins = V.sec('inspectors'); ins.rows.unshift({ id: 'INS-0' + (470 + ins.rows.length), name: r.name, role: r.role, email: r.email, phone: '', area: r.area, zips: [r.zip, r.coverage].filter(Boolean).join(',').split(/[,;\s]+/).filter(function (z, i, all) { return z && all.indexOf(z) === i; }).join(', '), covType: 'ZIP codes', open: 0, done: 0, score: 0, active: 'Yes' }); if (ins._draw) ins._draw();
        V.toast(r.name + ' approved and added to the network. They can now be assigned jobs (preview only).'); done();
    },
    review: function (r, s, done) {
        var cls = r.score >= 85 ? 'p-green' : r.score >= 65 ? 'p-amber' : 'p-red';
        var body = '<div class="rv1"><div class="rv1-score"><span class="pill ' + cls + '">' + r.score + '</span><small>score<br>(sample formula)</small></div><dl class="dl1"><dt>Client</dt><dd>' + V.esc(r.client) + '</dd><dt>Inspector</dt><dd>' + V.esc(r.inspector) + '</dd><dt>Form</dt><dd>' + V.esc(r.form) + '</dd><dt>Sent in</dt><dd>' + V.day(r.sent) + '</dd><dt>Client can see</dt><dd>' + V.pill(r.seen) + '</dd></dl></div>' +
            '<h4 class="h4">Problems found by the checks</h4>' + (r.flags.length ? '<ul class="flags1">' + r.flags.map(function (f) { return '<li><i class="fa-solid fa-triangle-exclamation"></i>' + V.esc(f) + '</li>'; }).join('') + '</ul>' : '<p class="ok1"><i class="fa-solid fa-circle-check"></i> Every check passed</p>') +
            '<h4 class="h4">Job history</h4>' + V.histHtml(r) +
            '<h4 class="h4">Photos (' + r.photos + ')</h4><div class="phs">' + Array.apply(null, Array(Math.min(r.photos, 8))).map(function (x, i) { return '<span><i class="fa-regular fa-image"></i><small>IMG_' + (3101 + i) + '</small></span>'; }).join('') + '</div>' +
            (r.status === 'Waiting review' ? '<label class="fld1">If you send it back, tell the inspector why<textarea id="why">' + V.esc(r.flags.join('. ')) + '</textarea></label>' : '');
        var m = V.modal('Check report ' + V.esc(r.id), body, r.status === 'Waiting review' ? '<i class="fa-solid fa-check"></i> Approve &amp; send to client' : '', r.status === 'Waiting review' ? function () {
            r.status = 'Approved'; r.seen = 'Yes'; r.checkedBy = V.me.name; V.log(r, 'Checked and approved, sent to the client'); V.toast(r.id + ' approved. ' + r.client + ' can see the report now (preview only).'); done();
        } : null, r.status === 'Waiting review' ? '<button type="button" class="btn btn-ghost btn-xs" data-back style="color:var(--r)"><i class="fa-solid fa-rotate-left"></i> Send back</button>' : '');
        var b = V.$('[data-back]', m); if (b) b.addEventListener('click', function () { var why = (V.$('#why', m) || {}).value || ''; r.status = 'Sent back'; r.checkedBy = V.me.name; V.log(r, 'Checked and sent back' + (why ? ': ' + why : '')); m.classList.remove('open'); V.toast(r.id + ' sent back to ' + r.inspector + ' (preview only).'); done(); });
    },
    pay: function (r, s, done) {
        V.modal('Record payment · ' + V.esc(r.id), '<p style="margin:0 0 6px">' + V.esc(r.client) + ' owes <b>' + V.money(r.bal) + '</b> (due ' + V.day(r.due) + ').</p>' +
            '<label class="fld1">Amount received ($)<input type="number" id="amt" value="' + r.bal + '"></label><label class="fld1">How paid<select><option>ACH</option><option>Check</option><option>Credit card</option></select></label><label class="fld1">Check # / reference<input type="text"></label>',
            '<i class="fa-solid fa-floppy-disk"></i> Save payment', function (m) { var a = +V.$('#amt', m).value || 0; r.paid = (r.paid || 0) + a; V.toast(V.money(a) + ' recorded on ' + r.id + ' (preview only).'); done(); });
    },
    pdf: function (r) { V.toast('The invoice PDF for ' + r.id + ' would open here (preview only).'); },
    paid: function (r, s, done) { r.status = 'Paid'; r.payday = 0; V.toast(r.id + ' marked paid. ' + r.inspector + ' sees it on their Payments page (preview only).'); done(); },
    viewdoc: function (r) {
        V.modal(V.esc(r.name), '<div class="docprev"><i class="fa-regular fa-file-pdf"></i><p>The document would open here.</p></div><dl class="dl1"><dt>Type</dt><dd>' + V.esc(r.type) + '</dd><dt>For</dt><dd>' + V.esc(r.who) + '</dd><dt>Who can see it</dt><dd>' + visible(r) + '</dd><dt>Signed</dt><dd>' + V.pill(r.signed) + '</dd><dt>Size</dt><dd>' + V.esc(r.size || '') + '</dd></dl>' +
            (r.type === '1099' || r.type === 'W-9' ? '<p class="note1"><i class="fa-solid fa-lock"></i> Tax forms have private details (SSN). Only admins and this person can open it. No public link.</p>' : ''));
    },
    download: function (r) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(['VIGN USA sample document (preview only)\n\n' + r.name + '\nFor: ' + r.who + '\n'], { type: 'text/plain' }));
        a.download = r.name.replace(/\.pdf$/, '') + ' (sample).txt'; a.click();
    }
};
function visible(r) {
    if (r.type === '1099' || r.type === 'W-9') return '<i class="fa-solid fa-lock"></i> Admin + ' + V.esc(r.who) + ' only';
    if (/^All /.test(r.who)) return 'Admin + ' + V.esc(r.who.toLowerCase());
    return 'Admin + ' + V.esc(r.who);
}

/* ---------- LoyalServe way: click the name / number to edit; click a balance to see the invoices ---------- */
// column that is the link in each tile (no separate Edit column, like SMK)
var LINK = { requests: 'id', jobs: 'id', signups: 'name', finished: 'id', invoices: 'id', statements: 'id', documents: 'name', clients: 'name', inspectors: 'name', users: 'name', affiliates: 'name' };
// tiles with no edit form: the link runs their main job instead
var LINKACT = { jobs: 'assign', finished: 'review' };
function owed(client) { var inv = V.sec('invoices'); prep(inv); return live(inv).filter(function (r) { return r.client === client && r.billed != null && r.bal > 0; }).reduce(function (t, r) { return t + r.bal; }, 0); }
function balBox(client, amt) { return '<a href="#" class="balbox ' + (amt > 0 ? 'due' : 'ok') + '" data-bal="' + V.esc(client) + '" title="See ' + V.esc(client) + '\'s invoices">' + V.money(amt) + '</a>'; }
// SMK showinvoices.php: the client's invoices; click the invoice # to edit it; Charge Balance / Record payment per row
V.clientInvoices = function (client) {
    var inv = V.sec('invoices'); prep(inv);
    var cl = V.sec('clients').rows.filter(function (c) { return c.name === client; })[0] || {};
    var list = live(inv).filter(function (r) { return r.client === client; }).sort(function (a, b) { return (b.billed == null ? 1e9 : b.billed) - (a.billed == null ? 1e9 : a.billed); });
    var canCharge = cl.agree === 'Yes' && !!cl.card;
    var total = owed(client);
    var body = '<dl class="dl1"><dt>Plan</dt><dd>' + V.esc(cl.plan || '—') + '</dd><dt>Agreement</dt><dd>' + V.pill(cl.agree || 'No') + '</dd><dt>Card on file</dt><dd>' + V.esc(cl.card || 'None') + '</dd><dt>Owes now</dt><dd><b class="' + (total > 0 ? 'late' : '') + '">' + V.money(total) + '</b></dd></dl>' +
        '<div class="tbl-wrap" style="margin-top:12px"><table class="tbl"><thead><tr><th>Invoice #</th><th>Billed</th><th>For</th><th>Due</th><th class="r">Amount</th><th class="r">Balance</th><th>Status</th><th>Action</th></tr></thead><tbody>' +
        (list.length ? list.map(function (r) {
            var a = r.billed == null ? '<span class="muted small">Automatic</span>' : r.bal > 0 ? (canCharge ? btn('charge', 'fa-credit-card', 'Charge balance', 'pri') : '') + btn('pay', 'fa-money-check-dollar', 'Record payment') : '';
            var ix = inv.rows.indexOf(r); return '<tr data-inv="' + ix + '"><td><a href="#" class="lnk" data-invedit="' + ix + '">' + V.esc(r.id) + '</a></td><td>' + (r.billed == null ? 'Bills ' + V.day(r.next) : V.day(r.billed)) + '</td><td>' + V.esc(r.period) + '</td><td>' + V.day(r.due) + '</td><td class="r">' + V.money(r.amount) + '</td><td class="r"><b>' + V.money(r.bal) + '</b></td><td>' + V.pill(r.status) + '</td><td class="acts">' + a + '</td></tr>';
        }).join('') : '<tr><td colspan="8" class="empty">No invoices</td></tr>') + '</tbody></table></div>' +
        (canCharge ? '' : '<p class="note1"><i class="fa-solid fa-lock"></i> No card charge here: ' + (cl.agree !== 'Yes' ? 'the agreement is not signed yet.' : 'no card on file.') + ' Record a check or ACH payment instead.</p>');
    var m = V.modal('Invoices for ' + V.esc(client), body);
    m.classList.add('wide');
    var again = function () { var a = V.sec('invoices')._draw, c = V.sec('clients')._draw; if (a) a(); if (c) c(); V.clientInvoices(client); };
    V.$('tbody', m).addEventListener('click', function (e) {
        var ed = e.target.closest('[data-invedit]');
        if (ed) { e.preventDefault(); m.classList.remove('open'); V.sec('invoices')._edit(inv.rows[+ed.dataset.invedit]); return; }
        var b = e.target.closest('[data-act]'); if (!b) return;
        var r = inv.rows[+b.closest('tr').dataset.inv];
        if (b.dataset.act === 'charge') { var amt = r.bal; r.paid = (r.paid || 0) + amt; V.toast(cl.card + ' charged ' + V.money(amt) + ' for ' + r.id + ' (preview only, no real charge).'); again(); return; }
        V.RUN.pay(r, inv, again);
    });
};

/* ---------- table cells ---------- */
function cellLink(s, r, inner) { return '<a href="#" class="lnk" data-open="' + r._i + '" title="' + (LINKACT[s.key] ? 'Open' : 'Edit') + '">' + inner + '</a>'; }
function cell(s, c, r) {
    var v = r[c[0]], t = c[2];
    if (LINK[s.key] === c[0] && !(s.key === 'jobs')) {
        var inner = c[0] === 'name' && (r.email || r.contact) ? '<b>' + V.esc(v) + '</b><small>' + V.esc(r.contact ? r.contact + ' · ' + r.email : r.email) + '</small>'
            : s.key === 'documents' ? '<b><i class="fa-regular ' + (r.type === '1099' ? 'fa-file-lines' : 'fa-file-pdf') + '" style="color:var(--r);margin-right:6px"></i>' + V.esc(v) + '</b><small>' + V.esc(r.size || '') + '</small>'
            : '<b>' + V.esc(v) + '</b>';
        return '<a href="#" class="lnk" data-open="' + r._i + '" title="' + (LINKACT[s.key] ? 'Open' : 'Edit') + '">' + inner + '</a>';
    }
    if (s.key === 'clients' && c[0] === 'bal') return balBox(r.name, owed(r.name));
    if (s.key === 'affiliates' && c[0] === 'end') return v == null ? '<span class="muted">No end</span>' : V.day(v) + (v < 0 ? ' <span class="pill1 red" style="color:#b91c1c;font-weight:700">Ended</span>' : '');
    if (s.key === 'affiliates' && c[0] === 'code') return '<span class="code1">' + V.esc(v) + '</span>';
    if ((s.key === 'clients' && c[0] === 'ref') || (s.key === 'requests' && c[0] === 'ref')) { var code = s.key === 'clients' ? r.refCode : r.ref, af = V.aff(code); if (!code) return '<span class="muted small">—</span>'; return af ? '<b>' + V.esc(af.name) + '</b><small><span class="code1">' + V.esc(V.cleanCode(code)) + '</span></small>' : '<span class="code1">' + V.esc(code) + '</span><small class="late">unknown code</small>'; }
    if (s.key === 'commissions' && c[0] === 'status' && v === 'Waiting for client payment') return V.pill('Waiting') + '<small>for the client to pay</small>';
    if (s.key === 'clients' && c[0] === 'rateNow') { var rn = V.rateNow(r); return '<a href="#" class="lnk" style="white-space:nowrap" data-rates="' + r._i + '"><b>' + V.money(rn.amt) + '</b>' + V.esc(rn.per) + '</a>' + (rn.pilot ? ' <span class="pill p-amber">Pilot</span>' : '') + '<small>' + V.esc(rn.why) + '</small>'; }
    if ((s.key === 'jobs' && c[0] === 'by')) return v ? '<b>' + V.esc(v) + '</b><small>' + V.esc(r.byHow || '') + '</small>' : '<span class="muted small">—</span>';
    if (s.key === 'finished' && c[0] === 'checkedBy') return v ? V.esc(v) : '<span class="muted small">Not checked yet</span>';
    if (s.key === 'users' && c[0] === 'role') return '<span class="pill ' + (v === 'Admin' ? 'p-red' : 'p-blue') + '">' + V.esc(v) + '</span>';
    if (s.key === 'users' && r.role === 'Admin' && ['billing', 'pay', 'rates', 'docs'].indexOf(c[0]) > -1) return '<span class="muted small">All (admin)</span>';
    if (s.key === 'invoices' && c[0] === 'bal' && r.billed != null) return balBox(r.client, r.bal);
    if (c[0] === 'margin') return V.money((r.price || 0) - (r.pay || 0));
    if (s.key === 'invoices' && c[0] === 'billed' && v == null) return '<span class="muted">Bills ' + V.day(r.next) + '</span><small>automatic</small>';
    if (s.key === 'jobs' && c[0] === 'inspector') { if (v) return V.esc(v); if (r.status === 'Offered') return '<span class="soon">Offered to ' + (r.offers || []).filter(function (o) { return o.ans === 'Waiting'; }).length + '</span><small>first to accept gets it</small>'; return '<b class="late">' + (r.status === 'Declined' ? 'Pick someone else' : 'Unassigned') + '</b>'; }
    if (s.key === 'jobs' && c[0] === 'status' && v === 'Declined') return V.pill('Declined') + '<small>by ' + V.esc(r.declinedBy || '') + '</small>';
    if (s.key === 'jobs' && c[0] === 'id') return cellLink(s, r, '<b>' + V.esc(v) + '</b>') + repeatBadge(r);
    if (s.key === 'requests' && c[0] === 'repeat') return v && v !== 'None' ? repeatBadge(r) : '<span class="muted small">—</span>';
    if (s.key === 'inspectors' && c[0] === 'cov') return '<span class="muted small">' + V.esc(r.covType || 'ZIP codes') + '</span><small>' + V.covTxt(r) + '</small>';
    if (s.key === 'jobs' && c[0] === 'due' && v != null && r.acc != null) {
        var rem = r.acc + 5, open1 = !(r.status === 'Approved'), base1 = V.day(v) + '<small class="' + (v < 0 ? 'late' : v <= 3 ? 'soon' : '') + '">' + (v < 0 ? (-v) + ' day' + (v === -1 ? '' : 's') + ' late' : v === 0 ? 'Due today' : 'In ' + v + ' day' + (v === 1 ? '' : 's')) + '</small>';
        return base1 + (open1 && r.inspector && rem < v ? '<small class="muted"><i class="fa-regular fa-envelope"></i> ' + (rem <= 0 ? 'Reminder sent ' + V.day(rem) : 'Reminder ' + V.day(rem)) + '</small>' : '');
    }
    if (s.key === 'documents' && c[0] === 'name') return '<b><i class="fa-regular ' + (r.type === '1099' ? 'fa-file-lines' : 'fa-file-pdf') + '" style="color:var(--r);margin-right:6px"></i>' + V.esc(v) + '</b><small>' + V.esc(r.size || '') + '</small>';
    if (s.key === 'documents' && c[0] === 'visible') return visible(r);
    if (t === 'money') return V.money(v);
    if (t === 'date') return v == null ? '' : V.day(v);
    if (t === 'due') {
        if (v == null) return '';
        var open = !(r.status === 'Paid' || r.status === 'Bills next' || r.status === 'Approved');
        if (!open) return V.day(v);
        var lbl = v < 0 ? (-v) + ' day' + (v === -1 ? '' : 's') + ' late' : v === 0 ? 'Due today' : 'In ' + v + ' day' + (v === 1 ? '' : 's');
        return V.day(v) + '<small class="' + (v < 0 ? 'late' : v <= 3 ? 'soon' : '') + '">' + lbl + '</small>';
    }
    if (t === 'score') return '<span class="pill ' + (v >= 85 ? 'p-green' : v >= 65 ? 'p-amber' : 'p-red') + '">' + v + '</span>';
    if (t === 'yesno' || t === 'status') return V.pill(v);
    if (c[0] === 'name' && (r.email || r.contact)) return '<b>' + V.esc(v) + '</b><small>' + V.esc(r.contact ? r.contact + ' · ' + r.email : r.email) + '</small>';
    return V.esc(v);
}
var VIEWF = {
    invoices: { open: function (r) { return r.status === 'Open' || r.status === 'Past due'; }, late: function (r) { return r.status === 'Past due'; }, soon: function (r) { return r.status === 'Open' && r.due <= 7; }, next: function (r) { return r.status === 'Bills next'; }, paid: function (r) { return r.status === 'Paid'; } },
    documents: { Agreement: function (r) { return r.type === 'Agreement'; }, Instructions: function (r) { return r.type === 'Instructions'; }, '1099': function (r) { return r.type === '1099' || r.type === 'W-9'; }, unsigned: function (r) { return r.signed === 'Waiting'; } },
    commissions: { owed: function (r) { return r.status === 'Owed'; }, wait: function (r) { return r.status === 'Waiting for client payment'; }, paid: function (r) { return r.status === 'Paid'; } }
};

function isYN(o) { return o && o.length === 2 && o.indexOf('Yes') > -1 && o.indexOf('No') > -1; }
function build(s, el) {
    var st = { q: '', sort: s.key === 'invoices' ? 'due' : null, dir: 1, page: 0, show: 10, showDel: false, view: s.views ? s.views[0][0] : 'all' };
    var acts = V.ACTS[s.key];
    var bulk = ['<option value="">Select Bulk Option</option>'];
    if (s.assign) bulk.push('<option value="assign">Assign Selected</option>', '<option value="offer">Offer Selected to Area</option>');
    if (s.approve) bulk.push('<option value="approve">Approve Selected</option>', '<option value="decline">Decline Selected</option>');
    if (s.markpaid) bulk.push('<option value="paid">Mark Selected Paid</option>');
    if (!s.readonly && !s.assign && s.key !== 'finished') bulk.push('<option value="delete">Delete Selected</option>', '<option value="restore">Restore Selected</option>');
    if (s.toggle) bulk.push('<option value="on">Set Active</option>', '<option value="off">Set Inactive</option>');
    if (s.retry) bulk.push('<option value="retry">Retry Selected</option>');
    if (s.key === 'tickets') bulk.push('<option value="close">Close Selected</option>');

    el.innerHTML = '<div class="sect-h"><h2><span class="ic ' + s.color + '"><i class="fa-solid ' + s.icon + '"></i></span>' + V.esc(s.title) + '</h2><p>' + V.esc(s.desc) + '</p></div>' +
        (s.key === 'invoices' ? '<div class="sums" data-sums></div>' : '') +
        (s.views ? '<div class="views">' + s.views.map(function (v) { return '<button class="chip' + (v[0] === st.view ? ' on' : '') + '" data-view="' + v[0] + '">' + v[1] + ' <span data-vc="' + v[0] + '"></span></button>'; }).join('') + '</div>' : '') +
        '<div class="sect-tools">' +
        (s.add ? '<button class="btn btn-primary btn-xs" data-new><i class="fa-solid ' + (s.key === 'documents' ? 'fa-upload' : 'fa-plus') + '"></i> ' + V.esc(s.add) + '</button>' : '') +
        (s.toggle ? '<button class="btn btn-green btn-xs" data-toggle><i class="fa-solid fa-toggle-on"></i> Toggle Active</button>' : '') +
        (bulk.length > 1 ? '<select class="sel" data-bulk aria-label="Bulk option">' + bulk.join('') + '</select>' : '') +
        (!s.readonly && !s.assign && s.key !== 'finished' ? '<label class="small muted" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-showdel> Show deleted</label>' : '') +
        '<div class="tools-right"><div class="srch"><i class="fa-solid fa-magnifying-glass"></i><input type="search" placeholder="Search..." data-q></div>Show <select class="sel" data-show><option>10</option><option>25</option><option>100</option></select></div></div>' +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:36px"><input type="checkbox" data-all aria-label="Select all"></th>' +
        s.cols.map(function (c) { return '<th data-sort="' + c[0] + '"' + (c[2] === 'r' || c[2] === 'money' ? ' class="r"' : '') + '>' + c[1] + '</th>'; }).join('') +
        (acts ? '<th>Action</th>' : '') + '</tr></thead><tbody></tbody><tfoot></tfoot></table></div>' +
        '<div class="tbl-foot"><span data-info></span><div class="pager" data-pager></div></div>';

    var tb = V.$('tbody', el);
    V.$('[data-q]', el).addEventListener('input', function (e) { st.q = e.target.value.toLowerCase(); st.page = 0; draw(); });
    V.$('[data-show]', el).addEventListener('change', function (e) { st.show = +e.target.value; st.page = 0; draw(); });
    var sd = V.$('[data-showdel]', el); if (sd) sd.addEventListener('change', function () { st.showDel = sd.checked; draw(); });
    V.$('[data-all]', el).addEventListener('change', function (e) { V.$$('tbody input[type=checkbox]', el).forEach(function (c) { c.checked = e.target.checked; }); });
    V.$$('th[data-sort]', el).forEach(function (th) { th.addEventListener('click', function () { var k = th.dataset.sort; st.dir = st.sort === k ? -st.dir : 1; st.sort = k; draw(); }); });
    V.$$('[data-view]', el).forEach(function (b) { b.addEventListener('click', function () { st.view = b.dataset.view; st.page = 0; V.$$('[data-view]', el).forEach(function (x) { x.classList.toggle('on', x === b); }); draw(); }); });
    var nb = V.$('[data-new]', el); if (nb) nb.addEventListener('click', function () { edit(null); });
    var tg = V.$('[data-toggle]', el); if (tg) tg.addEventListener('click', function () { apply('toggle'); });
    var bk = V.$('[data-bulk]', el); if (bk) bk.addEventListener('change', function () { if (bk.value) apply(bk.value); bk.value = ''; });
    tb.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]'); if (b) { var r = s.rows[+b.closest('tr').dataset.i]; V.RUN[b.dataset.act](r, s, draw); return; }
        var bal = e.target.closest('[data-bal]'); if (bal) { e.preventDefault(); V.clientInvoices(bal.dataset.bal); return; }
        var rt = e.target.closest('[data-rates]'); if (rt) { e.preventDefault(); ratesPopup(s.rows[+rt.dataset.rates]); return; }
        var op = e.target.closest('[data-open]');
        if (op) { e.preventDefault(); var row = s.rows[+op.dataset.open]; if (LINKACT[s.key]) V.RUN[LINKACT[s.key]](row, s, draw); else edit(row); }
    });

    function picked() { return V.$$('tbody input[type=checkbox]:checked', el).map(function (c) { return s.rows[+c.dataset.i]; }); }
    function apply(what) {
        var p = picked();
        if (!p.length) { V.toast('Tick at least one row first.'); return; }
        if (what === 'assign') { assignPopup(p, draw); return; }
        if (what === 'offer') { offerPopup(p.filter(function (r) { return !r.inspector; }), draw); return; }
        if (what === 'approve' && s.key === 'signups') { p.filter(function (r) { return r.status === 'New'; }).forEach(function (r) { V.RUN.approve(r, s, function () {}); }); draw(); return; }
        p.forEach(function (r) {
            if (what === 'delete') r._del = true;
            else if (what === 'restore') r._del = false;
            else if (what === 'toggle') r.active = r.active === 'Yes' ? 'No' : 'Yes';
            else if (what === 'on') r.active = 'Yes';
            else if (what === 'off') r.active = 'No';
            else if (what === 'approve') r.status = 'Approved';
            else if (what === 'decline') r.status = 'Declined';
            else if (what === 'retry') r.status = 'Resent';
            else if (what === 'close') r.status = 'Closed';
            else if (what === 'paid') { if (s.key === 'commissions') { var af = V.sec('affiliates').rows.filter(function (x) { return x.name === r.affiliate; })[0]; if (r.status !== 'Owed' || (af && af.w9 !== 'Yes')) return; } r.status = 'Paid'; r.payday = 0; }
        });
        V.toast(p.length + ' row(s) updated (preview only).');
        V.$('[data-all]', el).checked = false;
        draw();
    }
    function base() { prep(s); return s.rows.map(function (x, i) { x._i = i; return x; }).filter(function (x) { return !(x._del && !st.showDel); }); }
    function rows() {
        var vf = VIEWF[s.key] && VIEWF[s.key][st.view];
        var r = base().filter(function (x) {
            if (vf && !vf(x)) return false;
            if (!st.q) return true;
            return s.cols.some(function (c) { return String(x[c[0]] == null ? '' : x[c[0]]).toLowerCase().indexOf(st.q) > -1; });
        });
        if (st.sort) r.sort(function (a, b) { var x = a[st.sort], y = b[st.sort]; if (x == null) x = 1e9; if (y == null) y = 1e9; return (x > y ? 1 : x < y ? -1 : 0) * st.dir; });
        return r;
    }
    function draw() {
        var all = rows(), pages = Math.max(1, Math.ceil(all.length / st.show));
        st.page = Math.min(st.page, pages - 1);
        var part = all.slice(st.page * st.show, st.page * st.show + st.show);
        var ncol = s.cols.length + 1 + (acts ? 1 : 0);
        tb.innerHTML = part.length ? part.map(function (r) {
            var late = (s.key === 'invoices' && r.status === 'Past due') || (s.key === 'jobs' && !r.inspector);
            return '<tr data-i="' + r._i + '" class="' + (r._del ? 'deleted' : '') + (late ? ' hl' : '') + '"><td><input type="checkbox" data-i="' + r._i + '" aria-label="Select row"></td>' +
                s.cols.map(function (c) { return '<td' + (c[2] === 'r' || c[2] === 'money' ? ' class="r"' : '') + '>' + cell(s, c, r) + '</td>'; }).join('') +
                (acts ? '<td class="acts">' + acts(r) + '</td>' : '') + '</tr>';
        }).join('') : '<tr><td colspan="' + ncol + '" class="empty">No records found</td></tr>';
        if (s.key === 'invoices') {
            var tot = function (f) { return all.reduce(function (t, r) { return t + (r[f] || 0); }, 0); };
            V.$('tfoot', el).innerHTML = all.length ? '<tr><td></td><td colspan="6"><b>' + all.length + ' invoices</b></td><td class="r"><b>' + V.money(tot('amount')) + '</b></td><td class="r"><b>' + V.money(tot('bal')) + '</b></td><td colspan="3"></td></tr>' : '';
            var b = base(), sum = function (f) { return V.money(b.filter(f).reduce(function (t, r) { return t + r.bal; }, 0)); }, n = function (f) { return b.filter(f).length; };
            var F = VIEWF.invoices;
            V.$('[data-sums]', el).innerHTML =
                '<div class="sum"><span>Open (not paid)</span><b>' + sum(F.open) + '</b><small>' + n(F.open) + ' invoices</small></div>' +
                '<div class="sum red"><span>Past due</span><b>' + sum(F.late) + '</b><small>' + n(F.late) + ' invoices</small></div>' +
                '<div class="sum amber"><span>Due in the next 7 days</span><b>' + sum(F.soon) + '</b><small>' + n(F.soon) + ' invoices</small></div>' +
                '<div class="sum grey"><span>Bills next (automatic)</span><b>' + V.money(b.filter(F.next).reduce(function (t, r) { return t + r.amount; }, 0)) + '</b><small>next run ' + V.day(Math.min.apply(null, b.filter(F.next).map(function (r) { return r.next; }))) + '</small></div>';
        }
        if (s.views) s.views.forEach(function (v) { var f = VIEWF[s.key] && VIEWF[s.key][v[0]], c = V.$('[data-vc="' + v[0] + '"]', el); if (c) c.textContent = base().filter(function (x) { return !f || f(x); }).length; });
        V.$$('th[data-sort]', el).forEach(function (th) { th.classList.toggle('asc', th.dataset.sort === st.sort && st.dir === 1); th.classList.toggle('desc', th.dataset.sort === st.sort && st.dir === -1); });
        V.$('[data-info]', el).textContent = 'Showing ' + (all.length ? st.page * st.show + 1 : 0) + '–' + (st.page * st.show + part.length) + ' of ' + all.length + ' records';
        var p = '<button data-p="' + (st.page - 1) + '"' + (st.page === 0 ? ' disabled' : '') + '>‹</button>';
        for (var i = 0; i < pages; i++) p += '<button data-p="' + i + '"' + (i === st.page ? ' class="on"' : '') + '>' + (i + 1) + '</button>';
        p += '<button data-p="' + (st.page + 1) + '"' + (st.page >= pages - 1 ? ' disabled' : '') + '>›</button>';
        V.$('[data-pager]', el).innerHTML = p;
        V.$$('[data-p]', el).forEach(function (b) { b.addEventListener('click', function () { st.page = +b.dataset.p; draw(); }); });
        V.refresh();
    }

    // Add / Edit pop-up (SMK: addagency.php / editagency.php style)
    function edit(row) {
        var m = V.$('#editModal');
        if (!m) { m = document.createElement('div'); m.id = 'editModal'; m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); document.body.appendChild(m); }
        var isNew = !row, r = row || {};
        m.innerHTML = '<div class="modal-box"><div class="modal-h"><h3>' + (isNew ? V.esc(s.add) : s.key === 'invoices' ? 'Edit invoice ' + V.esc(r.id) + ' · ' + V.esc(r.client) : 'Edit: ' + V.esc(r.name || r.title || r.subject || r.client || r.inspector || r.id)) + '</h3><button class="modal-x" data-x aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>' +
            '<form data-f><div class="modal-b">' + s.fields.map(function (f) {
                var v = r[f[0]] == null ? '' : r[f[0]], wide = f[2] === 'textarea' || f[2] === 'file' || f[1].length > 22 ? ' class="wide"' : '';
                // Yes / No = on/off switch; Admin / Staff = two radio cards; other lists stay a dropdown
                if (f[2] === 'select' && isYN(f[3])) return '<label class="sw-row wide"><input type="checkbox" class="sw" role="switch" name="' + f[0] + '" value="Yes"' + (v === 'Yes' || (v === '' && f[3][0] === 'Yes') ? ' checked' : '') + '><span class="sw-ui" aria-hidden="true"></span><span class="sw-t">' + f[1] + '</span></label>';
                if (f[2] === 'select' && f[0] === 'role' && s.key === 'users') return '<fieldset class="rad wide"><legend>' + f[1] + '</legend>' + f[3].map(function (o) {
                    return '<label><input type="radio" name="role" value="' + V.esc(o) + '"' + ((v || f[3][0]) === o ? ' checked' : '') + '><span><b>' + V.esc(o) + '</b><small>' + (o === 'Admin' ? 'Sees everything, can add other admins' : 'Only sees the areas switched on below') + '</small></span></label>';
                }).join('') + '</fieldset>';
                if (f[2] === 'select') return '<label' + wide + '>' + f[1] + '<select name="' + f[0] + '">' + f[3].map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + V.esc(o) + '</option>'; }).join('') + '</select></label>';
                if (f[2] === 'textarea') return '<label class="wide">' + f[1] + '<textarea name="' + f[0] + '">' + V.esc(v) + '</textarea></label>';
                if (f[2] === 'file') return '<label class="wide">' + f[1] + '<input type="file" name="' + f[0] + '" accept=".pdf,.doc,.docx">' + (r.name ? '<small class="muted">Now: ' + V.esc(r.name) + '</small>' : '') + '</label>';
                if (f[2] === 'date') { if (f[3] === 'blank' && (v == null || v === '')) return '<label' + wide + '>' + f[1] + '<input type="date" name="' + f[0] + '" value=""></label>'; var d = v === '' || v == null ? V.date(0) : V.date(v); return '<label' + wide + '>' + f[1] + '<input type="date" name="' + f[0] + '" value="' + d.toISOString().slice(0, 10) + '"></label>'; }
                return '<label' + wide + '>' + f[1] + '<input type="' + (f[2] === 'number' ? 'number' : 'text') + '" name="' + f[0] + '" value="' + V.esc(v) + '"></label>';
            }).join('') + (s.key === 'clients' ? '<p class="wide note1"><i class="fa-solid fa-credit-card"></i> The card is charged automatically <b>only when the agreement is signed</b>. Only the last 4 digits are ever shown.</p>' : '') +
            (s.key === 'documents' ? '<p class="wide note1"><i class="fa-solid fa-lock"></i> Clients and inspectors only see their own files. 1099s are private: admin + that inspector only.</p>' : '') +
            (s.key === 'clients' ? '<p class="wide note1"><i class="fa-solid fa-tags"></i> <b>Rates:</b> while the Pilot Program runs, jobs use the pilot rate. After the end date they use the contract rate. If you fill in "Rate by number of stores", the client\'s store count picks the contract rate.</p>' : '') +
            (s.key === 'affiliates' ? '<p class="wide note1"><i class="fa-solid fa-handshake"></i> Give the <b>code</b> to the affiliate (for example on their podcast). A new client types it on the Request Inspection form, or you add it to the client. <b>Recurring</b> = their % of every payment that client makes, for the months set. <b>One-time</b> = one payment after the client\'s first payment. Commission is owed only after the client pays. <b>Sample rules</b>: Don to confirm.</p>' : '') +
            (s.key === 'users' ? '<p class="wide note1"><i class="fa-solid fa-user-shield"></i> <b>Admin</b> = sees everything and can add other admins (all switches on). <b>Staff</b> = only the areas switched on. 1099s are never shown to staff. Real system: the server checks this on every page and request.</p>' : '') +
            '</div><div class="modal-f"><button type="button" class="btn btn-ghost btn-xs" data-x>Close</button><button type="submit" class="btn btn-primary btn-xs"><i class="fa-solid fa-floppy-disk"></i> Save</button></div></form></div>';
        m.classList.add('open');
        V.$$('[data-x]', m).forEach(function (b) { b.addEventListener('click', function () { m.classList.remove('open'); }); });
        // switches that depend on each other
        var form = V.$('[data-f]', m);
        var sync = function () {
            var role = V.$('input[name=role]:checked', form);
            if (role) ['billing', 'pay', 'rates', 'docs'].forEach(function (k) {
                var c = V.$('[name=' + k + ']', form); if (!c) return;
                if (role.value === 'Admin') { if (!c.disabled) c.dataset.was = c.checked ? '1' : '0'; c.checked = true; c.disabled = true; }
                else if (c.disabled) { c.disabled = false; c.checked = c.dataset.was === '1'; }
                c.closest('label').title = c.disabled ? 'Admins always see everything' : '';
            });
            var ag = V.$('[name=agree]', form), au = V.$('[name=auto]', form);
            if (ag && au) { au.disabled = !ag.checked; if (!ag.checked) au.checked = false; au.closest('label').title = ag.checked ? '' : 'Switch on "Agreement signed" first'; }
            var pi = V.$('[name=pilot]', form);
            if (pi) ['pilotRate', 'pilotEnds'].forEach(function (k) { var x = V.$('[name=' + k + ']', form); if (x) x.closest('label').classList.toggle('dim', !pi.checked); });
        };
        form.addEventListener('change', sync); sync();
        V.$('[data-f]', m).addEventListener('submit', function (e) {
            e.preventDefault();
            var fd = new FormData(e.target), target = row || {}, msg = '';
            s.fields.forEach(function (f) {
                var v = fd.get(f[0]);
                if (f[2] === 'select' && isYN(f[3])) v = v ? 'Yes' : 'No'; // switch: ticked = Yes
                if (f[2] === 'file') { if (v && v.name) target.name = v.name; else if (!target.name) target.name = 'New document.pdf'; return; }
                if (f[2] === 'number') v = +v || 0;
                if (f[2] === 'date') { if (!v) v = f[3] === 'blank' ? null : 0; else { var d = new Date(v + 'T12:00:00'); v = Math.round((d - V.date(0)) / 864e5); } }
                target[f[0]] = v;
            });
            if (s.key === 'clients' && target.auto === 'Yes' && target.agree !== 'Yes') { target.auto = 'No'; msg = ' Auto-charge stays OFF until the agreement is signed.'; }
            if (s.key === 'clients' && target.auto === 'Yes' && !target.card) { target.auto = 'No'; msg = ' Auto-charge stays OFF: no card on file.'; }
            if (s.key === 'affiliates') {
                target.code = V.cleanCode(target.code);
                if (!String(target.name || '').trim() || !target.code) { V.toast('Type a name and a code (letters and numbers).'); return; }
                if (s.rows.some(function (a) { return a !== row && !a._del && V.sameCode(a.code, target.code); })) { V.toast('The code ' + target.code + ' is already used. Pick another one.'); return; }
                if (target.start != null && target.end != null && target.end < target.start) { V.toast('The End date is before the Start date. Fix the dates.'); return; }
                if (!row) { target.id = 'A-' + (s.rows.length + 1); msg = ' Code ' + target.code + ' is ready to share.'; }
                if (!V.affOn(target, 0)) msg += ' Note: the code does not work today (outside its dates).';
            }
            if (s.key === 'clients' && target.refCode) { target.refCode = V.cleanCode(target.refCode); if (!V.aff(target.refCode)) msg = ' Note: no affiliate has the code ' + target.refCode + '.'; else msg = ' Referred by ' + V.aff(target.refCode).name + '.'; }
            if (s.key === 'users') {
                if (!row && (!String(target.name || '').trim() || !/@/.test(target.email || ''))) { V.toast('Type a name and an email.'); return; }
                if (target.role === 'Admin') { ['billing', 'pay', 'rates', 'docs'].forEach(function (k) { target[k] = 'Yes'; }); }
                var admins = s.rows.concat(row ? [] : [target]).filter(function (u) { return !u._del && u.role === 'Admin' && u.active === 'Yes'; });
                if (!admins.length) { target.role = 'Admin'; target.active = 'Yes'; msg = ' There must be at least one active admin, so this person stays Admin.'; }
                if (!row) { target.id = 'U-' + (s.rows.length + 1); target.last = null; msg += target.role === 'Admin' ? ' New admin added: they see everything.' : ' New staff member: they only see the areas switched on.'; }
            }
            if (s.key === 'documents' && isNew) { target.up = 0; target.size = '—'; target.signed = target.needsign === 'Yes' ? 'Waiting' : '—'; }
            if (s.key === 'invoices' && isNew) { target.paid = 0; target.id = 'INV-' + (2613 + s.rows.length); var ln = V.makeCommission(target); if (ln) msg = ' Commission line ' + ln.id + ' made for ' + ln.affiliate + ' (' + V.money(ln.amount) + ', owed after the client pays).'; }
            if (!row) { target.id = target.id || 'NEW-' + (s.rows.length + 1); if (s.key === 'jobs' || s.key === 'requests') { target.by = V.me.name; target.byHow = 'Admin · typed in'; V.log(target, 'Typed in by hand'); } s.rows.unshift(target); }
            m.classList.remove('open');
            V.toast((row ? 'Saved' : 'Added') + (window.VIGNDB && VIGNDB.TABLES[s.key] ? ' (saved in this browser).' : ' (preview only, not stored).') + msg);
            draw();
        });
    }
    s._edit = edit;
    draw();
    return draw;
}
})(window.VA);
