"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

// ── Chain config ─────────────────────────────────────────────────────────────
export const GENLAYER_CHAIN_ID     = parseInt(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || "61999");
export const GENLAYER_CHAIN_ID_HEX = "0x" + GENLAYER_CHAIN_ID.toString(16).toUpperCase();

export const GENLAYER_NETWORK = {
  chainId:  GENLAYER_CHAIN_ID_HEX,
  chainName: process.env.NEXT_PUBLIC_GENLAYER_CHAIN_NAME || "GenLayer Studio",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls:           ["https://studio.genlayer.com:8443/api"],
  blockExplorerUrls: ["https://studio.genlayer.com"],
};

// ── Provider helpers ──────────────────────────────────────────────────────────
interface EthereumProvider {
  isMetaMask?: boolean;
  request:        (args: { method: string; params?: any[] }) => Promise<any>;
  on:             (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
}
declare global { interface Window { ethereum?: EthereumProvider; } }

export function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return (window as any).rabby ?? window.ethereum ?? null;
}

export function isMetaMaskInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).rabby || !!window.ethereum;
}

export async function requestAccounts(): Promise<string[]> {
  const p = getEthereumProvider();
  if (!p) throw new Error("No wallet detected. Install MetaMask or Rabby.");
  try { return await p.request({ method: "eth_requestAccounts" }); }
  catch (e: any) {
    if (e.code === 4001) throw new Error("User rejected the connection request");
    throw new Error(`Failed to connect: ${e.message}`);
  }
}

export async function getAccounts(): Promise<string[]> {
  const p = getEthereumProvider();
  if (!p) return [];
  try { return await p.request({ method: "eth_accounts" }); } catch { return []; }
}

export async function getCurrentChainId(): Promise<string | null> {
  const p = getEthereumProvider();
  if (!p) return null;
  try { return await p.request({ method: "eth_chainId" }); } catch { return null; }
}

// ── Network management ────────────────────────────────────────────────────────
export async function addGenLayerNetwork(): Promise<void> {
  const p = getEthereumProvider();
  if (!p) throw new Error("No wallet detected");
  try {
    await p.request({ method: "wallet_addEthereumChain", params: [GENLAYER_NETWORK] });
  } catch (e: any) {
    if (e.code === 4001) throw new Error("User rejected adding the network");
    throw new Error(`Failed to add GenLayer network: ${e.message}`);
  }
}

export async function switchToGenLayerNetwork(): Promise<void> {
  await addGenLayerNetwork();
}

export async function isOnGenLayerNetwork(): Promise<boolean> {
  const chainId = await getCurrentChainId();
  if (!chainId) return false;
  return parseInt(chainId, 16) === GENLAYER_CHAIN_ID;
}

// ── Wallet connection ─────────────────────────────────────────────────────────
export async function connectMetaMask(): Promise<string> {
  if (!isMetaMaskInstalled()) throw new Error("No wallet detected. Install MetaMask or Rabby.");
  const accounts = await requestAccounts();
  if (!accounts?.length) throw new Error("No accounts found");
  if (!(await isOnGenLayerNetwork())) await switchToGenLayerNetwork();
  return accounts[0];
}

export async function switchAccount(): Promise<string> {
  const p = getEthereumProvider();
  if (!p) throw new Error("No wallet detected");
  try {
    await p.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
    const accounts = await p.request({ method: "eth_accounts" });
    if (!accounts?.length) throw new Error("No account selected");
    return accounts[0];
  } catch (e: any) {
    if (e.code === 4001)   throw new Error("User rejected account switch");
    if (e.code === -32002) throw new Error("Account switch already pending");
    throw new Error(`Failed to switch account: ${e.message}`);
  }
}

// ── GenLayer JS client ────────────────────────────────────────────────────────
export function getStudioUrl(): string {
  if (typeof window === "undefined") return process.env.GENLAYER_RPC_URL || "https://studio.genlayer.com:8443/api";
  return process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "/api/rpc";
}

export function getContractAddress(): string {
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5dA860186C6e72C194450C9204E6Fc42b5372Ae8";
}

export function createGenLayerClient(address?: string | null) {
  try {
    return createClient({ chain: studionet, endpoint: getStudioUrl(), ...(address ? { account: address as `0x${string}` } : {}) });
  } catch {
    return createClient({ chain: studionet });
  }
}

export async function getClient() {
  const accounts = await getAccounts();
  return createGenLayerClient(accounts[0]);
}