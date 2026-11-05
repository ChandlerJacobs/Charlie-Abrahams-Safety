"""Builds the static pages from a shared header/footer.
Run:  python3 _build/build.py   (from the melissa-site folder)
Edit page bodies in _build/pages/*.html, then re-run.
"""
import pathlib, html

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ROOT / "_build" / "pages"

NAV = [
    ("index.html", "Home"),
    ("about.html", "About &amp; Certificates"),
    ("experience.html", "Experience"),
    ("consultations.html", "Consultations"),
    ("showcase.html", "AI Showcase"),
]

# Content-Security-Policy (also sent as a real header by vercel.json, which is stronger).
CSP = ("default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; "
       "font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; "
       "form-action 'self' mailto:; base-uri 'self'; object-src 'none'; upgrade-insecure-requests")

META = {
    "index.html": ("Charlie Abrahams Safety | OHS &amp; EHS Consulting, Johannesburg",
                   "Occupational health, safety and environmental consulting: Safety Files, HIRA, fall protection, ISO 45001/14001/9001 audits and AI-assisted safety documentation."),
    "about.html": ("About &amp; Certificates | Charlie Abrahams Safety",
                   "NEBOSH IGC, IOSH and IRCA Lead Auditor. Almost two decades of OHS work across construction, manufacturing and mining."),
    "experience.html": ("Experience | Charlie Abrahams Safety",
                        "Career history from labour and OHS consulting to EHS Manager across Southern and Northern African mining operations."),
    "consultations.html": ("Consultations | Charlie Abrahams Safety",
                           "Selected OHS engagements and consulting services: Safety Files, contractor audits, HIRA, fall protection and ISO management systems."),
    "showcase.html": ("AI-Assisted Safety Documentation | Charlie Abrahams Safety",
                      "Sample charts, risk matrices, HIRA registers and site safety drawings produced with an AI-assisted, competent-person-reviewed documentation process."),
    "contact.html": ("Contact | Charlie Abrahams Safety",
                     "Book an OHS consultation: Safety Files, risk assessments, audits and training."),
}

EXTRA_JS = {
    "showcase.html": ["assets/js/charts.js"],
    "contact.html": ["assets/js/contact.js"],
}


def header(active):
    items = []
    for href, label in NAV:
        cur = ' aria-current="page"' if href == active else ""
        items.append(f'<li><a href="{href}"{cur}>{label}</a></li>')
    cur = ' aria-current="page"' if active == "contact.html" else ""
    items.append(f'<li class="nav-cta"><a href="contact.html"{cur}>Book a consultation</a></li>')
    return f"""<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="hazard-strip" aria-hidden="true"></div>
  <div class="wrap nav-bar">
    <a class="brand" href="index.html" aria-label="Charlie Abrahams Safety, home">
      <span class="brand-mark" aria-hidden="true">CA</span>
      <span class="brand-text"><strong>Charlie Abrahams Safety</strong><span>OHS &middot; EHS Consulting</span></span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links">Menu</button>
    <nav aria-label="Main"><ul class="nav-links" id="nav-links">
      {''.join(items)}
    </ul></nav>
  </div>
</header>"""


FOOTER = """<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <h4>Charlie Abrahams Safety</h4>
        <p>Occupational Health, Safety &amp; Environmental consulting by Melissa &ldquo;Charlie&rdquo; Abrahams, based in the Johannesburg Metropolitan Area and working across South Africa and North Africa.</p>
        <p class="small">NEBOSH IGC &middot; IOSH &middot; IRCA Lead Auditor</p>
      </div>
      <div>
        <h4>Pages</h4>
        <ul>
          <li><a href="about.html">About &amp; Certificates</a></li>
          <li><a href="experience.html">Experience</a></li>
          <li><a href="consultations.html">Consultations</a></li>
          <li><a href="showcase.html">AI Showcase</a></li>
        </ul>
      </div>
      <div>
        <h4>Get in touch</h4>
        <ul>
          <li><a href="contact.html">Book a consultation</a></li>
          <li><a href="https://www.linkedin.com/in/melissa-abrahams-84b50859/" rel="noopener noreferrer" target="_blank">LinkedIn</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-base">
      <span>&copy; <span data-year>2026</span> Charlie Abrahams Safety. Charts and drawings on the AI Showcase page use sample data.</span>
      <button class="theme-btn" type="button">Dark mode</button>
    </div>
  </div>
</footer>"""


def render(name):
    title, desc = META[name]
    body = (PAGES / name).read_text(encoding="utf-8")
    scripts = ["assets/js/main.js"] + EXTRA_JS.get(name, [])
    script_tags = "\n".join(f'<script src="{s}" defer></script>' for s in scripts)
    return f"""<!doctype html>
<html lang="en-ZA" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="robots" content="noindex, nofollow">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&amp;family=IBM+Plex+Mono:wght@400;500;600&amp;family=IBM+Plex+Sans:wght@400;500;600;700&amp;display=swap">
<link rel="stylesheet" href="assets/css/styles.css">
{script_tags}
</head>
<body>
{header(name)}
<main id="main">
{body}
</main>
{FOOTER}
</body>
</html>
"""


if __name__ == "__main__":
    for name in META:
        (ROOT / name).write_text(render(name), encoding="utf-8")
        print("built", name)
