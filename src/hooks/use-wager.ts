"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getWager,
  getSources,
  getFindings,
  getResolution,
  getResolutionHistory,
  getAppeal,
  getPosition,
} from "@/lib/genlayer/contract";
import type { WagerDetail } from "@/lib/genlayer/types";
import { useWalletStore } from "@/stores/wallet-store";

const POLL_INTERVAL = 15_000;

export function useWager(wagerId: string | null) {
  const [data, setData] = useState<WagerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const address = useWalletStore((s) => s.address);

  const fetchData = useCallback(async () => {
    if (!wagerId) return;
    try {
      const [wager, sources, findings, resolution, resolutionHistory, appeal] =
        await Promise.all([
          getWager(wagerId),
          getSources(wagerId),
          getFindings(wagerId),
          getResolution(wagerId),
          getResolutionHistory(wagerId),
          getAppeal(wagerId),
        ]);

      if (!wager) {
        setError("Wager not found.");
        setData(null);
        return;
      }

      let position = null;
      if (address) {
        position = await getPosition(wagerId, address);
      }

      setData({ wager, sources, findings, resolution, resolutionHistory, appeal, position });
      setError(null);
    } catch {
      setError("Failed to load wager data.");
    } finally {
      setLoading(false);
    }
  }, [wagerId, address]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLoading(true);
      void fetchData();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [fetchData]);

  useEffect(() => {
    if (!wagerId) return;
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [wagerId, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
