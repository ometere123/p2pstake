# v0.2.18
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
from dataclasses import dataclass
import json
import time


VALID_SOURCE_TYPES = [
    "public_url",
    "github",
    "onchain_tx",
    "social_post",
    "document",
    "manual_witness",
]

VALID_SUPPORT_SIDES = ["creator", "opponent", "refund", "invalid"]
VALID_CONFIDENCE = ["high", "medium", "low"]
VALID_OUTCOMES = ["creator_wins", "opponent_wins", "refund", "invalid"]
VALID_WINNERS = ["creator", "opponent", "none"]
VALID_ALIGNMENTS = ["strong", "partial", "weak", "conflicting", "none"]

VALID_APPEAL_CATEGORIES = [
    "new_evidence",
    "wrong_source_read",
    "deadline_misread",
    "fraudulent_evidence",
    "condition_misinterpreted",
]

VALID_APPEAL_OUTCOMES = ["uphold", "reverse", "refund", "invalid", "reopen_review", "more_evidence_required"]

MAX_SOURCES_PER_WAGER = 5
MAX_FINDINGS_PER_WAGER = 10
MAX_REASON_CHARS = 240
MAX_FETCH_SUMMARY_CHARS = 900
MAX_TEXT_CHARS = 1200

EXPIRY_INVITED_SECONDS = 604800
EXPIRY_FUNDING_SECONDS = 1209600
DEFAULT_EVIDENCE_WINDOW = 86400
DEFAULT_APPEAL_WINDOW = 43200


@gl.evm.contract_interface
class _Recipient:
    class View:
        pass

    class Write:
        pass


@allow_storage
@dataclass
class EvidenceSource:
    wager_id: str
    source_id: str
    source_type: str
    label: str
    url: str
    description: str
    required: bool
    is_fallback: bool
    locked: bool


@allow_storage
@dataclass
class Finding:
    wager_id: str
    finding_id: str
    source_id: str
    submitter: Address
    finding: str
    evidence_url: str
    supports_side: str
    captured_at_claim: str
    confidence: str
    submitted_at_unix: u256


@allow_storage
@dataclass
class Resolution:
    outcome: str
    winner: str
    confidence: str
    source_alignment: str
    reason: str
    resolved_at_unix: u256
    source_fetch_attempted: bool
    source_fetch_succeeded: bool
    source_fetch_summary: str


@allow_storage
@dataclass
class AppealRecord:
    appeal_id: str
    appellant: Address
    appeal_category: str
    appeal_reason: str
    finding_id: str
    evidence_url: str
    outcome: str
    reason: str
    created_at_unix: u256


@allow_storage
@dataclass
class Wager:
    creator: Address
    opponent: Address
    title: str
    stake_amount: u256
    creator_funded: bool
    opponent_funded: bool
    deadline_unix: u256
    created_at_unix: u256
    state: str
    win_condition: str
    loss_condition: str
    accepted_proof: str
    excluded_proof: str
    resolution_question: str
    appeal_standard: str
    evidence_window_seconds: u256
    appeal_window_seconds: u256
    claimed_creator: bool
    claimed_opponent: bool


