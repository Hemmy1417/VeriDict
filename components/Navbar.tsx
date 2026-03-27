"use client";

import { useState } from "react";
import { AccountPanel } from "./AccountPanel";
import { SubmitContributionModal } from "./SubmitContributionModal";
import { useSubmissions } from "@/lib/hooks/useVeriDict";

export function Navbar() {
  const { data: submissions = [] } = useSubmissions();
  const pending  = submissions.filter((s: any) => s.status === "pending").length;
  const accepted = submissions.filter((s: any) => s.status === "accepted" || s.status === "accepted_with_feedback").length;

  return (
    <nav className="vd-nav">
      <div className="vd-nav-inner">
        {/* Logo */}
        <div className="vd-logo">
          <div className="vd-logo-mark">V</div>
          VERIDICT
        </div>

        {/* Centre stats */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>Submissions</span>
            <span style={{ fontFamily: "var(--head)", fontSize: "0.95rem", fontWeight: 800, color: "var(--accent)" }}>{submissions.length}</span>
          </div>
          <div style={{ width: "1px", height: "14px", background: "var(--line2)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>Accepted</span>
            <span style={{ fontFamily: "var(--head)", fontSize: "0.95rem", fontWeight: 800, color: "var(--green)" }}>{accepted}</span>
          </div>
          <div style={{ width: "1px", height: "14px", background: "var(--line2)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>Pending</span>
            <span style={{ fontFamily: "var(--head)", fontSize: "0.95rem", fontWeight: 800, color: "var(--gold)" }}>{pending}</span>
          </div>
        </div>

        {/* Right — submit + wallet */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <SubmitContributionModal />
          <AccountPanel />
        </div>
      </div>
    </nav>
  );
}