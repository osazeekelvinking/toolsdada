/**
 * ToolsBuddy Static Site Generator (cms/build.js)
 * Compiles content/posts.json and content/authors.json into static HTML files
 * with clean relative paths, Schema.org metadata, AdSense integration, and auto-linking.
 */

const fs = require('fs');
const path = require('path');
const engine = require('./engine.js');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content');
const BLOG_DIR = path.join(ROOT_DIR, 'blog');
const AUTHOR_DIR = path.join(ROOT_DIR, 'author');
const CMS_DIR = path.join(ROOT_DIR, 'cms');

const SITE_URL = 'https://toolsbuddy.pages.dev';
const ADSENSE_CLIENT_ID = 'ca-pub-6130384188487467';

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
    return fallback;
  }
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const posts = readJSON(path.join(CONTENT_DIR, 'posts.json'), []);
const authors = readJSON(path.join(CONTENT_DIR, 'authors.json'), []);
const authorMap = {};
authors.forEach(a => { authorMap[a.id] = a; });

console.log(`--- Starting ToolsBuddy Blog Static Generator ---`);
console.log(`Loaded ${posts.length} posts and ${authors.length} authors.`);

/**
 * Builds Header HTML
 */
function buildHeader(rootRel, activeNav) {
  return `
  <!-- Navigation Header -->
  <header class="tb-header">
    <div class="tb-container tb-header-inner">
      <a href="${rootRel}index.html" class="tb-brand">
        <div class="tb-brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </div>
        <div class="tb-brand-text">Tools<span>Buddy</span></div>
      </a>
      <div class="tb-header-actions">
        <a href="${rootRel}index.html" class="tb-nav-link">All Tools</a>
        <div class="tb-nav-dropdown" id="tb-calc-dropdown">
          <button type="button" class="tb-nav-link tb-dropdown-trigger" id="tb-calc-trigger" aria-expanded="false" aria-haspopup="true">
            <span>Calculators</span>
            <svg class="tb-dropdown-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <div class="tb-dropdown-menu" id="tb-calc-menu" role="menu" aria-labelledby="tb-calc-trigger">
            <div class="tb-dropdown-grid">
              <div class="tb-dropdown-col">
                <a href="${rootRel}financial-calculators.html" class="tb-dropdown-cat-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  <span>Financial</span>
                </a>
                <div class="tb-dropdown-links">
                  <a href="${rootRel}mortgage-calculator.html" class="tb-dropdown-item" role="menuitem">Mortgage Calculator</a>
                  <a href="${rootRel}loan-calculator.html" class="tb-dropdown-item" role="menuitem">Loan & EMI Calculator</a>
                  <a href="${rootRel}compound-interest-calculator.html" class="tb-dropdown-item" role="menuitem">Compound Interest</a>
                  <a href="${rootRel}auto-loan-calculator.html" class="tb-dropdown-item" role="menuitem">Auto Loan Calculator</a>
                  <a href="${rootRel}financial-calculators.html" class="tb-dropdown-more">All 40+ Finance Tools &rarr;</a>
                </div>
              </div>
              <div class="tb-dropdown-col">
                <a href="${rootRel}fitness-health-calculators.html" class="tb-dropdown-cat-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  <span>Fitness & Health</span>
                </a>
                <div class="tb-dropdown-links">
                  <a href="${rootRel}bmi-calculator.html" class="tb-dropdown-item" role="menuitem">BMI & Ideal Weight</a>
                  <a href="${rootRel}calorie-calculator.html" class="tb-dropdown-item" role="menuitem">Calorie & Macro Calculator</a>
                  <a href="${rootRel}body-fat-calculator.html" class="tb-dropdown-item" role="menuitem">Body Fat Calculator</a>
                  <a href="${rootRel}fitness-health-calculators.html" class="tb-dropdown-more">All 30+ Health Tools &rarr;</a>
                </div>
              </div>
              <div class="tb-dropdown-col">
                <a href="${rootRel}math-calculators.html" class="tb-dropdown-cat-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>
                  <span>Math</span>
                </a>
                <div class="tb-dropdown-links">
                  <a href="${rootRel}percentage-calculator.html" class="tb-dropdown-item" role="menuitem">Percentage Calculator</a>
                  <a href="${rootRel}scientific-calculator.html" class="tb-dropdown-item" role="menuitem">Scientific Calculator</a>
                  <a href="${rootRel}math-calculators.html" class="tb-dropdown-more">All 45+ Math Tools &rarr;</a>
                </div>
              </div>
              <div class="tb-dropdown-col">
                <a href="${rootRel}other-calculators.html" class="tb-dropdown-cat-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                  <span>Everyday</span>
                </a>
                <div class="tb-dropdown-links">
                  <a href="${rootRel}age-calculator.html" class="tb-dropdown-item" role="menuitem">Exact Age Calculator</a>
                  <a href="${rootRel}due-date-calculator.html" class="tb-dropdown-item" role="menuitem">Due Date Calculator</a>
                  <a href="${rootRel}other-calculators.html" class="tb-dropdown-more">All Everyday Tools &rarr;</a>
                </div>
              </div>
            </div>
            <div class="tb-dropdown-footer">
              <span class="tb-dropdown-footer-text">Looking for all 200+ calculators?</span>
              <a href="${rootRel}index.html#all-tools" class="tb-dropdown-footer-link">Browse Full Directory &rarr;</a>
            </div>
          </div>
        </div>
        <a href="${rootRel}ebook-buddy.html" class="tb-nav-link">EbookBuddy</a>
        <a href="${rootRel}blog/index.html" class="tb-nav-link ${activeNav === 'blog' ? 'active' : ''}">Blog</a>
        <button type="button" class="tb-theme-toggle" aria-label="Toggle Dark/Light Mode"></button>
      </div>
      <div class="tb-mobile-controls">
        <button type="button" class="tb-theme-toggle tb-mobile-theme-toggle" aria-label="Toggle Dark/Light Mode"></button>
        <button type="button" class="tb-mobile-toggle" id="tb-mobile-toggle" aria-label="Open Navigation Menu" aria-expanded="false" aria-controls="tb-mobile-nav">
          <span class="tb-hamburger-icon">
            <span class="tb-hamburger-bar"></span>
            <span class="tb-hamburger-bar"></span>
            <span class="tb-hamburger-bar"></span>
          </span>
        </button>
      </div>
    </div>
    <div class="tb-mobile-nav" id="tb-mobile-nav" aria-hidden="true">
      <div class="tb-container tb-mobile-nav-inner">
        <a href="${rootRel}index.html" class="tb-mobile-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          <span>All Tools</span>
        </a>
        <div class="tb-mobile-accordion" id="tb-mobile-calc-accordion">
          <button type="button" class="tb-mobile-link tb-mobile-accordion-toggle" id="tb-mobile-calc-toggle" aria-expanded="false">
            <span class="tb-mobile-link-content">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>
              <span>Calculators</span>
            </span>
            <svg class="tb-accordion-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <div class="tb-mobile-accordion-body" id="tb-mobile-calc-body">
            <div class="tb-mobile-subgroup">
              <div class="tb-mobile-subheading">Financial Calculators</div>
              <a href="${rootRel}mortgage-calculator.html" class="tb-mobile-sublink">Mortgage Calculator</a>
              <a href="${rootRel}loan-calculator.html" class="tb-mobile-sublink">Loan & EMI Calculator</a>
              <a href="${rootRel}compound-interest-calculator.html" class="tb-mobile-sublink">Compound Interest</a>
              <a href="${rootRel}auto-loan-calculator.html" class="tb-mobile-sublink">Auto Loan Calculator</a>
              <a href="${rootRel}financial-calculators.html" class="tb-mobile-sublink tb-sublink-more">All Financial Tools &rarr;</a>
            </div>
            <div class="tb-mobile-subgroup">
              <div class="tb-mobile-subheading">Fitness & Health</div>
              <a href="${rootRel}bmi-calculator.html" class="tb-mobile-sublink">BMI & Ideal Weight</a>
              <a href="${rootRel}calorie-calculator.html" class="tb-mobile-sublink">Calorie & Macro Calculator</a>
              <a href="${rootRel}body-fat-calculator.html" class="tb-mobile-sublink">Body Fat Calculator</a>
              <a href="${rootRel}fitness-health-calculators.html" class="tb-mobile-sublink tb-sublink-more">All Health Tools &rarr;</a>
            </div>
            <div class="tb-mobile-subgroup">
              <div class="tb-mobile-subheading">Math Calculators</div>
              <a href="${rootRel}percentage-calculator.html" class="tb-mobile-sublink">Percentage Calculator</a>
              <a href="${rootRel}scientific-calculator.html" class="tb-mobile-sublink">Scientific Calculator</a>
              <a href="${rootRel}math-calculators.html" class="tb-mobile-sublink tb-sublink-more">All Math Tools &rarr;</a>
            </div>
            <div class="tb-mobile-subgroup">
              <div class="tb-mobile-subheading">Everyday & Utilities</div>
              <a href="${rootRel}age-calculator.html" class="tb-mobile-sublink">Exact Age Calculator</a>
              <a href="${rootRel}due-date-calculator.html" class="tb-mobile-sublink">Due Date Calculator</a>
              <a href="${rootRel}other-calculators.html" class="tb-mobile-sublink tb-sublink-more">All Everyday Utilities &rarr;</a>
            </div>
          </div>
        </div>
        <a href="${rootRel}ebook-buddy.html" class="tb-mobile-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          <span>EbookBuddy AI</span>
        </a>
        <a href="${rootRel}blog/index.html" class="tb-mobile-link ${activeNav === 'blog' ? 'active' : ''}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <span>Blog & Guides</span>
        </a>
      </div>
    </div>
  </header>
  <div class="tb-mobile-backdrop" id="tb-mobile-backdrop" aria-hidden="true"></div>`;
}

