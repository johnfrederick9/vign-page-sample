/* =========================================================
   SAMPLE DATA ONLY for the VIGN Admin preview. Nothing here is real.
   Each SECTION is one tile on the Admin Menu (same structure as SMK admin/index.php),
   with its table columns, Add/Edit form fields and rows.
   The first 5 tiles are the customer's list (R-09, 2026-11-11):
     1 new inspection requests · 2 assign jobs · 3 approve new inspectors
     4 check finished inspections before the client sees them · 5 invoices (open + due) and inspector pay
   plus Documents (R-10) and client billing plans (R-09). Only what the customer asked for.
   The inspectors list has no tile; it is the data Assign / Approve use. Buttons are in link.js (V.ACTS).
   Day numbers are offsets from today (0 = today, -1 = yesterday, 5 = in 5 days).
   ========================================================= */
var VA = window.VA = window.VA || {};

VA.me = { name: 'Don Balducci', role: 'Administrator' };

// col: [key, label, type]   type: r | money | date | due | yesno | status | score
// field: [key, label, type, opts]   type: text | select | date | number | textarea | file
VA.sections = [
    { key: 'requests', title: 'New Inspection Requests', icon: 'fa-inbox', color: 'blue',
      desc: 'Orders sent in by clients (website "Request Inspection" form, client portal, or file import). Make each one a job, then assign it.',
      add: 'Add Request', toggle: false,
      cols: [['date', 'Received', 'date'], ['id', 'Request #'], ['company', 'Client'], ['service', 'Service'], ['addr', 'Address / Location'], ['wanted', 'Wanted By', 'date'], ['status', 'Status', 'status']],
      fields: [['company', 'Client', 'text'], ['contact', 'Contact name', 'text'], ['service', 'Service', 'select', ['Mystery Shoppers', 'Loan Servicing', 'Property & Field Inspections', 'Loan Servicing & Collateral Inspections', 'Mystery Shopping & Customer Experience']], ['addr', 'Address / location', 'text'], ['wanted', 'Wanted by', 'date'], ['notes', 'Notes from the client', 'textarea']],
      rows: [
        { id: 'RQ-1048', date: 0, company: 'Lakeshore Loan Servicing', contact: 'M. Chen', service: 'Loan Servicing', addr: '88 Birchwood Ct, Huntington, NY 11743', wanted: 4, notes: 'Vacant. Check winterization.', status: 'New' },
        { id: 'RQ-1047', date: 0, company: 'Bright Brew Coffee Co.', contact: 'K. Olsen', service: 'Mystery Shoppers', addr: 'Bright Brew #14, 2210 Hempstead Tpke, East Meadow, NY', wanted: 7, notes: 'Weekend visit, afternoon.', status: 'New' },
        { id: 'RQ-1046', date: -1, company: 'Keystone Insurance Group', contact: 'D. Wright', service: 'Property & Field Inspections', addr: '415 Jericho Tpke, Syosset, NY 11791', wanted: 3, notes: 'Roof claim. Exterior photos.', status: 'New' },
        { id: 'RQ-1045', date: -1, company: 'Hometown Realty (new)', contact: 'P. Grant', service: 'Property & Field Inspections', addr: '9 Oakview Ave, Massapequa, NY 11758', wanted: 5, notes: 'First order from the website.', status: 'New' },
        { id: 'RQ-1041', date: -3, company: 'First Harbor Mortgage', contact: 'A. Reyes', service: 'Loan Servicing', addr: '1220 Maple Ridge Dr, Garden City, NY 11530', wanted: 1, notes: '', status: 'Made into job' },
        { id: 'RQ-1039', date: -4, company: 'Unknown sender', contact: '', service: 'Mystery Shoppers', addr: 'No address given', wanted: 0, notes: 'Test message', status: 'Declined' }
      ] },

    { key: 'jobs', title: 'Assign Jobs', icon: 'fa-user-check', color: 'amber',
      desc: 'Open jobs and who is doing them. Red = no inspector yet. Tick several jobs to assign them together.',
      add: '', toggle: false, assign: true,
      cols: [['id', 'Job #'], ['client', 'Client'], ['service', 'Service'], ['addr', 'Address / Location'], ['due', 'Due', 'due'], ['inspector', 'Inspector'], ['status', 'Status', 'status']],
      fields: [],
      rows: [
        { id: 'VG-24131', client: 'First Harbor Mortgage', service: 'Loan Servicing', addr: '1220 Maple Ridge Dr, Garden City, NY', due: 1, inspector: '', status: 'Unassigned' },
        { id: 'VG-24130', client: 'Midway Auto & Home Credit', service: 'Loan Servicing & Collateral Inspections', addr: '4896 Sunrise Hwy, Bohemia, NY', due: 2, inspector: '', status: 'Unassigned' },
        { id: 'VG-24129', client: 'Northgate Savings Bank', service: 'Mystery Shopping & Customer Experience', addr: 'Northgate Branch #04, Old Country Rd, Westbury', due: 5, inspector: '', status: 'Unassigned' },
        { id: 'VG-24127', client: 'Lakeshore Loan Servicing', service: 'Loan Servicing', addr: '7153 Merrick Rd, Merrick, NY', due: -1, inspector: 'Derek Hall', status: 'Assigned' },
        { id: 'VG-24125', client: 'Keystone Insurance Group', service: 'Property & Field Inspections', addr: '1808 Veterans Hwy, Hauppauge, NY', due: 0, inspector: 'Angela Ruiz', status: 'In field' },
        { id: 'VG-24122', client: 'Bright Brew Coffee Co.', service: 'Mystery Shoppers', addr: 'Bright Brew #19, 3128 Northern Blvd, Manhasset', due: 3, inspector: 'Priya Nair', status: 'Assigned' },
        { id: 'VG-24120', client: 'First Harbor Mortgage', service: 'Property & Field Inspections', addr: '18 Elm St, Freeport, NY', due: -2, inspector: 'Maria Lopez', status: 'Sent back' }
      ] },

    { key: 'signups', title: 'Approve New Inspectors', icon: 'fa-user-plus', color: 'green',
      desc: 'People who signed up free on the website ("For Inspectors"). Approve to add them to the network, or decline.',
      add: '', toggle: false, approve: true,
      cols: [['date', 'Signed Up', 'date'], ['name', 'Name'], ['role', 'Wants To Be'], ['area', 'Area'], ['exp', 'Experience'], ['status', 'Status', 'status']],
      fields: [['name', 'Full name', 'text'], ['role', 'Wants to be', 'select', ['Inspector', 'Mystery Shopper', 'Both']], ['area', 'Area', 'text'], ['exp', 'Experience', 'textarea'], ['status', 'Status', 'select', ['New', 'Approved', 'Declined']]],
      rows: [
        { id: 'J-310', date: 0, name: 'Chris Morgan', email: 'chris@example.com', role: 'Inspector', area: 'Huntington, NY', exp: '3 years doing property preservation', status: 'New' },
        { id: 'J-309', date: -1, name: 'Lena Fischer', email: 'lena@example.com', role: 'Mystery Shopper', area: 'Hempstead, NY', exp: 'Retail manager, 6 years', status: 'New' },
        { id: 'J-308', date: -2, name: 'Omar Haddad', email: 'omar@example.com', role: 'Both', area: 'Levittown, NY', exp: 'Insurance field adjuster', status: 'New' },
        { id: 'J-305', date: -5, name: 'Beth Carter', email: 'beth@example.com', role: 'Inspector', area: 'Babylon, NY', exp: 'Real estate agent', status: 'Approved' },
        { id: 'J-301', date: -9, name: 'Ray Simmons', email: 'ray@example.com', role: 'Mystery Shopper', area: 'Queens, NY', exp: 'None', status: 'Declined' }
      ] },

    { key: 'finished', title: 'Check Finished Inspections', icon: 'fa-list-check', color: 'navy',
      desc: 'Reports sent in by inspectors. The client does not see a report until you approve it. Open one to see the score, photos and problem items. The Mystery Shop form and the score formula are SAMPLES until the customer sends his.',
      add: '', toggle: false,
      cols: [['sent', 'Sent In', 'date'], ['id', 'Job #'], ['client', 'Client'], ['inspector', 'Inspector'], ['form', 'Form'], ['score', 'Score (sample)', 'score'], ['photos', 'Photos', 'r'], ['seen', 'Client Can See', 'yesno'], ['status', 'Status', 'status']],
      fields: [],
      rows: [
        { id: 'VG-24116', sent: 0, client: 'Bright Brew Coffee Co.', inspector: 'Priya Nair', form: 'Mystery Shop Visit (sample form)', score: 72, photos: 3, flags: ['Item 4 rated 4 (urgent): checkout counter blocked'], seen: 'No', status: 'Waiting review' },
        { id: 'VG-24117', sent: -1, client: 'First Harbor Mortgage', inspector: 'Maria Lopez', form: 'Residential Property Inspection', score: 74, photos: 9, flags: ['Item 2 rated 4 (urgent): foundation crack', 'Item 13 rated 4 (urgent): water stain, ceiling'], seen: 'No', status: 'Waiting review' },
        { id: 'VG-24118', sent: -1, client: 'Midway Auto & Home Credit', inspector: 'Derek Hall', form: 'Vacant Property / Preservation', score: 82, photos: 7, flags: ['Item 1 rated 3, but no photo'], seen: 'No', status: 'Waiting review' },
        { id: 'VG-24119', sent: -2, client: 'First Harbor Mortgage', inspector: 'Angela Ruiz', form: 'Residential Property Inspection', score: 64, photos: 8, flags: ['Photos taken 0.4 miles from the address'], seen: 'No', status: 'Waiting review' },
        { id: 'VG-24110', sent: -3, client: 'Keystone Insurance Group', inspector: 'Derek Hall', form: 'Commercial Property Inspection', score: 91, photos: 12, flags: [], seen: 'Yes', status: 'Approved' },
        { id: 'VG-24108', sent: -4, client: 'Northgate Savings Bank', inspector: 'Priya Nair', form: 'Mystery Shop Visit (sample form)', score: 88, photos: 2, flags: [], seen: 'Yes', status: 'Approved' }
      ] },

    { key: 'invoices', title: 'Client Invoices', icon: 'fa-file-invoice-dollar', color: 'red',
      desc: 'Invoices to clients: which are open and when they are due. Billing runs automatically by each client\'s plan. Plans: per job (one bill per job), monthly per job (the month\'s jobs added up, one bill), monthly flat fee, yearly flat fee. All prices are SAMPLES: plans and prices are not decided yet.',
      add: 'New Invoice', toggle: false,
      views: [['open', 'Open'], ['late', 'Past due'], ['soon', 'Due in 7 days'], ['next', 'Bills next (automatic)'], ['paid', 'Paid'], ['all', 'All']],
      cols: [['id', 'Invoice #'], ['client', 'Client'], ['plan', 'Plan'], ['period', 'For'], ['billed', 'Billed On', 'date'], ['due', 'Due Date', 'due'], ['amount', 'Amount', 'money'], ['bal', 'Balance', 'money'], ['status', 'Status', 'status']],
      fields: [['client', 'Client', 'select', ['First Harbor Mortgage', 'Lakeshore Loan Servicing', 'Bright Brew Coffee Co.', 'Keystone Insurance Group', 'Midway Auto & Home Credit', 'Northgate Savings Bank']], ['plan', 'Plan', 'select', ['Per job', 'Monthly (per job)', 'Monthly (flat fee)', 'Yearly (flat fee)']], ['period', 'For (jobs or period)', 'text'], ['billed', 'Billed on', 'date'], ['due', 'Due date', 'date'], ['amount', 'Amount ($)', 'number']],
      rows: [
        { id: 'INV-2611', client: 'Lakeshore Loan Servicing', plan: 'Monthly (flat fee)', period: 'October 2026 · flat fee', billed: -10, due: 20, amount: 2500, paid: 0 },
        { id: 'INV-2610', client: 'First Harbor Mortgage', plan: 'Monthly (per job)', period: 'October 2026 · 17 jobs × $65', billed: -10, due: 20, amount: 1105, paid: 500 },
        { id: 'INV-2612', client: 'Bright Brew Coffee Co.', plan: 'Per job', period: 'VG-24108', billed: -4, due: 4, amount: 55, paid: 0 },
        { id: 'INV-2606', client: 'Northgate Savings Bank', plan: 'Per job', period: 'VG-24099', billed: -12, due: 3, amount: 70, paid: 0 },
        { id: 'INV-2598', client: 'Bright Brew Coffee Co.', plan: 'Per job', period: '9 shops', billed: -32, due: -17, amount: 450, paid: 0 },
        { id: 'INV-2589', client: 'Midway Auto & Home Credit', plan: 'Monthly (per job)', period: 'September 2026 · 11 jobs × $30', billed: -41, due: -11, amount: 330, paid: 0 },
        { id: 'INV-2604', client: 'Keystone Insurance Group', plan: 'Yearly (flat fee)', period: '2026 · flat fee, paid in full', billed: -60, due: -30, amount: 9600, paid: 9600 },
        { id: 'INV-2590', client: 'Midway Auto & Home Credit', plan: 'Monthly (per job)', period: 'August 2026 · 22 jobs × $30', billed: -72, due: -42, amount: 660, paid: 660 },
        { id: 'NEXT-01', client: 'Lakeshore Loan Servicing', plan: 'Monthly (flat fee)', period: 'November 2026 · flat fee', billed: null, next: 19, due: 49, amount: 2500, paid: 0 },
        { id: 'NEXT-02', client: 'First Harbor Mortgage', plan: 'Monthly (per job)', period: 'November 2026 · so far 31 jobs × $65', billed: null, next: 19, due: 49, amount: 2015, paid: 0 },
        { id: 'NEXT-03', client: 'Midway Auto & Home Credit', plan: 'Monthly (per job)', period: 'November 2026 · so far 11 jobs × $30', billed: null, next: 19, due: 49, amount: 330, paid: 0 },
        { id: 'NEXT-04', client: 'Keystone Insurance Group', plan: 'Yearly (flat fee)', period: '2027 · flat fee', billed: null, next: 51, due: 81, amount: 9600, paid: 0 }
      ] },

    { key: 'statements', title: 'Inspector Payments', icon: 'fa-money-check-dollar', color: 'green',
      desc: 'What each inspector and shopper is paid, and whether it has gone out. They see these on their "Payments" page.',
      add: 'New Pay Statement', toggle: false, markpaid: true,
      cols: [['id', 'Statement #'], ['inspector', 'Inspector'], ['period', 'Period'], ['jobs', 'Jobs', 'r'], ['amount', 'Amount', 'money'], ['how', 'How Paid'], ['payday', 'Pay Date', 'date'], ['status', 'Status', 'status']],
      fields: [['inspector', 'Inspector', 'select', ['Maria Lopez', 'Derek Hall', 'Priya Nair', 'Angela Ruiz']], ['period', 'Period', 'text'], ['jobs', 'Jobs', 'number'], ['amount', 'Amount ($)', 'number'], ['how', 'How paid', 'select', ['Direct deposit', 'Check']], ['payday', 'Pay date', 'date'], ['status', 'Status', 'select', ['Pending', 'Paid']]],
      rows: [
        { id: 'ST-0921', inspector: 'Maria Lopez', period: 'Nov 8 – Nov 14', jobs: 1, amount: 45, how: 'Direct deposit', payday: 4, status: 'Pending' },
        { id: 'ST-0922', inspector: 'Angela Ruiz', period: 'Nov 8 – Nov 14', jobs: 3, amount: 135, how: 'Direct deposit', payday: 4, status: 'Pending' },
        { id: 'ST-0923', inspector: 'Derek Hall', period: 'Nov 8 – Nov 14', jobs: 5, amount: 175, how: 'Check', payday: 4, status: 'Pending' },
        { id: 'ST-0912', inspector: 'Maria Lopez', period: 'Nov 1 – Nov 7', jobs: 2, amount: 90, how: 'Direct deposit', payday: -3, status: 'Paid' },
        { id: 'ST-0913', inspector: 'Derek Hall', period: 'Nov 1 – Nov 7', jobs: 6, amount: 210, how: 'Direct deposit', payday: -3, status: 'Paid' },
        { id: 'ST-0914', inspector: 'Priya Nair', period: 'Nov 1 – Nov 7', jobs: 4, amount: 100, how: 'Check', payday: -3, status: 'Paid' }
      ] },

    { key: 'documents', title: 'Documents', icon: 'fa-folder-open', color: 'orange',
      desc: 'Agreements, instructions and tax forms (1099). Upload a file and choose who can see it. Clients and inspectors only see their own files; 1099s are private.',
      add: 'Upload Document', toggle: false,
      views: [['all', 'All'], ['Agreement', 'Agreements'], ['Instructions', 'Instructions'], ['1099', '1099 / Tax'], ['unsigned', 'Not signed yet']],
      cols: [['name', 'File'], ['type', 'Type'], ['who', 'For'], ['visible', 'Who Can See It'], ['up', 'Uploaded', 'date'], ['signed', 'Signed', 'status']],
      fields: [['type', 'Type', 'select', ['Agreement', 'Instructions', '1099', 'Other']], ['who', 'For', 'select', ['All clients', 'All inspectors', 'First Harbor Mortgage', 'Lakeshore Loan Servicing', 'Bright Brew Coffee Co.', 'Keystone Insurance Group', 'Midway Auto & Home Credit', 'Northgate Savings Bank', 'Maria Lopez', 'Derek Hall', 'Priya Nair', 'Angela Ruiz']], ['file', 'File (PDF, Word)', 'file'], ['needsign', 'Needs a signature?', 'select', ['No', 'Yes']]],
      rows: [
        { id: 'D-21', name: 'Client Service Agreement - First Harbor Mortgage.pdf', type: 'Agreement', who: 'First Harbor Mortgage', up: -40, signed: 'Signed', size: '220 KB' },
        { id: 'D-20', name: 'Client Service Agreement - Lakeshore Loan Servicing.pdf', type: 'Agreement', who: 'Lakeshore Loan Servicing', up: -35, signed: 'Signed', size: '218 KB' },
        { id: 'D-19', name: 'Client Service Agreement - Bright Brew Coffee Co.pdf', type: 'Agreement', who: 'Bright Brew Coffee Co.', up: -6, signed: 'Waiting', size: '221 KB' },
        { id: 'D-18', name: 'Card Auto-Pay Authorization - Midway Auto & Home Credit.pdf', type: 'Agreement', who: 'Midway Auto & Home Credit', up: -20, signed: 'Signed', size: '96 KB' },
        { id: 'D-17', name: 'Independent Inspector Agreement - Maria Lopez.pdf', type: 'Agreement', who: 'Maria Lopez', up: -90, signed: 'Signed', size: '180 KB' },
        { id: 'D-16', name: 'Independent Inspector Agreement - Angela Ruiz.pdf', type: 'Agreement', who: 'Angela Ruiz', up: -8, signed: 'Waiting', size: '180 KB' },
        { id: 'D-15', name: 'Inspector Field Instructions v1.pdf', type: 'Instructions', who: 'All inspectors', up: -30, signed: '—', size: '1.2 MB' },
        { id: 'D-14', name: 'Mystery Shopper Instructions.pdf', type: 'Instructions', who: 'All inspectors', up: -30, signed: '—', size: '640 KB' },
        { id: 'D-13', name: 'How to Order an Inspection.pdf', type: 'Instructions', who: 'All clients', up: -25, signed: '—', size: '410 KB' },
        { id: 'D-12', name: '1099-NEC 2025 - Maria Lopez.pdf', type: '1099', who: 'Maria Lopez', up: -200, signed: '—', size: '85 KB' },
        { id: 'D-11', name: '1099-NEC 2025 - Derek Hall.pdf', type: '1099', who: 'Derek Hall', up: -200, signed: '—', size: '85 KB' }
      ] },

    { key: 'clients', title: 'Clients & Billing Plans', icon: 'fa-address-card', color: 'red',
      desc: 'Companies that order inspections. Each has a billing plan: per job, monthly per job (jobs added up once a month), monthly flat fee, or yearly flat fee. Plans and prices are SAMPLES, not decided yet. A card is charged automatically only when the client has a signed agreement.',
      add: 'Add Client', toggle: true,
      cols: [['id', 'ID'], ['name', 'Name'], ['plan', 'Plan'], ['agree', 'Agreement Signed', 'yesno'], ['card', 'Card On File'], ['auto', 'Auto-Charge Card', 'yesno'], ['jobsThis', 'Jobs This Month', 'r'], ['bal', 'Balance', 'money'], ['active', 'Active', 'yesno']],
      fields: [['name', 'Company name', 'text'], ['type', 'Type', 'select', ['Mortgage lender', 'Loan servicer', 'Insurance', 'Property manager', 'Retail / restaurant', 'Bank', 'Other']], ['contact', 'Main contact', 'text'], ['email', 'Contact email', 'text'], ['plan', 'Billing plan', 'select', ['Per job', 'Monthly (per job)', 'Monthly (flat fee)', 'Yearly (flat fee)']], ['agree', 'Agreement signed', 'select', ['No', 'Yes']], ['card', 'Card on file (last 4 only)', 'text'], ['auto', 'Charge the card automatically', 'select', ['No', 'Yes']], ['active', 'Active', 'select', ['Yes', 'No']]],
      rows: [
        { id: 1001, name: 'First Harbor Mortgage', type: 'Mortgage lender', contact: 'A. Reyes', email: 'ops@firstharbor.example', plan: 'Monthly (per job)', agree: 'Yes', card: '', auto: 'No', jobsThis: 31, bal: 605, active: 'Yes' },
        { id: 1002, name: 'Lakeshore Loan Servicing', type: 'Loan servicer', contact: 'M. Chen', email: 'field@lakeshore.example', plan: 'Monthly (flat fee)', agree: 'Yes', card: 'Visa •••• 4417', auto: 'Yes', jobsThis: 40, bal: 2500, active: 'Yes' },
        { id: 1003, name: 'Bright Brew Coffee Co.', type: 'Retail / restaurant', contact: 'K. Olsen', email: 'cx@brightbrew.example', plan: 'Per job', agree: 'No', card: 'MC •••• 2290', auto: 'No', jobsThis: 18, bal: 505, active: 'Yes' },
        { id: 1004, name: 'Keystone Insurance Group', type: 'Insurance', contact: 'D. Wright', email: 'claims@keystone.example', plan: 'Yearly (flat fee)', agree: 'Yes', card: '', auto: 'No', jobsThis: 9, bal: 0, active: 'Yes' },
        { id: 1005, name: 'Midway Auto & Home Credit', type: 'Bank', contact: 'S. Patel', email: 'collateral@midway.example', plan: 'Monthly (per job)', agree: 'Yes', card: 'Amex •••• 1008', auto: 'Yes', jobsThis: 11, bal: 330, active: 'Yes' },
        { id: 1006, name: 'Northgate Savings Bank', type: 'Bank', contact: 'L. Brooks', email: 'branches@northgate.example', plan: 'Per job', agree: 'No', card: '', auto: 'No', jobsThis: 4, bal: 70, active: 'Yes' },
        { id: 1007, name: 'Summit Property Partners', type: 'Property manager', contact: 'J. Kim', email: 'pm@summit.example', plan: 'Per job', agree: 'No', card: '', auto: 'No', jobsThis: 0, bal: 0, active: 'No' }
      ] },

    { key: 'inspectors', hidden: true, title: 'Inspectors & Shoppers', icon: 'fa-user-shield', color: 'green',
      desc: 'Field inspectors and mystery shoppers in the network. Turn someone off to stop new jobs going to them.',
      add: 'Add Inspector', toggle: true,
      cols: [['id', 'ID'], ['name', 'Name'], ['role', 'Role'], ['area', 'Area'], ['zips', 'ZIP Coverage'], ['open', 'Open Jobs', 'r'], ['done', 'Done (90d)', 'r'], ['score', 'Avg Score', 'r'], ['active', 'Active', 'yesno']],
      fields: [['name', 'Full name', 'text'], ['role', 'Role', 'select', ['Inspector', 'Mystery Shopper', 'Both']], ['email', 'Email', 'text'], ['phone', 'Phone', 'text'], ['area', 'Area (city, state)', 'text'], ['zips', 'ZIP codes covered', 'text'], ['active', 'Active', 'select', ['Yes', 'No']]],
      rows: [
        { id: 'INS-0417', name: 'Maria Lopez', role: 'Both', email: 'maria@example.com', phone: '(516) 555-0110', area: 'Hempstead, NY', zips: '11550, 11530, 11743', open: 6, done: 41, score: 86, active: 'Yes' },
        { id: 'INS-0388', name: 'Derek Hall', role: 'Inspector', email: 'derek@example.com', phone: '(516) 555-0133', area: 'Garden City, NY', zips: '11530, 11501, 11590', open: 4, done: 57, score: 81, active: 'Yes' },
        { id: 'INS-0452', name: 'Priya Nair', role: 'Mystery Shopper', email: 'priya@example.com', phone: '(516) 555-0158', area: 'Massapequa, NY', zips: '11758, 11762', open: 2, done: 23, score: 90, active: 'Yes' },
        { id: 'INS-0301', name: 'Tom Becker', role: 'Inspector', email: 'tom@example.com', phone: '(631) 555-0191', area: 'Hauppauge, NY', zips: '11788, 11749', open: 0, done: 12, score: 68, active: 'No' },
        { id: 'INS-0466', name: 'Angela Ruiz', role: 'Both', email: 'angela@example.com', phone: '(631) 555-0104', area: 'Islip, NY', zips: '11751, 11706', open: 3, done: 8, score: 88, active: 'Yes' }
      ] }







];
