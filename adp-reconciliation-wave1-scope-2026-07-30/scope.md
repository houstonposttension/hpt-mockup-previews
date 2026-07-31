# Wave-1 ADP / HPT-Cloud Reconciliation - Scope

**Owner:** James Brady, VP Manufacturing & Operations
**Date:** 2026-07-30
**Status:** SCOPE ONLY - awaiting James approval before execution.
**Repo:** `houstonposttension/wip-processor` (main branch)

---

## 1. Executive summary

Two ADP / HPT-Cloud reconciliation bugs surfaced in the V2 phone-first pilot on 2026-07-27 (Jr. Tapia case). They violate James's write-through-with-reconciliation ownership model [[project_adp_hpt_cloud_data_ownership_2026_07_27]]. Wave-1 lands a small primitive - "resolve field value" - and a non-clobber rule for `bind_phone`, then proves the loop with a worker-OTP-scan test on a personal phone against HPT Cloud tags [[project_hpt_phones_not_kiosks]]. Scope is ~50 lines of code plus tests and one runbook. Wave-1 lands in WIP Processor **before** the hpt-auth extraction (GA-WIP-266) cutover so the fixes precede the code move and preserve the byte-identical bar. Notification digest, reconciliation engine, and universal-auth worker routes are explicit non-goals.

---

## 2. Current-state map

### 2.1 The two bugs (from V2 flow map, 2026-07-27)

| # | Bug | Site | Symptom in pilot |
|---|---|---|---|
| 1 | `lookup_by_phone` reads ADP only | `adp_roster.py:181-195` | Blank ADP phone silently mints an orphan identity; ignores WorkerPhones override master |
| 2 | `bind_phone` can still blank `position_id` | `tagstore.py:2726-2812` | Re-registration can overwrite a stored `position_id` with `""` when the caller lacks it and no matching stub is present |

Bug 1 is gap G-01 in `outputs/v2-data-flow-map-2026-07-27.md` (Section 3). Bug 2 is gap G-03.

**Partial mitigations already in tree** - do not remove; Wave-1 replaces them with a single primitive:
- `function_app.py:2059-2080` - call-site workaround in `register_v2` that adopts a `position_id` from an own-row match or a supervisor-set phone_override tail match (GA-WIP-181).
- `tagstore.py:2761-2809` - `bind_phone` preserves `position_id` when the stored row's `worker_id` equals the incoming one (GA-WIP-182).

Both patches are conditional. Neither implements the ownership model as a first-class primitive; both leave the underlying `lookup_by_phone` primitive returning wrong data.

### 2.2 Worker-OTP-scan test - setup as it exists today

| Item | State |
|---|---|
| Device | Personal phone, no kiosks [[project_hpt_phones_not_kiosks]] |
| Credential path | Twilio Verify OTP against `FEATURE_WIP_PHONE_FIRST_REGISTRATION_V1` V2 register flow (`function_app.py:1911, 1954`) |
| Tag source | HPT Cloud QR tags (bare GUID payload), `hpt_cloud.py:55-66`, gated by `WIP_HPT_CLOUD_TAGS_V1` (`function_app.py:1380`) |
| Allowlist | `PHONE_FIRST_PILOT_PHONES` HMAC blind-index (`function_app.py:1818, 1861`); James's phone must be added |
| Portal supervisor auth | `PORTAL_PHONE_AUTH_ENABLED` env gate defaults OFF (`blueprints/auth_bp.py:25-28`). Not required for the worker-scan test |
| Scan gate | `/api/scan_event` `function_app.py:1308-1400`, secret X-Scan-Token, per-IP rate limit |

---

## 3. Target-state map

### 3.1 `resolve_worker_field(field, position_id)` primitive

Single function, override -> ADP -> default. Locates in `tagstore.py` (new) or a new `worker_resolver.py` helper. Called from every phone lookup call site.

```
def resolve_worker_field(field, position_id, roster=None):
    # 1. WorkerPhones override (if present + non-empty)
    # 2. ADP roster value
    # 3. static default (empty string or config-defined)
```

For phone lookups specifically, wire this so `lookup_by_phone(phone)` walks:
1. `WorkerPhones.phone_override` last-10 tail match
2. `WorkerPhones.phone` last-10 tail match
3. ADP roster `phone` last-10 tail match
4. None

The reconciliation rule already in `adp_roster.phone_for_key` (override -> ADP with auto-clear on ADP catch-up, `adp_roster.py:142-178`) is the reference behavior; Wave-1 lifts it into a shared primitive.

### 3.2 `bind_phone` non-clobber rule (strict)

