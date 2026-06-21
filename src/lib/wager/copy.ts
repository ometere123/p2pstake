export const BUTTON_COPY: Record<string, string> = {
  create_wager: "Create Source-Locked Bet",
  seal: "Seal Bet Terms",
  accept_wager: "Accept Pact",
  fund_wager: "Fund My Side",
  submit_source_finding: "Submit Source Finding",
  request_resolution: "Ask GenLayer to Settle",
  appeal_resolution: "Appeal With Evidence",
  finalize_wager: "Finalize Verdict",
  claim_payout: "Claim Payout",
  claim_refund: "Claim Refund",
  cancel_expired_wager: "Cancel Expired Wager",
  open_explorer: "Open in Explorer",
};

export const EMPTY_STATE_COPY = {
  no_sources:
    "This pact cannot be funded yet. Add at least one source both sides agree can prove the outcome.",
  no_findings:
    "No source findings yet. Settlement needs proof tied to the locked sources.",
  resolution_pending:
    "GenLayer is checking the pact, sources, proof rules, and findings. This is not a popularity vote.",
  appeal_open:
    "Appeals require evidence. Disagreement alone is not enough.",
  no_wagers:
    "No wagers yet. Create your first source-locked bet.",
  not_connected:
    "Connect your wallet to view and manage your wagers.",
};

export const TAGLINES = {
  hero: "Lock the bet. Lock the proof. Let GenLayer settle it.",
  sub: "P2PStake lets two people stake GEN behind any clear plain-English condition. Every bet locks its evidence sources before funding, so settlement is based on proof, not vibes.",
  no_source: "No locked source, no serious bet.",
  stake_claim: "Stake the claim. Lock the proof.",
  settles: "GenLayer settles what code alone cannot.",
  evidence_first: "Evidence first. Excuses last.",
  not_live: "The bet is not live until the proof path is locked.",
  every_finding: "Every finding must point to a source.",
  not_sportsbook: "Not a sportsbook. A neutral referee for clear stakes.",
  timestamp_warning:
    "Timestamps submitted in findings are treated as evidence, not automatic truth.",
};

export const APPEAL_OUTCOME_LABELS: Record<string, string> = {
  uphold: "Original resolution upheld",
  reverse: "Resolution reversed — winner flipped",
  refund: "Both sides refunded",
  invalid: "Wager marked invalid",
  reopen_review: "Reopened for new evidence and re-resolution",
  more_evidence_required: "More evidence required before final decision",
};

export const ACTION_DESCRIPTIONS: Record<string, string> = {
  accept_wager: "Review and accept the locked terms and evidence sources.",
  fund_wager: "Send the exact stake amount to lock your side of the wager.",
  submit_source_finding:
    "Submit concrete evidence tied to one of the locked sources.",
  request_resolution:
    "Ask GenLayer validators to judge based on locked terms and submitted findings.",
  appeal_resolution:
    "Challenge the resolution with new evidence or a specific error claim.",
  finalize_wager: "Close the case after the appeal window has passed.",
  claim_payout: "Claim the total pot as the winner.",
  claim_refund: "Claim your original stake back (refund/invalid outcome).",
};
