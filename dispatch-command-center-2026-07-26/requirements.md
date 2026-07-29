# HPT Cloud — Dispatch Requirements
**Version 0.5** · 2026-07-29 · Owner: James Brady (HPT), for external consultant / dev-team build.
Visual reference: [`index.html`](./index.html) (10-frame mockup) + [`frame-11-zone-weather-config.html`](./frame-11-zone-weather-config.html) (Frame 11 standalone wireframe) + [`weather-reschedule-email.md`](./weather-reschedule-email.md) in this same folder.

---

## Changelog — v0.4 → v0.5 (2026-07-29, James's locked answers)

Ten decisions locked in this pass. Each is called out at the section it affects.

1. **Frame 11 built.** Zone Weather Config is a real frame in v0.5, not a "planned" placeholder. Delivered as `frame-11-zone-weather-config.html` (standalone wireframe) alongside the main mockup — will fold into `index.html` on the next mockup pass.
2. **OptimoRoute removed** from scope. Not part of this feature; no references in integrations, no plumbing.
3. **Sub-facing SMS / self-service app: out of scope for v1.** Twilio SMS removed from integrations. The Overview language ("any sub-facing self-service app is out of scope") stays and is the authoritative statement.
4. **Task-type rates: TBD (owned by Alexandra Euyoque).** No numbers invented in this document. The rate table in §3 / Frame 6 shows a per-role "TBD — provided by Alexandra Euyoque" placeholder. The apartment-stress override rule (3 min/cable = 2× base) stays wired once the base rates are provided.
5. **NetSuite: out of scope for v1.** The $100 dry-trip fee is a NetSuite invoicing concern, not a dispatch-tool concern for v1. Removed from v1 integrations. Flagged as a v2 candidate only if orders/inventory ever consolidate onto this surface.
6. **Auth: inherits from HPT Cloud SSO.** Dispatcher access is via HPT Cloud (existing Microsoft Entra ID single-tenant SSO). This app does not build its own auth stack.
7. **Sub roster owned by dev team.** Full sub-company + roster + zones data has already been shared with the dev team; not re-published here.
8. **Multi-dispatcher concurrent design.** No single-seat assumption. The design must accommodate concurrent dispatchers with row-level locks / soft-lock handoffs on the approval queue and per-sub 7-day view.
9. **Rule count corrected.** After dropping `OPT-ZONE-01`, the registry is **2 Optimization + 8 Alert + 1 Constraint = 11 rules total** (see §2 for the enumerated list).
10. **v0.5 timeline.** v0.5 published 2026-07-29 — dev team builds against this version. No further-out revision expected before kickoff.

---

## Overview

The Dispatch surface at `cloud.houstonposttension.com/dispatch/*` lets an internal dispatcher balance daily task load across the ~8 stressing subcontractors HPT uses across the Houston metro. Model is **AI proposes, dispatcher approves** — no auto-apply of any customer-visible or assignment-changing action in v1. Auto-detection of *inputs* (e.g., weather from a public feed) IS in v1; auto-application of *actions* (reassignments, customer emails) is NOT.

**Out of scope (v1):** any sub-facing self-service app (no SMS to subs, no Twilio, no sub-facing mobile app). All external events (subcontractor unavailability, site delays) enter the system through the dispatcher; weather enters via automatic detection (§6). NetSuite integration is v2+; v1 runs against an orders stub / import pipeline.

**Users (v1):**
- **Dispatcher** (primary) — Alexandra Euyoque today. **Concurrent multi-dispatcher supported** — no single-seat assumption. See §8 (concurrency & locking).
- **Ops admin** — sets up sub profiles, capacity, zones, weather thresholds, and edits AI rules; not a daily user.
- **Read-only** (VP / GM) — dashboards + drill-down + rule change history.

**Auth (v0.5):** Dispatcher and ops-admin auth **inherits from HPT Cloud SSO** (Microsoft Entra ID single-tenant). This app does not stand up its own identity provider; it consumes the HPT Cloud session. Roles / permissions map from HPT Cloud group membership.

