import { NextResponse } from "next/server";

const RPC_URL = process.env.GENLAYER_RPC_URL || "https://studio.genlayer.com:8443/api";
const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5dA860186C6e72C194450C9204E6Fc42b5372Ae8";

async function rpcCall(method: string, params: any[], id = 1) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id }),
  });
  return res.json();
}

async function callContract(functionName: string, args: any[], id = 1) {
  return rpcCall("gen_call", [{ to: CONTRACT, data: { function: functionName, args }, stateStatus: "accepted" }], id);
}

function parseResult(raw: any): any {
  if (!raw) return null;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (t === "not found" || t === "") return null;
    try { return JSON.parse(t); } catch { return t; }
  }
  return raw;
}

export async function GET() {
  try {
    const countData = await callContract("get_submission_count", []);
    const count = Number(countData?.result ?? 0);

    if (count === 0) {
      return NextResponse.json({ submissions: [], summary: "No contributions yet — be the first to submit!" });
    }

    const recent: any[] = [];
    const start = Math.max(1, count - 4);

    for (let i = count; i >= start; i--) {
      const sid = "VRD-" + String(i).padStart(3, "0");
      try {
        const subData = await callContract("get_submission", [sid], i);
        const parsed = parseResult(subData?.result);
        if (parsed && typeof parsed === "object") recent.push(parsed);
      } catch {
        // skip
      }
    }

    let summary = "Builders are actively contributing to the GenLayer ecosystem.";

    if (recent.length > 0 && process.env.ANTHROPIC_API_KEY) {
      try {
        const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 120,
            messages: [{
              role: "user",
              content: `You are an assistant for VeriDict, an AI-powered contribution evaluator on GenLayer blockchain.

Latest ${recent.length} contributions on the platform:
${recent.map((s, i) => `${i + 1}. [${s.id}] "${s.title}" by ${s.contributor} — ${s.category} — ${s.status}`).join("\n")}

Write a punchy 1-2 sentence summary of what builders are working on. Be specific about the titles. Max 50 words. No markdown.`,
            }],
          }),
        });
        const aiData = await aiRes.json();
        if (aiData?.content?.[0]?.text) summary = aiData.content[0].text;
      } catch (err) {
        console.error("AI summary error:", err);
      }
    }

    return NextResponse.json({ submissions: recent, summary });
  } catch (err) {
    console.error("AI feed error:", err);
    return NextResponse.json({ submissions: [], summary: "Unable to load feed right now." });
  }
}