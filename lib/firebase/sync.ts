"use client";

/**
 * Firebase Sync Layer
 * Whenever the dApp reads data from GenLayer, this module mirrors it to Firebase.
 * This gives us fast real-time reads, leaderboard, activity feed, and wallet tracking
 * without hammering the GenLayer RPC on every render.
 */

import {
  fbSaveSubmission,
  fbUpdateSubmissionStatus,
  fbUpdateLeaderboard,
  fbUpsertWalletSession,
  fbIncrementWalletStat,
  fbLogActivity,
  fbUpdateStats,
  type FBSubmission,
} from "./config";

import type { Submission, Evaluation } from "@/lib/contracts/types";

// ── Sync a single submission to Firebase ────────────────────────

export async function syncSubmissionToFirebase(
  sub: Submission,
  evaluation?: Evaluation | null
): Promise<void> {
  try {
    const fbSub: FBSubmission = {
      id:              sub.id,
      contributor:     sub.contributor,
      title:           sub.title,
      category:        sub.category,
      url:             sub.url ?? "",
      description:     sub.description ?? "",
      status:          sub.status,
      submitted_at:    sub.submitted_at ?? Date.now(),
      consensus_score: evaluation?.consensus_score,
      quality_score:   evaluation?.quality_score,
      originality_score: evaluation?.originality_score,
      impact_score:    evaluation?.impact_score,
    };
    await fbSaveSubmission(fbSub);
  } catch (err) {
    console.warn("Firebase sync (submission) failed silently:", err);
  }
}

// ── Sync all submissions at once ─────────────────────────────────

export async function syncAllSubmissionsToFirebase(
  submissions: (Submission & { consensus_score?: number })[]
): Promise<void> {
  try {
    const accepted = submissions.filter(
      s => s.status === "accepted" || s.status === "accepted_with_feedback"
    );
    const disputed = submissions.filter(s => s.status === "disputed");

    // Sync each submission
    const syncPromises = submissions.map(sub =>
      fbSaveSubmission({
        id:              sub.id,
        contributor:     sub.contributor,
        title:           sub.title,
        category:        sub.category,
        url:             sub.url ?? "",
        status:          sub.status,
        submitted_at:    (sub as any).submitted_at ?? Date.now(),
        consensus_score: sub.consensus_score,
      })
    );

    // Update global stats
    syncPromises.push(
      fbUpdateStats({
        total_submissions: submissions.length,
        total_accepted:    accepted.length,
        total_disputed:    disputed.length,
      }) as any
    );

    await Promise.allSettled(syncPromises);
  } catch (err) {
    console.warn("Firebase sync (all submissions) failed silently:", err);
  }
}

// ── Sync after a new submission is created ───────────────────────

export async function onSubmissionCreated(
  sub: Submission,
  walletAddress: string
): Promise<void> {
  try {
    await Promise.allSettled([
      fbSaveSubmission({
        id:           sub.id,
        contributor:  sub.contributor,
        title:        sub.title,
        category:     sub.category,
        url:          sub.url ?? "",
        status:       "pending",
        submitted_at: Date.now(),
      }),
      fbIncrementWalletStat(walletAddress, "submission_count"),
      fbLogActivity({
        type:      "submitted",
        actor:     walletAddress,
        subject:   sub.id,
        detail:    sub.title,
        timestamp: Date.now(),
      }),
    ]);
  } catch (err) {
    console.warn("Firebase onSubmissionCreated failed silently:", err);
  }
}

// ── Sync after evaluation completes ─────────────────────────────

export async function onEvaluationComplete(
  submissionId: string,
  contributor: string,
  status: string,
  scores: { consensus_score: number; quality_score?: number; originality_score?: number; impact_score?: number }
): Promise<void> {
  try {
    const isAccepted = status === "accepted" || status === "accepted_with_feedback";
    await Promise.allSettled([
      fbUpdateSubmissionStatus(submissionId, status, scores),
      isAccepted ? fbUpdateLeaderboard(contributor, scores.consensus_score) : Promise.resolve(),
      isAccepted ? fbIncrementWalletStat(contributor, "accepted_count") : Promise.resolve(),
      fbLogActivity({
        type:      "evaluated",
        actor:     contributor,
        subject:   submissionId,
        detail:    `Score: ${scores.consensus_score} — ${status}`,
        timestamp: Date.now(),
      }),
    ]);
  } catch (err) {
    console.warn("Firebase onEvaluationComplete failed silently:", err);
  }
}

// ── Sync wallet connection ────────────────────────────────────────

export async function onWalletConnected(address: string): Promise<void> {
  try {
    await Promise.allSettled([
      fbUpsertWalletSession(address),
      fbLogActivity({
        type:      "connected",
        actor:     address,
        timestamp: Date.now(),
      }),
    ]);
  } catch (err) {
    console.warn("Firebase onWalletConnected failed silently:", err);
  }
}