# HPT Cloud Dispatch — Consultant / Dev Team Handoff Package

**Version 1.1** · 2026-07-29 · Owner: James Brady (VP Manufacturing & Operations, HPT) · jbrady@houstonposttension.com
Companion to [`requirements.md`](./requirements.md) v0.5 and [`weather-reschedule-email.md`](./weather-reschedule-email.md).

---

## 1. Executive summary

The Dispatch console (planned URL: `cloud.houstonposttension.com/dispatch/*`) is a single-pane operational cockpit for internal HPT dispatchers to balance daily post-tension work across ~8 stressing subcontractors across the Houston metro. The **primary user is the dispatcher** (Alexandra Euyoque today; **design for concurrent multi-dispatcher** — no single-seat assumption). **Downstream consumers** are (a) sub-worker crews who receive the day's assignments (nightly PDF today; no sub-facing app or SMS in v1) and (b) HPT's customer contacts — superintendents, foremen, PMs — at builders like Cast Concrete and Apex Foundation who receive **batched weather-reschedule email notifications**. Success in v1 means: (1) dispatchers build tomorrow's plan without paper juggling, (2) weather delays get auto-detected per zone and auto-proposed (but every customer-facing action still requires one-click approval), (3) capacity over/under is visible before a plan ships, and (4) a full ISO 9001 §8.5.4 audit trail is written for every AI proposal, override, and dispatcher decision. **NetSuite is out of scope for v1** — orders arrive via a stub / import pipeline; a NetSuite tie-in is a v2+ conversation if orders/inventory ever consolidate onto this surface.

---

## 2. What's in this package

All links are in the same repo folder — `hpt-mockup-previews/dispatch-command-center-2026-07-26/`:

- **Live preview (10-frame clickable mockup):** https://houstonposttension.github.io/hpt-mockup-previews/dispatch-command-center-2026-07-26/
- **Frame 11 wireframe (Zone Weather Config, standalone):** https://houstonposttension.github.io/hpt-mockup-previews/dispatch-command-center-2026-07-26/frame-11-zone-weather-config.html — will fold into the main mockup on the next pass; delivered separately in v0.5 so dev team can start against it now.
- **Requirements v0.5 (source of truth for scope):** https://github.com/houstonposttension/hpt-mockup-previews/blob/main/dispatch-command-center-2026-07-26/requirements.md — raw: https://raw.githubusercontent.com/houstonposttension/hpt-mockup-previews/main/dispatch-command-center-2026-07-26/requirements.md
- **Weather-reschedule email spec:** https://github.com/houstonposttension/hpt-mockup-previews/blob/main/dispatch-command-center-2026-07-26/weather-reschedule-email.md — raw: https://raw.githubusercontent.com/houstonposttension/hpt-mockup-previews/main/dispatch-command-center-2026-07-26/weather-reschedule-email.md
- **AI Rules Registry (Frame 10 in mockup):** https://houstonposttension.github.io/hpt-mockup-previews/dispatch-command-center-2026-07-26/#f10 — governance contract for every AI rule (**11 rules today: 2 Optimization + 8 Alert + 1 Constraint** per requirements v0.5 §2, plus the `NOTIFY-WEATHER-EMAIL-01` follow-on rule).
- **This handoff:** https://github.com/houstonposttension/hpt-mockup-previews/blob/main/dispatch-command-center-2026-07-26/handoff.md

**Sub roster:** the dev team already has full sub-company + roster + zones data from prior handoff; not re-published here. Roster is owned by dev team going forward.

Frame map (11 total — 10 in the main clickable mockup + Frame 11 as a standalone wireframe file):

| # | Frame title | Location |
|---|---|---|
| 1 | Command Center — home (overview + AI queue + past due) | `index.html#f1` |
| 2 | Sub detail — 7-day view with per-day stops, cables, and est hours | `index.html#f2` |
| 3 | Approval queue — reviewing an AI-proposed reassignment | `index.html#f3` |
| 4 | Weather impact — flag zone + preview batched customer notifications | `index.html#f4` |
| 5 | Improved nightly PDF — day-grouped with cables + est hours + route order | `index.html#f5` |
| 6 | Sub capacity setup — per-weekday hours + task-type rates (**TBD from Alexandra**) + apartment override | `index.html#f6` |
| 7 | Manager AI — natural-language event input with live parse preview | `index.html#f7` |
| 8 | Manager AI — quick-action bar + structured form (5 common events) | `index.html#f8` |
| 9 | Manager AI — AI-initiated alerts (weather + GPS-via-photo) | `index.html#f9` |
| 10 | AI Rules Registry — browsable, versioned, auditable rules | `index.html#f10` |
| 11 | **Zone Weather Config — per-zone data source, thresholds, snooze, live status** | `frame-11-zone-weather-config.html` (standalone, v0.5) |

