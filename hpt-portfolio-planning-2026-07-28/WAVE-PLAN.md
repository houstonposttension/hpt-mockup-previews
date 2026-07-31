# HPT Portfolio — Wave Plan

**Date:** 2026-07-28 (rev 3, date cascade)
**Schedule basis:** Wave 1 kicks off Wednesday 2026-07-29. Wave targets are spaced five work-days apart. Wave 1 stays at five work-days; pathfinder observations run as a parallel-track output alongside the Wave 1 features rather than adding to the critical path.
**Calendar note:** Labor Day falls on Monday 2026-09-07, which sits between Wave 5 and Wave 6 in the cascade and is absorbed by Wave 6's Thursday target (2026-09-10).

---

## Headline

| Metric | Value |
|---|---|
| Waves | 6 build waves after this planning wave |
| Focused effort | 20-24 work-days, roughly 4-4.8 weeks |
| Calendar span | 2026-07-29 through 2026-09-10, roughly 6.5 weeks |
| First usable surface | Wave 1, 2026-08-05 |
| Approval theater killed | Wave 2, 2026-08-12 — this is the milestone that delivers the headline success criterion |
| Feature-complete against the locked concept | Wave 5, 2026-09-02 |

The schedule holds the original rev 1 targets. HPT Portfolio remains the DO App Platform pathfinder for the WIP Processor migration in Sprint 4-6, but the pathfinder work — the `.do/app.yaml` shape, the deploy workflow, the in-app MSAL wrapper, the encrypted env-var conventions — runs as parallel-track output alongside the Wave 1 features rather than as additional critical-path work. The lessons are captured in `docs/pathfinder/` as they land. The value returns as the template the WIP Processor migration inherits, without pushing the schedule.

---

## Wave 0 — Planning (DONE)

**Dates:** 2026-07-28, one day
**Status:** DONE

**Scope.** Concept-to-plan translation. No code, no repo, no infrastructure.

