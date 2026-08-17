# Sequence

A number-pattern puzzle game built with Next.js (App Router) and plain JavaScript — no extra UI libraries.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## How it works

- `lib/sequences.js` generates puzzles: arithmetic, geometric, Fibonacci-like, squares, cubes, powers of two, triangular numbers, alternating steps, and quadratic (growing-step) sequences.
- `components/SequenceGame.js` holds all game state: current puzzle, difficulty, score, streak, and the "show my work" hint toggle.
- Difficulty (Easy / Medium / Hard) changes which pattern types can appear and how large the numbers get.
- Correct answers award points (more for harder difficulties) plus a small streak bonus; a wrong answer resets the streak and reveals the answer and the rule.
- "Show my work" reveals the operation between each visible tile (but not the final hidden step) as a hint before you answer.

## Project structure

```
app/
  layout.js       — fonts + global styles
  page.js         — loads the game client-side only (avoids hydration
                    mismatches, since puzzles are randomly generated)
  globals.css     — all styling
components/
  SequenceGame.js — the game itself
lib/
  sequences.js    — puzzle generators
```

## Extending it

- Add a new pattern: write a generator in `lib/sequences.js` that returns `pack(full, work, rule)` and add it to a difficulty pool in `GENERATORS`.
- Add a timer or leaderboard: both slot naturally into `SequenceGame.js`'s existing state.
