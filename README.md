# HPT Mockup Previews

Public preview host for HPT mockup HTML files, served via **GitHub Pages** so mockups render inline on mobile browsers.

> Files here are illustrative mockups, **not** production code. See the private `houstonposttension/wip-processor` repo for the real spec and implementation.

## How to view a mockup

Prefix any file path with `https://houstonposttension.github.io/hpt-mockup-previews/`.

> Served natively by GitHub Pages — no proxy, no interstitial. (Earlier `raw.githack.com` / `rawcdn.githack.com` links are retired; use Pages URLs for anything new.)

## Current mockups

### Shear97 — Rebar Optimization Phase 1 (dated 2026-07-30)

- [Wave 0a landing — supervisor form + run history](https://houstonposttension.github.io/hpt-mockup-previews/rebar-optimization-mockup-2026-07-30/index.html)
- [Supervisor per-shift form (Wave 6 target)](https://houstonposttension.github.io/hpt-mockup-previews/rebar-optimization-mockup-2026-07-30/supervisor-per-shift.html)
- [Run history + run detail (Wave 4 target, includes per-machine workload)](https://houstonposttension.github.io/hpt-mockup-previews/rebar-optimization-mockup-2026-07-30/run-history.html)

Two spec-mandated browser surfaces for Shear97 Phase 1. **Supervisor per-shift form** sets
`available_flag` (spec §2 Q1) and `helper_assigned_flag` (§4.1) per shift across the seven yard
machines, and surfaces the §7.3 warn flags (stale drop pile, low-confidence bundle badge from
§2 Q10, setup-count check) the supervisor must acknowledge before dispatching the plan.
**Run history + detail** lists past optimizer runs with status / yield / setups / cost-authority
state; the detail view carries the plan summary, the §7.5 `run_events` timeline, **per-machine
workload in hours per shift** (feeds Phase 2 completion-date forecast — James's addition), the
§2 Q16 override deltas against HPT Cloud routing, SC-3 archive links, and the SC-4 auditor
reproduce command. Empty and sparse-data states rendered for both. Operator's daily invocation
tool stays CLI + printed pull sheets per PRD §6 non-goals. Visual DNA reuses tokens verbatim from
`vp-dashboard-portfolio-2026-07-27`. Cost figures throughout are placeholder — GA-SH97-005a is
open and every dollar carries a NOT-FOR-QUOTING banner. Related governance row: `GA-SH97-017`
(Phase-1 parent).

### HPT Portfolio (dated 2026-07-27)

- [HPT Portfolio — portfolio overview + command surface, Cards + Timeline + Activity views (mobile)](https://houstonposttension.github.io/hpt-mockup-previews/vp-dashboard-portfolio-2026-07-27/index.html)

One mobile surface that answers *what is in flight everywhere* **and** lets the VP push priority from
inside it — replacing the scatter of status docs, the governance ledger view, and the dispatch console's
PR queue. Top section is an **atmosphere strip** (today's incident, blockers, what's waiting on HR,
agent capacity). Below it, every feature in flight as a card carrying system, feature, target version,
lifecycle state, risk and dependencies. Tap a card to expand: why it matters, what it blocks and what
blocks it, recent activity, and the levers — raise/lower priority (with downstream reflow), pause/resume
(cascades to dependents), and **approve once at the feature level**, which carries to every PR under it
instead of asking per-PR. Filter by system or state, sort by priority / risk / recency. All cards are
real in-flight work as of 2026-07-27; nothing is wired to a live system and worker names are anonymized.

**rev 2 (2026-07-27):** renamed from *Dispatch Console* to **HPT Portfolio**; added a per-card **effort chip** (4h / 1d / 1w) on the card face, an in-drawer **release track** showing the multi-version sequence a feature sits inside (ADP alignment W0→W5, the Table Storage exit, phone-first identity, the hourly view, HPT Portfolio itself), and a full **Timeline view** — horizontal bars per feature, version-train milestones (1.32.2 / 1.33.0 / 1.34.0 / 2.0 / 3.0), today anchored at the left edge, hard external dates as red rules, and bars that reflow when priority changes. A deadlines + availability strip sits under the atmosphere tiles. All dates and effort figures are placeholders to be corrected.

**rev 3 (2026-07-27):** **attention notifications** — red dots on the cards that need a decision, a tap-to-jump "N need your attention" banner listing each one with its reason, and a **notification-preferences panel** (morning digest, in-app dots, push for P1 blockers, quiet hours; only the dots toggle is live). An **Activity view** — 25-entry reverse-chron change log with timestamp, actor and action, tappable through to the feature it touched; each card's own activity strip is that same feed filtered to it. And a **📎 Related** chip list per card linking the mockups, spec docs, governance rows, PRs and memory files behind it — mockup chips open for real, the rest show where they would go. A feature with nothing filed says so.

### HPT Cloud — Dispatch Command Center (dated 2026-07-26)

- [Dispatch Command Center — 10 frames (AI-assisted stressing sub dispatch)](https://houstonposttension.github.io/hpt-mockup-previews/dispatch-command-center-2026-07-26/index.html)
- [Requirements doc — v0.3, Manager AI + AI Rules Registry + Capacity Model + Drive Time + Weather Notifications](https://houstonposttension.github.io/hpt-mockup-previews/dispatch-command-center-2026-07-26/requirements.md)
- [Weather-reschedule email template + batching + engineer-role filter spec](https://houstonposttension.github.io/hpt-mockup-previews/dispatch-command-center-2026-07-26/weather-reschedule-email.md)

Concept for the HPT Cloud dispatch surface at `cloud.houstonposttension.com/dispatch/*`, built to hand to the external consultant. Model: the AI proposes assignments, the human dispatcher approves. 10 frames covering the AI proposal / approval loop, sub capacity setup, weather flagging, PDF output, and the AI Rules Registry. Every AI proposal card cites the rule that triggered it (ISO 9001 audit trail). Customer-feedback integrated as of the 2026-07-26 dispatcher call with Alexandra Euyoque (batched weather emails to superintendents-only, apartment-stress rate override at 3 min/cable, GPS-via-photo-metadata replacing truck telematics, per-weekday working hours). Consultant-facing — not part of the WIP Processor / Shear97 / Extrusion Log codebases.

### Supervisor + Lead mobile (dated 2026-07-24)

- [Supervisor + Lead mobile — 18 frames (Approvals + Self-service + Workcell tiles + all pillars)](https://houstonposttension.github.io/hpt-mockup-previews/supervisor-lead-mobile-2026-07-24/index.html)

One role-scoped mobile UI for supervisors (plant-wide, cross-shift) and leads (shift-level, 3 rebar cells). 18 frames: situational-awareness + reroute (1–7); the reusable `hpt-approvals` queue, approver side (8–10); 4 self-service surfaces each in a Supervisor and an Office view, both SSO-gated/internal-only (11–14); act-as-operator, substitute scan credits the supervisor's own identity (15); shift-scoped repositioning that expires end of shift (16); a workcell tile home showing last-hour rate per station with needs-attention on top (17) and its station drill-down with shift-so-far + 8h sparkline + in-progress/queued tags (18). Design note in the private repo at `docs/spec/supervisor-lead-mobile-design-2026-07-24.md`.

### Loader category-status (GA-WIP-193, dated 2026-07-21)

- [Variant C — Category tabs (recommended)](https://houstonposttension.github.io/hpt-mockup-previews/loader-category-status-2026-07-21/variant-c-category-tabs.html)
- [Variant A — Nested accordion](https://houstonposttension.github.io/hpt-mockup-previews/loader-category-status-2026-07-21/variant-a-accordion.html)
- [Variant B — Split panel matrix (tablet-first)](https://houstonposttension.github.io/hpt-mockup-previews/loader-category-status-2026-07-21/variant-b-split-panel.html)

Design note + spec live in the private repo at `docs/spec/loader-category-status-design-2026-07-21.md`.
