import { useState } from 'react';
import { CATEGORY_BY_ID, LESSON_BY_ID } from '../data';
import { useProgress } from '../engine/progress';
import { ACCENT, Btn, Card, Chip, ProgressBar } from './ui';
import { LessonRunner } from './LessonRunner';

export function CategoryView({ categoryId, onHome, onStudyCards }: { categoryId: string; onHome: () => void; onStudyCards: () => void }) {
  const { state } = useProgress();
  const category = CATEGORY_BY_ID[categoryId];
  if (!category) return null;
  const a = ACCENT[category.accent];
  const done = category.lessons.filter((l) => state.completedLessons[l.id] !== undefined).length;

  return (
    <div className="mx-auto max-w-3xl animate-slide-up">
      <button
        onClick={onHome}
        className="mb-4 text-xs text-slate-500 underline-offset-2 hover:text-slate-600 hover:underline"
      >
        ← All systems
      </button>

      <Card className={`${a.border} mb-6`}>
        <div className="flex items-start gap-4">
          <span className="text-4xl">{category.icon}</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-100">{category.name}</h1>
            <p className={`text-sm ${a.text}`}>{category.tagline}</p>
            <p className="mt-2 text-sm text-slate-400">{category.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Chip className={`border ${a.border} ${a.chip} ${a.text}`}>
                {done}/{category.lessons.length} lessons restored
              </Chip>
              <button
                onClick={onStudyCards}
                className={`text-xs ${a.text} underline-offset-2 hover:underline`}
              >
                Study {category.flashcards.length} flashcards →
              </button>
            </div>
            <ProgressBar
              value={category.lessons.length ? done / category.lessons.length : 0}
              accent={category.accent}
              className="mt-3"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {(() => {
          const nextId = category.lessons.find((l) => state.completedLessons[l.id] === undefined)?.id;
          return category.lessons.map((lesson, i) => {
            const score = state.completedLessons[lesson.id];
            const lockedByOrder = false; // all lessons freely revisitable
            return (
              <LessonRow
                key={lesson.id}
                index={i + 1}
                lessonId={lesson.id}
                title={lesson.title}
                minutes={lesson.minutes}
                xp={lesson.xp}
                score={score}
                accent={category.accent}
                locked={lockedByOrder}
                versionNote={lesson.versionNote}
                isNext={lesson.id === nextId}
              />
            );
          });
        })()}
      </div>
    </div>
  );
}

function LessonRow({
  index,
  lessonId,
  title,
  minutes,
  xp,
  score,
  accent,
  locked,
  versionNote,
  isNext = false,
}: {
  index: number;
  lessonId: string;
  title: string;
  minutes: number;
  xp: number;
  score?: number;
  accent: 'sky' | 'teal' | 'violet' | 'amber' | 'emerald' | 'rose' | 'indigo' | 'cyan';
  locked: boolean;
  versionNote?: string;
  isNext?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const a = ACCENT[accent];
  const lesson = LESSON_BY_ID[lessonId];

  if (open && lesson) {
    return <LessonRunner lesson={lesson} onExit={() => setOpen(false)} />;
  }

  return (
    <Card
      className={`transition-colors ${score !== undefined ? a.border : ''} ${
        isNext && score === undefined ? 'border-cyan-400/50 shadow-glow' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${
            score !== undefined
              ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-700'
              : `${a.border} ${a.chip} ${a.text}`
          }`}
        >
          {score !== undefined ? '✓' : index}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-200">{title}</span>
            {isNext && score === undefined && (
              <Chip className="shrink-0 border border-cyan-400/40 bg-cyan-400/10 text-cyan-700">Next up</Chip>
            )}
          </div>
          <div className="mt-0.5 flex gap-3 text-xs text-slate-500">
            <span>~{minutes} min</span>
            <span>+{xp} XP</span>
            {score !== undefined && <span className="text-emerald-700">best {score}%</span>}
          </div>
        </div>
        <Btn variant={score !== undefined ? 'ghost' : 'primary'} disabled={locked} onClick={() => setOpen(true)}>
          {score !== undefined ? 'Review' : 'Start'}
        </Btn>
      </div>
      {versionNote && (
        <p className="mt-3 border-t border-navy-600/40 pt-2 text-[11px] leading-relaxed text-slate-600">
          ℹ️ {versionNote}
        </p>
      )}
    </Card>
  );
}
