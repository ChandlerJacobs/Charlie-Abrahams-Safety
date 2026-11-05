# Melissa Abrahams — OHS Consultant site

Static, multipage site (no framework, no build dependencies beyond Python 3 for the page templater).

```
index.html            Home: services, stats, AI teaser
about.html            Profile, certificates, skills, standards
experience.html       Career timeline (from LinkedIn, Nov 2026)
consultations.html    Engagements + consultation process
showcase.html         AI-assisted documentation: charts, risk matrix, drawings, HIRA, Safety File index (SAMPLE data)
contact.html          Enquiry form (mailto, sanitised)
assets/css/styles.css Design system (light + dark)
assets/js/main.js     Nav, theme, reveal animations
assets/js/charts.js   SVG charts + risk matrix (DOM APIs only, no innerHTML)
assets/js/contact.js  Form validation/sanitisation, honeypot, rate limit
_build/               Page bodies + build.py (shared header/footer). Not deployed.
vercel.json           Security headers for Vercel
```

Edit a page body in `_build/pages/`, then run `python3 _build/build.py` to regenerate the root HTML files.

## Before launch: confirm with Melissa

- [ ] **Permission**: Melissa has approved the site and its content.
- [ ] **Contact email**: set `data-to` on the form in `_build/pages/contact.html` (currently `info@example.com`), then rebuild.
- [ ] **Certificates**: exact titles, years and numbers for NEBOSH IGC, IOSH and IRCA Lead Auditor (LinkedIn's certifications and education sections are empty). Add any others she holds (e.g. SACPCMP registration, SAMTRAC).
- [ ] **Skill bar levels** on About are illustrative self-ratings; adjust or remove.
- [ ] **Consultation outcome figures** marked "sample" are illustrative; replace with real, client-approved figures or keep the sample label.
- [ ] **Legal references** on the showcase (CR numbers, GSR, GAR, Ergonomics Regs) to be checked by Melissa. Draft Construction Regulations, 2025 were published for comment in March 2025 and would repeal the 2014 regulations once final.
- [ ] **Employer names** (FLSmidth, Solatricity, etc.) are from her public LinkedIn; confirm she's comfortable naming them on a consulting site.
- [ ] Add a professional headshot (`assets/img/`) if wanted.

## Security checklist

| Item | Status |
|---|---|
| API keys / secrets | None used. No env vars needed. Nothing secret in the repo. |
| Authentication / admin routes | None exist (static site). If a CMS or admin is added later, put it behind auth and keep it off the public domain. |
| XSS | No `innerHTML`, `eval` or inline scripts/handlers. All dynamic text via `textContent`. CSP forbids inline script. |
| Form sanitisation | Control chars, `<` `>` stripped; length limits; email/phone regex; service allow-list; honeypot; 2.5 s minimum fill time; 30 s resend lock. Data is URL-encoded into a mailto, never stored. |
| CSP | `vercel.json` header (authoritative) + meta tag fallback. Only self + Google Fonts allowed. |
| Clickjacking | `frame-ancestors 'none'` + `X-Frame-Options: DENY`. |
| CORS | No API endpoints, so no CORS surface. `Cross-Origin-Resource-Policy: same-origin` set. |
| Transport | HSTS + `upgrade-insecure-requests`. |
| Privacy (POPIA) | Consent checkbox; no cookies, analytics or trackers; theme preference only in localStorage. |
| External links | `rel="noopener noreferrer"`. |
| Build sources | `_build/` excluded via `.vercelignore`. |

If a server-side form handler is added later (e.g. a Vercel Function + email API), store the API key in Vercel env vars (never in client JS), re-validate every field server-side, rate-limit by IP, verify a CAPTCHA/Turnstile token, and restrict CORS to the site's own origin.
