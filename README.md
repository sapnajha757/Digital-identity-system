# Digital Identity System — Project Scaffold

AI-powered digital identity system: understands, categorizes, and connects a
student's documents (certificates, resumes, project reports) instead of just
storing them.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, React, TypeScript, Tailwind, React Flow |
| Backend | FastAPI (Python 3.11+) |
| Relational DB | Postgres |
| Vector DB | Qdrant |
| Knowledge Graph | Neo4j |
| File storage | Supabase Storage |
| Auth | Supabase Auth |

## What's in this scaffold (Day 1)

- Docker Compose for Postgres, Qdrant, Neo4j — one command, all three running locally
- Postgres schema auto-loaded on first container start (`apps/api/db/schema.sql`)
- FastAPI app with:
  - Supabase JWT auth dependency (`core/security.py`)
  - Async Postgres, Qdrant, and Neo4j connection modules (`db/`)
  - SQLAlchemy models + Pydantic schemas matching the DB schema
  - Working `/documents/upload`, `/documents`, `/documents/{id}/status`,
    `/search`, `/timeline`, `/graph` routes (pipeline internals are stubs —
    filled in module by module)
- Next.js app with:
  - Tailwind configured
  - Typed API client (`lib/api-client.ts`) with Supabase auth wired in
  - Landing page that lists documents from the live API

## Setup

### 1. Start the databases

```bash
docker compose up -d
```

This brings up Postgres (`localhost:5432`), Qdrant (`localhost:6333`), and
Neo4j (`localhost:7474` browser UI, `localhost:7687` bolt).

### 2. Backend

```bash
cd apps/api
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in Supabase + LLM keys
uvicorn main:app --reload --port 8000
```

Verify: `curl http://localhost:8000/health` → `{"status": "ok", ...}`

### 3. Frontend

```bash
cd apps/web
npm install
cp .env.local.example .env.local   # fill in Supabase URL + anon key
npm run dev
```

Visit `http://localhost:3000`.

## Next steps (module order)

1. ~~**Module 1** — `services/ingestion`: OCR + extraction, real Supabase Storage upload~~ ✅ done
2. ~~**Module 2** — `services/categorization`: LLM classification into the 7 fixed categories, entity extraction~~ ✅ done
3. ~~**Module 3** — `services/embeddings` + `services/knowledge_graph`: bge-large-en-v1.5 embeddings into Qdrant, relationship inference into Neo4j~~ ✅ done
4. ~~**Module 4** — `services/timeline`: parse extracted date entities into `timeline_events`~~ ✅ done
5. ~~**Module 5** — `services/rag`: grounded chat assistant on top of retrieval~~ ✅ done — see `POST /chat`

> If you already ran `docker compose up` before Module 4, the `timeline_events`
> table won't have the new `date_inferred` column (schema.sql only runs on
> first container start). Run `docker compose down -v && docker compose up -d`
> to reset the local Postgres volume and pick it up.

## All core modules are wired end-to-end

Full flow: **Upload → OCR/extraction → Categorization → (Embeddings + Knowledge Graph + Timeline, in parallel) → completed**

Plus two query surfaces:
- `POST /search` — raw ranked chunks, no generation (fast, for building your own UI on top)
- `POST /chat` — same retrieval, plus a grounded natural-language answer via Claude (`services/rag/`). If retrieval finds nothing, it says so rather than guessing; if the LLM call fails, it still returns the raw matches so the user isn't left with nothing.

Retrieval logic itself lives in one place (`services/rag/retrieval.py`) so `/search` and `/chat` can never drift apart in how they filter or rank results.

## Auth

`/login` handles both sign-up and login via Supabase email/password. `AuthProvider`
(`components/AuthProvider.tsx`) manages the session client-side and redirects:
unauthenticated users get bounced to `/login`, authenticated users get bounced
away from it. The sidebar shows the logged-in email and a logout button.

**Hackathon demo tip**: Supabase requires email confirmation by default, which
means a fresh sign-up can't log in until they click a confirmation email. For
faster demos, go to your Supabase project → **Authentication → Providers →
Email** and turn off "Confirm email" — sign-up will log the user in immediately.

## Frontend

Four pages, one design system ("Dossier" — see below), all wired to the live API:

- **`/`** — Documents: upload + status list
- **`/timeline`** — vertical journey view (flags upload-date fallbacks explicitly via `date_inferred`)
- **`/graph`** — React Flow knowledge graph, radial layout
- **`/chat`** — grounded Q&A with source citations

**Design system — "IDENT.SYS" (retro-futuristic)**: dark synthwave terminal aesthetic. Colors: `void #0A0118` (bg), `panel #150A2E` (surface), `cyan #00F0FF` (primary accent/neon glow), `magenta #FF2E9A` (secondary accent), `amber #FFB627` (pending/warning state), `mist #7A7195` (muted text/borders). Type: Orbitron (headers — geometric, iconic sci-fi display face), Rajdhani (body/UI — technical, condensed), JetBrains Mono (data, ids, timestamps, terminal-style labels). Background: a faint fixed neon grid + a slow CRT scanline overlay (disabled under `prefers-reduced-motion`). Signature element: `components/HudFrame.tsx` — four-corner HUD scanner brackets wrapped around document cards, timeline nodes, and chat messages, evoking "the system is reading this," which ties directly to what the product does.

`npx tsc --noEmit` passes clean with zero type errors. (A production `npm run build` needs to fetch Orbitron/Rajdhani/JetBrains Mono from Google Fonts at build time — make sure you have normal internet access when you run it.)

## What's left for a polished hackathon submission

- Auth: Supabase project setup + `.env` / `.env.local` keys filled in
- Deploy: Render (API) + Vercel (web)
- Cross-document graph relationships (Project → Internship, Skill → Project across documents) — noted as a deliberate scope cut in `docs/architecture.md`
- Chat page currently has no loading skeleton for the very first token — fine for a demo, worth polishing if you have spare time

## Notes

- Every database has exactly one job: Postgres = structured facts + source of
  truth, Qdrant = vectors only (payload is a pointer, never full text), Neo4j
  = relationships only (nodes carry `id` + `type`, details fetched from
  Postgres). Don't duplicate text across all three — see `docs/architecture.md`.
- `BackgroundTasks` is used for async processing in this scaffold (zero infra).
  Swap for Celery + Redis if you need it to survive process restarts or scale
  beyond a single instance.
