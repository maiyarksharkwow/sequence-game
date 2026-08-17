// Generates a number-sequence puzzle: the visible terms, the hidden answer,
// and the "working out" (the operation between each pair of terms) used
// for hints and for the after-answer explanation.

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

const VISIBLE = 3; // terms shown before the blank

function pack(full, work, rule) {
  return {
    terms: full.slice(0, VISIBLE),
    answer: full[VISIBLE],
    // work[i] is the operation from terms[i] to terms[i + 1] for
    // i < VISIBLE - 1, and the operation from the last visible term
    // into the (hidden) answer for i === VISIBLE - 1.
    work: work.slice(0, VISIBLE),
    rule,
  };
}

function arithmetic() {
  const start = randInt(-8, 20);
  const d = pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8]);
  const full = Array.from({ length: VISIBLE + 1 }, (_, i) => start + d * i);
  const op = d > 0 ? `+${d}` : `${d}`;
  const work = Array(VISIBLE).fill(op);
  return pack(full, work, `บวกทีละ ${d} ในแต่ละขั้น`);
}

function geometric() {
  const r = pick([2, 3, 2, 3, -2]);
  const start = randInt(1, 5);
  const full = Array.from({ length: VISIBLE + 1 }, (_, i) => start * Math.pow(r, i));
  const work = Array(VISIBLE).fill(`\u00d7${r}`);
  return pack(full, work, `คูณด้วย ${r} ในแต่ละขั้น`);
}

function fibonacciLike() {
  const a0 = randInt(1, 6);
  const b0 = randInt(1, 7);
  const full = [a0, b0];
  const work = ["sum"];
  while (full.length < VISIBLE + 1) {
    full.push(full[full.length - 1] + full[full.length - 2]);
    work.push("sum");
  }
  return pack(full, work, "แต่ละตัวคือผลบวกของสองตัวก่อนหน้า");
}

function squares() {
  const start = randInt(1, 6);
  const full = Array.from({ length: VISIBLE + 1 }, (_, i) => (start + i) * (start + i));
  const work = Array.from({ length: VISIBLE }, (_, i) => `n=${start + i + 1}`);
  return pack(full, work, "นี่คือเลขยกกำลังสองที่เรียงติดกัน");
}

function cubes() {
  const start = randInt(1, 4);
  const full = Array.from({ length: VISIBLE + 1 }, (_, i) => Math.pow(start + i, 3));
  const work = Array.from({ length: VISIBLE }, (_, i) => `n=${start + i + 1}`);
  return pack(full, work, "นี่คือเลขยกกำลังสามที่เรียงติดกัน");
}

function powersOfTwo() {
  const startExp = randInt(0, 2);
  const full = Array.from({ length: VISIBLE + 1 }, (_, i) => Math.pow(2, startExp + i));
  const work = Array(VISIBLE).fill("\u00d72");
  return pack(full, work, "เลขยกกำลังของ 2 — เพิ่มเป็นสองเท่าในแต่ละขั้น");
}

function triangular() {
  const start = randInt(1, 5);
  const full = Array.from({ length: VISIBLE + 1 }, (_, i) => {
    const n = start + i;
    return (n * (n + 1)) / 2;
  });
  const work = Array.from({ length: VISIBLE }, (_, i) => `+${start + i + 1}`);
  return pack(full, work, "เลขสามเหลี่ยม — แต่ละขั้นบวกมากกว่าขั้นก่อนหน้าอยู่ 1");
}

function alternating() {
  const d1 = pick([2, 3, 4, 5, -2, -3]);
  const d2 = pick([2, 3, 4, 5, -2, -3, 6, 7]);
  let cur = randInt(-5, 15);
  const full = [cur];
  const work = [];
  for (let i = 0; i < VISIBLE; i++) {
    const d = i % 2 === 0 ? d1 : d2;
    cur += d;
    full.push(cur);
    work.push(d > 0 ? `+${d}` : `${d}`);
  }
  return pack(full, work, `สลับกันสองขั้น: ${d1 > 0 ? "+" : ""}${d1} แล้ว ${d2 > 0 ? "+" : ""}${d2} วนซ้ำ`);
}

