const ERROR_MESSAGES: Record<string, string> = {
  WAGER_NOT_FOUND: "This wager does not exist.",
  WAGER_ALREADY_EXISTS: "A wager with this ID already exists.",
  INVALID_WAGER_ID: "Wager ID cannot be empty.",
  INVALID_OPPONENT: "Invalid opponent address, or you cannot bet against yourself.",
  INVALID_STAKE_AMOUNT: "Stake amount must be greater than zero, or funding amount does not match.",
  DEADLINE_NOT_FUTURE: "Deadline must be in the future.",
  TITLE_REQUIRED: "Wager title is required.",
  WIN_CONDITION_REQUIRED: "Win condition is required.",
  LOSS_CONDITION_REQUIRED: "Loss condition is required.",
  MISSING_ACCEPTED_PROOF: "Accepted proof rules are required.",
  MISSING_EXCLUDED_PROOF: "Excluded proof rules are required.",
  MISSING_PRIMARY_SOURCE: "At least one primary evidence source is required.",
  INVALID_SOURCE_ID: "Source ID cannot be empty.",
  DUPLICATE_SOURCE_ID: "A source with this ID already exists for this wager.",
  INVALID_SOURCE_TYPE: "Invalid source type.",
  INVALID_SOURCE_LABEL: "Source label cannot be empty.",
  INVALID_SOURCE_URL: "Source URL is required for this source type.",
  INVALID_SOURCE_DESCRIPTION: "Source description cannot be empty.",
  TOO_MANY_SOURCES: "Maximum 5 evidence sources per wager.",
  ONLY_CREATOR: "Only the wager creator can perform this action.",
  ONLY_OPPONENT: "Only the opponent can perform this action.",
  ONLY_PARTICIPANT: "Only wager participants can perform this action.",
  INVALID_STATUS: "This action is not valid in the current wager state.",
  WAGER_ALREADY_FUNDED: "You have already funded your side of this wager.",
  SOURCE_NOT_LOCKED: "This source is not in the locked sources list. Every finding must reference a locked source.",
  INVALID_FINDING_ID: "Finding ID cannot be empty.",
  DUPLICATE_FINDING_ID: "A finding with this ID already exists for this wager.",
  INVALID_FINDING: "Finding text cannot be empty.",
  INVALID_EVIDENCE_URL: "Evidence URL is required for this source type.",
  INVALID_SUPPORT_SIDE: "Supports side must be creator, opponent, refund, or invalid.",
  EVIDENCE_WINDOW_CLOSED: "The evidence submission window has closed.",
  TOO_MANY_FINDINGS: "Maximum 10 findings per wager.",
  RESOLUTION_NOT_READY: "Cannot resolve yet. Check that the deadline has passed, at least one finding exists, and sources are locked.",
  WAGER_ALREADY_RESOLVED: "This wager has already been resolved.",
  NEW_EVIDENCE_REQUIRED: "Submit a new source-tied finding after the appeal before requesting re-resolution.",
  NEW_EVIDENCE_URL_REQUIRED: "New appeal evidence must include a fetchable URL.",
  APPEAL_WINDOW_CLOSED: "The appeal window has expired.",
  APPEAL_WINDOW_STILL_OPEN: "The appeal window has not expired yet. Wait before finalizing.",
  APPEAL_ALREADY_SUBMITTED: "An appeal has already been submitted for this wager.",
  INVALID_APPEAL_BASIS: "Appeal requires a valid category and a non-empty reason.",
  NOTHING_TO_CLAIM: "You are not eligible to claim from this wager.",
  ALREADY_CLAIMED: "You have already claimed your payout.",
  NOT_EXPIRED: "This wager has not been inactive long enough to cancel.",
};

export function parseContractError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  for (const [code, userMessage] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(code)) {
      return userMessage;
    }
  }

  if (message.includes("user rejected") || message.includes("User denied")) {
    return "Transaction was rejected in your wallet.";
  }
  if (message.includes("insufficient funds")) {
    return "Insufficient GEN balance for this transaction.";
  }
  if (message.includes("No injected wallet")) {
    return "No wallet detected. Please install MetaMask.";
  }

  console.error("[P2PStake] Raw contract error:", message);
  const short = message.length > 200 ? message.slice(0, 200) + "..." : message;
  return `Error: ${short}`;
}

export function getErrorCode(error: unknown): string | null {
  const message = error instanceof Error ? error.message : String(error);
  for (const code of Object.keys(ERROR_MESSAGES)) {
    if (message.includes(code)) return code;
  }
  return null;
}
