/* =========================================================
   SAMPLE DATA ONLY for the VIGN Client portal preview. Nothing is real.
   The signed-in client is First Harbor Mortgage (same company, jobs and invoices as the Admin Menu).
   In the real system one backend call per page returns this (SMK requestor: REQSEARCH, REQGETCASEPAGE, REQINVOICES...).
   Day numbers are offsets from today (0 = today, -1 = yesterday, 3 = in 3 days).
   ========================================================= */
var VC = window.VC = window.VC || {};

VC.me = { name: 'Ana Reyes', first: 'Ana', title: 'Field Operations Manager', email: 'ops@firstharbor.example', phone: '(516) 555-0101' };
VC.company = { id: 1001, name: 'First Harbor Mortgage', plan: 'Monthly (per job)', rate: 65, agree: 'Yes', card: '', terms: 30 };
VC.vign = { name: 'VIGN USA', phone: '516 924-0087', email: 'Processateagle@aol.com' };

VC.services = {
    loan:     ['Loan Servicing', 'fa-house'],
    property: ['Property & Field Inspections', 'fa-clipboard-check'],
    collateral: ['Loan Servicing & Collateral', 'fa-car'],
    mystery:  ['Mystery Shoppers', 'fa-cart-shopping'],
    cx:       ['Mystery Shopping & CX', 'fa-magnifying-glass']
};
VC.price = { loan: 65, property: 65, collateral: 65, mystery: 55, cx: 70 };   // SAMPLE prices (not decided yet)

VC.ratings = { '1': ['Good', 'r1'], '2': ['Minor', 'r2'], '3': ['Repair', 'r3'], '4': ['Urgent', 'r4'], 'NO': ['N/O', 'r0'], 'NA': ['N/A', 'r0'] };
VC.points = { '1': 100, '2': 67, '3': 33, '4': 0 };   // SAMPLE score formula, not decided yet

/* the forms come from ../js/vign-forms.js (one copy, same as the main system): [title, rated items] */
VC.forms = {}; VIGNFORMS.order.forEach(function (k) { VC.forms[k] = [VIGNFORMS[k].title, VIGNFORMS.items(k)]; });
VC.formFor = { loan: 'vacant', collateral: 'vacant', property: 'residential' };

/* What the client sees. The office's own steps (sent back to the inspector, internal checks) show as "Being checked". */
VC.STATUS = {
    received: ['Received', 'st-new', 'fa-inbox', 'VIGN has your order and is finding an inspector.'],
    scheduled: ['Inspector assigned', 'st-assigned', 'fa-user-check', 'An inspector has the job and will visit by the due date.'],
    in_field: ['Visit under way', 'st-field', 'fa-person-walking', 'The inspector is at the property or has been there today.'],
    checking: ['Being checked', 'st-submitted', 'fa-list-check', 'The inspector sent the report. VIGN checks every report before you see it.'],
    ready: ['Report ready', 'st-approved', 'fa-circle-check', 'The report is checked and ready to view and download.'],
    cancelled: ['Cancelled', 'st-paid', 'fa-ban', 'This job was cancelled.']
};

