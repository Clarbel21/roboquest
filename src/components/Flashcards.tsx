import { useMemo, useState } from 'react';
import { CATEGORIES, ALL_CARDS } from '../data';
import { useProgress } from '../engine/progress';
import { isDue, todayStr } from '../engine/srs';
import { Btn, Card, Chip } from './ui';
import { FlashcardRunner } from './FlashcardRunner';

// Flashcard hub: pick a deck (all / per category), review due cards first,
// then unseen ones. "All caught up" offers free practice.

type Filter = 'all' | 'due' | (typeof CATEGORIES)[number]['id'];

export function Flashcards({ initialFilter = 'all', onHome }: { initialFilter?: Filter; onHome: () => void }) {
  const { state } = useProgress();
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [sessionId, setSessionId] = useState(0);
  const today = todayStr();

  const queue = useMemo(() => {
    let pool = ALL_CARDS;
    if (filter === 'due') pool = pool.filter((c) => state.srs[c.id]);
    else if (filter !== 'all') pool = pool.filter((c) => c.categoryId === filter);
    const due = pool.filter((c) => state.srs[c.id] && isDue(state.srs[c.id], today));
    const fresh = pool.filter((c) => !state.srs[c.id]);
    const rest = pool.filter((c) => state.srs[c.id] && !isDue(state.srs[c.id], today));
    return [...due, ...fresh, ...rest].slice(0, filter === 'due' ? 30 : 15);
    // sessionId forces a fresh queue when a session restarts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, state.srs, today, sessionId]);

  const dueTotal = Object.values(state.srs).filter((c) => isDue(c, today)).length;
  const unseen = ALL_CARDS.filter((c) => !state.srs[c.id]).length;

  return (
    <div className="mx-auto max-w-3xl animate-slide-up">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <DeckChip active={filter === 'all'} onClick={() => setFilter('all')} label={`All decks (${ALL_CARDS.length})`} />
        <DeckChip
          active={filter === 'due'}
          onClick={() => setFilter('due')}
          label={`Due today (${dueTotal})`}
        />
        {CATEGORIES.map((c) => (
          <DeckChip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)} label={`${c.icon} ${c.name}`} />
        ))}
      </div>

      {queue.length === 0 ? (
        <Card className="text-center">
          <div className="text-5xl">✨</div>
          <h3 className="mt-3 text-lg font-bold text-slate-100">All caught up</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            {unseen > 0
              ? `${unseen} unseen cards are waiting in other decks — or come back tomorrow when reviews mature.`
              : 'No cards due right now. The scheduler will bring the next batch when your memory needs it.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Btn variant="ghost" onClick={onHome}>
              Back to base
            </Btn>
            {dueTotal === 0 && ALL_CARDS.length > 0 && (
              <Btn onClick={() => setSessionId((s) => s + 1)}>Practice a mixed set anyway</Btn>
            )}
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <Chip className="border border-navy-600 bg-navy-800/70 text-slate-400">
              {filter === 'all' ? 'Mixed deck' : filter === 'due' ? 'Everything due' : CATEGORIES.find((c) => c.id === filter)?.name}
            </Chip>
            <Chip className="border border-navy-600 bg-navy-800/70 text-slate-400">{queue.length} cards queued</Chip>
          </div>
          <FlashcardRunner key={`${filter}-${sessionId}`} cards={queue} onDone={() => setSessionId((s) => s + 1)} />
        </>
      )}
    </div>
  );
}

function DeckChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-800'
          : 'border-navy-600/70 bg-navy-900/60 text-slate-400 hover:border-cyan-400/30 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );
}
