import { useMemo, useState } from 'react';
import { CATEGORIES, CATEGORY_BY_ID } from '../data';
import { DIAGNOSTICS } from '../data/diagnostics';
import { DIFFICULTY_LABEL, DIFFICULTY_ORDER } from '../engine/types';
import type { CategoryId, DiagnosticQuestion, Difficulty } from '../engine/types';
import { useProgress } from '../engine/progress';
import { ACCENT, Btn, Card, Chip, Markdown } from './ui';
import { ByteSays } from './Byte';

// Placement check: three questions per subject — one per tier (Foundation,
// Application, Troubleshooting). The highest cleared tier is the recommended
// starting level; the learner can override it per subject at any time.

export function DiagnosticView({
  initialCategory,
  onDone,
}: {
  initialCategory?: string;
  onDone: () => void;
}) {
  const { state, actions } = useProgress();
  const [category, setCategory] = useState<CategoryId | null>(
    (initialCategory as CategoryId) ?? null,
  );
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});

  const questions: DiagnosticQuestion[] = useMemo(
    () => (category ? DIAGNOSTICS.filter((q) => q.categoryId === category) : []),
    [category],
  );

  function levelFor(questions: DiagnosticQuestion[], answers: Record<string, string>): Difficulty {
    let level: Difficulty = 'foundation';
    for (const q of questions) {
      if (answers[q.id] === q.correctId) level = q.tier;
    }
    return level;
  }

  if (!category) {
    const assessed = CATEGORIES.filter((c) => state.assessment?.[c.id]);
    return (
      <div className="mx-auto max-w-3xl animate-slide-up">
        <button onClick={onDone} className="mb-4 text-xs text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline">
          ← Back
        </button>
        <Card className="mb-6">
          <h1 className="text-xl font-bold text-slate-100">Placement check</h1>
          <p className="mt-1 text-sm text-slate-400">
            Three questions per subject — Foundation, Application, Troubleshooting. Your answers set the
            recommended starting level per subject and steer the daily missions. Not graded, not recorded in
            your mistake notebook.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {CATEGORIES.map((c) => {
              const a = ACCENT[c.accent];
              const result = state.assessment?.[c.id];
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategory(c.id);
                    setPhase('quiz');
                    setQIndex(0);
                    setPicks({});
                  }}
                  className="flex items-center gap-3 rounded-xl border border-navy-600/60 bg-navy-800/50 px-4 py-3 text-left transition-colors hover:border-cyan-400/40"
                >
                  <span className="text-xl">{c.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-200">{c.name}</span>
                    <span className={`block text-xs ${a.text}`}>
                      {result ? `Start at: ${DIFFICULTY_LABEL[result.level]}${result.auto ? '' : ' (manual)'}` : 'not assessed'}
                    </span>
                  </span>
                  <span className="text-xs text-cyan-700">check →</span>
                </button>
              );
            })}
          </div>
          {assessed.length > 0 && (
            <p className="mt-4 text-xs text-slate-500">
              {assessed.length}/8 subjects assessed · overrides live in Stats
            </p>
          )}
        </Card>
      </div>
    );
  }

  const cat = CATEGORY_BY_ID[category];
  const a = ACCENT[cat.accent];

  if (phase === 'quiz') {
    const q = questions[qIndex];
    const picked = picks[q.id];
    return (
      <div className="mx-auto max-w-2xl animate-slide-up">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-xl">{cat.icon}</span>
          <div className="flex-1 text-sm font-semibold text-slate-200">
            {cat.name} · placement check
          </div>
          <span className="text-xs text-slate-500">
            {qIndex + 1} / {questions.length}
          </span>
        </div>
        <Card>
          <Chip className={`mb-3 border ${a.border} ${a.chip} ${a.text}`}>
            screens: {DIFFICULTY_LABEL[q.tier]}
          </Chip>
          <p className="mb-4 text-[15px] font-medium leading-relaxed text-slate-100">{q.prompt}</p>
          <div className="space-y-2">
            {q.options.map((o) => {
              const state =
                picked === undefined
                  ? 'idle'
                  : o.id === q.correctId
                    ? 'correct'
                    : o.id === picked
                      ? 'wrong'
                      : 'idle';
              return (
                <button
                  key={o.id}
                  disabled={picked !== undefined}
                  onClick={() => setPicks((p) => ({ ...p, [q.id]: o.id }))}
                  className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${
                    state === 'correct'
                      ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-800'
                      : state === 'wrong'
                        ? 'border-rose-400/60 bg-rose-400/10 text-rose-800'
                        : 'border-navy-600/80 bg-navy-800/60 text-slate-200 hover:border-cyan-400/40'
                  }`}
                >
                  {o.text}
                </button>
              );
            })}
          </div>
          {picked !== undefined && (
            <div className="mt-4 animate-pop">
              <Markdown text={q.explanation} className="!text-[13px]" />
              <div className="mt-4">
                <Btn
                  onClick={() => {
                    if (qIndex + 1 >= questions.length) setPhase('result');
                    else setQIndex((i) => i + 1);
                  }}
                >
                  {qIndex + 1 >= questions.length ? 'See recommendation →' : 'Next question →'}
                </Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Result
  const level = levelFor(questions, picks);
  const existing = state.assessment?.[category];
  return (
    <div className="mx-auto max-w-2xl animate-pop">
      <Card>
        <div className="text-center">
          <div className="text-4xl">{cat.icon}</div>
          <h2 className="mt-2 text-lg font-bold text-slate-100">
            {cat.name}: recommended start
          </h2>
          <div className="mt-4 flex justify-center gap-2">
            {DIFFICULTY_ORDER.map((d) => (
              <div
                key={d}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  d === level
                    ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-800'
                    : 'border-navy-600/60 bg-navy-900/40 text-slate-500'
                }`}
              >
                {DIFFICULTY_LABEL[d]}
              </div>
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm text-slate-400">
            {level === 'foundation'
              ? 'Start from the beginning — the basics will come back quickly, and the app will not push you past them until the fundamentals land again.'
              : level === 'application'
                ? 'Fundamentals look intact. Start at Application-level lessons; Foundation stays available on the category page.'
                : 'Strong showing. Skip ahead to Troubleshooting material — Engineering Missions unlock as you complete them.'}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Engineering Missions are earned by completing the missions before them, not by placement.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Btn
            onClick={() => {
              actions.setAssessment(category, level, true);
              onDone();
            }}
          >
            Use this level
          </Btn>
          <Btn
            variant="ghost"
            onClick={() => {
              setCategory(null);
              setPhase('intro');
            }}
          >
            Check another subject
          </Btn>
        </div>
        {existing && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Previous setting: {DIFFICULTY_LABEL[existing.level]}
            {existing.auto ? '' : ' (manual)'} — you can also override in Stats.
          </p>
        )}
      </Card>
      <div className="mt-4">
        <ByteSays text="Placement is a starting point, not a verdict. Override it whenever your memory disagrees with my questions — you know your head better than a three-question quiz does." />
      </div>
    </div>
  );
}
