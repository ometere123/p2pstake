import { readFileSync } from "node:fs";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const CONTRACT = "0xD68fA99e5746904aF2919eE69E0ddC36408bf4d2";
const parseEnv = (path) => Object.fromEntries(
  readFileSync(path, "utf8").split(/\r?\n/).filter(Boolean).map((line) => line.split("="))
);
const wallets = parseEnv(".env.test-wallets");
const population = parseEnv(".env.test-population");
const creator = createAccount(wallets.TEST_WALLET_5_PRIVATE_KEY);
const opponent = createAccount(wallets.TEST_WALLET_6_PRIVATE_KEY);
const creatorClient = createClient({ chain: studionet, account: creator });
const wagerId = population.ADJUDICATION_WAGER_ID;

async function send(client, functionName) {
  const hash = await client.writeContract({ address: CONTRACT, functionName, args: [wagerId], value: 0n });
  await client.waitForTransactionReceipt({ hash });
}

async function main() {
  await send(creatorClient, "finalize_wager");
  const resolution = await creatorClient.readContract({ address: CONTRACT, functionName: "get_resolution", args: [wagerId] });
  const winnerAccount = resolution.winner === "creator" ? creator : opponent;
  if (resolution.winner !== "none") {
    const winnerClient = createClient({ chain: studionet, account: winnerAccount });
    await send(winnerClient, "claim_payout");
  } else {
    await send(creatorClient, "claim_refund");
    const opponentClient = createClient({ chain: studionet, account: opponent });
    await send(opponentClient, "claim_refund");
  }
  const wager = await creatorClient.readContract({ address: CONTRACT, functionName: "get_wager", args: [wagerId] });
  const history = await creatorClient.readContract({ address: CONTRACT, functionName: "get_resolution_history", args: [wagerId] });
  console.log(JSON.stringify({ wagerId, state: wager.state, outcome: resolution.outcome, winner: resolution.winner, historyEntries: history.length }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
