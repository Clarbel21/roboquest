# RoboQuest Lite

A gamified daily learning app for software engineering fundamentals and NVIDIA Isaac Sim.
15 minutes a day: **5 review flashcards → 1 short lesson → 5 challenge questions**, with
spaced repetition, streaks, XP, and a mistake notebook. Everything runs locally in the
browser — no backend, no accounts, no data leaves the machine.

**▶ Play it now: [clarbel21.github.io/roboquest](https://clarbel21.github.io/roboquest/)** —
progress is saved per visitor in that browser's localStorage.

## Run it

```bash
npm install
npm run dev        # dev server at http://localhost:5173
```

Production build:

```bash
npm run build
npm run preview    # serves the dist/ build at http://localhost:4173
```

## What's inside

- **8 categories**, 55 lessons, 76 flashcards, ~115 interactive exercises:
  Python, Git, SQL, APIs, Linux, Debugging & Testing, Software Architecture, NVIDIA Isaac Sim.
- **Light, soft-blue theme** with frosted-white cards; palette lives in
  `tailwind.config.js` (page wash + surface scale + an overridden slate scale that
  keeps all text dark).
- **Exercise types** (all answer-validated, no user code is ever executed):
  multiple choice, predict-the-output, fill-in-the-blank, order-the-steps, find-the-bug.
- **Spaced repetition** (`src/engine/srs.ts`): an SM-2-inspired scheduler with
  Again / Hard / Good / Easy ratings and interval previews on the buttons.
- **Daily mission** (`src/engine/daily.ts`): composes review cards (due first, then unseen),
  the next uncompleted lesson, and 5 quiz questions that prioritize your unresolved mistakes
  and weak exercises from completed lessons. The session is persisted for the day, so a
  reload resumes exactly where you left off.
- **Progress** (`src/engine/progress.tsx`): XP, levels, streaks, per-lesson scores,
  mistake notebook, and a 14-day activity strip — all in `localStorage`
  (key `roboquest-lite-v1`). Export to JSON from the Stats page.

## Isaac Sim content

The Isaac Sim pathway (6 lessons: overview, USD stages/prims, physics, articulations,
scripting lifecycle, ROS 2 bridge + sim-to-real) is **conceptual and browser-based** — it
never claims to execute the real Isaac Sim application. Lessons carry a version note
pointing to the official NVIDIA Isaac Sim documentation; APIs and UI paths change between
Isaac Sim releases, so verify specifics against your installed version. Isaac Sim (the
OpenUSD-based simulation application) is clearly distinguished from Isaac Lab (the
robot-learning framework built on top of it) and from ROS 2 (middleware, not a simulator).

## Adding content

All learning content is plain data in `src/data/`, one file per category, typed by
`src/engine/types.ts`. To add a category:

1. Copy an existing file (e.g. `src/data/arch.ts`) and edit the lessons/flashcards.
2. Import it in `src/data/index.ts` and add it to `CATEGORIES` — position defines the
   recommended learning path order.

Lessons are a sequence of steps: `teach` (markdown-lite: `**bold**`, `` `code` ``, `- `
bullets), `byte` (companion-robot asides), and `exercise` (the five quiz kinds). The
schema lives in `src/engine/types.ts`; `src/data/arch.ts` is the reference example.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS. No other runtime dependencies.
