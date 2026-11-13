/* VIGN preview database.
   A very small "database" that lives in this browser (localStorage), so the preview keeps what people type:
   - the website Request Inspection form and the client portal's "Request an inspection" add New Inspection Requests
   - the website Join form adds Join requests (Approve New Inspectors)
   - in the Admin Menu, changes to Requests, Join requests, Assign Jobs, the Inspectors List, finished reports, client rates and Admins & Staff permissions are saved
   It is NOT the real system. Data stays on this computer, in this browser only. database.html shows it and can reset it.
   In the real system all of this is saved on the server (C:\vignserver, MySQL). */
(function (w) {
    var KEY = 'vign-db', VERSION = 1;
    // the tables the preview saves, and which fields are "days from today" (shifted when a new day starts)
    var TABLES = { requests: ['date', 'wanted'], signups: ['date'], jobs: ['acc', 'due'], inspectors: [], finished: ['sent'], clients: ['pilotEnds', 'refSince'], users: ['last'], affiliates: [], commissions: ['payday'] };
    var NAMES = { requests: 'New Inspection Requests', signups: 'Join requests (new inspectors)', jobs: 'Jobs', inspectors: 'Inspectors List', finished: 'Finished inspections', clients: 'Clients & rates', users: 'Admins & staff (permissions)', affiliates: 'Affiliates & codes', commissions: 'Affiliate commissions' };
    var DAY = 864e5;
    function today() { var d = new Date(); d.setHours(12, 0, 0, 0); return d; }
    function iso(d) { return d.toISOString().slice(0, 10); }
    function daysSince(isoDay) { return Math.round((today() - new Date(isoDay + 'T12:00:00')) / DAY); }
    function empty() { return { v: VERSION, day: iso(today()), tables: {}, inbox: { requests: [], signups: [] }, seq: { requests: 1049, signups: 311 } }; }
    function load() {
        try { var d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d && d.v === VERSION) { d.inbox = d.inbox || { requests: [], signups: [] }; d.seq = d.seq || { requests: 1049, signups: 311 }; d.tables = d.tables || {}; return d; } } catch (e) {}
        return empty();
    }
    function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
    function clean(r) { var o = {}; Object.keys(r).forEach(function (k) { if (k !== '_i') o[k] = r[k]; }); return o; }

    var DB = w.VIGNDB = {
        TABLES: TABLES, NAMES: NAMES,
        ok: function () { try { localStorage.setItem('vign-db-test', '1'); localStorage.removeItem('vign-db-test'); return true; } catch (e) { return false; } },
        // website / client portal: add a new row. Returns the new id, or '' if the browser blocks saving.
        add: function (table, row) {
            var d = load(), pre = table === 'requests' ? 'RQ-' : 'J-';
            row.id = pre + (d.seq[table]++); row.at = new Date().toISOString(); row.status = row.status || 'New';
            d.inbox[table] = d.inbox[table] || []; d.inbox[table].push(row);
            return save(d) ? row.id : '';
        },
        // Admin Menu: use the saved rows (or keep the sample rows the first time), and take in new website rows
        attach: function (sections) {
            var d = load(), shift = daysSince(d.day);
            sections.forEach(function (s) {
                if (!TABLES[s.key]) return;
                if (d.tables[s.key]) {
                    var seed = {}; s.rows.forEach(function (r) { seed[r.id] = r; });
                    s.rows = d.tables[s.key].map(function (r) { var o = seed[r.id]; if (o) Object.keys(o).forEach(function (k) { if (!(k in r)) r[k] = o[k]; }); // new sample fields reach browsers that saved before
 TABLES[s.key].forEach(function (k) { if (typeof r[k] === 'number') r[k] -= shift; }); (r.hist || []).forEach(function (h) { if (typeof h.d === 'number') h.d -= shift; }); return r; });
                }
                (d.inbox[s.key] || []).forEach(function (r) {
                    if (s.rows.some(function (x) { return x.id === r.id; })) return;
                    var ago = Math.round((today() - new Date(new Date(r.at).setHours(12, 0, 0, 0))) / DAY);
                    r.date = -ago; if (typeof r.wanted === 'number') r.wanted -= ago; r.isNew = true;
                    s.rows.unshift(r);
                });
            });
            // the website rows are now in the tables: empty the inbox and save everything
            d.inbox = { requests: [], signups: [] };
            d.day = iso(today());
            sections.forEach(function (s) { if (TABLES[s.key]) d.tables[s.key] = s.rows.map(clean); });
            save(d);
            DB._sections = sections;
        },
        saveAdmin: function () {
            if (!DB._sections) return false;
            var d = load(); // keep anything the website added meanwhile in the inbox
            d.day = iso(today());
            DB._sections.forEach(function (s) { if (TABLES[s.key]) d.tables[s.key] = s.rows.map(clean); });
            return save(d);
        },
        dump: function () { return load(); },
        reset: function () { try { localStorage.removeItem(KEY); localStorage.removeItem('vign-offer-answers'); } catch (e) {} }
    };
})(window);
