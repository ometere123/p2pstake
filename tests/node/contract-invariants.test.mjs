import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const contract = readFileSync("contracts/P2PStake.py", "utf8");

test("resolution and appeal nondeterminism are guarded by equivalence principles", () => {
  const eqPrincipleCalls = contract.match(/gl\.eq_principle\.prompt_comparative/g) ?? [];

  assert.equal(eqPrincipleCalls.length, 3);
  assert.match(contract, /`outcome` must be exactly the same/);
  assert.match(contract, /`winner` must be exactly the same/);
  assert.match(contract, /`source_alignment` must be exactly the same/);
});

test("resolution parser normalizes invalid nondeterministic output into safe outcomes", () => {
  assert.match(contract, /def _parse_resolution\(self, raw: str\) -> dict:/);
  assert.match(contract, /except Exception:[\s\S]*"outcome": "invalid"/);
  assert.match(contract, /if outcome not in VALID_OUTCOMES:[\s\S]*outcome = "invalid"/);
  assert.match(contract, /elif outcome in \["refund", "invalid"\]:[\s\S]*winner = "none"/);
});

test("appeal parser rejects unexpected nondeterministic outcomes", () => {
  assert.match(contract, /VALID_APPEAL_OUTCOMES = \["uphold", "reverse", "refund", "invalid", "reopen_review", "more_evidence_required"\]/);
  assert.match(contract, /if outcome not in VALID_APPEAL_OUTCOMES:[\s\S]*outcome = "uphold"/);
});

test("source-locked evidence rules are enforced before resolution", () => {
  assert.match(contract, /self\._require\(self\._locked_source_exists\(wager_id, source_id\), "SOURCE_NOT_LOCKED"\)/);
  assert.match(contract, /self\._require\(self\._has_locked_source\(wager_id\), "RESOLUTION_NOT_READY"\)/);
  assert.match(contract, /Ignore any claim not tied to a locked source_id/);
  assert.match(contract, /User-submitted captured_at_claim is evidence only, not trusted truth/);
});

test("reopened appeals version prior resolution and require fetched new evidence", () => {
  assert.match(contract, /self\._archive_resolution\(wager_id\)[\s\S]*wager\.state = "EVIDENCE_OPEN"/);
  assert.match(contract, /reopened_for_evidence[\s\S]*not reopened_for_evidence/);
  assert.match(contract, /NEW_EVIDENCE_REQUIRED/);
  assert.match(contract, /NEW_EVIDENCE_URL_REQUIRED/);
  assert.match(contract, /def _has_fetchable_finding_after/);
  assert.match(contract, /def _appeal_evidence_fetch_summary/);
  assert.match(contract, /NEW APPEAL EVIDENCE FETCH RESULTS:/);
  assert.match(contract, /gl\.nondet\.web\.get\(url\)/);
});

test("appeal reversal is independently re-adjudicated", () => {
  assert.doesNotMatch(contract, /new_winner = "opponent" if/);
  assert.match(contract, /Do not simply invert the[\s\S]*prior winner/);
  assert.match(contract, /parsed_reverse = self\._parse_resolution/);
});
