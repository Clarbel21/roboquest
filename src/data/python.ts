import type { Category } from '../engine/types';

// Python Basics — content module.
// The facility's control scripts, restored one fundamental at a time.

export const pythonCategory: Category = {
  id: 'python',
  name: 'Python',
  tagline: 'Small language, sharp tools — rebuild the scripts that run the bays',
  icon: '🐍',
  description:
    'The facility\'s Python control scripts — gate logic, calibration, watchdogs — were corrupted in the outage. Rebuild the language fundamentals and the automation lines come back online.',
  accent: 'sky',
  lessons: [
    {
      id: 'py-l1-basics',
      title: 'Variables, Types & f-strings',
      minutes: 5,
      xp: 40,
      narrative:
        'The calibration terminal in Bay 3 boots to a corrupted prompt. Byte scans the wreckage: every surviving script starts the same way — values stored, labeled, and reported. Rebuild that first.',
      steps: [
        {
          kind: 'teach',
          heading: 'Variables and the core types',
          body:
            'Python creates a **variable** the first time you assign to it: `battery_v = 12.5` binds the name `battery_v` to a value. Four types carry most scripts: `int` (whole numbers — `6` joints), `float` (decimals — `12.5` volts), `str` (text — `"arm_01"`), and `bool` (`True` / `False`, what a sensor check returns).\n\nPython is **dynamically typed**: the type lives with the value, not the name. The same name may hold a number now and a string tomorrow — fast to write, easy to break, so track what each name currently holds.',
          keyPoints: [
            'Assignment creates a name bound to a value',
            'Core types: int, float, str, bool',
            'Dynamic typing: the type belongs to the value, not the name',
          ],
        },
        {
          kind: 'teach',
          heading: 'Printing and f-strings',
          body:
            '`print()` writes values to the console — the first debugging instrument you will reach for. An **f-string** builds text with values inside: prefix the string with `f` and put expressions in braces, `f"{robot_id} at {rpm} rpm"`. Anything legal in Python goes in the braces — a variable, arithmetic, a function call — and the result is converted to text automatically.\n\nAdd a **format spec** after a colon to control rendering: `f"{temp_c:.1f}"` shows `71.46231` as `71.5` — fixed-point, one decimal, rounded. Logs, reports, and every print-based debug session start here.',
          keyPoints: [
            'f"..." plus {expr} embeds live values in text',
            '{value:.2f} renders a float with 2 decimal places',
            'print() displays; the f-string builds the message first',
          ],
        },
        {
          kind: 'byte',
          text: 'Archive note: the oldest surviving script here is four lines long and just prints battery voltage. It ran unattended for 412 days. Aim for that kind of boring.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'py-q-fstring-predict',
            prompt: 'The calibration terminal boots this script. What exactly appears on the console, line by line?',
            language: 'python',
            code:
              'robot = "arm_01"\njoints = 6\navg_deg = 10\n\nprint(f"{robot} online")\nprint(joints * 2)\nprint(avg_deg / 3)\nprint("servo" + "test")',
            choices: [
              'arm_01 online\n12.0\n3.3333333333333335\nservotest',
              'arm_01 online\n12\n3.3333333333333335\nservotest',
              'arm_01 online\n12\n3.33\nservo test',
            ],
            correctIndex: 1,
            explanation:
              'Four mechanics at once. The f-string substitutes `{robot}`, printing `arm_01 online`. `joints * 2` is int times int, so it prints `12` — no decimal point. Division `/` always returns a float, and Python prints floats with full binary-precision digits: `10 / 3` is `3.3333333333333335`, not a rounded `3.33`. And `+` on strings concatenates with no separator: `"servo" + "test"` is `"servotest"`.',
            hint: 'Does / ever return an int in Python 3, and does it round for display?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'py-q-fstring-fill',
            prompt: 'Rebuild the status line so it prints exactly: arm_01: 71.5C (nominal)',
            language: 'python',
            template:
              'robot_id = "arm_01"\ntemp_c = 71.49\nstatus = "nominal"\n\nprint({{b1}}"{robot_id}: {temp_c:.{{b2}}} ({status})")',
            blanks: [
              { id: 'b1', accept: ['f'], choices: ['f', 'str', 'fmt'] },
              { id: 'b2', accept: ['1f'], choices: ['1f', '2d', '3s'] },
            ],
            explanation:
              'The `f` prefix tells Python to interpret `{...}` slots; without it the braces print literally. The format spec after the colon — `.1f` — means fixed-point notation with one digit after the decimal, rounded: `71.49` becomes `71.5`. Specs end in a type letter: `f` for fixed-point floats, `d` for integers, `s` for strings.',
            hint: 'Format specs read as <digits><type>. One decimal place of a float is dot-one-what?',
          },
        },
      ],
    },
    {
      id: 'py-l2-control',
      title: 'Control Flow: if, for, while',
      minutes: 6,
      xp: 45,
      narrative:
        'The conveyor gate in Bay 5 opens for every sensor reading, including fault codes. The branching logic that decided "open or hold" has been wiped. Rebuild it before the next test cycle.',
      steps: [
        {
          kind: 'teach',
          heading: 'Branching with if / elif / else',
          body:
            'An `if` statement runs its indented block only when the condition is `True` — and a condition is just an expression that evaluates to a bool: `temp_c > 80`, `status == "fault"`, `sensors_active and link_up`. Chain checks with `elif` and end with `else`: Python evaluates top to bottom and runs **only the first** branch whose condition holds, skipping the rest.\n\nIndentation is syntax in Python, not decoration: four spaces mark which lines belong to the branch. And `==` compares values while a single `=` assigns — the classic typo that silently turns a check into an assignment.',
          keyPoints: [
            'Conditions are ordinary expressions that evaluate to True/False',
            'elif chains run only the first matching branch',
            'Indentation (4 spaces) defines which lines are in the block',
          ],
        },
        {
          kind: 'teach',
          heading: 'Loops: for, range, while',
          body:
            'A `for` loop visits each item of a sequence. Since you rarely hand-type sequences, `range()` generates the numbers: `range(3)` yields `0, 1, 2` — the **stop value is excluded**. `range(1, 6, 2)` yields `1, 3, 5`: start included, stop excluded, step 2.\n\nA `while` loop repeats as long as its condition stays `True`, so something inside the body must move the condition toward `False` — increment a counter, drain a queue, time out a sensor wait — or the loop never ends. Rule of thumb: `for` when you know how many items, `while` when you are waiting for a state.',
          keyPoints: [
            'range(stop) starts at 0 and excludes stop — runs exactly stop times',
            'range(start, stop, step) for custom sweeps',
            'while needs a body line that eventually turns the condition False',
          ],
        },
        {
          kind: 'byte',
          text: 'Maintenance log, Bay 5: a gate controller once hung in a while loop waiting on a sensor that had been unplugged. 14,000 gate cycles later, someone cut the power. Before trusting any loop, point at the line that ends it.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'py-q-range',
            prompt: 'A lidar sweep runs `for angle in range(10, 90, 20):`. Which angles does the scan visit?',
            options: [
              { id: 'a', text: '10, 30, 50, 70, 90' },
              { id: 'b', text: '10, 30, 50, 70' },
              { id: 'c', text: '0, 20, 40, 60, 80' },
              { id: 'd', text: '30, 50, 70, 90' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Close — but the stop value is never produced. range excludes its stop, always, in every overload.',
              c: 'That is what you get if you ignore the start value. range(10, 90, 20) begins at 10, not 0.',
              d: 'The start value IS produced — only the stop is excluded. The sweep must begin at 10.',
            },
            explanation:
              'range(start, stop, step) yields start, start+step, and so on while strictly below stop: 10, 30, 50, 70 — and it stops before 90 because the stop value is excluded. Reading it aloud helps: "start at 10, step by 20, stay below 90." This half-open convention is why `range(n)` runs exactly `n` times, which Python code relies on everywhere.',
            hint: 'Say it as: start at 10, keep adding 20, stop before reaching 90.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'py-q-loop',
            prompt: 'The gate controller runs this diagnostic pass. What does it print?',
            language: 'python',
            code:
              'readings = [72, 68, 91, 74]\nalarms = 0\n\nfor r in readings:\n    if r > 70:\n        alarms = alarms + 1\n\nprint(alarms)',
            choices: ['1', '4', '3'],
            correctIndex: 2,
            explanation:
              'Trace it element by element: 72 > 70 makes alarms 1; 68 fails the check; 91 makes it 2; 74 makes it 3. The assignment `alarms = alarms + 1` rebinds the name each iteration, so the count **accumulates** across the loop. This filter-and-count shape — a loop, an if, a running total — is one of the most common patterns in analysis scripts.',
            hint: 'Walk the list one reading at a time and only update alarms when the condition holds.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'bughunt',
            id: 'py-q-while-bug',
            prompt: 'This watchdog loop never releases the relay. Click the line carrying the bug, then pick the root cause.',
            language: 'python',
            code:
              'attempts = 0\nwhile attempts < 5:\n    print("Relay cycle", attempts)\n    attempts + 1\nprint("Relay released")',
            buggyLine: 4,
            causeOptions: [
              {
                id: 'a',
                text: 'Line 4 computes attempts + 1 but never stores the result, so attempts stays 0 and the condition never turns False',
              },
              { id: 'b', text: 'while loops cannot use < comparisons, only ==' },
              { id: 'c', text: 'The print inside the loop blocks the counter from updating' },
              { id: 'd', text: 'The loop body must be indented exactly 8 spaces' },
            ],
            causeCorrectId: 'a',
            fixExplanation:
              'A bare expression builds a new int and immediately drops it: `attempts + 1` changes nothing. Assign it back — `attempts = attempts + 1`, or the shorthand `attempts += 1` — so the value the condition tests actually moves toward 5.',
            fixedCode:
              'attempts = 0\nwhile attempts < 5:\n    print("Relay cycle", attempts)\n    attempts += 1\nprint("Relay released")',
            explanation:
              'This is the classic infinite while loop: nothing in the body changes the value the condition examines. Every while loop needs a line that moves its condition toward False — here, storing the incremented counter. Python will happily compute `attempts + 1` a billion times if you never keep the result.',
            hint: 'Watch the variable named in the condition. Does its value ever actually change?',
          },
        },
      ],
    },
    {
      id: 'py-l3-functions',
      title: 'Functions: def, Parameters & Return',
      minutes: 5,
      xp: 40,
      narrative:
        'Three scripts in Bay 2 each carry their own half-remembered copy of the voltage check — and the copies disagree by 0.4 volts. One function, defined once and imported everywhere, fixes all three.',
      steps: [
        {
          kind: 'teach',
          heading: 'Defining and returning',
          body:
            'A **function** packages a calculation under a name: `def pack_ok(v):` — the parameters are the inputs, the indented body is the work, and `return` sends the result back to whoever called. Writing `pack_ok(12.4)` is an expression: the call itself evaluates to the returned value, ready to store, compare, or pass along.\n\n`return` also ends the function immediately — lines after it never run. A function with no `return` (or a bare `return`) hands back `None`, a real value, just not a useful one. Keep functions short and single-purpose: clear inputs in, one clear result out.',
          keyPoints: [
            'def name(params): defines; a call evaluates to the returned value',
            'return sends the result back and exits the function',
            'No return means the call evaluates to None',
          ],
        },
        {
          kind: 'teach',
          heading: 'Scope: where names live',
          body:
            'Names created inside a function — parameters included — live in that function\'s **local scope**: they exist during the call, then vanish. That isolation is a feature. A `temp` inside `check_temp` cannot collide with a `temp` elsewhere, and the function cannot quietly rewrite the outside world.\n\nA function can read names defined outside it, but the discipline is to pass everything it needs in as parameters and hand results back with `return`. Functions that lean on hidden globals break the moment another script imports them — a lesson this facility learned the expensive way.',
          keyPoints: [
            'Assignments inside a function are local to that call',
            'Parameters are ordinary local variables',
            'Prefer parameters and return over reaching into globals',
          ],
        },
        {
          kind: 'byte',
          text: 'Recovered comment from the corrupted scripts: "# TODO: copy this fix to the other two files." It was never copied. This is why functions exist.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'py-q-return',
            prompt: 'A teammate rewrites the voltage check so other code can act on its result. Which version makes `if check(12.2):` behave correctly?',
            options: [
              { id: 'a', text: 'def check(v): print(f"{v} V") — then if check(12.2):' },
              { id: 'b', text: 'def check(v): return v > 12.0 — then if check(12.2):' },
              { id: 'c', text: 'def check(v): v > 12.0 — the comparison result stays in v' },
              { id: 'd', text: 'Both a and b behave identically at the if' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'print shows text on the console and returns None. `if None:` is always false — the branch never sees the voltage at all.',
              c: 'Without return or print, the comparison is computed and discarded; the function returns None either way.',
              d: 'They look similar and differ completely: one returns None after printing, the other returns a usable bool the if can branch on.',
            },
            explanation:
              '`print` is for humans; `return` is for code. A call evaluates to whatever the function returns, so with `return v > 12.0` the expression `check(12.2)` becomes `False` right at the call site and the if can act on it. Rule of thumb: functions return values, and only the outermost layer of a program prints.',
            hint: 'Ask what each version\'s call evaluates to, then ask what if None does.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'py-q-def',
            prompt: 'Complete the shared check: it takes one reading and reports whether the pack voltage is in range (11.5 to 12.6 V inclusive).',
            language: 'python',
            template:
              'def {{b1}}(v: float) -> bool:\n    return 11.5 {{b2}} v {{b3}} 12.6\n\n# every Bay 2 script imports this now\nif pack_ok(12.4):\n    print("Pack in range")',
            blanks: [
              { id: 'b1', accept: ['pack_ok'], choices: ['pack_ok', 'return', 'def'] },
              { id: 'b2', accept: ['<='], choices: ['<=', '>=', '='] },
              { id: 'b3', accept: ['<='], choices: ['<=', '=>', '='] },
            ],
            explanation:
              '`def` introduces the function and its parameter; the chained comparison `11.5 <= v <= 12.6` is Python\'s direct spelling of "between 11.5 and 12.6, inclusive". The `-> bool` hint documents the contract for readers and tools. Defined once, every Bay 2 script calls the same four lines instead of carrying divergent copies — that is the entire point of the exercise.',
            hint: 'Which keyword creates a function — and how does Python write "v between two bounds, inclusive" in one expression?',
          },
        },
      ],
    },
    {
      id: 'py-l4-datastructures',
      title: 'Lists, Tuples, Dicts & Sets',
      minutes: 6,
      xp: 45,
      narrative:
        'The inventory manifest, the joint calibration constants, the fault registry, the sensor ID list — each needs a different container. Pick the wrong one and the data starts fighting back.',
      steps: [
        {
          kind: 'teach',
          heading: 'Lists and tuples: sequences',
          body:
            'A **list** is an ordered, mutable sequence: `readings = [72.1, 71.8, 74.0]`. Append with `.append(x)`, read by index from 0 (`readings[0]`), slice with `readings[1:3]` (start included, end excluded). Lists grow and change — the default container for data you collect over time.\n\nA **tuple** is the immutable sibling: `origin = (0.0, 0.0, 1.0)`. No appending, no reordering, no reassigning elements. The rigidity is the feature: a tuple says "this is one fixed record" — an (x, y, z), a (min, max) range — and guarantees nothing silently rewrites it. Growing collection → list. Fixed-shape record → tuple.',
          keyPoints: [
            'List: ordered, mutable — collect and modify',
            'Tuple: ordered, immutable — fixed records that resist change',
            'Index from 0; slices like seq[1:3] exclude the end',
          ],
        },
        {
          kind: 'teach',
          heading: 'Dicts and sets: lookups and uniqueness',
          body:
            'A **dict** maps keys to values: `torques = {"joint_1": 4.2, "joint_2": 3.9}` — you look up by key, not position: `torques["joint_1"]`. Use it whenever each record has a meaningful label: serial numbers, config values, per-robot state. A **set** holds unique items with no order: `set(logged_ids)` collapses duplicates in one call, and `"r-07" in seen_ids` is a fast membership test.\n\nThe choosing guide: position matters or you will keep appending → list. Fixed record that must not change → tuple. Look up by label → dict. Uniqueness or membership → set.',
          keyPoints: [
            'Dict: key to value, unique keys, label-based lookup',
            'Set: unique elements, fast membership, no order',
            'The access pattern you need decides the structure',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'py-q-ds-choice',
            prompt: 'You must store each robot\'s firmware version and fetch it by serial, like `units["r-04"]`. Which structure fits?',
            options: [
              { id: 'a', text: 'A list of versions, indexed by position' },
              { id: 'b', text: 'A tuple of (version,) records' },
              { id: 'c', text: 'A dict mapping serial number to version' },
              { id: 'd', text: 'A set of version strings' },
            ],
            correctId: 'c',
            optionNotes: {
              a: 'Position-indexed lists force you to remember which index belongs to which robot — and silently break the moment one unit is added or removed.',
              b: 'Tuples are immutable records, not lookup tables; there is no way to fetch by serial at all.',
              d: 'Sets hold each value once and have no keys. You can ask "is 2.3.1 in the set?", never "which version belongs to r-04?".',
            },
            explanation:
              'The access pattern decides the structure. Lookup by label — serial, part number, joint name — is exactly what dicts exist for: `units["r-04"]` reads as intent, insertion is `units["r-09"] = "2.3.1"`, and two robots cannot share one serial key. Reach for list, tuple, or set only when position, immutability, or uniqueness is the actual point.',
            hint: 'The question you must answer is "which version belongs to this serial?" — which structure answers label-questions?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'py-q-set-dict',
            prompt: 'The registry cleanup pass runs. What appears on the console?',
            language: 'python',
            code:
              'raw_ids = ["r-01", "r-03", "r-01", "r-02", "r-03"]\nunique = set(raw_ids)\nprint(len(unique))\n\ncounts = {"r-01": 3}\nprint(counts["r-02"])',
            choices: ['3\n0', '3\nKeyError: \'r-02\'', '5\n0'],
            correctIndex: 1,
            explanation:
              'Two fundamentals in six lines. First, `set(raw_ids)` keeps one copy of each distinct ID, so the 5 raw readings collapse to 3 and `len(unique)` prints 3. Second, `counts["r-02"]` reads a key that was never stored — dicts raise **KeyError** for missing keys; they do not return 0 or None. When absence should mean a default, ask for it explicitly: `counts.get("r-02", 0)`.',
            hint: 'Two separate questions: how many distinct IDs survive the set, and what does a dict do with an unknown key?',
          },
        },
      ],
    },
    {
      id: 'py-l5-strings',
      title: 'Strings, Slicing & Formatting',
      minutes: 6,
      xp: 40,
      narrative:
        'The fault console in Bay 1 prints raw sensor IDs and full-precision voltages — the text-handling layer of every log script was wiped in the outage. Strings are how a robot explains itself. Rebuild the toolkit.',
      steps: [
        {
          kind: 'teach',
          heading: 'Strings are immutable sequences',
          body:
            'A string is an ordered sequence of characters, indexed from 0: with `serial = "lidar-04"`, the `"l"` sits at index 0. Negative indices count from the end: `serial[-1]` is `"4"`, `serial[-2]` is `"0"`. `len(serial)` gives the length — 8 here.\n\nStrings are **immutable**: no operation ever edits one in place. Every method — `.upper()`, `.replace()`, `.strip()` — returns a **new** string and leaves the original untouched. `serial.upper()` alone changes nothing; `serial = serial.upper()` rebinds the name to the new value. This is why sloppy string code quietly prints the original: the result was computed and dropped.',
          keyPoints: [
            'Index from 0; negative indices count from the end',
            'String methods return new strings — nothing mutates in place',
            'serial.upper() alone discards the result; rebind the name',
          ],
        },
        {
          kind: 'teach',
          heading: 'Slicing: seq[start:stop:step]',
          body:
            'A slice extracts a sub-sequence: `seq[start:stop:step]` — start included, stop excluded. `serial[0:5]` takes indices 0 through 4: `"lidar"`. Omit either side: `serial[:5]` means "from the beginning", `serial[6:]` means "to the end", and `serial[:]` copies the whole string. Negative indices work in slices too: `serial[-2:]` is `"04"`.\n\nThe optional third value is the step. `serial[::2]` takes every second character; a negative step walks backwards — `serial[::-1]` is the classic reverse. Out-of-range slices do not raise errors; they simply truncate, which makes slicing safe for parsing variable-length log lines.',
          keyPoints: [
            'seq[start:stop:step] — start included, stop excluded',
            'Omitted start means from the beginning; omitted stop means to the end',
            'Negative step walks backwards: seq[::-1] reverses',
          ],
        },
        {
          kind: 'teach',
          heading: 'Format specs: width and precision',
          body:
            'After the colon in an f-string slot, the **format spec** controls rendering. Precision: `f"{v:.2f}"` fixes two decimal places — `3.14159` prints as `3.14`, rounded for display while the underlying float is unchanged. Width and alignment: `f"{name:>8}"` right-aligns in an 8-character field, padding with spaces on the left; `<` left-aligns, `^` centers.\n\nThey compose: `f"{v:8.2f}"` reserves 8 characters for a two-decimal number, so columns line up and logs become scannable. Padding even takes a fill character: `f"{7:05.1f}"` gives `007.0`. Between methods for cleaning text and specs for presenting numbers, one f-string replaces most formatting code you would otherwise write.',
          keyPoints: [
            '{value:.2f} — fixed-point, 2 decimals, rounded for display',
            '{value:>8} — right-align in width 8; spaces pad the left',
            'Width and precision compose: {v:8.2f} prints aligned columns',
          ],
        },
        {
          kind: 'byte',
          text: 'Recovered from Bay 1: a script that pasted raw floats into the facility report — 71.46230849772142 C. The review note beside it, still legible: "no human reads 17 decimals." Format specs exist so machines and people can share a console.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'py-q-slice-predict',
            prompt: 'The rebuilt console script runs. What exactly does it print?',
            language: 'python',
            code:
              'code = "lidar-04"\n\nprint(code[:5])\nprint(code[-2:])\nprint(f"{3.14159:.2f}")\nprint(f"{7:>5}|")',
            choices: [
              'lidar\n04\n3.14\n    7|',
              'lidar-\n04\n3.14\n7    |',
              'lida\n4\n3.15\n    7|',
            ],
            correctIndex: 0,
            explanation:
              'Four mechanics at once. `code[:5]` takes indices 0-4: "lidar" — the stop index is excluded, so the hyphen never appears. `code[-2:]` starts two characters from the end: "04". `{3.14159:.2f}` rounds the display to "3.14" — the float itself is untouched, only the rendering changes. `{7:>5}` right-aligns the digit in a 5-character field, so four spaces precede the 7, and the literal | follows with no gap.',
            hint: 'Slice stops are excluded, and > pads on the left. Count the characters in the width field.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'bughunt',
            id: 'py-q-str-bug',
            prompt: 'This cleanup pass was supposed to strip the unit ID before printing — the trailing space is still there. Click the buggy line, then pick the root cause.',
            language: 'python',
            code: 'unit = "sensor-bay-3 "\nunit.strip()\nprint(unit + "|")',
            buggyLine: 2,
            causeOptions: [
              {
                id: 'a',
                text: 'Line 2 computes the stripped copy but never stores it — unit still refers to the original string with the trailing space',
              },
              { id: 'b', text: '.strip() only removes leading whitespace, never trailing whitespace' },
              { id: 'c', text: 'Strings longer than 10 characters cannot be modified; the call is silently ignored' },
              { id: 'd', text: 'The + on line 3 reattaches the whitespace that strip removed' },
            ],
            causeCorrectId: 'a',
            fixExplanation:
              '.strip() removes whitespace from both ends and returns a new string; unit keeps pointing at the original, so the print shows "sensor-bay-3 |". Capture the result — `unit = unit.strip()` — and the output becomes "sensor-bay-3|".',
            fixedCode: 'unit = "sensor-bay-3 "\nunit = unit.strip()\nprint(unit + "|")',
            explanation:
              'Immutability is what makes this bug look harmless: the method call did run, and its result was simply dropped. Every string method works this way — the new string goes wherever you put it, or nowhere. Option b describes a real-sounding rule that is false: strip cleans both ends; the trailing space survived for a different reason entirely.',
            hint: 'Watch the name on the left of the assignment that is missing.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'py-q-parse-fill',
            prompt: 'Parse the recovered fault line so the console prints exactly: fault: E-114',
            language: 'python',
            template:
              'raw = "  fault=E-114 bay=3 "\nclean = raw.{{b1}}()          # drop surrounding whitespace\nparts = clean.split(" ")     # -> ["fault=E-114", "bay=3"]\ncode = parts[0][{{b2}}:]     # keep everything after the "="\nprint(f"fault: {code}")',
            blanks: [
              { id: 'b1', accept: ['strip'], choices: ['strip', 'upper', 'replace'] },
              { id: 'b2', accept: ['6'], choices: ['6', '5', '-1'] },
            ],
            explanation:
              '`.strip()` removes the surrounding spaces, then `.split(" ")` breaks the line at the blank into two fields. The slice `[6:]` is the precision instrument: "fault=" is six characters (f-a-u-l-t-=), so index 6 is where "E" starts, and omitting the stop runs to the end of the field. `5` would leave "=E-114" behind, and `-1` would keep only the last character. Composed, the three lines read like a spec: clean, split, take what follows the equals sign.',
            hint: 'Count the characters in "fault=" — the slice must start exactly after them.',
          },
        },
      ],
    },
    {
      id: 'py-l6-comprehensions',
      title: 'Comprehensions & Unpacking',
      minutes: 6,
      xp: 45,
      narrative:
        'The report generator used to turn raw telemetry into per-robot summaries in four lines. Byte recovered the old loop-based version — forty lines of appends and counter juggling. There is a tighter spelling, and it is not merely style.',
      steps: [
        {
          kind: 'teach',
          heading: 'Comprehensions: transform and filter in one line',
          body:
            'A **list comprehension** builds a list from a sequence in one expression: `[r * 10 for r in readings]` scales every reading. Add an `if` to filter: `[r for r in readings if r > 80]` keeps only the hot ones. The reading order is fixed — expression first ("what each kept item becomes"), then `for`, then the optional filter — and the expression is evaluated only for items that pass the filter.\n\nA loop with `.append()` does the same job; the comprehension states the *intent* — "a list of X such that Y" — without the bookkeeping. **Dict comprehensions** follow the same pattern with braces: `{name: v for name, v in pairs}` builds a key-to-value mapping.',
          keyPoints: [
            '[expr for item in seq if cond] — transform, then filter',
            'The if filters items; the expression runs only for survivors',
            '{key: value for ...} builds dicts the same way',
          ],
        },
        {
          kind: 'teach',
          heading: 'Unpacking, enumerate and zip',
          body:
            'Python assigns whole sequences to several names at once: `low, high = (11.5, 12.6)` — **tuple unpacking**. It also works in loop headers: `for name, volts in rows:` unpacks each pair as it arrives, so the body uses real names instead of `row[0]` and `row[1]`.\n\nTwo built-ins remove the loops people write by accident. `enumerate(seq)` yields `(index, item)` pairs: `for i, t in enumerate(temps)` — a counter with no manual `i += 1`, and zero-based like everything else in Python. `zip(a, b)` walks two sequences in parallel, yielding paired elements until the shorter one ends: `zip(names, volts)` produces `(name, volts)` pairs ready for unpacking.',
          keyPoints: [
            'low, high = pair assigns by shape — works in loop headers too',
            'enumerate(seq) yields (index, item); no manual counter needed',
            'zip(a, b) pairs two sequences element by element',
          ],
        },
        {
          kind: 'teach',
          heading: 'Readability is the point',
          body:
            'Comprehensions are a readability tool that happens to be fast — not a speed trick to force everywhere. The sweet spot is one loop, one expression, at most one simple condition: a mapping, a filter, or both. `[f"{name}: {v:.1f}" for name, v in zip(names, volts) if v > 0]` still reads left to right like a sentence.\n\nPast that, they turn hostile. Nested comprehensions, an `if/else` inside the expression, or any **side effect** (writing files, mutating outside state) belongs in a named loop with real variable names. The rule this facility settled on: if a comprehension needs a comment to decode, write the loop instead.',
          keyPoints: [
            'One for, one expression, one simple condition: comprehension territory',
            'Side effects and nesting belong in named loops',
            'If it needs a comment to decode, write the loop',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'py-q-comp-predict',
            prompt: 'The rebuilt report script runs. What exactly does it print?',
            language: 'python',
            code:
              'temps = [12.0, 91.5, 45.2, 88.0, 3.3]\nhot = [t for t in temps if t > 80]\nprint(len(hot), hot[0])\n\nlabels = {f"j{i}": t for i, t in enumerate([4.1, 3.9])}\nprint(labels["j1"])',
            choices: ['2 [91.5, 88.0]\n3.9', '2 [91.5, 88.0]\n4.1', '2 [91.5, 88.0]\nj1'],
            correctIndex: 0,
            explanation:
              'The filter keeps 91.5 and 88.0, in order, so `len(hot)` is 2 and `hot[0]` is 91.5. In the dict comprehension, `enumerate` yields `(0, 4.1)` then `(1, 3.9)` — zero-based — and `f"j{i}"` turns the indices into keys `j0` and `j1`. The value stored under `"j1"` is the temperature 3.9; reading `labels["j1"]` looks up the key and returns its value, never the key itself.',
            hint: 'enumerate is zero-based, and a dict lookup returns the value stored under the key.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'py-q-comp-mcq',
            prompt: 'Code review: a teammate must clean 5,000 raw ID strings — strip whitespace, drop empties. Which version do you approve?',
            options: [
              { id: 'a', text: 'ids = [s.strip() for s in raw if s]' },
              { id: 'b', text: 'ids = [s for s in [t.strip() for t in raw] if s]' },
              { id: 'c', text: 'ids = [results.append(s.strip()) for s in raw if s]' },
              { id: 'd', text: 'ids = [print(s.strip()) for s in raw if s]' },
            ],
            correctId: 'a',
            optionNotes: {
              b: 'It produces the right list, but a comprehension nested inside a comprehension needs two passes and a mental stack to read — the exact case where a plain loop or restructuring wins.',
              c: '.append() returns None, so this builds a list of Nones while mutating results as a hidden side effect. The data flow is invisible at the line that matters.',
              d: 'print returns None: the result is a list of Nones and the values only ever reached the console. Comprehensions build values; they are not disguised loops.',
            },
            explanation:
              'The comprehension reads as a declaration — "stripped IDs, empties dropped" — in one line and one pass, which is precisely the shape comprehensions are designed for. The alternatives either bury a trivial task in nesting or abuse the syntax for side effects, which is where comprehensions earn their bad reputation. When the body grows beyond one expression, a named loop is the honest spelling.',
            hint: 'Ask what each element of the finished list will be — and whether the line still reads like a sentence.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'py-q-comp-order',
            prompt: 'Assemble the comprehension that formats every charged unit — lines like "heron @ 12.2V" for robots at 12.0 V or above.',
            items: [
              { id: '1', text: '[', note: 'Comprehensions open with the bracket that will hold the result.' },
              { id: '2', text: 'f"{name} @ {v:.1f}V"', note: 'Expression first: what each kept item becomes.' },
              { id: '3', text: 'for name, v in zip(names, volts)', note: 'The for clause supplies items, unpacking each pair.' },
              { id: '4', text: 'if v >= 12.0', note: 'Filter last: runs per item, before the expression.' },
              { id: '5', text: ']', note: 'Close it — the finished list is the value of the whole expression.' },
            ],
            explanation:
              'A comprehension reads in exactly this order: brackets, expression, for, optional if. Python walks the for clause, keeps only items passing the if, evaluates the expression for survivors, and collects the results into a new list. Rearranged into a loop it would be five lines of bookkeeping; declared, it is one sentence.',
            hint: 'What each item becomes comes before where the items come from; the filter trails both.',
          },
        },
      ],
    },
    {
      id: 'py-l7-modules',
      title: 'Modules & Imports',
      minutes: 6,
      xp: 45,
      narrative:
        'Bay 2\'s three copies of the voltage check are finally one function — but it lives inside calibrate.py, and the watchdog script in Bay 5 needs it too. Copy-paste is how the divergence started. There is a word for the fix: import.',
      steps: [
        {
          kind: 'teach',
          heading: 'A module is just a file',
          body:
            'Any `.py` file is a **module**: `battery.py` defines the module `battery`. One script gets another file\'s definitions with an **import**. Two spellings cover most needs: `import battery` loads the file and hands you the namespace — call `battery.cell_ok(3.7)` — while `from battery import cell_ok` pulls one name in directly, so the call site reads `cell_ok(3.7)`. The prefixed form makes it obvious where each function came from; the selective form keeps call sites short.\n\nImports are how three divergent copies of one check become one shared definition — and why a fix in `battery.py` repairs every script that imports it, in one place, on the next run.',
          keyPoints: [
            'Every .py file is a module; import it by its file name',
            'import battery uses battery.cell_ok(); from battery import cell_ok shortens call sites',
            'One shared definition replaces every divergent copy',
          ],
        },
        {
          kind: 'teach',
          heading: '__name__ and the import guard',
          body:
            'Every module carries a string variable `__name__`. Run a file directly — `python watchdog.py` — and Python sets `__name__` to `"__main__"`. Another script imports it instead, and `__name__` is the module\'s own name, `"watchdog"`.\n\nThe idiom `if __name__ == "__main__":` uses that fact: the indented block runs only when the file is executed directly, never on import. Module-level code — every line outside functions and this guard — **does run on import**, so anything with side effects belongs under the guard: self-tests, the harvest loop, the arm-homing sequence. That is what makes a script **importable**: importing it loads useful definitions and does nothing else.',
          keyPoints: [
            '__name__ is "__main__" when run directly, the module name when imported',
            'if __name__ == "__main__": runs only on direct execution',
            'Module-level code runs on import — keep side effects under the guard',
          ],
        },
        {
          kind: 'byte',
          text: 'Recovered from Bay 2: a calibration module that homed the physical arm at import time. Every script that merely borrowed a helper sent the arm to its home position. The guard exists so that importing is always safe.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'py-q-module-side-effect',
            prompt:
              'watchdog.py starts a 30-minute sensor harvest at module top level, with its helper functions defined below. A teammate wants to reuse one helper in a quick analysis script and writes `import watchdog`. What happens?',
            options: [
              { id: 'a', text: 'Nothing runs until the analysis script calls a watchdog function' },
              { id: 'b', text: 'The harvest starts immediately: module-level code executes on import, before any function is called' },
              { id: 'c', text: 'Python refuses the import because watchdog.py was written to be run directly' },
              { id: 'd', text: 'The import copies the file, so the harvest runs in a separate copy that never starts' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Only code under the guard or inside functions waits for a call. Top-level statements run during the import itself.',
              c: 'Python imports any file it finds; nothing marks a file as "run-only". The guard idiom is the convention that creates that separation.',
              d: 'Importing does not copy files — it executes the module once and caches it. The harvest runs right here, right now.',
            },
            explanation:
              'Importing a module **executes** it: definitions are created, and any top-level statements run — including a 30-minute harvest nobody asked for. The fix is structural, not cosmetic: move everything with side effects under `if __name__ == "__main__":`, leaving only definitions at module level. Then `import watchdog` is instant and harmless, and the harvest happens only when someone runs the file directly.',
            hint: 'What has Python already done by the time the import statement finishes?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'py-q-module-predict',
            prompt: 'An analysis notebook runs `import watchdog`. What appears on the console?',
            language: 'python',
            code:
              '# watchdog.py\nprint("watchdog loaded")\n\ndef cell_ok(v):\n    return v > 3.5\n\nif __name__ == "__main__":\n    print("self-test: pass")',
            choices: ['watchdog loaded', 'watchdog loaded\nself-test: pass', 'self-test: pass', 'nothing — imports never print'],
            correctIndex: 0,
            explanation:
              'Importing executes the module top to bottom: `print("watchdog loaded")` is module-level code, so it runs. The guard compares `__name__` — which is `"watchdog"` here, not `"__main__"` — so the self-test block is skipped. The wrong answers are the two halves of the lesson: the guard\'s block never runs on import, and module-level code always does. In a well-built module the only top-level statements are definitions — and imports of other modules.',
            hint: '__name__ is not "__main__" during an import — but what about the print above the guard?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'py-q-module-fill',
            prompt: 'Give calibrate.py a self-test that runs only when the file is executed directly.',
            language: 'python',
            template:
              'def pack_ok(v):\n    return 11.5 <= v <= 12.6\n\n# reusable definitions above — behavior below\nif {{b1}} == "{{b2}}":\n    print("self-test:", pack_ok(12.4))',
            blanks: [
              { id: 'b1', accept: ['__name__'], choices: ['__name__', 'name', 'module'] },
              { id: 'b2', accept: ['__main__'], choices: ['__main__', 'main', 'calibrate'] },
            ],
            explanation:
              'The guard reads `__name__` — the double-underscore "dunder" variable Python sets per module — and compares it to the literal `"__main__"`, which holds only under direct execution: `python calibrate.py` prints the self-test line, while `import calibrate` defines `pack_ok` silently. Write `__name__` and `__main__` exactly — double underscores on both sides of each — and keep the reusable definitions above the guard so every importer gets them.',
            hint: 'Both blanks are dunder strings Python defines for you — double underscores on both sides.',
          },
        },
      ],
    },
  ],
  flashcards: [
    {
      id: 'fc-py-1',
      categoryId: 'python',
      concept: 'Variables & dynamic typing',
      explanation:
        'Assignment binds a name to a value; the type lives on the value, not the name. The same name can be rebound to a different type at any time.',
      example: 'x = 6 then x = "six" is legal — Python re-binds without complaint.',
      misconception:
        'Dynamic does not mean sloppy about operations: "6" + 1 still raises TypeError. Python never silently converts between types.',
      application:
        'Makes quick instrumentation scripts fast to write — and means you track types mentally in data pipelines where one wrong assumption corrupts a whole dataset.',
      difficulty: 1,
    },
    {
      id: 'fc-py-2',
      categoryId: 'python',
      concept: 'List vs tuple',
      explanation:
        'Both are ordered sequences indexed from 0. Lists are mutable (append, reorder, reassign); tuples are immutable — a fixed record that cannot change after creation.',
      example: 'waypoints = [(0.0, 0.0), (1.5, 2.0)] — a list of tuple records.',
      misconception:
        'A tuple is not just a "constant list": it declares fixed shape and can be used where mutable data cannot, such as dict keys.',
      application:
        'Returning (min, max) or (x, y, z) from a function signals "these belong together and will not be reordered" — self-documenting interfaces.',
      difficulty: 1,
    },
    {
      id: 'fc-py-3',
      categoryId: 'python',
      concept: 'Dictionary',
      explanation:
        'A dict maps unique, immutable keys to values with fast label-based lookup: d[key]. Insert or overwrite by assignment.',
      example: 'units = {"r-04": "2.3.1", "r-07": "2.4.0"} then units["r-04"].',
      misconception:
        'Reading a missing key raises KeyError — it does not return None or 0. Use d.get(key, default) when absence should be ordinary.',
      application:
        'Per-robot state, parsed config files, and any JSON payload — virtually every API you integrate with arrives as nested dicts.',
      difficulty: 1,
    },
    {
      id: 'fc-py-4',
      categoryId: 'python',
      concept: 'Set',
      explanation:
        'An unordered collection of unique elements. Constructing a set from a list removes duplicates; membership tests with in are fast even at large sizes.',
      example: 'set([1, 2, 2, 3]) gives {1, 2, 3}; len(set(logs)) counts distinct robots.',
      misconception:
        'Sets are unordered — unique[0] is invalid. If order matters, sort afterwards: sorted(unique_ids).',
      application:
        'Deduplicating sensor IDs, comparing "which units reported in today vs yesterday" with set difference, fast seen-before checks.',
      difficulty: 2,
    },
    {
      id: 'fc-py-5',
      categoryId: 'python',
      concept: 'f-strings',
      explanation:
        'Prefix a string with f to embed expressions in braces: f"{name}: {value:.2f}". Anything Python can evaluate can go inside the braces, and format specs control rendering.',
      example: 'f"{temp_c:.1f}" turns 71.46231 into "71.5".',
      misconception:
        'Without the f prefix, braces are literal text: "{temp_c}" prints as-is. The prefix is part of the syntax, not a style choice.',
      application:
        'Log lines, fault messages, and console diagnostics — the cheapest way to make a script explain itself while it runs.',
      difficulty: 1,
    },
    {
      id: 'fc-py-6',
      categoryId: 'python',
      concept: 'for loops and range',
      explanation:
        'for visits each item of a sequence; range(n) produces 0 to n-1, range(start, stop, step) generalizes it. The stop value is always excluded.',
      example: 'for angle in range(0, 180, 10): sweeps 18 positions.',
      misconception:
        'range is lazy: range(1_000_000_000) costs no memory — it is a counter, not a list. And it never yields its stop value.',
      application:
        'Scan sweeps, retry counters, batch indices — anywhere you need "do this N times" or "step through these offsets".',
      difficulty: 1,
    },
    {
      id: 'fc-py-7',
      categoryId: 'python',
      concept: 'String slicing [a:b:step]',
      explanation:
        'Extracts a sub-sequence: start included, stop excluded, optional step. Omitted bounds run to the ends ([:5], [6:], [:]); a negative step walks backwards, and [::-1] reverses.',
      example: '"lidar-04"[:5] is "lidar"; "lidar-04"[-2:] is "04"; "bay-3"[::-1] is "3-yab".',
      misconception:
        'Out-of-range slices truncate silently instead of raising — the opposite of single indexing, where serial[99] raises IndexError. Safe slicing still deserves bounds checks when the slice is semantically required.',
      application:
        'Parsing fixed-width sensor IDs, log prefixes, and telemetry fields without importing anything — the standard text-surgery tool in instrumentation scripts.',
      difficulty: 2,
    },
    {
      id: 'fc-py-8',
      categoryId: 'python',
      concept: 'Comprehension readability',
      explanation:
        'A comprehension states map-and-filter as one declarative expression — best for one loop, one expression, at most one simple condition. Nesting, if/else in the expression, or side effects belong in a named loop.',
      example: 'active = [r for r in readings if r.ok] reads as a sentence; a triple-nested comprehension does not.',
      misconception:
        'Comprehensions are not automatically "better Python" — abuse for side effects or cleverness produces lists of Nones and unreadable one-liners. Readability, not line count, is the metric.',
      application:
        'Data-cleaning pipelines in telemetry scripts: strip, filter, and repackage sensor logs in one reviewable line — and hand anything larger to a named function.',
      difficulty: 2,
    },
    {
      id: 'fc-py-9',
      categoryId: 'python',
      concept: 'Module & import',
      explanation:
        'A module is any .py file; importing it loads and executes the file once. import battery keeps the battery. prefix at call sites; from battery import cell_ok pulls one name in directly. Module-level code runs at import time — the guard if __name__ == "__main__": runs only when the file is executed directly.',
      example: 'import battery, then battery.cell_ok(3.7) — one shared definition instead of three divergent copies across scripts.',
      misconception:
        'Importing is not lazy reading of definitions — the whole file executes top to bottom on first import, which is exactly why side effects must live under if __name__ == "__main__":.',
      application:
        'Shared helpers (checks, parsers, config readers) live in modules and get imported everywhere; the guard lets each file double as a runnable script with a self-test.',
      difficulty: 2,
    },
  ],
};
