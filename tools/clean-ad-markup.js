const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Find all HTML files except ebook-buddy.html which is already clean
const files = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html') && f !== 'ebook-buddy.html');

let modifiedCount = 0;

files.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Clean ad-top-slot
  content = content.replace(
    /<div class="tb-ad-container ad-top" id="ad-top-slot"[^>]*>[\s\S]*?<\/div>/i,
    `<div class="tb-ad-container ad-top" id="ad-top-slot" data-ad-slot-desk="4369386116" data-ad-slot-mob="8117059432">\n      <span class="tb-ad-label">Advertisement</span>\n    </div>`
  );

  // 2. Clean ad-result-slot (if present)
  content = content.replace(
    /<div class="tb-ad-container ad-result" id="ad-result-slot"[^>]*>[\s\S]*?<\/div>/i,
    `<div class="tb-ad-container ad-result" id="ad-result-slot" data-ad-slot-desk="3056304442" data-ad-slot-mob="6229262699">\n      <span class="tb-ad-label">Advertisement</span>\n    </div>`
  );

  // 3. Clean ad-sidebar-slot (if present, removing rogue inline script)
  content = content.replace(
    /<div class="tb-ad-container ad-sidebar" id="ad-sidebar-slot"[^>]*>[\s\S]*?<\/div>/i,
    `<div class="tb-ad-container ad-sidebar" id="ad-sidebar-slot">\n          <span class="tb-ad-label">Advertisement</span>\n        </div>`
  );

  // 4. Clean ad-footer-slot (if present)
  content = content.replace(
    /<div class="tb-ad-container ad-footer" id="ad-footer-slot"[^>]*>[\s\S]*?<\/div>/i,
    `<div class="tb-ad-container ad-footer" id="ad-footer-slot">\n      <span class="tb-ad-label">Advertisement</span>\n    </div>`
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedCount++;
    console.log(`Cleaned unified ad containers in: ${file}`);
  }
});

// Also clean blog files if present
const blogDir = path.join(ROOT_DIR, 'blog');
if (fs.existsSync(blogDir)) {
  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        scanDir(full);
      } else if (item.endsWith('.html')) {
        let content = fs.readFileSync(full, 'utf8');
        let original = content;

        content = content.replace(
          /<div class="tb-ad-container ad-top" id="ad-top-slot"[^>]*>[\s\S]*?<\/div>/i,
          `<div class="tb-ad-container ad-top" id="ad-top-slot" data-ad-slot-desk="4369386116" data-ad-slot-mob="8117059432">\n      <span class="tb-ad-label">Advertisement</span>\n    </div>`
        );
        content = content.replace(
          /<div class="tb-ad-container ad-result" id="ad-result-slot"[^>]*>[\s\S]*?<\/div>/i,
          `<div class="tb-ad-container ad-result" id="ad-result-slot" data-ad-slot-desk="3056304442" data-ad-slot-mob="6229262699">\n        <span class="tb-ad-label">Advertisement</span>\n      </div>`
        );
        content = content.replace(
          /<div class="tb-ad-container ad-footer" id="ad-footer-slot"[^>]*>[\s\S]*?<\/div>/i,
          `<div class="tb-ad-container ad-footer" id="ad-footer-slot">\n        <span class="tb-ad-label">Advertisement</span>\n      </div>`
        );

        if (content !== original) {
          fs.writeFileSync(full, content, 'utf8');
          modifiedCount++;
          console.log(`Cleaned unified ad containers in blog: ${path.relative(ROOT_DIR, full)}`);
        }
      }
    });
  }
  scanDir(blogDir);
}

console.log(`Successfully unified ad containers across ${modifiedCount} files.`);
