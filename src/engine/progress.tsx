import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Exercise, ProgressState, Rating } from './types';
import { newCard, schedule, todayStr } from './srs';
import { LESSON_BY_ID } from '../data';

// ---------------------------------------------------------------------------
// Progress store: single localStorage key, plain state + action helpers.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'roboquest-lite-v1';

function defaultState(): ProgressState {
  return {
    version: 1,
    xp: 0,
    streak: { current: 0, best: 0, lastActiveDay: null, days: [] },
    completedLessons: {},
    correctQuizIds: [],
    srs: {},
    mistakes: [],
    totalAnswered: 0,
    totalCorrect: 0,
    dailyLog: {},
  };
}

function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    if (parsed.version !== 1) return defaultState();
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

// --- XP & levels ------------------------------------------------------------

export const LEVELS: { xp: number; title: string }[] = [
  { xp: 0, title: 'Rookie Technician' },
  { xp: 100, title: 'Junior Engineer' },
  { xp: 250, title: 'Systems Engineer II' },
  { xp: 450, title: 'Systems Engineer III' },
  { xp: 700, title: 'Senior Engineer' },
  { xp: 1000, title: 'Lead Engineer' },
  { xp: 1400, title: 'Principal Engineer' },
  { xp: 1900, title: 'Staff Robotics Engineer' },
  { xp: 2500, title: 'Simulation Specialist' },
  { xp: 3200, title: 'Integration Architect' },
  { xp: 4000, title: 'Principal Architect' },
  { xp: 5000, title: 'AI Systems Engineer' },
];

export function levelFor(xp: number): { level: number; title: string; into: number; span: number } {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].xp) idx = i;
  const next = LEVELS[idx + 1];
  const base = LEVELS[idx].xp;
  const span = next ? next.xp - base : 1;
  return { level: idx + 1, title: LEVELS[idx].title, into: xp - base, span };
}

// --- Answers ----------------------------------------------------------------

export interface AnswerResult {
  correct: boolean;
  yourAnswer: string;
  correctAnswer: string;
}

export interface ProgressActions {
  answerQuiz: (
    lessonId: string | null,
    exercise: Exercise,
    result: { correct: boolean; yourAnswer: string; correctAnswer: string; explanation: string },
  ) => void;
  rateCard: (cardId: string, rating: Rating) => void;
  completeLesson: (lessonId: string, scorePct: number) => { xpEarned: number };
  markDailyDone: () => void;
  /** Persist today's composed session so a reload resumes it exactly. */
  ensureDaily: (session: { cardIds: string[]; lessonId: string; quizIds: string[] }) => void;
  resetProgress: () => void;
  exportProgress: () => string;
}

const ProgressContext = createContext<{ state: ProgressState; actions: ProgressActions } | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable (private mode) — app still works for the session
    }
  }, [state]);

  const touchStreak = useCallback((s: ProgressState): ProgressState => {
    const today = todayStr();
    if (s.streak.lastActiveDay === today) return s;
    const yesterday = todayStr(new Date(Date.now() - 86400000));
    const current = s.streak.lastActiveDay === yesterday ? s.streak.current + 1 : 1;
    return {
      ...s,
      streak: {
        current,
        best: Math.max(s.streak.best, current),
        lastActiveDay: today,
        days: [...s.streak.days.filter((d) => d !== today), today].slice(-90),
      },
    };
  }, []);

  const actions = useMemo<ProgressActions>(
    () => ({
      answerQuiz: (lessonId, exercise, result) => {
        setState((s0) => {
          let s = { ...s0 };
          const firstTime = !s.correctQuizIds.includes(exercise.id);
          s.totalAnswered += 1;
          s.xp += result.correct ? (firstTime ? 8 : 3) : 0;

          if (result.correct) {
            s.totalCorrect += 1;
            if (firstTime) s.correctQuizIds = [...s.correctQuizIds, exercise.id];
            // resolve any open mistake for this exercise
            s.mistakes = s.mistakes.map((m) =>
              m.id === exercise.id && !m.resolved ? { ...m, resolved: true } : m,
            );
          } else {
            const existing = s.mistakes.find((m) => m.id === exercise.id);
            const entry = {
              id: exercise.id,
              day: todayStr(),
              lessonId: lessonId ?? existing?.lessonId,
              prompt: exercisePrompt(exercise),
              yourAnswer: result.yourAnswer,
              correctAnswer: result.correctAnswer,
              explanation: result.explanation,
              resolved: false,
            };
            s.mistakes = existing
              ? s.mistakes.map((m) => (m.id === exercise.id ? { ...entry, resolvedDay: undefined } : m))
              : [...s.mistakes, entry];
            if (s.mistakes.length > 100) s.mistakes = s.mistakes.slice(-100);
          }
          return touchStreak(s);
        });
      },

      rateCard: (cardId, rating) => {
        setState((s0) => {
          const today = todayStr();
          const card = s0.srs[cardId] ?? newCard(today);
          const s = { ...s0, xp: s0.xp + 2, srs: { ...s0.srs, [cardId]: schedule(card, rating, today) } };
          return touchStreak(s);
        });
      },

      completeLesson: (lessonId, scorePct) => {
        let earned = 0;
        setState((s0) => {
          const first = s0.completedLessons[lessonId] === undefined;
          const lesson = LESSON_BY_ID[lessonId];
          earned = first ? (lesson?.xp ?? 40) : Math.max(10, Math.round((lesson?.xp ?? 40) * 0.25));
          const s = {
            ...s0,
            xp: s0.xp + earned,
            completedLessons: {
              ...s0.completedLessons,
              [lessonId]: Math.max(s0.completedLessons[lessonId] ?? 0, scorePct),
            },
          };
          return touchStreak(s);
        });
        return { xpEarned: earned };
      },

      markDailyDone: () => {
        setState((s0) => {
          const day = todayStr();
          const entry = s0.dailyLog[day];
          if (!entry) return s0;
          return { ...s0, dailyLog: { ...s0.dailyLog, [day]: { ...entry, done: true } } };
        });
      },

      ensureDaily: (session) => {
        setState((s0) => {
          const day = todayStr();
          if (s0.dailyLog[day]) return s0;
          return { ...s0, dailyLog: { ...s0.dailyLog, [day]: { ...session, done: false } } };
        });
      },

      resetProgress: () => {
        setState(defaultState());
      },

      exportProgress: () => JSON.stringify(loadState(), null, 2),
    }),
    [touchStreak],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}

function exercisePrompt(exercise: Exercise): string {
  switch (exercise.kind) {
    case 'mcq':
    case 'predict':
    case 'fillblank':
    case 'order':
      return exercise.prompt;
    case 'bughunt':
      return exercise.prompt;
  }
}
