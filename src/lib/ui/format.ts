export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatGEN(weiString: string): string {
  try {
    const wei = BigInt(weiString);
    const gen = Number(wei) / 1e18;
    if (gen === 0) return "0";
    if (gen < 0.001) return "<0.001";
    return gen.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  } catch {
    return weiString;
  }
}

export function genToWei(gen: string): bigint {
  const num = parseFloat(gen);
  if (isNaN(num) || num <= 0) return BigInt(0);
  const [whole, frac = ""] = gen.split(".");
  const padded = (frac + "000000000000000000").slice(0, 18);
  return BigInt(whole || "0") * BigInt("1000000000000000000") + BigInt(padded);
}

export function weiToGen(wei: string | bigint): number {
  return Number(BigInt(wei)) / 1e18;
}
