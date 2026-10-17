import type { DiagnosticQuestion } from '../engine/types';

// Placement check: 3 questions per subject — Foundation, Application,
// Troubleshooting. The highest tier answered correctly sets the recommended
// starting level. Never recorded in quiz stats or the mistake notebook.

export const DIAGNOSTICS: DiagnosticQuestion[] = [
  // --- Python ---------------------------------------------------------------
  {
    id: 'diag-py-f',
    categoryId: 'python',
    tier: 'foundation',
    prompt: 'readings = [10, 20, 30]\nprint(readings[1])\n\nWhat does this print?',
    options: [
      { id: 'a', text: '10 — the first element' },
      { id: 'b', text: '20 — indexing starts at 0, so [1] is the second element' },
      { id: 'c', text: '30 — the last element' },
      { id: 'd', text: 'IndexError' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'The first element is readings[0] — Python indexes from 0.',
      c: 'The last element is readings[-1] or readings[2] here.',
      d: 'Index 1 exists in a 3-element list (valid indexes are 0, 1, 2).',
    },
    explanation:
      'Sequence indexing starts at 0: [0] is the first item, [1] the second. Negative indexes count from the end, and index 3 would raise IndexError on this list.',
  },
  {
    id: 'diag-py-a',
    categoryId: 'python',
    tier: 'application',
    prompt:
      'average = sum(readings) / len(readings)\n\nThis crashes with ZeroDivisionError when readings is empty. Which change handles that case correctly?',
    options: [
      { id: 'a', text: 'Wrap the line in try/except and silently continue' },
      { id: 'b', text: 'Guard the division: if readings is empty, use a defined default; otherwise divide' },
      { id: 'c', text: 'Convert readings to a set first — sets cannot be empty' },
      { id: 'd', text: 'Use len(readings) + 1 in the denominator so it never divides by zero' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'Catching the error hides the real question: what SHOULD the average of nothing be? Silent continuation produces mysterious downstream numbers.',
      c: 'Conversion does not remove the empty case — an empty set still has len 0. And it would silently drop duplicate readings.',
      d: 'That changes the math for every non-empty case: the average of [10, 20, 30] would become 7.5. Correct answers fix the empty case without corrupting valid data.',
    },
    explanation:
      'Empty input is a normal case, not an exceptional one — so the clean fix is an explicit guard: `if not readings: average = 0.0 else: …` (or a conditional expression). You decide what "average of nothing" means instead of crashing or hiding the question.',
  },
  {
    id: 'diag-py-t',
    categoryId: 'python',
    tier: 'troubleshooting',
    prompt:
      'def add_reading(item, readings=[]):\n    readings.append(item)\n    return readings\n\nAfter calling add_reading(1) and add_reading(2), the second call returns [1, 2] — the calls share state. Why?',
    options: [
      { id: 'a', text: 'Python interns small integers, so both calls mutate the same 1' },
      { id: 'b', text: 'The default list is created once at function definition — every call without the argument appends to that same list' },
      { id: 'c', text: 'append returns the list, so return values leak between calls' },
      { id: 'd', text: 'readings is a global variable because it appears in the signature' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'Integer interning is real but irrelevant — the sharing happens in the list argument, not the number.',
      c: 'The leakage happens even without using the return value; the mechanism is the shared default object, not the return.',
      d: 'Parameters are local to each call — except that a mutable default object is created once and reused, which is exactly the trap.',
    },
    explanation:
      'Mutable default arguments are evaluated once, at def time. Every call that omits `readings` uses that single list. The idiomatic fix: default to None and create the list inside — `def add_reading(item, readings=None): readings = [] if readings is None else readings`.',
  },

  // --- Git --------------------------------------------------------------------
  {
    id: 'diag-git-f',
    categoryId: 'git',
    tier: 'foundation',
    prompt: 'What does `git add gain.py` do?',
    options: [
      { id: 'a', text: 'Commits gain.py to the repository history' },
      { id: 'b', text: 'Stages the current changes of gain.py — they will be included in the next commit' },
      { id: 'c', text: 'Uploads gain.py to the remote' },
      { id: 'd', text: 'Marks gain.py to be ignored' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'Committing is `git commit` — add only selects what the commit will contain.',
      c: 'Uploading is `git push`, and it moves commits, not files.',
      d: 'That is .gitignore territory.',
    },
    explanation:
      'The staging area is the waiting room between your working copy and history: add queues changes, commit records exactly what was queued. This split lets one messy working copy produce several clean commits.',
  },
  {
    id: 'diag-git-a',
    categoryId: 'git',
    tier: 'application',
    prompt:
      'You started a feature branch on Monday. It is now Thursday and main has moved forward with teammate work. You want your branch to include those changes before opening a PR. What do you do?',
    options: [
      { id: 'a', text: 'Delete the branch and restart the work on the new main' },
      { id: 'b', text: 'From your feature branch, integrate the updated main into it (git merge main or git rebase main), resolve any conflicts, then push' },
      { id: 'c', text: 'Merge main directly with git push origin main' },
      { id: 'd', text: 'Nothing — merging the PR handles everything automatically' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'Git exists precisely so finished work never gets thrown away — your branch merges cleanly or shows you the conflicts to resolve.',
      c: 'Push does not merge anything; and pushing your local main without integrating is how shared history gets tangled.',
      d: 'A PR from a stale branch still merges — but against old code, with conflicts dumped on the reviewer instead of you.',
    },
    explanation:
      'Integrating main into your feature branch regularly keeps conflicts small and yours to resolve. Merge preserves both histories with a merge commit; rebase replays your commits on top for a linear story. Teams pick one convention — either is correct engineering.',
  },
  {
    id: 'diag-git-t',
    categoryId: 'git',
    tier: 'troubleshooting',
    prompt:
      'After pulling, git claims your local main and origin/main have "diverged" — and commits you saw yesterday on origin/main are gone. A teammate admits they "cleaned up" main yesterday. What happened and what is the safe response?',
    options: [
      { id: 'a', text: 'The teammate force-pushed rewritten history. Coordinate with them, then align: rebase your work onto the new origin/main (or re-clone), never push your stale local main over it' },
      { id: 'b', text: 'Git corrupted the repository — delete .git and re-clone' },
      { id: 'c', text: 'The missing commits were garbage-collected; nothing can be done' },
      { id: 'd', text: 'Push your local main with --force to restore the missing commits' },
    ],
    correctId: 'a',
    optionNotes: {
      b: 'Nothing is corrupt — divergent history after a force-push is exactly what rewriting shared branches looks like.',
      c: 'Unreferenced commits linger locally for weeks; the teammate still has them. Recovery is a conversation, not forensics.',
      d: 'Force-pushing your stale view over the rewritten history destroys the teammate\'s cleanup and anyone\'s work built on it — the original mistake, again, in the other direction.',
    },
    explanation:
      'Divergence plus disappearing commits is the signature of a force-push on a shared branch. The social fix matters as much as the git fix: agree on the new history, rebase your work onto it, and move the cleanup conversation to PRs so it never happens on main again.',
  },

  // --- SQL ----------------------------------------------------------------
  {
    id: 'diag-sql-f',
    categoryId: 'sql',
    tier: 'foundation',
    prompt: 'Which clause filters individual rows before any grouping happens?',
    options: [
      { id: 'a', text: 'HAVING' },
      { id: 'b', text: 'WHERE' },
      { id: 'c', text: 'GROUP BY' },
      { id: 'd', text: 'ORDER BY' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'HAVING filters groups after GROUP BY — aggregates are only meaningful there.',
      c: 'GROUP BY buckets rows; it does not filter them.',
      d: 'ORDER BY sorts the final result; filtering is not its job.',
    },
    explanation:
      'Execution order: FROM → WHERE (row filter) → GROUP BY → HAVING (group filter) → SELECT → ORDER BY. WHERE cannot use aggregates because rows are not grouped yet — that is the entire reason HAVING exists.',
  },
  {
    id: 'diag-sql-a',
    categoryId: 'sql',
    tier: 'application',
    prompt:
      'Tables: bays(id, name) and robots(id, bay_id, …). You need EVERY bay listed — even bays with zero robots — with a robot count. Which query shape is correct?',
    options: [
      { id: 'a', text: 'INNER JOIN bays and robots, GROUP BY bay, COUNT(*)' },
      { id: 'b', text: 'FROM bays LEFT JOIN robots, GROUP BY bay, COUNT(robots.id)' },
      { id: 'c', text: 'FROM robots RIGHT JOIN bays, GROUP BY bay, COUNT(*)' },
      { id: 'd', text: 'Two separate queries: one for bays, one for counts, merged in the application' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'INNER JOIN drops bays with no robots — exactly the rows you were asked to keep.',
      c: 'RIGHT JOIN keeps unmatched bays as NULL rows here, but COUNT(*) counts those NULL-pad rows as 1 — showing phantom robots. Counting robots.id (which is NULL for empty bays) is the honest count.',
      d: 'Merging in the application re-implements JOIN in fragile code and throws away the database\'s job.',
    },
    explanation:
      'LEFT JOIN preserves every left-side row (bays) and fills missing matches with NULL. Counting a robots-side column (COUNT(robots.id)) skips those NULLs, so empty bays correctly report 0. The general rule: preserve-side JOIN + count the nullable column.',
  },
  {
    id: 'diag-sql-t',
    categoryId: 'sql',
    tier: 'troubleshooting',
    prompt:
      'A reliability report says the fleet\'s average uptime is 99.9%. Eleven robots are due to report; only the 8 healthy ones have uptime values — the other 3 rows are NULL. What is really going on?',
    options: [
      { id: 'a', text: 'The report is correct — NULL rows count as 0% uptime' },
      { id: 'b', text: 'AVG skips NULL rows, so the average describes only the 8 reporting robots; the 3 unknowns silently vanished from the metric' },
      { id: 'c', text: 'The database corrupted the NULL rows during aggregation' },
      { id: 'd', text: 'AVG errors on NULL — someone must have filtered them already' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'NULL is not 0 — if absent robots should count as 0% uptime, the query must say so with AVG(COALESCE(uptime, 0)).',
      c: 'NULLs are handled by design, not corruption — the design choice is simply easy to misread.',
      d: 'No error occurs, which is the danger: the query succeeds while quietly describing a subset of the fleet.',
    },
    explanation:
      'Aggregates skip NULLs by design. 99.9% over 8 healthy robots tells you nothing about the 3 you cannot see. Fix the metric consciously: decide whether non-reporters are 0 (COALESCE to 0), excluded-but-counted (report COUNT alongside AVG), or a data-quality alarm (flag rows WHERE uptime IS NULL).',
  },

  // --- APIs -------------------------------------------------------------
  {
    id: 'diag-api-f',
    categoryId: 'api',
    tier: 'foundation',
    prompt: 'A POST to /api/readings successfully creates a new sensor reading. Which status code should the server return?',
    options: [
      { id: 'a', text: '200 OK' },
      { id: 'b', text: '201 Created' },
      { id: 'c', text: '204 No Content' },
      { id: 'd', text: '302 Found' },
    ],
    correctId: 'b',
    optionNotes: {
      a: '200 means the request succeeded generically — usually with a body describing the result of a GET or an update. Creation has its own, more precise code.',
      c: '204 means "success, nothing to send back" — poor fit when the client wants the created object echoed.',
      d: '302 is a redirect — for web pages, not API creation results.',
    },
    explanation:
      'Status codes are a vocabulary: 200 generic success, 201 created (usually with the new resource in the body and a Location header), 204 success with no body. Clients branch on these — precision here is free correctness.',
  },
  {
    id: 'diag-api-a',
    categoryId: 'api',
    tier: 'application',
    prompt:
      'A field robot on flaky WiFi POSTs a sensor reading; the request times out on its side, so it retries. The lab dashboard now shows the same reading twice. What is the standard fix?',
    options: [
      { id: 'a', text: 'Make the client wait longer before retrying' },
      { id: 'b', text: 'Send a client-generated idempotency key with each logical reading; the server deduplicates on it' },
      { id: 'c', text: 'Use DELETE before each POST to clear duplicates' },
      { id: 'd', text: 'Have the server reject all repeated POSTs to that endpoint' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'Longer timeouts shrink the window but never remove it — retries on flaky links are inevitable by design.',
      c: 'That adds a race (two in-flight posts) and deletes legitimate readings in between.',
      d: 'Rejecting repeats breaks legitimate readings that genuinely share values (two identical temperatures a minute apart are not duplicates).',
    },
    explanation:
      'Timeout-after-success is indistinguishable from timeout-before-processing on the client side, so retries are correct behavior — the server must make them safe. An idempotency key (a UUID per logical reading, deduplicated server-side) is the standard pattern; it also makes POSTs effectively idempotent.',
  },
  {
    id: 'diag-api-t',
    categoryId: 'api',
    tier: 'troubleshooting',
    prompt:
      'Your API works perfectly in curl, but the browser console shows the request failing with a CORS error. The request never reaches your "success" handler. What is going on?',
    options: [
      { id: 'a', text: 'The server is down — curl only works because it retries automatically' },
      { id: 'b', text: 'CORS is a browser security policy: the API server must send Access-Control-Allow-Origin headers permitting your frontend\'s origin' },
      { id: 'c', text: 'The browser is broken — clear the cache and retry' },
      { id: 'd', text: 'CORS blocks the request on the network level; switch the server port' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'curl succeeded, so the server is up and responding — the gap is specifically browser origin enforcement.',
      c: 'This is deterministic policy enforcement, not corruption — it will fail identically in every browser.',
      d: 'Nothing is blocked at the network level (curl proves the path works); the browser merely refuses to hand the response to a different-origin page without permission headers.',
    },
    explanation:
      'CORS is the browser enforcing origin boundaries: pages may only read responses from other origins if that server explicitly allows it via response headers. curl has no origin, so it is unaffected. The fix lives server-side (send the right Access-Control-* headers) or architecturally (serve frontend and API from the same origin / a proxy).',
  },

  // --- Linux ------------------------------------------------------------
  {
    id: 'diag-lx-f',
    categoryId: 'linux',
    tier: 'foundation',
    prompt: 'After logging into a lab server, what does the command `cd ~` do?',
    options: [
      { id: 'a', text: 'Moves to the root of the filesystem (/)' },
      { id: 'b', text: 'Moves to your home directory, e.g. /home/student' },
      { id: 'c', text: 'Moves to the previous directory you were in' },
      { id: 'd', text: 'Moves up one directory' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'The filesystem root is `cd /`.',
      c: 'That is `cd -`.',
      d: 'One directory up is `cd ..`.',
    },
    explanation:
      '~ is a shell shortcut for your home directory. Absolute paths start at /, relative paths start where you are, and ~ always means home regardless of your current location.',
  },
  {
    id: 'diag-lx-a',
    categoryId: 'linux',
    tier: 'application',
    prompt: '`./calibrate.sh` answers "Permission denied", but the file clearly exists. What is the standard fix?',
    options: [
      { id: 'a', text: 'chmod +x calibrate.sh — grant execute permission, then run it' },
      { id: 'b', text: 'Rename it to calibrate.exe so Linux recognizes the type' },
      { id: 'c', text: 'Run sudo rm on the file and re-download it' },
      { id: 'd', text: 'Move it to /usr/bin first — scripts only run from system folders' },
    ],
    correctId: 'a',
    optionNotes: {
      b: 'Linux does not care about extensions for executability — the execute bit does.',
      c: 'Re-downloading reproduces the same permissions. And deleting files with sudo to fix a permissions issue is exactly the reflex to unlearn.',
      d: 'Scripts run from any directory; system folders are for programs meant to be on the PATH.',
    },
    explanation:
      'Executability is a permission bit, not a property of the file content. `chmod +x` sets it for user/group/other. Alternatives that bypass rather than fix: `bash calibrate.sh` runs it via the interpreter without the bit. Check with `ls -l`: rwx flags per owner group.',
  },
  {
    id: 'diag-lx-t',
    categoryId: 'linux',
    tier: 'troubleshooting',
    prompt:
      'You closed your robot server app, but restart fails: "address already in use" on port 8080. Nothing related appears in `ps` filtered by the app name. What is the most direct next step?',
    options: [
      { id: 'a', text: 'Reboot the machine — ports always need a reboot' },
      { id: 'b', text: 'Find which process holds the port (ss -tlnp | grep 8080 or lsof -i :8080), then kill that PID' },
      { id: 'c', text: 'Change your app to port 8081 permanently' },
      { id: 'd', text: 'Wait 24 hours for the TCP timeout to release the port' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'Reboots do release ports — by killing the very process you can find and stop directly. It is the sledgehammer that hides the diagnosis.',
      c: 'Avoiding the conflict works but hides an orphaned process that will bite the next service on 8080.',
      d: 'Sockets in normal states close in seconds; waiting a day is cargo cult. (A lingering TIME_WAIT usually clears in a minute and does not block bind with proper socket options.)',
    },
    explanation:
      '"Address already in use" means some process still owns the socket — often an orphaned child or a worker with an unrecognizable name. Tools that map port → PID (ss, lsof, netstat) identify it exactly; then a normal `kill PID` (SIGTERM first) finishes the job. Diagnose by owner, not by avoidance.',
  },

  // --- Debugging & Testing -------------------------------------------------
  {
    id: 'diag-dbg-f',
    categoryId: 'debug',
    tier: 'foundation',
    prompt: 'A long Python traceback just scrolled past. Where do you start reading?',
    options: [
      { id: 'a', text: 'At the top — the first line is the actual error' },
      { id: 'b', text: 'At the bottom — the last line names the error and message; the lines above trace the call path' },
      { id: 'c', text: 'In the middle — the deepest frame matters most' },
      { id: 'd', text: 'Nowhere — tracebacks are compiler output' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'The top is where YOUR code entered the failure — context, not verdict.',
      c: 'Library frames (the middle) are usually innocent; your call of them is the suspect.',
      d: 'Tracebacks are runtime evidence — the single richest debugging artifact Python gives you.',
    },
    explanation:
      'Read bottom-up: the last line states what went wrong (exception type + message); moving upward shows how execution got there. Fix-first skill: read the error, find your frame in the chain, only then hypothesize.',
  },
  {
    id: 'diag-dbg-a',
    categoryId: 'debug',
    tier: 'application',
    prompt:
      'A function returns plausible-looking but wrong values — no exception, no crash. What is the strongest first move?',
    options: [
      { id: 'a', text: 'Rewrite the function from scratch with a different approach' },
      { id: 'b', text: 'Write a small test that calls it with known input and asserts the expected output — a failing reproduction' },
      { id: 'c', text: 'Add try/except around the function so it stops misbehaving' },
      { id: 'd', text: 'Trust it — values close enough to correct are usually fine' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'Rewrites destroy the evidence and often reintroduce the bug in new clothing. Reproduce first, change second.',
      c: 'try/except converts a wrong-value bug into a hidden-wrong-value bug — strictly worse.',
      d: 'Silent wrongness is the most expensive failure class in robotics: it corrupts everything downstream while looking healthy.',
    },
    explanation:
      'A failing test is a reproduction: it pins the bug, runs in seconds, and later proves the fix. This is the reproduce → isolate → fix → verify loop, and the test you wrote stays behind as a regression guard.',
  },
  {
    id: 'diag-dbg-t',
    categoryId: 'debug',
    tier: 'troubleshooting',
    prompt:
      'A test passes locally every time but fails roughly one run in ten in CI. The test sorts sensor events and asserts the order. Most likely cause?',
    options: [
      { id: 'a', text: 'The CI machine is too slow, causing timeouts randomly' },
      { id: 'b', text: 'The test depends on something unspecified — input ordering, timing, or shared state — and only passes when that hidden dependency happens to line up' },
      { id: 'c', text: 'CI runs a different Python version; downgrade locally to match' },
      { id: 'd', text: 'The test is cursed; delete it — the code is obviously fine' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'Slowness produces timeout errors, not wrong sort orders. The 1-in-10 pattern points at nondeterminism, not load.',
      c: 'A version mismatch fails consistently, not intermittently — the flakiness itself is the evidence.',
      d: 'A flaky test is a smoke alarm with a loose wire: sometimes noise, but it may also be the first glimpse of a real race condition in the product code.',
    },
    explanation:
      'Flakiness is a determinism defect. Here: if two events share a timestamp, sort stability or tie-breaking decides the order — the test asserts more than the code guarantees. Fix by making the test deterministic (tie-break explicitly, fix the seed, freeze the clock) and decide whether the production code needs the same hardening.',
  },

  // --- Architecture -----------------------------------------------------------
  {
    id: 'diag-arch-f',
    categoryId: 'arch',
    tier: 'foundation',
    prompt: 'A module has HIGH cohesion. What does that tell you?',
    options: [
      { id: 'a', text: 'Its code all serves one purpose — one reason to change' },
      { id: 'b', text: 'It is tightly wired to many other modules' },
      { id: 'c', text: 'It contains a lot of code' },
      { id: 'd', text: 'It never communicates with other modules' },
    ],
    correctId: 'a',
    optionNotes: {
      b: 'That is high coupling — the opposite tax. Cohesion describes the inside of a module.',
      c: 'Size is not cohesion; a 2,000-line planning module can be cohesive or a junk drawer.',
      d: 'Zero communication is isolation, not cohesion. Modules should interact — through small explicit interfaces.',
    },
    explanation:
      'Cohesion is about the inside: everything in the module serves one responsibility. Its counterpart, coupling, is about the outside: how much a module depends on other modules\' internals. Good architecture: high cohesion, low coupling.',
  },
  {
    id: 'diag-arch-a',
    categoryId: 'arch',
    tier: 'application',
    prompt:
      'Three tools need robot state: a dashboard, a data logger, a planning node. Each currently opens its own connection to the robot-state database. What is the strongest objection?',
    options: [
      { id: 'a', text: 'Three connections might overload the database' },
      { id: 'b', text: 'Every consumer is coupled to the schema and credentials — any schema change or leak breaks all three, so state access should live behind one owning service/API' },
      { id: 'c', text: 'Databases cannot serve multiple clients at once' },
      { id: 'd', text: 'The tools should read from the robot directly instead' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'Connection count is trivially tunable with pooling — it is the smallest problem on the list.',
      c: 'Serving many clients is the entire point of a database server.',
      d: 'That couples the tools to the robot hardware and multiplies polling load — the opposite of the fix.',
    },
    explanation:
      'This is the data-ownership rule: exactly one component owns storage and exposes it through an interface. Consumers couple to the interface (API or topics), so the schema can evolve and credentials stay server-side. It is the same pattern that lets a simulator and a real robot expose identical state feeds.',
  },
  {
    id: 'diag-arch-t',
    categoryId: 'arch',
    tier: 'troubleshooting',
    prompt:
      'Adding a seemingly small feature — "also log the operator who approves each calibration" — requires editing six modules across three teams. What does this symptom indicate?',
    options: [
      { id: 'a', text: 'The teams are too large; reorganize the people first' },
      { id: 'b', text: 'Hidden coupling: the concept (approval) has no home of its own, so it is smeared across modules. Introduce an owning abstraction and narrow interfaces' },
      { id: 'c', text: 'The feature is genuinely large — six modules is normal for cross-cutting work' },
      { id: 'd', text: 'The code needs more comments so future edits stay in one file' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'Team size did not create the six-module edit; the dependency structure did. Reorganizing people leaves the coupling intact.',
      c: 'Some features are genuinely cross-cutting — but "add one field" touching six modules means six modules each re-implement part of the same concept.',
      d: 'Comments describe the tangle; they do not reduce it.',
    },
    explanation:
      'Change amplification is the smell that reveals missing abstractions: a concept with no single home gets hand-wired everywhere. The fix is to give the concept an owner (an approval interface/module) so the next feature touches one place. Design debt announces itself exactly this way.',
  },

  // --- NVIDIA Isaac Sim ----------------------------------------------------
  {
    id: 'diag-isx-f',
    categoryId: 'isaac',
    tier: 'foundation',
    prompt: 'In USD terms, what is a prim?',
    options: [
      { id: 'a', text: 'A rendered texture' },
      { id: 'b', text: 'A node in the stage\'s hierarchy — mesh, light, camera, transform, robot link — addressed by a path like /World/robot/base' },
      { id: 'c', text: 'A physics solver step' },
      { id: 'd', text: 'The saved file on disk' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'Textures are assets referenced by materials on prims.',
      c: 'Solver stepping is simulation runtime behavior, not scene structure.',
      d: 'The .usda/.usd file is the container; prims are the scene-graph nodes inside the opened stage.',
    },
    explanation:
      'Stage = the scene graph; prims = its nodes; each prim has a path, a type, attributes, and children. Hierarchy matters: a prim inherits its parent chain\'s transforms, and robots are trees of link prims with joint prims connecting them.',
  },
  {
    id: 'diag-isx-a',
    categoryId: 'isaac',
    tier: 'application',
    prompt:
      'You add a robot and a ground plane to a new stage, press play — and the robot immediately falls through the floor. What is the first thing to check?',
    options: [
      { id: 'a', text: 'The robot\'s render material — visuals do not affect physics, so look elsewhere only after physics checks out' },
      { id: 'b', text: 'Whether a PhysicsScene exists and the ground plane actually has collision — a visual-only floor cannot stop a rigid body' },
      { id: 'c', text: 'The camera position — falling is a view-parallax illusion' },
      { id: 'd', text: 'Reinstall Isaac Sim — falling robots indicate a broken installation' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'True that materials are innocent, but phrased as a check it wastes a step: go straight to the physics pair (scene + collider).',
      c: 'The robot genuinely intersects the floor geometry — this is physics state, not rendering.',
      d: 'Gravity pulling an uncollided body through geometry is textbook behavior for a missing collider, in every physics engine.',
    },
    explanation:
      'Two conditions make a floor a floor: a PhysicsScene on the stage and collision geometry on the ground prim. A mesh without collision renders beautifully and stops nothing. Checklist: PhysicsScene present → ground collider present → robot has rigid-body dynamics + colliders → then play.',
  },
  {
    id: 'diag-isx-t',
    categoryId: 'isaac',
    tier: 'troubleshooting',
    prompt:
      'A ROS 2 node subscribes to the bridge\'s /joint_states. Sometimes it receives messages, sometimes nothing — and when it works, timestamps look wrong relative to the wall clock. Which pair of causes explains BOTH symptoms?',
    options: [
      { id: 'a', text: 'Network congestion and a slow subscriber' },
      { id: 'b', text: 'QoS incompatibility (e.g. a reliable subscriber paired with a best-effort publisher means zero messages), and simulation time: the bridge stamps messages with sim time, which does not match wall time' },
      { id: 'c', text: 'A firewall on the workstation and a corrupted URDF' },
      { id: 'd', text: 'The subscriber must poll the bridge with services instead of topics' },
    ],
    correctId: 'b',
    optionNotes: {
      a: 'Both are real phenomena, but neither explains "sometimes nothing" cleanly (loss shows as gaps, not all-or-nothing) and neither touches timestamps.',
      c: 'Unrelated pair: firewalls affect connectivity uniformly, and a bad URDF fails at load time, not intermittently.',
      d: 'Streams like joint states are exactly what topics are for; services are request/response.',
    },
    explanation:
      'The two classic ROS 2 bridge gotchas: (1) QoS pairs must be compatible — a reliable subscriber receives from a best-effort publisher never, so "sometimes nothing" can actually mean "policy mismatch"; (2) the bridge stamps with simulation time by default, so comparing to wall clock makes correct messages look wrong. Check QoS pairing and the clock domain before touching the network.',
  },
];
