"use client";

// Firebase Realtime Database integration for VeriDict
// Mirrors on-chain data for fast reads and real-time UI updates

const FIREBASE_URL = process.env.NEXT_PUBLIC_FIREBASE_URL || "https://veridict-9b07f-default-rtdb.firebaseio.com";

// ── Low-level REST helpers (no Firebase SDK needed) ───────────────

async function fbGet(path: string): Promise<any> {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fbSet(path: string, data: any): Promise<boolean> {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function fbPatch(path: string, data: any): Promise<boolean> {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function fbPush(path: string, data: any): Promise<string | null> {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.name ?? null;
  } catch {
    return null;
  }
}

// ── Submissions ───────────────────────────────────────────────────

export interface FBSubmission {
  id: string;
  contributor: string;
  title: string;
  category: string;
  url: string;
  description?: string;
  status: string;
  consensus_score?: number;
  quality_score?: number;
  originality_score?: number;
  impact_score?: number;
  submitted_at: number;
  evaluated_at?: number;
  tx_hash?: string;
}

export async function fbGetSubmissions(): Promise<FBSubmission[]> {
  const data = await fbGet("submissions");
  if (!data || typeof data !== "object") return [];
  return Object.values(data) as FBSubmission[];
}

export async function fbGetSubmission(id: string): Promise<FBSubmission | null> {
  return fbGet(`submissions/${id}`);
}

export async function fbSaveSubmission(sub: FBSubmission): Promise<boolean> {
  return fbSet(`submissions/${sub.id}`, { ...sub, updated_at: Date.now() });
}

export async function fbUpdateSubmissionStatus(
  id: string,
  status: string,
  scores?: { consensus_score?: number; quality_score?: number; originality_score?: number; impact_score?: number }
): Promise<boolean> {
  return fbPatch(`submissions/${id}`, {
    status,
    ...scores,
    evaluated_at: Date.now(),
  });
}

// ── Leaderboard ───────────────────────────────────────────────────

export interface FBLeaderEntry {
  contributor: string;
  accepted_count: number;
  total_score: number;
  best_score: number;
  last_updated: number;
}

export async function fbGetLeaderboard(): Promise<FBLeaderEntry[]> {
  const data = await fbGet("leaderboard");
  if (!data || typeof data !== "object") return [];
  return Object.values(data) as FBLeaderEntry[];
}

export async function fbUpdateLeaderboard(
  contributor: string,
  score: number
): Promise<boolean> {
  const existing: FBLeaderEntry | null = await fbGet(`leaderboard/${contributor.replace(/[.$#\[\]/]/g, "_")}`);
  const entry: FBLeaderEntry = {
    contributor,
    accepted_count: (existing?.accepted_count ?? 0) + 1,
    total_score:    (existing?.total_score    ?? 0) + score,
    best_score:     Math.max(existing?.best_score ?? 0, score),
    last_updated:   Date.now(),
  };
  return fbSet(`leaderboard/${contributor.replace(/[.$#\[\]/]/g, "_")}`, entry);
}

// ── Wallet sessions ───────────────────────────────────────────────

export interface FBWalletSession {
  address: string;
  connected_at: number;
  last_seen: number;
  submission_count: number;
  accepted_count: number;
  total_score: number;
}

export async function fbGetWalletSession(address: string): Promise<FBWalletSession | null> {
  return fbGet(`wallets/${address.toLowerCase()}`);
}

export async function fbUpsertWalletSession(address: string): Promise<boolean> {
  const key = address.toLowerCase();
  const existing = await fbGet(`wallets/${key}`);
  return fbPatch(`wallets/${key}`, {
    address,
    connected_at:  existing?.connected_at ?? Date.now(),
    last_seen:     Date.now(),
    submission_count: existing?.submission_count ?? 0,
    accepted_count:   existing?.accepted_count   ?? 0,
    total_score:      existing?.total_score       ?? 0,
  });
}

export async function fbIncrementWalletStat(
  address: string,
  field: "submission_count" | "accepted_count",
  delta = 1
): Promise<boolean> {
  const key = address.toLowerCase();
  const existing = await fbGet(`wallets/${key}`);
  if (!existing) return false;
  return fbPatch(`wallets/${key}`, {
    [field]: (existing[field] ?? 0) + delta,
    last_seen: Date.now(),
  });
}

// ── Activity feed ─────────────────────────────────────────────────

export interface FBActivity {
  type: "submitted" | "evaluated" | "challenged" | "connected";
  actor: string;
  subject?: string;
  detail?: string;
  timestamp: number;
}

export async function fbLogActivity(activity: FBActivity): Promise<void> {
  await fbPush("activity", activity);
}

export async function fbGetRecentActivity(limit = 10): Promise<FBActivity[]> {
  const data = await fbGet("activity");
  if (!data || typeof data !== "object") return [];
  const all = Object.values(data) as FBActivity[];
  return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

// ── Stats ─────────────────────────────────────────────────────────

export interface FBStats {
  total_submissions: number;
  total_accepted: number;
  total_disputed: number;
  total_wallets: number;
  last_synced: number;
}

export async function fbGetStats(): Promise<FBStats | null> {
  return fbGet("stats");
}

export async function fbUpdateStats(stats: Partial<FBStats>): Promise<boolean> {
  return fbPatch("stats", { ...stats, last_synced: Date.now() });
}

export { fbGet, fbSet, fbPatch, FIREBASE_URL };