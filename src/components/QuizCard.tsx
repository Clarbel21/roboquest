import { useMemo, useState } from 'react';
import type { CodeChallengeExercise, Exercise, FillBlankExercise, ScenarioExercise } from '../engine/types';
import { gradeExercise, normCode } from '../engine/grading';
import type { Grade, QuizResponse } from '../engine/grading';
import { useProgress } from '../engine/progress';
import { Btn, Card, CodeBlock, Markdown } from './ui';

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

  function check(explicit?: QuizResponse) {
    if (grade) return;
    const r = explicit ?? response;
    if (!r) return;
    const g = gradeExercise(exercise, r);
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

      <Body
        exercise={exercise}
        response={response}
        setResponse={setResponse}
        disabled={!!grade}
        graded={!!grade}
        onSubmit={check}
      />

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
        exercise.kind === 'scenario' ? null : (
          <div className="mt-5 flex items-center gap-3">
            <Btn onClick={() => check()} disabled={!ready}>
              Check answer
            </Btn>
            {!ready && <span className="text-xs text-slate-500">Answer to continue</span>}
          </div>
        )
      ) : (
        <Explanation exercise={exercise} grade={grade} xpGain={xpGain} onDone={() => onDone(grade.correct)} />
      )}
    </div>
  );
}

function explanationFor(exercise: Exercise, g: Grade): string {
  if (exercise.kind === 'bughunt') return g.correct ? exercise.explanation : `${exercise.explanation}\n\n${exercise.fixExplanation}`;
  if (exercise.kind === 'scenario')
    return g.correct
      ? exercise.wrapUp
      : `${exercise.diagnosis.explanation}\n\n${exercise.wrapUp}`;
  return 'explanation' in exercise ? exercise.explanation : '';
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
    case 'scenario':
      return !!r.diagnosisId;
    case 'codechallenge': {
      const ee = ex as CodeChallengeExercise;
      return ee.slots.every((s) => (r.values[s.id] ?? '').trim() !== '');
    }
  }
}

// ---------------------------------------------------------------------------

function Body({
  exercise,
  response,
  setResponse,
  disabled,
  graded,
  onSubmit,
}: {
  exercise: Exercise;
  response: QuizResponse | null;
  setResponse: (r: QuizResponse) => void;
  disabled: boolean;
  graded: boolean;
  onSubmit: (r?: QuizResponse) => void;
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
    case 'scenario':
      return <ScenarioBody exercise={exercise} disabled={disabled} onSubmit={onSubmit} />;
    case 'codechallenge':
      return (
        <CodeChallengeBody
          exercise={exercise}
          response={response}
          setResponse={setResponse}
          disabled={disabled}
          graded={graded}
        />
      );
  }
}

// --- Scenario: staged troubleshooting with immediate feedback, then a final
// diagnosis that is the recorded answer. --------------------------------------

