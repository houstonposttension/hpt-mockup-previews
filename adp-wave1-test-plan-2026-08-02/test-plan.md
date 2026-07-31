# Wave-1 ADP / HPT-Cloud Reconciliation - Worker OTP + Scan Test Plan

| Field | Value |
|---|---|
| Test date | **Saturday, 2026-08-02** (target 10:00 CT) |
| Owner | James Brady, VP Manufacturing & Operations |
| Branch under test | `wave1-adp-reconciliation-267` |
| Governance row | **GA-WIP-267** (Wave-1 ADP / HPT-Cloud reconciliation) |
| Scope doc | https://raw.githubusercontent.com/houstonposttension/hpt-mockup-previews/main/adp-reconciliation-wave1-scope-2026-07-30/scope.md |
| Repo under test | `houstonposttension/wip-processor` |
| Feature flags | `FEATURE_WIP_PHONE_FIRST_REGISTRATION_V1=on` · `WIP_HPT_CLOUD_TAGS_V1=on` |
| Endpoints | `https://hpt-wip-agent.azurewebsites.net/api/register` · `/api/scan` |

Wave-1 lands the `resolve_worker_field(field, position_id)` primitive plus a strict `bind_phone` non-clobber rule. This test proves the loop on a real production worker whose ADP row previously exposed the two bugs described in scope §2.1.

---

## Table of contents

