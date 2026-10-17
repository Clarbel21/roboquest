import { CATEGORIES } from '../data';
import { dailyHeadline } from './DailyMission';
import { LEVELS, levelFor, useProgress } from '../engine/progress';
import { isDue, todayStr } from '../engine/srs';
import { ACCENT, Btn, Card, Chip, ProgressBar, SectionTitle } from './ui';
import { Byte, ByteSays } from './Byte';

export function Dashboard({
  onDaily,
  onCategory,
  onFlashcards,
  onAssess,
}: {
  onDaily: () => void;
  onCategory: (id: string) => void;
  onFlashcards: () => void;
  onAssess: (id: string) => void;
}) {
  const { state } = useProgress();
  const lvl = levelFor(state.xp);
  const headline = dailyHeadline(state);
  const today = todayStr();
  const dueCount = Object.values(state.srs).filter((c) => isDue(c, today)).length;
  const session = state.dailyLog[today];
  const totalLessons = CATEGORIES.reduce((n, c) => n + c.lessons.length, 0);
  const doneLessons = Object.keys(state.completedLessons).length;
  const accuracy = state.totalAnswered ? Math.round((state.totalCorrect / state.totalAnswered) * 100) : null;

  return (
    <div className="mx-auto max-w-5xl animate-slide-up space-y-6">
      {/* First-run welcome */}
      {state.xp === 0 && doneLessons === 0 && (
        <div className="pt-2">
          <ByteSays
            text="Welcome to the facility, engineer. Each day I schedule a 15-minute mission: five flashcards to warm up, one short lesson, five challenge questions. Show up daily and the streak grows; miss answers and I will resurface them until they stick. Start with the mission below — or pick any system you like."
            mood="happy"
          />
        </div>
      )}

      {/* Hero */}
      <Card className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Byte size={96} mood={headline.done ? 'happy' : 'idle'} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-slate-100">
            {headline.done ? 'Systems stable today.' : 'Welcome back, engineer.'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{headline.text}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Chip className="border border-amber-400/30 bg-amber-400/10 text-amber-700">
              🔥 {state.streak.current} day streak
            </Chip>
            <Chip className="border border-cyan-400/30 bg-cyan-400/10 text-cyan-700">⭐ {state.xp} XP</Chip>
            <Chip className="border border-teal-400/30 bg-teal-400/10 text-teal-700">
              Lv {lvl.level} · {lvl.title}
            </Chip>
          </div>
          <div className="mt-3 max-w-xs">
            <ProgressBar value={lvl.span > 1 ? lvl.into / lvl.span : 1} accent="cyan" />
            <div className="mt-1 text-[11px] text-slate-500">
              {lvl.span > 1
                ? `${lvl.into}/${lvl.span} XP to level ${lvl.level + 1} · ${LEVELS[lvl.level]?.title ?? ''}`
                : 'Top rank reached — teach Byte your tricks'}
            </div>
          </div>
        </div>
      </Card>

      {/* Placement check nudge — only while subjects are unassessed */}
      {CATEGORIES.some((c) => !state.assessment?.[c.id]) && (
        <Card className="border-teal-400/25">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-teal-700">Placement check</div>
              <h2 className="mt-1 text-sm font-semibold text-slate-200">
                Three questions per subject calibrate where daily missions start
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Skips the basics you clearly still own · manual overrides in Stats
              </p>
            </div>
            <Btn variant="ghost" onClick={() => onAssess('isaac')} className="shrink-0">
              Calibrate levels →
            </Btn>
          </div>
        </Card>
      )}

      {/* Daily mission CTA */}
      <Card className={`border-cyan-400/25 ${session?.done ? '' : 'shadow-glow'}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-cyan-700">Daily mission</div>
            <h2 className="mt-1 text-lg font-bold text-slate-100">
              {session?.done
                ? 'Mission complete — facility holding'
                : '5 review cards · 1 lesson · 5 challenge questions'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              ~15 minutes · picks up exactly where you left off
            </p>
          </div>
          {session?.done ? (
            <div className="flex gap-2">
              <Btn variant="ghost" onClick={onFlashcards}>
                Extra credit: flashcards
              </Btn>
            </div>
          ) : (
            <Btn onClick={onDaily} className="shrink-0 px-6 py-3 text-base">
              {session ? 'Resume mission →' : 'Start mission →'}
            </Btn>
          )}
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox label="Lessons done" value={`${doneLessons}/${totalLessons}`} accent="sky" />
        <StatBox label="Cards due" value={String(dueCount)} accent="amber" />
        <StatBox label="Accuracy" value={accuracy === null ? '—' : `${accuracy}%`} accent="teal" />
        <StatBox label="Best streak" value={`${state.streak.best}d`} accent="rose" />
      </div>

      {/* Topic progress */}
      <div>
        <SectionTitle
          right={
            <button
              onClick={onFlashcards}
              className="text-xs text-cyan-700 underline-offset-2 hover:text-cyan-800 hover:underline"
            >
              Flashcard decks →
            </button>
          }
        >
          Facility systems
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const done = c.lessons.filter((l) => state.completedLessons[l.id] !== undefined).length;
            const a = ACCENT[c.accent];
            return (
              <button
                key={c.id}
                onClick={() => onCategory(c.id)}
                className={`group rounded-2xl border border-navy-600/60 bg-navy-900/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{c.icon}</span>
                  <span className={`text-xs font-semibold ${a.text}`}>
                    {done}/{c.lessons.length}
                  </span>
                </div>
                <div className="mt-2 truncate text-sm font-semibold text-slate-200">{c.name}</div>
                <ProgressBar value={c.lessons.length ? done / c.lessons.length : 0} accent={c.accent} className="mt-2.5" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'sky' | 'amber' | 'teal' | 'rose';
}) {
  const color = { sky: 'text-sky-700', amber: 'text-amber-700', teal: 'text-teal-700', rose: 'text-rose-700' }[accent];
  return (
    <Card className="p-4">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="mt-0.5 text-xs text-slate-500">{label}</div>
    </Card>
  );
}
