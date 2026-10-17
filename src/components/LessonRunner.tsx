import { useRef, useState } from 'react';
import type { Lesson } from '../engine/types';
import { useProgress } from '../engine/progress';
import { Btn, Card, Markdown, ProgressBar } from './ui';
import { QuizCard } from './QuizCard';
import { ByteSays } from './Byte';

// Steps through a lesson: teach cards → Byte asides → interactive exercises,
// then reports the score and awards XP once.

export function LessonRunner({ lesson, onExit }: { lesson: Lesson; onExit: () => void }) {
  const { actions } = useProgress();
  const [stepIndex, setStepIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answerCount, setAnswerCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const awarded = useRef(false);
  // Synchronous tallies — React state updates batch too late for advance()
  // to read on the final exercise, which recorded stale scores.
  const correctTally = useRef(0);
  const answerTally = useRef(0);

  const exercises = lesson.steps.filter((s) => s.kind === 'exercise');
  const total = lesson.steps.length;

  function handleExerciseDone(correct: boolean) {
    answerTally.current += 1;
    if (correct) correctTally.current += 1;
    setAnswerCount(answerTally.current);
    if (correct) setCorrectCount(correctTally.current);
    advance();
  }

  function advance() {
    if (stepIndex + 1 >= total) {
      if (!awarded.current) {
        awarded.current = true;
        const scorePct = exercises.length ? Math.round((correctTally.current / exercises.length) * 100) : 100;
        const { xpEarned } = actions.completeLesson(lesson.id, scorePct);
        setXpEarned(xpEarned);
      }
      setFinished(true);
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  if (finished) {
    const scorePct = exercises.length ? Math.round((correctCount / exercises.length) * 100) : 100;
    return (
      <Card className="mx-auto max-w-2xl animate-pop text-center">
        <div className="text-5xl">{scorePct >= 80 ? '🎉' : scorePct >= 50 ? '💪' : '🌱'}</div>
        <h3 className="mt-3 text-xl font-bold text-slate-100">Lesson complete</h3>
        <p className="mt-1 text-sm text-slate-400">{lesson.title}</p>
        <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-3">
          <div className="rounded-xl bg-navy-800/70 p-3">
            <div className="text-2xl font-bold text-cyan-700">+{xpEarned}</div>
            <div className="text-xs text-slate-500">XP earned</div>
          </div>
          <div className="rounded-xl bg-navy-800/70 p-3">
            <div className="text-2xl font-bold text-teal-700">{scorePct}%</div>
            <div className="text-xs text-slate-500">Score</div>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          {answerCount > 0 && correctCount < answerCount
            ? 'Missed questions were saved to your mistake notebook — they will resurface in daily sessions.'
            : 'Clean run. Your streak thanks you.'}
        </p>
        <div className="mt-6">
          <Btn onClick={onExit}>Back →</Btn>
        </div>
      </Card>
    );
  }

  const step = lesson.steps[stepIndex];

  return (
    <div className="mx-auto max-w-2xl animate-slide-up">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={onExit}
          className="rounded-lg px-2 py-1 text-slate-500 transition-colors hover:bg-navy-800 hover:text-slate-600"
          aria-label="Exit lesson"
        >
          ✕
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-200">{lesson.title}</div>
          <ProgressBar value={stepIndex / total} accent="cyan" className="mt-1.5" />
        </div>
        <span className="shrink-0 text-xs text-slate-500">
          {stepIndex + 1} / {total}
        </span>
      </div>

      {step.kind === 'teach' && (
        <Card>
          <h3 className="mb-3 text-lg font-bold text-slate-100">{step.heading}</h3>
          <Markdown text={step.body} />
          {step.keyPoints && (
            <div className="mt-4 flex flex-wrap gap-2">
              {step.keyPoints.map((k, i) => (
                <span
                  key={i}
                  className="rounded-full border border-cyan-400/25 bg-cyan-400/5 px-3 py-1 text-xs text-cyan-800"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
          <div className="mt-5">
            <Btn onClick={advance}>Next →</Btn>
          </div>
        </Card>
      )}

      {step.kind === 'byte' && (
        <Card>
          <ByteSays text={step.text} />
          <div className="mt-4">
            <Btn onClick={advance}>Next →</Btn>
          </div>
        </Card>
      )}

      {step.kind === 'exercise' && (
        <Card>
          <QuizCard
            key={step.exercise.id}
            exercise={step.exercise}
            lessonId={lesson.id}
            onDone={handleExerciseDone}
          />
        </Card>
      )}

      {lesson.versionNote && stepIndex === 0 && (
        <p className="mt-3 text-xs leading-relaxed text-slate-600">ℹ️ {lesson.versionNote}</p>
      )}
    </div>
  );
}
