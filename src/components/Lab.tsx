import { useState } from 'react';
import { CATEGORY_BY_ID } from '../data';
import { recommendedCategory, recommendedLessonIds } from '../engine/recommend';
import { useProgress } from '../engine/progress';
import { DIFFICULTY_LABEL, DIFFICULTY_ORDER } from '../engine/types';
import type { Assignment, ResearchProject } from '../engine/types';
import { ACCENT, Btn, Card, Chip, ProgressBar, SectionTitle } from './ui';
import { LessonRunner } from './LessonRunner';
import { LESSON_BY_ID } from '../data';

// My Learning Lab: two workspaces. Research Lab (projects with objectives,
// open challenges, and skills) and Homework Lab (assignments with courses,
// deadlines, and required skills). Both get a tier-ordered lesson pathway
// derived from the learner's own text — transparent keyword matching, no AI.
// The Lab never claims homework is done: it only tracks the learning around it.

type Tab = 'research' | 'homework';

function lines(text: string): string[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

function newProject(title: string, description: string, objectives: string[], challenges: string[], skills: string[], state: ReturnType<typeof useProgress>['state']): ResearchProject {
  return {
    id: `proj-${Date.now()}`,
    title,
    description,
    objectives,
    challenges,
    challengesResolved: challenges.map(() => false),
    skills,
    skillsLearned: skills.map(() => false),
    primaryCategoryId: recommendedCategory([title, description, ...objectives, ...challenges, ...skills]) ?? undefined,
    recommendedLessonIds: recommendedLessonIds([title, description, ...objectives, ...challenges, ...skills], state),
    createdAt: new Date().toISOString(),
  };
}

function newAssignment(course: string, title: string, description: string, deadline: string, skills: string[], state: ReturnType<typeof useProgress>['state']): Assignment {
  return {
    id: `hw-${Date.now()}`,
    course,
    title,
    description,
    deadline: deadline || undefined,
    skills,
    primaryCategoryId: recommendedCategory([course, title, description, ...skills]) ?? undefined,
    recommendedLessonIds: recommendedLessonIds([course, title, description, ...skills], state),
    createdAt: new Date().toISOString(),
  };
}

export function Lab() {
  const { state } = useProgress();
  const [tab, setTab] = useState<Tab>('research');
  const [editing, setEditing] = useState<'research' | 'homework' | null>(null);
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);

  const { actions } = useProgress();

  if (openLessonId && LESSON_BY_ID[openLessonId]) {
    return (
      <div className="mx-auto max-w-2xl">
        <LessonRunner lesson={LESSON_BY_ID[openLessonId]} onExit={() => setOpenLessonId(null)} />
      </div>
    );
  }

  const projects = state.labProjects ?? [];
  const assignments = state.assignments ?? [];
  const activeProject = projects[0];
  const activeAssignment = assignments[0];

  return (
    <div className="mx-auto max-w-3xl animate-slide-up">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <TabBtn active={tab === 'research'} onClick={() => setTab('research')} label="🔬 Research Lab" />
        <TabBtn active={tab === 'homework'} onClick={() => setTab('homework')} label="📚 Homework Lab" />
      </div>

      {tab === 'research' && (
        <>
          <SectionTitle
            right={
              <button onClick={() => setEditing('research')} className="text-xs text-cyan-700 underline-offset-2 hover:text-cyan-800 hover:underline">
                + New project
              </button>
            }
          >
            Research Lab
          </SectionTitle>
          {editing === 'research' && (
            <ProjectForm
              onCancel={() => setEditing(null)}
              onSave={(p) => {
                actions.setLabProjects([p, ...projects]);
                setEditing(null);
              }}
            />
          )}
          {!editing && projects.length === 0 && (
            <Card>
              <p className="text-sm text-slate-400">
                No research projects yet. Create one — a title, a few objectives, the challenges blocking
                you, and the skills you want to develop. The Lab turns that into a lesson pathway and tracks
                what is still open.
              </p>
            </Card>
          )}
          {projects.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              active={i === 0}
              onSetActive={() => actions.setLabProjects([p, ...projects.filter((x) => x.id !== p.id)])}
              onDelete={() => {
                if (confirm(`Delete project "${p.title}"? This cannot be undone.`)) {
                  actions.setLabProjects(projects.filter((x) => x.id !== p.id));
                }
              }}
              onToggleChallenge={(idx) => {
                const resolved = [...p.challengesResolved];
                resolved[idx] = !resolved[idx];
                actions.setLabProjects(projects.map((x) => (x.id === p.id ? { ...p, challengesResolved: resolved } : x)));
              }}
              onToggleSkill={(idx) => {
                const learned = [...p.skillsLearned];
                learned[idx] = !learned[idx];
                actions.setLabProjects(projects.map((x) => (x.id === p.id ? { ...p, skillsLearned: learned } : x)));
              }}
              onOpenLesson={(id) => setOpenLessonId(id)}
            />
          ))}
          {!editing && activeProject && (
            <p className="mt-2 text-xs text-slate-500">
              Active project: <span className="text-slate-400">{activeProject.title}</span> — daily missions in
              Research Preparation mode draw from its pathway.
            </p>
          )}
        </>
      )}

      {tab === 'homework' && (
        <>
          <SectionTitle
            right={
              <button onClick={() => setEditing('homework')} className="text-xs text-cyan-700 underline-offset-2 hover:text-cyan-800 hover:underline">
                + New assignment
              </button>
            }
          >
            Homework Lab
          </SectionTitle>
          {editing === 'homework' && (
            <AssignmentForm
              onCancel={() => setEditing(null)}
              onSave={(a) => {
                actions.setAssignments([a, ...assignments]);
                setEditing(null);
              }}
            />
          )}
          {!editing && assignments.length === 0 && (
            <Card>
              <p className="text-sm text-slate-400">
                No assignments tracked yet. Add the course, the assignment title, what it asks for in your own
                words, and the skills it needs. The Lab builds a study pathway for the knowledge — the
                assignment itself stays yours.
              </p>
            </Card>
          )}
          {assignments.map((a, i) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              active={i === 0}
              onSetActive={() => actions.setAssignments([a, ...assignments.filter((x) => x.id !== a.id)])}
              onDelete={() => {
                if (confirm(`Delete assignment "${a.title}"? This cannot be undone.`)) {
                  actions.setAssignments(assignments.filter((x) => x.id !== a.id));
                }
              }}
              onOpenLesson={(id) => setOpenLessonId(id)}
            />
          ))}
          {!editing && activeAssignment && (
            <p className="mt-2 text-xs text-slate-500">
              Active assignment: <span className="text-slate-400">{activeAssignment.title}</span> — daily missions in
              Homework Preparation mode draw from its pathway.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-800'
          : 'border-navy-600/70 bg-navy-900/30 text-slate-400 hover:border-cyan-400/30 hover:text-slate-500'
      }`}
    >
      {label}
    </button>
  );
}

// --- Forms -------------------------------------------------------------------

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-navy-600 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60';

function ProjectForm({ onSave, onCancel }: { onSave: (p: ResearchProject) => void; onCancel: () => void }) {
  const { state } = useProgress();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [challenges, setChallenges] = useState('');
  const [skills, setSkills] = useState('');
  const ready = title.trim() && description.trim();
  return (
    <Card className="mb-4 space-y-3">
      <FormField label="Project title">
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder='e.g. "Dual-Robot Assembly Visualization"' maxLength={80} />
      </FormField>
      <FormField label="Short description">
        <textarea className={`${inputCls} min-h-[70px]`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are you building or studying, and with what tools?" />
      </FormField>
      <FormField label="Technical objectives (one per line)">
        <textarea className={`${inputCls} min-h-[60px]`} value={objectives} onChange={(e) => setObjectives(e.target.value)} placeholder={'Visualize two arms in one scene\nSync simulated and real states'} />
      </FormField>
      <FormField label="Current challenges (one per line)">
        <textarea className={`${inputCls} min-h-[60px]`} value={challenges} onChange={(e) => setChallenges(e.target.value)} placeholder={'Gripper lags the wrist in the twin\nROS 2 messages arrive stale'} />
      </FormField>
      <FormField label="Skills to develop (one per line)">
        <textarea className={`${inputCls} min-h-[60px]`} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder={'USD scene hierarchy\nROS 2 bridge debugging'} />
      </FormField>
      <div className="flex gap-3">
        <Btn disabled={!ready} onClick={() => onSave(newProject(title.trim(), description.trim(), lines(objectives), lines(challenges), lines(skills), state))}>
          Create project
        </Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </Card>
  );
}

function AssignmentForm({ onSave, onCancel }: { onSave: (a: Assignment) => void; onCancel: () => void }) {
  const { state } = useProgress();
  const [course, setCourse] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [skills, setSkills] = useState('');
  const ready = title.trim() && course.trim();
  return (
    <Card className="mb-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Course name">
          <input className={inputCls} value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Robotics Systems Lab" maxLength={60} />
        </FormField>
        <FormField label="Deadline (optional)">
          <input type="date" className={inputCls} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Assignment title">
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment 3: sensor pipeline report" maxLength={80} />
      </FormField>
      <FormField label="What it asks for (your own words)">
        <textarea className={`${inputCls} min-h-[70px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>
      <FormField label="Required skills / knowledge (one per line)">
        <textarea className={`${inputCls} min-h-[60px]`} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder={'Python file handling\nSQL aggregation'} />
      </FormField>
      <div className="flex gap-3">
        <Btn disabled={!ready} onClick={() => onSave(newAssignment(course.trim(), title.trim(), description.trim(), deadline, lines(skills), state))}>
          Create assignment
        </Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </Card>
  );
}

// --- Cards -------------------------------------------------------------------

function Pathway({ lessonIds, onOpenLesson }: { lessonIds: string[]; onOpenLesson: (id: string) => void }) {
  const { state } = useProgress();
  if (lessonIds.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        No strong subject match yet — add tool names or concepts (Isaac Sim, ROS 2, Python, Git…) and the
        pathway will appear.
      </p>
    );
  }
  const prefixToCategory: Record<string, string> = {
    py: 'python', git: 'git', sql: 'sql', api: 'api', lx: 'linux', dbg: 'debug', arch: 'arch', isx: 'isaac',
  };
  const tiers = DIFFICULTY_ORDER.map((tier) => ({
    tier,
    lessons: lessonIds
      .map((id) => LESSON_BY_ID[id])
      .filter((l) => l && (l.difficulty ?? 'foundation') === tier),
  })).filter((g) => g.lessons.length > 0);

  return (
    <div className="space-y-3">
      {tiers.map((g) => (
        <div key={g.tier}>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            {g.tier === 'foundation' ? 'Prerequisites — Foundation' : DIFFICULTY_LABEL[g.tier]}
          </div>
          <div className="space-y-1.5">
            {g.lessons.map((l) => {
              const score = state.completedLessons[l.id];
              const cat = CATEGORY_BY_ID[prefixToCategory[l.id.split('-')[0]] ?? 'python'];
              const a = ACCENT[cat?.accent ?? 'sky'];
              return (
                <button
                  key={l.id}
                  onClick={() => onOpenLesson(l.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors hover:border-cyan-400/40 ${
                    score !== undefined ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-navy-600/60 bg-navy-800/40'
                  }`}
                >
                  <span className={`text-xs font-bold ${score !== undefined ? 'text-emerald-700' : a.text}`}>
                    {score !== undefined ? '✓' : '○'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-200">{l.title}</span>
                    <span className="block text-[11px] text-slate-500">~{l.minutes} min · {DIFFICULTY_LABEL[l.difficulty ?? 'foundation']}</span>
                  </span>
                  <span className="text-xs text-cyan-700">open →</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectCard({
  project,
  active,
  onSetActive,
  onDelete,
  onToggleChallenge,
  onToggleSkill,
  onOpenLesson,
}: {
  project: ResearchProject;
  active: boolean;
  onSetActive: () => void;
  onDelete: () => void;
  onToggleChallenge: (idx: number) => void;
  onToggleSkill: (idx: number) => void;
  onOpenLesson: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const challengesOpen = project.challenges.filter((_, i) => !project.challengesResolved[i]).length;
  const skillsLearned = project.skillsLearned.filter(Boolean).length;
  return (
    <Card className="mb-3">
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100">{project.title}</h3>
            {active && <Chip className="border border-teal-400/40 bg-teal-400/10 text-teal-700">active</Chip>}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{project.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip className="border border-navy-600 bg-navy-800/70 text-slate-400">
              {challengesOpen} open challenge{challengesOpen === 1 ? '' : 's'}
            </Chip>
            <Chip className="border border-navy-600 bg-navy-800/70 text-slate-400">
              {skillsLearned}/{project.skills.length} skills learned
            </Chip>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          {!active && <Btn variant="ghost" onClick={onSetActive}>Set active</Btn>}
          <Btn variant="ghost" onClick={() => setOpen((o) => !o)}>{open ? 'Close' : 'Open'}</Btn>
          <button onClick={onDelete} className="text-[11px] text-rose-700/70 underline-offset-2 hover:text-rose-700 hover:underline">
            delete
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-navy-600/40 pt-4 animate-slide-up">
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Objectives</div>
            <ul className="space-y-1 text-xs text-slate-400">
              {project.objectives.map((o, i) => (
                <li key={i} className="flex gap-2"><span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-cyan-400/70" />{o}</li>
              ))}
            </ul>
          </div>

          {project.challenges.length > 0 && (
            <div>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Challenges — resolve them as your understanding grows
              </div>
              <div className="space-y-1.5">
                {project.challenges.map((c, i) => (
                  <button key={i} onClick={() => onToggleChallenge(i)} className="flex w-full items-start gap-2 rounded-lg border border-navy-600/50 px-3 py-2 text-left text-xs text-slate-300 hover:border-cyan-400/30">
                    <span className={project.challengesResolved[i] ? 'text-emerald-700' : 'text-slate-500'}>
                      {project.challengesResolved[i] ? '✓' : '○'}
                    </span>
                    <span className={project.challengesResolved[i] ? 'text-slate-500 line-through' : ''}>{c}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {project.skills.length > 0 && (
            <div>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Skills</div>
              <div className="space-y-1.5">
                {project.skills.map((s, i) => (
                  <button key={i} onClick={() => onToggleSkill(i)} className="flex w-full items-start gap-2 rounded-lg border border-navy-600/50 px-3 py-2 text-left text-xs text-slate-300 hover:border-cyan-400/30">
                    <span className={project.skillsLearned[i] ? 'text-emerald-700' : 'text-slate-500'}>
                      {project.skillsLearned[i] ? '✓' : '○'}
                    </span>
                    <span className={project.skillsLearned[i] ? 'text-slate-500 line-through' : ''}>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Your learning pathway {project.primaryCategoryId && <span className="normal-case text-slate-400">· matched: {CATEGORY_BY_ID[project.primaryCategoryId]?.name}</span>}
            </div>
            <Pathway lessonIds={project.recommendedLessonIds} onOpenLesson={onOpenLesson} />
          </div>
          <span className="hidden">{/* pathway progress shows via ✓ marks above */}</span>
        </div>
      )}
    </Card>
  );
}

function AssignmentCard({
  assignment,
  active,
  onSetActive,
  onDelete,
  onOpenLesson,
}: {
  assignment: Assignment;
  active: boolean;
  onSetActive: () => void;
  onDelete: () => void;
  onOpenLesson: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const daysLeft = assignment.deadline
    ? Math.ceil((new Date(assignment.deadline).getTime() - Date.now()) / 86400000)
    : null;
  return (
    <Card className="mb-3">
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Chip className="border border-navy-600 bg-navy-800/70 text-slate-400">{assignment.course}</Chip>
            {active && <Chip className="border border-teal-400/40 bg-teal-400/10 text-teal-700">active</Chip>}
            {daysLeft !== null && (
              <Chip className={`border ${daysLeft < 0 ? 'border-slate-400/30 text-slate-400' : daysLeft <= 3 ? 'border-amber-400/50 bg-amber-400/10 text-amber-700' : 'border-navy-600 bg-navy-800/70 text-slate-400'}`}>
                {daysLeft < 0 ? 'past deadline' : daysLeft === 0 ? 'due today' : `${daysLeft}d left`}
              </Chip>
            )}
          </div>
          <h3 className="mt-1.5 text-sm font-bold text-slate-100">{assignment.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{assignment.description}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          {!active && <Btn variant="ghost" onClick={onSetActive}>Set active</Btn>}
          <Btn variant="ghost" onClick={() => setOpen((o) => !o)}>{open ? 'Close' : 'Open'}</Btn>
          <button onClick={onDelete} className="text-[11px] text-rose-700/70 underline-offset-2 hover:text-rose-700 hover:underline">
            delete
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-navy-600/40 pt-4 animate-slide-up">
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Required skills / knowledge</div>
            <div className="flex flex-wrap gap-1.5">
              {assignment.skills.length ? assignment.skills.map((s, i) => (
                <Chip key={i} className="border border-navy-600 bg-navy-800/70 text-slate-300">{s}</Chip>
              )) : <p className="text-xs text-slate-500">None listed — edit notes to add what the assignment needs.</p>}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Study pathway {assignment.primaryCategoryId && <span className="normal-case text-slate-400">· matched: {CATEGORY_BY_ID[assignment.primaryCategoryId]?.name}</span>}
            </div>
            <Pathway lessonIds={assignment.recommendedLessonIds} onOpenLesson={onOpenLesson} />
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            This pathway covers the knowledge the assignment needs — completing lessons tracks your learning,
            never the assignment itself. Submitting is on you.
          </p>
        </div>
      )}
    </Card>
  );
}
