import { useMemo, useState } from 'react';
import type { Exercise, FillBlankExercise } from '../engine/types';
import { gradeExercise } from '../engine/grading';
import type { Grade, QuizResponse } from '../engine/grading';
import { useProgress } from '../engine/progress';
import { Btn, CodeBlock, Markdown } from './ui';

// Renders one interactive exercise, grades it, and teaches from the answer:
// explanation + why the chosen distractor was wrong + fix walkthrough.

export function QuizCard({
  exercise,
  lessonId,
  label,
  onDone,
}: {
  exercise: Exercise;
  lessonId: string | null;
  label?: string;
  onDone: (correct: boolean) => void;
}) {
  const { actions, state } = useProgress();
  const [response, setResponse] = useState<QuizResponse | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [xpGain, setXpGain] = useState(0);
  const [hintShown, setHintShown] = useState(false);

  const hint = 'hint' in exercise ? exercise.hint : undefined;
  const ready = isReady(exercise, response);

  function check() {
    if (!response || grade) return;
    const g = gradeExercise(exercise, response);
    actions.answerQuiz(lessonId, exercise, {
      correct: g.correct,
      yourAnswer: g.yourAnswer,
      correctAnswer: g.correctAnswer,
      explanation: explanationFor(exercise, g),
    });
    const firstTime = !state.correctQuizIds.includes(exercise.id);
    setXpGain(g.correct ? (firstTime ? 8 : 3) : 0);
    setGrade(g);
  }

  return (
    <div className="animate-slide-up">
      {label && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-700">{label}</div>
      )}
      <p className="mb-4 text-[15px] font-medium leading-relaxed text-slate-100">
        {'prompt' in exercise ? exercise.prompt : ''}
      </p>

      <Body exercise={exercise} response={response} setResponse={setResponse} disabled={!!grade} graded={!!grade} />

      {hint && !grade && (
        <div className="mt-3">
          {hintShown ? (
            <p className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-sm text-amber-800">
              💡 {hint}
            </p>
          ) : (
            <button
              onClick={() => setHintShown(true)}
              className="text-xs font-medium text-amber-700 underline-offset-2 hover:text-amber-700 hover:underline"
            >
              Need a hint?
            </button>
          )}
        </div>
      )}

      {!grade ? (
        <div className="mt-5 flex items-center gap-3">
          <Btn onClick={check} disabled={!ready}>
            Check answer
          </Btn>
          {!ready && <span className="text-xs text-slate-500">Answer to continue</span>}
        </div>
      ) : (
        <Explanation exercise={exercise} grade={grade} xpGain={xpGain} onDone={() => onDone(grade.correct)} />
      )}
    </div>
  );
}

function explanationFor(exercise: Exercise, g: Grade): string {
  const base = 'explanation' in exercise ? exercise.explanation : '';
  if (exercise.kind === 'bughunt') return g.correct ? base : `${base}\n\n${exercise.fixExplanation}`;
  return base;
}

function isReady(ex: Exercise, r: QuizResponse | null): boolean {
  if (!r || r.kind !== ex.kind) return false;
  switch (r.kind) {
    case 'mcq':
      return !!r.optionId;
    case 'predict':
      return r.choiceIndex >= 0;
    case 'fillblank': {
      const ee = ex as Extract<Exercise, { kind: 'fillblank' }>;
      return ee.blanks.every((b) => (r.values[b.id] ?? '').trim() !== '');
    }
    case 'order':
      return r.itemIds.length === (ex as Extract<Exercise, { kind: 'order' }>).items.length;
    case 'bughunt':
      return r.line > 0 && !!r.causeId;
  }
}

// ---------------------------------------------------------------------------

