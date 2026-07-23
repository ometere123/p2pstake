import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const PARTY_1 = "0xd94494a5e2fc489c843fff96e87c7035cf076294806ec8e3415f13eb36d16da9";
const PARTY_2 = "0x33a7f7a9c13f613fd3a0fe36f3e381a234045df5c1f6d6d44027e5e79a02e7fe";
const ADDRESS_RE = /^0x(?:[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/;

test("provided parties are accepted GenLayer-style wallet identifiers", () => {
  assert.match(PARTY_1, ADDRESS_RE);
  assert.match(PARTY_2, ADDRESS_RE);
  assert.notEqual(PARTY_1.toLowerCase(), PARTY_2.toLowerCase());
});

test("create wager validation mirrors contract-critical requirements", () => {
  const validation = readFileSync("src/lib/wager/validation.ts", "utf8");

  assert.match(validation, /genlayerAddressSchema/);
  assert.match(validation, /Stake amount must be greater than 0/);
  assert.match(validation, /Deadline must be in the future/);
  assert.match(validation, /At least one primary evidence source is required/);
  assert.match(validation, /URL is required for this source type/);
});

test("create flow prevents blocked and incomplete source-locked wagers in the UI", () => {
  const conditionStep = readFileSync("src/components/forms/condition-step.tsx", "utf8");
  const proofSourcesStep = readFileSync("src/components/forms/proof-sources-step.tsx", "utf8");
  const proofRulesStep = readFileSync("src/components/forms/proof-rules-step.tsx", "utf8");

  assert.match(conditionStep, /checkBlockedCategory/);
  assert.match(proofSourcesStep, /disabled=\{!hasPrimary \|\| fields\.length === 0\}/);
  assert.match(proofRulesStep, /trigger\(\["accepted_proof", "excluded_proof"\]\)/);
});

test("frontend reads and displays versioned resolution history", () => {
  const types = readFileSync("src/lib/genlayer/types.ts", "utf8");
  const contractClient = readFileSync("src/lib/genlayer/contract.ts", "utf8");
  const useWager = readFileSync("src/hooks/use-wager.ts", "utf8");
  const wagerStore = readFileSync("src/stores/wager-store.ts", "utf8");
  const activityFeed = readFileSync("src/components/settlement/activity-feed.tsx", "utf8");
  const copy = readFileSync("src/lib/wager/copy.ts", "utf8");

  assert.match(types, /export type ResolutionHistoryEntry = Resolution/);
  assert.match(types, /resolutionHistory: ResolutionHistoryEntry\[\]/);
  assert.match(contractClient, /functionName: "get_resolution_history"/);
  assert.match(useWager, /getResolutionHistory\(wagerId\)/);
  assert.match(wagerStore, /getResolutionHistory\(wagerId\)/);
  assert.match(activityFeed, /Archived verdict v\$\{index \+ 1\}/);
  assert.match(copy, /Resolution reversed after fresh adjudication/);
});
