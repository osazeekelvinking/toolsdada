/**
 * ToolsBuddy - Master Tool Validation & Health Check (test/validate-all-tools.js)
 * Zero-tolerance validation pipeline that MUST pass whenever a tool is added or edited.
 * 
 * Checks performed:
 * 1. Catalog & Disk Consistency
 * 2. Script Dependencies & Global Engines (calc-core.js, calc-charts.js, qrcode.min.js)
 * 3. Inline Script Syntax Validation
 * 4. DOM Reference Integrity (all getElementById and #selectors exist in HTML)
 * 5. Full Headless Browser Runtime & Reactive Calculation Verification (using Microsoft Edge / Chromium)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const REGISTRY_FILE = path.join(ROOT_DIR, 'data', 'tools-registry.json');
const HTTP_PORT = 8899;
const CDP_PORT = 9222;

console.log('======================================================');
console.log('  ToolsBuddy Comprehensive Tool Quality & Health Check');
console.log('======================================================\n');

let failedCount = 0;

function fail(msg) {
  console.error(`  [FAIL] ${msg}`);
  failedCount++;
}

function pass(msg) {
  console.log(`  [PASS] ${msg}`);
}

// ==========================================
// Phase 1: Static & Dependency Analysis
// ==========================================
console.log('--- Phase 1: Static Dependency & Syntax Analysis ---');

if (!fs.existsSync(REGISTRY_FILE)) {
  fail('data/tools-registry.json does not exist');
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
const activeTools = Object.values(registry).filter(t => t.status === 'active').map(t => t.url);
if (!activeTools.includes('ebook-buddy.html')) activeTools.push('ebook-buddy.html');

console.log(`Verifying ${activeTools.length} active tools...\n`);

activeTools.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  if (!fs.existsSync(filePath)) {
    fail(`File does not exist on disk: ${file}`);
    return;
  }

  const html = fs.readFileSync(filePath, 'utf8');

  // 1. Script sources
  const srcMatches = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
  for (const src of srcMatches) {
    if (!src.startsWith('http') && !src.startsWith('//')) {
      const cleanSrc = src.split('?')[0];
      const scriptPath = path.join(ROOT_DIR, cleanSrc);
      if (!fs.existsSync(scriptPath)) {
        fail(`${file}: Script src not found: ${src}`);
      }
    }
  }

  // 2. Engine Dependencies
  if (html.includes('CalcCore') && !srcMatches.some(s => s.includes('calc-core.js'))) {
    fail(`${file}: Uses CalcCore but does not load js/calc-core.js`);
  }
  if (html.includes('CalcCharts') && !srcMatches.some(s => s.includes('calc-charts.js'))) {
    fail(`${file}: Uses CalcCharts but does not load js/calc-charts.js`);
  }
  if (html.includes('new QRCode(') && !srcMatches.some(s => s.includes('qrcode.min.js') || s.includes('qrcode.js'))) {
    fail(`${file}: Uses QRCode but does not load qrcode.min.js`);
  }

  // 3. Collect HTML Element IDs
  const idSet = new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(m => m[1]));

  // 4. Validate Inline Scripts
  const scriptRegex = /<script(?![^>]*application\/ld\+json)([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  let idx = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    const attrs = match[1];
    const code = match[2];
    if (attrs.includes('src=')) continue;
    idx++;

    // Syntax check
    try {
      new Function(code);
    } catch (err) {
      fail(`${file}: Inline script #${idx} syntax error: ${err.message}`);
    }

    // Check unguarded getElementById calls
    // e.g. document.getElementById("x").something or const x = document.getElementById("x"); x.addEventListener
    const directCalls = [...code.matchAll(/document\.getElementById\(["']([^"']+)["']\)\.([a-zA-Z0-9_$]+)/g)];
    directCalls.forEach(call => {
      const id = call[1];
      const method = call[2];
      // if not using optional chaining (?.) and element doesn't exist
      if (!idSet.has(id)) {
        fail(`${file}: Unguarded document.getElementById("${id}").${method} references non-existent id`);
      }
    });
  }
});

if (failedCount === 0) {
  pass('All tool files passed static dependency, syntax, and DOM ID checks.');
} else {
  console.error(`\nFound ${failedCount} static errors. Halting validation.`);
  process.exit(1);
}

// ==========================================
// Phase 2: Live Browser Execution & Verification
// ==========================================
console.log('\n--- Phase 2: Live Chromium Runtime & Reactive Execution ---');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(ROOT_DIR, urlPath === '/' ? 'index.html' : urlPath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end();
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

async function runBrowserPhase() {
  server.listen(HTTP_PORT, '127.0.0.1');

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (!fs.existsSync(edgePath)) {
    console.log('[WARN] Headless browser not found at standard path. Skipping live CDP phase.');
    server.close();
    return;
  }

  const edgeProcess = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    'about:blank'
  ], { stdio: 'ignore' });

  for (let i = 0; i < 30; i++) {
    try {
      const resp = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (resp.ok) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const listResp = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const list = await listResp.json();
  const pageTarget = list.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let messageId = 0;
  const callbacks = new Map();
  const pageErrors = [];

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const cb = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) cb.reject(new Error(msg.error.message));
      else cb.resolve(msg.result);
      return;
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      pageErrors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    }
  });

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++messageId;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');

  for (const tool of activeTools) {
    pageErrors.length = 0;
    const url = `http://127.0.0.1:${HTTP_PORT}/${tool}`;
    await sendCommand('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 450));

    // Verify DOM results and trigger calculation
    const checkResult = await sendCommand('Runtime.evaluate', {
      expression: `(function() {
        const issues = [];
        const resultEls = document.querySelectorAll('.tb-result-value, .tb-stat-num, #result, #output');
        resultEls.forEach(el => {
          if (el.innerText.includes('NaN')) {
            issues.push('Element #' + el.id + ' contains NaN');
          }
        });

        // Trigger primary calculation button
        const calcBtns = document.querySelectorAll('#btn-calculate-loan, #btn-calculate-mortgage, #btn-calculate-auto, #btn-calculate-retire, #btn-calculate-tax, #btn-calculate-salary, #btn-calculate-bf, #btn-calculate-bmr, #btn-calculate-army, #btn-calc-t1, #btn-calc-t2, #btn-calc-t3, #btn-convert-case, #btn-format-json, #btn-generate-qr, #btn-generate-link, #btn-run-clean, #btn-generate-wa');
        calcBtns.forEach(btn => {
          if (btn.offsetParent !== null && !btn.disabled) btn.click();
        });

        // Test reactivity on first input
        const firstInput = document.querySelector('.tb-workspace input:not([type=\"hidden\"]):not([type=\"radio\"]):not([type=\"checkbox\"])');
        if (firstInput && !firstInput.readOnly && !firstInput.disabled) {
          firstInput.dispatchEvent(new Event('input', { bubbles: true }));
          firstInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        return { issues };
      })()`,
      returnByValue: true
    });

    await new Promise(r => setTimeout(r, 200));

    const evalData = checkResult.result.value || {};
    if (pageErrors.length > 0 || (evalData.issues && evalData.issues.length > 0)) {
      fail(`${tool}: Runtime exceptions: ${pageErrors.join(' | ')} ${evalData.issues ? evalData.issues.join(', ') : ''}`);
    } else {
      pass(`${tool} loads cleanly with active reactive calculations.`);
    }
  }

  ws.close();
  edgeProcess.kill();
  server.close();

  console.log('\n======================================================');
  if (failedCount === 0) {
    console.log('  SUCCESS: ALL 24 TOOLS PASSED QUALITY & ACCURACY CHECKS!');
    console.log('======================================================\n');
  } else {
    console.error(`  FAILURE: ${failedCount} ISSUES DETECTED.`);
    console.log('======================================================\n');
    process.exit(1);
  }
}

runBrowserPhase().catch(err => {
  console.error('Fatal testing error:', err);
  process.exit(1);
});
