# P2PStake Architecture

## System Overview

Two-tier architecture: browser client + on-chain intelligent contract. No backend.

```
User Browser → genlayer-js → JSON-RPC → GenLayer StudioNet → P2PStake.py
```

## Data Authority

The intelligent contract is the single source of truth for all wager state, evidence sources, source-tied findings, resolution decisions, appeal records, and claim status.

Browser storage (Zustand) is used only for: wallet state, UI step position, form drafts, polling state, tx pending indicators, cached contract reads with TTL invalidation.

## Evidence Architecture

P2PStake uses user-submitted source findings as the mandatory evidence path, and where GenLayer web APIs are available, the contract also attempts to fetch or render locked public primary/fallback sources during resolution.

There is no generic `evidence_packet` string anywhere in this system.

## Timestamp Trust Model

- Contract deadline (`deadline_unix`): authoritative
- Contract time (`int(time.time())`): used for created_at, resolved_at, deadline checks
- User `captured_at_claim`: evidence only, not truth
- Frontend `Date.now()`: display only

## Contract Storage

Flat storage pattern (GenLayer does not support nested generic collections):
- `wagers: TreeMap[str, Wager]`
- `resolutions: TreeMap[str, Resolution]`
- `appeals: TreeMap[str, AppealRecord]`
- `all_wager_ids: DynArray[str]`
- `all_sources: DynArray[EvidenceSource]` (filtered by wager_id)
- `all_findings: DynArray[Finding]` (filtered by wager_id)
- `all_resolution_history: DynArray[ResolutionHistoryEntry]` (filtered by wager_id; archived prior resolutions from re-adjudication/reopen)

## Resolution

Uses `gl.eq_principle.prompt_comparative` with equivalence on: outcome, winner, confidence, source_alignment. The reason field may differ across validators and is not compared.

Path B (optional): contract attempts `gl.nondet.web.get` on public_url and github sources during resolution. If fetch fails, resolves from submitted findings only.