**Customer feedback integrated (2026-07-26 call with Alexandra, unchanged from v0.4):**
- Weather email notification wanted; goes to superintendents, **never engineers**.
- Nightly PDF format: **do not** reorder by subdivision. Field issues / any stop with notes red.
- Apartment stress rate: 3 min/cable (2× base). Other task types use base — base numbers TBD from Alexandra (see §3).
- **New business rule surfaced** (out of v1): $100 dry-trip fee when GC overrides HPT weather advice and site is too wet on arrival. Filed against NetSuite invoicing, not the dispatch tool. v2+ candidate.

**New in v0.4 (carried into v0.5):**
- §6 Automatic per-zone weather detection — NWS-driven auto-flagging, adaptive polling, per-phenomenon rules per task-type, zone snooze with severity override, approval-before-notify preserved.

---

## Section 1 — Manager AI Interaction (v1 priority) — *unchanged from v0.2*
See prior version.

## Section 2 — AI Rules Registry (v1 priority) — *carried forward, corrected in v0.5*

Data model, API, governance, ISO 9001 alignment unchanged from v0.2.

**Registry composition (v0.5) — 11 rules total.** Breakdown:

**Optimization (2):**
- `OPT-CAP-01` — never exceed sub's per-weekday capacity (incl. drive time)
- `OPT-DRIVE-01` — minimize daily drive time (Distance Matrix + traffic buffer)

