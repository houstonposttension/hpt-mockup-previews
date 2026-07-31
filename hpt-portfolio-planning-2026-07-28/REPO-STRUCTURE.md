# HPT Portfolio — Proposed Repo Structure

**Date:** 2026-07-28 (rev 2, DO decision)
**Status:** Proposal. Nothing is scaffolded — repo creation is Wave 1 work.

---

## Naming and location

| Item | Proposed | Notes |
|---|---|---|
| GitHub repo | `houstonposttension/hpt-portfolio` | Matches `wip-processor`, `hpt-mockups` lowercase-hyphen convention |
| Local path | `C:\Dev\HPT-Portfolio\` | Matches the `HPT-*` folder pattern (`HPT-MCP`, `HPT-Memory`, `HPT-Test-Server`) and `feedback_plugin_project_folders` |
| Governance project code | `PORT` (proposed) | Needs allocation in `Standards and Guidelines/governance/PROJECT_REGISTRY.md`. See `OPEN-QUESTIONS.md` Q7. |
| DO App Platform app | `hpt-portfolio` | Defined by `.do/app.yaml` in repo root. Same DO team as the WIP Processor migration. |
| DO Managed Postgres | `hpt_portfolio` schema on the shared cluster provisioned under GA-WIP-062 | Same NYC3 cluster as WIP Processor; connection string bound in `.do/app.yaml`. |

James can override any of these; the rest of the plan does not depend on the names.

---

## Folder tree

```
C:\Dev\HPT-Portfolio\
├── .do/
│   └── app.yaml                    Canonical DO App Platform spec. Governed config, per Std 68 §2.
├── .github/
│   └── workflows/
│       ├── ci.yml                  Lint (ruff) + test (pytest) on push
│       └── deploy.yml              Manual workflow_dispatch → `doctl apps update`
├── app/                            The FastAPI application
│   ├── __init__.py
│   ├── main.py                     FastAPI app factory, middleware, route registration
│   ├── config.py                   Settings, env vars, feature flags
│   ├── models.py                   Feature, ApprovalEvent, AtmosphereItem, AuditRow dataclasses (zero deps)
│   ├── auth/                       Entra SSO wrapper — the second half of the pathfinder tax
│   │   ├── __init__.py
│   │   ├── msal_client.py          MSAL Python wrapper: login, callback, token refresh
│   │   ├── session.py              FastAPI SessionMiddleware config, signing-key handling
│   │   └── allowlist.py            Object-ID allowlist check (v1: single principal from env)
│   ├── routes/                     One module per surface
│   │   ├── cards.py                Portfolio card list, detail, mutations
│   │   ├── atmosphere.py           Incidents, blockers, waiting-on, resource load
│   │   ├── timeline.py             Calendar view (Wave 5)
│   │   ├── activity.py             Activity feed (Wave 6) — reads audit table
│   │   ├── auth.py                 /login, /callback, /logout
│   │   └── api.py                  Machine-facing write endpoint for the dispatch path
│   ├── services/                   Business logic, no HTTP concerns
│   │   ├── approval.py             The single-approval engine — fan-out, inherit, rescind
│   │   ├── github_client.py        GitHub App auth, PR queries, review submission
│   │   ├── priority.py             Reorder and pause cascade over the dependency graph
│   │   └── audit.py                Audit-row writer used by every mutation path
│   ├── store/                      Storage abstraction
│   │   ├── __init__.py
│   │   ├── repository.py           Read/write interface used by everything above
│   │   ├── postgres_backend.py     asyncpg / SQLAlchemy implementation
│   │   └── session.py              Connection pool, transaction helpers
│   ├── templates/                  Jinja2 — full pages plus HTMX partials
│   │   ├── base.html
│   │   ├── portfolio.html
│   │   └── partials/
│   └── static/
│       ├── css/                    Uses tokens-v3.css, no hardcoded hex
│       ├── js/                     Alpine components, htmx.min.js
│       └── vendor/
├── db/                             Postgres schema, seed data, ad-hoc queries
│   ├── schema.sql                  Reference DDL (Alembic is the source of truth for changes)
│   └── seed/
│       └── initial_portfolio.sql   Bootstrap data for a fresh environment
├── alembic/                        Migrations from day one
│   ├── alembic.ini
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 0001_initial_schema.py  Features + audit table + indexes
├── tests/
│   ├── test_approval.py            Approval fan-out, inherit, rescind, CI-red hold
│   ├── test_priority.py            Cascade correctness over the dependency graph
│   ├── test_store.py               Repository interface, audit-row invariants
│   ├── test_auth.py                MSAL wrapper, allowlist enforcement, session handling
│   └── test_routes.py              Route smoke, including empty-data and sparse-data cases
├── docs/
│   ├── adr/                        Architecture Decision Records, NNNN-slug.md
│   ├── mockups/                    Local copies of published mockups, for diffing
│   └── pathfinder/                 Hand-off notes for the WIP Processor DO migration (see Q-DO-6)
├── scripts/
│   ├── seed_portfolio.py           Populate the initial portfolio from current in-flight work
│   └── local_dev.sh                docker-compose up postgres + uvicorn --reload
├── CLAUDE.md                       Agent instructions, governance hook, rules of engagement
├── PROJECT.md                      Roadmap, backlog, project state, how to help
├── CONTEXT.md                      IDs, resource names, decisions, environment
├── GOVERNANCE_ACTIONS.md           The ledger. Std 18 columns: Owner + Due-by required.
├── DEPLOY.md                       Provisioning + deploy runbook (DO-specific)
├── MODULES.md                      Shared-module declarations per Std 19
├── README.md                       Overview + architecture diagram
├── governed_config.json            Std 68 §2. Registers .do/app.yaml and alembic/env.py as governed config.
├── pyproject.toml                  Deps, ruff config, pytest config
├── pytest.ini                      testpaths, so packages/*/tests are picked up
├── requirements.txt                Pinned
├── version.py                      APP_VERSION single source of truth
├── docker-compose.yml              Local dev: Postgres + app
└── .env.example
```

---

## Folder purposes

| Path | Purpose |
|---|---|
| `.do/app.yaml` | The single canonical spec for the DO App Platform app. Every deploy is `doctl apps update <APP_ID> --spec .do/app.yaml`. No console-only changes. Governed config per Std 68 §2. |
| `.github/workflows/` | CI on push, deploy on manual `workflow_dispatch` only — matches WIP Processor's deliberate no-auto-deploy policy |
| `app/` | The FastAPI application. Runs identically on a laptop with docker-compose and on DO App Platform. |
| `app/auth/` | The MSAL Entra wrapper — the code Easy Auth would have replaced on Azure. Becomes the pattern the WIP Processor migration inherits when Easy Auth goes away there. |
| `app/routes/` | HTTP surface, one module per view. Thin — delegates to `services/`. |
| `app/services/` | Business logic with no HTTP or storage knowledge. `approval.py` is the heart of the product. `audit.py` writes the audit row inside the same transaction as the state change. |
| `app/store/` | Postgres-backed. Everything above depends on `repository.py`, never on `postgres_backend.py`. |
| `app/templates/` | Jinja2 pages and HTMX partials. Partials return fragments so a card can re-render without a page load. |
| `app/static/` | Assets. Styling reads `tokens-v3.css` per `feedback_mockup_hpt_guidelines` — no hardcoded hex. |
| `db/` | Reference DDL and seed data. Alembic in `alembic/` is the actual source of truth for schema changes; `db/schema.sql` exists for humans reading the shape at a glance. |
| `alembic/` | Migrations from day one — the schema will move through Waves 1-3 and needs to move under version control from the start, not retrofitted. |
| `tests/` | pytest. Must include empty-data and sparse-data cases per `feedback_ui_test_no_data_and_mockup_diff`. Auth tests exist because MSAL is code we own now, not a platform feature. |
| `docs/adr/` | ADRs for decisions that outlive a session — hosting choice, storage backend, bot identity, auth library. |
| `docs/mockups/` | Local copies of published mockups so shipped UI can be diffed against the approved shape. |
| `docs/pathfinder/` | Hand-off notes for the WIP Processor DO migration. Wave 1 lessons captured here as they land (parallel-track output, not end-of-wave writeup). Positioning confirmed under Q-DO-6 on 2026-07-28. |
| `scripts/` | One-shot utilities. `seed_portfolio.py` bootstraps the initial backlog from current in-flight work. |

---

## Standard files

| File | Contents |
|---|---|
| `CLAUDE.md` | Agent instructions. Must carry the governance hook block (`<!-- governance-hook v1.1 -->`) verbatim from the convention, the rules of engagement, source-of-truth pointers, and deploy basics (DO, not Azure). |
| `PROJECT.md` | Project goal, current state with a date, locked architecture decisions (DO from day one, Postgres, MSAL), roadmap, active TODOs, versioning table. |
| `CONTEXT.md` | DO app ID, GitHub App ID and installation ID, encrypted env-var names, Entra tenant + object IDs, Postgres schema name, environment specifics. Reference material, not narrative. |
| `GOVERNANCE_ACTIONS.md` | Ledger table with the standard columns: ID, Date, Std, Finding, Proposed action, Pri, Status, Resolution, Owner, Due-by. Seeded with GA-PORT-001 (or GA-WIP-263 if James keeps the WIP-series ID — see `GA-WIP-263-DRAFT.md`). |
| `DEPLOY.md` | DO provisioning runbook, the manual `Run workflow` deploy path, `doctl apps update` command reference, post-deploy verification, rollback. |
| `MODULES.md` | Std 19 declarations. Before writing any auth, HTTP, GitHub-client, retry, or Postgres-connection code, check `Standards and Guidelines/library/MODULES.md` for an existing implementation. |
| `governed_config.json` | Std 68 §2. At minimum: `.do/app.yaml`, `alembic/env.py`, `pyproject.toml`. Enforced by the standards check. |
| `README.md` | Public-facing overview, architecture diagram (FastAPI on DO App Platform + Postgres), local setup via docker-compose. |

---

## Conventions to inherit from WIP Processor

- `version.py` as the single source of truth for `APP_VERSION`, bumped in the same edit as the code change, surfaced at `GET /api/version` and in the startup log.
- Semantic versioning: MAJOR for breaking data-contract or UI changes, MINOR for new features, PATCH for fixes.
- `ruff` for lint, `pytest -v` for tests, trust pytest over any test count written in a doc.
- Secrets to DO encrypted env vars on first use — no plaintext in `.env` files that reach the repo.
- Deploy is `workflow_dispatch` only. Push to the default branch runs CI, not deploy. The manual click is the deploy approval — which is consistent with `feedback_deploy_approval_cadence`: Claude surfaces the pending deploy, James clicks.
- Rebase onto the default branch before opening any PR.

## Conventions this project establishes for DO

None of these exist at HPT yet — this project is the first to write them down. They become the template for the WIP Processor migration.

- **`.do/app.yaml` in repo root as the app's canonical spec.** No console-only changes. Every deploy consumes this file.
- **`doctl apps update` in a GitHub Actions workflow gated by `workflow_dispatch`.** OIDC to DO if available; scoped API token in `secrets.DO_API_TOKEN` as fallback. See `OPEN-QUESTIONS.md` Q-DO-2.
- **Encrypted env vars for secrets, plain env vars for configuration.** Distinction documented in `DEPLOY.md`.
- **Alembic for schema.** No `psql`-and-pray. Every schema change is a numbered migration.
- **MSAL wrapper as a first-class module.** Not glue code — a tested `app/auth/` package that the next project can lift.
