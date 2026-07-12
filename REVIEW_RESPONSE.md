# Response to “More information requested”

Thank you for the focused appeal-path review. The repository has been updated to address each requested item.

## Requested changes addressed

### 1. Clear or version the prior resolution on reopen

- Prior resolutions are archived immediately into `all_resolution_history` when an appeal returns `reopen_review` or `more_evidence_required`.
- `get_resolution_history(wager_id)` exposes the archived versions for audit and UI use.
- The wager returns to `EVIDENCE_OPEN`, preventing finalization of the retained last-known verdict while review is open.
- Re-resolution replaces the active verdict without creating a duplicate history entry.

### 2. Require and fetch new evidence when requested

- A reopened wager cannot be resolved again until a new post-appeal finding exists.
- The new finding must contain a fetchable evidence URL (`NEW_EVIDENCE_REQUIRED` / `NEW_EVIDENCE_URL_REQUIRED`).
- `new_evidence` appeals must include an evidence URL.
- Appeal and post-appeal evidence URLs are fetched with `gl.nondet.web.get()` inside the nondeterministic comparative-consensus callback.
- Reopened submissions remain possible even when the original evidence window has expired.

### 3. Re-adjudicate reversals instead of flipping the winner

- The mechanical winner inversion was removed.
- An upheld reversal now runs a fresh comparative adjudication using locked terms, locked sources, all source-tied findings, the original resolution, the appeal basis, and fetched appeal evidence.
- The fresh adjudication can independently return `creator_wins`, `opponent_wins`, `refund`, or `invalid`.

## Verification

- Contract invariant suite: 11/11 passing.
- Python contract syntax validation: passing.
- TypeScript validation: passing.
- Diff whitespace validation: passing.
- StudioNet end-to-end execution completed for create, accept, both-party funding, source-tied findings, nondeterministic resolution, appeal, finalization, and payout claim.
- The live appeal consensus returned `uphold`; reversal and reopen behavior are therefore verified through repository implementation and regression assertions rather than by forcing a validator outcome.

## Deployment

- Network: GenLayer StudioNet, chain ID `61999`
- Current contract: `0xD68fA99e5746904aF2919eE69E0ddC36408bf4d2`
- Explorer: https://explorer-studio.genlayer.com/address/0xD68fA99e5746904aF2919eE69E0ddC36408bf4d2

Relevant implementation: [`contracts/P2PStake.py`](contracts/P2PStake.py)

