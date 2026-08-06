# Role / Navigation — rev 2, "scan-first, one bar"

**Date:** 2026-08-06
**Status:** IDEATION MOCKUP. No production code. Not a locked design.
**Supersedes (as a proposal, not as a decision):** `role-navigation-workflow-2026-08-05/`
**Grounded in:** `docs/spec/role-information-requirements-2026-08-06.md` (the role task-data
requirements audit) and the design discussion of 2026-08-06.

---

## The three decisions this set renders

**1. Screen real estate is the constraint.** The 2026-08-05 set spent three stacked rows of chrome —
app bar, cross-role rail, Supervise toggle — roughly **97 px for a worker and 149 px for a
supervisor** before a single pixel of content. Rev 2 consolidates all three into **one 38 px bar**:
role tabs on the left, cross-role pills and the identity chip on the right. Cross-role items are
icon + badge count only, and when a badge hits **0 the pill collapses to zero width and disappears** —
it does not grey out, it stops costing pixels.

**2. Scan owns the screen.** Every role scans. It is not role-gated content, it is the universal
default landing surface and already is in production (`/api/scan`). So the bar sits *on top of* the
scanner rather than replacing it with a dashboard. Nobody navigates to scan; they are just there, and
the bar is the only thing competing with it for space. The 2026-08-05 set never drew the camera at
all, which is why every one of its screens read like a dashboard.

**3. Task metadata rides with the scan context.** James described three sections — roles / scan / task
metadata. The resolution was **two**: a thin **context strip** directly under the viewport, bound to
whatever is currently in the scanner, plus a **bottom pull-up drawer**, collapsed by default, for the
roles that genuinely need a browsable list. The strip is glanceable and always present; the drawer is
readable and gets out of the way.

---

## Pages

| # | File | What it shows |
|---|---|---|
| 1 | `index.html` | **Rebar Fabricator — quiet.** Both cross-role badges at 0, both pills collapsed out of existence. Camera, context strip, 6-stage row, collapsed drawer. |
| 2 | `rebar-busy.html` | **Rebar Fabricator — busy.** Identical screen with Inventory 3 and a red Maintenance 1 that blocks this worker's station. Includes a live toggle so you can watch the collapse fire. |
| 3 | `loader.html` | **Loader.** Same bar, same strip, same drawer — different verb (*Record scan* → *Scan onto truck*) and the strip's `where` resolves to a truck. |
| 4 | `loader-drawer.html` | **Loader — drawer open.** The punch list pulled up. Never covers the bar; dims rather than replaces the scan surface. |
| 5 | `loader-alarm.html` | **Wrong-bin alarm.** Full-screen blocking interrupt, deliberately *outside* the shared chrome. Two frames: the interrupt, then the Switch / Stay / Stop decision. |
| 6 | `supervisor.html` | **Supervisor authority swap.** Two frames: the authority sheet hanging off the identity chip, then the person-axis team view. No camera, no strip — the roster is the content. |
| 7 | `bar-anatomy.html` | The bar dissected: quiet / busy / crowded, the space budget, what is reused vs new, and the open decisions this set takes a position on. |

Suggested walk order is 1 → 7. Pages 1 and 2 are the pair to look at first — the quiet/busy contrast
is the whole point of the 2026-08-06 discussion.

---

## Shared kit — the four primitives, unchanged

The requirements audit (§9.1) counted component usage across all seven baseline screens and found the
same four already serving every role. Rev 2 invents **no new content primitive**:

| Primitive | Role |
|---|---|
| `.wrow` | list row — every role, all 7 baseline screens |
| `.sectlbl` | section label + count — all 7 |
| `.crosspill` | cross-role pill — all 7 (re-laid-out here, same class and badge) |
| `.card` | detail card — 6 of 7 |

Everything new in `_shared.css` is **chrome**: `.topbar`, `.camwrap`, `.ctxstrip`, `.drawer`,
`.alarm`. No content moved into a new component.

