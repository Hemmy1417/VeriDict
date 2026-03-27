"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import VeriDict from "../contracts/VeriDict";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type {
  Submission,
  Evaluation,
  Dispute,
  LeaderboardEntry,
  ContributorStats,
  SubmitContributionInput,
  ChallengeInput,
} from "../contracts/types";
import { onSubmissionCreated, onEvaluationComplete, syncAllSubmissionsToFirebase } from "../firebase/sync";

// ── Contract instance ─────────────────────────────────────────────────

export function useVeriDictContract(): VeriDict | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  return useMemo(() => {
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file.",
        { label: "Setup Guide", onClick: () => window.open("/docs/setup", "_blank") }
      );
      return null;
    }
    return new VeriDict(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);
}

// ── GEN Token Balance ─────────────────────────────────────────────────

/**
 * Fetch the connected wallet's GEN token balance via /api/rpc proxy.
 * Refreshes every 15 seconds.
 */
export function useGenBalance(address: string | null) {
  return useQuery<string, Error>({
    queryKey: ["genBalance", address],
    queryFn: async () => {
      if (!address) return "0.0000";
      try {
        // Use dedicated balance endpoint which tries zks_getAllAccountBalances,
        // eth_getBalance, and ops/balance in order
        const res = await fetch(`/api/balance?address=${encodeURIComponent(address)}`);
        if (!res.ok) return "0.0000";
        const data = await res.json();
        if (data.display) return data.display;
        if (data.balance != null) return Number(data.balance).toFixed(4);
        return "0.0000";
      } catch {
        return "0.0000";
      }
    },
    enabled: !!address,
    refetchInterval: 60000,
    staleTime: 50000,
  });
}

// ── READ hooks ────────────────────────────────────────────────────────

export function useSubmissions() {
  const contract = useVeriDictContract();

  return useQuery<Submission[], Error>({
    queryKey: ["submissions"],
    queryFn: async () => {
      if (!contract) return [];
      const submissions = await contract.getSubmissions();

      // Fetch evaluations SEQUENTIALLY to avoid flooding the RPC with parallel calls
      const enriched: Submission[] = [];
      for (const sub of submissions) {
        if (sub.status === "pending") {
          enriched.push(sub);
          continue;
        }
        try {
          const evaluation = await contract.getEvaluation(sub.id);
          enriched.push(evaluation ? { ...sub, consensus_score: evaluation.consensus_score } : sub);
        } catch {
          enriched.push(sub);
        }
        // Small delay between calls to stay under rate limits
        await new Promise((r) => setTimeout(r, 200));
      }
      // Mirror to Firebase in background
      syncAllSubmissionsToFirebase(enriched).catch(() => {});
      return enriched;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,   // 30s — don't refetch unless data is old
    gcTime: 60000,
    enabled: !!contract,
  });
}

export function useSubmission(submissionId: string | null) {
  const contract = useVeriDictContract();
  return useQuery<Submission | null, Error>({
    queryKey: ["submission", submissionId],
    queryFn: () => (!contract || !submissionId ? Promise.resolve(null) : contract.getSubmission(submissionId)),
    enabled: !!contract && !!submissionId,
    staleTime: 30000,
  });
}

export function useEvaluation(submissionId: string | null) {
  const contract = useVeriDictContract();
  return useQuery<Evaluation | null, Error>({
    queryKey: ["evaluation", submissionId],
    queryFn: () => (!contract || !submissionId ? Promise.resolve(null) : contract.getEvaluation(submissionId)),
    enabled: !!contract && !!submissionId,
    staleTime: 30000,
  });
}

export function useDispute(submissionId: string | null) {
  const contract = useVeriDictContract();
  return useQuery<Dispute | null, Error>({
    queryKey: ["dispute", submissionId],
    queryFn: () => (!contract || !submissionId ? Promise.resolve(null) : contract.getDispute(submissionId)),
    enabled: !!contract && !!submissionId,
    staleTime: 30000,
  });
}

export function useFullRecord(submissionId: string | null) {
  const contract = useVeriDictContract();
  return useQuery({
    queryKey: ["fullRecord", submissionId],
    queryFn: () => (!contract || !submissionId ? Promise.resolve(null) : contract.getFullRecord(submissionId)),
    enabled: !!contract && !!submissionId,
    staleTime: 30000,
  });
}

export function useLeaderboard() {
  const contract = useVeriDictContract();
  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ["leaderboard"],
    queryFn: () => (!contract ? Promise.resolve([]) : contract.getLeaderboard()),
    refetchOnWindowFocus: false,
    staleTime: 60000,
    enabled: !!contract,
  });
}