**Deliverables.** `PRD.md`, `TECH-STACK-RECOMMENDATION.md`, `REPO-STRUCTURE.md`, `WAVE-PLAN.md`, `OPEN-QUESTIONS.md`, `GA-WIP-263-DRAFT.md`, all under `C:\Backups\mirrors\hpt-portfolio-planning-2026-07-28\`.

**Dependencies.** Concept locked 2026-07-27; mockup `vp-dashboard-portfolio-2026-07-27` validated. Hosting decision revised on 2026-07-28 from Azure to DO App Platform.

**Risk:** none.

---

## Wave 1 — Read-only portfolio cards on DO

**Target:** 2026-08-05 · **Effort:** 5 work-days · **Risk: Medium**

**Scope.** Turn the validated mockup into a running application on DO App Platform, backed by real data in Postgres. Repo scaffold, DO app provisioned, Postgres schema live via Alembic, MSAL Entra SSO wired, the card model, and a read-only rendering of the portfolio. No writes to GitHub, no approve button wired.

**Deliverables.**
- `houstonposttension/hpt-portfolio` repo created at `C:\Dev\HPT-Portfolio\`, with the full standard file set from `REPO-STRUCTURE.md`
- `.do/app.yaml` committed to repo root as the canonical app spec; app provisioned on DO App Platform
- `hpt_portfolio` schema created on the shared DO Managed Postgres cluster (GA-WIP-062), initial Alembic migration applied
- FastAPI app deploying through `doctl apps update` from a manual `workflow_dispatch` action
- `app/auth/` MSAL wrapper: login, callback, session middleware, object-ID allowlist restricting access to James's Entra object ID
- `Feature` model implementing all nine card dimensions; append-only `audit` table live from commit one
- Portfolio seeded with real current in-flight work via `scripts/seed_portfolio.py`, roughly 20 items
- Card list and card-expansion views matching the approved mockup
- CI (ruff + pytest) green; `workflow_dispatch` deploy workflow live
- `GOVERNANCE_ACTIONS.md` seeded with the project row; `.do/app.yaml` and `alembic/env.py` registered in `governed_config.json`
- `docs/pathfinder/wave-1-notes.md` — parallel-track hand-off document capturing what the WIP Processor migration inherits, written as Wave 1 work lands

**Dependencies.** Open questions Q1 (repo name), Q3 (governance ID), Q-DO-1, Q-DO-3, Q-DO-4, and Q-DO-5 answered. Q2, Q3-storage, Q-DO-2 (OIDC-first with API-token fallback), and Q-DO-6 (pathfinder positioning retained) are DECIDED as of 2026-07-28. The DO Managed Postgres cluster provisioned under GA-WIP-062 is live and available from day one, so Wave 1 consumes an existing resource rather than waiting on provisioning.

**Risk drivers.** Three sources of schedule risk: standing up an unfamiliar deploy platform for the first time at HPT, writing rather than clicking Entra SSO, and getting Alembic wired against a shared Postgres cluster without stepping on the WIP Processor migration's setup. Mitigation: provision the DO app and create the Postgres schema on day one so infrastructure surprises surface early, and treat every Wave 1 lesson as content for the pathfinder hand-off doc — writing it as the work happens is much cheaper than reconstructing it later.

**Definition of done.** James opens the URL on his phone, authenticates with his HPT Entra account through the MSAL flow, and sees the real portfolio. The rendered page is diffed against the approved mockup, and it is tested with an empty database and a one-feature database as well as the seeded set. `docs/pathfinder/wave-1-notes.md` covers deploy, auth, secrets, and Postgres wiring — enough for the WIP Processor migration team to lift.

---

## Wave 2 — GitHub PR integration and the approve button

**Target:** 2026-08-12 · **Effort:** 3-4 work-days · **Risk: High**

**Scope.** The product's reason to exist. Feature labels read from GitHub, live PR state on each card, and the approve button executing a real fan-out approval across every PR carrying the feature label. Rescind ships in the same wave — approve without rescind is not shippable.

**Deliverables.**
- GitHub App bot identity provisioned, private key in DO encrypted env vars
- `services/github_client.py` — installation auth, PR queries by label, review submission
- `services/approval.py` — the single-approval engine: fan-out to open PRs, mark the feature for auto-inherit, hold when CI is red, reverse on rescind
- Every mutation writes an audit row inside the same transaction as the state change
- Approve, rescind, and per-feature auto-merge-policy controls on the card
- Audit note written into every PR review body identifying HPT Portfolio and citing the approval event
- Labeling-gap surfacing: PRs in scope with a wrong or missing label are flagged on the card rather than silently skipped
- Chat-originated approvals recorded with `approval_source: chat` and a conversation citation

**Dependencies.** Wave 1 shipped. Q5 (bot identity alignment with GA-WIP-262) answered. Branch-protection configuration on the target repos confirmed.

**Risk drivers.** This is still the highest-risk wave in the plan. Three reasons: it writes to production pull requests, so a bug has real consequences; GitHub App review permissions interact with branch protection in ways that need confirming rather than assuming; and the rescind path has to be correct on the first ship. Mitigation: build and exercise the whole flow against a throwaway repository before pointing it at `wip-processor`, and ship with auto-merge defaulting to off.

**Definition of done.** James clicks approve on one feature card and every open PR carrying that label shows an approving review from the bot with a citation. He clicks rescind and they all revert. A PR opened the next day with the same label inherits approval automatically. Per success criterion SC-1, this is where approval theater dies.

---

## Wave 3 — Add work from dispatch chat

**Target:** 2026-08-19 · **Effort:** 3-4 work-days · **Risk: Medium**

**Scope.** The write path from a dispatch conversation into the portfolio backlog, plus the direct-entry form on the site. Both paths through one API endpoint, both writing audit rows.

**Deliverables.**
- Machine-facing write endpoint authenticated by a bearer token held in DO encrypted env vars, independent of any browser session
- Direct-entry form on the site with the same field set
- Both paths write through the `store/repository.py` interface, which enforces the audit-row-in-same-transaction invariant
- Approval carried on creation: a feature written from a chat where James already approved lands in state `Approved` with the citation attached
- Dispatch-side convention documented so a Claude session knows how to file a scoped item

**Dependencies.** Wave 1 (model, store, audit table) and Wave 2 (approval event shape) shipped.

**Risk drivers.** The convention risk exceeds the code risk — an endpoint nobody remembers to call is worthless. Mitigation: write the convention into `CLAUDE.md` and into an HPT-Memory feedback entry in the same wave that ships the endpoint. This wave is the mechanical implementation of `feedback_scope_and_timeline_before_execution_2026_07_28`: the scope-and-timeline step is what populates Version, Effort, and the release timeline.

**Definition of done.** James approves something in dispatch chat, Dispatch produces scope and timeline, he confirms, and a correctly populated card appears in the portfolio without anyone touching a database directly.

---

## Wave 4 — Atmosphere section

**Target:** 2026-08-26 · **Effort:** 2-3 work-days · **Risk: Low**

**Scope.** The four-lane organizational weather panel, pinned above the cards, with the roll-up header the mockup validated.

**Deliverables.**
- Live incidents lane, derived from features in state `Broken`
- Blockers lane, derived from state `Blocked`, showing the blocking reason and age
- Waiting-on-external lane, manually flagged per card with a "waiting since" date
- Resource-load lane showing running agents and consumed capacity
- Collapsible "N need your attention" roll-up matching the mockup
- Notification preference toggles — morning digest, in-app dots, push for P1 blockers only, quiet hours — persisted but not yet firing

**Dependencies.** Wave 1. Independent of Waves 2 and 3 — if Wave 2 hits a branch-protection or GitHub App wall, this wave can be pulled forward rather than idling.

**Risk drivers.** Low. Three of four lanes derive from state already in the model. Resource load may be manual in v1 if the Cowork session list is not programmatically reachable, which is an acceptable degradation.

**Definition of done.** The atmosphere panel answers "what is on fire and what is stuck" without expanding a single card.

---

## Wave 5 — Calendar and timeline view (feature-complete)

**Target:** 2026-09-02 · **Effort:** 2-3 work-days · **Risk: Medium**

**Scope.** The Timeline tab from the mockup. Multi-version features laid out as release trains against a calendar, each step carrying its own target version and estimated ship date. This wave lands the portfolio's stated feature set — feature-complete against the locked concept.

**Deliverables.**
- Timeline view rendering release steps against dates
- Mini roadmap on card expansion for multi-version features
- Dependency edges made visible — what a feature blocks and what it waits on
- Slip and risk flags where a target date has passed with the step still open

**Dependencies.** Wave 1 (release-timeline field populated) and Wave 3 (features arriving with timelines attached). Needs enough multi-version features in the backlog to be worth looking at.

**Risk drivers.** Scope creep toward an interactive Gantt. Read-only rendering is two to three days; drag-to-reschedule with live dependency recalculation is a different product and would reopen the framework decision. Held as an explicit open question. Mitigation: ship read-only, and treat any drag-and-drop request as a separate scoped feature.

**Definition of done.** James sees what lands when, across systems, without reading a single card body. Feature-complete against the locked concept.

---

## Wave 6 — Notifications digest, activity feed, related docs

**Target:** 2026-09-10 (Thursday, absorbs Labor Day) · **Effort:** 5 work-days · **Risk: Medium**

**Scope.** The three items deferred from the original concept conversation. Closes the loop from the board to James's inbox and phone.

**Deliverables.**
- Morning digest email at 06:30, honoring the quiet-hours setting from Wave 4
- Push alerts for P1 blockers only
- In-app red dots on cards needing a decision
- Activity feed — the change history and attribution view from the mockup, rendered from the append-only `audit` table populated since Wave 1
- Related-docs links on each card: governance rows, ADRs, PRs, mockups, memory entries

**Dependencies.** Waves 1 through 5 shipped. Notification preferences persisted in Wave 4. Digest delivery mechanism needs a decision — Teams is the established HPT alert channel, but a morning digest may belong in email.

**Risk drivers.** Notification fatigue is the product risk. A digest nobody reads is worse than no digest, and HPT already has a Teams alert-noise problem this is meant to reduce rather than add to. Mitigation: default the digest to on and every push channel to off, and let James opt in.

**Definition of done.** James gets one useful message each morning and does not get a second one he did not ask for.

---

## Schedule summary

| Wave | Scope | Effort | Target | Risk |
|---|---|---|---|---|
| 0 | Planning docs | 1 day | 2026-07-28 | DONE |
| 1 | Read-only portfolio cards on DO | 5 days | 2026-08-05 | Medium |
| 2 | GitHub PR integration and approvals | 3-4 days | 2026-08-12 | High |
| 3 | Add work from dispatch chat | 3-4 days | 2026-08-19 | Medium |
| 4 | Atmosphere section | 2-3 days | 2026-08-26 | Low |
| 5 | Calendar and timeline view (feature-complete) | 2-3 days | 2026-09-02 | Medium |
| 6 | Notifications, activity feed, related docs | 5 days | 2026-09-10 (Thu, absorbs Labor Day) | Medium |

## Sequencing notes

- **Wave 1 is the pathfinder wave, but on the same five-day budget.** The DO deploy, auth, secrets, and IaC pattern work runs as parallel-track output alongside the Wave 1 features rather than as additional critical-path days. `docs/pathfinder/` captures the lessons as the work happens, and the WIP Processor migration inherits the template without HPT paying for the pattern work twice.
- **Waves 2 and 4 are independent of each other.** If Wave 2 hits a branch-protection or GitHub App wall, pull Wave 4 forward rather than idling — Wave 4 only depends on Wave 1. This is the compression lever available if any cascade risk needs absorbing.
- **Wave 2 is the value milestone.** Waves 1 and 2 together deliver the entire stated business case. Waves 3 through 6 are amplification. If the schedule has to be cut, cut from the tail.
- **PR #117 closure timing.** The kill decision is already made. Closing it before Wave 1 ships is the honest signal that the roadmap moved; closing it after Wave 1 keeps a fallback visible. See `OPEN-QUESTIONS.md` Q4.
- **The current Dispatch Console keeps running throughout.** No wave in this plan decommissions it. That decision comes after Wave 2 proves the replacement.
- **Cascade vs. compress.** The dates above are the straight five-day cascade from the original rev 1 targets. If any wave lands early, later dates pull in one-for-one. If Wave 2 waits on branch-protection confirmation, pulling Wave 4 forward keeps the calendar productive rather than idling.
