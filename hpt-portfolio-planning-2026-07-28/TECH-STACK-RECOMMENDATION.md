# HPT Portfolio — Tech Stack Recommendation

**Date:** 2026-07-28 (rev 3, deploy detail + parallel-track pathfinder)
**Decision owner:** James Brady
**Status:** Locked. Hosting decision reversed from Azure to DO on 2026-07-28.

---

## Recommendation in one line

Python 3.11 + FastAPI + HTMX/Alpine, deployed to DigitalOcean App Platform from day one, gated by in-app Entra SSO via MSAL, backed by DO Managed Postgres with an append-only audit table, and executing approvals through a GitHub App bot identity.

The single most important decision below is **building on DO from commit one**. HPT is already committed to exiting Azure — Sprint 4-6 moves `hpt-scanner` and `hpt-field` to DO App Platform under the plan documented in WIP Processor's CLAUDE.md. Standing up HPT Portfolio on Azure now means migrating it later along with everything else. Standing it up on DO now makes it the **pathfinder** — its deploy, auth, secrets, and IaC patterns become the template for the downstream migrations. The pathfinder value comes out of Wave 1 as a documented byproduct, not as extra critical-path days.

---

## 1. Application framework

**Recommended: Python 3.11 + FastAPI + HTMX + Alpine.js.**

Reasoning:

- Every HPT service is Python. WIP Processor, Certification Processor, Extrusion Log, Watchdog, HPT-MCP. Toolchain (`ruff`, `pytest`, `pyproject.toml`), CI templates, governance standards, and the module library in `Standards and Guidelines/library/MODULES.md` are all Python-shaped. A Node/TypeScript service would be the only one in the estate and would fork the shared-module story on day one, which Std 19 exists to prevent.
- HPT already ships this exact kind of surface in Python. `portal_view.py` in WIP Processor serves a server-rendered supervisor dashboard with charts and tabs. HPT Portfolio is that pattern again, so there is a working reference implementation to copy ergonomics from.
- The dashboard is read-mostly. Twenty to fifty cards, a handful of mutations per day (approve, reorder, pause, add). This is squarely in HTMX's competence and does not need a client-side state library, a build step, or a hydration story.
- The validated mockup is already static HTML with collapsible sections and tab navigation. Porting it to Jinja templates plus HTMX partials is a translation. Porting it to React components is a rewrite.
- Alpine.js covers the interactions HTMX does not: collapse/expand, the notification-preferences toggles, optimistic UI on the priority arrows. Roughly 15 KB, no build step, drops in via a script tag.

Language and framework advantages are host-agnostic — the reasoning above holds whether the app runs on Azure Functions or DO App Platform.

**Alternative considered: Node/TypeScript + Next.js.**

| Pro | Con |
|---|---|
| Better fit if the timeline view (Wave 5) becomes a genuinely rich interactive Gantt with drag-to-reschedule | Only non-Python service in the estate; forks CI, linting, testing, and the shared-module library |
| Larger component ecosystem for calendar and timeline widgets | Nobody at HPT maintains Node services today; adds a runtime to the operational surface |
| Server components handle the read-mostly case well | Build step, `node_modules`, and a dependency-update burden for a single-user internal tool |
| React Query would handle GitHub polling elegantly | Does not reuse HPT's proven Python deploy or auth patterns |

**Why FastAPI wins:** the Next.js advantages are real but they all pay off in a rich-SPA future that the PRD explicitly declares a non-goal for v1. The Python advantages pay off immediately and permanently.

**Reverse this decision if:** the Wave 5 timeline view turns out to require drag-and-drop rescheduling with live dependency recalculation. That is the one requirement that would justify a real front-end framework. Flagged in `OPEN-QUESTIONS.md`.

---

## 2. Hosting

**Recommended: DigitalOcean App Platform from day one, with `.do/app.yaml` committed to the repo as the canonical spec.**

Reasoning:

