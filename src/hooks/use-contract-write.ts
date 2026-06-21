"use client";

import { useState, useCallback } from "react";
import { waitForReceipt } from "@/lib/genlayer/tx";
import { parseContractError } from "@/lib/genlayer/errors";
import { useWagerStore } from "@/stores/wager-store";
import { useTxStore } from "@/stores/tx-store";

interface WriteResult {
  txHash: string | null;
  error: string | null;
  isPending: boolean;
}

export function useContractWrite() {
  const [result, setResult] = useState<WriteResult>({
    txHash: null,
    error: null,
    isPending: false,
  });
  const invalidate = useWagerStore((s) => s.invalidate);
  const addPending = useTxStore((s) => s.addPending);
  const markComplete = useTxStore((s) => s.markComplete);

  const write = useCallback(
    async (
      writeFn: () => Promise<string>,
      wagerId?: string,
      method?: string
    ): Promise<string | null> => {
      setResult({ txHash: null, error: null, isPending: true });

      try {
        const hash = await writeFn();
        addPending(hash, method);
        setResult({ txHash: hash, error: null, isPending: true });

        await waitForReceipt({ hash });
        markComplete(hash);

        if (wagerId) {
          invalidate(wagerId);
        }

        setResult({ txHash: hash, error: null, isPending: false });
        return hash;
      } catch (err) {
        const message = parseContractError(err);
        setResult({ txHash: null, error: message, isPending: false });
        return null;
      }
    },
    [invalidate, addPending, markComplete]
  );

  const reset = useCallback(() => {
    setResult({ txHash: null, error: null, isPending: false });
  }, []);

  return { ...result, write, reset };
}
