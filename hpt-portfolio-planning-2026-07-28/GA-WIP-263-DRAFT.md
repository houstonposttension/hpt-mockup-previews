# GA-WIP-263 — Draft Governance Row

**Date drafted:** 2026-07-28 (rev 3, date cascade)
**Status:** DRAFT — not filed. Filing is a Wave 1 action.
**Destination:** see the ID caveat below before filing.

---

## ID and ledger caveat — read before filing

This row was drafted as `GA-WIP-263` per the Wave 0 task instruction. Two things did not verify:

1. The highest ID currently filed in `C:\Dev\WIP Processor\GOVERNANCE_ACTIONS.md` is **GA-WIP-164**, not 262. GA-WIP-263 may collide with an allocation made elsewhere, or may leave a ~100-row gap. The governance MCP's `allocate_governance_id` tool exists specifically to prevent this (Std 18 amendment), but it mutates state and this was a read-only task, so it was not run.

2. HPT Portfolio is its own project, not a WIP Processor feature. Under the per-project ledger convention it warrants its own project code (`PORT` proposed), its own `GOVERNANCE_ACTIONS.md`, and a registration row in `Standards and Guidelines/governance/PROJECT_REGISTRY.md`. Filed as `GA-WIP-263`, a Portfolio project row lands in the WIP Processor ledger.

**Recommendation:** allocate the `PORT` code, register the project, and file this content unchanged as **GA-PORT-001**. The row body below works under either ID. Tracked as `OPEN-QUESTIONS.md` Q7.

---

## Row (table format)

