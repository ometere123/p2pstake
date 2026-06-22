# P2PStake

**Lock the bet. Lock the proof. Let GenLayer settle it.**

**[Live Demo](https://p2pstake.vercel.app/)**

> **TESTNET / STUDIONET ONLY. NOT REAL-MONEY GAMBLING.**
>
> P2PStake is a GenLayer Studionet demo. It is not a real-money gambling product, sportsbook, casino, licensed wagering service, or financial product. Real-value deployment would require legal, compliance, responsible-gambling, age-verification, identity, AML, and jurisdictional review.

---

## What P2PStake Is

P2PStake is a GenLayer-native peer-to-peer wager escrow dApp. Two users lock a plain-English condition, acceptable evidence sources, proof rules, and testnet GEN stakes before an outcome occurs. GenLayer acts as a source-aware AI referee when it is time to settle.

Every bet locks its evidence sources before funding, so settlement is grounded in proof, not vibes.

```
CONDITION → SOURCES LOCKED → FUNDED → EVIDENCE SUBMITTED → GENLAYER REFEREE → APPEAL WINDOW → FINALIZED
```

P2PStake does **not** ask GenLayer to create bets. It asks GenLayer to referee locked terms using source-tied evidence and structured proof rules.

### Source-Locked Evidence Path

When settlement is requested, the contract:

1. Collects user-submitted findings; each must reference a locked source
2. Uses GenLayer nondeterministic web helpers (`gl.nondet.web.get()`) to fetch locked primary and fallback source URLs
3. Passes findings, fetched source content, locked terms, and proof rules to the GenLayer LLM referee via `gl.nondet.exec_prompt()`
4. Compares validator results using `gl.eq_principle.prompt_comparative` (equivalence on outcome + winner + confidence ±15 + source alignment)
5. Stores the fetched source assessment, evidence trace, rule application, ambiguity notes, and manipulation warnings with the verdict

Settlement is rejected unless evidence references locked sources. The Verdict Card displays confidence gauge, source alignment, structured reasoning sections, and consensus method; the full source path is visible after the verdict.

**Core rule: No locked source, no serious bet.**

---

## Why GenLayer

A normal smart contract can lock stakes and release them after a deterministic check. It cannot reliably interpret:

- Plain-English conditions with real-world ambiguity
- Conflicting evidence sources
- Late or missing source updates
- Ambiguous event wording
- Cancellation and postponement rules
- Manipulation concerns
- Source priority and fallback logic

GenLayer consensus reviews the locked terms, proof rules, and source-tied evidence to return a structured, verifiable verdict that the contract can act on.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router, TypeScript strict mode) |
| Styling | Tailwind CSS v4 (`@theme inline`), shadcn/ui v4 |
| Wallet | Direct MetaMask via `window.ethereum` (auto-add/switch StudioNet) |
| GenLayer SDK | genlayer-js 1.1.8 |
| State | Zustand (client), React Hook Form + Zod v4 (forms) |
| Icons | Lucide React |
| Contract | Python Intelligent Contract on GenLayer StudioNet |
| Storage | On-chain only: no backend, no database, no Docker |

---

## Contract