- **Azure exit is locked.** WIP Processor's CLAUDE.md documents the Azure → DO App Platform migration planned for Sprint 4-6, deploying `hpt-scanner` and `hpt-field` as a modular monolith gated by GrowthBook flags. Building HPT Portfolio on Azure now means one more service to migrate later, using a pattern that has to be invented twice.
- **Pathfinder positioning.** HPT Portfolio becomes the first HPT service on DO App Platform. Its Wave 1 work — the `.do/app.yaml` shape, the GitHub Actions deploy pipeline via `doctl apps update`, the in-app Entra SSO wrapper, the encrypted env-var pattern for secrets, the Postgres connection setup — becomes the template the WIP Processor migration inherits. The migration-planning work is folded into Wave 1 as a documented byproduct rather than performed twice.
- **`.do/app.yaml` in repo root aligns with Std 68 §2.** The app spec is a governed config file: versioned, reviewed on change, and added to `governed_config.json` in Wave 1. Nothing about this pattern exists at HPT yet, so establishing it correctly the first time matters.
- **Postgres is live.** DO Managed Postgres (NYC3) is standing under GA-WIP-062 for the WIP Processor tag/operations/events migration, available from Wave 1 day one. HPT Portfolio adds a schema to the same cluster rather than provisioning new infrastructure. Same region as App Platform, so intra-region networking is free and low-latency.
- **App Platform is a plain-web-app shape.** No ASGI adapter, no `function_app.py` wrapper, no Consumption cold-start tradeoff. `uvicorn app.main:app` is the entrypoint. Container images can come later; for v1 the buildpack path is sufficient.

**Pathfinder work runs parallel to Wave 1, not on top of it.** The `.do/app.yaml` shape, the deploy workflow, the secrets convention, and the in-app MSAL wrapper are all real work — but they are exactly the work Wave 1 has to do to ship the read-only cards on DO, and the pathfinder value is documenting what gets learned rather than doing extra work. Wave 1 stays at five work-days. `docs/pathfinder/wave-1-notes.md` is written as the Wave 1 features land, not after them, and captures the shape the WIP Processor migration inherits. HPT pays the pattern-establishment cost once — inside the Wave 1 budget, not on top of it.

**Alternative A: Azure Function App now, migrate to DO in Sprint 4-6.**

| Pro | Con |
|---|---|
| Easy Auth is fifteen minutes of configuration versus one day of MSAL code | Migration cost duplicated — HPT Portfolio and WIP Processor both pay it |
| Bicep IaC, App Insights, Key Vault references all proven | Pattern learned twice — nothing HPT Portfolio establishes carries forward |
| WIP Processor demonstrates the pattern working today | Contradicts the locked Azure exit; standing up a new Azure resource in July for a migration in September is backwards |
| Zero new infrastructure to stand up | HPT Portfolio would be the last new Azure service — not a good look for a governance-visible surface |

**Alternative B: DO Droplet with Docker Compose.** Rejected. Runs the app on a raw VM, which reintroduces the operational surface App Platform is designed to eliminate (OS patching, TLS certificate rotation, restart handling, log shipping). App Platform is the correct DO abstraction for this workload.

**Alternative C: DO Kubernetes.** Rejected. A single-user internal dashboard is not a Kubernetes workload. Kubernetes would be justified if HPT eventually runs many services with complex networking; it is not justified for the second service on the platform.

**Migration trigger:** none. HPT Portfolio is being built on the intended long-term platform, not on a stepping-stone.

---

## 3. Storage

**Recommended: DO Managed Postgres from day one, with a dedicated `hpt_portfolio` schema on the cluster already provisioned under GA-WIP-062. Features live in a normalized table set; every mutation writes an append-only row to an audit table.**

Reasoning:

- **One source of truth.** State lives in Postgres, and only in Postgres. The activity feed planned for Wave 6 reads from the audit table, not from a `git log` over a JSON file. A JSON-in-repo store would have offered a free git-based audit trail, but at the cost of a second source of truth (the running database plus the committed file) that would drift the first time a write raced a deploy.
- **The audit table is the activity feed.** Columns: `feature_id`, `timestamp`, `actor`, `field_changed`, `old_value`, `new_value`, `source` (`chat` \| `portfolio` \| `api`). Every write path — the direct-entry form, the dispatch write endpoint, the approve button — writes one row per changed field. Wave 6's activity view is a `SELECT ... ORDER BY timestamp DESC` with pagination.
- **Right shape for the future queries.** The Wave 5 timeline view needs to query state transitions over time. The dependency graph reorder in `services/priority.py` benefits from a real query engine. A JSON file would have been fine for fifty rows and awkward the first time either of those features had to compose a real query.
- **Same cluster, separate schema.** No extra provisioning. `hpt_portfolio` schema sits alongside the WIP Processor schemas on the cluster GA-WIP-062 has already stood up. Backups, monitoring, and failover are the WIP Processor migration's problem to solve; HPT Portfolio inherits the solution.
- **Alembic migrations from day one.** The schema will move during Waves 1-3 as the model settles. Every change goes through a numbered migration checked into `alembic/versions/`. No hand-edited databases, ever.

Constraints this imposes, which must be honored:

- All writes go through the app's service layer, which is responsible for writing the audit row in the same transaction as the state change. A write path that skips the audit row is a bug.
- The audit table is append-only. No updates, no deletes. Corrections are new rows.
- Connection pooling matters even at low traffic. See `OPEN-QUESTIONS.md` Q-DO-4.

**Alternative A: JSON in the repo, written through the GitHub API.** Was the recommendation in rev 1. Rejected on the flip to DO because it introduces two sources of truth for what a "feature" is — the running app has its in-memory view and the committed JSON is the disk view — and reconciles them at commit latency of 0.5-1 second per write. Postgres eliminates the split.

**Alternative B: Azure Table Storage.** Rejected on the same reasoning as the hosting flip. Provisioning Azure resources for a workload the Azure exit is planning to move is backwards.

**Migration trigger:** none for storage — Postgres is the intended long-term store. Schema evolves through Alembic in place.

---

## 4. Authentication

**Recommended: in-app Entra SSO via MSAL Python, restricted to a single-principal allowlist held in a DO App Platform env var.**

Reasoning:

- **Easy Auth does not exist on DO.** The Azure recommendation depended on a platform feature that is not portable. Building it in-app is real work, but it is Wave 1 work — a required piece of the read-only-cards deliverable rather than an additional cost on top of it.
- **MSAL over Authlib.** MSAL is Microsoft's official library, with better documentation and clearer semantics for Entra-specific edges (token refresh, tenant configuration, single-tenant enforcement). Authlib is more flexible and provider-agnostic, which is not a virtue when the provider is fixed and the flexibility becomes surface for a subtle misconfiguration. Flagged for confirmation in `OPEN-QUESTIONS.md` Q-DO-5.
- **Session cookie signed with a key from encrypted env vars.** No session store required for a single-user surface. FastAPI's `SessionMiddleware` with a rotated signing key held in DO's encrypted env vars is sufficient.
- **Object-ID allowlist, not group membership.** Single user in v1. The allowlist is one Entra object ID in an env var. Adding read-only viewers later means switching to an Entra group and adding one write-permission check — a v2 change, not a v1 design.
- **Dispatch write path (Wave 3) uses a bearer token, not a user session.** A Claude session writing to the backlog authenticates with a service-principal token or a shared secret in encrypted env vars, so backlog writes do not depend on a browser login being alive.

**Wave 1 scope.** The MSAL wrapper module (`app/auth/msal.py`), the session middleware, the login/logout routes, the allowlist check, and the tests are all inside the Wave 1 five-day budget. The wrapper module becomes the template for the WIP Processor migration when Easy Auth goes away there too.

**Alternative: Authlib.** More flexible, provider-agnostic, more moving parts to reason about for Entra specifics. Not recommended for the first pass.

Adding read-only viewers later means switching the allowlist to an Entra group and adding one write-permission check. That is a v2 change and does not need to be designed now.

---

## 5. Secrets