class P2PStake(gl.Contract):
    wagers: TreeMap[str, Wager]
    resolutions: TreeMap[str, Resolution]
    appeals: TreeMap[str, AppealRecord]

    # Flat storage arrays.
    # Do not use TreeMap[str, DynArray[T]] in this GenLayer runner.
    all_wager_ids: DynArray[str]
    all_sources: DynArray[EvidenceSource]
    all_findings: DynArray[Finding]

    def __init__(self) -> None:
        # GenLayer storage fields are declared as class-level annotations.
        # Do not initialize TreeMap or DynArray storage manually here.
        pass

    def _now(self) -> int:
        return int(time.time())

    def _require(self, condition: bool, error: str) -> None:
        if not condition:
            raise gl.vm.UserError(error)

    def _truncate(self, value: str, limit: int) -> str:
        text = str(value)
        if len(text) <= limit:
            return text
        return text[:limit]

    def _get_wager(self, wager_id: str) -> Wager:
        self._require(wager_id in self.wagers, "WAGER_NOT_FOUND")
        return self.wagers[wager_id]

    def _is_participant(self, wager: Wager) -> bool:
        caller = gl.message.sender_address
        return caller == wager.creator or caller == wager.opponent

    def _caller_role(self, wager: Wager) -> str:
        caller = gl.message.sender_address
        if caller == wager.creator:
            return "creator"
        if caller == wager.opponent:
            return "opponent"
        return "none"

    def _send_value(self, recipient: Address, amount: u256) -> None:
        _Recipient(recipient).emit_transfer(value=amount)

    def _normalize_reason(self, reason: str) -> str:
        cleaned = self._truncate(str(reason), MAX_REASON_CHARS)
        if cleaned == "":
            return "No reason provided."
        return cleaned

    def _source_count_for_wager(self, wager_id: str) -> int:
        count = 0
        for src in self.all_sources:
            if src.wager_id == wager_id:
                count += 1
        return count

    def _finding_count_for_wager(self, wager_id: str) -> int:
        count = 0
        for item in self.all_findings:
            if item.wager_id == wager_id:
                count += 1
        return count

    def _source_id_exists_for_wager(self, wager_id: str, source_id: str) -> bool:
        for src in self.all_sources:
            if src.wager_id == wager_id and src.source_id == source_id:
                return True
        return False

    def _locked_source_exists(self, wager_id: str, source_id: str) -> bool:
        for src in self.all_sources:
            if src.wager_id == wager_id and src.source_id == source_id and src.locked:
                return True
        return False

    def _has_locked_source(self, wager_id: str) -> bool:
        for src in self.all_sources:
            if src.wager_id == wager_id and src.locked:
                return True
        return False

    def _get_source_type(self, wager_id: str, source_id: str) -> str:
        for src in self.all_sources:
            if src.wager_id == wager_id and src.source_id == source_id:
                return src.source_type
        return ""

    def _finding_id_exists(self, wager_id: str, finding_id: str) -> bool:
        for item in self.all_findings:
            if item.wager_id == wager_id and item.finding_id == finding_id:
                return True
        return False

    def _lock_sources_for_wager(self, wager_id: str) -> None:
        for index in range(len(self.all_sources)):
            src = self.all_sources[index]
            if src.wager_id == wager_id:
                self.all_sources[index] = EvidenceSource(
                    wager_id=src.wager_id,
                    source_id=src.source_id,
                    source_type=src.source_type,
                    label=src.label,
                    url=src.url,
                    description=src.description,
                    required=src.required,
                    is_fallback=src.is_fallback,
                    locked=True,
                )

    def _sources_text_for_wager(self, wager_id: str) -> str:
        text = ""
        for src in self.all_sources:
            if src.wager_id == wager_id:
                role = "fallback" if src.is_fallback else "primary"
                text += (
                    f"- source_id={src.source_id}; type={src.source_type}; "
                    f"label={src.label}; url={src.url}; role={role}; "
                    f"required={src.required}; description={src.description}\n"
                )
        return text

    def _findings_text_for_wager(self, wager_id: str, wager: Wager) -> str:
        text = ""
        for item in self.all_findings:
            if item.wager_id == wager_id:
                submitter_role = "creator" if item.submitter == wager.creator else "opponent"
                text += (
                    f"- finding_id={item.finding_id}; submitted_by={submitter_role}; "
                    f"source_id={item.source_id}; supports={item.supports_side}; "
                    f"finding={item.finding}; evidence_url={item.evidence_url}; "
                    f"captured_at_claim={item.captured_at_claim} "
                    f"(evidence_only_not_trusted_truth); confidence={item.confidence}\n"
                )
        return text

    def _fetch_summary_for_wager(self, wager_id: str) -> str:
        fetch_results = []

        for src in self.all_sources:
            if src.wager_id == wager_id:
                if src.source_type in ["public_url", "github"] and src.url != "":
                    try:
                        response = gl.nondet.web.get(src.url)
                        body = response.body.decode("utf-8")[:600]
                        fetch_results.append(f"{src.source_id}: fetched. snippet={body}")
                    except Exception:
                        fetch_results.append(f"{src.source_id}: fetch_failed. rely_on_findings.")
                else:
                    fetch_results.append(f"{src.source_id}: fetch_not_applicable.")

        return self._truncate("; ".join(fetch_results), MAX_FETCH_SUMMARY_CHARS)

    def _fetch_attempted_for_wager(self, wager_id: str) -> bool:
        for src in self.all_sources:
            if src.wager_id == wager_id and src.source_type in ["public_url", "github"] and src.url != "":
                return True
        return False

    @gl.public.write
    def create_wager(
        self,
        wager_id: str,
        opponent: str,
        title: str,
        stake_amount: u256,
        deadline_unix: u256,
        win_condition: str,
        loss_condition: str,
        accepted_proof: str,
        excluded_proof: str,
        resolution_question: str,
        appeal_standard: str,
        evidence_window_seconds: u256,
        appeal_window_seconds: u256,
        source_list: list,
    ) -> None:
        caller = gl.message.sender_address
        opponent_addr = Address(opponent)

        self._require(wager_id != "", "INVALID_WAGER_ID")
        self._require(wager_id not in self.wagers, "WAGER_ALREADY_EXISTS")
        self._require(opponent != "", "INVALID_OPPONENT")
        self._require(opponent_addr != caller, "INVALID_OPPONENT")
        self._require(title != "", "TITLE_REQUIRED")
        self._require(stake_amount > u256(0), "INVALID_STAKE_AMOUNT")
        self._require(int(deadline_unix) > self._now(), "DEADLINE_NOT_FUTURE")
        self._require(win_condition != "", "WIN_CONDITION_REQUIRED")
        self._require(loss_condition != "", "LOSS_CONDITION_REQUIRED")
        self._require(accepted_proof != "", "MISSING_ACCEPTED_PROOF")
        self._require(excluded_proof != "", "MISSING_EXCLUDED_PROOF")
        self._require(len(source_list) >= 1, "MISSING_PRIMARY_SOURCE")
        self._require(len(source_list) <= MAX_SOURCES_PER_WAGER, "TOO_MANY_SOURCES")

        has_primary = False

        for item in source_list:
            source_id = str(item.get("source_id", ""))
            source_type = str(item.get("source_type", ""))
            label = str(item.get("label", ""))
            url = str(item.get("url", ""))
            description = str(item.get("description", ""))
            required = bool(item.get("required", True))
            is_fallback = bool(item.get("is_fallback", False))

            self._require(source_id != "", "INVALID_SOURCE_ID")
            self._require(not self._source_id_exists_for_wager(wager_id, source_id), "DUPLICATE_SOURCE_ID")
            self._require(source_type in VALID_SOURCE_TYPES, "INVALID_SOURCE_TYPE")
            self._require(label != "", "INVALID_SOURCE_LABEL")
            self._require(description != "", "INVALID_SOURCE_DESCRIPTION")

            if source_type != "manual_witness":
                self._require(url != "", "INVALID_SOURCE_URL")

            if not is_fallback:
                has_primary = True

            self.all_sources.append(EvidenceSource(
                wager_id=wager_id,
                source_id=source_id,
                source_type=source_type,
                label=self._truncate(label, MAX_TEXT_CHARS),
                url=self._truncate(url, MAX_TEXT_CHARS),
                description=self._truncate(description, MAX_TEXT_CHARS),
                required=required,
                is_fallback=is_fallback,
                locked=False,
            ))

        self._require(has_primary, "MISSING_PRIMARY_SOURCE")

        evidence_window = evidence_window_seconds
        if int(evidence_window_seconds) <= 0:
            evidence_window = u256(DEFAULT_EVIDENCE_WINDOW)

        appeal_window = appeal_window_seconds
        if int(appeal_window_seconds) <= 0:
            appeal_window = u256(DEFAULT_APPEAL_WINDOW)

        final_resolution_question = resolution_question
        if final_resolution_question == "":
            final_resolution_question = (
                "Did the creator satisfy the locked win condition before the deadline "
                "using the accepted locked evidence sources?"
            )

        final_appeal_standard = appeal_standard
        if final_appeal_standard == "":
            final_appeal_standard = (
                "Appeals must show new evidence, a wrong source read, a deadline misread, "
                "fraudulent evidence, or condition misinterpretation."
            )

        self.wagers[wager_id] = Wager(
            creator=caller,
            opponent=opponent_addr,
            title=self._truncate(title, MAX_TEXT_CHARS),
            stake_amount=stake_amount,
            creator_funded=False,
            opponent_funded=False,
            deadline_unix=deadline_unix,
            created_at_unix=u256(self._now()),
            state="INVITED",
            win_condition=self._truncate(win_condition, MAX_TEXT_CHARS),
            loss_condition=self._truncate(loss_condition, MAX_TEXT_CHARS),
            accepted_proof=self._truncate(accepted_proof, MAX_TEXT_CHARS),
            excluded_proof=self._truncate(excluded_proof, MAX_TEXT_CHARS),
            resolution_question=self._truncate(final_resolution_question, MAX_TEXT_CHARS),
            appeal_standard=self._truncate(final_appeal_standard, MAX_TEXT_CHARS),
            evidence_window_seconds=evidence_window,
            appeal_window_seconds=appeal_window,
            claimed_creator=False,
            claimed_opponent=False,
        )

        self.all_wager_ids.append(wager_id)

    @gl.public.write
    def accept_wager(self, wager_id: str) -> None:
        wager = self._get_wager(wager_id)

        self._require(gl.message.sender_address == wager.opponent, "ONLY_OPPONENT")
        self._require(wager.state == "INVITED", "INVALID_STATUS")
        self._require(self._source_count_for_wager(wager_id) > 0, "MISSING_PRIMARY_SOURCE")

        self._lock_sources_for_wager(wager_id)

        wager.state = "ACCEPTED"
        self.wagers[wager_id] = wager

    @gl.public.write.payable
    def fund_wager(self, wager_id: str) -> None:
        wager = self._get_wager(wager_id)

        self._require(self._is_participant(wager), "ONLY_PARTICIPANT")
        self._require(
            wager.state in ["ACCEPTED", "CREATOR_FUNDED", "OPPONENT_FUNDED"],
            "INVALID_STATUS",
        )
        self._require(gl.message.value == wager.stake_amount, "INVALID_STAKE_AMOUNT")

        role = self._caller_role(wager)

        if role == "creator":
            self._require(not wager.creator_funded, "WAGER_ALREADY_FUNDED")
            wager.creator_funded = True
        elif role == "opponent":
            self._require(not wager.opponent_funded, "WAGER_ALREADY_FUNDED")
            wager.opponent_funded = True
        else:
            raise gl.vm.UserError("ONLY_PARTICIPANT")

        if wager.creator_funded and wager.opponent_funded:
            wager.state = "LOCKED"
        elif wager.creator_funded:
            wager.state = "CREATOR_FUNDED"
        else:
            wager.state = "OPPONENT_FUNDED"

        self.wagers[wager_id] = wager

    @gl.public.write
    def submit_source_finding(
        self,
        wager_id: str,
        finding_id: str,
        source_id: str,
        finding: str,
        evidence_url: str,
        supports_side: str,
        captured_at_claim: str,
        confidence: str,
    ) -> None:
        wager = self._get_wager(wager_id)

        self._require(self._is_participant(wager), "ONLY_PARTICIPANT")
        self._require(wager.state in ["LOCKED", "EVIDENCE_OPEN"], "INVALID_STATUS")
        self._require(finding_id != "", "INVALID_FINDING_ID")
        self._require(not self._finding_id_exists(wager_id, finding_id), "DUPLICATE_FINDING_ID")
        self._require(source_id != "", "INVALID_SOURCE_ID")
        self._require(self._locked_source_exists(wager_id, source_id), "SOURCE_NOT_LOCKED")
        self._require(finding != "", "INVALID_FINDING")
        self._require(supports_side in VALID_SUPPORT_SIDES, "INVALID_SUPPORT_SIDE")

        now = self._now()
        deadline = int(wager.deadline_unix)
        evidence_window = int(wager.evidence_window_seconds)

        if deadline > 0 and now > deadline + evidence_window:
            raise gl.vm.UserError("EVIDENCE_WINDOW_CLOSED")

        source_type = self._get_source_type(wager_id, source_id)
        if source_type != "manual_witness":
            self._require(evidence_url != "", "INVALID_EVIDENCE_URL")

        self._require(self._finding_count_for_wager(wager_id) < MAX_FINDINGS_PER_WAGER, "TOO_MANY_FINDINGS")

        final_confidence = confidence
        if final_confidence not in VALID_CONFIDENCE:
            final_confidence = "medium"

        self.all_findings.append(Finding(
            wager_id=wager_id,
            finding_id=finding_id,
            source_id=source_id,
            submitter=gl.message.sender_address,
            finding=self._truncate(finding, MAX_TEXT_CHARS),
            evidence_url=self._truncate(evidence_url, MAX_TEXT_CHARS),
            supports_side=supports_side,
            captured_at_claim=self._truncate(captured_at_claim, MAX_TEXT_CHARS),
            confidence=final_confidence,
            submitted_at_unix=u256(now),
        ))

        if wager.state == "LOCKED":
            wager.state = "EVIDENCE_OPEN"
            self.wagers[wager_id] = wager

    @gl.public.write
    def request_resolution(self, wager_id: str) -> None:
        wager = self._get_wager(wager_id)

        self._require(self._is_participant(wager), "ONLY_PARTICIPANT")
        self._require(wager.state in ["LOCKED", "EVIDENCE_OPEN"], "INVALID_STATUS")
        self._require(self._now() >= int(wager.deadline_unix), "RESOLUTION_NOT_READY")
        self._require(wager_id not in self.resolutions, "WAGER_ALREADY_RESOLVED")
        self._require(self._finding_count_for_wager(wager_id) > 0, "RESOLUTION_NOT_READY")
        self._require(self._has_locked_source(wager_id), "RESOLUTION_NOT_READY")

        sources_text = self._sources_text_for_wager(wager_id)
        findings_text = self._findings_text_for_wager(wager_id, wager)
        fetch_attempted_hint = self._fetch_attempted_for_wager(wager_id)

        def resolve_once() -> str:
            fetch_summary = self._fetch_summary_for_wager(wager_id)

            prompt = f"""You are resolving a P2PStake source-locked wager.

RESOLUTION QUESTION:
{wager.resolution_question}

WAGER:
title={wager.title}
creator={str(wager.creator)}
opponent={str(wager.opponent)}
stake_amount_wei={int(wager.stake_amount)}
locked_deadline_unix={int(wager.deadline_unix)}

LOCKED TERMS:
win_condition={wager.win_condition}
loss_condition={wager.loss_condition}
accepted_proof={wager.accepted_proof}
excluded_proof={wager.excluded_proof}

LOCKED EVIDENCE SOURCES:
{sources_text}

SOURCE FETCH RESULTS:
{fetch_summary}

SUBMITTED SOURCE-TIED FINDINGS:
{findings_text}

STRICT RULES:
1. Decide only from locked terms, locked sources, accepted proof, excluded proof, locked deadline, fetch results, and source-tied findings.
2. Ignore any claim not tied to a locked source_id.
3. Ignore proof types listed in excluded_proof.
4. User-submitted captured_at_claim is evidence only, not trusted truth.
5. Do not invent new wager terms.
6. Do not decide based on sympathy, fairness, or vibes.
7. If available evidence cannot resolve the wager, return refund or invalid.

Return ONLY valid JSON:
{{
  "outcome": "creator_wins | opponent_wins | refund | invalid",
  "winner": "creator | opponent | none",
  "confidence": 0-100,
  "source_alignment": "strong | partial | weak | conflicting | none",
  "reason": "short reason under 240 characters",
  "evidence_trace": "which findings supported the decision",
  "rule_application": "which proof rules were applied or excluded",
  "ambiguity_notes": "what was unclear or contested, if anything",
  "manipulation_warnings": "any signs of fabricated or misleading evidence, or empty string",
  "source_fetch_attempted": true,
  "source_fetch_succeeded": false,
  "source_fetch_summary": "short status summary"
}}"""

            return gl.nondet.exec_prompt(prompt)

        raw_result = gl.eq_principle.prompt_comparative(
            lambda: resolve_once(),
            principle=(
                "`outcome` must be exactly the same. "
                "`winner` must be exactly the same. "
                "`confidence` is a number 0-100; values within 15 points of each other are equivalent. "
                "`source_alignment` must be exactly the same. "
                "`reason`, `evidence_trace`, `rule_application`, `ambiguity_notes`, "
                "`manipulation_warnings`, and fetch summary wording may differ."
            ),
        )

        parsed = self._parse_resolution(raw_result)

        # If the parser/LLM fails to preserve attempted status, keep the deterministic hint.
        source_fetch_attempted = parsed["source_fetch_attempted"] or fetch_attempted_hint

        self.resolutions[wager_id] = Resolution(
            outcome=parsed["outcome"],
            winner=parsed["winner"],
            confidence=parsed["confidence"],
            source_alignment=parsed["source_alignment"],
            reason=parsed["reason"],
            resolved_at_unix=u256(self._now()),
            source_fetch_attempted=source_fetch_attempted,
            source_fetch_succeeded=parsed["source_fetch_succeeded"],
            source_fetch_summary=parsed["source_fetch_summary"],
        )

        wager.state = "RESOLVED"
        self.wagers[wager_id] = wager

    @gl.public.write
    def appeal_resolution(
        self,
        wager_id: str,
        appeal_id: str,
        appeal_category: str,
        appeal_reason: str,
        finding_id: str,
        evidence_url: str,
    ) -> None:
        wager = self._get_wager(wager_id)

        self._require(self._is_participant(wager), "ONLY_PARTICIPANT")
        self._require(wager.state == "RESOLVED", "INVALID_STATUS")
        self._require(wager_id in self.resolutions, "RESOLUTION_NOT_READY")
        self._require(wager_id not in self.appeals, "APPEAL_ALREADY_SUBMITTED")
        self._require(appeal_id != "", "INVALID_APPEAL_BASIS")
        self._require(appeal_category in VALID_APPEAL_CATEGORIES, "INVALID_APPEAL_BASIS")
        self._require(appeal_reason != "", "INVALID_APPEAL_BASIS")

        resolution = self.resolutions[wager_id]
        window_end = int(resolution.resolved_at_unix) + int(wager.appeal_window_seconds)
        self._require(self._now() <= window_end, "APPEAL_WINDOW_CLOSED")

        sources_text = self._sources_text_for_wager(wager_id)
        findings_text = self._findings_text_for_wager(wager_id, wager)

        appeal_prompt = f"""You are reviewing an appeal of a P2PStake source-locked wager resolution.

ORIGINAL RESOLUTION:
outcome={resolution.outcome}
winner={resolution.winner}
confidence={resolution.confidence}
source_alignment={resolution.source_alignment}
reason={resolution.reason}

APPEAL:
category={appeal_category}
reason={appeal_reason}
referenced_finding_id={finding_id}
new_evidence_url={evidence_url}

LOCKED WAGER TERMS:
title={wager.title}
win_condition={wager.win_condition}
loss_condition={wager.loss_condition}
accepted_proof={wager.accepted_proof}
excluded_proof={wager.excluded_proof}
deadline_unix={int(wager.deadline_unix)}
appeal_standard={wager.appeal_standard}

LOCKED SOURCES:
{sources_text}

SUBMITTED SOURCE-TIED FINDINGS:
{findings_text}

STRICT RULES:
1. Appeals are not for simple disagreement.
2. Reverse only for clear new evidence, wrong source read, deadline misread, fraudulent evidence, or condition misinterpretation.
3. Stay inside the locked wager terms and locked sources.
4. Ignore evidence not tied to the locked proof path unless the appeal category is new_evidence and the new evidence directly relates to a locked source.

Return ONLY valid JSON:
{{
  "outcome": "uphold | reverse | refund | invalid | reopen_review | more_evidence_required",
  "reason": "short reason under 240 characters"
}}"""

        raw_appeal = gl.eq_principle.prompt_comparative(
            lambda: gl.nondet.exec_prompt(appeal_prompt),
            principle=(
                "`outcome` must be exactly the same. "
                "`reason` wording may differ."
            ),
        )

        parsed_appeal = self._parse_appeal(raw_appeal)

        self.appeals[wager_id] = AppealRecord(
            appeal_id=appeal_id,
            appellant=gl.message.sender_address,
            appeal_category=appeal_category,
            appeal_reason=self._truncate(appeal_reason, MAX_TEXT_CHARS),
            finding_id=finding_id,
            evidence_url=self._truncate(evidence_url, MAX_TEXT_CHARS),
            outcome=parsed_appeal["outcome"],
            reason=parsed_appeal["reason"],
            created_at_unix=u256(self._now()),
        )

        if parsed_appeal["outcome"] == "reverse":
            new_winner = "opponent" if resolution.winner == "creator" else "creator"
            new_outcome = "opponent_wins" if new_winner == "opponent" else "creator_wins"

            self.resolutions[wager_id] = Resolution(
                outcome=new_outcome,
                winner=new_winner,
                confidence=resolution.confidence,
                source_alignment=resolution.source_alignment,
                reason=self._normalize_reason("REVERSED ON APPEAL: " + parsed_appeal["reason"]),
                resolved_at_unix=resolution.resolved_at_unix,
                source_fetch_attempted=resolution.source_fetch_attempted,
                source_fetch_succeeded=resolution.source_fetch_succeeded,
                source_fetch_summary=resolution.source_fetch_summary,
            )

        elif parsed_appeal["outcome"] in ["refund", "invalid"]:
            self.resolutions[wager_id] = Resolution(
                outcome=parsed_appeal["outcome"],
                winner="none",
                confidence=resolution.confidence,
                source_alignment=resolution.source_alignment,
                reason=self._normalize_reason("APPEAL RESULT: " + parsed_appeal["reason"]),
                resolved_at_unix=resolution.resolved_at_unix,
                source_fetch_attempted=resolution.source_fetch_attempted,
                source_fetch_succeeded=resolution.source_fetch_succeeded,
                source_fetch_summary=resolution.source_fetch_summary,
            )

        elif parsed_appeal["outcome"] == "reopen_review":
            wager.state = "EVIDENCE_OPEN"
            self.wagers[wager_id] = wager
            return

        elif parsed_appeal["outcome"] == "more_evidence_required":
            # Keep RESOLVED state but record that more evidence is needed
            pass

        wager.state = "APPEALED"
        self.wagers[wager_id] = wager

    @gl.public.write
    def finalize_wager(self, wager_id: str) -> None:
        wager = self._get_wager(wager_id)

        self._require(wager.state in ["RESOLVED", "APPEALED"], "INVALID_STATUS")
        self._require(wager_id in self.resolutions, "RESOLUTION_NOT_READY")

        if wager.state == "RESOLVED":
            resolution = self.resolutions[wager_id]
            window_end = int(resolution.resolved_at_unix) + int(wager.appeal_window_seconds)
            self._require(self._now() > window_end, "APPEAL_WINDOW_STILL_OPEN")

        wager.state = "FINALIZED"
        self.wagers[wager_id] = wager

    @gl.public.write
    def claim_payout(self, wager_id: str) -> None:
        self._claim(wager_id, False)

    @gl.public.write
    def claim_refund(self, wager_id: str) -> None:
        self._claim(wager_id, True)

    def _claim(self, wager_id: str, refund_only: bool) -> None:
        wager = self._get_wager(wager_id)

        self._require(wager.state == "FINALIZED", "INVALID_STATUS")
        self._require(self._is_participant(wager), "ONLY_PARTICIPANT")
        self._require(wager_id in self.resolutions, "RESOLUTION_NOT_READY")

        resolution = self.resolutions[wager_id]
        role = self._caller_role(wager)

        if resolution.outcome in ["refund", "invalid"]:
            if role == "creator":
                self._require(not wager.claimed_creator, "ALREADY_CLAIMED")
                wager.claimed_creator = True
                self._send_value(wager.creator, wager.stake_amount)
            elif role == "opponent":
                self._require(not wager.claimed_opponent, "ALREADY_CLAIMED")
                wager.claimed_opponent = True
                self._send_value(wager.opponent, wager.stake_amount)
            else:
                raise gl.vm.UserError("ONLY_PARTICIPANT")

            if wager.claimed_creator and wager.claimed_opponent:
                wager.state = "CLAIMED"

            self.wagers[wager_id] = wager
            return

        self._require(not refund_only, "NOTHING_TO_CLAIM")
        self._require(resolution.winner == role, "NOTHING_TO_CLAIM")

        if role == "creator":
            self._require(not wager.claimed_creator, "ALREADY_CLAIMED")
            wager.claimed_creator = True
            self._send_value(wager.creator, wager.stake_amount + wager.stake_amount)
        elif role == "opponent":
            self._require(not wager.claimed_opponent, "ALREADY_CLAIMED")
            wager.claimed_opponent = True
            self._send_value(wager.opponent, wager.stake_amount + wager.stake_amount)
        else:
            raise gl.vm.UserError("ONLY_PARTICIPANT")

        wager.state = "CLAIMED"
        self.wagers[wager_id] = wager

    @gl.public.write
    def cancel_expired_wager(self, wager_id: str) -> None:
        wager = self._get_wager(wager_id)

        self._require(
            wager.state in ["INVITED", "ACCEPTED", "CREATOR_FUNDED", "OPPONENT_FUNDED"],
            "INVALID_STATUS",
        )

        now = self._now()
        created = int(wager.created_at_unix)

        if wager.state == "INVITED":
            self._require(now > created + EXPIRY_INVITED_SECONDS, "NOT_EXPIRED")
            wager.state = "CANCELLED"
            self.wagers[wager_id] = wager
            return

        self._require(now > created + EXPIRY_FUNDING_SECONDS, "NOT_EXPIRED")

        if wager.creator_funded and not wager.claimed_creator:
            wager.claimed_creator = True
            self._send_value(wager.creator, wager.stake_amount)

        if wager.opponent_funded and not wager.claimed_opponent:
            wager.claimed_opponent = True
            self._send_value(wager.opponent, wager.stake_amount)

        wager.state = "EXPIRED"
        self.wagers[wager_id] = wager

    @gl.public.view
    def get_wager(self, wager_id: str) -> dict:
        wager = self._get_wager(wager_id)

        return {
            "creator": str(wager.creator),
            "opponent": str(wager.opponent),
            "title": wager.title,
            "stake_amount": str(int(wager.stake_amount)),
            "creator_funded": wager.creator_funded,
            "opponent_funded": wager.opponent_funded,
            "deadline_unix": str(int(wager.deadline_unix)),
            "created_at_unix": str(int(wager.created_at_unix)),
            "state": wager.state,
            "win_condition": wager.win_condition,
            "loss_condition": wager.loss_condition,
            "accepted_proof": wager.accepted_proof,
            "excluded_proof": wager.excluded_proof,
            "resolution_question": wager.resolution_question,
            "appeal_standard": wager.appeal_standard,
            "evidence_window_seconds": str(int(wager.evidence_window_seconds)),
            "appeal_window_seconds": str(int(wager.appeal_window_seconds)),
            "claimed_creator": wager.claimed_creator,
            "claimed_opponent": wager.claimed_opponent,
        }

    @gl.public.view
    def get_sources(self, wager_id: str) -> list:
        result = []

        for src in self.all_sources:
            if src.wager_id == wager_id:
                result.append({
                    "wager_id": src.wager_id,
                    "source_id": src.source_id,
                    "source_type": src.source_type,
                    "label": src.label,
                    "url": src.url,
                    "description": src.description,
                    "required": src.required,
                    "is_fallback": src.is_fallback,
                    "locked": src.locked,
                })

        return result

    @gl.public.view
    def get_findings(self, wager_id: str) -> list:
        result = []

        for item in self.all_findings:
            if item.wager_id == wager_id:
                result.append({
                    "wager_id": item.wager_id,
                    "finding_id": item.finding_id,
                    "source_id": item.source_id,
                    "submitter": str(item.submitter),
                    "finding": item.finding,
                    "evidence_url": item.evidence_url,
                    "supports_side": item.supports_side,
                    "captured_at_claim": item.captured_at_claim,
                    "confidence": item.confidence,
                    "submitted_at_unix": str(int(item.submitted_at_unix)),
                })

        return result

    @gl.public.view
    def get_resolution(self, wager_id: str) -> dict:
        if wager_id not in self.resolutions:
            return {}

        resolution = self.resolutions[wager_id]

        return {
            "outcome": resolution.outcome,
            "winner": resolution.winner,
            "confidence": resolution.confidence,
            "source_alignment": resolution.source_alignment,
            "reason": resolution.reason,
            "resolved_at_unix": str(int(resolution.resolved_at_unix)),
            "source_fetch_attempted": resolution.source_fetch_attempted,
            "source_fetch_succeeded": resolution.source_fetch_succeeded,
            "source_fetch_summary": resolution.source_fetch_summary,
        }

    @gl.public.view
    def get_appeal(self, wager_id: str) -> dict:
        if wager_id not in self.appeals:
            return {}

        appeal = self.appeals[wager_id]

        return {
            "appeal_id": appeal.appeal_id,
            "appellant": str(appeal.appellant),
            "appeal_category": appeal.appeal_category,
            "appeal_reason": appeal.appeal_reason,
            "finding_id": appeal.finding_id,
            "evidence_url": appeal.evidence_url,
            "outcome": appeal.outcome,
            "reason": appeal.reason,
            "created_at_unix": str(int(appeal.created_at_unix)),
        }

    @gl.public.view
    def get_wager_ids_for_address(self, address: str) -> list:
        addr = Address(address)
        result = []

        for wager_id in self.all_wager_ids:
            wager = self.wagers[wager_id]
            if wager.creator == addr or wager.opponent == addr:
                result.append(wager_id)

        return result

    @gl.public.view
    def get_all_wager_ids(self) -> list:
        result = []

        for wager_id in self.all_wager_ids:
            result.append(wager_id)

        return result

    @gl.public.view
    def get_position(self, wager_id: str, address: str) -> dict:
        wager = self._get_wager(wager_id)
        addr = Address(address)

        role = "none"
        funded = False
        claimed = False

        if addr == wager.creator:
            role = "creator"
            funded = wager.creator_funded
            claimed = wager.claimed_creator
        elif addr == wager.opponent:
            role = "opponent"
            funded = wager.opponent_funded
            claimed = wager.claimed_opponent

        return {
            "role": role,
            "funded": funded,
            "claimed": claimed,
            "is_participant": role in ["creator", "opponent"],
        }

    def _clean_json(self, raw: str) -> str:
        cleaned = str(raw).strip()

        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            if len(lines) > 2:
                cleaned = "\n".join(lines[1:-1]).strip()

        return cleaned

    def _parse_resolution(self, raw: str) -> dict:
        try:
            result = json.loads(self._clean_json(raw))
        except Exception:
            return {
                "outcome": "invalid",
                "winner": "none",
                "confidence": "low",
                "source_alignment": "none",
                "reason": "Failed to parse resolution output.",
                "source_fetch_attempted": False,
                "source_fetch_succeeded": False,
                "source_fetch_summary": "parse_failed",
            }

        outcome = str(result.get("outcome", "invalid"))
        winner = str(result.get("winner", "none"))
        alignment = str(result.get("source_alignment", "none"))

        # Numeric confidence 0-100
        raw_conf = result.get("confidence", 50)
        try:
            confidence_num = int(float(str(raw_conf)))
        except (ValueError, TypeError):
            confidence_num = 50
        confidence_num = max(0, min(100, confidence_num))

        if outcome not in VALID_OUTCOMES:
            outcome = "invalid"

        if winner not in VALID_WINNERS:
            winner = "none"

        if alignment not in VALID_ALIGNMENTS:
            alignment = "none"

        if outcome == "creator_wins":
            winner = "creator"
        elif outcome == "opponent_wins":
            winner = "opponent"
        elif outcome in ["refund", "invalid"]:
            winner = "none"

        # Build structured summary from sub-fields
        evidence_trace = self._truncate(str(result.get("evidence_trace", "")), MAX_REASON_CHARS)
        rule_application = self._truncate(str(result.get("rule_application", "")), MAX_REASON_CHARS)
        ambiguity_notes = self._truncate(str(result.get("ambiguity_notes", "")), MAX_REASON_CHARS)
        manipulation_warnings = self._truncate(str(result.get("manipulation_warnings", "")), MAX_REASON_CHARS)

        structured_summary = ""
        if evidence_trace:
            structured_summary += f"EVIDENCE: {evidence_trace} | "
        if rule_application:
            structured_summary += f"RULES: {rule_application} | "
        if ambiguity_notes:
            structured_summary += f"AMBIGUITY: {ambiguity_notes} | "
        if manipulation_warnings:
            structured_summary += f"WARNINGS: {manipulation_warnings}"
        structured_summary = self._truncate(structured_summary.rstrip(" | "), MAX_FETCH_SUMMARY_CHARS)

        return {
            "outcome": outcome,
            "winner": winner,
            "confidence": str(confidence_num),
            "source_alignment": alignment,
            "reason": self._normalize_reason(str(result.get("reason", ""))),
            "source_fetch_attempted": bool(result.get("source_fetch_attempted", False)),
            "source_fetch_succeeded": bool(result.get("source_fetch_succeeded", False)),
            "source_fetch_summary": structured_summary if structured_summary else self._truncate(
                str(result.get("source_fetch_summary", "")),
                MAX_FETCH_SUMMARY_CHARS,
            ),
        }

    def _parse_appeal(self, raw: str) -> dict:
        try:
            result = json.loads(self._clean_json(raw))
        except Exception:
            return {
                "outcome": "uphold",
                "reason": "Failed to parse appeal output.",
            }

        outcome = str(result.get("outcome", "uphold"))
        if outcome not in VALID_APPEAL_OUTCOMES:
            outcome = "uphold"

        return {
            "outcome": outcome,
            "reason": self._normalize_reason(str(result.get("reason", ""))),
        }