/* =========================================================
   SAMPLE DATA ONLY for the VIGN Staff Office preview. Nothing is real.
   In the real system one backend call returns this (SMK: FLOWJOBDETAIL etc.).
   Jobs are generated from a fixed seed so every page shows the same jobs.
   Day numbers are offsets from today (0 = today, -1 = yesterday).
   ========================================================= */
var VS = window.VS = window.VS || {};

VS.me = { name: 'Jenny Park', role: 'Staff', email: 'jenny@vign.example', phone: '516 924-0087' };

// R-13 client rates (SAMPLES; set by the admin). [rate, per, note]. Staff only see this if the admin turned on "Clients & rates"
VS.rates = {
    'First Harbor Mortgage': [65, ' / job', 'Contract rate'],
    'Lakeshore Loan Servicing': [2500, ' / month', 'Flat fee'],
    'Bright Brew Coffee Co.': [50, ' / job', 'Pilot, then $55 (42 stores)'],
    'Keystone Insurance Group': [9600, ' / year', 'Flat fee'],
    'Midway Auto & Home Credit': [30, ' / job', 'Contract rate'],
    'Northgate Savings Bank': [70, ' / job', 'Contract rate (pilot ended)']
};

VS.services = {
    mystery:    ['Mystery Shoppers', 'fa-cart-shopping'],
    loan:       ['Loan Servicing', 'fa-house'],
    property:   ['Property & Field Inspections', 'fa-clipboard-check'],
    collateral: ['Loan Servicing & Collateral', 'fa-car'],
    cx:         ['Mystery Shopping & CX', 'fa-magnifying-glass']
};
VS.price = { mystery: [55, 25], loan: [65, 35], property: [85, 45], collateral: [60, 30], cx: [70, 30] }; // [client price, inspector pay]

VS.ratings = { '1': ['Good', 'r1'], '2': ['Minor', 'r2'], '3': ['Repair', 'r3'], '4': ['Urgent', 'r4'], 'NO': ['N/O', 'r0'], 'NA': ['N/A', 'r0'] };
VS.points = { '1': 100, '2': 67, '3': 33, '4': 0 };   // sample formula, not decided yet

/* the forms come from ../js/vign-forms.js (one copy, same as the main system): [title, rated items, key] */
VS.forms = {}; VIGNFORMS.order.forEach(function (k) { VS.forms[k] = [VIGNFORMS[k].title, VIGNFORMS.items(k), k]; });
VS.formFor = { mystery: 'mystery', cx: 'mystery', loan: 'vacant', collateral: 'vacant', property: 'residential' };

VS.clients = [
    { id: 1001, name: 'First Harbor Mortgage', type: 'Mortgage lender', contact: 'A. Reyes', phone: '(516) 555-0101', email: 'ops@firstharbor.example', svc: ['property', 'loan'], terms: 30 },
    { id: 1002, name: 'Lakeshore Loan Servicing', type: 'Loan servicer', contact: 'M. Chen', phone: '(516) 555-0142', email: 'field@lakeshore.example', svc: ['loan', 'collateral'], terms: 30 },
    { id: 1003, name: 'Bright Brew Coffee Co.', type: 'Retail / restaurant', contact: 'K. Olsen', phone: '(516) 555-0177', email: 'cx@brightbrew.example', svc: ['mystery', 'cx'], terms: 15 },
    { id: 1004, name: 'Keystone Insurance Group', type: 'Insurance', contact: 'D. Wright', phone: '(631) 555-0118', email: 'claims@keystone.example', svc: ['property'], terms: 30 },
    { id: 1005, name: 'Midway Auto & Home Credit', type: 'Bank', contact: 'S. Patel', phone: '(516) 555-0163', email: 'collateral@midway.example', svc: ['collateral'], terms: 30 },
    { id: 1006, name: 'Northgate Savings Bank', type: 'Bank', contact: 'L. Brooks', phone: '(516) 555-0190', email: 'branches@northgate.example', svc: ['cx', 'mystery'], terms: 15 }
];

