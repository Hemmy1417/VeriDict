"use client";

import React, { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { SubmissionsTable } from "@/components/SubmissionsTable";
import { Leaderboard } from "@/components/Leaderboard";
import { AiFeed } from "@/components/AiFeed";
import { FirebaseDashboard } from "@/components/FirebaseDashboard";
import { useWallet } from "@/lib/genlayer/wallet";
import { onWalletConnected } from "@/lib/firebase/sync";

function WalletSyncEffect() {
  const { address, isConnected } = useWallet();
  useEffect(() => {
    if (isConnected && address) {
      onWalletConnected(address).catch(() => {});
    }
  }, [isConnected, address]);
  return null;
}

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <WalletSyncEffect />
      <Navbar />

      <main style={{ flexGrow: 1, paddingBottom: "80px" }}>
        <div className="vd-app">

          {/* ── Hero ── */}
          <div className="vd-hero">
            <div>
              <div className="vd-hero-eyebrow">GenLayer Studio</div>
              <h1 className="vd-hero-title">Evaluate Builder<br /><span>Contributions</span><br />On-Chain</h1>
              <p className="vd-hero-sub">AI-powered grant evaluation governed by optimistic democracy. Every submission reviewed by independent AI agents, scored transparently, and open to community dispute.</p>
            </div>
            <div className="vd-hero-visual">
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--accent)", letterSpacing: ".1em", marginBottom: "16px", textTransform: "uppercase" }}>Evaluation Flow</div>
              <div className="vd-flow-steps">
                <div className="vd-flow-step"><div className="vd-flow-num blue">01</div><div className="vd-flow-text"><strong style={{ color: "var(--text)" }}>Contribution Submitted</strong> — GitHub, design, or proposal</div></div>
                <div className="vd-flow-connector" />
                <div className="vd-flow-step"><div className="vd-flow-num teal">02</div><div className="vd-flow-text"><strong style={{ color: "var(--text)" }}>Intelligent Contract Triggered</strong> — on GenLayer Studio</div></div>
                <div className="vd-flow-connector" />
                <div className="vd-flow-step"><div className="vd-flow-num blue">03</div><div className="vd-flow-text"><strong style={{ color: "var(--text)" }}>3 AI Agents Evaluate</strong> — quality, originality, impact</div></div>
                <div className="vd-flow-connector" />
                <div className="vd-flow-step"><div className="vd-flow-num gold">04</div><div className="vd-flow-text"><strong style={{ color: "var(--text)" }}>Consensus Score Posted</strong> — weighted median on-chain</div></div>
                <div className="vd-flow-connector" />
                <div className="vd-flow-step"><div className="vd-flow-num green">05</div><div className="vd-flow-text"><strong style={{ color: "var(--text)" }}>Optimistically Accepted</strong> — 72h dispute window opens</div></div>
                <div className="vd-flow-connector" />
                <div className="vd-flow-step"><div className="vd-flow-num red">06</div><div className="vd-flow-text"><strong style={{ color: "var(--text)" }}>Challenge or Finalise</strong> — stake-based resolution</div></div>
              </div>
            </div>
          </div>

          {/* ── Firebase real-time dashboard ── */}
          <FirebaseDashboard />

          {/* ── Divider ── */}
          <div style={{ borderTop: "1px solid var(--line)", margin: "56px 0 48px", position: "relative" }}>
            <span style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "var(--ink)", padding: "0 16px", fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase" }}>On-Chain Registry</span>
          </div>

          {/* ── Live on-chain table + sidebar ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", marginBottom: "48px" }}>
            <SubmissionsTable />
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <Leaderboard />
              <AiFeed />
            </div>
          </div>

          {/* ── How it works ── */}
          <div style={{ padding: "32px", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--rl)", marginBottom: "48px" }}>
            <div className="vd-section-eyebrow" style={{ marginBottom: "8px" }}>Architecture</div>
            <div className="vd-section-title" style={{ fontSize: "1.4rem", marginBottom: "24px" }}>How VERIDICT Works</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {[
                { icon: "🤖", title: "Intelligent Contracts", color: "var(--accent2)", border: "rgba(0,245,212,.2)", desc: "AI agents are embedded directly into GenLayer smart contracts — evaluation happens on-chain, not off." },
                { icon: "⚖️", title: "Optimistic Democracy",  color: "var(--gold2)",   border: "rgba(245,200,66,.2)",   desc: "Results are accepted by default. Any community member can stake tokens to dispute within 72 hours." },
                { icon: "⚡", title: "Equivalence Principle",  color: "rgba(188,162,255,.1)", border: "rgba(188,162,255,.2)", desc: "Every submission evaluated under identical AI models, criteria, and weights. Zero favouritism." },
              ].map(item => (
                <div key={item.title} className="vd-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: item.color, border: `1px solid ${item.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>{item.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{item.title}</div>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--line)", padding: "20px 0", position: "relative", zIndex: 1 }}>
        <div className="vd-app" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--muted2)", letterSpacing: ".08em" }}>VERIDICT · GENLAYER BRADBURY TESTNET</div>
          <div style={{ display: "flex", gap: "24px" }}>
            {[["Powered by GenLayer","https://genlayer.com"],["Studio","https://studio.genlayer.com"],["Docs","https://docs.genlayer.com"],["GitHub","https://github.com/genlayerlabs"]].map(([label, href]) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.82rem", color: "var(--muted)", textDecoration: "none" }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--accent)")} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--muted)")}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
