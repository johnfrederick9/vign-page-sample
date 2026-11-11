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
var PILL = { Yes: 'p-green', No: 'p-grey', Active: 'p-green', Published: 'p-green', Paid: 'p-green', Approved: 'p-green', Closed: 'p-grey', Resent: 'p-green', Signed: 'p-green', 'Made into job': 'p-green',
    New: 'p-blue', Open: 'p-blue', Sent: 'p-blue', Assigned: 'p-blue', Pending: 'p-amber', Waiting: 'p-amber', Draft: 'p-amber', 'Waiting for VIGN': 'p-amber', 'In field': 'p-amber', 'Waiting review': 'p-amber', 'Sent back': 'p-amber',
    Overdue: 'p-red', 'Past due': 'p-red', Declined: 'p-red', Failed: 'p-red', Unassigned: 'p-red', Inactive: 'p-grey', 'Bills next': 'p-grey' };
V.pill = function (v) { return '<span class="pill ' + (PILL[v] || 'p-grey') + '">' + V.esc(v) + '</span>'; };

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
}
var NEED = {
    requests: function (r) { return r.status === 'New'; },
    jobs: function (r) { return !r.inspector; },
    signups: function (r) { return r.status === 'New'; },
    finished: function (r) { return r.status === 'Waiting review'; },
    invoices: function (r) { return r.status === 'Open' || r.status === 'Past due'; },
    statements: function (r) { return r.status === 'Pending'; },
    documents: function (r) { return r.signed === 'Waiting'; }
};
function shown() { return V.sections.filter(function (s) { return !s.hidden; }); }
function live(s) { return s.rows.filter(function (r) { return !r._del; }); }
function count(s) { prep(s); return NEED[s.key] ? live(s).filter(NEED[s.key]).length : live(s).length; }

// ---------- top navbar ----------
V.shell = function (page) {
    var links = [['menu', 'index.html', 'fa-table-cells-large', 'Admin Menu']];
    document.body.insertAdjacentHTML('afterbegin',
        '<header class="anav" id="anav"><div class="anav-in"><a class="anav-brand" href="index.html"><img src="../images/vign-logo.png" alt="VIGN USA"><span>Admin</span></a>' +
        '<button class="anav-burger" id="burger" aria-label="Menu"><i class="fa-solid fa-bars"></i></button>' +
        '<nav class="anav-links" aria-label="Admin menu">' + links.map(function (l) {
            return '<a href="' + l[1] + '"' + (l[0] === page ? ' class="on"' : '') + ' data-nav="' + l[0] + '"><i class="fa-solid ' + l[2] + '"></i>' + l[3] + (l[4] ? '<span class="cnt">' + l[4] + '</span>' : '') + '</a>';
        }).join('') + '</nav>' +
        '<div class="anav-right"><a class="anav-user" href="login.html" title="Sign out"><span><b>' + V.esc(V.me.name) + '</b><small>' + V.esc(V.me.role) + '</small></span><span class="av">' + V.me.name.split(' ').map(function (p) { return p[0]; }).join('') + '</span></a></div></div></header>');
    V.$('#burger').addEventListener('click', function () { V.$('#anav').classList.toggle('open'); });
};

