# HPT Mockup Previews

Public preview host for HPT mockup HTML files, served via **GitHub Pages** so mockups render inline on mobile browsers.

> Files here are illustrative mockups, **not** production code. See the private `houstonposttension/wip-processor` repo for the real spec and implementation.

## How to view a mockup

Prefix any file path with `https://houstonposttension.github.io/hpt-mockup-previews/`.

> Served natively by GitHub Pages — no proxy, no interstitial. (Earlier `raw.githack.com` / `rawcdn.githack.com` links are retired; use Pages URLs for anything new.)

## Current mockups

### HPT Cloud — Dispatch Command Center (dated 2026-07-26)

- [Dispatch Command Center — 10 frames (AI-assisted stressing sub dispatch)](https://houstonposttension.github.io/hpt-mockup-previews/dispatch-command-center-2026-07-26/index.html)
- [Requirements doc (in-progress) — Manager AI Interaction + AI Rules Registry spec](https://houstonposttension.github.io/hpt-mockup-previews/dispatch-command-center-2026-07-26/requirements.md)

Concept for the HPT Cloud dispatch surface at `cloud.houstonposttension.com/dispatch/*`, built to hand to the external consultant. Model: the AI proposes assignments, the human dispatcher approves. 10 frames: (1) Command Center home with per-sub 7-day capacity strips, map + preferred-zone overlays, AI suggestion queue, and past-due tray; (2) Sub detail with per-day route order, cable counts, and est hours; (3) Approval queue with side-by-side before/after and reasoning; (4) Weather flag input with projected optimizer impact; (5) improved nightly PDF; (6) sub capacity setup driving the optimizer; (7) natural-language event input with live parse preview; (8) quick-action bar + structured form for the 5 most common event types; (9) AI-initiated alerts (weather API + GPS-lag telematics); (10) AI Rules Registry — versioned, auditable rules with detail view showing description, trigger definition, action definition, parameters, change history, and related proposals. Every AI proposal card throughout the app cites the rule that triggered it (audit trail for ISO 9001 alignment). Consultant-facing — not part of the WIP Processor / Shear97 / Extrusion Log codebases.

### Supervisor + Lead mobile (dated 2026-07-24)

- [Supervisor + Lead mobile — 18 frames (Approvals + Self-service + Workcell tiles + all pillars)](https://houstonposttension.github.io/hpt-mockup-previews/supervisor-lead-mobile-2026-07-24/index.html)

One role-scoped mobile UI for supervisors (plant-wide, cross-shift) and leads (shift-level, 3 rebar cells). 18 frames: situational-awareness + reroute (1–7); the reusable `hpt-approvals` queue, approver side (8–10); 4 self-service surfaces each in a Supervisor and an Office view, both SSO-gated/internal-only (11–14); act-as-operator, substitute scan credits the supervisor's own identity (15); shift-scoped repositioning that expires end of shift (16); a workcell tile home showing last-hour rate per station with needs-attention on top (17) and its station drill-down with shift-so-far + 8h sparkline + in-progress/queued tags (18). Design note in the private repo at `docs/spec/supervisor-lead-mobile-design-2026-07-24.md`.

### Loader category-status (GA-WIP-193, dated 2026-07-21)

- [Variant C — Category tabs (recommended)](https://houstonposttension.github.io/hpt-mockup-previews/loader-category-status-2026-07-21/variant-c-category-tabs.html)
- [Variant A — Nested accordion](https://houstonposttension.github.io/hpt-mockup-previews/loader-category-status-2026-07-21/variant-a-accordion.html)
- [Variant B — Split panel matrix (tablet-first)](https://houstonposttension.github.io/hpt-mockup-previews/loader-category-status-2026-07-21/variant-b-split-panel.html)

Design note + spec live in the private repo at `docs/spec/loader-category-status-design-2026-07-21.md`.
