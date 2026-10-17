import { ALL_LESSONS, CATEGORIES, LESSON_BY_ID } from '../data';
import type { CategoryId, Lesson, ProgressState } from './types';
import { DIFFICULTY_ORDER } from './types';

// Keyword-driven recommendations for the Learning Lab. Deliberately simple
// and transparent: text the learner writes about their project or assignment
// is matched against per-subject keywords, matched subjects' lessons are
// ordered by tier (the prerequisite pathway), and completed lessons move to
// the review section. No AI, no network — deterministic local matching.

const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  python: ['python', 'script', 'scripting', 'numpy', 'pandas', 'function', 'class', 'pip', 'venv', 'numpy', 'code'],
  git: ['git', 'version control', 'commit', 'branch', 'merge', 'github', 'pull request'],
  sql: ['sql', 'database', 'query', 'postgres', 'table', 'join', 'data vault'],
  api: ['api', 'rest', 'http', 'endpoint', 'json', 'fastapi', 'request', 'webhook'],
  linux: ['linux', 'bash', 'terminal', 'shell', 'ssh', 'chmod', 'ubuntu', 'server', 'headless'],
  debug: ['debug', 'debugging', 'bug', 'test', 'testing', 'pytest', 'traceback', 'logging', 'flaky', 'regression'],
  arch: ['architecture', 'module', 'service', 'design', 'refactor', 'microservice', 'system', 'pipeline'],
  isaac: [
    'isaac', 'usd', 'sim', 'simulation', 'sim-to-real', 'robot', 'robots', 'ros', 'ros 2', 'ros2',
    'articulation', 'joint', 'digital twin', 'urdf', 'gazebo', 'manipulator', 'manipulators',
    'assembly', 'sync', 'synchronization', 'omniverse', 'stage', 'prim', 'physics', 'sensor',
    'camera', 'lidar', 'visualization', 'twin',
  ],
};

function scoreCategory(texts: string[], keywords: string[]): number {
  const haystack = texts.join(' ').toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (haystack.includes(kw)) score += kw.includes(' ') ? 2 : 1;
  }
  return score;
}

export function matchCategory(texts: string[]): CategoryId | null {
  let best: CategoryId | null = null;
  let bestScore = 0;
  for (const c of CATEGORIES) {
    const score = scoreCategory(texts, CATEGORY_KEYWORDS[c.id]);
    if (score > bestScore) {
      bestScore = score;
      best = c.id;
    }
  }
  return bestScore > 0 ? best : null;
}

function tierOf(lesson: Lesson): number {
  return DIFFICULTY_ORDER.indexOf(lesson.difficulty ?? 'foundation');
}

/** True when the learner may be pointed at above-Foundation material in a subject. */
function advancedReady(state: ProgressState, categoryId: CategoryId): boolean {
  const assessed = state.assessment?.[categoryId]?.level;
  if (assessed && DIFFICULTY_ORDER.indexOf(assessed) >= 1) return true;
  const catLessons = CATEGORIES.find((c) => c.id === categoryId)?.lessons ?? [];
  const foundation = catLessons.filter((l) => tierOf(l) === 0);
  return foundation.length > 0 && foundation.every((l) => state.completedLessons[l.id] !== undefined);
}

/**
 * Tier-ordered lesson pathway for a piece of text about the learner's project
 * or assignment. Uncompleted lessons form the pathway (Foundation first —
 * prerequisites before advanced tiers); completed ones append as review.
 */
export function recommendedLessonIds(texts: string[], state: ProgressState): string[] {
  const categoryId = matchCategory(texts);
  if (!categoryId) return [];
  const catLessons = CATEGORIES.find((c) => c.id === categoryId)?.lessons ?? [];
  const pathway = catLessons
    .filter((l) => state.completedLessons[l.id] === undefined)
    .filter((l) => tierOf(l) === 0 || advancedReady(state, categoryId))
    .sort((a, b) => tierOf(a) - tierOf(b) || catLessons.indexOf(a) - catLessons.indexOf(b));
  const review = catLessons
    .filter((l) => state.completedLessons[l.id] !== undefined)
    .sort((a, b) => (state.completedLessons[a.id] ?? 0) - (state.completedLessons[b.id] ?? 0));
  return [...pathway, ...review].map((l) => l.id);
}

export function recommendedCategory(texts: string[]): CategoryId | null {
  return matchCategory(texts);
}

/** The lessons a Lab item currently recommends (by stored id). */
export function labItemLessons(ids: string[]): Lesson[] {
  return ids.map((id) => LESSON_BY_ID[id]).filter(Boolean);
}

export { ALL_LESSONS };
