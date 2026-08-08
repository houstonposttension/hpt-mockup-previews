# HPT Mockup Previews

Public preview host for HPT mockup HTML files, served via **GitHub Pages** so mockups render inline on mobile browsers.

> Files here are illustrative mockups, **not** production code. See the private `houstonposttension/wip-processor` repo for the real spec and implementation.

## How to view a mockup

Prefix any file path with `https://houstonposttension.github.io/hpt-mockup-previews/`.

> Served natively by GitHub Pages -- no proxy, no interstitial. (Earlier `raw.githack.com` / `rawcdn.githack.com` links are retired; use Pages URLs for anything new.)

## Current mockups

### WIP Role & Navigation -- rev 2b, reconciled (dated 2026-08-07)

**Rebar** -- the consolidated-bar argument
- [1. Rebar Fabricator -- quiet (both cross-role badges 0, pills collapsed to zero width)](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/index.html)
- [2. Rebar Fabricator -- busy (badges live; tap to watch the collapse fire)](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/rebar-busy.html)

**Loader** -- the LEAN canonical design, brought forward whole
- [3. In-progress -- Bin/Order/status LEAN rows, counts bar, category filter, presence, 409 conflict, row drawers](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/loader.html)
- [4. Punch list -- category to missing, walk-to hints with honest TBD, Pending-backfill bucket](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/loader-punchlist.html)
- [5. Two-tier interrupt -- amber NOT READY, red DIFFERENT JOB, and the dark-blue bin decision with Combine](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/loader-alarm.html)
- [6. Close-out -- green READY TO DEPART, blocked + override form, and the 3-photo truck documentation panel](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/loader-closeout.html)
- [7. Split, approval, carry-over + the multi-run switcher](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/loader-split.html)

**Workcells drawn from the written spec** -- first visual rendering of role-model sec. 3.4-3.8
- [8. PT (Post-Tension) -- kit spec sheet, scan-to-consume strand, chair count entry, kit complete](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/pt.html)
- [9. Hardware -- component scan into kit, low-stock flag + bin roll-up](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/hardware.html)
- [10. Receiver -- expected receipts, scan-to-receive against PO, discrepancy with reason + photo](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/receiver.html)
- [11. Yard -- supervisor-pushed task list, ad-hoc lookup. No camera by default; glove-friendly targets](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/yard.html)

**Supervisor + Lead** -- rebuilt against the locked 18-frame persona mockup
- [8. Workcell tiles -- Lead home (own cells, expanded) and Supervisor home (plant-wide, hotspot first)](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/supervisor.html)
- [9. Station detail (shift-so-far + 8h sparkline + stalls) and the honest dark cell](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/supervisor-station.html)
- [10. The Approvals pillar -- inbox, approve, reject-with-reason](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/supervisor-approvals.html)
- [11. Act as operator (own identity, no impersonation) + shift-scoped reposition](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/supervisor-actas.html)

**Reference**
- [12. Bar anatomy -- quiet / busy / crowded, space budget, reused vs new](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/bar-anatomy.html)
- [Set README -- locked decisions preserved, what is out of scope, open questions](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-scanfirst-2026-08-06/README.md)

