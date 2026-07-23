import { create } from "zustand";
import type { WagerDetail } from "@/lib/genlayer/types";
import {
  getWager,
  getSources,
  getFindings,
  getResolution,
  getResolutionHistory,
  getAppeal,
  getPosition,
} from "@/lib/genlayer/contract";

interface CachedWager {
  data: WagerDetail;
  fetchedAt: number;
}

const CACHE_TTL = 10_000;

interface WagerStoreState {
  cache: Record<string, CachedWager>;
  fetchWager: (wagerId: string, userAddress?: string) => Promise<WagerDetail | null>;
  invalidate: (wagerId: string) => void;
  invalidateAll: () => void;
}

export const useWagerStore = create<WagerStoreState>((set, get) => ({
  cache: {},

  fetchWager: async (wagerId, userAddress) => {
    const cached = get().cache[wagerId];
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return cached.data;
    }

    const [wager, sources, findings, resolution, resolutionHistory, appeal] = await Promise.all([
      getWager(wagerId),
      getSources(wagerId),
      getFindings(wagerId),
      getResolution(wagerId),
      getResolutionHistory(wagerId),
      getAppeal(wagerId),
    ]);

    if (!wager) return null;

    let position = null;
    if (userAddress) {
      position = await getPosition(wagerId, userAddress);
    }

    const detail: WagerDetail = {
      wager,
      sources,
      findings,
      resolution,
      resolutionHistory,
      appeal,
      position,
    };

    set((s) => ({
      cache: {
        ...s.cache,
        [wagerId]: { data: detail, fetchedAt: Date.now() },
      },
    }));

    return detail;
  },

  invalidate: (wagerId) => {
    set((s) => {
      const newCache = { ...s.cache };
      delete newCache[wagerId];
      return { cache: newCache };
    });
  },

  invalidateAll: () => set({ cache: {} }),
}));
