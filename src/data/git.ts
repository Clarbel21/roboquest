import type { Category } from '../engine/types';

// Git & Version Control — content module.
// The repository is the only intact record of what the facility's software was.

export const gitCategory: Category = {
  id: 'git',
  name: 'Git',
  tagline: 'History you can trust, branches you can dare',
  icon: '🔀',
  description:
    'The repository survived the outage — the one intact record of what the facility\'s software used to be. Restore version-control discipline before the engineering teams start pushing again.',
  accent: 'amber',
  lessons: [
    {
      id: 'git-l1-basics',
      title: 'Repositories, Staging & Commits',
      minutes: 5,
      xp: 35,
      narrative:
        'Byte found the object database untouched under the collapsed shelf in the server room. The history can be trusted again — once you can read it, and once you can add to it without shame.',
      steps: [
        {
          kind: 'teach',
          heading: 'What a repository is',
          body:
            'Git stores **snapshots**, not diffs: every commit records the full state of the project plus a pointer to its parent. That chain of snapshots is history — which is why you can check out last Tuesday\'s controller firmware exactly, and why "undo" in Git means moving to an earlier snapshot.\n\nA folder becomes a repository with `git init`, which creates the hidden `.git/` directory holding all of it: every commit, every branch label. Working copy and history live together on your machine; nothing about Git requires a server — remotes are optional mirrors we will meet later.',
          keyPoints: [
            'A commit = full snapshot + parent pointer + who/when/why',
            '.git/ holds the entire history — delete it and history is gone',
            'Git works fully offline; remotes are optional mirrors',
          ],
        },
        {
          kind: 'teach',
          heading: 'The staging area',
          body:
            'Between your working copy and history sits the **staging area** (the index). `git add` places changes there; `git commit` records exactly the staged content as one snapshot. The two-step design is deliberate: you choose what belongs in a commit. Fixed the relay logic but also mass-renamed variables? Stage only the relay fix, commit it alone, deal with the rest separately.\n\nInspect before recording: `git status` shows staged versus unstaged, `git diff` shows unstaged edits, and `git diff --staged` shows exactly what the next commit would capture.',
          keyPoints: [
            'git add selects changes; git commit snapshots the selection',
            'One commit should be one logical change, not everything at once',
            'status / diff / diff --staged: look before you record',
          ],
        },
        {
          kind: 'byte',
          text: 'Archaeology note: 60% of the corrupted commits are titled "fix" or "updates". Most of the rest are titled "fix fix". Write commit messages your future self can search.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'git-q-basic-flow',
            prompt: 'Order the commands for recording the calibration fix as clean history (first to last).',
            items: [
              { id: '1', text: 'Edit calibrate.py in the working copy', note: 'All changes start life as unstaged edits.' },
              { id: '2', text: 'git status', note: 'See what changed before touching the index.' },
              { id: '3', text: 'git add calibrate.py', note: 'Stage exactly the file this commit is about.' },
              { id: '4', text: 'git commit -m "Fix lidar calibration offset"', note: 'Snapshot the staged content with a real message.' },
              { id: '5', text: 'git log --oneline', note: 'Confirm the commit landed in history.' },
            ],
            explanation:
              'The daily rhythm of Git: edit, inspect with `status`, stage the one logical change with `add`, commit it with a message a stranger could understand, verify with `log`. Each commit is one idea — and the staging area is precisely what makes that possible from a messy working copy.',
            hint: 'You cannot commit what you have not staged, and you should look before you stage.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'git-q-staging',
            prompt: 'You fixed a critical bug and, in the same working copy, renamed variables for readability. What is the staging-area move?',
            options: [
              { id: 'a', text: 'Commit everything together — Git does not care' },
              { id: 'b', text: 'Stage and commit the bug-fix files first, then stage and commit the rename separately' },
              { id: 'c', text: 'Discard the rename edits; Git forbids unrelated changes in one working copy' },
              { id: 'd', text: 'Describe the rename in the commit message and commit only the fix' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'It runs without error, but anyone bisecting a regression later cannot tell which half of the commit caused it — mixed-purpose commits poison history.',
              c: 'Git happily allows unrelated changes; splitting them across commits is the entire reason the index exists.',
              d: 'Commit messages describe; they do not contain code. The rename either lands in a snapshot or it does not exist.',
            },
            explanation:
              'The staging area exists so one working copy can produce several clean commits: stage the fix, commit; stage the rename, commit. Future operations like `git bisect` and `git revert` work at commit granularity — so each commit should be a change you would want to undo as a single unit.',
            hint: 'Someone will eventually need to revert exactly one of these two changes.',
          },
        },
      ],
    },
    {
      id: 'git-l2-branches',
      title: 'Branches & Merging',
      minutes: 6,
      xp: 40,
      narrative:
        'Six half-finished branches dangle from the main line like severed cables. Byte reboots the branch table. Understand what a branch actually is before you reconnect any of them.',
      steps: [
        {
          kind: 'teach',
          heading: 'A branch is a pointer',
          body:
            'A **branch** is just a movable label pointing at one commit — about 41 bytes, nearly free. `git branch sensor-fix` creates the label; `git switch sensor-fix` moves you onto it. Commit while on it, and the label advances to your new commit while `main` stays exactly where it was.\n\nThis is why branching is cheap in Git: no file copying, no locking, no waiting. The default branch is only special because everyone agrees it is. Experimental idea, risky refactor, version bump you are not sure about — branch, and the isolation is total while the cost is nil.',
          keyPoints: [
            'A branch = a pointer to a commit, not a copy of files',
            'Commits advance only the current branch\'s label',
            'switch / checkout moves you between lines of history',
          ],
        },
        {
          kind: 'teach',
          heading: 'Merging — and conflicts',
          body:
            'Merging weaves one branch\'s commits into another. If `main` never moved since you branched, Git simply **fast-forwards** the label — no work at all. If both lines advanced, Git performs a **three-way merge** using the common ancestor, and it usually succeeds on its own because the changes touched different lines.\n\nA **merge conflict** happens only when both branches changed the same lines differently. Git marks the region with `<<<<<<<` / `>>>>>>>` markers and refuses to guess. You edit the file to the content you actually want, `git add` it, and commit the merge. A conflict is not an error — it is Git asking a question only a human can answer.',
          keyPoints: [
            'Fast-forward when the target branch never diverged',
            'Three-way merge handles different-line changes automatically',
            'Same lines changed both ways: Git stops and asks you to decide',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'git-q-conflict',
            prompt: '`main` and `sensor-fix` both edited line 40 of `gain.py`, differently. You run `git merge sensor-fix` on main. What happens?',
            options: [
              { id: 'a', text: 'Git overwrites main\'s version with sensor-fix\'s version' },
              { id: 'b', text: 'Git writes both versions into the file with conflict markers and pauses, waiting for you to resolve' },
              { id: 'c', text: 'The merge aborts and both branches are deleted' },
              { id: 'd', text: 'Git keeps whichever branch was committed to most recently' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Silent overwrite would destroy someone\'s work. Git never guesses between competing edits — that decision is explicitly reserved for a human.',
              c: 'Nothing is deleted. A conflicted merge pauses mid-flight with markers in the files; you resolve and commit, or run `git merge --abort` to back out cleanly.',
              d: 'Timestamps decide nothing. Git compares content against the common ancestor — same line, two different versions means conflict, regardless of recency.',
            },
            explanation:
              'Conflicts arise when both branches changed the same lines since their common ancestor. Git writes both candidates into the file between `<<<<<<< HEAD` and `>>>>>>> sensor-fix` markers and stops the merge. You edit to the intended final content, `git add gain.py`, and commit. The markers are a question, not a failure — and nothing is lost while you answer.',
            hint: 'Git refuses to guess — but it also refuses to lose either side\'s work.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'bughunt',
            id: 'git-q-commit-noadd',
            prompt: 'Byte runs this on a fresh branch and Git refuses to cooperate. Click the offending line, then pick the root cause.',
            language: 'bash',
            code:
              'git switch -c relay-hotfix\n# ...edit relay.py...\ngit commit -m "Lower relay current limit"\ngit switch main\ngit merge relay-hotfix',
            buggyLine: 3,
            causeOptions: [
              {
                id: 'a',
                text: 'Line 3 commits without staging first — the edit was never git add-ed, so there is nothing in the index to commit',
              },
              { id: 'b', text: 'Line 1 is invalid — git switch -c cannot create branches' },
              { id: 'c', text: 'Line 4 destroys the edit, because switching branches discards unstaged changes' },
              { id: 'd', text: 'Line 5 is wrong — branches are merged with git pull, not git merge' },
            ],
            causeCorrectId: 'a',
            fixExplanation:
              '`git commit` records the staging area, not the working copy — with nothing staged it refuses ("no changes added to commit"). Insert `git add relay.py` before the commit, or use `git commit -am "..."` to stage tracked files in the same step.',
            fixedCode:
              'git switch -c relay-hotfix\n# ...edit relay.py...\ngit add relay.py\ngit commit -m "Lower relay current limit"\ngit switch main\ngit merge relay-hotfix',
            explanation:
              'The two-step model from the last lesson applies on every branch: edits land in the working copy, and only `git add` moves them into the snapshot-to-be. The refusal message for a skipped add is famously easy to miss in long terminal output — which is why `git status` before every commit is the cheapest habit in version control.',
            hint: 'What exactly does git commit snapshot — the working copy, or something in between?',
          },
        },
      ],
    },
    {
      id: 'git-l3-collaboration',
      title: 'Remotes, Push/Pull & Pull Requests',
      minutes: 6,
      xp: 40,
      narrative:
        'The canonical repo lives on a server that rode out the outage. Every surviving workstation holds a clone. Reconnect them carefully — five engineers will share this history again.',
      steps: [
        {
          kind: 'teach',
          heading: 'Remotes: push and pull',
          body:
            'A **remote** is another copy of the repository — usually a server — registered under a name; by convention the one you cloned from is called `origin`. `git push origin main` uploads your new commits; `git pull` fetches the remote\'s new commits and merges them into yours. Your local history stays yours; the remote is the shared meeting point.\n\nPush what others should build on. Pull before you start work, so you diverge from the latest state instead of a stale one. If two people push competing histories, the second push is rejected — pull, integrate, then push again. That rejection is the system working, not failing.',
          keyPoints: [
            'origin = conventional name of the main remote',
            'push shares commits; pull fetches and integrates them',
            'Rejected push means: pull, reconcile, push again',
          ],
        },
        {
          kind: 'teach',
          heading: 'Pull requests and why history matters',
          body:
            'A **pull request** (PR) is not a Git command — it is the workflow wrapped around one: push a branch, then propose "merge my branch into main" on the hosting platform. The PR gives the team a place to review the diff, run CI, and discuss before the merge lands. Review happens at the PR, not after.\n\nThis is why history discipline pays. Small, single-purpose commits with real messages turn a 900-line PR into a readable story, and tools like `git bisect` can walk history commit-by-commit to find the exact commit that introduced a regression — but only if each commit is one idea.',
          keyPoints: [
            'A PR is a proposed merge plus review and CI, on the platform',
            'Small single-purpose commits make review and bisect possible',
            'The diff is the artifact; commit messages are its narration',
          ],
        },
        {
          kind: 'byte',
          text: 'Incident report, Cycle 198, root cause: "commit titled fix, contents unknown." Twelve words of commit message would have saved a week of debugging. Write the twelve words.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'git-q-pr',
            prompt: 'A teammate asks: "I pushed cal-fix to origin — what is the pull request actually for?"',
            options: [
              { id: 'a', text: 'It pulls the branch onto every engineer\'s machine automatically' },
              { id: 'b', text: 'It requests that others pull directly from the author\'s machine — a forced sync' },
              { id: 'c', text: 'It proposes merging cal-fix into main, opening a space for review, discussion, and CI before the merge happens' },
              { id: 'd', text: 'It is the command that performs the merge; approving it runs git merge on your laptop' },
            ],
            correctId: 'c',
            optionNotes: {
              a: 'PRs only touch the shared repository. Every other machine still decides for itself when to pull.',
              b: 'Nobody pulls from a colleague\'s machine. The PR lives on the platform, against the shared copy of the repo.',
              d: 'The platform merges after approval. The request itself is metadata — a proposed merge plus a review thread — not a command anyone runs locally.',
            },
            explanation:
              'The PR is the review gate between "my branch is done" and "main has my work". It bundles the diff, a discussion thread, and CI results so the team evaluates the change before it becomes everyone\'s history. After approval, the platform merges the branch — and the history then records both the commits and the review that blessed them.',
            hint: 'What has to happen between "the code is written" and "the code is in main" on any team with more than one person?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'git-q-pr-flow',
            prompt: 'Order the collaboration loop for landing a fix through review (first to last).',
            items: [
              { id: '1', text: 'git pull origin main', note: 'Start from the latest shared state, not a stale one.' },
              { id: '2', text: 'git switch -c link-margin', note: 'Isolate the work on its own branch.' },
              {
                id: '3',
                text: 'git add link_calc.py, then git commit -m "Raise link margin to 3 dB"',
                note: 'One logical change, one commit, one honest message.',
              },
              { id: '4', text: 'git push -u origin link-margin', note: 'Upload the branch to the shared remote.' },
              { id: '5', text: 'Open a pull request proposing link-margin into main', note: 'Review and CI happen here, before anything merges.' },
              { id: '6', text: 'Merge the PR once approved', note: 'The change becomes shared history for everyone.' },
            ],
            explanation:
              'The standard loop: synchronize, branch, commit small, push, propose, review, merge. Every step maps to something you already know — remotes hold shared history, branches isolate work, and the PR gates the merge on human review. Teams that skip the review step rediscover, expensively, why it exists.',
            hint: 'Never start new work from a stale main — and never push straight to main.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'git-q-push',
            prompt: 'Publish the new branch lidar-driver to the shared remote, and link it so future pushes need no arguments.',
            language: 'bash',
            template: 'git push {{b1}} {{b2}} lidar-driver',
            blanks: [
              { id: 'b1', accept: ['origin'], choices: ['origin', 'main', 'HEAD'] },
              { id: 'b2', accept: ['-u', 'u', '--set-upstream'], choices: ['-u', '-m', '-f'] },
            ],
            explanation:
              '`git push <remote> <branch>` uploads the branch, and the remote you cloned from is by convention named `origin` — `main` and `HEAD` are branch references, not remotes. The `-u` flag (set upstream) records the pairing between local `lidar-driver` and `origin/lidar-driver`, so every later `git push` or `git pull` on this branch needs no arguments. `-m` belongs to commits, and `-f` force-overwrites remote history — a flag you should meet much later, if ever.',
            hint: 'Which name means "the remote I cloned from", and which flag links this local branch to its remote twin?',
          },
        },
      ],
    },
    {
      id: 'git-l4-history',
      title: 'Reading History & .gitignore',
      minutes: 6,
      xp: 40,
      narrative:
        'The Version Archive holds every change ever committed — but only for engineers who know how to interrogate it. Learn to read history like a debugging instrument.',
      steps: [
        {
          kind: 'teach',
          heading: 'History is a debugging tool',
          body:
            '`git log` lists commits newest-first; `git log --oneline` compresses each to one line. `git show <hash>` reveals exactly what one commit changed, and `git diff main..feature` compares two branches. This is how you answer "what changed since it last worked?" — often the fastest path to a bug.\n\nTwo reference points organize everything: **HEAD** means "where I am right now" (the current commit), and **HEAD~1** is its parent, **HEAD~2** the grandparent. Meanwhile `main` and `origin/main` are different things: your local branch versus the remote\'s last-known state. When `git status` says your branch is "behind origin/main", someone pushed work you have not pulled yet.',
          keyPoints: [
            'git log / git show / git diff answer "what changed, when, by whom"',
            'HEAD = current position; HEAD~1 = parent commit',
            'main is local; origin/main is the remote\'s last known state',
          ],
        },
        {
          kind: 'byte',
          text: 'Archive lore: the oldest commit in this repository is titled "it works, do not touch". It was, of course, touched. The commit after it is titled "why".',
        },
        {
          kind: 'teach',
          heading: '.gitignore: commit what matters',
          body:
            'Not every file belongs in history. Build outputs (`dist/`, `*.o`), Python caches (`__pycache__/`), local environment files (`.env` with secrets), and gigabyte log captures should be listed in **.gitignore** so Git pretends they do not exist.\n\nThe test is simple: if a teammate cloned the repository fresh, what would they need to reconstruct the project? Source, configs-as-templates, and documentation — yes. Anything regenerated by a build tool, and anything machine-specific or secret — ignore it. Committing a `.env` with real credentials is one of the most common (and most expensive) beginner mistakes, because removing a file later does not remove it from history.',
          keyPoints: [
            'Ignore what can be regenerated or must stay secret',
            'Ignored files stay on disk — Git just stops tracking them',
            'Secrets in history stay in history: prevent, do not clean up',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'git-q-head',
            prompt: 'A teammate says "the bug appeared somewhere in the last three commits". Which reference points at the commit immediately before the current one?',
            options: [
              { id: 'a', text: 'origin/main' },
              { id: 'b', text: 'HEAD~1' },
              { id: 'c', text: 'main~0' },
              { id: 'd', text: 'git HEAD-1' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'origin/main is the remote\'s last known state — it may be ahead of, behind, or equal to your current commit, but it does not mean "the previous one".',
              c: '~0 means zero steps back — that is the current commit itself, and `main` only helps if you are actually on main.',
              d: 'There is no `HEAD-1` syntax. Git uses the tilde: HEAD~1 walks one parent up the chain.',
            },
            explanation:
              '**HEAD~1** is the parent of the current commit — tilde notation walks up the ancestry chain (HEAD~2, HEAD~3, …). Combined with `git show HEAD~1` or `git diff HEAD~1`, you can inspect exactly what the last change touched. `origin/main` answers a different question: where the shared remote believes main should be.',
            hint: 'Tilde counts parents backward from wherever you are standing.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'git-q-ignore',
            prompt: 'A new robotics repo is being set up. Which set of files belongs in .gitignore?',
            options: [
              { id: 'a', text: 'main.py, requirements.txt, README.md' },
              { id: 'b', text: '__pycache__/, dist/, .env, capture_2026-10-12.bag' },
              { id: 'c', text: 'Everything except .env — secrets are the only thing Git should never see' },
              { id: 'd', text: 'Nothing: more history is always better' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'These are exactly what a fresh clone needs — source, dependency list, documentation. Ignoring them would ship an empty project.',
              c: 'Secrets are one category, not the only one. Regenerable build output and huge binary captures bloat every future clone for no benefit.',
              d: 'History full of caches and 2 GB rosbags makes clones slow and diffs unreadable. History earns its size by recording decisions, not debris.',
            },
            explanation:
              'Ignore anything **regenerable** (caches, build output) or **non-shareable** (secrets, machine-local logs, giant captures). Source code, dependency manifests, and docs are the irreplaceable core. A 40 GB rosbag belongs in shared storage with a reference note — not in Git, where every clone pays for it forever.',
            hint: 'Ask: would a teammate on a fresh clone need this file, or can a tool (or nobody) regenerate it?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'git-q-investigate',
            prompt: 'A regression test started failing this morning. Order the history-driven investigation.',
            items: [
              { id: '1', text: 'Run the failing test and read the error carefully', note: 'Reproduce and understand before touching anything.' },
              { id: '2', text: 'git log --oneline to list recent commits', note: 'Candidate changes, newest first.' },
              { id: '3', text: 'git show <hash> on the suspicious commit', note: 'See exactly what it changed.' },
              { id: '4', text: 'git revert <hash> and re-run the test', note: 'Undo the suspect cleanly and verify the fix.' },
            ],
            explanation:
              'Reproduce, then let history narrow the search. `git log` gives candidates, `git show` gives evidence, and `git revert` undoes the culprit with a clean forward commit. This loop — bisecting suspicion with history instead of guessing — turns "it broke somehow" into a five-minute diagnosis.',
            hint: 'You cannot investigate what you cannot reproduce — and you should not undo what you have not inspected.',
          },
        },
      ],
    },
    {
      id: 'git-l5-undo',
      title: 'Undoing Things Safely',
      minutes: 6,
      xp: 45,
      narrative:
        'Last week an engineer tried to "take back" a push and rewrote the shared archive. The Version Archive asks you to re-certify the undo procedures before teams sync again.',
      steps: [
        {
          kind: 'teach',
          heading: 'Three layers of undo',
          body:
            'Git offers an undo for each layer of its model. **Working copy**: `git restore calibration.py` (or `git checkout -- file`) discards uncommitted edits — gone for good, so Git warns you. **Last commit, not yet pushed**: `git commit --amend` replaces it, or `git reset` moves the branch pointer back. **Already pushed and shared**: `git revert <hash>` creates a *new* commit whose content undoes the old one — history grows instead of being rewritten.\n\nThe safety rule follows directly: rewriting history (`reset` + force-push, `amend` on pushed commits) invalidates every teammate\'s copy. Reverting is additive, so everyone converges normally.',
          keyPoints: [
            'Uncommitted edits: git restore (destructive, local)',
            'Unpushed commits: amend or reset (rewrites your local history)',
            'Pushed commits: revert — a new commit that undoes an old one',
          ],
        },
        {
          kind: 'teach',
          heading: 'reset vs revert vs stash',
          body:
            '`git reset` rewinds your branch to an older commit. `--soft` keeps your changes staged, `--mixed` (default) unstages them, `--hard` deletes them from the working copy — the dangerous one. Reset rewrites history: perfect on a private branch, hostile on a shared one.\n\n`git revert` is the shared-history answer: it never moves existing commits, it appends an inverse. And when you just need to *pause* — half-finished tuning, but a hotfix must land now — `git stash` parks uncommitted changes on a stack; `git stash pop` brings them back. Stash is a clipboard, not a commit: it has no message history and should not store work you cannot afford to lose.',
          keyPoints: [
            'reset --hard destroys uncommitted work with no warning dialog',
            'revert is the only polite undo on branches other people pulled',
            'stash parks work briefly; it is not storage',
          ],
        },
        {
          kind: 'byte',
          text: 'Facility rule 7.3: "force-push is a fire escape, not a hallway." It exists for emergencies; running your daily commute through it ends badly.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'git-q-undo-shared',
            prompt: 'Commit 9f2e1 introduced a regression and is already on origin/main. Three teammates have pulled it. What is the correct undo?',
            options: [
              { id: 'a', text: 'git reset --hard HEAD~1, then git push --force' },
              { id: 'b', text: 'git revert 9f2e1, then git push' },
              { id: 'c', text: 'Delete main and recreate it from an older commit' },
              { id: 'd', text: 'Edit the files back by hand and commit "undo" with no reference to 9f2e1' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Rewriting shared history strands every teammate: their next pull collides with a main that no longer contains commits they already have. Force-pushes to shared branches are the archive\'s version of a fire alarm.',
              c: 'Recreating a branch deletes every commit made since — including unrelated good work and everyone\'s merge state.',
              d: 'A hand-rolled undo with no link to the offending commit loses the story. Future readers will ask "why is this line like this?" and history will shrug.',
            },
            explanation:
              '**git revert 9f2e1** computes the inverse patch and commits it on top. Nothing is rewritten: teammates pull normally, and history shows both the mistake and its correction — an honest record. Reset-and-force-push is reserved for private branches where nobody else has built on your work.',
            hint: 'Whose copy breaks if the old commits vanish?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'bughunt',
            id: 'git-q-reset-bug',
            prompt: 'An engineer spent the afternoon retuning a controller and now wants to commit. This shell session ends in tears — click the line that causes the damage.',
            language: 'bash',
            code: 'vim calibration.py      # hours of careful retuning\ngit status              # modified: calibration.py\ngit reset --hard\ngit commit -m "Retune arm calibration"',
            buggyLine: 3,
            causeOptions: [
              { id: 'a', text: 'git status is read-only and cannot modify files' },
              { id: 'b', text: 'git reset --hard wipes the uncommitted retuning before any commit exists — the afternoon of work is unrecoverable, so the final commit has nothing' },
              { id: 'c', text: 'vim must be closed before Git can commit the file' },
              { id: 'd', text: 'The commit message is missing a ticket number' },
            ],
            causeCorrectId: 'b',
            fixExplanation:
              'The work was never committed, so there was nothing to reset — reset --hard simply destroyed it (and left the commit on line 4 with nothing staged). The safe sequence: commit the retuning first, and if it turns out wrong, undo with git revert. Anything you cannot afford to lose gets committed (or stashed) before any reset.',
            fixedCode: 'vim calibration.py      # hours of careful retuning\ngit add calibration.py\ngit commit -m "Retune arm calibration"\n# if it proves wrong later: git revert HEAD',
            explanation:
              '`git reset --hard` means "make everything match the last commit, discarding working-copy changes". It skips the staging area, skips the trash can, and asks no questions. The reflex that saves careers: **commit early, revert politely** — a small imperfect commit is recoverable, uncommitted work is not.',
            hint: 'At line 3, where do the retuned values exist? And what does --hard do to that place?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'git-q-stash-fill',
            prompt: 'A hotfix arrives mid-retuning. Park the half-finished work, handle the emergency, then bring the work back.',
            language: 'bash',
            template: 'git {{b1}}\ngit switch main\n# ...hotfix committed on main...\ngit switch retune-arm\ngit stash {{b2}}',
            blanks: [
              { id: 'b1', accept: ['stash'], choices: ['stash', 'reset', 'commit --amend'] },
              { id: 'b2', accept: ['pop'], choices: ['pop', 'drop', 'rebase'] },
            ],
            explanation:
              '`git stash` sweeps uncommitted changes onto a stack and gives you a clean working copy, safe for switching branches. `git stash pop` applies the most recent stash and removes it from the stack. `drop` would discard the work, and there is nothing to rebase mid-restore. For anything lasting more than a day, commit it on a work-in-progress branch instead — stash is a clipboard, not a filing cabinet.',
            hint: 'First blank: which command "parks" changes? Second: which one brings the newest parking ticket back?',
          },
        },
      ],
    },
    {
      id: 'git-l6-bisect',
      title: 'Bisecting & Release Tags',
      minutes: 6,
      xp: 45,
      narrative:
        'A regression hides somewhere in 500 commits, and the failing test only says "wrong". Reading every diff is a two-day task; binary search over history is a twenty-minute one. Git drives the search — you drive the test.',
      steps: [
        {
          kind: 'teach',
          heading: 'git bisect: history as a sorted array',
          body:
            '`git bisect` is an automated **binary search over commit history**. You give it two facts — one commit where the bug exists (**bad**) and one where it does not (**good**) — and Git checks out the commit halfway between. You test that midpoint, report `git bisect good` or `git bisect bad`, and Git halves the remaining range again. Each round eliminates half the suspects, so 1,000 commits take about 10 test rounds, not 1,000.\n\nThe payoff compounds with clean history: one commit = one idea means the culprit Git isolates is also the explanation. When the search ends, `git bisect reset` returns you to your branch — never skip it, or you stay stranded on a detached midpoint.',
          keyPoints: [
            'Binary search: each good/bad verdict halves the remaining range',
            'You supply the test; Git supplies the next commit to try',
            'git bisect reset returns you to your branch when the search ends',
          ],
        },
        {
          kind: 'teach',
          heading: 'Tags: names that do not move',
          body:
            'A **tag** is a permanent name pinned to one commit — `git tag -a v2.1.0 -m "Fleet release 2.1.0"` marks the exact snapshot shipped to the robots. Unlike a branch, a tag never moves: no commit advances it, which is precisely what makes it a release marker.\n\nTags make every other history tool precise. Bisect\'s known-good baseline becomes `git bisect good v2.0.0` — the release that worked — instead of a hash someone dug out of `git log`. Rollback becomes "redeploy v2.0.0" instead of "that commit from last Tuesday, I think". An untagged history can still be searched, but nobody can name the version that worked — and unnamed versions cannot be trusted or restored.',
          keyPoints: [
            'git tag -a v2.1.0 -m "..." pins a permanent name to one commit',
            'Tags do not move when you commit — branches do',
            'Named releases make bisect baselines and rollbacks exact',
          ],
        },
        {
          kind: 'byte',
          text: 'Archive note: the "Tuesday flake" fell to bisect in 12 test rounds across 4,096 commits — after two afternoons of reading diffs had failed. The lesson glued to the terminal: tag every release, so the search always has a known-good place to start.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'git-q-bisect-flow',
            prompt: 'The joint-limit test regressed sometime this week. Order the bisect session from start to finish.',
            items: [
              { id: '1', text: 'git bisect start', note: 'Open the search session.' },
              { id: '2', text: 'git bisect bad', note: 'The current commit fails — that is where the search begins.' },
              { id: '3', text: 'git bisect good v2.0.0', note: 'The last tagged release passed — the culprit hides between the two ends.' },
              { id: '4', text: 'Run the failing test on the commit Git checks out', note: 'One midpoint at a time; the test is your oracle.' },
              { id: '5', text: 'git bisect bad (or good) — report what the test showed', note: 'Git halves the range and checks out the next midpoint.' },
              { id: '6', text: 'git bisect reset', note: 'Search over: return to your branch, then fix or revert the culprit.' },
            ],
            explanation:
              'The session has a fixed shape: declare the search, pin the bad end, pin a known-good end (a tag makes that trivial), then loop — test the offered midpoint, report the verdict — until Git isolates the culprit commit. Every report halves the suspects, which is why a week of history falls in a handful of test runs. `reset` ends the session and puts you back on your branch, ready to revert or repair the commit the evidence named.',
            hint: 'Start needs both ends of the range before any midpoint can be tested.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'git-q-bisect-math',
            prompt: 'The regression is somewhere in the 512 commits since the last tagged release. Roughly how many test rounds does bisect need?',
            options: [
              { id: 'a', text: 'About 9 — each verdict halves the range, and 2 to the 9th is 512' },
              { id: 'b', text: 'About 512 — every commit must be tested once' },
              { id: 'c', text: 'About 256 — bisect tests one half of the history' },
              { id: 'd', text: 'It depends on commit size — big commits take proportionally more rounds' },
            ],
            correctId: 'a',
            optionNotes: {
              b: 'That is the linear scan bisect exists to replace — 512 test runs is exactly the afternoon you do not have.',
              c: 'The first midpoint does cover roughly half the commits, but only in the sense that one verdict eliminates them all — the counting still finishes near log2.',
              d: 'Commit size changes what the culprit diff looks like, not how many halvings a range of 512 needs.',
            },
            explanation:
              'Binary search is logarithmic: after each good/bad report the remaining suspects halve — 512, 256, 128, 64, 32, 16, 8, 4, 2, 1 — so about 9-10 test rounds isolate one commit out of 512. This is the entire reason bisect exists, and it works only if the property you test is truly binary: fails at the bad end, passes at the good end, and never flaps in between. A flaky test makes a terrible bisect oracle.',
            hint: 'How many times can you halve 512 before one commit remains?',
          },
        },
      ],
    },
  ],
  flashcards: [
    {
      id: 'fc-git-1',
      categoryId: 'git',
      concept: 'Commit',
      explanation:
        'A snapshot of the staged content plus a parent pointer, author, timestamp, and message. The chain of commits is the project history.',
      example: 'git commit -m "Fix lidar calibration offset" records one logical change permanently.',
      misconception:
        'A commit is not a backup of your working folder — it records exactly what was staged, nothing more.',
      application:
        'git bisect and git revert operate at commit granularity: clean, single-purpose commits make both tools usable.',
      difficulty: 1,
    },
    {
      id: 'fc-git-2',
      categoryId: 'git',
      concept: 'Staging area (index)',
      explanation:
        'The waiting room between working copy and history. git add queues changes there; git commit records exactly what is queued.',
      example: 'Fix five files, add two of them, commit — the other three remain uncommitted work.',
      misconception:
        'git add does not record history; it only selects. A staged change is still fully editable and uncommitted.',
      application:
        'Lets one messy working copy produce several clean commits — the difference between reviewable history and an unreadable log.',
      difficulty: 1,
    },
    {
      id: 'fc-git-3',
      categoryId: 'git',
      concept: 'Branch',
      explanation:
        'A movable label pointing at one commit. Committing advances the current label; switching branches moves you between parallel lines of history.',
      example: 'git switch -c relay-hotfix creates and moves onto a branch in one command.',
      misconception:
        'Branches are not copies of the project — creating one costs about 41 bytes. The isolation is logical, not physical.',
      application:
        'Every experiment, hotfix, and feature gets its own branch, so main stays shippable while risky work proceeds in parallel.',
      difficulty: 1,
    },
    {
      id: 'fc-git-4',
      categoryId: 'git',
      concept: 'Merge conflict',
      explanation:
        'When two branches changed the same lines differently since their common ancestor, Git marks both versions with <<<<<<< / >>>>>>> markers and pauses the merge until a human decides.',
      example: 'Resolve gain.py, git add it, then git commit to complete the merge — or git merge --abort to back out.',
      misconception:
        'A conflict means neither data loss nor a broken repository — it is a paused merge awaiting one decision.',
      application:
        'Routine on any shared firmware branch. Reading both sides and the intent behind them is the actual skill.',
      difficulty: 2,
    },
    {
      id: 'fc-git-5',
      categoryId: 'git',
      concept: 'Remote',
      explanation:
        'Another copy of the repository — typically a shared server — registered under a name; origin is the conventional name for the one you cloned from.',
      example: 'git push origin main uploads local commits to the shared copy.',
      misconception:
        'The remote is not "the original" — every clone is a complete repository, and the server is just the meeting point everyone agreed on.',
      application:
        'All team synchronization runs through remotes: push to share, pull to catch up, rejected push to learn someone moved first.',
      difficulty: 1,
    },
    {
      id: 'fc-git-6',
      categoryId: 'git',
      concept: 'Pull request',
      explanation:
        'A platform-level proposal to merge one branch into another, bundling the diff, a review thread, and CI results. Merging happens only after review.',
      example: 'Push sensor-fix, open a PR into main, address review comments, merge when approved.',
      misconception:
        'A PR is not a Git command — it is workflow built on top of Git, living on the hosting platform rather than in your terminal.',
      application:
        'The review gate that keeps a team\'s main branch trustworthy — and where knowledge about the codebase actually gets shared.',
      difficulty: 2,
    },
    {
      id: 'fc-git-7',
      categoryId: 'git',
      concept: 'Revert vs reset',
      explanation:
        'revert appends a new commit that undoes an old one — history grows, safe on shared branches. reset moves the branch pointer backward, rewriting history; --hard also discards uncommitted work.',
      example: 'Shared regression: git revert 9f2e1. Private unpushed mess: git reset --soft HEAD~1.',
      misconception:
        'reset does not create any "undo commit" — it rewrites. Teammates who already pulled will collide with your force-push.',
      application:
        'The polite-undo rule keeps team history convergent: revert anything that has been pushed, reset only what is still yours alone.',
      difficulty: 2,
    },
    {
      id: 'fc-git-8',
      categoryId: 'git',
      concept: 'Stash',
      explanation:
        'Parks uncommitted changes on a stack and restores a clean working copy; git stash pop brings back the most recent entry and removes it from the stack.',
      example: 'Half-finished retuning, urgent hotfix: git stash, fix on main, switch back, git stash pop.',
      misconception:
        'Stash is a clipboard, not a commit — no message, no history, easy to forget. Day-old work belongs on a WIP branch instead.',
      application:
        'Interrupt-driven lab life: context switches mid-experiment without committing broken states to history.',
      difficulty: 2,
    },
    {
      id: 'fc-git-9',
      categoryId: 'git',
      concept: 'Tag',
      explanation:
        'A permanent name pinned to one commit — git tag -a v2.1.0 -m "..." marks the exact snapshot of a release. Unlike a branch, a tag never moves when new commits land.',
      example: 'git bisect good v2.0.0 uses the tagged release as the known-good baseline; "redeploy v2.0.0" is a rollback by name instead of by remembered hash.',
      misconception:
        'A tag is not a branch: checking out a tag gives you a detached snapshot to inspect, not a line of history to extend — commits made there are stranded unless you branch first.',
      application:
        'Release markers give every history tool exact coordinates: bisect baselines, rollback targets, and changelog boundaries all name a tag instead of a hash.',
      difficulty: 2,
    },
  ],
};
