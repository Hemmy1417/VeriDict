"use client";

import React, { useState } from "react";
import { useFBSubmissions, useFBLeaderboard, useFBStats, useFBActivity, useFBWalletSession } from "@/lib/firebase/hooks";
import { useWallet } from "@/lib/genlayer/wallet";
import { AddressDisplay } from "./AddressDisplay";

const CATEGORY_EMOJI: Record<string, string> = { code: "💻", design: "🎨", proposal: "📋", research: "📚", community: "🌐" };
const MEDALS = ["gold", "silver", "bronze"];
const ICONS  = ["🥇", "🥈", "🥉"];
const AVATARS = ["🐉","🦅","🦁","🐺","🦊","🐨","🐯","🦋"];

type Tab = "contributions" | "leaderboard" | "activity" | "wallet";

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    accepted: "vd-badge vd-badge-accepted",
    accepted_with_feedback: "vd-badge vd-badge-feedback",
    rejected: "vd-badge vd-badge-rejected",
    disputed: "vd-badge vd-badge-disputed",
    pending:  "vd-badge vd-badge-pending",
    evaluated: "vd-badge vd-badge-accepted",
  };
  const labels: Record<string, string> = {
    accepted: "✓ Accepted", accepted_with_feedback: "⚠ Feedback",
    rejected: "✕ Rejected", disputed: "⚖ Disputed",
    pending: "⟳ Pending", evaluated: "✓ Evaluated",
  };
  return <span className={map[status] ?? "vd-badge vd-badge-pending"}>{labels[status] ?? status}</span>;
}

