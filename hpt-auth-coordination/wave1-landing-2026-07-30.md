# Wave-1 ADP reconciliation — landing status for hpt-auth session

**Date:** 2026-07-30 (landing) — 2026-07-31 (branch push + CI + draft PR)
**From:** WIP Processor session `local_da69608c-3fdb-4a93-8dc6-7b2696377ae5` (James Brady, VP Mfg & Ops)
**To:** hpt-auth extraction session `local_35fa90d4-9da8-44e9-91e9-fb0e07a84fdb`
**GA row:** GA-WIP-267 (see `wip-processor/GOVERNANCE_ACTIONS.md` on branch `wave1-adp-reconciliation-267`)
**Scope doc:** https://raw.githubusercontent.com/houstonposttension/hpt-mockup-previews/main/adp-reconciliation-wave1-scope-2026-07-30/scope.md

## Landing state (crisp)

| Field | Value |
|---|---|
| Wave-1 branch | `wave1-adp-reconciliation-267` (cut from master `ad969382831f9f4495f269cf389e4e181922100e` — short `ad96938`) |
| Base your rebase against | `ad96938` (same master SHA your `feat/hpt-auth-extraction` was cut from) |
| Draft PR against `master` | **[link TBD — inserted once opened; check the wip-processor Pull Requests tab if this line is still a placeholder when you read it]** |
| CI on feature branch | deploy.yml triggered — `deploy` job auto-skips on non-master (`if: github.ref == 'refs/heads/master'`), test/lint/secret-scan jobs run |
| Reviewer subagent pass | required per WIP CLAUDE.md before Status=DONE (in progress on the WIP session) |
| Merge timing | **NOT tonight. Not tomorrow. Expected post-Saturday 2026-08-02 A/B validation.** James merges only after the worker-OTP-scan test on the pilot worker's phone AND the second device (shop-side supervisor) both come back green per scope §5.2. |
| Post-merge master SHA | **`<TBD-after-James-merges>`** — hpt-auth extraction cuts from this SHA. Fill in after James merges. |

## Summary of what Wave-1 lands

- `adp_roster.lookup_by_phone` refactored to walk WorkerPhones override → WorkerPhones phone → ADP phone (was ADP-only, minting orphan worker_ids).
- `tagstore.bind_phone` strict non-clobber: never overwrites a stored non-empty `position_id` with an empty string on cross-worker re-registration. Preserves the same-worker equality guard (load-bearing for `scripts/reconcile_workers_apply.py`) and writes a `RegistrationAudit` row (`action=bind_phone_non_clobber`, `result=preserved_cross_worker`) on cross-worker preserve.
- New `tagstore.resolve_worker_field(field, position_id, roster=None)` primitive (override → ADP → default). Single point of enforcement for James's data ownership model locked 2026-07-27.
- `register_phone_lookup` and `register_v2` rewired to use the refactored primitive path.

## Sequencing rationale (scope §6)

Decision **(a): land Wave-1 in WIP before hpt-auth cutover.**

- hpt-auth extraction (GA-WIP-266, ADR-003) is at Day-1 sandbox pending GitHub repo shell creation. **No production hpt-auth code exists yet.**
- Pilot-blocker fixes cannot wait weeks. Jr. Tapia (live worker whose ADP row lacks a phone) is blocked on every V2 registration attempt.
- Byte-identical bar is preserved by definition when extraction copies whatever is on WIP master at cutover time. The fixes become part of the extracted baseline, not a divergent edit.
- Option (b) delays pilot by the entire hpt-auth extraction cycle (~2–3 weeks). Options (c) and (d) were also declined per scope §6.

## Action for hpt-auth session

- **Wait for James's merge.** The merge WILL NOT happen tonight or before Saturday 2026-08-02. James merges only after the Saturday A/B validation test (worker-OTP-scan on pilot worker + shop-side supervisor phone, per `adp-wave1-test-plan-2026-08-02/test-plan.md` in this repo) comes back green per scope §5.2.
- **Do NOT rebase `feat/hpt-auth-extraction` before that merge.** Your branch is cut from the SAME base master `ad96938` — rebasing before Wave-1 lands doesn't help you (Wave-1 changes aren't on master yet); rebasing after Wave-1 lands is the sequenced hand-off.
- **After James merges Wave-1 to master:** cut / rebase `feat/hpt-auth-extraction` from the new post-merge master SHA (recorded above once known). Byte-identical bar holds by construction — hpt-auth extraction is a fresh COPY of post-Wave-1 master, not a merge of Wave-1 into hpt-auth. So your v0.1.0 extraction INCLUDES the Wave-1 fixes as part of the baseline copy, no separate Wave-1 merge into hpt-auth needed.
- **Do NOT push code into your extraction shell PR before the merge** — you'd be diverging from the baseline you'll then re-establish.
- **Continue with ADR-003 Day-1 sandbox work that doesn't touch the target files** — test scaffolding, CI config, README are safe.

## Rollback contingency

If the Saturday 2026-08-02 A/B validation FAILS (any of scope §5.3), James reverts the Wave-1 merge (revert PR through GitHub UI, no data migration). In that case:

- The reverted-Wave-1 master SHA will be posted here as a follow-up. Wait for that post before you re-baseline.
- Rebasing `feat/hpt-auth-extraction` against reverted-Wave-1 master would adopt a post-revert tree that no longer contains the Wave-1 fix. Do NOT rebase into that.
- Wave-1 v2 will be prepared with the fail signal folded in and re-tested. hpt-auth extraction stays on the pre-Wave-1 baseline until then.

## Source session for questions

`local_da69608c-3fdb-4a93-8dc6-7b2696377ae5` (WIP Processor, James Brady's desktop). Reach out via Cowork session ping or in-person if urgent. Do NOT try to reach James directly outside business hours — the session log has enough context to answer most questions and prevents pager-fatigue on his end.

## Cross-references

- Scope: https://raw.githubusercontent.com/houstonposttension/hpt-mockup-previews/main/adp-reconciliation-wave1-scope-2026-07-30/scope.md
- Test plan (Sat 2026-08-02): `adp-wave1-test-plan-2026-08-02/test-plan.md` in this repo
- Related memories: `[[project_adp_hpt_cloud_data_ownership_2026_07_27]]`, `[[project_hpt_phones_not_kiosks]]`, `[[universal-auth manifest]]` (ADR-003)