**Contract:** `P2PStake`
**File:** [`contracts/P2PStake.py`](contracts/P2PStake.py)
**Deployed address:** `0x17498774ee3da2bE34565565D377A00A4eA672cD`
**Network:** GenLayer StudioNet (chain ID 61999)
**Explorer:** [View on Explorer](https://explorer-studio.genlayer.com/address/0x17498774ee3da2bE34565565D377A00A4eA672cD)

### Write Methods

| Method | Purpose |
|--------|---------|
| `create_wager` | Create a wager with locked evidence sources and proof rules |
| `accept_wager` | Opponent accepts the locked terms |
| `fund_wager` | Fund one side (payable, sends GEN) |
| `submit_source_finding` | Submit evidence tied to a locked source |
| `request_resolution` | Ask GenLayer validators to settle |
| `appeal_resolution` | Challenge the verdict with new evidence |
| `finalize_wager` | Close the case after the appeal window |
| `claim_payout` | Winner claims total pot |
| `claim_refund` | Both sides claim back (refund/invalid outcome) |
| `cancel_expired_wager` | Cancel stale unaccepted/unfunded wagers |

### View Methods

| Method | Purpose |
|--------|---------|
| `get_wager` | Full wager details |
| `get_sources` | Locked evidence sources for a wager |
| `get_findings` | Submitted source-tied findings |
| `get_resolution` | GenLayer verdict with structured reasoning |
| `get_appeal` | Appeal record |
| `get_position` | Caller's role, funded status, claim status |
| `get_wager_ids_for_address` | Wager IDs for an address |
| `get_all_wager_ids` | All wager IDs on the protocol |

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/app` | Dashboard (wallet-gated) |
| `/app/create` | 6-step Pact Builder with template quick-fill |
| `/app/bets/[betId]` | Bet detail: three-zone Evidence Room |
| `/app/bets/[betId]/appeal` | Appeal flow with 6 outcomes |
| `/app/history` | Wager history |
| `/app/stats` | Protocol statistics (public) |
| `/app/guide` | Demo walkthrough guide (public) |
| `/app/settings` | Session safety, cooling-off, self-exclusion |
| `/app/debug` | Diagnostics and RPC checks (public) |

---

## Settlement Output

GenLayer returns a structured verdict with numeric confidence:

```json
{
  "outcome": "creator_wins | opponent_wins | refund | invalid",
  "winner": "0x...",
  "confidence": 0-100,
  "source_alignment": "strong | partial | weak | conflicting | none",
  "reason": "...",
  "source_fetch_summary": "EVIDENCE: ... | RULES: ... | AMBIGUITY: ... | WARNINGS: ..."
}
```

**Equivalence principle** compares: outcome + winner + confidence (±15 tolerance) + source_alignment.

**Appeal outcomes:** uphold, reverse, refund, invalid, reopen_review, more_evidence_required.

---

## Responsible Use

P2PStake includes visible responsible-use controls:

- Testnet-only and 18+ age acknowledgement gate on first visit
- Cooling-off toggle (5-minute delay before sealing)
- Session timer with 30-minute warning
- Self-exclusion simulation (24 hours, 7 days, or 30 days)
- Blocked wager categories: death, injury, violence, terrorism, crime, doxxing, harassment, self-harm, private individuals, sexual/private-life outcomes, insider information, manipulable events
- Category detection blocks the Create flow in real time
- No chasing-losses copy, no VIP tiers, no stake-size leaderboards, no dark patterns

---

## Setup

```bash
npm install
copy .env.example .env.local      # Windows
# cp .env.example .env.local      # macOS/Linux
npm run dev
```

Set the contract address in `.env.local`:

```
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x17498774ee3da2bE34565565D377A00A4eA672cD
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
```

---

## Deployment

**Frontend:** Push to GitHub, Vercel auto-deploys. Set all 4 environment variables in Vercel dashboard.

**Contract:**

```bash
npm install -g genlayer
genlayer network studionet
genlayer deploy --contract contracts/P2PStake.py
```

---

## Build & Test

```bash
npm run type-check    # TypeScript strict validation
npm run lint          # ESLint
npm run build         # Production build (11 routes)
npm test              # Node test suite
```

---

## Demo Scenario

**Dele bets Victor 5 GEN that the P2PStake landing page will be publicly live before Sunday 9pm WAT.**

| Field | Value |
|-------|-------|
| Primary source | Vercel deployment URL |
| Fallback source | GitHub deployment commit |
| Accepted proof | The public URL loads before the deadline and displays the agreed hero section |
| Excluded proof | Figma files, private preview links, local screenshots, verbal claims |
| Conflict rule | If sources conflict, primary source takes precedence unless fallback has stronger timestamp evidence |
| Cancellation rule | If event is cancelled before deadline, both sides receive a refund |

---

## Known Limitations

- Testnet stakes only: not a real-money gambling product
- Web fetch availability depends on GenLayer runtime support
- Some external sites may block automated fetch
- One appeal per wager in current version
- Contract uses coarse timestamps for lifecycle windows
- User-submitted timestamps in findings are treated as evidence claims, not absolute truth
- Not legal advice

---

*P2PStake is a responsible GenLayer Studionet P2P wager escrow demo with source-locked evidence settlement.*
