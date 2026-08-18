// Thin wrapper around localStorage for the match leaderboard.
// Guards every call so it never throws in SSR or private-browsing mode.

const STORAGE_KEY = "sequence-game-leaderboard";
const MAX_ENTRIES = 100;

export function loadLeaderboard() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// entry: { name, correct, wrong, difficulty, timeLimit, date }
export function saveResult(entry) {
  const current = loadLeaderboard();
  const next = [...current, entry]
    .sort((a, b) => b.correct - a.correct || a.wrong - b.wrong || b.date - a.date)
    .slice(0, MAX_ENTRIES);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage full or unavailable — the session score still shows on screen
    }
  }
  return next;
}

export function clearLeaderboard() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
