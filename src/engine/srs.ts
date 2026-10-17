import type { Rating, SrsCard } from './types';

// Simple, well-defined spaced repetition (SM-2 inspired):
//  - again -> card comes back later the same day (relearn), ease drops
//  - hard  -> half of the current interval, at least 1 day
//  - good  -> interval * ease (new cards graduate to 1 day)
//  - easy  -> interval * ease * 1.3, ease rises
// Intervals are capped at 180 days so nothing disappears forever.

export const MAX_INTERVAL = 180;

export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return todayStr(date);
}

export function newCard(today: string): SrsCard {
  return { due: today, intervalDays: 0, ease: 2.3, reps: 0, lapses: 0, last: today };
}

export function previewInterval(card: SrsCard, rating: Rating): string {
  const next = schedule(card, rating);
  if (next.due === todayStr()) return 'today';
  const days = Math.round((parseDate(next.due) - parseDate(todayStr())) / 86400000);
  return days === 1 ? '1 day' : `${days} days`;
}

function parseDate(s: string): number {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

export function schedule(card: SrsCard, rating: Rating, today: string = todayStr()): SrsCard {
  let { intervalDays: interval, ease, lapses } = card;

  switch (rating) {
    case 'again':
      interval = 0;
      ease = Math.max(1.6, ease - 0.2);
      lapses += 1;
      break;
    case 'hard':
      interval = interval === 0 ? 0.5 : Math.max(1, interval * 1.2);
      ease = Math.max(1.6, ease - 0.15);
      break;
    case 'good':
      interval = interval === 0 ? 1 : interval * ease;
      break;
    case 'easy':
      interval = interval === 0 ? 2 : interval * ease * 1.3;
      ease = Math.min(3.0, ease + 0.15);
      break;
  }

  interval = Math.min(MAX_INTERVAL, interval);
  const due = addDays(today, Math.floor(interval)); // floor(0.5)=0 -> due today
  return { due, intervalDays: interval, ease, reps: card.reps + 1, lapses, last: today };
}

export function isDue(card: SrsCard, today: string = todayStr()): boolean {
  return card.due <= today;
}
