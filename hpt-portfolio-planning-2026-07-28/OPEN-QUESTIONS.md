# HPT Portfolio — Open Questions

**Date:** 2026-07-28 (rev 3, second-pass decisions)
**For:** James Brady
**Blocking:** Wave 1 kickoff, scheduled 2026-07-29

Q1 remains a hard blocker for Wave 1. Q2 (stack), Q3 (storage), Q-DO-2 (deploy auth), and Q-DO-6 (pathfinder positioning) are now **DECIDED** and kept in the doc as record. The DO-specific questions Q-DO-1, Q-DO-3, Q-DO-4, and Q-DO-5 remain the Wave 1 blockers. Q5 remains a Wave 2 blocker.

---

## Q1 — Repo name and location (BLOCKER)

**Proposed:** GitHub repo `houstonposttension/hpt-portfolio`, local path `C:\Dev\HPT-Portfolio\`.

Matches `wip-processor` and `hpt-mockups` for the remote, and the `HPT-*` folder pattern locally.

**Need:** confirm, or name the override.

---

## Q2 — Tech stack (DECIDED 2026-07-28)

**Locked:** Python 3.11 + FastAPI + HTMX/Alpine on DigitalOcean App Platform from day one, DO Managed Postgres for state, in-app Entra SSO via MSAL, GitHub App bot identity for approvals. Full reasoning in `TECH-STACK-RECOMMENDATION.md` rev 2.

The hosting decision was reversed on the day of Wave 0 planning. Rev 1 recommended Azure Function App on the reasoning that Wave 1 was one week long and Azure was proven. The revised reasoning: HPT Portfolio is going to run on DO eventually anyway (WIP Processor's CLAUDE.md documents the Azure exit for Sprint 4-6), and building it there now makes it the **pathfinder** for the WIP Processor migration. The three to four days of migration-planning work that would happen later is folded into Wave 1 as a byproduct rather than performed twice, at a cost of roughly one work-day of Wave 1 length for the pattern work and one for in-app MSAL versus Easy Auth.

Kept in the doc as record of a real decision, not as a live question.

---

## Q3 — Where the portfolio backlog lives (DECIDED 2026-07-28)

**Locked:** DO Managed Postgres, dedicated `hpt_portfolio` schema on the shared cluster already provisioned under GA-WIP-062. Features in a normalized table set; every mutation writes an append-only row to an `audit` table with columns `feature_id`, `timestamp`, `actor`, `field_changed`, `old_value`, `new_value`, `source` (`chat` \| `portfolio` \| `api`).

Rev 1 recommended `data/portfolio.json` committed to the repo, on the reasoning that a git-based audit trail was free and human-editable. The Postgres decision is downstream of the DO flip: the storage seam moves onto the same cluster the WIP Processor migration is already standing up, and the audit table replaces the `git log`-over-JSON scheme with a real query surface that Wave 5 (timeline) and Wave 6 (activity feed) can compose against.

The activity feed in Wave 6 is `SELECT ... FROM audit ORDER BY timestamp DESC` with pagination, not `git log` over a file.

Kept in the doc as record.

---

## Q4 — PR #117 (Dispatch Console v2): close now or after Wave 1?

The kill decision was made 2026-07-27. The only open item is timing and message.

**Recommendation: close now.** The roadmap has moved and leaving it open implies otherwise. The live Dispatch Console keeps running regardless — killing PR #117 kills the "make it better" roadmap, not the running app.

Proposed close message:

> Superseded by HPT Portfolio. The VP-level portfolio surface absorbs this console's role, and the single-approval model replaces the per-PR approval flow this PR was extending. The current Dispatch Console stays running until HPT Portfolio ships as its replacement (Wave 2 target 2026-08-12). Concept locked 2026-07-27; planning docs at `C:\Backups\mirrors\hpt-portfolio-planning-2026-07-28\`.

**Also needs a decision:** open dispatch guardrail PRs #155, #157, and #153. Some may still be worth landing on the current console during the interim; others are dead. I have not evaluated them — that is a separate read-only pass I can run on request.

**Need:** approve the close and the message, or defer to post-Wave-1. Plus a yes or no on evaluating #155 / #157 / #153.

---

## Q5 — Bot identity: piggyback on GA-WIP-262, or separate? (blocks Wave 2)

**Recommended:** one GitHub App, shared with the dispatch-bot identity being filed under GA-WIP-262, with the permission set widened to cover portfolio approvals (`pull_requests: write`, `checks: read`, `metadata: read`).

Two bot identities means two private keys, two encrypted env-var entries, two rotation schedules, and two things to audit — for one logical actor. Note that `contents: write` from rev 1 is no longer needed because the backlog is in Postgres, not a JSON file in the repo.

**What I could not verify:** GA-WIP-262 does not exist in `C:\Dev\WIP Processor\GOVERNANCE_ACTIONS.md`. The highest ID currently filed in that ledger is GA-WIP-164. So either GA-WIP-262 is genuinely upcoming and unfiled, or it lives in a ledger I did not read, or the numbering comes from a different series. I have not assumed a scope for it.

**Need:** confirm the shared-App approach, and point me at GA-WIP-262's actual scope so the permission set can be designed once rather than twice.

**Related and unverified:** current branch-protection configuration on `houstonposttension/wip-processor`. A GitHub App's review does not satisfy a required-reviewers rule if the App also authored the PR, and HPT is on the Team plan where protection options are limited. This needs confirming before Wave 2 rather than discovering during implementation. I can check it read-only if you want.

---

## Q6 — Auth: is single-user SSO sufficient for v1?

**Recommended:** yes. In-app MSAL Entra SSO, gated on your Entra object ID held in a DO env var. No roles, no permissions table, no session store beyond a signed cookie.

The PRD lists per-role permissions as an explicit non-goal, and direct-report read-only visibility is a v2 conversation. Adding viewers later means switching the allowlist to an Entra group and adding one write-permission check.

The library choice (MSAL vs. Authlib) is now Q-DO-5.

**Need:** confirm, or tell me now if a direct report needs read access at Wave 1 — that changes the auth design rather than extending it.

---

## Q7 — Governance row: which ID series, and which ledger?

I drafted `GA-WIP-263-DRAFT.md` as requested, but two things do not line up and I did not want to guess:

1. **The ID.** The WIP Processor ledger's highest filed row is GA-WIP-164, not 262. GA-WIP-263 may collide or may leave a gap depending on what has been allocated elsewhere. There is an `allocate_governance_id` tool in the governance MCP built specifically for collision prevention (Std 18 amendment) — running it is the correct way to get this number, but it mutates state and this task is read-only, so I did not.

2. **The ledger.** HPT Portfolio is its own project. Under the per-project ledger convention it would carry its own code — `PORT` is the obvious candidate — and its row would be `GA-PORT-001` in `C:\Dev\HPT-Portfolio\GOVERNANCE_ACTIONS.md`, with a registration entry in `Standards and Guidelines/governance/PROJECT_REGISTRY.md`. Filing it as `GA-WIP-263` puts a Portfolio project row in the WIP Processor ledger.

**Recommended:** allocate a `PORT` project code, register HPT Portfolio in `PROJECT_REGISTRY.md`, and file the row as `GA-PORT-001`. Keep the drafted content unchanged — only the ID and destination move.

**Need:** confirm the ID series and destination ledger. The draft works either way.

---

## Q8 — Wave 5 timeline: read-only, or interactive? (lower priority)

The mockup's Timeline tab is a read-only rendering of delivery dates. That is two to three days of work.

If the timeline needs drag-to-reschedule with live dependency recalculation, that is a materially different feature and the only requirement in the whole plan that would reopen the framework decision — a real interactive Gantt is where a front-end framework starts earning its cost.

**Recommended:** ship read-only in Wave 5, treat drag-and-drop as a separate scoped feature if you want it.

**Need:** confirm, or flag now if drag-to-reschedule is a must-have.

---

## Q9 — App Service plan sizing (RETIRED)

Retired on the DO flip. DO App Platform's Basic tier ($5/month per component) covers the workload at similar cost to a shared Azure B1 without the plan-sharing blast-radius concern. Sizing of the DO app tier will be a Wave 1 implementation choice, not a Wave 0 decision — start on Basic, upsize if load surprises us.

Kept in the doc as record that the question was thought through, not skipped.

---

## Q10 — Mockup repo inconsistency (housekeeping)

The mockup I read is at `houstonposttension.github.io/hpt-mockup-previews/vp-dashboard-portfolio-2026-07-27/`, but the canonical mockup target in memory (`feedback-mockup-publish-hpt-mockups-first`, `reference-publish-mockup-shareable-url`) is `houstonposttension/hpt-mockups`.

Either a second mockup repo exists and memory is stale, or this one was published off-convention. Not urgent, but the memory entry should match reality before it misroutes a future publish.

**Need:** tell me which repo is canonical and I will correct the memory entry.

---

## Q-DO-1 — `.do/app.yaml` structure: one app, or two? (blocks Wave 1)

**Recommended:** one DO App Platform app named `hpt-portfolio` with a single web component running the FastAPI service. Static assets served by FastAPI in-process rather than as a separate static component — the mockup's asset footprint is small enough that the extra component and inter-component routing are not worth it.

**Alternative:** separate the portfolio API and a static frontend into two components inside one app. Buys nothing at this scale (no CDN benefit worth the complexity, no independent scaling need), costs one extra `.do/app.yaml` section and a routing rule.

**Need:** confirm single-component, or say split-two. This shapes the initial `.do/app.yaml`.

---

## Q-DO-2 — Deploy auth: OIDC to DO, or scoped API token? (DECIDED 2026-07-28)

**Locked:** write the deploy workflow OIDC-first, with a bounded DO API token in `secrets.DO_API_TOKEN` as a documented fallback if OIDC federation is not yet generally available on HPT's DO team at first deploy. Both paths ship in the same workflow file; the auth block is the only difference. Full pattern in `TECH-STACK-RECOMMENDATION.md` §6.

The path taken at first deploy — OIDC or scoped token — is recorded in `docs/pathfinder/wave-1-notes.md` so the WIP Processor migration inherits both the primary and the fallback without a second research pass. Token scope is bounded to `app:update` on the specific `hpt-portfolio` app ID, not full-account.

Kept in the doc as record.

---

## Q-DO-3 — Secrets: DO encrypted env vars, or external secret store? (blocks Wave 1)

**Recommended:** DO App Platform's built-in encrypted env vars for Wave 1. The set of secrets is small — GitHub App private key, Postgres URL with password, MSAL client secret, session signing key, dispatch bearer token — and DO's mechanism is adequate for a single-user internal surface.

**Tradeoff worth naming.** DO's encrypted env vars are less mature than Azure Key Vault on access-audit tooling. Key Vault logs every secret read to a specific principal at a specific time; DO's model is inject-at-boot with no per-call log. For a single-user internal dashboard this is acceptable; for anything storing customer PII it would not be. Blast radius is smaller (fewer moving parts, no cross-resource KV reference indirection), but the tooling is thinner.

**Alternatives:** HashiCorp Vault or Doppler layered on top. Both real options if HPT ends up wanting a single pane for secret rotation across many services, or if per-call access audit becomes a requirement. Not needed for Wave 1.

**Need:** confirm DO encrypted env vars for v1, or flag now if the audit-thinness is a problem worth solving in Wave 1 rather than later.

---

## Q-DO-4 — Postgres connection pool: pgbouncer on DO, or in-app? (blocks Wave 1)

**Options:**

- **pgbouncer as a DO Managed Postgres add-on.** Roughly $15/month extra. External pooler sits between the app and the database, hides connection churn from Postgres, and is the pattern DO recommends for anything that scales. Complexity: one more moving part.
- **asyncpg pool inside the app.** No extra cost. Simpler operationally (one process, one pool). Hits the Postgres connection cap sooner if the app ever runs multiple replicas or if the WIP Processor migration adds significant connection pressure to the shared cluster.

**Recommended:** asyncpg in-app pool for Wave 1 — the single-user workload does not need pgbouncer, and the extra $15/month is not free. Revisit when either (a) the app runs on more than one replica, or (b) the WIP Processor migration lands on the shared cluster and the connection budget gets tight.

**Need:** confirm in-app pool for v1, or say add pgbouncer now for consistency with whatever the WIP Processor migration is planning.

---

## Q-DO-5 — Auth library: MSAL Python or Authlib? (blocks Wave 1)

**Recommended: MSAL Python.**

- MSAL is Microsoft's official library. Documentation and examples for Entra-specific behavior (single-tenant enforcement, token refresh, admin consent, group claims) are clearer and more direct than Authlib's provider-agnostic docs.
- Entra is a fixed provider for HPT — the flexibility Authlib offers is not a virtue when the target does not change, and each configuration knob is surface for a subtle misconfiguration.
- MSAL's session handling maps cleanly onto FastAPI's SessionMiddleware.

**Alternative:** Authlib. More flexible, provider-agnostic, better ecosystem for OAuth providers that are not Microsoft. Would be the right choice if HPT expected to swap identity providers.

**Need:** confirm MSAL, or flag if there is a reason to prefer Authlib I have not thought of.

---

## Q-DO-6 — Pathfinder hand-off: explicit doc at end of Wave 1? (DECIDED 2026-07-28)

**Locked:** yes. HPT Portfolio IS the DO App Platform pathfinder for the WIP Processor migration. `docs/pathfinder/wave-1-notes.md` ships as a first-class Wave 1 deliverable, covering the DO app spec shape, deploy workflow (OIDC-first with API-token fallback), MSAL wrapper, encrypted env-var conventions, Postgres/Alembic wiring, and anything that surprised us during setup. Cross-linked from WIP Processor's `docs/upcoming-changes.md` as the reference for the DO migration.

Framing correction from rev 2: the pathfinder work is not "extra days on top of Wave 1." It is the same work Wave 1 has to do to ship the read-only cards on DO, plus the discipline of writing down what gets learned. Wave 1 stays at five work-days, and the hand-off doc is drafted in parallel as the features land rather than backfilled at the tail. PRD SC-6 records this as a success criterion.

Kept in the doc as record.
