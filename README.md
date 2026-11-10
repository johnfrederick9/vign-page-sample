# VIGN USA: static preview

HTML-only preview of the VIGN USA website (Verity Insight Group Network), for client review.
Forms are not connected; submitting one shows a "preview only" note.

Generated from the PHP site in `C:\vign`. Do not edit these files by hand; change the PHP site and regenerate.

## Inspector / Shopper app (preview)
`ps/` holds a clickable preview of the app inspectors and mystery shoppers use on their phone.
All data is sample data, built in `ps/ps.js`. Screens are modeled on the LoyalServe (SMK) server portal.

- `ps/index.html`: My Jobs dashboard (open / due today / overdue / needs changes, pay tiles, job list)
- `ps/job.html?id=VG-24081`: job detail (instructions, details, files, history, directions)
- `ps/inspect.html?id=VG-24081`: fill the form, one item per screen, 1–4 rating, photos, live score, signature
- `ps/sent.html`: reports sent in (needs changes / waiting for review / approved)
- `ps/pay.html`: completed jobs and pay