function Body({
  exercise,
  response,
  setResponse,
  disabled,
  graded,
}: {
  exercise: Exercise;
  response: QuizResponse | null;
  setResponse: (r: QuizResponse) => void;
  disabled: boolean;
  graded: boolean;
}) {
  switch (exercise.kind) {
    case 'mcq':
      return <McqBody exercise={exercise} response={response} setResponse={setResponse} disabled={disabled} />;
    case 'predict':
      return <PredictBody exercise={exercise} response={response} setResponse={setResponse} disabled={disabled} />;
    case 'fillblank':
      return <FillBlankBody exercise={exercise} response={response} setResponse={setResponse} disabled={disabled} />;
    case 'order':
      return <OrderBody exercise={exercise} response={response} setResponse={setResponse} disabled={disabled} />;
    case 'bughunt':
      return (
        <BughuntBody
          exercise={exercise}
          response={response}
          setResponse={setResponse}
          disabled={disabled}
          graded={graded}
        />
      );
  }
}

type BodyProps = {
  exercise: Exercise;
  response: QuizResponse | null;
  setResponse: (r: QuizResponse) => void;
  disabled: boolean;
  graded?: boolean;
};

function optionClasses(selected: boolean, state: 'idle' | 'correct' | 'wrong'): string {
  if (state === 'correct') return 'border-emerald-400/60 bg-emerald-400/10 text-emerald-800';
  if (state === 'wrong') return 'border-rose-400/60 bg-rose-400/10 text-rose-800';
  return selected
    ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-900'
    : 'border-navy-600/80 bg-navy-800/60 text-slate-200 hover:border-cyan-400/40';
}

