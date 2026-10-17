import type { Category } from '../engine/types';

// APIs & Integration Wing — content module.
// Shape, depth, and tone follow the reference in src/data/arch.ts.

export const apiCategory: Category = {
  id: 'api',
  name: 'APIs',
  tagline: 'Teach the facility\'s systems to talk again',
  icon: '📡',
  description:
    'The research facility runs on services that exchange sensor data, job orders, and alerts over HTTP. Restore the discipline of the wire: resources, payloads, status codes, and clients that fail gracefully instead of loudly.',
  accent: 'cyan',
  lessons: [
    {
      id: 'api-l1-http',
      title: 'HTTP Request/Response Anatomy',
      minutes: 6,
      xp: 40,
      narrative:
        'The Status Hub — the service every dashboard and robot reads from — is answering with gibberish: status codes ignored, methods misused. Before you can repair it, relearn the wire format every HTTP conversation shares.',
      steps: [
        {
          kind: 'teach',
          heading: 'Anatomy of an HTTP exchange',
          body:
            'Every HTTP interaction has the same shape: a **request** from client to server, then a **response** back. The request opens with a request line — method, path, version, like `POST /robots/rq-7/jobs HTTP/1.1` — followed by **headers** (metadata such as `Content-Type: application/json` or `Authorization: Bearer ...`) and, optionally, a **body** carrying the payload. The response mirrors it: a **status code**, headers, and usually a body.\n\nThe status code is the server\'s structured verdict. Learn three families and you can triage any failure in seconds: **2xx** success, **4xx** the client asked for something impossible (bad input, missing resource, no permission), **5xx** the server itself failed. The 1xx and 3xx families handle protocol plumbing — continuations and redirects.',
          keyPoints: [
            'Request = method + path + headers + optional body',
            'Response = status code + headers + optional body',
            '2xx success, 4xx the client\'s problem, 5xx the server\'s problem',
          ],
        },
        {
          kind: 'byte',
          text: 'Hub archive note: during the last outage someone "fixed" a flaky sensor feed by switching GET to POST. Caches stopped working, traffic tripled, and the hub melted. Byte keeps the incident report as a cautionary tale.',
        },
        {
          kind: 'teach',
          heading: 'Methods are verbs with contracts',
          body:
            'Four methods cover most lab work. **GET** reads a resource and must never change state — which is what makes it safe to retry and to cache. **POST** creates something new: submit a pick job, register a reading. **PUT** replaces a resource at a known address — write the whole config file. **DELETE** removes it.\n\nThe method is part of your contract with the server, not a suggestion. Fetching telemetry with POST works against sloppy servers but breaks caching, logging, and every retry guarantee built on top. When a fleet API says `GET /robots/{id}` returns status and `POST /robots/{id}/jobs` creates work, the method alone tells you what happened on the other side — exactly what you want to reconstruct from a log at 2 a.m.',
          keyPoints: [
            'GET reads, POST creates, PUT replaces, DELETE removes',
            'GET is side-effect free — that is what makes retries safe',
            'The method tells caches and log readers what kind of action occurred',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'api-q-status-403',
            prompt:
              'GET /robots/rq-9/status returns 403 while the same call for rq-7 returns 200. Your token works fine for rq-7. What is the most precise reading?',
            options: [
              { id: 'a', text: 'The server could not find robot rq-9' },
              { id: 'b', text: 'Your token is invalid' },
              { id: 'c', text: 'You are authenticated but not authorized: the server knows who you are and denies permission for that specific robot' },
              { id: 'd', text: 'The hub is overloaded and refusing work' },
            ],
            correctId: 'c',
            optionNotes: {
              a: 'A missing resource is 404 Not Found. 403 means the server knows the resource exists — and is refusing you access to it.',
              b: 'Invalid or missing credentials produce 401 Unauthorized. Your token was accepted, or rq-7 would not have returned 200 either.',
              d: 'Overload is the 5xx family — 503 Service Unavailable. Permission problems live in 4xx and will not heal with time.',
            },
            explanation:
              'Status codes are a vocabulary, not decoration. 401 asks "who are you?" (authentication failed); 403 says "I know who you are and you may not do this" (authorization failed); 404 says "no such resource"; 5xx means server-side trouble. Fleet APIs commonly enforce per-robot access lists, so a 403 on one robot while others return 200 is entirely normal — the fix is in your account\'s roles, not in the network.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'api-q-family-count',
            prompt: 'The hub gateway logs one status code per request. What does this audit snippet print?',
            language: 'python',
            code: 'hub_log = [200, 204, 400, 404, 500, 503]\nclient_errors = 0\nserver_errors = 0\nfor code in hub_log:\n    if 400 <= code < 500:\n        client_errors += 1\n    elif code >= 500:\n        server_errors += 1\nprint(client_errors, server_errors)',
            choices: ['2 2', '3 2', '2 3', '3 3'],
            correctIndex: 0,
            explanation:
              'The boundary checks are the family definitions in miniature: 4xx is exactly 400-499 and 5xx is 500 and above. So 400 and 404 count as client errors, 500 and 503 as server errors, and 200 and 204 count as neither — they are successes (204 is "success, no body"). When triaging logs, computing family boundaries this way is how you decide whether to fix your request or page whoever owns the server.',
            hint: '204 is a 2xx. Count only what falls in 400-499, then 500 and up.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'api-q-request-anatomy',
            prompt: 'This is the raw request a dashboard sends so robot rq-7 docks at bay 3. Fill in the method and the content type.',
            language: 'http',
            template:
              '{{b1}} /robots/rq-7/jobs HTTP/1.1\nHost: hub.local\nContent-Type: application/{{b2}}\nAuthorization: Bearer <token>\n\n{"type": "dock", "bay": 3}',
            blanks: [
              { id: 'b1', accept: ['post'], choices: ['GET', 'POST', 'PUT', 'DELETE'] },
              { id: 'b2', accept: ['json'], choices: ['json', 'xml', 'csv'] },
            ],
            explanation:
              'The body creates a docking job — a state change — so the method must be **POST**; GET is reserved for reads and must not carry side effects, and PUT would mean "replace the whole jobs collection". The `Content-Type: application/json` header tells the server how to parse the body; without it, the server may misread perfectly valid JSON as a form submission and reject it with a 400.',
            hint: 'The request has a body that changes state. Which method is allowed to do that?',
          },
        },
      ],
    },
    {
      id: 'api-l2-rest',
      title: 'REST Resources & Idempotency',
      minutes: 6,
      xp: 40,
      narrative:
        'The wire format is understood. Next problem: the Hub\'s URL map was named by three different contractors and none of them agree. REST is the naming convention that outlived them all.',
      steps: [
        {
          kind: 'teach',
          heading: 'Resources, not verbs',
          body:
            '**REST** models a system as **resources** — robots, jobs, sensor readings — each reachable at a URL. The URL names the *thing*; the method names the *action*. You write `POST /jobs` to create a job, never `POST /createJob`: the verb lives in the method, the noun lives in the path.\n\nCollections are plural and hierarchical: `GET /robots` lists the fleet, `GET /robots/rq-7` is one robot, `GET /robots/rq-7/jobs` is that robot\'s jobs. Payloads move as **JSON** — keys and values, nested freely, decodable by every language in this facility. A consistent resource model is why a client written once keeps working as the server grows; it is precisely the property the Hub lost.',
          keyPoints: [
            'URLs name things (nouns); methods carry the action',
            'Plural collections, hierarchy for ownership: /robots/rq-7/jobs',
            'JSON is the default payload format: keys, values, nesting',
          ],
        },
        {
          kind: 'teach',
          heading: 'Idempotency: what happens on retry',
          body:
            'An operation is **idempotent** when repeating it leaves the system in the same state as doing it once. `GET` is idempotent — reading changes nothing. `PUT /config/main` is idempotent — writing the same file twice ends the same way. `DELETE` is idempotent — the second delete finds nothing to remove. **POST is not**: two identical `POST /jobs` requests are two jobs.\n\nNetworks time out, so clients retry, and idempotency decides whether retries are safe. Retrying a GET after a timeout is harmless; retrying a job submission may dispatch two robots to the same part. Real APIs solve this with **idempotency keys** — the client attaches a unique token and the server recognizes duplicates. If the Hub offers one, use it on every POST that costs money or motion.',
          keyPoints: [
            'Idempotent = a repeat has no extra effect: GET, PUT, DELETE — but not POST',
            'Timeouts force retries; idempotency decides if retries are safe',
            'Idempotency keys let servers deduplicate POSTs',
          ],
        },
        {
          kind: 'byte',
          text: 'Byte\'s favorite incident report: a retry loop with no idempotency key submitted 412 queue jobs to one conveyer. The report calls it "the conveyer conga line." Idempotency keys have been mandatory ever since.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'api-q-lifecycle',
            prompt: 'Order one full HTTP round trip between the harvest script and the hub, from first step to last.',
            items: [
              { id: '1', text: 'The script resolves hub.local and opens a connection (TCP, usually TLS)', note: 'Transport first: you need a pipe before you can talk.' },
              { id: '2', text: 'The script sends the request: method, path, headers, and body', note: 'For example GET /robots/rq-7/jobs with Host and auth headers.' },
              { id: '3', text: 'The hub routes by method and path, validates, and applies the action', note: 'This is where permissions and payload are actually checked.' },
              { id: '4', text: 'The hub sends the response: status code, headers, body', note: 'The status code is the summary; the body is the detail.' },
              { id: '5', text: 'The script checks the status code before trusting the body', note: 'Always: parse only after the verdict is success.' },
            ],
            explanation:
              'The round trip has fixed choreography, and knowing it tells you where failures live: connection errors mean no response ever existed (timeout, refused); a 4xx means the hub rejected what you sent at step 3; a 5xx means the hub failed itself at step 3. Clients that check status before parsing (step 5) turn all of these into handled cases instead of mystery KeyErrors deep in their own code.',
            hint: 'You cannot respond to a request that has not been sent.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'api-q-idempotent',
            prompt:
              'A script POSTs a pick job to the hub; the connection times out before the response arrives. The script retries the identical request. What is the risk?',
            options: [
              { id: 'a', text: 'None — an identical request always returns the identical response' },
              { id: 'b', text: 'The retry is guaranteed to fail with a 400' },
              { id: 'c', text: 'The first request may have landed: the retry can create a duplicate pick job, because POST is not idempotent' },
              { id: 'd', text: 'Timeouts only happen on GET requests' },
            ],
            correctId: 'c',
            optionNotes: {
              a: 'Identical POSTs are not repeats — each one that lands creates something new. "Same bytes in" does not mean "same state out".',
              b: 'The server sees nothing unusual about the retry; it may well succeed — by creating a second job. That is exactly the danger.',
              d: 'Timeouts are a property of the network and the server, not of the method. Any request can time out mid-flight.',
            },
            explanation:
              'POST creates something new every time it lands, so "send it again" and "send it once" end in different states — the definition of not idempotent. GET, PUT, and DELETE are idempotent: repeats converge to the same state. Since timeouts are routine, APIs that accept consequential POSTs offer idempotency keys — attach a unique token and the server deduplicates. Without one, design the client to query first ("did my job land?") before blindly resending.',
            hint: 'Ask what state the server was in at the moment the timeout fired.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'bughunt',
            id: 'api-q-params-bug',
            prompt: 'This client runs without errors, but the hub logs every pick job as empty. Click the line where the bug lives.',
            language: 'python',
            code: 'import requests\n\ndef enqueue_pick_job(robot_id, target):\n    url = f"http://hub.local/robots/{robot_id}/jobs"\n    payload = {"type": "pick", "target": target}\n    r = requests.post(url, params=payload, timeout=3)\n    r.raise_for_status()\n    return r.json()["job_id"]',
            buggyLine: 6,
            causeOptions: [
              { id: 'a', text: 'timeout=3 is too short for a job submission to complete' },
              { id: 'b', text: 'params= puts the payload into the URL query string, so no JSON body is ever sent — the server receives an empty job' },
              { id: 'c', text: 'raise_for_status must be called before the request is sent' },
              { id: 'd', text: 'The job_id key should be read with .get() instead of []' },
            ],
            causeCorrectId: 'b',
            fixExplanation:
              '`params=` is for query strings (`?type=pick&target=...`); to send a request body you pass `json=payload`, which serializes the dict and sets `Content-Type: application/json` for you. With the body missing, the hub could not parse a payload, so it created an empty job — the request "worked" while doing the wrong thing, the most expensive kind of client bug.',
            fixedCode: 'import requests\n\ndef enqueue_pick_job(robot_id, target):\n    url = f"http://hub.local/robots/{robot_id}/jobs"\n    payload = {"type": "pick", "target": target}\n    r = requests.post(url, json=payload, timeout=3)\n    r.raise_for_status()\n    return r.json()["job_id"]',
            explanation:
              'In `requests`, the payload keyword decides where your data goes: `params=` appends to the URL, `json=` becomes the request body. Nothing crashed — the hub returned 2xx for an empty job — which is why this class of bug survives for weeks. When a server\'s view of your request disagrees with yours, dump the request (method, URL, body) before touching anything else.',
            hint: 'The server says the job type and target are missing. Where were they actually put?',
          },
        },
      ],
    },
    {
      id: 'api-l3-client',
      title: 'API Clients That Survive Failure',
      minutes: 7,
      xp: 45,
      narrative:
        'The Hub now speaks correctly. Last system on this wing: the client scripts scattered across the lab — the ones that crash at the first hiccup. Time to write clients that expect failure and negotiate with it.',
      steps: [
        {
          kind: 'teach',
          heading: 'A client script is a conversation',
          body:
            'Calling an API from Python follows one pattern (`requests`-style). Set a **timeout** on every call — without one, the default is to wait forever, and one hung hub will hang your whole pipeline. Then check the response before trusting it: `r.raise_for_status()` turns 4xx and 5xx statuses into exceptions, so an error page never masquerades as sensor data. Only after that, call `r.json()`.\n\nWrap the exchange in try/except for `requests.Timeout` (decide: retry, with a delay) and `requests.HTTPError` (log the status and body). Errors are data — the status code, the URL, and the response body together tell you which of three responses fits: retry, give up loudly, or fall back to the last known good value.',
          keyPoints: [
            'Timeout every request; no call may be able to hang forever',
            'Check status (raise_for_status) before parsing the body',
            'Handle Timeout and HTTPError deliberately — never let them be surprises',
          ],
        },
        {
          kind: 'teach',
          heading: 'Reading error responses like an engineer',
          body:
            'A well-behaved API tells you *why* it failed. The status family narrows the culprit — yours or theirs — and the JSON body usually names the exact problem: `{"error": "invalid_target", "detail": "bay 12 is not calibrated"}`. Read it before changing code.\n\nTwo habits separate professional clients from brittle ones. First, **never parse the body of a failed response** — that is exactly where `KeyError: \'voltage\'` comes from. Second, **match handling to the family**: timeouts and 5xx deserve a bounded retry with increasing delay (backoff), because the server may be restarting; a 4xx will fail identically forever, so retrying it is just load. The Hub\'s old clients did neither — they crashed on the first hiccup or hammered a dying server into the ground.',
          keyPoints: [
            'The error body names the problem — read it before changing code',
            'Parsing a failed response is where phantom KeyErrors come from',
            'Retry 5xx and timeouts with backoff; never blindly retry 4xx',
          ],
        },
        {
          kind: 'byte',
          text: 'Field note: the legacy harvest script had no timeout and no status check. When the hub froze mid-response, it printed KeyError: \'voltage\' and the lab spent two days investigating the "broken" sensor. The voltage was fine. The client was not.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'api-q-404-parse',
            prompt: 'A test suite stands in for the hub with a fake response object. What does this print?',
            language: 'python',
            code: 'def read_battery(resp):\n    if resp.status_code == 200:\n        return resp.json()["voltage"]\n    if resp.status_code == 404:\n        return None\n    raise RuntimeError("battery api down")\nclass FakeResp:\n    def __init__(self, code, payload):\n        self.status_code = code\n        self._payload = payload\n    def json(self):\n        return self._payload\nprint(read_battery(FakeResp(404, {"voltage": 12.4})))',
            choices: ['None', '12.4', 'RuntimeError: battery api down', 'KeyError: \'voltage\''],
            correctIndex: 0,
            explanation:
              'The fake returns 404 — but note it still *has* a body. Real 404 responses always carry a body too; it is an error document, not your data. Because the function checks the status code before touching the payload, the 404 branch returns `None` cleanly. A client that skipped the check and went straight to `resp.json()["voltage"]` would get 12.4 here and phantom data in production — the trap this exercise is built to expose.',
            hint: 'The function branches on status_code before it ever calls json().',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'api-q-client-hardening',
            prompt: 'Harden the joint-state reader: no hanging forever, no parsing of error pages.',
            language: 'python',
            template:
              'import requests\n\ndef get_joint_state(robot_id):\n    url = f"http://hub.local/robots/{robot_id}/joints"\n    try:\n        r = requests.get(url, {{b1}}=3)\n        r.{{b2}}()  # turn 4xx/5xx into an exception\n        return r.json()\n    except requests.Timeout:\n        log.warning("joints read timed out")\n    except requests.HTTPError as err:\n        log.error("hub said: %s", err)',
            blanks: [
              { id: 'b1', accept: ['timeout'], choices: ['timeout', 'retries', 'stream'] },
              { id: 'b2', accept: ['raise_for_status'], choices: ['raise_for_status', 'status_code', 'json'] },
            ],
            explanation:
              'The two non-negotiables of any API call. `timeout=3` bounds the wait — without it a frozen hub freezes your control loop with it. `raise_for_status()` converts 4xx/5xx into `requests.HTTPError` *before* `r.json()` runs, so a hub error page can never flow into your parsing code wearing sensor data\'s clothes. The except branches then route each failure to the right response: timeouts may be retried, HTTP errors get logged with their status.',
            hint: 'One keyword bounds the wait; one method converts bad statuses into exceptions.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'api-q-retry-4xx',
            prompt:
              'A harvest script retries every failed call five times instantly — including the 401 it receives after its token expires. What is the strongest critique?',
            options: [
              { id: 'a', text: 'Retries need timeout=0 to work correctly' },
              { id: 'b', text: 'Instant, undifferentiated retries waste the budget on 4xx failures, which can never succeed on retry — reserve retries with backoff for timeouts and 5xx, and fix the 401 by refreshing the token' },
              { id: 'c', text: '401 responses are cacheable, so retrying them is harmless' },
              { id: 'd', text: 'The retry count should be raised to 50 for safety' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'timeout=0 is not a retry setting at all — it configures (or in some clients disables) the per-request wait. The critique is about *which* failures deserve retries.',
              c: 'Retryability has nothing to do with caching. A 401 is the server saying your credentials are wrong; that verdict will not change between attempts.',
              d: 'More retries on a permanent failure is not safety — it is a self-inflicted denial of service against your own API client, and may trip rate limits or lockouts.',
            },
            explanation:
              'Retry logic is only rational for failures that can change between attempts: network timeouts and 5xx (server restarting, load draining). A 4xx is the server passing judgment on your request — identical request, identical verdict — so retrying it just multiplies load and can trip rate limits or account lockouts. The professional shape: a few bounded retries with increasing delay (backoff) for transient failures, and explicit handling — refresh credentials or abort loudly — for 4xx.',
            hint: 'Which failures could plausibly have a different outcome one second later?',
          },
        },
      ],
    },
    {
      id: 'api-l4-auth',
      title: 'Authentication & HTTPS',
      minutes: 6,
      xp: 45,
      narrative:
        'The Hub now speaks cleanly — but during the outage, anyone on the network could read any robot\'s telemetry. The door had no lock. Authentication and transport security are the Hub\'s next missing systems.',
      steps: [
        {
          kind: 'teach',
          heading: 'Authentication vs authorization',
          body:
            '**Authentication** answers "who is calling?" — proving identity with a credential the server can check. **Authorization** answers "what may this caller do?" — permissions evaluated *after* identity. They fail differently and carry different status codes: a missing, invalid, or expired credential is **401 Unauthorized** (identity never established); a valid identity without permission is **403 Forbidden** (the server knows exactly who you are and refuses).\n\nKeeping the two separate is what makes permissions manageable: one system issues identities, another attaches roles and scopes to them. When the fleet API accepts your token for `GET /robots` but rejects it for `POST /robots/rq-7/jobs`, that is authorization layered on top of one authenticated identity — not a second set of credentials.',
          keyPoints: [
            'Authentication proves who you are; authorization decides what you may do',
            '401 = identity not established; 403 = identity known, permission denied',
            'Roles and scopes attach to one identity — not one credential per permission',
          ],
        },
        {
          kind: 'teach',
          heading: 'API keys, bearer tokens, and JWTs',
          body:
            'Three credential shapes cover most APIs. An **API key** is a long-lived static string identifying a client — simple, but it never expires, so whoever copies it *is* you until someone rotates it. A **bearer token** is short-lived: the server issues it after checking real credentials, and "whoever bears it" may act until it expires — a short life bounds the damage of a leak.\n\nA **JWT (JSON Web Token)** is a bearer token that carries its own payload: three dot-separated parts — header, claims, signature. Claims like `sub` (who), `exp` (expiry), and `scope` (permissions) are signed, so the hub can verify the token locally, without a database lookup. Signed, though, is not encrypted: anyone holding the token can read its claims, which is why secrets never go inside one.',
          keyPoints: [
            'API key: static, long-lived, identifies a client — rotate on leak',
            'Bearer token: short-lived, issued after authentication; expiry bounds leak damage',
            'JWT: signed claims (sub, exp, scope) verifiable without a lookup — signed, not encrypted',
          ],
        },
        {
          kind: 'byte',
          text: 'Incident report, annotated by Byte: an API key for the harvest service was found in a browser bundle, a wiki page, and one commit message. Rotation took four minutes; the audit took four weeks. Short-lived tokens were made policy the same day.',
        },
        {
          kind: 'teach',
          heading: 'HTTPS and where secrets may live',
          body:
            '**HTTPS** is HTTP inside a TLS-encrypted tunnel: the request line, headers, and body — including `Authorization` headers and passwords — are unreadable on the network. Over plain HTTP, any machine on the path (lab Wi-Fi, a proxy, a compromised switch) can copy credentials off the wire. That is why credential-bearing requests over `http://` are always wrong — in production *and* in the lab.\n\nThe other half of secret hygiene is location. A secret shipped to a client — a browser bundle, a mobile app, any code that runs on someone else\'s machine — is **not secret**: anyone can open dev tools and read it. Secrets belong server-side: environment variables or a secrets store on a machine you control. A browser dashboard should call *your* backend, which attaches the key and forwards the request — the browser gets a session, never the credential.',
          keyPoints: [
            'HTTPS encrypts headers and bodies — credentials are safe in transit, never over plain HTTP',
            'Anything shipped to a client is readable by the client: browser code cannot hold secrets',
            'Server-side env vars or a secrets store; a backend fronts the credential for browser apps',
          ],
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'api-q-secret-bundle',
            prompt:
              'The status dashboard is a browser app. A teammate proposes embedding the hub API key in the React bundle "so the dashboard can call the hub directly". Best response?',
            options: [
              { id: 'a', text: 'Acceptable if the bundle is minified — minified code is hard to read' },
              { id: 'b', text: 'Reject it: anything in client-side code is readable by anyone with dev tools; keep the key on a small backend that proxies hub calls and gives the browser a session instead' },
              { id: 'c', text: 'Acceptable if the key is base64-encoded before being embedded' },
              { id: 'd', text: 'Fine, as long as the dashboard only sends the key over HTTPS' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Minification is not encryption — view-source and the Network tab read minified strings perfectly well.',
              c: 'Base64 is an encoding, not a lock: it decodes in one step, and the key is still shipped to every visitor.',
              d: 'HTTPS protects the key in transit, but the key still sits in the bundle on every visitor\'s machine — the leak is at rest, not on the wire.',
            },
            explanation:
              'A secret shipped to a client is public: the bundle executes on the visitor\'s machine, so anyone can extract the key and call the hub as your dashboard — indefinitely, until rotation. The standard architecture keeps the credential server-side: the browser authenticates to your backend, the backend attaches the API key and forwards the request, and HTTPS protects every leg of that journey. The lab version of the same rule: robot scripts read tokens from environment variables, never from constants in the repo.',
            hint: 'Who can read code that runs in their own browser?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'predict',
            id: 'api-q-jwt-claims',
            prompt: 'The harvest script inspects the claims of a JWT it was issued (no signature check here — just the payload). What does it print?',
            language: 'python',
            code: 'claims = {"sub": "harvest-bot", "exp": 1729500000, "scope": "jobs:read"}\nnow = 1729600000\nif now >= claims["exp"]:\n    print("expired: re-authenticate")\nelif claims["scope"] == "jobs:write":\n    print("write allowed")\nelse:\n    print("read-only access")',
            choices: ['expired: re-authenticate', 'write allowed', 'read-only access', 'KeyError: exp'],
            correctIndex: 0,
            explanation:
              'The `exp` claim is a Unix timestamp, and expiry is checked first: after it, the token is dead no matter how valid its signature — the client must go re-authenticate, and servers must reject rather than trust. The scope branch never even runs. Note what the JWT carries in plain sight: identity (`sub`) and permissions (`scope`) as readable, signed claims — which is exactly why secrets never belong inside one.',
            hint: 'Compare now against the exp claim before any scope check.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'api-q-auth-flow',
            prompt: 'Order one authenticated round trip between the harvest script and the hub, from first contact to token refresh.',
            items: [
              { id: '1', text: 'The script sends real credentials to the auth endpoint over HTTPS', note: 'Username and password, or a client secret — over an encrypted channel only.' },
              { id: '2', text: 'The auth server verifies them and issues a short-lived signed access token (JWT)', note: 'Identity is established once; the token now represents it.' },
              { id: '3', text: 'The script attaches the token to each request: Authorization: Bearer <token>', note: 'The credential travels in a header — never in the URL or the body.' },
              { id: '4', text: 'The hub verifies the token signature and expiry, then checks its scope against the route', note: 'Signature check = authentication; scope check = authorization.' },
              { id: '5', text: 'On expiry the script refreshes the token rather than re-sending credentials', note: 'Short lifetimes bound the damage of any leaked token.' },
            ],
            explanation:
              'Credentials are presented once to prove identity; the token represents that proof for its short life. The split is the whole design: the expensive secret (the password) crosses the network rarely, the cheap secret (the token) crosses constantly but expires quickly, and authorization rides on claims the hub verifies locally. When a 401 arrives mid-run, the professional response is "refresh the token", not "retry" — this flow tells you exactly which step to repeat.',
            hint: 'You cannot be issued a token before your identity is checked.',
          },
        },
      ],
    },
    {
      id: 'api-l5-design',
      title: 'Designing APIs People Can Use',
      minutes: 6,
      xp: 40,
      narrative:
        'The Hub answers correctly now — but its /readings endpoint once returned four million rows in one dashboard refresh, and the facility still talks about it. An API is only usable at scale when it paginates, versions, throttles, and speaks one error language.',
      steps: [
        {
          kind: 'teach',
          heading: 'Pagination: never return everything',
          body:
            'Any endpoint that returns a collection will eventually return too much of it. **Pagination** splits the answer into pages: the client asks for `?limit=500` and each response carries one page plus a pointer to the next — either an offset (`?offset=1000`) or, better, an opaque **cursor** (`?cursor=eyJpZCI6NDgwOH0`). The client loops, page by page, until the next-page pointer comes back empty.\n\nCursor pagination beats raw offsets on live data: offset 1000 means "skip 1000", and rows inserted or deleted meanwhile shift that window, so a long walk silently skips or duplicates readings. A cursor marks where you actually stopped, so the walk stays consistent even as the fleet keeps writing.',
          keyPoints: [
            'Collections return limit + cursor (or offset); the response names the next page',
            'Loop until the next-page pointer is empty — never assume one response is everything',
            'Cursors mark a position and stay consistent on live data; offsets can skip or duplicate',
          ],
        },
        {
          kind: 'teach',
          heading: 'Versioning, rate limits, and one error language',
          body:
            '**Versioning** freezes a contract: `/v1/robots` promises today\'s field names indefinitely, while `/v2/robots` may rename them. Pin the major version in every client URL — an unpinned client silently tracks "whatever is latest" and breaks the day the hub upgrades.\n\n**Rate limiting** protects a shared server from load, accidental or otherwise. Exceed the budget and you get **429 Too Many Requests**, usually with a `Retry-After` header saying how long to wait; ignoring it and hammering is how throttles escalate into bans. Finally, **consistent error payloads** make clients debuggable: every failure from every endpoint wears the same shape — `{"error": "invalid_target", "detail": "bay 12 is not calibrated", "request_id": "a4f2..."}`. One parsing routine handles them all, and `request_id` ties your failure to the server\'s own logs.',
          keyPoints: [
            'Pin the major version in client URLs: /v1/ is a promise, "latest" is not',
            '429 + Retry-After is the server\'s throttle: wait as instructed, then retry',
            'One error shape everywhere — code, detail, request_id — so clients handle failures uniformly',
          ],
        },
        {
          kind: 'byte',
          text: 'The archive calls it the Four-Million-Row Response: /readings, no pagination, one dashboard refresh, and the hub\'s memory graph went vertical. Every collection endpoint now caps its pages, and Byte keeps that graph framed above the terminal.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'api-q-429-retry',
            prompt: 'Your harvest script receives 429 Too Many Requests with the header `Retry-After: 30`. What is the correct client behavior?',
            options: [
              { id: 'a', text: 'Retry immediately — the request was almost through' },
              { id: 'b', text: 'Treat the 429 as a hard failure and abandon the harvest run' },
              { id: 'c', text: 'Wait about 30 seconds as the header instructs, then retry — and add backoff so the next burst is gentler' },
              { id: 'd', text: 'Retry in a tight loop; one of the attempts will land before the limit resets' },
            ],
            correctId: 'c',
            optionNotes: {
              a: 'The 429 verdict stands until the window resets — an instant retry lands on the same exhausted budget and earns another 429.',
              b: '429 is temporary by definition: abandoning converts a 30-second pause into a failed job.',
              d: 'A tight loop against a rate limiter is how a throttle becomes a ban — limiters escalate on clients that ignore Retry-After.',
            },
            explanation:
              '429 means "over budget, welcome back later" — and `Retry-After` tells you exactly when, which makes honoring it both polite and optimal, since retrying sooner cannot succeed. Well-built clients wrap this in exponential backoff with jitter, so a fleet of scripts restarting together does not reproduce the same spike. The general lesson: the error response often contains your next instruction — read the whole response, not just the status family.',
            hint: 'The server told you exactly when to come back.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'api-q-cursor-loop',
            prompt: 'Fetch every reading from the paginated endpoint: follow the cursor until it runs out.',
            language: 'python',
            template:
              'def fetch_all_readings(robot_id):\n    url = f"https://hub.local/v1/robots/{robot_id}/readings"\n    cursor = None\n    while True:\n        params = {"limit": 500}\n        if cursor:\n            params["cursor"] = cursor\n        r = requests.get(url, params=params, timeout=5)\n        r.raise_for_status()\n        page = r.json()\n        yield from page["items"]\n        cursor = page["{{b1}}"]\n        if not cursor:\n            {{b2}}',
            blanks: [
              { id: 'b1', accept: ['next_cursor', 'next'], choices: ['next_cursor', 'items', 'total'] },
              { id: 'b2', accept: ['break'], choices: ['break', 'continue', 'pass', 'return cursor'] },
            ],
            explanation:
              'The loop asks for a bounded page (`limit=500`), yields what arrived, then follows the server\'s `next_cursor`. When the cursor comes back empty — the server\'s way of saying "no more pages" — the loop breaks. This shape never assumes the collection fits in one response, and because a cursor marks a position rather than a count, rows written during the walk do not shift it.',
            hint: 'The response tells you where the next page starts — and when there is no next page.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'bughunt',
            id: 'api-q-version-pin',
            prompt: 'This client ran untouched for months, then began raising KeyError after a hub upgrade — with no deploy on your side. Click the line where the real bug lives.',
            language: 'python',
            code: 'import requests\n\nHUB = "https://hub.local/api"\n\ndef get_robot(robot_id):\n    r = requests.get(f"{HUB}/robots/{robot_id}", timeout=5)\n    r.raise_for_status()\n    return r.json()\n\nprint(get_robot("rq-7")["status"])',
            buggyLine: 3,
            causeOptions: [
              { id: 'a', text: 'The 5-second timeout is too short for the upgraded hub' },
              { id: 'b', text: 'raise_for_status cannot be combined with f-string URLs' },
              { id: 'c', text: 'The client omits the major version: /api serves whatever the hub currently ships, and the v2 upgrade renamed status to state — pin /v1/ so the contract cannot move underneath the client' },
              { id: 'd', text: 'Production clients must read JSON keys with .get() instead of []' },
            ],
            causeCorrectId: 'c',
            fixExplanation:
              'An unversioned path is a contract that changes without notice: the hub upgrade moved "latest" from v1 (field `status`) to v2 (field `state`), and the client broke at a distance. Pinning the major version — https://hub.local/v1/robots — freezes the field names; the move to /v2/ then becomes a deliberate, tested client change instead of a surprise.',
            fixedCode: 'import requests\n\nHUB = "https://hub.local/v1"\n\ndef get_robot(robot_id):\n    r = requests.get(f"{HUB}/robots/{robot_id}", timeout=5)\n    r.raise_for_status()\n    return r.json()\n\nprint(get_robot("rq-7")["status"])',
            explanation:
              'Versioning exists so servers can evolve without breaking the clients that depend on them: /v1/ keeps its promises, /v2/ may rename, and each client moves on its own schedule. The silent-upgrade failure is nastier than a deploy-time crash — it lands with no change on your side to blame. Pin the version in one constant, and version bumps become a reviewed diff.',
            hint: 'Nothing changed in this file. What did the URL allow the server to change?',
          },
        },
      ],
    },
    {
      id: 'api-l6-webhooks',
      title: 'Webhooks, Polling & Long Operations',
      minutes: 6,
      xp: 45,
      narrative:
        'The harvest job takes twenty minutes, and the old hub design held the HTTP connection open the whole time — clients timed out, retried, and started duplicate harvests. Long work needs a different contract: accept it, report progress, and finish the conversation later.',
      steps: [
        {
          kind: 'teach',
          heading: 'Pull vs push: polling and webhooks',
          body:
            'Two ways to learn that a long job finished. **Polling** is pull: the client asks repeatedly — `GET /jobs/j-84` — until the state says `done`. Simple, firewall-friendly, needs nothing but a client — but it spends requests on answers like "not yet", and result latency equals the polling interval.\n\nA **webhook** is push: at submission the client registers a callback URL, and when the job finishes the server POSTs the result to it. No wasted requests, near-instant delivery — the price is infrastructure: the client needs a reachable HTTP endpoint, and it must survive the realities of push, because servers retry failed deliveries and duplicates happen. Small scripts poll; services that live at a URL get webhooks.',
          keyPoints: [
            'Polling: the client pulls on a schedule — simple, chatty, latent',
            'Webhook: the server pushes to a registered callback URL — instant, but needs a reachable endpoint',
            'Webhook deliveries are retried on failure: handlers must be idempotent',
          ],
        },
        {
          kind: 'teach',
          heading: '202 Accepted: the contract for long work',
          body:
            'A request that would take twenty minutes must not hold its HTTP response open — clients time out, proxies drop idle connections, and a crashed client loses the result of finished work. The standard contract: the server validates, queues the job, and answers fast with **202 Accepted** plus a way to follow up — a `status_url` in the body or a `Location` header.\n\nThe client then polls the status URL (or waits for the webhook) and fetches the result when it is ready. And because the window between "sent" and "accepted" is exactly where timeout-retries strike, submissions carry an **idempotency key**: the server recognizes a resent request as the same job instead of enqueueing a duplicate. Long operations plus retries without idempotency is how one harvest became four.',
          keyPoints: [
            'Long jobs return 202 + status URL instead of blocking the connection',
            'The client follows up: poll the status URL or receive the webhook',
            'An idempotency key makes the resent request a duplicate, not a second job',
          ],
        },
        {
          kind: 'byte',
          text: 'Hub archive: the 40-Minute Poll. A harvest script asked "done yet?" every 2 seconds for 40 minutes — 1,200 requests, 1,199 of them answered "no". The rebuilt job API answers 202, and Byte counts the requests it did not send like trophies.',
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'mcq',
            id: 'api-q-webhook-202',
            prompt:
              'A harvest job takes ~20 minutes. The client POSTs it to the hub and keeps the connection open, waiting for the result. What is wrong with this design?',
            options: [
              { id: 'a', text: 'Nothing — holding the connection open is how the client learns the result instantly' },
              { id: 'b', text: 'The client will likely time out long before 20 minutes, and a retry then resubmits the job — the design should return 202 Accepted with a status URL and let the client follow up' },
              { id: 'c', text: 'The job should be made faster so the response fits in one connection' },
              { id: 'd', text: 'The hub should return 404 until the job finishes' },
            ],
            correctId: 'b',
            optionNotes: {
              a: 'Instant only if the connection survives — proxies and HTTP clients routinely time out far earlier, and the moment it drops, the result is stranded with a client that assumes failure.',
              c: 'Some work takes as long as it takes — a 20-minute simulation cannot be negotiated down to fit a connection timeout. The contract must fit the work.',
              d: '404 means "no such resource". The job exists — it is just not finished, which is a different status and a different contract.',
            },
            explanation:
              'Blocking on long work couples two unrelated timers: the job\'s 20 minutes and the client\'s connection timeout — usually seconds. The response that fits both is **202 Accepted**: "received and in progress", plus a `status_url` (or a webhook callback) to learn the outcome. The client stays in control — it polls on its own schedule or waits for the push — and a dropped connection costs one status check, not a duplicate harvest.',
            hint: 'Which times out first: the 20-minute job, or the client\'s connection?',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'order',
            id: 'api-q-webhook-flow',
            prompt: 'Order one long-running job, submission to result, under the rebuilt hub contract.',
            items: [
              { id: '1', text: 'The client POSTs the job spec with an Idempotency-Key header', note: 'The key is the insurance against timeout-retries.' },
              { id: '2', text: 'The hub validates, queues the job, and returns 202 with a status_url', note: 'The connection closes in milliseconds; the work continues server-side.' },
              { id: '3', text: 'The client polls the status_url with growing delays between checks', note: 'Backoff: queued jobs do not finish faster for being asked about.' },
              { id: '4', text: 'The job finishes; the hub marks state done and POSTs the result to the client\'s webhook URL', note: 'The push lands whenever the work completes — no polling required to receive it.' },
              { id: '5', text: 'A timeout-retried POST arrives; the hub matches its idempotency key and returns the existing job', note: 'One key, one job: the retry is recognized, not re-enqueued.' },
            ],
            explanation:
              'The long-operation lifecycle: submit with an idempotency key, receive 202 and a status URL, follow up by polling or webhook. Step 5 is the one teams skip until the duplicate-harvest incident: the resend arrives minutes later, byte-identical — and only the idempotency key lets the hub answer "that is the same job" instead of quietly starting a second one.',
            hint: 'The client cannot follow a status URL it has not been given yet.',
          },
        },
        {
          kind: 'exercise',
          exercise: {
            kind: 'fillblank',
            id: 'api-q-webhook-fill',
            prompt: 'Submit the harvest job so retries stay safe, and catch the response that comes back.',
            language: 'python',
            template:
              'r = requests.post(url, json=spec,\n    headers={"Idempotency-Key": "harvest-2026-10-17"}, timeout=5)\nif r.status_code == {{b1}}:\n    job = r.json()\n    status_url = job["{{b2}}"]',
            blanks: [
              { id: 'b1', accept: ['202'], choices: ['202', '200', '301'] },
              { id: 'b2', accept: ['status_url'], choices: ['status_url', 'error', 'state'] },
            ],
            explanation:
              'The header carries the idempotency key — the token that lets the hub deduplicate a resent submission. The status to expect is **202 Accepted**, not 200: the request did not complete the work, it scheduled it, and the status code says exactly that. The body hands back the follow-up handle — `status_url` — which the client polls until the state turns done.',
            hint: 'Which status code means "accepted, still in progress" — and which body field tells you where to ask about it?',
          },
        },
      ],
    },
  ],
  flashcards: [
    {
      id: 'fc-api-1',
      categoryId: 'api',
      concept: 'Status code families',
      explanation:
        'HTTP status codes come in families: 2xx success (200 OK, 201 Created, 204 No Content), 4xx the client\'s request is the problem (400 bad input, 401 unauthenticated, 403 forbidden, 404 missing), 5xx the server itself failed (500 internal error, 503 unavailable).',
      example: 'A 503 from the robot hub means retry later with backoff; a 403 means fix your permissions — retrying changes nothing.',
      misconception: '404 does not mean "server down" and 500 does not mean "bad request" — the family names the guilty party.',
      application: 'Triage any API failure in seconds and decide: retry, fix the request, or escalate to whoever owns the server.',
      difficulty: 1,
    },
    {
      id: 'fc-api-2',
      categoryId: 'api',
      concept: 'GET vs POST',
      explanation:
        'GET reads a resource and should never change state, which makes it safe to retry and cache. POST submits data that creates or triggers something — each identical POST is a new operation.',
      example: 'GET /robots/rq-7/jobs lists the jobs; POST /robots/rq-7/jobs creates one.',
      misconception: 'Using POST for reads "because it works" breaks caching and retry safety; using GET for mutations gets you prefetched and re-triggered by link scanners.',
      application: 'Method choice decides whether your retry loop is safe — the difference between refreshing a dashboard and double-dispatching a robot.',
      difficulty: 1,
    },
    {
      id: 'fc-api-3',
      categoryId: 'api',
      concept: 'JSON',
      explanation:
        'JavaScript Object Notation: the default payload format for APIs — nested keys and values, arrays, strings, numbers, booleans, null — language-independent and human-readable.',
      example: '{"robot_id": "rq-7", "joints": [0.1, -0.4], "ok": true}',
      misconception: 'JSON has no comments, no trailing commas, and keys are always double-quoted strings — Python dict syntax is close but not identical.',
      application: 'Every request and response body in a lab API — and every schema you validate sensor data against.',
      difficulty: 1,
    },
    {
      id: 'fc-api-4',
      categoryId: 'api',
      concept: 'Endpoint',
      explanation:
        'One URL-plus-method pair a server responds to: the address of a resource or operation. The same path under different methods is a different endpoint.',
      example: 'GET https://hub.local/api/robots/rq-7 and POST https://hub.local/api/robots/rq-7/jobs are two endpoints.',
      misconception: 'The endpoint is not just the URL — the method is half of the contract, so /jobs with GET and /jobs with POST are different promises.',
      application: 'Endpoints are what you mock in tests, monitor for latency, and version when the contract changes.',
      difficulty: 1,
    },
    {
      id: 'fc-api-5',
      categoryId: 'api',
      concept: 'Header',
      explanation:
        'Structured metadata sent before the body of every request and response: authentication tokens, content types, caching directives.',
      example: 'Authorization: Bearer eyJhbGci... and Content-Type: application/json',
      misconception: 'Headers are not part of the JSON body — a token pasted into the body is invisible to the server\'s authentication layer.',
      application: 'The first place to look when a call works in curl but fails in code — the difference is usually a missing header.',
      difficulty: 2,
    },
    {
      id: 'fc-api-6',
      categoryId: 'api',
      concept: 'Idempotency',
      explanation:
        'An operation is idempotent if performing it twice leaves the same state as performing it once. GET, PUT, and DELETE are idempotent; POST is not.',
      example: 'Retrying a PUT config upload is harmless; retrying a POST job submission can create two jobs.',
      misconception: 'Idempotent does not mean "returns the same response" — the second DELETE may return 404, but the resulting state is identical.',
      application: 'Decides whether timeout-retry logic is safe. POSTs with consequences need idempotency keys or a check-before-resend design.',
      difficulty: 3,
    },
    {
      id: 'fc-api-7',
      categoryId: 'api',
      concept: 'Authentication vs authorization',
      explanation:
        'Authentication proves who the caller is (credentials; 401 when it fails). Authorization decides what that caller may do (roles and scopes; 403 when it fails). Identity is established once; permissions are checked per request on top of it.',
      example: 'A valid token that reads GET /robots fine but receives 403 on POST /jobs: authenticated, not authorized.',
      misconception: 'They are not synonyms — 401 means "I do not know who you are", 403 means "I know exactly who you are and the answer is no". The fixes are different: re-authenticate versus change roles.',
      application: 'Triage gate for every API failure: a 401 sends you to refresh credentials; a 403 sends you to whoever manages roles and scopes.',
      difficulty: 1,
    },
    {
      id: 'fc-api-8',
      categoryId: 'api',
      concept: 'Pagination (limit + cursor)',
      explanation:
        'Collections are returned in pages: the client passes limit=N and receives one page plus a cursor pointing at the next one, looping until the cursor is empty. A cursor marks a position rather than a count, so the walk stays consistent while rows are inserted or deleted.',
      example: 'GET /v1/robots/rq-7/readings?limit=500 returns {"items": [...], "next_cursor": "eyJpZCI6"}; the client follows next_cursor until it is null.',
      misconception: 'One response is never assumed to be the whole collection — and raw offsets silently skip or duplicate rows on live data, because they count positions that keep shifting.',
      application: 'Any endpoint that can outgrow one response: readings, jobs, logs. The client loop breaks when next_cursor comes back empty.',
      difficulty: 2,
    },
    {
      id: 'fc-api-9',
      categoryId: 'api',
      concept: 'Webhook vs polling',
      explanation:
        'Two ways to learn a long job finished. Polling: the client pulls GET /jobs/{id} on a schedule until the state is done. Webhook: the client registers a callback URL at submission and the server POSTs the result when ready — pull vs push.',
      example: 'A 20-minute harvest: the script polls status_url every 30 s (simple, dozens of "not yet" answers) — or the hub pushes the finished result to its webhook the moment it lands.',
      misconception:
        'Webhooks are not strictly better: they need a publicly reachable endpoint and duplicate-tolerant handling, because failed deliveries are retried. A small script behind a firewall polls.',
      application: 'Any long operation — simulations, batch harvests, training runs — returns 202 plus a status URL; how you learn it finished is the poll-vs-webhook choice.',
      difficulty: 2,
    },
  ],
};
