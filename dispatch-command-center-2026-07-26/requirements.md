# HPT Cloud — Dispatch Requirements
**Version 0.4** · 2026-07-28 · Owner: James Brady (HPT), for external consultant build.
Visual reference: [`index.html`](./index.html) (11-frame mockup) + [`weather-reschedule-email.md`](./weather-reschedule-email.md) in this same folder.

---

## Overview

The Dispatch surface at `cloud.houstonposttension.com/dispatch/*` lets an internal dispatcher balance daily task load across the ~8 stressing subcontractors HPT uses across the Houston metro. Model is **AI proposes, dispatcher approves** — no auto-apply of any customer-visible or assignment-changing action in v1. Auto-detection of *inputs* (e.g., weather from a public feed) IS in v1; auto-application of *actions* (reassignments, customer emails) is NOT.

**Out of scope (v1):** any sub-facing self-service app. All external events (subcontractor unavailability, site delays) enter the system through the dispatcher; weather enters via automatic detection (§6).

**Users (v1):**
- **Dispatcher** (primary) — Alexandra Euyoque. Lives in Command Center all day.
- **Ops admin** — sets up sub profiles, capacity, zones, weather thresholds, and edits AI rules; not a daily user.
- **Read-only** (VP / GM) — dashboards + drill-down + rule change history.

**Customer feedback integrated (2026-07-26 call with Alexandra):**
- Weather email notification wanted; goes to superintendents, **never engineers**.
- Nightly PDF format: **do not** reorder by subdivision. Field issues / any stop with notes red.
- Apartment stress rate: 3 min/cable (2× base). Other task types use base.
- **New business rule surfaced** (out of v1): $100 dry-trip fee when GC overrides HPT weather advice and site is too wet on arrival.

**New in v0.4 (2026-07-28):**
- **§6 Automatic per-zone weather detection** — NWS-driven auto-flagging, adaptive polling, per-phenomenon rules per task-type, zone snooze with severity override, approval-before-notify preserved.

---

## Section 1 — Manager AI Interaction (v1 priority) — *unchanged from v0.2*
See prior version.

## Section 2 — AI Rules Registry (v1 priority) — *carried forward, expanded in v0.4*

Data model, API, governance, ISO 9001 alignment unchanged from v0.2. **Additions in v0.4:**

- `ALERT-WEATHER-01` is now a **composite / summary rule** that fires when any child rule fires. Zone-scoped. Downstream logic (customer notify, reschedule proposal) hangs off this composite so integrations don't need to know about the child rules.
- **Five new per-phenomenon child rules** — each per-task-type-configurable, zone-scoped, feeds the composite:
  - `ALERT-WEATHER-RAIN-01` — precipitation rate + probability thresholds
  - `ALERT-WEATHER-WIND-01` — sustained mph + gust mph thresholds
  - `ALERT-WEATHER-FREEZE-01` — forecast low temperature threshold
  - `ALERT-WEATHER-LIGHTNING-01` — proximity in miles threshold
  - `ALERT-WEATHER-SNOW-01` — accumulation threshold (any accumulation in Houston = flag)

Registry frame (Frame 10) now shows 12 rules total (3 Optimization + 8 Alert + 1 Constraint).

## Section 3 — Capacity Model — *unchanged from v0.3*
## Section 4 — Drive Time — *unchanged from v0.3*
## Section 5 — Weather Delay Customer Notifications — *unchanged from v0.3*

---

## Section 6 — Automatic Per-Zone Weather Detection (v1 priority — NEW)

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
- **Frame 10** — 5 new sibling rules added (`ALERT-WEATHER-RAIN-01` etc.); `ALERT-WEATHER-01` re-described as the composite parent.
- **Frame 11 (new) — Zone weather configuration.** Two-column layout: left = list of all zones with current status; right = selected zone's detail: data-source picker, threshold matrix (weather × task-type editable grid), snooze controls, recent auto-flag log, "Test / fetch now" button.

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

## Section 7 — Sections still to draft (v0.5 target)

Full data model (Sub, SubCompany, Task, SiteVisit, Zone, WeatherSource, WeatherFlag, ZoneWeatherSnooze, Assignment, OptimizerRun, Alert, Event, AuditLog, Order, Contact, RouteDriveTime, AddressPairDriveTime, EmailIntent, TaskTypeRate, JobTypeRateOverride, SubWorkingHours, ZoneWeatherThresholdOverride).
Optimizer formal spec (OR-Tools). Nightly PDF spec (per Frame 5 — do NOT reorder by subdivision). Command Center primary view spec. Approval queue spec. Sub-facing photo-capture app (v2 — provides GPS for `ALERT-GPS-STALL-01`). Roles + permissions. Audit log spec. Integration points (Google Distance Matrix, Microsoft Graph, NWS, plus internal boundaries: WIP scanner / ADP / ClickUp). $100 dry-trip fee billing integration (informational).

---

*Version 0.4 hand-off — §1–§6 complete for consultant build. Remaining sections stubbed for follow-up passes.*