function ScenarioBody({
  exercise,
  disabled,
  onSubmit,
}: {
  exercise: ScenarioExercise;
  disabled: boolean;
  onSubmit: (r: QuizResponse) => void;
}) {
  const [stageIdx, setStageIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [wrongStages, setWrongStages] = useState(0);
  const total = exercise.stages.length;
  const inDiagnosis = stageIdx >= total;
  const submitted = disabled; // parent sets disabled once graded

  function pickStage(stageIndex: number, optionId: string) {
    if (picks[stageIndex] !== undefined || disabled) return;
    const stage = exercise.stages[stageIndex];
    setPicks((p) => ({ ...p, [stageIndex]: optionId }));
    if (optionId !== stage.correctId) setWrongStages((n) => n + 1);
  }

  function pickDiagnosis(optionId: string) {
    if (submitted) return;
    onSubmit({ kind: 'scenario', diagnosisId: optionId, stageWrong: wrongStages });
  }

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-4">
        <Markdown text={exercise.prompt} />
      </div>
      {exercise.context && (
        <div className="mb-4">
          <CodeBlock code={exercise.context} language={exercise.contextLabel} />
        </div>
      )}

      {!inDiagnosis ? (
        (() => {
          const stage = exercise.stages[stageIdx];
          const picked = picks[stageIdx];
          return (
            <div className="animate-slide-up">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-700">
                <span>
                  Step {stageIdx + 1} / {total}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">{stage.title}</span>
              </div>
              <Markdown text={stage.situation} className="mb-4" />
              <p className="mb-3 text-[15px] font-medium text-slate-100">{stage.question}</p>
              <div className="space-y-2">
                {stage.options.map((o) => {
                  const state =
                    picked === undefined
                      ? 'idle'
                      : o.id === stage.correctId
                        ? 'correct'
                        : o.id === picked
                          ? 'wrong'
                          : 'idle';
                  return (
                    <button
                      key={o.id}
                      disabled={disabled || picked !== undefined}
                      onClick={() => pickStage(stageIdx, o.id)}
                      className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${optionClasses(
                        o.id === picked,
                        state as 'idle' | 'correct' | 'wrong',
                      )}`}
                    >
                      {o.text}
                    </button>
                  );
                })}
              </div>
              {picked !== undefined && (
                <div className="mt-4 animate-pop">
                  <div
                    className={`rounded-xl border p-3 ${
                      picked === stage.correctId
                        ? 'border-emerald-400/40 bg-emerald-400/5'
                        : 'border-rose-400/40 bg-rose-400/5'
                    }`}
                  >
                    <div
                      className={`mb-1 text-xs font-semibold ${
                        picked === stage.correctId ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {picked === stage.correctId ? '✓ Good call' : '✗ Not the best call'}
                    </div>
                    {picked !== stage.correctId && stage.optionNotes?.[picked] && (
                      <p className="mb-2 text-xs text-amber-800">{stage.optionNotes[picked]}</p>
                    )}
                    <Markdown text={stage.explanation} className="!text-[13px]" />
                  </div>
                  <div className="mt-4">
                    <Btn
                      onClick={() => {
                        if (stageIdx + 1 >= total) setStageIdx(total);
                        else setStageIdx((i) => i + 1);
                      }}
                    >
                      {stageIdx + 1 >= total ? 'Make the final diagnosis →' : 'Next step →'}
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <div className="animate-slide-up">
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-rose-700">
            Final diagnosis
          </div>
          <p className="mb-1 text-sm text-slate-400">
            {wrongStages === 0
              ? 'Clean investigation so far — commit to your diagnosis.'
              : `${wrongStages} earlier decision${wrongStages > 1 ? 's' : ''} could have been better. Commit to your diagnosis.`}
          </p>
          <p className="mb-3 text-[15px] font-medium text-slate-100">{exercise.diagnosis.question}</p>
          <div className="space-y-2">
            {exercise.diagnosis.options.map((o) => (
              <button
                key={o.id}
                disabled={disabled}
                onClick={() => pickDiagnosis(o.id)}
                className="w-full rounded-xl border border-navy-600/80 bg-navy-800/60 px-4 py-2.5 text-left text-sm text-slate-200 transition-colors hover:border-cyan-400/40 disabled:cursor-default"
              >
                {o.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Structured coding challenge: write real lines, validated by pattern
//     matching (nothing is executed — the UI says so). ------------------------

function CodeChallengeBody({
  exercise,
  response,
  setResponse,
  disabled,
  graded,
}: {
  exercise: CodeChallengeExercise;
  response: QuizResponse | null;
  setResponse: (r: QuizResponse) => void;
  disabled: boolean;
  graded: boolean;
}) {
  const values = response?.kind === 'codechallenge' ? response.values : {};

  function setValue(id: string, v: string) {
    setResponse({ kind: 'codechallenge', values: { ...values, [id]: v } });
  }

  const slotPass = (id: string): boolean | null => {
    if (!graded) return null;
    const slot = exercise.slots.find((s) => s.id === id)!;
    const v = normCode(values[id] ?? '');
    if (!v) return false;
    if (slot.accept.some((a) => normCode(a).toLowerCase() === v.toLowerCase())) return true;
    if (slot.requireAny) {
      const has = slot.requireAny.some((sub) => v.toLowerCase().includes(sub.toLowerCase()));
      const bad = (slot.forbid ?? []).some((sub) => v.toLowerCase().includes(sub.toLowerCase()));
      return has && !bad;
    }
    return false;
  };

  return (
    <div className="space-y-4">
      <CodeBlock code={exercise.code} language={exercise.language} />
      <div className="space-y-3">
        {exercise.slots.map((slot, i) => {
          const pass = slotPass(slot.id);
          return (
            <div key={slot.id}>
              <div className="mb-1 flex items-center gap-2 text-xs">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-navy-700 px-1.5 font-mono text-[10px] text-slate-400">
                  {i + 1}
                </span>
                <span className="text-slate-400">{slot.label}</span>
                {pass !== null && (
                  <span className={pass ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>
                    {pass ? '✓' : '✗'}
                  </span>
                )}
              </div>
              <input
                disabled={disabled}
                value={values[slot.id] ?? ''}
                onChange={(e) => setValue(slot.id, e.target.value)}
                spellCheck={false}
                autoComplete="off"
                placeholder="write the line of code…"
                className={`w-full rounded-lg border bg-white px-3 py-2 font-mono text-[13px] text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
                  pass === null
                    ? 'border-navy-600'
                    : pass
                      ? 'border-emerald-400/60 bg-emerald-400/5'
                      : 'border-rose-400/60 bg-rose-400/5'
                }`}
              />
              {graded && pass === false && (
                <p className="mt-1 font-mono text-[12px] text-emerald-700">→ {normCode(slot.accept[0])}</p>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">
        ⚠ How this is checked: your lines are validated structurally (normalized text matching against
        accepted answers) — they are <strong>not executed</strong>. Multiple correct styles can exist; the
        reference solution appears after checking.
      </p>
    </div>
  );
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
        {exercise.kind === 'codechallenge' && (
          <div className="mt-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Reference solution
            </div>
            <CodeBlock code={exercise.solution} language={exercise.language} />
          </div>
        )}
      </div>
      <div className="mt-4">
        <Btn onClick={onDone}>Continue →</Btn>
      </div>
    </div>
  );
}
