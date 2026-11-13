/* =========================================================
   VIGN Inspector portal: inspection form modal
   (same role as SMK ps/modalnewattempt.php, opened from fulljobstatus).
   Same order as the main system (vignserver migrations 0003 + 0005-0009):
     1. Start      weather, access type (+ note), the form's own questions asked first
     2. Checklist  one item per screen, 1-4 / N/O / N/A, findings, labelled photos (P-01 ...)
     3. More       the form's other questions, follow-up, immediate hazards, notes / limitations
     4. Review     score, urgent warning (any item rated 4), signed name + signature, send
   Forms: ../js/vign-forms.js (one copy for every portal).
   ========================================================= */
(function (V) {
'use strict';

V.openInspection = function (j) {
    var FM = window.VIGNFORMS, k = j.form, f = V.forms[k], n = f.items.length, KEY = 'vign-insp2-' + j.id;
    var before = FM.fields(k, 'before'), after = FM.fields(k, 'after'), secName = FM.ratingSection(k);
    var S0 = n + 1, SR = n + 2;        // step numbers: 0 = start, 1..n = items, n+1 = more questions, n+2 = review
    var state = V.store(KEY) || { a: {}, fv: {}, w: '', acc: j.access && FM.ACCESS.indexOf(j.access) > -1 ? j.access : '', accNote: '', fu: '', hazards: '', notes: '', sname: V.me.name };
    var photos = {}, photoNo = 0, cur = 0, signed = false;
    var esc = V.esc;

    var m = document.getElementById('inspModal');
    if (!m) { m = document.createElement('div'); m.id = 'inspModal'; m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); document.body.appendChild(m); }

    function chooser(name, opts, val) { return '<div class="chooser">' + opts.map(function (o) { return '<label><input type="radio" name="' + name + '" value="' + esc(o) + '"' + (val === o ? ' checked' : '') + '>' + esc(o) + '</label>'; }).join('') + '</div>'; }
    function fieldHtml(q) {
        var code = q[0], label = '<span class="fld-l">' + esc(q[1]) + (q[4] ? ' <span class="muted small">(optional)</span>' : '') + '</span>', v = state.fv[code] || '';
        if (q[2] === 'sel') return '<div class="fld" data-q="' + code + '">' + label + chooser('f_' + code, q[3], v) + '</div>';
        if (q[2] === 'yn') return '<div class="fld" data-q="' + code + '">' + label + chooser('f_' + code, ['Yes', 'No'], v) + '</div>';
        if (q[2] === 'area') return '<label class="fld" data-q="' + code + '">' + label + '<textarea name="f_' + code + '">' + esc(v) + '</textarea></label>';
        return '<label class="fld" data-q="' + code + '">' + label + '<input type="' + (q[2] === 'num' ? 'number' : 'text') + '"' + (q[2] === 'num' ? ' inputmode="decimal" min="0"' : '') + ' name="f_' + code + '" value="' + esc(v) + '"></label>';
    }
    function sectionHtml(sec) {
        var h = '<h4 class="sec-h">' + esc(sec.name) + '</h4>';
        if (!sec.ticks) return h + sec.list.map(fieldHtml).join('');
        // "tick all that apply" (Preservation request): each Yes / No is a tick box, Other is text
        return h + '<p class="muted small" style="margin:0 0 8px">Tick all that apply. Leave blank if none.</p><div class="ticks">' + sec.list.filter(function (q) { return q[2] === 'yn'; }).map(function (q) {
            return '<label><input type="checkbox" name="f_' + q[0] + '" value="Yes"' + (state.fv[q[0]] === 'Yes' ? ' checked' : '') + '><span>' + esc(q[1]) + '</span></label>'; }).join('') + '</div>' +
            sec.list.filter(function (q) { return q[2] !== 'yn'; }).map(fieldHtml).join('');
    }

    var h = '<div class="modal-box"><div class="modal-h"><div><h2>' + esc(f.title) + '</h2><small>' + j.id + ' · ' + esc(j.addr) + ', ' + esc(j.city) + '</small></div><button class="modal-x" data-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div><div class="modal-b">';
    h += '<div class="prog"><span data-pl></span><b data-ps></b></div><div class="track"><div class="fill" data-pf></div></div>';

    // 1. Start
    h += '<section class="step" data-step="0"><div class="q"><span class="mono">Start</span><h3>Before you begin</h3>' +
        '<div class="card2" style="margin:10px 0 14px"><div class="card2-b"><dl class="dl"><dt>Date / time</dt><dd>' + new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' <span class="muted small">(automatic)</span></dd><dt>Inspector</dt><dd>' + esc(V.me.name) + ' · ' + V.me.id + '</dd><dt>Order says</dt><dd>' + esc(j.access || '–') + '</dd></dl></div></div>' +
        '<div class="fld" data-q="_w">Weather' + chooser('w', FM.WEATHER, state.w) + '</div>' +
        '<div class="fld" data-q="_acc">How did you inspect?' + chooser('acc', FM.ACCESS, state.acc) + '</div>' +
        '<label class="fld" data-q="_accnote" data-accnote><span class="fld-l">Access note <span class="muted small" data-accreq>(optional)</span></span><input type="text" name="accNote" maxlength="255" placeholder="e.g. Gate locked, viewed from the street" value="' + esc(state.accNote) + '"></label>' +
        '<p class="hint-box" data-noacc hidden><i class="fa-solid fa-circle-info"></i> No access: rate what you can see from outside, and use <b>N/O</b> (not observed) for the rest.</p>' +
        before.map(sectionHtml).join('') +
        '<p class="alert" data-err0 hidden></p>' +
        '<div class="nav2"><button type="button" class="btn btn-ghost" data-prev>Close</button><button type="button" class="btn btn-primary" data-next>Start checklist →</button></div></div></section>';

    // 2. Checklist
    f.items.forEach(function (item, i) {
        h += '<section class="step" data-step="' + (i + 1) + '"><div class="q"><span class="mono">' + esc(secName) + ' · Item ' + (i + 1) + ' of ' + n + '</span><h3>' + esc(item) + '</h3><div class="rates" role="radiogroup" aria-label="Rating">' +
            V.ratings.map(function (r) { var sm = r[0] === 'NO' || r[0] === 'NA';
                return '<button type="button" class="rt' + (sm ? ' sm' : '') + '" data-v="' + r[0] + '" role="radio" aria-checked="false"><b class="rate ' + (sm ? 'r0' : 'r' + r[0]) + '">' + (sm ? '–' : r[0]) + '</b><span>' + r[1] + '<small>' + r[2] + '</small></span></button>'; }).join('') +
            '</div><p class="urgent-box" data-urg hidden><i class="fa-solid fa-triangle-exclamation"></i> <b>Urgent.</b> The office is told as soon as you send this report. If anyone is in danger, call 911 first.</p>' +
            '<label class="fld">Findings <span class="req" data-nreq hidden>Write what you saw (needed for 3 or 4).</span><textarea data-note placeholder="What did you see? Observed facts only."></textarea></label>' +
            '<div class="fld">Photos <span class="req" data-req hidden>A photo is required for a rating of 3 or 4.</span>' + V.noPeople(true) + '<div class="photo-row"><label class="btn btn-ghost btn-sm"><i class="fa-solid fa-camera"></i> Take photo<input type="file" accept="image/*" capture="environment" data-file></label><div class="thumbs" data-thumbs></div></div></div>' +
            '<div class="nav2"><button type="button" class="btn btn-ghost" data-prev>Back</button><button type="button" class="btn btn-primary" data-next>' + (i === n - 1 ? 'Last questions →' : 'Next item →') + '</button></div></div></section>';
    });

    // 3. More questions + footer (same fields as the main system)
    h += '<section class="step" data-step="' + S0 + '"><div class="q"><span class="mono">Last questions</span><h3>A few more questions</h3>' +
        after.map(sectionHtml).join('') +
        '<h4 class="sec-h">Report notes</h4>' +
        '<div class="fld" data-q="_fu">Follow-up recommended?' + chooser('fu', ['Yes', 'No'], state.fu) + '</div>' +
        '<label class="fld"><span class="fld-l">Immediate hazards / damage observed <span class="muted small">(leave blank if none)</span></span><textarea data-hz>' + esc(state.hazards) + '</textarea></label>' +
        '<label class="fld">Notes / limitations / areas you could not reach<textarea data-gn>' + esc(state.notes) + '</textarea></label>' +
        '<p class="alert" data-err1 hidden></p>' +
        '<div class="nav2"><button type="button" class="btn btn-ghost" data-prev>Back</button><button type="button" class="btn btn-primary" data-next>Review →</button></div></div></section>';

    // 4. Review and send
    h += '<section class="step" data-step="' + SR + '"><div class="sumrow"><div class="big rate" data-big></div><div><strong>Overall score</strong> <span class="samp">sample formula</span><p data-sumtxt></p><p class="small">Sample formula, still to be confirmed: 1 = 100, 2 = 67, 3 = 33, 4 = 0. N/O and N/A are not counted.</p></div></div>' +
        '<div class="urgent-box big-urg" data-urgall hidden></div>' +
        '<div class="card2" style="margin-top:12px"><div class="card2-h"><h3>Visit</h3></div><div class="card2-b"><dl class="dl" data-visit></dl></div></div>' +
        '<div class="card2" style="margin-top:12px"><div class="card2-h"><h3>Your ratings</h3></div><div class="card2-b" style="padding-top:4px;padding-bottom:4px"><ul class="review" data-rv></ul></div></div>' +
        '<div class="card2" style="margin-top:12px"><div class="card2-h"><h3>Inspector signature</h3><button type="button" class="btn btn-ghost btn-sm" data-sclear style="margin-left:auto">Clear</button></div><div class="card2-b">' +
        '<label class="fld" style="margin-top:0">Signed name<input type="text" data-sname maxlength="120" autocomplete="name" value="' + esc(state.sname) + '"></label><canvas class="sign" data-sig aria-label="Sign here"></canvas>' +
        '<label class="checkbox small" style="margin-top:12px"><input type="checkbox" data-cert> I confirm this report shows only what I observed.</label></div></div>' +
        '<p class="alert" data-err hidden style="margin-top:12px"></p>' +
        '<div class="nav2"><button type="button" class="btn btn-ghost" data-prev>Back</button><button type="button" class="btn btn-red" data-send><i class="fa-solid fa-paper-plane"></i> Send report</button></div></section>';

    h += '<section class="step" data-step="done"><div class="done"><i class="fa-solid fa-circle-check"></i><h3>Report sent</h3><p class="muted">VIGN staff will review it, then deliver it to ' + esc(j.client) + '.<br>You will be told if anything needs to change.</p><p class="urgent-box" data-urgdone hidden><i class="fa-solid fa-triangle-exclamation"></i> Marked <b>Urgent</b>: the office was told right away.</p><p class="small muted">(Preview only: nothing was sent.)</p><a class="btn btn-primary" href="command.html">Back to dashboard</a></div></section>';
    h += '</div></div>';
    m.innerHTML = h;
    m.classList.add('open');
    document.body.style.overflow = 'hidden';

    var $ = function (s) { return m.querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || m).querySelectorAll(s)); };
    var secs = $$('.step'), itemSec = function (i) { return secs[i + 1]; };
    function keep() { V.store(KEY, state); }

    function close() { m.classList.remove('open'); document.body.style.overflow = ''; }
    $$('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', function onKey(e) { if (e.key === 'Escape' && m.classList.contains('open')) close(); });

    // start + form questions
    $$('input[name="w"]').forEach(function (r) { r.addEventListener('change', function () { state.w = r.value; keep(); }); });
    $$('input[name="acc"]').forEach(function (r) { r.addEventListener('change', function () { state.acc = r.value; keep(); accUi(); }); });
    $('[name="accNote"]').addEventListener('input', function (e) { state.accNote = e.target.value; keep(); });
    function accUi() { var need = state.acc === 'No access' || state.acc === 'Other'; $('[data-accreq]').textContent = need ? '(needed)' : '(optional)'; $('[data-noacc]').hidden = state.acc !== 'No access'; }
    accUi();
    $$('[name^="f_"]').forEach(function (el) {
        var code = el.name.slice(2);
        el.addEventListener(el.type === 'radio' || el.type === 'checkbox' ? 'change' : 'input', function () {
            state.fv[code] = el.type === 'checkbox' ? (el.checked ? 'Yes' : '') : el.value; keep();
        });
    });
    $$('input[name="fu"]').forEach(function (r) { r.addEventListener('change', function () { state.fu = r.value; keep(); }); });
    $('[data-hz]').addEventListener('input', function (e) { state.hazards = e.target.value; keep(); });
    $('[data-gn]').addEventListener('input', function (e) { state.notes = e.target.value; keep(); });
    $('[data-sname]').addEventListener('input', function (e) { state.sname = e.target.value; keep(); });

    // checklist items
    f.items.forEach(function (_, i) {
        var s = itemSec(i), a = state.a[i] || {};
        if (a.v) setRate(s, a.v);
        s.querySelector('[data-note]').value = a.note || '';
        $$('.rt', s).forEach(function (b) { b.addEventListener('click', function () { setRate(s, b.dataset.v); save(i); top(); }); });
        s.querySelector('[data-note]').addEventListener('input', function () { save(i); });
        s.querySelector('[data-file]').addEventListener('change', function (e) { addPhoto(i, e.target.files[0]); e.target.value = ''; });
    });
    $$('[data-prev]').forEach(function (b) { b.addEventListener('click', function () { cur === 0 ? close() : go(cur - 1); }); });
    $$('[data-next]').forEach(function (b) { b.addEventListener('click', function () { if (check(cur)) go(cur + 1); }); });

    function setRate(s, v) { $$('.rt', s).forEach(function (b) { var on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); }); s.querySelector('[data-urg]').hidden = v !== '4'; }
    function save(i) { var s = itemSec(i), on = s.querySelector('.rt.on'); state.a[i] = { v: on ? on.dataset.v : null, note: s.querySelector('[data-note]').value }; keep(); s.querySelector('[data-req]').hidden = true; s.querySelector('[data-nreq]').hidden = true; }
    function shake(el) { if (el && el.animate) el.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], 220); }
    function missing(secList) {   // required questions not answered yet
        var out = []; secList.forEach(function (sec) { sec.list.forEach(function (q) { if (!q[4] && !String(state.fv[q[0]] || '').trim()) out.push(q); }); }); return out;
    }
    function flag(box, qs, extra) {
        $$('.fld.miss').forEach(function (x) { x.classList.remove('miss'); });
        var names = (extra || []).concat(qs.map(function (q) { return q[1]; }));
        qs.forEach(function (q) { var el = $('[data-q="' + q[0] + '"]'); if (el) el.classList.add('miss'); });
        box.hidden = !names.length; box.textContent = names.length ? 'Answer: ' + names.join(' · ') + '.' : '';
        return !names.length;
    }
    function check(st) {
        if (st === 0) {
            var ex = [];
            if (!state.w) { ex.push('Weather'); $('[data-q="_w"]').classList.add('miss'); }
            if (!state.acc) { ex.push('How did you inspect?'); $('[data-q="_acc"]').classList.add('miss'); }
            if ((state.acc === 'No access' || state.acc === 'Other') && !state.accNote.trim()) { ex.push('Access note'); }
            var ok = flag($('[data-err0]'), missing(before), ex);
            if (!state.w) $('[data-q="_w"]').classList.add('miss'); if (!state.acc) $('[data-q="_acc"]').classList.add('miss');
            if ((state.acc === 'No access' || state.acc === 'Other') && !state.accNote.trim()) $('[data-accnote]').classList.add('miss');
            return ok;
        }
        if (st === S0) {
            var ex1 = state.fu ? [] : ['Follow-up recommended?'];
            var ok1 = flag($('[data-err1]'), missing(after), ex1); if (!state.fu) $('[data-q="_fu"]').classList.add('miss'); return ok1;
        }
        if (st > n) return true;
        var i = st - 1, a = state.a[i] || {}, s = itemSec(i);
        if (!a.v) { shake(s.querySelector('.rates')); return false; }
        if (a.v === '3' || a.v === '4') {
            var noNote = !String(a.note || '').trim(), noPh = !(photos[i] && photos[i].length);
            s.querySelector('[data-nreq]').hidden = !noNote; s.querySelector('[data-req]').hidden = !noPh;
            if (noNote || noPh) return false;
        }
        return true;
    }
    function addPhoto(i, file) {
        if (!file) return;
        var label = 'P-' + ('0' + (++photoNo)).slice(-2);   // same labels as the main system (photo_label, e.g. P-07)
        (photos[i] = photos[i] || []).push({ label: label, file: file });
        var el = document.createElement('div'); el.className = 'ph';
        el.innerHTML = '<img alt="Photo ' + label + '"><small><b>' + label + '</b> · ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' · GPS</small>';
        el.querySelector('img').src = URL.createObjectURL(file);
        itemSec(i).querySelector('[data-thumbs]').appendChild(el);
        itemSec(i).querySelector('[data-req]').hidden = true;
    }
    function score() { var t = 0, c = 0; f.items.forEach(function (_, i) { var v = (state.a[i] || {}).v; if (V.points[v] != null) { t += V.points[v]; c++; } }); return c ? Math.round(t / c) : null; }
    function rated() { return f.items.filter(function (_, i) { return (state.a[i] || {}).v; }).length; }
    function urgent() { return f.items.map(function (it, i) { return (state.a[i] || {}).v === '4' ? (i + 1) + '. ' + it : null; }).filter(Boolean); }
    function top() {
        var s = score();
        $('[data-pl]').textContent = cur === 0 ? 'Start' : cur <= n ? 'Item ' + cur + ' of ' + n + ' · ' + rated() + ' rated' : cur === S0 ? 'Last questions' : 'Review and send';
        $('[data-ps]').textContent = s == null ? 'Score –' : 'Score ' + s;
        $('[data-pf]').style.width = Math.round(Math.min(cur, SR) / SR * 100) + '%';
    }
    function go(i) {
        cur = i;
        secs.forEach(function (s) { s.classList.toggle('on', s.dataset.step === String(i)); });
        if (i === SR) { review(); setTimeout(fit, 0); }
        top();
        m.scrollTop = 0;
    }
    function review() {
        var s = score(), big = $('[data-big]'), u = urgent();
        big.textContent = s == null ? '–' : s; big.className = 'big rate ' + (s == null ? 'r0' : V.scoreCls(s));
        var bad = f.items.filter(function (_, i) { var v = (state.a[i] || {}).v; return v === '3' || v === '4'; }).length;
        $('[data-sumtxt]').textContent = rated() + ' of ' + n + ' items rated · ' + bad + (bad === 1 ? ' item needs' : ' items need') + ' repair or urgent attention · ' + photoNo + ' photo' + (photoNo === 1 ? '' : 's');
        var ub = $('[data-urgall]'); ub.hidden = !u.length;
        ub.innerHTML = u.length ? '<i class="fa-solid fa-triangle-exclamation"></i> <div><b>Urgent report</b> (rated 4): ' + u.map(esc).join(' · ') + '<br><small>The office is told as soon as you send, and the report is checked first.</small></div>' : '';
        var vis = [['Weather', state.w], ['Inspected', state.acc + (state.accNote ? ' · ' + state.accNote : '')]];
        before.concat(after).forEach(function (sec) {
            if (sec.ticks) { var t = sec.list.filter(function (q) { return state.fv[q[0]] && state.fv[q[0]] !== 'No'; }).map(function (q) { return q[2] === 'yn' ? q[1] : 'Other: ' + state.fv[q[0]]; }); vis.push([sec.name, t.length ? t.join(', ') : 'None']); return; }
            sec.list.forEach(function (q) { if (state.fv[q[0]]) vis.push([q[1], state.fv[q[0]]]); });
        });
        vis.push(['Follow-up', state.fu || '–']);
        if (state.hazards.trim()) vis.push(['Hazards', state.hazards]);
        $('[data-visit]').innerHTML = vis.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1] || '–') + '</dd>'; }).join('');
        $('[data-rv]').innerHTML = f.items.map(function (it, i) { var v = (state.a[i] || {}).v, lab = !v ? '?' : v === 'NO' ? 'N/O' : v === 'NA' ? 'N/A' : v, ph = (photos[i] || []).map(function (p) { return p.label; }).join(', ');
            return '<li><b class="rate ' + (V.points[v] != null ? 'r' + v : 'r0') + '">' + lab + '</b><span>' + esc(it) + (ph ? ' <small class="muted">· ' + ph + '</small>' : '') + '</span><button type="button" data-edit="' + (i + 1) + '">Edit</button></li>'; }).join('');
        $$('[data-edit]').forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.edit); }); });
    }

    // signature pad
    var cv = $('[data-sig]'), ctx = cv.getContext('2d'), drawing = false;
    function fit() { var r = cv.getBoundingClientRect(); if (!r.width) return; cv.width = r.width * 2; cv.height = r.height * 2; ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.strokeStyle = '#0d1630'; signed = false; }
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointerdown', function (e) { drawing = signed = true; var p = pos(e); ctx.beginPath(); ctx.moveTo(p[0], p[1]); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pos(e); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
    cv.addEventListener('pointerup', function () { drawing = false; });
    $('[data-sclear]').addEventListener('click', fit);

    $('[data-send]').addEventListener('click', function () {
        var err = [];
        if (rated() < n) err.push('Rate every item (' + (n - rated()) + ' left).');
        if (!state.sname.trim()) err.push('Type your name as you sign.');
        if (!signed) err.push('Sign the report.');
        if (!$('[data-cert]').checked) err.push('Tick the confirmation box.');
        var box = $('[data-err]');
        if (err.length) { box.hidden = false; box.textContent = err.join(' '); return; }
        $('[data-urgdone]').hidden = !urgent().length;
        V.store(KEY, null);
        secs.forEach(function (s) { s.classList.toggle('on', s.dataset.step === 'done'); });
        $('.prog').hidden = true; $('.track').hidden = true;
        m.scrollTop = 0;
    });

    // reopen where the inspector stopped
    var startOk = state.w && state.acc && !missing(before).length, first = 0;
    if (startOk) { first = 1; while (first <= n && (state.a[first - 1] || {}).v) first++; }
    go(first);
};
})(window.VIGN);
