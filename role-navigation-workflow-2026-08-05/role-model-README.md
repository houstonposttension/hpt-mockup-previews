# WIP Role & Navigation Workflow — Mockup Set

**Date:** 2026-08-05
**Owner:** design validation for the locked role/navigation spec
**Status:** click-through mockups (HTML/CSS/minimal JS) — no live data, no API calls
**Companion spec:** `docs/spec/role-model-and-navigation-2026-08-05.md` (parallel task)

## What this is

A 9-file click-through demonstrating the WIP application's two-axis role model
(**job function** × **authority level**) and how a signed-in user moves between
roles without re-auth.

The design is **locked** — these mockups are for James (VP Ops) to walk through
and confirm the model matches his mental picture. They are not final visual
design and they do not implement anything real.

## The model in one line

- **10 job functions:** Rebar Fabricator, Loader, Driver, PT, Hardware, Extruder,
  Receiver, Yard, Inventory, Maintenance.
- **5 authority levels:** Worker, Supervisor, Manager, Executive, Auditor.
- **Cross-role functions always in nav for everyone:** Inventory + Maintenance.
- **Landing = primary function's home** for the signed-in user.
- **Function swap:** top-nav dropdown of `assigned_functions[]`; hidden if only
  one function is assigned.
- **Authority swap:** separate "Supervise: OFF / ON" toggle, visible only for
  Supervisor+.
- **Same session** on every swap — instant, no re-auth. Every write logs
  `(home_function, acting_function, authority)`.

## Click-through order

Open `index.html` first, then follow the "Next" link at the bottom of each page.
The top of every page also has crumbs pinned across all 9 files.

1. **`index.html`** — Landing for a Worker with **3 assigned functions** (Rebar,
   Loader, Yard). Function dropdown is drawn **open** so you can see the shape:
   assigned functions on top, cross-role pinned below.
2. **`landing-supervisor.html`** — Same worker but as a **Loading Supervisor**.
   The **Supervise: OFF/ON** toggle appears; default is OFF (worker view).
3. **`function-swap.html`** — The **moment** of swapping Rebar → Loader.
   URL bar transitions `/rebar` → `/load`, content is mid-transition,
   overlay auto-dismisses in ~1.4s to reveal the Loader home.
4. **`inventory-cross-role.html`** — Rebar Worker taps the always-visible
   **Inventory** pill. Content = their assigned count sheet. Banner shows
   `(Rebar Fabricator, Worker) → Acting as (Inventory, Worker)`.
5. **`maintenance-cross-role.html`** — Same worker taps **Maintenance**.
   Content = open work orders from MaintainX. Includes a "+ Submit ticket"
   button auto-tagged with the current station.
6. **`authority-swap.html`** — Supervisor flips **Supervise: ON**. Content
   changes from worker's own queue to team roster + active loads + discrepancy
   queue. Path becomes `/load/supervise`.
7. **`locked-single-role.html`** — A **Driver** with `locked_to_primary = true`.
   Nav has **no function dropdown** (only one function). Inventory + Maintenance
   pills still appear.
8. **`role-hierarchy.html`** — Full model at a glance for exec/manager viewers.
   Matrix of Function × Authority with cross-role rows visually separated.
   Desktop-oriented; also renders on mobile.
9. **`role-model-README.md`** — this file.

## Design conventions used

- **HPT dark theme** — `#14171c` body, `#161a1f` panels, `#f2f4f7` text, matches
  `scan_poc.html` and the existing `outputs/mockups/` set.
- **Accent = CTA green (`#16c060`)** — same as `scan_poc.html`'s `--ok`
  token. Used for the role/nav chrome (function dropdown trigger, "Acting as"
  indicator, primary CTA). Amber `--warn` (`#ffb020`) stays reserved for
  warning states.
- **Blue-soft (`#7da2c9`)** = the Auditor / audit-trail signaling color,
  consistent with existing mockups.
- **Green ok / amber warn / red bad** — same as `scan_poc.html`.
- **Mobile-first** — phone frame is 390 px wide (Chrome-Android S25 territory);
  collapses to full-width on ≤ 480 px. Desktop shows the phone frame centered
  with page-context notes above.
- **Banner** — `(Function, Authority)` in the top-right of every page. When
  operating a cross-role function, banner adds `→ Acting as (X, Y)`.
- **Cross-role rail** — Inventory + Maintenance rendered as pill buttons with a
  pending-item badge count, always directly below the app bar.

## Interactive behavior

- **Function dropdown** — tap the function pill in the top-left; menu opens.
  Tap outside to close. Click any row to navigate to a mockup that represents
  that swap.
- **Supervise toggle** — tap anywhere on the OFF/ON pill on
  `landing-supervisor.html` to jump to `authority-swap.html` (and vice versa).
- **Function-swap animation** — `function-swap.html` shows an overlay ("Swapping
  to Loader …") that auto-dismisses in ~1.4s to reveal the Loader home. This is
  purely visual, no state is stored.
- **No real API calls.** Buttons that would normally submit (e.g., "Start tag",
  "Depart", "+ Submit ticket") have `onclick="return false;"` — clicks are
  swallowed so nothing appears broken.

## How to view

- **Local** — `Ctrl+O` in Chrome (or drag `index.html` into a browser tab).
- **Preview link** — if the repo is private, use `htmlpreview.github.io` as a
  wrapper (`https://htmlpreview.github.io/?<raw-file-url>`). Note: private-repo
  raw URLs require a token; easier to run locally.

## What's deliberately out of scope

- **No governance row** filed from this task — the parallel spec task owns that.
- **No changes to `function_app.py`, `scan_poc.html`,** or any live code.
- **No changes to `PHONE_FIRST_PILOT_PHONES` or `.gitleaksignore`.**
- **No changes to other in-flight worktrees.**
- **Data model prerequisites** (a real `function` field on user records, a
  session-level `acting_function` claim, etc.) are the spec's concern, not
  these mockups'.

## Open items flagged for James

- **Accent color.** Locked to standard HPT CTA green `#16c060` (same as
  `scan_poc.html --ok`). Amber `#ffb020` stays reserved for warning states.
- **Cross-role widget location.** Locked to top-of-screen pill buttons
  directly below the app bar. Reason: always in reach, badge count is
  glanceable, doesn't compete with the primary function's controls at the
  bottom. Revisit if a follow-up shows bottom-tab-bar works better.
- **Executive row in the matrix.** Rendered as a full-width band at the bottom
  of the Function × Authority grid to show it's a portfolio view, not a per-
  function cell. Adjust if you want it as a proper column instead.

## Files in this folder

```
role-navigation-workflow-2026-08-05/
    _shared.css                    # single stylesheet used by all 8 HTML files
    _shared.js                     # dropdown + supervise-toggle behavior
    index.html                     # 1. Landing (worker)
    landing-supervisor.html        # 2. Landing (supervisor)
    function-swap.html             # 3. Function swap in-flight
    inventory-cross-role.html      # 4. Inventory (cross-role)
    maintenance-cross-role.html    # 5. Maintenance (cross-role)
    authority-swap.html            # 6. Authority swap
    locked-single-role.html        # 7. Locked single-role (Driver)
    role-hierarchy.html            # 8. Role tree / matrix
    role-model-README.md           # this file
```
