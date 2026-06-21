# P2PStake Deployment Guide

## Prerequisites

- Node.js 16+
- npm
- GenLayer CLI (`npm install -g genlayer`)
- Vercel account
- MetaMask or compatible injected wallet
- Test GEN tokens (from StudioNet faucet)

## Contract Deployment

```powershell
# 1. Configure CLI for StudioNet
genlayer network studionet

# 2. Verify configuration
genlayer config get

# 3. Create account (if needed)
genlayer account create

# 4. Fund via StudioNet faucet at https://studio.genlayer.com

# 5. Deploy
genlayer deploy --contract contracts/P2PStake.py

# 6. Record the contract address from output

# 7. Verify
genlayer call --contract 0x<ADDRESS> --method get_all_wager_ids
```

## Frontend Deployment

```powershell
# 1. Set environment
copy .env.example .env.local
# Edit .env.local with deployed contract address

# 2. Install and build
npm install
npm run build

# 3. Push to GitHub → Vercel auto-deploys

# 4. Set env vars in Vercel dashboard:
#    NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x...
#    NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
#    NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
#    NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
```

## Post-Deployment Verification

1. Visit `/app/debug` — all 4 env vars green, RPC + contract reachable
2. Connect wallet on `/app` — MetaMask prompts, chain ID 61999
3. Create a test wager on `/app/create` — tx hash links to explorer
4. Contract address in navbar links to explorer

## Redeployment

Contract redeployment creates a new instance. Update the contract address in:
1. `.env.local` locally
2. Vercel environment variables
3. Trigger frontend redeploy
