"use client";

// Re-export useWallet from the boilerplate WalletProvider.
// The WalletProvider context is set up in lib/genlayer/WalletProvider.tsx
// which is unchanged from the original boilerplate.
export { useWallet } from "./WalletProvider";

/**
 * Shortens a wallet address for display.
 * e.g. 0x1234...5678
 */
export function formatAddress(address: string | null | undefined, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}