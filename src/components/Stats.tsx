import { useState } from 'react';
import { ALL_CARDS, ALL_LESSONS, CATEGORIES } from '../data';
import { levelFor, useProgress } from '../engine/progress';
import { isDue, todayStr } from '../engine/srs';
import { DIFFICULTY_LABEL } from '../engine/types';
import type { CategoryId, Difficulty, SkillAxis } from '../engine/types';
import { ACCENT, Btn, Card, Chip, Markdown, ProgressBar, SectionTitle } from './ui';
import { ByteSays } from './Byte';
import { Onboarding } from './Onboarding';

export function Stats({ onAssess }: { onAssess: (id: string) => void }) {
  const { state, actions } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const lvl = levelFor(state.xp);
  const today = todayStr();
  const dueCount = Object.values(state.srs).filter((c) => isDue(c, today)).length;
  const accuracy = state.totalAnswered ? Math.round((state.totalCorrect / state.totalAnswered) * 100) : null;
  const open = state.mistakes.filter((m) => !m.resolved);
  const resolved = state.mistakes.filter((m) => m.resolved);

  function download() {
    const blob = new Blob([actions.exportProgress()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roboquest-progress-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Last 14 days streak strip
  const days: { key: string; active: boolean }[] = [];
  for (let i = 13; i >= 0; i--) {
    const key = todayStr(new Date(Date.now() - i * 86400000));
    days.push({ key, active: state.streak.days.includes(key) });
  }

  return (
    <div className="mx-auto max-w-3xl animate-slide-up space-y-6">
      <Card>
        <SectionTitle
          right={
            <button
              onClick={() => setEditProfile((e) => !e)}
              className="text-xs text-cyan-700 underline-offset-2 hover:text-cyan-800 hover:underline"
            >
              {editProfile ? 'close' : 'edit'}
            </button>
          }
        >
          Your profile
        </SectionTitle>
        {editProfile ? (
          <Onboarding mode="edit" onDone={() => setEditProfile(false)} />
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <Chip className="border border-cyan-400/40 bg-cyan-400/10 text-cyan-800">
              {state.profile?.name?.trim() || 'anonymous engineer'}
            </Chip>
            <Chip className="border border-navy-600 bg-navy-800/70 text-slate-400">
              goal: {state.profile?.goal ?? 'fundamentals'}
            </Chip>
            <Chip className="border border-navy-600 bg-navy-800/70 text-slate-400">
              {state.profile?.dailyMinutes ?? 15} min/day
            </Chip>
            {state.profile?.focusArea && (
              <Chip className="border border-teal-400/30 bg-teal-400/10 text-teal-700">
                focus: {state.profile.focusArea}
              </Chip>
            )}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>Competency map</SectionTitle>
        <div className="space-y-3">
          {(['recognition', 'application', 'debugging', 'explanation'] as SkillAxis[]).map((axis) => {
            const st = state.axisStats?.[axis] ?? { correct: 0, attempts: 0 };
            const pct = st.attempts ? Math.round((st.correct / st.attempts) * 100) : null;
            const desc = {
              recognition: 'recalling concepts (multiple choice)',
              application: 'applying them (prediction, fill-in, writing code)',
              debugging: 'finding and diagnosing faults (bug hunts, scenarios)',
              explanation: 'committing to a root cause and its reasoning (scenario diagnosis)',
            }[axis];
            return (
              <div key={axis}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium capitalize text-slate-300">{axis}</span>
                  <span className="text-slate-500">
                    {pct === null ? 'no data yet' : `${pct}% · ${st.correct}/${st.attempts}`}
                  </span>
                </div>
                <ProgressBar value={pct === null ? 0 : pct / 100} accent={axis === 'debugging' ? 'rose' : axis === 'application' ? 'cyan' : axis === 'explanation' ? 'teal' : 'sky'} />
                <p className="mt-0.5 text-[10px] text-slate-500">{desc}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
          Measured separately on purpose: strong recognition with weak debugging means concepts are familiar
          but not yet operational — that gap is exactly what the Application and Troubleshooting tiers train.
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Box value={`${state.xp}`} label="total XP" color="text-cyan-700" />
        <Box value={`Lv ${lvl.level}`} label={lvl.title} color="text-teal-700" />
        <Box value={`🔥 ${state.streak.current}`} label={`best ${state.streak.best}`} color="text-amber-700" />
        <Box value={accuracy === null ? '—' : `${accuracy}%`} label={`${state.totalCorrect}/${state.totalAnswered} correct`} color="text-rose-700" />
      </div>

      <Card>
        <SectionTitle>Last 14 days</SectionTitle>
        <div className="flex gap-1.5">
          {days.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
              <div
                title={d.key}
                className={`h-8 w-full rounded-md ${
                  d.active ? 'bg-amber-400/70 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'bg-navy-700'
                }`}
              />
              <span className="text-[9px] text-slate-600">{d.key.slice(8)}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {dueCount} card{dueCount === 1 ? '' : 's'} due today · {Object.keys(state.completedLessons).length}/
          {ALL_LESSONS.length} lessons complete · {ALL_CARDS.length - Object.keys(state.srs).length} cards unseen
        </p>
      </Card>

      <div>
        <SectionTitle right={<span className="text-xs text-slate-500">{open.length} open</span>}>
          Mistake notebook
        </SectionTitle>
        {state.mistakes.length === 0 ? (
          <Card>
            <ByteSays text="The mistake notebook is empty. Either you are flawless or you have not started — either way, I approve." />
          </Card>
        ) : (
          <div className="space-y-3">
            {open.map((m) => (
              <Card key={m.id} className="border-rose-400/25">
                <div className="text-sm font-medium text-slate-200">
                  <Markdown text={m.prompt} className="!text-sm" />
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <p className="text-rose-700">
                    <span className="text-slate-500">Your answer: </span>
                    {m.yourAnswer}
                  </p>
                  <p className="text-emerald-700">
                    <span className="text-slate-500">Correct: </span>
                    {m.correctAnswer}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{m.explanation}</p>
                <p className="mt-2 text-[11px] text-slate-600">missed {m.day} · will resurface in daily missions</p>
              </Card>
            ))}
            {resolved.length > 0 && (
              <Card>
                <div className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                  Conquered ({resolved.length})
                </div>
                <div className="mt-2 space-y-1.5">
                  {resolved.map((m) => (
                    <p key={m.id} className="truncate text-xs text-slate-500">
                      <span className="text-emerald-600">✓</span> {m.prompt}
                    </p>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      <Card>
        <SectionTitle>Data</SectionTitle>
        <div className="flex flex-wrap items-center gap-3">
          <Btn variant="ghost" onClick={download}>
            Export progress (JSON)
          </Btn>
          {!confirmReset ? (
            <Btn variant="danger" onClick={() => setConfirmReset(true)}>
              Reset all progress
            </Btn>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-700">Erase everything? This cannot be undone.</span>
              <Btn variant="danger" onClick={() => { actions.resetProgress(); setConfirmReset(false); }}>
                Yes, reset
              </Btn>
              <Btn variant="ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </Btn>
            </div>
          )}
        </div>
        <p className="mt-3 text-[11px] text-slate-600">
          Progress lives in your browser's localStorage — nothing leaves this machine. Export gives you a backup you
          can re-import later.
        </p>
      </Card>

      <div>
        <SectionTitle
          right={
            <button
              onClick={() => onAssess('python')}
              className="text-xs text-cyan-700 underline-offset-2 hover:text-cyan-800 hover:underline"
            >
              Take the placement check →
            </button>
          }
        >
          Starting levels
        </SectionTitle>
        <Card className="mb-2.5">
          <p className="text-xs leading-relaxed text-slate-500">
            Your per-subject starting level steers the daily missions: lessons below it are not pushed as
            "next up" (they stay available on each category page). Take the placement check or override
            manually — you know your head better than a quiz does.
          </p>
        </Card>
        <div className="space-y-2.5">
          {CATEGORIES.map((c) => {
            const a = ACCENT[c.accent];
            const result = state.assessment?.[c.id];
            return (
              <Card key={c.id} className="p-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span>{c.icon}</span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-slate-200">{c.name}</span>
                  {result ? (
                    <Chip className={`border ${a.border} ${a.chip} ${a.text}`}>
                      {DIFFICULTY_LABEL[result.level]}
                      {result.auto ? '' : ' (manual)'}
                    </Chip>
                  ) : (
                    <Chip className="border border-navy-600 bg-navy-800/70 text-slate-400">not assessed</Chip>
                  )}
                  <button
                    onClick={() => onAssess(c.id)}
                    className="text-xs text-cyan-700 underline-offset-2 hover:text-cyan-800 hover:underline"
                  >
                    check
                  </button>
                  <select
                    value={result?.auto === false ? result.level : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) actions.setAssessment(c.id as CategoryId, v as Difficulty, false);
                    }}
                    className="rounded-lg border border-navy-600 bg-navy-800 px-2 py-1 text-xs text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                  >
                    <option value="">override…</option>
                    <option value="foundation">Foundation</option>
                    <option value="application">Application</option>
                    <option value="troubleshooting">Troubleshooting</option>
                  </select>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle>Category mastery</SectionTitle>
        <div className="space-y-2.5">
          {CATEGORIES.map((c) => {
            const done = c.lessons.filter((l) => state.completedLessons[l.id] !== undefined).length;
            const cardsSeen = c.flashcards.filter((f) => state.srs[f.id]).length;
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-center gap-3">
                  <span>{c.icon}</span>
                  <span className="flex-1 text-sm font-medium text-slate-200">{c.name}</span>
                  <Chip className="border border-navy-600 bg-navy-800/70 text-slate-400">
                    {done}/{c.lessons.length} lessons · {cardsSeen}/{c.flashcards.length} cards
                  </Chip>
                </div>
                <ProgressBar
                  value={c.lessons.length ? done / c.lessons.length : 0}
                  accent={c.accent}
                  className="mt-2.5"
                />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Box({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <Card className="p-4">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="mt-0.5 truncate text-xs text-slate-500">{label}</div>
    </Card>
  );
}
