// Generates simple calculus puzzles. To keep answers a single number
// (matching the existing answer box), derivatives are asked at one point
// and integrals are asked over a small definite interval — never as a
// symbolic expression.

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nonZero(min, max) {
  let n;
  do {
    n = randInt(min, max);
  } while (n === 0);
  return n;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

const SUPERSCRIPT = ["", "", "\u00b2", "\u00b3"];

// coeffs is low-to-high: coeffs[0] = constant, coeffs[1] = x, coeffs[2] = x², ...
function polyToString(coeffs) {
  const parts = [];
  for (let p = coeffs.length - 1; p >= 0; p--) {
    const c = coeffs[p];
    if (!c) continue;
    const abs = Math.abs(c);
    let text;
    if (p === 0) {
      text = String(abs);
    } else {
      const varPart = p === 1 ? "x" : `x${SUPERSCRIPT[p] || `^${p}`}`;
      text = abs === 1 ? varPart : `${abs}${varPart}`;
    }
    parts.push({ neg: c < 0, text });
  }
  if (parts.length === 0) return "0";
  let out = (parts[0].neg ? "-" : "") + parts[0].text;
  for (let i = 1; i < parts.length; i++) {
    out += parts[i].neg ? ` - ${parts[i].text}` : ` + ${parts[i].text}`;
  }
  return out;
}

function evalPoly(coeffs, x) {
  return coeffs.reduce((sum, c, p) => sum + c * Math.pow(x, p), 0);
}

function derivativeCoeffs(coeffs) {
  return coeffs.slice(1).map((c, i) => c * (i + 1));
}

function derivativeAtPoint(degree) {
  const coeffs = [];
  for (let p = 0; p <= degree; p++) {
    coeffs.push(p === degree ? nonZero(-5, 5) : randInt(-5, 5));
  }
  const deriv = derivativeCoeffs(coeffs);
  const x0 = randInt(-3, 3);
  const answer = evalPoly(deriv, x0);
  return {
    display: `f(x) = ${polyToString(coeffs)}\nf'(${x0}) = ?`,
    answer,
    rule: `f'(x) = ${polyToString(deriv)} แทน x = ${x0} ได้ ${answer}`,
  };
}

function definiteIntegral(degree) {
  let coeffs;
  if (degree >= 2) {
    // x² coefficient must be a multiple of 3 so /3 stays exact
    coeffs = [randInt(-4, 4), randInt(-4, 4), 3 * nonZero(-2, 2)];
  } else {
    coeffs = [randInt(-4, 4), nonZero(-4, 4)];
  }
  const k = randInt(1, 3);
  let answer = 0;
  for (let p = 0; p < coeffs.length; p++) {
    answer += (coeffs[p] * Math.pow(k, p + 1)) / (p + 1);
  }
  return {
    display: `f(x) = ${polyToString(coeffs)}\n\u222b\u2080^${k} f(x) dx = ?`,
    answer,
    rule: `หาปฏิยานุพันธ์ของ f(x) แล้วแทนค่าตั้งแต่ 0 ถึง ${k}`,
  };
}

function limitAtInfinity() {
  const goesToZero = Math.random() < 0.5;

  if (goesToZero) {
    // numerator degree 1, denominator degree 2 -> limit is 0
    const numCoeffs = [randInt(-5, 5), nonZero(-5, 5)];
    const denCoeffs = [randInt(-5, 5), randInt(-5, 5), nonZero(-5, 5)];
    return {
      display: `lim (x\u2192\u221e) (${polyToString(numCoeffs)}) / (${polyToString(denCoeffs)}) = ?`,
      answer: 0,
      rule: "ดีกรีตัวส่วนสูงกว่าตัวเศษ ลิมิตจึงเข้าใกล้ 0",
    };
  }

  // same degree (both linear) -> limit is the ratio of leading coefficients
  const c = pick([1, -1, 2, -2, 3, -3]);
  const mult = nonZero(-3, 3);
  const a = c * mult;
  const b = randInt(-5, 5);
  const d = randInt(-5, 5);
  const numCoeffs = [b, a];
  const denCoeffs = [d, c];
  return {
    display: `lim (x\u2192\u221e) (${polyToString(numCoeffs)}) / (${polyToString(denCoeffs)}) = ?`,
    answer: mult,
    rule: `ดีกรีเท่ากัน ลิมิตคืออัตราส่วนสัมประสิทธิ์นำหน้า: ${a}/${c} = ${mult}`,
  };
}

const CALC_GENERATORS = {
  easy: [() => derivativeAtPoint(2)],
  medium: [() => derivativeAtPoint(3), () => definiteIntegral(1), () => limitAtInfinity()],
  hard: [() => definiteIntegral(2), () => limitAtInfinity(), () => derivativeAtPoint(3)],
};

export function generateCalcPuzzle(difficulty = "easy") {
  const pool = CALC_GENERATORS[difficulty] || CALC_GENERATORS.easy;
  const gen = pick(pool);
  return gen();
}
