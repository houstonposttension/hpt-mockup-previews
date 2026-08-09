# Material Traceability — heat / lot capture screens

**Date:** 2026-08-08 · **rev 3** (rev 1 → rev 2 after two independent reviews; rev 3 after James supplied the real identifier mapping)
**Status:** IDEATION MOCKUP. No production code. Awaiting James's sign-off.
**Governance:** GA-WIP-515 (PROPOSED)
**Companion spec:** `docs/spec/material-traceability-requirements-2026-08-08.md`

**Kit:** `_shared.css`, `_cells_kit.css`, `_loader_kit.css` and `_shared.js` are copied
**byte-identical** (md5-verified) from `outputs/mockups/role-navigation-scanfirst-2026-08-06/` — no
silent fork. `_trace.css` adds the capture components. `_crumbs.js` is this set's own nav. Same 38 px
scan-first bar, same 390 px phone frame, same grounding-note discipline.

---

## Conventions

Following the source set's closing section, stated explicitly:

- **No live data. No API calls. Nothing here talks to a server.**
- **The frames are static.** Only the inherited bottom drawer (`[data-drawer]`, wired by
  `_shared.js`) actually moves. Every new capture control — the three capture-method tiles, the
  either/or selector, the photo slots, the "Change" and "Doesn't match" buttons, the material picker
  — is **depicted, not interactive**: it shows the state it is drawn in and does not respond to taps.
  Read them as frames in a storyboard, not as a prototype.
- **Every name, number, tag, heat, lot, serial, order and timestamp is invented.** Where something
  *is* real — a rule value, a line of code, a station name — it is cited inline.
- **Placeholder identity:** workers appear as 4-digit pseudonyms (`0417`, `0388`, `0512`), matching the
  opaque `worker_id` model (GA-WIP-015). No real names anywhere.

---

## Pages

| # | File | Cell | Frames |
|---|---|---|---|
| 1 | `index.html` | — | Set index, the rule table, and the three verification answers |
| 2 | `rebar-heat.html` | Rebar Fab | **A** hard stop at `seq 1` with the **Serial / Heat** either-or · **B** capture → echo → unblock, heat pending resolution · **C** `seq 2` inherited read-only |
| 3 | `hardware-heat.html` | Hardware | **A** `Anchor` — Date Code, one control, no picker · **B** `Wedges` — Date Code, plus why neither can be verified yet |
| 4 | `pt-heat.html` | PT | **A** shift-start material state (3 photo slots + vision) · **B** the 95% run case, inherited · **C** lot change with position marker |
| 5 | `extrusion-heat.html` | Extrusion | **A** run-setup material lots — **PROPOSAL TO EXTRUSION LOG, not a WIP screen** |

9 phone frames across 4 capture pages.

---

## What changed in rev 3 — the identifier-type model

**James supplied the real per-material mapping on 2026-08-08, and it resolved Q9 by rejecting its
premise.** Rev 2 had asked whether `Batch` could just be mapped onto `Lot`. The answer is no — and
there is a fifth type nobody had modelled.

| Item type | Captured identifier | Changed from rev 2 |
|---|---|---|
| `Rebar` | **Serial** *or* **Heat** — serial links to heat | was Heat only |
| `Anchor` | **Date Code** | was `HEAT_OR_BATCH` either/or |
| `Wedges` | **Date Code** | was Batch/Lot/Date |
| `Coil` → `Tendon` | **Serial** — links to heat | was Heat **and** Serial |
| `Resin` | **Lot** | unchanged |
| `Grease` | **Batch** | was Batch/Lot/Date |
| `Colorant` | **Lot** | was Batch/Lot/Date |

Three consequences worth reading before the frames:

**1 — Only two item types involve a heat at all, and both reach it indirectly.** `Rebar` and `Coil`
capture a **Serial**, which resolves to a heat at verification time via the index's `ParentItemId`
(spec §2.4). The worker is never asked for both. This is why `rebar-heat.html` frame B now shows the
heat as *pending lookup* rather than as something typed.

**2 — Hardware lost its either/or and gained an honest dead end.** Both hardware types are Date Code,
so frame A has one control and no picker. But the Cert Identifier Index models only
`Heat`/`Serial`/`Lot` — so **nothing this cell captures can be verified today.** Frame B draws that
as `unverifiable_type`, deliberately a *different* status from `unmatched`, so the metric measures a
schema gap rather than blaming the floor.

**3 — Capture and cert-completeness are now two columns, because they are two questions.** Four rows
genuinely disagree (spec §2.3): CertProcessor requires `HEAT_OR_BATCH` for anchors and
`Batch/Lot/Date` for wedges, and `DateCode` — a real column — is *warn-only* on anchors and absent
from the wedge rule entirely. Neither side is wrong. The gate enforces capture; the sweep evaluates
cert completeness.

