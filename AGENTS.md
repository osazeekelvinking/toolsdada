# SabiTools (ToolsBuddy) — Agent Engineering & Quality Assurance Rules

> **MANDATE: ZERO GUESSWORK, ZERO UNTESTED EDITS.**  
> Any agent working in this repository MUST strictly follow these verification rules. No tool creation or edit is considered complete until verified against the automated testing suite and headless browser execution pipeline.

---

## 1. Core Operating Principles

1. **Every Tool Must Work End-to-End**: A tool page must not merely look structurally complete; it must execute cleanly in the browser, bind all events, calculate accurately, and produce non-empty, non-`NaN` reactive outputs.
2. **Never Assume APIs Exist Without Checking**: Always verify library and engine function names before calling them. (e.g. check `js/calc-charts.js` for chart methods, `js/calc-core.js` for calculation helpers, `ads.js` for AdSense interaction).
3. **Never Leave Broken Script Dependencies**: If an HTML file uses `CalcCore`, it **MUST** include `<script src="js/calc-core.js"></script>`. If it renders charts, it **MUST** include `<script src="js/calc-charts.js"></script>`.
4. **Preserve User Rules**: Strictly follow user global rules (e.g., no automated git commits or pushes without explicit user permission). Leave changes in the working tree for review.

---

## 2. Standard Tool Architecture & Checklist

When creating a new tool or modifying an existing tool, verify against this checklist:

### A. Script Tags (Order Matters)
Every interactive tool page should load the required engines before inline logic:
```html
<!-- Scripts -->
<script src="js/main.js"></script>
<script src="js/calc-core.js"></script>
<!-- Include only if the tool renders canvas charts -->
<script src="js/calc-charts.js"></script>
<!-- Include only if offline QR generation is required -->
<script src="js/vendor/qrcode.min.js"></script>
<script src="ads.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Tool controller logic
  });
</script>
```

### B. Numeric Inputs & Formatting
- **Do not use native `parseFloat(input.value)` directly on formatted fields**: Values like `"250,000"` will be truncated to `250`.
- **Always use `CalcCore.parseNumber(input.value)`**: Automatically strips commas, trims whitespace, and returns a clean number (or `0` on invalid).
- **Use `CalcCore.attachNumberFormatter(input)` or `data-format="number"`**: Formats numbers live with comma separators while preserving cursor position.
- **Use `CalcCore.formatCurrency(...)` / `CalcCore.formatNumber(...)`**: Maintains consistent typography and multi-currency prefix reactivity.

### C. Canvas Micro-Charts (`js/calc-charts.js`)
Use the verified signatures:
- **Donut / Breakdown**: `CalcCharts.drawDonut(canvas, slices, options)` or `CalcCharts.drawDonutChart(canvas, slices, options)`
- **Bar Chart**: `CalcCharts.drawBarChart(canvas, xLabels, series, options)`
- **Area / Line Growth**: `CalcCharts.drawAreaChart(canvas, xLabels, series, options)`
- **Spectrum Meter**: `CalcCharts.renderRangeBar(container, value, ranges)`

### D. AdSense Slot Containers
Maintain unified AdSense slots adhering to `test/ad-integrity.test.js`:
- `#ad-top-slot` with `class="tb-ad-container ad-top"`
- `#ad-result-slot` with `class="tb-ad-container ad-result"`
- `#ad-footer-slot` with `class="tb-ad-container ad-footer"`
- Trigger ad refreshes ONLY on genuine user calculations/conversions via `window.refreshAds('action_name')`. Never use auto-refresh timers.

### E. DOM ID Parity
- Ensure every ID queried by `document.getElementById('xyz')` or `querySelector('#xyz')` in your script **exists in the HTML**.
- Guard optional elements with null checks (`if (elem) ...`) or optional chaining (`elem?.addEventListener(...)`) to prevent `TypeError: Cannot read properties of null`.

---

## 3. Mandatory Post-Creation & Post-Edit Testing Protocol

Whenever you create a new tool or edit an existing tool, you **MUST** run the following verification pipeline before declaring the task complete:

```bash
# 1. Run the master tool verification suite (Static analysis + Chromium headless execution)
npm run test:tools

# 2. Run the complete test suite (Ad integrity, math accuracy, catalog check, tool health)
npm test

# 3. Synchronize registry, search index, category hubs, and sitemap
npm run sync

# 4. Verify CSS brace balance
node tools/verify-all.js
```

### What `npm run test:tools` Verifies:
1. **File Existence**: Verifies all active tools in `data/tools-registry.json` exist on disk.
2. **Missing Script Files**: Verifies all `<script src="...">` paths exist on disk.
3. **Engine Dependencies**: Verifies tools using `CalcCore`, `CalcCharts`, or `QRCode` load the required script files.
4. **Script Syntax**: Validates all inline ECMAScript syntax.
5. **DOM Parity**: Checks for missing element IDs that would cause null pointer exceptions.
6. **Live Chromium Headless Execution**:
   - Launches headless browser to load every active tool page.
   - Captures any runtime exceptions, unhandled rejections, or console errors.
   - Checks that output containers render real results (no `NaN`, no `undefined`, no `--`).
   - Simulates button clicks and input reactivity to ensure calculations update in real time.

---

## 4. Troubleshooting Guide

| Issue | Root Cause | Remedy |
| :--- | :--- | :--- |
| **Tool unresponsive on click** | Runtime exception halts script execution before listener binding. | Check browser console or run `npm run test:tools` to locate the exact unhandled exception. |
| **`ReferenceError: CalcCore is not defined`** | Missing `<script src="js/calc-core.js"></script>` in `<head>` or before inline `<script>`. | Add `calc-core.js` to the page scripts. |
| **`TypeError: CalcCharts.xxx is not a function`** | Calling an unexported or misspelled chart method. | Check `js/calc-charts.js` for valid method names (`drawDonut`, `drawDonutChart`, `drawBarChart`, `drawAreaChart`). |
| **Calculation yields `NaN` or wrong value** | Commas in input string or missing fallback. | Use `CalcCore.parseNumber(val)` instead of `parseFloat(val)`. |
| **`NotAllowedError: Document is not focused` on copy** | `navigator.clipboard.writeText` failed without `.catch()`. | Wrap clipboard promises with `.catch()` and fallback to `document.execCommand('copy')`. |