---

## 3. User stories

Grouped by role. Citations refer to requirements.md v0.5 sections and mockup frame numbers.

### Dispatcher (primary — Alexandra + any concurrent dispatchers per v0.5 §8)

1. **US-D-1 — Build the daily plan.** As a dispatcher, I want the AI to propose a balanced daily plan for tomorrow across all subs so that I start my shift with a draft to approve rather than a blank page. *(req §1; Frames 1, 2)*
2. **US-D-2 — Review the approval queue.** As a dispatcher, I want every AI-proposed reassignment to appear in a single approval queue with rationale, diff (before → after), and one-click approve/reject so that I can process the day's changes without opening five apps. *(req §1, §2; Frame 3)*
3. **US-D-3 — See weather impact per zone.** As a dispatcher, I want the system to poll NWS per zone automatically and surface flags on the Weather Impact panel so I don't have to check radar myself. *(req §6.1, §6.6; Frame 4)*
4. **US-D-4 — Adaptive weather polling.** As a dispatcher, I want the poll rate to speed up (30 min / 15 min) when outdoor stops are on the schedule or a watch/warning is active, so a fast-moving storm doesn't slip past the hourly baseline. *(req §6.3; AC-WX-1)*
5. **US-D-5 — Snooze a false-positive.** As a dispatcher, I want to snooze weather flags for a zone for 1h / 4h / 12h / 24h / custom with a required reason so the console isn't screaming "thunderstorm" when the sky is clear. *(req §6.5; Frame 4/11)*
6. **US-D-6 — Snooze is overridden by severe weather.** As a dispatcher, I want a snooze to be automatically overridden when NWS issues a Watch/Warning/Advisory at severity Moderate or above so I can't accidentally silence a tornado warning. *(req §6.5, §6.8 AC-WX-4)*
7. **US-D-7 — Approve reschedule + notify in one action.** As a dispatcher, I want a single "Approve reschedule + notify" button that both moves the affected stops and queues customer emails, so I'm not doing two separate approvals. *(req §6.6; email §7; Frame 4)*
8. **US-D-8 — Batched customer email preview.** As a dispatcher, I want to preview the batched email that will go to the largest-affected contact before I approve, so I can catch a wrong date or a wrong contact before it sends. *(email §7; Frame 4)*
9. **US-D-9 — Suppress notification when I've already called the customer.** As a dispatcher, I want to toggle off "auto-notify customers" for a specific approval so I don't double-notify Isaac when I already talked to him. *(email §7; Frame 4)*
10. **US-D-10 — Check sub capacity before assigning.** As a dispatcher, I want to see a 7-day per-sub view with stops, cables, and estimated hours so I know when I'm about to overload Felipe. *(req §3; Frame 2, 6)*
11. **US-D-11 — Contact customers in a batch.** As a dispatcher, I want to trigger customer notifications for a group of orders sharing a contact (10-min debounce, 4h max hold, business-hours window) so contacts get one clean email instead of five. *(email §1; AC applies)*
12. **US-D-12 — Log an event via natural language.** As a dispatcher, I want to type "Felipe out Friday family thing" into the Manager AI bar and have the parse preview show the structured event before I confirm, so quick logging doesn't require a form. *(req §1; Frame 7)*
13. **US-D-13 — Log an event via quick-action form.** As a dispatcher, I want a 5-event quick-action bar (sub out, request off, capacity change, weather flag, order note) for the common cases so I'm not typing every time. *(Frame 8)*
14. **US-D-14 — Nightly PDF stable order.** As a dispatcher, I want the nightly PDF grouped by day and route order — NOT reordered by subdivision — so the sub reads it in the order they'll drive it. *(req header §Customer feedback; Frame 5)*
15. **US-D-15 — Field issues visible in red.** As a dispatcher, I want field-issue / notes stops flagged red in the nightly PDF so the sub sees them first. *(req header §Customer feedback; Frame 5)*
16. **US-D-16 — Don't step on another dispatcher.** As a dispatcher, when a colleague is already reviewing a proposal, I want to see that lock ("Being reviewed by Sam since 14:22") so I don't approve the same thing twice or overwrite their edit. *(req §8; AC-CO-1..4)*

