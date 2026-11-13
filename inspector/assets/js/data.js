/* =========================================================
   SAMPLE DATA ONLY. In the real system this is what the server returns
   (like SMK's $larray->headerTable from PSJSON_post). Nothing here is real.
   Day numbers are offsets from today (0 = today, -1 = yesterday).
   ========================================================= */
var VIGN = window.VIGN = window.VIGN || {};

VIGN.me = { name: 'Maria Lopez', id: 'INS-0417', area: 'Hempstead, NY', company: 'VIGN USA', phone: '516 924-0087', tel: '+15169240087' };

VIGN.services = {
    mystery:    ['Mystery Shoppers', 'fa-cart-shopping'],
    loan:       ['Loan Servicing', 'fa-house'],
    property:   ['Property & Field Inspections', 'fa-clipboard-check'],
    collateral: ['Loan Servicing & Collateral', 'fa-car'],
    cx:         ['Mystery Shopping & CX', 'fa-magnifying-glass']
};

// Rating scale from the VIG Property Inspection Forms. Lower is better.
VIGN.ratings = [
    ['1', 'Good', 'No issue observed'], ['2', 'Minor', 'Minor concern'], ['3', 'Repair', 'Repair indicated'],
    ['4', 'Urgent', 'Urgent safety concern'], ['NO', 'N/O', 'Not observed'], ['NA', 'N/A', 'Not applicable']
];
// Score formula is NOT decided yet: 1=100, 2=67, 3=33, 4=0; N/O and N/A not counted.
VIGN.points = { '1': 100, '2': 67, '3': 33, '4': 0 };

// Checklists copied from the VIG forms docx. The mystery form is a placeholder until VIGN sends theirs.
/* the forms come from ../js/vign-forms.js (one copy, same as the main system) */
VIGN.forms = {}; VIGNFORMS.order.forEach(function (k) { VIGN.forms[k] = { key: k, title: VIGNFORMS[k].title, items: VIGNFORMS.items(k) }; });

