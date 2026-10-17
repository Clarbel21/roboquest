import type { Category } from '../engine/types';

// NVIDIA Isaac Sim — learning pathway content module.
// Conceptual, browser-based lessons: no real Isaac Sim execution is implied.
// Shapes follow src/engine/types.ts exactly.

export const isaacCategory: Category = {
  id: 'isaac',
  name: 'NVIDIA Isaac Sim',
  tagline: 'Physics-true robotics simulation, from USD stage to sim-to-real',
  icon: '🤖',
  description:
    'The facility\'s Simulation Dome runs on OpenUSD: stages, articulations, and a bridge to the real cell. Restore the dome and learn the platform behind modern robot-assembly research.',
  accent: 'teal',
  lessons: [
    {
      id: 'isx-l1-overview',
      title: 'What Isaac Sim Is (and Is Not)',
      minutes: 6,
      xp: 40,
      narrative:
        'The Simulation Dome\'s main console is dark, and its holographic labels have been shuffled by whoever sabotaged the facility. Restoring it starts with knowing exactly what this machine is — and which names belong to other machines.',
      steps: [
        {
          kind: 'teach',
          heading: 'The machine in the dome',
          body:
            '**Isaac Sim** is a robotics simulation application and platform built on **NVIDIA Omniverse**, and its scenes are described in **OpenUSD** (Universal Scene Description), an open scene-description framework. Instead of hand-coding a cell, you compose a scene graph — robots, fixtures, parts, sensors, physics, materials — then simulate it with GPU-accelerated physics and rendering.\n\nThe problems it solves for research like yours: test assembly sequences on a dual-arm cell before booking real hardware, generate sensor and training data without lab time, and iterate on cell layout in hours instead of rebuild weeks. It is a platform as much as an application — scriptable, extensible, and meant to be the ground truth your control code is validated against.',
          keyPoints: [
            'Isaac Sim: an OpenUSD-based robotics simulation application built on Omniverse',
            'Simulates physics and sensors so assembly research happens before hardware exists',
            'A scriptable platform, not just a viewer',
          ],
        },
        {
          kind: 'teach',
          heading: 'Four names, four jobs',
          body:
            'The ecosystem is easier once each name gets one job. **Isaac Sim** is the simulation application and platform. **Isaac Lab** is a robot-learning framework built *on top of* Isaac Sim — it focuses on reinforcement and imitation learning workflows, not on being a separate simulator. **ROS 2** is middleware: a message-passing ecosystem that wires robot software together; it simulates nothing. **Gazebo** is a separate open-source robotics simulator with its own physics stack — an alternative to Isaac Sim, not a component of it.\n\nA sentence worth keeping for your thesis defense: Isaac Sim answers "what happens in the world?", Isaac Lab answers "how does a policy learn?", and ROS 2 answers "how do the moving parts talk to each other?"',
          keyPoints: [
            'Isaac Lab is a robot-learning framework layered on Isaac Sim, for RL and imitation',
            'ROS 2 is middleware, not a simulator',
            'Gazebo is a separate open-source simulator, not part of Isaac Sim',
          ],
        },
        {
          kind: 'teach',
          heading: 'Where the ROS 2 Bridge fits',
          body:
            'The **ROS 2 Bridge** is the translator between the two worlds. Inside Isaac Sim it publishes simulated robot state — joint positions, velocities, poses, sensor output — on standard ROS 2 topics, and it subscribes to command topics so your control nodes can drive the simulated robot exactly as they would a real one.\n\nThat is the foundation of **sim-to-real**: write your assembly-cell planner once, against ROS 2 interfaces, and the same nodes run whether the topic data comes from the simulator or from the physical cell. You will build this data path end to end in the final lesson of this pathway.',
          keyPoints: [
            'The bridge publishes simulated state on standard ROS 2 topics',
            'It also applies incoming commands to the simulated robot',
            'Same interface in sim and on hardware: that is sim-to-real',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'isx-q-whatlab',
            prompt:
              'A new labmate says: "We should install Isaac Lab — it is the simulator for our dual-arm cell." What is the cleanest correction?',
            options: [
              { id: 'a', text: 'They are right — Isaac Lab is the simulator, and Isaac Sim is just its installer' },
              { id: 'b', text: 'Isaac Sim is the OpenUSD-based simulation application; Isaac Lab is a robot-learning framework built on top of it, focused on RL and imitation learning' },
              { id: 'c', text: 'Isaac Lab is a competing simulator from a different vendor' },
              { id: 'd', text: 'Isaac Lab is the ROS 2 middleware that Isaac Sim publishes through' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Reversed. Isaac Sim is the foundation — the simulation application. Isaac Lab needs it underneath and adds robot-learning tooling on top.',
              c: 'They are not competitors; they are layers. Isaac Lab is built on Isaac Sim, the way a framework sits on a platform.',
              d: 'That tangles three things at once: ROS 2 is the middleware, the ROS 2 Bridge connects it to Isaac Sim, and Isaac Lab is the learning framework.',
            },
            explanation:
              'Keep the stack straight: **Isaac Sim** is the OpenUSD-based robotics simulation application built on Omniverse. **Isaac Lab** is a robot-learning framework built *on top of* Isaac Sim for reinforcement and imitation learning. You can simulate and script an entire cell in Isaac Sim with no Isaac Lab in sight — Isaac Lab becomes interesting when you start training policies across many parallel environments.',
            hint: 'Ask which one needs the other to run.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'isx-q-whyros',
            prompt:
              'Your assembly-cell research will eventually run on real hardware. Why pair Isaac Sim with ROS 2 from day one?',
            options: [
              { id: 'a', text: 'ROS 2 provides the physics solver that makes the simulation accurate' },
              { id: 'b', text: 'ROS 2 renders the viewport and manages the USD scene graph' },
              { id: 'c', text: 'The ROS 2 Bridge exposes simulated state on standard topics and forwards commands back in, so the same control nodes can later run against the real robot unchanged' },
              { id: 'd', text: 'ROS 2 is required to open any USD file' },
            ],
            correctId: 'c',
            optionNotes: {
              a: 'Physics lives inside Isaac Sim, driven by its own physics engine. ROS 2 moves messages; it solves nothing.',
              b: 'Rendering and the USD stage are Isaac Sim territory. ROS 2 is middleware — a message-passing ecosystem between nodes.',
              d: 'USD files open in Isaac Sim and other USD tools with no ROS 2 anywhere in sight.',
            },
            explanation:
              'This is **sim-to-real** in one sentence: the ROS 2 Bridge publishes simulated joint states, poses, and sensor data on standard topics, and subscribes to your command topics. Your planner and controller nodes are written against the interface, not the source — so the day the physical cell arrives, the same nodes subscribe to the same topics fed by real drivers. (Gazebo can play a similar simulator role; it is a separate open-source simulator, not a part of Isaac Sim.)',
            hint: 'Which option describes a contract that survives swapping the machine on either end?',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
    {
      id: 'isx-l2-usd',
      title: 'OpenUSD: Stages, Prims, and the Scene Tree',
      minutes: 6,
      xp: 40,
      narrative:
        'Dome power is back. Every scene here is described in OpenUSD — but the stage tree has been scrambled, and in this facility the tree *is* the truth. Time to read it fluently.',
      steps: [
        {
          kind: 'teach',
          heading: 'Stages, prims, and the tree',
          body:
            'A USD **stage** is the in-memory scene graph you are editing and simulating — the whole cell, as data. Everything on it is a **prim**: the primary container of the scene graph. Prims have types (a mesh, a camera, a light, a transform scope), **attributes** (typed values: positions, sizes, joint limits), and, crucially, parents and children.\n\nThe result is a tree, and the viewport is just a rendering of that tree: select an object in the 3D view and you are highlighting a prim; rename or reparent a prim and the scene changes. One prim is marked as the **default prim** — the stage\'s natural entry point, commonly a `/World` scope under which you build everything else.',
          keyPoints: [
            'The stage is the in-memory scene graph; the viewport renders it',
            'Prims are typed containers with attributes, nested into a hierarchy',
            'The default prim is the stage\'s root entry point (often /World)',
          ],
        },
        {
          kind: 'byte',
          text:
            'Facility log, hour 3: the Assembly Cell reappeared after a junior engineer reparented the gripper under the wrong Xform — the robot briefly tried to assemble the ceiling. The stage tree forgives nothing and forgets nothing.',
        },
        {
          kind: 'teach',
          heading: 'Transforms, layers, units',
          body:
            'A prim\'s placement comes from its **transform** (an `Xform`): translation, rotation, and scale relative to its parent — which is why nesting matters. Move `/World/AssemblyCell` and every robot and part inside it moves with the cell. Larger scenes are composed from **layers**: conceptually, several USD documents combined into one stage, so the robot model, the cell layout, and your experimental tweaks can live and be versioned separately.\n\nTwo conventions matter constantly: units are **meters, kilograms, seconds** — a robot described in millimeters will be a thousand times too large — and stages are **Z-up**: the Z axis points to the sky, so "up" in code and measurements is +Z.',
          keyPoints: [
            'Xform transforms are relative to the parent prim, so hierarchy compounds',
            'Layers compose multiple USD documents into one stage',
            'Units are meters/kilograms/seconds; the world is Z-up',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'isx-q-tree',
            prompt:
              'A stage tree from the restored Assembly Cell:\n\n/World                             (default prim)\n/World/AssemblyCell                (Xform)\n/World/AssemblyCell/Table          (mesh)\n/World/AssemblyCell/Arm            (Xform, articulation root)\n/World/AssemblyCell/Arm/Base       (mesh)\n/World/AssemblyCell/Arm/Link1      (mesh)\n/World/AssemblyCell/Gripper        (Xform)\n/World/AssemblyCell/Gripper/Finger (mesh)\n\nWhich statement about this hierarchy is true?',
            options: [
              { id: 'a', text: 'Arm and Gripper are siblings — both are children of AssemblyCell' },
              { id: 'b', text: 'Gripper/Finger is a child of Arm, since both sit under AssemblyCell' },
              { id: 'c', text: '/World is a child of /World/AssemblyCell' },
              { id: 'd', text: 'Table must be a child of Arm, because rigid parts always live under articulations' },
            ],
            correctId: 'a',
            optionNotes: {
              b: 'A prim\'s parent is exactly the path before its final segment: Finger\'s parent is Gripper. Sharing a grandparent does not make something your child.',
              c: 'Inverted — /World is the root here and AssemblyCell is its child. Trees grow downward from the default prim.',
              d: 'Free parts like a table are usually plain rigid bodies outside any articulation. Only links and joints under the articulation root belong to the robot.',
            },
            explanation:
              'Prim paths read exactly like file paths: each `/` steps one level deeper, and a prim\'s parent is whatever precedes its final segment. `Arm` and `Gripper` both start with `/World/AssemblyCell/`, so they are siblings; `Gripper/Finger` nests under `Gripper`. Reading paths this way is how you script against scenes — paths are the addresses of every object you see in the viewport.',
            hint: 'Compare the path prefix each option claims.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'isx-q-hierarchy',
            prompt:
              'The Dome viewport shows the dual-arm cell assembled correctly, but an export scrambled the stage tree. Restore it: order the prims from the root of the stage down to the deepest leaf.',
            items: [
              {
                id: '1',
                text: '/World — the default prim at the root of the stage',
                note: 'Everything else hangs under the default prim.',
              },
              {
                id: '2',
                text: '/World/AssemblyCell — an Xform grouping the whole cell',
                note: 'Translate this prim and the entire cell follows.',
              },
              {
                id: '3',
                text: '/World/AssemblyCell/Arm — an Xform carrying the arm\'s articulation root',
                note: 'The robot is a subtree of the cell.',
              },
              {
                id: '4',
                text: '/World/AssemblyCell/Arm/Link2 — a mesh prim forming one link',
                note: 'Deepest leaf: a link mesh, inside the arm, inside the cell, inside /World.',
              },
            ],
            explanation:
              'Stage paths are hierarchical addresses: each segment is one level deeper, so ordering by path here is ordering by depth. The nesting is also what makes scenes manageable — transform `/World/AssemblyCell` and the arms, grippers, and parts all move, because every Xform is relative to its parent. Units are meters and the stage is Z-up throughout, so a link "two meters up" is literally at Z = 2.0 in its parent\'s frame.',
            hint: 'Longer path, deeper prim.',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
    {
      id: 'isx-l3-physics',
      title: 'Building a Scene That Can Fall',
      minutes: 5,
      xp: 40,
      narrative:
        'The physics wing is a liar: crates drift upward, and the floor turns out to be a painted picture. Rebuild a scene where gravity means something and contact is honest.',
      steps: [
        {
          kind: 'teach',
          heading: 'A scene that can fall',
          body:
            'Physics needs declarations, not just pictures. A **PhysicsScene** prim defines the physical world for the stage: gravity and solver settings live there. A **rigid body** is a prim the solver moves — it has mass and responds to forces. A **collider** is the collision shape attached to a prim, and collision is only detected between *pairs* of colliders.\n\nThat last sentence explains the wing\'s broken floor: a static ground never moves, but the crate bouncing on it still needs something to hit. Ground with graphics and no collider is a painted lie — rigid bodies fall straight through it.',
          keyPoints: [
            'PhysicsScene holds gravity and solver settings for the stage',
            'Rigid bodies have mass; colliders provide collision shapes',
            'Collision requires colliders on both participants — even static ground',
          ],
        },
        {
          kind: 'byte',
          text:
            'Maintenance note: the physics wing\'s famous "invisible wall" turned out to be a collider whose render mesh was hidden. The wall worked perfectly. Nobody could see why.',
        },
        {
          kind: 'teach',
          heading: 'What the solver does each step',
          body:
            'Run the simulation and, at a fixed timestep, the physics solver: (1) accumulates forces on each rigid body — gravity from the PhysicsScene, actuator efforts, existing contacts; (2) integrates motion forward; (3) detects which colliders overlap; (4) resolves those contacts so bodies rest, slide, and bounce instead of interpenetrating; (5) writes the new poses back to the prims you see in the viewport.\n\nEvery declaration you made feeds this loop: no PhysicsScene means no gravity, no collider means no contact, no mass means nothing to accelerate. Assembly research lives in this loop — contact resolution is exactly what makes a peg-in-hole insertion hard, and honest.',
          keyPoints: [
            'Each step: accumulate forces, integrate, detect contacts, resolve, update poses',
            'Simulation advances in fixed timesteps',
            'Missing declarations (scene, mass, colliders) silently remove physics effects',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'isx-q-scene',
            prompt:
              'Byte found the physics wing\'s scene-creation runbook with the steps shuffled. Restore the order for building a simulable assembly scene.',
            items: [
              {
                id: '1',
                text: 'Create a PhysicsScene prim — it defines gravity and solver settings for the stage',
                note: 'The world must be declared before anything can fall in it.',
              },
              {
                id: '2',
                text: 'Add a ground plane and give it a collider — a static surface rigid bodies can rest on',
                note: 'Static geometry still needs a collider to make contact.',
              },
              {
                id: '3',
                text: 'Add the parts — fixtures, bins, workpieces — as rigid bodies with mass',
                note: 'Mass gives the solver something to accelerate.',
              },
              {
                id: '4',
                text: 'Attach colliders to every part that must make or receive contact',
                note: 'Collision is detected only between pairs of colliders.',
              },
              {
                id: '5',
                text: 'Run the simulation and watch the solver pull, contact, and settle the scene',
                note: 'Now the fixed-timestep loop has honest inputs.',
              },
            ],
            explanation:
              'The order is dependency-driven: the PhysicsScene declares the world (gravity, solver), then colliding surfaces, then dynamic bodies and their colliders — because collision is only detected between pairs of colliders, a collider-less floor or part is invisible to contact. Only then does running the simulation give the solver something honest to integrate: gravity from the scene, mass from the bodies, contacts from the colliders.',
            hint: 'You cannot drop crates before the world they drop in exists.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'bughunt',
            id: 'isx-q-floor',
            prompt:
              'A new crate keeps falling through the inspection floor forever. The scene setup (pseudocode — names simplified, not real API calls) is below. Click the line where the root cause appears.',
            language: 'python',
            code:
              '# pseudocode - simplified scene setup\nscene = create_physics_scene(gravity = -9.81)\nfloor = add_ground_plane()          # visual floor mesh\ncrate = add_rigid_body(mesh = "crate.usd", mass = 2.0)\nadd_collider(crate)\nplay()',
            buggyLine: 3,
            causeOptions: [
              { id: 'a', text: 'Gravity is negative, which is invalid — gravity must be positive' },
              { id: 'b', text: 'The floor has no collider: collision is only detected between pairs of colliders, so the crate has nothing to land on and falls forever' },
              { id: 'c', text: 'The crate\'s mass is too small for the floor to notice' },
              { id: 'd', text: 'play() must be called before colliders take effect' },
            ],
            causeCorrectId: 'b',
            fixExplanation:
              'The floor was added as pure geometry. Give it a collider — static ground planes still need one — and the crate\'s collider finally has a partner: contacts appear, the solver resolves them, and the crate rests on the floor instead of sinking through the world.',
            fixedCode:
              '# pseudocode - fixed\nscene = create_physics_scene(gravity = -9.81)\nfloor = add_ground_plane()\nadd_collider(floor)                 # static, but still collidable\ncrate = add_rigid_body(mesh = "crate.usd", mass = 2.0)\nadd_collider(crate)\nplay()',
            explanation:
              'The solver only detects contact between **colliders**. A rigid body has dynamics but no collision shape until you attach one; a beautiful floor mesh with no collider is set dressing — the crate passes through as if it were not there. Static does not exempt geometry: the ground is the one prim every dropped part depends on, so it is exactly where the collider matters most. Gravity and mass were fine; the contact surface was fictional.',
            hint: 'The crate has a collider. Does the thing under it?',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
    {
      id: 'isx-l4-articulation',
      title: 'Articulations: Joints, DOFs, and Drives',
      minutes: 6,
      xp: 40,
      narrative:
        'The dual-arm assembly cell remembers its links now, but its joints are slack — the robots hang like puppets with cut strings. Give them articulation roots and drives, and they will move with intent.',
      steps: [
        {
          kind: 'teach',
          heading: 'One robot, one articulation',
          body:
            'A robot is not a pile of meshes. Mark one prim as the **articulation root**, and the solver treats everything beneath it — links connected by **joints** — as one articulated machine simulated as a unit. A **revolute** joint rotates (an elbow); a **prismatic** joint slides (a gripper finger). Count the independent joint motions and you have the robot\'s **degrees of freedom**: a 6-DOF arm has six, and the dual-arm cell has twelve plus grippers.\n\nThe articulation is also the handle your scripts use — you address the robot as one unit and then talk to its joints through it.',
          keyPoints: [
            'The articulation root makes a link-joint tree simulate as one machine',
            'Revolute joints rotate; prismatic joints slide',
            'Degrees of freedom = independent joint motions; scripts address the articulation, then its joints',
          ],
        },
        {
          kind: 'teach',
          heading: 'Targets vs direct state',
          body:
            'Simulated joints have two levers. The **drive layer** accepts commands — position targets and velocity targets — and each joint\'s drive converts the error between target and measured state into effort, so the arm accelerates against gravity and payload and settles like real hardware. Writing joint **state** directly instead teleports the robot: positions change, but no torque was applied and physics was bypassed — useful for placing a robot during scene setup, useless for studying assembly dynamics.\n\nThe flow for one command: set joint targets on the articulation, step physics, drives compute efforts, the solver integrates, joint state changes, you read the new state and decide again.',
          keyPoints: [
            'Position/velocity targets are setpoints chased by per-joint drives',
            'Direct state writes teleport the joint and bypass physics',
            'Command -> drive effort -> solver integration -> measured state -> next command',
          ],
        },
        {
          kind: 'byte',
          text:
            'The cell\'s vintage demo robot ignored its drives and had its joints written directly every frame. It looked incredibly strong. It could lift anything, because nothing was ever actually lifted.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'isx-q-targets',
            prompt:
              'To move the loaded elbow smoothly to 45 degrees, a teammate writes the elbow joint\'s position directly to 45.0 at every step, then complains the motion "looks fake and skips contact". What is actually wrong?',
            options: [
              { id: 'a', text: 'Nothing is wrong — writing joint state directly is the intended way to drive motion' },
              { id: 'b', text: 'Joint state writes teleport the joint; motion should be commanded as a position target so the joint drive computes real efforts and the arm moves through dynamics' },
              { id: 'c', text: 'Position targets exist only for prismatic joints; revolute joints must be written directly' },
              { id: 'd', text: 'The elbow must be detached from the articulation root before it can move' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'That is the trap: direct writes bypass the drive and the solver\'s response. Positions change, but no effort acts — no gravity sag, no payload strain, no contact push-back.',
              c: 'Backwards. Revolute and prismatic joints both have drives that accept position and velocity targets; direct writes are the special-purpose tool, not the default.',
              d: 'Joints are meaningless outside the articulation — detaching removes the very structure that simulates the arm as one machine.',
            },
            explanation:
              'Simulated joints distinguish **commanded state** from **measured state**. A position target is a setpoint the joint drive chases by computing effort — so the arm accelerates, sags under the payload, and settles, which is precisely the behavior assembly research needs to study. Writing the joint position directly is kinematic teleporting: fine for placing a robot during setup, wrong for studying motion. The teammate\'s "skipped contact" was the physics they accidentally disabled.',
            hint: 'Where does the torque come from in each approach?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'isx-q-drive',
            prompt:
              'Reconstruct Byte\'s minimal drive loop for the arm (pseudocode — names are simplified, not real API calls). Fill the blanks.',
            language: 'python',
            template:
              '# pseudocode - simplified names\narm = get_articulation("/World/Cell/Arm")\n\nwhile running:\n    arm.set_joint_{{b1}}_targets([0.0, 90.0, 45.0])\n    {{b2}}()                          # advance physics one fixed timestep\n    joints = arm.get_joint_positions()  # measured, not commanded\n    if close_to(joints, [0.0, 90.0, 45.0]):\n        running = False',
            blanks: [
              { id: 'b1', accept: ['position'], choices: ['position', 'state', 'mesh'] },
              { id: 'b2', accept: ['step'], choices: ['step', 'render', 'save'] },
            ],
            explanation:
              'The loop is the control pattern from the lesson: **command** (position targets for the drives), **step** (the solver integrates drives, gravity, and contacts one fixed timestep), then **read back measured joint positions**. Note the asymmetry — you never read your targets back, you read what physics actually did. That measured state feeds the next decision or your dataset. And this runs inside the Isaac Sim runtime on a workstation; the browser exercise you just did is the concept only.',
            hint: 'You command where you want the joints to go; you never command where they already are.',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
    {
      id: 'isx-l5-scripting',
      title: 'Scripting the Simulation Loop',
      minutes: 7,
      xp: 40,
      narrative:
        'The cell now responds to hand placement, but the research pipeline needs scripted, reproducible control loops. Reconstruct the lifecycle every Isaac Sim script follows — conceptually, precisely.',
      steps: [
        {
          kind: 'teach',
          heading: 'The lifecycle of a script',
          body:
            'Isaac Sim scripting follows a stable conceptual lifecycle. **Start** the application/runtime — physics and rendering stacks come up on the workstation GPU. **Set up** the world: open or build the stage, place the robot articulation, parts, and scene objects. **Reset**: snap everything to its defined initial state — robots homed, parts placed, physics buffers warmed — so every run starts identically. Then the **loop**: apply this cycle\'s commands, step physics one fixed timestep, read the resulting states, repeat. Finally, **shut down** cleanly.\n\nThe reset step is the one beginners skip. Without it, each run inherits whatever state the last one left behind — fatal for experiments that must be reproducible.',
          keyPoints: [
            'Lifecycle: start runtime -> set up world -> reset -> command/step/read loop -> shutdown',
            'Reset guarantees reproducible initial states across runs',
            'The loop body is: apply commands, step once, read measurements',
          ],
        },
        {
          kind: 'byte',
          text:
            'Byte\'s petition to run the Dome\'s simulation loop "inside a smartwatch for portability" was reviewed and respectfully denied. GPU requirements are GPU requirements.',
        },
        {
          kind: 'teach',
          heading: 'Inside the loop — and why not a browser',
          body:
            'Inside the loop, reading and writing are asymmetric by design: writes are *commands* (joint targets, object poses to reset), while reads are *measurements* (joint positions and velocities, contacts, sensor output) of what the solver actually did. A typical study logs joint state every step, compares it against the plan, and adjusts targets — closed-loop control in miniature.\n\nAn honesty note: all of this runs **inside the Isaac Sim application on a workstation** — GPU physics, GPU rendering, a native runtime. These browser exercises are conceptual; hands-on practice means installing Isaac Sim locally (NVIDIA\'s official docs cover hardware requirements and installation for your version).',
          keyPoints: [
            'Writes command; reads measure — never confuse targets with state',
            'Log, compare, adjust: the loop is closed-loop control in miniature',
            'Real practice requires a workstation with Isaac Sim installed',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'isx-q-lifecycle',
            prompt:
              'The research pipeline\'s control script lost its structure. Restore the conceptual lifecycle of an Isaac Sim script (concepts, not exact API calls).',
            items: [
              {
                id: '1',
                text: 'Start the Isaac Sim runtime — physics and rendering stacks come up on the workstation',
                note: 'Everything else needs the application running first.',
              },
              {
                id: '2',
                text: 'Set up the world: open or build the stage with the cell, robot, and parts',
                note: 'The scene must exist before it can be simulated.',
              },
              {
                id: '3',
                text: 'Reset: snap everything to the defined initial state and warm up physics',
                note: 'The guarantee that run 1 and run 100 start identically.',
              },
              {
                id: '4',
                text: 'Apply this cycle\'s commands — joint targets, any state resets',
                note: 'Writes are commands to drives and the scene.',
              },
              {
                id: '5',
                text: 'Step physics one fixed timestep',
                note: 'The solver integrates drives, gravity, and contacts.',
              },
              {
                id: '6',
                text: 'Read the resulting joint and object states; log, plan, repeat',
                note: 'Reads are measurements of what actually happened. Loop 4-6, then shut down cleanly.',
              },
            ],
            explanation:
              'This lifecycle — start, set up, reset, then a command-step-read loop — is the shape of essentially every Isaac Sim script, however the exact calls are spelled in your installed version. The reset step is the reproducibility guarantee: skip it and each run inherits the leftovers of the previous one, turning assembly-cycle measurements into anecdotes. The loop body is closed-loop control in miniature: command, integrate, measure, decide.',
            hint: 'Reproducibility lives in one easily skipped step before the loop.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'isx-q-readtiming',
            prompt:
              'Byte scripted the first cycle below (pseudocode). The joint positions are read before the first step. What does joints_now contain?',
            language: 'python',
            code:
              '# pseudocode\nworld.reset()                            # arm homed at start pose\narm.set_joint_position_targets([0.0, -30.0, 60.0])\njoints_now = arm.get_joint_positions()   # read BEFORE stepping\nworld.step()',
            choices: [
              'The targets [0.0, -30.0, 60.0], because the set call moved the joints there',
              'The positions as of the reset — the home pose; the targets are setpoints for the drives and nothing has moved until a step runs',
              'An error: reading joint state before the first step is not allowed',
              'The joint velocities, because position reads fall back to velocity data',
            ],
            correctIndex: 1,
            explanation:
              'Targets and state are different channels. Setting position targets hands setpoints to the joint drives; it does not move anything by itself. Motion happens when the solver steps and the drives convert error into effort. So a read taken immediately after reset returns the current *measured* state — the home pose from the reset. One step later, the same read would show the arm beginning to move toward the targets. Keeping "commanded" and "measured" separate in your head prevents most drive-loop bugs.',
            hint: 'Did the solver run between setting the targets and taking the reading?',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
    {
      id: 'isx-l6-ros2',
      title: 'The ROS 2 Bridge and Sim-to-Real',
      minutes: 7,
      xp: 50,
      narrative:
        'The final wing is the reason this facility exists: one control stack that drives either the simulator or the real assembly cell. Restore the bridge, and simulation and reality become interchangeable.',
      steps: [
        {
          kind: 'teach',
          heading: 'ROS 2 in ninety seconds',
          body:
            'ROS 2 organizes a robot system as **nodes** — small processes with one job each (planner, controller, camera driver) — communicating over typed **topics** (publish/subscribe streams) and **services** (synchronous request/response calls). For long-running work with progress and a result — "execute this assembly sequence" — ROS 2 provides **actions**: goal, feedback, result.\n\nThe division of labor with the dome: Isaac Sim computes the world; ROS 2 moves the messages. A well-written planner node neither knows nor cares whether its joint-state stream describes a simulated arm or the physical one.',
          keyPoints: [
            'Nodes are single-purpose processes; topics are pub/sub streams; services are request/response',
            'Actions cover long-running goals with feedback and a result',
            'Isaac Sim computes the world; ROS 2 carries the messages',
          ],
        },
        {
          kind: 'teach',
          heading: 'The bridge and sim-to-real',
          body:
            'The **ROS 2 Bridge** connects the halves. Outbound: as simulation steps, the bridge publishes robot state — joint states, poses, sensor data — on topics. Inbound: it subscribes to command topics and applies received commands to the simulated robot. Crucially, it also publishes **simulation time**: a clock that follows simulated steps rather than the wall clock, staying correct when the sim runs slower than real time or is paused.\n\nNow the sim-to-real pattern falls out: point your nodes at the standard interface and the **same ROS 2 graph** runs against Isaac Sim today and the physical cell tomorrow — the simulator and the robot are interchangeable behind identical topics.',
          keyPoints: [
            'The bridge publishes simulated state and applies incoming commands',
            'Simulation time tracks simulated steps, not the wall clock',
            'Identical interfaces make simulator and real robot interchangeable',
          ],
        },
        {
          kind: 'byte',
          text:
            'The restored bridge came online at 09:41. For one full second, simulated and real grippers opened in perfect sync, and the whole facility felt, briefly, like a well-written interface.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'isx-q-simtime',
            prompt:
              'Your grasp-planning node runs on wall-clock timers while driven through the ROS 2 Bridge. Today Isaac Sim runs at half real-time speed and gets paused during debugging. What is the correct fix?',
            options: [
              { id: 'a', text: 'No problem exists — ROS 2 silently forces every node\'s clock to match the simulator' },
              { id: 'b', text: 'Have the node use simulation time — the clock the bridge publishes, which follows simulated steps — so control periods stay in sync with physics even when the sim runs slow or pauses' },
              { id: 'c', text: 'Speed the simulation up to exactly real time; timing problems then disappear' },
              { id: 'd', text: 'Replace timers with fixed iteration counts; wall time and sim time never actually diverge' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Nothing is silent or automatic here: a node configured to use the system clock keeps using it, and its notion of "100 ms" stops matching the simulated world\'s.',
              c: 'You cannot always hit real time — heavy scenes solve and render slower. The fix is using the clock that tracks the simulation, not hoping the simulation tracks the clock.',
              d: 'Iteration counts ignore elapsed time entirely, so gains and filters tuned in seconds behave differently at every sim speed. Time-stamped data is what keeps control honest.',
            },
            explanation:
              'When your controller lives in the simulator\'s world, its clock must be the simulator\'s clock. The bridge publishes **simulation time** stamped from simulated steps: pause the sim and time pauses; run at half speed and a 10 ms control period still covers 10 simulated milliseconds. This is what keeps logs and control behavior comparable across sim runs — and it is the second half of sim-to-real readiness, next to the identical topic interface.',
            hint: 'Whose seconds are your gains tuned in?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'isx-q-path',
            prompt:
              'One control cycle of the sim-to-real cell has been scrambled on the whiteboard. Restore the data path as it flows through the bridge each cycle.',
            items: [
              {
                id: '1',
                text: 'The physics solver advances the simulation one fixed step',
                note: 'Motion starts in the world, not in the messages.',
              },
              {
                id: '2',
                text: 'The ROS 2 Bridge reads the robot\'s resulting joint states and sensor data',
                note: 'The bridge is the only reader of raw simulation state.',
              },
              {
                id: '3',
                text: 'The bridge publishes that state on standard topics, stamped with simulation time',
                note: 'Simulation state becomes ROS 2 messages.',
              },
              {
                id: '4',
                text: 'Your control node receives the state and computes the next command',
                note: 'The node only ever sees topics — never the simulator itself.',
              },
              {
                id: '5',
                text: 'The node publishes the command; the bridge subscribes and applies it to the simulated robot',
                note: 'Commands flow back through the same translator.',
              },
              {
                id: '6',
                text: 'The next step consumes the command — and with the simulator swapped for the real cell, the same path runs unchanged',
                note: 'The sim-to-real payoff: identical interface, different world.',
              },
            ],
            explanation:
              'Follow the arrows: physics produces state, the bridge turns state into messages, your node turns messages into commands, the bridge turns commands back into actuation. Every box touches only its neighbors through the ROS 2 interface — which is why simulator and physical robot are interchangeable. Unplug Isaac Sim, plug in the cell\'s hardware drivers publishing the same topics, and your research code does not change by a line.',
            hint: 'Start where motion actually comes from; end with the promise this whole pathway has been building toward.',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
    {
      id: 'isx-l7-sensors',
      title: 'Cameras & Sensor Data',
      minutes: 5,
      xp: 45,
      narrative:
        'The perception wing is wired but silent: camera feeds dark, and the one surviving label reads only "data". Bring the sensors up and learn what flows through them — and why the dome trusts simulated pixels.',
      steps: [
        {
          kind: 'teach',
          heading: 'Cameras in simulation',
          body:
            'Two virtual sensors do most perception work. An **RGB camera** renders the stage from a camera prim\'s pose — the simulated scene, photographed from anywhere, including from a wrist where no mounting engineer would ever drill. A **depth camera** produces a per-pixel distance image: for every pixel, how far the surface is. Because the renderer computes frames directly from scene data, every simulated frame ships with perfect ground truth — exact part poses, per-pixel depth, clean segmentation — with no labeling effort.\n\nThat is why perception research starts here: throw thousands of scenarios at a vision pipeline — occlusions, cluttered bins, lighting changes — and score it objectively against ground truth, with no hardware at risk and no labeling budget burned.',
          keyPoints: [
            'RGB cameras render the stage from a camera prim\'s pose; depth cameras emit per-pixel distance',
            'Simulated frames come with exact ground truth: poses, depth, segmentation',
            'Perception pipelines can be scored objectively across thousands of safe scenarios',
          ],
        },
        {
          kind: 'byte',
          text:
            'Perception lab log: the "broken" depth camera was pronounced healthy after three days — it had been producing a flawless depth map the entire time, viewed by a technician expecting ordinary photographs. The facility now labels every stream with its frame and its meaning.',
        },
        {
          kind: 'teach',
          heading: 'Frames: optical versus robot',
          body:
            'A camera reports what *it* sees, in the sensor\'s own coordinate frame — the **optical frame**, whose axes follow the image (columns, rows, and the viewing direction) rather than the robot\'s body conventions. The **robot frame** points where the base points. These frames disagree about which way is "forward", and they are separated by the camera\'s **mounting pose** — the extrinsic transform between them.\n\nSkip that transform and you get the classic perception bug: detections that are consistently offset or rotated, because a pose measured in the optical frame was fed to the planner as if it lived in the robot frame. The fix is a habit: label every pose with its frame, and transform deliberately — camera frame to robot frame, exactly once, at a known point in the pipeline.',
          keyPoints: [
            'Sensors report in their own optical frame; the robot frame follows the base',
            'The mounting pose is the extrinsic transform between sensor and robot frames',
            'Label every pose with its frame; transform deliberately, exactly once',
          ],
        },
        {
          kind: 'teach',
          heading: 'Collecting and watching the streams',
          body:
            'Conceptually, a camera in simulation behaves like a networked sensor: each frame is a message on a topic, stamped with **simulation time**, flowing through the **ROS 2 Bridge** exactly as joint state does — so a perception node cannot tell simulated frames from real ones. Collecting a dataset means recording those streams together with the ground truth only the simulator knows; visualizing means watching the live image and depth views while the cell runs, checking that what the robot "sees" matches what the stage contains.\n\nOne honesty note: capturing and visualizing real streams happens inside Isaac Sim on a workstation with it installed — these browser exercises cover the concepts only.',
          keyPoints: [
            'Frames flow as topics through the ROS 2 Bridge, stamped with simulation time',
            'Datasets pair the streams with the ground truth only the simulator knows',
            'Real capture and visualization need a workstation with Isaac Sim installed',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'isx-q-groundtruth',
            prompt:
              'The perception lead asks why the vision pipeline for bin picking should be tested first on simulated camera data. What is the strongest argument?',
            options: [
              { id: 'a', text: 'Simulated images are simplified cartoons, so any detector that passes in sim is guaranteed to work on real images' },
              { id: 'b', text: 'Simulated cameras never need mounting or calibration, so calibration problems disappear entirely' },
              { id: 'c', text: 'Every frame comes with exact ground truth — true depth, true part poses, clean segmentation — so the pipeline can be scored objectively and safely before any hardware exists' },
              { id: 'd', text: 'Simulated rendering is faster than real sensors, so datasets collect themselves at zero cost' },
            ],
            correctId: 'c',
            optionNotes: {
              a: 'Simplified images guarantee nothing about real performance — the difference between simulated and real appearance is its own perception sim-to-real gap, which is exactly why testing must continue on hardware.',
              b: 'Virtual cameras have exact virtual mountings, yes — but your pipeline still needs the modeled extrinsics, and a real deployment still needs real calibration. Nothing disappears.',
              d: 'Rendering thousands of frames costs real GPU time. The wins are safety and perfect labels — not zero cost.',
            },
            explanation:
              'The superpower of simulated sensing is **free, exact ground truth**: the renderer knows every part\'s true pose and every pixel\'s true depth, so every frame arrives pre-labeled. That turns perception testing into measurement — score the pipeline objectively across thousands of staged scenarios, fail safely, iterate — before a single real camera is mounted. Two caveats to carry forward: simulated images still differ from real ones (a sim-to-real gap for perception too), and virtual cameras still have a mounting pose your frame transforms must respect.',
            hint: 'What does the simulator know about every frame that a real camera setup must pay for?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'isx-q-campath',
            prompt:
              'One cycle of the perception wing\'s data path is scrambled on the whiteboard. Restore it: order the steps a single camera frame takes from simulation to planned motion.',
            items: [
              {
                id: '1',
                text: 'The simulation steps and the scene is rendered from the camera prim\'s pose',
                note: 'A frame exists only after the world and the view are simulated.',
              },
              {
                id: '2',
                text: 'The camera produces the frame — RGB or per-pixel depth — with exact ground truth attached',
                note: 'In simulation the labels are free and perfect.',
              },
              {
                id: '3',
                text: 'The ROS 2 Bridge publishes the frame as an image message stamped with simulation time',
                note: 'The same path joint state took in the bridge lesson, carrying images instead.',
              },
              {
                id: '4',
                text: 'The perception node detects the part and computes its pose in the camera\'s optical frame',
                note: 'Detections are born in the sensor\'s own frame.',
              },
              {
                id: '5',
                text: 'The node transforms the pose into the robot frame and publishes the grasp target',
                note: 'The mounting (extrinsic) transform is applied here, exactly once.',
              },
              {
                id: '6',
                text: 'The planner consumes the robot-frame pose and plans the next assembly motion',
                note: 'The same planner could run unchanged on real camera topics.',
              },
            ],
            explanation:
              'Follow a frame from photons to plan: the world is simulated and rendered from the camera\'s pose, the sensor produces RGB or depth with ground truth attached, the bridge publishes it as a time-stamped image message, perception computes a pose — in the camera\'s optical frame — the extrinsic transform moves it into the robot frame, and the planner consumes it. The shape is identical to the control path you restored in the bridge lesson, just carrying images instead of joint states, which is why swapping the simulated camera for a real one changes nothing downstream.',
            hint: 'You cannot detect a part in a frame that has not been rendered yet — and a pose must change frames before the planner can use it.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'bughunt',
            id: 'isx-q-frames',
            prompt:
              'Operators report that the wrist camera\'s grasp targets land consistently offset from the actual parts — same offset every time. The node below (pseudocode — names simplified, not real API calls) is suspected. Click the line where the root cause appears.',
            language: 'python',
            code:
              '# pseudocode - wrist-camera grasp node\nwhile running:\n    image = read_camera_topic()\n    det = detect_part(image)      # pose expressed in the CAMERA optical frame\n    pose_robot = det.pose         # passed to the planner unchanged\n    plan_grasp(pose_robot)',
            buggyLine: 5,
            causeOptions: [
              { id: 'a', text: 'The camera publishes too many frames per second, so the detections lag behind the parts' },
              { id: 'b', text: 'The detection pose is in the camera\'s optical frame and is used as if it were already in the robot frame — the mounting (extrinsic) transform was never applied' },
              { id: 'c', text: 'Depth cameras cannot measure poses, so detect_part must be returning noise' },
              { id: 'd', text: 'The planner should have transformed the part instead — poses never need explicit frame labels' },
            ],
            causeCorrectId: 'b',
            fixExplanation:
              'The detection was measured in the camera\'s optical frame but consumed as if it lived in the robot frame. Insert the mounting transform — camera frame to robot frame, applied exactly once at a known point in the pipeline — and the grasp target lands where the part actually is. The constant offset vanishes because it was the constant geometric difference between the two frames.',
            fixedCode:
              '# pseudocode - fixed\nwhile running:\n    image = read_camera_topic()\n    det = detect_part(image)      # pose expressed in the CAMERA optical frame\n    pose_robot = camera_to_robot(det.pose)   # apply the mounting transform\n    plan_grasp(pose_robot)',
            explanation:
              'Every sensor measurement is born in the sensor\'s own coordinate frame, and an optical frame\'s axes follow the image, not the robot\'s body conventions. A pose is meaningless — or consistently offset — until it is expressed in the frame the consumer expects. The offset the operators saw was not noise or latency; it was the fixed rotation and translation of the camera mount, applied to every detection. Label poses with their frames and transform deliberately.',
            hint: 'In whose coordinate frame was the detection born — and whose frame does the planner expect?',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
    {
      id: 'isx-l8-simreal',
      title: 'The Sim-to-Real Gap',
      minutes: 6,
      xp: 50,
      narrative:
        'The airlock to the physical cell bay stands open. Everything rehearsed in the dome must now survive dust, friction, and delay — the difference between a world and a model of it.',
      steps: [
        {
          kind: 'teach',
          heading: 'Why perfect-in-sim fails on hardware',
          body:
            'The simulator is a **model**, and models are exact about the wrong things. Four gaps bite hardest in assembly work. **Contact dynamics**: real surfaces deform and gear backlash exists; the solver\'s contact is stiffer and cleaner. **Friction**: simulated friction coefficients are tidy constants; real ones vary with wear, dust, and lubrication. **Latency**: a real cell has sensor, network, and drive delays that an ideal sim loop never imposed. **Calibration**: the simulator knows every pose exactly; real encoders and camera mounts drift by millimeters.\n\nA controller tuned to perfection on the idealized world tends to sit at the edge of what reality tolerates — flawless in sim, jamming every third insertion on hardware. The gap is not a bug in your code; it is the difference between the world and your model of it.',
          keyPoints: [
            'The gap: idealized contact, constant friction, missing latency, perfect calibration',
            'Controllers tuned to sim exactness sit at the edge of what hardware tolerates',
            'The gap is a modeling difference, not a coding bug',
          ],
        },
        {
          kind: 'teach',
          heading: 'Domain randomization',
          body:
            '**Domain randomization** attacks the gap directly: instead of tuning the simulation to one ideal setting, deliberately vary the uncertain parameters every run — friction coefficients, part masses, sensor delays, lighting and appearance for vision — across the plausible range. Then demand success across the whole distribution, not on one lucky configuration.\n\nA controller that works for every sampled friction value cannot be exploiting the simulator\'s exact constant; it has to succeed the way hardware demands: robustly. The same idea powers robot learning — Isaac Lab workflows randomize environments across many parallel simulated runs so a learned policy transfers past the sim boundary. Conceptually the same goal, whether the thing being robustified is hand-tuned gains or a trained network.',
          keyPoints: [
            'Vary uncertain parameters every run across the plausible range',
            'Require success across the whole distribution, not one setting',
            'Same principle for hand-tuned controllers and Isaac Lab-trained policies',
          ],
        },
        {
          kind: 'byte',
          text:
            'Maintenance legend: a controller tuned with exactly zero sensor delay reigned over the sim for a semester. On hardware it kept grasping parts the cell had not finished presenting. The parts were fine. The model\'s timing was fiction.',
        },
        {
          kind: 'teach',
          heading: 'Closing the loop with measured data',
          body:
            'Randomization builds robustness; **validation** builds trust. The procedure: run the identical assembly script in simulation and on the real cell, record both — trajectories, contact forces, cycle timing — then compare, quantity by quantity. Where sim and measurement disagree (the peg sinks two millimeters, the cycle takes 80 milliseconds longer), adjust the model: friction values, latency budgets, masses. Repeat until the simulator predicts the cell within your research\'s tolerance. Only then do sim predictions for *new* sequences deserve weight.\n\nTiming deserves special care in synchronized dual-arm cells: stamp everything with one time reference, measure end-to-end latency honestly, and budget it — two arms coordinated on assumptions sim never tested will teach you about collision, expensively.',
          keyPoints: [
            'Validation: identical script in both worlds, record both, compare quantity by quantity',
            'Adjust friction, masses, and latency budgets until the measured gap is inside tolerance',
            'Synchronized cells need one time reference and an honest latency budget',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'isx-q-gapwhy',
            prompt:
              'A dual-arm insertion controller is flawless across 200 simulated runs. On hardware, the peg jams roughly one attempt in three. What is the best explanation — and the right first response?',
            options: [
              { id: 'a', text: 'The ROS 2 topics on hardware have different names, so the controller receives stale data' },
              { id: 'b', text: 'The simulator is a model: its contact, friction, and timing are idealized, so a controller tuned to sim exactness sits at the edge of what the real cell tolerates — quantify the gap and validate sim against measured robot data' },
              { id: 'c', text: 'The real robot has fewer degrees of freedom than the simulated one, so the planner is under-constrained' },
              { id: 'd', text: 'Simulation time and wall time are identical in both worlds by definition, so timing cannot be involved' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'The interface is the part that works: the bridge gave sim and hardware identical topics by design. The controller ran — its behavior, not its wiring, went wrong.',
              c: 'The real cell has exactly the degrees of freedom it always had. Nothing about the failure suggests missing joints; the peg jams during contact, which is physics, not kinematics.',
              d: 'Backwards twice over: real systems add latency that sim may not model, and simulation time follows simulated steps rather than guaranteeing wall-clock equality. Timing is one of the classic gaps, not a non-issue.',
            },
            explanation:
              'This is the **sim-to-real gap** by its textbook definition: the simulator\'s contact, friction, and timing are idealized, and a controller tuned to that idealization has no reserve for reality\'s messiness — deforming surfaces, drifting friction, real latencies, calibration drift. The response is not to distrust simulation but to quantify it: validate sim against measured robot data (same script in both worlds, compare), and use domain randomization so the controller must succeed across a spread of conditions, not one ideal point. The ROS 2 interface, meanwhile, is the part that did transfer — the same nodes ran; the world underneath them differed.',
            hint: 'Which option names a difference between the world and the model, rather than a failure of the wiring?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'isx-q-gapval',
            prompt:
              'The whiteboard\'s sim-to-real validation procedure for the insert step has been scrambled. Restore the order of the validation loop.',
            items: [
              {
                id: '1',
                text: 'Run the identical assembly script in simulation; log predicted trajectories, contact forces, and cycle timing',
                note: 'Simulation first gives you the claims to check.',
              },
              {
                id: '2',
                text: 'Run the same script on the real cell; record measured joint trajectories, forces, and timing',
                note: 'Ground truth for the comparison comes from hardware.',
              },
              {
                id: '3',
                text: 'Compare prediction against measurement, quantity by quantity, and quantify each gap',
                note: 'Two millimeters of sink, 80 milliseconds of extra cycle time: numbers, not vibes.',
              },
              {
                id: '4',
                text: 'Adjust the simulation model where the gaps are largest — friction, masses, latency budgets',
                note: 'Close the measured gaps, not imagined ones.',
              },
              {
                id: '5',
                text: 'Repeat until sim and real agree within tolerance; only then trust sim predictions for new sequences',
                note: 'Validation is a loop, not a checkbox.',
              },
            ],
            explanation:
              'This is model validation as a loop: identical script in both worlds, honest comparison quantity by quantity, model adjustments where they disagree, repeat until the gap is inside your tolerance. The order matters — recording the real cell before comparing tells you *what* to fix in sim, and only a quantified gap can be closed. Once sim predicts the cell within tolerance, its predictions for new sequences earn trust — which is the research value the next lesson\'s digital twin formalizes.',
            hint: 'You cannot compare a prediction to a measurement you have not recorded yet.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'isx-q-randsweep',
            prompt:
              'Restore Byte\'s robustness sweep for the insert step (pseudocode — names simplified, not real API calls). Fill the blanks.',
            language: 'python',
            template:
              '# pseudocode - robustness sweep for the peg-insert step\nfor trial in many_trials:\n    friction = {{b1}}_in_range(0.2, 1.0)      # vary it, never fix it\n    part_mass = sample_in_range(0.3, 0.8)\n    sensor_delay_s = sample_in_range(0.0, 0.03)\n    ok = run_insertion_once()\n    record(trial, ok)\n\nready = {{b2}}(ok_records)    # what must hold across the WHOLE range?',
            blanks: [
              { id: 'b1', accept: ['sample'], choices: ['sample', 'fix', 'plot'] },
              { id: 'b2', accept: ['all'], choices: ['all', 'any', 'last'] },
            ],
            explanation:
              'Domain randomization in three moves: **sample** each uncertain parameter from its plausible range every trial (fixing it recreates the idealized simulation that fails on hardware), run the behavior, and require success **across the whole range** — all, not any and not just the most recent trial. A controller that survives every sampled friction, mass, and delay cannot be exploiting the simulator\'s exact defaults; it is robust in the way hardware demands. The same principle drives Isaac Lab training runs, where many parallel environments are randomized so learned policies transfer past the sim boundary.',
            hint: 'A controller robust to every sampled value must succeed in every trial — which word says that?',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
    {
      id: 'isx-l9-digitaltwin',
      title: 'Digital Twins & Project Workflow',
      minutes: 6,
      xp: 45,
      narrative:
        'The last wing of the dome. The twin console must mirror the real cell across the bay — live, honest, and gated — so hardware only ever sees sequences that already behaved.',
      steps: [
        {
          kind: 'teach',
          heading: 'What makes it a twin',
          body:
            'A **digital twin** is a live-synced virtual counterpart of a physical system: state flows in from the real cell continuously — joint positions, sensor readings, task status — and the virtual counterpart stays current enough to be useful. Predictions flow back out: rehearse the next sequence, test a layout change, ask "what happens if".\n\nThe sync is the definition. A USD scene exported once for a paper figure is a **model**; a digital twin is a model plus an ongoing relationship with reality. In this facility the relationship rides the same interface as everything else: the real cell publishes state on ROS 2 topics, the twin consumes them, and validated plans flow back the other way.',
          keyPoints: [
            'A digital twin is a virtual counterpart kept live-synced with the physical system',
            'State flows in continuously; rehearsals and predictions flow back out',
            'Without ongoing synchronization you have a model, not a twin',
          ],
        },
        {
          kind: 'byte',
          text:
            'The twin\'s first live sync caught the real gripper open while its virtual counterpart closed. Not a bug — an operator in the bay had hit the physical e-stop. The twin knew before the control room did.',
        },
        {
          kind: 'teach',
          heading: 'Project structure and the URDF-to-USD path',
          body:
            'A maintainable simulation project separates concerns the way USD layers do: the robot\'s description, the cell layout, and the experiment configuration stay in separately versioned pieces, composed into working stages — so updating the robot model does not smear edits across every experiment.\n\nRobots usually arrive described in **URDF**, the robot-description format from the ROS ecosystem: links, joints, kinematics. Isaac Sim\'s stage format is **USD**, so the standard workflow is to import/convert the URDF into USD, then inspect and complete the result on the stage — colliders, joint drives, the articulation root — before trusting it physically. Verify the exact import workflow against the documentation for your installed version; the concept — description format in, physics-ready USD out — is stable.',
          keyPoints: [
            'Separate robot description, cell layout, and experiment config; compose them per run',
            'URDF carries the robot\'s links and joints; conversion brings it onto the stage as USD',
            'After conversion, inspect and complete colliders, drives, and the articulation root',
          ],
        },
        {
          kind: 'teach',
          heading: 'Testing before hardware',
          body:
            'The payoff workflow is the **pre-flight check**: before any new assembly sequence touches hardware, rehearse it on the twin — reachability of every waypoint, collisions along every path, timing of the synchronized sections, gripper clearances. Failures cost a simulation run, not a collision.\n\nGate hardware on simulation: if the rehearsal finds an unreachable waypoint, the sequence does not load onto the cell until it passes virtually. Combined with the sim-vs-real validation from the previous lesson, the twin becomes the facility\'s safety interlock — the place where mistakes are cheap, and the reason the real cell only ever sees sequences that already behaved.',
          keyPoints: [
            'Rehearse every new sequence on the twin: reach, collisions, timing, clearances',
            'A failed rehearsal blocks the hardware run until the sequence passes virtually',
            'The twin plus validation makes simulation the safety interlock for hardware',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'isx-q-twindef',
            prompt:
              'A visiting professor points around the dome and asks which artifact actually qualifies as a digital twin of the assembly cell.',
            options: [
              { id: 'a', text: 'A USD scene exported once for a conference figure — accurate at export time, never updated since' },
              { id: 'b', text: 'A simulation kept live-synced with the physical cell: real state flows in over ROS 2 topics, plans are rehearsed virtually, and validated commands flow back out' },
              { id: 'c', text: 'The manufacturer\'s CAD drawing of the robot arm, archived as a PDF' },
              { id: 'd', text: 'Isaac Lab, because every digital twin needs a robot-learning framework' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Accurate at export time and frozen ever after: that is a one-time model. Without a live state relationship, there is no twin.',
              c: 'A CAD drawing holds geometry, not state. It cannot reflect what the cell is doing right now, which is the twin\'s entire job.',
              d: 'Category confusion: Isaac Lab is a robot-learning framework layered on top of Isaac Sim. Twins are defined by synchronization, not by learning frameworks.',
            },
            explanation:
              'The defining property is **ongoing synchronization**: state flows in from the physical cell continuously, and the virtual side stays current enough to rehearse, predict, and gate hardware decisions. Strip the sync and you still have a lovely model — for a paper figure — but not a twin. Isaac Lab, meanwhile, is a robot-learning framework on top of Isaac Sim; it is neither required for nor defined by twinning. And the ROS 2 topics in the correct option are the same interface pattern you restored in the bridge lesson — the twin is one more consumer of honest, time-stamped state.',
            hint: 'Ask which artifact is still exchanging state with the cell right now.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'isx-q-urdfpipe',
            prompt:
              'The twin console\'s robot bring-up pipeline has been scrambled. Restore the order, from the robot\'s description file to a validated hardware run.',
            items: [
              {
                id: '1',
                text: 'Start from the robot\'s URDF description — links, joints, and kinematics from the ROS ecosystem',
                note: 'The description format robots commonly ship with.',
              },
              {
                id: '2',
                text: 'Import/convert the URDF into USD so the robot appears on the stage as prims',
                note: 'Description format in, USD scene graph out.',
              },
              {
                id: '3',
                text: 'Inspect and complete the converted robot: colliders, joint drives, articulation root, units',
                note: 'Conversion gets structure; physics readiness is verified, not assumed.',
              },
              {
                id: '4',
                text: 'Compose the validated robot into the cell — robot description, cell layout, and experiment config layered together',
                note: 'Separate concerns, versioned separately, composed into one working stage.',
              },
              {
                id: '5',
                text: 'Rehearse the target assembly sequence in simulation: reachability, collisions, timing',
                note: 'Mistakes here are cheap.',
              },
              {
                id: '6',
                text: 'Only after a clean simulated run, load the same sequence onto the physical cell',
                note: 'Hardware sees sequences that already behaved.',
              },
            ],
            explanation:
              'The pipeline converts descriptions into physics-ready stages: URDF carries the robot\'s kinematic description in from the ROS ecosystem, conversion brings it onto the stage as USD prims, and — critically — the result still needs inspection and completion: colliders, joint drives, the articulation root, sane units. Only then does the robot join the composed cell and earn a rehearsal, and only a clean rehearsal earns a hardware run. Exact import tooling varies across releases, so check the official documentation for your installed version; the concept and the gate at the end are stable.',
            hint: 'Description first, geometry on stage second; physics completion before composition; hardware strictly last.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'isx-q-preflight',
            prompt:
              'The pre-flight gate below guards the cell (pseudocode). The twin\'s rehearsal just reported an unreachable waypoint. What happens?',
            language: 'python',
            code:
              '# pseudocode - pre-hardware gate for the assembly cell\ntwin.sync_with(real_cell_state)   # live state flows in from the cell\nplan = planner.next_sequence()\nresult = twin.rehearse(plan)      # simulated trial, no hardware touched\nif result.has_collisions or result.unreachable:\n    print("BLOCKED: fix the sequence in simulation first")\nelse:\n    send_plan_to_hardware(plan)',
            choices: [
              'The plan is sent to hardware with the unreachable waypoint flagged as a warning',
              '"BLOCKED: fix the sequence in simulation first" is printed, and no plan reaches the hardware this run',
              'The twin silently repairs the plan, and hardware receives a corrected version',
              'An exception, because rehearsal results may not be inspected before sending plans',
            ],
            correctIndex: 1,
            explanation:
              'The rehearsal result satisfies the guard condition, so the blocked branch runs: the message prints and the hardware call — in the else branch — never executes. Note what the twin does *not* do: it never edits or repairs the plan; it is a gate, not a fixer. The sequence goes back to the engineer, gets corrected, and must pass rehearsal before hardware sees it. That one-way gate — hardware only ever receives plans that already behaved virtually — is the entire safety value of the pre-flight workflow.',
            hint: 'Trace which branch runs when the if-condition is true — and what is in the other branch.',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
    {
      id: 'isx-l10-simtesting',
      title: 'Simulation Testing & Validation',
      minutes: 6,
      xp: 45,
      narrative:
        'A physics tweak landed last week and quietly changed the assembly cycle time by four percent. Nobody noticed for six days. The Simulation Dome now wants what every mature lab has: tests for the simulation itself.',
      steps: [
        {
          kind: 'teach',
          heading: 'Regression tests, but for a simulation',
          body:
            'Every time you touch a scene — swap a robot, adjust a joint stiffness, move a fixture — you quietly change physics. A **regression simulation** catches that: run the same scripted scenario (same sequence, same start state) and compare the outcomes against a recorded baseline, the **golden run**. The compared quantities are numbers, not vibes: task completed yes/no, final object poses, cycle time, peak forces, collision count.\n\nThe loop is identical in spirit to software unit testing: define success criteria once, record the golden values, and after every change re-run and diff. It converts "hmm, does it still work?" — which nobody runs — into a two-minute check that runs before anyone builds on the broken scene.',
          keyPoints: [
            'Golden run = recorded metrics from a validated scenario',
            'Compare: success flag, final poses, timing, forces, collisions',
            'Every scene/physics change gets a re-run and a diff',
          ],
        },
        {
          kind: 'byte',
          text: 'The old archive, entry 4,412: "scene fix, cycle time improved by 40%". It had not improved. The fixture had sunk three centimeters into an un-typed floor. Celebrate metric changes; audit them harder.',
        },
        {
          kind: 'teach',
          heading: 'Drift, tolerances, and re-baselining',
          body:
            'Simulations are deterministic only if everything is held fixed — and physics solvers can still amplify tiny differences through contact. So comparisons use **tolerance bands**, not byte equality: "cycle time within ±2%, final pose within ±5 mm". A drift inside the band is noise; outside it is a finding. Either your change altered behavior (a regression to fix) or the world changed on purpose (a re-baseline).\n\n**Re-baselining** means recording a new golden run because you *intended* the change — new gripper, tuned friction. The discipline is that re-baselines are deliberate, reviewed decisions, never "the numbers moved so I moved the target". And once scenarios are scripted, they can run unattended — labs wire them into nightly pipelines so a broken scene is found by morning, not mid-experiment. For the mechanics of running Isaac Sim without its UI, keep it conceptual and check the official documentation for your version.',
          keyPoints: [
            'Compare with tolerance bands; drift outside the band is a finding',
            'Re-baseline only for intentional, reviewed changes',
            'Scripted scenarios can run unattended (nightly validation)',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'isx-q-regloop',
            prompt: 'Order the simulation regression loop for a dual-arm assembly scenario.',
            items: [
              { id: '1', text: 'Define success criteria and tolerances (poses, timing, no collisions)', note: 'You cannot diff against a baseline you never defined.' },
              { id: '2', text: 'Run the scripted scenario and record the golden metrics', note: 'The baseline, captured from a scene known to be good.' },
              { id: '3', text: 'Change the scene (swap a gripper, tune friction)', note: 'The thing being tested.' },
              { id: '4', text: 'Re-run the identical scenario', note: 'Same inputs, so any difference comes from the change.' },
              { id: '5', text: 'Diff metrics against the golden run within tolerances', note: 'Inside: ship it. Outside: investigate or re-baseline deliberately.' },
            ],
            explanation:
              'This is the physics-engineering twin of test-driven development: define expected behavior, freeze it as a baseline, and make every change argue its innocence against that baseline. Step 5 is where engineering judgment lives — a 1% timing drift and a 30 mm pose error are not the same finding, and the tolerances you chose in step 1 decide which is which.',
            hint: 'Baselines come before changes, and comparisons come after re-runs.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'isx-q-drift',
            prompt:
              'Your golden run says cycle time 41.20 s. After raising a fixture 5 mm, the scenario runs 41.35 s (+0.4%), all poses within tolerance, collisions zero. Your tolerance is ±2%. Correct call?',
            options: [
              { id: 'a', text: 'Regression — any timing change after a scene edit means the scene is broken' },
              { id: 'b', text: 'Within tolerance: the drift is noise-level, no action needed beyond noting it' },
              { id: 'c', text: 'Re-baseline immediately — the golden run is now invalid' },
              { id: 'd', text: 'Ignore it entirely — timing metrics are not worth recording' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'That policy makes every scene change unshippable. Contact-rich simulations wobble inside their tolerance bands; the band exists precisely to absorb that.',
              c: 'Re-baselining erases the signal. You re-baseline when you *intended* a behavior change — a 0.4% wobble within tolerance is not that.',
              d: 'The exact opposite lesson: this finding was only visible because timing was recorded. Drop the metric and the next 40% drift ships silently.',
            },
            explanation:
              'The tolerance band did its job: +0.4% is inside ±2%, poses are clean, no collisions — so the scene remains valid, and the golden run stands. The judgment you practiced: treat bands as decisions made in advance, so nobody debates "is 0.4% a problem?" after the fact. had it been +5%, the finding would be real and the diff would point at the fixture you moved.',
            hint: 'The band was set before the change precisely so this decision would be mechanical.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'isx-q-goldenassert',
            prompt: 'The validation script checks cycle time against the golden run (pseudocode). Complete the comparison.',
            language: 'python',
            template:
              '# pseudocode - one regression check\nGOLDEN_CYCLE_S = 41.20\nTOLERANCE_S = 0.80\n\ncycle_s = run_scenario(scenario)\nassert abs(cycle_s - GOLDEN_CYCLE_S) < {{b1}}\nassert scenario.{{b2}} == True  # nothing clipped, nothing stuck',
            blanks: [
              { id: 'b1', accept: ['tolerance_s', 'tolerance'], choices: ['TOLERANCE_S', 'GOLDEN_CYCLE_S', 'cycle_s'] },
              { id: 'b2', accept: ['collisions'], choices: ['collisions', 'cycle_s', 'tolerance'] },
            ],
            explanation:
              'Two checks cover the two failure families: **timing** (abs diff against the golden value, bounded by tolerance) and **collisions** (a flat boolean — zero means zero, there is no "small collision"). Together with pose checks they form the minimal regression triple for an assembly scenario. Note the assert style: the test fails loudly and names the metric, instead of logging a number a human must remember to compare.',
            hint: 'First blank: what bounds the allowed difference? Second: which metric is pass/fail rather than numeric?',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
    {
      id: 'isx-l11-performance',
      title: 'Real-Time Factors & Performance',
      minutes: 6,
      xp: 45,
      narrative:
        'The twin rehearsal runs slower than the real cell — and someone proposed "fixing" it by speeding up the robot. Before anyone touches the hardware plan, the Dome wants the room to understand sim time versus wall time.',
      steps: [
        {
          kind: 'teach',
          heading: 'Sim time vs wall time',
          body:
            'A physics engine does not flow like time — it **steps**: fixed-size slices (for example 1/60 s) advanced one at a time, solving contacts and integrating motion each step. Ten thousand steps of 1/60 s is 166.7 *simulated* seconds, no matter how long the computer took to chew through them.\n\nThe **real-time factor (RTF)** is the ratio of simulated time to wall-clock time: RTF 1.0 means the simulation keeps pace with reality, RTF 0.5 means each real second advances the world half a second, RTF 4 means four simulated seconds per real second. RTF is a *performance* property of the machine and scene — it does not change the physics results, only how long you wait for them.',
          keyPoints: [
            'Physics advances in fixed-size steps; sim time = steps × step size',
            'RTF = sim time ÷ wall time; it measures speed, not correctness',
            'Heavy scenes render fewer sensors/objects faster; headless helps',
          ],
        },
        {
          kind: 'byte',
          text: 'A visiting professor once watched a rehearsal at RTF 0.3 and pronounced the whole cell "too slow for production". The cell, which had never been consulted, continued to run at exactly 1.0.',
        },
        {
          kind: 'teach',
          heading: 'When RTF matters — and when it does not',
          body:
            'For **interactive** uses — teleoperation, a human watching a digital twin track the real cell, an operator in the loop — you need RTF near 1.0, or the twin falls behind reality and the illusion (and sometimes the safety case) breaks. For **batch** uses — generating 10,000 camera frames for a perception dataset, sweeping 50 randomization seeds overnight — RTF 0.2 is perfectly fine: the data is identical, you simply wait longer. Those batch jobs typically run **headless** (no viewport rendering), which is dramatically cheaper and is why data-generation rigs rarely look like gaming PCs.\n\nThe engineering habit: decide per workload whether you need real time or just correct time. Tuning a controller against a sim that runs at the wrong rate *matters* only when the controller assumes wall-clock timing — rate-dependent control is a real coupling, and one more reason to verify timing assumptions against the official documentation for your Isaac Sim version.',
          keyPoints: [
            'Interactive work wants RTF ≈ 1; batch work only wants correct results',
            'Headless (viewport-free) runs are the batch-work accelerator',
            'Rate-dependent control is where sim/wall timing truly couples',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'isx-q-simtime-calc',
            prompt: 'A validation script steps the world 300 times with a fixed step of 1/120 s, and the machine is slow (RTF 0.25). How much *simulated* time has passed when it finishes?',
            language: 'python',
            code: '# pseudocode\nDT = 1 / 120  # fixed physics step\nfor step in range(300):\n    world.step()  # advances exactly DT of simulated time',
            choices: [
              '2.5 s of simulated time (300 steps takes 10 s of wall time at RTF 0.25)',
              '1200 s of simulated time (RTF divides the step count)',
              '2.5 s — 300 × (1/120) = 2.5 simulated seconds; RTF only changed how long the wait felt',
              '1.2 s of simulated time (RTF multiplies the step size)',
            ],
            correctIndex: 2,
            explanation:
              'Simulated time is **steps × step size** = 300 × (1/120) = 2.5 s, full stop. RTF 0.25 means the 2.5 s of simulated time took about 10 s of wall-clock waiting — it changes your coffee break, not the physics. The wrong answers all smuggle in the same misconception: letting wall-clock speed alter simulated time. The step size and step count fix simulated time; the machine fixes how patiently you must sit.',
            hint: 'Separate the two clocks: how much time passed *in the world*, and how long did the computer take to compute it?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'isx-q-rtf-use',
            prompt: 'Two jobs on one workstation. Job A: teleoperate a simulated arm through a new fixture. Job B: generate 50,000 depth images overnight. What performance does each need?',
            options: [
              { id: 'a', text: 'Both need RTF ≈ 1.0 — simulated time must always match wall time' },
              { id: 'b', text: 'A wants RTF ≈ 1.0 so control feels real; B does not care — headless at RTF 0.2 produces identical data, just slower' },
              { id: 'c', text: 'B needs RTF > 1.0 to be useful; A does not care about timing at all' },
              { id: 'd', text: 'Neither cares — RTF affects rendering quality, not simulation results' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Blanket RTF 1.0 wastes half the workstation\'s value: Job B would need an expensive real-time machine to produce byte-identical images more slowly in wall time.',
              c: 'Both halves are backwards: teleoperation is exactly where timing matters, and batch generation happily runs below real time.',
              d: 'RTF says nothing about image quality — correct — but it is the difference between a usable teleop session and a slide show. The results are the same; the *uses* are not.',
            },
            explanation:
              'Match the real-time requirement to the workload: **interactive** (a human or a live twin in the loop) needs RTF near 1.0; **batch** (data generation, parameter sweeps) only needs correctness, and headless execution at any RTF delivers that. This is why labs dedicate beefy interactive machines to teleop and let cheap headless boxes chew through datasets overnight.',
            hint: 'Ask for each job: is a human or a live system consuming the output *as it is produced*?',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
    {
      id: 'isx-a1-usd-hierarchy',
      title: 'Engineering Mission: The Detached Gripper',
      minutes: 12,
      xp: 90,
      difficulty: 'application',
      narrative:
        'After last night\'s scene refactor, the assembly cell looks perfect in the viewport — until someone presses play and the gripper stays behind while the arm moves. The shift supervisor wants root cause, not a workaround. This is a USD hierarchy investigation.',
      steps: [
        {
          kind: 'teach',
          heading: 'Why parenting is everything in USD',
          body:
            'A prim\'s world pose is derived, not stored: it is the composition of its own local transform with every ancestor\'s transform up the stage tree. A gripper parented under the wrist flange (`/World/UR10e/tool0`) inherits every wrist motion for free. The same prim parented under `/World` inherits only the world\'s identity — it sits exactly where its local transform says, motionless while the arm moves.\n\nSo "the gripper stopped following the arm" is almost never an animation bug. It is a **hierarchy fact**: something changed the gripper\'s parent. Refactors are the usual suspect — renaming, moving prims between scopes, or re-importing an asset that silently lands at a different path.',
          keyPoints: [
            'World pose = local transform composed with all ancestor transforms',
            'Parented under the flange → follows the arm; parented under /World → does not',
            '"Stopped following" → suspect the parent chain first',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'isx-a1-q-reparent',
            prompt:
              'You reparent the gripper prim from /World to /World/UR10e/tool0 in the stage tree. The gripper now follows the arm — but it sits 40 cm off the flange, floating in air. Why?',
            options: [
              { id: 'a', text: 'The gripper\'s old local transform came along: it was tuned for its previous parent, so under the flange it composes to a wrong offset' },
              { id: 'b', text: 'The gripper mesh has the wrong UV mapping, shifting its visual center' },
              { id: 'c', text: 'The arm\'s kinematics changed — the flange itself is 40 cm off' },
              { id: 'd', text: 'Gravity pulled it during the frame it was reparented' },
            ],
            correctId: 'a',
            optionNotes: {
              b: 'UV mapping affects textures, never geometry placement.',
              c: 'The arm was reaching targets correctly before the refactor; and the offset would have shown in the old scene too.',
              d: 'Before physics steps, transforms are purely hierarchical — nothing fell anywhere yet.',
            },
            explanation:
              'Reparenting preserves the prim\'s LOCAL attributes (translate/rotate/scale). Those numbers meant "offset from /World" — under the flange they mean "offset from tool0", which composes to a different world pose. The fix: zero out or re-tune the local transform relative to the new parent (flange frames usually expect the gripper at a known tool offset, not 40 cm).',
            hint: 'What did the local translate values measure under the OLD parent — and what do they measure under the new one?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'scenario',
            id: 'isx-a1-scenario',
            prompt:
              '**Incident briefing — Cell B, morning shift.**\n\nThe dual-arm cell was refactored last night: prims renamed, unused assets removed. This morning the left arm runs its program, but the gripper stays at the pose it had when the scene loaded while the wrist moves away. No errors were printed. Walk the investigation and commit to the root cause.',
            context:
              '/World\n├── GroundPlane\n├── UR10e_left            (articulation root)\n│   ├── base_link\n│   ├── shoulder_link\n│   ├── forearm_link\n│   └── tool0                 ← flange the gripper used to live under\n└── gripper_assembly      ← present, pose frozen at scene load',
              contextLabel: 'stage tree (now)',
            stages: [
              {
                id: 's1',
                title: 'Observation',
                situation:
                  'The gripper renders at a fixed world pose all run. The arm\'s joints report sane positions, and the wrist tool0 frame moves exactly along the programmed path.',
                question: 'Given the wrist moves correctly and the gripper does not, what does this observation already rule in?',
                options: [
                  { id: 'a', text: 'The arm\'s articulation is healthy — the fault is in how the gripper is attached to it' },
                  { id: 'b', text: 'The arm\'s joint drives are misconfigured' },
                  { id: 'c', text: 'The gripper\'s meshes failed to load' },
                  { id: 'd', text: 'The scene is running at the wrong time scale' },
                ],
                correctId: 'a',
                optionNotes: {
                  b: 'The wrist tracks its path — drive misconfiguration would show as wrong arm motion, not a detached gripper.',
                  c: 'The gripper renders — meshes loaded.',
                  d: 'Time scale changes speeds, not attachment.',
                },
                explanation:
                  'One moving, one frozen, zero errors: the arm subtree is fine, so the fault lives at the junction between gripper and arm. In USD, that junction is the parent chain — the strongest hypothesis is that the gripper is no longer a descendant of the wrist.',
              },
              {
                id: 's2',
                title: 'Decision — what to inspect first',
                situation:
                  'You open the stage tree. You have thirty seconds before the supervisor asks for an update.',
                question: 'Which check confirms or kills the hierarchy hypothesis fastest?',
                options: [
                  { id: 'a', text: 'Search the stage tree for the gripper prim and read its full path' },
                  { id: 'b', text: 'Re-import the gripper asset from the original file' },
                  { id: 'c', text: 'Profile the render framerate' },
                  { id: 'd', text: 'Print every joint state of the arm again' },
                ],
                correctId: 'a',
                optionNotes: {
                  b: 'Re-importing changes the scene before the cause is known — if the refactor duplicated prims, you may now have two grippers and two problems.',
                  c: 'Framerate cannot freeze one prim while animating its neighbors.',
                  d: 'Already established: the arm is healthy. Re-collecting known facts is not diagnosis.',
                },
                explanation:
                  'The path IS the diagnosis for hierarchy faults: `/World/gripper_assembly` means "child of the world — inherits nothing from the arm", while `/World/UR10e_left/tool0/gripper_assembly` means "rides on the flange". One look, definitive.',
              },
              {
                id: 's3',
                title: 'Observation — the tree confirms it',
                situation:
                  'The stage tree shows `gripper_assembly` under `/World` — not under `/World/UR10e_left/tool0`. An engineer suggests the quick fix: "leave it there, add a script that copies the wrist pose to the gripper every frame."',
                question: 'What is wrong with the script workaround?',
                options: [
                  { id: 'a', text: 'Nothing — copying poses per frame is how USD handles attachment' },
                  { id: 'b', text: 'It re-implements transform inheritance badly: it runs after simulation ordering can lag a frame, breaks the moment anyone edits the scene, and hides the real defect' },
                  { id: 'c', text: 'Scripts are not supported while a simulation is stepping' },
                  { id: 'd', text: 'It would work but violates the naming convention' },
                ],
                correctId: 'b',
                optionNotes: {
                  a: 'USD handles attachment through hierarchy natively — a pose-copying script is a second, worse implementation of the same feature.',
                  c: 'Scripts absolutely run alongside stepping — that is how automation is built. The problem is the approach, not permission.',
                  d: 'Naming conventions are the smallest issue in the room.',
                },
                explanation:
                  'Pose-copy workarounds are how hierarchies rot: they lag a frame under some execution orders, silently break when paths change again, and every new engineer pays the complexity tax. The hierarchy expresses "attached" in one line of structure; use it.',
              },
            ],
            diagnosis: {
              question: 'Root cause — what do you report?',
              options: [
                { id: 'a', text: 'The refactor reparented gripper_assembly from /World/UR10e_left/tool0 to /World. Outside the arm\'s transform chain, it cannot inherit wrist motion; the fix is reparenting under tool0 and zeroing its stale local offset.' },
                { id: 'b', text: 'The arm\'s articulation root was duplicated and the controller is driving the wrong one.' },
                { id: 'c', text: 'The gripper asset\'s physics colliders were removed, so the simulator detached it.' },
                { id: 'd', text: 'A render-deinitialization bug freezes any prim that is not a joint child.' },
              ],
              correctId: 'a',
              optionNotes: {
                b: 'The arm moves correctly along its path — a duplicated root would show as dead or erratic arm motion, and the tree shows exactly one root.',
                c: 'Colliders affect contact response, not whether a prim follows its parent. A collider-less gripper still inherits transforms.',
                d: 'Described behavior is not a thing in USD — prims follow their parents unconditionally; this option is a plausible-sounding dead end.',
              },
              explanation:
                'The evidence chain: wrist moves (arm healthy) → gripper frozen (junction fault) → tree shows gripper under /World (parent changed) → refactor last night (motive). Every alternative requires ignoring the stage tree.',
            },
            wrapUp:
              '**The engineering lesson:** in USD, attachment is hierarchy. When something stops following its parent, the stage tree is both the diagnosis and the fix — reparent, resolve the stale local transform, and refuse per-frame pose-copy workarounds that re-implement the scene graph badly. Then make the refactor safe: a scene-structure regression test (assert the gripper\'s path is a child of tool0) would have caught this before the morning shift.',
            hint: 'Start from what moves and what does not — the boundary between them is the fault line.',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
    {
      id: 'isx-a2-articulation-debug',
      title: 'Engineering Mission: The Arm That Won\'t Move',
      minutes: 14,
      xp: 110,
      difficulty: 'troubleshooting',
      narrative:
        'A merged scene loads clean, the console shows joint targets arriving, the step loop runs — and the UR5e stands perfectly still. Two engineers have already "fixed" it by restarting twice. The Dome wants a systematic isolation, not a third restart.',
      steps: [
        {
          kind: 'teach',
          heading: 'The actuation chain — and how to isolate it',
          body:
            'For an articulated robot to move, five things must all be true at once: a **physics scene stepping** reliably; an **articulation root** the runtime actually detected, with joints discovered beneath it; **drive gains** (stiffness/damping) on those joints, so a target produces force; **commands arriving** at the right articulation (targets set, not just printed); and a **numerically sane scene** (sensible units, no exploding solver). A failure anywhere breaks motion — and each failure looks identical from outside: the arm does not move.\n\nSo debugging is bisection against that chain, cheapest check first: Is the loop stepping? Did the runtime find the articulation and all joints? Are targets changing on the right object? Only then open the drive-gain question — because gains are the one link with no error message when wrong: zero stiffness is a valid number that silently produces zero force.',
          keyPoints: [
            'Five-link chain: stepping → articulation+joints → drives/gains → commands → numerics',
            'Each failure presents identically from outside: no motion',
            'Zero drive gains fail silently — the classic suspect once everything upstream checks out',
          ],
        },
        {
          kind: 'byte',
          text: 'From the incident log, Cycle 88: "restarted, works." Cycle 91: "restarted, works." Cycle 94: "restarted." The Dome has promoted restarting to a monitoring strategy. We are so proud.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'isx-a2-order',
            prompt: 'Order the isolation checklist from cheapest/most-likely-first to deepest.',
            items: [
              { id: '1', text: 'Confirm the simulation loop is stepping (time advances, no pause)' },
              { id: '2', text: 'Confirm the runtime discovered the articulation root and all expected joints' },
              { id: '3', text: 'Confirm joint targets are actually being set on THAT articulation (not just printed)' },
              { id: '4', text: 'Inspect the joint drives: stiffness/damping gains nonzero, targets within limits' },
              { id: '5', text: 'Check scene numerics: units, scales, solver stability' },
            ],
            explanation:
              'The order is by cost and information gain: stepping and articulation detection fail loudly and take seconds; commands take a breakpoint; gains take reading values; numerics is the deep end. Restarting "works" only when the actual fault was a stale load — it tells you nothing about which link broke, which is why the third restart was refused.',
            hint: 'You want the check that is fastest AND most often the culprit before the one that requires reading physics values.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'scenario',
            id: 'isx-a2-scenario',
            prompt:
              '**Incident briefing — UR5e palletizing cell, post-merge.**\n\nThe scene was merged from two branches last night. On play, the arm does not move. Two restarts changed nothing. The console log below is all you have. Run the isolation and name the root cause.',
            context:
              '[load] stage opened: ur5e_cell_merged.usda\n[load] physics scene: /World/PhysicsScene          OK\n[load] articulation root: /World/ur5e              OK\n[load] joints discovered: 6 / 6                    OK\n[run ] sim step loop: active, 60 Hz                OK\n[cmd ] new targets: [0.0, -1.2, 1.57, 0.0, 0.0, 0.0]\n[cmd ] new targets: [0.0, -1.2, 1.57, 0.2, 0.0, 0.0]\n[telemetry] joint positions: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]\n[telemetry] joint positions: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]',
              contextLabel: 'console (abridged)',
            stages: [
              {
                id: 's1',
                title: 'Bisect the chain',
                situation:
                  'Read the log as a checklist: stepping OK, articulation root found, 6/6 joints discovered, targets arriving and changing, positions constant.',
                question: 'Which links of the actuation chain does this log already clear?',
                options: [
                  { id: 'a', text: 'Stepping, articulation detection, and command delivery — the fault is downstream, in the drive layer or the physics response' },
                  { id: 'b', text: 'Only the physics scene — the rest is unknown' },
                  { id: 'c', text: 'Everything except stepping' },
                  { id: 'd', text: 'Nothing — logs never rule out causes' },
                ],
                correctId: 'a',
                optionNotes: {
                  b: 'Three links are explicitly OK in the log; treating the scene as the only suspect ignores half the checklist.',
                  c: 'Stepping is explicitly active — the one link you claim is open is the one the log closes.',
                  d: 'The whole discipline of structured logs is that they DO rule things out. That is why the merge kept them.',
                },
                explanation:
                  'The log is a bisection gift: it verifies the first three links and the fifth (no solver explosions — positions are stable, just zero). What it never shows is a force being produced. That isolates the drive layer.',
              },
              {
                id: 's2',
                title: 'Decision — the drive layer',
                situation:
                  'You inspect the joint drive properties on the merged prim. Each joint has a position target set — and stiffness 0, damping 0.',
                question: 'Why do nonzero targets with zero gains produce a statue?',
                options: [
                  { id: 'a', text: 'Targets are only desired positions; drive gains are the spring/damper constants that turn "desired" into torque. Zero stiffness means the drive applies no force toward the target' },
                  { id: 'b', text: 'Zero gains put the joint in velocity mode, which ignores position targets' },
                  { id: 'c', text: 'The targets are only applied when gains are changed simultaneously' },
                  { id: 'd', text: 'Zero damping makes the joint move infinitely fast to the target' },
                ],
                correctId: 'a',
                optionNotes: {
                  b: 'Velocity control still needs gains to apply force — zero effort at the drive means zero motion in any mode.',
                  c: 'Targets and gains are independent inputs; the merge just happened to keep one and lose the other.',
                  d: 'Infinite speed would still be motion — and would destabilize the solver, not freeze it.',
                },
                explanation:
                  'A position-driven joint is a servo: target defines where you want to be; stiffness is the spring pulling toward it; damping tames the spring. Zero stiffness = no spring = targets are wishes. The merge kept target-setting code and lost the gain configuration — a classic merge-halves casualty.',
              },
              {
                id: 's3',
                title: 'Observation — after setting gains',
                situation:
                  'An engineer sets stiffness to a plausible value, leaves damping at 0, presses play. The arm now TWITCHES toward the target and oscillates wildly instead of settling.',
                question: 'What does this new symptom tell you?',
                options: [
                  { id: 'a', text: 'The diagnosis was wrong — gains were never the issue' },
                  { id: 'b', text: 'The diagnosis was right: force is now produced. Zero damping leaves the spring undamped, so the joint rings around the target — add damping and verify settling' },
                  { id: 'c', text: 'The stiffness value is too small — set it to the maximum' },
                  { id: 'd', text: 'The arm needs gravity compensation before any gain is valid' },
                ],
                correctId: 'b',
                optionNotes: {
                  a: 'The symptom CHANGE is proof: before gains, no force; after gains, force with underdamped ringing. That is diagnosis confirmed, then refined.',
                  c: 'Maximum stiffness is not a tuning strategy — it is how you get violent, unstable motion and solver explosions.',
                  d: 'Gravity compensation matters for tracking accuracy on real arms, but the ringing here is the undamped oscillator, plain to see.',
                },
                explanation:
                  'Debugging is iterative: the new symptom is information, not failure. Stiffness without damping is an ideal undamped oscillator — it will oscillate forever. Practical servo tuning sets both, then verifies settling behavior against the task (cycle time, overshoot limits).',
              },
            ],
            diagnosis: {
              question: 'Root cause — what do you report to the shift lead?',
              options: [
                { id: 'a', text: 'The merge dropped the joint drive gain configuration (stiffness/damping zeroed): targets were set and delivered but produced no actuation force. Restoring gains — stiffness AND damping — and verifying settling is the fix. Restarting masked nothing and fixed nothing.' },
                { id: 'b', text: 'The articulation root was not detected after the merge.' },
                { id: 'c', text: 'The merged scene steps at the wrong rate for the controller.' },
                { id: 'd', text: 'The joint targets were sent to a different articulation instance.' },
              ],
              correctId: 'a',
              optionNotes: {
                b: 'The log shows "articulation root: OK, joints 6/6" — directly contradicted.',
                c: 'Step rate affects timing accuracy, not whether any force exists; and the log shows a clean 60 Hz loop.',
                d: 'Targets arrive and the telemetry reads the same articulation — if they went elsewhere, neither would show.',
              },
              explanation:
                'Every wrong option requires disbelieving the log. The right one explains all observations: silent no-motion at zero gains, then ringing at zero damping. One cause, two symptoms, fixed by restoring and tuning the drive configuration the merge lost.',
            },
            wrapUp:
              '**The engineering lesson:** no-motion failures are bisection failures — walk the actuation chain and let each check eliminate half the suspects. Beware the silent-valid value: zero is a legal gain that means "no force". And treat symptom changes during debugging as data: the twitch was not a new bug, it was the diagnosis confirming itself with damping missing. Finally: restarting is not a fix, it is a coin flip you cannot learn from.',
            hint: 'Let the log eliminate chain links before touching any property panel.',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
    {
      id: 'isx-a3-simreal-comms',
      title: 'Engineering Mission: The Twin That Lags',
      minutes: 16,
      xp: 130,
      difficulty: 'mission',
      narrative:
        'The digital twin dashboard for the assembly cell updates — but two seconds late. The planner does not care yet; the safety review next week will. This mission walks a sim-to-real communication investigation end to end: timestamps, publisher health, QoS pairing, and the consumer nobody suspected.',
      steps: [
        {
          kind: 'teach',
          heading: 'Staleness triage: late, slow, or never sent?',
          body:
            '"The twin is behind reality" is three distinct diseases wearing one symptom. **Data is old on arrival** (timestamps lag) → transport or producer delay. **Data arrives fresh but is displayed late** → consumer-side stall. **Data stops arriving** → QoS incompatibility, dead publisher, or network. The first diagnostic act is always to read **timestamps**: compare the message\'s stamp against the receiving clock — but know your clock domains first, because the bridge stamps with *simulation time* while real hardware stamps with wall time.\n\nThen check publisher health (is it emitting at its expected rate, error-free?), then the **QoS pairing**: reliability and durability settings must be compatible on both ends. A reliable publisher with a best-effort subscriber works; the reverse pairing (best-effort publisher, reliable subscriber) matches no messages at all — the subscriber sees a silent topic that is, in fact, in front of it.',
          keyPoints: [
            'Timestamp first: old-on-arrival (delay) vs fresh-but-late (consumer stall) vs absent (QoS/death)',
            'Bridge stamps use sim time; hardware stamps use wall time — compare within a domain',
            'QoS pairs: reliable pub ↔ best-effort sub works; best-effort pub ↔ reliable sub never delivers',
          ],
        },
        {
          kind: 'byte',
          text: 'The safety reviewer\'s favorite question: "when the twin shows the arm at 40 degrees, where is it really?" The only wrong answer is "probably about 40 degrees." Staleness is a number. Measure it.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'isx-a3-qos',
            prompt:
              'A ROS 2 publisher emits /joint_states with RELIABLE reliability; a new twin subscriber joins with BEST_EFFORT. A colleague switches them: publisher BEST_EFFORT, subscriber RELIABLE. What does each pairing deliver?',
            options: [
              { id: 'a', text: 'Both pairings work — reliability only matters on the publisher side' },
              { id: 'b', text: 'Reliable pub + best-effort sub delivers (best effort accepts reliability); best-effort pub + reliable sub delivers nothing — the pairing is incompatible' },
              { id: 'c', text: 'Reliable pub + best-effort sub delivers nothing; the reversed pairing works' },
              { id: 'd', text: 'Neither pairing delivers — both sides must be identical' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Reliability is negotiated between both endpoints — the asymmetric cases behave very differently, which is the whole trap.',
              c: 'Backwards: a best-effort subscriber is happy to take whatever a reliable publisher sends; it is the reliable subscriber that refuses to compromise.',
              d: 'Identical settings always work — the incompatibility lives specifically in demanding more reliability than is offered.',
            },
            explanation:
              'The rule: the subscriber may ask for less than the publisher offers, never more. Reliable→best-effort flows (the sub just tolerates loss); best-effort→reliable is rejected at discovery — the subscriber requests guarantees the publisher does not make, so it receives silence while the publisher logs healthy sends. This is why "the topic looks fine on the publisher side" is not evidence the subscriber is receiving.',
            hint: 'Which side is making the demand — the one offering or the one requiring?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'scenario',
            id: 'isx-a3-scenario',
            prompt:
              '**Incident briefing — digital twin, pre-safety-review.**\n\nThe twin dashboard mirrors the simulated assembly cell over the ROS 2 bridge. Operators report it runs "about two seconds behind" the 3D viewport of the same simulation. The safety review is in five days and requires staleness under 100 ms. Triage the lag and commit to the root cause.',
            context:
              '[twin dashboard]  joint_states: displayed pose lags viewport ~2 s\n[msg inspect]     /joint_states stamp: 2.0-2.1 s BEHIND the sim clock on arrival\n[bridge console]  publishing /joint_states @ 60 Hz, 0 errors, sim time source\n[transport]       loopback, 0% loss, queues not saturated\n[qos]            pub: RELIABLE, sub: RELIABLE           compatible\n[subscriber proc] twin app: single-threaded — network callbacks and 3D\n                  rendering share one loop; render frame takes ~35 ms,\n                  spikes to 2 s when the review-meeting view is open',
              contextLabel: 'triage notes',
            stages: [
              {
                id: 's1',
                title: 'Observation — classify the staleness',
                situation:
                  'The stamps on arrival read 2.0–2.1 s behind the simulation clock.',
                question:
                  'Per the triage rule: is this data old-on-arrival, fresh-but-late, or absent?',
                options: [
                  { id: 'a', text: 'Old on arrival — something between bridge and dashboard delays delivery by ~2 s' },
                  { id: 'b', text: 'Absent — the subscriber is not matching messages' },
                  { id: 'c', text: 'Clock-domain confusion — sim time was compared to wall time by mistake' },
                  { id: 'd', text: 'Fresh but displayed late — the numbers arrive on time and the app shows them late' },
                ],
                correctId: 'a',
                optionNotes: {
                  b: 'Messages demonstrably arrive — absence would show gaps and stale-but-constant display, not a smooth 2 s chase.',
                  c: 'The comparison was made within one domain (against the sim clock the bridge itself uses) — that is the correct comparison.',
                  d: 'That is the tempting one, but it is contradicted by the stamp: if display were the delay, arrival stamps would be current. They are not.',
                },
                explanation:
                  'The stamp is measured at arrival against the same clock the publisher uses — so the data is genuinely 2 s old when the app receives it. The delay happened BEFORE the subscriber\'s processing: producer or transport. This single measurement just eliminated the entire consumer side for now.',
              },
              {
                id: 's2',
                title: 'Decision — producer or transport?',
                situation:
                  'Bridge console: 60 Hz, zero errors, publishing from sim time. Transport: loopback, zero loss, queues healthy. QoS: RELIABLE↔RELIABLE, compatible.',
                question: 'Given the producer and transport look healthy but data arrives 2 s old, where must the delay physically live?',
                options: [
                  { id: 'a', text: 'In a queue between publisher and subscriber — messages are being created on time but released late, which points to buffering on the delivery path or at the receiving socket' },
                  { id: 'b', text: 'Nowhere — 2 s staleness at 60 Hz is normal for a rendered twin' },
                  { id: 'c', text: 'In the simulation physics — the world itself is lagging' },
                  { id: 'd', text: 'In the bridge\'s stamping code — it must be writing wrong timestamps' },
                ],
                correctId: 'a',
                optionNotes: {
                  b: '2 s at 60 Hz means ~120 stale messages in flight — nothing about that is required or normal for a loopback link.',
                  c: 'The sim clock advances on schedule (the viewport matches it), so physics is producing states on time.',
                  d: 'If stamps were written wrong, the viewport and dashboard would disagree by the same amount — but the dashboard\'s delay matches real message age, and a stamping bug cannot hold back delivery by 2 s.',
                },
                explanation:
                  'On-time production + healthy transport + old-on-arrival leaves exactly one place: messages queuing somewhere on the receive path. On loopback with no saturation, that queue is almost always at the receiving application — the socket buffer, filling because the app is not draining it fast enough.',
              },
              {
                id: 's3',
                title: 'Observation — the subscriber\'s dirty secret',
                situation:
                  'The twin app is single-threaded: ROS 2 message callbacks and 3D rendering share one loop. Normal frames take 35 ms (fine for 60 Hz), but when the review-meeting camera view opens, frames spike to 2 s — exactly when operators first noticed the lag.',
                question: 'Assemble the mechanism. What is happening?',
                options: [
                  { id: 'a', text: 'The bridge throttles publishing whenever it detects a slow subscriber' },
                  { id: 'b', text: 'Render spikes block the single-threaded loop, so callbacks do not run; fresh states queue in the socket buffer behind unprocessed ones, and the dashboard displays a message that is already seconds old' },
                  { id: 'c', text: 'The queue discards old messages, so the displayed pose is actually current' },
                  { id: 'd', text: 'The 3D view and the joint display read different topics' },
                ],
                correctId: 'b',
                optionNotes: {
                  a: 'The bridge logs 60 Hz with zero errors throughout — no throttling, and ROS 2 does not slow publishers to match slow subscribers.',
                  c: 'The staleness measurement proves old messages ARE being displayed; with keep-last(1) queues the display would jump, not lag smoothly.',
                  d: 'Both read /joint_states; and the lag tracks render spikes, not topic choice.',
                },
                explanation:
                  'The full causal chain: render spike (2 s) → callbacks starve (single thread) → socket buffer fills with ~120 messages → each drained message is already seconds old → dashboard shows old states "smoothly". The viewport looks fine because it reads the simulation directly. One architectural decision — one thread — created a real-time failure invisible until someone measured.',
              },
            ],
            diagnosis: {
              question: 'Root cause and fix — what do you report for the safety review?',
              options: [
                { id: 'a', text: 'Bridge misconfiguration: it must switch from sim time to wall time and reduce rate to 10 Hz until the review passes.' },
                { id: 'b', text: 'Consumer-side stall: the twin\'s single-threaded loop lets render spikes starve message callbacks, so states queue and display ~2 s stale. Fix: decouple network receive from rendering (separate thread/executor with its own queue, display latest state), then re-measure stamp-vs-display latency against the 100 ms requirement.' },
                { id: 'c', text: 'QoS mismatch: switch the subscriber to best-effort and the lag disappears with the dropped messages.' },
                { id: 'd', text: 'Simulate on a second machine: moving the bridge off this workstation removes the lag.' },
              ],
              correctId: 'b',
              optionNotes: {
                a: 'Wrong on mechanism (stamps were correct — the delay was real aging, not bad stamping) and wrong on fix: slower publishing shrinks the queue but the stall remains — and the safety review wants fresher data, not less.',
                c: 'QoS was already compatible; best-effort on the subscriber would silently drop during exactly the render spikes that cause the lag — hiding the symptom and worsening the safety case.',
                d: 'Moving the sim changes nothing: the stall is in the twin app\'s single thread, which travels with the app.',
              },
              explanation:
                'The causal chain was built measurement-first: stamps classified the staleness as real delay; producer/transport/QoS checks eliminated themselves; the render-spike correlation exposed the single-threaded loop. The fix is architectural (decouple receive from render, keep latest), and the acceptance test is the same measurement that found the bug: stamp-vs-display latency under 100 ms — including while the review view is open.',
            },
            wrapUp:
              '**The engineering lesson:** staleness is a measurement, not a vibe — timestamp first, and classify (old-on-arrival, fresh-but-late, absent) before touching anything. Producer health, transport, and QoS pairing eliminate themselves in that order. And the last suspect is always the consumer nobody measured: in real-time systems, a shared loop between networking and rendering is a standing latency bug that surfaces exactly when the demo matters. The same triage applies when the "publisher" is a real robot instead of a bridge — only the clock domain changes.',
            hint: 'Timestamps split the world in three. Measure before you theorize.',
          },
        },
      ],
      versionNote:
        'Concepts are stable across recent Isaac Sim releases, but always verify specific APIs and UI paths against the official NVIDIA Isaac Sim documentation for your installed version.',
    },
  ],
  flashcards: [
    {
      id: 'fc-isx-1',
      categoryId: 'isaac',
      concept: 'Stage',
      explanation:
        'The in-memory USD scene graph a simulation is built on — the hierarchy of prims that Isaac Sim edits, simulates, and renders in the viewport.',
      example: '/World/AssemblyCell containing a table, a dual-arm robot, and bins is one stage.',
      misconception:
        'A stage is not a single mesh or file — it is a composed scene graph that can pull together many layered USD contributions.',
      application:
        'Every Isaac Sim session is authoring and inspecting a stage; prim paths into that tree are how scripts address the scene.',
      difficulty: 1,
    },
    {
      id: 'fc-isx-2',
      categoryId: 'isaac',
      concept: 'Prim',
      explanation:
        'The primary container of the USD scene graph: a typed node (mesh, camera, light, Xform, articulation scope) with attributes, nested into a parent-child hierarchy addressed by paths like /World/Cell/Arm.',
      example: 'An Xform prim named Arm with mesh children Base and Link1; translating the Xform moves all children.',
      misconception:
        'Prims are not just visible objects — invisible structure (scopes, physics declarations) is made of prims too.',
      application:
        'Reading the stage tree is how you locate the robot, parts, and sensors your scripts will drive.',
      difficulty: 1,
    },
    {
      id: 'fc-isx-3',
      categoryId: 'isaac',
      concept: 'Articulation root',
      explanation:
        'The prim that marks a robot so the physics solver treats its whole link-and-joint subtree as one articulated machine simulated as a unit, with degrees of freedom you command and measure together.',
      example: 'The base link of a 6-DOF arm is the articulation root; its revolute and prismatic joints hang beneath it.',
      misconception:
        'Not everything belongs to the articulation — free parts like dropped crates stay separate rigid bodies outside it.',
      application:
        'Scripts address the articulation as one handle, then set joint targets or read joint state for the whole robot.',
      difficulty: 2,
    },
    {
      id: 'fc-isx-4',
      categoryId: 'isaac',
      concept: 'Rigid body + collider',
      explanation:
        'A rigid body gives a prim mass and dynamics under the solver; a collider gives it a collision shape. Collision is detected only between pairs of colliders, so dynamic bodies need both — and static ground needs a collider even though it never moves.',
      example: 'A static fixture: collider, no rigid body. A workpiece being grasped: rigid body plus collider.',
      misconception:
        'A beautiful mesh with no collider is set dressing — bodies fall straight through it, which is the classic "crate sinks through the floor" bug.',
      application:
        'Every drop test, insertion, and contact study in the assembly cell depends on colliders being present on both sides.',
      difficulty: 1,
    },
    {
      id: 'fc-isx-5',
      categoryId: 'isaac',
      concept: 'Isaac Sim vs Isaac Lab',
      explanation:
        'Isaac Sim is the OpenUSD-based robotics simulation application and platform built on Omniverse. Isaac Lab is a robot-learning framework built on top of Isaac Sim, focused on reinforcement and imitation learning workflows.',
      example: 'Script a cell study directly in Isaac Sim; train a grasp policy across many parallel environments with Isaac Lab.',
      misconception:
        'Isaac Lab is neither a lighter viewer nor an alternative simulator — it is a layer that requires Isaac Sim underneath.',
      application:
        'Choosing correctly saves weeks: simulation and scripting need only Isaac Sim; policy training is what brings in Isaac Lab.',
      difficulty: 2,
    },
    {
      id: 'fc-isx-6',
      categoryId: 'isaac',
      concept: 'ROS 2 Bridge / sim-to-real',
      explanation:
        'The bridge translates between simulation and the ROS 2 ecosystem: it publishes simulated joint states, poses, and sensor data on topics (stamped with simulation time) and applies incoming commands to the simulated robot — so the same node graph can run against the real hardware instead.',
      example: 'A planner node subscribing to joint states and publishing commands works unchanged whether Isaac Sim or the physical cell is on the other end.',
      misconception:
        'The bridge is not a simulator or a physics engine — it is an interface, and the interface is what makes sim and real interchangeable.',
      application:
        'The standard architecture for assembly research: develop against simulation, then redeploy the same ROS 2 nodes on hardware.',
      difficulty: 2,
    },
    {
      id: 'fc-isx-7',
      categoryId: 'isaac',
      concept: 'Depth camera',
      explanation:
        'A sensor that returns per-pixel distance to surfaces instead of color. In simulation it is rendered straight from scene data, so every pixel\'s distance is exact ground truth — ideal for detecting, localizing, and grasping parts.',
      example:
        'A wrist-mounted depth camera views a bin of parts; each pixel\'s exact distance lets the pipeline segment and pose-estimate every workpiece with no manual labels.',
      misconception:
        'Depth data is not a grayscale photo — the values encode distance. And simulated depth is exact, unlike many real depth sensors with noise and dropouts.',
      application:
        'Assembly and bin-picking perception pipelines are developed and scored on simulated depth with ground truth before touching a real sensor — remembering that detections live in the camera\'s optical frame until transformed.',
      difficulty: 2,
    },
    {
      id: 'fc-isx-8',
      categoryId: 'isaac',
      concept: 'Domain randomization',
      explanation:
        'Deliberately varying uncertain simulation parameters — friction, masses, sensor delays, lighting — every run, and requiring success across the whole sampled range, so a controller or learned policy is robust to real-world variation instead of tuned to one ideal setting.',
      example:
        'Randomize peg friction from 0.2 to 1.0 and part mass each episode; the insertion strategy must succeed for every sampled combination.',
      misconception:
        'It is not about making the simulation messier for its own sake — the goal is success across a distribution, not perfection at a single ideal point.',
      application:
        'The standard defense against the sim-to-real gap, for hand-tuned controllers and for Isaac Lab policies trained across many parallel randomized environments.',
      difficulty: 2,
    },
    {
      id: 'fc-isx-9',
      categoryId: 'isaac',
      concept: 'Digital twin',
      explanation:
        'A live-synced virtual counterpart of a physical system: real state flows in continuously (over ROS 2 topics, in this cell), while rehearsed plans, predictions, and validated commands flow back out. The ongoing synchronization — not fidelity alone — is the definition.',
      example:
        'While the physical cell is idle, the twin reflects its current state and rehearses the next assembly sequence; only a clean simulated run unlocks a hardware run.',
      misconception:
        'A digital twin is not any simulation or CAD model — a one-time export with no live state relationship is just a model.',
      application:
        'Pre-flight gating of assembly sequences and continuous sim-vs-real comparison in robotic-assembly research cells.',
      difficulty: 2,
    },
    {
      id: 'fc-isx-10',
      categoryId: 'isaac',
      concept: 'Real-time factor (RTF)',
      explanation:
        'Simulated time divided by wall-clock time. RTF 1.0 tracks reality; RTF 0.2 means each real second advances the world 0.2 s — a speed property of machine and scene, not a change to the physics results.',
      example: '300 steps of 1/120 s is always 2.5 s of simulated time, whether the computer finishes in 2.5 s or 25 s.',
      misconception:
        'RTF does not bend simulated time — step count × step size fixes it. And a slow RTF only matters to workloads that consume results live.',
      application:
        'Teleoperation and live digital twins need RTF ≈ 1; overnight dataset generation happily runs headless at RTF 0.2 with byte-identical output.',
      difficulty: 2,
    },
    {
      id: 'fc-isx-11',
      categoryId: 'isaac',
      concept: 'Golden run / regression simulation',
      explanation:
        'A recorded baseline of metrics (success flag, final poses, cycle time, collisions) from a validated scripted scenario. After every scene change the scenario re-runs and diffs against the baseline within tolerance bands.',
      example: 'GOLDEN_CYCLE_S = 41.20 with ±0.8 s tolerance: a re-run at 41.35 passes; at 45.0 the diff points at your fixture change.',
      misconception:
        'Simulations are not byte-deterministic across contact-heavy scenes — that is why tolerances exist, and why re-baselining must stay a deliberate, reviewed decision rather than chasing drifting numbers.',
      application:
        'The safety net that lets a lab touch scenes constantly: nightly scripted runs catch broken physics by morning instead of mid-experiment.',
      difficulty: 3,
    },
    {
      id: 'fc-isx-12',
      categoryId: 'isaac',
      concept: 'Transform inheritance & reparenting',
      explanation:
        'A prim\'s world pose composes its local transform with every ancestor\'s. Reparenting keeps the local values but changes what they are measured against — so a moved prim lands in a new world pose until its local transform is re-tuned.',
      example: 'A gripper under /World freezes when the arm moves; reparented under /World/ur10e/tool0 it rides the flange — 40 cm off until the stale local offset is zeroed.',
      misconception: 'Pose-copy scripts that chase a detached prim re-implement the scene graph badly — hierarchy is the attachment mechanism.',
      application: '"It stopped following the arm" is a hierarchy fault: read the stage tree path first, work around last.',
      difficulty: 3,
    },
    {
      id: 'fc-isx-13',
      categoryId: 'isaac',
      concept: 'Joint drive gains: targets need springs',
      explanation:
        'A position target only states a desire; the drive\'s stiffness (spring toward target) and damping (motion-tamer) convert it into force. Zero gains are a silent no-op — a legal value that produces a statue.',
      example: 'Targets arriving, loop stepping, arm frozen → read stiffness/damping before blaming the controller. Twitching after enabling stiffness means damping is missing.',
      misconception: 'Zero gains do not mean "free motion" or "direct position setting" — they mean zero actuation force toward the target.',
      application: 'The silent link in every articulation-no-motion bisection, and the classic casualty of scene merges that keep target code but lose gain config.',
      difficulty: 3,
    },
    {
      id: 'fc-isx-14',
      categoryId: 'isaac',
      concept: 'Staleness triage (sim-to-real comms)',
      explanation:
        'Classify lag with timestamps before touching anything: old-on-arrival = producer/transport delay; fresh-but-displayed-late = consumer stall; absent = QoS incompatibility or dead publisher. The bridge stamps with sim time — compare within clock domains.',
      example: 'Stamps 2 s behind sim clock on arrival + healthy 60 Hz publisher + compatible QoS = the receiving app is not draining its queue.',
      misconception: 'QoS is symmetric only when settings match: reliable pub → best-effort sub delivers; best-effort pub → reliable sub delivers nothing.',
      application: 'The triage list for twin dashboards and sim-to-real links alike — only the clock domain changes when the bridge is replaced by a real robot.',
      difficulty: 3,
    },
  ],
};
