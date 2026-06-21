export function getChainId(): number {
  return Number(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || "61999");
}

export function getRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ||
    "https://studio.genlayer.com/api"
  );
}

export function getChainConfig() {
  return {
    id: getChainId(),
    name: "GenLayer StudioNet",
    nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
    rpcUrls: { default: { http: [getRpcUrl()] } },
  };
}
