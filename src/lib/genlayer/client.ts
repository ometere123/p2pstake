import { createClient } from "genlayer-js";
import { getChainConfig, getChainId, getRpcUrl } from "./chain";

let clientInstance: ReturnType<typeof createClient> | null = null;

function isMissingChainError(error: unknown): error is { code: 4902 } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 4902
  );
}

export function getClient() {
  if (clientInstance) return clientInstance;
  clientInstance = createClient({ chain: getChainConfig() });
  return clientInstance;
}

export function setClient(client: ReturnType<typeof createClient>) {
  clientInstance = client;
}

async function switchToStudioNet(): Promise<void> {
  if (!window.ethereum) return;

  const expectedChainId = getChainId();
  const hexChainId = `0x${expectedChainId.toString(16)}`;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (switchError: unknown) {
    if (isMissingChainError(switchError)) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChainId,
            chainName: "GenLayer StudioNet",
            nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
            rpcUrls: [getRpcUrl()],
            blockExplorerUrls: [
              process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL ||
                "https://explorer-studio.genlayer.com",
            ],
          },
        ],
      });
    }
  }
}

export async function connectWallet(): Promise<{
  client: ReturnType<typeof createClient>;
  address: string;
}> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected wallet found. Install MetaMask.");
  }

  const accounts = (await window.ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts returned from wallet.");
  }

  await switchToStudioNet();

  const address = accounts[0];
  const chain = getChainConfig();

  clientInstance = createClient({
    chain,
    account: address as `0x${string}`,
  });

  return { client: clientInstance, address };
}

export function disconnectWallet() {
  clientInstance = null;
}
