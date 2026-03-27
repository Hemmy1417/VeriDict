/**
 * TypeScript types for VeriDict — AI Contribution Evaluator
 * GenLayer Intelligent Contract: 0x5dA860186C6e72C194450C9204E6Fc42b5372Ae8
 */

// ── Submission ───────────────────────────────────────────────────────

export interface Submission {
  id:              string;   // e.g. "VRD-001"
  contributor:     string;   // wallet address or handle
  title:           string;
  category:        SubmissionCategory;
  url:             string;
  description:     string;
  grant_requested: number;
  status:          SubmissionStatus;
}

export type SubmissionCategory =
  | "code"
  | "design"
  | "proposal"
  | "research"
  | "community";

export type SubmissionStatus =
  | "pending"
  | "accepted"
  | "accepted_with_feedback"
  | "rejected"
  | "disputed";

// ── Evaluation ───────────────────────────────────────────────────────

export interface Evaluation {
  submission_id:       string;
  consensus_score:     number;   // 0–100 weighted average
  status:              SubmissionStatus;
  // Per-agent dimension scores
  quality_score:       number;
  quality_summary:     string;
  originality_score:   number;
  originality_summary: string;
  impact_score:        number;
  impact_summary:      string;
  // Dispute state
  challenged:          boolean;
}

// ── Dispute ──────────────────────────────────────────────────────────

export interface Dispute {
  submission_id:   string;
  challenger:      string;
  reason:          string;
  stake:           number;
  original_score:  number;
  new_score:       number;
  challenge_valid: boolean;
  stake_outcome:   "rewarded" | "slashed";
  stake_returned:  number;
  verdict:         string;
}

// ── Full record (submission + evaluation + dispute combined) ──────────

export interface FullRecord {
  submission: Submission;
  evaluation: Evaluation | null;
  dispute:    Dispute    | null;
}

// ── Leaderboard ──────────────────────────────────────────────────────

export interface LeaderboardEntry {
  contributor:    string;
  total_score:    number;
  accepted_count: number;
}

export interface ContributorStats {
  contributor:    string;
  total_score:    number;
  accepted_count: number;
}

// ── Contract config (from get_project_info) ───────────────────────────

export interface ContractConfig {
  project_name: string;
  owner:        string;
  total:        number;
  weights: {
    quality:     number;
    originality: number;
    impact:      number;
  };
  thresholds: {
    accepted: number;
    feedback: number;
  };
  min_stake: number;
}

// ── Transaction ───────────────────────────────────────────────────────

export interface TransactionReceipt {
  status:       string;
  hash:         string;
  blockNumber?: number;
  [key: string]: any;
}

// ── Form input shapes ─────────────────────────────────────────────────

export interface SubmitContributionInput {
  contributor: string;
  title:       string;
  category:    SubmissionCategory;
  url:         string;
  description: string;
}

export interface ChallengeInput {
  submissionId: string;
  challenger:   string;
  reason:       string;
  stake:        number;
}

// ── Filter helpers ────────────────────────────────────────────────────

export interface SubmissionFilters {
  status?:   SubmissionStatus;
  category?: SubmissionCategory;
  contributor?: string;
}