// ---------- Admin Menu ----------
V.menu = function (app) {
    var html = '<div class="band"><div><h1><i class="fa-solid fa-table-cells-large"></i>Admin Menu</h1><p>Click a tile to open its list. Everything here is sample data.</p></div></div>';
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
        if (scroll) V.$('#sec-' + key).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// tile numbers + "Needs you today" bar
V.refresh = function () {
    V.sections.forEach(function (s) { var n = V.$('[data-n="' + s.key + '"]'); if (n) { var c = count(s); n.textContent = c; n.classList.toggle('hot', !!NEED[s.key] && c > 0); } });
    var inv = V.sec('invoices'); prep(inv);
    var openAmt = live(inv).filter(NEED.invoices).reduce(function (t, r) { return t + r.bal; }, 0);
    var lateAmt = live(inv).filter(function (r) { return r.status === 'Past due'; }).reduce(function (t, r) { return t + r.bal; }, 0);
    var items = [['requests', 'fa-inbox', count(V.sec('requests')), 'new requests'], ['jobs', 'fa-user-check', count(V.sec('jobs')), 'jobs need an inspector'],
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
            jobs.forEach(function (j) { j.inspector = r.value; if (j.status === 'Unassigned' || j.status === 'Sent back') j.status = 'Assigned'; });
            V.toast(jobs.length + ' job(s) assigned to ' + r.value + '. They see it in their portal now (preview only).'); done();
        });
}
V.ACTS = {
    requests: function (r) { return r.status === 'New' ? btn('job', 'fa-briefcase', 'Make job', 'pri') + btn('decline', 'fa-xmark', 'Decline') : btn('view', 'fa-eye', 'View'); },
    jobs: function (r) { return btn('assign', 'fa-user-check', r.inspector ? 'Reassign' : 'Assign', r.inspector ? '' : 'pri'); },
    signups: function (r) { return r.status === 'New' ? btn('approve', 'fa-check', 'Approve', 'grn') + btn('decline', 'fa-xmark', 'Decline') : ''; },
    finished: function (r) { return btn('review', r.status === 'Waiting review' ? 'fa-magnifying-glass' : 'fa-eye', r.status === 'Waiting review' ? 'Check' : 'View', r.status === 'Waiting review' ? 'pri' : ''); },
    invoices: function (r) { return r.billed == null ? '<span class="muted small">Automatic</span>' : (r.bal > 0 ? btn('pay', 'fa-money-check-dollar', 'Record payment') : '') + btn('pdf', 'fa-file-pdf', 'PDF'); },
    statements: function (r) { return r.status === 'Pending' ? btn('paid', 'fa-check', 'Mark paid', 'grn') : ''; },
    documents: function (r) { return btn('viewdoc', 'fa-eye', 'View') + btn('download', 'fa-download', 'Download'); }
};
V.RUN = {
    job: function (r, s, done) {
        var id = 'VG-' + (24132 + V.sec('jobs').rows.length);
        V.sec('jobs').rows.unshift({ id: id, client: r.company, service: r.service, addr: r.addr, due: r.wanted, inspector: '', status: 'Unassigned' });
        r.status = 'Made into job'; V.toast(r.id + ' is now job ' + id + '. Next: assign it in "Assign Jobs".'); done(); V.sec('jobs')._draw();
    },
    decline: function (r, s, done) { r.status = 'Declined'; V.toast(r.id + ' declined (preview only).'); done(); },
    view: function (r) { V.modal(V.esc(r.id) + ' · ' + V.esc(r.company), '<dl class="dl1"><dt>Service</dt><dd>' + V.esc(r.service) + '</dd><dt>Address</dt><dd>' + V.esc(r.addr) + '</dd><dt>Contact</dt><dd>' + V.esc(r.contact) + '</dd><dt>Wanted by</dt><dd>' + V.day(r.wanted) + '</dd><dt>Notes</dt><dd>' + V.esc(r.notes || '—') + '</dd><dt>Status</dt><dd>' + V.pill(r.status) + '</dd></dl>'); },
    assign: function (r, s, done) { assignPopup([r], done); },
    approve: function (r, s, done) {
        r.status = 'Approved';
        var ins = V.sec('inspectors'); ins.rows.unshift({ id: 'INS-0' + (470 + ins.rows.length), name: r.name, role: r.role, email: r.email, phone: '', area: r.area, zips: '', open: 0, done: 0, score: 0, active: 'Yes' }); if (ins._draw) ins._draw();
        V.toast(r.name + ' approved and added to the network. They can now be assigned jobs (preview only).'); done();
    },
    review: function (r, s, done) {
        var cls = r.score >= 85 ? 'p-green' : r.score >= 65 ? 'p-amber' : 'p-red';
        var body = '<div class="rv1"><div class="rv1-score"><span class="pill ' + cls + '">' + r.score + '</span><small>score<br>(sample formula)</small></div><dl class="dl1"><dt>Client</dt><dd>' + V.esc(r.client) + '</dd><dt>Inspector</dt><dd>' + V.esc(r.inspector) + '</dd><dt>Form</dt><dd>' + V.esc(r.form) + '</dd><dt>Sent in</dt><dd>' + V.day(r.sent) + '</dd><dt>Client can see</dt><dd>' + V.pill(r.seen) + '</dd></dl></div>' +
            '<h4 class="h4">Problems found by the checks</h4>' + (r.flags.length ? '<ul class="flags1">' + r.flags.map(function (f) { return '<li><i class="fa-solid fa-triangle-exclamation"></i>' + V.esc(f) + '</li>'; }).join('') + '</ul>' : '<p class="ok1"><i class="fa-solid fa-circle-check"></i> Every check passed</p>') +
            '<h4 class="h4">Photos (' + r.photos + ')</h4><div class="phs">' + Array.apply(null, Array(Math.min(r.photos, 8))).map(function (x, i) { return '<span><i class="fa-regular fa-image"></i><small>IMG_' + (3101 + i) + '</small></span>'; }).join('') + '</div>' +
            (r.status === 'Waiting review' ? '<label class="fld1">If you send it back, tell the inspector why<textarea id="why">' + V.esc(r.flags.join('. ')) + '</textarea></label>' : '');
        var m = V.modal('Check report ' + V.esc(r.id), body, r.status === 'Waiting review' ? '<i class="fa-solid fa-check"></i> Approve &amp; send to client' : '', r.status === 'Waiting review' ? function () {
            r.status = 'Approved'; r.seen = 'Yes'; V.toast(r.id + ' approved. ' + r.client + ' can see the report now (preview only).'); done();
        } : null, r.status === 'Waiting review' ? '<button type="button" class="btn btn-ghost btn-xs" data-back style="color:var(--r)"><i class="fa-solid fa-rotate-left"></i> Send back</button>' : '');
        var b = V.$('[data-back]', m); if (b) b.addEventListener('click', function () { r.status = 'Sent back'; m.classList.remove('open'); V.toast(r.id + ' sent back to ' + r.inspector + ' (preview only).'); done(); });
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
            (r.type === '1099' ? '<p class="note1"><i class="fa-solid fa-lock"></i> Tax forms have private details (SSN). Only admins and this inspector can open it. No public link.</p>' : ''));
    },
    download: function (r) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(['VIGN USA sample document (preview only)\n\n' + r.name + '\nFor: ' + r.who + '\n'], { type: 'text/plain' }));
        a.download = r.name.replace(/\.pdf$/, '') + ' (sample).txt'; a.click();
    }
};
function visible(r) {
    if (r.type === '1099') return '<i class="fa-solid fa-lock"></i> Admin + ' + V.esc(r.who) + ' only';
    if (/^All /.test(r.who)) return 'Admin + ' + V.esc(r.who.toLowerCase());
    return 'Admin + ' + V.esc(r.who);
}

