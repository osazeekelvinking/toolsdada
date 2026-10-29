# ToolsBuddy 🛠️

> **Production-Ready, High-Traffic "No-Login" Web Tools Platform**  
> Built purely with **semantic HTML5, modern CSS3, and vanilla JavaScript (ES6+)**. Zero build steps, zero node_modules, zero backend servers.

---

## ⚡ Highlights

- **Instant Zero-Friction UX**: Users land on any tool and use it immediately without signups, paywalls, or accounts.
- **100% Client-Side Execution**: Runs entirely in the user's browser (<50ms TTFB). No data leaves the user's device.
- **GitHub Pages & Cloudflare Pages Ready**: Relative routing, works both via `file:///` and HTTP/HTTPS static hosting.
- **Google AdSense Interaction Engine (`ads.js`)**:
  - Publisher Client ID: `ca-pub-6130384188487467`
  - High-impact slots: `ad-top` (728x90 / 320x90), `ad-result` (728x90 / 320x90), `ad-footer` (multiplex / autorelaxed).
  - Strictly follows AdSense policy: **Zero background timer auto-refresh**. Ads refresh only on genuine user-initiated interactions (`Calculate`, `Convert`, `Format`, tab switches, unit toggles).
  - Auto-collapses unfilled or blocked ad slots (`.ad-collapsed { display: none !important; }`) via `MutationObserver` and 10-second fallback timer.
- **Local Persistence**: Remembers theme preference (Dark / Light) and active tool inputs in `localStorage`.
- **Search Engine Optimization (SEO)**:
  - Canonical URLs on every page
  - Open Graph & Twitter Card social metadata
  - Complete Schema.org JSON-LD structured data for `WebApplication` and `FAQPage`
  - 300–400 word educational guide with formula breakdowns and 4-item interactive FAQ accordion per tool.
- **Offline Self-Contained Libraries**: Includes bundled vanilla QR generator (`js/vendor/qrcode.min.js`) for reliable, offline QR creation.

---

## 🗂️ Platform Structure

```
SabiTools/
├── index.html                      # Main Hub: Instant search, category filters, responsive grid
├── percentage-calculator.html       # 3-in-1 Percentage Calculator
├── loan-calculator.html             # Loan & Mortgage Calculator + Amortization Schedule
├── case-converter.html              # All-in-One Case Converter (8 cases + download)
├── word-counter.html                # Live Word, Character, Sentence & Reading/Speaking Time Counter
├── qr-code-generator.html           # Custom QR Studio (URL, WiFi, Text, WhatsApp, vCard + PNG)
├── bmi-calculator.html              # BMI & Ideal Weight Target (Metric/Imperial + WHO Badge)
├── json-formatter.html              # JSON Formatter, Minifier & Syntax Error Pinpointer
├── remove-duplicate-lines.html      # Remove Duplicate Lines & List Cleaner
├── whatsapp-link-generator.html     # WhatsApp Direct Chat Link (wa.me) & Scannable QR
├── age-calculator.html              # Exact Chronological Age & Birthday Countdown
├── privacy-policy.html              # AdSense-compliant client-side Privacy Policy
├── terms.html                       # Terms of Service & Financial/Health Disclaimers
├── robots.txt                       # Search engine crawler instructions
├── sitemap.xml                      # XML Sitemap indexing all 10 tools & legal pages
├── css/
│   ├── main.css                     # Design tokens, theme variables, navbar, footer, search
│   └── tool.css                     # Shared tool workspace, tabs, tables, results, SEO articles
└── js/
    ├── ads.js                       # Google AdSense interaction engine with auto-collapse
    ├── main.js                      # Theme switcher, search filter, toasts, clipboard copy
    └── vendor/
        └── qrcode.min.js            # Standalone zero-dependency QR code engine
```

---

## 🚀 The 10 Core Launch Tools

| Tool | File | Features |
| :--- | :--- | :--- |
| **Percentage Calculator** | `percentage-calculator.html` | X% of Y, proportions, and percentage increase/decrease (&Delta;%) with visual math formulas. |
| **Loan & Mortgage Calculator** | `loan-calculator.html` | Monthly EMI, total interest, extra payment savings, and interactive yearly/monthly amortization table. |
| **Case Converter** | `case-converter.html` | UPPERCASE, lowercase, Title Case, Sentence case, Capitalized, camelCase, snake_case, kebab-case, 1-click copy, .txt download. |
| **Word & Character Counter** | `word-counter.html` | Real-time counts for words, characters with/without spaces, sentences, paragraphs, reading speed (200 wpm), speaking speed (130 wpm). |
| **Custom QR Code Studio** | `qr-code-generator.html` | Generates static QR codes for URLs, WiFi networks, WhatsApp, vCards, custom colors, size slider, PNG export. |
| **BMI Calculator** | `bmi-calculator.html` | Metric (kg/cm) and Imperial (lbs/ft-in) toggle, WHO status classification, visual gauge, healthy weight target. |
| **JSON Formatter** | `json-formatter.html` | 2-space / 4-space beautifier, compact minifier, line & column syntax error pinpointing, sample loader. |
| **Remove Duplicate Lines** | `remove-duplicate-lines.html` | Removes duplicate lines, case-sensitive toggle, whitespace trimmer, A-Z / Z-A sorting, removal count stats. |
| **WhatsApp Link Generator** | `whatsapp-link-generator.html` | International country selector, wa.me direct link, optional prefilled text, instant scannable QR code. |
| **Exact Age Calculator** | `age-calculator.html` | Precise age down to years, months, and days; next birthday countdown; total days, weeks, and hours lived. |

---

## 🌐 Deployment to GitHub Pages

1. Initialize git in the project root:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: ToolsBuddy Web Tools Platform"
   ```
2. Create a new repository on GitHub (e.g. `toolsbuddy`).
3. Link and push to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/toolsbuddy.git
   git branch -M main
   git push -u origin main
   ```
4. On GitHub, navigate to **Settings** &rarr; **Pages**:
   - Under **Build and deployment** &rarr; **Source**, select `Deploy from a branch`.
   - Select branch `main` and folder `/ (root)`.
   - Click **Save**. Your site will be live at `https://<your-username>.github.io/toolsbuddy/`.

---

## ☁️ Deployment to Cloudflare Pages

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** &rarr; **Create application** &rarr; **Pages**.
3. Connect your GitHub repository or use direct drag-and-drop upload of the project folder.
4. Set Build command to empty (no build step required) and Output directory to `/`.
5. Deploy! Instant global CDN delivery with 0ms build duration.

---

## 🛡️ License & Ecosystem

Part of the **[SabiMentors](https://sabimentors.com)** digital educational network.  
Created for high-traffic, private, and frictionless utility workflows.
