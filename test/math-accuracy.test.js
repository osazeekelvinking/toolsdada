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

// 15. Fraction Calculator Benchmark (Arithmetic, Simplification, Mixed Numbers)
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function solveFraction(n1, d1, op, n2, d2) {
  let resN = 0, resD = 1;
  if (op === '+') {
    resN = n1 * d2 + n2 * d1;
    resD = d1 * d2;
  } else if (op === '-') {
    resN = n1 * d2 - n2 * d1;
    resD = d1 * d2;
  } else if (op === '*') {
    resN = n1 * n2;
    resD = d1 * d2;
  } else if (op === '/') {
    resN = n1 * d2;
    resD = d1 * n2;
  }
  const g = gcd(resN, resD);
  const simpN = resN / g;
  const simpD = resD / g;
  const whole = Math.floor(Math.abs(simpN) / simpD) * (simpN < 0 ? -1 : 1);
  const remN = Math.abs(simpN) % simpD;
  return { num: simpN, den: simpD, whole, remNum: remN, decimal: simpN / simpD };
}

const fracAdd = solveFraction(1, 2, '+', 3, 4);
console.log(`Fraction Add: 1/2 + 3/4 = ${fracAdd.num}/${fracAdd.den} = ${fracAdd.whole} ${fracAdd.remNum}/${fracAdd.den} (Expected: 5/4 = 1 1/4)`);
assert.strictEqual(fracAdd.num, 5);
assert.strictEqual(fracAdd.den, 4);
assert.strictEqual(fracAdd.whole, 1);
assert.strictEqual(fracAdd.remNum, 1);

const fracDiv = solveFraction(5, 8, '/', 3, 16);
console.log(`Fraction Div: (5/8) / (3/16) = ${fracDiv.num}/${fracDiv.den} (Expected: 10/3)`);
assert.strictEqual(fracDiv.num, 10);
assert.strictEqual(fracDiv.den, 3);
assert.strictEqual(fracDiv.whole, 3);
assert.strictEqual(fracDiv.remNum, 1);

// 16. Triangle Solver Benchmark (SSS, Heron's Formula, Angles, Inradius & Circumradius)
function solveTriangleSSS(a, b, c) {
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  const perimeter = a + b + c;
  const alphaRad = Math.acos(Math.max(-1, Math.min(1, (b*b + c*c - a*a) / (2*b*c))));
  const betaRad = Math.acos(Math.max(-1, Math.min(1, (a*a + c*c - b*b) / (2*a*c))));
  const gammaRad = Math.acos(Math.max(-1, Math.min(1, (a*a + b*b - c*c) / (2*a*b))));
  const alpha = alphaRad * 180 / Math.PI;
  const beta = betaRad * 180 / Math.PI;
  const gamma = gammaRad * 180 / Math.PI;
  const inradius = area / s;
  const circumradius = (a * b * c) / (4 * area);
  return { area, perimeter, alpha, beta, gamma, inradius, circumradius };
}

const tri345 = solveTriangleSSS(3, 4, 5);
console.log(`Triangle 3-4-5: Area=${tri345.area}, Inradius=${tri345.inradius}, Circumradius=${tri345.circumradius}, Gamma=${tri345.gamma}°`);
assert.strictEqual(tri345.area, 6, 'Area of 3-4-5 triangle must be 6');
assert.strictEqual(tri345.perimeter, 12, 'Perimeter of 3-4-5 must be 12');
assert.strictEqual(tri345.inradius, 1, 'Inradius of 3-4-5 must be 1');
assert.strictEqual(tri345.circumradius, 2.5, 'Circumradius of 3-4-5 must be 2.5');
assert.strictEqual(Math.round(tri345.gamma), 90, 'Gamma angle must be 90°');
assert.strictEqual(tri345.alpha.toFixed(2), '36.87', 'Alpha must be 36.87°');
assert.strictEqual(tri345.beta.toFixed(2), '53.13', 'Beta must be 53.13°');

// 17. Right Triangle Benchmark (Pythagoras, Altitude, Trigonometric Ratios)
function solveRightTriangle(legA, legB) {
  const c = Math.sqrt(legA*legA + legB*legB);
  const area = 0.5 * legA * legB;
  const perimeter = legA + legB + c;
  const altitude = (legA * legB) / c;
  const sinA = legA / c;
  const cosA = legB / c;
  const tanA = legA / legB;
  return { c, area, perimeter, altitude, sinA, cosA, tanA };
}