(function () {
    var seed = 11; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    function pick(a) { return a[Math.floor(rnd() * a.length)]; }
    var towns = ['Garden City, NY 11530', 'Hempstead, NY 11550', 'Freeport, NY 11520', 'Huntington, NY 11743', 'Massapequa, NY 11758', 'Levittown, NY 11756', 'Merrick, NY 11566', 'Westbury, NY 11590', 'Valley Stream, NY 11580', 'Oceanside, NY 11572'];
    var streets = ['Maple Ridge Dr', 'Birchwood Ct', 'Elm St', 'Oakview Ave', 'Willow Bend', 'Hilton Ave', 'Nassau Rd', 'Merrick Rd', 'Front St', 'Jerusalem Ave', 'Atlantic Ave', 'Washington Ave', 'Cedar Swamp Rd', 'Old Country Rd'];
    var inspectors = ['Maria Lopez', 'Derek Hall', 'Angela Ruiz'];

    // the jobs the Admin Menu also shows for First Harbor
    var jobs = [
        { id: 'VG-24135', svc: 'loan', addr: '44 Hilton Ave', city: 'Hempstead, NY 11550', ref: 'Loan #7731', created: 0, due: 4, status: 'received', ins: '', prio: 'Routine', from: 'Sent from this portal' },
        { id: 'VG-24131', svc: 'loan', addr: '1220 Maple Ridge Dr', city: 'Garden City, NY 11530', ref: 'Loan #6614', created: -1, due: 1, status: 'received', ins: '', prio: 'Rush', from: 'Website order RQ-1041' },
        { id: 'VG-24128', svc: 'property', addr: '310 Nassau Rd', city: 'Freeport, NY 11520', ref: 'Loan #5520', created: -2, due: 3, status: 'scheduled', ins: 'Derek Hall', prio: 'Routine', visitOn: 2 },
        { id: 'VG-24126', svc: 'property', addr: '9 Willow Bend', city: 'Huntington, NY 11743', ref: 'Loan #5197', created: -3, due: 0, status: 'in_field', ins: 'Angela Ruiz', prio: 'High', visits: 1 },
        { id: 'VG-24123', svc: 'loan', addr: '72 Front St', city: 'Massapequa, NY 11758', ref: 'Loan #4880', created: -4, due: -1, status: 'scheduled', ins: 'Maria Lopez', prio: 'Routine', visits: 1,
          needs: { kind: 'access', text: 'The inspector could not get in: the gate is locked. Please send a gate code or a contact who can open it.', on: -1 } },
        { id: 'VG-24120', svc: 'property', addr: '18 Elm St', city: 'Freeport, NY 11520', ref: 'Loan #4471', created: -6, due: -2, status: 'checking', ins: 'Maria Lopez', prio: 'Routine', visits: 1, sent: -2 },
        { id: 'VG-24117', svc: 'property', addr: '415 Oakview Ave', city: 'Levittown, NY 11756', ref: 'Loan #4302', created: -5, due: -1, status: 'checking', ins: 'Maria Lopez', prio: 'Routine', visits: 1, sent: -1 },
        { id: 'VG-24119', svc: 'property', addr: '1880 Merrick Rd', city: 'Merrick, NY 11566', ref: 'Loan #4355', created: -5, due: -2, status: 'checking', ins: 'Angela Ruiz', prio: 'Routine', visits: 1, sent: -2 }
    ];
    // older jobs, report ready (generated from a fixed seed)
    for (var k = 0; k < 16; k++) {
        var svc = rnd() < .6 ? 'property' : 'loan', created = -7 - Math.floor(rnd() * 40), due = created + 3 + Math.floor(rnd() * 3);
        jobs.push({ id: 'VG-' + (24112 - k * 3), svc: svc, addr: (100 + Math.floor(rnd() * 8800)) + ' ' + pick(streets), city: pick(towns), ref: 'Loan #' + (1000 + Math.floor(rnd() * 3200)),
            created: created, due: due, status: 'ready', ins: pick(inspectors), prio: rnd() < .15 ? 'Rush' : 'Routine', visits: 1, sent: Math.min(-1, due - Math.floor(rnd() * 2)) });
    }
    jobs.push({ id: 'VG-24071', svc: 'loan', addr: '5 Cedar Swamp Rd', city: 'Westbury, NY 11590', ref: 'Loan #3990', created: -20, due: -16, status: 'cancelled', ins: '', prio: 'Routine', note: 'Cancelled by you: loan paid off.' });

    jobs.forEach(function (j) {
        j.form = VC.formFor[j.svc];
        j.price = VC.price[j.svc];
        j.visits = j.visits || 0;
        j.access = j.form === 'vacant' ? 'Exterior only' : 'Interior authorized';
        j.contact = j.form === 'vacant' ? '' : 'Occupant: call (516) 555-01' + (10 + Math.floor(rnd() * 80));
        j.notes = j.form === 'vacant' ? 'Do not enter. Do not disturb locks, utilities or belongings.' : 'Call the occupant 30 minutes before arrival.';
        if (j.status === 'ready') {
            var items = VC.forms[j.form][1];
            j.reviewed = Math.min(0, j.sent + 1);
            j.answers = items.map(function () { var r = rnd(); return r < .58 ? '1' : r < .8 ? '2' : r < .92 ? '3' : r < .96 ? '4' : r < .98 ? 'NO' : 'NA'; });
            j.findings = j.answers.map(function (a) { return a === '3' ? 'Damage visible; repair needed.' : a === '4' ? 'Safety hazard. VIGN told you the same day.' : a === '2' ? 'Minor wear.' : ''; });
            j.photos = 4 + Math.floor(rnd() * 8);
            j.miles = (rnd() * .04).toFixed(2);   // how far the photos were taken from the address
            j.inv = j.created < -26 ? 'INV-2580' : 'INV-2610';
        }
    });
    VC.jobs = jobs;
})();