### Sub-worker (v1 = PDF only; no v1 sub-facing app)

17. **US-S-1 — Receive the daily assignment.** As a sub-worker, I want the day's stops delivered to me in route order via the nightly PDF so I know where to go without calling the office. *(req header, Frame 5)*
18. **US-S-2 — GPS check-in via photo (v2 only).** As a sub-worker, I want to snap a job-site photo and have the system consume the EXIF GPS + timestamp as my check-in so I don't have to run a separate check-in app. *(v2 stub — feeds ALERT-GPS-STALL-01; Frame 9)*
19. **US-S-3 — Mark job complete (v2 only).** As a sub-worker, I want to mark each stop complete with an optional note so the dispatcher's board reflects reality by end of day. *(v2 scope)*

### HPT customer contact (e.g., Isaac at Cast Concrete)

20. **US-C-1 — One weather-reschedule email covers all my jobs.** As a customer contact, I want one batched email listing every one of my rescheduled orders (10-min debounce) so I'm not opening five separate messages for the same storm. *(email §1)*
21. **US-C-2 — Threaded per contact.** As a customer contact, I want related weather emails threaded in my inbox (`In-Reply-To` referencing the last email within 14 days) so my inbox stays tidy. *(email §6)*
22. **US-C-3 — Know the new date and who to call.** As a customer contact, I want the email to clearly show old date → new date and the dispatch call-back number so I can adjust my crew or push back. *(email §3, §4)*
23. **US-C-4 — Engineers don't get scheduling emails.** As an engineer of record, I want to *not* be included on weather-reschedule notifications so a routine schedule change doesn't drag me into a review I wasn't asked to do. *(email §2)*

### HPT Ops (VP / GM — James, read-only)

24. **US-O-1 — See AI rationale.** As HPT Ops, I want to see the rationale text for every AI proposal (why this reassignment, which rule fired) so I can trust — or challenge — the model. *(req §2; Frame 3, Frame 10)*
25. **US-O-2 — Override any AI proposal.** As HPT Ops, I want to override any AI proposal without editing the rule, so a one-off exception doesn't require a rules-registry change. *(req §1, §2)*
26. **US-O-3 — Audit any decision.** As HPT Ops, I want an immutable audit log of every rule change, approval, snooze, override, and customer notification (with actor + timestamp + rationale) so we can defend a decision six months later. *(req §2; ISO 9001 §8.5.4; email §6)*
27. **US-O-4 — Approve rule changes.** As HPT Ops (VP James), I want to be the approver on `change_reason` + `rollback_plan` for any AI-rules change so the registry doesn't drift silently. *(req §2; Frame 10)*

---

## 4. Acceptance criteria

Given/When/Then, one block per major surface. Frame numbers reference the mockup.

### Frame 1 — Command Center home

- **AC-F1-1** — Given a dispatcher is on shift start, When the Command Center loads, Then the AI queue, past-due stops, and today's total-load-vs-capacity summary are all visible without scrolling on a 1080p display.
- **AC-F1-2** — Given the AI has generated ≥ 1 proposal in the last 24 h, When the dispatcher opens the home view, Then a badge count shows unresolved proposals and clicking it deep-links to the Approval Queue.
- **AC-F1-3** — Given a stop is past due, When the home view renders, Then that stop appears in a "Past due" section with sub name, order, address, and age (in hours).
- **AC-F1-4** — Given a zone has an active auto-generated `WeatherFlag`, When the home view renders, Then that zone shows a weather chip on the summary strip with the triggering condition and last-updated timestamp *(AC-WX-7)*.
- **AC-F1-5** — Given the dispatcher clicks a sub avatar, When the click resolves, Then the Sub Detail 7-day view (Frame 2) opens for that sub.
- **AC-F1-6** — Given N dispatchers are on shift, When the home view renders, Then the header shows a "N dispatchers on shift" indicator with avatars and last-active timestamps *(req §8)*.

### Frame 2 — Sub detail (7-day view)

- **AC-F2-1** — Given a sub is selected, When Frame 2 renders, Then the next 7 days appear as columns with per-day count of stops, total cables, and estimated hours vs. the sub's daily capacity.
- **AC-F2-2** — Given estimated hours > daily capacity for a day, When Frame 2 renders, Then that day is flagged **OVER CAPACITY** in a visible color and the delta hours are shown.
- **AC-F2-3** — Given a stop card in Frame 2 is dragged to a different day column, When drop resolves, Then a proposal is queued (not applied) into the Approval Queue with actor = dispatcher, source = manual drag.
- **AC-F2-4** — Given a sub has a requested day off, When Frame 2 renders, Then that day is annotated with the request (source: Manager-AI event, e.g., "Requested Sat off (family)").
- **AC-F2-5** — Given a sub has a recent noteworthy event (e.g., "Completed 8 stops in Sundance Cove in one visit"), When Frame 2 renders, Then the event appears in the sub-context strip above the 7-day grid.

