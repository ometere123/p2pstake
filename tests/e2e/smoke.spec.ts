/**
 * P2PStake E2E Smoke Test Checklist
 *
 * This file documents the manual browser smoke test for the deployed app.
 * Run through each step in order after deploying to Vercel.
 *
 * Prerequisites:
 *   - App deployed to Vercel with contract address set
 *   - Two wallets funded with test GEN on StudioNet (chain 61999)
 *   - MetaMask or compatible injected wallet
 *
 * Full Lifecycle:
 *
 * LANDING PAGE
 * [ ] Visit /: hero loads with "Lock the bet. Lock the proof." copy
 * [ ] "Create Source-Locked Bet" CTA links to /app/create
 * [ ] Demo bet card shows pact/sources/verdict layers
 * [ ] Footer shows contract address linked to explorer
 *
 * DEBUG PAGE
 * [ ] Visit /app/debug: all 4 env vars show green
 * [ ] RPC reachable: green
 * [ ] Contract reachable: green
 * [ ] Wallet info displays after connection
 *
 * WALLET CONNECTION
 * [ ] Click "Connect Wallet" → MetaMask prompts
 * [ ] NetworkPill shows "StudioNet" in green
 * [ ] WalletPill shows truncated address linked to explorer
 * [ ] ContractAddressPill shows truncated address linked to explorer
 * [ ] Disconnect works; returns to connect screen
 *
 * CREATE WAGER (Wallet A = Creator)
 * [ ] Navigate to /app/create
 * [ ] Step 1: creator auto-filled, enter opponent address
 * [ ] Step 2: enter stake amount (e.g. 1 GEN)
 * [ ] Step 3: enter title, win condition, loss condition, deadline
 * [ ] Step 4: add primary source; blocked without one
 * [ ]   - add source with label, type, URL, description
 * [ ]   - optionally add fallback source
 * [ ] Step 5: enter accepted proof and excluded proof; blocked without both
 * [ ] Step 6: review all terms
 * [ ]   - sources listed with primary/fallback labels
 * [ ]   - "Seal Bet Terms" → MetaMask prompts → tx submitted
 * [ ]   - tx hash displayed with explorer link
 * [ ]   - redirects to /app/bets/<wagerId>
 *
 * BET DETAIL PAGE (Three-Zone Layout)
 * [ ] PactSpine (left): shows all locked terms, parties, stake, deadline
 * [ ] EvidenceTheater (center): source lanes render for each source
 * [ ] SettlementRail (right): state=INVITED, no action buttons for creator
 *
 * ACCEPT WAGER (Wallet B = Opponent)
 * [ ] Switch to opponent wallet
 * [ ] Navigate to /app/bets/<wagerId>
 * [ ] SettlementRail shows "Accept Pact" button
 * [ ] Click → MetaMask → tx confirmed
 * [ ] Sources now show "Locked" badge (purple)
 * [ ] State = ACCEPTED
 *
 * FUND (Both Wallets)
 * [ ] Wallet A: "Fund My Side" → sends exact stake → state = CREATOR_FUNDED
 * [ ] Wallet B: "Fund My Side" → sends exact stake → state = LOCKED
 * [ ] PactSpine shows "Terms Locked · Sources Locked · Stake Locked"
 * [ ] Funding checklist shows both sides green
 *
 * SUBMIT SOURCE FINDING (Wallet A)
 * [ ] "Submit Source Finding" button appears
 * [ ] Click → modal opens
 * [ ] Source dropdown shows ONLY locked sources (no free-text)
 * [ ] Fill: source, finding text, evidence URL, supports=creator, confidence
 * [ ] Submit → MetaMask → tx confirmed
 * [ ] Finding card appears in the correct source lane
 * [ ] State = EVIDENCE_OPEN
 *
 * SUBMIT FINDING WITH FAKE SOURCE
 * [ ] Attempt to submit finding with source_id not in locked sources
 * [ ] Expected: error "SOURCE_NOT_LOCKED" displayed
 * [ ] (This may require direct contract call since UI only shows locked sources)
 *
 * RESOLUTION (After Deadline)
 * [ ] Wait for deadline to pass
 * [ ] "Ask GenLayer to Settle" button appears
 * [ ] Click → MetaMask → consensus in progress
 * [ ] VerdictCard appears with: outcome, winner, confidence, source alignment
 * [ ] Source fetch status badge shows attempted/succeeded/failed
 * [ ] State = RESOLVED
 * [ ] Appeal window countdown shows
 *
 * APPEAL (Optional: Wallet B)
 * [ ] "Appeal With Evidence" link appears in settlement rail
 * [ ] Click → appeal page loads with original resolution summary
 * [ ] Select category, enter reason
 * [ ] Submit → MetaMask → tx confirmed
 * [ ] State = APPEALED
 * [ ] Appeal record shows in settlement rail
 *
 * FINALIZE
 * [ ] After appeal window expires (or after appeal):
 * [ ] "Finalize Verdict" button appears
 * [ ] Click → state = FINALIZED
 *
 * CLAIM
 * [ ] Winner: "Claim Payout" button → MetaMask → GEN transferred
 * [ ] OR Refund: both sides see "Claim Refund"
 * [ ] State = CLAIMED
 * [ ] "You have claimed your payout." confirmation shows
 *
 * THROUGHOUT ALL STEPS
 * [ ] Every tx hash links to explorer-studio.genlayer.com/tx/...
 * [ ] Contract address links to explorer-studio.genlayer.com/address/...
 * [ ] No "generic evidence" or "evidence_packet" visible anywhere
 * [ ] "captured_at_claim" labeled as "evidence only, not trusted"
 * [ ] Wrong network shows red warning banner
 * [ ] Missing contract address shows yellow warning banner
 * [ ] Write buttons disabled when wallet disconnected
 */

export {};
