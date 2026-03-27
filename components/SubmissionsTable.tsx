"use client";

import { useSubmissions, useEvaluateSubmission, useVeriDictContract } from "@/lib/hooks/useVeriDict";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { AddressDisplay } from "./AddressDisplay";
import type { Submission } from "@/lib/contracts/types";

const CATEGORY_EMOJI: Record<string, string> = { code: "💻", design: "🎨", proposal: "📋", research: "📚", community: "🌐" };
const CATEGORY_LABEL: Record<string, string> = { code: "Code", design: "Design", proposal: "Proposal", research: "Research", community: "Community" };

function Badge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    accepted:               { cls: "vd-badge vd-badge-accepted",  label: "✓ Accepted" },
    accepted_with_feedback: { cls: "vd-badge vd-badge-feedback",  label: "⚠ Feedback" },
    rejected:               { cls: "vd-badge vd-badge-rejected",  label: "✕ Rejected" },
    disputed:               { cls: "vd-badge vd-badge-disputed",  label: "⚖ Disputed" },
    pending:                { cls: "vd-badge vd-badge-pending",   label: "⟳ Pending" },
  };
  const b = map[status] ?? { cls: "vd-badge vd-badge-pending", label: status };
  return <span className={b.cls}>{b.label}</span>;
}

function ScoreCell({ score }: { score?: number }) {
  if (score == null) return <span style={{ fontFamily: "var(--muted)", color: "var(--muted)" }}>—</span>;
  const color = score >= 75 ? "var(--accent)" : score >= 50 ? "var(--gold)" : "var(--red)";
  return (
    <div>
      <span style={{ fontFamily: "var(--head)", fontSize: "1rem", fontWeight: 800, color }}>{score}</span>
      <span style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--muted)" }}>/100</span>
      <div className="vd-progress-bar" style={{ width: "48px", marginTop: "4px" }}>
        <div className="vd-progress-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export function SubmissionsTable() {
  const contract = useVeriDictContract();
  const { data: submissions, isLoading, isError } = useSubmissions();
  const { address, isConnected, isLoading: walletLoading } = useWallet();
  const { evaluateSubmission, isEvaluating, evaluatingId } = useEvaluateSubmission();

  const handleEvaluate = (id: string) => {
    if (!address) { error("Please connect your wallet to trigger evaluation"); return; }
    if (confirm("Trigger AI evaluation? Three independent agents will score this submission on-chain.")) evaluateSubmission(id);
  };

  if (isLoading) return (
    <div style={{ padding: "48px", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", color: "var(--muted)" }}>Loading submissions…</div>
    </div>
  );

  if (!contract) return (
    <div style={{ padding: "48px", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--head)", fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>Setup Required</div>
      <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Set <code style={{ fontFamily: "var(--mono)", color: "var(--accent)" }}>NEXT_PUBLIC_CONTRACT_ADDRESS</code> in your .env file.</div>
    </div>
  );

  if (isError) return (
    <div style={{ padding: "32px", textAlign: "center" }}>
      <div style={{ fontSize: "0.85rem", color: "var(--red)" }}>Failed to load submissions. Please try again.</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div className="vd-section-eyebrow">On-Chain Registry</div>
          <div className="vd-section-title" style={{ fontSize: "1.6rem" }}>All Evaluations</div>
        </div>
      </div>

      {!submissions || submissions.length === 0 ? (
        <div style={{ padding: "64px", textAlign: "center", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--rl)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📭</div>
          <div style={{ fontFamily: "var(--head)", fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>No Submissions Yet</div>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Be the first to submit a contribution for AI evaluation!</div>
        </div>
      ) : (
        <div className="vd-table-wrap">
          <table className="vd-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Score</th>
                <th>Status</th>
                <th>Contributor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <SubmissionRow
                  key={sub.id}
                  sub={sub}
                  currentAddress={address ?? null}
                  canEvaluate={!!isConnected && !!address && !walletLoading && sub.status === "pending"}
                  isEvaluating={isEvaluating && evaluatingId === sub.id}
                  onEvaluate={handleEvaluate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ sub, currentAddress, canEvaluate, isEvaluating, onEvaluate }: {
  sub: Submission & { consensus_score?: number };
  currentAddress: string | null;
  canEvaluate: boolean;
  isEvaluating: boolean;
  onEvaluate: (id: string) => void;
}) {
  const isOwner = currentAddress?.toLowerCase() === sub.contributor?.toLowerCase();
  const urlShort = sub.url ? sub.url.replace(/^https?:\/\//, "").slice(0, 28) : "";

  return (
    <tr>
      <td className="vd-td-mono">{sub.id}</td>
      <td style={{ maxWidth: "200px" }}>
        <div style={{ fontWeight: 500, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.title}</div>
        {sub.url && <div style={{ fontSize: "0.72rem", color: "var(--accent)", opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{urlShort}</div>}
      </td>
      <td>
        <span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--muted)" }}>{CATEGORY_EMOJI[sub.category] ?? "📄"} {CATEGORY_LABEL[sub.category] ?? sub.category}</span>
      </td>
      <td><ScoreCell score={(sub as any).consensus_score} /></td>
      <td><Badge status={sub.status} /></td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <AddressDisplay address={sub.contributor} maxLength={10} showCopy={true} />
          {isOwner && <span className="vd-badge" style={{ background: "var(--gl-dim)", color: "#7b8fff", borderColor: "rgba(17,15,255,.25)" }}>You</span>}
        </div>
      </td>
      <td>
        {canEvaluate && (
          <button className="vd-btn vd-btn-accent vd-btn-sm" onClick={() => onEvaluate(sub.id)} disabled={isEvaluating}>
            {isEvaluating ? "Evaluating…" : "Evaluate"}
          </button>
        )}
        {sub.status !== "pending" && (
          <button className="vd-btn vd-btn-ghost vd-btn-sm" onClick={() => window.dispatchEvent(new CustomEvent("veridict:view", { detail: sub.id }))}>
            View →
          </button>
        )}
      </td>
    </tr>
  );
}