**This needs a CertProcessor change, and it is bigger than an enum.** 9 sites, 3 structural
(`atomic_identifiers()` and `index_cert()` each take exactly three identifier lists), plus a live
SharePoint choice-column edit on an existing list. And the harder half: the source column
`Batch_x002f_Lot_x002f_Date_x002f` conflates the very three types the mapping separates, so the
parser cannot mechanically emit the right one. Spec §6.5.1, tracked as **Q9a** (enum + parser) and
**Q9b** (source columns).

---

## What changed in rev 2

Two independent reviewers went over the set and the spec. Three findings changed the work rather than
just correcting it:

**1 — `pt-heat.html` was redrawn from scratch.** Rev 1 drew per-roll scan/type capture for PT. That is
precisely the design `uncovered-work-cells-2026-08-07.md` **ADR §3.3.1 formally rejected** one day
earlier, on the grounds that at 30–50 orders a shift *"it would be skipped — and skipped traceability
is worse than none, because it looks complete."* PT now renders that spec's ratified model: heats set
**once per shift** by photo + vision extraction, **inherited** by every order, re-captured only at a
**lot change** with a position marker. The spec gained §3.6 delegating PT's mechanism, dropped `pt`
from `TRACEABILITY_BY_CELL`, and removed PT from P0.

**2 — "Wedges have no heat number" was wrong.** CertProcessor does not *require* heat for wedges; that
is not the same as none existing. `uncovered-work-cells-2026-08-07.md` records *"wedge heats, captured
by photo"* (`:98`) and `pt_material_state.wedge_heat` (`:685`). Corrected to: a heat does not satisfy
the wedge **cert rule** — batch/lot/date does. Spec §0.1.

**3 — The Extrusion argument quoted `config.py` truncated at the clause that undercut it.** The same
comment continues *"It stays VISIBLE on the Hourly page as a `scanning_yet: false` 'coming soon'
station… This list gates emission; the registry gates display."* Extrusion **is** still a registered,
displayed station. The narrower true claim — it emits no events, so an `OP_FINISHED` gate has nothing
to hang on — is what both the page and spec §5.3 now make.

Also: ~12 line-number citations corrected, Colorant given a capture affordance it was missing,
an honesty note added to the Extrusion page, glove-height targets applied, and the
caret-plus-committed-echo contradiction removed.

---

## What the code forced on the brief

**1 — it is a *cert identifier*, not a heat number.** Which identifier is a property of the item type,
per CertProcessor's own rule table (`_System/enforce_completeness_gate.py:58-95`). Four of the seven
in-scope types are not satisfied by a heat.

**2 — a WIP tag has no PO.** The `tags` upsert (`tagstore.py:1084-1088`) writes `order_num`, an HPT
Cloud *sales* order. CertProcessor's `PO + HeatNumber` filter cannot be reused as-is.

**3 — the gate must not call CertProcessor inline.** Both existing systems verify asynchronously.
Every frame shows verification as a *pending* pill, never as a spinner the worker waits on.

**4 — PT already had a ratified, contrary design.** See above.

---

## Design rules applied on every capture frame

| Rule | Why |
|---|---|
| The hard stop is a **disabled CTA with a named reason**, shown *before* the tap | An error after the tap teaches the worker nothing and wastes the scan |
| **Reuse-last is the largest secondary target**, never the small one | A worker cutting 40 bars from one bundle will not retype the heat 40 times. Design it small and the gate gets defeated by mistyping instead. `capture_method` is recorded so a station running 95% `reused` is visible before an auditor finds it |
| The captured value is **echoed at full size** before the CTA re-enables | A mistyped heat that passes the gate is *worse* than a blocked scan — it is a false traceability record |
| Downstream steps **display, never re-ask** | Re-typing at `seq 2` adds a second chance to typo and creates a "which one is right?" question with no good answer. A mismatch is **flagged**, not overwritten |
| No cert document is ever shown | WIP holds identifiers and a `ParentItemId` pointer only — documents stay in SharePoint (spec §7.3) |
| ≥ 56 px glove-friendly targets on every capture control | Uses the kit's own `.btn.glove` (`_cells_kit.css:130`) |

**Not claimed:** these frames are **English only**. The inherited `ES` chip in the camera overlay is
kit furniture, not a bilingual implementation — and three frames have no camera at all. The production
screens must be bilingual (the rest of the kit is); this set does not demonstrate it.

---

## Grounding

Every rule value on these frames is copied from CertProcessor, not invented:

