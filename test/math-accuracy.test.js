/**
 * Automated Math Accuracy Tests (test/math-accuracy.test.js)
 * Validates financial, health, and math formula accuracy against benchmarks.
 */

const assert = require('assert');

console.log('=== Running Mathematical Accuracy Benchmarks ===\n');

// 1. Mortgage EMI Benchmark
function calculateMortgageEMI(principal, annualRatePct, years) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  const factor = Math.pow(1 + r, n);
  return principal * (r * factor) / (factor - 1);
}

const mortgagePrincipal = 320000;
const mortgageRate = 6.5;
const mortgageTerm = 30;
const emi = calculateMortgageEMI(mortgagePrincipal, mortgageRate, mortgageTerm);
console.log(`Mortgage $320k @ 6.5% 30yr: Monthly P&I = $${emi.toFixed(2)} (Benchmark: $2,022.64)`);
assert(Math.abs(emi - 2022.64) < 0.1, `Mortgage EMI deviation: ${emi}`);

// 2. Loan EMI Benchmark ($250k @ 6.5% 30yr)
const loanEMI = calculateMortgageEMI(250000, 6.5, 30);
console.log(`Loan $250k @ 6.5% 30yr: Monthly = $${loanEMI.toFixed(2)} (Benchmark: $1,580.17)`);
assert(Math.abs(loanEMI - 1580.17) < 0.1, `Loan EMI deviation: ${loanEMI}`);

// 3. Mifflin-St Jeor BMR & TDEE Benchmark
function calculateBMR(weightKg, heightCm, ageYears, isMale) {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);
  return isMale ? base + 5 : base - 161;
}

const weightKg = 175 / 2.20462; // ~79.38 kg
const heightCm = (5 * 12 + 10) * 2.54; // 177.8 cm
const bmr = calculateBMR(weightKg, heightCm, 28, true);
const tdee = bmr * 1.375;
console.log(`Calorie 28yo Male 175lbs 5ft10in: BMR = ${Math.round(bmr)} kcal, TDEE = ${Math.round(tdee)} kcal`);
assert(Math.round(bmr) >= 1760 && Math.round(bmr) <= 1770, `BMR out of range: ${bmr}`);
assert(Math.round(tdee) >= 2420 && Math.round(tdee) <= 2435, `TDEE out of range: ${tdee}`);

// 4. Compound Interest Benchmark
function calculateCompound(principal, monthly, annualRatePct, years, depositAtBeginning = false) {
  const r = annualRatePct / 100 / 12;
  let balance = principal;
  for (let m = 1; m <= years * 12; m++) {
    if (depositAtBeginning) {
      balance += monthly;
      balance += balance * r;
    } else {
      balance += balance * r;
      balance += monthly;
    }
  }
  return balance;
}

const compValueEnd = calculateCompound(10000, 500, 8, 20, false);
console.log(`Compound $10k + $500/mo @ 8% 20yr (end of month): Balance = $${Math.round(compValueEnd)} (Benchmark: ~$343,778)`);
assert(Math.abs(compValueEnd - 343778) < 50, `Compound value deviation: ${compValueEnd}`);

const compValueBeg = calculateCompound(10000, 500, 8, 20, true);
console.log(`Compound $10k + $500/mo @ 8% 20yr (beg of month): Balance = $${Math.round(compValueBeg)} (Benchmark: ~$345,742)`);
assert(Math.abs(compValueBeg - 345742) < 50, `Compound value deviation: ${compValueBeg}`);

// 5. Percentage Formulas
const pctVal = (15 / 100) * 80;
assert.strictEqual(pctVal, 12, '15% of 80 must be 12');

const pctChange = ((75 - 50) / 50) * 100;
assert.strictEqual(pctChange, 50, 'Percentage change 50 to 75 must be +50%');

// 6. Auto Loan Payment Benchmark ($30k principal, 60 mo @ 5.9% APR)
function calculateAutoPayment(principal, aprPct, termMonths) {
  const r = aprPct / 100 / 12;
  const factor = Math.pow(1 + r, termMonths);
  return principal * (r * factor) / (factor - 1);
}
const autoPmt = calculateAutoPayment(30000, 5.9, 60);
console.log(`Auto Loan $30k @ 5.9% 60mo: Monthly = $${autoPmt.toFixed(2)} (Benchmark: $578.58)`);
assert(Math.abs(autoPmt - 578.58) < 0.1, `Auto loan payment deviation: ${autoPmt}`);

