"use client";

import { useState, useEffect, useCallback } from "react";
import { getWagerIdsForAddress, getWager } from "@/lib/genlayer/contract";
import type { Wager } from "@/lib/genlayer/types";
import { useWalletStore } from "@/stores/wallet-store";

export interface WagerListItem extends Wager {
  id: string;
}

export function useWagerList() {
  const address = useWalletStore((s) => s.address);
  const [wagers, setWagers] = useState<WagerListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!address) {
      setWagers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ids = await getWagerIdsForAddress(address);
    const results = await Promise.all(
      ids.map(async (id) => {
        const wager = await getWager(id);
        return wager ? { ...wager, id } : null;
      })
    );
    setWagers(
      results.filter((w): w is WagerListItem => w !== null)
    );
    setLoading(false);
  }, [address]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  return { wagers, loading, refetch: load };
}
