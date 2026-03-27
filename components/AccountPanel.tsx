"use client";

import React, { useState } from "react";
import { useWallet } from "@/lib/genlayer/wallet";
import { useContributorStats, useGenBalance } from "@/lib/hooks/useVeriDict";
import { error, userRejected } from "@/lib/utils/toast";
import { AddressDisplay } from "./AddressDisplay";

const METAMASK_URL = "https://metamask.io/download/";
const RABBY_URL    = "https://rabby.io";

export function AccountPanel() {
  const { address, isConnected, isMetaMaskInstalled, isOnCorrectNetwork, isLoading, connectWallet, disconnectWallet, switchWalletAccount } = useWallet();
  const { data: stats } = useContributorStats(address ?? null);
  const { data: genBalance = "0.0000" } = useGenBalance(address ?? null);

  const [open, setOpen]           = useState(false);
  const [connErr, setConnErr]     = useState("");
  const [isConnecting, setIsConn] = useState(false);
  const [isSwitching, setIsSw]    = useState(false);

  const handleConnect = async () => {
    try {
      setIsConn(true); setConnErr("");
      await connectWallet();
      setOpen(false);
    } catch (err: any) {
      setConnErr(err.message || "Failed to connect");
      if (err.message?.includes("rejected")) userRejected("Connection cancelled");
      else error("Failed to connect wallet", { description: err.message });
    } finally { setIsConn(false); }
  };

  const handleDisconnect = () => { disconnectWallet(); setOpen(false); };

  const handleSwitch = async () => {
    try {
      setIsSw(true); setConnErr("");
      await switchWalletAccount();
    } catch (err: any) {
      if (!err.message?.includes("rejected")) { setConnErr(err.message); error("Failed to switch", { description: err.message }); }
      else userRejected("Account switch cancelled");
    } finally { setIsSw(false); }
  };

  return (
    <>
      {!isConnected ? (
        <button className="vd-btn vd-btn-primary" onClick={() => setOpen(true)} disabled={isLoading}>
          Connect Wallet
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", background: "var(--card2)", border: "1px solid var(--line2)", borderRadius: "var(--r)", cursor: "pointer", transition: "border-color .2s" }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.borderColor = "var(--line2)")}
        >
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: isOnCorrectNetwork ? "var(--green)" : "var(--gold)", flexShrink: 0 }} />
          <span className="vd-wallet-addr" style={{ padding: 0, background: "none", border: "none", fontSize: "0.72rem" }}>
            <AddressDisplay address={address} maxLength={12} />
          </span>
          <div style={{ width: "1px", height: "12px", background: "var(--line2)" }} />
          <span style={{ fontFamily: "var(--head)", fontSize: "0.82rem", fontWeight: 800, color: "var(--accent)" }}>{genBalance}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--muted)" }}>GEN</span>
        </button>
      )}

      {open && (
        <div className="vd-modal-bg" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.target === e.currentTarget && setOpen(false)}>
          <div className="vd-modal" style={{ maxWidth: "480px" }}>
            <button className="vd-modal-close" onClick={() => setOpen(false)}>✕</button>

            {!isConnected ? (
              <>
                <div className="vd-modal-title">Connect to GenLayer</div>
                <div className="vd-modal-sub">Connect your wallet to submit and evaluate contributions on GenLayer Studio.</div>

                {!isMetaMaskInstalled ? (
                  <>
                    <div style={{ padding: "14px 16px", background: "var(--accent2)", border: "1px solid rgba(0,245,212,.2)", borderRadius: "var(--r)", marginBottom: "20px", fontSize: "0.85rem", color: "var(--accent)" }}>
                      No wallet detected. Install MetaMask or Rabby to continue.
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <button className="vd-btn vd-btn-ghost vd-btn-full" onClick={() => window.open(METAMASK_URL, "_blank")}>🦊 MetaMask</button>
                      <button className="vd-btn vd-btn-ghost vd-btn-full" onClick={() => window.open(RABBY_URL, "_blank")}>🐇 Rabby</button>
                    </div>
                  </>
                ) : (
                  <>
                    <button className="vd-btn vd-btn-accent vd-btn-full" style={{ padding: "14px", fontSize: "1rem", marginBottom: "16px" }} onClick={handleConnect} disabled={isConnecting}>
                      {isConnecting ? "Connecting…" : "Connect Wallet"}
                    </button>
                    {connErr && <div style={{ padding: "12px", background: "var(--red2)", border: "1px solid rgba(255,77,109,.25)", borderRadius: "var(--r)", fontSize: "0.82rem", color: "var(--red)", marginBottom: "12px" }}>{connErr}</div>}
                    <div style={{ padding: "14px 16px", background: "var(--card2)", borderRadius: "var(--r)", fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.6 }}>
                      Supports MetaMask and Rabby. Will prompt you to add and switch to the GenLayer Studio.
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="vd-modal-title">Wallet Details</div>
                <div className="vd-modal-sub">Your connected wallet and VeriDict stats</div>

                <div style={{ padding: "14px 16px", background: "var(--card2)", border: "1px solid var(--line2)", borderRadius: "var(--r)", marginBottom: "20px" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--muted)", marginBottom: "6px", letterSpacing: ".08em", textTransform: "uppercase" }}>Address</div>
                  <code style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", wordBreak: "break-all", color: "var(--text)" }}>{address}</code>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ background: "var(--card2)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "16px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--head)", fontSize: "1.4rem", fontWeight: 800, color: "var(--accent)" }}>{genBalance}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "var(--muted)", marginTop: "4px" }}>GEN</div>
                  </div>
                  <div style={{ background: "var(--card2)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "16px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--head)", fontSize: "1.4rem", fontWeight: 800, color: "var(--green)" }}>{stats?.accepted_count ?? 0}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "var(--muted)", marginTop: "4px" }}>ACCEPTED</div>
                  </div>
                  <div style={{ background: "var(--card2)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "16px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--head)", fontSize: "1.4rem", fontWeight: 800, color: "var(--purple)" }}>{stats?.total_score ?? 0}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "var(--muted)", marginTop: "4px" }}>SCORE</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "var(--card2)", borderRadius: "var(--r)", marginBottom: "20px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: isOnCorrectNetwork ? "var(--green)" : "var(--gold)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.85rem" }}>{isOnCorrectNetwork ? "Connected to GenLayer Studio" : "Wrong network — please switch"}</span>
                </div>

                {connErr && <div style={{ padding: "12px", background: "var(--red2)", border: "1px solid rgba(255,77,109,.25)", borderRadius: "var(--r)", fontSize: "0.82rem", color: "var(--red)", marginBottom: "16px" }}>{connErr}</div>}

                <div style={{ borderTop: "1px solid var(--line)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button className="vd-btn vd-btn-ghost vd-btn-full" onClick={handleSwitch} disabled={isSwitching}>
                    {isSwitching ? "Switching…" : "Switch Account"}
                  </button>
                  <button className="vd-btn vd-btn-danger vd-btn-full" onClick={handleDisconnect}>
                    Disconnect Wallet
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