// status: assigned | in_field | submitted | returned | approved
VIGN.jobs = [
    { id: 'VG-24081', svc: 'property', form: 'residential', client: 'First Harbor Mortgage', ref: 'Loan #FH-883021', addr: '1428 Maple Ridge Dr', city: 'Hempstead, NY 11550', county: 'Nassau', due: 0, assigned: -3, win: '9:00 AM – 12:00 PM', fee: 45, mi: 3.2, access: 'Interior authorized', status: 'assigned',
      contact: 'Occupant: J. Carter, (516) 555-0142. Call 30 minutes before you arrive.',
      notes: 'The client is checking a reported roof leak. Take extra photos of the upper-floor ceilings.',
      files: ['Inspection order.pdf', 'Prior report (2025).pdf'] },
    { id: 'VG-24070', svc: 'loan', form: 'vacant', client: 'Lakeshore Loan Servicing', ref: 'Loan #LLS-20417', addr: '77 Birchwood Ct', city: 'Hauppauge, NY 11788', county: 'Nassau', due: -1, assigned: -5, win: 'Any time', fee: 35, mi: 9.8, access: 'Exterior only', status: 'assigned',
      contact: 'No contact. The property is believed to be vacant.', notes: 'Do not enter. Do not disturb locks, utilities or belongings.', files: ['Inspection order.pdf'] },
    { id: 'VG-24082', svc: 'mystery', form: 'mystery', client: 'Bright Brew Coffee Co.', ref: 'Store #112', addr: 'Bright Brew #112, 220 Main St', city: 'Hempstead, NY 11550', county: 'Nassau', due: 0, assigned: -2, win: '7:00 AM – 10:00 AM', fee: 25, mi: 1.4, access: 'Customer visit', status: 'in_field',
      contact: 'Visit as a regular customer. Do not tell staff you are a shopper.', notes: 'Buy one drink and keep the receipt. Up to $6 is reimbursed.', files: ['Shopper guidelines.pdf'] },
    { id: 'VG-24077', svc: 'collateral', form: 'exterior', client: 'Midway Auto & Home Credit', ref: 'Acct #MW-55190', addr: '3901 Jericho Tpke', city: 'Syosset, NY 11791', county: 'Nassau', due: 2, assigned: -5, win: 'Any time', fee: 30, mi: 12.6, access: 'Exterior only', status: 'assigned',
      contact: 'No contact required.', notes: 'Confirm the collateral is at the address on file. Photograph the house number.', files: ['Inspection order.pdf'] },
    { id: 'VG-24085', svc: 'property', form: 'commercial', client: 'Keystone Insurance Group', ref: 'Policy #KIG-7730', addr: '615 Old Country Rd, Suite 200', city: 'Massapequa, NY 11758', county: 'Nassau', due: 4, assigned: 0, win: '1:00 PM – 4:00 PM', fee: 65, mi: 15.1, access: 'Interior authorized', status: 'assigned',
      contact: 'Building manager: D. Patel, (516) 555-0199.', notes: 'Annual insurance condition check. Include photos of exits and fire extinguishers.', files: ['Inspection order.pdf', 'Floor plan.pdf'] },
    { id: 'VG-24088', svc: 'cx', form: 'mystery', client: 'Northgate Savings Bank', ref: 'Branch #07', addr: 'Northgate Savings, 1800 Hempstead Tpke', city: 'Westbury, NY 11590', county: 'Nassau', due: 6, assigned: 0, win: '10:00 AM – 2:00 PM', fee: 30, mi: 8.7, access: 'Customer visit', status: 'assigned',
      contact: 'Ask about opening a savings account. Do not open one.', notes: 'Note the name of the banker who helps you and how long you waited.', files: ['Shopper guidelines.pdf'] },
    // ---- sent in ----
    { id: 'VG-24066', svc: 'property', form: 'residential', client: 'First Harbor Mortgage', ref: 'Loan #FH-881140', addr: '18 Elm St', city: 'Freeport, NY 11520', county: 'Nassau', due: -2, assigned: -6, fee: 45, mi: 7.0, access: 'Interior authorized', status: 'returned', sent: -2, score: 76, photos: 11,
      returned: 'Item 7 "Ceilings / walls / floors" is rated 3 (Repair) but has no photo. Please add a photo of the damage and send it again.' },
    { id: 'VG-24061', svc: 'loan', form: 'vacant', client: 'Lakeshore Loan Servicing', ref: 'Loan #LLS-19980', addr: '402 Oakview Ave', city: 'Valley Stream, NY 11580', county: 'Nassau', due: -1, assigned: -4, fee: 35, mi: 5.5, access: 'Exterior only', status: 'submitted', sent: -1, score: 71, photos: 9 },
    { id: 'VG-24058', svc: 'mystery', form: 'mystery', client: 'Bright Brew Coffee Co.', ref: 'Store #108', addr: 'Bright Brew #108, 1550 Northern Blvd', city: 'Garden City, NY 11530', county: 'Nassau', due: -3, assigned: -7, fee: 25, mi: 4.1, access: 'Customer visit', status: 'approved', sent: -3, done: -2, score: 92, photos: 4 },
    { id: 'VG-24049', svc: 'property', form: 'residential', client: 'Keystone Insurance Group', ref: 'Policy #KIG-7702', addr: '9 Willow Bend', city: 'Huntington, NY 11743', county: 'Nassau', due: -6, assigned: -10, fee: 45, mi: 8.3, access: 'Interior authorized', status: 'approved', sent: -6, done: -5, score: 84, photos: 14, paid: { date: -1, check: 'ACH-10294', how: 'Direct deposit' } },
    { id: 'VG-24040', svc: 'collateral', form: 'vacant', client: 'Midway Auto & Home Credit', ref: 'Acct #MW-54872', addr: '58 Merrick Ave', city: 'Merrick, NY 11566', county: 'Nassau', due: -9, assigned: -12, fee: 30, mi: 6.2, access: 'Exterior only', status: 'approved', sent: -9, done: -8, score: 88, photos: 8, paid: { date: -1, check: 'ACH-10294', how: 'Direct deposit' } },
    { id: 'VG-24031', svc: 'property', form: 'commercial', client: 'Keystone Insurance Group', ref: 'Policy #KIG-7655', addr: '2200 Jericho Tpke', city: 'Mineola, NY 11501', county: 'Nassau', due: -15, assigned: -18, fee: 65, mi: 9.1, access: 'Interior authorized', status: 'approved', sent: -15, done: -14, score: 79, photos: 18, paid: { date: -8, check: 'ACH-10177', how: 'Direct deposit' } },
    { id: 'VG-24022', svc: 'mystery', form: 'mystery', client: 'Bright Brew Coffee Co.', ref: 'Store #104', addr: 'Bright Brew #104, 88 Front St', city: 'Hempstead, NY 11550', county: 'Nassau', due: -20, assigned: -23, fee: 25, mi: 1.9, access: 'Customer visit', status: 'approved', sent: -20, done: -19, score: 95, photos: 3, paid: { date: -8, check: 'ACH-10177', how: 'Direct deposit' } }
];

