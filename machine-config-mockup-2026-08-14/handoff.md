# Machine Configuration Admin — Wave 0a mockup

**Date:** 2026-08-14 · **Stage:** Wave 0a (mockup) only — no planning docs, no production code.
**Convention:** `feedback-wave-0-mockup-first` (locked 2026-07-29), ADR `2026-08-05-hpt-portfolio-wave0`.

## Why this exists

Machine config (names, capacities, routing rules) currently lives in three files that don't
cross-reference each other: `config.py` (`MACHINE_ORDER`, `MACHINE_CAPACITY`,
`MACHINE_FIELD_IDS`), `docs/reference/machine-capability-matrix-v8.yaml` (routing + scan-station
source of truth), and `config/machine_specs.json` (vendor specs). James wants a UI to edit this
instead of hand-editing files — and, per tonight's incident, wants that UI to surface mapping
conflicts instead of burying them in a docstring.

## What the sample data is

Not invented. Pulled straight from the three files above, as they exist today. The mockup
reconstructs a unified 10-row machine list and finds real, pre-existing conflicts:

- **"Radius" vs "Radius Bender"** — near-identical names, confirmed by James (2026-07-22) to be
  two *different* physical machines. Highest-risk row: a future script that fuzzy-matches names
  would silently merge them.
- **Hyd #11 / Mech #18** — live in the routing engine, but missing from `config.py`'s capacity
  table and from the `scan_stations:` registry entirely. No capacity target, and the Hourly view
  can't classify a scan from either machine today.
- **Big / Small Single Bender** — have a capacity target and a scan station, but are absent from
  the routing engine's `machines:` list (documented GA-WIP-096 gap).
- **22N** — the YAML's own comment claims no vendor spec doc exists; `machine_specs.json` has one
  (`schnell_22n`) with a matching bar range. The comment is stale, not the data.
- **Double Bender** — two unconfirmed vendor-spec candidates (`schnell_rm60_15`, whose model
  designation isn't in Schnell's current catalog, and `krb_14m_bender`, whose max size is
  inferred from the product name only). Neither is confirmed against the actual machine.

Of the 10 rows, only **Shear** is fully reconciled across all four sources. That ratio is
deliberate — it's what the real files show, not a mockup exaggeration.

**If James sends over the authoritative machine list separately, that should replace this sample
data before Wave 0b — this reconstruction is a best-effort read of conflicting files, not a
confirmed source of truth itself.**

## What's interactive

- Add / edit / remove a machine (client-side only; a toast makes clear nothing is written to a
  real file).
- Search + status filter (All / Confirmed / Unconfirmed / Conflict).
- A conflict panel above the table, with cards that jump-and-highlight the relevant row —
  the "surface the conflict, don't hide it" ask from tonight.
- Per-machine "Defined in" checkboxes (`config.py` / routing `machines:` / `scan_stations:` /
  vendor JSON) so a real UI could show — and let a supervisor correct — which files a machine
  should live in.

## Visual DNA

Reused the dark-theme token set and component language already established across this
portfolio's mockups (`--bg #0b0d10`, panel `#161a1f`, green accent `#16c060`, amber warn, red
bad — see `role-navigation-scanfirst-2026-08-06/_shared.css`). No mobile breakpoint work — this
is a supervisor/manager surface, dense-info per Std 40, not a shop-floor scan surface (Std 17).

## Open questions for James

1. Equipment IDs — only Hyd #11 and Mech #18 currently have a real-world tag. Should every
   machine get one, or is that naming convention specific to the two hydraulic/mechanical
   benders?
2. Should this UI be the system of record (writes directly to the three files / a DB), or a
   review layer that generates a diff for a human to commit? Affects Wave 0b's tech-stack call.
3. Who should be able to mark a mapping "confirmed" — any supervisor, or does that require
   sign-off (ties into the ISO 9001 change-control angle Std 40 already touches)?
4. Real machine list — if you're sending over authoritative names/IDs/capacities separately,
   this mockup's sample data should be swapped in before Wave 0b treats it as ground truth.
