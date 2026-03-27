"use client";

/**
 * Wallet functionality for VeriDict
 * Supports MetaMask and Rabby — no Coinbase Wallet
 */
export { useWallet, WalletProvider } from "./WalletProvider";
export type { WalletState } from "./WalletProvider";

/**
 * Supported wallet types for VeriDict
 */
export type SupportedWallet = "metamask" | "rabby";

/**
 * Detect which supported wallet is currently active in the browser.
 * Rabby injects isRabby=true alongside isMetaMask=true, so we check
 * Rabby first to avoid misidentifying it as MetaMask.
 */
export function detectWallet(): SupportedWallet | null {
  if (typeof window === "undefined") return null;

  const eth = window.ethereum as any;
  if (!eth) return null;

  // Rabby sets isRabby = true (it also sets isMetaMask = true)
  if (eth.isRabby) return "rabby";

  // Plain MetaMask
  if (eth.isMetaMask) return "metamask";

  return null;
}

/**
 * Returns display metadata for a supported wallet.
 */
export function getWalletInfo(wallet: SupportedWallet): {
  name:       string;
  installUrl: string;
  icon:       string; // emoji fallback
} {
  switch (wallet) {
    case "rabby":
      return {
        name:       "Rabby Wallet",
        installUrl: "https://rabby.io",
        icon:       "🐇",
      };
    case "metamask":
    default:
      return {
        name:       "MetaMask",
        installUrl: "https://metamask.io/download/",
        icon:       "🦊",
      };
  }
}

/**
 * Returns true if any supported wallet (MetaMask or Rabby) is installed.
 */
export function isSupportedWalletInstalled(): boolean {
  return detectWallet() !== null;
}

/**
 * Format a blockchain address for display with ellipsis truncation.
 * e.g. "0x1234...5678"
 *
 * @param address   - The full address string
 * @param maxLength - Max chars before truncating (default: 12)
 */
export function formatAddress(
  address: string | null,
  maxLength: number = 12
): string {
  if (!address) return "";
  if (address.length <= maxLength) return address;

  const prefixLength = Math.floor((maxLength - 3) / 2);
  const suffixLength = Math.ceil((maxLength - 3) / 2);

  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}