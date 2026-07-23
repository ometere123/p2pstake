# P2PStake Milestone - Frontend Appeal Audit Trail

## Milestone Scope

This milestone improves the P2PStake frontend audit trail after the accepted appeal-path remediation. The accepted GenLayer contract already exposes `get_resolution_history(wager_id)` for archived/versioned verdicts. This milestone makes that existing on-chain history visible in the app so users and reviewers can inspect prior verdict versions after reopen, appeal, or re-adjudication flows.

No GenLayer contract changes were made in this milestone, and no contract redeploy is required.

## Last Accepted / Reviewed Commit

The last accepted/reviewed commit before this milestone began was:

```text
74781f320ebf37395e5a98a70789550ea52b5735
Fix appeal re-adjudication paths
Jul 12, 2026 10:01:24 +0100
```

## Milestone Head Commit

This milestone covers the new, non-overlapping changes from the accepted commit above through:

```text
af48a8f3594f34993e59acc9dfdaa2cee851f6d0
Show resolution history in wager timeline
Jul 23, 2026 01:10:37 +0100
```

## Immutable GitHub Comparison

https://github.com/ometere123/p2pstake/compare/74781f320ebf37395e5a98a70789550ea52b5735...af48a8f3594f34993e59acc9dfdaa2cee851f6d0

## Changes Included

- Added frontend typing for `ResolutionHistoryEntry`.
- Added a contract client read helper for `get_resolution_history`.
- Updated live wager detail loading to fetch resolution history.
- Updated cached wager store loading to fetch resolution history.
- Displayed archived verdict versions in the wager activity timeline.
- Updated appeal outcome copy from "winner flipped" to "Resolution reversed after fresh adjudication" to accurately describe the accepted contract behavior.
- Added regression coverage confirming the frontend reads and displays versioned resolution history.

## Verification

The milestone was verified with:

```text
npm test
npm run type-check
npm run lint
npm run build
```

All four checks passed.

`genvm-lint check contracts\P2PStake.py` could not be run locally because `genvm-lint` is not installed/recognized in this environment. The contract was not changed in this milestone.

## Evidence

- Repository: https://github.com/ometere123/p2pstake
- Milestone comparison: https://github.com/ometere123/p2pstake/compare/74781f320ebf37395e5a98a70789550ea52b5735...af48a8f3594f34993e59acc9dfdaa2cee851f6d0
- Live app: https://p2pstake.vercel.app/
