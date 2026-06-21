export function truncateHash(hash: string, chars = 6): string {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function generateId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}
