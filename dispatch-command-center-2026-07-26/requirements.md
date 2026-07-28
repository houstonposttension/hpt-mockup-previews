# HPT Cloud — Dispatch Requirements
**Version 0.3** · 2026-07-26 · Owner: James Brady (HPT), for external consultant build.
Visual reference: [`index.html`](./index.html) (10-frame mockup) + [`weather-reschedule-email.md`](./weather-reschedule-email.md) in this same folder.

---

## Overview

The Dispatch surface at `cloud.houstonposttension.com/dispatch/*` lets an internal dispatcher balance daily task load across the ~8 stressing subcontractors HPT uses across the Houston metro. Model is **AI proposes, dispatcher approves** — no auto-apply in v1.

**Out of scope (v1):** any sub-facing self-service app. All external events (subcontractor unavailability, weather delays, site delays) enter the system through the dispatcher.

**Users (v1):**
- **Dispatcher** (primary) — Alexandra Euyoque (real user; earlier draft called her "Maria Juarez" as illustrative). Lives in Command Center all day.
- **Ops admin** — sets up sub profiles, capacity, zones, and edits AI rules; not a daily user.
- **Read-only** (VP / GM) — dashboards + drill-down + rule change history.

**Non-users (v1):** subcontractors themselves. They receive the nightly PDF (see §6). A sub-facing photo-capture app is a v2 target (see §11).

**Customer feedback integrated in this version (from 2026-07-26 call with Alexandra):**
- Weather email notification wanted; goes to superintendents, **never to engineers**.
- Nightly PDF format: **do not** reorder by subdivision — keep by day. Field issues / any stop with notes color-coded red.
- Apartment stress rate confirmed at 3 min/cable (2× base). Other task types use base rate; no other job-type overrides for v1.
- **New business rule surfaced** (informational — not v1 UI): if crew is dispatched despite weather advice from HPT and finds the site too wet to work, HPT charges a **$100 dry-trip fee**. This is billing-side, out of scope for the Dispatch surface but noted for future integration.

---

## Section 1 — Manager AI Interaction (v1 priority) — *unchanged from v0.2*

See prior v0.2. §1.1 natural language input · §1.2 quick actions · §1.3 AI-initiated alerts · §1.4 cross-cutting AI principles. All acceptance criteria (AC-NL-*, AC-QA-*, AC-AL-*) remain.

---

## Section 2 — AI Rules Registry (v1 priority) — *carried forward, with 2 updates*

Full spec unchanged from v0.2 (data model, API contract, rule categories, governance, ISO 9001 alignment).

**Updates to seed rules:**

- **`ALERT-GPS-STALL-01`** — source changed from truck telematics to **sub-app photo metadata (GPS + EXIF timestamp)**. Trigger condition rewrites: "sub has not uploaded a geotagged photo from the assigned stop within 150% of estimated stop time." Rationale: HPT does not have telematics access on sub trucks; the practical GPS source is the mandatory job-photo-capture flow in the sub-facing app (v2). For v1, this rule remains in **Draft** status until the sub app ships. Existing rule definition in the registry updated; version bumped to v1.1 (draft).
- **New rule `NOTIFY-WEATHER-EMAIL-01`** — category: `Alert` (follow-on action). Governs the customer email notification triggered by dispatcher approval of a weather reschedule. Full spec: see [`weather-reschedule-email.md`](./weather-reschedule-email.md) in this folder. Parameters (debounce, business-hours window, engineer-role filter, max hold) are all in this rule's `params_current` and follow standard change-history discipline.

---

## Section 3 — Capacity Model (v1 priority — NEW)

The optimizer's core currency is *hours*. All capacity decisions flow from three tables.

### 3.1 Per-sub daily working hours matrix

Working hours **vary per sub per weekday**. Not a single "8 hrs/day" number. Julio may work 6 hours Monday but 10 hours Saturday.

**Schema:**

```
SubWorkingHours {
  sub_id       string
  weekday      enum   // Sun | Mon | Tue | Wed | Thu | Fri | Sat
  hours        decimal(4,2)   // 0.00 to 24.00; 0 means not working that day
}
```

