import { getClient } from "./client";
import { getContractAddress } from "./explorer";
import type {
  Wager,
  EvidenceSource,
  Finding,
  Resolution,
  AppealRecord,
  Position,
  CreateWagerInput,
  SubmitFindingInput,
  AppealInput,
} from "./types";

const CONTRACT = () => getContractAddress() as `0x${string}`;

// ─── READ METHODS ───

export async function getWager(wagerId: string): Promise<Wager | null> {
  try {
    const client = getClient();
    const result = await client.readContract({
      address: CONTRACT(),
      functionName: "get_wager",
      args: [wagerId],
    });
    return result as unknown as Wager;
  } catch {
    return null;
  }
}

export async function getSources(wagerId: string): Promise<EvidenceSource[]> {
  try {
    const client = getClient();
    const result = await client.readContract({
      address: CONTRACT(),
      functionName: "get_sources",
      args: [wagerId],
    });
    return (result as unknown as EvidenceSource[]) || [];
  } catch {
    return [];
  }
}

export async function getFindings(wagerId: string): Promise<Finding[]> {
  try {
    const client = getClient();
    const result = await client.readContract({
      address: CONTRACT(),
      functionName: "get_findings",
      args: [wagerId],
    });
    return (result as unknown as Finding[]) || [];
  } catch {
    return [];
  }
}

export async function getResolution(
  wagerId: string
): Promise<Resolution | null> {
  try {
    const client = getClient();
    const result = await client.readContract({
      address: CONTRACT(),
      functionName: "get_resolution",
      args: [wagerId],
    });
    const res = result as unknown as Resolution;
    if (!res || !res.outcome) return null;
    return res;
  } catch {
    return null;
  }
}

export async function getAppeal(
  wagerId: string
): Promise<AppealRecord | null> {
  try {
    const client = getClient();
    const result = await client.readContract({
      address: CONTRACT(),
      functionName: "get_appeal",
      args: [wagerId],
    });
    const appeal = result as unknown as AppealRecord;
    if (!appeal || !appeal.appeal_id) return null;
    return appeal;
  } catch {
    return null;
  }
}

export async function getPosition(
  wagerId: string,
  address: string
): Promise<Position | null> {
  try {
    const client = getClient();
    const result = await client.readContract({
      address: CONTRACT(),
      functionName: "get_position",
      args: [wagerId, address],
    });
    return result as unknown as Position;
  } catch {
    return null;
  }
}

export async function getWagerIdsForAddress(
  address: string
): Promise<string[]> {
  try {
    const client = getClient();
    const result = await client.readContract({
      address: CONTRACT(),
      functionName: "get_wager_ids_for_address",
      args: [address],
    });
    return (result as unknown as string[]) || [];
  } catch {
    return [];
  }
}

export async function getAllWagerIds(): Promise<string[]> {
  try {
    const client = getClient();
    const result = await client.readContract({
      address: CONTRACT(),
      functionName: "get_all_wager_ids",
      args: [],
    });
    return (result as unknown as string[]) || [];
  } catch {
    return [];
  }
}

// ─── WRITE METHODS ───

export async function createWager(input: CreateWagerInput): Promise<string> {
  const client = getClient();
  const sourceDicts = input.sources.map((s) => ({
    source_id: s.source_id,
    source_type: s.source_type,
    label: s.label,
    url: s.url,
    description: s.description,
    required: s.required,
    is_fallback: s.is_fallback,
  }));

  const hash = await client.writeContract({
    address: CONTRACT(),
    functionName: "create_wager",
    args: [
      input.wager_id,
      input.opponent,
      input.title,
      BigInt(input.stake_amount),
      BigInt(input.deadline_unix),
      input.win_condition,
      input.loss_condition,
      input.accepted_proof,
      input.excluded_proof,
      input.resolution_question,
      input.appeal_standard,
      BigInt(input.evidence_window_seconds),
      BigInt(input.appeal_window_seconds),
      sourceDicts,
    ],
    value: BigInt(0),
  });
  return hash;
}

export async function acceptWager(wagerId: string): Promise<string> {
  const client = getClient();
  return client.writeContract({
    address: CONTRACT(),
    functionName: "accept_wager",
    args: [wagerId],
    value: BigInt(0),
  });
}

export async function fundWager(
  wagerId: string,
  stakeAmountWei: bigint
): Promise<string> {
  const client = getClient();
  return client.writeContract({
    address: CONTRACT(),
    functionName: "fund_wager",
    args: [wagerId],
    value: stakeAmountWei,
  });
}

export async function submitSourceFinding(
  input: SubmitFindingInput
): Promise<string> {
  const client = getClient();
  return client.writeContract({
    address: CONTRACT(),
    functionName: "submit_source_finding",
    args: [
      input.wager_id,
      input.finding_id,
      input.source_id,
      input.finding,
      input.evidence_url,
      input.supports_side,
      input.captured_at_claim,
      input.confidence,
    ],
    value: BigInt(0),
  });
}

export async function requestResolution(wagerId: string): Promise<string> {
  const client = getClient();
  return client.writeContract({
    address: CONTRACT(),
    functionName: "request_resolution",
    args: [wagerId],
    value: BigInt(0),
  });
}

export async function appealResolution(input: AppealInput): Promise<string> {
  const client = getClient();
  return client.writeContract({
    address: CONTRACT(),
    functionName: "appeal_resolution",
    args: [
      input.wager_id,
      input.appeal_id,
      input.appeal_category,
      input.appeal_reason,
      input.finding_id,
      input.evidence_url,
    ],
    value: BigInt(0),
  });
}

export async function finalizeWager(wagerId: string): Promise<string> {
  const client = getClient();
  return client.writeContract({
    address: CONTRACT(),
    functionName: "finalize_wager",
    args: [wagerId],
    value: BigInt(0),
  });
}

export async function claimPayout(wagerId: string): Promise<string> {
  const client = getClient();
  return client.writeContract({
    address: CONTRACT(),
    functionName: "claim_payout",
    args: [wagerId],
    value: BigInt(0),
  });
}

export async function claimRefund(wagerId: string): Promise<string> {
  const client = getClient();
  return client.writeContract({
    address: CONTRACT(),
    functionName: "claim_refund",
    args: [wagerId],
    value: BigInt(0),
  });
}

export async function cancelExpiredWager(wagerId: string): Promise<string> {
  const client = getClient();
  return client.writeContract({
    address: CONTRACT(),
    functionName: "cancel_expired_wager",
    args: [wagerId],
    value: BigInt(0),
  });
}