/* Invoices (same numbers as the Admin Menu). Plan: monthly per job = the month's jobs added up, one bill. SAMPLE price $65 a job. */
VC.invoices = [
    { id: 'NEXT-02', period: 'November 2026 · so far 31 jobs × $65', billed: null, next: 19, due: 49, amount: 2015, paid: 0 },
    { id: 'INV-2610', period: 'October 2026 · 17 jobs × $65', billed: -10, due: 20, amount: 1105, paid: 500 },
    { id: 'INV-2580', period: 'September 2026 · 16 jobs × $65', billed: -41, due: -11, amount: 1040, paid: 1040, paidOn: -15, how: 'ACH' },
    { id: 'INV-2561', period: 'August 2026 · 14 jobs × $65', billed: -72, due: -42, amount: 910, paid: 910, paidOn: -45, how: 'Check #5231' },
    { id: 'INV-2533', period: 'July 2026 · 19 jobs × $65', billed: -102, due: -72, amount: 1235, paid: 1235, paidOn: -76, how: 'ACH' }
];
VC.payments = [
    { id: 'PAY-881', on: -6, inv: 'INV-2610', amount: 500, how: 'ACH', ref: 'ACH 22093' },
    { id: 'PAY-850', on: -15, inv: 'INV-2580', amount: 1040, how: 'ACH', ref: 'ACH 21877' },
    { id: 'PAY-812', on: -45, inv: 'INV-2561', amount: 910, how: 'Check', ref: 'Check #5231' },
    { id: 'PAY-790', on: -76, inv: 'INV-2533', amount: 1235, how: 'ACH', ref: 'ACH 20114' }
];

/* Documents VIGN shared with this client (Don's R-10): view and download their own files only */
VC.documents = [
    { id: 'D-21', name: 'Client Service Agreement - First Harbor Mortgage.pdf', type: 'Agreement', up: -40, signed: 'Signed', signedOn: -38, size: '220 KB' },
    { id: 'D-24', name: 'Card Auto-Pay Authorization - First Harbor Mortgage.pdf', type: 'Agreement', up: -2, signed: 'Waiting', size: '96 KB', note: 'Sign this and add a card to have invoices paid automatically.' },
    { id: 'D-13', name: 'How to Order an Inspection.pdf', type: 'Instructions', up: -25, signed: '—', size: '410 KB' },
    { id: 'D-26', name: 'Order spreadsheet template.csv', type: 'Instructions', up: -25, signed: '—', size: '2 KB' },
    { id: 'D-27', name: 'Our services and turnaround times.pdf', type: 'Instructions', up: -25, signed: '—', size: '310 KB' }
];

/* One conversation per job, newest first */
VC.threads = [
    { job: 'VG-24123', unread: true, msgs: [
        { from: 'VIGN', who: 'VIGN office', on: -1, at: '4:12 PM', text: 'Maria went to 72 Front St today but the gate is locked. Can you send a gate code or a contact who can open it? She can go back tomorrow.' }] },
    { job: 'VG-24131', unread: true, msgs: [
        { from: 'You', who: 'Ana Reyes', on: -1, at: '9:05 AM', text: 'This one is a rush, the investor needs it by tomorrow.' },
        { from: 'VIGN', who: 'VIGN office', on: -1, at: '9:40 AM', text: 'Got it. We are finding an inspector near Garden City now and will update you today.' }] },
    { job: 'VG-24109', unread: false, msgs: [
        { from: 'You', who: 'Ana Reyes', on: -9, at: '2:30 PM', text: 'Can you add a photo of the back deck?' },
        { from: 'VIGN', who: 'VIGN office', on: -8, at: '10:02 AM', text: 'Added two photos of the deck to the report. You can download the new PDF now.' }] }
];

/* Activity feed (newest first). Home shows the newest 8. */
VC.activity = [
    [0, '10:20 AM', 'order', 'VG-24135', 'Order received (44 Hilton Ave)'],
    [-1, '4:12 PM', 'needs', 'VG-24123', 'The inspector could not get in (gate locked). VIGN needs a gate code'],
    [-1, '11:48 AM', 'checking', 'VG-24117', 'Report sent in. VIGN is checking it'],
    [-2, '3:05 PM', 'checking', 'VG-24119', 'Report sent in. VIGN is checking it'],
    [-2, '1:30 PM', 'checking', 'VG-24120', 'Report sent in. VIGN is checking it'],
    [-2, '9:00 AM', 'assigned', 'VG-24128', 'Inspector assigned: Derek Hall'],
    [-3, '8:15 AM', 'visit', 'VG-24126', 'Visit started: Angela Ruiz'],
    [-6, '10:00 AM', 'paid', 'INV-2610', 'Payment received: $500.00 (ACH)'],
    [-8, '10:02 AM', 'ready', 'VG-24109', 'Report updated: 2 photos added'],
    [-10, '6:00 AM', 'invoice', 'INV-2610', 'Monthly invoice sent: $1,105.00 (October, 17 jobs)']
];

