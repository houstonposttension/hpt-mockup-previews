# Role / Navigation — rev 2b, "scan-first bar over the locked interiors"

**Date:** 2026-08-07 (rev 2 published 2026-08-06, reconciled 2026-08-07)
**Status:** IDEATION MOCKUP. No production code. Awaiting James's sign-off.

**Reconciled against:**
- `outputs/mockups/loader-category-status-2026-07-21/variant-c-lean-2026-07-22.html` — the **canonical
  loader** (design note rev 13, §20: *"what actually ships"*)
- `docs/spec/loader-category-status-design-2026-07-21.md` — 20 sections, 13 revisions of locked calls
- `hpt-mockup-previews/supervisor-lead-mobile-2026-07-24/index.html` — the **locked 18-frame
  supervisor + lead persona mockup**
- `load_app.html` v2.5.0 — the live production loader
- `docs/spec/role-information-requirements-2026-08-06.md` — the requirements audit

---

## What this set is now

Rev 2 (2026-08-06) proposed one thing that survived review: **a single 38 px bar** replacing three
stacked rows of chrome, with scan owning the rest of the screen. It also drew thinner versions of the
Loader and Supervisor screens that **collided with locked designs neither of us had in front of us**.

Rev 2b keeps the bar and **puts the locked interiors back underneath it, whole.** The bar is the only
thing that changed about those screens.

| Role | What happened |
|---|---|
| **Rebar** | Unchanged from rev 2. No rival locked design exists; production `scan_poc.html` is the reference. |
| **Loader** | **Rebuilt from the LEAN canonical.** 5 screens. Nothing simplified. |
| **Supervisor** | **Replaced, not patched.** Rebuilt against the 18-frame locked persona mockup. |
| **Inventory / Maintenance** | **Left alone deliberately.** Both are owned by separate governed projects with their own locked specs — see below. |

---

## Pages

**Rebar** — the bar's original argument, unchanged

| # | File | What it shows |
|---|---|---|
| 1 | `index.html` | Quiet state — both cross-role badges 0, both pills collapsed to zero width |
| 2 | `rebar-busy.html` | Busy state — badges live; a toggle to watch the collapse fire |

**Loader** — the LEAN canonical, brought forward whole

| # | File | What it shows |
|---|---|---|
| 3 | `loader.html` | In-progress: Bin → Order → status-grouped LEAN rows, counts bar, category filter, presence line, 409 conflict, row drawers |
| 4 | `loader-punchlist.html` | Punch list: category → missing, walk-to hints with honest `TBD`, Pending—backfill bucket |
| 5 | `loader-alarm.html` | **Two-tier interrupt** — amber NOT READY, red DIFFERENT JOB, and the separate dark-blue bin decision with **Combine** |
| 6 | `loader-closeout.html` | Green READY TO DEPART · blocked + two-field override form · the **3-photo truck documentation panel** |
| 7 | `loader-split.html` | Split request → approval → carry-over, plus the multi-run switcher |
| — | `loader-drawer.html` | Superseded pointer (was the drawer draft) |

**Supervisor + Lead** — rebuilt against the locked persona mockup

| # | File | What it shows |
|---|---|---|
| 8 | `supervisor.html` | **Workcell tiles** — Lead home (own cells, expanded) and Supervisor home (plant-wide, hotspot first, collapsed) |
| 9 | `supervisor-station.html` | Station drill-down (shift-so-far + 8 h sparkline + stalls) and the **honest dark cell** |
| 10 | `supervisor-approvals.html` | The **Approvals pillar** — inbox, approve, reject-with-reason |
| 11 | `supervisor-actas.html` | **Act as operator** (own identity, no impersonation) and **shift-scoped reposition** |
| 12 | `bar-anatomy.html` | The bar dissected: quiet / busy / crowded, space budget, reused vs new |

---

## Locked decisions preserved (not re-simplified)

**Loader row contract (§20)** — the four pixels that carry meaning:

| Pixel | Meaning | Never |
|---|---|---|
| Left edge | **Category** — Rebar blue, Tendon violet, Hardware orange, Lumber green, Pending amber | severity |
| Corner dot | **Upstream lifecycle state** — Staged / At machine / In office / Not printed / State ? | load status |
| Section header | **Load status** | repeated per row |
| Row body | tag # + short spec + **bend shape**; everything else one tap away | a chip farm |

- **`shapeSVG()` is reused verbatim**, not forked (§7.4). Schematic, not to scale — it reads how many
  legs are populated, never their magnitudes. That limitation is carried over honestly.
- **Two-tier interrupt.** Tier 1 = full-screen alarm, **one action**, alarm tone + `[300,120,300]`
  vibrate, amber (NOT READY) or red (NOT ON ANY LOAD / DIFFERENT JOB). Tier 2 = dark-blue bin decision,
  **no tone**, soft `[100,50,100]`, four actions including **Combine**. Sub-bins are normalised through
  `baseBin()`, so X8.2 against X8 is not a wrong bin.