function ScoreBar({ score }: { score?: number }) {
  if (!score) return <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "0.78rem" }}>—</span>;
  const color = score >= 75 ? "var(--accent)" : score >= 50 ? "var(--gold)" : "var(--red)";
  return (
    <div>
      <span style={{ fontFamily: "var(--head)", fontSize: "1rem", fontWeight: 800, color }}>{score}</span>
      <span style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--muted)" }}>/100</span>
      <div className="vd-progress-bar" style={{ width: "48px" }}>
        <div className="vd-progress-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export function FirebaseDashboard() {
  const [tab, setTab] = useState<Tab>("contributions");
  const [statusFilter, setStatusFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const { address, isConnected } = useWallet();
  const { data: subs = [],       isLoading: loadSubs }  = useFBSubmissions();
  const { data: leaders = [],    isLoading: loadLead }  = useFBLeaderboard();
  const { data: stats }                                  = useFBStats();
  const { data: activity = [],   isLoading: loadAct }   = useFBActivity(20);
  const { data: walletSess }                             = useFBWalletSession(address ?? null);

  const filtered = subs.filter((s: any) =>
    (!statusFilter || s.status === statusFilter) &&
    (!catFilter    || s.category === catFilter)
  );

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: "8px 18px", borderRadius: "8px", border: "none",
        fontFamily: "var(--body)", fontSize: "0.82rem", fontWeight: 500,
        color: tab === t ? "var(--text)" : "var(--muted)",
        background: tab === t ? "var(--ink3)" : "none",
        cursor: "pointer", transition: "all .18s",
      }}
    >{label}</button>
  );

  return (
    <div style={{ marginTop: "48px" }}>
      {/* ── Stats strip (live from Firebase) ── */}
      <div className="vd-stats-strip" style={{ marginBottom: "32px" }}>
        <div className="vd-stat-block">
          <div className="vd-stat-val teal">{stats?.total_submissions ?? subs.length}</div>
          <div className="vd-stat-label">Total Submissions</div>
        </div>
        <div className="vd-stat-block">
          <div className="vd-stat-val" style={{ color: "var(--green)" }}>{stats?.total_accepted ?? subs.filter((s: any) => s.status === "accepted" || s.status === "accepted_with_feedback").length}</div>
          <div className="vd-stat-label">Accepted</div>
        </div>
        <div className="vd-stat-block">
          <div className="vd-stat-val gold">{stats?.total_disputed ?? subs.filter((s: any) => s.status === "disputed").length}</div>
          <div className="vd-stat-label">Disputed</div>
        </div>
        <div className="vd-stat-block">
          <div className="vd-stat-val purple">{leaders.length}</div>
          <div className="vd-stat-label">Contributors</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: "2px", background: "var(--card)", borderRadius: "var(--r)", padding: "3px", width: "fit-content", marginBottom: "28px" }}>
        {tabBtn("contributions", "Contributions")}
        {tabBtn("leaderboard",   "Leaderboard")}
        {tabBtn("activity",      "Activity Feed")}
        {isConnected && tabBtn("wallet", "My Wallet")}
      </div>

      {/* ══ CONTRIBUTIONS TAB ══ */}
      {tab === "contributions" && (
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            <select className="vd-form-select" style={{ width: "auto" }} value={statusFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="accepted">Accepted</option>
              <option value="accepted_with_feedback">Feedback</option>
              <option value="rejected">Rejected</option>
              <option value="disputed">Disputed</option>
              <option value="pending">Pending</option>
            </select>
            <select className="vd-form-select" style={{ width: "auto" }} value={catFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              <option value="code">Code</option>
              <option value="design">Design</option>
              <option value="proposal">Proposal</option>
              <option value="research">Research</option>
              <option value="community">Community</option>
            </select>
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--muted)", alignSelf: "center", marginLeft: "4px" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadSubs ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "0.78rem" }}>Loading from Firebase…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--rl)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📭</div>
              <div style={{ color: "var(--muted)" }}>No contributions found</div>
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
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.sort((a: any, b: any) => (b.submitted_at ?? 0) - (a.submitted_at ?? 0)).map((sub: any) => (
                    <tr key={sub.id}>
                      <td className="vd-td-mono">{sub.id}</td>
                      <td style={{ maxWidth: "220px" }}>
                        <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.title}</div>
                        {sub.url && <a href={sub.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.72rem", color: "var(--accent)", opacity: 0.7, textDecoration: "none" }}>{sub.url.replace(/^https?:\/\//, "").slice(0, 30)}</a>}
                      </td>
                      <td><span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--muted)" }}>{CATEGORY_EMOJI[sub.category] ?? "📄"} {sub.category}</span></td>
                      <td><ScoreBar score={sub.consensus_score} /></td>
                      <td><Badge status={sub.status} /></td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--muted)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {sub.contributor.length > 16 ? sub.contributor.slice(0,6) + "…" + sub.contributor.slice(-4) : sub.contributor}
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: "0.68rem", color: "var(--muted2)", whiteSpace: "nowrap" }}>
                        {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══ LEADERBOARD TAB ══ */}
      {tab === "leaderboard" && (
        <div>
          {loadLead ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "0.78rem" }}>Loading leaderboard…</div>
          ) : leaders.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--rl)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🏆</div>
              <div style={{ color: "var(--muted)" }}>No accepted contributions yet</div>
            </div>
          ) : (
            <div style={{ maxWidth: "680px" }}>
              {leaders.map((l: any, i: number) => (
                <div className="vd-lb-row" key={l.contributor}>
                  <div className={`vd-lb-pos ${MEDALS[i] ?? ""}`}>{ICONS[i] ?? `#${i+1}`}</div>
                  <div className="vd-lb-avatar">{AVATARS[i % AVATARS.length]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="vd-lb-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.contributor.length > 20 ? l.contributor.slice(0,6)+"…"+l.contributor.slice(-4) : l.contributor}
                    </div>
                    <div className="vd-lb-meta">{l.accepted_count} accepted · Best: {l.best_score}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="vd-lb-score">{l.total_score}</div>
                    <div className="vd-lb-count">total pts</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ ACTIVITY FEED TAB ══ */}
      {tab === "activity" && (
        <div style={{ maxWidth: "680px" }}>
          {loadAct ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "0.78rem" }}>Loading activity…</div>
          ) : activity.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--rl)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>✦</div>
              <div style={{ color: "var(--muted)" }}>No activity yet</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {activity.map((act: any, i: number) => {
                const typeStyle: Record<string, { icon: string; color: string }> = {
                  submitted:  { icon: "📤", color: "var(--accent)" },
                  evaluated:  { icon: "🤖", color: "var(--green)" },
                  challenged: { icon: "⚖️", color: "var(--gold)" },
                  connected:  { icon: "🔗", color: "var(--purple)" },
                };
                const t = typeStyle[act.type] ?? { icon: "✦", color: "var(--muted)" };
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--r)" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--ink3)", border: "1px solid var(--line2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{t.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 500, color: t.color, textTransform: "capitalize" }}>{act.type}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {act.actor.length > 20 ? act.actor.slice(0,6)+"…"+act.actor.slice(-4) : act.actor}
                        {act.detail ? ` — ${act.detail}` : ""}
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--muted2)", flexShrink: 0 }}>
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ MY WALLET TAB ══ */}
      {tab === "wallet" && isConnected && (
        <div style={{ maxWidth: "560px" }}>
          <div style={{ padding: "24px", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--rl)", marginBottom: "20px" }}>
            <div className="vd-section-eyebrow" style={{ marginBottom: "16px" }}>Connected Wallet</div>
            <code style={{ fontFamily: "var(--mono)", fontSize: "0.82rem", color: "var(--accent)", wordBreak: "break-all" }}>{address}</code>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
            {[
              { label: "Submissions", val: walletSess?.submission_count ?? subs.filter((s: any) => s.contributor?.toLowerCase() === address?.toLowerCase()).length, color: "var(--accent)" },
              { label: "Accepted",    val: walletSess?.accepted_count   ?? subs.filter((s: any) => s.contributor?.toLowerCase() === address?.toLowerCase() && s.status === "accepted").length, color: "var(--green)" },
              { label: "Total Score", val: walletSess?.total_score      ?? subs.filter((s: any) => s.contributor?.toLowerCase() === address?.toLowerCase()).reduce((sum: number, s: any) => sum + (s.consensus_score ?? 0), 0), color: "var(--purple)" },
            ].map(stat => (
              <div key={stat.label} style={{ padding: "20px 16px", background: "var(--card2)", border: "1px solid var(--line)", borderRadius: "var(--r)", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--head)", fontSize: "1.8rem", fontWeight: 800, color: stat.color }}>{stat.val}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--muted)", marginTop: "4px", letterSpacing: ".06em", textTransform: "uppercase" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="vd-section-eyebrow" style={{ marginBottom: "14px" }}>My Contributions</div>
            {subs.filter((s: any) => s.contributor?.toLowerCase() === address?.toLowerCase()).length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--rl)", color: "var(--muted)", fontSize: "0.85rem" }}>
                You haven&apos;t submitted any contributions yet
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {subs.filter((s: any) => s.contributor?.toLowerCase() === address?.toLowerCase()).map((sub: any) => (
                  <div key={sub.id} className="vd-lb-row">
                    <div className="vd-lb-avatar">{CATEGORY_EMOJI[sub.category] ?? "📄"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="vd-lb-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.title}</div>
                      <div className="vd-lb-meta">{sub.id} · {new Date(sub.submitted_at ?? 0).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Badge status={sub.status} />
                      {sub.consensus_score != null && (
                        <div style={{ fontFamily: "var(--head)", fontSize: "0.95rem", fontWeight: 800, color: sub.consensus_score >= 75 ? "var(--accent)" : sub.consensus_score >= 50 ? "var(--gold)" : "var(--red)", marginTop: "4px" }}>{sub.consensus_score}/100</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