1. [Proposed pilot user](#1-proposed-pilot-user)
2. [Second device - shop-side supervisor phone](#2-second-device---shop-side-supervisor-phone)
3. [Step-by-step test script](#3-step-by-step-test-script)
4. [Pass criteria](#4-pass-criteria)
5. [Fail criteria + rollback trigger](#5-fail-criteria--rollback-trigger)
6. [Rollback steps](#6-rollback-steps)
7. [Escalation path](#7-escalation-path)
8. [Appendix - references](#8-appendix---references)

---

## 1. Proposed pilot user

**Candidate: Jr. Tapia (ADP position_id `RP6000229`, shift 1, phone `+18324049539`)** - the same live production worker whose 2026-07-27 registration case exposed both bugs the Wave-1 fix is intended to close.

Rationale · his ADP row is populated (position_id present) · his `WorkerPhones` row already carries an override history under the GA-WIP-181/182 conditional workaround · he has prior HPT Cloud scan history under the same shift · replaying his exact case against the new primitive is the strongest possible signal that the fix is doing what it claims.

Source of record · `docs/proposals/worker-shift-clear-diagnostic-2026-07-24.md` and `outputs/shift-restoration-residual-review-2026-07-24.md` in `houstonposttension/wip-processor` (master head 2026-07-30). No test/fixture roster found in-repo; the position_id and phone above come from checked-in restoration tables that James himself signed.

> **Mark: TBD-James-to-confirm.** Live-worker Saturday tests need Jr. Tapia's verbal opt-in and his availability on 2026-08-02. If Jr. is off or declines, next candidates on same shift with populated position_ids: Marino Ortiz (`RP6000194`), Nery Alvarado (`RP6000060`), Rigoberto Reyna (`RP6000208`). **James Brady's own account is explicitly excluded** - the whole point is to validate on a worker whose ADP row exposed the bug, not the person who wrote the fix.

---

## 2. Second device - shop-side supervisor phone

**Recommended: Ricki Abney Jr (`RP6000055`, phone `+12818318219`)** as the second observation vantage.

Rationale · Ricki is one of five active shop-floor leads in `config/supervisors.yaml` (`is_lead: true`, all four supervisor scopes granted, consent_at 2026-07-20) · his phone is already in the supervisor roster with a Twilio Verify consent record · he is the closest analog to Jr. Tapia's shift-1 vantage on the rebar yard side.

Note on James's shortlist · James wrote "Donnie or Ricki or your call." Donnie Tadlock is the **Maintenance department / MaintainX admin** (per `api/maintainx-v1.yaml` and `specs/maintainx-integration-2026-06-18.md`) - not a shop-side production supervisor and not in `config/supervisors.yaml`. Ricki is the operationally correct default for a **shop-side** vantage on a rebar-yard scan test. If James still prefers Donnie for organizational reasons, the plan works either way - the second device only needs to render the registration + scan responses on a phone that is not the pilot worker's.

> **Mark: TBD-James-to-confirm** - Ricki's opt-in for a Saturday 10:00 CT observation slot. James may redirect to Donnie; the flow is identical either way.

---

## 3. Step-by-step test script

Preflight (James, before Saturday) · confirm branch `wave1-adp-reconciliation-267` is merged to master · confirm `FEATURE_WIP_PHONE_FIRST_REGISTRATION_V1` and `WIP_HPT_CLOUD_TAGS_V1` are both `on` in `hpt-wip-agent` app settings · confirm 3 HPT Cloud QR tags are physically on a live rebar bundle staged near the yard.

1. **Allowlist the pilot phone.** James adds the HMAC blind-index of the pilot worker's phone hash to `PHONE_FIRST_PILOT_PHONES` in Key Vault (or Function App settings). Confirm the value shows up in `function_app.py:1818, 1861` allowlist check via a quick log tail.
2. **Allowlist the second device.** James adds the HMAC blind-index of the supervisor's phone hash to the same `PHONE_FIRST_PILOT_PHONES` list (both hashes in one comma-separated blob).
3. **Both open the register page.** Pilot worker taps `https://hpt-wip-agent.azurewebsites.net/api/register` on his personal phone (no kiosk, no supervisor invite). Supervisor opens the same URL on the shop-side device.
4. **OTP round-trip (both devices).** Each enters their phone number - Twilio Verify sends OTP - each enters their OTP - `register-v2` responds with `worker_id` and `device_token` (stored to browser localStorage).
5. **Scan 3 HPT Cloud QR tags (each device).** Each opens `/api/scan` and captures three bare-GUID QR payloads from the staged rebar bundle. Each scan posts to `/api/scan_event` with the `X-Scan-Token` header, body `{raw, station, operator, event_type}`.
6. **James verifies via query** (Azure Table query or the workers portal, whichever is faster):
   - (a) **Override path** - `WorkerPhones.position_id` for BOTH phones equals each caller's ADP `position_id` (proves `lookup_by_phone` walked WorkerPhones override -> phone -> ADP correctly, per scope §3.1).
   - (b) **Non-clobber path** - re-register from BOTH phones (repeat step 4 for each). Confirm `WorkerPhones.position_id` on both stored rows is **unchanged** afterward (proves the strict `bind_phone` non-clobber holds, per scope §3.2).
   - (c) **Event integrity** - `Events` table shows exactly 6 rows keyed by GUID with `source=hpt-cloud`; `RegistrationAudit` shows two `self-verify-v2` rows (one per device) and zero equality-guard-clear rows.

Recommended cadence: run steps 3-5 on the pilot worker's phone first; then repeat on the supervisor's phone as an A/B pass so both devices exercise the same registration and scan surface within the same 15-minute window.

---

## 4. Pass criteria

Mirrors scope §5.2. All criteria must be true on **both** devices for the run to be called green.

1. Each caller registers via OTP without a supervisor invite.
2. `register-v2` returns `worker_id` matched to each caller's ADP `position_id`.
3. `WorkerPhones` row exists for each caller with correct `position_id` (**not blank**).
4. All 6 HPT Cloud tag scans (3 per device) return `ok:true`.
5. `RegistrationAudit` shows two `self-verify-v2` rows (one per caller) and zero equality-guard-clear rows · `Events` shows 6 tag rows all keyed by GUID with `source=hpt-cloud`.
6. Re-register on same phone (each device) - `position_id` on the stored row still equals each caller's ADP key (non-clobber holds).

**Green A/B** = both devices (pilot worker's personal phone + supervisor's shop-side phone) complete the flow, `position_id` resolves correctly on both, no orphan `worker_id` is minted on either, and no `RAW:` fallbacks appear in `Events` for either.

---

## 5. Fail criteria + rollback trigger

Mirrors scope §5.3. **Any single failure on either device is a rollback trigger - not "investigate first."**

- Any orphan `worker_id` minted (either device).
- `WorkerPhones.position_id` becomes empty on re-register (non-clobber broke, either device).
- Any HPT Cloud tag scan lands as a `RAW:` orphan instead of a GUID tag (either device).

**Any fail -> immediate revert PR.** No hot-fix in place, no "let me just check one more thing." The Wave-1 changes are pure primitive replacements with the same signatures (scope §9); revert is safe and stateless.

---

## 6. Rollback steps

1. **Revert the merge.** Open the Wave-1 PR in GitHub and click **Revert** on the merged commit. Merge the auto-generated revert PR to `master`. Trigger the `workflow_dispatch` deploy to `hpt-wip-agent`.
2. **Un-allowlist both test phones.** Remove the pilot worker's AND the supervisor's phone hashes from `PHONE_FIRST_PILOT_PHONES` (Key Vault or Function App settings). This closes the OTP path for both testers cleanly - the accounts are not damaged, only the allowlist entries.
3. **Confirm pilot-cohort flag is still ON.** Verify `FEATURE_WIP_PHONE_FIRST_REGISTRATION_V1` is still `on` for the existing pilot cohort. The rollback removes the Wave-1 fix, **not** the pilot flag - the pre-Wave-1 GA-WIP-181/182 conditional workarounds remain in tree and continue to guard existing pilot users.

No data migration is required. `RegistrationAudit` and `Events` rows from the test remain in place as debugging aids.

---

## 7. Escalation path

If the test breaks at 10:00 CT Saturday and cannot be resolved on the spot, James texts (in order):

1. **Ops on-call** - **TBD-James-to-confirm** (name + cell). Suggest: whoever holds the WIP Processor pager rotation for the 2026-08-02 weekend. If no formal rotation is documented, default to the shift-1 lead supervisor on-call for the yard.
2. **Wave-1 implementation context** lives in Cowork session `local_da69608c-3fdb-4a93-8dc6-7b2696377ae5` on James's desktop. Any engineer picking this up should reopen that session first - it has the full scope, the branch diff, and the reasoning trail behind every code change.
3. **Notify hpt-auth session on rollback.** If a fail triggers §6 rollback, the hpt-auth extraction session `local_35fa90d4-9da8-44e9-91e9-fb0e07a84fdb` on their cutover PR (branch `feat/hpt-auth-extraction`, cut from same base master `ad96938`) **must be notified before they re-baseline**. Their sequencing note assumes Wave-1 is on master; a reverted-Wave-1 master would make their post-merge rebase adopt a post-revert tree that no longer contains the fix. Post to their coordination note at `hpt-mockup-previews/hpt-auth-coordination/wave1-landing-2026-07-30.md` with the revert SHA before they cut their next baseline.
4. **Reviewer sub-agent trail** - `GOVERNANCE_ACTIONS.md` row GA-WIP-267 in `wip-processor` carries the reviewer sub-agent pass notes and the merge SHA - use those to correlate against the deploy that broke.

If rollback per §6 completes cleanly, no user-facing escalation is required beyond a Slack note to the pilot cohort that OTP registration is temporarily disabled for the two test phones until Wave-1 v2 is prepared. hpt-auth still needs the notification in step 3 above.

---

## 8. Appendix - references

- Wave-1 scope · `adp-reconciliation-wave1-scope-2026-07-30/scope.md` (this repo)
- V2 flow map · `outputs/v2-data-flow-map-2026-07-27.md` in `houstonposttension/wip-processor`
- Supervisor roster · `config/supervisors.yaml` in `houstonposttension/wip-processor`
- Backfill history for pilot worker's phone -> position_id · `scripts/backfill_worker_position_ids_2026-07-11.py`
- Original Jr. Tapia case · `docs/proposals/worker-shift-clear-diagnostic-2026-07-24.md` and `outputs/shift-restoration-residual-review-2026-07-24.md`
- Governance row · GA-WIP-267 in `GOVERNANCE_ACTIONS.md` on `wip-processor` master
- hpt-auth coordination note · `hpt-mockup-previews/hpt-auth-coordination/wave1-landing-2026-07-30.md`
