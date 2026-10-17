import type { Category } from '../engine/types';

// Software Architecture City — reference content module.
// Every other category file follows this exact shape.

export const archCategory: Category = {
  id: 'arch',
  name: 'Architecture City',
  tagline: 'Design systems that survive contact with reality',
  icon: '🏙️',
  description:
    'The city that coordinates every lab system is running as one tangled process. Restore modularity, clean interfaces, and sane dependencies.',
  accent: 'indigo',
  lessons: [
    {
      id: 'arch-l1-modules',
      title: 'Modules & Separation of Concerns',
      minutes: 6,
      xp: 40,
      narrative:
        'The City Grid was once a model of modular design. Then someone merged every department into one file. Your first job: remember why we split systems apart.',
      steps: [
        {
          kind: 'teach',
          heading: 'Why we split systems into modules',
          body:
            'A **module** is a unit of code with one job and a narrow, explicit interface to the rest of the system. Good modular design follows **separation of concerns**: each part owns exactly one reason to change. When sensor parsing, database access, and UI rendering live in one file, a change to any one of them risks breaking all three — and nobody can test them in isolation.\n\nIn a robotics lab this is not abstract. The module that reads joint states should not also decide assembly sequences. When they are separate, you can swap the real robot for a simulated one without touching planning code.',
          keyPoints: [
            'One module = one job + a small explicit interface',
            'Separation of concerns limits blast radius of changes',
            'Isolated modules can be unit-tested without the whole system running',
          ],
        },
        {
          kind: 'byte',
          text: 'Fun fact from the archive: the City Grid crash of Cycle 214 started with a plotting function that also wrote to the production database. Nobody found it for 3 weeks.',
        },
        {
          kind: 'teach',
          heading: 'Coupling and cohesion',
          body:
            'Two terms describe module quality. **Cohesion** is how strongly the code inside one module belongs together — high cohesion is good (a `motion_planner` module full of motion planning). **Coupling** is how much modules depend on each other\'s internals — low coupling is good (call an interface, don\'t reach into another module\'s private state).\n\nRule of thumb: if deleting feature A from module M forces you to edit module N, the two are too coupled. Fix the interface, not the symptom.',
          keyPoints: [
            'High cohesion inside modules, low coupling between them',
            'Depend on interfaces, not internals',
            'Dependency direction should follow the architecture, not convenience',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'arch-q-coupling',
            prompt:
              'A `telemetry_dashboard.py` module imports `db_password` directly from `storage internals` of another team\'s module to save a function call. What is the strongest criticism?',
            options: [
              { id: 'a', text: 'It is fine — importing is always cheaper than calling functions' },
              { id: 'b', text: 'It creates hidden coupling: the dashboard now breaks if the storage module changes its internals' },
              { id: 'c', text: 'Passwords should always be stored in the dashboard module instead' },
              { id: 'd', text: 'Python forbids importing across team-owned modules' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Imports may look cheap, but reaching into another module\'s internals couples your code to details that can change without notice.',
              c: 'That would spread the secret to more places. The issue here is coupling, not where the password lives.',
              d: 'Python allows any import. Architecture conventions exist precisely because the language permits everything.',
            },
            explanation:
              'Reaching into another module\'s internals creates **hidden coupling**: the storage team can break your dashboard with any refactor, because you depended on details they never promised to keep stable. The fix is a small, explicit interface — a function or config value the storage module deliberately exposes.',
            hint: 'Ask: what happens the day the storage team renames that internal value?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'arch-q-layering',
            prompt:
              'A robot monitoring app has four parts. Drag them into the dependency order a clean layered design would use (who depends on whom, top to bottom).',
            items: [
              { id: '1', text: 'Web dashboard (presents status to users)', note: 'Top layer: depends on services, never on raw drivers.' },
              { id: '2', text: 'Monitoring service (business logic: alerts, thresholds)', note: 'Middle layer: the only place that knows alert rules.' },
              { id: '3', text: 'Robot data access layer (queries the database)', note: 'Lower layer: hides SQL details behind functions.' },
              { id: '4', text: 'Database (PostgreSQL)', note: 'Bottom layer: knows nothing about the app.' },
            ],
            explanation:
              'Clean layers depend **downward only**: dashboard → service → data access → database. Each layer hides the complexity of the one below. If the database team swaps PostgreSQL for another store, only the data access layer changes — the dashboard never hears about it.',
            hint: 'The user-facing part should know the least about storage details.',
          },
        },
      ],
    },
    {
      id: 'arch-l2-clientserver',
      title: 'Client–Server, APIs & Data Ownership',
      minutes: 6,
      xp: 40,
      narrative:
        'The Grid\'s departments used to talk through clean request/response channels. Now they read each other\'s memory. Time to redraw the boundaries.',
      steps: [
        {
          kind: 'teach',
          heading: 'Client–server in one paragraph',
          body:
            'A **server** owns a resource and its rules; a **client** asks it to do things through a defined protocol (usually HTTP requests). The robot status API owns robot state; dashboards, scripts, and other robots are clients that ask for it. The contract between them — endpoints, request/response formats, status codes — is the **interface**.\n\nThis split buys independence: the server can be rewritten in another language, scaled to more machines, or replaced by a simulator, and correctly-built clients keep working.',
          keyPoints: [
            'The server owns data and rules; clients ask through a protocol',
            'The interface (endpoints + payloads) is the contract',
            'Either side can change internally as long as the contract holds',
          ],
        },
        {
          kind: 'teach',
          heading: 'Where the database belongs',
          body:
            'A common beginner architecture mistake: the client connects directly to the database. That leaks schema details into every client, makes security impossible (clients hold DB credentials), and lets any client corrupt data.\n\nThe standard fix: the database is owned by exactly one server layer. Clients talk to the API; the API talks to the database. In lab setups you will see the same pattern between simulation and reality — ROS 2 topics as the interface, so consumers never know (or care) whether a real arm or Isaac Sim produced a message.',
          keyPoints: [
            'Only one layer should touch the database directly',
            'Clients authenticate to APIs, not to databases',
            'The same interface principle lets sim and real robots swap places',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'arch-q-dbowner',
            prompt:
              'Your team\'s React dashboard needs robot cycle times. A teammate suggests connecting to PostgreSQL directly from the browser "because it is faster to build". Best response?',
            options: [
              { id: 'a', text: 'Agree — fewer moving parts is always better architecture' },
              { id: 'b', text: 'Disagree: put a small API between them. The DB stays private, credentials never reach the browser, and schema changes stop breaking the dashboard' },
              { id: 'c', text: 'Disagree: browsers cannot speak SQL' },
              { id: 'd', text: 'Agree, but only if the database is small' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'It is faster this week and slower every week after. Direct DB access breaks security and couples clients to the schema.',
              c: 'Browsers technically can speak the wire protocol, which is exactly the problem — it would expose credentials and the whole database to anyone with dev tools.',
              d: 'Size is irrelevant. The security and coupling problems exist at any scale.',
            },
            explanation:
              'A thin API layer is the standard boundary: the browser talks HTTP to your service, the service talks SQL to the database. Database credentials stay server-side, the schema can evolve behind the API, and you can cache, log, and rate-limit in one place.',
            hint: 'Think about who could read a DB password shipped in browser code.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'arch-q-interface',
            prompt: 'Complete the interface between a planner and a motion executor so the planner never touches the robot driver directly.',
            language: 'python',
            template:
              'class MotionExecutor(Protocol):\n    def {{b1}}(self, joint_targets: list[float]) -> bool:\n        """Move to targets. Returns True when the motion settles."""\n        ...\n\n# planner.py — depends on the interface, not the driver\ndef build_plan(executor: {{b2}}, targets: list[float]) -> bool:\n    return executor.move_to(targets)',
            blanks: [
              { id: 'b1', accept: ['move_to'], choices: ['move_to', 'execute', 'run'] },
              { id: 'b2', accept: ['motionexecutor'], choices: ['MotionExecutor', 'RobotDriver', 'dict'] },
            ],
            explanation:
              'The planner depends on the **MotionExecutor interface** (a `Protocol` is Python\'s structural interface). Any implementation that can `move_to` — real driver, simulator, or a mock in tests — satisfies it. This is dependency inversion in practice: high-level policy depends on an abstraction, not a concrete driver.',
            hint: 'The planner should reference the interface type, not a concrete driver class.',
          },
        },
      ],
    },
    {
      id: 'arch-m1-redesign',
      title: 'Mission: Untangle the Grid',
      minutes: 10,
      xp: 80,
      narrative:
        'A junior engineer fused four services into one `mega_app.py`. Restoring the City Grid means deciding what belongs together — and what must be split apart.',
      steps: [
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'arch-q-mega',
            prompt:
              '`mega_app.py` (4,800 lines) contains: Flask routes, SQL strings, pandas analysis, matplotlib plotting, and an email sender. The team must split it. Which split respects separation of concerns?',
            options: [
              { id: 'a', text: 'Split by line count into four files of ~1,200 lines each' },
              { id: 'b', text: 'Split by concern: `api/` (routes), `db/` (queries), `analysis/` (pandas), `reporting/` (plots, email)' },
              { id: 'c', text: 'Split by author: each person keeps the functions they wrote' },
              { id: 'd', text: 'Split by type: all functions in one file, all classes in another' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Equal line counts do not create meaningful boundaries — a change would still touch unrelated files.',
              c: 'Ownership describes people, not responsibilities. The code still tangles analysis with I/O.',
              d: 'Grouping by syntax (functions vs classes) ignores what the code is for.',
            },
            explanation:
              'Split **by responsibility**. Each package then has one reason to change: API shape, storage schema, analysis logic, and reporting format evolve independently. This is also what makes the parts testable — `analysis/` can be tested without a web server or a mailbox.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'bughunt',
            id: 'arch-q-circular',
            prompt: 'The refactor introduced an import problem. Click the line where the root cause appears.',
            language: 'python',
            code: '# orders.py\nfrom reporting import send_confirmation\n\ndef place_order(item, qty):\n    save_order(item, qty)\n    send_confirmation(item, qty)\n\n# reporting.py\nfrom orders import save_order  # ???',
            buggyLine: 9,
            causeOptions: [
              { id: 'a', text: 'The files are named badly' },
              { id: 'b', text: 'A circular import: orders needs reporting, and reporting needs orders — neither can finish loading first' },
              { id: 'c', text: 'Python only allows one import per project' },
              { id: 'd', text: 'The functions must be declared before classes' },
            ],
            causeCorrectId: 'b',
            fixExplanation:
              'The dependency cycle is the bug. Standard fixes: extract the shared function (`save_order`) into a third module both import, or move the confirmation call up a layer so reporting does not import orders. Layered architectures forbid cycles for exactly this reason.',
            fixedCode: '# storage.py (new, lowest layer)\ndef save_order(item, qty): ...\n\n# orders.py\nfrom storage import save_order\nfrom reporting import send_confirmation\n\ndef place_order(item, qty):\n    save_order(item, qty)\n    send_confirmation(item, qty)\n\n# reporting.py\nfrom storage import save_order  # no cycle',
            explanation:
              'When two modules import each other, Python cannot finish initializing the first before the second asks for it — you get a partial-module `ImportError`. The architectural cure is breaking the cycle with a lower-level shared module, which also signals the two concerns were really three.',
            hint: 'Trace what `orders` imports and what that module imports back.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'arch-q-swap',
            prompt:
              'Next sprint: replace the lab\'s file-based data store with PostgreSQL without touching analysis code. Which design made this possible?',
            options: [
              { id: 'a', text: 'Analysis code called `repository.get_readings()` instead of reading files directly' },
              { id: 'b', text: 'Analysis code is well-commented' },
              { id: 'c', text: 'The team uses Git' },
              { id: 'd', text: 'Nothing — database migrations always rewrite every caller' },
            ],
            correctId: 'a',
            optionNotes: {
              b: 'Comments help people, but they do not change what the code depends on.',
              c: 'Version control tracks changes; it does not decouple modules.',
              d: 'Migrations only touch every caller when callers were coupled to storage details in the first place.',
            },
            explanation:
              'Insulating callers behind a **repository interface** means storage is an implementation detail. Swap the files for PostgreSQL, implement the same `get_readings()` against SQL, and analysis code never notices. This is the payoff of the interfaces lesson.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'arch-q-deploy',
            prompt: 'Order the steps of a safe architecture migration (big-bang rewrites are how the Grid crashed).',
            items: [
              { id: '1', text: 'Characterize current behavior with tests (pin down what "working" means)' },
              { id: '2', text: 'Extract one boundary at a time behind a stable interface' },
              { id: '3', text: 'Route callers to the new implementation behind a feature flag' },
              { id: '4', text: 'Run old and new side by side; compare outputs' },
              { id: '5', text: 'Remove the old path once metrics confirm parity' },
            ],
            explanation:
              'This is the **strangler fig** migration pattern: grow the new system around the old one behind stable interfaces, verify with parallel runs, then remove the old code. Every step is reversible — the opposite of a big-bang rewrite.',
            hint: 'You need a safety net before you touch anything.',
          },
        },
      ],
    },
    {
      id: 'arch-b1-boss',
      title: 'Boss: The Monolith Defense',
      minutes: 12,
      xp: 120,
      narrative:
        'The Guardian of the Old Grid awakens: a 4,800-line monolith that fights every refactor. Defeat it by designing the system it was afraid to become.',
      steps: [
        {
          kind: 'byte',
          text: 'Boss battle! This one mixes everything from the city: modules, interfaces, layering, and data ownership. Take it apart one decision at a time.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'arch-b-q1',
            prompt:
              'The monolith\'s `run_robot_cell()` reads PLC sensor files, computes assembly sequence, writes results to the DB, and emails the shift report. Which single extraction delivers the most safety first?',
            options: [
              { id: 'a', text: 'Extract the PLC file reading behind a data-access interface' },
              { id: 'b', text: 'Rename `run_robot_cell()` to `run_robot_cell_v2()`' },
              { id: 'c', text: 'Extract the email sender behind a notification interface' },
              { id: 'd', text: 'Add type hints to the whole function' },
            ],
            correctId: 'a',
            optionNotes: {
              b: 'A rename changes nothing about coupling.',
              c: 'Notifications are also a fine boundary, but sensor input is what the core logic most depends on — and what simulation will replace first.',
              d: 'Type hints improve clarity but do not decouple I/O from logic.',
            },
            explanation:
              'Extract the dependency the core logic cannot think without: sensor input. Once reads go through an interface, you can feed the planner recorded data or Isaac Sim output in tests — no hardware, no files. That unlocks everything else, including testing the assembly logic itself.',
            hint: 'Which I/O source does the most important logic depend on?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'arch-b-q2',
            prompt: 'Define the seam you just extracted so the planner no longer knows where sensor data comes from.',
            language: 'python',
            template:
              'class {{b1}}(Protocol):\n    def read_joint_states(self) -> list[float]: ...\n\ndef plan_sequence(source: SensorSource) -> list[str]:\n    joints = source.{{b2}}()\n    return compute_sequence(joints)  # pure logic — trivially testable',
            blanks: [
              { id: 'b1', accept: ['sensorsource'], choices: ['SensorSource', 'PlcReader', 'PostgresDB'] },
              { id: 'b2', accept: ['read_joint_states'], choices: ['read_joint_states', 'open_file', 'send_email'] },
            ],
            explanation:
              'The interface is named for **what it provides** (sensor readings), not where it gets them (PLC files) — that keeps simulators, recordings, and future hardware interchangeable. `plan_sequence` is now a pure function of its inputs: the definition of testable.',
            hint: 'Interface names should describe the capability, not the implementation.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'arch-b-q3',
            prompt:
              'Six months later: planner service, sensor gateway, reporting service, PostgreSQL. The reporting team starts querying the gateway\'s internal SQLite replica "just for one report". What do you say?',
            options: [
              { id: 'a', text: 'Nothing — internal replicas are fair game' },
              { id: 'b', text: 'Stop it: that couples reporting to the gateway\'s private storage. Expose the needed data through the gateway\'s API instead' },
              { id: 'c', text: 'Encourage it, but only read-only' },
              { id: 'd', text: 'Merge reporting into the gateway so sharing is legal' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Every hidden dependency is a future outage: the gateway can never change its replica without breaking reporting.',
              c: 'Read-only still couples reporting to a storage detail the gateway never promised to keep.',
              d: 'Merging services to justify coupling is how the last monolith was born.',
            },
            explanation:
              'Service boundaries only exist if their storage is private. The moment another service reaches into internal storage, you have a distributed monolith — deploy coupling plus network latency. The correct move is extending the gateway\'s public API to serve the report\'s need.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'arch-b-q4',
            prompt: 'Final blow: order the dependency rules of the restored City Grid (allowed dependency directions).',
            items: [
              { id: '1', text: 'API layer may depend on service layer' },
              { id: '2', text: 'Service layer may depend on repository interfaces' },
              { id: '3', text: 'Repository implementations may depend on the database driver' },
              { id: '4', text: 'Nothing may depend on the API layer' },
            ],
            explanation:
              'Dependencies point one way: toward stable, lower-level abstractions. The API layer is a delivery detail — business logic must never import it, or your core becomes untestable without HTTP. One-way dependencies are what keep the Grid from re-tangling.',
            hint: 'Think about which layer must remain testable without web servers.',
          },
        },
        {
          kind: 'byte',
          text: 'The monolith dissolves into clean services. The City Grid hums again — and somewhere, a junior engineer is told to "go learn why interfaces matter" before touching anything.',
        },
      ],
    },
    {
      id: 'arch-l3-dataflow',
      title: 'Request-Response vs Events',
      minutes: 6,
      xp: 40,
      narrative:
        'The restored Grid routes every call cleanly — but each sensor reading now travels as a direct request, and when one consumer stalls, the sensors stall with it. Time to add the other shape of communication.',
      steps: [
        {
          kind: 'teach',
          heading: 'Two shapes of communication',
          body:
            '**Request-response** is synchronous: a client asks, a server answers, and the caller waits for the reply — both sides must be alive at the same instant. It is the right shape when you need the answer *now*: a query ("what is rq-7\'s battery?") or a command ("dock at bay 3").\n\n**Event-driven** pipelines are asynchronous: producers **publish** events ("battery 11.2V at t=1042") to a **message queue** or broker, and consumers **subscribe** and process them on their own schedule. Neither side waits for the other, and neither fails because the other is down — the queue holds events until the consumer returns. The price is a different kind of thinking: no immediate answer, and the queue itself becomes a component you must size and monitor.',
          keyPoints: [
            'Request-response: the caller waits; both sides must be alive at the same moment',
            'Events: producers publish, consumers process later — decoupled in time and in failure',
            'Queries and commands want request-response; telemetry streams want events',
          ],
        },
        {
          kind: 'teach',
          heading: 'Buffers absorb the speed mismatch',
          body:
            'Sensors produce on a fixed clock — 100 readings per second, awake or not. Consumers do not: a dashboard redraws at 1 Hz, a database has slow seconds, an analysis service stalls under load. Connect them directly and the mismatch becomes someone\'s failure: either the sensor blocks (and its control loop stalls with it) or readings are lost in the gap.\n\nA **buffer** — a bounded queue between them — absorbs the difference. During a consumer stall, events pile up in the queue instead of inside the sensor; when the consumer recovers, it drains at its own pace. But the buffer needs a policy for being full: keep the newest and drop the oldest (the usual choice for telemetry — old readings are superseded anyway), keep the oldest and reject the new, or apply **backpressure** upstream. Bounded-and-drop-oldest is the standard answer for sensor telemetry: a live dashboard needs the current story, not every chapter.',
          keyPoints: [
            'Sensors run on a clock; consumers run on luck — a buffer absorbs the difference',
            'A bounded queue with a drop policy beats an unbounded queue that eats memory',
            'For telemetry, drop-oldest is usually right: current state outranks history',
          ],
        },
        {
          kind: 'byte',
          text: 'The Grid archive holds the unbounded queue of Cycle 219: one stalled consumer, one night, 41 million queued events, and a very warm memory chip. The rebuilt queues are bounded with drop-oldest policies — Byte checks their depth like a pulse.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'arch-q-stall-coupling',
            prompt:
              'A sensor gateway sends each reading to the analysis service by direct request-response and waits for the reply. During a 10-second analysis stall, what happens — and what is the standard fix?',
            options: [
              { id: 'a', text: 'Nothing — HTTP calls queue up automatically on the sensor until the service recovers' },
              { id: 'b', text: 'The gateway either blocks (stalling its own read loop) or drops readings silently. Fix: put a bounded queue between them — publish events, let the service consume at its own pace' },
              { id: 'c', text: 'Fix: make the sensor send readings twice as fast to build up a backlog' },
              { id: 'd', text: 'Fix: make the analysis service faster so stalls never happen' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'The connection may buffer a little, but a 10-second stall means timeouts, blocked sends, or dropped readings at the sensor — nothing queues "automatically" at useful depth.',
              c: 'Sending faster widens the mismatch: more data poured into a consumer that is already behind, and a sensor burning its own clock on retries.',
              d: 'Faster consumers shrink stalls; they do not remove them. Any design that fails during a consumer stall fails eventually.',
            },
            explanation:
              'Direct request-response couples two rates that have nothing to do with each other: the sensor\'s fixed production clock and the consumer\'s variable processing speed. During a stall the producer has only bad options — wait and fall behind on its own real-time job, or drop and lose data without a record. A bounded message queue turns the stall into a non-event: events accumulate up to the bound, drop-oldest discards only superseded readings, and the consumer drains the backlog on recovery. The sensor never learns a stall happened.',
            hint: 'What are the sensor\'s two options while the consumer is stuck — and is either acceptable?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'arch-q-ring-buffer',
            prompt: 'The gateway keeps the newest readings in a bounded buffer for the dashboard. What does the print show?',
            language: 'python',
            code: 'from collections import deque\nbuffer = deque(maxlen=3)\nfor v in [10, 11, 12, 13, 14]:\n    buffer.append(v)\nprint(list(buffer))',
            choices: ['[12, 13, 14]', '[10, 11, 12]', '[10, 11, 12, 13, 14]', 'IndexError: queue full'],
            correctIndex: 0,
            explanation:
              'A `deque(maxlen=3)` is a drop-oldest bounded buffer: appending to a full buffer silently evicts the oldest element, so after five readings only the newest three survive — 12, 13, 14. That is the telemetry contract in miniature: when the consumer is slow, discard the superseded past, keep the current story, never block the producer. The wrong answers are the policies you would *not* want here — keeping the first three (stale), growing without bound (the Cycle 219 incident), or raising on full (which stalls the sensor\'s loop).',
            hint: 'What does a bounded buffer do when item 4 arrives and there is no room?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'arch-q-pipeline',
            prompt: 'Order the event-driven path of one sensor reading through the restored Grid, from production to screen.',
            items: [
              { id: '1', text: 'The sensor gateway produces a reading on its fixed 100 Hz clock', note: 'The producer never waits on any consumer.' },
              { id: '2', text: 'The gateway publishes the reading to a bounded queue', note: 'The queue is the decoupling point between two speeds.' },
              { id: '3', text: 'The analysis service consumes readings when it can, draining any backlog after a stall', note: 'Its stalls now cost queue depth, not sensor time.' },
              { id: '4', text: 'Processed results are written to the database', note: 'The durable record, written at the consumer\'s pace.' },
              { id: '5', text: 'The dashboard reads the latest results on its own 1 Hz rhythm', note: 'A third, slower clock — served from stored results, never from the sensor directly.' },
            ],
            explanation:
              'Three clocks coexist by design: the sensor\'s 100 Hz production, the analysis service\'s irregular appetite, and the dashboard\'s 1 Hz refresh. The queue decouples the first two — stalls become bounded backlog, then drain — and the database decouples the third, so the dashboard reads stored results instead of live sensors. Each boundary is a place where a slowdown becomes tolerable instead of contagious; that is the whole argument for event pipelines in a telemetry-heavy lab.',
            hint: 'Follow one reading from the sensor, through the only component allowed to hold it, to the screen.',
          },
        },
      ],
    },
    {
      id: 'arch-l4-caching',
      title: 'Caching & Staleness',
      minutes: 5,
      xp: 40,
      narrative:
        'The Grid\'s dashboards hammer the database once per second per robot, and the database has opinions about that. A cache is the fix — until someone trusts a five-minute-old answer as current. Staleness is the price; the discipline is choosing where it is payable.',
      steps: [
        {
          kind: 'teach',
          heading: 'A cache between service and database',
          body:
            'A **cache** keeps copies of answers close to the requester so repeat requests skip the slow, expensive source. The standard placement is inside the service, in front of the database: every read checks the cache first. A **hit** returns the copy immediately; a **miss** falls through to the database, and the answer is stored before it is returned — so the next identical request hits.\n\nThe economics only work when reads repeat: robot status polled every second by five dashboards is five reads served by one database query and four cache hits. One-off writes and queries with ever-unique parameters — a timestamp in every URL — gain nothing: every request misses, and the cache is pure overhead.',
          keyPoints: [
            'The cache sits in front of the database inside the service: check, then fall through',
            'Hit = serve the copy; miss = query the database, store the answer, return it',
            'Caches pay off on repeated reads; unique-parameter queries never hit',
          ],
        },
        {
          kind: 'teach',
          heading: 'Staleness: the price of every hit',
          body:
            'A cache hit returns a copy — by definition, a snapshot of the past. **Staleness** is how far that copy has drifted, and the **TTL** (time-to-live) bounds it: after N seconds the entry expires and the next read is a refreshing miss.\n\nChoosing a TTL is a safety decision, not a tuning detail. A dashboard showing robot state five seconds old is fine — a human is watching a moving machine through a moving average. An **emergency-stop interlock** reading a cached motor state is a hazard: it exists to react to *this* instant, so safety-critical reads get TTL 0 or bypass the cache entirely. The rule: match the staleness each consumer can tolerate, and where a value changes upstream, invalidate the entry on write — TTL is the backstop, not the only line of defense.',
          keyPoints: [
            'Every hit is a snapshot of the past; the TTL bounds how far in the past',
            'TTL follows consumer tolerance: dashboards take seconds, interlocks take none',
            'Prefer invalidate-on-write; TTL is the backstop for everything else',
          ],
        },
        {
          kind: 'byte',
          text: 'Archive: during a battery incident, an operator read "12.4V" from a dashboard serving a ten-minute-old cache entry. The battery was at 10.9V. Every status endpoint now carries a max-age matched to what its readers can safely tolerate — and interlocks never touch the cache at all.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'arch-q-ttl-choice',
            prompt:
              'Two reads: (A) the shift-summary page rebuilt from last night\'s finished jobs; (B) the emergency-stop interlock checking motor state. Which TTL policy is correct?',
            options: [
              { id: 'a', text: 'Both should use a short TTL to be safe' },
              { id: 'b', text: 'A can be cached generously — it reads history that no longer changes; B must bypass the cache or use TTL 0, because an interlock must see this instant, not a snapshot' },
              { id: 'c', text: 'A must never be cached; B can use a 5-second TTL' },
              { id: 'd', text: 'Both can use 5 seconds — one uniform policy is easiest to reason about' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'A short TTL on the shift summary just wastes the cache: history does not change, so every hit is free and safe. Blanket policies throw that away.',
              c: 'Backwards: the summary is the ideal cache citizen (immutable history), the interlock the worst (its value changes without notice).',
              d: 'Uniformity is not safety — five seconds stale on an interlock is five seconds of reacting to a world that has already moved.',
            },
            explanation:
              'TTL is matched to how far behind each *consumer* can safely be, not chosen once for a whole system. The shift summary reads finished history — its answers cannot go stale, so a long TTL is free performance. The interlock exists to observe the present; a cached snapshot could certify "motors stopped" while they are running, so it reads the driver directly. The archive rule: before caching a read, name the moment at which staleness becomes a lie that matters.',
            hint: 'Which of the two reads describes the past, and which must describe the present?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'arch-q-hit-miss',
            prompt: 'Two reads flow through this read-through cache. What does the final print show?',
            language: 'python',
            code: 'cache = {}\ndb_calls = 0\n\ndef get_voltage(robot_id):\n    global db_calls\n    if robot_id not in cache:\n        db_calls += 1\n        cache[robot_id] = 12.4   # result of the slow DB query\n    return cache[robot_id]\n\nget_voltage("rq-7")\nget_voltage("rq-7")\nprint(db_calls)',
            choices: ['1', '2', '0', '12.4'],
            correctIndex: 0,
            explanation:
              'The first call misses (`rq-7` is absent), counts its database query, and stores the answer; the second call hits and returns the stored copy without querying again. One query served two reads — the entire economic argument for a cache. What the print cannot show is the cost hiding in the second return: it answered from a snapshot, so if the battery drained between the calls, both callers saw 12.4. Staleness is invisible at the call site and must be handled by policy — TTL or invalidation — never by hope.',
            hint: 'Does the second call reach the database again, or return the stored copy?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'arch-q-cache-code',
            prompt: 'Complete the read-through cache, then set the policy for the one read that must never be stale.',
            language: 'python',
            template:
              'def get_robot_status(robot_id):\n    if robot_id not in {{b1}}:            # miss?\n        cache[robot_id] = db.read_status(robot_id)\n    return cache[robot_id]              # hit, or freshly loaded\n\n# the e-stop interlock reads motor state straight from the driver:\nINTERLOCK_CACHE_TTL = {{b2}}   # seconds of staleness a safety check tolerates',
            blanks: [
              { id: 'b1', accept: ['cache'], choices: ['cache', 'db', 'robot_id'] },
              { id: 'b2', accept: ['0', '0.0'], choices: ['0', '5', '300'] },
            ],
            explanation:
              'The read-through pattern is three lines: check the cache, fill it on a miss, return it — every caller after the first is a hit. The second blank is the safety decision: an interlock tolerates **zero** staleness, so its reads go straight to the driver and the cache is bypassed (a TTL of 0 means always refresh). Dashboards take seconds of TTL and pay nothing for it; safety checks take none and pay nothing for that either — each consumer\'s tolerance, not convenience, sets the number.',
            hint: 'Which object holds the copies, and how many seconds of staleness does a safety check accept?',
          },
        },
      ],
    },
    {
      id: 'arch-l5-config',
      title: 'Configuration & Secrets',
      minutes: 6,
      xp: 45,
      narrative:
        'The restored Grid deploys to three environments — the bench, the staging cell, and the production floor — and someone has been editing source files by hand before each deploy. The same artifact must run everywhere; only its configuration should change.',
      steps: [
        {
          kind: 'teach',
          heading: 'Configuration lives outside the code',
          body:
            '**Configuration** is everything that varies while the code stays the same: hub URLs, database hosts, battery thresholds, feature flags. Hardcode them and every environment change becomes a source edit — with a commit, a review, and a risk per edit. Instead, the same deployable artifact reads its settings at startup from **environment variables** or **config files** that live beside it, not inside it.\n\nThe standard discipline: commit a template (`config.example.yaml`, `.env.example`) with placeholder values, and ignore the real one in `.gitignore`. The repo then documents *what* must be configured, while each machine supplies *its* values — bench, staging, and production run identical code over different config.',
          keyPoints: [
            'Config = values that vary per environment; read them at startup, never hardcode',
            'Environment variables and config files keep the artifact identical everywhere',
            'Commit the template, ignore the real values: the repo documents shape, not settings',
          ],
        },
        {
          kind: 'teach',
          heading: 'Secrets are a stricter category',
          body:
            'A **secret** — a database password, an API key, a private key — is config with a threat model: anyone who reads it can act as you. Secrets never enter source control, not even briefly: Git history keeps everything ever committed, so "delete it in the next commit" removes it from the files but not from the repository. This is the .gitignore lesson with higher stakes.\n\nWhen a leak happens, sequence matters: **rotate first** — issue a new credential so the leaked one is dead — then remove it from the code, move reads to the environment or a secrets store, and only then scrub history and audit what used the old value. Rotating last means the whole cleanup ran while the credential still worked for whoever copied it.',
          keyPoints: [
            'A secret is credential-grade config: anyone holding it acts as you',
            'Committed secrets stay in history — prevention via .gitignore, not cleanup',
            'On leak: rotate first, then remove, then scrub and audit',
          ],
        },
        {
          kind: 'byte',
          text: 'Incident 42: a production database password rode a public workshop demo repo for eleven days. The repo had three viewers — one was a search engine\'s crawler. The rotation took four minutes; the audit took two weeks.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'arch-q-config-leak',
            prompt:
              'A teammate committed config.py containing DB_PASSWORD = "hunter2" to the shared repo, then removed it in the next commit. What is the correct assessment?',
            options: [
              { id: 'a', text: 'Handled — the password is no longer in the working tree, so nothing more is needed' },
              { id: 'b', text: 'The password remains in Git history, readable by anyone with repo access — rotate the credential now, then clean up' },
              { id: 'c', text: 'Git encrypts old commits, so the password is unreadable after the removal commit' },
              { id: 'd', text: 'Renaming the variable in the next commit fixes it' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'The working tree is not the threat model — the history is. Every commit since the leak carries the password for anyone who can clone or read the repo.',
              c: 'Git stores commits verbatim and compresses them; nothing is encrypted against someone who can read the repository.',
              d: 'A renamed variable is still a committed secret with a new name. History keeps every version.',
            },
            explanation:
              'History is forever: the password exists in every snapshot from the commit that added it to the one that removed it, and anyone with read access can walk back to it. Hence the fixed order of operations — **rotate the credential first** so the leaked value is worthless, then remove it from the code, move it to the environment, and only then consider history scrubbing and access audits. The rotation is what makes the rest of the cleanup non-urgent.',
            hint: 'Who can still obtain the password after the "removal" commit?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'arch-q-config-fill',
            prompt: 'Make the hub service read its settings from the environment: the database URL is required, the alert webhook is optional.',
            language: 'python',
            template:
              'import os\n\nDB_URL = os.{{b1}}["HUB_DB_URL"]            # required — crash at startup if missing\nALERT_WEBHOOK = os.environ.{{b2}}("ALERT_WEBHOOK", "")   # optional with a default',
            blanks: [
              { id: 'b1', accept: ['environ'], choices: ['environ', 'getenv', 'config'] },
              { id: 'b2', accept: ['get'], choices: ['get', 'getenv', 'read'] },
            ],
            explanation:
              '`os.environ` is the process\'s environment as a mapping: `os.environ["HUB_DB_URL"]` raises `KeyError` immediately at startup when the setting is missing — fail-fast is what you want for a value the service cannot run without. `os.environ.get("ALERT_WEBHOOK", "")` returns a default instead, for settings that merely change behavior. One import, two access styles, and the difference between them is policy: required settings crash loudly, optional settings get defaults.',
            hint: 'Bracket access raises on a missing key; which method returns a default instead?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'arch-q-config-rotate',
            prompt: 'The grep just found an API key committed to the repo last month. Order the response.',
            items: [
              { id: '1', text: 'Rotate: revoke the leaked key and issue a new one', note: 'The value must stop working before anything else matters.' },
              { id: '2', text: 'Point the services at the new key via the environment or a secrets store', note: 'Code reads configuration; it never contains credentials.' },
              { id: '3', text: 'Add the file pattern to .gitignore so the secret cannot return', note: 'Prevention: the next commit should be structurally unable to include it.' },
              { id: '4', text: 'Scrub history and audit what accessed the old key while it was live', note: 'Cleanup and forensics — only safe once the credential is dead.' },
            ],
            explanation:
              'Rotation comes first because it changes the stakes: a leaked key that no longer works is an embarrassing artifact, while a live one is an open door. Only then do the structural fixes land — services read the new credential from the environment, .gitignore blocks the file class, and history scrubbing plus access-log review close the incident. Doing forensics before rotation spends the investigation window with the door still open.',
            hint: 'Which step makes the leak harmless? Do that one first.',
          },
        },
      ],
    },
  ],
  flashcards: [
    {
      id: 'fc-arch-1',
      categoryId: 'arch',
      concept: 'Separation of concerns',
      explanation:
        'Each part of a system owns exactly one responsibility and one reason to change. Changes to one concern stay inside one module.',
      example: 'Sensor parsing, storage, and rendering live in different modules.',
      misconception: 'It is not about file count — a 10-file project can still tangle concerns together.',
      application: 'Lets you test assembly planning logic without a robot or database running.',
      difficulty: 1,
    },
    {
      id: 'fc-arch-2',
      categoryId: 'arch',
      concept: 'Cohesion vs coupling',
      explanation:
        'Cohesion: how strongly code inside a module belongs together (want high). Coupling: how much modules depend on each other\'s internals (want low).',
      example: 'A `motion_planner` module full of planning code is cohesive; planner code importing driver internals is coupled.',
      misconception: 'Low coupling does not mean zero dependencies — it means depending only on stable interfaces.',
      application: 'Predicts how painful a change will be before you make it.',
      difficulty: 1,
    },
    {
      id: 'fc-arch-3',
      categoryId: 'arch',
      concept: 'Interface',
      explanation:
        'An explicit contract (function signatures, API endpoints, message schemas) that modules agree on. Either side can change internally as long as the contract holds.',
      example: '`get_readings() -> list[Reading]` hides whether data comes from files, SQL, or a simulator.',
      application: 'Same trick lets Isaac Sim and a real robot expose identical ROS 2 topics.',
      difficulty: 2,
    },
    {
      id: 'fc-arch-4',
      categoryId: 'arch',
      concept: 'Layered architecture',
      explanation:
        'Organize code into layers (UI → business logic → data access → storage) where each layer depends only on the layer below.',
      example: 'A dashboard calls a monitoring service, which calls a repository, which calls PostgreSQL.',
      misconception: 'Layers are not folders — the rule is about allowed dependencies, not directory names.',
      application: 'You can swap the storage engine and the UI never notices.',
      difficulty: 2,
    },
    {
      id: 'fc-arch-5',
      categoryId: 'arch',
      concept: 'Client–server boundary',
      explanation:
        'The server owns a resource and enforces its rules; clients request through a defined protocol. The request/response contract is the interface.',
      example: 'A robot-status API owns robot state; dashboards and scripts are clients.',
      misconception: 'The client should never connect to the server\'s database directly.',
      application: 'Basic to every lab setup where multiple tools consume one data source.',
      difficulty: 1,
    },
    {
      id: 'fc-arch-6',
      categoryId: 'arch',
      concept: 'Circular dependency',
      explanation:
        'When module A imports B and B imports A, neither can finish loading. A sign that a shared concept is hiding inside both.',
      example: '`orders.py` imports `reporting.py`, which imports `save_order` back from orders.',
      application: 'Fix by extracting the shared function into a lower-level module both import.',
      difficulty: 2,
    },
    {
      id: 'fc-arch-7',
      categoryId: 'arch',
      concept: 'Repository pattern',
      explanation:
        'Wrap all storage access behind an interface (a "repository") so business logic never touches SQL, files, or network storage directly.',
      example: '`repository.get_readings(since)` implemented once for files, once for PostgreSQL.',
      application: 'Makes swapping or mocking storage trivial — and migrations survivable.',
      difficulty: 2,
    },
    {
      id: 'fc-arch-8',
      categoryId: 'arch',
      concept: 'Strangler fig migration',
      explanation:
        'Replace a legacy system incrementally: route slices of functionality behind a facade to the new implementation, verify, expand, and finally remove the old code.',
      example: 'Feature-flag 5% of requests to the new service, compare outputs, then scale up.',
      misconception: 'It is not a big-bang rewrite — every step must stay reversible.',
      application: 'The only sane way to migrate a lab tool nobody fully understands anymore.',
      difficulty: 3,
    },
    {
      id: 'fc-arch-9',
      categoryId: 'arch',
      concept: 'Message queue / buffer',
      explanation:
        'A bounded queue between producers and consumers that decouples their speeds: producers publish and continue, consumers drain at their own pace, and a consumer stall becomes backlog instead of lost data or a blocked sensor. A full queue enforces its policy — drop oldest (typical for telemetry), reject new, or backpressure.',
      example: 'A 100 Hz sensor publishes to a queue; when the analysis service stalls 10 s, readings pile up to the bound and drop-oldest discards only superseded ones.',
      misconception: 'Unbounded is not safer — an unbounded queue converts a consumer stall into memory exhaustion (the Grid\'s Cycle 219 incident). The bound and the drop policy are the design.',
      application: 'Sensor telemetry, log shipping, and job pipelines: anywhere a fixed-rate producer meets a variable-rate consumer.',
      difficulty: 2,
    },
    {
      id: 'fc-arch-10',
      categoryId: 'arch',
      concept: 'Cache staleness & TTL',
      explanation:
        'Every cache hit returns a snapshot of the past; staleness is how far it has drifted, and the TTL (time-to-live) bounds it — after expiry the next read misses and refreshes. Invalidate-on-write is the precise alternative; TTL is the backstop.',
      example: 'A dashboard TTL of 5 s is fine for robot state; an emergency-stop interlock uses TTL 0 or bypasses the cache — it must see this instant.',
      misconception: 'Staleness is not a bug to eliminate everywhere — it is a priced trade-off: harmless for a dashboard, dangerous for a safety check. Each consumer\'s tolerance sets its TTL.',
      application: 'Cache policy per read: repeated reads of slowly-changing data earn a cache; safety interlocks and live control inputs never touch it.',
      difficulty: 3,
    },
    {
      id: 'fc-arch-11',
      categoryId: 'arch',
      concept: 'Config vs secrets',
      explanation:
        'Configuration is per-environment values (URLs, hosts, thresholds) read at startup from env vars or config files — the same artifact runs everywhere. Secrets are the credential-grade subset (passwords, API keys, private keys) that must never enter source control at all.',
      example: 'config.example.yaml is committed with placeholders; the real values and the DB password arrive via environment variables on each machine.',
      misconception: 'Removing a secret in a later commit does not remove it — Git history keeps every snapshot, so the real fixes are prevention (.gitignore) and rotation.',
      application: 'Same deployable across bench, staging cell, and production floor; a leaked key is rotated first, cleaned up second.',
      difficulty: 2,
    },
  ],
};