### Frame 3 — Approval queue

- **AC-F3-1** — Given the queue has ≥ 1 pending proposal, When it renders, Then each row shows: source (AI/manual), affected orders (count), before → after diff, rule ID that fired, plain-English rationale, and Approve / Reject buttons.
- **AC-F3-2** — Given the dispatcher clicks Approve, When the proposal executes, Then a `Decision` record is written with `actor`, `timestamp`, `proposal_id`, `rule_id`, `outcome=approved`, and the full before-snapshot for rollback.
- **AC-F3-3** — Given the dispatcher clicks Reject, When the proposal is dismissed, Then a `Decision(outcome=rejected, reason=<required text>)` record is written and the proposal is removed from the queue.
- **AC-F3-4** — Given a reassignment proposal moves > 5 stops, When it renders, Then a stop-by-stop preview (per the Frame 3 pattern) shows the dispatcher exactly which stops move to whom before they commit.
- **AC-F3-5** — Given a weather-triggered reschedule proposal, When Approve is clicked, Then the reschedule executes AND `EmailIntent`s are enqueued for affected contacts per the debounce rules — a single approval covers both actions.
- **AC-F3-6** — Given the dispatcher navigates away mid-review, When she returns within 24 h, Then the same proposals remain in the queue with unchanged ordering and no re-generation runs unless explicitly requested.
- **AC-F3-7** — Given another dispatcher opens the same proposal, When their UI renders, Then the lock indicator shows "Being reviewed by <name> since <t>" and Approve/Reject are disabled until the lock releases or expires *(req §8; AC-CO-1)*.

### Frame 4 — Weather impact + notification preview

- **AC-F4-1** — Given zones exist, When Frame 4 renders, Then a horizontal "Zone weather sources" strip lists each zone with its icon, current condition, feed name, and "last updated N min ago"; strip turns amber when > 30 min stale *(AC-WX-7)*.
- **AC-F4-2** — Given a `WeatherFlag(source=auto)`, When it renders in Frame 4, Then the flag form is prefilled and annotated "auto-selected" indicating the source rule; dispatcher can still edit before approving.
- **AC-F4-3** — Given a weather-reschedule proposal has affected contacts, When the preview panel renders, Then it shows: count of orders, count of distinct contacts, and count suppressed by the engineer-role filter with the contacts named *(email §7)*.
- **AC-F4-4** — Given the "Auto-notify customers on approval" toggle is ON (default), When Approve is clicked, Then `EmailIntent`s are enqueued and the batched email will dispatch after the 10-min debounce.
- **AC-F4-5** — Given the toggle is OFF for a specific approval, When Approve is clicked, Then the reschedule executes but no `EmailIntent`s are enqueued for that batch.
- **AC-F4-6** — Given the batched preview panel is open, When the dispatcher hovers a contact, Then the sample rendered email for that contact is shown inline.

### Frame 5 — Nightly PDF

- **AC-F5-1** — Given tomorrow's plan is ready, When the PDF renders, Then stops are grouped by day and within each day are ordered by optimizer route order — NOT alphabetically and NOT by subdivision *(req header §Customer feedback)*.
- **AC-F5-2** — Given a stop has notes or a flagged field issue, When the PDF renders, Then that row is highlighted red.
- **AC-F5-3** — Given a multi-day plan, When the PDF renders, Then each day starts on its own page with the day header repeated on continuation pages.
- **AC-F5-4** — Given task types include Stress, Cut, Grout, Paint, Field Issues, Engineer Letter, When the PDF renders, Then each stop row shows the task-type label and the cable count.
- **AC-F5-5** — Given the PDF is generated, When the file is created, Then it is filename-stamped with sub name + date range and archived to the audit log with a link.

### Frame 6 — Sub capacity setup