const rt512 = solveRightTriangle(5, 12);
console.log(`Right Triangle (5, 12): Hypotenuse=${rt512.c}, Area=${rt512.area}, Altitude=${rt512.altitude.toFixed(3)}`);
assert.strictEqual(rt512.c, 13, 'Hypotenuse for 5-12 must be 13');
assert.strictEqual(rt512.area, 30, 'Area for 5-12 must be 30');
assert.strictEqual(rt512.perimeter, 30, 'Perimeter for 5-12-13 must be 30');
assert.strictEqual(rt512.altitude.toFixed(3), '4.615', 'Altitude to hypotenuse must be ~4.615');
assert.strictEqual(rt512.sinA.toFixed(4), (5/13).toFixed(4), 'sin(alpha) = 5/13');

// 18. Scientific Notation Benchmark (Arithmetic, Exponent Normalization, SI metric prefix)
function multiplyScientific(coeff1, exp1, coeff2, exp2) {
  let c = coeff1 * coeff2;
  let e = exp1 + exp2;
  while (Math.abs(c) >= 10) {
    c /= 10;
    e += 1;
  }
  while (Math.abs(c) < 1 && c !== 0) {
    c *= 10;
    e -= 1;
  }
  return { coeff: c, exp: e, value: c * Math.pow(10, e) };
}

const sciMult = multiplyScientific(3.0, 8, 2.0, 2);
console.log(`Scientific Mult: (3x10^8) * (2x10^2) = ${sciMult.coeff}x10^${sciMult.exp} (Expected: 6x10^10)`);
assert.strictEqual(sciMult.coeff, 6);
assert.strictEqual(sciMult.exp, 10);
assert.strictEqual(sciMult.value, 60000000000);

const sciNorm = multiplyScientific(5.0, 4, 4.0, 2); // 20 * 10^6 -> 2.0 * 10^7
assert.strictEqual(sciNorm.coeff, 2);
assert.strictEqual(sciNorm.exp, 7);

// 19. Date Calculator Benchmark (Days Between Dates, Business Days, Add Days)
function calculateDateDiff(d1Str, d2Str, includeEnd = false) {
  const p1 = d1Str.split('-').map(Number);
  const p2 = d2Str.split('-').map(Number);
  const d1 = new Date(p1[0], p1[1] - 1, p1[2]);
  const d2 = new Date(p2[0], p2[1] - 1, p2[2]);
  let totalDays = Math.round((d2.getTime() - d1.getTime()) / 86400000);
  if (includeEnd) totalDays += 1;

  let cur = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const limit = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  if (includeEnd) limit.setDate(limit.getDate() + 1);

  let bizCount = 0;
  let wkndCount = 0;
  while (cur < limit) {
    const day = cur.getDay();
    if (day === 0 || day === 6) wkndCount++;
    else bizCount++;
    cur.setDate(cur.getDate() + 1);
  }
  return { totalDays, bizCount, wkndCount };
}

const dateDiff2026 = calculateDateDiff('2026-01-01', '2026-12-31', false);
console.log(`Date Diff (2026-01-01 to 2026-12-31): ${dateDiff2026.totalDays} Days, ${dateDiff2026.bizCount} Business Days, ${dateDiff2026.wkndCount} Weekend Days`);
assert.strictEqual(dateDiff2026.totalDays, 364);
assert.strictEqual(dateDiff2026.bizCount + dateDiff2026.wkndCount, 364);

const jan2026 = calculateDateDiff('2026-01-01', '2026-01-31', true);
assert.strictEqual(jan2026.totalDays, 31);
assert.strictEqual(jan2026.bizCount, 22, 'Jan 2026 has 22 business days');
assert.strictEqual(jan2026.wkndCount, 9, 'Jan 2026 has 9 weekend days');

// 20. Time Calculator Benchmark (Time Arithmetic, Base-60 Normalization)
function calcTimeArithmetic(t1Sec, op, t2SecOrScalar) {
  let resSec = 0;
  if (op === '+') resSec = t1Sec + t2SecOrScalar;
  else if (op === '-') resSec = t1Sec - t2SecOrScalar;
  else if (op === '*') resSec = Math.round(t1Sec * t2SecOrScalar);
  else if (op === '/') resSec = Math.round(t1Sec / t2SecOrScalar);

  const days = Math.floor(resSec / 86400);
  const remDays = resSec % 86400;
  const hours = Math.floor(remDays / 3600);
  const remHours = remDays % 3600;
  const minutes = Math.floor(remHours / 60);
  const seconds = remHours % 60;
  const decimalHours = resSec / 3600;
  return { resSec, days, hours, minutes, seconds, decimalHours };
}

