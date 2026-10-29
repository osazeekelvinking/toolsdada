/**
 * Catalog & Integrity Tests (test/catalog-check.js)
 * Checks data/tools-registry.json, active files on disk, canonical tags, and schema.org markup.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const REGISTRY_FILE = path.join(ROOT_DIR, 'data', 'tools-registry.json');

console.log('=== Running Catalog & Integrity Verification ===\n');

assert(fs.existsSync(REGISTRY_FILE), 'Registry file must exist');
const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
const tools = Object.values(registry);

console.log(`Total tools in registry: ${tools.length}`);
assert(tools.length >= 200, 'Must have at least 200 tools from calculator.net');

const activeTools = tools.filter(t => t.status === 'active');
console.log(`Active tools to verify on disk: ${activeTools.length}`);

activeTools.forEach(t => {
  const filePath = path.join(ROOT_DIR, t.url);
  assert(fs.existsSync(filePath), `Active tool HTML file must exist on disk: ${t.url}`);
  const html = fs.readFileSync(filePath, 'utf8');

  // Verify critical SEO & metadata
  assert(html.includes('<title>'), `${t.url} must contain <title>`);
  assert(html.includes('rel="canonical"'), `${t.url} must contain canonical link`);
  assert(html.includes('application/ld+json'), `${t.url} must contain Schema.org JSON-LD`);
  assert(html.includes('tb-workspace'), `${t.url} must contain tb-workspace`);
  assert(html.includes('tb-header'), `${t.url} must contain tb-header`);
  assert(html.includes('tb-footer'), `${t.url} must contain tb-footer`);
  console.log(`  [OK] ${t.url} verified`);
});

// Verify category hubs exist
const hubs = ['financial-calculators.html', 'fitness-health-calculators.html', 'math-calculators.html', 'other-calculators.html'];
hubs.forEach(h => {
  const hubPath = path.join(ROOT_DIR, h);
  assert(fs.existsSync(hubPath), `Category hub must exist: ${h}`);
  console.log(`  [OK] Category hub ${h} verified`);
});

// Verify sitemap.xml exists and has valid XML structure
const sitemap = fs.readFileSync(path.join(ROOT_DIR, 'sitemap.xml'), 'utf8');
assert(sitemap.includes('<urlset'), 'Sitemap must contain <urlset>');
assert(sitemap.includes('mortgage-calculator.html'), 'Sitemap must contain mortgage calculator');
assert(sitemap.includes('calorie-calculator.html'), 'Sitemap must contain calorie calculator');
assert(sitemap.includes('compound-interest-calculator.html'), 'Sitemap must contain compound interest calculator');
console.log('  [OK] sitemap.xml verified');

console.log('\n[PASS] All Catalog & Integrity Verifications Succeeded!');