Rev 2 proposed one thing that survived review: **a single 38 px bar** replacing three stacked rows of
chrome (app bar + cross-role rail + Supervise toggle, roughly 97 px for a worker and 149 px for a
supervisor), with cross-role pills that **collapse to zero width** at a badge of 0 rather than greying
out, and scan owning the rest of the screen. It also drew thinner Loader and Supervisor screens that
**collided with locked designs**. Rev 2b keeps the bar and puts those locked interiors back underneath
it, whole -- the bar is the only thing that changed about them. **Loader** is rebuilt from the LEAN
canonical (design note rev 13): the row contract is untouched (left edge = category, corner dot =
upstream state, load status on the section header, bend-shape thumbnails via the same `shapeSVG()`
production uses), the two-tier interrupt is restored with its separate colours, sounds and action
counts, and "Complete loading" replaces the driver-language copy the spec had already rejected.
**Supervisor** is rebuilt against the locked 18-frame persona mockup: the pivot is workcells and
stations rather than a person roster, Lead and Supervisor are two roles with two homes, target-less
stations say "no target" instead of showing an invented bar, dark cells show nothing and say why, and
act-as-operator credits the supervisor's own identity with no impersonation. **Inventory and
Maintenance interiors are deliberately absent** -- both are owned by separate governed projects with
their own locked specs, so they appear here only as cross-role pills. Mobile-first 390 px frame, HPT
dark theme, no live data. Names are placeholders; each page marks inline what is real in production
today versus what has no data source yet. **Four more workcells were added 2026-08-08** -- PT, Hardware, Receiver and Yard, drawn from the
locked written screen spec (role-model-and-navigation-2026-08-05.md sec. 3.4-3.8, READY FOR ENG HANDOFF)
rather than from any prior mockup, since none existed. PT and Hardware are **kitting** flows (the work
unit is a kit consumed into, not a tag moving through work centres); Yard is the only screen with **no
camera by default** and uses glove-friendly targets. The **Extruder** function already has a 9-frame
mockup set in the private `hpt-mockups` repo; it is not published here pending its owner's go-ahead
and a name scrub.

### WIP Role & Navigation Workflow (dated 2026-08-05)

