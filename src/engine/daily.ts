import { ALL_CARDS, ALL_LESSONS, ALL_QUIZZES, CATEGORIES, LESSON_BY_ID, QUIZ_BY_ID } from '../data';
import type { CategoryId, Lesson, ProgressState } from './types';
import { DIFFICULTY_ORDER } from './types';
import { isDue, todayStr } from './srs';

// The daily session: review flashcards + one lesson + quiz questions, sized
// by the learner's preferred duration (5 / 15 / 30 minutes).
//
// Learning modes:
//  - refresh:    the standard path (focus subject aware)
//  - research:   lesson drawn from the active research project's pathway
//  - homework:   lesson drawn from the active assignment's pathway
//  - challenge:  first Application+ lesson whose Foundation prerequisites are
//                met (completed, or waived by placement); falls back to refresh
//
// Reviews never touch material from lessons that have not been completed.

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

function inOrder(item: Lesson, pool: Lesson[]): number {
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

/** Session sizing by preferred duration. */
function countsFor(state: ProgressState): { cards: number; quizzes: number } {
  const minutes = state.profile?.dailyMinutes ?? 15;
  if (minutes <= 5) return { cards: 3, quizzes: 3 };
  if (minutes >= 30) return { cards: 7, quizzes: 7 };
  return { cards: 5, quizzes: 5 };
}

/** The lesson pool implied by the active learning mode. */
function poolForMode(state: ProgressState): Lesson[] {
  const mode = state.mode ?? 'refresh';

  if (mode === 'research' && state.labProjects?.length) {
    const lessons = state.labProjects[0].recommendedLessonIds
      .map((id) => LESSON_BY_ID[id])
      .filter(Boolean);
    if (lessons.length) return lessons;
  }
  if (mode === 'homework' && state.assignments?.length) {
    const lessons = state.assignments[0].recommendedLessonIds
      .map((id) => LESSON_BY_ID[id])
      .filter(Boolean);
    if (lessons.length) return lessons;
  }
  if (mode === 'challenge') {
    const focus = state.focusCategory && state.focusCategory !== 'auto' ? state.focusCategory : null;
    const cats: CategoryId[] = focus ? [focus, ...CATEGORIES.map((c) => c.id).filter((c) => c !== focus)] : CATEGORIES.map((c) => c.id);
    for (const cid of cats) {
      const cat = CATEGORIES.find((c) => c.id === cid)!;
      const assessed = state.assessment?.[cid]?.level;
      const foundationDone =
        (assessed && DIFFICULTY_ORDER.indexOf(assessed) >= 1) ||
        cat.lessons.filter((l) => tierOf(l) === 0).every((l) => state.completedLessons[l.id] !== undefined);
      if (!foundationDone) continue;
      const next = cat.lessons
        .filter((l) => state.completedLessons[l.id] === undefined && tierOf(l) >= 1)
        .sort((a, b) => tierOf(a) - tierOf(b))[0];
      if (next) return [next, ...cat.lessons.filter((l) => l.id !== next.id)];
    }
    // Nothing is challenge-ready yet — fall back to the standard path.
  }
  const focus = state.focusCategory && state.focusCategory !== 'auto' ? state.focusCategory : null;
  return focus ? CATEGORIES.find((c) => c.id === focus)!.lessons : ALL_LESSONS;
}

function composeDaily(state: ProgressState, day: string): Omit<DailySession, 'day' | 'done'> {
  const { cards: cardCount, quizzes: quizCount } = countsFor(state);

  // --- Review cards: due first (most overdue), then unseen cards ---
  const dueIds: string[] = [];
  const seen = new Set<string>();
  for (const card of ALL_CARDS) {
    const srs = state.srs[card.id];
    if (srs && isDue(srs, day)) dueIds.push(card.id);
    if (srs) seen.add(card.id);
  }
  const newIds = ALL_CARDS.filter((c) => !seen.has(c.id)).map((c) => c.id);
  const cardIds = [...dueIds, ...newIds].slice(0, cardCount);

  // --- Lesson: mode-driven pool, uncompleted first, tier-ordered ---
  const pool = poolForMode(state);
  const uncompleted = pool.filter((l) => state.completedLessons[l.id] === undefined);
  let lessonId: string;
  if (uncompleted.length > 0) {
    const focusCat = state.focusCategory && state.focusCategory !== 'auto' ? state.focusCategory : null;
    const assessed = focusCat ? state.assessment?.[focusCat]?.level : undefined;
    const minTier = assessed ? DIFFICULTY_ORDER.indexOf(assessed) : 0;
    const eligible = uncompleted.filter((l) => tierOf(l) >= minTier || (l.difficulty ?? 'foundation') === 'mission');
    const candidates = eligible.length > 0 ? eligible : uncompleted;
    const next = candidates
      .slice()
      .sort((a, b) => tierOf(a) - tierOf(b) || inOrder(a, pool) - inOrder(b, pool));
    lessonId = next[0].id;
  } else {
    const completed = pool.filter((l) => state.completedLessons[l.id] !== undefined);
    const weakest = completed.length
      ? completed.reduce((a, b) =>
          (state.completedLessons[a.id] ?? 100) <= (state.completedLessons[b.id] ?? 100) ? a : b,
        )
      : ALL_LESSONS[0];
    lessonId = weakest.id;
  }

  // --- Quiz: sized, drawn only from material already introduced ---
  const quizIds: string[] = [];
  const taken = new Set<string>();
  const push = (id: string) => {
    if (quizIds.length < quizCount && !taken.has(id) && QUIZ_BY_ID[id]) {
      quizIds.push(id);
      taken.add(id);
    }
  };

  const modeCategories = new Set<CategoryId>();
  if (state.mode === 'research' && state.labProjects?.[0]?.primaryCategoryId)
    modeCategories.add(state.labProjects[0].primaryCategoryId);
  if (state.mode === 'homework' && state.assignments?.[0]?.primaryCategoryId)
    modeCategories.add(state.assignments[0].primaryCategoryId);
  if (state.mode === 'challenge' && state.focusCategory && state.focusCategory !== 'auto')
    modeCategories.add(state.focusCategory);

  // 1) Unresolved mistakes — weak concepts first (mode-relevant subjects prioritized)
  const mistakes = state.mistakes.filter((m) => !m.resolved);
  mistakes
    .sort((a, b) => {
      const rel = (m: typeof a) => (m.lessonId && modeCategories.has(LESSON_CATEGORY.get(m.lessonId)!)) ? 0 : 1;
      return rel(a) - rel(b);
    })
    .forEach((m) => push(m.id));

  const correctSet = new Set(state.correctQuizIds);
  const introduced = (q: { lessonId: string }) => state.completedLessons[q.lessonId] !== undefined;
  const relevance = (q: { lessonId: string }) => (modeCategories.has(LESSON_CATEGORY.get(q.lessonId)!) ? 0 : 1);

  // 2) Not-yet-mastered exercises from completed lessons, mode-relevant first
  ALL_QUIZZES.filter((q) => introduced(q) && q.lessonId !== lessonId)
    .filter((q) => !correctSet.has(q.exercise.id))
    .sort((a, b) => relevance(a) - relevance(b))
    .forEach((q) => push(q.exercise.id));

  // 3) Mastered exercises for spaced retrieval, mode-relevant first
  ALL_QUIZZES.filter((q) => introduced(q) && q.lessonId !== lessonId)
    .filter((q) => correctSet.has(q.exercise.id))
    .sort((a, b) => relevance(a) - relevance(b))
    .forEach((q) => push(q.exercise.id));

  // 4) Last resort: exercises of today's lesson (seen during the session)
  ALL_QUIZZES.filter((q) => q.lessonId === lessonId).forEach((q) => push(q.exercise.id));

  return { cardIds, lessonId, quizIds: quizIds.slice(0, quizCount) };
}
