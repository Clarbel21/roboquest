import { useState } from 'react';
import { EXPERIENCE_LABEL, FOCUS_LABEL, GOAL_LABEL } from '../engine/types';
import type { ExperienceLevel, FocusArea, LearningGoal, UserProfile } from '../engine/types';
import { useProgress } from '../engine/progress';
import { Btn, Card, Chip } from './ui';
import { Byte } from './Byte';

// First-run onboarding and the Settings profile editor share this card.
// Nothing here is sensitive: a preferred name, self-assessed level, a goal,
// a session length, and an optional focus area. Everything is skippable.

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  experience: 'rusty',
  goal: 'fundamentals',
  dailyMinutes: 15,
  onboarded: true,
};

export function Onboarding({ mode = 'gate', initial, onDone }: {
  mode?: 'gate' | 'edit';
  initial?: UserProfile;
  onDone: () => void;
}) {
  const { state, actions } = useProgress();
  const p = initial ?? state.profile ?? DEFAULT_PROFILE;
  const [name, setName] = useState(p.name ?? '');
  const [experience, setExperience] = useState<ExperienceLevel>(p.experience ?? 'rusty');
  const [goal, setGoal] = useState<LearningGoal>(p.goal ?? 'fundamentals');
  const [dailyMinutes, setDailyMinutes] = useState<5 | 15 | 30>(p.dailyMinutes ?? 15);
  const [focusArea, setFocusArea] = useState<FocusArea | undefined>(p.focusArea);

  function save(skip = false) {
    const finalProfile: UserProfile = skip
      ? { ...DEFAULT_PROFILE, name: name.trim(), onboarded: true }
      : {
          name: name.trim(),
          experience,
          goal,
          dailyMinutes,
          focusArea,
          onboarded: true,
        };
    actions.setProfile(finalProfile);
    onDone();
  }

  return (
    <div className={`mx-auto ${mode === 'gate' ? 'mt-6 max-w-xl' : 'max-w-xl'} animate-slide-up`}>
      {mode === 'gate' && (
        <div className="mb-4 flex items-end gap-3">
          <Byte size={72} mood="happy" />
          <div className="mb-2 rounded-2xl rounded-bl-sm border border-navy-600/60 bg-white/90 px-4 py-3 text-sm text-slate-300">
            Welcome to the facility. Before we start — who am I working with? Five quick questions,
            none of them sensitive, all stored only in this browser.
          </div>
        </div>
      )}
      <Card>
        <h1 className="text-xl font-bold text-slate-100">
          {mode === 'edit' ? 'Your profile' : 'Set up your companion'}
        </h1>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Preferred name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="How should Byte greet you?"
          maxLength={30}
          className="mt-1.5 w-full rounded-xl border border-navy-600 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        />

        <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Current experience level
        </label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(Object.keys(EXPERIENCE_LABEL) as ExperienceLevel[]).map((lvl) => (
            <ChoiceChip key={lvl} active={experience === lvl} onClick={() => setExperience(lvl)} label={EXPERIENCE_LABEL[lvl]} />
          ))}
        </div>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Main learning goal
        </label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(Object.keys(GOAL_LABEL) as LearningGoal[]).map((g) => (
            <ChoiceChip key={g} active={goal === g} onClick={() => setGoal(g)} label={GOAL_LABEL[g]} />
          ))}
        </div>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Daily learning duration
        </label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {([5, 15, 30] as const).map((m) => (
            <ChoiceChip key={m} active={dailyMinutes === m} onClick={() => setDailyMinutes(m)} label={`${m} min / day`} />
          ))}
        </div>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Focus area <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span>
        </label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(Object.keys(FOCUS_LABEL) as FocusArea[]).map((f) => (
            <ChoiceChip key={f} active={focusArea === f} onClick={() => setFocusArea(focusArea === f ? undefined : f)} label={FOCUS_LABEL[f]} />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Btn onClick={() => save(false)}>{mode === 'edit' ? 'Save profile' : 'Start learning →'}</Btn>
          {mode === 'gate' && (
            <button
              onClick={() => save(true)}
              className="text-xs text-slate-500 underline-offset-2 hover:text-slate-400 hover:underline"
            >
              Skip for now
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

function ChoiceChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-800'
          : 'border-navy-600/70 bg-navy-900/30 text-slate-400 hover:border-cyan-400/30 hover:text-slate-500'
      }`}
    >
      {label}
    </button>
  );
}
