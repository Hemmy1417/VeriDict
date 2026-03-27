"use client";

import { useState } from "react";
import { useWallet } from "@/lib/genlayer/wallet";
import { useSubmitContribution } from "@/lib/hooks/useVeriDict";
import { error } from "@/lib/utils/toast";
import type { SubmitContributionInput } from "@/lib/contracts/types";

const CATEGORIES = [
  { value: "code",      label: "Code / Open Source" },
  { value: "design",    label: "Design / UI/UX" },
  { value: "proposal",  label: "Project Proposal" },
  { value: "research",  label: "Research / Documentation" },
  { value: "community", label: "Community / Education" },
];

export function SubmitContributionModal() {
  const { address, isConnected } = useWallet();
  const { submitContribution, isSubmitting, isSuccess } = useSubmitContribution();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ contributor: "", title: "", category: "", url: "", description: "" });

  const set = (k: string, v: string) => setForm((f: typeof form) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!isConnected || !address) { error("Connect your wallet first"); return; }
    const { contributor, title, category, url, description } = form;
    if (!contributor || !title || !category || !url || !description) { error("Missing Fields", { description: "Please fill in all required fields." }); return; }
    submitContribution({ contributor, title, category, url, description } as SubmitContributionInput, {
      onSuccess: () => { setOpen(false); setForm({ contributor: "", title: "", category: "", url: "", description: "" }); },
    });
  };

  return (
    <>
      <button className="vd-btn vd-btn-accent" onClick={() => setOpen(true)}>Submit Contribution</button>

      {open && (
        <div className="vd-modal-bg" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.target === e.currentTarget && !isSubmitting && setOpen(false)}>
          <div className="vd-modal" style={{ maxWidth: "680px" }}>
            <button className="vd-modal-close" onClick={() => !isSubmitting && setOpen(false)}>✕</button>

            <div className="vd-modal-title">Submit a Contribution</div>
            <div className="vd-modal-sub">Your work will be evaluated by 3 independent AI agents under identical criteria. Results are posted on-chain and open to dispute for 72 hours.</div>

            <div className="vd-form-group">
              <label className="vd-form-label">Contributor Name / Handle</label>
              <input className="vd-form-input" placeholder="e.g. alice.eth" value={form.contributor} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("contributor", e.target.value)} />
            </div>
            <div className="vd-form-group">
              <label className="vd-form-label">Contribution Title</label>
              <input className="vd-form-input" placeholder="e.g. GenLayer SDK Integration for Python" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("title", e.target.value)} />
            </div>
            <div className="vd-form-group">
              <label className="vd-form-label">Category</label>
              <select className="vd-form-select" value={form.category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("category", e.target.value)}>
                <option value="">Select a category…</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="vd-form-group">
              <label className="vd-form-label">GitHub / Resource URL</label>
              <input className="vd-form-input" placeholder="https://github.com/your-org/your-repo" value={form.url} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("url", e.target.value)} />
              <div className="vd-form-hint">Link to your code repository, design file, or written proposal</div>
            </div>
            <div className="vd-form-group">
              <label className="vd-form-label">Description</label>
              <textarea className="vd-form-textarea" placeholder="Describe your contribution, its purpose, and its impact on the GenLayer ecosystem…" value={form.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("description", e.target.value)} style={{ minHeight: "120px" }} />
            </div>

            <div style={{ borderTop: "1px solid var(--line)", marginTop: "8px", paddingTop: "24px" }}>
              <div style={{ padding: "14px 16px", background: "var(--accent2)", border: "1px solid rgba(0,245,212,.15)", borderRadius: "var(--r)", marginBottom: "20px" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--accent)", fontWeight: 600, marginBottom: "4px" }}>⚡ Evaluation Process</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.6 }}>
                  3 AI agents will independently score your submission on <strong style={{ color: "var(--text)" }}>quality (40%)</strong>, <strong style={{ color: "var(--text)" }}>originality (30%)</strong>, and <strong style={{ color: "var(--text)" }}>impact (30%)</strong>. Results are posted on-chain within minutes. Score ≥75 = Accepted.
                </div>
              </div>

              {!isConnected && (
                <div style={{ padding: "12px 14px", background: "var(--gold2)", border: "1px solid rgba(245,200,66,.2)", borderRadius: "var(--r)", marginBottom: "16px", fontSize: "0.82rem", color: "var(--gold)" }}>
                  ⚠ Connect your wallet to submit
                </div>
              )}

              <button className="vd-btn vd-btn-accent vd-btn-full" style={{ padding: "14px", fontSize: "1rem" }} onClick={handleSubmit} disabled={isSubmitting || !isConnected}>
                {isSubmitting ? "Submitting to GenLayer…" : "Submit for AI Evaluation →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}