const t1Sec = (4 * 3600) + (45 * 60) + 30; // 4h 45m 30s = 17,130s
const t2Sec = (2 * 3600) + (30 * 60) + 15; // 2h 30m 15s = 9,015s
const timeAdd = calcTimeArithmetic(t1Sec, '+', t2Sec);
console.log(`Time Add (4h45m30s + 2h30m15s): ${timeAdd.hours}h ${timeAdd.minutes}m ${timeAdd.seconds}s, Total=${timeAdd.resSec}s`);
assert.strictEqual(timeAdd.resSec, 26145);
assert.strictEqual(timeAdd.hours, 7);
assert.strictEqual(timeAdd.minutes, 15);
assert.strictEqual(timeAdd.seconds, 45);
assert.strictEqual(timeAdd.decimalHours, 7.2625);

const timeMult = calcTimeArithmetic((1 * 3600) + (30 * 60), '*', 3); // 1.5h * 3 = 4.5h
assert.strictEqual(timeMult.hours, 4);
assert.strictEqual(timeMult.minutes, 30);
assert.strictEqual(timeMult.resSec, 16200);

// 21. GPA Calculator Benchmark (Standard 4.0 Scale, Honors & AP Weighting, Cumulative GPA)
function calcGPA(courses, priorGpa = null, priorCredits = 0) {
  const pointsMap = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
  let totalCredits = 0;
  let unweightedPoints = 0;
  let weightedPoints = 0;

  courses.forEach(c => {
    const base = pointsMap[c.grade] || 0;
    let add = 0;
    if (c.type === 'honors') add = 0.5;
    else if (c.type === 'ap') add = 1.0;
    const wt = c.grade !== 'F' ? (base + add) : 0;

    totalCredits += c.credits;
    unweightedPoints += (base * c.credits);
    weightedPoints += (wt * c.credits);
  });

  const unweightedGPA = totalCredits > 0 ? (unweightedPoints / totalCredits) : 0;
  const weightedGPA = totalCredits > 0 ? (weightedPoints / totalCredits) : 0;

  let cumulativeGPA = unweightedGPA;
  if (priorGpa !== null && priorCredits > 0) {
    cumulativeGPA = (priorGpa * priorCredits + unweightedPoints) / (priorCredits + totalCredits);
  }
  return { unweightedGPA, weightedGPA, cumulativeGPA, totalCredits, unweightedPoints };
}

const semCourses = [
  { grade: 'A', credits: 4, type: 'regular' },
  { grade: 'A-', credits: 4, type: 'ap' },
  { grade: 'B+', credits: 3, type: 'regular' },
  { grade: 'A', credits: 4, type: 'regular' }
];
const gpaResult = calcGPA(semCourses, 3.50, 45);
console.log(`GPA Result: Unweighted=${gpaResult.unweightedGPA.toFixed(2)}, Weighted=${gpaResult.weightedGPA.toFixed(2)}, Cumulative=${gpaResult.cumulativeGPA.toFixed(2)}`);
assert.strictEqual(gpaResult.unweightedGPA.toFixed(2), '3.78');
assert.strictEqual(gpaResult.weightedGPA.toFixed(2), '4.05');
assert.strictEqual(gpaResult.cumulativeGPA.toFixed(2), '3.57');

// 22. Time Card Benchmark (Weekly 40h Overtime, Daily 8h Overtime, Gross Pay)
function calcTimesheet(dailyMinutes, hourlyWage, otMultiplier = 1.5, rule = 'weekly40') {
  let totalHours = 0;
  let regHours = 0;
  let otHours = 0;

  dailyMinutes.forEach(mins => {
    const hrs = mins / 60;
    totalHours += hrs;
    if (rule === 'daily8') {
      if (hrs > 8) {
        regHours += 8;
        otHours += (hrs - 8);
      } else {
        regHours += hrs;
      }
    }
  });

  if (rule === 'weekly40') {
    if (totalHours > 40) {
      regHours = 40;
      otHours = totalHours - 40;
    } else {
      regHours = totalHours;
      otHours = 0;
    }
  }

  const regPay = regHours * hourlyWage;
  const otPay = otHours * (hourlyWage * otMultiplier);
  const grossPay = regPay + otPay;
  return { totalHours, regHours, otHours, regPay, otPay, grossPay };
}