/**
 * Builds Footer HTML
 */
function buildFooter(rootRel) {
  return `
  <footer class="tb-footer">
    <div class="tb-container">
      <div class="tb-footer-grid">
        <div class="tb-footer-col">
          <a href="${rootRel}index.html" class="tb-brand" style="margin-bottom: 0.75rem;">
            <div class="tb-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <div class="tb-brand-text">Tools<span>Buddy</span></div>
          </a>
          <p style="color: var(--mute, var(--text-muted)); line-height: 1.6; max-width: 320px;">
            Fast, secure, client-side utility platform. Zero login, zero installation, 100% free forever.
          </p>
        </div>
        <div class="tb-footer-col">
          <h4>Popular Tools</h4>
          <ul>
            <li><a href="${rootRel}ebook-buddy.html">EbookBuddy</a></li>
            <li><a href="${rootRel}percentage-calculator.html">Percentage Calculator</a></li>
            <li><a href="${rootRel}loan-calculator.html">Loan & Mortgage Calculator</a></li>
            <li><a href="${rootRel}case-converter.html">Case Converter</a></li>
            <li><a href="${rootRel}qr-code-generator.html">QR Code Studio</a></li>
            <li><a href="${rootRel}json-formatter.html">JSON Formatter</a></li>
            <li><a href="${rootRel}blog/index.html">ToolsBuddy Blog</a></li>
          </ul>
        </div>
        <div class="tb-footer-col">
          <h4>Company & Legal</h4>
          <ul>
            <li><a href="${rootRel}privacy-policy.html">Privacy Policy</a></li>
            <li><a href="${rootRel}terms.html">Terms of Service</a></li>
            <li><a href="https://sabimentors.com" target="_blank" rel="noopener">SabiMentors Ecosystem</a></li>
          </ul>
        </div>
      </div>
      <div class="tb-footer-bottom">
        <div>&copy; 2026 ToolsBuddy. All rights reserved. Run 100% in your browser.</div>
        <div class="tb-footer-ecosystem">
          Part of the <a href="https://sabimentors.com" target="_blank" rel="noopener">SabiMentors</a> educational network.
        </div>
      </div>
    </div>
  </footer>`;
}