- **AC-F6-1** — Given ops-admin opens a sub profile, When Frame 6 renders, Then editable fields include: display name, work cell/zone, working hours per weekday, per-task-type rate (**base rates TBD — provided by Alexandra Euyoque**), and apartment override.
- **AC-F6-2** — Given the apartment stress rate is edited, When saved, Then the default override of **2× base** applies to any stop tagged `apartment` for that sub. Once Alexandra confirms base stress = 1.5 min/cable, override = 3.0 min/cable.
- **AC-F6-3** — Given per-weekday hours are edited (e.g., "Sat off"), When saved, Then estimated-hours calculations in Frame 2 immediately reflect the new capacity.
- **AC-F6-4** — Given a task-type rate is changed, When saved, Then a `TaskTypeRate` record is written with actor + timestamp; no silent overwrites.

### Frame 7 — Manager AI natural-language input

- **AC-F7-1** — Given the dispatcher types free text (e.g., "Felipe out Friday family"), When they pause, Then a live parse preview shows the extracted structured event (sub, date, event type, note) before confirmation.
- **AC-F7-2** — Given the parse preview is wrong, When the dispatcher edits any field, Then the parse updates without discarding the free-text input.
- **AC-F7-3** — Given the dispatcher confirms, When the event is committed, Then it appears in the affected sub's Frame 2 view and any dependent optimizer proposal is queued.

### Frame 8 — Manager AI quick-action bar

- **AC-F8-1** — Given the 5 common events (sub out, request off, capacity change, weather flag, order note), When the dispatcher clicks one, Then a minimal structured form appears with only the fields required for that event.
- **AC-F8-2** — Given a form is submitted, When the event lands, Then the same downstream flow as natural-language input runs (Frame 2 update + optimizer proposal queue).

### Frame 9 — AI-initiated alerts

- **AC-F9-1** — Given `ALERT-WEATHER-01` (composite) fires, When the alert lands, Then it appears in the AI-alerts stream with the triggering child rule (rain / wind / freeze / lightning / snow), affected zone, and affected outdoor stops in the adverse window.
- **AC-F9-2** — Given `ALERT-GPS-STALL-01` fires (v2 sub-app photo metadata source), When the alert lands, Then the affected sub, stop, and last-known GPS/timestamp are shown; dispatcher can Approve (open ticket) / Snooze / Dismiss with logged reason.
- **AC-F9-3** — Given any alert is Approved / Snoozed / Dismissed, When the action posts, Then an audit-log entry with actor + timestamp + reason is written.

### Frame 10 — AI Rules Registry

- **AC-F10-1** — Given the registry has **11 primary rules (2 Optimization + 8 Alert + 1 Constraint per req §2 v0.5)** plus the `NOTIFY-WEATHER-EMAIL-01` follow-on rule, When Frame 10 renders, Then rules are grouped by category with rule ID, name, version, owner_role, and last-changed timestamp.
- **AC-F10-2** — Given a rule is opened, When the detail pane renders, Then `params_current`, `params_baseline`, and full change history are visible including `change_reason` and `rollback_plan` for every version.
- **AC-F10-3** — Given a rule change is proposed, When saved, Then it cannot be committed without a non-empty `change_reason` and `rollback_plan` — the form enforces this at the API layer, not just the UI.
- **AC-F10-4** — Given a rule change is committed, When it lands, Then the previous version remains queryable and rollback is a one-click operation from the change-history table.
- **AC-F10-5** — Given `ALERT-WEATHER-01` is the composite, When any of the 5 child rules fires (RAIN/WIND/FREEZE/LIGHTNING/SNOW), Then the composite fires too and downstream reschedule/notify handlers subscribe to the composite only.
- **AC-F10-6** — Given `OPT-ZONE-01` was removed in v0.5, When any legacy reference to it is encountered, Then the API returns a 410 Gone with pointer to zone-preference logic embedded in `OPT-CAP-01` and the sub-profile.

### Frame 11 — Zone Weather Config (standalone wireframe in v0.5)

