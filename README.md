# P2PStake

**Plain english bets. Source-locked evidence. GenLayer settlement.**

P2PStake is a GenLayer-native peer-to-peer wager escrow where two people lock stakes behind a plain-English condition, lock acceptable evidence sources before funding, submit source-tied findings after the deadline, and let GenLayer consensus decide the winner when reality is messy.

## Why GenLayer

Normal smart contracts can hold funds, but they cannot understand a human bet. P2PStake uses GenLayer's Intelligent Contracts to adjudicate plain-English conditions using locked terms, locked sources, and decentralized AI-validator consensus.

If you remove the GenLayer logo, the product still obviously needs GenLayer — because the app is not just holding funds, it is adjudicating a human condition using locked terms, locked sources, and decentralized judgement.

## Why Source-Locked Evidence

P2PStake avoids generic evidence packets. Each bet locks evidence sources before funding, and every finding must reference one of those sources. GenLayer settlement is performed against the locked terms, sources, proof rules, deadline, and submitted source-tied findings.

The core rule: **No locked source, no serious bet.**

## Architecture

```
Frontend (Next.js on Vercel)  ←→  GenLayer StudioNet (P2PStake.py)
```

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Zustand, genlayer-js 1.1.8
- **Contract:** Single Python Intelligent Contract deployed to GenLayer StudioNet
- **No backend, no database, no Docker** — the contract is the single source of truth

## Deployed Contract

- **Address:** `0x6eD42480D4011a1cc4e5078f5351Fa0CfC873B8f`
- **Network:** GenLayer StudioNet (chain ID 61999)
- **Explorer:** [View on Explorer](https://explorer-studio.genlayer.com/address/0x6eD42480D4011a1cc4e5078f5351Fa0CfC873B8f)

## Contract Methods

### Write Methods
| Method | Purpose |
|--------|---------|
| `create_wager` | Create a wager with locked evidence sources |
| `accept_wager` | Opponent accepts — sources lock |
| `fund_wager` | Fund one side (payable, sends GEN) |
| `submit_source_finding` | Submit evidence tied to a locked source |
| `request_resolution` | Ask GenLayer validators to settle |
| `appeal_resolution` | Challenge resolution with evidence |
| `finalize_wager` | Close the case after appeal window |
| `claim_payout` | Winner claims total pot |
| `claim_refund` | Both sides claim back (refund/invalid) |
| `cancel_expired_wager` | Cancel stale unaccepted/unfunded wagers |

### View Methods
| Method | Purpose |
|--------|---------|
| `get_wager` | Get full wager details |
| `get_sources` | Get locked evidence sources |
| `get_findings` | Get submitted source-tied findings |
| `get_resolution` | Get GenLayer verdict |
| `get_appeal` | Get appeal record |
| `get_position` | Get caller's role/funded/claimed status |
| `get_wager_ids_for_address` | List wager IDs for an address |
| `get_all_wager_ids` | List all wager IDs |

## Frontend Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/app` | Dashboard (wallet-gated) |
| `/app/create` | 6-step Pact Builder |
| `/app/bets/[betId]` | Bet detail / Evidence Room (three-zone layout) |
| `/app/bets/[betId]/appeal` | Appeal flow |
| `/app/debug` | Diagnostics (no wallet required) |
| `/app/guide` | Demo guide (no wallet required) |
| `/app/history` | Wager history |
| `/app/settings` | User settings |

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local`:
   ```
   copy .env.example .env.local
   ```
3. Set the contract address in `.env.local`:
   ```
   NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x6eD42480D4011a1cc4e5078f5351Fa0CfC873B8f
   NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
   NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
   NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Run development server:
   ```
   npm run dev
   ```
6. Open http://localhost:3000

## Deployment

### Frontend (Vercel)
```
npm run build
```
Push to GitHub → Vercel auto-deploys. Set all 4 environment variables in Vercel dashboard.

### Contract (GenLayer StudioNet)
```
npm install -g genlayer
genlayer network studionet
genlayer deploy --contract contracts/P2PStake.py
```

## Demo Scenario

**Dele bets Victor 5 GEN that the P2PStake landing page will be publicly live before Sunday 9pm WAT.**

- **Primary source:** Vercel deployment URL
- **Fallback source:** GitHub deployment commit
- **Accepted proof:** The public URL loads before the deadline and displays the agreed hero section
- **Excluded proof:** Figma files, private preview links, local screenshots, and verbal claims do not count

## Testing

```
npm run type-check    # TypeScript validation
npm run build         # Production build
npm run lint          # ESLint
```

See `tests/contract/test_p2pstake.py` for contract test plan and CLI smoke test commands.
See `tests/e2e/smoke.spec.ts` for browser smoke test checklist.

## Known Limitations

- Testnet stakes only — not a real-money gambling product
- Not legal advice
- Not available for illegal or harmful wagers
- Source timestamps may be evidence claims, not absolute truth
- Web fetch/render availability depends on GenLayer environment support
- Some external sites may block automated fetch or render
- Appeal mechanics are simplified for demo (one appeal per wager)
- P2PStake does not trust frontend time — the wager deadline is locked in the contract, user-submitted timestamps are treated as evidence claims, not truth
