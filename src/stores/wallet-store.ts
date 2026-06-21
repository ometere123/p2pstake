import { create } from "zustand";
import { connectWallet, disconnectWallet, setClient } from "@/lib/genlayer/client";
import { getChainId, getChainConfig } from "@/lib/genlayer/chain";
import { createClient } from "genlayer-js";

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
}

type WalletSet = (
  partial:
    | WalletState
    | Partial<WalletState>
    | ((state: WalletState) => WalletState | Partial<WalletState>)
) => void;

function setupListeners(set: WalletSet) {
  if (typeof window === "undefined" || !window.ethereum) return;
  const expectedChainId = getChainId();

  window.ethereum.on("accountsChanged", (accounts: unknown) => {
    const accs = accounts as string[];
    if (accs.length === 0) {
      disconnectWallet();
      set({ address: null, isConnected: false, isCorrectNetwork: false, chainId: null });
    } else {
      const addr = accs[0];
      setClient(createClient({ chain: getChainConfig(), account: addr as `0x${string}` }));
      set({ address: addr });
    }
  });

  window.ethereum.on("chainChanged", (newChainIdHex: unknown) => {
    const newChainId = parseInt(newChainIdHex as string, 16);
    set({ chainId: newChainId, isCorrectNetwork: newChainId === expectedChainId });
  });
}

let listenersAttached = false;

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  chainId: null,
  isConnected: false,
  isCorrectNetwork: false,
  isConnecting: false,

  connect: async () => {
    set({ isConnecting: true });
    try {
      const { address } = await connectWallet();
      const expectedChainId = getChainId();

      const chainIdHex = (await window.ethereum!.request({
        method: "eth_chainId",
      })) as string;
      const chainId = parseInt(chainIdHex, 16);

      set({
        address,
        chainId,
        isConnected: true,
        isCorrectNetwork: chainId === expectedChainId,
        isConnecting: false,
      });

      if (!listenersAttached) {
        setupListeners(set);
        listenersAttached = true;
      }
    } catch {
      set({ isConnecting: false });
    }
  },

  disconnect: () => {
    disconnectWallet();
    set({
      address: null,
      chainId: null,
      isConnected: false,
      isCorrectNetwork: false,
    });
  },

  reconnect: async () => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_accounts",
      })) as string[];

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        const expectedChainId = getChainId();

        const chainIdHex = (await window.ethereum.request({
          method: "eth_chainId",
        })) as string;
        const chainId = parseInt(chainIdHex, 16);

        setClient(
          createClient({
            chain: getChainConfig(),
            account: address as `0x${string}`,
          })
        );

        set({
          address,
          chainId,
          isConnected: true,
          isCorrectNetwork: chainId === expectedChainId,
        });

        if (!listenersAttached) {
          setupListeners(set);
          listenersAttached = true;
        }
      }
    } catch {
      // silently fail — user will see connect button
    }
  },
}));
