"use client";

import { useEffect, useState } from "react";
import { generatePuzzle, DIFFICULTIES } from "../lib/sequences";
import { generateCalcPuzzle } from "../lib/calculus";
import { generateTextbookPuzzle, checkTextbookAnswer } from "../lib/textbookLimits";
import { loadLeaderboard, saveResult } from "../lib/leaderboard";

const BASE_POINTS = { easy: 10, medium: 20, hard: 35 };
const TEXTBOOK_POINTS = 25;
const TIME_LIMITS = [30, 60, 120];
const DIFFICULTY_LABELS = { easy: "ง่าย", medium: "ปานกลาง", hard: "ยาก" };
const SUBJECTS = ["sequence", "calculus", "textbook"];
const SUBJECT_LABELS = { sequence: "ลำดับเลข", calculus: "แคลคูลัส", textbook: "ลิมิตอนันต์" };
const THEME_KEY = "sequence-game-theme";

function generateAnyPuzzle(subject, difficulty) {
  if (subject === "textbook") return generateTextbookPuzzle();
  if (subject === "calculus") return generateCalcPuzzle(difficulty);
  return generatePuzzle(difficulty);
}

function loadTheme() {
  if (typeof window === "undefined") return "light";
  try {
    return window.localStorage.getItem(THEME_KEY) || "light";
  } catch {
    return "light";
  }
}

