import type { CodeChallengeExercise, Exercise, FillBlankExercise, ScenarioExercise } from './types';

export type QuizResponse =
  | { kind: 'mcq'; optionId: string }
  | { kind: 'predict'; choiceIndex: number }
  | { kind: 'fillblank'; values: Record<string, string> }
  | { kind: 'order'; itemIds: string[] }
  | { kind: 'bughunt'; line: number; causeId: string }
  | { kind: 'scenario'; diagnosisId: string; stageWrong: number }
  | { kind: 'codechallenge'; values: Record<string, string> };

/** Collapse whitespace and trim — the normalization used for typed code. */
export function normCode(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

export interface Grade {
  correct: boolean;
  yourAnswer: string;
  correctAnswer: string;
  /** Why the chosen wrong option was wrong (mcq only). */
  note?: string;
}

const BAD: Grade = { correct: false, yourAnswer: '—', correctAnswer: '—' };

function truncate(s: string, n = 60): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export function gradeExercise(ex: Exercise, r: QuizResponse): Grade {
  if (ex.kind !== r.kind) return BAD;
  // Runtime kinds match; extract casts make that explicit to the compiler.
  switch (ex.kind) {
    case 'mcq': {
      const rr = r as Extract<QuizResponse, { kind: 'mcq' }>;
      const ee = ex as Extract<Exercise, { kind: 'mcq' }>;
      const chosen = ee.options.find((o) => o.id === rr.optionId);
      const correctOpt = ee.options.find((o) => o.id === ee.correctId);
      return {
        correct: rr.optionId === ee.correctId,
        yourAnswer: chosen?.text ?? '—',
        correctAnswer: correctOpt?.text ?? '—',
        note: rr.optionId !== ee.correctId ? ee.optionNotes?.[rr.optionId] : undefined,
      };
    }
    case 'predict': {
      const rr = r as Extract<QuizResponse, { kind: 'predict' }>;
      const ee = ex as Extract<Exercise, { kind: 'predict' }>;
      return {
        correct: rr.choiceIndex === ee.correctIndex,
        yourAnswer: ee.choices[rr.choiceIndex] ?? '—',
        correctAnswer: ee.choices[ee.correctIndex],
      };
    }
    case 'fillblank': {
      const rr = r as Extract<QuizResponse, { kind: 'fillblank' }>;
      const ee = ex as FillBlankExercise;
      const correct = ee.blanks.every((b) => {
        const v = (rr.values[b.id] ?? '').trim().toLowerCase();
        return b.accept.some((a) => a.trim().toLowerCase() === v);
      });
      const fmt = (get: (b: (typeof ee.blanks)[number]) => string) =>
        ee.blanks.map((b) => truncate(get(b), 40)).join('  ·  ');
      return {
        correct,
        yourAnswer: fmt((b) => rr.values[b.id] || '(empty)'),
        correctAnswer: fmt((b) => b.accept[0]),
      };
    }
    case 'order': {
      const rr = r as Extract<QuizResponse, { kind: 'order' }>;
      const ee = ex as Extract<Exercise, { kind: 'order' }>;
      const byId = new Map(ee.items.map((i) => [i.id, i.text]));
      const userTexts = rr.itemIds.map((id) => truncate(byId.get(id) ?? '?'));
      const correctTexts = ee.items.map((i) => truncate(i.text));
      return {
        correct: rr.itemIds.length === ee.items.length && rr.itemIds.every((id, i) => id === ee.items[i].id),
        yourAnswer: userTexts.join('  →  '),
        correctAnswer: correctTexts.join('  →  '),
      };
    }
    case 'bughunt': {
      const rr = r as Extract<QuizResponse, { kind: 'bughunt' }>;
      const ee = ex as Extract<Exercise, { kind: 'bughunt' }>;
      const cause = ee.causeOptions.find((o) => o.id === rr.causeId);
      const correctCause = ee.causeOptions.find((o) => o.id === ee.causeCorrectId);
      return {
        correct: rr.line === ee.buggyLine && rr.causeId === ee.causeCorrectId,
        yourAnswer: `Line ${rr.line}: ${cause?.text ?? '—'}`,
        correctAnswer: `Line ${ee.buggyLine}: ${correctCause?.text ?? '—'}`,
      };
    }
    case 'scenario': {
      const rr = r as Extract<QuizResponse, { kind: 'scenario' }>;
      const ee = ex as ScenarioExercise;
      const chosen = ee.diagnosis.options.find((o) => o.id === rr.diagnosisId);
      const correctOpt = ee.diagnosis.options.find((o) => o.id === ee.diagnosis.correctId);
      return {
        correct: rr.diagnosisId === ee.diagnosis.correctId,
        yourAnswer: chosen?.text ?? '—',
        correctAnswer: correctOpt?.text ?? '—',
        note:
          rr.diagnosisId !== ee.diagnosis.correctId ? ee.diagnosis.optionNotes?.[rr.diagnosisId] : undefined,
      };
    }
    case 'codechallenge': {
      const rr = r as Extract<QuizResponse, { kind: 'codechallenge' }>;
      const ee = ex as CodeChallengeExercise;
      const slotOk = (slot: (typeof ee.slots)[number]): boolean => {
        const v = normCode(rr.values[slot.id] ?? '');
        if (!v) return false;
        if (slot.accept.some((a) => normCode(a).toLowerCase() === v.toLowerCase())) return true;
        if (slot.requireAny) {
          const has = slot.requireAny.some((sub) => v.toLowerCase().includes(sub.toLowerCase()));
          const bad = (slot.forbid ?? []).some((sub) => v.toLowerCase().includes(sub.toLowerCase()));
          if (has && !bad) return true;
        }
        return false;
      };
      return {
        correct: ee.slots.length > 0 && ee.slots.every(slotOk),
        yourAnswer: ee.slots.map((s) => normCode(rr.values[s.id] || '(empty)')).join('  ·  '),
        correctAnswer: ee.slots.map((s) => normCode(s.accept[0])).join('  ·  '),
      };
    }
  }
}
