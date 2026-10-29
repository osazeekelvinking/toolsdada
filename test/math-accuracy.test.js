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

console.log('\n[PASS] All 5 Mathematical Accuracy Benchmarks Passed Perfectly!');