VS.inspectors = [
    { id: 'INS-0417', name: 'Maria Lopez', role: 'Both', area: 'Hempstead, NY', zips: '11550, 11530, 11743', phone: '(516) 555-0110', score: 86, ontime: 94, active: true },
    { id: 'INS-0388', name: 'Derek Hall', role: 'Inspector', area: 'Garden City, NY', zips: '11530, 11501, 11590', phone: '(516) 555-0133', score: 81, ontime: 89, active: true },
    { id: 'INS-0452', name: 'Priya Nair', role: 'Mystery Shopper', area: 'Massapequa, NY', zips: '11758, 11762', phone: '(516) 555-0158', score: 90, ontime: 97, active: true },
    { id: 'INS-0466', name: 'Angela Ruiz', role: 'Both', area: 'Islip, NY', zips: '11751, 11706', phone: '(631) 555-0104', score: 88, ontime: 91, active: true },
    { id: 'INS-0301', name: 'Tom Becker', role: 'Inspector', area: 'Hauppauge, NY', zips: '11788, 11749', phone: '(631) 555-0191', score: 68, ontime: 72, active: false }
];

// ---- job generator (fixed seed) ----
(function () {
    var seed = 7; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    function pick(a) { return a[Math.floor(rnd() * a.length)]; }
    var streets = ['Maple Ridge Dr', 'Birchwood Ct', 'Jericho Tpke', 'Oakview Ave', 'Elm St', 'Willow Bend', 'Hilton Ave', 'Nassau Rd', 'Merrick Rd', 'Front St', 'Jerusalem Ave', 'Atlantic Ave', 'Washington Ave', 'Old Country Rd', 'Hempstead Tpke', 'Northern Blvd', 'Sunrise Hwy', 'Main St', 'Cedar Swamp Rd', 'Veterans Hwy'];
    var cities = [['Hempstead, NY 11550', 'Nassau'], ['Garden City, NY 11530', 'Nassau'], ['Freeport, NY 11520', 'Nassau'], ['Syosset, NY 11791', 'Nassau'], ['Massapequa, NY 11758', 'Nassau'], ['Hauppauge, NY 11788', 'Suffolk'], ['Huntington, NY 11743', 'Suffolk'], ['Islip, NY 11751', 'Suffolk']];
    var stores = { 1003: ['Bright Brew #1', 'Bright Brew #10'], 1006: ['Northgate Savings Branch #0'] };
    // status plan: [status, count]
    var plan = [['new', 5], ['assigned', 7], ['in_field', 2], ['submitted', 5], ['returned', 1], ['approved', 4], ['invoiced', 4], ['paid', 6]];
    var jobs = [], n = 24100;
    plan.forEach(function (p) {
        for (var k = 0; k < p[1]; k++) {
            var c = pick(VS.clients), svc = pick(c.svc), form = VS.formFor[svc];
            if (svc === 'property' && c.id === 1004 && rnd() < .5) form = 'commercial';
            var city = pick(cities), st = p[0], num = 100 + Math.floor(rnd() * 8800);
            var addr = stores[c.id] ? pick(stores[c.id]) + Math.floor(rnd() * 9 + 1) + ', ' + num + ' ' + pick(streets) : num + ' ' + pick(streets);
            var created, due;
            if (st === 'new' || st === 'assigned' || st === 'in_field') { created = -Math.floor(rnd() * 5); due = created + 2 + Math.floor(rnd() * 6) - (rnd() < .25 ? 6 : 0); }
            else if (st === 'submitted' || st === 'returned') { created = -3 - Math.floor(rnd() * 5); due = created + 3 + Math.floor(rnd() * 3); }
            else { created = -6 - Math.floor(rnd() * 40); due = created + 3 + Math.floor(rnd() * 3); }
            var ins = st === 'new' ? null : pick(VS.inspectors.filter(function (i) { return i.active && (svc === 'mystery' || svc === 'cx' ? i.role !== 'Inspector' : i.role !== 'Mystery Shopper'); }));
            var j = { id: 'VG-' + (++n), client: c.id, svc: svc, form: form, ref: (svc === 'mystery' || svc === 'cx' ? 'Location #' : 'Loan #') + (1000 + Math.floor(rnd() * 9000)),
                addr: addr, city: city[0], county: city[1], created: created, due: due, status: st, ins: ins ? ins.id : null,
                prio: rnd() < .18 ? 'Rush' : rnd() < .3 ? 'High' : 'Routine', price: VS.price[svc][0], pay: VS.price[svc][1], visits: 0, photos: 0,
                access: svc === 'mystery' || svc === 'cx' ? 'Customer visit' : form === 'vacant' ? 'Exterior only' : 'Interior authorized',
                notes: svc === 'mystery' || svc === 'cx' ? 'Visit as a regular customer. Keep the receipt.' : form === 'vacant' ? 'Do not enter. Do not disturb locks, utilities or belongings.' : 'Call the occupant 30 minutes before arrival.' };
            if (st !== 'new' && st !== 'assigned') j.visits = 1;
            if (['submitted', 'returned', 'approved', 'invoiced', 'paid'].indexOf(st) > -1) {
                var items = VS.forms[form][1];
                j.sent = Math.min(0, due - Math.floor(rnd() * 3));
                j.answers = items.map(function () { var r = rnd(); return r < .55 ? '1' : r < .78 ? '2' : r < .9 ? '3' : r < .95 ? '4' : r < .98 ? 'NO' : 'NA'; });
                j.photo = j.answers.map(function (a) { return a === '3' || a === '4' ? rnd() > .12 : rnd() > .55; });
                j.photos = j.photo.filter(Boolean).length + 2;
                j.gps = Math.round(rnd() < .2 ? 300 + rnd() * 900 : rnd() * 60);   // metres from the address
                j.findings = j.answers.map(function (a, i) { return a === '3' ? 'Damage visible; repair needed.' : a === '4' ? 'Safety hazard. Reported to the client right away.' : a === '2' ? 'Minor wear.' : ''; });
            }
            if (st === 'returned') j.returnNote = 'Item rated 3 has no photo. Please add a photo and send it again.';
            if (['approved', 'invoiced', 'paid'].indexOf(st) > -1) j.reviewed = Math.min(0, j.sent + 1);
            if (st === 'invoiced' || st === 'paid') { j.inv = 'INV-' + (2600 + jobs.length); j.invDate = Math.min(0, j.reviewed + 1); }
            if (st === 'paid') { j.payDate = Math.min(0, j.invDate + 8 + Math.floor(rnd() * 10)); j.payHow = pick(['ACH', 'Check', 'Credit Card']); j.check = j.payHow === 'Check' ? String(5000 + Math.floor(rnd() * 900)) : ''; }
            jobs.push(j);
        }
    });
    // keep the inspector-portal story: Maria's 18 Elm St job was sent back
    jobs.forEach(function (j) { if (j.status === 'returned') { j.ins = 'INS-0417'; j.addr = '18 Elm St'; j.city = 'Freeport, NY 11520'; j.client = 1001; j.svc = 'property'; j.form = 'residential'; j.price = 85; j.pay = 45; } });
    // show the Rental and Exterior forms on a few jobs not visited yet (no answers, so the sample numbers stay the same)
    var swap = { 'new|residential': ['rental'], 'assigned|vacant|collateral': ['exterior'] };   // collateral check = drive-by
    jobs.forEach(function (j) {
        var q = swap[j.status + '|' + j.form] || swap[j.status + '|' + j.form + '|' + j.svc]; if (!q || !q.length) return;
        j.form = q.shift();
        if (j.form === 'exterior') { j.access = 'Exterior only'; j.notes = 'Exterior only, from the street. Do not go on the property. Photograph the front, side and house number.'; }
        else j.notes = 'Move-out report. Meet the property manager for the keys; record the meter readings.';
    });
    VS.jobs = jobs;
})();

