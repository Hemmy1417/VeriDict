"use client";

import { useLeaderboard } from "@/lib/hooks/useVeriDict";

const MEDALS = ["gold", "silver", "bronze"];
const ICONS  = ["🥇", "🥈", "🥉"];
const AVATARS = ["🐉", "🦅", "🦁", "🐺", "🦊", "🐨", "🐯", "🦋"];

export function Leaderboard() {
  const { data: leaders = [], isLoading } = useLeaderboard();

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div className="vd-section-eyebrow">Top Builders</div>
        <div className="vd-section-title" style={{ fontSize: "1.3rem" }}>Leaderboard</div>
      </div>

      {isLoading ? (
        <div style={{ padding: "32px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", color: "var(--muted)" }}>Loading…</div>
        </div>
      ) : leaders.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--rl)" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>🏆</div>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>No accepted contributions yet</div>
        </div>
      ) : (
        <div>
          {leaders.slice(0, 10).map((leader: any, i: number) => (
            <div className="vd-lb-row" key={leader.contributor}>
              <div className={`vd-lb-pos ${MEDALS[i] ?? ""}`}>{ICONS[i] ?? `#${i + 1}`}</div>
              <div className="vd-lb-avatar">{AVATARS[i % AVATARS.length]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="vd-lb-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {leader.contributor.length > 18 ? leader.contributor.slice(0, 6) + "…" + leader.contributor.slice(-4) : leader.contributor}
                </div>
                <div className="vd-lb-meta">{leader.accepted_count} accepted</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="vd-lb-score">{leader.total_score}</div>
                <div className="vd-lb-count">total pts</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}