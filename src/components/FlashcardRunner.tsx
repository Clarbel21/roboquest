import { useState } from 'react';
import type { Flashcard, Rating } from '../engine/types';
import { useProgress } from '../engine/progress';
import { previewInterval } from '../engine/srs';
import { Btn, Card, CodeBlock, Markdown } from './ui';

// Flashcard review: flip, then rate Again/Hard/Good/Easy. Scheduling is
// handled by the progress store; previews show when the card returns.

const RATINGS: { id: Rating; label: string; key: string; classes: string }[] = [
  { id: 'again', label: 'Again', key: '1', classes: 'border-rose-400/40 text-rose-700 hover:bg-rose-400/10' },
  { id: 'hard', label: 'Hard', key: '2', classes: 'border-amber-400/40 text-amber-700 hover:bg-amber-400/10' },
  { id: 'good', label: 'Good', key: '3', classes: 'border-teal-400/40 text-teal-700 hover:bg-teal-400/10' },
  { id: 'easy', label: 'Easy', key: '4', classes: 'border-emerald-400/40 text-emerald-700 hover:bg-emerald-400/10' },
];

export function FlashcardRunner({
  cards,
  onDone,
}: {
  cards: Flashcard[];
  onDone: () => void;
}) {
  const { actions, state } = useProgress();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <Card className="text-center">
        <p className="text-sm text-slate-400">No cards in this queue.</p>
        <div className="mt-4">
          <Btn variant="ghost" onClick={onDone}>
            Back
          </Btn>
        </div>
      </Card>
    );
  }

  if (index >= cards.length) {
    return (
      <Card className="animate-pop text-center">
        <div className="text-5xl">🧠</div>
        <h3 className="mt-3 text-xl font-bold text-slate-100">Review complete</h3>
        <p className="mt-1 text-sm text-slate-400">
          {cards.length} card{cards.length > 1 ? 's' : ''} scheduled. Byte will resurface them exactly when
          memory needs the workout.
        </p>
        <div className="mt-5">
          <Btn onClick={onDone}>Done →</Btn>
        </div>
      </Card>
    );
  }

  const card = cards[index];

  function rate(r: Rating) {
    actions.rateCard(card.id, r);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  const srs = state.srs[card.id];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          Card {index + 1} / {cards.length}
        </span>
        <span>{srs ? `reviewed ${srs.reps}×` : 'new card'}</span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => !flipped && setFlipped(true)}
        onKeyDown={(e) => {
          if (e.key === ' ' && !flipped) {
            e.preventDefault();
            setFlipped(true);
          }
          if (flipped && ['1', '2', '3', '4'].includes(e.key)) {
            rate(RATINGS[Number(e.key) - 1].id);
          }
        }}
        className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded-2xl"
      >
        <Card className="min-h-[260px] transition-all duration-200">
          {!flipped ? (
            <div className="flex min-h-[228px] flex-col items-center justify-center text-center animate-pop">
              <div className="mb-2 text-xs uppercase tracking-widest text-slate-500">{card.concept}</div>
              <div className="text-2xl font-bold text-slate-100">{card.concept}</div>
              <div className="mt-6 text-xs text-slate-500">click or press Space to reveal</div>
            </div>
          ) : (
            <div className="animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 text-xs uppercase tracking-widest text-cyan-700">{card.concept}</div>
              <Markdown text={card.explanation} />
              {card.code && (
                <div className="mt-4">
                  <CodeBlock code={card.code} language={card.language} />
                </div>
              )}
              {card.example && (
                <p className="mt-3 text-sm text-slate-400">
                  <span className="text-slate-500">Example: </span>
                  {card.example}
                </p>
              )}
              {card.misconception && (
                <p className="mt-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-sm text-amber-800">
                  ⚠ Common misconception: {card.misconception}
                </p>
              )}
              {card.application && (
                <p className="mt-2 text-sm text-teal-700">
                  <span className="text-slate-500">In real work: </span>
                  {card.application}
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {flipped && (
        <div className="mt-4 grid animate-pop grid-cols-2 gap-2 sm:grid-cols-4">
          {RATINGS.map((r) => (
            <button
              key={r.id}
              onClick={() => rate(r.id)}
              className={`rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition-colors ${r.classes}`}
            >
              <span className="block">{r.label}</span>
              <span className="block text-[11px] font-normal opacity-70">{previewInterval(state.srs[card.id] ?? { due: '', intervalDays: 0, ease: 2.3, reps: 0, lapses: 0, last: '' }, r.id)}</span>
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-center text-[11px] text-slate-600">
        keyboard: Space = flip · 1 Again · 2 Hard · 3 Good · 4 Easy
      </p>
    </div>
  );
}