// 7. Retirement Nest Egg & 4% Rule Benchmark ($25k start, $650/mo @ 7.5% for 35 yrs)
function calculateRetirementEgg(initial, monthly, annualRatePct, years) {
  const r = annualRatePct / 100 / 12;
  let balance = initial;
  for (let m = 1; m <= years * 12; m++) {
    balance += monthly;
    balance += balance * r;
  }
  return balance;
}
const retireEgg = calculateRetirementEgg(25000, 650, 7.5, 35);
console.log(`Retirement 35yr @ 7.5%: Balance = $${Math.round(retireEgg)} (Benchmark: ~$1,670,552)`);
assert(Math.abs(retireEgg - 1670552) < 50, `Retirement nest egg deviation: ${retireEgg}`);
const safe4Pct = (retireEgg * 0.04) / 12;
assert(safe4Pct > 5500 && safe4Pct < 5600, `Safe 4% withdrawal deviation: ${safe4Pct}`);

// 8. Inflation Purchasing Power & Rule of 72 Benchmark
function calculateInflationMetrics(amount, annualPct, years) {
  const r = annualPct / 100;
  const futureCost = amount * Math.pow(1 + r, years);
  const purchasingPower = amount / Math.pow(1 + r, years);
  const rule72 = 72 / (annualPct);
  return { futureCost, purchasingPower, rule72 };
}
const inf = calculateInflationMetrics(1000, 3.2, 10);
console.log(`Inflation $1,000 @ 3.2% 10yr: Future Cost = $${inf.futureCost.toFixed(2)}, Purchasing Power = $${inf.purchasingPower.toFixed(2)}, Rule of 72 = ${inf.rule72.toFixed(1)} yrs`);
assert(Math.abs(inf.futureCost - 1370.24) < 0.1, `Future cost deviation: ${inf.futureCost}`);
assert(Math.abs(inf.purchasingPower - 729.80) < 0.1, `Purchasing power deviation: ${inf.purchasingPower}`);
assert(Math.abs(inf.rule72 - 22.5) < 0.1, `Rule of 72 deviation: ${inf.rule72}`);

// 9. Salary Conversion & Overtime Benchmark
const hourly = 35;
const standardAnnual = hourly * 2080;
assert.strictEqual(standardAnnual, 72800, '40h x 52w @ $35/hr must be $72,800');
const otWeeklyHours = 5;
const otRate = hourly * 1.5;
const otAnnual = otRate * otWeeklyHours * 52;
assert.strictEqual(otAnnual, 13650, '5h/wk OT @ 1.5x must be $13,650/yr');
assert.strictEqual(standardAnnual + otAnnual, 86450, 'Total gross with OT must be $86,450');

// 10. Progressive Tax Brackets Benchmark ($75k Single, Standard Deduction $14,600)
function calculateSingleTax(gross, pretax, stdDeduction) {
  const taxable = Math.max(0, gross - pretax - stdDeduction);
  let tax = 0;
  // 10% on first $11,600
  if (taxable > 0) tax += Math.min(taxable, 11600) * 0.10;
  // 12% on $11,600 to $47,150
  if (taxable > 11600) tax += Math.min(taxable - 11600, 47150 - 11600) * 0.12;
  // 22% on $47,150 to $100,525
  if (taxable > 47150) tax += Math.min(taxable - 47150, 100525 - 47150) * 0.22;
  return tax;
}
const fedTaxTest = calculateSingleTax(75000, 3000, 14600); // Taxable = 57,400
// 11600 * 0.10 = 1160
// (47150 - 11600) * 0.12 = 35550 * 0.12 = 4266
// (57400 - 47150) * 0.22 = 10250 * 0.22 = 2255
// Total = 1160 + 4266 + 2255 = 7681
console.log(`Income Tax $75k Single ($3k pretax, $14.6k std deduction): Fed Tax = $${fedTaxTest.toFixed(2)}`);
assert(Math.abs(fedTaxTest - 7681) < 1, `Federal tax deviation: ${fedTaxTest}`);