/* ---------------------------------------------------------
   Client invoices: the SAME list as the Admin Menu (admin/assets/js/data.js, "Client Invoices"),
   plus the older paid ones the client portal shows. One invoice can cover many jobs (monthly plans).
   billed / due / paidOn = days from today. Balance = amount - paid.
   --------------------------------------------------------- */
VS.invoices = [
    { id: 'INV-2612', client: 1003, plan: 'Per job', period: 'VG-24108 · 1 shop × $55', billed: -4, due: 4, amount: 55, paid: 0 },
    { id: 'INV-2611', client: 1002, plan: 'Monthly (flat fee)', period: 'October 2026 · flat fee', billed: -10, due: 20, amount: 2500, paid: 0 },
    { id: 'INV-2610', client: 1001, plan: 'Monthly (per job)', period: 'October 2026 · 17 jobs × $65', billed: -10, due: 20, amount: 1105, paid: 500 },
    { id: 'INV-2606', client: 1006, plan: 'Per job', period: 'VG-24099', billed: -12, due: 3, amount: 70, paid: 0 },
    { id: 'INV-2604', client: 1004, plan: 'Yearly (flat fee)', period: '2026 · flat fee, paid in full', billed: -60, due: -30, amount: 9600, paid: 9600 },
    { id: 'INV-2598', client: 1003, plan: 'Per job', period: '9 shops × $50', billed: -32, due: -17, amount: 450, paid: 0 },
    { id: 'INV-2590', client: 1005, plan: 'Monthly (per job)', period: 'August 2026 · 22 jobs × $30', billed: -72, due: -42, amount: 660, paid: 660 },
    { id: 'INV-2589', client: 1005, plan: 'Monthly (per job)', period: 'September 2026 · 11 jobs × $30', billed: -41, due: -11, amount: 330, paid: 0 },
    { id: 'INV-2580', client: 1001, plan: 'Monthly (per job)', period: 'September 2026 · 16 jobs × $65', billed: -41, due: -11, amount: 1040, paid: 1040 },
    { id: 'INV-2570', client: 1003, plan: 'Per job', period: '6 shops × $55', billed: -60, due: -45, amount: 330, paid: 330 },
    { id: 'INV-2561', client: 1001, plan: 'Monthly (per job)', period: 'August 2026 · 14 jobs × $65', billed: -72, due: -42, amount: 910, paid: 910 }
];
// payments received (same as the client portal); "Apply payment" adds to this list
VS.payments = [
    { id: 'PAY-881', on: -6, inv: 'INV-2610', client: 1001, amount: 500, how: 'ACH', ref: 'ACH 22093' },
    { id: 'PAY-850', on: -15, inv: 'INV-2580', client: 1001, amount: 1040, how: 'ACH', ref: 'ACH 21877' },
    { id: 'PAY-812', on: -45, inv: 'INV-2561', client: 1001, amount: 910, how: 'Check', ref: 'Check #5231' },
    { id: 'PAY-835', on: -28, inv: 'INV-2604', client: 1004, amount: 9600, how: 'ACH', ref: 'ACH 21540' },
    { id: 'PAY-801', on: -44, inv: 'INV-2570', client: 1003, amount: 330, how: 'Credit Card', ref: 'MC •••• 2290' },
    { id: 'PAY-760', on: -40, inv: 'INV-2590', client: 1005, amount: 660, how: 'Credit Card', ref: 'Amex •••• 1008 (auto)' }
];
// next automatic bills (not sent yet), same as the Admin Menu
VS.nextBills = [
    { id: 'NEXT-01', client: 1002, period: 'November 2026 · flat fee', next: 19, amount: 2500 },
    { id: 'NEXT-02', client: 1001, period: 'November 2026 · so far 31 jobs × $65', next: 19, amount: 2015 },
    { id: 'NEXT-03', client: 1005, period: 'November 2026 · so far 11 jobs × $30', next: 19, amount: 330 },
    { id: 'NEXT-04', client: 1004, period: '2027 · flat fee', next: 51, amount: 9600 }
];
// tie each billed job to one of its client's invoices: open invoice for "invoiced" jobs, a paid one for "paid" jobs
(function () {
    var open = function (c) { return VS.invoices.filter(function (i) { return i.client === c && i.paid < i.amount; }); };
    var done = function (c) { return VS.invoices.filter(function (i) { return i.client === c && i.paid >= i.amount; }); };
    VS.jobs.forEach(function (j) {
        if (j.status !== 'invoiced' && j.status !== 'paid') return;
        var list = j.status === 'invoiced' ? open(j.client) : done(j.client);
        if (!list.length) { j.status = j.status === 'invoiced' ? 'paid' : 'invoiced'; list = j.status === 'invoiced' ? open(j.client) : done(j.client); }
        if (!list.length) return;
        var inv = list[0]; j.inv = inv.id; j.invDate = inv.billed;
        if (j.status === 'paid') { var p = VS.payments.filter(function (x) { return x.inv === inv.id; })[0]; j.payDate = p ? p.on : inv.due; j.payHow = p ? p.how : 'ACH'; j.check = p && p.how === 'Check' ? p.ref.replace(/\D/g, '') : ''; }
        else { delete j.payDate; }
    });
})();

