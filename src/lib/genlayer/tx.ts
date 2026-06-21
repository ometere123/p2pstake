import { getClient } from "./client";
import { TransactionStatus, type TransactionHash } from "genlayer-js/types";

export interface TxReceiptOptions {
  hash: string;
  status?: TransactionStatus;
  retries?: number;
  interval?: number;
}

export async function waitForReceipt(opts: TxReceiptOptions) {
  const client = getClient();
  const receipt = await client.waitForTransactionReceipt({
    hash: opts.hash as TransactionHash,
    status: opts.status ?? TransactionStatus.ACCEPTED,
    retries: opts.retries ?? 50,
    interval: opts.interval ?? 3000,
  });
  return receipt;
}

export async function waitForFinalized(hash: string) {
  return waitForReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    retries: 100,
    interval: 5000,
  });
}
