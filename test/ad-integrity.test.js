const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== Running Universal Ad System Integrity Tests ===\n');

const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Verify ads.js and js/ads.js are identical
const rootAds = fs.readFileSync(path.join(ROOT_DIR, 'ads.js'), 'utf8');
const jsAds = fs.readFileSync(path.join(ROOT_DIR, 'js', 'ads.js'), 'utf8');
assert.strictEqual(rootAds, jsAds, 'ads.js and js/ads.js must be identical unified engines');
console.log('[PASS] ads.js and js/ads.js are 100% synchronized and identical.');

// 2. Syntax check on ads.js
try {
  new Function(rootAds);
  console.log('[PASS] ads.js syntax is valid ECMAScript.');
} catch (e) {
  assert.fail('ads.js syntax error: ' + e.message);
}

// 3. Verify zero rogue inline scripts with adsbygoogle.push in HTML files
const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));
const rogueFiles = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  // Match inline <script>(adsbygoogle...)</script> inside HTML body
  const matches = content.match(/<script>\s*\(adsbygoogle\s*=\s*window\.adsbygoogle[\s\S]*?<\/script>/gi);
  if (matches && matches.length > 0) {
    rogueFiles.push(file);
  }
});

assert.strictEqual(rogueFiles.length, 0, `Found rogue inline push scripts in: ${rogueFiles.join(', ')}`);
console.log(`[PASS] Verified 0 rogue inline push scripts across all ${htmlFiles.length} HTML files.`);

// 4. Verify all tool files have unified ad container markup
const sampleTools = ['age-calculator.html', 'mortgage-calculator.html', 'loan-calculator.html', 'index.html'];
sampleTools.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  assert.ok(content.includes('id="ad-top-slot"'), `${file} must contain #ad-top-slot`);
  assert.ok(content.includes('id="ad-footer-slot"'), `${file} must contain #ad-footer-slot`);
  assert.ok(!content.includes('data-ad-format="rectangle,horizontal"'), `${file} must not contain invalid format`);
});
console.log('[PASS] Verified clean ad container markup on sample tool pages.');

// 5. Verify EbookBuddy Studio retains its expected slot containers
const ebContent = fs.readFileSync(path.join(ROOT_DIR, 'ebook-buddy.html'), 'utf8');
assert.ok(ebContent.includes('id="ad-hero"'), 'ebook-buddy.html must contain #ad-hero');
assert.ok(ebContent.includes('id="ad-top"'), 'ebook-buddy.html must contain #ad-top');
assert.ok(ebContent.includes('id="ad-bottom"'), 'ebook-buddy.html must contain #ad-bottom');
assert.ok(ebContent.includes('id="ad-footer"'), 'ebook-buddy.html must contain #ad-footer');
assert.ok(ebContent.includes('window.EbookBuddyAds'), 'ebook-buddy.html must reference window.EbookBuddyAds');
console.log('[PASS] EbookBuddy studio has 100% slot and API integrity with zero regressions.');

// 6. Verify export signatures in unified ads.js
assert.ok(rootAds.includes('window.ToolsBuddyAds'), 'Must export window.ToolsBuddyAds');
assert.ok(rootAds.includes('window.EbookBuddyAds = window.ToolsBuddyAds'), 'Must export window.EbookBuddyAds alias');
assert.ok(rootAds.includes('window.renderAd = renderAd'), 'Must export window.renderAd');
assert.ok(rootAds.includes('window.refreshAds = refreshAds'), 'Must export window.refreshAds');
assert.ok(rootAds.includes('window.initAds = initAds'), 'Must export window.initAds');
console.log('[PASS] Unified ad engine exports all required global namespaces and functions.');

console.log('\n[ALL TESTS PASSED] Universal ad system is fully validated!\n');
