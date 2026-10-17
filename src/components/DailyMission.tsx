import { useEffect, useMemo, useRef, useState } from 'react';
import { CARD_BY_ID, LESSON_BY_ID, QUIZ_BY_ID } from '../data';
import { getDailySession } from '../engine/daily';
import { useProgress } from '../engine/progress';
import { todayStr } from '../engine/srs';
import type { ProgressState } from '../engine/types';
import { Btn, Card, ProgressBar, SectionTitle } from './ui';
import { FlashcardRunner } from './FlashcardRunner';
import { LessonRunner } from './LessonRunner';
import { QuizCard } from './QuizCard';
import { ByteSays } from './Byte';

// Today's mission: review flashcards → one lesson → five quiz questions.
// The composed session persists for the day, so reloads resume in place.

type Phase = 'cards' | 'lesson' | 'quiz' | 'summary';

export function DailyMission({ onHome, onFlashcards }: { onHome: () => void; onFlashcards: () => void }) {
  const { state, actions } = useProgress();
  const boot = useRef(state);
  const session = useMemo(() => getDailySession(boot.current), []);
  const xpAtStart = useRef(state.xp);

  useEffect(() => {
    actions.ensureDaily({ cardIds: session.cardIds, lessonId: session.lessonId, quizIds: session.quizIds });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasCards = session.cardIds.length > 0;
  const [phase, setPhase] = useState<Phase>(session.done ? 'summary' : hasCards ? 'cards' : 'lesson');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);

  const lesson = LESSON_BY_ID[session.lessonId];
  const quizzes = session.quizIds.map((id) => QUIZ_BY_ID[id]).filter(Boolean);

  const segmentIndex = phase === 'cards' ? 0 : phase === 'lesson' ? 1 : 2;

  useEffect(() => {
    if (phase === 'summary') actions.markDailyDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const xpEarned = state.xp - xpAtStart.current;

  if (phase === 'summary') {
    const todayMistakes = state.mistakes.filter((m) => m.day === session.day && !m.resolved);
    return (
      <div className="mx-auto max-w-2xl animate-pop">
        <Card className="text-center">
          <div className="text-5xl">🛠️</div>
          <h2 className="mt-3 text-2xl font-bold text-slate-100">Daily mission complete</h2>
          <p className="mt-1 text-sm text-slate-400">The facility edges closer to full power.</p>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3">
            <div className="rounded-xl bg-navy-800/70 p-3">
              <div className="text-2xl font-bold text-cyan-700">+{xpEarned}</div>
              <div className="text-xs text-slate-500">XP this session</div>
            </div>
            <div className="rounded-xl bg-navy-800/70 p-3">
              <div className="text-2xl font-bold text-amber-700">🔥 {state.streak.current}</div>
              <div className="text-xs text-slate-500">day streak</div>
            </div>
            <div className="rounded-xl bg-navy-800/70 p-3">
              <div className="text-2xl font-bold text-teal-700">
                {quizCorrect}/{quizzes.length || 5}
              </div>
              <div className="text-xs text-slate-500">quiz score</div>
            </div>
          </div>
          <div className="mx-auto mt-6 max-w-md text-left">
            <ByteSays
              text={
                todayMistakes.length === 0
                  ? 'Zero new weak spots detected. Immaculate engineering, human.'
                  : `Logged ${todayMistakes.length} weak spot${todayMistakes.length > 1 ? 's' : ''} in the mistake notebook. I will resurface ${todayMistakes.length > 1 ? 'them' : 'it'} in an upcoming session — that is how the forgetting curve loses.`
              }
            />
          </div>
          <div className="mt-7 flex justify-center gap-3">
            <Btn onClick={onHome}>Back to base</Btn>
            <Btn variant="ghost" onClick={onFlashcards}>
              Study more flashcards
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-slide-up">
      <div className="mb-5">
        <SectionTitle>Today's mission</SectionTitle>
        <div className="flex gap-2">
          {['Review', 'Lesson', 'Quiz'].map((name, i) => (
            <div key={name} className="flex-1">
              <div
                className={`rounded-lg border px-2 py-1.5 text-center text-xs font-medium transition-colors ${
                  i < segmentIndex
                    ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-700'
                    : i === segmentIndex
                      ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-800'
                      : 'border-navy-600/60 bg-navy-900/60 text-slate-500'
                }`}
              >
                {i < segmentIndex ? '✓ ' : ''}
                {name}
              </div>
            </div>
          ))}
        </div>
        <ProgressBar value={segmentIndex / 3} accent="cyan" className="mt-3" />
      </div>

      {phase === 'cards' && (
        <>
          {hasCards ? (
            <>
              <p className="mb-4 text-center text-sm text-slate-400">
                Warm-up review — {session.cardIds.length} card{session.cardIds.length > 1 ? 's' : ''} scheduled for
                today
              </p>
              <FlashcardRunner
                cards={session.cardIds.map((id) => CARD_BY_ID[id]).filter(Boolean)}
                onDone={() => setPhase('lesson')}
              />
              <div className="mt-4 text-center">
                <button
                  onClick={() => setPhase('lesson')}
                  className="text-xs text-slate-500 underline-offset-2 hover:text-slate-600 hover:underline"
                >
                  Skip review →
                </button>
              </div>
            </>
          ) : (
            <Card className="text-center text-sm text-slate-400">
              No cards scheduled — straight to the lesson.
              <div className="mt-4">
                <Btn onClick={() => setPhase('lesson')}>Start lesson →</Btn>
              </div>
            </Card>
          )}
        </>
      )}

      {phase === 'lesson' && lesson && (
        <LessonRunner lesson={lesson} onExit={() => setPhase('quiz')} />
      )}

      {phase === 'quiz' && (
        <>
          <p className="mb-4 text-center text-sm text-slate-400">
            Challenge questions — question {Math.min(quizIndex + 1, quizzes.length)} of {quizzes.length}
          </p>
          {quizIndex < quizzes.length ? (
            <Card>
              <QuizCard
                key={quizzes[quizIndex].exercise.id}
                exercise={quizzes[quizIndex].exercise}
                lessonId={quizzes[quizIndex].lessonId}
                label={`Q${quizIndex + 1}`}
                onDone={(correct) => {
                  if (correct) setQuizCorrect((n) => n + 1);
                  setQuizIndex((i) => i + 1);
                }}
              />
            </Card>
          ) : (
            <Card className="text-center">
              <p className="text-sm text-slate-600">All questions answered.</p>
              <div className="mt-4">
                <Btn onClick={() => setPhase('summary')}>See session summary →</Btn>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export function dailyHeadline(state: ProgressState): { done: boolean; text: string } {
  const entry = state.dailyLog[todayStr()];
  if (entry?.done) return { done: true, text: "Today's mission is complete. Legend." };
  return { done: false, text: '15 minutes today keeps the forgetting curve away.' };
}