// 5 days of 8 hours (9:00 - 17:30 with 30m lunch = 8h)
const standardWeek = calcTimesheet([480, 480, 480, 480, 480, 0, 0], 25.0);
console.log(`Timecard Standard 40h @ $25/hr: Gross = $${standardWeek.grossPay.toFixed(2)}`);
assert.strictEqual(standardWeek.totalHours, 40);
assert.strictEqual(standardWeek.regHours, 40);
assert.strictEqual(standardWeek.otHours, 0);
assert.strictEqual(standardWeek.grossPay, 1000.0);

// Overtime week: 48 hours total (8 hours on Saturday)
const otWeek = calcTimesheet([480, 480, 480, 480, 480, 480, 0], 25.0, 1.5, 'weekly40');
console.log(`Timecard Overtime 48h @ $25/hr: Reg=$${otWeek.regPay}, OT=$${otWeek.otPay}, Gross=$${otWeek.grossPay}`);
assert.strictEqual(otWeek.totalHours, 48);
assert.strictEqual(otWeek.regHours, 40);
assert.strictEqual(otWeek.otHours, 8);
assert.strictEqual(otWeek.regPay, 1000.0);
assert.strictEqual(otWeek.otPay, 300.0);
assert.strictEqual(otWeek.grossPay, 1300.0);

// 23. Time Zone Converter Benchmark (UTC Offset Differences)
function convertTimeZone(dateStr, timeStr, srcTz, trgTz) {
  const approximateDate = new Date(`${dateStr}T${timeStr}:00Z`);
  const srcFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: srcTz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  let actualInstant = approximateDate;
  for (let iter = 0; iter < 3; iter++) {
    const parts = srcFmt.formatToParts(actualInstant);
    const p = {};
    parts.forEach(part => { p[part.type] = part.value; });
    const renderedInSrc = new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour === '24' ? 0 : p.hour, p.minute, p.second));
    const diff = approximateDate.getTime() - renderedInSrc.getTime();
    if (Math.abs(diff) < 1000) break;
    actualInstant = new Date(actualInstant.getTime() + diff);
  }

  const trgFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: trgTz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return trgFmt.format(actualInstant);
}

const nyToLondon = convertTimeZone('2026-10-15', '14:00', 'America/New_York', 'Europe/London');
console.log(`Time Zone (2026-10-15 14:00 NY to London): ${nyToLondon} (Expected: 19:00, +5h)`);
assert.strictEqual(nyToLondon, '19:00', '14:00 NY (EDT UTC-4) in London (BST UTC+1) must be 19:00 (+5h)');

// 24. Time Duration Benchmark (Elapsed Seconds, Decimal Hours, Day Percentage)
function calcDuration(startTime, endTime, overnight = false) {
  const parseSec = (t) => {
    const p = t.split(':').map(Number);
    return p[0] * 3600 + p[1] * 60 + (p[2] || 0);
  };
  const sSec = parseSec(startTime);
  let eSec = parseSec(endTime);
  if (eSec < sSec || overnight) eSec += 86400;

  const totalSec = eSec - sSec;
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const decimalHours = totalSec / 3600;
  const totalMinutes = totalSec / 60;
  const pctDay = (Math.min(totalSec, 86400) / 86400) * 100;

  return { totalSec, hours, minutes, seconds, decimalHours, totalMinutes, pctDay };
}

const durStandard = calcDuration('08:30:00', '17:00:00');
console.log(`Duration 08:30 to 17:00: ${durStandard.hours}h ${durStandard.minutes}m (${durStandard.decimalHours} hrs, ${durStandard.pctDay.toFixed(2)}% of day)`);
assert.strictEqual(durStandard.totalSec, 30600);
assert.strictEqual(durStandard.hours, 8);
assert.strictEqual(durStandard.minutes, 30);
assert.strictEqual(durStandard.decimalHours, 8.5);
assert.strictEqual(durStandard.totalMinutes, 510);
assert.strictEqual(durStandard.pctDay.toFixed(2), '35.42');

const durOvernight = calcDuration('22:00:00', '06:30:00');
assert.strictEqual(durOvernight.hours, 8);
assert.strictEqual(durOvernight.minutes, 30);
assert.strictEqual(durOvernight.decimalHours, 8.5);

console.log('\n[PASS] All 24 Mathematical Accuracy Benchmarks Passed Perfectly!');
