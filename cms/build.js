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
  <header class="site-header">
    <div class="nav-inner">
      <a href="${rootRel}index.html" class="brand-link">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </div>
        <div class="brand-text">Tools<span>Buddy</span></div>
      </a>
      <div class="nav-actions">
        <a href="${rootRel}index.html" class="nav-link">Tools</a>
        <a href="${rootRel}ebook-buddy.html" class="nav-link">EbookBuddy</a>
        <a href="${rootRel}blog/index.html" class="nav-link ${activeNav === 'blog' ? 'active' : ''}">Blog</a>
        <button type="button" class="tb-theme-toggle" aria-label="Toggle Dark/Light Mode"></button>
      </div>
    </div>
  </header>`;
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
  <link rel="stylesheet" href="${blogRel}blog.css">

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
    <div class="tb-ad-container ad-top" id="ad-top-slot">
      <span class="tb-ad-label">Advertisement</span>
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${ADSENSE_CLIENT_ID}"
           data-ad-slot="1301001001"
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
      <div class="tb-ad-container ad-result" id="ad-result-slot">
        <span class="tb-ad-label">Advertisement</span>
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="${ADSENSE_CLIENT_ID}"
             data-ad-slot="1301001002"
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
             data-ad-slot="1301001003"
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
  <link rel="stylesheet" href="blog.css">

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
    <div class="tb-ad-container ad-top" id="ad-top-slot">
      <span class="tb-ad-label">Advertisement</span>
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${ADSENSE_CLIENT_ID}"
           data-ad-slot="1301001001"
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
           data-ad-slot="1301001003"
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
  <link rel="stylesheet" href="${authorRel}blog/blog.css">
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
const sitemapUrls = [
  { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' },
  { loc: `${SITE_URL}/percentage-calculator.html`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/loan-calculator.html`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/case-converter.html`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/word-counter.html`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/qr-code-generator.html`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/bmi-calculator.html`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/json-formatter.html`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/remove-duplicate-lines.html`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/whatsapp-link-generator.html`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/age-calculator.html`, priority: '0.9', changefreq: 'weekly' },
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

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>2026-10-28</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), sitemapContent, 'utf8');
console.log(`Updated sitemap.xml with ${sitemapUrls.length} URLs.`);

console.log(`--- Static Generation Complete ---`);
