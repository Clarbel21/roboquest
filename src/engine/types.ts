// ============================================================================
// RoboQuest Lite — core content & progress types.
// All lesson/quiz/flashcard content is plain data against these types, so new
// categories and lessons can be added as standalone modules in src/data/.
// ============================================================================

export type CategoryId =
  | 'python'
  | 'git'
  | 'sql'
  | 'api'
  | 'linux'
  | 'debug'
  | 'arch'
  | 'isaac';

// ---------------------------------------------------------------------------
// Exercises — interactive quiz types. All are answered by picking/ordering
// tokens; no arbitrary user code is ever executed.
// ---------------------------------------------------------------------------

export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQExercise {
  kind: 'mcq';
  id: string;
  prompt: string;
  options: MCQOption[];
  correctId: string;
  /** Why each WRONG option is wrong, keyed by option id (teaching, not grading). */
  optionNotes?: Record<string, string>;
  /** Full teaching explanation shown after answering. */
  explanation: string;
  hint?: string;
}

export interface PredictExercise {
  kind: 'predict';
  id: string;
  prompt: string;
  language: string;
  code: string;
  /** Candidate outputs (exact strings). */
  choices: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface BlankSpec {
  /** Placeholder id used in the template as {{b1}}. */
  id: string;
  /** Accepted answers (trimmed, case-insensitive). */
  accept: string[];
  /** If provided, rendered as a token picker instead of free text. */
  choices?: string[];
}

export interface FillBlankExercise {
  kind: 'fillblank';
  id: string;
  prompt: string;
  language: string;
  /** Code template containing {{blankId}} placeholders. */
  template: string;
  blanks: BlankSpec[];
  explanation: string;
  hint?: string;
}

export interface OrderItem {
  id: string;
  text: string;
  note?: string;
}

export interface OrderExercise {
  kind: 'order';
  id: string;
  prompt: string;
  /** Items listed in CORRECT order; the UI shuffles them. */
  items: OrderItem[];
  explanation: string;
  hint?: string;
}

export interface BughuntExercise {
  kind: 'bughunt';
  id: string;
  prompt: string;
  language: string;
  code: string;
  /** 1-based line number of the buggy line. */
  buggyLine: number;
  causeOptions: MCQOption[];
  causeCorrectId: string;
  /** Why the bug happens and how the fix works. */
  fixExplanation: string;
  /** Corrected code shown after answering (optional). */
  fixedCode?: string;
  explanation: string;
  hint?: string;
}

export type Exercise =
  | MCQExercise
  | PredictExercise
  | FillBlankExercise
  | OrderExercise
  | BughuntExercise;

// ---------------------------------------------------------------------------
// Lessons & categories
// ---------------------------------------------------------------------------

export type LessonStep =
  | { kind: 'teach'; heading: string; body: string; keyPoints?: string[] }
  | { kind: 'byte'; text: string } // Byte the robot companion aside
  | { kind: 'exercise'; exercise: Exercise };

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  xp: number;
  /** Scenario framing shown before the steps begin. */
  narrative?: string;
  steps: LessonStep[];
  /** For Isaac Sim content: honesty note about docs versions / simulation. */
  versionNote?: string;
}

export interface Flashcard {
  id: string;
  categoryId: CategoryId;
  concept: string;
  explanation: string;
  example?: string;
  code?: string;
  language?: string;
  misconception?: string;
  /** Where this shows up in real engineering work. */
  application?: string;
  difficulty: 1 | 2 | 3;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: string; // emoji
  tagline: string;
  description: string;
  accent: 'sky' | 'teal' | 'violet' | 'amber' | 'emerald' | 'rose' | 'indigo' | 'cyan';
  lessons: Lesson[];
  flashcards: Flashcard[];
}

// ---------------------------------------------------------------------------
// Progress & spaced repetition
// ---------------------------------------------------------------------------

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsCard {
  due: string; // ISO date (yyyy-mm-dd)
  intervalDays: number;
  ease: number; // 1.6 .. 3.0
  reps: number;
  lapses: number;
  last: string; // ISO date of last review
}

export interface MistakeEntry {
  id: string;
  day: string;
  lessonId?: string;
  prompt: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
  resolved?: boolean;
}

export interface ProgressState {
  version: number;
  xp: number;
  streak: {
    current: number;
    best: number;
    lastActiveDay: string | null;
    /** Active days as yyyy-mm-dd, capped to the last 90 entries. */
    days: string[];
  };
  /** lessonId -> best score pct */
  completedLessons: Record<string, number>;
  /** quiz exercise ids answered correctly at least once */
  correctQuizIds: string[];
  srs: Record<string, SrsCard>;
  mistakes: MistakeEntry[];
  totalAnswered: number;
  totalCorrect: number;
  /** daily mission per day, keyed yyyy-mm-dd — persisted so a half-done session resumes */
  dailyLog: Record<string, { cardIds: string[]; lessonId: string; quizIds: string[]; done: boolean }>;
}