Change: **never overwrite a stored non-empty `position_id` with an empty string**, regardless of caller's worker_id. Remove the worker_id-equality condition currently at `tagstore.py:2778-2781`. If the caller has an empty pid and the stored row has one, keep the stored one and audit-log. Do not fail closed - the current abort at `:2809` is retained only for storage errors.

### 3.3 Auth surface posture (unchanged in Wave-1)

- `PORTAL_PHONE_AUTH_ENABLED` stays OFF in prod. Wave-1 does not flip it.
- `FEATURE_WIP_PHONE_FIRST_REGISTRATION_V1` stays ON for the pilot cohort.
- `PHONE_FIRST_PILOT_PHONES` gets James's phone hash added for the test.
- Universal-auth worker routes [[project_universal_auth_model]] are NOT wired in Wave-1.

---

## 4. Wave-1 scope (in production)

### 4.1 In scope

| Change | Files | Est. LoC |
|---|---|---|
| `resolve_worker_field` primitive + `lookup_by_phone_v2` wrapper | `tagstore.py`, `adp_roster.py` | ~30 |
| `bind_phone` strict non-clobber | `tagstore.py:2726-2812` | ~10 |
| Wire `register_phone_lookup` and `register_v2` to new primitive | `function_app.py:1911, 1954` | ~10 |
| Unit tests (Jr. Tapia shape, re-register shape, cross-worker shape) | `tests/test_bind_phone_matrix.py`, `tests/test_phone_first_registration.py` | ~60 |
| GA row filed + reviewer subagent pass | `GOVERNANCE_ACTIONS.md` | 1 row |
| Add James's phone hash to `PHONE_FIRST_PILOT_PHONES` | Key Vault / env | config only |

### 4.2 Explicit non-goals (Wave-2 or later)

- Reconciliation logic engine (nightly demote of override once ADP catches up, beyond the existing auto-clear).
- Notification digest feature [[project_worker_field_gap_notifications_2026_07_13]].
- Universal-auth worker routes / `/auth/blocked` / `/auth/signin` middleware [[project_universal_auth_model]].
- Deactivation gate re-key (G-02 in the flow map). Separate row.
- `WORKER_ID_SALT` fail-closed (G-11). Separate row.
- Any change to Standards & Guidelines library.

---

## 5. Test plan - worker scanning HPT Cloud tags on OTP-approved logins

### 5.1 Concrete test

| Item | Value |
|---|---|
| Worker | James Brady (test principal) |
| Device | James's personal iPhone |
| Tags | 3 HPT Cloud QR tags from a live rebar bundle (bare GUID payloads) |
| URL | `https://hpt-wip-agent.azurewebsites.net/api/register` then `/api/scan` |
| Allowlist state needed | HMAC of James's phone in `PHONE_FIRST_PILOT_PHONES` |
| Feature flags | `FEATURE_WIP_PHONE_FIRST_REGISTRATION_V1=on`, `WIP_HPT_CLOUD_TAGS_V1=on` |
| Credential path | Enter phone -> Twilio Verify OTP -> `register-v2` returns `worker_id` + `device_token` -> stored in localStorage |
| Scan path | `/api/scan` posts to `/api/scan_event` with X-Scan-Token header, body carries `raw` (GUID), `station`, `operator`, `event_type` |

### 5.2 Pass criteria

1. James registers via OTP without a supervisor invite.
2. `register-v2` returns `worker_id` matched to James's ADP `position_id` (his ADP row is populated).
3. `WorkerPhones` row exists with correct `position_id` (not blank).
4. James scans 3 HPT Cloud tags. Each returns `ok:true`.
5. `RegistrationAudit` shows one `self-verify-v2` row; `Events` shows 3 tag rows all keyed by GUID with `source=hpt-cloud`.
6. Re-register on same phone: `position_id` on stored row still equals James's ADP key (non-clobber holds).

### 5.3 Fail criteria (any = STOP + rollback)

- `register-v2` returns `wid` derived from phone rather than `position_id`.
- `WorkerPhones.position_id` becomes empty on re-register.
- Any HPT Cloud tag scan lands as a `RAW:` orphan instead of a GUID tag.

---

## 6. Sequencing decision - hpt-auth collision

**Decision: (a) Land Wave-1 in WIP before hpt-auth cutover.**

Rationale:

- hpt-auth extraction (GA-WIP-266, ADR-003 [[universal-auth manifest]]) is at Day-1 sandbox pending GitHub repo shell creation. **No production hpt-auth code exists yet.**
- Pilot-blocker fixes cannot wait weeks. Jr. Tapia is a live worker.
- Byte-identical bar is preserved by definition when extraction copies whatever is on WIP master at cutover time. The fixes become part of the extracted baseline, not a divergent edit.
- Option (b) delays pilot by the entire hpt-auth extraction cycle (est. 2-3 weeks).
- Option (c) parallel edits violate the byte-identical spirit and create merge pain.
- Option (d) blocks a Day-1 sandbox for a code-freeze reason that doesn't apply pre-shell.

### 6.1 Rebase / merge order

1. Wave-1 branch cuts from current `master` head.
2. Wave-1 merges to `master` first (this task, after James approval).
3. hpt-auth extraction sub-agent rebases its shell PR onto post-Wave-1 `master` before writing any code.
4. hpt-auth v0.1.0 initial extraction includes the Wave-1 fixes as part of the baseline copy.

---

## 7. GA row draft (per Std 68)

Next-free WIP-Processor IDs at 2026-07-30: highest APPROVED on master is **GA-WIP-262**; hpt-auth sub-agent holds **GA-WIP-266**. Wave-1 claims **GA-WIP-267**.

```
| GA-WIP-267 | 2026-07-30 | 62,16,18 | **Two ADP / HPT-Cloud reconciliation pilot-blocker bugs surface every time a V2 phone-first registration lands with a blank ADP phone (Jr. Tapia case, 2026-07-27).** Bug 1: `lookup_by_phone` (`adp_roster.py:181-195`) reads ADP only, ignoring `WorkerPhones.phone_override` and `WorkerPhones.phone`, so any worker whose ADP row lacks a phone falls to an orphan branch that mints a phone-derived `worker_id` disconnected from the ADP `position_id` all prior scans are keyed to. Bug 2: `bind_phone` (`tagstore.py:2726-2812`) preserves `position_id` only under conditional guards (own-row + worker_id equality, GA-WIP-182); cross-worker re-registration paths still write `position_id=""` and destroy the ADP join. Both violate James's data ownership model (override -> ADP -> default with reconciliation) locked 2026-07-27. | Land three coordinated changes on `master` before hpt-auth extraction cuts over: (a) add `resolve_worker_field(field, position_id)` primitive to `tagstore.py` that walks override -> ADP -> default; (b) refactor `lookup_by_phone` to walk WorkerPhones.phone_override -> WorkerPhones.phone -> ADP.phone last-10 tail matches; (c) strengthen `bind_phone` to NEVER blank a stored non-empty `position_id`, unconditionally (remove worker_id equality condition). Wire `register_phone_lookup` and `register_v2` to the new primitive. Add three test shapes: Jr. Tapia (ADP row exists, ADP phone blank), re-register-same-phone, and cross-worker re-register. Add James's phone hash to `PHONE_FIRST_PILOT_PHONES` for the worker-OTP-scan validation test. Rollback: revert PR + un-set James's phone hash; no data migration needed. | P1 | PROPOSED | **Tags:** app:WIP section:Auth feature:v2-registration-reconciliation version:v1 stage:requirements type:bug plain_summary: What: When a worker's ADP record has no phone number, the phone-first sign-up creates a duplicate identity instead of matching the worker; a follow-up sign-up on the same phone can also wipe out the worker's identity link. * Why it matters: The pilot worker's scans get attributed to the wrong identity and their supervisor-set shift, role, and history disappear from view. * If not fixed: Every new pilot worker whose ADP phone is blank arrives as a fresh unknown, and any re-registration risks corrupting the record we already have. * Recommended: Add one shared "look up the field" helper that respects override-then-ADP order, and make the sign-up step never blank out a stored ADP link. /plain_summary Sequenced BEFORE hpt-auth extraction (GA-WIP-266) so the fixes are part of the extraction baseline and the byte-identical bar is preserved. Reviewer subagent pass required per WIP CLAUDE.md before Status=DONE. | James Brady | 2026-08-13 |
```

Note: the plain_summary delimiter above is shown as `*` to comply with the ASCII-only rule for this scope doc. When filed to `GOVERNANCE_ACTIONS.md`, substitute the Std-68 canonical middle-dot delimiter.

---

## 8. Timeline