### Two standardisations applied everywhere

- **Progress fraction (C4)** — one formatter, five roles: `done of total` + derived percent, plus a
  bar. Identical in the strip, the drawer, the roster and the punch list.
- **Where / for whom / by when (C3)** — one 3-line context header that resolves per role:
  Rebar `station · bin` → Loader `truck · bin`, and would degrade to `location · — · due` for
  Inventory and `asset · — · ETA` for Maintenance.

### One status vocabulary

The **6-stage lifecycle** — Not Printed / Tag in Office / At Machine / In Staging / On Truck /
Delivered — is used on every screen and nothing else. Production has five overlapping vocabularies;
this one is already the locked cross-surface answer for Bins, the loader's `WIP_LOADER_LIFECYCLE_V2`
view, and the supervisor+lead mockup. **Precondition:** its phase→stage map is currently mirrored in
three files that must stay byte-identical — collapse that duplication before standardising on it.

### The nine things kept role-specific

The audit (§9.5) named nine elements that lose capability if flattened. All nine stay outside the
shared kit here. Two are rendered explicitly: the loader's **wrong-bin alarm** (page 5) and the
**camera viewport**, which is present for the six scan-driven roles and absent for Driver,
Maintenance and the supervisor's person-axis view.

---

## Positions taken on the audit's open questions

| Question | Position |
|---|---|
| §9.3 — `.val` holds percent, fraction *and* severity | **Percent only**, with a unit caption. Severity → `.pill` + row border. |
| §9.4 — five status vocabularies | **6-stage lifecycle everywhere.** |
| Q2 — is a worker↔work assignment model in scope? | **Sidestepped.** "Assigned bins" → "bins I touched today", which is derivable from `events.actor` today. |
| Q4 — presence on the supervisor roster | **Dropped.** No clock-in signal exists; the locked spec records "no software OOO handling". |
| Spec §9.1 vs the old zero-badge pill | **Spec wins, harder** — zero hides the pill *and* reclaims its width. |
| U1 — function vs station | **Independent axes.** Station is the `where` line of the strip, not a bar element. Still needs James's ruling. |

---

## Still unbacked by production data

Carried forward from the audit's gap register, and marked inline on each page:

- **No truck / vehicle entity** anywhere in the model (G4) — "Truck 07" is fiction.
- **No worker↔work assignment model** (G3) — no table, field or endpoint assigns anything to anyone.
- **No `category` field on the tag** (L12) — blocks the punch list and the rebar/tendon split.
- **No close-out gate or approvals store** (L10, L11, S13) — today a partially loaded truck gets no
  gate at all; this is the loader spec's ROI item.
- **No physical location field** (G10) — "bay 2", "bay 3", walk-to hints.
- **No Inventory or Maintenance domain at all** (G1, G2) — so the cross-role badge counts have no
  source yet (G9), and the red "blocks your station" variant additionally needs a WO↔station map.
- **`W-####` / `0421` badge format is undefined** (G14) — production has `worker_id`, `position_id`
  and tenant-only display names.
- **`authority_level` does not exist** in the data model, and supervisor enforcement is staged off
  (`PORTAL_ENFORCE_SUPERVISOR_ROLE` unset → any authenticated principal passes).

Every worker-tier URL shown also needs a **live** Easy Auth `excludedPaths` entry added before it will
load — editing the repo's `auth_v2.json` mirror changes nothing in production.

---

## Conventions

- Mobile-first, 390 px phone frame, HPT dark theme, CTA-green accent — tokens inherited verbatim from
  the 2026-08-05 set, which inherited them from `scan_poc.html`.
- No live data, no API calls. Buttons are inert except for the drawer, the collapse demo on page 2,
  the alarm dismiss, and the links between pages.
- Personal names are placeholders (`Operator 2`…`Operator 5`), not roster data. Numbers are
  illustrative.
- Design notes sit outside the phone frame; amber-bordered call-outs mark what is real today versus
  what is a gap.