| Frame | Source |
|---|---|
| **All seven captured identifiers** | **James, 2026-08-08** — authoritative for capture, not derived from code |
| `Rebar` cert rule → `HeatNumber`; `SERIAL_REQUIRED` excludes Rebar | `_System/enforce_completeness_gate.py:63-66`; `pipeline_constants.py:79-82` |
| `Anchor` cert rule → `HEAT_OR_BATCH`; `DateCode` warn-only | `:67-70`, `:69` |
| `Wedges` cert rule → `Batch_x002f_Lot_x002f_Date_x002f`; `DateCode` not even in warn | `:79-82` |
| `Tendon` cert rule → `HeatNumber` + `SerialNumbers` | `:59-62` |
| `DateCode` is a real column | `FIELD_LABELS["DateCode"] = "Date Code"`, `:126` |
| index models 3 types | `identifier_parser.py:26`; `create_cert_identifier_index.py:39-40` |
| `Coil` is not a `MaterialType`; `_SUM_SERIAL` is "the coil pattern" → Serial | `pipeline_constants.py:34-45`; `identifier_parser.py:22, 60-73` |
| serial format `PCS-00418, PCS-00418-1, …` | `C:\Dev\Extrusion Log\REQUIREMENTS.md:126` |
| `seq 1 = SHEAR`, `seq 2 = BENDER` | `tagstore.py:1055-1069` |
| station → work centre (`"22N"` → `BENDER`) | `scan_events.py:70-86`, `:64` |
| the block the gate rides along on | `function_app.py:1462-1511` |
| PT shift-state model, lot change, position marker | `docs/spec/uncovered-work-cells-2026-08-07.md` §3.3, ADRs 3.3.1–3.3.3 |
| photo capture primitive | `POST /api/photo-upload`, `function_app.py:1327` (GA-WIP-025) |

**What has no data behind it.** No heat, lot or batch field exists anywhere in WIP Processor today —
no `tag_cert_link` table, no capture UI, no integration of any kind with CertProcessor. There is no
hardware kit schema, no `pt_material_state` entity, no crew entity, no vision extraction, no order
resolver. Both PT stations (`PT Atlas`, `Hayes`) are in the v8 registry but **not** in
`config.SCAN_STATIONS`, so they emit zero events and `/pt` does not exist — **PT capture cannot ship
before PT scanning does.**

---

## Extrusion — why frame 5 is labelled a proposal

James believed the existing Extrusion spec might already cover this. Verified against both artefacts:

- ✅ **The data model covers it thoroughly**, and predates this work by roughly seven weeks.
  `extrusion.run_cert_link` stores `cert_key_type` in `'heat','serial','lot','batch'` with
  `reconcile_status`, M:N against the run (`C:\Dev\Extrusion Log\sql\001_extrusion_schema.sql:166-180`).
  It is a *more complete* traceability model than the one proposed for WIP.
- ❌ **The operator mockup captures no identifier at all.** `C:\Dev\hpt-mockups\extrusion-log-2026-07-10\`
  is 9 files — **5 operator frames**, 3 supervisor frames, an index. A grep for
  `heat|lot|batch|serial|cert` across all nine returns two hits, both the **Start notes** free-text box
  in `operator-02-run-setup.html` (`:187`, `:207`) — *"free-text for lot numbers / setup issues."* A
  notes box cannot be validated, indexed, or written to `cert_key_value`. So `run_cert_link` is a
  well-designed table with **no operator-facing writer**.
- ⚠️ **Extrusion emits no WIP events** — though it *is* still a registered, displayed station.
  `config.py:61-69` (GA-WIP-192, James, 2026-07-23) removed it from `SCAN_STATIONS` because *"emitting
  here would create orphan events"*, while keeping it visible via the `scan_stations` registry:
  *"This list gates emission; the registry gates display."*

So the frame is drawn — the gap is real — but it belongs in
`C:\Dev\Extrusion Log\GOVERNANCE_ACTIONS.md`, which a WIP session must not create. Spec §12 **Q6**.

---

## Open, and visible on the frames

- **Q7** — how does a scanned Hardware component resolve to its `MaterialType`? One kit consumes
  `Anchor` (either/or) and `Wedges` (batch only), and the gate must know which rule applies *before*
  it renders the sheet. No component→`MaterialType` mapping exists in WIP; `work_center_for("Hardware")`
  falls through to `"HARDWARE"` with no per-component routing. `hardware-heat.html` renders its
  item-type labels with a `?` so the unresolved thing looks unresolved.
- **Q9a / Q9b** (blocking) — the index models 3 identifier types, the floor has 5. Adding `Batch` and
  `Date Code` is 9 sites with 3 structural, plus a live SP choice-column change (Q9a); and the source
  column conflates the types so the parser cannot emit them correctly (Q9b). Until both land, every
  wedge, anchor and grease capture is `unverifiable_type` — drawn on `hardware-heat.html` frame B.
- **Q13** — is `Coil` the same as `MaterialType = "Tendon"`? Treated as such here (spec §2.5) rather
  than inventing a tenth material type on inference.
- **Q1/Q2** (blocking) — is the Cert Identifier Index actually populated in production, and without a
  PO to scope with, how ambiguous is a real lookup? The `pending` → `verified` transition every frame
  shows depends on both.
- **Q10/Q11** — how `pt_material_state` and `tag_cert_link` reconcile, and whether PT's anchor/wedge
  heat capture is the same event as Hardware's.