- Primary key: `(sub_id, weekday)`.
- Editable in Frame 6 (Capacity setup).
- The optimizer treats these as *available* hours — actual capacity for a given date = `hours` for that weekday, minus any weather flags, unavailability events, or other overrides.

### 3.2 Task-type rates

Every task has an execution rate. Rates are keyed by task type; unit is "each" (a single cable, a single strand, etc.).

**Schema:**

```
TaskTypeRate {
  task_type_id     string   // e.g., "strands.stress"
  task_type_label  string   // e.g., "Strands — Stress (L)"
  base_minutes_per_unit  decimal(6,2)
  unit             string   // "each"
}
```

**Seed rows (from the current Stressing Report labor items; consultant to fill in from full task-type catalog):**

| task_type_id | Label | base_minutes_per_unit |
|---|---|---|
| `strands.cut` | Strands — Cut | 1.0 |
| `strands.grout` | Strands — Grout | 1.5 |
| `strands.stress` | Strands — Stress (L) | 1.5 |
| `strands.paint` | Strands — Paint | 1.0 |
| `strands.field_issues` | Strands — Field Issues | — (variable; est per site, not per unit) |
| `strands.engineer_letter` | Strands — Engineer Letter | — (no unit; admin task) |

**Note:** Field Issues and Engineer Letter are non-unit tasks; capacity math treats them as flat `estimated_minutes` on the SiteVisit rather than `cables × rate`.

**Task type catalog:** the seed list above is drawn from the Stressing Report PDF. Full task catalog lives in HPT's master Excel spreadsheet — placeholders here to be replaced when the consultant is given access. All non-Strands task types (e.g., Bins, Deliver, Rebar-related tasks) follow the same schema.

### 3.3 Task-type × job-type rate overrides

Some job types execute a task differently. Only combinations that differ from the base rate need an override row.

**Schema:**

```
JobTypeRateOverride {
  task_type_id     string
  job_type         enum   // "Apartment" | "Residential"
  minutes_per_unit decimal(6,2)   // overrides base_minutes_per_unit for this combination
}
```

**Seed rows (v1):**

| task_type_id | job_type | minutes_per_unit | Note |
|---|---|---|---|
| `strands.stress` | Apartment | 3.0 | 2× base — apartments have denser cable layouts and access constraints (confirmed with Alexandra 2026-07-26) |

Only one override for v1. Residential = base rate for everything. Other task types have no apartment override.

### 3.4 Effective per-site duration formula

For a SiteVisit with `n` tasks:

```
site_duration_minutes =
    setup_minutes_per_site
    +  Σ over tasks t at this site:
       ( t.units × rate_for(t.task_type_id, site.job_type) )
```

Where `rate_for(task_type_id, job_type)` returns the override if one exists, else the base rate.

### 3.5 Daily capacity check

For a given sub on a given date:

```
daily_load_minutes =
    Σ over assigned_site_visits:
       site_duration_minutes(sv)
    +  Σ over consecutive_stop_pairs:
       drive_time_minutes(from_sv, to_sv)     // see §4

daily_capacity_minutes = SubWorkingHours(sub_id, weekday_of(date)) * 60
                       - weather_flag_reduction(sub_id, date)
                       - unavailability_reduction(sub_id, date)

sub_is_over_capacity = daily_load_minutes > daily_capacity_minutes
```

The optimizer rejects assignments that would push `daily_load_minutes > daily_capacity_minutes` (hard constraint, per rule `OPT-CAP-01`).

### 3.6 Acceptance criteria

