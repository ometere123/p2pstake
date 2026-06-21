# P2PStake Demo Scenario

## Default Demo

**Dele bets Victor 5 GEN that the P2PStake landing page will be publicly live before Sunday 9pm WAT.**

### Locked Sources

| Source | Type | Role |
|--------|------|------|
| https://p2pstake.vercel.app | public_url | Primary |
| GitHub deployment commit URL | github | Fallback |

### Proof Rules

- **Accepted:** The public URL must load before the deadline and display the agreed P2PStake hero section
- **Excluded:** Figma files, private preview links, local screenshots, and verbal claims do not count

### Source Finding

```
Source: vercel-deploy (primary)
Finding: The page loads and displays the agreed hero section
Supports: creator
Evidence URL: https://p2pstake.vercel.app
```

### Expected Resolution

```json
{
  "outcome": "creator_wins",
  "winner": "creator",
  "confidence": "high",
  "source_alignment": "strong",
  "reason": "The locked public URL supports the condition and no excluded proof was needed."
}
```

## Full Flow Steps

1. Wallet A creates wager with primary source → INVITED
2. Wallet B accepts → ACCEPTED, sources locked
3. Wallet A funds 5 GEN → CREATOR_FUNDED
4. Wallet B funds 5 GEN → LOCKED
5. Wallet A submits source finding tied to primary source → EVIDENCE_OPEN
6. Deadline passes
7. Wallet A requests resolution → RESOLVED (GenLayer consensus)
8. Appeal window passes → finalize → FINALIZED
9. Winner claims 10 GEN → CLAIMED
