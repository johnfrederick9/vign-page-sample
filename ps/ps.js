/* =========================================================
   VIGN USA: Inspector / Shopper app (static preview)
   All data below is SAMPLE data. In the real system it comes from the server.
   Screens are modeled on LoyalServe (SMK) ps/: dashboard tiles, open jobs,
   full job status, new attempt + photo upload, results, commissions / payments.
   ========================================================= */
(function () {
'use strict';

// ---------------------------------------------------------------- sample data
var ME = { name: 'Maria Lopez', id: 'INS-0417', area: 'Columbus, OH' };
var PHONE = '516 924-0087', TEL = '+15169240087';

var SERVICES = {
    mystery:    ['Mystery Shoppers', 'fa-cart-shopping'],
    loan:       ['Loan Servicing', 'fa-house'],
    property:   ['Property & Field Inspections', 'fa-clipboard-check'],
    collateral: ['Loan Servicing & Collateral', 'fa-car'],
    cx:         ['Mystery Shopping & CX', 'fa-magnifying-glass']
};

// Rating scale from the VIG Property Inspection Forms. Lower is better.
var RATINGS = [
    ['1', 'Good', 'No issue observed'],
    ['2', 'Minor', 'Minor concern'],
    ['3', 'Repair', 'Repair indicated'],
    ['4', 'Urgent', 'Urgent safety concern'],
    ['NO', 'N/O', 'Not observed'],
    ['NA', 'N/A', 'Not applicable']
];
// Score formula is NOT decided yet (configurable later): 1=100, 2=67, 3=33, 4=0, N/O and N/A left out.
var POINTS = { '1': 100, '2': 67, '3': 33, '4': 0 };

// Checklists copied from the VIG forms docx (the mystery form is a placeholder until VIGN sends theirs).
var FORMS = {
    residential: { title: 'Residential Property Inspection',
        items: ['Roof visible from ground / drainage', 'Foundation / exterior walls', 'Doors / windows / locks', 'Siding / paint / exterior finish', 'Driveway / walks / stairs / railings', 'Yard / trees / fencing', 'Ceilings / walls / floors', 'Kitchen / cabinets / fixtures', 'Bathrooms / plumbing leaks visible', 'Heating / cooling (visual only)', 'Electrical outlets / panels (visual only)', 'Smoke / CO alarms (presence only)', 'Water intrusion / stains / mold-like growth', 'Pest / vandalism indicators'],
        extra: [['Occupancy indication', ['Occupied', 'Vacant', 'Uncertain']], ['Utilities visibly on', ['Yes', 'No', 'Unknown']]] },
    vacant: { title: 'Vacant Property / Preservation Inspection',
        items: ['Boarded / broken openings', 'Locks / entry security / forced entry', 'Doors / windows / garage', 'Roof / gutters / structural indicators', 'Standing water / drainage', 'Lawn growth / vegetation / trees', 'Trash / debris / dumped items', 'Graffiti / vandalism / trespass signs', 'Visible water damage / freezing risk', 'Utilities / meters (visual indicators)', 'Pool / open hazards / exposed holes', 'Mailbox / notices / deliveries', 'Fire / storm / wind damage', 'HOA / municipal notices observed'],
        extra: [['Occupancy', ['Appears occupied', 'Appears vacant', 'Unable to determine']], ['Inspection', ['Drive-by', 'Walk-up', 'Authorized interior']], ['Preservation request', ['None', 'Lawn', 'Debris', 'Board / secure', 'Winterization review']]] },
    commercial: { title: 'Commercial Property Inspection',
        items: ['Storefront / facade / signage', 'Roof / gutters (visible only)', 'Parking / pavement / access', 'Landscaping / grounds / drainage', 'Doors / glazing / security', 'Common areas / hallways / stairs', 'Interior walls / ceilings / flooring', 'Restrooms / water fixtures', 'Loading / service areas', 'HVAC equipment (visual only)', 'Lighting / visible wiring', 'Fire extinguishers / exits (presence / obstruction)', 'Accessibility concerns observed', 'Leaks / odors / water damage', 'Sanitation / waste / pests'],
        extra: [['Business status observed', ['Operating', 'Closed', 'Unclear']]] },
    mystery: { title: 'Mystery Shop Visit (sample form)',
        items: ['Greeting and first impression', 'Staff knowledge and helpfulness', 'Wait time and speed of service', 'Store cleanliness and presentation', 'Policy and procedure compliance', 'Checkout and closing experience'],
        extra: [['Were you offered help without asking?', ['Yes', 'No']], ['Receipt kept?', ['Yes', 'No']]] }
};

// due = days from today (negative = overdue)
var JOBS = [
    { id: 'VG-24081', svc: 'property', form: 'residential', client: 'First Harbor Mortgage', addr: '1428 Maple Ridge Dr', city: 'Columbus, OH 43215', due: 0, win: '9:00 AM – 12:00 PM', fee: 45, mi: 3.2, access: 'Interior authorized', status: 'assigned',
      contact: 'Occupant: J. Carter, (614) 555-0142. Call 30 minutes before you arrive.',
      notes: 'The client is checking a reported roof leak. Take extra photos of the upper-floor ceilings.',
      files: ['Inspection order.pdf', 'Prior report (2025).pdf'] },
    { id: 'VG-24070', svc: 'loan', form: 'vacant', client: 'Lakeshore Loan Servicing', addr: '77 Birchwood Ct', city: 'Grove City, OH 43123', due: -1, win: 'Any time', fee: 35, mi: 9.8, access: 'Exterior only', status: 'assigned',
      contact: 'No contact. The property is believed to be vacant.',
      notes: 'Do not enter. Do not disturb locks, utilities or belongings.', files: ['Inspection order.pdf'] },
    { id: 'VG-24082', svc: 'mystery', form: 'mystery', client: 'Bright Brew Coffee Co.', addr: 'Bright Brew #112, 220 N High St', city: 'Columbus, OH 43215', due: 0, win: '7:00 AM – 10:00 AM', fee: 25, mi: 1.4, access: 'Customer visit', status: 'in_field',
      contact: 'Visit as a regular customer. Do not tell staff you are a shopper.',
      notes: 'Buy one drink and keep the receipt. Up to $6 is reimbursed.', files: ['Shopper guidelines.pdf'] },
    { id: 'VG-24077', svc: 'collateral', form: 'vacant', client: 'Midway Auto & Home Credit', addr: '3901 Sawmill Rd', city: 'Dublin, OH 43017', due: 2, win: 'Any time', fee: 30, mi: 12.6, access: 'Exterior only', status: 'assigned',
      contact: 'No contact required.',
      notes: 'Confirm the collateral is at the address on file. Photograph the house number.', files: ['Inspection order.pdf'] },
    { id: 'VG-24085', svc: 'property', form: 'commercial', client: 'Keystone Insurance Group', addr: '615 Polaris Pkwy, Suite 200', city: 'Westerville, OH 43082', due: 4, win: '1:00 PM – 4:00 PM', fee: 65, mi: 15.1, access: 'Interior authorized', status: 'assigned',
      contact: 'Building manager: D. Patel, (614) 555-0199.',
      notes: 'Annual insurance condition check. Include photos of exits and fire extinguishers.', files: ['Inspection order.pdf', 'Floor plan.pdf'] },
    // already sent in
    { id: 'VG-24066', svc: 'property', form: 'residential', client: 'First Harbor Mortgage', addr: '18 Elm St', city: 'Hilliard, OH 43026', due: -2, fee: 45, mi: 7.0, access: 'Interior authorized', status: 'returned', sent: -2, score: 76,
      returned: 'Item 7 "Ceilings / walls / floors" is rated 3 (Repair) but has no photo. Please add a photo of the damage and send it again.' },
    { id: 'VG-24061', svc: 'loan', form: 'vacant', client: 'Lakeshore Loan Servicing', addr: '402 Oakview Ave', city: 'Columbus, OH 43207', due: -1, fee: 35, mi: 5.5, access: 'Exterior only', status: 'submitted', sent: -1, score: 71 },
    { id: 'VG-24058', svc: 'mystery', form: 'mystery', client: 'Bright Brew Coffee Co.', addr: 'Bright Brew #108, 1550 W Lane Ave', city: 'Columbus, OH 43221', due: -3, fee: 25, mi: 4.1, access: 'Customer visit', status: 'approved', sent: -3, score: 92, paid: false },
    { id: 'VG-24049', svc: 'property', form: 'residential', client: 'Keystone Insurance Group', addr: '9 Willow Bend', city: 'Worthington, OH 43085', due: -6, fee: 45, mi: 8.3, access: 'Interior authorized', status: 'approved', sent: -6, score: 84, paid: true },
    { id: 'VG-24040', svc: 'collateral', form: 'vacant', client: 'Midway Auto & Home Credit', addr: '58 Kenny Rd', city: 'Upper Arlington, OH 43221', due: -9, fee: 30, mi: 6.2, access: 'Exterior only', status: 'approved', sent: -9, score: 88, paid: true }
];

// ---------------------------------------------------------------- helpers
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function param(k) { return new URLSearchParams(location.search).get(k); }
function job(id) { for (var i = 0; i < JOBS.length; i++) if (JOBS[i].id === id) return JOBS[i]; return null; }
function day(offset) { var d = new Date(); d.setDate(d.getDate() + offset); return d; }
function fmtDay(offset) { return day(offset).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }
function money(n) { return '$' + n.toFixed(2); }
function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

function dueInfo(d) {
    if (d < 0) return [d === -1 ? 'Overdue 1 day' : 'Overdue ' + (-d) + ' days', 'due-late'];
    if (d === 0) return ['Due today', 'due-today'];
    if (d === 1) return ['Due tomorrow', 'due-soon'];
    return ['Due ' + fmtDay(d), 'due-later'];
}
var STATUS = { assigned: ['Assigned', 'st-assigned'], in_field: ['In progress', 'st-field'], submitted: ['Waiting for review', 'st-submitted'], returned: ['Needs changes', 'st-returned'], approved: ['Approved', 'st-approved'] };
function scoreClass(s) { return s >= 85 ? 'r1' : s >= 65 ? 'r2' : s >= 40 ? 'r3' : 'r4'; }
function mapsUrl(j) { return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(j.addr + ', ' + j.city); }
function svcHtml(j) { var s = SERVICES[j.svc]; return '<span class="svc"><i class="fa-solid ' + s[1] + '" aria-hidden="true"></i>' + esc(s[0]) + '</span>'; }
function isOpen(j) { return j.status === 'assigned' || j.status === 'in_field'; }

// ---------------------------------------------------------------- app shell
function shell(page, title, back) {
    var returned = JOBS.filter(function (j) { return j.status === 'returned'; }).length;
    var tabs = [['jobs', 'index.html', 'fa-list-check', 'My Jobs'], ['sent', 'sent.html', 'fa-paper-plane', 'Sent In'], ['pay', 'pay.html', 'fa-wallet', 'My Pay'], ['help', 'tel:' + TEL, 'fa-phone', 'Call Office']];
    var initials = ME.name.split(' ').map(function (p) { return p[0]; }).join('');
    var top = '<div class="ps-preview">Inspector app preview with sample data. Nothing is saved. <a href="../index.html">Back to website</a></div>' +
        '<header class="ps-bar"><div class="ps-bar-in">' +
        (back ? '<a href="' + back + '" class="ps-back" aria-label="Back"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></a>'
              : '<a href="index.html" class="ps-logo" aria-label="My jobs"><img src="../images/vign-logo.png" alt="VIGN USA"></a>') +
        '<div class="ps-title"><strong>' + esc(title) + '</strong><small>' + esc(ME.name) + ' · ' + ME.id + '</small></div>' +
        '<nav class="ps-topnav" aria-label="Inspector menu">' + tabs.map(function (t) {
            return '<a href="' + t[1] + '"' + (t[0] === page ? ' class="on" aria-current="page"' : '') + '>' + t[3] + '</a>';
        }).join('') + '</nav>' +
        '<a href="../login.html" class="ps-avatar" title="Account / sign out">' + initials + '</a></div></header>';
    var bottom = '<nav class="ps-tabs" aria-label="Inspector menu">' + tabs.map(function (t) {
        var dot = t[0] === 'sent' && returned ? '<span class="dot">' + returned + '</span>' : '';
        return '<a href="' + t[1] + '"' + (t[0] === page ? ' class="on" aria-current="page"' : '') + '><i class="fa-solid ' + t[2] + '" aria-hidden="true"></i>' + t[3] + dot + '</a>';
    }).join('') + '</nav>';
    document.body.insertAdjacentHTML('afterbegin', top);
    document.body.insertAdjacentHTML('beforeend', bottom);
}

function jobCard(j) {
    var st = STATUS[j.status], d = dueInfo(j.due);
    var right = isOpen(j) ? '<span class="pill ' + d[1] + '">' + d[0] + '</span>' : '<span class="pill ' + st[1] + '">' + st[0] + '</span>';
    var href = isOpen(j) || j.status === 'returned' ? 'job.html?id=' + j.id : 'job.html?id=' + j.id;
    var meta = isOpen(j)
        ? '<span><i class="fa-regular fa-clock"></i> ' + esc(j.win) + '</span><span><i class="fa-solid fa-location-arrow"></i> ' + j.mi + ' mi</span><span><i class="fa-solid fa-dollar-sign"></i> ' + j.fee + '</span>'
        : '<span><i class="fa-regular fa-paper-plane"></i> Sent ' + fmtDay(j.sent) + '</span>' + (j.score != null ? '<span><i class="fa-solid fa-star-half-stroke"></i> Score ' + j.score + '</span>' : '') + '<span><i class="fa-solid fa-dollar-sign"></i> ' + j.fee + '</span>';
    return '<a class="ps-job" href="' + href + '"><div class="ps-job-top">' + svcHtml(j) + right + '</div>' +
        '<h3>' + esc(j.addr) + '</h3><p class="addr2">' + esc(j.city) + ' · ' + esc(j.client) + '</p>' +
        '<div class="ps-job-meta"><span class="mono">' + j.id + '</span>' + meta + '</div></a>';
}

// ---------------------------------------------------------------- page: My Jobs (dashboard)
function pageJobs() {
    shell('jobs', 'My Jobs');
    var open = JOBS.filter(isOpen);
    var today = open.filter(function (j) { return j.due === 0; });
    var late = open.filter(function (j) { return j.due < 0; });
    var week = open.filter(function (j) { return j.due >= 0 && j.due <= 5; });
    var returned = JOBS.filter(function (j) { return j.status === 'returned'; });
    var approvedUnpaid = JOBS.filter(function (j) { return j.status === 'approved' && !j.paid; });
    var waiting = JOBS.filter(function (j) { return j.status === 'submitted'; });
    var sum = function (a) { return a.reduce(function (t, j) { return t + j.fee; }, 0); };
    var paidMonth = sum(JOBS.filter(function (j) { return j.paid; }));

    var hour = new Date().getHours();
    var html = '<div class="ps-hello"><h1>Good ' + (hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening') + ', ' + ME.name.split(' ')[0] + '</h1>' +
        '<p>' + new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + ' · ' + ME.area + '</p></div>';

    if (returned.length) {
        html += '<a class="ps-alert" href="job.html?id=' + returned[0].id + '"><i class="fa-solid fa-rotate-left"></i><span><b>' + returned.length + ' report sent back for changes</b>' + esc(returned[0].addr) + ': ' + esc(returned[0].returned) + '</span></a>';
    }

    html += '<div class="ps-tiles">' +
        tile('t-blue', 'fa-list-check', open.length, 'Open jobs', '#list', 'all') +
        tile('t-amber', 'fa-sun', today.length, 'Due today', '#list', 'today') +
        tile('t-red', 'fa-triangle-exclamation', late.length, 'Overdue', '#list', 'late') +
        tile('t-orange', 'fa-rotate-left', returned.length, 'Needs changes', 'sent.html', '') +
        '</div>';

    html += '<div class="ps-h"><h2>My pay</h2><a href="pay.html">See all →</a></div><div class="ps-money">' +
        tile('t-blue', 'fa-hourglass-half', money(sum(open)), 'Open jobs value', 'pay.html', '') +
        tile('t-amber', 'fa-clipboard-check', money(sum(waiting)), 'Waiting for review', 'pay.html', '') +
        tile('t-green', 'fa-circle-check', money(sum(approvedUnpaid)), 'Approved, to be paid', 'pay.html', '') +
        tile('t-green', 'fa-money-bill-wave', money(paidMonth), 'Paid this month', 'pay.html', '') + '</div>';

    html += '<div class="ps-h" id="list"><h2>Jobs</h2><span>Nearest first</span></div>' +
        '<div class="ps-chips" role="tablist">' +
        chip('today', 'Today', today.length, true) + chip('week', 'Next 5 days', week.length) + chip('late', 'Overdue', late.length) + chip('all', 'All open', open.length) +
        '</div><div class="ps-list grid" id="jobList"></div>';
    $('#app').innerHTML = html;

    var sets = { today: today, week: week, late: late, all: open };
    function show(k) {
        $$('.ps-chip').forEach(function (c) { c.classList.toggle('on', c.dataset.k === k); c.setAttribute('aria-selected', c.dataset.k === k); });
        var list = sets[k].slice().sort(function (a, b) { return a.due - b.due || a.mi - b.mi; });
        $('#jobList').innerHTML = list.length ? list.map(jobCard).join('') : '<div class="ps-empty">No jobs here.</div>';
    }
    $$('.ps-chip').forEach(function (c) { c.addEventListener('click', function () { show(c.dataset.k); }); });
    $$('[data-k-link]').forEach(function (a) { a.addEventListener('click', function () { if (a.dataset.kLink) show(a.dataset.kLink); }); });
    show('today');

    function tile(cls, icon, val, label, href, k) {
        return '<a class="ps-tile ' + cls + '" href="' + href + '" data-k-link="' + k + '"><i class="fa-solid ' + icon + '" aria-hidden="true"></i><b>' + val + '</b><span>' + label + '</span></a>';
    }
    function chip(k, label, n) { return '<button type="button" class="ps-chip" role="tab" data-k="' + k + '">' + label + '<em>' + n + '</em></button>'; }
}

// ---------------------------------------------------------------- page: Job detail
function pageJob() {
    var j = job(param('id')) || JOBS[0];
    shell('jobs', j.id, isOpen(j) ? 'index.html' : 'sent.html');
    var st = STATUS[j.status], d = dueInfo(j.due), f = FORMS[j.form];
    var html = '<div class="ps-cols"><div>';
    html += '<div class="ps-panel ps-head"><div class="ps-job-top">' + svcHtml(j) + '<span class="pill ' + st[1] + '">' + st[0] + '</span></div>' +
        '<h1>' + esc(j.addr) + '</h1><p>' + esc(j.city) + '</p>' +
        '<div class="ps-actions"><a class="btn btn-ghost" href="' + mapsUrl(j) + '" target="_blank" rel="noopener"><i class="fa-solid fa-diamond-turn-right"></i> Directions</a>' +
        '<a class="btn btn-ghost" href="tel:' + TEL + '"><i class="fa-solid fa-phone"></i> Call office</a></div></div>';

    if (j.status === 'returned') html += '<div class="ps-panel"><h2>Sent back by VIGN staff</h2><div class="ps-note red">' + esc(j.returned) + '</div></div>';
    if (j.notes) html += '<div class="ps-panel"><h2>Client instructions</h2><div class="ps-note">' + esc(j.notes) + '</div>' + (j.contact ? '<p class="small" style="margin:10px 0 0">' + esc(j.contact) + '</p>' : '') + '</div>';

    html += '<div class="ps-panel"><h2>Job details</h2><dl class="ps-dl">' +
        '<dt>Job #</dt><dd>' + j.id + '</dd>' +
        '<dt>Client</dt><dd>' + esc(j.client) + '</dd>' +
        '<dt>Form</dt><dd>' + esc(f.title) + ' (' + f.items.length + ' items)</dd>' +
        '<dt>Access</dt><dd>' + esc(j.access) + '</dd>' +
        (isOpen(j) ? '<dt>Due</dt><dd><span class="pill ' + d[1] + '">' + d[0] + '</span></dd><dt>Time window</dt><dd>' + esc(j.win) + '</dd>' : '<dt>Sent in</dt><dd>' + fmtDay(j.sent) + '</dd>') +
        (j.score != null ? '<dt>Score</dt><dd><span class="rate ' + scoreClass(j.score) + '" style="padding:2px 10px">' + j.score + ' / 100</span></dd>' : '') +
        '<dt>Distance</dt><dd>' + j.mi + ' miles</dd>' +
        '<dt>Your fee</dt><dd>' + money(j.fee) + '</dd></dl></div>';
    html += '</div><div>';

    if (j.files) html += '<div class="ps-panel"><h2>Files from the client</h2><ul class="ps-files">' + j.files.map(function (n) { return '<li><i class="fa-regular fa-file-pdf"></i><a href="#" onclick="return false">' + esc(n) + '</a></li>'; }).join('') + '</ul></div>';

    var ev = [['Assigned to you', fmtDay(j.due - 3) + ' · VIGN dispatch', true], ['Accepted', fmtDay(j.due - 3) + ' · ' + ME.name, true]];
    if (j.status === 'in_field') ev.push(['Inspection started', 'Today · on site', true]);
    if (j.sent != null) ev.push(['Report sent in', fmtDay(j.sent) + ' · ' + ME.name, true]);
    if (j.status === 'returned') ev.push(['Sent back for changes', fmtDay(j.sent + 1 > 0 ? 0 : j.sent + 1) + ' · VIGN QA', true]);
    if (j.status === 'approved') ev.push(['Approved and delivered to client', fmtDay(j.sent + 1 > 0 ? 0 : j.sent + 1) + ' · VIGN QA', true]);
    if (isOpen(j)) ev.push(['Report due', d[0], false]);
    html += '<div class="ps-panel"><h2>History</h2><ul class="ps-timeline">' + ev.map(function (e) { return '<li' + (e[2] ? ' class="on"' : '') + '>' + esc(e[0]) + '<small>' + esc(e[1]) + '</small></li>'; }).join('') + '</ul></div>';
    html += '</div></div>';

    if (isOpen(j) || j.status === 'returned') {
        var label = j.status === 'returned' ? 'Fix and send again' : j.status === 'in_field' ? 'Continue inspection' : 'Start inspection';
        html += '<div class="ps-sticky ps-narrow"><a class="btn btn-primary btn-lg btn-block" href="inspect.html?id=' + j.id + '"><i class="fa-solid fa-clipboard-list"></i> ' + label + '</a></div>';
    }
    $('#app').innerHTML = html;
}

// ---------------------------------------------------------------- page: Fill the form
function pageInspect() {
    var j = job(param('id')) || JOBS[0];
    var f = FORMS[j.form];
    shell('jobs', f.title, 'job.html?id=' + j.id);
    var KEY = 'vign-ps-' + j.id;
    var state = store(KEY) || { answers: {}, extra: {}, hazards: '', notes: '', followup: '' };
    var photos = {};   // photos stay in this page only (not saved)
    var n = f.items.length, steps = n + 2;   // items + general questions + review
    var cur = 0;

    var html = '<div class="ps-narrow"><div class="ps-progress"><div class="ps-progress-row"><span id="pgLabel"></span><b id="pgScore"></b></div><div class="ps-bar-track"><div class="ps-bar-fill" id="pgFill"></div></div></div>';

    // header check (like SMK "new attempt": date / time / address are filled in for you)
    html += '<div class="ps-panel" style="margin-top:4px"><dl class="ps-dl"><dt>Job</dt><dd>' + j.id + ' · ' + esc(j.addr) + '</dd><dt>Date / time</dt><dd>' + new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' (automatic)</dd><dt>Access</dt><dd>' + esc(j.access) + '</dd></dl></div>';

    f.items.forEach(function (item, i) {
        html += '<section class="ps-step" data-step="' + i + '"><div class="ps-q" style="margin-top:12px"><span class="mono">Item ' + (i + 1) + ' of ' + n + '</span><h2>' + esc(item) + '</h2>' +
            '<div class="ps-rates" role="radiogroup" aria-label="Rating">' + RATINGS.map(function (r) {
                var small = r[0] === 'NO' || r[0] === 'NA';
                return '<button type="button" class="ps-rate' + (small ? ' small' : '') + '" data-v="' + r[0] + '" role="radio" aria-checked="false"><b class="rate ' + (small ? 'r0' : 'r' + r[0]) + '">' + (small ? '–' : r[0]) + '</b><span>' + r[1] + '<small>' + r[2] + '</small></span></button>';
            }).join('') + '</div>' +
            '<label class="ps-field">Findings <textarea data-note placeholder="What did you see? Keep it to observed facts."></textarea></label>' +
            '<div class="ps-field">Photos <span class="ps-req" data-photo-req hidden>A photo is required for a rating of 3 or 4.</span>' +
            '<div class="ps-photo"><label class="btn btn-ghost btn-sm"><i class="fa-solid fa-camera"></i> Take photo<input type="file" accept="image/*" capture="environment" data-photo></label><div class="ps-thumbs" data-thumbs></div></div></div>' +
            '<div class="ps-nav"><button type="button" class="btn btn-ghost" data-prev>Back</button><button type="button" class="btn btn-primary" data-next>Next item <span class="arr">→</span></button></div></div></section>';
    });

    // general questions (bottom of every VIG form)
    html += '<section class="ps-step" data-step="' + n + '"><div class="ps-q" style="margin-top:12px"><span class="mono">General</span><h2>A few more questions</h2>' +
        f.extra.map(function (q, qi) {
            return '<div class="ps-field">' + esc(q[0]) + '<div class="ps-chooser">' + q[1].map(function (o) {
                return '<label class="ps-chip"><input type="radio" name="x' + qi + '" value="' + esc(o) + '"' + (state.extra[qi] === o ? ' checked' : '') + '>' + esc(o) + '</label>';
            }).join('') + '</div></div>';
        }).join('') +
        '<div class="ps-field">Follow-up recommended?<div class="ps-chooser"><label class="ps-chip"><input type="radio" name="fu" value="Yes"' + (state.followup === 'Yes' ? ' checked' : '') + '>Yes</label><label class="ps-chip"><input type="radio" name="fu" value="No"' + (state.followup === 'No' ? ' checked' : '') + '>No</label></div></div>' +
        '<label class="ps-field">Immediate hazards / damage observed<textarea id="hazards" placeholder="Leave blank if none">' + esc(state.hazards) + '</textarea></label>' +
        '<label class="ps-field">Notes / limitations / areas you could not reach<textarea id="gnotes">' + esc(state.notes) + '</textarea></label>' +
        '<div class="ps-nav"><button type="button" class="btn btn-ghost" data-prev>Back</button><button type="button" class="btn btn-primary" data-next>Review <span class="arr">→</span></button></div></div></section>';

    // review + signature
    html += '<section class="ps-step" data-step="' + (n + 1) + '"><div style="margin-top:12px" class="ps-score"><div class="big" id="rvBig"></div><div><strong>Overall score</strong><p id="rvText"></p><p class="small">Formula: 1 = 100, 2 = 67, 3 = 33, 4 = 0; N/O and N/A are not counted. (Sample formula, still to be confirmed.)</p></div></div>' +
        '<div class="ps-panel"><h2>Your ratings</h2><ul class="ps-review" id="rvList"></ul></div>' +
        '<div class="ps-panel"><h2>Inspector signature</h2><canvas class="ps-sign" id="sig" aria-label="Sign here"></canvas><div style="display:flex;justify-content:space-between;margin-top:8px"><span class="small muted">' + esc(ME.name) + ' · ' + new Date().toLocaleDateString('en-US') + '</span><button type="button" class="btn btn-ghost btn-sm" id="sigClear">Clear</button></div>' +
        '<label class="checkbox small" style="margin-top:12px"><input type="checkbox" id="certify"> I confirm this report shows only what I observed.</label></div>' +
        '<p class="alert" id="rvErr" hidden></p>' +
        '<div class="ps-nav"><button type="button" class="btn btn-ghost" data-prev>Back</button><button type="button" class="btn btn-red" id="submitBtn"><i class="fa-solid fa-paper-plane"></i> Send report</button></div></section>';

    html += '<section class="ps-step" data-step="done"><div class="ps-done" style="margin-top:12px"><i class="fa-solid fa-circle-check"></i><h2>Report sent</h2><p class="muted">VIGN staff will review it, then deliver it to ' + esc(j.client) + '. You will be told if anything needs to change.</p><p class="small muted">(Preview only: nothing was actually sent.)</p><a class="btn btn-primary" href="index.html" style="margin-top:8px">Back to my jobs</a></div></section></div>';
    $('#app').innerHTML = html;

    var sections = $$('.ps-step');
    // restore saved answers
    f.items.forEach(function (_, i) {
        var a = state.answers[i] || {}, sec = sections[i];
        if (a.v) setRate(sec, a.v);
        $('[data-note]', sec).value = a.note || '';
        $$('.ps-rate', sec).forEach(function (b) { b.addEventListener('click', function () { setRate(sec, b.dataset.v); save(i); updateTop(); }); });
        $('[data-note]', sec).addEventListener('input', function () { save(i); });
        $('[data-photo]', sec).addEventListener('change', function (e) { addPhoto(i, e.target.files[0]); e.target.value = ''; });
    });
    $$('input[name^="x"]').forEach(function (r) { r.addEventListener('change', function () { state.extra[r.name.slice(1)] = r.value; store(KEY, state); }); });
    $$('input[name="fu"]').forEach(function (r) { r.addEventListener('change', function () { state.followup = r.value; store(KEY, state); }); });
    $('#hazards').addEventListener('input', function (e) { state.hazards = e.target.value; store(KEY, state); });
    $('#gnotes').addEventListener('input', function (e) { state.notes = e.target.value; store(KEY, state); });
    $$('[data-prev]').forEach(function (b) { b.addEventListener('click', function () { go(cur - 1); }); });
    $$('[data-next]').forEach(function (b) { b.addEventListener('click', function () { if (check(cur)) go(cur + 1); }); });

    function setRate(sec, v) { $$('.ps-rate', sec).forEach(function (b) { var on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); }); }
    function save(i) {
        var sec = sections[i], on = $('.ps-rate.on', sec);
        state.answers[i] = { v: on ? on.dataset.v : null, note: $('[data-note]', sec).value };
        store(KEY, state);
        $('[data-photo-req]', sec).hidden = true;
    }
    function check(i) {
        if (i >= n) return true;
        var a = state.answers[i] || {}, sec = sections[i];
        if (!a.v) { $('.ps-rates', sec).animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], 220); return false; }
        if ((a.v === '3' || a.v === '4') && !(photos[i] && photos[i].length)) { $('[data-photo-req]', sec).hidden = false; return false; }
        return true;
    }
    function addPhoto(i, file) {
        if (!file) return;
        var stamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        (photos[i] = photos[i] || []).push(file);
        var box = $('[data-thumbs]', sections[i]);
        var el = document.createElement('div');
        el.className = 'ps-thumb';
        el.innerHTML = '<img alt=""><small>' + stamp + ' · GPS</small>';
        $('img', el).src = URL.createObjectURL(file);
        box.appendChild(el);
        $('[data-photo-req]', sections[i]).hidden = true;
    }
    function score() {
        var tot = 0, cnt = 0;
        f.items.forEach(function (_, i) { var v = (state.answers[i] || {}).v; if (POINTS[v] != null) { tot += POINTS[v]; cnt++; } });
        return cnt ? Math.round(tot / cnt) : null;
    }
    function answered() { return f.items.filter(function (_, i) { return (state.answers[i] || {}).v; }).length; }
    function updateTop() {
        var s = score();
        $('#pgLabel').textContent = cur < n ? 'Item ' + (cur + 1) + ' of ' + n + ' · ' + answered() + ' rated' : cur === n ? 'General questions' : 'Review and send';
        $('#pgScore').textContent = s == null ? 'Score –' : 'Score ' + s;
        $('#pgFill').style.width = Math.round(Math.min(cur, steps) / steps * 100) + '%';
    }
    function go(i) {
        if (i < 0) { location.href = 'job.html?id=' + j.id; return; }
        cur = i;
        sections.forEach(function (s) { s.classList.toggle('on', s.dataset.step === String(i)); });
        if (i === n + 1) review();
        updateTop();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function review() {
        var s = score();
        $('#rvBig').textContent = s == null ? '–' : s;
        $('#rvBig').className = 'big rate ' + (s == null ? 'r0' : scoreClass(s));
        var issues = f.items.filter(function (_, i) { var v = (state.answers[i] || {}).v; return v === '3' || v === '4'; }).length;
        $('#rvText').textContent = answered() + ' of ' + n + ' items rated · ' + issues + (issues === 1 ? ' item needs' : ' items need') + ' repair or urgent attention';
        $('#rvList').innerHTML = f.items.map(function (item, i) {
            var v = (state.answers[i] || {}).v, lab = v ? (v === 'NO' ? 'N/O' : v === 'NA' ? 'N/A' : v) : '?';
            return '<li><b class="rate ' + (v && POINTS[v] != null ? 'r' + v : 'r0') + '">' + lab + '</b><span>' + esc(item) + '</span><button type="button" data-edit="' + i + '">Edit</button></li>';
        }).join('');
        $$('[data-edit]', $('#rvList')).forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.edit); }); });
    }

    // signature pad
    var cv = $('#sig'), ctx = cv.getContext('2d'), drawing = false, signed = false;
    function fit() { var r = cv.getBoundingClientRect(); if (!r.width) return; cv.width = r.width * 2; cv.height = r.height * 2; ctx.scale(2, 2); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.strokeStyle = '#0d1630'; }
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointerdown', function (e) { if (!cv.width || cv.width < 10) fit(); drawing = true; signed = true; var p = pos(e); ctx.beginPath(); ctx.moveTo(p[0], p[1]); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pos(e); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
    cv.addEventListener('pointerup', function () { drawing = false; });
    $('#sigClear').addEventListener('click', function () { fit(); signed = false; });

    $('#submitBtn').addEventListener('click', function () {
        var err = [];
        if (answered() < n) err.push('Rate every item (' + (n - answered()) + ' left).');
        if (!signed) err.push('Sign the report.');
        if (!$('#certify').checked) err.push('Tick the confirmation box.');
        var box = $('#rvErr');
        if (err.length) { box.hidden = false; box.textContent = err.join(' '); return; }
        try { localStorage.removeItem(KEY); } catch (e) {}
        sections.forEach(function (s) { s.classList.toggle('on', s.dataset.step === 'done'); });
        $('.ps-progress').hidden = true;
        window.scrollTo({ top: 0 });
    });

    // start at the first unrated item
    var first = 0;
    while (first < n && (state.answers[first] || {}).v) first++;
    go(first >= n ? n : first);
    setTimeout(fit, 0);
    window.addEventListener('resize', function () { if (cur === n + 1 && !signed) fit(); });
}

