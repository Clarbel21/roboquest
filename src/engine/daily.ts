import { ALL_CARDS, ALL_LESSONS, ALL_QUIZZES, QUIZ_BY_ID } from '../data';
import type { ProgressState } from './types';
import { isDue, todayStr } from './srs';

// The daily session: 5 review flashcards + 1 short lesson + 5 quiz questions.
// Composition is derived from progress and persisted for the day, so closing
// the app mid-session resumes exactly where you left off.

export interface DailySession {
  day: string;
  cardIds: string[];
  lessonId: string;
  quizIds: string[];
  done: boolean;
}

export function getDailySession(state: ProgressState): DailySession {
  const day = todayStr();
  const existing = state.dailyLog[day];
  if (existing) {
    return {
      day,
      cardIds: existing.cardIds,
      lessonId: existing.lessonId,
      quizIds: existing.quizIds,
      done: existing.done,
    };
  }
  const composed = composeDaily(state, day);
  return { day, done: false, ...composed };
}

function composeDaily(state: ProgressState, day: string): Omit<DailySession, 'day' | 'done'> {
  // --- Review cards: due first (most overdue), then unseen cards ---
  const dueIds: string[] = [];
  const seen = new Set<string>();
  for (const card of ALL_CARDS) {
    const srs = state.srs[card.id];
    if (srs && isDue(srs, day)) dueIds.push(card.id);
    if (srs) seen.add(card.id);
  }
  const newIds = ALL_CARDS.filter((c) => !seen.has(c.id)).map((c) => c.id);
  const cardIds = [...dueIds, ...newIds].slice(0, 5);

  // --- Lesson: first uncompleted in path order; else weakest for review ---
  const nextLesson = ALL_LESSONS.find((l) => state.completedLessons[l.id] === undefined);
  let lessonId: string;
  if (nextLesson) {
    lessonId = nextLesson.id;
  } else {
    const weakest = ALL_LESSONS.reduce((a, b) =>
      (state.completedLessons[a.id] ?? 100) <= (state.completedLessons[b.id] ?? 100) ? a : b,
    );
    lessonId = weakest.id;
  }

  // --- Quiz: 5 questions, retrieval practice over past material ---
  const quizIds: string[] = [];
  const taken = new Set<string>();

  // 1) Unresolved mistakes (retest what was missed)
  const mistakeIds = state.mistakes
    .filter((m) => !m.resolved && QUIZ_BY_ID[m.id] && m.id !== undefined)
    .map((m) => m.id);
  for (const id of mistakeIds) {
    if (quizIds.length < 2 && !taken.has(id)) {
      quizIds.push(id);
      taken.add(id);
    }
  }

  // 2) Not-yet-mastered exercises from completed lessons, excluding today's lesson
  const correctSet = new Set(state.correctQuizIds);
  const reviewPool = ALL_QUIZZES.filter(
    (q) => q.lessonId !== lessonId && state.completedLessons[q.lessonId] !== undefined,
  );
  const weak = reviewPool.filter((q) => !correctSet.has(q.exercise.id)).map((q) => q.exercise.id);
  const solid = reviewPool.filter((q) => correctSet.has(q.exercise.id)).map((q) => q.exercise.id);
  for (const id of [...weak, ...solid]) {
    if (quizIds.length < 4 && !taken.has(id)) {
      quizIds.push(id);
      taken.add(id);
    }
  }

  // 3) Fill from anything (excluding today's lesson so it is not seen twice)
  const anyPool = ALL_QUIZZES.filter((q) => q.lessonId !== lessonId).map((q) => q.exercise.id);
  for (const id of anyPool) {
    if (quizIds.length < 5 && !taken.has(id)) {
      quizIds.push(id);
      taken.add(id);
    }
  }
  // 4) Last resort: today's lesson exercises
  const todayPool = ALL_QUIZZES.filter((q) => q.lessonId === lessonId).map((q) => q.exercise.id);
  for (const id of todayPool) {
    if (quizIds.length < 5 && !taken.has(id)) {
      quizIds.push(id);
      taken.add(id);
    }
  }

  return { cardIds, lessonId, quizIds };
}
