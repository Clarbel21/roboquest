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

// Difficulty tiers. Existing lessons carry no difficulty field and are treated
// as Foundation — the schema stays backward compatible with saved progress.
export type Difficulty = 'foundation' | 'application' | 'troubleshooting' | 'mission';

export const DIFFICULTY_ORDER: Difficulty[] = ['foundation', 'application', 'troubleshooting', 'mission'];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  foundation: 'Foundation',
  application: 'Application',
  troubleshooting: 'Troubleshooting',
  mission: 'Engineering Mission',
};

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

// --- Scenario: multi-step troubleshooting (decisions -> observations ->
//     final diagnosis). Each stage is answered with immediate teaching
//     feedback; the recorded pass/fail hinges on the final diagnosis. ------

export interface ScenarioStage {
  id: string;
  /** Stage label, e.g. "Observation", "First decision". */
  title: string;
  /** What the engineer sees at this point (markdown-lite). */
  situation: string;
  question: string;
  options: MCQOption[];
  correctId: string;
  optionNotes?: Record<string, string>;
  /** What this observation/decision means — shown after answering. */
  explanation: string;
}

export interface ScenarioExercise {
  kind: 'scenario';
  id: string;
  /** Incident briefing shown up front. */
  prompt: string;
  /** Context block (log excerpt, stage tree, topic list…). */
  context?: string;
  contextLabel?: string;
  stages: ScenarioStage[];
  /** Final root-cause pick — the recorded answer for grading/mistakes. */
  diagnosis: {
    question: string;
    options: MCQOption[];
    correctId: string;
    optionNotes?: Record<string, string>;
    explanation: string;
  };
  /** Engineering recap after the diagnosis. */
  wrapUp: string;
  hint?: string;
}

// --- Structured coding challenge: the learner writes real code lines into
//     labeled slots. Answers are validated by normalized pattern matching —
//     NO code is executed; the UI says so explicitly. -----------------------

export interface CodeSlot {
  id: string;
  /** What this slot is for, e.g. "guard against an empty list". */
  label: string;
  /** Accepted full-line answers after normalization (whitespace-collapsed). */
  accept: string[];
  /** Alternative looser check: any-of substrings that must appear. */
  requireAny?: string[];
  /** Substrings that must not appear in the slot. */
  forbid?: string[];
  hint?: string;
}

export interface CodeChallengeExercise {
  kind: 'codechallenge';
  id: string;
  prompt: string;
  /** Starting code shown above the slots (the thing being modified). */
  code: string;
  language: string;
  slots: CodeSlot[];
  /** Reference solution shown after checking. */
  solution: string;
  explanation: string;
  hint?: string;
}

export type Exercise =
  | MCQExercise
  | PredictExercise
  | FillBlankExercise
  | OrderExercise
  | BughuntExercise
  | ScenarioExercise
  | CodeChallengeExercise;

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
  /** Difficulty tier. Omitted = Foundation (all pre-existing lessons). */
  difficulty?: Difficulty;
}

// --- Diagnostic assessment ---------------------------------------------------

export interface DiagnosticQuestion {
  id: string;
  categoryId: CategoryId;
  prompt: string;
  options: MCQOption[];
  correctId: string;
  optionNotes?: Record<string, string>;
  explanation: string;
  /** The tier this question screens for. */
  tier: Exclude<Difficulty, 'mission'>;
}

/** Per-subject placement: recommended starting tier (mission only via progress). */
export interface AssessmentResult {
  level: Difficulty;
  day: string;
  /** false when the learner overrode the recommendation manually. */
  auto: boolean;
}

// ---------------------------------------------------------------------------
// Personal companion: profile, learning modes, and the Learning Lab.
// ---------------------------------------------------------------------------

export type ExperienceLevel = 'new' | 'rusty' | 'working' | 'advanced';

export const EXPERIENCE_LABEL: Record<ExperienceLevel, string> = {
  new: 'New to the field',
  rusty: 'Rusty, refreshing',
  working: 'Working knowledge',
  advanced: 'Advanced',
};

export type LearningGoal =
  | 'fundamentals'
  | 'isaac'
  | 'ros2'
  | 'coursework'
  | 'career';

export const GOAL_LABEL: Record<LearningGoal, string> = {
  fundamentals: 'Rebuild my engineering fundamentals',
  isaac: 'Master NVIDIA Isaac Sim',
  ros2: 'Wire up ROS 2 & sim-to-real',
  coursework: 'Support my university coursework',
  career: 'Prepare for industry roles',
};

export type FocusArea = 'software-engineering' | 'applied-ai' | 'robotics-research' | 'coursework';

export const FOCUS_LABEL: Record<FocusArea, string> = {
  'software-engineering': 'Software Engineering',
  'applied-ai': 'Applied AI',
  'robotics-research': 'Robotics Research',
  coursework: 'Coursework',
};

export interface UserProfile {
  name: string;
  experience: ExperienceLevel;
  goal: LearningGoal;
  /** 5, 15, or 30 minutes per daily mission. */
  dailyMinutes: 5 | 15 | 30;
  focusArea?: FocusArea;
  onboarded: boolean;
}

export type LearningMode = 'refresh' | 'research' | 'homework' | 'challenge';

export const MODE_LABEL: Record<LearningMode, string> = {
  refresh: 'Refresh My Memory',
  research: 'Research Preparation',
  homework: 'Homework Preparation',
  challenge: 'Engineering Challenge',
};

/** Competency axes measured from exercise kinds (recognition ≠ mastery). */
export type SkillAxis = 'recognition' | 'application' | 'debugging' | 'explanation';

// --- Learning Lab ------------------------------------------------------------

export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  /** One objective per line. */
  objectives: string[];
  /** Open engineering challenges — trackable as resolved. */
  challenges: string[];
  challengesResolved: boolean[];
  /** Skills the user wants to develop; user marks them learned. */
  skills: string[];
  skillsLearned: boolean[];
  /** Derived at save time by the recommendation engine. */
  primaryCategoryId?: CategoryId;
  recommendedLessonIds: string[];
  createdAt: string;
}

export interface Assignment {
  id: string;
  course: string;
  title: string;
  description: string;
  /** Optional deadline (yyyy-mm-dd). */
  deadline?: string;
  /** Skills/knowledge the assignment requires, one per line. */
  skills: string[];
  /** Derived at save time by the recommendation engine. */
  primaryCategoryId?: CategoryId;
  recommendedLessonIds: string[];
  createdAt: string;
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
  /** v2: per-subject placement results (diagnostic + manual overrides). */
  assessment?: Partial<Record<CategoryId, AssessmentResult>>;
  /** v2: 'auto' follows the learning path; a CategoryId focuses daily missions. */
  focusCategory?: CategoryId | 'auto';
  /** v3: personal companion state — all fields optional for older saves. */
  profile?: UserProfile;
  mode?: LearningMode;
  labProjects?: ResearchProject[];
  assignments?: Assignment[];
  /** Per-axis competency: correct/attempts per SkillAxis. */
  axisStats?: Partial<Record<SkillAxis, { correct: number; attempts: number }>>;
}
