function getExplorerBase(): string {
  return (
    process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL ||
    "https://explorer-studio.genlayer.com"
  );
}

export function addressUrl(address: string): string {
  return `${getExplorerBase()}/address/${address}`;
}

export function txUrl(hash: string): string {
  return `${getExplorerBase()}/tx/${hash}`;
}

export function getContractAddress(): string {
  return process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS || "";
}

export function isContractAddressSet(): boolean {
  return getContractAddress().length > 0;
}