function McqBody({ exercise, response, setResponse, disabled }: BodyProps) {
  const ex = exercise as Extract<Exercise, { kind: 'mcq' }>;
  const chosen = response?.kind === 'mcq' ? response.optionId : null;
  return (
    <div className="space-y-2">
      {ex.options.map((o) => {
        const state = !chosen
          ? 'idle'
          : o.id === ex.correctId
            ? 'correct'
            : o.id === chosen
              ? 'wrong'
              : 'idle';
        return (
          <button
            key={o.id}
            disabled={disabled}
            onClick={() => setResponse({ kind: 'mcq', optionId: o.id })}
            className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${optionClasses(o.id === chosen, state)}`}
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-current/40 text-[11px] font-bold opacity-80">
              {o.id.toUpperCase()}
            </span>
            <span>{o.text}</span>
          </button>
        );
      })}
    </div>
  );
}

function PredictBody({ exercise, response, setResponse, disabled }: BodyProps) {
  const ex = exercise as Extract<Exercise, { kind: 'predict' }>;
  const chosen = response?.kind === 'predict' ? response.choiceIndex : -1;
  return (
    <div className="space-y-4">
      <CodeBlock code={ex.code} language={ex.language} />
      <div className="space-y-2">
        {ex.choices.map((c, i) => {
          const state = chosen < 0 ? 'idle' : i === ex.correctIndex ? 'correct' : i === chosen ? 'wrong' : 'idle';
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => setResponse({ kind: 'predict', choiceIndex: i })}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left font-mono text-sm transition-colors disabled:cursor-default ${optionClasses(i === chosen, state)}`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FillBlankBody({ exercise, response, setResponse, disabled }: BodyProps) {
  const ex = exercise as FillBlankExercise;
  const values = response?.kind === 'fillblank' ? response.values : {};
  const parts = useMemo(() => ex.template.split(/(\{\{\w+\}\})/g), [ex.template]);

  function setValue(blankId: string, v: string) {
    setResponse({ kind: 'fillblank', values: { ...values, [blankId]: v } });
  }

  return (
    <div className="space-y-4">
      <pre className="overflow-x-auto rounded-xl border border-navy-600/60 bg-abyss/80 p-4 font-mono text-[13px] leading-[2.1] text-slate-200">
        {parts.map((p, i) => {
          const m = p.match(/^\{\{(\w+)\}\}$/);
          if (!m) return <span key={i}>{p}</span>;
          const blank = ex.blanks.find((b) => b.id === m[1]);
          if (!blank) return <span key={i}>{p}</span>;
          return (
            <span key={i} className="mx-1 inline-flex align-middle">
              {blank.choices ? (
                <select
                  disabled={disabled}
                  value={values[blank.id] ?? ''}
                  onChange={(e) => setValue(blank.id, e.target.value)}
                  className="rounded-md border border-cyan-400/40 bg-navy-800 px-2 py-0.5 font-mono text-[12px] text-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                >
                  <option value="" disabled>
                    choose…
                  </option>
                  {blank.choices.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  disabled={disabled}
                  value={values[blank.id] ?? ''}
                  onChange={(e) => setValue(blank.id, e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  style={{ width: `${Math.max(8, Math.max(...blank.accept.map((a) => a.length)) + 2)}ch` }}
                  className="rounded-md border border-cyan-400/40 bg-navy-800 px-2 py-0.5 font-mono text-[12px] text-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                />
              )}
            </span>
          );
        })}
      </pre>
      {ex.language && <div className="text-[11px] uppercase tracking-wider text-slate-500">{ex.language}</div>}
    </div>
  );
}

function OrderBody({ exercise, response, setResponse, disabled }: BodyProps) {
  const ex = exercise as Extract<Exercise, { kind: 'order' }>;
  // Shuffle once per mount, stable while answering.
  const [initial] = useState(() => shuffleIds(ex.items.map((i) => i.id)));
  const order = response?.kind === 'order' ? response.itemIds : initial;
  const byId = new Map(ex.items.map((i) => [i.id, i]));

  function move(index: number, dir: -1 | 1) {
    const next = [...order];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setResponse({ kind: 'order', itemIds: next });
  }

  const solved = gradeAlready(response, ex);
  return (
    <div className="space-y-2">
      {order.map((id, i) => {
        const item = byId.get(id)!;
        const rightPlace = solved ? id === ex.items[i]?.id : null;
        return (
          <div
            key={id}
            className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${
              rightPlace === null
                ? 'border-navy-600/80 bg-navy-800/60 text-slate-200'
                : rightPlace
                  ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-800'
                  : 'border-rose-400/50 bg-rose-400/10 text-rose-800'
            }`}
          >
            <span className="w-6 shrink-0 text-center font-mono text-xs text-slate-500">{i + 1}</span>
            <span className="flex-1">{item.text}</span>
            {!disabled && (
              <span className="flex shrink-0 gap-1">
                <button
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="rounded-md px-1.5 py-0.5 text-slate-400 hover:bg-navy-600 hover:text-cyan-800 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  aria-label="Move down"
                  disabled={i === order.length - 1}
                  onClick={() => move(i, 1)}
                  className="rounded-md px-1.5 py-0.5 text-slate-400 hover:bg-navy-600 hover:text-cyan-800 disabled:opacity-30"
                >
                  ▼
                </button>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function gradeAlready(r: QuizResponse | null, ex: Extract<Exercise, { kind: 'order' }>): boolean {
  return !!(r && r.kind === 'order' && r.itemIds.every((id, i) => id === ex.items[i].id));
}

function shuffleIds(ids: string[]): string[] {
  const arr = [...ids];
  // Deterministic-ish shuffle that never lands on the correct order for small lists.
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.length > 1 && arr.every((id, i) => id === ids[i])) [arr[0], arr[1]] = [arr[1], arr[0]];
  return arr;
}

function BughuntBody({ exercise, response, setResponse, disabled, graded = false }: BodyProps) {
  const ex = exercise as Extract<Exercise, { kind: 'bughunt' }>;
  const line = response?.kind === 'bughunt' ? response.line : 0;
  const causeId = response?.kind === 'bughunt' ? response.causeId : null;
  const lines = ex.code.split('\n');

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Step 1 — click the line where the bug lives:</p>
      <pre className="overflow-x-auto rounded-xl border border-navy-600/60 bg-abyss/80 p-2 font-mono text-[13px]">
        {lines.map((l, i) => {
          const n = i + 1;
          const state = !line ? 'idle' : n === line ? (gradeWrongLine(ex, response) ? 'wrong' : 'correct') : 'idle';
          return (
            <div
              key={i}
              onClick={() => !disabled && setResponse({ kind: 'bughunt', line: n, causeId: causeId ?? '' })}
              className={`flex cursor-pointer gap-3 rounded-lg px-2 py-0.5 ${
                state === 'correct'
                  ? 'bg-emerald-400/15'
                  : state === 'wrong'
                    ? 'bg-rose-400/15'
                    : line === n
                      ? 'bg-cyan-400/10'
                      : 'hover:bg-navy-700/50'
              }`}
            >
              <span className="w-6 select-none text-right text-slate-600">{n}</span>
              <span className="text-slate-200">{l || ' '}</span>
            </div>
          );
        })}
      </pre>
      <p className="text-sm text-slate-400">Step 2 — what kind of problem is it?</p>
      <div className="space-y-2">
        {ex.causeOptions.map((o) => {
          const state =
            !causeId || !graded
              ? 'idle'
              : o.id === ex.causeCorrectId
                ? 'correct'
                : o.id === causeId
                  ? 'wrong'
                  : 'idle';
          return (
            <button
              key={o.id}
              disabled={disabled}
              onClick={() => setResponse({ kind: 'bughunt', line, causeId: o.id })}
              className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${optionClasses(o.id === causeId, state)}`}
            >
              {o.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function gradeWrongLine(
  ex: Extract<Exercise, { kind: 'bughunt' }>,
  r: QuizResponse | null,
): boolean {
  return !(r && r.kind === 'bughunt' && r.line === ex.buggyLine);
}

// ---------------------------------------------------------------------------

function Explanation({
  exercise,
  grade,
  xpGain,
  onDone,
}: {
  exercise: Exercise;
  grade: Grade;
  xpGain: number;
  onDone: () => void;
}) {
  const [showFix, setShowFix] = useState(false);
  const fixedCode = exercise.kind === 'bughunt' ? exercise.fixedCode : undefined;
  const fixExplanation = exercise.kind === 'bughunt' ? exercise.fixExplanation : undefined;

  return (
    <div className="mt-5 animate-pop">
      <div
        className={`rounded-2xl border p-4 ${
          grade.correct ? 'border-emerald-400/40 bg-emerald-400/5' : 'border-rose-400/40 bg-rose-400/5'
        }`}
      >
        <div className={`mb-2 text-sm font-semibold ${grade.correct ? 'text-emerald-700' : 'text-rose-700'}`}>
          {grade.correct ? '✓ Correct' : '✗ Not quite'}
          {xpGain > 0 && (
            <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-700">
              +{xpGain} XP
            </span>
          )}
        </div>
        {!grade.correct && (
          <div className="mb-3 space-y-1 text-sm">
            <p className="text-rose-800">
              <span className="text-slate-500">Your answer:</span> {grade.yourAnswer}
            </p>
            <p className="text-emerald-800">
              <span className="text-slate-500">Correct:</span> {grade.correctAnswer}
            </p>
            {grade.note && <p className="pt-1 text-amber-800">{grade.note}</p>}
          </div>
        )}
        <Markdown text={'explanation' in exercise ? exercise.explanation : ''} />
        {fixExplanation && !grade.correct && (
          <div className="mt-3 border-t border-navy-600/60 pt-3">
            <Markdown text={fixExplanation} />
          </div>
        )}
        {fixedCode && (
          <div className="mt-3">
            {showFix ? (
              <CodeBlock code={fixedCode} language={'language' in exercise ? exercise.language : undefined} />
            ) : (
              <button
                onClick={() => setShowFix(true)}
                className="text-xs font-medium text-cyan-700 underline-offset-2 hover:text-cyan-800 hover:underline"
              >
                Show the corrected code
              </button>
            )}
          </div>
        )}
      </div>
      <div className="mt-4">
        <Btn onClick={onDone}>Continue →</Btn>
      </div>
    </div>
  );
}