- **AC-CAP-1**: Frame 6 renders a 7-cell weekday hours matrix per sub; each cell is inline-editable and validates 0.00 ≤ hours ≤ 24.00.
- **AC-CAP-2**: Frame 6 renders the task-type rate table with per-row edit; changes require confirmation and write to the `TaskTypeRate` history log.
- **AC-CAP-3**: The task-type × job-type override table is a separate list; adding a new override requires selecting an existing `task_type_id` and `job_type` (no free-text).
- **AC-CAP-4**: When a rate changes, all future optimizer runs use the new rate; past assignments' recorded durations are not retroactively rewritten (auditability).
- **AC-CAP-5**: Capacity strips in Frame 1 (Command Center) render `daily_load_minutes / daily_capacity_minutes` using the formula in §3.5, including drive time from §4.

---

## Section 4 — Drive Time (v1 priority — NEW)

Drive time between consecutive stops on a sub's route must count toward `daily_load_minutes` (§3.5). Currently the mockup's capacity math ignores drive time — this must be fixed for the numbers to reflect reality.

### 4.1 Provider

**Google Maps Distance Matrix API.** HPT already uses the Google stack; Distance Matrix is the mature product for driving-time lookups between address pairs.

- API: `distancematrix.googleapis.com/maps/api/distancematrix/json`
- Auth: API key stored in secrets manager (rotate quarterly).
- Cost model: ~$5 per 1000 element lookups. Aggressive caching (§4.3) targets < 200 lookups per full optimizer run.

### 4.2 When to compute

Only compute drive time when a route actually changes. Never poll.

**Trigger events:**

1. Optimizer proposes a new route for a sub-day (compute drive time for each proposed consecutive-stop pair in that day).
2. Dispatcher approves an AI proposal that changes assignments on any sub-day (recompute for affected days).
3. Manual override from the dispatcher (drag-drop reorder in Frame 2).
4. Nightly full recomputation (safety net — catches any stale routes for the next 7-day window).

**Never compute:** on load, on hover, on filter change, on tab switch. Cache-only reads for display.

### 4.3 Caching strategy

**Two-tier cache:**

- **L1 — computed route cache** (`RouteDriveTime`): keyed by `(sub_id, date)`. Stores the ordered list of stops + drive-time between each consecutive pair. Invalidated on any assignment change touching that sub-day.
- **L2 — pairwise leg cache** (`AddressPairDriveTime`): keyed by `(from_lat_lng, to_lat_lng, time_of_day_bucket)`. TTL = 30 days. Time-of-day buckets: `morning_peak` (07:00–09:30), `midday` (09:30–15:30), `evening_peak` (15:30–19:00), `off_peak` (else). Traffic pattern changes slowly; a 30-day TTL keeps cost bounded.

Before firing a Distance Matrix request, always check L2 first. Only fetch pairs not in cache. On a typical optimizer pass, we expect 80%+ cache hit rate.

### 4.4 Traffic buffer

**Configurable percentage buffer** (not hardcoded). Stored as a parameter on rule `OPT-DRIVE-01` in the AI Rules Registry.

```
padded_drive_minutes = raw_drive_minutes * (1 + traffic_buffer_pct)

Default: traffic_buffer_pct = 0.15  (15%)
Range: 0.0 to 0.5
```

Rationale: 15% is a modest cushion for typical traffic variance. Extreme-weather days may warrant temporary increase (weather flag can bump this).

### 4.5 Impact on capacity math

The `daily_load_minutes` formula in §3.5 already includes the drive-time summation. Implementation note: `drive_time_minutes(from_sv, to_sv)` returns `padded_drive_minutes` from the cache; only invokes the Distance Matrix API on a cache miss.

### 4.6 Acceptance criteria

- **AC-DR-1**: Every optimizer run summary reports: total Distance Matrix API calls, cache hit rate, and total drive-time minutes computed.
- **AC-DR-2**: L2 cache TTL is 30 days by default; configurable via admin.
- **AC-DR-3**: A route with no cache hits (worst case) for a sub-day with 8 stops fires ≤ 7 API calls (n-1 consecutive pairs).
- **AC-DR-4**: The `traffic_buffer_pct` parameter is editable via the AI Rules Registry (rule `OPT-DRIVE-01`) and requires a `change_reason`.
- **AC-DR-5**: Frame 2 (Sub detail) shows drive-time minutes between consecutive stops in the day view.
- **AC-DR-6**: Cost monitoring dashboard exists showing daily API spend; alert if spend > $10/day for > 3 consecutive days.