**Recommended: DO App Platform env vars for non-sensitive configuration, DO's built-in encrypted env vars for sensitive values (GitHub App private key, Postgres URL with password, MSAL client secret, session signing key).**

Reasoning:

- DO App Platform encrypts sensitive env vars at rest and injects them at process start. Access control is through the DO team membership model. Rotation is a redeploy.
- No external secret store to stand up in Wave 1. Vault or Doppler could be layered in later if the access-audit story or blast-radius model needs to change, but adding them now is scope creep on the pathfinder.

**What HPT loses relative to Azure Key Vault.** Two things worth naming:

1. **Access-audit tooling is thinner.** Key Vault logs every secret read to a specific principal at a specific time. DO's encrypted env vars are injected at container start and read by the app process — access audit is "the app read them at boot," not per-call. For a single-user internal dashboard this is acceptable; for anything storing customer PII it would not be.
2. **Smaller blast-radius surface, but less mature tooling.** Fewer moving parts (no separate KV resource, no reference-syntax indirection), but also fewer years of production hardening than Key Vault has. The tradeoff nets out fine for HPT's scale, and is flagged in `OPEN-QUESTIONS.md` Q-DO-3 so the assumption is on record rather than implicit.

**Alternative: HashiCorp Vault or Doppler layered on top.** Deferred. Revisit if the app grows secrets that need per-call access audit, or if HPT ends up with more than a handful of services and wants a single pane for secret rotation across them.

---

## 6. Deploy

**Recommended: GitHub Actions → `doctl apps update` against the app spec in `.do/app.yaml`. The deploy workflow is written OIDC-first, with a bounded DO API token in GitHub Secrets as a documented fallback.**

Reasoning:

- `.do/app.yaml` in the repo root is the canonical source of truth for the app's configuration: components, run commands, health checks, env-var references, database bindings, routing. Every deploy is `doctl apps update <APP_ID> --spec .do/app.yaml`. No console clicks that go undocumented.
- Governed config, per Std 68 §2. Added to `governed_config.json` in Wave 1 so changes to the spec go through code review like schema migrations.
- Deploy trigger is manual `workflow_dispatch`, matching WIP Processor's deliberate no-auto-deploy policy. Push to `main` runs CI (ruff + pytest); the manual `Run workflow` click is the deploy approval moment.

**Auth path — OIDC-first, API-token fallback.** Both paths are supported in the same workflow and documented up front so the choice at first-deploy time is a five-minute decision, not a research session.

- **Primary — OIDC federation from GitHub Actions to DigitalOcean.** No long-lived credential in GitHub Secrets. Trust is federated by DO on the repo, workflow, and environment claims of the GitHub OIDC token, and each deploy exchanges a short-lived JWT for a short-lived DO session. This is the same shape WIP Processor uses for Azure and is the target state for the WIP Processor DO migration.
- **Fallback — scoped DO API token.** If OIDC federation is not yet generally available on HPT's DO team at first deploy, the workflow reads a scoped DO API token from `secrets.DO_API_TOKEN`. Token scope is bounded to `app:update` on the specific `hpt-portfolio` app ID, not full-account. Rotated on a fixed cadence and revocable within DO's control panel.
- **Switching paths is a workflow-file edit, not a rewrite.** The deploy step's auth block is the only difference. `docs/pathfinder/wave-1-notes.md` records which path shipped and what a switch looks like, so the WIP Processor migration inherits both options.

**Pattern reuse.** Everything in this section — the `.do/app.yaml` structure, the doctl-based workflow, the OIDC-first-with-token-fallback pattern, the manual-dispatch gating — is the pattern the WIP Processor migration inherits. The pathfinder work is not throwaway.

---

## 7. IaC

**Recommended: `.do/app.yaml` committed to repo root, treated as infrastructure code. Added to `governed_config.json` in Wave 1.**

