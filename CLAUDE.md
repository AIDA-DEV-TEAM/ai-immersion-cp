# Project: AI Immersion Workshop Chatbot

A branded chatbot that facilitates a fixed six-step innovation process in
supervised, time-boxed client workshops. It replaces participants' use of
ChatGPT/Gemini for this flow with a controlled, branded surface. It is **not**
a general assistant — it facilitates the process and declines everything else.

The reason to build this is branding and control, not removing copy-paste.
Manual placeholders are deliberate: they are how participants inject their own
context. Do not "helpfully" automate them away.

---

## The six-step flow

One continuous, compounding thread. Each step grounds itself in what earlier
steps established — especially the challenge framed in step 1.

1. **Frame** — participant states their challenge + context; the bot restates
   it to confirm. No solutions yet. (This seeds everything downstream.)
2. **Widen** — explore the problem space: personas, pains, workarounds,
   success metrics; return insights and risks. Consumes the framed challenge.
3. **Diagnose** — one chosen pain point → Five Whys, root-cause hypotheses,
   test plan. Participant names the pain point.
4. **Ideate** — cluster candidate AI interventions, score them, recommend one
   pilot. Consumes the diagnosed root cause.
5. **Brief** — turn the recommended pilot into a structured pilot brief.
6. **Build** — convert the brief into a single product-requirements prompt for
   a build platform. Participant names the platform.

The exact participant-facing templates, the backend system prompt, and the
guardrail rules are in **`docs/cookbook-chatbot-prompts.md`**. Use them
verbatim — do not paraphrase, reword, or "improve" them. The prompt text
encodes the compounding-thread references on purpose (e.g. Ideate says "the
root cause we identified"); if the thread is truncated those references break,
so session state must preserve the full thread, not just the last turn.

---

## Scope

**In:** the six-step flow; one compounding session thread per participant;
manual placeholder fields for participant context; a branded chat UI; an
optional reasoning ("thinking") display; a cheap off-process input check.

**Out — do NOT build these (they were explicitly dropped):**
- Challenge cards / a challenge picker
- Deep research mode (running research) — the bot never runs research
- The deep-research framing screen and report-ingestion / paste-in step
- User accounts or login (beyond a facilitator-provisioned session code)
- A durable database / long-term persistence

---

## Architecture

- **Branded frontend** → **thin backend proxy** → model provider.
- The proxy holds the API key and exposes one streaming chat endpoint. The
  **browser never sees the key.**
- **Session-scoped state only.** One thread per participant, alive for the
  session. No database. The only thing worth persisting is letting a
  participant export their final Build prompt; that's one artifact, not a store.
- Access is via a facilitator-provisioned session code/link. No auth system.

### Provider / engine — config-driven, OpenAI-compatible lingua franca

Standardize the entire app on the **OpenAI Chat Completions interface**. Keep
`base_url`, `model`, and `api_key` in environment variables / config. Swapping
engines must be a config change, not a code change.

- **DEV engine: NVIDIA NIM.** `base_url = https://integrate.api.nvidia.com/v1`,
  key prefixed `nvapi-`. Free, OpenAI-compatible. **~40 requests/minute**
  (raisable to ~200 on request). This is a prototyping bench **only** — it has
  no SLA and is not for live/customer-facing use. Do not run a real workshop
  on it.
- **PROD engine: Gemini or OpenAI** via the same interface (Gemini through its
  OpenAI-compatibility layer or one thin adapter). The production provider
  decision is made outside the code; the code must not assume which.
- NIM models can be **deprecated with a few days' notice** → keep the model
  name a config string so swapping is one line.

### Framework: LangChain via the OpenAI-compatible class

This project uses **LangChain**. Use `langchain_openai.ChatOpenAI` pointed at
the provider's `base_url` — **not** `ChatNVIDIA`, and **not** the raw `openai`
SDK. The same `ChatOpenAI` class then covers every engine: in dev, point
`base_url` at NIM (`https://integrate.api.nvidia.com/v1`, `nvapi-` key); the
prod swap is a `base_url` + `model` change to OpenAI directly, or to Gemini's
OpenAI-compatibility layer. This keeps engine-swapping a config change, not a
code change, and avoids coupling to a provider-specific class.

- Pass the full thread as the message list on every `.stream()` call — don't
  rely on any LangChain memory abstraction; the thread *is* the state.
- Don't reach for LangGraph for the six-step flow. The state is just the
  message list plus a step index; a graph framework is overkill here.
- Optional: **LangSmith** for tracing/eval — genuinely useful for measuring the
  guardrail's false-positive rate against real transcripts (see guardrail
  section). Gate its env vars so it is off by default and never required to run.

---

## Hard constraints

- Never hardcode or commit keys. `.env` is git-ignored from the first commit.
- Don't introduce a database, accounts, or any dropped/out-of-scope feature.
- Don't auto-fill participant placeholders.
- Keep the full conversation thread in context for every model call.
- The reasoning/thinking display is **optional** and model-dependent (some
  models expose reasoning, some don't). Gate it on the active model actually
  exposing reasoning. It is presentational, not load-bearing — do not block
  Phase 1 on it.

---

## Guardrail design (see docs for the exact rules)

- Classify by **process adherence, not topic.** Any business/organizational
  challenge in any industry is valid; you cannot whitelist subjects.
- **Bias hard toward allowing.** A false positive (blocking a real challenge)
  kills the session; a false negative is caught by the human facilitator in the
  room. Reserve hard blocks for unambiguous non-process requests (trivia, code
  for its own sake, general-assistant use, prompt-extraction).
- Three layers: UI anchoring to the current step (1), the system-prompt scope
  rule (2), and a cheap input pre-check that short-circuits clear abuse before
  the main model call (3). No extraction-hardening — the facilitator is the
  backstop.
- **Guardrail tuning does NOT transfer between engines.** Behaviour tuned on
  the NVIDIA dev model must be re-validated on the production model. Measure
  the false-positive rate explicitly, against real transcripts.

---

## Build order — do ONE phase, then stop and let me review

Use plan mode to propose the approach before writing code. Commit between
phases.

1. **Branded chat skeleton on NVIDIA.** Frontend, proxy, env-driven provider
   config, streaming, the system prompt, the six step templates with manual
   placeholders, one persistent session thread. Runs end-to-end on the free tier.
2. **Guardrail.** The input pre-check + permissive scope handling + redirect UX.
   Tune in dev; watch false positives.
3. **Optional reasoning display.** Only if a reasoning model is selected and
   exposes thinking.
4. **Production swap + re-validation.** Point config at Gemini/OpenAI,
   re-validate the guardrail on the real model, provision rate limits for
   expected headcount.
5. **Polish.** Export the final Build prompt; session save/resume if wanted.

Resist building more than the current phase. The boundaries exist to keep scope
controlled and reviewable.