/* ---------- table cells ---------- */
function cell(s, c, r) {
    var v = r[c[0]], t = c[2];
    if (c[0] === 'margin') return V.money((r.price || 0) - (r.pay || 0));
    if (s.key === 'invoices' && c[0] === 'billed' && v == null) return '<span class="muted">Bills ' + V.day(r.next) + '</span><small>automatic</small>';
    if (s.key === 'jobs' && c[0] === 'inspector') return v ? V.esc(v) : '<b class="late">Unassigned</b>';
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
    documents: { Agreement: function (r) { return r.type === 'Agreement'; }, Instructions: function (r) { return r.type === 'Instructions'; }, '1099': function (r) { return r.type === '1099'; }, unsigned: function (r) { return r.signed === 'Waiting'; } }
};

function build(s, el) {
    var st = { q: '', sort: s.key === 'invoices' ? 'due' : null, dir: 1, page: 0, show: 10, showDel: false, view: s.views ? s.views[0][0] : 'all' };
    var acts = V.ACTS[s.key];
    var bulk = ['<option value="">Select Bulk Option</option>'];
    if (s.assign) bulk.push('<option value="assign">Assign Selected</option>');
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
        (acts ? '<th>Action</th>' : '') + (s.fields.length ? '<th>Edit</th>' : '') + '</tr></thead><tbody></tbody><tfoot></tfoot></table></div>' +
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
        var ed = e.target.closest('[data-edit]'); if (ed) edit(s.rows[+ed.dataset.edit]);
    });

    function picked() { return V.$$('tbody input[type=checkbox]:checked', el).map(function (c) { return s.rows[+c.dataset.i]; }); }
    function apply(what) {
        var p = picked();
        if (!p.length) { V.toast('Tick at least one row first.'); return; }
        if (what === 'assign') { assignPopup(p, draw); return; }
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
            else if (what === 'paid') { r.status = 'Paid'; r.payday = 0; }
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
        var ncol = s.cols.length + 1 + (acts ? 1 : 0) + (s.fields.length ? 1 : 0);
        tb.innerHTML = part.length ? part.map(function (r) {
            var late = (s.key === 'invoices' && r.status === 'Past due') || (s.key === 'jobs' && !r.inspector);
            return '<tr data-i="' + r._i + '" class="' + (r._del ? 'deleted' : '') + (late ? ' hl' : '') + '"><td><input type="checkbox" data-i="' + r._i + '" aria-label="Select row"></td>' +
                s.cols.map(function (c) { return '<td' + (c[2] === 'r' || c[2] === 'money' ? ' class="r"' : '') + '>' + cell(s, c, r) + '</td>'; }).join('') +
                (acts ? '<td class="acts">' + acts(r) + '</td>' : '') +
                (s.fields.length ? '<td><button class="edit-btn" data-edit="' + r._i + '"><i class="fa-solid fa-pen"></i> Edit</button></td>' : '') + '</tr>';
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
        m.innerHTML = '<div class="modal-box"><div class="modal-h"><h3>' + (isNew ? V.esc(s.add) : 'Edit: ' + V.esc(r.name || r.title || r.subject || r.client || r.inspector || r.id)) + '</h3><button class="modal-x" data-x aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>' +
            '<form data-f><div class="modal-b">' + s.fields.map(function (f) {
                var v = r[f[0]] == null ? '' : r[f[0]], wide = f[2] === 'textarea' || f[2] === 'file' || f[1].length > 22 ? ' class="wide"' : '';
                if (f[2] === 'select') return '<label' + wide + '>' + f[1] + '<select name="' + f[0] + '">' + f[3].map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + V.esc(o) + '</option>'; }).join('') + '</select></label>';
                if (f[2] === 'textarea') return '<label class="wide">' + f[1] + '<textarea name="' + f[0] + '">' + V.esc(v) + '</textarea></label>';
                if (f[2] === 'file') return '<label class="wide">' + f[1] + '<input type="file" name="' + f[0] + '" accept=".pdf,.doc,.docx">' + (r.name ? '<small class="muted">Now: ' + V.esc(r.name) + '</small>' : '') + '</label>';
                if (f[2] === 'date') { var d = v === '' ? V.date(0) : V.date(v); return '<label' + wide + '>' + f[1] + '<input type="date" name="' + f[0] + '" value="' + d.toISOString().slice(0, 10) + '"></label>'; }
                return '<label' + wide + '>' + f[1] + '<input type="' + (f[2] === 'number' ? 'number' : 'text') + '" name="' + f[0] + '" value="' + V.esc(v) + '"></label>';
            }).join('') + (s.key === 'clients' ? '<p class="wide note1"><i class="fa-solid fa-credit-card"></i> The card is charged automatically <b>only when the agreement is signed</b>. Only the last 4 digits are ever shown.</p>' : '') +
            (s.key === 'documents' ? '<p class="wide note1"><i class="fa-solid fa-lock"></i> Clients and inspectors only see their own files. 1099s are private: admin + that inspector only.</p>' : '') +
            '</div><div class="modal-f"><button type="button" class="btn btn-ghost btn-xs" data-x>Close</button><button type="submit" class="btn btn-primary btn-xs"><i class="fa-solid fa-floppy-disk"></i> Save</button></div></form></div>';
        m.classList.add('open');
        V.$$('[data-x]', m).forEach(function (b) { b.addEventListener('click', function () { m.classList.remove('open'); }); });
        V.$('[data-f]', m).addEventListener('submit', function (e) {
            e.preventDefault();
            var fd = new FormData(e.target), target = row || {}, msg = '';
            s.fields.forEach(function (f) {
                var v = fd.get(f[0]);
                if (f[2] === 'file') { if (v && v.name) target.name = v.name; else if (!target.name) target.name = 'New document.pdf'; return; }
                if (f[2] === 'number') v = +v || 0;
                if (f[2] === 'date') { var d = new Date(v + 'T12:00:00'); v = Math.round((d - V.date(0)) / 864e5); }
                target[f[0]] = v;
            });
            if (s.key === 'clients' && target.auto === 'Yes' && target.agree !== 'Yes') { target.auto = 'No'; msg = ' Auto-charge stays OFF until the agreement is signed.'; }
            if (s.key === 'clients' && target.auto === 'Yes' && !target.card) { target.auto = 'No'; msg = ' Auto-charge stays OFF: no card on file.'; }
            if (s.key === 'documents' && isNew) { target.up = 0; target.size = '—'; target.signed = target.needsign === 'Yes' ? 'Waiting' : '—'; }
            if (s.key === 'invoices' && isNew) target.paid = 0;
            if (!row) { target.id = target.id || 'NEW-' + (s.rows.length + 1); s.rows.unshift(target); }
            m.classList.remove('open');
            V.toast((row ? 'Saved' : 'Added') + ' (preview only, not stored).' + msg);
            draw();
        });
    }
    draw();
    return draw;
}
})(window.VA);