- Every infrastructure change to the app — new component, added env var, changed health-check path, database rebinding — happens through a PR that edits `.do/app.yaml`. No console-only changes.
- The Postgres schema lives under Alembic. Every schema change is a numbered migration reviewed on merge.
- The DO Managed Postgres cluster itself is not managed from this repo — it is a shared resource standing under GA-WIP-062 in the DO infrastructure that WIP Processor's migration owns. HPT Portfolio consumes it via connection-string binding declared in `.do/app.yaml`.

---

## 8. GitHub integration

**Recommended: a GitHub App bot identity, aligned with the dispatch-bot identity being filed under GA-WIP-262.**

Reasoning:

- **Identity continuity.** HPT has been bitten by this exact class of failure twice — the ClickUp personal token (GA-WIP-001) and the Power Automate flow running under James's personal account, which silently stopped posting Teams cards when he was logged out. An approval mechanism tied to a personal token dies with the account. Std 07 exists because of this.
- **Attribution.** PR reviews show `hpt-portfolio-bot` as the actor, and the review body carries the approval citation. The audit trail is legible to anyone reading the PR without access to the portfolio.
- **Scoping.** A GitHub App gets exactly `pull_requests: write`, `checks: read`, and `metadata: read`. A user PAT carries the user's full access.
- **Token hygiene.** Installation tokens are short-lived and auto-rotate. The App's private key is the only long-lived secret, and it lives in DO's encrypted env vars (`GITHUB_APP_PRIVATE_KEY`).

Storage-related permissions (`contents: write` for the backlog JSON in rev 1) are no longer needed — the backlog lives in Postgres.

**Alternative: James's user PAT.** Faster to set up — roughly ten minutes versus an hour or two for the App. Approvals would appear to come from James personally, which is arguably more honest about who approved. But it inherits every failure mode above, and it cannot survive an account change. Not recommended.

**Known limitation to design around:** a GitHub App's review does not satisfy a branch-protection "required reviewers" rule if the App also authored the PR, and HPT is on the GitHub Team plan where protection-rule options are limited. Confirm the branch-protection configuration on `houstonposttension/wip-processor` before Wave 2 rather than discovering it during implementation.

**Open:** whether GA-WIP-262's dispatch-bot is scoped to cover portfolio approvals or is a narrower identity. One App with the right permission set is clearly better than two. Flagged in `OPEN-QUESTIONS.md` Q5.

---

## 9. Summary table

| Layer | Recommendation | Chief alternative | Reversal cost |
|---|---|---|---|
| Language / framework | Python 3.11 + FastAPI + HTMX + Alpine | Node/TS + Next.js | High — full rewrite |
| Hosting | DO App Platform from day one, `.do/app.yaml` in repo | Azure Function App (rev 1 recommendation) | Not applicable — long-term platform |
| Storage | DO Managed Postgres, dedicated schema, audit table | JSON in repo via GitHub API (rev 1) | Medium — schema-level, behind Alembic |
| Auth | In-app MSAL for Entra SSO, object-ID allowlist | Authlib | Low — swap library, keep session shape |
| Secrets | DO encrypted env vars | Vault or Doppler on top | Low — add-on, not replacement |
| Deploy | GitHub Actions → `doctl apps update`, OIDC-first with bounded API-token fallback | Console-driven | Low — workflow file swap |
| GitHub integration | GitHub App bot, aligned with GA-WIP-262 | James's user PAT | Low |

## 10. What is deliberately unresolved

Carried into `OPEN-QUESTIONS.md` rather than decided blind:

- Whether the Wave 5 timeline view needs drag-to-reschedule, which is the one requirement that would reopen the framework choice.
- The exact permission scope and ownership of the GA-WIP-262 dispatch-bot identity, which determines whether one App or two.
- Current branch-protection configuration on the target repositories, which determines whether a bot review is sufficient to unblock a merge.
- The remaining DO-specific questions (Q-DO-1, Q-DO-3, Q-DO-4, Q-DO-5) that arose from the platform flip: app-spec shape, secrets adequacy, connection pooling, and auth library. Q-DO-2 (deploy auth) and Q-DO-6 (pathfinder positioning) are DECIDED as of 2026-07-28.