VS.alerts = [
    ['red', 'fa-triangle-exclamation', 'Overdue jobs need a new date or a new inspector', 'chase'],
    ['amber', 'fa-image', 'A report was sent in with a photo far from the address', 'review'],
    ['green', 'fa-file-import', 'Lakeshore Loan Servicing sent a new order file', 'import']
];

// Client messages (like SMK requestor/messages.php): one conversation per job between the client and the VIGN office.
// from: 'client' | 'office' | 'note' (office note, the client never sees it). on = days from today.
VS.threads = [
    { job: 'VG-24113', msgs: [
        { from: 'office', who: 'Jenny Park', on: -1, at: '4:12 PM', text: 'Derek went to 701 Oakview Ave today but the side gate is locked. Can you send a gate code or a contact who can open it? He can go back tomorrow.' },
        { from: 'client', who: 'A. Reyes', on: 0, at: '8:05 AM', text: 'Gate code is 4417#. The property manager, Luis, is also on site after 10 AM: (516) 555-0190.' }] },
    { job: 'VG-24102', msgs: [
        { from: 'client', who: 'A. Reyes', on: 0, at: '9:20 AM', text: 'This one is a rush, the investor needs it by Friday. Can you do it?' }] },
    { job: 'VG-24108', msgs: [
        { from: 'client', who: 'M. Chen', on: -1, at: '3:40 PM', text: 'Any update on 6587 Willow Bend? It was due 2 days ago.' }] },
    { job: 'VG-24116', msgs: [
        { from: 'client', who: 'K. Olsen', on: -1, at: '11:02 AM', text: 'When will the report for Bright Brew #19 be ready?' },
        { from: 'office', who: 'Jenny Park', on: -1, at: '11:30 AM', text: 'Priya sent it this morning. We are checking it now and you will have it today.' },
        { from: 'note', who: 'Jenny Park', on: -1, at: '11:31 AM', text: 'Item 6 rated 4 (checkout counter blocked). Check the photos before we send it.' }] },
    { job: 'VG-24112', msgs: [
        { from: 'client', who: 'K. Olsen', on: -3, at: '1:15 PM', text: 'For #17 please visit between 2 and 4 PM, that is when the new team is on.' },
        { from: 'office', who: 'Mike Russo', on: -3, at: '1:40 PM', text: 'Noted. We passed it to the shopper.', toIns: true }] },
    { job: 'VG-24120', msgs: [
        { from: 'office', who: 'Jenny Park', on: -1, at: '10:10 AM', text: 'We sent 18 Elm St back to the inspector for two missing photos. New report by tomorrow.' },
        { from: 'client', who: 'A. Reyes', on: -1, at: '10:25 AM', text: 'Thanks for letting me know.' },
        { from: 'office', who: 'Jenny Park', on: -1, at: '10:26 AM', text: 'You are welcome.' }] }
];
