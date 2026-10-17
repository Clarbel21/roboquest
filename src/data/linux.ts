import type { Category } from '../engine/types';

// Linux Maintenance Terminal — content module.
// Shape, depth, and tone follow the reference in src/data/arch.ts.

export const linuxCategory: Category = {
  id: 'linux',
  name: 'Linux',
  tagline: 'Take the facility\'s shell back from the chaos',
  icon: '🐧',
  description:
    'Every maintenance terminal in the facility runs Linux, and the last admin left permissions mangled, processes rotting, and dotfiles cursed. Relearn the file tree, the permission grid, and the process table — the operating system under every robot stack.',
  accent: 'violet',
  lessons: [
    {
      id: 'lx-l1-filesystem',
      title: 'The File Tree & Basic Navigation',
      minutes: 5,
      xp: 35,
      narrative:
        'The maintenance shell boots to a prompt with no map. The facility\'s file tree was reorganized during the incident and nobody wrote it down. Start with the coordinate system every Linux machine shares.',
      steps: [
        {
          kind: 'teach',
          heading: 'One tree, one root',
          body:
            'Linux mounts everything as a single tree starting at `/` — disks, network shares, and device files all hang somewhere under that root. There are no drive letters. Your location in the tree is the **working directory**: `pwd` prints it, `ls` lists what is around you, `cd` moves you, `cat` prints a file\'s contents.\n\nAn **absolute path** starts at the root (`/opt/roboquest/logs/run1.log`) and works from anywhere. A **relative path** starts at your working directory: from `/opt/roboquest`, the same file is just `logs/run1.log`, and `..` means the parent directory. Relative paths keep interactive commands short; absolute paths keep scripts honest — a cron job running from an unknown directory can only find things by absolute path.',
          keyPoints: [
            'Everything hangs under one root: /',
            'pwd shows where you are; ls, cd, and cat inspect and move',
            'Absolute paths start at /; relative paths start at the working directory',
          ],
        },
        {
          kind: 'teach',
          heading: 'Home, shortcuts, and reading logs',
          body:
            '`~` is shorthand for your **home directory** (`/home/lab` for user `lab`), and `cd` with no arguments takes you there — the universal "reset position" move. `.` is the current directory and `..` the parent, and they chain: `cd ../config` steps up one level and down into `config`.\n\nReading files is where these earn their keep. `cat run1.log` dumps a whole file; for large logs, `less` pages through them and `tail -f run1.log` follows new lines as the robot writes them — the standard way to watch a process think. Two more habits: tab completion expands paths without typos, and `ls -lh` shows sizes in human-readable units, which is how you spot the log file quietly eating the disk.',
          keyPoints: [
            '~ is home; plain cd returns there',
            '. and .. chain into precise relative moves',
            'tail -f watches logs live; less pages through big files',
          ],
        },
        {
          kind: 'byte',
          text: 'Archive note: an engineer once hunted a "missing" config for an entire afternoon. It was in ./config, and they were standing in ./configs. Byte now prints pwd before every file operation, out of principle.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'lx-q-relpath',
            prompt: 'Your working directory is /home/lab/logs. Which file does `cat ../scripts/calibrate.sh` read?',
            options: [
              { id: 'a', text: '/home/lab/scripts/calibrate.sh' },
              { id: 'b', text: '/home/scripts/calibrate.sh' },
              { id: 'c', text: '/home/lab/logs/scripts/calibrate.sh' },
              { id: 'd', text: '/scripts/calibrate.sh' },
            ],
            correctId: 'a',
            optionNotes: {
              b: '.. moves up exactly one level (logs to lab), not two. Dropping a component per .. is the whole rule.',
              c: 'That treats .. as an ordinary folder name and ignores it. .. is a real path component that removes the previous one.',
              d: 'Paths starting at / are absolute and ignore your working directory entirely — that is not what a relative path does.',
            },
            explanation:
              'Relative paths resolve against the working directory, component by component: `..` removes the last component (`logs`), leaving `/home/lab`, then `scripts/calibrate.sh` appends. Running `pwd` before you `cat` is the cheapest debugging habit in Linux — half of all "file not found" is a surprise about where you are standing, not where the file is.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'lx-q-cd-chain',
            prompt: 'The shell starts in /home/lab. What does the final pwd print?',
            language: 'bash',
            code: 'pwd                 # /home/lab\ncd fleet/rq-7/logs\ncd ../../rq-9\npwd',
            choices: ['/home/lab/fleet/rq-9', '/home/lab/fleet/rq-7/rq-9', '/home/lab/rq-9', '/home/fleet/rq-9'],
            correctIndex: 0,
            explanation:
              'Step by step: `cd fleet/rq-7/logs` lands in `/home/lab/fleet/rq-7/logs`. Then `cd ../..` removes two components (`logs`, then `rq-7`), leaving `/home/lab/fleet`, and `rq-9` appends from there. Mental execution of paths is exactly the skill that stops `cd` roulette — and the reason scripts that change directories should anchor themselves with absolute paths first.',
            hint: 'Count the .. one component at a time: logs, then rq-7.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'lx-q-basic-cmds',
            prompt: 'Complete the three commands every terminal session leans on.',
            language: 'bash',
            template:
              '{{b1}}              # where am I, full path?\n{{b2}} -lh          # list files with human-readable sizes\n{{b3}} run1.log     # print the log file\'s contents',
            blanks: [
              { id: 'b1', accept: ['pwd'], choices: ['pwd', 'cd', 'whoami'] },
              { id: 'b2', accept: ['ls'], choices: ['ls', 'cat', 'ps'] },
              { id: 'b3', accept: ['cat'], choices: ['cat', 'cd', 'ls'] },
            ],
            explanation:
              '`pwd` prints the working directory — the answer to "where am I", which is the first question of every path mystery. `ls -lh` lists contents with sizes in human units (`4.0K`, `12M`) instead of raw blocks. `cat` concatenates a file to the terminal — ideal for short logs; reach for `less` or `tail -f` when the file outgrows one screen.',
            hint: 'One prints your location, one lists contents, one prints a file.',
          },
        },
      ],
    },
    {
      id: 'lx-l2-perms',
      title: 'Permissions, chmod & sudo',
      minutes: 6,
      xp: 40,
      narrative:
        'Scripts across the facility refuse to run, and one config file that should be secret is world-writable. The permission bits are the facility\'s access-control grid — time to read them.',
      steps: [
        {
          kind: 'teach',
          heading: 'Reading rwx',
          body:
            'Every file carries three permission triples — **owner**, **group**, **others** — each with bits for read, write, execute. `ls -l` shows them as `rwxr-xr--`: the owner may read, write, and execute; the group may read and execute; everyone else may only read. Directories use the same bits with different meanings: `r` lists entries, `w` creates and deletes inside, `x` enters.\n\nThe numeric form packs each triple into one digit: r=4, w=2, x=1, summed. So `7` is rwx, `6` is rw-, `5` is r-x, `4` is r--. `755` is owner-full, group and others read+execute — the classic mode for scripts and directories. `644` (rw-r--r--) is the classic for data files nobody should run.',
          keyPoints: [
            'Three triples in fixed order: owner, group, others',
            'Digits: r=4, w=2, x=1 — 755 = rwxr-xr-x, 644 = rw-r--r--',
            'On directories, x means "may enter"',
          ],
        },
        {
          kind: 'teach',
          heading: 'chmod and the sudo idea',
          body:
            '`chmod 755 deploy.sh` sets the whole permission mask in one stroke; `chmod +x deploy.sh` just adds execute for everyone — the move you reach for the first time a script says `Permission denied`. Only the file\'s owner (or root) may chmod a file.\n\nSome operations — installing packages, binding ports below 1024, writing under `/opt` or `/etc` — exceed any normal user\'s power. **sudo** runs one command with root\'s authority after checking you against the sudoers list. It is deliberately not a login: each use is logged, scoped to a single command, and expires. The old admin\'s habit of living as root permanently is why one typo in a deploy script could brick a controller — least privilege is the facility\'s real safety system.',
          keyPoints: [
            'chmod sets permission masks; +x is the quick "make it runnable"',
            'sudo = one command with root authority, checked and logged',
            'Run with the least privilege the task allows',
          ],
        },
        {
          kind: 'byte',
          text: 'The old admin\'s .bash_history contains 4,000 commands, all run as root, including one memorable rm -rf with a typo in it. The rebuilt terminal now asks "why?" before every sudo. Byte considers this personal growth.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'lx-q-rwx-others',
            prompt: '`ls -l` shows: `-rwxr-xr-- 1 lab ops 4096 diagnostics.sh`. What can a user who is not `lab` and not in the `ops` group do with this file?',
            options: [
              { id: 'a', text: 'Read it, but neither modify nor execute it' },
              { id: 'b', text: 'Nothing at all' },
              { id: 'c', text: 'Read and execute it' },
              { id: 'd', text: 'Read, write, and execute it' },
            ],
            correctId: 'a',
            optionNotes: {
              b: '"Nothing" would be --- in the last triple. Others hold r here, so reading is allowed.',
              c: 'That is the group triple (r-x), which applies to members of ops. This user is in neither the owner nor the group slot.',
              d: 'That is the owner triple (rwx). Ownership applies only to the named user, lab.',
            },
            explanation:
              'Read the mask as three triples in fixed order — owner, group, others — and find the position of the requesting user. `rwxr-xr--` gives owner `lab` full control, group `ops` read+execute, and everyone else read-only: able to inspect the script but one `./` away from Permission denied. This exact mask is a common accident on scripts: the author assumed "executable" was a single switch, but execute is granted per triple — `chmod 755` is the usual fix.',
            hint: 'Which of the three triples applies to someone who is neither owner nor in the group?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'lx-q-chmod',
            prompt: 'Finish the chmod command and the rule about digit order.',
            language: 'bash',
            template:
              '# make the deploy script runnable by all, writable by owner only\n{{b1}} 755 deploy.sh\n\n# the three digits are, in order: {{b2}}, group, other',
            blanks: [
              { id: 'b1', accept: ['chmod'], choices: ['chmod', 'chown', 'ls'] },
              { id: 'b2', accept: ['owner', 'user', 'u'], choices: ['owner', 'group', 'other'] },
            ],
            explanation:
              '`chmod` changes permission masks; `755` expands to rwx (owner) r-x (group) r-x (others) — everyone can run the script, only the owner can change it. The digit order never varies: owner, group, other. Reading any mode string you meet becomes mechanical once you convert each digit to its r/w/x sum: 6 = rw-, 5 = r-x, 4 = r--.',
            hint: 'The command that changes permission bits, and the first of the three triples.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'bughunt',
            id: 'lx-q-chmod-644',
            prompt: 'This deploy script was "secured" and now nobody can run it. Click the line that broke it.',
            language: 'bash',
            code: '#!/bin/bash\n# cell_deploy.sh - push config and restart the cell controller\ncp cell_config.yaml /opt/cells/\nsystemctl restart cell-controller\nchmod 644 cell_deploy.sh\n./cell_deploy.sh',
            buggyLine: 5,
            causeOptions: [
              { id: 'a', text: '644 removes the execute bit from every triple, including the owner\'s — the script can never be launched as ./cell_deploy.sh' },
              { id: 'b', text: 'chmod numbers must use three different digits' },
              { id: 'c', text: 'systemctl must run after the ./cell_deploy.sh line' },
              { id: 'd', text: 'The ./ prefix only works inside your home directory' },
            ],
            causeCorrectId: 'a',
            fixExplanation:
              '644 decodes to rw-r--r--: read and write for the owner, read for everyone, and no execute bit anywhere. Linux refuses to execute a file without the x bit — hence `Permission denied`. The fix is `chmod 755 cell_deploy.sh` (or `chmod +x cell_deploy.sh`), which restores execute while leaving the file writable only by the owner.',
            fixedCode: '#!/bin/bash\n# cell_deploy.sh - push config and restart the cell controller\ncp cell_config.yaml /opt/cells/\nsystemctl restart cell-controller\nchmod 755 cell_deploy.sh\n./cell_deploy.sh',
            explanation:
              'Permission denied on `./script.sh` is almost always a missing execute bit, and `chmod 644` is the classic way scripts acquire it — someone "tightens" a file copied from a config template. Diagnose with `ls -l`, not guesses: the mask tells you immediately which triples lost their x. Rule of thumb: 755 for things that run, 644 for things that are read.',
            hint: 'Decode the number: what is 6, and what is 4, in r/w/x sums?',
          },
        },
      ],
    },
    {
      id: 'lx-l3-processes',
      title: 'Processes, Jobs & Environment',
      minutes: 6,
      xp: 40,
      narrative:
        'A simulator process has been chewing one CPU core since Tuesday and nobody knows its name. Process control — finding it, stopping it, and configuring the environment it runs in — is the last skill this terminal needs.',
      steps: [
        {
          kind: 'teach',
          heading: 'Finding and stopping processes',
          body:
            'Every running program is a **process** with a numeric **PID**. `ps aux` lists them all; `ps aux | grep sim` narrows the list to the simulator; `top` or `htop` show CPU hogs live. Once you have the PID, `kill 4821` asks the process to shut down (**SIGTERM**) — it may save state and close files first. Only if it ignores that does `kill -9 4821` (**SIGKILL**) remove it without appeal, losing anything it had not flushed.\n\nThis matters doubly on robots: a wedged control loop can hold a motor enable line. So the drill is: find it precisely by name, verify the PID is really the culprit, send TERM, and escalate to -9 only with evidence.',
          keyPoints: [
            'ps aux (often piped through grep) maps program names to PIDs',
            'kill sends SIGTERM — a polite, catchable shutdown request',
            'kill -9 (SIGKILL) is the last resort: no cleanup, no save',
          ],
        },
        {
          kind: 'teach',
          heading: 'Background jobs and the environment',
          body:
            'Append `&` to run a command as a **background job** (`ros2 launch cell sim.launch.py &`), freeing the terminal; `jobs` lists them and `fg` brings one back. Backgrounded children still belong to your shell — close the session and they may die with it, which is why long runs use `tmux` or `nohup`.\n\nPrograms read configuration from **environment variables**: `ROS_DOMAIN_ID`, `ROBOT_ID`, `PATH`. `export CELL="bay-3"` sets `CELL` and marks it for inheritance — every child process (scripts, simulators, launch files) receives a copy. Without `export`, the variable exists only in the current shell and your launch file never sees it. Settings that must survive belong in `~/.bashrc` for interactive shells, or in the service\'s environment file — not in retyped commands.',
          keyPoints: [
            '& backgrounds a job; jobs and fg manage it',
            'export passes a variable to child processes; plain assignment does not',
            'Persistent configuration lives in ~/.bashrc or service env files',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'lx-q-kill-drill',
            prompt: 'A simulator is pinning one core at 100%. Order the shutdown drill from first move to last resort.',
            items: [
              { id: '1', text: 'Identify it: ps aux | grep sim to find the PID and full command', note: 'Never kill a PID you have not identified — read the command column.' },
              { id: '2', text: 'Confirm the PID is the runaway (CPU time, start time, arguments)', note: 'Similar names, different owners: the ps columns disambiguate.' },
              { id: '3', text: 'kill <pid> — send SIGTERM and give it a few seconds', note: 'TERM is catchable: the process can flush data and release hardware.' },
              { id: '4', text: 'Re-check with ps: did it actually exit?', note: 'Verify the effect before escalating.' },
              { id: '5', text: 'kill -9 <pid> — SIGKILL, only because TERM was ignored', note: 'No cleanup, no save, held hardware stays held — last resort.' },
            ],
            explanation:
              'The drill is identify, verify, polite stop, check, force. SIGTERM is a request the process may handle: close log files, release a motor enable, save state. SIGKILL is the kernel deleting the process behind its back — unflushed data is lost, and on robots, hardware states can be left held. Teams that jump straight to -9 eventually kill the wrong PID and lose the wrong data.',
            hint: 'Escalation is earned: prove the polite option failed first.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'lx-q-export',
            prompt: 'These three lines run in one shell. What does the last line print?',
            language: 'bash',
            code: 'ROBOT_ID="rq-7"\nexport CELL="bay-3"\nbash -c \'echo $ROBOT_ID:$CELL\'',
            choices: [':bay-3', 'rq-7:bay-3', 'rq-7:', '$ROBOT_ID:$CELL'],
            correctIndex: 0,
            explanation:
              'The child `bash -c` inherits only **exported** variables. `CELL` was exported, so it arrives as `bay-3`; `ROBOT_ID` was assigned without `export`, so it stays in the parent shell and expands to the empty string inside the child — producing `:bay-3`. This is the exact mechanism behind "works in my shell, fails in the cron job": the variable existed in your shell, but never in the child that needed it.',
            hint: 'Which of the two variables was marked for inheritance by child processes?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'lx-q-cron-env',
            prompt:
              'A harvest script works from your shell but fails under cron with "ROBOT_ID not set". Your ~/.bashrc contains `export ROBOT_ID="rq-7"`. Why does cron not see it?',
            options: [
              { id: 'a', text: 'cron always runs as root, and root has no .bashrc' },
              { id: 'b', text: 'Environment variables cannot be read by Python scripts' },
              { id: 'c', text: 'cron jobs start from a minimal environment that never sources your .bashrc, so the export never happens in the cron shell' },
              { id: 'd', text: 'Linux limits each process to 10 environment variables' },
            ],
            correctId: 'c',
            optionNotes: {
              a: 'Your crontab runs under your user, and root has a .bashrc anyway. The owning user is not the problem — the missing sourcing is.',
              b: 'Scripts read environment variables fine (os.environ in Python). This variable simply never reached the process.',
              d: 'There is no such practical limit. The scenario is about which variables a child inherits, not how many fit.',
            },
            explanation:
              'Exported variables are inherited from parent to child — but cron does not start your job from your interactive shell. It spawns a bare, non-interactive shell with a default PATH and none of your rc files, so anything configured only in `.bashrc` is absent. The fixes: define the variables inside the crontab entry, wrap the job in a script that sources its own environment file, or use the service\'s EnvironmentFile. Lesson: a process\'s configuration is whatever its parent handed it — know the parent.',
            hint: 'Who is the parent process of a cron job, and what would it hand down?',
          },
        },
      ],
    },
    {
      id: 'lx-l4-packages',
      title: 'Packages & Environments',
      minutes: 5,
      xp: 40,
      narrative:
        'Every robot cell runs its own controller software, and each install has collided with the last — two projects, two numpy versions, one system Python. Packages and environments are how the facility stops fighting itself.',
      steps: [
        {
          kind: 'teach',
          heading: 'Two layers of package managers',
          body:
            'Linux installs software at two layers. The **system package manager** (`apt` on this facility\'s Debian-style machines) installs distro-built software for the whole box: `sudo apt install python3-serial` places a version the distro tested against everything else, owned by root, upgraded on the distro\'s schedule.\n\nThe **language package manager** (`pip` for Python) installs libraries from PyPI — fresher versions, but it knows nothing about apt\'s ledger. Mixing the layers carelessly is how machines break: `sudo pip install` can overwrite a file apt owns, and the next `apt upgrade` corrupts an interpreter the whole system depends on. The house rule: apt for system-wide tools; pip only inside an environment you own.',
          keyPoints: [
            'apt installs distro-built, system-wide software; pip installs PyPI libraries',
            'sudo pip install can clobber apt-managed files — the classic broken-Python move',
            'apt for system tools; pip inside a project environment you own',
          ],
        },
        {
          kind: 'teach',
          heading: 'Virtual environments: one sandbox per project',
          body:
            'A **virtual environment (venv)** is a private, disposable slice of Python for one project: its own interpreter link and its own `site-packages`. `python3 -m venv .venv` creates it, `source .venv/bin/activate` enters it, and from then on bare `python` and `pip` resolve to the venv\'s copies — `which python3` proves it by pointing into `.venv/bin/`.\n\nThe payoff is conflict-freedom: the cell controller keeps numpy 1.x while the analysis notebook uses 2.x, because each project\'s environment holds its own. `pip install` inside an activated venv touches nothing outside it, and `pip freeze > requirements.txt` records the exact versions so the environment can be rebuilt on the next robot with two commands. Delete `.venv` and nothing else notices — environments are cheap; system Pythons are not.',
          keyPoints: [
            'A venv is a private interpreter + site-packages for one project',
            'activate puts the venv first in PATH: python and pip become project-local',
            'requirements.txt records versions; a venv can be rebuilt or deleted harmlessly',
          ],
        },
        {
          kind: 'byte',
          text: 'Archive: the Great Numpy Incident. One sudo pip install upgraded the system numpy under a running controller, and motion trajectories turned to NaN mid-shift. Byte now asks "is the venv active?" before every pip, in a tone the humans have learned to answer.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'lx-q-install-where',
            prompt: 'The cell-controller project needs pyserial pinned at one version; another lab project needs a different one. What is the correct install?',
            options: [
              { id: 'a', text: 'sudo pip install pyserial==3.5 — root ensures it applies everywhere at once' },
              { id: 'b', text: 'python3 -m venv .venv, activate it, then pip install pyserial==3.5 — the pinned version lives inside this project\'s environment only' },
              { id: 'c', text: 'sudo apt install pyserial==3.5 — apt is the safest installer for any Python library' },
              { id: 'd', text: 'Edit the system site-packages directly so both projects share one version' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Root installs into the system Python, which both projects share — the version conflict is unresolved, and apt-managed files may be clobbered on the way.',
              c: 'apt only installs what the distro packages, at the version it pinned — almost never the specific version a project needs, and still system-wide.',
              d: 'Hand edits to system site-packages are untracked and unreproducible, and the next apt or pip operation undoes them for both projects.',
            },
            explanation:
              'Per-project version conflicts are precisely what virtual environments exist for: each venv carries its own site-packages, so two projects can hold different pyserial versions on one machine without either touching the system Python. `pip freeze > requirements.txt` inside the activated venv records the working set, and venv-plus-install reproduces it anywhere. `sudo pip`, by contrast, writes into the interpreter every system tool shares — the riskiest install on the box.',
            hint: 'The conflict is between two projects — so give the dependency a per-project home.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'lx-q-venv-check',
            prompt: 'A health-check script runs inside an activated venv. What does it print?',
            language: 'python',
            code: 'import sys\nin_venv = sys.prefix != sys.base_prefix\nprint("venv:", in_venv)',
            choices: ['venv: True', 'venv: False', 'venv: None', 'AttributeError: no attribute base_prefix'],
            correctIndex: 0,
            explanation:
              '`sys.prefix` is the interpreter this process actually runs from; `sys.base_prefix` is the underlying system interpreter. Inside a venv the two differ — that is the entire mechanism — so the check prints True. Run the same lines outside any venv and both point at /usr, printing False. It is the standard way to answer "is my environment active?" programmatically, and worth wiring into setup scripts: a pip install aimed at an inactive venv lands in the system Python silently.',
            hint: 'Inside a venv the process runs from .venv/bin/python3, not /usr/bin/python3.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'lx-q-venv-setup',
            prompt: 'Bootstrap a reproducible environment for the cell controller, from creation to recorded versions.',
            language: 'bash',
            template:
              'python3 -m {{b1}} .venv              # private environment for this project\nsource .venv/bin/{{b2}}            # put it first in PATH\npip install pyserial numpy           # installs INSIDE the venv only\npip {{b3}} > requirements.txt       # record the exact versions',
            blanks: [
              { id: 'b1', accept: ['venv'], choices: ['venv', 'install', 'env'] },
              { id: 'b2', accept: ['activate'], choices: ['activate', 'start', 'init'] },
              { id: 'b3', accept: ['freeze'], choices: ['freeze', 'list', 'show'] },
            ],
            explanation:
              'The canonical four moves: `python3 -m venv .venv` creates the sandbox, `source .venv/bin/activate` puts it first in `PATH` so bare `python` and `pip` resolve inside it, installs then touch only the project, and `pip freeze` pins the exact working versions into `requirements.txt` — the file that turns "it worked on my robot" into a command the next robot can run. `deactivate` exits; deleting `.venv` and rebuilding is always safe.',
            hint: 'One module creates the environment, one script activates it, one pip subcommand records versions.',
          },
        },
      ],
    },
    {
      id: 'lx-l5-ssh',
      title: 'SSH & Remote Machines',
      minutes: 6,
      xp: 40,
      narrative:
        'The robot cells have no screens, no keyboards, and no patience for reboots — and that is normal. The last skill this wing needs: reaching a headless machine as if you were standing in front of it.',
      steps: [
        {
          kind: 'teach',
          heading: 'SSH: a shell on a distant machine',
          body:
            '**SSH** (Secure Shell) opens an encrypted terminal on a remote machine: `ssh lab@robot-7` logs you into the robot\'s onboard computer from your desk, with commands, output, and credentials all encrypted in transit. `lab` is the username on the remote box and `robot-7` its hostname or IP — the local username is irrelevant.\n\nHeadless machines are the default in robotics: the onboard computer has no monitor, and you develop, launch, and inspect it entirely over SSH. The workflow that grew around this is why labs live in terminals — SSH reaches any machine on the network, `tmux` keeps sessions alive when Wi-Fi drops, and `git` moves code. Every step is scriptable, works over a slow bench link, and works the same on thirty robots as on one.',
          keyPoints: [
            'ssh user@host opens an encrypted shell on the remote machine',
            'Headless robots are developed entirely over SSH — no monitor required',
            'Terminal tools (ssh, tmux, git) scale from one robot to the whole fleet',
          ],
        },
        {
          kind: 'teach',
          heading: 'Keys beat passwords, and files travel the same channel',
          body:
            'Typing a password on every login does not scale to a fleet, and passwords tolerate brute force. **Key authentication** replaces them with a pair from `ssh-keygen`: the **private key** (`~/.ssh/id_ed25519`) never leaves your machine — protect it with a passphrase — and the **public key** is installed on the remote\'s `~/.ssh/authorized_keys`, one command with `ssh-copy-id lab@robot-7`. Logins then happen by cryptographic challenge: nothing typed, nothing to brute-force, scripts log in unattended.\n\nFiles move over the same channel: `scp run1.log lab@robot-7:~/runs/` pushes to the robot, `scp lab@robot-7:~/runs/run42.csv .` pulls back — the same `user@host:path` addressing as ssh, with `rsync` as the resumable cousin for bulk transfers.',
          keyPoints: [
            'ssh-keygen makes a pair: private key stays local, public key goes to the remote',
            'ssh-copy-id installs your public key; logins then need no password',
            'scp copies files with the same user@host:path addressing as ssh',
          ],
        },
        {
          kind: 'byte',
          text: 'Found in the archive: the only account on cell robot 4 was protected by a password written on a sticky note inside the chassis. Byte has opinions. Keys were rolled out fleet-wide that week.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'lx-q-key-setup',
            prompt: 'Set up key-based access to the headless robot, from key generation to jobs that survive a dropped connection.',
            items: [
              { id: '1', text: 'Generate a key pair on your workstation: ssh-keygen -t ed25519', note: 'The private half stays in ~/.ssh; the public half is what gets shared.' },
              { id: '2', text: 'Install the public key on the robot: ssh-copy-id lab@robot-7', note: 'Appends it to ~/.ssh/authorized_keys on the remote.' },
              { id: '3', text: 'Log in without a password: ssh lab@robot-7', note: 'The robot challenges your key; cryptography answers instead of you.' },
              { id: '4', text: 'Pull results back: scp lab@robot-7:~/runs/run42.csv .', note: 'Same user@host:path addressing, same encrypted channel.' },
              { id: '5', text: 'Run long jobs inside tmux so a dropped connection does not kill them', note: 'Sessions live on the robot; ssh merely attaches to them.' },
            ],
            explanation:
              'The sequence builds one dependency at a time: a key pair must exist before it can be installed, installation must precede passwordless login, and the scp/tmux workflow rides on working access. tmux earns the last word on any headless box — a dropped SSH connection kills your foreground process, but a tmux session keeps running server-side and reattaches on reconnect. Long-running jobs that died with the Wi-Fi are a rite of passage; tmux is how it ends.',
            hint: 'You cannot install a key you have not generated yet.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'lx-q-private-key',
            prompt: 'A teammate needs SSH access to robot-7 and asks you to email them your private key "since yours already works". What is the right move?',
            options: [
              { id: 'a', text: 'Send it — the robot sits on the lab network, so the risk is low' },
              { id: 'b', text: 'Send the public key instead; it works the same for logins' },
              { id: 'c', text: 'Refuse: a private key never leaves your machine. The teammate generates their own pair, and their public key is added to the robot\'s authorized_keys' },
              { id: 'd', text: 'Send the private key, then change your own password afterward' },
            ],
            correctId: 'c',
            optionNotes: {
              a: 'Network location changes nothing about key hygiene — a copied private key is your identity on any network it reaches.',
              b: 'A public key authenticates only its matching private key. Handing it to your teammate grants nothing; they need their own pair.',
              d: 'There is no password that revokes a shared private key. Possession of the file is the credential — that is exactly the problem.',
            },
            explanation:
              'The private key is your identity on the network: whoever holds the file is you, from anywhere, until the key is revoked and replaced on every machine — there is no password to change. The protocol is built for sharing done right: each person generates their own pair and contributes only the public half to `authorized_keys`, which incidentally gives the lab per-person access control — remove one line and one person loses access, without touching anyone else.',
            hint: 'What exactly does possession of each half of the pair allow?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'lx-q-ssh-cmds',
            prompt: 'Two daily moves on the headless cell: follow its log live, then fetch yesterday\'s run back to your desk.',
            language: 'bash',
            template:
              '# watch the cell log live from your desk\n{{b1}} lab@robot-7 "tail -f /var/log/cell.log"\n\n# copy yesterday\'s run onto this machine\n{{b2}} lab@robot-7:~/runs/run42.csv .',
            blanks: [
              { id: 'b1', accept: ['ssh'], choices: ['ssh', 'scp', 'cd'] },
              { id: 'b2', accept: ['scp'], choices: ['scp', 'ssh', 'cp'] },
            ],
            explanation:
              '`ssh user@host "command"` runs one command remotely and streams its output — `tail -f` then follows the log as the robot writes it, no monitor required. For files, `scp` reuses the same `user@host:path` addressing with copy semantics: source first, destination last, `.` meaning "here". Plain `cp` has no idea what `robot-7` is — remote addressing is the ssh family\'s job.',
            hint: 'One runs commands remotely; one copies files over the same encrypted channel.',
          },
        },
      ],
    },
    {
      id: 'lx-l6-pipes',
      title: 'Pipes, Redirection & Text Tools',
      minutes: 5,
      xp: 40,
      narrative:
        'The cell logs are plain text, megabytes per shift, and the old way to answer "how many faults yesterday?" was scrolling. The shell was built to answer that in one line. Three operators and four small tools turn logs into reports.',
      steps: [
        {
          kind: 'teach',
          heading: 'Three streams, two redirects',
          body:
            'Every command opens three streams: **stdin** (input), **stdout** (normal output), **stderr** (errors). Redirection rewires them: `grep ERROR run1.log > faults.txt` writes stdout into a file, **overwriting** it; `>>` **appends** instead — the difference between a fresh report and a growing history. Errors still hit the terminal, because stderr ignores `>` unless you send it somewhere deliberately (`2> file`).\n\nThe **pipe** `|` chains programs: it wires one command\'s stdout to the next command\'s stdin, live. Each stage does one small job, and the composition does the work of a script you never had to write.',
          keyPoints: [
            'stdin, stdout, stderr: every command has all three',
            '> overwrites the target file; >> appends to it',
            '| connects stdout of one command to stdin of the next',
          ],
        },
        {
          kind: 'teach',
          heading: 'Four tools that interrogate a log',
          body:
            '`cat file` pours a file into stdout — the classic pipeline start. `grep PATTERN` keeps only matching lines: `grep FAULT` keeps fault lines. `sort` orders lines, and `wc -l` counts them — "word count, lines only". Chained, they answer real questions in one line: `grep FAULT cell.log | wc -l` is "how many faults?", and `grep FAULT cell.log | sort | uniq -c` (count repeated neighbors) is "which faults, how many of each".\n\nThe habit this builds: instead of opening a log and scrolling, compose a pipeline until the output *is* the answer. Every stage is inspectable — drop a `| wc -l` at any point to see what survives so far.',
          keyPoints: [
            'cat pours a file in; grep filters lines by pattern',
            'sort orders lines; wc -l counts them',
            'Compose until the output is the answer — inspect stage by stage',
          ],
        },
        {
          kind: 'byte',
          text: 'Recovered shell history, Bay 4: the same engineer answered "how many errors yesterday?" by scrolling, every day, for a month. The pipeline answers in one line and under a second. Byte keeps a tally of hours the pipe would have returned.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'lx-q-pipe-overwrite',
            prompt:
              'A nightly job runs `grep ERROR cell.log > report.txt` — and so did last night\'s run. What does tonight\'s redirect do?',
            options: [
              { id: 'a', text: 'Appends tonight\'s errors after last night\'s' },
              { id: 'b', text: 'Overwrites report.txt — last night\'s contents are replaced' },
              { id: 'c', text: 'Fails, because report.txt already exists' },
              { id: 'd', text: 'Writes nothing — > only works on new files' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'That is >>\'s job, not >\'s. With a single >, yesterday\'s report is gone before tonight\'s first line lands.',
              c: 'Existing files are silently truncated, not protected. If overwriting should be an error, that is a shell setting you choose deliberately — not the default.',
              d: '> creates the file if missing and truncates it if present. It works on both.',
            },
            explanation:
              'A single `>` truncates the target to zero length, then the command\'s stdout flows in — so every nightly run produces a fresh report containing only tonight\'s errors. That is either exactly right (a daily snapshot) or data loss (you wanted history), and the difference is one character: `>>` appends instead. Deciding which a job needs, every time, is the whole skill.',
            hint: 'One character separates "fresh report" from "growing history".',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'lx-q-pipe-predict',
            prompt: 'One small log, one pipeline. What does the last command print?',
            language: 'bash',
            code: '$ cat bay3.log\nERROR lidar timeout\nWARN battery 11.3V\nERROR motor stall\n$ grep ERROR bay3.log | wc -l',
            choices: ['2', '3', '1', 'ERROR lidar timeout'],
            correctIndex: 0,
            explanation:
              '`grep ERROR` keeps the two lines containing ERROR and drops the WARN line; `wc -l` counts the lines it receives: 2. Read the pipeline left to right as data transformation — four lines in, two survive the filter, the count comes out. The distractor "3" is what `wc -l` would say with no filter at all — which is also the quickest way to sanity-check a pipeline: run the stage before it and look.',
            hint: 'How many lines survive the grep filter, and what does wc -l report about them?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'lx-q-pipe-order',
            prompt: 'Assemble the pipeline that counts ERROR lines in cell.log and saves just the number into error_count.txt.',
            items: [
              { id: '1', text: 'cat cell.log', note: 'Stage 1: pour every line into the pipeline.' },
              { id: '2', text: '| grep ERROR', note: 'Stage 2: keep only the error lines.' },
              { id: '3', text: '| wc -l', note: 'Stage 3: count what survived.' },
              { id: '4', text: '> error_count.txt', note: 'Stage 4: redirect the final stdout into the file.' },
            ],
            explanation:
              'The full line reads `cat cell.log | grep ERROR | wc -l > error_count.txt`. Data flows left to right: the whole log, then only ERROR lines, then their count — and the redirect takes the *final* stage\'s stdout into the file. Move the redirect one stage earlier and you would write the error lines themselves, not the number; order is the meaning.',
            hint: 'Pipes pass data along; the redirect goes last, on the finished result.',
          },
        },
      ],
    },
  ],
  flashcards: [
    {
      id: 'fc-lx-1',
      categoryId: 'linux',
      concept: 'Absolute vs relative path',
      explanation:
        'Absolute: the full address from the root (/opt/roboquest/logs/run1.log) — unambiguous from anywhere. Relative: an address from the current working directory (logs/run1.log, ../config).',
      example: 'From /home/lab: cat fleet/rq-7/log.txt. From anywhere: cat /home/lab/fleet/rq-7/log.txt.',
      misconception: '.. is a real path component (the parent directory), not decoration — it removes the previous component when the path resolves.',
      application: 'Scripts run by cron or systemd must use absolute paths, because their working directory is not yours.',
      difficulty: 1,
    },
    {
      id: 'fc-lx-2',
      categoryId: 'linux',
      concept: 'chmod 755',
      explanation:
        'Sets permissions rwxr-xr-x: owner read+write+execute, group and others read+execute. Digits pack r=4, w=2, x=1 per triple, in order owner, group, other.',
      example: 'chmod 755 deploy.sh — runnable by everyone, writable only by the owner.',
      misconception: '644 "works" for a script until someone runs it — with no execute bit, Permission denied fires regardless of a correct shebang.',
      application: 'The standard mode for scripts and directories; 644 for data and config files that only need reading.',
      difficulty: 1,
    },
    {
      id: 'fc-lx-3',
      categoryId: 'linux',
      concept: 'Pipe',
      explanation:
        'The | operator connects one command\'s standard output to the next command\'s standard input, composing small tools into pipelines.',
      example: 'ps aux | grep sim | wc -l — list processes, filter for the simulator, count the lines.',
      misconception: 'Pipes carry stdout, not stderr and not files — grep ERROR log.txt reads a file, while cat log.txt | grep ERROR pours data through the pipe.',
      application: 'Daily bread on robot boxes: cat run1.log | grep ERROR | tail -20 is how incidents get reconstructed.',
      difficulty: 2,
    },
    {
      id: 'fc-lx-4',
      categoryId: 'linux',
      concept: 'ps and kill',
      explanation:
        'ps aux lists every process with its PID; kill <pid> sends SIGTERM (a polite, catchable shutdown); kill -9 <pid> sends SIGKILL (immediate removal, no cleanup).',
      example: 'ps aux | grep sim, then kill 4821, then ps again to confirm it exited.',
      misconception: 'kill is a request, not guaranteed death — a wedged process can ignore SIGTERM, and only that failure justifies reaching for -9.',
      application: 'Wedged control loops and runaway simulators on lab workstations; always identify the PID before killing it.',
      difficulty: 2,
    },
    {
      id: 'fc-lx-5',
      categoryId: 'linux',
      concept: 'Environment variable',
      explanation:
        'A named value (ROBOT_ID=rq-7) that each process inherits from its parent. export marks a shell variable for inheritance; without export, the variable stays local to that shell.',
      example: 'export ROS_DOMAIN_ID=42, then ros2 launch — the launch process and all its children see 42.',
      misconception: 'A variable set without export is not "not set" — it exists in the current shell and silently never reaches child processes, which is exactly why cron jobs fail.',
      application: 'Robot stacks are configured through env vars (ROS_DOMAIN_ID, PATH); the classic bug is "works in my shell, fails under cron or systemd".',
      difficulty: 3,
    },
    {
      id: 'fc-lx-6',
      categoryId: 'linux',
      concept: '~ (home directory)',
      explanation:
        '~ is the shell\'s shorthand for the current user\'s home directory (/home/lab for user lab). cd with no arguments also returns home.',
      example: 'For user lab, cat ~/.bashrc and cat /home/lab/.bashrc are identical.',
      misconception: '~ is expanded by the shell, not inside most config files or Python strings — there you need the full path or os.path.expanduser("~").',
      application: 'Scripts that hardcode /home/somebody break on the next machine; ~ and $HOME keep them portable.',
      difficulty: 1,
    },
    {
      id: 'fc-lx-7',
      categoryId: 'linux',
      concept: 'Virtual environment (venv)',
      explanation:
        'A private, disposable slice of Python for one project — its own interpreter link and site-packages. python3 -m venv .venv creates it; source .venv/bin/activate puts it first in PATH, so python and pip act inside it only, never touching the system interpreter.',
      example: 'The cell controller keeps numpy 1.x in its .venv while the analysis notebook uses 2.x on the same machine; pip freeze > requirements.txt records each for reproduction.',
      misconception: 'Activating a venv changes nothing on disk and nothing system-wide — it only changes which python and pip resolve. Forgetting to activate is exactly how packages land in the system Python.',
      application: 'Per-project dependency conflicts, reproducible installs from requirements.txt, and safe experiments that cannot break the interpreter the robot needs to boot.',
      difficulty: 2,
    },
    {
      id: 'fc-lx-8',
      categoryId: 'linux',
      concept: 'SSH key pair',
      explanation:
        'Key authentication replaces passwords: ssh-keygen generates a private key (never leaves your machine, ideally passphrase-protected) and a public key installed on the remote\'s ~/.ssh/authorized_keys (ssh-copy-id does it in one step). Login happens by cryptographic challenge — nothing typed, nothing to brute-force, scripts log in unattended.',
      example: 'ssh-keygen -t ed25519, then ssh-copy-id lab@robot-7, then ssh lab@robot-7 opens a shell with no password prompt.',
      misconception: 'The halves are not interchangeable: a public key authenticates but grants nothing by itself, while a copied private key is your whole identity on any network until it is revoked everywhere.',
      application: 'Headless robots and lab servers: unattended scriptable logins, per-person access control (one line per person in authorized_keys), instant revocation.',
      difficulty: 2,
    },
    {
      id: 'fc-lx-9',
      categoryId: 'linux',
      concept: 'Pipe',
      explanation:
        'The | operator wires one command\'s stdout into the next command\'s stdin, composing small tools into one data path: cat pours, grep filters, sort orders, wc -l counts. Redirection (> overwrites, >> appends) sends the final stdout into a file instead of the terminal.',
      example: 'cat cell.log | grep ERROR | wc -l > error_count.txt — count the errors and save just the number.',
      misconception: 'The pipe carries stdout only — a command\'s error messages slip past every stage and stay on the terminal (that is stderr), and > replaces the file\'s contents while >> appends.',
      application: 'Log interrogation on robot boxes: fault counts, filtered extracts, and per-code tallies, composed in one line instead of a scrolling session.',
      difficulty: 2,
    },
  ],
};
