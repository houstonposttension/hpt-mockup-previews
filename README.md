# HPT Mockup Previews

Public preview host for HPT mockup HTML files, served via **GitHub Pages** so mockups render inline on mobile browsers.

> Files here are illustrative mockups, **not** production code. See the private `houstonposttension/wip-processor` repo for the real spec and implementation.

## How to view a mockup

Prefix any file path with `https://houstonposttension.github.io/hpt-mockup-previews/`.

> Served natively by GitHub Pages — no proxy, no interstitial. (Earlier `raw.githack.com` / `rawcdn.githack.com` links are retired; use Pages URLs for anything new.)

## Current mockups

### Supervisor + Lead mobile (dated 2026-07-24)

- [Supervisor + Lead mobile — 18 frames (Approvals + Self-service + Workcell tiles + all pillars)](https://houstonposttension.github.io/hpt-mockup-previews/supervisor-lead-mobile-2026-07-24/index.html)

One role-scoped mobile UI for supervisors (plant-wide, cross-shift) and leads (shift-level, 3 rebar cells). 18 frames: situational-awareness + reroute (1–7); the reusable `hpt-approvals` queue, approver side (8–10); 4 self-service surfaces each in a Supervisor and an Office view, both SSO-gated/internal-only (11–14); act-as-operator, substitute scan credits the supervisor's own identity (15); shift-scoped repositioning that expires end of shift (16); a workcell tile home showing last-hour rate per station with needs-attention on top (17) and its station drill-down with shift-so-far + 8h sparkline + in-progress/queued tags (18). Design note in the private repo at `docs/spec/supervisor-lead-mobile-design-2026-07-24.md`.

### Loader category-status (GA-WIP-193, dated 2026-07-21)

- [Variant C — Category tabs (recommended)](https://houstonposttension.github.io/hpt-mockup-previews/loader-category-status-2026-07-21/variant-c-category-tabs.html)
- [Variant A — Nested accordion](https://houstonposttension.github.io/hpt-mockup-previews/loader-category-status-2026-07-21/variant-a-accordion.html)
- [Variant B — Split panel matrix (tablet-first)](https://houstonposttension.github.io/hpt-mockup-previews/loader-category-status-2026-07-21/variant-b-split-panel.html)

Design note + spec live in the private repo at `docs/spec/loader-category-status-design-2026-07-21.md`.
