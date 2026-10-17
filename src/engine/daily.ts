import { ALL_CARDS, ALL_LESSONS, ALL_QUIZZES, CATEGORIES, QUIZ_BY_ID } from '../data';
import type { CategoryId, ProgressState } from './types';
import { DIFFICULTY_ORDER } from './types';
import { isDue, todayStr } from './srs';
import type { Lesson } from './types';

// The daily session: 5 review flashcards + 1 lesson + 5 quiz questions.
//
// Adaptive selection:
//  - Focus subject: if the learner picked one, the daily lesson comes from
//    that category (others keep working via the category pages).
//  - Proficiency: lessons below the assessed starting tier are not pushed as
//    "next up" (they stay available on the category page).
//  - Weak concepts: review quizzes draw from unresolved mistakes first, then
//    exercises of COMPLETED lessons — never from material not yet introduced.
//
// The composed session persists for the day, so closing the app mid-session
// resumes exactly where you left off.

export interface DailySession {
  day: string;
  cardIds: string[];
  lessonId: string;
  quizIds: string[];
  done: boolean;
}

const LESSON_CATEGORY: Map<string, CategoryId> = new Map(
  CATEGORIES.flatMap((c) => c.lessons.map((l) => [l.id, c.id] as const)),
);

function tierOf(lesson: Lesson): number {
  return DIFFICULTY_ORDER.indexOf(lesson.difficulty ?? 'foundation');
}

function inOrder<T>(item: T, pool: T[]): number {
  return pool.indexOf(item);
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

  // --- Lesson: focus subject first, proficiency-aware, tier-ordered ---
  const focus = state.focusCategory && state.focusCategory !== 'auto' ? state.focusCategory : null;
  const pool: Lesson[] = focus ? CATEGORIES.find((c) => c.id === focus)!.lessons : ALL_LESSONS;

  const uncompleted = pool.filter((l) => state.completedLessons[l.id] === undefined);
  let lessonId: string;
  if (uncompleted.length > 0) {
    const assessed = focus ? state.assessment?.[focus]?.level : undefined;
    const minTier = assessed ? DIFFICULTY_ORDER.indexOf(assessed) : 0;
    // Do not push tiers below the assessed starting point; Engineering
    // Missions are never skipped by assessment.
    const eligible = uncompleted.filter(
      (l) => tierOf(l) >= minTier || (l.difficulty ?? 'foundation') === 'mission',
    );
    const candidates = eligible.length > 0 ? eligible : uncompleted;
    const next = candidates
      .slice()
      .sort((a, b) => tierOf(a) - tierOf(b) || inOrder(a, pool) - inOrder(b, pool));
    lessonId = next[0].id;
  } else {
    // Everything in the pool is done — review the weakest lesson.
    const completed = pool.filter((l) => state.completedLessons[l.id] !== undefined);
    const weakest = completed.reduce((a, b) =>
      (state.completedLessons[a.id] ?? 100) <= (state.completedLessons[b.id] ?? 100) ? a : b,
    );
    lessonId = weakest.id;
  }

  // --- Quiz: 5 questions, drawn only from material already introduced ---
  const quizIds: string[] = [];
  const taken = new Set<string>();
  const push = (id: string) => {
    if (quizIds.length < 5 && !taken.has(id) && QUIZ_BY_ID[id]) {
      quizIds.push(id);
      taken.add(id);
    }
  };

  // 1) Unresolved mistakes — weak concepts first (focus subject prioritized)
  const mistakes = state.mistakes.filter((m) => !m.resolved);
  mistakes
    .sort((a, b) => {
      const aFocus = focus && a.lessonId && LESSON_CATEGORY.get(a.lessonId) === focus ? 0 : 1;
      const bFocus = focus && b.lessonId && LESSON_CATEGORY.get(b.lessonId) === focus ? 0 : 1;
      return aFocus - bFocus;
    })
    .forEach((m) => push(m.id));

  const correctSet = new Set(state.correctQuizIds);
  // Lessons the learner has actually finished — the only review material.
  const introduced = (q: { lessonId: string }) => state.completedLessons[q.lessonId] !== undefined;
  const fromFocus = (q: { lessonId: string }) =>
    focus && LESSON_CATEGORY.get(q.lessonId) === focus ? 0 : 1;

  // 2) Not-yet-mastered exercises from completed lessons, focus subject first
  ALL_QUIZZES.filter((q) => introduced(q) && q.lessonId !== lessonId)
    .filter((q) => !correctSet.has(q.exercise.id))
    .sort((a, b) => fromFocus(a) - fromFocus(b))
    .forEach((q) => push(q.exercise.id));

  // 3) Mastered exercises for spaced retrieval, focus subject first
  ALL_QUIZZES.filter((q) => introduced(q) && q.lessonId !== lessonId)
    .filter((q) => correctSet.has(q.exercise.id))
    .sort((a, b) => fromFocus(a) - fromFocus(b))
    .forEach((q) => push(q.exercise.id));

  // 4) Last resort: exercises of today's lesson (seen during the session)
  ALL_QUIZZES.filter((q) => q.lessonId === lessonId).forEach((q) => push(q.exercise.id));

  return { cardIds, lessonId, quizIds: quizIds.slice(0, 5) };
}
