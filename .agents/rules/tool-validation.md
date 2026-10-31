# Tool Testing & Verification Quality Rules

- **Zero Guesswork**: After creating or editing any tool in SabiTools, always execute `npm run test:tools` to verify static integrity and live browser runtime behavior.
- **Mandatory Dependencies**: Never call `CalcCore`, `CalcCharts`, or `QRCode` without including their respective script tags (`js/calc-core.js`, `js/calc-charts.js`, `js/vendor/qrcode.min.js`).
- **DOM & Event Safety**: Ensure all element IDs referenced in JS exist in HTML or are guarded against null references.
- **Verification Run**: Before reporting any tool task done, run `npm test` and `npm run sync`.
