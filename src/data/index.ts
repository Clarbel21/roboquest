import type { Category, Exercise, Flashcard, Lesson } from '../engine/types';
import { pythonCategory } from './python';
import { gitCategory } from './git';
import { sqlCategory } from './sql';
import { apiCategory } from './api';
import { linuxCategory } from './linux';
import { debugCategory } from './debug';
import { archCategory } from './arch';
import { isaacCategory } from './isaac';

// Learning path order: fundamentals first, Isaac Sim specialization last.
// Add new categories here — everything else derives from this list.
export const CATEGORIES: Category[] = [
  pythonCategory,
  gitCategory,
  sqlCategory,
  apiCategory,
  linuxCategory,
  debugCategory,
  archCategory,
  isaacCategory,
];

export const ALL_LESSONS: Lesson[] = CATEGORIES.flatMap((c) => c.lessons);

export const ALL_CARDS: Flashcard[] = CATEGORIES.flatMap((c) => c.flashcards);

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(
  ALL_LESSONS.map((l) => [l.id, l]),
);

export const CARD_BY_ID: Record<string, Flashcard> = Object.fromEntries(
  ALL_CARDS.map((c) => [c.id, c]),
);

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

/** All quiz exercises with the lesson they belong to. */
export const ALL_QUIZZES: { lessonId: string; categoryId: string; exercise: Exercise }[] =
  ALL_LESSONS.flatMap((l) =>
    l.steps.flatMap((s) =>
      s.kind === 'exercise' ? [{ lessonId: l.id, categoryId: l.id.split('-')[0], exercise: s.exercise }] : [],
    ),
  );

export const QUIZ_BY_ID: Record<string, { lessonId: string; exercise: Exercise }> =
  Object.fromEntries(ALL_QUIZZES.map((q) => [q.exercise.id, { lessonId: q.lessonId, exercise: q.exercise }]));