- **AC-F11-1** — Given ops-admin opens Frame 11, When it renders, Then the left pane lists every zone with live status ("last polled X min ago", "X conditions active") and the right pane shows the selected zone's data-source, thresholds, snooze state, and recent auto-flag log.
- **AC-F11-2** — Given the ops-admin changes a zone's data source (NWS / OpenWeather / custom), When saved, Then the change writes a `WeatherSource` record and requires confirmation citing the zone name.
- **AC-F11-3** — Given the ops-admin edits a threshold cell in the per-phenomenon × per-task-type matrix, When they blur the cell, Then a confirmation modal appears citing the rule ID + zone before the write commits.
- **AC-F11-4** — Given the dispatcher initiates a snooze, When submitted, Then a reason (1–200 chars) is required and the snooze appears in the recent-log with expiry time.
- **AC-F11-5** — Given a snooze is active and an NWS Watch/Warning/Advisory at severity ≥ Moderate fires, When the flag is created, Then it bypasses the snooze and the snooze record is marked `overridden_at + overridden_reason`.
- **AC-F11-6** — Given the ops-admin clicks "Test / fetch now" on a zone, When the call resolves, Then the current NWS response is displayed inline and the last-polled timestamp updates without waiting for the next adaptive-cadence tick.
- **AC-F11-7** — Given any AI proposal card surfaces in Frame 11 (e.g., "auto-snooze suggested because forecast just cleared"), When it renders, Then it cites its source rule ID like every other frame in the mockup.

### Zone weather auto-detection (§6 — behavior primarily surfaces in Frames 4, 10, and 11)

- **AC-WX-1..10** — see requirements §6.8 (unchanged from v0.4).

### Concurrency / multi-dispatcher (§8 — new in v0.5)

- **AC-CO-1..4** — see requirements §8 (new in v0.5).

### Customer notification email (§weather-reschedule-email.md)

- **AC-EM-1..7** — unchanged from v0.4.

---

## 5. Data contracts

All schemas are cited from requirements v0.5 unless noted. Anything marked (stub) is enumerated in req §7 as "still to draft (v0.6 target)".

### 5.1 AI Rule (Rules Registry v1.0 — req §2)

```
Rule {
  id                string   // e.g., "ALERT-WEATHER-RAIN-01"
  name              string
  category          enum     // "Optimization" | "Constraint" | "Alert"
  version           int      // monotonic per rule
  owner_role        enum     // "Ops Admin" | "Dispatcher" | "VP"
  params_baseline   json     // initial / factory defaults
  params_current    json     // live values (may be per-zone matrix for weather rules)
  parent_rule_id    string?  // set on child rules that roll up to a composite (e.g., ALERT-WEATHER-01)
  change_reason     string   // REQUIRED on every change
  rollback_plan     string   // REQUIRED on every change
  created_at        timestamp
  created_by        user_id
  last_changed_at   timestamp
  last_changed_by   user_id
}
```

Composite semantics: `ALERT-WEATHER-01` fires when any child rule fires; downstream integrations subscribe to the composite only.

### 5.2 Order (stub — req §7)

```
Order {
  id                 string
  address_full       string
  address_short      string   // street + city, ~40-char cap for PDF columns
  contact_id         fk_to_Contact
  zone_id            fk_to_Zone
  task_type_id       fk_to_TaskType   // stress / cut / grout / paint / field_issues / engineer_letter
  capacity_hours     decimal          // optimizer input (derived from cable count × rate)
  cable_count        int
  scheduled_date     date
  status             enum
  ...                                  // full schema pending v0.6
}
```

### 5.3 Contact (email §2, §5)

```
Contact {
  id            string
  first_name    string
  last_name     string
  role          enum   // 'Superintendent' | 'Foreman' | 'Project Manager' | 'Customer Service' | 'Site Supervisor' | 'Engineer' | unknown
  email         string
  phone         string
  company_id    fk_to_Company
}
```

Behavioral rule: `role='Engineer'` blocks all weather-reschedule email enqueues (email §2).

### 5.4 Sub (stub — req §3, §7; visible in Frame 6)

```
Sub {
  id                     string
  display_name           string
  sub_company_id         fk_to_SubCompany
  work_cell              string   // zone or geographic assignment
  working_hours_matrix   json     // per weekday, e.g., { mon: {start:"07:00", end:"17:00"}, sat: null, ... }
  task_type_rates        json     // { stress: TBD, grout: TBD, cut: TBD, ... } minutes per cable — Alexandra to provide
  apartment_override     json?    // e.g., { stress: 2x_base } — 2× base per Alexandra
  status                 enum
}
```

**Full sub roster + zone data is owned by the dev team** (previously handed off outside this repo). Not re-published here.

### 5.5 Weather event / flag (req §6.1, §6.2, §6.6)