VC.colleagues = [
    { name: 'Ana Reyes', email: 'ops@firstharbor.example', sees: 'All First Harbor jobs', you: true, last: 0 },
    { name: 'Tom Brennan', email: 'tbrennan@firstharbor.example', sees: 'All First Harbor jobs', last: -3 },
    { name: 'Lisa Wong', email: 'lwong@firstharbor.example', sees: 'Only jobs she sends', last: -12 }
];

/* ---------------------------------------------------------
   Which sample client is signed in (picked on the sign-in page, kept for this browser tab):
     fh = First Harbor Mortgage (property and loan inspections)   bb = Bright Brew Coffee Co. (mystery shopping)
   Both match the Admin Menu (same jobs, invoices, plan and agreement status).
   --------------------------------------------------------- */
VC.kind = 'inspect'; VC.refLabel = 'Loan #'; VC.order = ['property', 'loan', 'collateral'];
(function () {
    var who = 'fh'; try { who = sessionStorage.getItem('vc-who') || 'fh'; } catch (e) {}
    if (who !== 'bb') return;
    VC.kind = 'shop'; VC.refLabel = 'Store #'; VC.order = ['mystery', 'cx'];
    VC.STATUS.scheduled = ['Shopper assigned', 'st-assigned', 'fa-user-check', 'A shopper has the job and will visit by the due date.'];
    VC.STATUS.in_field = ['Visit under way', 'st-field', 'fa-person-walking', 'The shopper is visiting the store or went today.'];
    VC.STATUS.checking[3] = 'The shopper sent the report. VIGN checks every report before you see it.';
    VC.me = { name: 'Karen Olsen', first: 'Karen', title: 'Customer Experience Lead', email: 'cx@brightbrew.example', phone: '(516) 555-0177' };
    VC.company = { id: 1003, name: 'Bright Brew Coffee Co.', plan: 'Per job', rate: 55, agree: 'No', card: 'MC •••• 2290', terms: 15 };
    VC.forms.mystery = ['Mystery Shop Visit (sample form)', ['Greeting and first impression', 'Staff knowledge and helpfulness', 'Wait time and speed of service', 'Store cleanliness and presentation', 'Policy and procedure compliance', 'Checkout and closing experience']];
    VC.formFor.mystery = 'mystery'; VC.formFor.cx = 'mystery';
    var seed = 5; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var stores = [['Bright Brew #14', '2210 Hempstead Tpke', 'East Meadow, NY 11554'], ['Bright Brew #19', '3128 Northern Blvd', 'Manhasset, NY 11030'], ['Bright Brew #22', '41 Main St', 'Port Washington, NY 11050'], ['Bright Brew #7', '900 Old Country Rd', 'Garden City, NY 11530'], ['Bright Brew #31', '155 Sunrise Hwy', 'Rockville Centre, NY 11570'], ['Bright Brew #9', '62 Merrick Rd', 'Lynbrook, NY 11563']];
    var shoppers = ['Priya Nair', 'Maria Lopez', 'Angela Ruiz'];
    var jobs = [
        { id: 'VG-24133', store: 0, created: 0, due: 7, status: 'received', ins: '', prio: 'Routine', from: 'Website order RQ-1047', when: 'Weekend visit, afternoon' },
        { id: 'VG-24122', store: 1, created: -2, due: 3, status: 'scheduled', ins: 'Priya Nair', prio: 'Routine', visitOn: 2 },
        { id: 'VG-24124', store: 2, created: -3, due: 0, status: 'in_field', ins: 'Maria Lopez', prio: 'Routine', visits: 1 },
        { id: 'VG-24116', store: 3, created: -4, due: -1, status: 'checking', ins: 'Priya Nair', prio: 'Routine', visits: 1, sent: 0 }
    ];
    for (var k = 0; k < 10; k++) { var c = -6 - Math.floor(rnd() * 30); jobs.push({ id: 'VG-' + (24108 - k * 4), store: k % stores.length, created: c, due: c + 4, status: 'ready', ins: shoppers[k % 3], prio: 'Routine', visits: 1, sent: Math.min(-1, c + 3) }); }
    jobs.forEach(function (j) {
        var s = stores[j.store]; j.svc = j.id === 'VG-24104' || j.id === 'VG-24092' ? 'cx' : 'mystery'; j.form = 'mystery';
        j.addr = s[0] + ', ' + s[1]; j.city = s[2]; j.ref = 'Store ' + s[0].replace('Bright Brew ', ''); j.price = VC.price[j.svc]; j.visits = j.visits || 0;
        j.access = 'Customer visit'; j.contact = '';
        j.notes = (j.when ? j.when + '. ' : '') + 'Visit as a regular customer. Do not tell staff. Buy one drink and keep the receipt (up to $6 paid back).';
        if (j.status === 'ready') {
            j.reviewed = Math.min(0, j.sent + 1);
            j.answers = VC.forms.mystery[1].map(function () { var r = rnd(); return r < .5 ? '1' : r < .8 ? '2' : r < .93 ? '3' : '4'; });
            j.findings = j.answers.map(function (a) { return a === '3' ? 'Below standard. See the shopper notes.' : a === '4' ? 'Did not meet the standard.' : a === '2' ? 'Mostly met the standard.' : ''; });
            j.photos = 2 + Math.floor(rnd() * 3); j.miles = '0.00';
            j.inv = j.id === 'VG-24108' ? 'INV-2612' : j.reviewed >= -20 ? 'INV-2598' : 'INV-2570';
        }
    });
    VC.jobs = jobs;
    VC.invoices = [
        { id: 'INV-2612', period: 'VG-24108 · 1 shop × $55', billed: -4, due: 4, amount: 55, paid: 0 },
        { id: 'INV-2598', period: '9 shops × $50', billed: -32, due: -17, amount: 450, paid: 0 },
        { id: 'INV-2570', period: '6 shops × $55', billed: -60, due: -45, amount: 330, paid: 330, paidOn: -44, how: 'Card (by hand)' }
    ];
    VC.payments = [{ id: 'PAY-801', on: -44, inv: 'INV-2570', amount: 330, how: 'Card', ref: 'MC •••• 2290 (paid by hand)' }];
    VC.documents = [
        { id: 'D-19', name: 'Client Service Agreement - Bright Brew Coffee Co.pdf', type: 'Agreement', up: -6, signed: 'Waiting', size: '221 KB', note: 'Please sign. Card auto-pay needs a signed agreement.' },
        { id: 'D-25', name: 'Card Auto-Pay Authorization - Bright Brew Coffee Co.pdf', type: 'Agreement', up: -6, signed: 'Waiting', size: '96 KB', note: 'Sign this to have invoices charged to your card automatically.' },
        { id: 'D-14', name: 'Mystery Shopper Instructions.pdf', type: 'Instructions', up: -30, signed: '—', size: '640 KB' },
        { id: 'D-28', name: 'How to Order Mystery Shops.pdf', type: 'Instructions', up: -25, signed: '—', size: '380 KB' }
    ];
    VC.threads = [
        { job: 'VG-24116', unread: true, msgs: [{ from: 'VIGN', who: 'VIGN office', on: 0, at: '8:30 AM', text: 'Priya sent the report for Bright Brew #7. We are checking it now. One item was rated 4: the checkout counter was blocked. We will confirm and send it today.' }] },
        { job: 'VG-24122', unread: false, msgs: [{ from: 'You', who: 'Karen Olsen', on: -2, at: '1:15 PM', text: 'For #19 please visit between 2 and 4 PM, that is when the new team is on.' }, { from: 'VIGN', who: 'VIGN office', on: -2, at: '2:02 PM', text: 'Noted. Priya will go in the afternoon.' }] }
    ];
    VC.activity = [
        [0, '10:05 AM', 'order', 'VG-24133', 'Order received from the website (Bright Brew #14)'],
        [0, '8:30 AM', 'checking', 'VG-24116', 'Shop report sent in. VIGN is checking it'],
        [-2, '9:00 AM', 'assigned', 'VG-24122', 'Shopper assigned: Priya Nair'],
        [-3, '7:40 AM', 'visit', 'VG-24124', 'Visit started: Maria Lopez'],
        [-4, '6:00 AM', 'invoice', 'INV-2612', 'Invoice sent: $55.00 (1 shop)'],
        [-17, '6:00 AM', 'needs', 'INV-2598', 'Invoice INV-2598 is past due ($450.00)']
    ];
    VC.colleagues = [
        { name: 'Karen Olsen', email: 'cx@brightbrew.example', sees: 'All Bright Brew jobs', you: true, last: 0 },
        { name: 'Mark Ellis', email: 'mellis@brightbrew.example', sees: 'Only jobs he sends', last: -5 }
    ];
})();
