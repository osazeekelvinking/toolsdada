/**
 * ToolsBuddy - Tool Scaffolder CLI (tools/scaffold.js)
 * Usage: node tools/scaffold.js --id=<tool-id> [--title="Tool Title"] [--category=financial]
 * Quickly creates a production-grade HTML tool page with pre-wired SEO metadata,
 * breadcrumbs, Schema.org JSON-LD, AdSense hooks, and responsive layout.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const REGISTRY_FILE = path.join(ROOT_DIR, 'data', 'tools-registry.json');
const TEMPLATE_FILE = path.join(ROOT_DIR, 'tools', 'templates', 'tool-template.html');

// Parse CLI Args
const args = {};
process.argv.slice(2).forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, val] = arg.slice(2).split('=');
    args[key] = val || true;
  }
});

const toolId = args.id;
if (!toolId) {
  console.log(`
ToolsBuddy Tool Scaffolder
Usage:
  node tools/scaffold.js --id=<tool-slug>

Examples:
  node tools/scaffold.js --id=auto-loan-calculator
  node tools/scaffold.js --id=scientific-calculator
  node tools/scaffold.js --id=body-fat-calculator
`);
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
let toolData = registry[toolId];

if (!toolData) {
  console.log(`Tool "${toolId}" not found in data/tools-registry.json. Creating new entry...`);
  const title = args.title || toolId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const category = args.category || 'other';
  toolData = {
    id: toolId,
    title: title,
    category: category,
    subcategory: 'general',
    url: `${toolId}.html`,
    description: `Free online ${title} with instant results, visual charts, and step-by-step formula explanations.`,
    keywords: [toolId.replace(/-/g, ' '), 'calculator', category],
    icon: 'tool',
    status: 'active',
    priority: 2
  };
  registry[toolId] = toolData;
} else {
  toolData.status = 'active';
}

const targetFile = path.join(ROOT_DIR, `${toolId}.html`);
if (fs.existsSync(targetFile) && !args.force) {
  console.warn(`File ${toolId}.html already exists! Pass --force to overwrite.`);
  process.exit(0);
}

const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

const categoryNames = {
  'financial': 'Financial Calculators',
  'fitness-health': 'Fitness & Health Calculators',
  'math': 'Math Calculators',
  'other': 'Everyday Utilities'
};

const categoryHubs = {
  'financial': 'financial-calculators.html',
  'fitness-health': 'fitness-health-calculators.html',
  'math': 'math-calculators.html',
  'other': 'other-calculators.html'
};

const categoryIcons = {
  'financial': '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
  'fitness-health': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',
  'math': '<line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle>',
  'other': '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline>'
};

const appCategories = {
  'financial': 'FinanceApplication',
  'fitness-health': 'HealthApplication',
  'math': 'EducationalApplication',
  'other': 'UtilitiesApplication'
};

// Default Workspace Form
const defaultWorkspace = `
        <div class="tb-grid-2">
          <!-- Inputs Form -->
          <form class="tb-grid-form" id="${toolId}-form" onsubmit="event.preventDefault();">
            <div class="tb-field">
              <label for="inp-primary" class="tb-label">Primary Input</label>
              <input type="number" id="inp-primary" class="tb-input" value="100" required>
            </div>

            <div class="tb-field">
              <label for="inp-secondary" class="tb-label">Secondary Parameter</label>
              <input type="number" id="inp-secondary" class="tb-input" value="10" required>
            </div>

            <div class="tb-btn-group">
              <button type="button" class="tb-btn tb-btn-primary" id="btn-calculate">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Calculate
              </button>
              <button type="button" class="tb-btn tb-btn-secondary" id="btn-reset">Reset</button>
            </div>
          </form>

          <!-- Results Card -->
          <div class="tb-results-card">
            <div class="tb-result-highlight">
              <div class="tb-result-label">Calculated Result</div>
              <div class="tb-result-value" id="res-main">--</div>
              <div class="tb-result-subtext" id="res-sub">Computed in real time</div>
            </div>

            <div class="tb-stats-grid cols-2">
              <div class="tb-stat-box">
                <div class="tb-stat-num" id="res-stat-1">--</div>
                <div class="tb-stat-lbl">Metric A</div>
              </div>
              <div class="tb-stat-box">
                <div class="tb-stat-num" id="res-stat-2">--</div>
                <div class="tb-stat-lbl">Metric B</div>
              </div>
            </div>

            <div class="tb-btn-group">
              <button type="button" class="tb-btn tb-btn-outline tb-btn-sm" id="btn-copy-summary">
                Copy Summary
              </button>
            </div>
          </div>
        </div>
`;

// Default FAQ
const faqList = [
  {
    q: `How does the ${toolData.title} work?`,
    a: `The ${toolData.title} executes real-time calculations purely inside your browser using mathematical formulas with zero server lag.`
  },
  {
    q: `Is my calculation data saved or private?`,
    a: `100% private. All computations run locally on your device without storing or transmitting personal data.`
  },
  {
    q: `Can I share or bookmark my calculation?`,
    a: `Yes! Click the "Share Calculation" button above to copy a direct link encoding your exact inputs.`
  },
  {
    q: `Can I use this tool on mobile?`,
    a: `Yes, the tool is fully responsive and optimized for touch devices, tablets, and desktops.`
  }
];

const faqJson = faqList.map(item => `
          {
            "@type": "Question",
            "name": "${item.q}",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "${item.a}"
            }
          }`).join(',');

const faqHtml = faqList.map(item => `
        <details class="tb-faq-item">
          <summary class="tb-faq-question">${item.q}</summary>
          <div class="tb-faq-answer"><p>${item.a}</p></div>
        </details>`).join('');

const defaultArticle = `
      <h2>About ${toolData.title}</h2>
      <p>The <strong>${toolData.title}</strong> is designed to provide instantaneous, accurate computations with zero friction. Whether you are solving daily problems or analyzing key decisions, our browser-based utility delivers clear numbers with full visual context.</p>
`;

const defaultScript = `
    document.addEventListener('DOMContentLoaded', function () {
      const form = document.getElementById('${toolId}-form');
      const resMain = document.getElementById('res-main');
      const resStat1 = document.getElementById('res-stat-1');
      const resStat2 = document.getElementById('res-stat-2');

      function calculate() {
        const p1 = parseFloat(document.getElementById('inp-primary').value) || 0;
        const p2 = parseFloat(document.getElementById('inp-secondary').value) || 0;
        const result = p1 + p2;

        resMain.textContent = CalcCore.formatNumber(result, 2);
        resStat1.textContent = CalcCore.formatNumber(p1);
        resStat2.textContent = CalcCore.formatNumber(p2);
      }

      CalcCore.bindReactive(form, calculate);
      document.getElementById('btn-calculate')?.addEventListener('click', calculate);
      document.getElementById('btn-share-calc')?.addEventListener('click', () => CalcCore.copyShareUrl(form));
    });
`;

let content = template
  .replace(/{{TITLE}}/g, toolData.title)
  .replace(/{{DESCRIPTION}}/g, toolData.description)
  .replace(/{{URL}}/g, `${toolId}.html`)
  .replace(/{{APP_CATEGORY}}/g, appCategories[toolData.category] || 'UtilitiesApplication')
  .replace(/{{CATEGORY_NAME}}/g, categoryNames[toolData.category] || 'Calculators')
  .replace(/{{CATEGORY_HUB_URL}}/g, categoryHubs[toolData.category] || 'index.html')
  .replace(/{{BADGE_ICON}}/g, `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">${categoryIcons[toolData.category]}</svg>`)
  .replace(/{{WORKSPACE_BODY}}/g, defaultWorkspace)
  .replace(/{{ARTICLE_BODY}}/g, defaultArticle)
  .replace(/{{FAQ_JSON}}/g, faqJson)
  .replace(/{{FAQ_HTML}}/g, faqHtml)
  .replace(/{{TOOL_SCRIPT}}/g, defaultScript);

fs.writeFileSync(targetFile, content, 'utf8');
fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), 'utf8');

console.log(`Successfully scaffolded ${targetFile}!`);
console.log(`Running sync...`);
require('./sync.js');