```
WeatherSource {
  id                     string
  provider               enum   // "nws" | "openweather" | "custom"
  station_or_gridpoint   string
  auth_config            json   // empty for NWS
}

Zone {
  id                     string
  display_name           string
  polygon                geojson_polygon
  centroid               { lat: decimal, lon: decimal }  // auto-computed
  weather_source_id      fk_to_WeatherSource
}

WeatherFlag {
  id                     string
  zone_id                fk_to_Zone
  condition              string   // e.g., "Heavy rain"
  severity               enum     // NWS severity or derived
  source                 enum     // "auto" | "manual"
  origin_rule            string?  // e.g., "ALERT-WEATHER-RAIN-01" when source=auto
  date_range             { start: timestamp, end: timestamp }
  alert_at               timestamp
  cleared_at             timestamp?
}

ZoneWeatherSnooze {
  zone_id                fk_to_Zone
  snoozed_by             user_id
  snoozed_at             timestamp
  expires_at             timestamp
  reason                 text     // 1..200 chars, required
  overridden_at          timestamp?
  overridden_reason      text?
}

ZoneWeatherThresholdOverride {
  zone_id                fk_to_Zone
  rule_id                fk_to_Rule       // e.g., "ALERT-WEATHER-RAIN-01"
  task_type_id           fk_to_TaskType
  threshold_value        json             // typed per phenomenon
  set_by                 user_id
  set_at                 timestamp
}
```

### 5.6 EmailIntent + template payload (email §1–5)

```
EmailIntent {
  id                     string
  contact_id             fk_to_Contact
  order_id               fk_to_Order
  weather_flag_id        fk_to_WeatherFlag
  original_date          date
  new_date               date
  enqueued_at            timestamp
  status                 enum   // 'queued' | 'sent' | 'skipped' | 'failed'
}
```

Send parameters (governed by rule `NOTIFY-WEATHER-EMAIL-01`): `debounce_minutes=10`, `max_hold_hours=4`, `send_hours_local=07:00–19:00 CT`.

### 5.7 DispatcherLock (v0.5 — new)

See requirements §8. Powers concurrent multi-dispatcher soft locks on the approval queue, sub profiles, rules, and zone-config edits.

---

## 6. Integration points (v1 — v0.5 pared down)

| System | Purpose | Auth / notes |
|---|---|---|
| **Google Distance Matrix** | Drive-time inputs to optimizer (req §4). | HPT-issued API key; usage-metered. |
| **Microsoft Graph** | Customer notification email delivery via `POST /me/sendMail` from `dispatch@houstonposttension.com` shared mailbox (email §6). | App registration + mailbox delegation; HPT is M365. Fallback: SMTP relay if Graph degrades. |
| **NWS (api.weather.gov)** | Per-zone forecast + Watches/Warnings/Advisories (req §6.1). Default provider; no key required. | Adaptive poll cadence per req §6.3; per-zone `WeatherSource` allows switching to paid providers (OpenWeather etc.) later. |
| **HPT Cloud SSO (Microsoft Entra ID)** | Dispatcher / ops-admin / read-only auth. This app inherits — does not build its own IdP. | Single-tenant Entra; role from group membership. See req §9. |
| **Internal (informational)** | WIP scanner, ADP, ClickUp — enumerated in req §7 as boundaries to document in v0.6. | Not integrated in v1. |

