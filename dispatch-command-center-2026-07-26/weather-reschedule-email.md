# Weather-reschedule Customer Notification — Email Spec

**Trigger:** Dispatcher approves a weather-reschedule proposal in the Approval Queue (Frame 3) or from the Weather Impact preview (Frame 4).
**Delivery:** Microsoft Graph API `POST /me/sendMail` (HPT is an M365 org — natural fit; no separate SMTP infrastructure needed). Fallback: SMTP relay if Graph is degraded.
**From:** `dispatch@houstonposttension.com` (shared mailbox; replies routed to dispatcher on duty).

---

## 1. Batching + debounce (hard requirement)

**One email per contact per batch window, never one email per order.**

When multiple orders are rescheduled for the same weather event and share a contact person, they must be collapsed into a single email with a table of all affected orders. This is a rock-solid requirement — Isaac at Cast Concrete does not want 5 emails; he wants one email listing 5 orders.

**Batching mechanics:**

1. On dispatcher approval of a weather-reschedule proposal, each affected order enqueues an `EmailIntent` with `contact_id`, `order_id`, and reschedule details.
2. `EmailIntent`s are grouped by `contact_id`.
3. A **10-minute debounce timer** starts per contact after the first `EmailIntent` for that contact. Every additional intent for the same contact resets the timer (so a burst of approvals over 8 minutes still batches).
4. When the timer expires with no new intents for that contact for 10 minutes, the batched email is dispatched.
5. If only one order is in the batch, the **single-order template** is used. If ≥ 2, the **batched template** is used.

**Configurable parameters** (admin-editable, stored in the AI Rules Registry as `NOTIFY-WEATHER-EMAIL-01`):

| Parameter | Default | Description |
|---|---|---|
| `debounce_minutes` | 10 | How long to wait for more intents before dispatching |
| `max_hold_hours` | 4 | Hard ceiling — never wait longer than this even if intents keep arriving |
| `send_hours_local` | 07:00–19:00 CT | Business-hours window; queue outside this window and send at 07:00 next business day |

---

## 2. Engineer-role filter (hard requirement)

**Do not email contacts whose role is `Engineer`.** Alexandra was explicit: engineers should not receive weather-reschedule emails, because it can cause downstream issues on their end (their process treats any schedule change as a red flag that may pull them into a discussion HPT does not want them in).

**Filter logic:**

- If `contact.role IN ('Superintendent', 'Foreman', 'Project Manager', 'Customer Service', 'Site Supervisor')` → send.
- If `contact.role = 'Engineer'` → **do not send. Log a `notification_skipped` audit event with reason `engineer_role_filter`. Surface in dispatcher's audit log so she can manually notify if needed.**
- If `contact.role` is unknown/empty → send (default to notify; safer to over-notify a non-engineer than to skip a needed notification).

The role filter is applied *before* batching — engineer-role orders are never enqueued.

---

## 3. Single-order template

```
Subject: [Weather Delay] Post-Tension work at {{address}} — new date {{new_date}}

Hi {{contact.first_name}},

Weather in {{zone.display_name}} ({{condition}} forecast {{forecast_date_range}})
requires us to reschedule the post-tension work below:

  Order:         #{{order_id}}
  Address:       {{address}}
  Original date: {{original_date}}
  New date:      {{new_date}}
  Reason:        Weather — {{condition}}

We monitor the forecast daily and will update you if it changes. If this
reschedule conflicts with your build schedule, please reply to this email
or call dispatch at (713) 555-0142.

Thanks,
HPT Dispatch
Houston Post-Tension · dispatch@houstonposttension.com
Sent {{sent_at_local}} CT — order-of-record: {{order_id}}
```

---

## 4. Batched template (≥ 2 orders same contact)

```
Subject: [Weather Delay] {{n_orders}} post-tension jobs reschedule — new dates below

Hi {{contact.first_name}},

Weather in {{zone.display_name}} ({{condition}} forecast {{forecast_date_range}})
requires us to reschedule the following {{n_orders}} jobs:

  Order    Address                                Original      New date
  ─────    ────────────────────────────────────   ─────────     ─────────
  {{#each orders}}
  #{{order_id}}   {{address_short}}   {{original_date}}    {{new_date}}
  {{/each}}

  Total jobs affected: {{n_orders}}
  Reason:              Weather — {{condition}}
  Combined date range: {{combined_original_range}} → {{combined_new_range}}

We monitor the forecast daily and will update you if conditions change.
If any of these reschedules conflicts with your build schedule, please reply
to this email or call dispatch at (713) 555-0142 — reference any order number
above.

Thanks,
HPT Dispatch
Houston Post-Tension · dispatch@houstonposttension.com
Sent {{sent_at_local}} CT — batched from {{n_orders}} approvals between
{{batch_first_approval_at}} and {{batch_last_approval_at}}
```

---

## 5. Field mapping

Templates use fields drawn from:

| Placeholder | Source entity.field |
|---|---|
| `contact.first_name` | `Contact.first_name` |
| `contact.role` | `Contact.role` (used for filter, not rendered) |
| `zone.display_name` | `Zone.display_name` (e.g., "Crosby / Dayton") |
| `condition` | `WeatherFlag.condition` (e.g., "Heavy rain") |
| `forecast_date_range` | `WeatherFlag.date_range` |
| `order_id` | `Order.id` |
| `address` | `Order.address_full` |
| `address_short` | `Order.address_short` (street + city, truncated to ~40 chars for column) |
| `original_date` | `Assignment.original_date` (captured at time of reschedule) |
| `new_date` | `Assignment.new_date` |
| `n_orders` | count of orders in the batch for this contact |
| `combined_original_range` | min→max of `original_date` across batch |
| `combined_new_range` | min→max of `new_date` across batch |
| `batch_first_approval_at` | timestamp of first approval in batch |
| `batch_last_approval_at` | timestamp of last approval in batch |
| `sent_at_local` | send timestamp, Houston local (America/Chicago) |

---

## 6. Delivery + retry

- **Delivery:** Microsoft Graph API `POST /me/sendMail` from the `dispatch@` shared mailbox.
- **Threading:** all emails to a given contact use `In-Reply-To` referencing the last weather-reschedule email to that contact (if within the past 14 days), so their inbox threads related weather updates.
- **Retry:** on transient failure (5xx), retry with exponential backoff at 30s, 2 min, 10 min, 60 min. After 4 failures, log `notification_failed` audit event and surface in dispatcher's inbox as an alert.
- **Audit:** every successful send and every skip/failure writes to `AuditLog` with `event_type = "customer_notification"`, `channel = "email"`, and the full payload snapshot.

---

## 7. Dispatcher-facing UI (Frame 4)

Before the dispatcher clicks **Save + run optimizer** on a weather flag, they see a preview panel:

- **Notifications that will be queued:** count of orders and count of distinct contacts.
- **Engineer-role filter status:** e.g., "1 order suppressed (engineer contact — Ravenna Homes structural review). See audit log to manually notify."
- **Toggle:** *Auto-notify customers on approval* (default: ON, per Alexandra's preference).
- **Preview:** show a rendered example of the batched email that would go to the largest contact.

The dispatcher can toggle off notification for a specific approval if she has already spoken to the customer.

---

## 8. Related rule in AI Rules Registry

This spec is governed by rule `NOTIFY-WEATHER-EMAIL-01` (category: `Alert` — technically a follow-on action). Debounce, filter roles, business-hours window, and template versions are all Parameters of that rule and follow the same change-history discipline as any other rule (see `requirements.md` §2).