- [Click-through landing -- Worker with 3 assigned functions, function dropdown drawn open](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-workflow-2026-08-05/index.html)
- [Landing (supervisor) -- same worker as Loading Supervisor, Supervise OFF/ON toggle appears](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-workflow-2026-08-05/landing-supervisor.html)
- [Function swap in-flight -- Rebar to Loader, `/rebar` to `/load`](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-workflow-2026-08-05/function-swap.html)
- [Inventory (cross-role) -- assigned count sheet, "Acting as" banner](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-workflow-2026-08-05/inventory-cross-role.html)
- [Maintenance (cross-role) -- open MaintainX work orders + station-tagged ticket submit](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-workflow-2026-08-05/maintenance-cross-role.html)
- [Authority swap -- Supervise ON, team roster + active loads + discrepancy queue at `/load/supervise`](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-workflow-2026-08-05/authority-swap.html)
- [Locked single-role -- Driver with `locked_to_primary`, no function dropdown](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-workflow-2026-08-05/locked-single-role.html)
- [Role hierarchy -- full Function x Authority matrix for exec/manager viewers](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-workflow-2026-08-05/role-hierarchy.html)
- [Set README -- model summary, click-through order, design conventions, open items](https://houstonposttension.github.io/hpt-mockup-previews/role-navigation-workflow-2026-08-05/role-model-README.md)

Click-through demonstrating the WIP application's two-axis role model -- **job function x
authority level** -- and how a signed-in user moves between roles without re-auth. 10 job
functions (Rebar Fabricator, Loader, Driver, PT, Hardware, Extruder, Receiver, Yard, Inventory,
Maintenance) x 5 authority levels (Worker, Supervisor, Manager, Executive, Auditor). Inventory +
Maintenance are pinned in nav for everyone as cross-role pills; landing is the primary function's
home. **Function swap** is a top-nav dropdown of `assigned_functions[]` (hidden when only one is
assigned); **authority swap** is a separate Supervise OFF/ON toggle visible only to Supervisor+.
Both keep the same session -- no re-auth -- and every write logs
`(home_function, acting_function, authority)`. Mobile-first (390px phone frame), HPT dark theme,
CTA-green accent. No live data and no API calls: submit-style buttons are deliberately inert.
Design is locked; these are for walkthrough confirmation, not final visual design. Companion spec
lives in the private repo at `docs/spec/role-model-and-navigation-2026-08-05.md`.

### Rebar Optimization Phase 2 -- System of four (dated 2026-07-30)

- [Landing -- system-of-four overview + placeholder-dates banner](https://houstonposttension.github.io/hpt-mockup-previews/rebar-p2-order-selection-mockup-2026-07-30/index.html)
- [W1 Order selection (high fidelity, 3 states: main, stress 54+, empty)](https://houstonposttension.github.io/hpt-mockup-previews/rebar-p2-order-selection-mockup-2026-07-30/order-selection.html)
- [W2 Pre-plan review (sketch fidelity target)](https://houstonposttension.github.io/hpt-mockup-previews/rebar-p2-order-selection-mockup-2026-07-30/w2-pre-plan-review.html)
- [W3 Drop-bin retrieval (sketch fidelity target, mobile-first surface)](https://houstonposttension.github.io/hpt-mockup-previews/rebar-p2-order-selection-mockup-2026-07-30/w3-drop-bin-retrieval.html)
- [W4 Loader / cutter split (sketch fidelity target)](https://houstonposttension.github.io/hpt-mockup-previews/rebar-p2-order-selection-mockup-2026-07-30/w4-loader-cutter-split.html)

Four surfaces surrounding Shear97 Phase 1's optimizer. **W1 Order selection** is the Manager pre-plan queue that decides which orders land on a Shear97 export before Shear97 sees the TXT. Cards carry native `SOURCE: HPT` and `SOURCE: S97` badges (dual-source display convention, not a data contract). Batch-only multi-select with sticky footer. Every forecasted completion date is a labeled placeholder awaiting the Phase 1 workload feed -- dashed underline + tooltip on each, plus a page-level banner. Three states rendered on W1: main / sparse (8 orders), stress (54 orders, dense table auto-engages above 30), empty. **W2, W3, W4** are sketch-fidelity target screens sharing the same shell so tokens / chips / state-pills / risk-dots lock in one push instead of drifting across four one-off screens. Visual DNA reuses tokens verbatim from `vp-dashboard-portfolio-2026-07-27` and `rebar-optimization-mockup-2026-07-30`, with two new source tokens (`--hpt` violet, `--s97` teal) added orthogonal to the status palette. Related governance parent (once ratified): `GA-SH97-018`.

### Shear97 -- Rebar Optimization Phase 1 (dated 2026-07-30)

- [Wave 0a landing -- supervisor form + run history](https://houstonposttension.github.io/hpt-mockup-previews/rebar-optimization-mockup-2026-07-30/index.html)
- [Supervisor per-shift form (Wave 6 target)](https://houstonposttension.github.io/hpt-mockup-previews/rebar-optimization-mockup-2026-07-30/supervisor-per-shift.html)
- [Run history + run detail (Wave 4 target, includes per-machine workload)](https://houstonposttension.github.io/hpt-mockup-previews/rebar-optimization-mockup-2026-07-30/run-history.html)

Two spec-mandated browser surfaces for Shear97 Phase 1. **Supervisor per-shift form** sets
`available_flag` (spec §2 Q1) and `helper_assigned_flag` (§4.1) per shift across the seven yard
machines, and surfaces the §7.3 warn flags (stale drop pile, low-confidence bundle badge from
§2 Q10, setup-count check) the supervisor must acknowledge before dispatching the plan.
**Run history + detail** lists past optimizer runs with status / yield / setups / cost-authority
state; the detail view carries the plan summary, the §7.5 `run_events` timeline, **per-machine
workload in hours per shift** (feeds Phase 2 completion-date forecast -- James's addition), the
§2 Q16 override deltas against HPT Cloud routing, SC-3 archive links, and the SC-4 auditor
reproduce command. Empty and sparse-data states rendered for both. Operator's daily invocation
tool stays CLI + printed pull sheets per PRD §6 non-goals. Visual DNA reuses tokens verbatim from
`vp-dashboard-portfolio-2026-07-27`. Cost figures throughout are placeholder -- GA-SH97-005a is
open and every dollar carries a NOT-FOR-QUOTING banner. Related governance row: `GA-SH97-017`
(Phase-1 parent).

### HPT Portfolio (dated 2026-07-27)

- [HPT Portfolio -- portfolio overview + command surface, Cards + Timeline + Activity views (mobile)](https://houstonposttension.github.io/hpt-mockup-previews/vp-dashboard-portfolio-2026-07-27/index.html)

One mobile surface that answers *what is in flight everywhere* **and** lets the VP push priority from
inside it -- replacing the scatter of status docs, the governance ledger view, and the dispatch console's
PR queue. Top section is an **atmosphere strip** (today's incident, blockers, what's waiting on HR,
agent capacity). Below it, every feature in flight as a card carrying system, feature, target version,
lifecycle state, risk and dependencies. Tap a card to expand: why it matters, what it blocks and what
blocks it, recent activity, and the levers -- raise/lower priority (with downstream reflow), pause/resume
(cascades to dependents), and **approve once at the feature level**, which carries to every PR under it
instead of asking per-PR. Filter by system or state, sort by priority / risk / recency. All cards are
real in-flight work as of 2026-07-27; nothing is wired to a live system and worker names are anonymized.

**rev 2 (2026-07-27):** renamed from *Dispatch Console* to **HPT Portfolio**; added a per-card **effort chip** (4h / 1d / 1w) on the card face, an in-drawer **release track** showing the multi-version sequence a feature sits inside (ADP alignment W0-W5, the Table Storage exit, phone-first identity, the hourly view, HPT Portfolio itself), and a full **Timeline view** -- horizontal bars per feature, version-train milestones (1.32.2 / 1.33.0 / 1.34.0 / 2.0 / 3.0), today anchored at the left edge, hard external dates as red rules, and bars that reflow when priority changes. A deadlines + availability strip sits under the atmosphere tiles. All dates and effort figures are placeholders to be corrected.

**rev 3 (2026-07-27):** **attention notifications** -- red dots on the cards that need a decision, a tap-to-jump "N need your attention" banner listing each one with its reason, and a **notification-preferences panel** (morning digest, in-app dots, push for P1 blockers, quiet hours; only the dots toggle is live). An **Activity view** -- 25-entry reverse-chron change log with timestamp, actor and action, tappable through to the feature it touched; each card's own activity strip is that same feed filtered to it. And a **Related** chip list per card linking the mockups, spec docs, governance rows, PRs and memory files behind it -- mockup chips open for real, the rest show where they would go. A feature with nothing filed says so.

### HPT Cloud -- Dispatch Command Center (dated 2026-07-26)

- [Dispatch Command Center -- 10 frames (AI-assisted stressing sub dispatch)](https://houstonposttension.github.io/hpt-mockup-previews/dispatch-command-center-2026-07-26/index.html)
- [Requirements doc -- v0.3, Manager AI + AI Rules Registry + Capacity Model + Drive Time + Weather Notifications](https://houstonposttension.github.io/hpt-mockup-previews/dispatch-command-center-2026-07-26/requirements.md)
- [Weather-reschedule email template + batching + engineer-role filter spec](https://houstonposttension.github.io/hpt-mockup-previews/dispatch-command-center-2026-07-26/weather-reschedule-email.md)

Concept for the HPT Cloud dispatch surface at `cloud.houstonposttension.com/dispatch/*`, built to hand to the external consultant. Model: the AI proposes assignments, the human dispatcher approves. 10 frames covering the AI proposal / approval loop, sub capacity setup, weather flagging, PDF output, and the AI Rules Registry. Every AI proposal card cites the rule that triggered it (ISO 9001 audit trail). Customer-feedback integrated as of the 2026-07-26 dispatcher call with Alexandra Euyoque (batched weather emails to superintendents-only, apartment-stress rate override at 3 min/cable, GPS-via-photo-metadata replacing truck telematics, per-weekday working hours). Consultant-facing -- not part of the WIP Processor / Shear97 / Extrusion Log codebases.

### Supervisor + Lead mobile (dated 2026-07-24)

- [Supervisor + Lead mobile -- 18 frames (Approvals + Self-service + Workcell tiles + all pillars)](https://houstonposttension.github.io/hpt-mockup-previews/supervisor-lead-mobile-2026-07-24/index.html)

One role-scoped mobile UI for supervisors (plant-wide, cross-shift) and leads (shift-level, 3 rebar cells). 18 frames: situational-awareness + reroute (1-7); the reusable `hpt-approvals` queue, approver side (8-10); 4 self-service surfaces each in a Supervisor and an Office view, both SSO-gated/internal-only (11-14); act-as-operator, substitute scan credits the supervisor's own identity (15); shift-scoped repositioning that expires end of shift (16); a workcell tile home showing last-hour rate per station with needs-attention on top (17) and its station drill-down with shift-so-far + 8h sparkline + in-progress/queued tags (18). Design note in the private repo at `docs/spec/supervisor-lead-mobile-design-2026-07-24.md`.

### Loader category-status (GA-WIP-193, dated 2026-07-21)

- [Variant C -- Category tabs (recommended)](https://houstonposttension.github.io/hpt-mockup-previews/loader-category-status-2026-07-21/variant-c-category-tabs.html)
- [Variant A -- Nested accordion](https://houstonposttension.github.io/hpt-mockup-previews/loader-category-status-2026-07-21/variant-a-accordion.html)
- [Variant B -- Split panel matrix (tablet-first)](https://houstonposttension.github.io/hpt-mockup-previews/loader-category-status-2026-07-21/variant-b-split-panel.html)

Design note + spec live in the private repo at `docs/spec/loader-category-status-design-2026-07-21.md`.

## Planning bundles

Wave 0 planning artifacts — problem statement, tech stack, repo structure, wave plan, open questions, and a draft governance row — for work approved but not yet built.

### HPT Portfolio -- planning bundle (Wave 0, dated 2026-07-28)

- [Landing -- concept-locked notice, six files with one-line summaries, mockup reference](https://houstonposttension.github.io/hpt-mockup-previews/hpt-portfolio-planning-2026-07-28/index.html)
- [PRD -- problem, goal, users, six success criteria, portfolio card model, single-approval semantics, atmosphere section, non-goals, failure modes](https://houstonposttension.github.io/hpt-mockup-previews/hpt-portfolio-planning-2026-07-28/PRD.md)
- [Tech stack recommendation -- Python 3.11 + FastAPI + HTMX/Alpine on DO App Platform, DO Managed Postgres, in-app Entra SSO via MSAL, GitHub App bot](https://houstonposttension.github.io/hpt-mockup-previews/hpt-portfolio-planning-2026-07-28/TECH-STACK-RECOMMENDATION.md)
- [Repo structure -- proposed layout for houstonposttension/hpt-portfolio, DO-specific conventions established](https://houstonposttension.github.io/hpt-mockup-previews/hpt-portfolio-planning-2026-07-28/REPO-STRUCTURE.md)
- [Wave plan -- six build waves after Wave 0, Wave 1 target 2026-08-05, Wave 2 (value milestone) 2026-08-12, feature-complete 2026-09-02](https://houstonposttension.github.io/hpt-mockup-previews/hpt-portfolio-planning-2026-07-28/WAVE-PLAN.md)
- [Open questions -- Q1/Q-DO-1/Q-DO-3/Q-DO-4/Q-DO-5 block Wave 1; Q5 blocks Wave 2](https://houstonposttension.github.io/hpt-mockup-previews/hpt-portfolio-planning-2026-07-28/OPEN-QUESTIONS.md)
- [GA-WIP-263 draft -- governance row filing HPT Portfolio APPROVED; ID/ledger caveat inside](https://houstonposttension.github.io/hpt-mockup-previews/hpt-portfolio-planning-2026-07-28/GA-WIP-263-DRAFT.md)

Wave 0 concept-to-plan translation for the HPT Portfolio product — a mobile single-page surface that answers *what is in flight everywhere* and replaces per-PR approval theater with a single feature-level approval that fans out to every downstream PR. **Concept locked 2026-07-27. Build not yet started.** The validated concept mockup is `vp-dashboard-portfolio-2026-07-27` above; this bundle is the plan that turns it into code. Hosting decision reversed Azure → DO App Platform on 2026-07-28, positioning HPT Portfolio as the DO pathfinder for the WIP Processor migration in Sprint 4-6. Wave 1 target 2026-08-05, Wave 2 (approval fan-out — the value milestone that kills approval theater per PRD SC-1) target 2026-08-12, feature-complete against the locked concept by 2026-09-02, tail (notifications, activity feed, related docs) by 2026-09-10. GA row drafted as GA-WIP-263 but likely files as GA-PORT-001 pending project-code allocation.
