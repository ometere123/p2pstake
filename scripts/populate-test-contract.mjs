import { readFileSync, writeFileSync } from "node:fs";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { parseEther } from "viem";

const CONTRACT = "0xD68fA99e5746904aF2919eE69E0ddC36408bf4d2";
const SOURCE_URL = "https://github.com/genlayerlabs/genlayer-js";
const keys = Object.fromEntries(
  readFileSync(".env.test-wallets", "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split("="))
);
const accounts = Array.from({ length: 6 }, (_, index) =>
  createAccount(keys[`TEST_WALLET_${index + 1}_PRIVATE_KEY`])
);
const clients = accounts.map((account) => createClient({ chain: studionet, account }));
const run = `review-${Date.now()}`;
const ids = {
  invited: `${run}-invited`,
  accepted: `${run}-accepted`,
  creatorFunded: `${run}-creator-funded`,
  opponentFunded: `${run}-opponent-funded`,
  adjudication: `${run}-adjudication`,
};

async function send(client, request) {
  const hash = await client.writeContract({ address: CONTRACT, value: 0n, ...request });
  await client.waitForTransactionReceipt({ hash });
  return hash;
}

async function create(clientIndex, opponentIndex, wagerId, deadline, title) {
  return send(clients[clientIndex], {
    functionName: "create_wager",
    args: [
      wagerId,
      accounts[opponentIndex].address,
      title,
      parseEther("1"),
      BigInt(deadline),
      "Creator wins if the locked GitHub source is publicly reachable and identifies the GenLayer JavaScript SDK.",
      "Opponent wins if the locked source is unreachable or does not identify that SDK.",
      "A finding tied to the locked GitHub repository URL.",
      "Screenshots, private pages, and claims unrelated to the locked source.",
      "Does the locked source identify the GenLayer JavaScript SDK before the deadline?",
      "Appeals require fetchable new evidence or a specific source-reading error.",
      3600n,
      120n,
      [{
        source_id: "genlayer-js-repo",
        source_type: "github",
        label: "GenLayer JavaScript SDK repository",
        url: SOURCE_URL,
        description: "Public locked source used to test deterministic evidence linkage and nondeterministic fetching.",
        required: true,
        is_fallback: false,
      }],
    ],
  });
}

async function accept(clientIndex, wagerId) {
  return send(clients[clientIndex], { functionName: "accept_wager", args: [wagerId] });
}

async function fund(clientIndex, wagerId) {
  const hash = await clients[clientIndex].writeContract({
    address: CONTRACT,
    functionName: "fund_wager",
    args: [wagerId],
    value: parseEther("1"),
  });
  await clients[clientIndex].waitForTransactionReceipt({ hash });
  return hash;
}

async function main() {
  const now = Math.floor(Date.now() / 1000);
  const longDeadline = now + 86400;

  await create(0, 1, ids.invited, longDeadline, "Review fixture: invited wager");

  await create(2, 3, ids.accepted, longDeadline, "Review fixture: accepted wager");
  await accept(3, ids.accepted);

  await create(0, 1, ids.creatorFunded, longDeadline, "Review fixture: creator-funded wager");
  await accept(1, ids.creatorFunded);
  await fund(0, ids.creatorFunded);

  await create(2, 3, ids.opponentFunded, longDeadline, "Review fixture: opponent-funded wager");
  await accept(3, ids.opponentFunded);
  await fund(3, ids.opponentFunded);

  const resolutionDeadline = Math.floor(Date.now() / 1000) + 35;
  await create(4, 5, ids.adjudication, resolutionDeadline, "Review fixture: source-fetched adjudication and appeal");
  await accept(5, ids.adjudication);
  await fund(4, ids.adjudication);
  await fund(5, ids.adjudication);
  await send(clients[4], {
    functionName: "submit_source_finding",
    args: [
      ids.adjudication,
      `${run}-creator-finding`,
      "genlayer-js-repo",
      "The locked public repository identifies itself as the JavaScript SDK for GenLayer.",
      SOURCE_URL,
      "creator",
      new Date().toISOString(),
      "high",
    ],
  });
  await send(clients[5], {
    functionName: "submit_source_finding",
    args: [
      ids.adjudication,
      `${run}-opponent-finding`,
      "genlayer-js-repo",
      "The opponent requests that validators independently fetch and verify the locked repository.",
      SOURCE_URL,
      "opponent",
      new Date().toISOString(),
      "medium",
    ],
  });

  const remaining = resolutionDeadline - Math.floor(Date.now() / 1000) + 2;
  if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining * 1000));
  await send(clients[4], { functionName: "request_resolution", args: [ids.adjudication] });

  await send(clients[5], {
    functionName: "appeal_resolution",
    args: [
      ids.adjudication,
      `${run}-appeal`,
      "new_evidence",
      "Re-fetch the locked repository as new evidence and independently verify the original source reading.",
      `${run}-opponent-finding`,
      SOURCE_URL,
    ],
  });

  const states = {};
  for (const [label, wagerId] of Object.entries(ids)) {
    const wager = await clients[0].readContract({ address: CONTRACT, functionName: "get_wager", args: [wagerId] });
    states[label] = { wagerId, state: wager.state };
  }
  const appeal = await clients[0].readContract({ address: CONTRACT, functionName: "get_appeal", args: [ids.adjudication] });
  writeFileSync(".env.test-population", `TEST_RUN=${run}\n${Object.entries(ids).map(([key, value]) => `${key.toUpperCase()}_WAGER_ID=${value}`).join("\n")}\n`);
  console.log(JSON.stringify({ contract: CONTRACT, wallets: accounts.map((account) => account.address), states, appealOutcome: appeal.outcome }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
