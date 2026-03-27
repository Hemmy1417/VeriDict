import { NextRequest, NextResponse } from "next/server";

const RPC_URL = process.env.GENLAYER_RPC_URL || "https://studio.genlayer.com:8443/api";

/**
 * GET /api/balance?address=0x...
 *
 * Tries multiple methods to get the GEN balance for a wallet.
 * GEN on Studio is the native token,
 * so we try zks_getAllAccountBalances first which returns all token balances.
 */
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address param required" }, { status: 400 });
  }

  // ── Method 1: zks_getAllAccountBalances ───────────────────────────
  // Returns all token balances including the native GEN token
  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "zks_getAllAccountBalances",
        params: [address],
        id: 1,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      // Result is a map of token address -> hex balance
      // Native token (ETH/GEN) is at address 0x0000...0000
      if (data.result && typeof data.result === "object") {
        const keys = Object.keys(data.result);
        // Find the largest balance — that's most likely the GEN token
        let maxWei = BigInt(0);
        let allBalances: Record<string, string> = {};

        for (const key of keys) {
          const hex = data.result[key];
          if (hex && hex !== "0x0" && hex !== "0x") {
            const wei = BigInt(hex);
            allBalances[key] = (Number(wei) / 1e18).toFixed(4);
            if (wei > maxWei) maxWei = wei;
          }
        }

        if (maxWei > BigInt(0)) {
          const gen = Number(maxWei) / 1e18;
          return NextResponse.json({
            balance: gen,
            display: gen.toFixed(4),
            method: "zks_getAllAccountBalances",
            all: allBalances,
          });
        }
      }
    }
  } catch (err) {
    console.warn("zks_getAllAccountBalances failed:", err);
  }

  // ── Method 2: eth_getBalance (native token slot) ──────────────────
  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 2,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.result && data.result !== "0x" && data.result !== "0x0") {
        const wei = BigInt(data.result);
        const gen = Number(wei) / 1e18;
        return NextResponse.json({
          balance: gen,
          display: gen.toFixed(4),
          method: "eth_getBalance",
        });
      }
    }
  } catch (err) {
    console.warn("eth_getBalance failed:", err);
  }

  // ── Method 3: GenLayer ops/balance REST endpoint ──────────────────
  try {
    const baseUrl = RPC_URL.replace(/\/$/, "");
    const res = await fetch(`${baseUrl}/ops/balance/${address}`, {
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.balance != null && data.balance !== "0") {
        const wei = BigInt(String(data.balance));
        const gen = Number(wei) / 1e18;
        return NextResponse.json({
          balance: gen,
          display: gen.toFixed(4),
          method: "ops/balance",
        });
      }
    }
  } catch (err) {
    console.warn("ops/balance failed:", err);
  }

  // All methods returned 0 or failed
  return NextResponse.json({
    balance: 0,
    display: "0.0000",
    method: "none — check faucet or network",
  });
}