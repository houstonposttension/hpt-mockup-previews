# HPT Portfolio — Product Requirements Document

**Status:** Wave 0 draft
**Date:** 2026-07-28
**Author:** Dispatch (Claude), on James Brady's Wave 0 planning task
**Concept locked:** 2026-07-27 (see `HPT-Memory/memories/project_hpt_portfolio_2026_07_27.md`)
**Validated shape:** mockup `vp-dashboard-portfolio-2026-07-27`

---

## 1. Problem

Every unit of work at HPT gets approved two to five times — once in dispatch chat, again on a governance row, again per pull request, again on deploy — and the current Dispatch Console shows execution state without showing portfolio state, so James cannot see what is in flight across all systems without opening GitHub, the governance ledger, and three Cowork sessions.

## 2. Goal

One surface that answers "what is in flight everywhere, what is on fire, and what needs my decision," where a single approval on a feature carries end-to-end to every downstream pull request that feature produces.

Three pillars:

1. **Portfolio cards** — one card per feature, carrying the feature from proposal through live, with the metadata needed to make a priority call without leaving the page.
2. **Atmosphere** — the organizational weather at the top of the page: what is broken now, what is stuck, what is waiting on someone outside HPT, and how much agent capacity is consumed.
3. **Calendar timeline** — for multi-version features, the release train laid out in dates rather than in prose.

## 3. Users

| User | Role | Needs |
|---|---|---|
| James Brady (primary) | VP | Approve, reprioritize, pause, and add work. Sole write user in v1. |
| Direct reports (secondary) | Ops / IT leads | Read-only visibility into what is in flight and when it lands. Not built in v1; see Non-goals. |
| Dispatch (Claude) | Automation | Write work items into the backlog from planning conversations; read state to answer status questions. |

## 4. Success criteria

| # | Criterion | Measure |
|---|---|---|
| SC-1 | Per-PR approval theater is eliminated | Number of distinct approval interactions per feature drops from 2–5 to exactly 1 |
| SC-2 | Approval is portable | An approval given in dispatch chat and an approval given by clicking a portfolio card produce the same recorded event, with the same downstream effect |
| SC-3 | Dispatch Console v2 is replaced, not supplemented | PR #117 closed as superseded; no further roadmap investment in the old console |
| SC-4 | Portfolio is the single answer to "what is in flight" | James can answer any in-flight question from this page without opening GitHub or the governance ledger |
| SC-5 | Wave 1 ships on the original target | Read-only card view live by 2026-08-05 |
| SC-6 | Wave 1 establishes reusable DO patterns | Auth, secrets, deploy pipeline, and IaC patterns established in Wave 1 become the template for the wip-processor → DO App Platform migration (Sprint 4-6), captured in `docs/pathfinder/wave-1-notes.md` |

SC-1 is the headline. Everything else supports it.

## 5. Portfolio card model

Each card represents one **feature** — the unit of approval. A feature may produce many pull requests, across many versions, in one or more systems.

| Dimension | Type | Notes |
|---|---|---|
| **System** | enum | WIP Processor, HPT Cloud, HPT Governance, Certification Processor, Extrusion Log, HPT Portfolio, Infrastructure |
| **Feature** | string | The concrete unit of work. This is the approval unit. |
| **Version** | string | Target release train (e.g. `wip-processor@1.26.0`). Multi-version features carry a list. |
| **State** | enum | Proposed, Approved, In Progress, In Review, Shipping, Live, Broken, Blocked |
| **Dependencies** | list of feature IDs | Split into `blocks` (downstream) and `waits_on` (upstream) |
| **Risk** | enum | Low / Medium / High, with a one-line reason |
| **Priority** | int | Ordinal within the portfolio; reorder cascades to dependents |
| **Effort** | string | Hours / days / weeks, visible on the card face so workload is scannable without expanding |
| **Release timeline** | list of steps | For multi-version features: Wave 0 → Wave 1 → Wave N, each with its own target version and estimated ship date. Rendered as a mini roadmap on card expansion. |

Supporting fields (not James-facing dimensions, but required by the model):

- `id` — stable slug, used as the GitHub label value
- `approved_by`, `approved_at`, `approval_source` (`chat` | `portfolio`)
- `github_label` — the label downstream PRs must carry to inherit approval
- `linked_prs` — resolved at read time from the GitHub API, not stored
- `governance_row` — optional cross-reference to a `GA-*` ledger ID

### Card controls

Actions taken from the card, without context-switching to GitHub:

- **Approve feature** — single click. Approves all open PRs carrying the feature label, and marks future PRs under that label as auto-inheriting.
- **Priority up / down** — reorders, cascading to dependents.
- **Pause / resume** — cascades to dependents.
- **Rescind approval** — reverses on all open PRs. Does not affect already-merged PRs.

## 6. Single-approval model

This is the core of the product. The rule:

> One approval event per feature. It may originate in dispatch chat or on a portfolio card. Both write the same event. The event carries to every pull request labeled with that feature, now and in the future.

### Approval semantics

