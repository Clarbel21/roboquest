import { useState } from 'react';
import { ALL_CARDS, ALL_LESSONS, CATEGORIES } from '../data';
import { levelFor, useProgress } from '../engine/progress';
import { isDue, todayStr } from '../engine/srs';
import { ACCENT, Btn, Card, Chip, Markdown, ProgressBar, SectionTitle } from './ui';
import { ByteSays } from './Byte';

export function Stats() {
  const { state, actions } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
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