*Dropped in v0.5:* `OPT-ZONE-01` (prefer subs' assigned zones — penalty for out-of-zone). Zone preference is now handled inside the assignment logic and the sub-profile "preferred zones" list rather than as a separate optimization rule.

**Alert (8):**
- `ALERT-WEATHER-01` — composite; fires when any child weather rule fires. Zone-scoped. Downstream logic (customer notify, reschedule proposal) hangs off this composite so integrations don't need to know about the child rules.
- `ALERT-WEATHER-RAIN-01` — precipitation rate + probability thresholds (per task type)
- `ALERT-WEATHER-WIND-01` — sustained mph + gust mph thresholds (per task type)
- `ALERT-WEATHER-FREEZE-01` — forecast low temperature threshold (per task type)
- `ALERT-WEATHER-LIGHTNING-01` — proximity in miles threshold (per task type)
- `ALERT-WEATHER-SNOW-01` — accumulation threshold (any accumulation in Houston = flag)
- `ALERT-GPS-STALL-01` — sub has not uploaded a geotagged job photo from an assigned stop in > 150% of estimated time. **Draft** in v1 — activates when the v2 sub-facing photo/GPS app ships.
- `ALERT-PAST-DUE-01` — sub late > 20% this week → propose 30% capacity cut. **Draft**.

**Constraint (1):**
- `CONSTRAINT-MIN-VISITS-01` — every sub gets ≥ 3 stops/week (retention floor).

**Follow-on / notify rules** (governed under Alert-category discipline; parameters editable through the Registry but not counted in the 11-rule total for the "rule count" claim):
- `NOTIFY-WEATHER-EMAIL-01` — weather reschedule approved → batched email to affected customers (superintendents only, engineers filtered). Governs debounce, business-hours window, and template versions per §5 and `weather-reschedule-email.md`.

**Rule-count reconciliation:** the "11 rules" claim reflects the 2 + 8 + 1 breakdown for the primary optimizer / alert / constraint categories. `NOTIFY-WEATHER-EMAIL-01` is a follow-on action rule with the same change-management discipline; count it as an operational rule when discussing governance surface area, exclude it when discussing optimizer / alerting logic.

## Section 3 — Capacity Model — *carried forward from v0.3; rate table locked TBD in v0.5*

Per-sub daily capacity is derived from:
- **Working-hours matrix** (per weekday, per sub — set in Frame 6).
- **Site-level defaults** — setup time per site + max sites per day (per sub).
- **Task-type rates** (minutes per unit — cable, strand, etc). See "Task-type rates" below.
- **Job-type overrides** — currently one: apartment stress = 3.0 min/cable (2× base).

**Task-type rates — v0.5 status: TBD.**

Base rates (minutes per cable / per unit for each task type) are **owned by Alexandra Euyoque** and are the currency the optimizer uses. Alexandra will provide these numbers; do not invent placeholder values in this document or in Frame 6 build-out.

| Task type ID | Label | Base rate (min / unit) | Notes |
|---|---|---|---|
| `strands.stress` | Strands — Stress | **TBD — provided by Alexandra Euyoque** | Residential base. Apartment stress override = 2× base (3 min/cable if base is 1.5). |
| `strands.grout` | Strands — Grout | **TBD — provided by Alexandra Euyoque** | |
| `strands.cut` | Strands — Cut | **TBD — provided by Alexandra Euyoque** | |
| `strands.paint` | Strands — Paint | **TBD — provided by Alexandra Euyoque** | |
| `strands.field_issues` | Strands — Field Issues | **TBD — provided by Alexandra Euyoque** | Per-site estimate (not per-unit). |
| `strands.engineer_letter` | Strands — Engineer Letter | Admin (no unit) | |

**Job-type override (v1):** apartment stress = 3.0 min/cable (2× base of 1.5, once Alexandra confirms 1.5). This is the only v1 override; other combinations use base.

Data model note (v0.5): a `TaskTypeRate` record captures actor + timestamp on any rate change; a `JobTypeRateOverride` record captures the override. No silent overwrites. See §7 (data model to draft).

## Section 4 — Drive Time — *unchanged from v0.3*
## Section 5 — Weather Delay Customer Notifications — *unchanged from v0.3*

---

## Section 6 — Automatic Per-Zone Weather Detection (v1 priority — from v0.4, unchanged)

**Design principle:** the dispatcher should not have to notice weather. The system polls per-zone forecasts continuously and auto-creates `WeatherFlag` records when thresholds are breached. Auto-flag ≠ auto-notify — the dispatcher still approves every downstream action (reschedule + customer email).

### 6.1 Data source

**NWS API (api.weather.gov)** as the primary provider.

**Rationale:** Free, no API key required for reasonable use, US-only (fine for HPT's Houston metro service area), maintained by NOAA (government-backed, defensible to customers who ask "why did you say it was going to rain"), includes Watches / Warnings / Advisories as first-class objects. The `/points/{lat},{lon}` endpoint returns gridpoint metadata, then `/gridpoints/{office}/{x},{y}/forecast` returns hourly forecasts. Watches/Warnings via `/alerts/active/area/TX`.

**Fallback / alternative:** Provider is a per-zone config parameter (§6.5). Ops-admin can switch a zone to OpenWeather (paid, adds granularity) or a custom feed later. NWS remains the default.

### 6.2 Zone → geo binding

**Zone polygon centroid.**

Zones already have polygon geometry (per Frame 6 "Edit polygons on map"). The centroid `(lat, lon)` of each zone polygon is the query point for NWS `/points`. NWS forecasts on a 2.5 km grid, so centroid-based lookup returns one canonical forecast for the whole zone — accurate enough at the scale HPT operates.

**Schema addition:**

```
Zone {
  id            string
  display_name  string
  polygon       geojson_polygon
  centroid      { lat: decimal, lon: decimal }   // auto-computed from polygon
  weather_source_id  fk_to_WeatherSource         // §6.5
  ...
}

WeatherSource {
  id            string
  provider      enum   // "nws" | "openweather" | "custom"
  station_or_gridpoint  string   // NWS gridpoint or provider-specific identifier
  auth_config   json   // API key for paid providers; empty for NWS
}
```

### 6.3 Poll cadence — adaptive

Not a fixed interval. Three tiers driven by current conditions:

| Condition | Cadence |
|---|---|
| No active Watches/Warnings/Advisories, no scheduled outdoor stops in next 24 hrs | **hourly** |
| No active W/W/A, but scheduled outdoor stops in the next 24 hrs | **every 30 min** |
| Any zone has an active Watch/Warning/Advisory | **every 15 min** (all zones) |
| On-demand: 30 min before shift start (05:30 CT weekdays) | one-off refresh, all zones |

**Bounded cost.** NWS is free but responsible: baseline 24 calls/day × 7 zones = 168 requests. Storm-mode 96 calls/day × 7 zones = 672 requests. Well within NWS acceptable use.

### 6.4 Threshold model — per phenomenon × per task type

Every weather threshold is a **matrix**: rows are phenomena, columns are task types. A cell holds a threshold value or "not-applicable." The 5 sibling rules from §2 each own one row of this matrix.

**Default thresholds (v1 seed values — ops-admin editable per zone):**

| Phenomenon | strands.stress | strands.grout | strands.cut | strands.paint | strands.field_issues | strands.engineer_letter |
|---|---|---|---|---|---|---|
| Rain (in/hr) | ≥ 0.05 | ≥ 0.10 | ≥ 0.10 | ≥ 0.05 | ≥ 0.15 | n/a |
| Rain probability (%) | ≥ 60% | ≥ 70% | ≥ 70% | ≥ 60% | ≥ 75% | n/a |
| Wind sustained (mph) | ≥ 25 | ≥ 30 | ≥ 30 | ≥ 25 | ≥ 35 | n/a |
| Wind gusts (mph) | ≥ 35 | ≥ 40 | ≥ 40 | ≥ 35 | ≥ 45 | n/a |
| Freeze (forecast low °F) | ≤ 32 | ≤ 32 | ≤ 34 | ≤ 34 | ≤ 32 | n/a |
| Lightning (miles) | ≤ 10 | ≤ 10 | ≤ 10 | ≤ 10 | ≤ 10 | n/a |
| Snow / ice (in accumulation) | any | any | any | any | any | n/a |

**Rationale for the defaults:**
- Rain intensity: post-tensioning cables should not be stressed / grouted in even light rain (moisture affects cure and cable integrity); painting is equally sensitive. Cut / grout tolerate slightly more before triggering.
- Rain probability: acts as an early-warning threshold when the current rate is 0 but the forecast is high.
- Wind: crane / lift operations have OSHA-adjacent limits; 25 mph sustained is a common industry threshold for post-tension stressing operations.
- Freeze: concrete cure below 32°F is compromised; grout is water-based and freezes.
- Lightning: OSHA lightning-safety guidance suggests halting outdoor work when strikes are within 6–10 miles; 10 mi is the conservative default.
- Snow: any accumulation in Houston is exceptional and warrants flagging.

**Rule scoping:** each `ALERT-WEATHER-*` rule's `params_current` is a dict of `{ task_type_id: threshold_value }`. Ops-admin can override per zone via the Zone Weather Config (Frame 11) — that override writes a `ZoneWeatherThresholdOverride` record so audit history shows both the base rule and the zone-specific override.

### 6.5 Zone snooze / override

**Snooze use case:** Alexandra: "Weather API says thunderstorm but the sky is clear."

**Mechanics:**
- Snooze options: **1 h, 4 h, 12 h, 24 h, custom**.
- Required field: `snooze_reason` (short text — 1 line, captured for audit).
- Snooze suppresses **new** auto-flags for that zone. Existing flags are not retroactively cancelled — the dispatcher clears those manually if she wants.
- **Severity override:** if NWS returns a Watch/Warning/Advisory at severity ≥ Moderate (NWS severity scale: Minor / Moderate / Severe / Extreme), the snooze is bypassed and the flag fires regardless. Rationale: safety over convenience; the dispatcher is not going to snooze through a tornado warning.
- Snooze expires automatically at the end of its window.
- Zone snooze log is visible in Frame 11 and the Alert Log (audit).

**Schema:**

```
ZoneWeatherSnooze {
  zone_id       string
  snoozed_by    user_id
  snoozed_at    timestamp
  expires_at    timestamp
  reason        text
  overridden_at timestamp?   // set if severity override triggered before expiry
  overridden_reason text?    // e.g., "NWS tornado warning issued"
}
```

### 6.6 Auto-flag vs auto-notify — separation preserved

**Auto-flag (system does automatically):**
- Poll NWS per §6.3.
- Compare readings/forecasts against per-zone × per-task-type thresholds.
- Create a `WeatherFlag(source = "auto", origin_rule = "ALERT-WEATHER-RAIN-01" [etc])` record.
- Attach flag to affected `SiteVisit`s (outdoor stops in that zone during the adverse window).
- Surface the flag in Frame 4 as a proposal card ready for dispatcher review.

**Auto-notify (system does NOT do — dispatcher must approve):**
- Reschedule affected stops.
- Send customer notification email (per §5 + `weather-reschedule-email.md`).

The dispatcher clicks **Approve reschedule + notify** in Frame 4 (per the existing approval flow). Only then does the reschedule execute and the batched customer email queue.

### 6.7 Frame changes

- **Frame 4** — new horizontal "Zone weather sources" strip at the top: each zone as a chip with icon, condition, feed name, last-updated timestamp; "auto-selected" annotation on the flag form when the flag came from an auto-rule rather than manual entry.
- **Frame 10** — 5 new sibling rules added (`ALERT-WEATHER-RAIN-01` etc.); `ALERT-WEATHER-01` re-described as the composite parent. `OPT-ZONE-01` removed from the registry (§2, v0.5 change).
- **Frame 11 — Zone Weather Configuration** (delivered as `frame-11-zone-weather-config.html` in v0.5; will fold into `index.html` on the next mockup pass). Two-column layout: left = list of all zones with current status ("last polled X min ago, X conditions active"); right = selected zone's detail:
  - Zone geographic-area binding (polygon centroid preview + link to map editor)
  - Data-source picker: NWS (default, no key) / OpenWeather (paid) / custom feed
  - Poll cadence display (adaptive, per §6.3 — read-only, computed)
  - Active thresholds display: base rule value with per-zone × per-task-type override cells
  - Threshold-override editor: opens a modal citing the base rule ID + zone before writing
  - Dispatcher snooze controls (1h / 4h / 12h / 24h / custom) + required reason field + severity-override banner
  - Recent auto-flag log for this zone (source rule + timestamp + status)
  - "Test / fetch now" button (on-demand poll for this zone)
  - Add / edit / remove zone controls (ops-admin only)
  - **Every AI proposal card in Frame 11 cites its source rule** (matches convention across the other frames)

### 6.8 Acceptance criteria

- **AC-WX-1**: Baseline poll rate is hourly per zone; upgrades to every 30 min when outdoor stops exist in the next 24 h; upgrades to every 15 min when any zone has an active NWS Watch/Warning/Advisory. Documented in optimizer-run log.
- **AC-WX-2**: Auto-generated `WeatherFlag` records carry `source = "auto"` and `origin_rule` (e.g., `"ALERT-WEATHER-RAIN-01"`) for audit.
- **AC-WX-3**: A snooze on a zone suppresses new auto-flags for that zone for the snooze window, but does NOT retroactively clear existing flags.
- **AC-WX-4**: NWS Watch/Warning/Advisory at severity ≥ Moderate overrides an active snooze and fires the flag regardless.
- **AC-WX-5**: Every auto-flag → dispatcher-approve → reschedule + notify path is separately audit-logged with the triggering rule ID and the dispatcher's identity.
- **AC-WX-6**: A zone can have a per-zone override of any threshold in the matrix; override is written as its own record so the base rule's default can be recovered.
- **AC-WX-7**: Frame 4 zone strip refreshes on every poll; UI shows "last updated N min ago" and turns amber when > 30 min stale.
- **AC-WX-8**: Total NWS API cost is bounded — average day should stay under 300 requests across all zones; alert if daily volume exceeds 1000 for > 2 consecutive days.
- **AC-WX-9**: Zone snooze reason is required (min 1 char, max 200); stored in audit log.
- **AC-WX-10**: Frame 11 threshold matrix persists changes on blur; changes require confirmation modal citing the rule ID + zone before writing.

---

## Section 7 — Sections still to draft (v0.6 target)

Full data model (Sub, SubCompany, Task, SiteVisit, Zone, WeatherSource, WeatherFlag, ZoneWeatherSnooze, Assignment, OptimizerRun, Alert, Event, AuditLog, Order, Contact, RouteDriveTime, AddressPairDriveTime, EmailIntent, TaskTypeRate, JobTypeRateOverride, SubWorkingHours, ZoneWeatherThresholdOverride, DispatcherLock).
Optimizer formal spec (OR-Tools). Nightly PDF spec (per Frame 5 — do NOT reorder by subdivision). Command Center primary view spec. Approval queue spec (**including multi-dispatcher lock semantics** — see §8). Sub-facing photo-capture app (v2 — provides GPS for `ALERT-GPS-STALL-01`). Roles + permissions (mapped from HPT Cloud SSO groups — see §Auth). Audit log spec. Integration points (Google Distance Matrix, Microsoft Graph, NWS, plus internal boundaries: WIP scanner / ADP / ClickUp).

**Explicitly not in v1 (moved out in v0.5):**
- NetSuite integration (was flagged for dry-trip fee wiring; that lives in NetSuite, not here). v2 candidate only if orders/inventory consolidate.
- OptimoRoute routing integration.
- Twilio SMS to subs / any sub-facing self-service surface.
- $100 dry-trip fee billing (NetSuite concern, not dispatch tool).

---

## Section 8 — Concurrency & multi-dispatcher (v0.5 — NEW)

**Design assumption:** dispatcher role is not single-seat. Design for **N concurrent dispatchers** working the same rolling 7-day window at the same time.

**Requirements:**
- **Row-level soft lock on the Approval Queue.** When dispatcher A opens a proposal for review, that proposal is marked `locked_by=A, locked_at=t` for a bounded TTL (e.g., 5 min, auto-renew on activity). Dispatcher B sees the lock ("Being reviewed by A since 14:22") and cannot approve/reject the same proposal simultaneously.
- **Optimistic concurrency on writes.** Every mutation (approval, snooze, override, sub-profile edit, rule change) carries the row `version` at read; the write fails cleanly with a "reload — updated by <other actor>" toast if it advanced.
- **Session presence on the Command Center.** A small "N dispatchers on shift" indicator on the header shows who's live (avatars + last-active time), so dispatchers can coordinate verbally instead of stepping on each other.
- **Audit-log `actor` field is always the specific dispatcher.** No shared-account writes. HPT Cloud SSO already scopes this per user (§Auth).
- **No cross-actor auto-reassignment.** If dispatcher B has assigned a stop, dispatcher A's optimizer-triggered proposal must still route through the standard approval queue — it cannot silently overwrite B's assignment.

**Data-model addition (v0.6 target):**
```
DispatcherLock {
  entity_type    enum   // "proposal" | "sub_profile" | "rule" | "zone_config"
  entity_id      string
  locked_by      user_id
  locked_at      timestamp
  expires_at     timestamp
  renewed_at     timestamp?
}
```

**Acceptance criteria:**
- **AC-CO-1** — Given two dispatchers open the same proposal, When one clicks Approve, Then the other's UI receives a "reload — updated by <name>" toast within 3 s and blocks the second approval.
- **AC-CO-2** — Given a dispatcher holds a proposal lock, When 5 minutes of idle time pass, Then the lock auto-expires and the proposal returns to the queue for anyone.
- **AC-CO-3** — Given a dispatcher edits a sub profile, When another dispatcher opens the same profile, Then the second sees "Being edited by <name>" and edits are read-only until the first releases.
- **AC-CO-4** — Given any state mutation, When the audit log receives the entry, Then `actor` is the specific SSO user (never a shared account).

---

## Section 9 — Auth (v0.5 — NEW section)

**Model:** **inherits from HPT Cloud SSO.** This app does not build its own auth stack.

- **Dispatcher / ops-admin / read-only** all authenticate via HPT Cloud's existing Microsoft Entra ID single-tenant SSO. Role in this app is derived from HPT Cloud group membership (`Dispatch-Dispatcher`, `Dispatch-OpsAdmin`, `Dispatch-ReadOnly`).
- No local user table beyond a shadow record keyed by Entra `oid` for audit-log actor attribution.
- Session lifetime, MFA policy, conditional-access rules — all inherited from HPT Cloud / Entra tenant policy. This app does not override.
- **Service-to-service** (NWS poller, Graph email sender, optimizer run) uses managed-identity or dedicated service-principal credentials scoped to their function; not a user session.
- **v2 sub-facing photo/GPS app** — separate auth surface, not defined here. Decision open (magic link over SMS? Twilio Verify?) — but not v1.

---

*Version 0.5 hand-off — §1–§6 unchanged from v0.4 modulo the corrections above; §7 pruned to reflect v1 scope; §8 concurrency + §9 auth added. Frame 11 delivered as `frame-11-zone-weather-config.html` (standalone wireframe) — will fold into `index.html` on the next mockup pass.*
