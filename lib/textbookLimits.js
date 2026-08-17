// Same fixed problem set as before (numbered 15–34 as in the textbook),
// but each problem now shows the actual screenshot image the user
// provided (in /public/limits/<id>.png) instead of a retyped expression.

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// type: "number"   -> compare against `value` with a small tolerance
//       "inf" | "neg-inf" | "dne" -> compare against accepted text forms
//       "symbolic" -> compare against a small set of accepted text forms
//                     (used only for #29, whose image shows literal a, b)
const PROBLEMS = [
  { id: 15, type: "number", value: 1.5, answerDisplay: "3/2", rule: "ดีกรีเท่ากัน หารด้วย x กำลังสูงสุดเหลืออัตราส่วนสัมประสิทธิ์นำหน้า: 3/2" },
  { id: 16, type: "number", value: 0, answerDisplay: "0", rule: "ดีกรีตัวส่วน (3) มากกว่าดีกรีตัวเศษ (2) → ลิมิตเป็น 0" },
  { id: 17, type: "number", value: 0, answerDisplay: "0", rule: "ดีกรีตัวส่วน (2) มากกว่าดีกรีตัวเศษ (1) → ลิมิตเป็น 0" },
  { id: 18, type: "number", value: 2, answerDisplay: "2", rule: "ดีกรีเท่ากัน (3) → อัตราส่วนสัมประสิทธิ์นำหน้า 4/2 = 2" },
  { id: 19, type: "number", value: -1, answerDisplay: "-1", rule: "พจน์ t² ครอบงำทั้งเศษและส่วน → t²/(-t²) = -1" },
  { id: 20, type: "number", value: -0.5, answerDisplay: "-1/2", rule: "พจน์ t^(3/2) ครอบงำทั้งเศษและส่วน → -t^(3/2) / (2t^(3/2)) = -1/2" },
  { id: 21, type: "number", value: 4, answerDisplay: "4", rule: "เศษ ~ 4x⁴, ส่วน ~ x⁴ → ลิมิตเป็น 4" },
  { id: 22, type: "number", value: 1, answerDisplay: "1", rule: "√(x⁴+1) ~ x² เมื่อ x โตมาก → ลิมิตเป็น 1" },
  { id: 23, type: "number", value: -2, answerDisplay: "-2", rule: "√(1+4x⁶) ~ 2x³ (เพราะ x > 0) → 2x³ / (-x³) = -2" },
  { id: 24, type: "number", value: -2, answerDisplay: "-2", rule: "√(1+4x⁶) ~ 2x³ (เพราะ x > 0) → 2x³ / (-x³) = -2" },
  { id: 25, type: "number", value: Math.sqrt(3) / 4, answerDisplay: "√3 / 4 ≈ 0.43", rule: "√(x+3x²) ~ x√3 → x√3 / 4x = √3/4 ≈ 0.43" },
  { id: 26, type: "inf", answerDisplay: "∞", rule: "ดีกรีเศษ (2) มากกว่าดีกรีส่วน (1) สัมประสิทธิ์นำหน้าบวก → ลิมิตเป็น ∞" },
  { id: 27, type: "number", value: 1 / 6, answerDisplay: "1/6 ≈ 0.17", rule: "คูณด้วยสังยุค: x / (√(9x²+x) + 3x) → x/6x = 1/6" },
  { id: 28, type: "inf", answerDisplay: "∞", rule: "ทั้งสองพจน์โตไม่จำกัดเมื่อ x→∞ → ลิมิตเป็น ∞" },
  {
    id: 29,
    type: "symbolic",
    answerDisplay: "(a - b) / 2",
    accepted: ["(a-b)/2", "a/2-b/2", "0.5(a-b)", "0.5*(a-b)", "(a-b)*0.5"],
    rule: "คูณด้วยสังยุค: (a-b)x / (√(x²+ax)+√(x²+bx)) → (a-b)/2",
  },
  { id: 30, type: "inf", answerDisplay: "∞", rule: "√(x²+1) โตไม่จำกัดเมื่อ x→∞ → ลิมิตเป็น ∞" },
  { id: 31, type: "inf", answerDisplay: "∞", rule: "ดีกรีเศษ (4) มากกว่าดีกรีส่วน (3) สัมประสิทธิ์นำหน้าบวก → ลิมิตเป็น ∞" },
  { id: 32, type: "dne", answerDisplay: "ไม่มีค่า (DNE)", rule: "e^(-x) → 0 แต่ 2cos(3x) แกว่งไปมาตลอด ไม่เข้าใกล้ค่าเดียว → ลิมิตไม่มีค่า" },
  { id: 33, type: "neg-inf", answerDisplay: "-∞", rule: "พจน์ 2x⁷ ครอบงำ และ x→-∞ ทำให้ x⁷→-∞ → ลิมิตเป็น -∞" },
  { id: 34, type: "inf", answerDisplay: "∞", rule: "ดีกรีเศษ (6) มากกว่าดีกรีส่วน (4) และ x⁶ เป็นบวกเสมอ → ลิมิตเป็น ∞" },
].map((p) => ({ ...p, image: `/limits/${p.id}.png` }));

export function generateTextbookPuzzle() {
  return pick(PROBLEMS);
}

const INF_WORDS = ["inf", "+inf", "infinity", "+infinity", "\u221e", "+\u221e"];
const NEG_INF_WORDS = ["-inf", "-infinity", "-\u221e"];
const DNE_WORDS = ["dne", "ไม่มีค่า", "ไม่มี", "noexist", "notexist", "nolimit"];

export function checkTextbookAnswer(puzzle, raw) {
  const norm = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (norm === "") return false;

  if (puzzle.type === "inf") return INF_WORDS.includes(norm);
  if (puzzle.type === "neg-inf") return NEG_INF_WORDS.includes(norm);
  if (puzzle.type === "dne") return DNE_WORDS.includes(norm);
  if (puzzle.type === "symbolic") {
    return (puzzle.accepted || []).map((s) => s.replace(/\s+/g, "").toLowerCase()).includes(norm);
  }

  const val = Number(norm);
  if (Number.isNaN(val)) return false;
  return Math.abs(val - puzzle.value) < 0.02;
}
