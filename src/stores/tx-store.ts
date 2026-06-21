import { create } from "zustand";

interface PendingTx {
  hash: string;
  method: string;
  timestamp: number;
}

interface TxState {
  pending: PendingTx[];
  completed: string[];
  addPending: (hash: string, method?: string) => void;
  markComplete: (hash: string) => void;
  getLatestHash: () => string | null;
}

export const useTxStore = create<TxState>((set, get) => ({
  pending: [],
  completed: [],

  addPending: (hash, method = "unknown") => {
    set((s) => ({
      pending: [...s.pending, { hash, method, timestamp: Date.now() }],
    }));
  },

  markComplete: (hash) => {
    set((s) => ({
      pending: s.pending.filter((tx) => tx.hash !== hash),
      completed: [hash, ...s.completed].slice(0, 50),
    }));
  },

  getLatestHash: () => {
    const state = get();
    return state.completed[0] ?? state.pending[0]?.hash ?? null;
  },
}));