// 11. US Navy Body Fat Benchmark
function calculateNavyBfMale(waistIn, neckIn, heightIn) {
  return 86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76;
}
function calculateNavyBfFemale(waistIn, hipIn, neckIn, heightIn) {
  return 163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(heightIn) - 78.387;
}
const navyMale = calculateNavyBfMale(32, 15.5, 70);
console.log(`US Navy BF Male (Waist 32, Neck 15.5, Height 70in): BF% = ${navyMale.toFixed(1)}%`);
assert(Math.abs(navyMale - 12.2) < 0.2, `Navy Male BF deviation: ${navyMale}`);

const navyFemale = calculateNavyBfFemale(27, 37, 13, 65);
console.log(`US Navy BF Female (Waist 27, Hip 37, Neck 13, Height 65in): BF% = ${navyFemale.toFixed(1)}%`);
assert(Math.abs(navyFemale - 23.2) < 0.2, `Navy Female BF deviation: ${navyFemale}`);

// 12. BMR Multi-Model Benchmark (Male 175 lbs, 5'10", 28yo, 15% BF)
const wtKg = 175 / 2.20462;
const htCm = (5 * 12 + 10) * 2.54;
const bmrMifflin = 10 * wtKg + 6.25 * htCm - 5 * 28 + 5;
const bmrHarris = 13.397 * wtKg + 4.799 * htCm - 5.677 * 28 + 88.362;
const lbm = wtKg * (1 - 0.15);
const bmrKatch = 370 + 21.6 * lbm;
console.log(`BMR Benchmarks: Mifflin = ${Math.round(bmrMifflin)}, Harris = ${Math.round(bmrHarris)}, Katch = ${Math.round(bmrKatch)}`);
assert.strictEqual(Math.round(bmrMifflin), 1770, 'Mifflin BMR must be 1,770');
assert.strictEqual(Math.round(bmrHarris), 1846, 'Harris-Benedict BMR must be 1,846');
assert.strictEqual(Math.round(bmrKatch), 1827, 'Katch-McArdle BMR must be 1,827');

// 13. Pregnancy Due Date Naegele's Rule Benchmark
function calculateDueDate(lmpDateStr, cycleLength = 28) {
  const d = new Date(lmpDateStr + 'T00:00:00');
  const cycleAdj = cycleLength - 28;
  d.setDate(d.getDate() + 280 + cycleAdj);
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
}
const eddStandard = calculateDueDate('2026-01-01', 28);
console.log(`Pregnancy Due Date (LMP 2026-01-01, 28-day cycle): EDD = ${eddStandard} (Expected: 2026-10-08)`);
assert.strictEqual(eddStandard, '2026-10-08', 'EDD for 2026-01-01 with 28d cycle must be 2026-10-08');

const eddLongCycle = calculateDueDate('2026-01-01', 32);
assert.strictEqual(eddLongCycle, '2026-10-12', 'EDD with 32d cycle must be +4 days (2026-10-12)');

// 14. Army AR 600-9 Body Fat & Compliance Benchmark
function evaluateArmySoldier(gender, age, bfRaw) {
  const officialBf = Math.floor(bfRaw); // Round down per AR 600-9
  let maxAllowable = 0;
  if (gender === 'male') {
    if (age <= 20) maxAllowable = 20;
    else if (age <= 27) maxAllowable = 22;
    else if (age <= 39) maxAllowable = 24;
    else maxAllowable = 26;
  }
  return { officialBf, maxAllowable, passed: officialBf <= maxAllowable };
}
const soldierPass = evaluateArmySoldier('male', 22, 19.9);
assert.strictEqual(soldierPass.officialBf, 19, '19.9% must round down to 19%');
assert.strictEqual(soldierPass.passed, true, '19% must pass 22% allowable limit for age 22');

const soldierFail = evaluateArmySoldier('male', 20, 21.2);
assert.strictEqual(soldierFail.officialBf, 21, '21.2% must round down to 21%');
assert.strictEqual(soldierFail.passed, false, '21% must fail 20% limit for age 20');

console.log('\n[PASS] All 14 Mathematical Accuracy Benchmarks Passed Perfectly!');
