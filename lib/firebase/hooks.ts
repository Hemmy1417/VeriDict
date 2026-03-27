"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fbGetSubmissions,
  fbGetLeaderboard,
  fbGetStats,
  fbGetRecentActivity,
  fbGetWalletSession,
  type FBSubmission,
  type FBLeaderEntry,
  type FBStats,
  type FBActivity,
  type FBWalletSession,
} from "./config";

// ── Submissions from Firebase (fast cache) ───────────────────────

export function useFBSubmissions() {
  return useQuery<FBSubmission[], Error>({
    queryKey: ["fb_submissions"],
    queryFn:  fbGetSubmissions,
    staleTime: 20000,
    refetchInterval: 30000,
  });
}

// ── Leaderboard from Firebase ────────────────────────────────────

export function useFBLeaderboard() {
  return useQuery<FBLeaderEntry[], Error>({
    queryKey: ["fb_leaderboard"],
    queryFn:  async () => {
      const data = await fbGetLeaderboard();
      return data.sort((a, b) => b.total_score - a.total_score);
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

// ── Global stats from Firebase ────────────────────────────────────

export function useFBStats() {
  return useQuery<FBStats | null, Error>({
    queryKey: ["fb_stats"],
    queryFn:  fbGetStats,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

// ── Recent activity feed from Firebase ───────────────────────────

export function useFBActivity(limit = 10) {
  return useQuery<FBActivity[], Error>({
    queryKey: ["fb_activity", limit],
    queryFn:  () => fbGetRecentActivity(limit),
    staleTime: 15000,
    refetchInterval: 20000,
  });
}

// ── Single wallet session from Firebase ──────────────────────────

export function useFBWalletSession(address: string | null) {
  return useQuery<FBWalletSession | null, Error>({
    queryKey: ["fb_wallet", address],
    queryFn:  () => address ? fbGetWalletSession(address) : Promise.resolve(null),
    enabled:  !!address,
    staleTime: 20000,
  });
}