// ---------------------------------------------------------------- page: Sent in (results)
function pageSent() {
    shell('sent', 'Sent In');
    var groups = [
        ['returned', 'Needs changes', 'Staff sent these back. Fix them and send them again.'],
        ['submitted', 'Waiting for review', 'VIGN staff are checking these reports.'],
        ['approved', 'Approved', 'Delivered to the client.']
    ];
    $('#app').innerHTML = groups.map(function (g) {
        var list = JOBS.filter(function (j) { return j.status === g[0]; });
        return '<div class="ps-h"><h2>' + g[1] + ' <span class="muted">(' + list.length + ')</span></h2><span>' + g[2] + '</span></div>' +
            '<div class="ps-list grid">' + (list.length ? list.map(jobCard).join('') : '<div class="ps-empty">Nothing here.</div>') + '</div>';
    }).join('');
}

// ---------------------------------------------------------------- page: My Pay (like SMK commissions / payments)
function pagePay() {
    shell('pay', 'My Pay');
    var done = JOBS.filter(function (j) { return !isOpen(j); }).sort(function (a, b) { return b.sent - a.sent; });
    var sum = function (a) { return a.reduce(function (t, j) { return t + j.fee; }, 0); };
    var paid = done.filter(function (j) { return j.paid; }), owed = done.filter(function (j) { return j.status === 'approved' && !j.paid; }), pending = done.filter(function (j) { return j.status !== 'approved'; });
    var html = '<div class="ps-money" style="margin-top:4px">' +
        t('t-amber', 'fa-hourglass-half', money(sum(pending)), 'Pending review') +
        t('t-green', 'fa-circle-check', money(sum(owed)), 'Approved, to be paid') +
        t('t-green', 'fa-money-bill-wave', money(sum(paid)), 'Paid this month') +
        t('t-blue', 'fa-calendar', 'Nov 15', 'Next pay date') + '</div>';
    html += '<div class="ps-h"><h2>Completed jobs</h2><span><select class="ps-chip" aria-label="Period"><option>This month</option><option>Last month</option><option>Year to date</option></select></span></div>' +
        '<div class="ps-panel" style="padding:6px 14px;overflow-x:auto"><table class="ps-table"><thead><tr><th>Job</th><th>Sent in</th><th>Status</th><th class="r">Fee</th></tr></thead><tbody>' +
        done.map(function (j) {
            var st = j.paid ? ['Paid', 'st-approved'] : j.status === 'approved' ? ['To be paid', 'st-field'] : STATUS[j.status];
            return '<tr><td><a href="job.html?id=' + j.id + '">' + j.id + '</a><small>' + esc(j.addr) + '</small></td><td>' + fmtDay(j.sent) + '</td><td><span class="pill ' + st[1] + '">' + st[0] + '</span></td><td class="r">' + money(j.fee) + '</td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<p class="small muted" style="margin-top:12px">You are paid for approved reports. Reports sent back for changes are paid after they are fixed and approved.</p>';
    $('#app').innerHTML = html;
    function t(cls, icon, val, label) { return '<div class="ps-tile ' + cls + '"><i class="fa-solid ' + icon + '" aria-hidden="true"></i><b>' + val + '</b><span>' + label + '</span></div>'; }
}

// ---------------------------------------------------------------- start
document.addEventListener('DOMContentLoaded', function () {
    ({ jobs: pageJobs, job: pageJob, inspect: pageInspect, sent: pageSent, pay: pagePay }[document.body.dataset.page] || pageJobs)();
    // demo: links to files do nothing
});
})();