export default function SequenceGame() {
  // "home" -> หน้าแรก
  // "name" / "subject" / "difficulty" / "time" -> ตั้งค่าทีละหน้า
  // "playing" -> กำลังแข่งแบบจับเวลา
  // "ended" -> สรุปผล + ตารางคะแนน
  const [phase, setPhase] = useState("home");
  const [theme, setTheme] = useState(loadTheme);

  const [playerName, setPlayerName] = useState("");
  const [subject, setSubject] = useState("sequence");
  const [difficulty, setDifficulty] = useState("easy");
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);

  const [puzzle, setPuzzle] = useState(() => generatePuzzle("easy"));
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | correct | wrong

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [puzzleNumber, setPuzzleNumber] = useState(1);

  const [leaderboard, setLeaderboard] = useState(() => loadLeaderboard());

  function toggleTheme() {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        // ignore — theme just won't persist
      }
      return next;
    });
  }

  // นับเวลาถอยหลัง เฉพาะตอนกำลังเล่น
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // พอเวลาหมด จบแมทช์ทันที
  useEffect(() => {
    if (phase === "playing" && timeLeft <= 0) {
      const entry = {
        name: playerName.trim() || "ผู้เล่น",
        correct: correctCount,
        wrong: wrongCount,
        subject,
        difficulty,
        timeLimit,
        date: Date.now(),
      };
      const updated = saveResult(entry);
      setLeaderboard(updated);
      setPhase("ended");
    }
  }, [timeLeft, phase, playerName, correctCount, wrongCount, subject, difficulty, timeLimit]);

  // เลื่อนไปข้อถัดไปอัตโนมัติหลังเห็นผลลัพธ์สักครู่ เพื่อให้เล่นต่อเนื่องในเวลาที่จำกัด
  useEffect(() => {
    if (phase !== "playing" || status === "idle") return;
    const delay = status === "correct" ? 700 : 1100;
    const t = setTimeout(() => {
      setPuzzle(generateAnyPuzzle(subject, difficulty));
      setInput("");
      setStatus("idle");
      setPuzzleNumber((n) => n + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [status, phase, subject, difficulty]);

  function handleStart() {
    if (playerName.trim() === "") return;
    setPuzzle(generateAnyPuzzle(subject, difficulty));
    setInput("");
    setStatus("idle");
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setPuzzleNumber(1);
    setTimeLeft(timeLimit);
    setPhase("playing");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (phase !== "playing" || status !== "idle" || input.trim() === "") return;

    const isCorrect =
      subject === "textbook" ? checkTextbookAnswer(puzzle, input) : Number(input) === puzzle.answer;

    if (isCorrect) {
      const base = subject === "textbook" ? TEXTBOOK_POINTS : BASE_POINTS[difficulty];
      const bonus = Math.min(streak, 8) * 5;
      setScore((s) => s + base + bonus);
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setStatus("correct");
    } else {
      setWrongCount((c) => c + 1);
      setStreak(0);
      setStatus("wrong");
    }
  }

  const themeToggle = (
    <button type="button" className="theme-toggle" onClick={toggleTheme}>
      {theme === "dark" ? "\u2600\ufe0f โหมดสว่าง" : "\ud83c\udf19 โหมดมืด"}
    </button>
  );

  let content;

  if (phase === "home") {
    content = (
      <div className="wrap">
        <div className="topbar">{themeToggle}</div>
        <h1 className="brand">จับลำดับเลข</h1>
        <p className="tagline">จับรูปแบบให้ได้ แล้วเติมตัวเลขที่หายไป</p>

        <div className="card home-card">
          <button type="button" className="primary start-btn" onClick={() => setPhase("name")}>
            เริ่มเล่น
          </button>
        </div>

        {leaderboard.length > 0 && <Leaderboard entries={leaderboard} />}
      </div>
    );
  } else if (phase === "name") {
    content = (
      <div className="wrap">
        <div className="topbar">{themeToggle}</div>
        <h1 className="brand">จับลำดับเลข</h1>

        <div className="card setup-card">
          <p className="eyebrow">ขั้นที่ 1: ชื่อผู้เล่น</p>
          <label className="field-label" htmlFor="player-name">
            ชื่อของคุณ
          </label>
          <input
            id="player-name"
            className="text-input"
            type="text"
            placeholder="กรอกชื่อของคุณ"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={24}
            autoFocus
          />
          <div className="step-nav">
            <button type="button" className="secondary" onClick={() => setPhase("home")}>
              ย้อนกลับ
            </button>
            <button
              type="button"
              className="primary"
              disabled={playerName.trim() === ""}
              onClick={() => setPhase("subject")}
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    );
  } else if (phase === "subject") {
    content = (
      <div className="wrap">
        <div className="topbar">{themeToggle}</div>
        <h1 className="brand">จับลำดับเลข</h1>

        <div className="card setup-card">
          <p className="eyebrow">ขั้นที่ 2: เลือกโหมด</p>
          <div className="tabs tabs-vertical">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                type="button"
                className={`tab ${s === subject ? "active" : ""}`}
                onClick={() => setSubject(s)}
              >
                {SUBJECT_LABELS[s]}
              </button>
            ))}
          </div>
          <div className="step-nav">
            <button type="button" className="secondary" onClick={() => setPhase("name")}>
              ย้อนกลับ
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => setPhase(subject === "textbook" ? "time" : "difficulty")}
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    );
  } else if (phase === "difficulty") {
    content = (
      <div className="wrap">
        <div className="topbar">{themeToggle}</div>
        <h1 className="brand">จับลำดับเลข</h1>

        <div className="card setup-card">
          <p className="eyebrow">ขั้นที่ 3: เลือกระดับความยาก</p>
          <div className="tabs tabs-vertical">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                className={`tab ${d === difficulty ? "active" : ""}`}
                onClick={() => setDifficulty(d)}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
          <div className="step-nav">
            <button type="button" className="secondary" onClick={() => setPhase("subject")}>
              ย้อนกลับ
            </button>
            <button type="button" className="primary" onClick={() => setPhase("time")}>
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    );
  } else if (phase === "time") {
    content = (
      <div className="wrap">
        <div className="topbar">{themeToggle}</div>
        <h1 className="brand">จับลำดับเลข</h1>

        <div className="card setup-card">
          <p className="eyebrow">ขั้นที่ {subject === "textbook" ? 3 : 4}: เลือกเวลาที่กำหนด</p>
          <div className="tabs tabs-vertical">
            {TIME_LIMITS.map((t) => (
              <button
                key={t}
                type="button"
                className={`tab ${t === timeLimit ? "active" : ""}`}
                onClick={() => setTimeLimit(t)}
              >
                {t} วินาที
              </button>
            ))}
          </div>
          <div className="step-nav">
            <button
              type="button"
              className="secondary"
              onClick={() => setPhase(subject === "textbook" ? "subject" : "difficulty")}
            >
              ย้อนกลับ
            </button>
            <button type="button" className="primary" onClick={handleStart}>
              เริ่มเล่น
            </button>
          </div>
        </div>
      </div>
    );
  } else if (phase === "ended") {
    content = (
      <div className="wrap">
        <div className="topbar">{themeToggle}</div>
        <h1 className="brand">จับลำดับเลข</h1>
        <p className="tagline">หมดเวลาแล้ว คุณ{playerName.trim() || "ผู้เล่น"}</p>

        <div className="card summary-card">
          <p className="eyebrow">ผลการแข่งขัน</p>
          <div className="summary-grid">
            <div>
              <span className="summary-value correct">{correctCount}</span>
              <span className="summary-label">ตอบถูก</span>
            </div>
            <div>
              <span className="summary-value wrong">{wrongCount}</span>
              <span className="summary-label">ตอบผิด</span>
            </div>
            <div>
              <span className="summary-value">{bestStreak}</span>
              <span className="summary-label">สตรีคสูงสุด</span>
            </div>
          </div>
          <button type="button" className="primary start-btn" onClick={() => setPhase("home")}>
            เล่นอีกครั้ง
          </button>
        </div>

        <Leaderboard entries={leaderboard} highlightDate={leaderboard[0]?.date} />
      </div>
    );
  } else {
    // phase === "playing"
    content = (
      <div className="wrap">
        <div className="topbar">{themeToggle}</div>
        <h1 className="brand">จับลำดับเลข</h1>
        <p className="tagline">
          {playerName} · {SUBJECT_LABELS[subject]}
          {subject !== "textbook" && <> · {DIFFICULTY_LABELS[difficulty]}</>}
        </p>

        <div className="stats">
          <span>
            เวลา <b className={timeLeft <= 10 ? "time-low" : ""}>{timeLeft} วิ</b>
          </span>
          <span>
            คะแนน <b>{score}</b>
          </span>
          <span>
            สตรีค <b>{streak}</b>
          </span>
          <span>
            ตอบถูก <b>{correctCount}</b>
          </span>
        </div>

        <div className="card">
          <p className="eyebrow">โจทย์ข้อที่ {String(puzzleNumber).padStart(3, "0")}</p>

          <form onSubmit={handleSubmit}>
            {puzzle.terms ? (
              <div className="tiles">
                {puzzle.terms.map((t, i) => {
                  const showGap = status !== "idle";
                  return (
                    <div key={i} style={{ display: "contents" }}>
                      <div className="tile">{t}</div>
                      <div className="gap">{showGap && <span className="op">{puzzle.work[i]}</span>}</div>
                    </div>
                  );
                })}
                <div className={`tile answer-tile ${status}`}>
                  {status === "idle" ? (
                    <input
                      className="answer-input"
                      type="number"
                      inputMode="numeric"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      autoFocus
                      aria-label="คำตอบของคุณ"
                    />
                  ) : status === "correct" ? (
                    input
                  ) : (
                    puzzle.answer
                  )}
                </div>
              </div>
            ) : (
              <div className="calc-box">
                {subject === "textbook" ? (
                  <img src={puzzle.image} alt={`โจทย์ลิมิตข้อ ${puzzle.id}`} className="calc-image" />
                ) : (
                  <pre className="calc-expr">{puzzle.display}</pre>
                )}
                <div
                  className={`tile answer-tile calc-answer ${subject === "textbook" ? "text-mode" : ""} ${status}`}
                >
                  {status === "idle" ? (
                    subject === "textbook" ? (
                      <input
                        className="answer-input"
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                        aria-label="คำตอบของคุณ"
                      />
                    ) : (
                      <input
                        className="answer-input"
                        type="number"
                        step="any"
                        inputMode="decimal"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                        aria-label="คำตอบของคุณ"
                      />
                    )
                  ) : status === "correct" ? (
                    input
                  ) : subject === "textbook" ? (
                    puzzle.answerDisplay
                  ) : (
                    puzzle.answer
                  )}
                </div>
                {subject === "textbook" && status === "idle" && (
                  <p className="calc-hint">ตอบเป็นตัวเลข, inf, -inf หรือ dne ก็ได้</p>
                )}
              </div>
            )}

            <div className="controls">
              {status === "idle" ? (
                <button type="submit" className="primary">
                  ตรวจคำตอบ
                </button>
              ) : (
                <span className="secondary" style={{ border: "none" }}>
                  ข้อต่อไปอีกสักครู่…
                </span>
              )}
            </div>
          </form>

          <div className={`feedback ${status !== "idle" ? status : ""}`}>
            {status === "correct" && "ถูกต้อง"}
            {status === "wrong" &&
              `ยังไม่ถูก — คำตอบคือ ${subject === "textbook" ? puzzle.answerDisplay : puzzle.answer}`}
          </div>
          {status !== "idle" && <p className="rule">{puzzle.rule}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell" data-theme={theme}>
      {content}
    </div>
  );
}

function Leaderboard({ entries, highlightDate }) {
  return (
    <div className="card leaderboard-card">
      <p className="eyebrow">ตารางคะแนน</p>
      <table className="leaderboard">
        <thead>
          <tr>
            <th>อันดับ</th>
            <th>ชื่อ</th>
            <th>ถูก</th>
            <th>ผิด</th>
            <th>โหมด</th>
            <th>ระดับ</th>
            <th>เวลา</th>
          </tr>
        </thead>
        <tbody>
          {entries.slice(0, 10).map((e, i) => (
            <tr key={e.date} className={e.date === highlightDate ? "highlight" : ""}>
              <td>{i + 1}</td>
              <td>{e.name}</td>
              <td>{e.correct}</td>
              <td>{e.wrong}</td>
              <td>{SUBJECT_LABELS[e.subject] || "ลำดับเลข"}</td>
              <td>{e.subject === "textbook" ? "-" : DIFFICULTY_LABELS[e.difficulty] || e.difficulty}</td>
              <td>{e.timeLimit} วิ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
