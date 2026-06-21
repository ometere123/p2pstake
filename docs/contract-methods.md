# P2PStake Contract Method Reference

Contract: `0x17498774ee3da2bE34565565D377A00A4eA672cD`
Network: GenLayer StudioNet (chain 61999)

## create_wager

Creates a wager with locked evidence sources.

**Inputs:** wager_id, opponent, title, stake_amount, deadline_unix, win_condition, loss_condition, accepted_proof, excluded_proof, resolution_question, appeal_standard, evidence_window_seconds, appeal_window_seconds, source_list

**Rules:**
- At least one primary source required (MISSING_PRIMARY_SOURCE)
- Max 5 sources (TOO_MANY_SOURCES)
- Deadline must be in future (DEADLINE_NOT_FUTURE)
- Stake must be > 0 (INVALID_STAKE_AMOUNT)
- State → INVITED

## accept_wager

Opponent accepts and locks all sources.

**Inputs:** wager_id
**Rules:** Only opponent, state must be INVITED. All sources set locked=True. State → ACCEPTED.

## fund_wager (payable)

Fund one side. Send exact stake amount as GEN value.

**Inputs:** wager_id (+ gl.message.value)
**Rules:** Value must equal stake_amount. Cannot fund twice. Both funded → LOCKED.

## submit_source_finding

Submit evidence tied to a locked source.

**Inputs:** wager_id, finding_id, source_id, finding, evidence_url, supports_side, captured_at_claim, confidence

**Rules:**
- source_id must exist in locked sources (SOURCE_NOT_LOCKED)
- finding text required (INVALID_FINDING)
- supports_side: creator/opponent/refund/invalid
- Max 10 findings
- State must be LOCKED or EVIDENCE_OPEN

## request_resolution

Ask GenLayer to settle. Uses nondeterministic consensus.

**Inputs:** wager_id
**Rules:** Deadline passed, ≥1 finding, ≥1 locked source. State → RESOLVED.

## appeal_resolution

Challenge with evidence. One appeal per wager.

**Inputs:** wager_id, appeal_id, appeal_category, appeal_reason, finding_id, evidence_url

**Categories:** new_evidence, wrong_source_read, deadline_misread, fraudulent_evidence, condition_misinterpreted

## finalize_wager

Close the case after appeal window.

**Inputs:** wager_id
**Rules:** Appeal window must have passed (if RESOLVED) or appeal completed (if APPEALED). State → FINALIZED.

## claim_payout / claim_refund

Winner claims pot, or both sides claim refund.

**Inputs:** wager_id
**Rules:** State must be FINALIZED. Cannot claim twice.

## cancel_expired_wager

Cancel stale wagers. Refunds funded side if applicable.

**Inputs:** wager_id
**Rules:** INVITED > 7 days → CANCELLED. Funded > 14 days → EXPIRED (with refund).