function quadratic() {
  const start = randInt(-3, 10);
  let d = randInt(1, 4);
  const c = randInt(1, 3); // the step itself grows by this much each time
  let cur = start;
  const full = [cur];
  const work = [];
  for (let i = 0; i < VISIBLE; i++) {
    cur += d;
    full.push(cur);
    work.push(d > 0 ? `+${d}` : `${d}`);
    d += c;
  }
  return pack(full, work, `ขนาดของแต่ละขั้นเพิ่มขึ้นทีละ ${c} ทุกครั้ง`);
}

const PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149,
];

function primeSequence() {
  const startIdx = randInt(0, PRIMES.length - (VISIBLE + 1) - 1);
  const full = PRIMES.slice(startIdx, startIdx + VISIBLE + 1);
  const work = Array(VISIBLE).fill("prime ถัดไป");
  return pack(full, work, "เรียงตามลำดับจำนวนเฉพาะ (prime) ที่ถัดกัน");
}

const FACTORIALS = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880];

function factorialSeq() {
  const startIdx = randInt(0, FACTORIALS.length - (VISIBLE + 1) - 1);
  const full = FACTORIALS.slice(startIdx, startIdx + VISIBLE + 1);
  const work = Array(VISIBLE).fill("×(n+1)");
  return pack(full, work, "แฟกทอเรียล — แต่ละพจน์คูณด้วยจำนวนถัดไป");
}

function linearRecurrence() {
  const m = pick([2, 3]);
  let d;
  let start;
  do {
    d = randInt(-5, 5);
    start = randInt(1, 5);
  } while (start * m + d === start); // avoid a degenerate constant sequence
  const full = [start];
  for (let i = 0; i < VISIBLE; i++) {
    full.push(full[full.length - 1] * m + d);
  }
  const dText = d === 0 ? "" : d > 0 ? ` +${d}` : ` ${d}`;
  const work = Array(VISIBLE).fill(`×${m}${dText}`);
  return pack(full, work, `แต่ละพจน์ = พจน์ก่อนหน้า × ${m}${dText}`);
}

function sumOfSquares() {
  const startN = randInt(1, 4);
  const full = Array.from({ length: VISIBLE + 1 }, (_, i) => {
    const n = startN + i;
    return (n * (n + 1) * (2 * n + 1)) / 6;
  });
  const work = Array.from({ length: VISIBLE }, (_, i) => `n=${startN + i + 1}`);
  return pack(full, work, "ผลรวมของกำลังสองตั้งแต่ 1² ถึง n² (1² + 2² + ... + n²)");
}

function altGeometric() {
  const r1 = pick([2, 3]);
  const r2 = pick([2, 3, 4].filter((r) => r !== r1));
  const start = randInt(1, 3);
  const full = [start];
  const work = [];
  for (let i = 0; i < VISIBLE; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    full.push(full[full.length - 1] * r);
    work.push(`×${r}`);
  }
  return pack(full, work, `สลับคูณสองค่า: ×${r1} แล้ว ×${r2} สลับกันไปเรื่อยๆ`);
}

const GENERATORS = {
  easy: [arithmetic, powersOfTwo, triangular, primeSequence],
  medium: [arithmetic, geometric, fibonacciLike, squares, alternating, linearRecurrence, primeSequence],
  hard: [geometric, cubes, quadratic, fibonacciLike, alternating, factorialSeq, sumOfSquares, altGeometric],
};

export const DIFFICULTIES = ["easy", "medium", "hard"];

export function generatePuzzle(difficulty = "easy") {
  const pool = GENERATORS[difficulty] || GENERATORS.easy;
  const gen = pick(pool);
  return gen();
}
