import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { generatePrivateKey } from "viem/accounts";
import { formatEther, parseEther } from "viem";

const WALLET_FILE = ".env.test-wallets";
const WALLET_COUNT = 6;
const FUND_AMOUNT = parseEther("6");

function loadOrCreateKeys() {
  if (existsSync(WALLET_FILE)) {
    const values = Object.fromEntries(
      readFileSync(WALLET_FILE, "utf8")
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => line.split("="))
    );
    const keys = Array.from({ length: WALLET_COUNT }, (_, index) => values[`TEST_WALLET_${index + 1}_PRIVATE_KEY`]);
    if (keys.every(Boolean)) return keys;
    throw new Error(`${WALLET_FILE} exists but does not contain all ${WALLET_COUNT} wallets.`);
  }

  const keys = Array.from({ length: WALLET_COUNT }, () => generatePrivateKey());
  writeFileSync(
    WALLET_FILE,
    `${keys.map((key, index) => `TEST_WALLET_${index + 1}_PRIVATE_KEY=${key}`).join("\n")}\n`,
    { encoding: "utf8", mode: 0o600 }
  );
  return keys;
}

async function main() {
  const funderKey = process.env.FUNDER_PRIVATE_KEY;
  if (!funderKey) throw new Error("Set FUNDER_PRIVATE_KEY before running this script.");

  const funder = createAccount(funderKey);
  const client = createClient({ chain: studionet, account: funder });
  const keys = loadOrCreateKeys();
  const wallets = keys.map((key) => createAccount(key));

  console.log(`Funder: ${funder.address}`);
  console.log(`Wallet secrets saved locally in ignored ${WALLET_FILE}.`);

  for (const [index, wallet] of wallets.entries()) {
    const current = await client.getBalance({ address: wallet.address });
    if (current < FUND_AMOUNT) {
      const amount = FUND_AMOUNT - current;
      const hash = await client.sendTransaction({ to: wallet.address, value: amount });
      await client.waitForTransactionReceipt({ hash });
    }
    const balance = await client.getBalance({ address: wallet.address });
    console.log(`wallet_${index + 1}: ${wallet.address} (${formatEther(balance)} GEN)`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