/**
 * 1. Build Individual Post Pages
 */
posts.forEach(post => {
  const postDir = path.join(BLOG_DIR, post.slug);
  ensureDir(postDir);

  const author = authorMap[post.authorId] || {
    name: 'ToolsBuddy Editorial Team',
    slug: 'ebookbuddy',
    bio: 'Guides, frameworks, and insights to help creators validate and build profitable digital products.',
    avatar: 'assets/blog/post1_mascot_breakthrough.png'
  };

  const rootRel = '../../';
  const blogRel = '../';
  const readingTime = post.readingTime || engine.calculateReadingTime(post.content);
  const formattedDate = formatDate(post.publishedAt);
  const linkedContent = engine.autoLinkContent(post.content, post.slug, posts, '../');
  const relatedPosts = engine.getRelatedPosts(post, posts, 2);

  const featuredImgPath = post.featuredImage
    ? (post.featuredImage.startsWith('http') ? post.featuredImage : rootRel + post.featuredImage)
    : '';

  const authorImgPath = author.avatar
    ? (author.avatar.startsWith('http') ? author.avatar : rootRel + author.avatar)
    : '';

  const relatedHtml = relatedPosts.length ? `
    <section class="related-posts-section">
      <h3 class="related-title">Recommended Next Reads</h3>
      <div class="posts-grid">
        ${relatedPosts.map(rp => `
          <a href="${blogRel}${rp.slug}/index.html" class="post-card">
            <div class="post-card-body">
              <div class="post-meta-row">
                <span class="post-cat-badge">${escapeHtml(rp.category || 'Guides')}</span>
                <span>&bull;</span>
                <span>${rp.readingTime || '5 min read'}</span>
              </div>
              <h4 class="post-card-title">${escapeHtml(rp.title)}</h4>
              <p class="post-card-excerpt">${escapeHtml(rp.excerpt)}</p>
              <div class="post-card-footer">
                <span>Read Guide</span>
                <span>&rarr;</span>
              </div>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
  ` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${escapeHtml(post.title)} | ToolsBuddy Blog</title>
  <meta name="description" content="${escapeHtml(post.excerpt || post.subtitle || '')}">
  <link rel="canonical" href="${SITE_URL}/blog/${post.slug}/">

  <!-- Universal Favicon -->
  <link rel="icon" type="image/svg+xml" href="${rootRel}favicon.svg?v=2">
  <link rel="alternate icon" href="${rootRel}favicon.ico?v=2">
  <link rel="apple-touch-icon" href="${rootRel}apple-touch-icon.png">
  <link rel="manifest" href="${rootRel}site.webmanifest">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${SITE_URL}/blog/${post.slug}/">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.excerpt || '')}">
  <meta property="og:site_name" content="ToolsBuddy">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(post.excerpt || '')}">

  <!-- CSS -->
  <link rel="stylesheet" href="${rootRel}css/main.css">
  <link rel="stylesheet" href="${blogRel}blog.css">

  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}" crossorigin="anonymous"></script>

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": ${JSON.stringify(post.title)},
    "description": ${JSON.stringify(post.excerpt || '')},
    "datePublished": ${JSON.stringify(post.publishedAt)},
    "author": {
      "@type": "Person",
      "name": ${JSON.stringify(author.name)}
    },
    "publisher": {
      "@type": "Organization",
      "name": "ToolsBuddy",
      "url": "${SITE_URL}"
    }
  }
  </script>
</head>
<body>
  ${buildHeader(rootRel, 'blog')}

  <main class="blog-wrap">
    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="${rootRel}index.html">Home</a>
      <span class="breadcrumb-sep">/</span>
      <a href="${blogRel}index.html">Blog</a>
      <span class="breadcrumb-sep">/</span>
      <span aria-current="page">${escapeHtml(post.title)}</span>
    </nav>

    <!-- Ad Unit: ad-top -->
    <div class="tb-ad-container ad-top" id="ad-top-slot" data-ad-slot-desk="4369386116" data-ad-slot-mob="8117059432">
      <span class="tb-ad-label">Advertisement</span>
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${ADSENSE_CLIENT_ID}"
           data-ad-slot="4369386116"
           data-ad-format="horizontal"
           data-full-width-responsive="true"></ins>
    </div>

    <!-- Article Content -->
    <article>
      <header class="article-header">
        <span class="article-category">${escapeHtml(post.category || 'Guides')}</span>
        <h1 class="article-title">${escapeHtml(post.title)}</h1>
        ${post.subtitle ? `<p class="article-subtitle">${escapeHtml(post.subtitle)}</p>` : ''}
        <div class="article-meta">
          <span>By <strong>${escapeHtml(author.name)}</strong></span>
          <span>&bull;</span>
          <span>${formattedDate}</span>
          <span>&bull;</span>
          <span>${readingTime}</span>
        </div>
      </header>

      ${featuredImgPath ? `
      <div class="article-featured-image">
        <img src="${featuredImgPath}" alt="${escapeHtml(post.title)}">
      </div>` : ''}

      <div class="article-content">
        ${linkedContent}
      </div>

      <!-- Ad Unit: ad-result -->
      <div class="tb-ad-container ad-result" id="ad-result-slot" data-ad-slot-desk="3056304442" data-ad-slot-mob="6229262699">
        <span class="tb-ad-label">Advertisement</span>
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="${ADSENSE_CLIENT_ID}"
             data-ad-slot="3056304442"
             data-ad-format="rectangle,horizontal"
             data-full-width-responsive="true"></ins>
      </div>

      <!-- Author Bio Box -->
      <div class="author-box">
        ${authorImgPath ? `<img src="${authorImgPath}" alt="${escapeHtml(author.name)}" class="author-avatar">` : ''}
        <div>
          <div class="author-name">${escapeHtml(author.name)}</div>
          <div class="author-bio">${escapeHtml(author.bio || author.tagline || '')}</div>
        </div>
      </div>

      <!-- Related Posts -->
      ${relatedHtml}

      <!-- Ad Unit: ad-footer -->
      <div class="tb-ad-container ad-footer" id="ad-footer-slot">
        <span class="tb-ad-label">Advertisement</span>
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="${ADSENSE_CLIENT_ID}"
             data-ad-slot="3385897927"
             data-ad-format="autorelaxed"
             data-full-width-responsive="true"></ins>
      </div>
    </article>
  </main>

  ${buildFooter(rootRel)}

  <script src="${rootRel}js/main.js"></script>
  <script src="${rootRel}js/ads.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(postDir, 'index.html'), html, 'utf8');
  console.log(`Generated single post: blog/${post.slug}/index.html`);
});

/**
 * 2. Build Main Blog Directory Page (blog/index.html)
 */
const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));
const blogRootRel = '../';

const blogIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>ToolsBuddy Blog — Digital Publishing, AI Workflows & Marketing Guides</title>
  <meta name="description" content="Read actionable blueprints, prompt frameworks, and monetization tactics from the ToolsBuddy and SabiMentors team.">
  <link rel="canonical" href="${SITE_URL}/blog/">

  <!-- Universal Favicon -->
  <link rel="icon" type="image/svg+xml" href="${blogRootRel}favicon.svg?v=2">
  <link rel="alternate icon" href="${blogRootRel}favicon.ico?v=2">
  <link rel="apple-touch-icon" href="${blogRootRel}apple-touch-icon.png">
  <link rel="manifest" href="${blogRootRel}site.webmanifest">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}/blog/">
  <meta property="og:title" content="ToolsBuddy Blog — Digital Publishing & AI Guides">
  <meta property="og:description" content="Actionable blueprints, prompt engineering frameworks, and funnel tactics.">
  <meta property="og:site_name" content="ToolsBuddy">

  <!-- CSS -->
  <link rel="stylesheet" href="${blogRootRel}css/main.css">
  <link rel="stylesheet" href="blog.css">

  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}" crossorigin="anonymous"></script>

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "ToolsBuddy Blog",
    "description": "Educational guides, frameworks, and tools for digital creators.",
    "url": "${SITE_URL}/blog/"
  }
  </script>
</head>
<body>
  ${buildHeader(blogRootRel, 'blog')}

  <main class="blog-wrap archive-wrap">
    <div class="blog-header">
      <span class="blog-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        Editorial Insights
      </span>
      <h1 class="blog-title">ToolsBuddy Guides & Blueprints</h1>
      <p class="blog-desc">
        Explore actionable frameworks, prompt engineering blueprints, and marketing strategies to launch profitable digital products.
      </p>

      <!-- Category Filter Pills -->
      <div class="filter-pills" id="blog-filters">
        <button type="button" class="pill-btn active" data-filter="all">All Articles</button>
        ${categories.map(c => `<button type="button" class="pill-btn" data-filter="${c.toLowerCase()}">${escapeHtml(c)}</button>`).join('')}
      </div>
    </div>

    <!-- Ad Unit: ad-top -->
    <div class="tb-ad-container ad-top" id="ad-top-slot" data-ad-slot-desk="4369386116" data-ad-slot-mob="8117059432">
      <span class="tb-ad-label">Advertisement</span>
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${ADSENSE_CLIENT_ID}"
           data-ad-slot="4369386116"
           data-ad-format="horizontal"
           data-full-width-responsive="true"></ins>
    </div>

    <!-- Post Grid -->
    <div class="posts-grid" id="posts-container">
      ${posts.map(p => {
        const pImg = p.featuredImage ? `${blogRootRel}${p.featuredImage}` : '';
        const pDate = formatDate(p.publishedAt);
        return `
        <a href="${p.slug}/index.html" class="post-card" data-cat="${(p.category || '').toLowerCase()}">
          ${pImg ? `
          <div class="post-card-img-wrap">
            <img src="${pImg}" alt="${escapeHtml(p.title)}" class="post-card-img" loading="lazy">
          </div>` : ''}
          <div class="post-card-body">
            <div class="post-meta-row">
              <span class="post-cat-badge">${escapeHtml(p.category || 'Guides')}</span>
              <span>&bull;</span>
              <span>${pDate}</span>
              <span>&bull;</span>
              <span>${p.readingTime || '5 min read'}</span>
            </div>
            <h2 class="post-card-title">${escapeHtml(p.title)}</h2>
            <p class="post-card-excerpt">${escapeHtml(p.excerpt)}</p>
            <div class="post-card-footer">
              <span>Read Full Article</span>
              <span>&rarr;</span>
            </div>
          </div>
        </a>`;
      }).join('')}
    </div>

    <!-- Ad Unit: ad-footer -->
    <div class="tb-ad-container ad-footer" id="ad-footer-slot">
      <span class="tb-ad-label">Advertisement</span>
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${ADSENSE_CLIENT_ID}"
           data-ad-slot="3385897927"
           data-ad-format="autorelaxed"
           data-full-width-responsive="true"></ins>
    </div>
  </main>

  ${buildFooter(blogRootRel)}

  <script src="${blogRootRel}js/main.js"></script>
  <script src="${blogRootRel}js/ads.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const filterBtns = document.querySelectorAll('#blog-filters .pill-btn');
      const cards = document.querySelectorAll('#posts-container .post-card');

      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const filter = btn.getAttribute('data-filter');

          cards.forEach(card => {
            const cat = card.getAttribute('data-cat');
            if (filter === 'all' || cat === filter) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), blogIndexHtml, 'utf8');
console.log(`Generated main blog directory: blog/index.html`);

/**
 * 3. Build Author Archive (author/ebookbuddy/index.html)
 */
authors.forEach(author => {
  const authorDir = path.join(AUTHOR_DIR, author.slug);
  ensureDir(authorDir);
  const authorRel = '../../';
  const authorImg = author.avatar ? `${authorRel}${author.avatar}` : '';
  const authorPosts = posts.filter(p => p.authorId === author.id);

  const authorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${escapeHtml(author.name)} | ToolsBuddy</title>

  <!-- Universal Favicon -->
  <link rel="icon" type="image/svg+xml" href="${authorRel}favicon.svg?v=2">
  <link rel="alternate icon" href="${authorRel}favicon.ico?v=2">
  <link rel="apple-touch-icon" href="${authorRel}apple-touch-icon.png">
  <link rel="manifest" href="${authorRel}site.webmanifest">
  <link rel="stylesheet" href="${authorRel}css/main.css">
  <link rel="stylesheet" href="${authorRel}blog/blog.css">
  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}" crossorigin="anonymous"></script>
</head>
<body>
  ${buildHeader(authorRel, 'blog')}

  <main class="blog-wrap archive-wrap">
    <div class="author-box" style="margin-top: 1rem;">
      ${authorImg ? `<img src="${authorImg}" alt="${escapeHtml(author.name)}" class="author-avatar" style="width: 88px; height: 88px;">` : ''}
      <div>
        <h1 class="author-name" style="font-size: 1.5rem;">${escapeHtml(author.name)}</h1>
        <p style="color: var(--brand); font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem;">${escapeHtml(author.role || '')}</p>
        <div class="author-bio">${escapeHtml(author.bio || '')}</div>
      </div>
    </div>

    <h2 style="font-size: 1.35rem; margin: 2rem 0 1rem;">Articles Written by ${escapeHtml(author.name)}</h2>
    <div class="posts-grid">
      ${authorPosts.map(p => `
        <a href="${authorRel}blog/${p.slug}/index.html" class="post-card">
          <div class="post-card-body">
            <h3 class="post-card-title">${escapeHtml(p.title)}</h3>
            <p class="post-card-excerpt">${escapeHtml(p.excerpt)}</p>
            <div class="post-card-footer">
              <span>Read Article</span>
              <span>&rarr;</span>
            </div>
          </div>
        </a>
      `).join('')}
    </div>
  </main>

  ${buildFooter(authorRel)}
  <script src="${authorRel}js/main.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(authorDir, 'index.html'), authorHtml, 'utf8');
  console.log(`Generated author archive: author/${author.slug}/index.html`);
});

/**
 * 4. Update Root sitemap.xml
 */
const REGISTRY_FILE = path.join(ROOT_DIR, 'data', 'tools-registry.json');
const registryData = readJSON(REGISTRY_FILE, {});
const activeRegistryTools = Object.values(registryData).filter(t => t.status === 'active');

const categoryHubs = [
  'financial-calculators.html',
  'fitness-health-calculators.html',
  'math-calculators.html',
  'other-calculators.html'
];

const sitemapUrls = [
  { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' },
  ...categoryHubs.map(h => ({ loc: `${SITE_URL}/${h}`, priority: '0.9', changefreq: 'daily' })),
  ...activeRegistryTools.map(t => ({ loc: `${SITE_URL}/${t.url}`, priority: t.priority === 1 ? '0.9' : '0.8', changefreq: 'weekly' })),
  { loc: `${SITE_URL}/ebook-buddy.html`, priority: '0.95', changefreq: 'weekly' },
  { loc: `${SITE_URL}/blog/`, priority: '0.9', changefreq: 'daily' },
  ...posts.map(p => ({
    loc: `${SITE_URL}/blog/${p.slug}/`,
    priority: '0.85',
    changefreq: 'weekly'
  })),
  { loc: `${SITE_URL}/privacy-policy.html`, priority: '0.5', changefreq: 'monthly' },
  { loc: `${SITE_URL}/terms.html`, priority: '0.5', changefreq: 'monthly' }
];

const todayDate = new Date().toISOString().split('T')[0];
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${todayDate}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), sitemapContent, 'utf8');
console.log(`Updated sitemap.xml with ${sitemapUrls.length} URLs.`);

console.log(`--- Static Generation Complete ---`);