**Removed from v0.4 → v0.5 (per James's 2026-07-29 locks):**
- **NetSuite** — dropped from v1. The $100 dry-trip fee is a NetSuite invoicing conversation, not a dispatch-tool concern. v2 candidate if orders/inventory ever consolidate.
- **OptimoRoute** — dropped. Not part of this feature.
- **Twilio (SMS to subs)** — dropped. Sub-facing self-service (SMS, app) is out of scope for v1.

---

## 7. Open questions the dev team should be prepared to discuss

Reduced from v1.0. Items 3 (auth), 8 (Frame 11), 9 (SMS scope), 10 (dispatcher count), and the NetSuite line under item 4 are now **closed** per James 2026-07-29.

1. **Stack.** Dev team picks. HPT's preference is **Python 3.11 + FastAPI backend, React/TypeScript front end, deployed to DigitalOcean App Platform** (matches the direction of every other HPT app; NYC3 region). If dev team prefers something else, we need the rationale documented so we can plan long-term maintenance.
2. **MVP scope — which 3–4 frames ship first?** Suggested: Frame 1 (Command Center home) + Frame 3 (Approval Queue) + Frame 4 (Weather Impact) + Frame 5 (Nightly PDF) = the closed loop the dispatcher can actually run against. Frame 10 (Rules Registry) can start as read-only with edits in a follow-up. Frame 11 (Zone Weather Config) can lag Frame 4 by one sprint if timing is tight. Confirm with James.
3. **Data source of truth for orders.** With NetSuite out of scope for v1, the v1 dispatch app runs against a stub / import pipeline. Two open questions: (a) which system feeds that pipeline in the interim? (b) what's the file / API contract? James's default: nightly + on-demand import from the existing HPT-Cloud orders view.
4. **Deployment target.** DO App Platform is HPT's direction (App Platform, not DO Functions — matches the WIP Processor migration path). Dev team should confirm they can deploy there, or make the case for their preferred target.
5. **Optimizer engine.** Requirements §7 references OR-Tools as the planned formal spec. With OptimoRoute now out of scope, the optimizer is built native — likely OR-Tools + Google Distance Matrix inputs. Confirm.
6. **Photo/GPS check-in app (v2).** Native mobile, PWA, or SMS + upload page? PWA is cheapest; native gives reliable background GPS and camera control. Needs a call **before v2 kicks off**, not v1.
7. **Task-type base rates (Frame 6).** Alexandra will provide the base minutes-per-cable numbers for stress / grout / cut / paint / field_issues. Do not invent placeholders in the UI — leave the fields empty with a "TBD — provided by Alexandra Euyoque" hint until she supplies them.

---

## 8. Governance + expectations

- **ISO 9001 §8.5.4 — control of preserved outputs.** Every decision (AI proposal, dispatcher approval, override, snooze, dismissal, customer notification send/skip/fail, rule change, lock acquire/release) writes an immutable AuditLog entry with `actor`, `timestamp`, and `rationale/reason`. Hard requirement.
- **AI Rules Registry discipline.** Every rule version change requires non-empty `change_reason` and `rollback_plan` — enforced at the API layer, not just the UI. Ownership: VP James approves rule-parameter changes and material spec changes; Ops Admin proposes them.
- **AI-proposes-only.** No customer-visible or assignment-changing action is auto-applied in v1. Auto-detection of **inputs** (weather) is allowed. Auto-execution of **actions** (reassignments, emails) is not.
- **Concurrent dispatcher hygiene.** Row-level soft locks on the approval queue, sub profiles, rules, and zone-config edits. Optimistic concurrency on all writes with a clean "reload — updated by <name>" toast. Session presence on the header. See req §8 + AC-CO-*.
- **Review cadence (recommended, to confirm).**
  - **Weekly async** — dev team pushes an update to the mockup URL / repo; James reviews and comments in-thread.
  - **Bi-weekly live demo** (30 min) — Zoom / Teams; walk any new frame or behavior; James + Alexandra attend.
  - **Monthly milestone review** — scope re-check against MVP; James signs off before scope grows.
- **Rule + spec change approval.** Rule content changes, material-spec changes, and weather-threshold defaults are VP-approved (James). Threshold overrides at zone level are Ops-Admin editable but audit-logged.
- **No production data in dev/staging** unless explicitly authorized by James (customer contacts + addresses are PII-adjacent; HPT does not want them in a shared sandbox).

---

## 9. Contact + review cadence

| Item | Detail |
|---|---|
| **Primary contact / product owner** | James Brady, VP Manufacturing & Operations — jbrady@houstonposttension.com |
| **Primary user (for validation)** | Alexandra Euyoque, Dispatcher — introductions via James |
| **Approval authority** | James — rule changes, material spec changes, MVP scope changes, integration credentials |
| **Review URL (watch for changes)** | https://houstonposttension.github.io/hpt-mockup-previews/dispatch-command-center-2026-07-26/ |
| **Frame 11 wireframe URL** | https://houstonposttension.github.io/hpt-mockup-previews/dispatch-command-center-2026-07-26/frame-11-zone-weather-config.html |
| **Requirements repo (raw source of truth)** | https://github.com/houstonposttension/hpt-mockup-previews/tree/main/dispatch-command-center-2026-07-26 |
| **Escalation** | Reply to jbrady@houstonposttension.com with `[HPT Dispatch]` prefix — routes to phone if urgent. |
| **Response SLA (expected)** | Async threads: same business day. Urgent (blocking): within 2 hours during 07:00–17:00 CT weekdays. |

Version handshake: **this handoff (v1.1) tracks requirements v0.5, published 2026-07-29. Dev team builds against v0.5.** The next requirements bump (v0.6 target) will land the full data model, optimizer OR-Tools spec, nightly PDF spec, sub-facing photo/GPS app spec, and the WIP scanner / ADP / ClickUp boundary docs — none of that blocks v1 build against v0.5.

---

*End of handoff v1.1 — 2026-07-29 · Questions to jbrady@houstonposttension.com.*
