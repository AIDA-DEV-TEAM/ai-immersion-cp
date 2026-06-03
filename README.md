# AI Immersion Workshop Chatbot

A branded chatbot that facilitates a fixed **six-step innovation process** in
supervised, time-boxed client workshops. It replaces participants' ad-hoc use of
ChatGPT/Gemini for this flow with a controlled, branded surface — it is **not** a
general assistant. It walks a participant through turning a real business
challenge into a concrete, buildable AI pilot concept, then declines anything
outside that process.

> **Status:** Phase 2 — branded chat skeleton (Phase 1) plus the guardrail
> input pre-check, running end-to-end on the free NVIDIA NIM tier. Later phases
> (reasoning display, production provider swap, polish) are not yet built.

---

## The six-step flow

One continuous, compounding thread — each step grounds itself in what earlier
steps established, especially the challenge framed in step 1.

1. **Frame** — participant states their challenge + context; the bot restates it.
2. **Widen** — explore the problem space: personas, pains, workarounds, metrics.
3. **Diagnose** — one chosen pain point → Five Whys, root-cause hypotheses, tests.
4. **Ideate** — cluster candidate AI interventions, score them, recommend a pilot.
5. **Brief** — turn the recommended pilot into a structured pilot brief.
6. **Build** — convert the brief into a single product-requirements prompt.

The participant-facing step templates, the backend system prompt, and the
guardrail rules live in [`docs/cookbook-chatbot-prompts.md`](docs/cookbook-chatbot-prompts.md)
and are used **verbatim**.

---

## Architecture

```
Branded React UI  ──POST /api/session──────►  FastAPI proxy
  (browser)                                     (holds the API key)
  fetch + reader  ──POST /api/chat (SSE)─────►  ChatOpenAI(base_url=…).astream()
                  ◄──── token stream ─────────  in-memory session store
```

- **Thin backend proxy** holds the provider API key — **the browser never sees it.**
- **Provider-agnostic, config-driven.** Standardised on the OpenAI Chat
  Completions interface via LangChain's `ChatOpenAI` pointed at `base_url`.
  Swapping engines (NVIDIA NIM in dev → Gemini/OpenAI in prod) is a **config
  change, not a code change**.
- **Session-scoped state only** — one compounding thread per participant, held in
  memory. No database, no accounts. The full thread is re-sent on every model call.

### Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript 5, Vite, Tailwind CSS, React Query |
| Backend | FastAPI, Python 3.11+, Pydantic v2, LangChain (`langchain-openai`) |
| Dev engine | NVIDIA NIM (OpenAI-compatible, free tier) |
| Testing | pytest + httpx (backend), Vitest + RTL (frontend) |

---

## Project structure

```
backend/
  app/
    main.py            # FastAPI app, CORS, exception handler
    core/              # config (Pydantic Settings), llm (ChatOpenAI factory)
    routers/           # chat.py — POST /api/session, /api/chat (SSE), /api/step
    services/          # chat_service (thread + streaming), session_store (in-memory)
    schemas/           # Pydantic request/response models
    prompts/           # system_prompt.txt (verbatim)
  tests/               # smoke tests incl. thread-persistence assertion
frontend/
  src/
    api/               # axios client + streaming fetch generator
    hooks/             # useSession (React Query), useChatStream
    components/        # ChatWindow, StepRail, Composer, MessageList, …
    data/              # stepTemplates.ts (verbatim participant templates)
docs/                  # cookbook prompts (system prompt, templates, guardrail rules)
```

---

## Getting started

### Prerequisites
- Python 3.11+ and Node.js 18+
- An **NVIDIA NIM API key** (free): sign in at <https://build.nvidia.com>, open a
  chat model, and copy its `nvapi-…` key. This is the only credential required.

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env          # then paste your nvapi- key into PROVIDER_API_KEY
uvicorn app.main:app --reload --port 8000
```

`backend/.env` (git-ignored — never commit it):

```bash
PROVIDER_BASE_URL=https://integrate.api.nvidia.com/v1
PROVIDER_MODEL=meta/llama-3.3-70b-instruct   # use the exact id from the model's page
PROVIDER_API_KEY=nvapi-...                    # your key
GUARDRAIL_MODEL=meta/llama-3.1-70b-instruct  # pre-check model; can be smaller/faster
BRAND_NAME=Acme
BRAND_VOICE=warm, plain-spoken, professional
CORS_ORIGINS=http://localhost:5173
```

> Run **single-worker**: the session store is in-memory and not multi-worker
> safe. `--reload` wipes sessions on restart (expected).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173 (proxies /api to the backend)
```

Open <http://localhost:5173> → **Begin session** → insert the Frame template,
fill the `[bracketed]` blanks with your own context, and send.

---

## Testing

```bash
# Backend
cd backend && pytest -q

# Frontend
cd frontend && npm run test
npm run type-check
```

The guardrail's labeled eval (real-model, requires a key) is excluded from the
default run. Validate the false-positive rate explicitly with:

```bash
cd backend && pytest -m eval -s
```

---

## Configuration reference

| Variable (backend `.env`) | Purpose | Default |
|---------------------------|---------|---------|
| `PROVIDER_BASE_URL` | OpenAI-compatible endpoint | NVIDIA NIM |
| `PROVIDER_MODEL` | Facilitator model id (config string — swap in one line) | `meta/llama-3.1-70b-instruct` |
| `PROVIDER_API_KEY` | Provider key (held server-side only) | — |
| `GUARDRAIL_MODEL` | Pre-check classifier model (reuses base_url + key) | `meta/llama-3.1-70b-instruct` |
| `BRAND_NAME` / `BRAND_VOICE` | Build-time branding in the system prompt | `Acme` / … |
| `CORS_ORIGINS` | Comma-separated allow-list (never `*`) | `http://localhost:5173` |

---

## Notes & constraints

- The model **declines off-process requests** — this is a workshop facilitation
  tool, not a general assistant.
- **Guardrail (3 layers):** the StepRail UI anchors the current step (1), the
  system prompt scopes the facilitator (2), and a cheap model-based **input
  pre-check** hard-stops unambiguous off-process abuse before the main call (3).
  The pre-check **biases hard toward allowing** — a false positive kills a session,
  a false negative is caught by the facilitator in the room — and **fails open**
  (any classifier error allows the turn). On a block it returns a redirect notice
  anchored to the current step; the main model is never called.
- Manual `[bracket]` placeholders are deliberate — they are how participants
  inject their own context, and are never auto-filled.
- Guardrail tuning does **not** transfer between engines; it must be re-validated
  (run the labeled eval, `pytest -m eval`) on the production model before live use.
- The NVIDIA NIM free tier (~40 req/min, no SLA) is a prototyping bench only —
  not for live customer workshops.
