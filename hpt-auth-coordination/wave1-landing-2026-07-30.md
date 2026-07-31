# Wave-1 ADP reconciliation landing per sequencing (a)

**Date:** 2026-07-30 (landing) — 2026-07-31 (branch push + CI + draft PR)  
**From:** WIP Processor session `local_da69608c-3fdb-4a93-8dc6-7b2696377ae5` (James Brady, VP Mfg & Ops)  
**To:** hpt-auth extraction session `local_35fa90d4-9da8-44e9-91e9-fb0e07a84fdb`  
**GA row:** GA-WIP-267 (see `wip-processor/GOVERNANCE_ACTIONS.md` on branch `wave1-adp-reconciliation-267`)  
**Scope doc:** https://raw.githubusercontent.com/houstonposttension/hpt-mockup-previews/main/adp-reconciliation-wave1-scope-2026-07-30/scope.md

## Summary

Wave-1 lands two small fixes on WIP Processor `master` before your hpt-auth extraction cuts over:
- `adp_roster.lookup_by_phone` refactored to walk WorkerPhones override → WorkerPhones phone → ADP phone (was ADP-only, minting orphan worker_ids).
- `tagstore.bind_phone` strict non-clobber: never overwrites a stored non-empty `position_id` with an empty string on cross-worker re-registration. Writes a `RegistrationAudit` row (`action=bind_phone_non_clobber`, `result=preserved_cross_worker`) for human review.
- New `tagstore.resolve_worker_field(field, position_id, roster=None)` primitive (override → ADP → default). Single point of enforcement for James's data ownership model locked 2026-07-27.
- `register_v2` rewired to use the refactored primitive path.

## Sequencing rationale (scope §6)

Decision **(a): land Wave-1 in WIP before hpt-auth cutover.**

- hpt-auth extraction (GA-WIP-266, ADR-003) is at Day-1 sandbox pending GitHub repo shell creation. **No production hpt-auth code exists yet.**
- Pilot-blocker fixes cannot wait weeks. Jr. Tapia (live worker whose ADP row lacks a phone) is blocked on every V2 registration attempt.
- Byte-identical bar is preserved by definition when extraction copies whatever is on WIP master at cutover time. The fixes become part of the extracted baseline, not a divergent edit.
- Option (b) delays pilot by the entire hpt-auth extraction cycle (~2–3 weeks). Options (c) and (d) were also declined per scope §6.

## Landing state

- **Wave-1 feature branch:** `wave1-adp-reconciliation-267`
- **Draft PR (against WIP `master`):** [link TBD — will be inserted once opened; do NOT rely on this note for the PR link, check the wip-processor Pull Requests tab]
- **Reviewer subagent pass:** required per WIP CLAUDE.md before Status=DONE (in progress on this session)
- **CI on the feature branch:** deploy.yml triggered — `deploy` job auto-skips on non-master (`if: github.ref == 'refs/heads/master'`), test/lint/secret-scan jobs run
- **Merge status:** James merges tomorrow (2026-08-01). Do NOT rely on this note for merge confirmation — check `wip-processor master` HEAD.

## Post-merge SHA (for your extraction baseline)

**`<TBD-after-James-merges>`** — hpt-auth extraction cuts from this SHA. Fill in after James merges.

## Byte-identical bar

Preserved by construction — extraction is a fresh COPY of post-Wave-1 master, not a rebase of the sandbox onto it. Your extraction routine (per ADR-003) is:
1. Wait for James to merge Wave-1 to `master`.
2. Rebase your extraction shell PR onto post-Wave-1 `master` (fast-forward — no code changes in extraction shell yet).
3. Copy the target files/modules from `wip-processor@post-wave1-master` into `hpt-auth v0.1.0` verbatim.
4. Your v0.1.0 extraction INCLUDES the Wave-1 fixes as part of the baseline copy — no separate merge of Wave-1 into hpt-auth needed.

## No action required from you (yet)

- Do NOT rebase your extraction branch until James confirms the Wave-1 merge (he'll say "merged" or ping this session).
- Do NOT push code into the hpt-auth shell PR before the merge — you'd be diverging from the baseline you'll then re-establish.
- Continue with ADR-003 Day-1 sandbox work that doesn't touch the target files (test scaffolding, CI config, README).

## Source session for questions

`local_da69608c-3fdb-4a93-8dc6-7b2696377ae5` (WIP Processor, James Brady's desktop). Reach out via Cowork session ping or in-person if urgent.

## Cross-references

- Scope: https://raw.githubusercontent.com/houstonposttension/hpt-mockup-previews/main/adp-reconciliation-wave1-scope-2026-07-30/scope.md
- Test plan (Sat 2026-08-02): `adp-wave1-test-plan-2026-08-02/test-plan.md` in this repo
- Related: `[[project_adp_hpt_cloud_data_ownership_2026_07_27]]`, `[[project_hpt_phones_not_kiosks]]`, `[[universal-auth manifest]]` (ADR-003)
