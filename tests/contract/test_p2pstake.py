"""
P2PStake Contract Test Plan

These tests document expected contract behavior against the deployed
P2PStake contract on GenLayer StudioNet. They can be run with the
genlayer-test framework (pytest + genlayer-py) in integration mode,
or verified manually via the GenLayer CLI.

Contract: 0xD68fA99e5746904aF2919eE69E0ddC36408bf4d2
Network: StudioNet (chain 61999)

Manual CLI verification commands are provided as comments.
"""

# ─── Test Categories ───
#
# 1. CREATE WAGER
#    - requires title, opponent, stake > 0, deadline in future
#    - requires at least one primary source (is_fallback=False)
#    - requires accepted_proof and excluded_proof
#    - rejects duplicate wager_id
#    - rejects opponent == creator
#    - stores sources with locked=False
#
# 2. ACCEPT WAGER
#    - only opponent can accept
#    - state must be INVITED
#    - locks all sources (locked=True)
#    - state becomes ACCEPTED
#
# 3. FUND WAGER
#    - payable: gl.message.value must equal stake_amount
#    - only participants can fund
#    - cannot fund twice (WAGER_ALREADY_FUNDED)
#    - state transitions: ACCEPTED -> CREATOR_FUNDED/OPPONENT_FUNDED -> LOCKED
#
# 4. SUBMIT SOURCE FINDING
#    - source_id must exist in locked sources (SOURCE_NOT_LOCKED)
#    - finding text must not be empty (INVALID_FINDING)
#    - supports_side must be creator/opponent/refund/invalid
#    - evidence_url required for non-manual_witness sources
#    - state must be LOCKED or EVIDENCE_OPEN
#    - rejects after evidence window closes
#    - max 10 findings per wager
#
# 5. REQUEST RESOLUTION
#    - deadline must have passed
#    - at least one finding required
#    - at least one locked source required
#    - state must be LOCKED or EVIDENCE_OPEN
#    - uses gl.eq_principle.prompt_comparative
#    - stores canonical resolution: outcome, winner, confidence, source_alignment
#    - state becomes RESOLVED
#
# 6. APPEAL
#    - state must be RESOLVED
#    - appeal window must be open
#    - valid category required (5 categories)
#    - non-empty reason required
#    - only one appeal per wager
#    - state becomes APPEALED (except reopen_review/more_evidence_required)
#    - reverse re-adjudicates via a second nondet resolution pass (not a mechanical winner flip)
#    - refund/invalid sets winner to none
#    - reopen_review/more_evidence_required archive the prior resolution to
#      resolution history and reopen state to EVIDENCE_OPEN so new source-tied
#      findings can be submitted
#    - request_resolution can re-run after reopen only once a new finding is
#      submitted after the appeal (NEW_EVIDENCE_REQUIRED otherwise)
#
# 7. FINALIZE
#    - state must be RESOLVED or APPEALED
#    - if RESOLVED: appeal window must have passed
#    - if APPEALED: always allowed
#    - state becomes FINALIZED
#
# 8. CLAIM
#    - state must be FINALIZED
#    - winner claims total pot (claim_payout)
#    - refund/invalid: both sides claim original stake (claim_refund)
#    - cannot claim twice (ALREADY_CLAIMED)
#    - non-winner cannot claim (NOTHING_TO_CLAIM)
#
# 9. CANCEL EXPIRED
#    - INVITED: cancellable after 7 days
#    - ACCEPTED/FUNDED: cancellable after 14 days, refunds funded side
#    - state becomes CANCELLED or EXPIRED
#
# 10. VIEW METHODS
#    - get_wager returns full wager dict
#    - get_sources returns list filtered by wager_id
#    - get_findings returns list filtered by wager_id
#    - get_resolution returns dict or empty dict
#    - get_appeal returns dict or empty dict
#    - get_wager_ids_for_address returns list of wager_ids
#    - get_all_wager_ids returns all wager_ids
#    - get_position returns role, funded, claimed, is_participant


# ─── CLI Smoke Test Commands ───
#
# Replace <ADDR> with: 0xD68fA99e5746904aF2919eE69E0ddC36408bf4d2
#
# A. genlayer call --contract <ADDR> --method get_all_wager_ids
#    Expected: [] (empty list on fresh contract)
#
# B. genlayer write --contract <ADDR> --method create_wager \
#      --args "test001" "0xOPPONENT" "Test Wager" 1000000000000000000 \
#      FUTURE_UNIX "Win if X" "Lose if not X" \
#      "Public URL loads" "Screenshots don't count" "" "" 86400 43200 \
#      '[{"source_id":"s1","source_type":"public_url","label":"Test URL","url":"https://example.com","description":"Test source","required":true,"is_fallback":false}]'
#
# C. genlayer call --contract <ADDR> --method get_wager --args "test001"
#    Expected: state=INVITED, creator_funded=false
#
# D. genlayer call --contract <ADDR> --method get_sources --args "test001"
#    Expected: locked=false for all sources
#
# E. genlayer write --contract <ADDR> --method accept_wager --args "test001"
#    (must be called from opponent address)
#
# F. genlayer call --contract <ADDR> --method get_sources --args "test001"
#    Expected: locked=true for all sources
#
# G. genlayer write --contract <ADDR> --method fund_wager --args "test001"
#    --value 1000000000000000000
#    (from creator)
#
# H. genlayer write --contract <ADDR> --method fund_wager --args "test001"
#    --value 1000000000000000000
#    (from opponent)
#
# I. genlayer call --contract <ADDR> --method get_wager --args "test001"
#    Expected: state=LOCKED
#
# J. genlayer write --contract <ADDR> --method submit_source_finding \
#      --args "test001" "f1" "s1" "Page loads correctly" \
#      "https://example.com" "creator" "" "high"
#    Expected: success, state=EVIDENCE_OPEN
#
# K. genlayer write --contract <ADDR> --method submit_source_finding \
#      --args "test001" "f2" "FAKE_SOURCE" "Fake finding" \
#      "https://example.com" "creator" "" "high"
#    Expected: ERROR SOURCE_NOT_LOCKED
#
# L. genlayer write --contract <ADDR> --method request_resolution \
#      --args "test001"
#    If deadline not passed: ERROR RESOLUTION_NOT_READY
#    If deadline passed: success, state=RESOLVED
#
# M. genlayer call --contract <ADDR> --method get_resolution --args "test001"
#    Expected: outcome, winner, confidence, source_alignment, reason
#
# N. genlayer write --contract <ADDR> --method finalize_wager --args "test001"
#    If appeal window still open: ERROR APPEAL_WINDOW_STILL_OPEN
#    If appeal window passed: success, state=FINALIZED
#
# O. genlayer write --contract <ADDR> --method claim_payout --args "test001"
#    Expected: success if caller is winner, state=CLAIMED
