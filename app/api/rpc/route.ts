import { NextRequest, NextResponse } from "next/server";

const RPC_URL = process.env.GENLAYER_RPC_URL || "https://studio.genlayer.com:8443/api";

async function fetchWithRetry(body: unknown, maxRetries = 3): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
    try {
      const res = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 429) {
        const retryAfter = res.headers.get("retry-after");
        const wait = retryAfter ? parseInt(retryAfter) * 1000 : 2000 * Math.pow(2, attempt);
        console.warn("RPC rate limited, waiting", wait, "ms before retry", attempt + 1);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("RPC fetch failed after retries");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetchWithRetry(body);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("RPC proxy error:", err?.message ?? err);
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32603, message: "RPC proxy failed" }, id: null },
      { status: 503 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "VeriDict RPC proxy active" });
}