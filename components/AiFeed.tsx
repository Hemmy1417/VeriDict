"use client";

import { useState, useEffect } from "react";

interface FeedSubmission {
  id: string;
  title: string;
  contributor: string;
  category: string;
  status: string;
  url?: string;
}

interface FeedData {
  submissions: FeedSubmission[];
  summary: string;
}

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

export function AiFeed() {
  const [data, setData]         = useState<FeedData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefresh] = useState(false);

  const load = async (isRefresh = false) => {
    isRefresh ? setRefresh(true) : setLoading(true);
    try {
      const res = await fetch("/api/ai-feed");
      setData(await res.json());
    } catch {
      setData({ submissions: [], summary: "Unable to load activity feed right now." });
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      {loading ? (
        <div style={{ padding: "32px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", color: "var(--muted)" }}>Loading feed…</div>
        </div>
      ) : data?.submissions && data.submissions.length > 0 ? (
        <>
          {data.summary && (
            <div style={{ padding: "12px 14px", background: "var(--accent2)", border: "1px solid rgba(0,245,212,.15)", borderRadius: "var(--r)", marginBottom: "16px", fontSize: "0.78rem", lineHeight: 1.6 }}>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>⚡ AI Summary: </span>
              <span style={{ color: "var(--muted)" }}>{data.summary}</span>
            </div>
          )}
          {data.submissions.map((sub: any) => (
            <div className="vd-lb-row" key={sub.id} style={{ cursor: "default" }}>
              <div className="vd-lb-avatar">{CATEGORY_EMOJI[sub.category] ?? "📄"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="vd-lb-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.83rem" }}>{sub.title}</div>
                <div className="vd-lb-meta">{sub.contributor} · {CATEGORY_LABEL[sub.category] ?? sub.category}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <Badge status={sub.status} />
                <div style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--muted)", marginTop: "4px" }}>{sub.id}</div>
              </div>
            </div>
          ))}
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            style={{ marginTop: "12px", fontSize: "0.78rem", fontFamily: "var(--mono)", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", letterSpacing: ".06em" }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.color = "var(--muted)")}
          >
            {refreshing ? "REFRESHING…" : "↻ REFRESH"}
          </button>
        </>
      ) : (
        <div style={{ padding: "32px", textAlign: "center", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--rl)" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>✦</div>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>No contributions yet — be the first!</div>
        </div>
      )}
    </div>
  );
}