| ID | Date | Std | Finding | Proposed action | Pri | Status | Resolution | Owner | Due-by |
|---|---|---|---|---|---|---|---|---|---|
| GA-WIP-263 | 2026-07-28 | 07,15,18,19,68 | HPT Portfolio (VP dashboard replacing Dispatch Console) was approved as a concept in dispatch chat 2026-07-27 and is entering build, but has no governed project home: no repo, no ledger, no PROJECT_REGISTRY entry, and no filed kill decision for the work it supersedes (PR #117, Dispatch Console v2). Hosting decision revised 2026-07-28 to DO App Platform, positioning this project as the DO pathfinder for the WIP Processor migration planned Sprint 4-6. | Stand up HPT Portfolio as a governed project on DO App Platform from day one — repo `houstonposttension/hpt-portfolio` at `C:\Dev\HPT-Portfolio\`, full standard file set per `REPO-STRUCTURE.md`, PROJECT_REGISTRY registration under a new project code, its own GOVERNANCE_ACTIONS ledger, and `.do/app.yaml` registered as governed config per Std 68 §2. Execute Waves 1–6 per `WAVE-PLAN.md` rev 3. Close PR #117 as superseded. Produce `docs/pathfinder/wave-1-notes.md` as a first-class Wave 1 deliverable, written in parallel as Wave 1 features land, so the WIP Processor DO migration inherits it. | P1 | APPROVED | Concept approved by James in dispatch chat 2026-07-27 (see `HPT-Memory/memories/project_hpt_portfolio_2026_07_27.md`). Hosting flip to DO approved by James 2026-07-28 during Wave 0 planning. Filed APPROVED, not PROPOSED, per `feedback_chat_approval_is_the_approval_2026_07_28` — chat approval IS the approval, no second approval step. Wave 0 planning artifacts at `C:\Backups\mirrors\hpt-portfolio-planning-2026-07-28\`. Wave 1 scope + timeline confirmed per `feedback_scope_and_timeline_before_execution_2026_07_28`, pending answers to OPEN-QUESTIONS Q1, Q-DO-1, Q-DO-3, Q-DO-4, and Q-DO-5. | James Brady | 2026-08-05 |

---

## Row detail

**ID:** GA-WIP-263 (see caveat — likely should be GA-PORT-001)

**Date:** 2026-07-28

**Standards touched:**
- **Std 07** — identity continuity. Approvals execute under a bot identity, never a personal token. This is the GA-WIP-001 (ClickUp personal token) and Power Automate lessons applied preemptively.
- **Std 15** — cross-project seams. HPT Portfolio reads and writes state across WIP Processor, Certification Processor, Extrusion Log, and the governance ledger. Those seams are declared, not implicit.
- **Std 18** — no nullable Owner or Due-by. Set in this same edit.
- **Std 19** — shared modules. Before writing GitHub-client, auth, retry, or alerting code, check `Standards and Guidelines/library/MODULES.md`. The MSAL wrapper produced in Wave 1 is a candidate for library promotion once it stabilizes.
- **Std 68 §2** — governed config file. `.do/app.yaml` in the repo root is the canonical DO app spec, registered in `governed_config.json` in Wave 1 alongside `alembic/env.py`. This is the first governed `.do/app.yaml` at HPT; the pattern established here is the template the WIP Processor migration inherits.

**Finding.** HPT Portfolio was approved as a concept in dispatch chat on 2026-07-27 and is entering build on 2026-07-29, with no governed home. There is no repo, no project code, no PROJECT_REGISTRY entry, and no ledger. On 2026-07-28 the hosting decision was revised from Azure Function App to DO App Platform, making this project the pathfinder for the WIP Processor migration to DO planned in Sprint 4-6. The pathfinder work — DO app spec, deploy workflow, in-app MSAL, encrypted env vars, Alembic wiring — is the same work Wave 1 has to do to ship read-only cards on DO. It runs as parallel-track output alongside the Wave 1 features, not as additional critical-path days; Wave 1 stays at five work-days and holds the original 2026-08-05 target. The value profile is unchanged: the pattern work is spent once for HPT rather than duplicated. Separately, the work HPT Portfolio replaces — PR #117, Dispatch Console v2 — was killed on 2026-07-27 but remains open on GitHub, which reads as an active roadmap item to anyone looking at the repository.

**Proposed action.**

1. Create `houstonposttension/hpt-portfolio`, cloned to `C:\Dev\HPT-Portfolio\`, with the standard file set per `REPO-STRUCTURE.md` rev 2: `CLAUDE.md` carrying the governance hook block verbatim, `PROJECT.md`, `CONTEXT.md`, `GOVERNANCE_ACTIONS.md`, `DEPLOY.md`, `MODULES.md`, `README.md`, `governed_config.json`, and `.do/app.yaml` in the repo root.
2. Allocate a project code and register HPT Portfolio in `Standards and Guidelines/governance/PROJECT_REGISTRY.md`. Registry edits go through the governance project, not a project session.
3. Provision the DO App Platform app and create the `hpt_portfolio` schema on the shared DO Managed Postgres cluster (GA-WIP-062, live and available) during Wave 1 day one, so infrastructure surprises surface early.
4. Execute Waves 1 through 6 per `WAVE-PLAN.md` rev 3, targets 2026-08-05 through 2026-09-10.
5. Produce `docs/pathfinder/wave-1-notes.md` as a first-class Wave 1 deliverable, written in parallel as features land rather than at the tail, covering the DO deploy shape (OIDC-first with API-token fallback), MSAL wrapper, encrypted env-var conventions, and Alembic wiring. Cross-link from WIP Processor's `docs/upcoming-changes.md` as the reference for the DO migration.
6. Close PR #117 as superseded by HPT Portfolio, with the close message drafted in `OPEN-QUESTIONS.md` Q4.
7. Evaluate open dispatch guardrail PRs #155, #157, and #153 — some may still be worth landing on the current console during the interim.
8. Keep the current Dispatch Console running until HPT Portfolio ships as its replacement. The kill decision applies to the roadmap, not the running app.

**Priority:** P1. This is the surface every other approval flows through, and every week it does not exist is another week of per-PR approval overhead. Additionally, this project's Wave 1 is the DO pathfinder for HPT — delaying it also delays the value the WIP Processor migration inherits.

**Status:** APPROVED.

**Resolution note.** Approved by James in dispatch chat on 2026-07-27, when the concept was locked after the mockup at `vp-dashboard-portfolio-2026-07-27` validated the shape. Hosting decision revised to DO App Platform on 2026-07-28 during Wave 0 planning — reasoning captured in `TECH-STACK-RECOMMENDATION.md` rev 3. Filed as APPROVED rather than PROPOSED per `feedback_chat_approval_is_the_approval_2026_07_28`: chat approval is the approval event, and re-approving a ledger row for the same decision is the exact double-approval theater this project exists to eliminate. Filing it PROPOSED would have been self-refuting.

**Owner:** James Brady

**Due-by:** 2026-08-05 — end of Wave 1, holding the original rev 1 target. The rev 2 slip to 2026-08-11 was reversed on 2026-07-28 after review: pathfinder work runs as parallel-track output alongside the Wave 1 features rather than as additional critical-path days. Wave 1 is the point at which the project is genuinely stood up: repo live, DO app provisioned, Postgres schema live, MSAL auth working, real data rendering, and `docs/pathfinder/wave-1-notes.md` drafted in parallel with the features. Waves 2 through 6 track under their own rows filed in the project's own ledger once it exists.

---

## Cross-references

**Memory:**
- `HPT-Memory/memories/project_hpt_portfolio_2026_07_27.md` — concept, card dimensions, approval model, kill decisions
- `HPT-Memory/memories/feedback_chat_approval_is_the_approval_2026_07_28.md` — why this row is APPROVED
- `HPT-Memory/memories/feedback_scope_and_timeline_before_execution_2026_07_28.md` — the Approve → Scope → Timeline → Confirm → Execute sequence Wave 0 implements
- `HPT-Memory/memories/feedback-mockup-publish-hpt-mockups-first.md` — mockup publishing convention
- `HPT-Memory/memories/feedback_ui_test_no_data_and_mockup_diff.md` — every UI wave tests empty and sparse data and diffs against the approved mockup

**Wave 0 artifacts** (`C:\Backups\mirrors\hpt-portfolio-planning-2026-07-28\`):
`PRD.md`, `TECH-STACK-RECOMMENDATION.md` rev 3, `REPO-STRUCTURE.md` rev 2, `WAVE-PLAN.md` rev 3, `OPEN-QUESTIONS.md` rev 3

**Validated mockup:** `https://houstonposttension.github.io/hpt-mockup-previews/vp-dashboard-portfolio-2026-07-27/`

**Kill decision — PR #117 (Dispatch Console v2).** Killed 2026-07-27. HPT Portfolio absorbs its role. Backlog cleanup owed: close #117 with a superseded note; evaluate #155, #157, #153 individually. The live Dispatch Console keeps running until HPT Portfolio replaces it.

**Related governance:**

- **GA-WIP-062** (DO Postgres migration, APPROVED, target 2026-07-15). The cluster is live and available as of Wave 1 start. HPT Portfolio consumes it via a dedicated `hpt_portfolio` schema. No new database infrastructure stood up.
- **GA-WIP-262** (dispatch-bot identity, upcoming, unfiled at time of writing). HPT Portfolio's approval bot should share that identity rather than creating a second GitHub App. Scope unverified; see `OPEN-QUESTIONS.md` Q5.
- **WIP Processor DO App Platform migration (planned Sprint 4-6).** Documented in `C:\Dev\WIP Processor\CLAUDE.md`. Deploys `hpt-scanner` + `hpt-field` as a modular monolith on DO App Platform using GrowthBook flag routing. HPT Portfolio is the **pathfinder** for this migration — its Wave 1 patterns (`.do/app.yaml` shape, `doctl apps update` deploy workflow, MSAL Entra wrapper, encrypted env-var conventions, Alembic wiring against the shared cluster) become the template the WIP Processor migration inherits. `docs/pathfinder/wave-1-notes.md` produced at end of HPT Portfolio Wave 1 is the reference doc the migration reads.