| Day | Hours | Step |
|---|---|---|
| Day 1 (Wed 2026-07-30) | 0.5 | James reads scope, approves or corrects |
| Day 1 | 1.5 | File GA-WIP-267 as PROPOSED -> APPROVED per chat approval rule |
| Day 2 (Thu 2026-07-31) | 2 | Implement `resolve_worker_field` + `lookup_by_phone` refactor |
| Day 2 | 1 | Implement `bind_phone` strict non-clobber |
| Day 2 | 2 | Write 3 test shapes; run local pytest |
| Day 3 (Fri 2026-08-01) | 1 | Wire callers, run full test suite |
| Day 3 | 1 | Reviewer subagent pass (non-negotiable per WIP CLAUDE.md) |
| Day 3 | 0.5 | Fix any reviewer BLOCKERS |
| Day 3 | 0.5 | Merge to master via `workflow_dispatch` deploy |
| Day 3 | 0.5 | Add James's phone hash to `PHONE_FIRST_PILOT_PHONES` |
| Day 4 (Sat 2026-08-02) | 0.5 | James runs worker-OTP-scan test on his phone against 3 HPT Cloud tags |
| Day 4 | 0.5 | Verify audit rows + no orphans; close GA-WIP-267 as DONE |

**Total build effort: ~10 hours across 4 elapsed days.**

---

## 9. Rollback plan

| Change | Rollback |
|---|---|
| `resolve_worker_field` primitive + `lookup_by_phone` refactor | Revert PR. Old primitive is pure and stateless; no data migration. |
| `bind_phone` strict non-clobber | Revert PR. Existing conditional guards (GA-WIP-181/182) remain in tree. |
| James's phone in `PHONE_FIRST_PILOT_PHONES` | Remove hash from env var; no code change needed. |
| Worker-OTP-scan test data (RegistrationAudit + Events rows) | Leave in place; small volume, aids debugging. |

**Feature-flag gating: NOT required.** The changes are pure primitive replacements with the same signatures. The pilot is already flag-gated by `FEATURE_WIP_PHONE_FIRST_REGISTRATION_V1`. Adding a second flag would double the surface with no benefit; the revert path is a single PR.

---

## 10. Risks (top 5, ranked)

| # | Risk | Mitigation |
|---|---|---|
| 1 | Fix accidentally alters worker_id derivation for existing rows (retroactive attribution change) | Test shapes explicitly cover "existing row keeps its worker_id" case. Primitive is pure; no rewrite of stored `worker_id` occurs. |
| 2 | Cross-worker re-registration edge case (shared phone / recycled number) still bypasses non-clobber | Wave-1 acknowledges the GA-WIP-195 residual - identity adoption still lacks a second factor. Explicitly out of Wave-1 scope; call out in GA row. |
| 3 | Blast radius extends past pilot allowlist if `FEATURE_WIP_PHONE_FIRST_REGISTRATION_V1` is flipped on globally | Do not flip the flag globally in Wave-1. Allowlist stays narrow (James + Jr. Tapia). |
| 4 | ADP roster freshness assumption - if roster is stale, override behavior differs from documented model | ADP roster runbook [[project_adp_roster_runbook_locked_2026_07_09]] alerts already cover stale > 26 h. No Wave-1 change to this. |
| 5 | Twilio Verify quota for the test itself (5 OTPs / 4 h per phone) | James's phone gets one OTP for the test; well within quota. Rate-limit on `_rate_ok` still applies. |

---

## 11. Owed by James - decision list

Under 5 items. Each is a blocking answer required before execution.

1. **APPROVE-SCOPE** - Approve this scope as-is, or note corrections.
2. **APPROVE-267** - Approve GA-WIP-267 row draft (Section 7) for filing.
3. **SEQUENCING** - Confirm decision (a): land Wave-1 in WIP before hpt-auth cutover. If you prefer (b), Wave-1 slides ~2-3 weeks.
4. **TEST-PHONE** - Confirm your personal iPhone is the test device, or name a different pilot worker + phone.
5. **TEST-WINDOW** - Confirm Sat 2026-08-02 for the worker-OTP-scan test, or name an alternate.

---

## Appendix - references

Memories:
[[project_adp_hpt_cloud_data_ownership_2026_07_27]] - the ownership model
[[project_hpt_phones_not_kiosks]] - personal-phone constraint
[[project_universal_auth_model]] - future worker-side auth (NON-goal)
[[project_worker_field_gap_notifications_2026_07_13]] - notification digest (NON-goal)
[[project_adp_active_status_convention_2026_07_27]] - implicit-active convention
[[project_adp_roster_runbook_locked_2026_07_09]] - ADP roster runbook
[[project_adp_hwc_to_wip_role_map_2026_07_27]] - role map
[[project_hpt_portfolio_2026_07_27]] - portfolio + approval model
[[feedback_always_publish_reviewables]] - publishing convention
ADR-003 - hpt-auth bounded context (PROPOSED, sandbox Day-1)

Code cites all relative to `C:\Dev\WIP Processor\`, branch `master`, 2026-07-30 head.
V2 flow map: `outputs/v2-data-flow-map-2026-07-27.md`.