---

## Section 5 — Weather Delay Customer Notifications (v1 priority — NEW)

Governed by rule `NOTIFY-WEATHER-EMAIL-01` in the AI Rules Registry. Full email templates, batching mechanics, and engineer-role filter are in the companion doc [`weather-reschedule-email.md`](./weather-reschedule-email.md).

### 5.1 Summary

- **Trigger:** Dispatcher approves a weather-reschedule proposal.
- **Recipients:** The order's contact person. Filtered — never engineers (Alexandra's requirement).
- **Delivery:** Microsoft Graph API from `dispatch@houstonposttension.com` shared mailbox.
- **Batching:** One email per contact per 10-minute debounce window, listing all affected orders in a table.
- **UI:** Frame 4 (Weather Impact) shows a preview of what will be sent, count of orders and contacts, and count of engineer-filtered skips.

### 5.2 Acceptance criteria

- **AC-NW-1**: An approval of a weather reschedule affecting N orders across M distinct contacts produces at most M emails (never N).
- **AC-NW-2**: Contacts with `role = "Engineer"` are excluded from the recipient list; skip is logged with reason `engineer_role_filter`.
- **AC-NW-3**: The batching debounce is 10 minutes by default; configurable per rule `NOTIFY-WEATHER-EMAIL-01`.
- **AC-NW-4**: If a batch is queued outside business hours (default 07:00–19:00 CT), it holds until 07:00 next business day.
- **AC-NW-5**: Frame 4 preview shows the exact rendered email (single or batched template) before dispatcher clicks Save + run optimizer.
- **AC-NW-6**: Every send and every skip writes an `AuditLog` entry with `event_type = "customer_notification"`.
- **AC-NW-7**: On Graph API 5xx, the system retries with exponential backoff (30s, 2min, 10min, 60min); after 4 failures, alerts the dispatcher inbox.

---

## Sections still to draft (v0.4 target)

- **Section 6 — Data model** (full entity list beyond what appears in §3, §4, §5). Entities: `Sub`, `SubCompany`, `Task`, `SiteVisit`, `Zone`, `WeatherFlag`, `Assignment`, `OptimizerRun`, `Alert`, `Event`, `AuditLog`, `Order`, `Contact`, `RouteDriveTime`, `AddressPairDriveTime`, `EmailIntent`, `TaskTypeRate`, `JobTypeRateOverride`, `SubWorkingHours`.
- **Section 7 — Optimizer objective and constraints** (formal OR-Tools style, drawing on `Optimization` + `Constraint` rules from the registry).
- **Section 8 — Nightly PDF generation spec** — per Frame 5. **Explicit non-goal (per Alexandra 2026-07-26):** do NOT reorder by subdivision. Keep day-grouped. Anything with notes → RED highlight.
- **Section 9 — Command Center primary view spec** — per Frame 1.
- **Section 10 — Approval queue spec** — per Frame 3.
- **Section 11 — Sub-facing photo-capture app (v2 target)** — provides the GPS + timestamp data that `ALERT-GPS-STALL-01` depends on. Out of scope for v1 build but the consultant should know it is coming.
- **Section 12 — Roles and permissions**.
- **Section 13 — Audit log spec**.
- **Section 14 — Integration points**: Google Maps Distance Matrix API (§4), Microsoft Graph API for email (§5, `weather-reschedule-email.md`), NOAA weather API (§1.3), plus internal-HPT boundaries (WIP scanner, ADP, ClickUp) which are not the consultant's concern.
- **Section 15 — Business rules noted but out of v1 scope**: $100 dry-trip fee (billing-side, integrates with a separate billing surface later).

---

*Version 0.3 hand-off — §1 Manager AI Interaction, §2 AI Rules Registry, §3 Capacity Model, §4 Drive Time, §5 Weather Notifications are complete for consultant build. Remaining sections are stubbed and will be drafted in follow-up passes.*
