import { useState } from 'react';
import { ProgressProvider, levelFor, useProgress } from './engine/progress';
import { isDue, todayStr } from './engine/srs';
import { Dashboard } from './components/Dashboard';
import { DailyMission } from './components/DailyMission';
import { CategoryView } from './components/CategoryView';
import { Flashcards } from './components/Flashcards';
import { Stats } from './components/Stats';
import { DiagnosticView } from './components/Diagnostic';
import { Onboarding } from './components/Onboarding';
import { Lab } from './components/Lab';

type View =
  | { name: 'home' }
  | { name: 'daily' }
  | { name: 'lab' }
  | { name: 'flashcards'; filter?: string }
  | { name: 'stats' }
  | { name: 'assess'; id?: string }
  | { name: 'category'; id: string };

function Shell() {
  const { state } = useProgress();
  const [view, setView] = useState<View>({ name: 'home' });
  const lvl = levelFor(state.xp);
  const dueCount = Object.values(state.srs).filter((c) => isDue(c, todayStr())).length;
  const onboarded = state.profile?.onboarded ?? false;

  const tabs: { id: View['name']; label: string; badge?: number }[] = [
    { id: 'home', label: 'Home' },
    { id: 'daily', label: 'Daily' },
    { id: 'lab', label: 'My Lab' },
    { id: 'flashcards', label: 'Flashcards', badge: dueCount || undefined },
    { id: 'stats', label: 'Stats' },
  ];

  return (
    <div className="min-h-screen bg-abyss text-slate-200">
      {/* backdrop glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(1200px 500px at 70% -10%, rgba(56,160,230,0.18), transparent 60%), radial-gradient(900px 420px at 10% 110%, rgba(150,120,250,0.12), transparent 60%)',
        }}
      />
      <header className="sticky top-0 z-20 border-b border-navy-600/50 bg-abyss/85 backdrop-blur">
        {onboarded && (
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <button
            onClick={() => setView({ name: 'home' })}
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded-lg"
          >
            <span className="text-xl">🤖</span>
            <span className="text-base font-extrabold tracking-tight text-slate-100">
              Robo<span className="text-cyan-400">Quest</span>
            </span>
          </button>

          <nav className="ml-auto flex items-center gap-0.5 sm:gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setView({ name: t.id } as View)}
                className={`relative rounded-lg px-2 py-1.5 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 sm:px-3 sm:text-sm ${
                  view.name === t.id || (t.id === 'home' && view.name === 'category')
                    ? 'bg-navy-700/80 text-cyan-800'
                    : 'text-slate-400 hover:bg-navy-800/70 hover:text-slate-200'
                }`}
              >
                {t.label}
                {t.badge ? (
                  <span className="ml-1 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                    {t.badge}
                  </span>
                ) : null}
              </button>
            ))}
            <span className="ml-2 hidden items-center gap-2 rounded-full border border-navy-600/70 px-3 py-1 text-xs text-slate-400 sm:flex">
              <span title="XP">⭐ {state.xp}</span>
              <span className="text-navy-600">|</span>
              <span title={`Level ${lvl.level}: ${lvl.title}`}>Lv {lvl.level}</span>
              <span className="text-navy-600">|</span>
              <span title="streak">🔥 {state.streak.current}</span>
            </span>
          </nav>
        </div>
        )}
      </header>

      {!onboarded ? (
        <main className="relative z-10 mx-auto max-w-5xl px-4 py-8">
          <Onboarding mode="gate" onDone={() => setView({ name: 'home' })} />
        </main>
      ) : (
      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8">
        {view.name === 'home' && (
          <Dashboard
            onDaily={() => setView({ name: 'daily' })}
            onCategory={(id) => setView({ name: 'category', id })}
            onFlashcards={() => setView({ name: 'flashcards' })}
            onAssess={(id) => setView({ name: 'assess', id })}
            onLab={() => setView({ name: 'lab' })}
          />
        )}
        {view.name === 'lab' && <Lab />}
        {view.name === 'assess' && (
          <DiagnosticView
            initialCategory={view.id}
            onDone={() => setView({ name: 'stats' })}
          />
        )}
        {view.name === 'daily' && (
          <DailyMission
            onHome={() => setView({ name: 'home' })}
            onFlashcards={() => setView({ name: 'flashcards' })}
          />
        )}
        {view.name === 'flashcards' && (
          <Flashcards
            initialFilter={view.filter as never}
            onHome={() => setView({ name: 'home' })}
          />
        )}
        {view.name === 'stats' && <Stats onAssess={(id) => setView({ name: 'assess', id })} />}
        {view.name === 'category' && (
          <CategoryView
            categoryId={view.id}
            onHome={() => setView({ name: 'home' })}
            onStudyCards={() => setView({ name: 'flashcards', filter: view.id })}
          />
        )}
      </main>
      )}

      {onboarded && (
      <footer className="relative z-10 pb-8 pt-2 text-center text-[11px] text-slate-500">
        RoboQuest Lite · progress saved locally in this browser · Isaac Sim content is conceptual and points to
        official NVIDIA documentation
      </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <Shell />
    </ProgressProvider>
  );
}