VIGN.alerts = [
    ['red', 'fa-rotate-left', 'Report sent back: 18 Elm St', 'Item 7 needs a photo. Fix it and send it again.', 'fulljobstatus.html?job=VG-24066'],
    ['amber', 'fa-triangle-exclamation', '77 Birchwood Ct is overdue', 'It was due yesterday. Call the office if you cannot get there today.', 'fulljobstatus.html?job=VG-24070'],
    ['blue', 'fa-briefcase', '2 new jobs assigned', '615 Old Country Rd and Northgate Savings, 1800 Hempstead Tpke.', 'openjobsdetail.html'],
    ['green', 'fa-money-bill-wave', 'Payment sent: $75.00', 'Direct deposit ACH-10294 for 2 jobs.', 'payments.html']
];

/* ---------------------------------------------------------
   New offers (Don 2026-11-11): a job sent to every inspector who covers the area. First to accept gets it.
   Same job as the Admin Menu: VG-24131 is offered to Maria Lopez and Derek Hall.
   state: open | accepted | declined | taken (someone else accepted first)
   --------------------------------------------------------- */
// an accepted offer becomes one of my open jobs
VIGN.addOfferJob = function (o) {
    if (VIGN.jobs.some(function (j) { return j.id === o.id; })) return;
    VIGN.jobs.unshift({ id: o.id, svc: o.svc, form: o.form, client: o.client, ref: o.ref, addr: o.addr, city: o.city, county: o.county, due: o.due, assigned: 0, win: o.win || 'Any time', fee: o.fee, mi: o.mi, access: o.access || '', status: 'assigned',
        contact: 'No contact needed.', notes: 'Accepted from New offers.', photos: [], answers: [] });
};
VIGN.offers = [
    { id: 'VG-24131', svc: 'loan', form: 'residential', client: 'First Harbor Mortgage', ref: 'Loan #6614', addr: '1220 Maple Ridge Dr', city: 'Garden City, NY 11530', county: 'Nassau', due: 1, fee: 35, mi: 2.4, sent: 0, sentTo: 2, win: 'Any time', access: 'Exterior only', state: 'open' },
    { id: 'VG-24118', svc: 'property', form: 'residential', client: 'Keystone Insurance Group', ref: 'Policy #KIG-7741', addr: '31 Washington Ave', city: 'Hempstead, NY 11550', county: 'Nassau', due: 4, fee: 45, mi: 1.1, sent: -1, sentTo: 3, state: 'taken' }
];
(function () {
    var ans = {}; try { ans = JSON.parse(localStorage.getItem('vign-offer-answers') || '{}'); } catch (e) {}
    VIGN.offers.forEach(function (o) { if (o.state === 'open' && ans[o.id]) o.state = ans[o.id]; if (o.state === 'accepted') VIGN.addOfferJob(o); });
})();
