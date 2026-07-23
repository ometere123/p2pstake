// Types matching the deployed P2PStake contract exactly

export type SourceType =
  | "public_url"
  | "github"
  | "onchain_tx"
  | "social_post"
  | "document"
  | "manual_witness";

export type SupportsSide = "creator" | "opponent" | "refund" | "invalid";

export type Confidence = "high" | "medium" | "low";

export type SourceAlignment =
  | "strong"
  | "partial"
  | "weak"
  | "conflicting"
  | "none";

export type ResolutionOutcome =
  | "creator_wins"
  | "opponent_wins"
  | "refund"
  | "invalid";

export type AppealCategory =
  | "new_evidence"
  | "wrong_source_read"
  | "deadline_misread"
  | "fraudulent_evidence"
  | "condition_misinterpreted";

export type AppealOutcome = "uphold" | "reverse" | "refund" | "invalid" | "reopen_review" | "more_evidence_required";

export type WagerState =
  | "INVITED"
  | "ACCEPTED"
  | "CREATOR_FUNDED"
  | "OPPONENT_FUNDED"
  | "LOCKED"
  | "EVIDENCE_OPEN"
  | "RESOLVED"
  | "APPEALED"
  | "FINALIZED"
  | "CLAIMED"
  | "CANCELLED"
  | "EXPIRED";

// --- Contract return types (view method dicts) ---

export interface Wager {
  creator: string;
  opponent: string;
  title: string;
  stake_amount: string;
  creator_funded: boolean;
  opponent_funded: boolean;
  deadline_unix: string;
  created_at_unix: string;
  state: WagerState;
  win_condition: string;
  loss_condition: string;
  accepted_proof: string;
  excluded_proof: string;
  resolution_question: string;
  appeal_standard: string;
  evidence_window_seconds: string;
  appeal_window_seconds: string;
  claimed_creator: boolean;
  claimed_opponent: boolean;
}

export interface EvidenceSource {
  wager_id: string;
  source_id: string;
  source_type: SourceType;
  label: string;
  url: string;
  description: string;
  required: boolean;
  is_fallback: boolean;
  locked: boolean;
}

export interface Finding {
  wager_id: string;
  finding_id: string;
  source_id: string;
  submitter: string;
  finding: string;
  evidence_url: string;
  supports_side: SupportsSide;
  captured_at_claim: string;
  confidence: Confidence;
  submitted_at_unix: string;
}

export interface Resolution {
  outcome: ResolutionOutcome;
  winner: "creator" | "opponent" | "none";
  confidence: string; // numeric 0-100 as string from contract
  source_alignment: SourceAlignment;
  reason: string;
  resolved_at_unix: string;
  source_fetch_attempted: boolean;
  source_fetch_succeeded: boolean;
  source_fetch_summary: string; // structured: EVIDENCE: ... | RULES: ... | AMBIGUITY: ... | WARNINGS: ...
}

export type ResolutionHistoryEntry = Resolution;

export interface AppealRecord {
  appeal_id: string;
  appellant: string;
  appeal_category: AppealCategory;
  appeal_reason: string;
  finding_id: string;
  evidence_url: string;
  outcome: AppealOutcome;
  reason: string;
  created_at_unix: string;
}

export interface Position {
  role: "creator" | "opponent" | "none";
  funded: boolean;
  claimed: boolean;
  is_participant: boolean;
}

// --- Composite ---

export interface WagerDetail {
  wager: Wager;
  sources: EvidenceSource[];
  findings: Finding[];
  resolution: Resolution | null;
  resolutionHistory: ResolutionHistoryEntry[];
  appeal: AppealRecord | null;
  position: Position | null;
}

// --- Input types for write methods ---

export interface SourceInput {
  source_id: string;
  source_type: SourceType;
  label: string;
  url: string;
  description: string;
  required: boolean;
  is_fallback: boolean;
}

export interface CreateWagerInput {
  wager_id: string;
  opponent: string;
  title: string;
  stake_amount: bigint;
  deadline_unix: number;
  win_condition: string;
  loss_condition: string;
  accepted_proof: string;
  excluded_proof: string;
  resolution_question: string;
  appeal_standard: string;
  evidence_window_seconds: number;
  appeal_window_seconds: number;
  sources: SourceInput[];
}

export interface SubmitFindingInput {
  wager_id: string;
  finding_id: string;
  source_id: string;
  finding: string;
  evidence_url: string;
  supports_side: SupportsSide;
  captured_at_claim: string;
  confidence: Confidence;
}

export interface AppealInput {
  wager_id: string;
  appeal_id: string;
  appeal_category: AppealCategory;
  appeal_reason: string;
  finding_id: string;
  evidence_url: string;
}
