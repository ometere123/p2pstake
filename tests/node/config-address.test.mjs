import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const ENV_CONTRACT_KEY = "NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS";
const ADDRESS_RE = /^0x(?:[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/;

function readText(path) {
  return readFileSync(path, "utf8");
}

function readEnvValue(key) {
  const envText = readText(".env.local");
  const line = envText
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${key}=`));
  return line?.slice(key.length + 1).trim() ?? "";
}

test("active contract address is configured and consistently documented", () => {
  const address = readEnvValue(ENV_CONTRACT_KEY);

  assert.match(address, ADDRESS_RE);

  for (const path of [
    "README.md",
    "docs/contract-methods.md",
    "tests/contract/test_p2pstake.py",
  ]) {
    assert.match(readText(path), new RegExp(address, "i"), `${path} should use ${address}`);
  }
});

test("chain, RPC, and explorer env values target StudioNet", () => {
  assert.equal(readEnvValue("NEXT_PUBLIC_GENLAYER_CHAIN_ID"), "61999");
  assert.equal(readEnvValue("NEXT_PUBLIC_GENLAYER_RPC_URL"), "https://studio.genlayer.com/api");
  assert.equal(
    readEnvValue("NEXT_PUBLIC_GENLAYER_EXPLORER_URL"),
    "https://explorer-studio.genlayer.com"
  );
});
