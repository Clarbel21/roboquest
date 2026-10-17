import type { Category } from '../engine/types';

// Debugging & Testing Wing — content module.
// Shape, depth, and tone follow the reference in src/data/arch.ts.

export const debugCategory: Category = {
  id: 'debug',
  name: 'Debugging & Testing',
  tagline: 'Read the evidence, not the vibes',
  icon: '🐛',
  description:
    'The facility\'s logs are full of tracebacks nobody read and bugs nobody pinned down. Rebuild the discipline that keeps software alive: read errors precisely, isolate systematically, and pin behavior down with tests that never forget.',
  accent: 'rose',
  lessons: [
    {
      id: 'dbg-l1-errors',
      title: 'Reading Errors & Tracebacks',
      minutes: 5,
      xp: 35,
      narrative:
        'Every crashed service in the facility left a traceback in its log, scrolled past by whoever restarted it. The evidence was always there. Lesson one of the restoration: read it.',
      steps: [
        {
          kind: 'teach',
          heading: 'Tracebacks read bottom-up',
          body:
            'A Python **traceback** is an autopsy report, and the vital signs are at the **bottom**. The last line names the exception type and message — the actual cause of death. Just above it sits the exact file, line, and source text where the exception was raised. Everything above that is the call chain: one frame per line, oldest call first, showing how execution traveled to the fatal spot.\n\nSo the reading protocol is: last line first (what broke), then the frame directly above it (where it broke), then walk upward only when the raise site is inside library code and the real mistake is in your call. Error messages are written to be read — `KeyError: \'imu\'` is already a complete sentence: some dict was asked for the key `imu` and did not have it.',
          keyPoints: [
            'Bottom line: exception type + message = what broke',
            'The frame just above: file and line where it was raised',
            'Upper frames: the call path — read them when the raise site is in a library',
          ],
        },
        {
          kind: 'byte',
          text: 'Log review found 214 occurrences of "KeyError: \'imu\'" dismissed as flakiness. It was a config rename from imu_0 to imu. Reading the message would have saved a week.',
        },
        {
          kind: 'teach',
          heading: 'Exception types are diagnoses',
          body:
            'The exception type is the doctor\'s first diagnosis — each one points at a different class of mistake. **NameError**: a variable that does not exist — usually a typo or code running before initialization. **KeyError**: a dict lacks the key you requested — the classic "the API response didn\'t contain the field" error. **IndexError**: the same idea for sequences — position 4 in a 3-element list. **TypeError**: an operation received a type it cannot handle — adding `None` to a float, calling an integer. **ValueError**: the type was fine but the *value* was unacceptable — `int("fast")`.\n\nThe distinction is diagnostic gold: a TypeError says "trace where this None came from"; a ValueError says "trace where this string came from"; a KeyError says "decide what to do when the field is missing." Different causes, different fixes.',
          keyPoints: [
            'NameError: the name was never defined — typo or ordering',
            'KeyError/IndexError: the container lacks that key or index — check the data',
            'TypeError: wrong type for the operation; ValueError: right type, bad value',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'dbg-q-traceback',
            prompt:
              'A service log ends with: `KeyError: \'imu\'`. Where do you start reading, and what does it mean?',
            options: [
              { id: 'a', text: 'Start at the first line — it names the process that crashed' },
              { id: 'b', text: 'KeyError means the file named imu was not found on disk' },
              { id: 'c', text: 'Read bottom-up: the last line names the exception and the missing dict key, and the frame just above shows the line that performed the lookup' },
              { id: 'd', text: 'Count the frames — the middle one is usually the cause' },
            ],
            correctId: 'c',
            optionNotes: {
              a: 'The first line is just "Traceback (most recent call last)". The first *frame* shows where the journey started — not what failed.',
              b: 'File problems raise FileNotFoundError or OSError. KeyError is exclusively about mapping (dict) lookups.',
              d: 'Tracebacks have no statistical middle. The cause is the raise site: the frame directly above the final line.',
            },
            explanation:
              'A traceback is ordered oldest call first, newest (the raise site) last — so the bottom carries the verdict. `KeyError: \'imu\'` reads as a sentence: some dict was asked for the key \'imu\' and did not have it — a sensor field missing from a parsed message, or a renamed config key. Jump to the frame above the last line, see which expression did the lookup, then decide: is the data wrong, the key wrong, or should the code handle absence explicitly?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'dbg-q-none-sum',
            prompt: 'A batch of sensor readings contains one drop-out. What appears on screen?',
            language: 'python',
            code: 'readings = [22.4, 23.1, None, 21.9]\ntotal = 0.0\nfor r in readings:\n    total += r\nprint(round(total, 1))',
            choices: [
              'TypeError: unsupported operand type(s) for +=: \'float\' and \'NoneType\'',
              '67.4',
              'ValueError: could not convert string to float: \'None\'',
              'IndexError: list index out of range',
            ],
            correctIndex: 0,
            explanation:
              'The loop runs twice, then `total += r` receives `None` — and `float + None` is a **TypeError**, because the *type* of the operand cannot participate in addition at all. It is not a ValueError (nothing was parsed — the value was never converted from a string) and not an IndexError (nothing was subscripted). This is the signature of a sensor drop-out upstream: the fix is deciding policy for missing readings, not casting the loop.',
            hint: 'The failure happens on the third iteration. Which operand has the wrong type?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'dbg-q-exc-meaning',
            prompt: '`cfg["max_speed"]` returns the string `"fast"`, and the code calls `int(cfg["max_speed"])`. Which exception results, and what does it tell you?',
            options: [
              { id: 'a', text: 'ValueError — int() accepts strings, but this string\'s content is not a valid number; the type was fine, the value was not' },
              { id: 'b', text: 'TypeError — strings can never be converted' },
              { id: 'c', text: 'KeyError — the max_speed key is missing from the config' },
              { id: 'd', text: 'NameError — max_speed was never defined' },
            ],
            correctId: 'a',
            optionNotes: {
              b: 'int("42") works fine — strings are an acceptable input type. A TypeError would need an unacceptable *type*, like int(None).',
              c: 'If the key were missing, the cfg["max_speed"] subscript would raise KeyError before int() ever ran. Here the key exists — with a bad value.',
              d: 'NameError is about variable names in your code, not dictionary contents. cfg["max_speed"] already succeeded.',
            },
            explanation:
              'The exception taxonomy encodes cause classes: TypeError = wrong type for the operation; ValueError = right type, unusable value; KeyError/IndexError = the container lacks that key or index; NameError = the name itself is undefined. Here the diagnosis points at the data pipeline: something upstream wrote "fast" into a numeric field. The professional fix is not to catch and ignore — it is to validate at the boundary and fail with a message naming the offending config field.',
            hint: 'int("42") works. What exactly is unacceptable about int("fast")?',
          },
        },
      ],
    },
    {
      id: 'dbg-l2-strategy',
      title: 'The Debugging Loop',
      minutes: 6,
      xp: 40,
      narrative:
        'One service drops readings every few days, and every fix so far has been a guess. The chief engineer left one rule on the whiteboard: no fix without a repro. Build the loop she meant.',
      steps: [
        {
          kind: 'teach',
          heading: 'Reproduce, isolate, fix, verify',
          body:
            'Debugging is a loop, not an inspiration contest. **Reproduce**: make the failure happen on demand — a command, an input file, a seed. A bug you can trigger in five seconds is half-solved; a bug that appears on Fridays cannot even be attacked. **Isolate**: shrink the input until only the smallest piece that still fails remains — one function, one line of telemetry, one parameter. Isolation localizes the fault and usually reveals it.\n\n**Fix**: change one thing per hypothesis, and predict the outcome before you run it. If the fix is a surprise, your mental model was wrong — that is information: revert and re-hypothesize. **Verify**: run the original repro (it must pass) and the full test suite (nothing else may break). Then leave the repro behind as a test, so the bug can never quietly return.',
          keyPoints: [
            'Reproduce on demand before theorizing',
            'Shrink the failing case until the culprit is cornered',
            'One hypothesis per change; verify against the repro and the full suite',
          ],
        },
        {
          kind: 'teach',
          heading: 'print, debugger, logging — pick deliberately',
          body:
            'Three observability tools, three jobs. **Print statements**: fastest to deploy, fine for a thirty-second question — but they vanish when the terminal closes, they perturb timing, and they always end up committed by someone in a hurry. **The debugger** (`breakpoint()` drops you into Python\'s `pdb`): step line by line and inspect every variable without editing code — the right tool when you need to watch state evolve, and the honest tool for bugs that prints seem to scare away.\n\n**Logging** is the durable layer: timestamps, severity levels (`DEBUG`, `INFO`, `WARNING`, `ERROR`) that you can filter at runtime instead of editing code. Anything left running overnight logs; nothing left running prints. The heisenbug that disappears when you add prints is telling you the perturbation matters — switch to logging before concluding the machine is haunted.',
          keyPoints: [
            'print: quick and disposable; never a permanent record',
            'debugger / breakpoint(): inspect state live without editing code',
            'logging: timestamped, level-filtered record for anything long-running',
          ],
        },
        {
          kind: 'byte',
          text: 'The chief engineer\'s whiteboard, cycle 200: "It works but I don\'t know why" and "It fails but I don\'t know why" are the same hazard. Do not ship either.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'dbg-q-loop',
            prompt: 'A service drops readings every few days. Order the chief engineer\'s debugging loop.',
            items: [
              { id: '1', text: 'Reproduce: build a command or input that triggers the failure on demand', note: 'No repro, no debugging — only speculation.' },
              { id: '2', text: 'Isolate: shrink the input until the smallest failing case remains', note: 'One function, one line of telemetry, one parameter.' },
              { id: '3', text: 'Hypothesize: predict what single change should fix it, then make that one change', note: 'One variable at a time, prediction before result.' },
              { id: '4', text: 'Fix the root cause the evidence points to — not the loudest symptom', note: 'A surprise outcome means the model was wrong; revert and re-hypothesize.' },
              { id: '5', text: 'Verify: the repro passes and the full suite is green', note: 'Then keep the repro as a regression test.' },
            ],
            explanation:
              'The loop exists because human intuition about complex software is unreliable and evidence is not. Reproduction converts an anecdote into an experiment; isolation turns a system-sized mystery into a function-sized one; single-change hypotheses keep cause and effect distinguishable; verification prevents the classic "fixed the bug, broke the fleet" ending. Skipping steps does not save time — it defers the same debugging session to a day when you have less context.',
            hint: 'Before you may theorize, what must you be able to do on demand?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'dbg-q-heisenbug',
            prompt:
              'A controller intermittently deadlocks. Adding print statements makes it disappear; removing them brings it back. What is the best next move?',
            options: [
              { id: 'a', text: 'Add more print statements until it reappears, then bisect' },
              { id: 'b', text: 'Log "bug only occurs without prints" as the root cause and close the ticket' },
              { id: 'c', text: 'Switch to timestamped logging written to file, which perturbs far less than prints, and use the debugger to inspect state at the suspicious point' },
              { id: 'd', text: 'Reboot the controller nightly; the bug is clearly environmental' },
            ],
            correctId: 'c',
            optionNotes: {
              a: 'The prints are perturbing timing — that is why it vanished. More prints push the system further from the failing condition.',
              b: 'Timing sensitivity is a symptom, not a cause. The race condition underneath is still there, waiting for production.',
              d: 'Scheduled reboots are a stasis chamber, not a fix. The deadlock remains, now with a timer attached.',
            },
            explanation:
              'A bug that vanishes under observation is a **heisenbug**, and print-induced disappearance means the perturbation (flushing, buffering, changed timing) is part of the failure conditions — usually a race. Replace the perturbation with something lighter: logging gives you the record with far less impact on timing, and a debugger lets you freeze and inspect state at a trigger point. Change the observation method before drawing any conclusion about the bug itself.',
            hint: 'What did adding the prints actually change about the program\'s execution?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'bughunt',
            id: 'dbg-q-bare-except',
            prompt: 'The parser "never crashes" — but corrupted lines vanish silently and the monthly totals drift. Click the line that causes it.',
            language: 'python',
            code: 'def parse_telemetry(line):\n    try:\n        parts = line.strip().split(",")\n        ts, temp = int(parts[0]), float(parts[1])\n        return ts, temp\n    except:\n        print("bad line, skipping")\n        return None',
            buggyLine: 6,
            causeOptions: [
              { id: 'a', text: 'return None is not allowed inside an except block' },
              { id: 'b', text: 'A bare except catches every exception — including real bugs like IndexError and even KeyboardInterrupt — and hides them behind "bad line", so genuine failures never surface' },
              { id: 'c', text: 'print cannot be called inside a try block' },
              { id: 'd', text: 'split() must be given the maxsplit argument' },
            ],
            causeCorrectId: 'b',
            fixExplanation:
              'A bare `except:` is a catch-all with no memory: a schema change that breaks indexing (`IndexError`) or a developer pressing Ctrl-C (`KeyboardInterrupt`) gets the same silent "bad line, skipping" as one malformed CSV row. Catch the specific expected exception (`ValueError` for int/float parsing), log the offending input with the error, and let unexpected exceptions crash loudly so they get debugged.',
            fixedCode: 'def parse_telemetry(line):\n    try:\n        parts = line.strip().split(",")\n        ts, temp = int(parts[0]), float(parts[1])\n        return ts, temp\n    except ValueError as err:\n        logger.warning("bad line %r: %s", line, err)\n        return None',
            explanation:
              'Silent failure is worse than crashing, because a crash gets debugged and silent data loss gets discovered at month-end. The `except ValueError` form catches only the failure you predicted, and `logger.warning` keeps the evidence. This is the logging mindset from the teach step applied: errors are data — record them where someone will read them, and never let a blanket handler bury the ones you did not predict.',
            hint: 'The handler catches things nobody predicted. What is its scope?',
          },
        },
      ],
    },
    {
      id: 'dbg-l3-tests',
      title: 'Assertions & Unit Tests',
      minutes: 7,
      xp: 45,
      narrative:
        'The restoration holds — for now. The chief\'s final rule is carved above the lab door: a bug fixed once must never need fixing twice. Tests are how a facility remembers.',
      steps: [
        {
          kind: 'teach',
          heading: 'Assertions and the unit test',
          body:
            'An **assertion** is a checked claim: `assert status == "low"` continues silently when true and raises `AssertionError` when false — executable documentation of what your code must do. A **unit test** wraps assertions around one small unit of behavior — one function or class — running fast, in isolation, with no robot, network, or database.\n\n`pytest`-style tests are plain functions named `test_...`, and the discipline that keeps them sane is **AAA**: **Arrange** the object and its inputs, **Act** by calling the one behavior under test, **Assert** on the observable outcome. One reason per test — when `test_classify` fails you should know the culprit before opening the file. One field caution: comparing floats with `==` fails on representation noise — `0.1 + 0.2` is not exactly `0.3` in binary floating point. Compare with `pytest.approx` or `math.isclose`.',
          keyPoints: [
            'assert = a claim the interpreter checks; failing loudly is the point',
            'Unit test: one behavior, isolated, fast, named test_*',
            'AAA: Arrange, Act, Assert; compare floats approximately, never with ==',
          ],
        },
        {
          kind: 'teach',
          heading: 'Regression tests are institutional memory',
          body:
            'A **regression test** pins a bug you already fixed: it uses the exact input that once caused the failure — the boundary value, the empty list, the malformed line — and asserts the correct behavior. It runs in the suite forever after, so the bug\'s next attempt at reincarnation fails a test instead of a robot cell.\n\nThe workflow when a bug arrives is therefore: write the failing test first (which *proves* you can reproduce it), fix until the test passes, keep the test. Before any fix ships, the rest of the suite tells you what else you broke. That is the difference between a facility that gets sturdier with every incident and one that relearns the same lesson every quarter — the difference between the lab you inherited and the one you are building.',
          keyPoints: [
            'Regression test = the exact past-failure input, kept in the suite',
            'Write the failing test before the fix — it proves the repro',
            'The suite is the safety net that lets you change code boldly',
          ],
        },
        {
          kind: 'byte',
          text: 'The archive test suite contains a test named test_conveyer_conga_line. It runs on every build. Some lessons are kept the fun way, some the painful way — both count.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'dbg-q-float-assert',
            prompt: 'A teammate writes a test for the noise-budget helper. What appears on screen?',
            language: 'python',
            code: 'def noise_budget(a: float, b: float) -> float:\n    return a + b\n\ngot = noise_budget(0.1, 0.2)\nassert got == 0.3, f"got {got}"\nprint("noise budget ok")',
            choices: [
              'noise budget ok',
              'AssertionError: got 0.3',
              'AssertionError: got 0.30000000000000004',
              'TypeError: unsupported operand type(s) for +: \'float\' and \'float\'',
            ],
            correctIndex: 2,
            explanation:
              'Binary floating point cannot represent 0.1 or 0.2 exactly, and their stored approximations sum to 0.30000000000000004 — one ulp away from 0.3. The `==` comparison therefore fails and the assert raises, helpfully carrying the exact value in its message. This is why float equality is banned in tests: assert with `pytest.approx(0.3)` or `math.isclose(got, 0.3)`. When a test fails on a value that "looks right", print the full repr — the extra digits are the diagnosis.',
            hint: '0.1 and 0.2 are not exact in binary. Sum their stored approximations.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'dbg-q-regression',
            prompt:
              'The controller crashed when battery voltage was exactly 0.0. You have fixed it. What is the regression test?',
            options: [
              { id: 'a', text: 'A permanent automated test that feeds 0.0 — the exact past-failure input — and asserts graceful behavior, kept in the suite' },
              { id: 'b', text: 'A manual re-test with a typical voltage like 12.0 before release' },
              { id: 'c', text: 'A code comment noting that 0.0 once caused a crash' },
              { id: 'd', text: 'Run the full suite once, then delete the new test to keep it fast' },
            ],
            correctId: 'a',
            optionNotes: {
              b: 'Typical inputs did not fail. The regression test exists for the exact input that once did — 12.0 would pass even if the bug returned.',
              c: 'Comments do not execute. Nothing fails loudly when the bug returns, which is precisely the failure mode regression tests exist to prevent.',
              d: 'Deleting the test deletes the memory. Its entire value is that it keeps running after everyone has forgotten the incident.',
            },
            explanation:
              'A regression test is institutional memory: it encodes one past failure as a permanent, automated expectation. The workflow that makes it valuable: write the failing test first (proving the reproduction), fix until it passes, keep it in the suite so every future change re-checks that bug for free. Boundary values — zero, empty, maximum, negative — are exactly where fixes silently un-fix, because normal usage rarely exercises them.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'dbg-q-aaa',
            prompt: 'Complete the pytest test so it follows the AAA structure.',
            language: 'python',
            template:
              'def test_low_battery_flag():\n    # Arrange: build the object and its inputs\n    monitor = {{b1}}(threshold=11.1)\n    # Act: do the one behavior under test\n    status = monitor.classify(10.8)\n    # Assert: check the observable outcome\n    {{b2}} status == "low"',
            blanks: [
              { id: 'b1', accept: ['batterymonitor'], choices: ['BatteryMonitor', 'test_monitor', 'assert'] },
              { id: 'b2', accept: ['assert'], choices: ['assert', 'if', 'print'] },
            ],
            explanation:
              '**Arrange** constructs the unit under test with known inputs — `BatteryMonitor(threshold=11.1)`, not whatever object a global left behind. **Act** performs exactly one behavior. **Assert** verifies the outcome with an `assert` statement — a failing assert raises and fails the test in pytest, while an `if` or a `print` would just... observe. Tests that cannot fail are decoration. Keep the sections in order and one concern per test, and any future failure names its culprit.',
            hint: 'Arrange needs the class under test; Assert needs the keyword that fails loudly.',
          },
        },
      ],
    },
    {
      id: 'dbg-l4-logging',
      title: 'Logging Like an Engineer',
      minutes: 5,
      xp: 40,
      narrative:
        'The services now survive — but when one dies at 3 a.m., the only witness is its log, and the facility\'s print statements vanish with the terminal. Time to build a memory that outlives the session.',
      steps: [
        {
          kind: 'teach',
          heading: 'Levels are a filter, not a diary',
          body:
            'The `logging` module grades every message with a **level**, and levels exist to be filtered. **DEBUG** is diagnostic detail you expect to silence in production (`joints=[0.1, 0.2]` every loop tick). **INFO** is normal milestones: started, connected, job 42 finished. **WARNING** is degraded but still working — battery below the swap threshold, a retry that succeeded on attempt 3. **ERROR** is an operation that failed. Set the logger to INFO in production and the DEBUG noise disappears without editing code; flip to DEBUG while investigating and the detail returns.\n\nThe discipline is semantic honesty: a message\'s level is chosen by what *happened*, not by how hard the code was to write. "It worked" is never ERROR, and "it worked but needs attention soon" is WARNING — the level operators scan during a shift.',
          keyPoints: [
            'DEBUG, INFO, WARNING, ERROR — chosen by what happened, filterable at runtime',
            'INFO in production, DEBUG while investigating: no code edits either way',
            'WARNING is the operator scan level: degraded but alive',
          ],
        },
        {
          kind: 'teach',
          heading: 'Context, timestamps, and rotation',
          body:
            'A log line is evidence, so it carries context. The formatter adds timestamp and level for free; your message adds the identifiers an investigator will need — which robot, which joint, which voltage. Prefer lazy `%s`-style formatting (`log.warning("battery %.1fV below swap", v)`), which builds the string only if the line is actually emitted. Compare `print("low battery")`: no time, no level, no value — and gone when the terminal closes.\n\nThe last piece is **rotation**: anything that runs for weeks logs for weeks, and an unbounded file grows until the disk dies mid-mission. A `RotatingFileHandler` caps each file (`maxBytes`) and keeps a fixed number of backups (`backupCount`): when `cell.log` fills it becomes `cell.log.1`, the chain shifts, and the oldest is dropped. Bounded logs are what make "log everything" a safe policy.',
          keyPoints: [
            'Timestamps and levels come free; you supply the identifiers (robot, joint, value)',
            'Lazy %s formatting defers string building until the line is really emitted',
            'RotatingFileHandler bounds disk use: maxBytes per file, backupCount files kept',
          ],
        },
        {
          kind: 'byte',
          text: 'The archive keeps the graph: a debug logger left at DEBUG for three weeks filled the robot\'s disk at 2 a.m. and the cell froze mid-cycle. The fix was one level and a rotating handler. Byte checks both on every boot now.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'dbg-q-level-choice',
            prompt: 'Battery reads 11.2V; the swap threshold is 11.4V. The robot continues working correctly. What level for "battery 11.2V below swap threshold"?',
            options: [
              { id: 'a', text: 'DEBUG — the robot is still functioning' },
              { id: 'b', text: 'INFO — it is part of normal operation' },
              { id: 'c', text: 'WARNING — degraded but working; a human should plan to act soon' },
              { id: 'd', text: 'ERROR — the battery failed its check' },
            ],
            correctId: 'c',
            optionNotes: {
              a: 'DEBUG is for lines nobody must act on. A shrinking battery needs a human before it becomes an outage — silencing it hides the trend.',
              b: 'INFO means "nothing to see here" during a shift scan. Burying an action-needed signal in INFO is how it gets missed for hours.',
              d: 'ERROR claims an operation failed, and none did — the cell is within spec. Over-leveling trains operators to ignore the level system entirely.',
            },
            explanation:
              'Levels encode the reader\'s required action, and this one has a clear owner: the robot still meets spec (not ERROR), but a human must swap the battery soon (above INFO). WARNING is exactly that contract — degraded, operational, attention needed. Mis-leveling costs in both directions: too low and the signal is invisible in a scan; too high and operators learn that ERROR lines are usually survivable, which fails you on the day one is not.',
            hint: 'Ask what a person reading the log should do differently because of this line.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'dbg-q-level-filter',
            prompt: 'This logger is configured for production. What reaches the console?',
            language: 'python',
            code: 'import logging\nlog = logging.getLogger("cell")\nlog.setLevel(logging.INFO)\nstream = logging.StreamHandler()\nlog.addHandler(stream)\nlog.debug("joints=%s", [0.1, 0.2])\nlog.warning("battery %.1fV below swap", 11.2)',
            choices: ['WARNING:cell:battery 11.2V below swap', 'both lines — handlers always receive everything', 'joints=[0.1, 0.2] only', 'nothing — warnings need a special handler'],
            correctIndex: 0,
            explanation:
              'Levels are checked at the logger first: `setLevel(INFO)` means the DEBUG record is discarded before any handler sees it — the detail returns the day you flip the level, no code edits. The WARNING passes, and the handler formats it with the defaults: severity, logger name, message. Note the lazy formatting: `"battery %.1fV below swap", 11.2` is built only when the line is emitted, which is why silenced hot-loop debug lines cost almost nothing.',
            hint: 'Which of the two records survives a logger set to INFO?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'dbg-q-rotation',
            prompt: 'Bound the cell\'s log so a month-long run cannot fill the disk.',
            language: 'python',
            template:
              'import logging\nfrom logging.handlers import RotatingFileHandler\n\nlog = logging.getLogger("cell")\nhandler = RotatingFileHandler("cell.log", maxBytes=5_000_000, {{b1}}=3)\nlog.addHandler(handler)\nlog.{{b2}}("job %s finished in %.1fs", job_id, secs)   # normal milestone',
            blanks: [
              { id: 'b1', accept: ['backupcount'], choices: ['backupCount', 'maxFiles', 'rotate'] },
              { id: 'b2', accept: ['info'], choices: ['info', 'warning', 'error'] },
            ],
            explanation:
              '`RotatingFileHandler("cell.log", maxBytes=5_000_000, backupCount=3)` keeps roughly 20 MB on disk: when `cell.log` hits 5 MB it is renamed to `cell.log.1`, the chain shifts, and the oldest file is deleted. `log.info` is the honest level for a completed job — a normal milestone, visible in production, paging nobody. Bounded files plus honest levels are what let the facility log everything forever without a disk timer counting down.',
            hint: 'The handler needs the count of old files to keep; a finished job is a milestone, not a failure.',
          },
        },
      ],
    },
    {
      id: 'dbg-l5-debugger',
      title: 'Using a Debugger',
      minutes: 6,
      xp: 45,
      narrative:
        'Logs record what happened; they cannot show you why. One service corrupts its summary only under exact conditions, and print cannot watch it happen. The debugger can — it stops time.',
      steps: [
        {
          kind: 'teach',
          heading: 'Breakpoints: stop time, then step',
          body:
            'A **breakpoint** pauses a running program at a chosen line — *before* that line executes — and hands you a prompt with full access to live state. In Python, `breakpoint()` opens `pdb` when its line runs. From there: `p total` prints a variable (`pp` pretty-prints), `l` shows the surrounding source, and three moves control time — `n` (**next**: run the current line completely, stop at the next), `s` (**step**: if the line calls a function, descend into its first line), and `c` (**continue**: run to the next breakpoint).\n\nThe over/into choice is the daily decision: **step over** when the function is trusted plumbing you merely need to pass, **step into** when the bug may live inside it. Watching variables change line by line is exactly what print cannot give you — print only shows the snapshots you predicted in advance.',
          keyPoints: [
            'A breakpoint halts before its line runs: inspect first, then choose the next move',
            'n steps over (whole call in one hop); s steps into the call; c continues',
            'p and pp inspect any live expression without editing the program',
          ],
        },
        {
          kind: 'teach',
          heading: 'Debugger, print, or logging?',
          body:
            'Each tool wins in its own territory. The **debugger** wins when the cause is unknown and the program is reproducible on your machine: watching the actual values evolve beats guessing which ones to print, and the heisenbug that prints scare away often survives the debugger\'s lighter touch. **Print** wins for a thirty-second question about one value. **Logging** wins everywhere a debugger cannot go — production, long-running robots, intermittent failures that need hours of evidence.\n\nRobots add a hard constraint: `breakpoint()` **stops the program**. On a headless cell that is a silent hang; on a moving arm it freezes a control loop that must not freeze. Time-sensitive and deployed code gets logging; the debugger lives in local, reproducible runs — and a `breakpoint()` never survives to a commit.',
          keyPoints: [
            'Debugger: unknown cause, reproducible locally — watch real state evolve',
            'print: one quick value; logging: production and long-running evidence',
            'breakpoint() stops the program — deadly on robots; never commit one',
          ],
        },
        {
          kind: 'byte',
          text: 'Archive, the Frozen Cell incident: a breakpoint() shipped in the calibration routine, and the headless controller waited politely for input that would never come. The cell looked broken; it was listening. Byte now greps for breakpoint() on every deploy.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'dbg-q-step-into',
            prompt: 'pdb is paused at the line `result = compute_torque(theta)`, and you suspect the bug is inside compute_torque. Which move?',
            options: [
              { id: 'a', text: 'n (next) — then inspect result to see whether it came out wrong' },
              { id: 'b', text: 's (step into) — descend into compute_torque and watch its first line' },
              { id: 'c', text: 'c (continue) — run to the next breakpoint and reassess there' },
              { id: 'd', text: 'q (quit) — restart with a print inside compute_torque instead' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Stepping over executes the whole function in one hop — you would see only the finished (possibly wrong) result, while the internal state where the bug lives stays invisible.',
              c: 'Continue is for fast-forwarding to a known interesting stop, not for entering the one function you already suspect.',
              d: 'Quitting to add prints forfeits the debugger\'s advantage: live inspection without editing code. Prints are the fallback when the debugger truly cannot run here.',
            },
            explanation:
              '`s` descends into the call — exactly right when the callee itself is suspected. The over/into pair is the core pdb decision: `n` treats the line as one atomic step (right for trusted plumbing), `s` opens the black box (right when suspicion is inside). Stepping into the function and walking its lines with `n`, inspecting variables with `p` at each halt, turns "where does the value go wrong?" from a guessing game into a two-minute walk.',
            hint: 'Which command enters a function call instead of executing it as one step?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'dbg-q-bp-state',
            prompt: 'A breakpoint sits on the print line. You are paused there — the print has not run yet. What does `p total` show?',
            language: 'python',
            code: 'readings = [22, 23, 21]\ntotal = 0\nfor r in readings:\n    total += r\navg = total / len(readings)\nprint(f"avg={avg:.1f}")   # breakpoint on this line',
            choices: ['66', '0', '45', 'NameError: name \'total\' is not defined'],
            correctIndex: 0,
            explanation:
              'A breakpoint freezes the program *after* everything above it ran and *before* its own line: the loop and the `avg` assignment are complete, so `total` is 66 (22 + 23 + 21) and `avg` is already 22.0. The answer 0 reflects the beginner model — "breakpoints freeze from the start" — but a breakpoint is a pause, not a rewind. That is precisely the tool\'s power: every variable above the halt line holds its true live value, inspectable with no prints added and no rerun needed.',
            hint: 'Has the loop finished by the time the paused line is reached?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'bughunt',
            id: 'dbg-q-committed-bp',
            prompt: 'The calibration service "randomly" hangs on the headless cell — always inside this function, never on a laptop with a terminal open. Click the line that hangs it.',
            language: 'python',
            code: 'def calibrate(joints):\n    midpoint = (min(joints) + max(joints)) / 2\n    breakpoint()\n    return [round(j - midpoint, 3) for j in joints]\n\ndef run_cell():\n    joints = read_joint_states()\n    return calibrate(joints)',
            buggyLine: 3,
            causeOptions: [
              { id: 'a', text: 'min() and max() cannot be called on the same list in one expression' },
              { id: 'b', text: 'breakpoint() left in deployed code pauses the process and waits for interactive input — a headless cell has no terminal, so it waits forever and looks like a random hang' },
              { id: 'c', text: 'A list comprehension cannot call round() on each element' },
              { id: 'd', text: 'read_joint_states must be defined before calibrate' },
            ],
            causeCorrectId: 'b',
            fixExplanation:
              'A committed `breakpoint()` is a landmine: on your laptop it opens pdb as intended, but on the headless cell stdin leads nowhere and the process waits forever — a hang that looks intermittent because it only triggers on the calibration path. Remove it before deploy; if the midpoint is worth recording, that is a `log.debug` line, which documents without stopping the world.',
            fixedCode: 'def calibrate(joints):\n    midpoint = (min(joints) + max(joints)) / 2\n    log.debug("midpoint %.3f", midpoint)\n    return [round(j - midpoint, 3) for j in joints]\n\ndef run_cell():\n    joints = read_joint_states()\n    return calibrate(joints)',
            explanation:
              'The debugger is a local, interactive instrument — it assumes a human at a terminal, and deployed robots have none. Hence the guardrails: never commit `breakpoint()` (this facility greps for it in CI, a rule adopted the week of the Frozen Cell incident), and reach for logging whenever evidence must be collected where no debugger can attach. Debugger for interactive unknowns, logs for the field.',
            hint: 'What does that line wait for, and is any such thing attached to a headless cell?',
          },
        },
      ],
    },
    {
      id: 'dbg-l6-flaky',
      title: 'Intermittent Bugs & Flaky Tests',
      minutes: 6,
      xp: 45,
      narrative:
        'One test in the nightly suite fails about once in ten runs — a different value every time, always "passes on re-run". The team has been re-running for a month. Intermittent does not mean unexplainable; it means one input is not under control yet.',
      steps: [
        {
          kind: 'teach',
          heading: 'Why "sometimes" happens',
          body:
            'Code is deterministic: same inputs, same behavior. A bug that reproduces "sometimes" is a promise that **some input differs between runs** — you just are not controlling it. The usual suspects: **timing and races** (two threads or processes reach shared state in an order that varies per run), **unseeded randomness** (`random.uniform` draws differently every run), **shared fixtures** (tests reading and mutating the same file, database, or ROS topic), and wall-clock time (a test that behaves differently at midnight).\n\nThe reframe that makes these attackable: the bug is not random — it is deterministic in a larger input space, and your job is to drag the missing input into view.',
          keyPoints: [
            'Same inputs give same outputs — "sometimes" means an uncontrolled input',
            'Timing/races, unseeded randomness, shared state, and clocks are the usual culprits',
            'Intermittent = deterministic in a bigger input space; find the missing dimension',
          ],
        },
        {
          kind: 'teach',
          heading: 'Make it deterministic, then trust the signal',
          body:
            'Forcing reproduction means controlling every input: **fix the seed** (`random.seed(42)` gives every run the same draw), **inject the clock** (pass time in as a parameter and fake it in tests), **isolate state** (each test gets its own temp directory or in-memory store, never the shared one), and for races, **loop the suspect region** thousands of times to squeeze the timing window until it fails on demand.\n\nThen the trust question: a test that fails 1-in-10 is not noise — over 30 nightly runs that is three real observations, and "re-run until green" is the suite learning to lie to you. Quarantine the test, pin its inputs, and it either exposes a genuine race (fix the code) or it was testing random data (fix the test). Either way: deterministic or deleted — never normalize the re-run.',
          keyPoints: [
            'Seed randomness, inject clocks, isolate shared state — then the failure is on demand',
            'A 1-in-10 failure is three real observations in 30 runs, not noise',
            'Quarantine and make it deterministic; re-run-until-green trains the team to ignore failures',
          ],
        },
        {
          kind: 'byte',
          text: 'Archive: the "Friday flake" — a joint-limit test failing one run in ten for four months. Pinning the seed finally reproduced it locally: two threads publishing the same joint-state topic, order undefined. Four months of "just re-run it", one afternoon of controlled inputs.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'dbg-q-flaky-mcq',
            prompt:
              'A suite test has failed 3 times in the last 30 nightly runs, each time on a different value. The team habit: re-run until green and move on. Strongest response?',
            options: [
              { id: 'a', text: 'The habit is fine — different values each time proves it is noise' },
              { id: 'b', text: 'Quarantine the test and make it deterministic — fixed inputs or a fixed seed — then it either exposes a real race in the code or bad test data; both are fixes, not re-runs' },
              { id: 'c', text: 'Delete the test; a test that fails sometimes is worse than no test' },
              { id: 'd', text: 'Add a sleep before the assertion so timing settles' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Different values are not evidence of noise — they are evidence of uncontrolled input. Random-looking data is still caused data.',
              c: 'Deleting the test deletes the only instrument catching this behavior. Fix the inputs and it becomes one of the suite\'s best tests.',
              d: 'A sleep does not remove the race — it only moves the odds. Slower and still flaky is the worst of both.',
            },
            explanation:
              'Three failures in 30 runs is a 10% signal, not noise — and a suite where some failures are ignorable teaches exactly the wrong reflex for the day a quiet failure is real. The professional move is quarantine plus determinism: pin the seed or the inputs, and the test either fails every run (a real bug, now reproducible — the best kind) or passes every run (the test was asserting on random data). Both outcomes end the flakiness; re-running just reschedules it.',
            hint: 'What would you need to control to make this test fail — or pass — on demand?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'bughunt',
            id: 'dbg-q-flaky-bug',
            prompt: 'test_low_battery fails about two runs in three on CI, and always "passes on re-run". Click the line that makes it flaky.',
            language: 'python',
            code: 'def test_low_battery():\n    v = random.uniform(10.0, 13.0)\n    status = classify(v)\n    assert status == "low"',
            buggyLine: 2,
            causeOptions: [
              { id: 'a', text: 'Line 2 draws an unseeded random voltage, so the input changes every run — the assertion only holds when the draw lands below the low-battery threshold' },
              { id: 'b', text: 'classify() cannot be called with a float' },
              { id: 'c', text: 'assert statements are disabled in CI and never run' },
              { id: 'd', text: 'uniform() must be given integers, not floats' },
            ],
            causeCorrectId: 'a',
            fixExplanation:
              'The test asserts one exact outcome from an input it does not control: roughly two thirds of draws land at or above the 11.1 V threshold and fail. Control the input — a fixed value that exercises the boundary (`classify(10.8)` must be "low"), or `random.seed(...)` plus property assertions. A seeded draw gives the same value on every machine; a boundary value documents the rule.',
            fixedCode: 'def test_low_battery():\n    assert classify(10.8) == "low"   # below threshold, deterministic\n\ndef test_normal_battery():\n    assert classify(12.4) == "ok"',
            explanation:
              'This is the signature flaky-test shape: random input, exact-output assertion. The test is not wrong to exist — it is wrong to gamble. Deterministic tests pick their inputs on purpose: the value just below the threshold, the value just above, or a seeded random sweep asserting only the contract (status matches the input\'s side of the threshold). Every run then means the same thing, which is the entire point of an automated suite.',
            hint: 'What differs between a green run and a red one — the code, or the input?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'dbg-q-flaky-fill',
            prompt: 'Rebuild the pack report test so every run draws the same values — and asserts what randomness actually allows.',
            language: 'python',
            template:
              'def test_pack_report():\n    {{b1}}.seed(42)   # same sequence on every machine, every run\n    cells = [random.uniform(3.4, 4.2) for _ in range(6)]\n    report = build_pack_report(cells)\n    assert report["count"] == 6\n    assert 3.4 {{b2}} report["min_v"] <= 4.2',
            blanks: [
              { id: 'b1', accept: ['random'], choices: ['random', 'numpy', 'math'] },
              { id: 'b2', accept: ['<='], choices: ['<=', '==', '>'] },
            ],
            explanation:
              '`random.seed(42)` pins the pseudo-random sequence, so every machine and every run draws identical cells — the flakiness is gone before the first assertion. The second blank is the other half of the discipline: with seeded input you *could* assert exact values, but asserting the **property** (`3.4 <= min_v <= 4.2`) documents the real contract and survives a legitimate change of seed or library. Deterministic inputs plus property assertions is the stable middle between gambling and over-fitting.',
            hint: 'First blank: which module owns seed()? Second: min_v lies within the drawn range — which comparison expresses that?',
          },
        },
      ],
    },
  ],
  flashcards: [
    {
      id: 'fc-dbg-1',
      categoryId: 'debug',
      concept: 'Traceback',
      explanation:
        'Python\'s report of an unhandled exception: the call chain as frames, ending with the exception type and message. Read it bottom-up — the last line is what broke, the frame just above is where.',
      example: 'KeyError: \'imu\' with parser.py line 12 just above it: the lookup at line 12 asked for a key the dict lacks.',
      misconception: 'The top of the traceback is where execution started, not what failed — reading it top-down wastes the report\'s ordering.',
      application: 'Every crashed service leaves one in its logs; reading it precisely is the difference between a fix and a restart-and-pray.',
      difficulty: 1,
    },
    {
      id: 'fc-dbg-2',
      categoryId: 'debug',
      concept: 'TypeError vs ValueError vs NameError',
      explanation:
        'NameError: the variable name does not exist (typo, use-before-define). TypeError: an operation got a type it cannot handle (None + float, calling an int). ValueError: the type is acceptable but the value is not (int("fast")).',
      example: 'int(None) raises TypeError; int("fast") raises ValueError; int(speed) with no speed defined raises NameError.',
      misconception: 'They are not interchangeable severity labels — each points at a different culprit: your code\'s names, the operand\'s type, or the operand\'s value.',
      application: 'The exception name is the first triage clue: NameError means check spelling and order; TypeError means trace where the wrong type came from; ValueError means validate inputs at the boundary.',
      difficulty: 2,
    },
    {
      id: 'fc-dbg-3',
      categoryId: 'debug',
      concept: 'Breakpoint',
      explanation:
        'A marker that pauses execution and hands you an interactive prompt — in Python, breakpoint() opens pdb — where you can inspect every variable and step line by line.',
      example: 'Drop breakpoint() before the suspicious call, run, then print(state) and n to step through.',
      misconception: 'breakpoint() is not print(): it stops the program for live inspection instead of emitting one value and racing on — and it must be removed before committing.',
      application: 'When you need to watch state evolve, or when prints perturb a timing bug — the debugger observes without rewriting the program.',
      difficulty: 2,
    },
    {
      id: 'fc-dbg-4',
      categoryId: 'debug',
      concept: 'Unit test',
      explanation:
        'An automated test of one small unit of behavior — a function or class — in isolation: fast, deterministic, no network, robot, or database. pytest runs any function named test_*.',
      example: 'def test_low_battery(): assert classify(10.8) == "low" — Arrange, Act, Assert in three lines.',
      misconception: 'A unit test is not "run the whole system and eyeball it" — tests that need hardware are integration tests: slow and flaky by nature.',
      application: 'The safety net that makes refactoring controller logic survivable — and every bug fix should arrive with one.',
      difficulty: 1,
    },
    {
      id: 'fc-dbg-5',
      categoryId: 'debug',
      concept: 'Regression test',
      explanation:
        'A test pinned to the exact input of a bug you already fixed, kept in the suite permanently so the bug cannot quietly return.',
      example: 'The 0.0-voltage crash becomes test_zero_voltage: feed 0.0, assert graceful handling, forever.',
      misconception: 'It is not rerunning an old manual checklist — its power is being automated, specific to the past failure, and executed on every change.',
      application: 'Boundary values (zero, empty, max) regress silently; the regression suite is how a team stops relearning the same lesson.',
      difficulty: 2,
    },
    {
      id: 'fc-dbg-6',
      categoryId: 'debug',
      concept: 'Logging levels',
      explanation:
        'Standard severities — DEBUG (diagnostic detail), INFO (normal milestones), WARNING (degraded but working), ERROR (an operation failed), CRITICAL (the system is dying) — filterable at runtime without editing code.',
      example: 'log.debug("joints=%s", joints) for loop internals; log.error("hub 503 after 3 retries") for failures that matter.',
      misconception: 'Levels are not moods — a successful read is INFO even if the code was hard to write, and "it worked" is never ERROR.',
      application: 'Long-running robots log instead of print: timestamps plus levels let you reconstruct any incident after the fact and silence DEBUG noise in production.',
      difficulty: 2,
    },
    {
      id: 'fc-dbg-7',
      categoryId: 'debug',
      concept: 'Choosing log levels in practice',
      explanation:
        'The level is chosen by what happened, then enforced by configuration: log.setLevel(INFO) in production silences DEBUG noise with no code edits; flip to DEBUG during an investigation and the detail returns. WARNING is the shift-scan level — degraded but working, action planned; ERROR means an operation failed.',
      example: 'log.setLevel(logging.INFO) in production; setLevel(DEBUG) while chasing an intermittent fault — the filter moves, the code does not.',
      misconception: 'Cranking everything to DEBUG in production is not extra safety — it buries actionable WARNING lines in per-loop noise and, without rotation, fills the disk mid-mission.',
      application: 'Operators scan WARNING during a shift and get paged on ERROR; a mis-leveled line is either invisible in the scan or trains everyone to ignore the pager.',
      difficulty: 2,
    },
    {
      id: 'fc-dbg-8',
      categoryId: 'debug',
      concept: 'Breakpoint & stepping',
      explanation:
        'A breakpoint pauses the program before its line runs and hands you live state: p prints variables, n steps over (the whole call in one hop), s steps into the callee, c continues to the next breakpoint. You watch state change line by line without editing code.',
      example: 'Paused above a sum, p total shows the loop already finished (66) — execution above the breakpoint is real; only the paused line has not run.',
      misconception: 'A breakpoint is a pause, not a restart or a freeze-from-the-top — and one committed to deployed code hangs a headless robot waiting for terminal input that never comes.',
      application: 'Local, reproducible bugs with unknown cause: step into the suspect function and find the exact line where a value goes wrong — then remove the breakpoint before deploy.',
      difficulty: 2,
    },
    {
      id: 'fc-dbg-9',
      categoryId: 'debug',
      concept: 'Flaky test',
      explanation:
        'A test that passes and fails on identical code is responding to uncontrolled inputs — unseeded randomness, thread timing, shared state, wall-clock time. It is a real signal, not noise: over 30 runs, a 1-in-10 failure is three observations.',
      example: 'random.uniform(10.0, 13.0) feeding assert classify(v) == "low" fails whenever the draw lands above the threshold — pin a seed or fix the input and it becomes deterministic.',
      misconception: '"Re-run until green" does not fix a flaky test — it trains the team to ignore failures and hides the race the test may be exposing. Quarantine and make it deterministic instead.',
      application: 'Nightly suites and hardware-in-the-loop tests: control the seed, inject the clock, isolate state — then a 1-in-10 failure turns into either a reproducible bug or a fixed test.',
      difficulty: 3,
    },
  ],
};