- **"Complete loading", never "depart" or "ship short"** (§15.2). `ON_TRUCK` is the loader's terminal
  state; `DELIVERED` is the driver's.
- **Punch list is the view toggle, not a drawer** — the toggle carries the count and the urgency rule
  (grey → amber at 80% → red on short close-out). The pull-up drawer stays on the rebar screen.
- **Category filter wraps onto two rows** (§12) — never a horizontal scroll, never a segmented control.
- **Approvals are plant-wide, self-approval allowed**, no cell scope. Only `carry > 0` enters the queue.

**Supervisor (locked answers Q3–Q8):**

- Lead and Supervisor are **two roles with two homes**; collapsed vs expanded defaults differ.
- Tile = **last-hour** lbs/hr + trend vs prior hour + colour vs target. **Shift-so-far is not on the
  tile** — it lives in the drill-down.
- Nine stations have **no target**: they show `— no target`, never an invented bar. A 7-day-average
  fallback is labelled as such.
- **Dark cells show nothing and say why**, with the one-line config fix. No zeroed charts.
- **Act as operator credits the supervisor's own identity** — no `on_behalf_of` field, no impersonation.
- **Reposition is shift-scoped only** (ShiftOverrides, 7-day TTL). There is no durable option.
- Presence is derived from **scan activity**, never claimed as attendance.

**Everywhere:** the **6-stage lifecycle** is the only status vocabulary.

---

## Deliberately out of scope

**Inventory** and **Maintenance** interiors are not designed here. Both belong to other governed
projects that already hold locked specs:

- **Inventory** — `C:\Dev\HPT-Inventory`: locked requirements v1.0 (Blocks A–K), four ADRs, three prior
  mockup sets. The core control is that **the count is blind** — the worker never sees the expected
  quantity, enforced by data placement (a separate `count_expected_snapshot` table the worker-facing
  query path never joins), not by UI discipline. Any "expected vs counted vs variance" grid drawn here
  would break it.
- **Maintenance** — `C:\Dev\HPT-MaintainX`, plus `api/maintainx-v1.yaml` (403-line OpenAPI contract),
  `specs/maintainx-integration-2026-06-18.md` and 345 lines of contract tests in this repo. The locked
  worker interaction is a **"Report maintenance" button on every scan screen** → 4-category picker →
  optional photo → POST. That is a *write* action on the scanner, not a nav destination.

In this set they appear only as **cross-role pills** — links out, with no interior.

**Icons (2026-08-07):** Maintenance is marked with a **wrench**, at Maintenance's request. This is a
visual marker only — the interior stays out of scope. Inventory keeps `▦`. Both render monochrome in
the same blue so the pair reads as one family: the wrench is an inline SVG masked and tinted with
`currentColor` rather than a colour emoji, with an emoji fallback for anything that can't mask.

---

## Still unbacked by production data

`category` on the tag (blocks the punch list) · truck / vehicle entity · worker↔work assignment ·
physical locations for walk-to hints · the approvals store and endpoints ·
`CORRECT`/`VOID`/`SCRAP` writers (read but never written) · per-row `loaded_by`/`loaded_at` on
`/api/load-status` (and actor names are tenant-only PII) · `authority_level` in the data model ·
supervisor enforcement (`PORTAL_ENFORCE_SUPERVISOR_ROLE` is unset, so any authenticated principal
passes) · queue-position model for ETA · the `0421` badge format.

Every worker-tier URL shown also needs a **live** Easy Auth `excludedPaths` entry before it will load.

---

## Open questions for James

1. **Punch list: toggle or drawer?** I chose the locked toggle over my drawer. Confirm.
2. **Cloud tag label.** LEAN renders `HPT Cloud · f3a1…`; the GA-WIP-179 spec says
   *"HPT Cloud tag — details pending"* and explicitly **not** a truncated GUID. I used the spec wording.
   Two prior artifacts disagree — which wins?
3. **Authority swap vs Act-as-operator.** Rendered as two distinct controls. Merging them risks implying
   impersonation, which Q6 deliberately rejected. Merge or keep separate?
4. Still open from the original loader review: combine reversibility · whether the other bin's loaded
   tags survive a combine · the "15 of 22" framing and the stale-ship-date note on the carry-over frame.

---

## Conventions

Mobile-first, 390 px frame, HPT dark theme. No live data, no API calls — interactive bits are the row
drawers, the loaded collapse, the cell groups, the category and rig toggles, the collapse demo, and the
links between pages. Personal names are placeholders (`Operator 1..8`), not roster data. Numbers are
illustrative. Design notes sit outside the phone frame; amber call-outs mark what is real today versus
what is a gap.

Stylesheets are split by provenance: `_shared.css` (the rev-2 bar and the four shared primitives),
`_loader_kit.css` (ported from the LEAN canonical), `_supervisor_kit.css` (built to the locked persona
mockup).