export function useContributorStats(contributor: string | null) {
  const contract = useVeriDictContract();
  return useQuery<ContributorStats | null, Error>({
    queryKey: ["contributorStats", contributor],
    queryFn: () => (!contract ? Promise.resolve(null) : contract.getContributorStats(contributor)),
    enabled: !!contract && !!contributor,
    staleTime: 30000,
  });
}

export function useSubmissionCount() {
  const contract = useVeriDictContract();
  return useQuery<number, Error>({
    queryKey: ["submissionCount"],
    queryFn: () => (!contract ? Promise.resolve(0) : contract.getSubmissionCount()),
    enabled: !!contract,
    staleTime: 30000,
  });
}

// ── WRITE hooks ───────────────────────────────────────────────────────

export function useSubmitContribution() {
  const contract = useVeriDictContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: async (input: SubmitContributionInput) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsSubmitting(true);
      return contract.submit(input.contributor, input.title, input.category, input.url, input.description);
    },
    onSuccess: (receipt, input) => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["submissionCount"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["fb_submissions"] });
      setIsSubmitting(false);
      // Sync to Firebase in background
      if (address) {
        onSubmissionCreated(
          { id: "pending", contributor: input.contributor, title: input.title, category: input.category, url: input.url, status: "pending" } as any,
          address
        ).catch(() => {});
      }
      success("Contribution submitted!", {
        description: "Your work has been registered on GenLayer.",
      });
    },
    onError: (err: any) => {
      setIsSubmitting(false);
      error("Failed to submit contribution", { description: err?.message || "Please try again." });
    },
  });

  return { ...mutation, isSubmitting, isSuccess: mutation.isSuccess, submitContribution: mutation.mutate };
}

export function useEvaluateSubmission() {
  const contract = useVeriDictContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (submissionId: string) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsEvaluating(true);
      setEvaluatingId(submissionId);
      return contract.evaluate(submissionId);
    },
    onSuccess: (receipt, submissionId) => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["evaluation", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["fullRecord", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["contributorStats"] });
      queryClient.invalidateQueries({ queryKey: ["fb_submissions"] });
      queryClient.invalidateQueries({ queryKey: ["fb_leaderboard"] });
      setIsEvaluating(false);
      setEvaluatingId(null);
      // Sync evaluation result to Firebase in background
      onEvaluationComplete(submissionId, address ?? "", "evaluated", { consensus_score: 0 }).catch(() => {});
      success("Evaluation complete!", { description: "AI agents have scored this contribution on-chain." });
    },
    onError: (err: any) => {
      setIsEvaluating(false);
      setEvaluatingId(null);
      error("Evaluation failed", { description: err?.message || "Please try again." });
    },
  });

  return { ...mutation, isEvaluating, evaluatingId, evaluateSubmission: mutation.mutate };
}

export function useChallengeEvaluation() {
  const contract = useVeriDictContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isChallenging, setIsChallenging] = useState(false);

  const mutation = useMutation({
    mutationFn: async (input: ChallengeInput) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      if (input.stake < 10) throw new Error("Minimum stake is 10 GL tokens.");
      setIsChallenging(true);
      return contract.challenge(input.submissionId, input.challenger, input.reason, input.stake);
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["evaluation", input.submissionId] });
      queryClient.invalidateQueries({ queryKey: ["dispute", input.submissionId] });
      queryClient.invalidateQueries({ queryKey: ["fullRecord", input.submissionId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      setIsChallenging(false);
      success("Challenge submitted!", { description: "Re-evaluation by AI agents is underway." });
    },
    onError: (err: any) => {
      setIsChallenging(false);
      error("Challenge failed", { description: err?.message || "Please try again." });
    },
  });

  return { ...mutation, isChallenging, challengeEvaluation: mutation.mutate };
}