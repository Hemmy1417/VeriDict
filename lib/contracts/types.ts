// ── Core contract types ───────────────────────────────────────────────────────

export interface Submission {
  id:          string;
  contributor: string;
  title:       string;
  category:    string;
  url?:        string;
  description?: string;
  status:      string;
  grant_requested?: number;
  consensus_score?: number;
}

export interface Evaluation {
  submission_id:      string;
  consensus_score:    number;
  status:             string;
  quality_score?:     number;
  quality_summary?:   string;
  originality_score?: number;
  originality_summary?: string;
  impact_score?:      number;
  impact_summary?:    string;
  challenged?:        boolean;
  dispute_deadline?:  number;
}

export interface Dispute {
  submission_id:   string;
  challenger:      string;
  reason:          string;
  stake:           number;
  original_score:  number;
  new_score:       number;
  challenge_valid: boolean;
  stake_outcome:   string;
  stake_returned:  number;
  verdict?:        string;
}

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

export interface TransactionReceipt {
  hash?:   string;
  status?: string;
  [key: string]: any;
}

// ── Input types ───────────────────────────────────────────────────────────────

export interface SubmitContributionInput {
  contributor: string;
  title:       string;
  category:    string;
  url:         string;
  description: string;
}

export interface ChallengeInput {
  submissionId: string;
  challenger:   string;
  reason:       string;
  stake:        number;
}