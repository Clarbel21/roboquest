import type { Category } from '../engine/types';

// SQL & the Maintenance Archive — content module.
// Ten years of telemetry survive behind an interface nobody remembers how to speak.

export const sqlCategory: Category = {
  id: 'sql',
  name: 'SQL',
  tagline: 'Ask ten years of telemetry a question; get one table back',
  icon: '🗄️',
  description:
    'The maintenance archive — every robot, every log entry since Cycle 1 — survived intact behind a SQL interface nobody remembers how to speak. Restore query access and the facility gets its memory back.',
  accent: 'emerald',
  lessons: [
    {
      id: 'sql-l1-select',
      title: 'SELECT: Reading the Archive',
      minutes: 5,
      xp: 35,
      narrative:
        'The archive terminal wakes to a blinking cursor. Four tables, ten years of telemetry: robots, maintenance_logs, missions, parts. Byte projects the schema onto the wall. Query language first.',
      steps: [
        {
          kind: 'teach',
          heading: 'Tables and the SELECT sentence',
          body:
            'Everything in the archive lives in **tables**: rows are records, columns are typed fields. The `robots` table holds one row per unit — `id`, `model`, `bay`, `battery_kwh`. SQL reads like an English sentence: `SELECT model, bay FROM robots;` returns those two columns for every row. `SELECT *` means all columns — fine for exploring, wasteful in real queries, because schemas grow and `*` drags every column across the wire.\n\nClauses must appear in a fixed order the database enforces, and every statement ends with a semicolon.',
          keyPoints: [
            'Rows are records; columns are typed fields',
            'SELECT cols FROM table — name the columns you actually want',
            '* pulls every column: fine to explore, avoid in production queries',
          ],
        },
        {
          kind: 'teach',
          heading: 'Filtering: WHERE, ORDER BY, LIMIT',
          body:
            '`WHERE` keeps only rows matching a condition: `WHERE battery_kwh < 2.0`. Combine conditions with `AND` / `OR` and compare with `=`, `<>`, `<`, `>`. `ORDER BY battery_kwh DESC` sorts the surviving rows before returning them — append `ASC` or `DESC`, and list several keys to break ties (`ORDER BY bay, model`). `LIMIT 5` caps the result size.\n\nTogether the trio answers "the five most depleted robots in Bay 3" in one line. Mental execution order: FROM gathers rows, WHERE filters, SELECT projects columns, ORDER BY sorts, LIMIT trims — which is also why a WHERE condition refers to real columns, not aliases you invented in SELECT.',
          keyPoints: [
            'WHERE filters rows before anything else happens',
            'ORDER BY sorts; ASC is the default, multiple keys break ties',
            'LIMIT caps output — put it on every exploratory query',
          ],
        },
        {
          kind: 'byte',
          text: 'The archive\'s most-repeated cached query: SELECT model FROM robots WHERE bay = 3 — executed 11,406 times in one shift. Someone was debugging by inspection. A LIMIT would have saved them the afternoon.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'sql-q-clause-order',
            prompt: 'Order the clauses of one well-formed query: the five most power-depleted robots, newest firmware first.',
            items: [
              { id: '1', text: 'SELECT model, firmware', note: 'Name the columns you actually want.' },
              { id: '2', text: 'FROM robots', note: 'The table the rows come from.' },
              { id: '3', text: 'WHERE battery_kwh < 2.0', note: 'Filter rows early, before any sorting.' },
              { id: '4', text: 'ORDER BY firmware DESC', note: 'Sort the rows that survived the filter.' },
              { id: '5', text: 'LIMIT 5', note: 'Trim the finished result to five rows.' },
            ],
            explanation:
              'SQL clauses must appear in exactly this order: SELECT, FROM, WHERE, ORDER BY, LIMIT. Conceptually the engine runs FROM first (gather rows), then WHERE (filter), then SELECT (project), then ORDER BY, then LIMIT — you write it in reading order and the engine handles execution order. Filter before you sort; sort before you trim.',
            hint: 'Filter before you sort; sort before you trim.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'sql-q-where',
            prompt: 'Find every robot in Bay 7 whose battery is below 2.0 kWh, most depleted first — return only model and battery_kwh.',
            language: 'sql',
            template:
              'SELECT model, battery_kwh\nFROM robots\n{{b1}} bay = 7 {{b2}} battery_kwh < 2.0\nORDER BY battery_kwh {{b3}};',
            blanks: [
              { id: 'b1', accept: ['where'], choices: ['WHERE', 'HAVING', 'WITH'] },
              { id: 'b2', accept: ['and'], choices: ['AND', 'OR', 'BUT'] },
              { id: 'b3', accept: ['asc'], choices: ['ASC', 'DESC'] },
            ],
            explanation:
              '`WHERE` keeps rows meeting both conditions; `AND` requires both — `OR` would return any low-battery robot in any bay plus any Bay 7 robot regardless of charge. `ORDER BY battery_kwh ASC` puts the smallest values first, and ascending is the default direction, so the keyword may even be omitted. "Most depleted first" means smallest battery first.',
            hint: 'Both conditions must hold at once — and most-depleted-first means the smallest battery_kwh on top.',
          },
        },
      ],
    },
    {
      id: 'sql-l2-agg',
      title: 'Aggregates: COUNT, GROUP BY, HAVING',
      minutes: 6,
      xp: 40,
      narrative:
        'The morning report used to compile itself: failures per model, stock per kind, downtime per bay. The report engine is dead; the questions remain. Aggregates are how one table becomes one answer.',
      steps: [
        {
          kind: 'teach',
          heading: 'Aggregate functions',
          body:
            'An **aggregate** collapses many rows into one value. `COUNT(*)` counts rows; `SUM(battery_kwh)` totals a column; `AVG`, `MIN`, `MAX` do the obvious. `SELECT COUNT(*) FROM maintenance_logs WHERE robot_id = 7;` answers "how many service entries does robot 7 have?" in one line — no loop, no spreadsheet.\n\nTwo grammar rules: aggregates skip NULLs in their arguments (`AVG` divides only by non-NULL values), and you cannot mix a bare column with an aggregate — `SELECT model, COUNT(*)` with no `GROUP BY` is an error, which is precisely what the next section fixes.',
          keyPoints: [
            'Aggregates collapse many rows into one value',
            'COUNT(*), SUM, AVG, MIN, MAX cover most reports',
            'NULLs are skipped by SUM/AVG/MIN/MAX — they are not zeros',
          ],
        },
        {
          kind: 'teach',
          heading: 'GROUP BY and HAVING',
          body:
            '`GROUP BY` splits rows into buckets and aggregates per bucket: `SELECT bay, COUNT(*) FROM robots GROUP BY bay;` yields one row per bay with its robot count. The governing rule: every column in the SELECT must be either grouped or aggregated — that is the grammar of every summary you will ever write.\n\n`HAVING` filters **groups** the way WHERE filters rows: `GROUP BY model HAVING COUNT(*) > 5` keeps only models with more than five units. The stages differ: WHERE runs on raw rows before grouping, HAVING on groups after. Filtering a robot by bay? WHERE. Keeping only crowded buckets? HAVING.',
          keyPoints: [
            'GROUP BY: one output row per bucket, aggregates per bucket',
            'Every SELECT column must be grouped or aggregated',
            'HAVING filters groups; WHERE filters rows — and runs first',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'sql-q-groupby',
            prompt: 'The parts table holds this data. What result rows does the stock report return, in order?',
            language: 'sql',
            code:
              '-- parts:  id | kind    | qty\n--          1 | servo   | 12\n--          2 | servo   |  8\n--          3 | battery | 30\n--          4 | lidar   |  4\n\nSELECT kind, COUNT(*) AS n, SUM(qty) AS total\nFROM parts\nGROUP BY kind\nORDER BY n DESC, kind;',
            choices: [
              'servo | 2 | 54\nbattery | 1 | 54\nlidar | 1 | 54',
              'battery | 1 | 30\nlidar | 1 | 4\nservo | 2 | 20',
              'servo | 2 | 20\nbattery | 1 | 30\nlidar | 1 | 4',
            ],
            correctIndex: 2,
            explanation:
              'GROUP BY kind builds one bucket per distinct kind. COUNT(*) counts rows in the bucket (servo has 2), and SUM(qty) adds only that bucket\'s qty values: 12 + 8 = 20 — the "54 everywhere" variant forgets the buckets and sums the whole table for each row. Then two sort keys apply: n descending puts servo first, and the n = 1 tie between battery and lidar falls to the second key, kind, alphabetically.',
            hint: 'Each bucket aggregates only its own rows — then apply the two sort keys in order.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'sql-q-having',
            prompt: 'Report: bays with more than 10 robots, counting only robots whose status is active. Which query is correct?',
            options: [
              {
                id: 'a',
                text: "SELECT bay, COUNT(*) FROM robots WHERE COUNT(*) > 10 AND status = 'active' GROUP BY bay;",
              },
              {
                id: 'b',
                text: "SELECT bay, COUNT(*) FROM robots WHERE status = 'active' GROUP BY bay HAVING COUNT(*) > 10;",
              },
              {
                id: 'c',
                text: "SELECT bay, COUNT(*) FROM robots GROUP BY bay WHERE status = 'active' HAVING COUNT(*) > 10;",
              },
              { id: 'd', text: "SELECT bay FROM robots WHERE status = 'active' HAVING COUNT(*) > 10;" },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'WHERE cannot contain aggregates: it runs before any groups exist, so there is no COUNT(*) to compare against yet.',
              c: 'Clause order is fixed — WHERE must precede GROUP BY. The database rejects this query outright, no matter how sensible it reads.',
              d: 'Without GROUP BY the whole table is one group, so selecting a bare bay column is incoherent, and no per-bay filter is possible.',
            },
            explanation:
              'Two filters, two different stages. Row filtering by `status` happens in WHERE, before the buckets are built; group filtering by count happens in HAVING, after. If you keep one sentence: WHERE decides which rows enter the buckets, HAVING decides which buckets survive into the result.',
            hint: 'status is a property of a single row; "more than 10" is a property of a whole group.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'sql-q-having-fill',
            prompt: 'Models with more than 3 units in service, each with its average battery capacity.',
            language: 'sql',
            template:
              'SELECT model, {{b1}}(battery_kwh) AS avg_kwh\nFROM robots\nGROUP {{b2}} model\n{{b3}} COUNT(*) > 3;',
            blanks: [
              { id: 'b1', accept: ['avg'], choices: ['AVG', 'SUM', 'COUNT'] },
              { id: 'b2', accept: ['by'], choices: ['BY', 'ON', 'WITH'] },
              { id: 'b3', accept: ['having'], choices: ['HAVING', 'WHERE', 'FILTER'] },
            ],
            explanation:
              'The average is an aggregate over each model\'s rows, so AVG pairs with GROUP BY model — SUM would add capacities (a number nobody asked for) and COUNT would count non-NULL batteries. The "> 3 units" condition is about the group, not any single row, so it belongs in HAVING; a WHERE COUNT(*) here fails because rows are already being grouped and a lone row has no count.',
            hint: 'Which clause runs after the buckets are built?',
          },
        },
      ],
    },
    {
      id: 'sql-l3-join',
      title: 'JOIN: Robots Meet Their Logs',
      minutes: 6,
      xp: 45,
      narrative:
        'The log table knows what failed; the robots table knows where the robot lives. Neither is useful alone. One key column connects them — if you ask correctly.',
      steps: [
        {
          kind: 'teach',
          heading: 'Keys: primary and foreign',
          body:
            'Every table deserves a **primary key**: a column (or combination) that uniquely identifies each row — `robots.id`, typically auto-numbered. It is the row\'s address: no duplicates, no NULLs.\n\nA **foreign key** is a column that stores another table\'s primary key. Each `maintenance_logs` row carries `robot_id` pointing at the robot it describes. That one column is the thread stitching the archive together: "log 4482 belongs to robot 7" is stored, enforced, and queryable. Related data lives in separate tables and recombines on demand — normalize first, join when you ask.',
          keyPoints: [
            'Primary key: unique, never-NULL identity of a row',
            'Foreign key: a column holding another table\'s primary key',
            'Relationships are columns, not copied data — that is the relational idea',
          ],
        },
        {
          kind: 'teach',
          heading: 'INNER JOIN mechanics',
          body:
            '`INNER JOIN` pairs each row of one table with the rows of the other where the join condition holds: `FROM robots INNER JOIN maintenance_logs ON robots.id = maintenance_logs.robot_id`. The ON clause is the match rule — usually foreign key = primary key. A robot with 14 log entries appears 14 times, once per match; that repetition is normal and expected.\n\n**Inner** means unmatched rows vanish: a robot with no logs contributes nothing, and (with a proper foreign key) no log dangles without a robot. When you need every robot even if it has no logs, that is LEFT JOIN — file under later. For now: inner joins answer "show me the events, with each event\'s robot attached".',
          keyPoints: [
            'ON robots.id = logs.robot_id is the match rule',
            'One robot with N logs produces N rows after the join',
            'INNER JOIN drops non-matching rows on either side',
          ],
        },
        {
          kind: 'byte',
          text: 'Log entry 1 reads: "facility commissioned, all robots nominal." Entry 2, same night: "redefine nominal." Ten years of stories in one table — joins are how you get the robots\' names attached to them.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'sql-q-join-predict',
            prompt: 'Two small tables. What does the join return?',
            language: 'sql',
            code:
              '-- robots            -- maintenance_logs\n-- id | model         -- robot_id | action\n--  1 | HERON-2       --     2 | recalibrate\n--  2 | CRANE-9       --     2 | battery_swap\n--  3 | TIDE-1        --     9 | firmware\n\nSELECT r.model, l.action\nFROM robots r\nINNER JOIN maintenance_logs l\n    ON r.id = l.robot_id;',
            choices: [
              '2 rows: (CRANE-9, recalibrate) and (CRANE-9, battery_swap)',
              '9 rows: every robot paired with every log row',
              '3 rows: every robot appears once; the log for robot 9 is dropped',
            ],
            correctIndex: 0,
            explanation:
              'The ON rule pairs a robot row with a log row exactly when robots.id = logs.robot_id. CRANE-9 (id 2) matches two logs, so it produces two result rows. HERON-2 and TIDE-1 have no logs at all, so they vanish — INNER JOIN keeps only matches. The log pointing at robot 9 has no robot to meet, so it vanishes too. Nine candidate pairs entered; two survived the ON condition.',
            hint: 'For each log row, find the robot whose id equals its robot_id — if there is none, the row is gone.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'sql-q-join-missing',
            prompt: 'A colleague asks why HERON-2 (id 1, zero log entries) is missing from the join result. Correct answer?',
            options: [
              { id: 'a', text: 'Its id matched no robot_id, and INNER JOIN keeps only matching pairs — the row has no partner to appear with' },
              { id: 'b', text: 'It became a NULL row, and NULLs are filtered from results by default' },
              { id: 'c', text: 'The join failed for that one row; the query should be re-run' },
              { id: 'd', text: 'It is in the result but with an empty action — look again' },
            ],
            correctId: 'a',
            optionNotes: {
              b: 'No NULL is involved here: the robot row simply found no partner. INNER JOIN never outputs an unmatched row in any form.',
              c: 'Nothing failed. The result is exactly correct for an INNER JOIN; wanting the robot anyway calls for a different join, not a retry.',
              d: 'That is precisely what does not happen — padding every robot with a NULL-action row is LEFT JOIN behavior, not INNER.',
            },
            explanation:
              'INNER JOIN is defined by intersection: only rows with a match on the other side survive. HERON-2 has no log whose robot_id equals 1, so it produces zero output rows — correct behavior, not a glitch. When the requirement becomes "every robot, with logs if any exist", switch to LEFT JOIN, which preserves the left table and fills missing matches with NULL.',
            hint: 'What does INNER mean in "INNER JOIN"?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'sql-q-join-fill',
            prompt: 'List every recalibration with its robot\'s model and bay, newest first.',
            language: 'sql',
            template:
              "SELECT r.model, r.bay, l.action, l.done_at\nFROM robots r\n{{b1}} JOIN maintenance_logs l\n    ON r.{{b2}} = l.{{b3}}\nWHERE l.action = 'recalibrate'\nORDER BY l.done_at DESC;",
            blanks: [
              { id: 'b1', accept: ['inner'], choices: ['INNER', 'CROSS', 'OUTER'] },
              { id: 'b2', accept: ['id'], choices: ['id', 'model', 'bay'] },
              { id: 'b3', accept: ['robot_id'], choices: ['robot_id', 'id', 'log_id'] },
            ],
            explanation:
              'The ON clause states the relationship in one comparison: the robot table\'s primary key (`r.id`) equals the log\'s foreign key (`l.robot_id`). Direction matters — `r.robot_id` does not even exist as a column. INNER is technically optional (a bare JOIN means inner), but writing it keeps the intent readable. The WHERE runs on the joined rows, and ORDER BY sorts the final result newest-first.',
            hint: 'Which side owns the primary key, and which side carries the foreign key?',
          },
        },
      ],
    },
    {
      id: 'sql-l4-design',
      title: 'Tables, Keys & Relationships',
      minutes: 6,
      xp: 40,
      narrative:
        'The Data Vault accepts your queries, but someone must decide what the tables mean. Rebuild the schema discipline that keeps a lab database from decaying into thirty ambiguous spreadsheets.',
      steps: [
        {
          kind: 'teach',
          heading: 'Primary keys: every row gets an address',
          body:
            'A **primary key** is a column (or pair of columns) that uniquely names a row — no duplicates, no NULLs, ideally never changing. `robots.id` is a classic: serial numbers work; "the robot named Bob" does not, because names change and collide.\n\nWhy insist? Because every meaningful operation points at rows: "update *that* robot", "all logs *for that* machine", "join repairs to robots". Without stable addresses, those sentences have no meaning. Databases can auto-assign a plain integer (a *surrogate* key) precisely so you never have to invent clever identifiers that age badly.',
          keyPoints: [
            'Primary key: unique, never NULL, never changes',
            'Prefer meaningless stable IDs over "clever" natural keys',
            'Every FK relationship, update, and join depends on it',
          ],
        },
        {
          kind: 'byte',
          text: 'The Data Vault still remembers "spreadsheet era": one cell held "weld; paint; inspect; (add more below)". The archivist has been rebuild-free for two years now, and mentions it constantly.',
        },
        {
          kind: 'teach',
          heading: 'Foreign keys & no repeating groups',
          body:
            'A **foreign key** is a column that references another table\'s primary key — `maintenance_logs.robot_id` pointing at `robots.id`. That single declaration is what makes JOINs trustworthy: the database enforces that every log really belongs to some robot, so a join can never invent ghost pairings. One robot, many logs: the classic **one-to-many** shape behind most schemas you will meet.\n\nThe other commandment: never store multiple values in one cell. A `robots.services` column holding `"weld;paint;inspect"` cannot be filtered, counted, or joined — it is a spreadsheet wearing a database costume. Instead, one row per (robot, service) — either as its own table or as a proper child table. That idea, in escalating formality, is what **normalization** means.',
          keyPoints: [
            'Foreign key = enforced reference to another table\'s primary key',
            'One-to-many is the workhorse shape of relational schemas',
            'One fact per cell; repeating groups become child tables',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'sql-q-pk-choice',
            prompt: 'Designing a `machines` table for the assembly line. Which column should be the primary key?',
            options: [
              { id: 'a', text: 'serial_no — the engraved, unique, never-changed manufacturer serial' },
              { id: 'b', text: 'nickname — "Big Bertha" is unique on this line, probably forever' },
              { id: 'c', text: 'bay_location — one machine per bay, for now' },
              { id: 'd', text: 'No key needed — the row order in the table identifies machines' },
            ],
            correctId: 'a',
            optionNotes: {
              b: 'Nicknames change ("Big Bertha" becomes "No Longer Big"), get reused, and go NULL when nobody can agree. A key that humans control is a key humans will break.',
              c: 'Bays get reorganized and machines move for maintenance — location is an attribute stored in a normal column, not an identity.',
              d: 'SQL tables have no guaranteed row order. Without a key, "update that machine" has no meaning and JOINs have nothing to anchor on.',
            },
            explanation:
              'A key must be **unique, non-null, and stable** — properties the serial number has by construction, and nicknames and bays have only by hope. When nothing natural qualifies, add an auto-incrementing id. The database (and every future JOIN) builds on whatever you pick, so pick the thing that cannot drift.',
            hint: 'Which property survives a reorganization of the factory floor?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'sql-q-repeating',
            prompt: 'A `robots` table has a column `inspections` containing "2026-01-12; 2026-03-04; 2026-06-21". What is the strongest criticism?',
            options: [
              { id: 'a', text: 'Dates should be stored as text; semicolons are fine' },
              { id: 'b', text: 'A repeating group in one cell: you cannot filter, count, or join on individual inspections — promote them to a child table with one row per inspection' },
              { id: 'c', text: 'Nothing wrong — JSON-in-a-column is the modern style' },
              { id: 'd', text: 'The column just needs a better name, like inspection_history' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'The separator is the smallest problem. Even as ISO dates, three facts share one cell, and SQL has no way to ask "which robots were inspected in March?".',
              c: 'Some databases do offer JSON columns for genuinely semi-structured data — but a list of events you will filter, count, and join on is classic tabular data, and this is not that.',
              d: 'Renaming changes what the tangle is called, not what it does. The failure is structural: one cell, many facts.',
            },
            explanation:
              'One cell, one fact. As soon as facts are packed into a delimited string, every SQL strength dies: `WHERE`, `COUNT`, `GROUP BY`, and `JOIN` all operate on rows and columns, not on substrings. The fix is the standard **one-to-many** move: an `inspections` table with `(robot_id, inspection_date)` and a foreign key back to `robots` — after which "inspections per robot per quarter" is a two-line query.',
            hint: 'How would you count March inspections for one bay with this schema? What would the query look like with a child table?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'sql-q-design-order',
            prompt: 'Order the schema design steps for a maintenance-tracking database.',
            items: [
              { id: '1', text: 'List the entities: machines, technicians, maintenance events', note: 'Nouns first — tables come from things, not from reports.' },
              { id: '2', text: 'Choose a primary key for each table', note: 'Every row needs a permanent address.' },
              { id: '3', text: 'Add foreign keys for the relationships (events reference machines and technicians)', note: 'One-to-many: one machine, many events.' },
              { id: '4', text: 'Move any repeating groups into child tables', note: 'One fact per cell — lists become tables.' },
              { id: '5', text: 'Add constraints (NOT NULL, unique, value ranges)', note: 'Let the database enforce what "valid" means.' },
            ],
            explanation:
              'Design flows from nouns to rules: entities, then identity (keys), then relationships (foreign keys), then shape (no repeating groups), then enforcement (constraints). A schema built this way answers new questions with a JOIN instead of a migration — that flexibility is the entire return on the upfront thinking.',
            hint: 'You cannot relate rows that have no identity, and you cannot enforce validity on a shape that is still changing.',
          },
        },
      ],
    },
    {
      id: 'sql-l5-nulls',
      title: 'Working with NULL',
      minutes: 5,
      xp: 40,
      narrative:
        'A monthly report just claimed the average robot ran "0 km" — for robots that never reported mileage at all. The Data Vault requests a specialist: someone who understands the difference between zero and unknown.',
      steps: [
        {
          kind: 'teach',
          heading: 'NULL is unknown, not zero',
          body:
            '**NULL** means "no value here" — the reading never arrived, the field was never filled, the date has not happened yet. It is not 0, not an empty string, and not false. It is a dedicated marker for *absence*.\n\nThe consequence is famous: any comparison with NULL — `mileage = NULL`, `mileage > 0`, even `NULL = NULL` — evaluates to *unknown*, and `WHERE` only keeps rows that are plainly true. So `WHERE mileage = NULL` returns nothing, ever. The only way to find missing values is the dedicated test: `WHERE mileage IS NULL`.',
          keyPoints: [
            'NULL = absent/unknown; 0 and "" are real values',
            'Comparisons with NULL are unknown, and unknown is not true',
            'Find missing values with IS NULL / IS NOT NULL',
          ],
        },
        {
          kind: 'teach',
          heading: 'Aggregates quietly skip NULLs',
          body:
            '`AVG(mileage)` ignores NULL rows entirely — it averages only the robots that reported. That is usually what you want, but it produces exactly the "0 km average" style trap in reverse: a report can silently describe 3 robots while the fleet has 30. `COUNT(*)` counts rows; `COUNT(mileage)` counts only non-NULL mileages — comparing the two is the quickest NULL census in any table.\n\nWhen absence should *mean* something in output, say it out loud with **COALESCE**: `COALESCE(nickname, "unnamed")` returns the first non-NULL argument, giving defaults at read time without polluting stored data.',
          keyPoints: [
            'AVG/SUM/MAX skip NULL rows — averages can silently shrink',
            'COUNT(*) vs COUNT(col) measures how much is missing',
            'COALESCE(col, default) supplies read-time defaults',
          ],
        },
        {
          kind: 'byte',
          text: 'Report incident 88: "robots_offline = NULL" was read by one engineer as "none offline", by another as "unknown", and by a third as the literal text NULL. The resulting meeting is why this lesson exists.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'sql-q-null-count',
            prompt: 'One table, four rows. What does this query return?',
            language: 'sql',
            code: '-- inspections\n-- id | robot_id | notes\n--  1 | 7        | "gear hum"\n--  2 | 7        | NULL\n--  3 | 9        | "ok"\n--  4 | 11       | "worn belt"\n\nSELECT COUNT(*), COUNT(notes) FROM inspections;',
            choices: ['4 and 4', '4 and 3', '3 and 3', '4 and 1'],
            correctIndex: 1,
            explanation:
              '`COUNT(*)` counts **rows** — all four. `COUNT(notes)` counts **non-NULL values in that column** — row 2 contributes nothing, so 3. Put together, the pair tells you instantly that one inspection has no notes: this is the fastest missing-data census in SQL, and the difference between the two counts is exactly the number of absent values.',
            hint: 'Does COUNT(notes) count rows, or values that exist?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'sql-q-coalesce',
            prompt: 'The dashboard must show a nickname for every robot, using "unnamed" when none was ever set.',
            language: 'sql',
            template: "SELECT robot_id, {{b1}}(nickname, 'unnamed') AS display_name\nFROM robots\nWHERE retired_at {{b2}} NULL;",
            blanks: [
              { id: 'b1', accept: ['coalesce'], choices: ['COALESCE', 'REPLACE', 'NULLIF'] },
              { id: 'b2', accept: ['is'], choices: ['IS', '=', '!='] },
            ],
            explanation:
              '`COALESCE(nickname, \'unnamed\')` returns the nickname when it exists and the default when it is NULL — the standard read-time default. The filter uses `IS NULL` because `retired_at = NULL` is a comparison against unknown: it is never true, and the report would silently list nobody. `NULLIF(a, b)` is the near-inverse (NULL when a equals b) and `REPLACE` edits strings — neither substitutes defaults.',
            hint: 'First blank: which function returns its first non-NULL argument? Second: which operator (not comparison) tests for NULL?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'sql-q-null-avg',
            prompt: '11 robots are due to report mileage. 8 report values (average 42 km), 3 leave NULL. What does SELECT AVG(mileage) return?',
            options: [
              { id: 'a', text: '42 — NULLs are ignored; the average covers only reporting robots' },
              { id: 'b', text: '30.5 — NULLs count as 0 and drag the average down' },
              { id: 'c', text: 'NULL — any NULL in the column poisons the whole aggregate' },
              { id: 'd', text: 'It errors — you must filter NULLs first' },
            ],
            correctId: 'a',
            optionNotes: {
              b: 'NULL is not 0 — if you want non-reporters to count as zero, say so explicitly: AVG(COALESCE(mileage, 0)). The silent version would be a different number with the same code.',
              c: 'Aggregates skip NULLs rather than propagate them. (One genuine exception: COUNT of zero rows returns 0, but SUM/AVG of zero rows return NULL — a different subtlety.)',
              d: 'No error — and that is exactly the trap. The query succeeds while quietly describing 8 robots, not 11.',
            },
            explanation:
              'AVG summed 8 values and divided by 8. Whether that is *correct* depends on the question: "average among reporters" (42) or "average per robot including non-reporters" (30.5 via COALESCE). The SQL is silent about intent — knowing that aggregates skip NULLs turns a mystery number into a decision you make on purpose.',
            hint: 'Divide 8 values by how many?',
          },
        },
      ],
    },
    {
      id: 'sql-l6-indexes',
      title: 'Indexes: The Lookup Accelerator',
      minutes: 5,
      xp: 45,
      narrative:
        'The archive answers simple questions at a crawl: "every log entry for robot 7" scans 40 million rows on its way to 14 matches. The data is fine — the lookup path is missing. Time to build indexes on purpose.',
      steps: [
        {
          kind: 'teach',
          heading: 'What an index is',
          body:
            'Without an index, `WHERE robot_id = 7` is a **full table scan**: the database reads every row and keeps the matches — fine at 100 rows, punishing at 40 million. An **index** is a sorted lookup structure kept beside the table. It is the book-index analogy made literal: instead of reading every page hunting one keyword, you look the keyword up in the back and jump straight to its pages.\n\nThe cost moves to **writes**: every INSERT, and every UPDATE touching an indexed column, must also update the index — and the index occupies storage of its own. Reads get dramatically faster; each write pays a small tax. That trade is the entire design decision.',
          keyPoints: [
            'No index = full table scan; index = jump straight to matching rows',
            'Like a book index: sorted keys pointing at row locations',
            'Indexes speed reads and tax every write with maintenance',
          ],
        },
        {
          kind: 'teach',
          heading: 'Which columns earn one',
          body:
            'Index the columns your queries actually **filter, join, and sort** on. Primary keys get indexes automatically — lookups by `robots.id` are never the problem. The usual candidates beyond that: **foreign keys** (`maintenance_logs.robot_id`, the join and filter workhorse), and any column in frequent `WHERE` clauses (`done_at` for "last week\'s entries") or `ORDER BY`.\n\nColumns that rarely appear in queries earn nothing, and low-cardinality columns — `status` with three distinct values — gain little, since the index still matches half the table. And no, you cannot index everything: every index taxes every write, so a write-heavy log table buried under ten indexes slows to a crawl. Indexing is budgeting, not decoration.',
          keyPoints: [
            'Index what you filter, join, and sort on — PKs come free',
            'Foreign keys and frequent WHERE columns are the usual winners',
            'Every index taxes writes and storage; indexing everything is its own outage',
          ],
        },
        {
          kind: 'byte',
          text: 'The Data Vault remembers the Quarterly Report That Took 11 Minutes — a full scan of maintenance_logs for each robot, one at a time. After one index on robot_id: 40 milliseconds. The archivist printed both timings and keeps them under the desk glass.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'sql-q-index-choice',
            prompt:
              'The dashboard constantly asks maintenance_logs for one robot\'s entries; the nightly batch inserts 2 million rows. You may add one index, on one column. Which?',
            options: [
              { id: 'a', text: 'robot_id — the foreign key every dashboard query filters and joins on' },
              { id: 'b', text: 'notes — long text might make lookups "richer"' },
              { id: 'c', text: 'All columns, to be safe — every query then finds an index waiting' },
              { id: 'd', text: 'None — the table is indexed by row order already' },
            ],
            correctId: 'a',
            optionNotes: {
              b: 'notes appears in no WHERE clause — an index on it would be pure write tax on 2 million nightly inserts.',
              c: 'Every extra index taxes each of those 2 million inserts and eats storage. "Safe" here means measurably slower at exactly the workload you run.',
              d: 'Tables have no meaningful row order you can search. Without an index, the dashboard query scans 40 million rows per robot.',
            },
            explanation:
              'One index, one column — so pick the one in the hot path: `robot_id` is the foreign key the dashboards filter by and every future JOIN will match on. Index choice follows the query log, not intuition: the columns in your most frequent WHERE and JOIN clauses earn the budget; everything else pays the write tax for nothing.',
            hint: 'Which column appears in the WHERE clause of the query that runs thousands of times a day?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'sql-q-index-create',
            prompt: 'Build the index that gives the dashboard its fast path into the log table.',
            language: 'sql',
            template: 'CREATE {{b1}} idx_logs_robot\nON maintenance_logs ({{b2}});',
            blanks: [
              { id: 'b1', accept: ['index'], choices: ['INDEX', 'TABLE', 'VIEW'] },
              { id: 'b2', accept: ['robot_id'], choices: ['robot_id', 'id', 'action'] },
            ],
            explanation:
              '`CREATE INDEX name ON table (column);` builds the sorted lookup structure; the column goes in parentheses after the table name. The column here is `robot_id` — the log table\'s foreign key, not `id` (which would index each log row\'s own identity, something nobody queries). Names like `idx_logs_robot` are convention, but a good one tells the next engineer exactly what is indexed.',
            hint: 'The statement creates an index on the column the queries filter by — which side of the join is that?',
          },
        },
      ],
    },
  ],
  flashcards: [
    {
      id: 'fc-sql-1',
      categoryId: 'sql',
      concept: 'Primary key',
      explanation:
        'A column (or column combination) that uniquely identifies each row: no duplicates, no NULLs. It is the row\'s permanent address within its table.',
      example: 'robots.id = 7 names exactly one robot, forever.',
      misconception:
        'The primary key is not the row number your client happens to display — it is a real column with a uniqueness constraint. Composite keys (two columns together) count too.',
      application:
        'Every join, every targeted UPDATE and DELETE, and every "same robot twice?" dedup check depends on it.',
      difficulty: 1,
    },
    {
      id: 'fc-sql-2',
      categoryId: 'sql',
      concept: 'WHERE vs HAVING',
      explanation:
        'WHERE filters individual rows before grouping; HAVING filters whole groups after GROUP BY. They run at different stages of query execution.',
      example:
        "WHERE status = 'active' removes rows first; HAVING COUNT(*) > 10 keeps only the buckets that stayed crowded.",
      misconception:
        'Aggregates are illegal in WHERE — rows are not grouped yet, so COUNT(*) has no meaning there. That is the whole reason HAVING exists.',
      application:
        'Dashboard filters almost always combine both: raw row conditions in WHERE, per-group thresholds in HAVING.',
      difficulty: 2,
    },
    {
      id: 'fc-sql-3',
      categoryId: 'sql',
      concept: 'GROUP BY',
      explanation:
        'Splits rows into buckets by the grouped columns and evaluates aggregates per bucket, producing one output row per bucket.',
      example: 'SELECT bay, COUNT(*) FROM robots GROUP BY bay — one row per bay.',
      misconception:
        'GROUP BY does not sort the output. If order matters, add ORDER BY explicitly; otherwise row order is undefined.',
      application:
        'Failure rates per model, stock per part kind, downtime per bay — every summary report starts here.',
      difficulty: 2,
    },
    {
      id: 'fc-sql-4',
      categoryId: 'sql',
      concept: 'INNER JOIN',
      explanation:
        'Pairs rows from two tables where the ON condition holds — typically foreign key = primary key. Rows without a match on either side are dropped.',
      example: 'FROM robots r INNER JOIN maintenance_logs l ON r.id = l.robot_id.',
      misconception:
        'It is not a cross product: the ON clause decides the pairs, and unmatched rows vanish rather than appearing with NULLs.',
      application:
        'Attaching names, locations, and owners to event rows — the standard way to make a log table tell stories.',
      difficulty: 2,
    },
    {
      id: 'fc-sql-5',
      categoryId: 'sql',
      concept: 'NULL',
      explanation:
        'NULL means absent or unknown — not zero, not empty string. Any comparison with NULL yields unknown, so NULL rows evade normal WHERE filters.',
      example: "WHERE retired_at IS NULL finds robots still in service; = NULL finds nothing.",
      misconception:
        'NULL = NULL is not true — unknown is not equal to anything, even itself. Test for it only with IS NULL / IS NOT NULL.',
      application:
        'Sensor dropouts, unfilled fields, retired dates that do not exist yet — real tables are full of NULLs and queries must say so.',
      difficulty: 2,
    },
    {
      id: 'fc-sql-6',
      categoryId: 'sql',
      concept: 'ORDER BY',
      explanation:
        'Sorts the final result rows; ASC is the default, DESC reverses. Multiple keys break ties in sequence, and it runs after filtering.',
      example: 'ORDER BY done_at DESC LIMIT 5 — the five most recent entries.',
      misconception:
        'Without ORDER BY, row order is never guaranteed — even if it looks stable today. Only sorted promises are real promises.',
      application:
        'Top-N reports, newest-first log views, and deterministic test output all depend on explicit ordering.',
      difficulty: 1,
    },
    {
      id: 'fc-sql-7',
      categoryId: 'sql',
      concept: 'Foreign key',
      explanation:
        'A column that references another table\'s primary key, enforcing that the relationship is real: a log cannot exist for a robot that is not there.',
      example: 'maintenance_logs.robot_id references robots.id — the join condition is the same pair of columns.',
      misconception:
        'It is not just a naming convention — declared properly, the database itself rejects rows pointing at nonexistent parents.',
      application:
        'Every one-to-many schema (machine → events, order → items) runs on foreign keys; ghost data becomes structurally impossible.',
      difficulty: 2,
    },
    {
      id: 'fc-sql-8',
      categoryId: 'sql',
      concept: 'Repeating groups & normalization',
      explanation:
        'Never store multiple facts in one cell ("weld; paint; inspect"). Promote each repeating value to its own row in a child table with a foreign key back to its parent.',
      example: 'robots.inspections = "a; b; c" becomes an inspections table: (robot_id, inspection_date), one row each.',
      misconception:
        'Normalization is not bureaucracy — a packed cell cannot be filtered, counted, or joined on, so the questions it pretends to answer are unanswerable.',
      application:
        'The line between "database" and "spreadsheet with delimiters" is exactly this rule.',
      difficulty: 2,
    },
    {
      id: 'fc-sql-9',
      categoryId: 'sql',
      concept: 'Index',
      explanation:
        'A sorted lookup structure beside the table that lets the engine jump to matching rows instead of scanning all of them — the book-index idea applied to columns. Reads on indexed columns get fast; every write pays to maintain each index.',
      example: 'CREATE INDEX idx_logs_robot ON maintenance_logs (robot_id); — "all entries for robot 7" drops from a 40-million-row scan to a handful of lookups.',
      misconception:
        'An index is not free speed: each one taxes every INSERT and UPDATE and consumes storage, so indexing every column slows the exact write workload your log table lives on.',
      application: 'Primary keys are indexed automatically; beyond that, index foreign keys and the columns in your most frequent WHERE and JOIN clauses.',
      difficulty: 2,
    },
  ],
};