| Situation | Behavior |
|---|---|
| James approves in dispatch chat | Event recorded with `approval_source: chat` and a conversation citation. Governance rows filed downstream are `APPROVED`, not `PROPOSED`. |
| James clicks Approve on a portfolio card | Identical event, `approval_source: portfolio`. |
| Open PR carries the feature label at approval time | Approved immediately via the GitHub API. |
| New PR opened later with the feature label | Auto-inherits approval, provided CI is green and the label is correct. |
| PR carries the wrong label or no label | Falls back to manual approval. The portfolio flags it as a labeling gap rather than silently approving. |
| CI is red | Approval sits. No force-merge, ever. |
| James rescinds | Reverses on all open PRs. Merged PRs are untouched. Portfolio state reverts to Approved-withdrawn. |

Auto-merge policy per feature (merge-on-CI-pass versus require-a-second-click) is a per-feature setting, defaulting to require-a-second-click until James opts a feature into auto-merge.

Every portfolio-triggered approval writes an audit note into the PR review body identifying HPT Portfolio as the actor and citing the approval event. Nothing approves anonymously.

This model is a direct implementation of two locked rules:
`feedback_chat_approval_is_the_approval_2026_07_28` (chat "Approved" IS the approval) and
`feedback_scope_and_timeline_before_execution_2026_07_28` (approval is followed by scope + timeline confirmation, which is what populates the card's Version, Effort, and Release timeline fields).

## 7. Atmosphere section

Pinned above the cards. Four lanes, each collapsible, with a combined "N need your attention" roll-up.

| Lane | Content | Source |
|---|---|---|
| **Live incidents** | Things broken right now | Features in state `Broken`; later, Sentry / Better Stack / App Insights alerts |
| **Blockers** | Things blocked and not moving | Features in state `Blocked`, with the blocking reason and age |
| **Waiting on external** | HR responsiveness, vendor delays, anything outside HPT's control | Manually flagged on a card; carries a "waiting since" date |
| **Resource load** | Agents and tasks currently running, with capacity consumed | Cowork session list; v1 may be manual |

The mockup validated this as a single collapsible "4 need your attention" header expanding into the four lanes. Keep that.

## 8. Add-work paths

Two entry points, one backlog. Both may also carry an approval.

**Path A — Dispatch chat.** James describes work in conversation. Dispatch scopes it, produces a release timeline, James confirms, and the item is written into the portfolio backlog with its Feature / Version / State / Effort fields populated. This is the primary path and is the reason the scope-and-timeline rule exists.

**Path B — Portfolio direct entry.** A form on the site. Same fields, entered by hand. For work James thinks of while looking at the board and does not want to open a chat session for.

Both paths write through the same API endpoint. There is no second backlog and no sync step. Direct file edits to the backlog store are prohibited — everything goes through the API so the audit trail stays complete.

## 9. Non-goals for v1

Explicitly not shipping, so scope does not drift:

- **No per-role permissions.** Single user, James, via Entra SSO. No read-only viewer role, no delegated approvers, no team accounts. Direct-report visibility is a v2 conversation.
- **No multi-tenant or multi-org support.** One HPT tenant, one Entra directory, one Postgres schema. A future spin-out or separate-org story is not a v1 constraint the data model, auth, or hosting need to accommodate.
- **No external customer view.** Nothing in this product is customer-facing or leaves HPT's tenant.
- **No mobile-native app.** Responsive web only. The mockup is phone-viewable; that is the bar.
- **No writing back to the governance ledger.** The portfolio may cross-reference a `GA-*` row. It does not create, edit, or close ledger rows in v1.
- **No replacement of the Portfolio Dashboard wiki.** `C:\Dev\Portfolio-Dashboard` and its ranked backlog keep running independently until HPT Portfolio demonstrably covers the same ground.
- **No auto-merge by default.** Approval approves. Merging still takes a deliberate action per feature unless James opts that feature in.
- **No cost or budget tracking.** Agent spend belongs to the burn-rate conversation, not this board.
- **No historical analytics or velocity charts.** Activity feed in Wave 6 is a log, not a metrics product.
- **No SLA or uptime guarantee.** This is an internal decision surface. If it is down, work continues through chat.

## 10. Constraints and dependencies

- The current Dispatch Console stays running until HPT Portfolio ships as a replacement. Do not decommission the live app on a roadmap decision.
- PR #117 (Dispatch Console v2) is killed. Open dispatch guardrail PRs (#155, #157, #153) need individual evaluation — some may still be worth landing on the current console during the interim.
- GitHub approvals require a bot identity with `pull_requests: write`. This should align with the dispatch-bot identity being filed under GA-WIP-262 rather than creating a second bot. See `OPEN-QUESTIONS.md`.
- Approval writes are irreversible-ish from GitHub's perspective. The rescind path must be built in the same wave as the approve path, not later.

## 11. Failure modes designed for

| Failure | Response |
|---|---|
| Wrong or missing feature label on a PR | No approval. Portfolio surfaces it as a labeling gap on the feature card. |
| CI red at approval time | Approval recorded but not applied. Reapplies automatically when CI goes green. |
| Rescind after some PRs merged | Reverses only what is still open. Merged work is reported as already-landed, not silently ignored. |
| GitHub API unavailable | Approval event is recorded locally and retried. The portfolio shows the approval as pending-sync, never as complete. |
| Two writers (chat and site) racing on the same feature | Last write wins at the API layer; both writes appear in the activity feed. Acceptable at single-user scale. |
| Backlog store corrupted or lost | Postgres on DO Managed Postgres, automatic daily backups with point-in-time restore within the retention window. The audit table is append-only, so recovery is a database restore rather than a file checkout. |
