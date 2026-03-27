import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type {
  Submission,
  Evaluation,
  Dispute,
  LeaderboardEntry,
  ContributorStats,
  TransactionReceipt,
} from "./types";

/**
 * VeriDict contract client.
 * Contract: 0x5dA860186C6e72C194450C9204E6Fc42b5372Ae8
 * All reads go through the /api/rpc Next.js proxy to avoid CORS.
 */
class VeriDict {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(contractAddress: string, address?: string | null, studioUrl?: string) {
    this.contractAddress = contractAddress as `0x${string}`;
    const config: any = { chain: studionet };
    if (address) config.account = address as `0x${string}`;
    this.client = createClient(config);
  }

  updateAccount(address: string): void {
    this.client = createClient({ chain: studionet, account: address as `0x${string}` });
  }

  // ── Response parser ───────────────────────────────────────────────

  private parseResponse(raw: any): any {
    if (raw === null || raw === undefined) return null;
    if (typeof raw === "string") {
      const t = raw.trim();
      if (t === "not found" || t === "") return null;
      try { return JSON.parse(t); } catch { return t; }
    }
    if (raw instanceof Map) {
      const obj: any = {};
      raw.forEach((v: any, k: any) => { obj[k] = this.parseResponse(v); });
      return obj;
    }
    return raw;
  }

  // ── READ ──────────────────────────────────────────────────────────

  /**
   * Fetch all submissions by looping VRD-001 … VRD-{count}.
   * The deployed contract has no get_all_submissions() view.
   */
  async getSubmissions(): Promise<Submission[]> {
    try {
      const count = await this.getSubmissionCount();
      if (count === 0) return [];

      const results: Submission[] = [];
      for (let i = 1; i <= count; i++) {
        const sid = "VRD-" + String(i).padStart(3, "0");
        try {
          const raw: any = await this.client.readContract({
            address: this.contractAddress,
            functionName: "get_submission",
            args: [sid],
          });
          const parsed = this.parseResponse(raw);
          if (parsed && typeof parsed === "object") results.push(parsed as Submission);
        } catch {
          // skip missing IDs silently
        }
      }
      return results;
    } catch (err) {
      console.error("Error fetching submissions:", err);
      return [];
    }
  }

  async getSubmission(submissionId: string): Promise<Submission | null> {
    try {
      const raw: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_submission",
        args: [submissionId],
      });
      return this.parseResponse(raw);
    } catch {
      return null;
    }
  }

  async getEvaluation(submissionId: string): Promise<Evaluation | null> {
    try {
      const raw: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_evaluation",
        args: [submissionId],
      });
      return this.parseResponse(raw);
    } catch {
      return null;
    }
  }

  async getDispute(submissionId: string): Promise<Dispute | null> {
    try {
      const raw: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_dispute",
        args: [submissionId],
      });
      return this.parseResponse(raw);
    } catch {
      return null;
    }
  }

  async getFullRecord(submissionId: string): Promise<any> {
    try {
      const raw: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_full_record",
        args: [submissionId],
      });
      return this.parseResponse(raw);
    } catch {
      return null;
    }
  }

  async getSubmissionCount(): Promise<number> {
    try {
      const count: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_submission_count",
        args: [],
      });
      return Number(count) || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Derive contributor stats from submissions — no separate contract call needed.
   */
  async getContributorStats(contributor: string | null): Promise<ContributorStats | null> {
    if (!contributor) return null;
    try {
      const submissions = await this.getSubmissions();
      const mine = submissions.filter(
        (s) =>
          s.contributor?.toLowerCase() === contributor.toLowerCase() &&
          (s.status === "accepted" || s.status === "accepted_with_feedback")
      );
      return {
        contributor,
        total_score: mine.reduce((sum, s) => sum + ((s as any).consensus_score ?? 0), 0),
        accepted_count: mine.length,
      };
    } catch {
      return { contributor, total_score: 0, accepted_count: 0 };
    }
  }

  /**
   * Build leaderboard from submissions — derived client-side.
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const submissions = await this.getSubmissions();
      if (!submissions.length) return [];

      const map: Record<string, LeaderboardEntry> = {};
      for (const sub of submissions) {
        if (sub.status !== "accepted" && sub.status !== "accepted_with_feedback") continue;
        if (!map[sub.contributor]) {
          map[sub.contributor] = { contributor: sub.contributor, total_score: 0, accepted_count: 0 };
        }
        map[sub.contributor].accepted_count += 1;
        map[sub.contributor].total_score += (sub as any).consensus_score ?? 0;
      }
      return Object.values(map).sort((a, b) => b.total_score - a.total_score);
    } catch {
      return [];
    }
  }

  async getProjectInfo(): Promise<any> {
    try {
      const raw: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_project_info",
        args: [],
      });
      return this.parseResponse(raw);
    } catch {
      return null;
    }
  }

  // ── WRITE ─────────────────────────────────────────────────────────

  async submit(
    contributor: string,
    title: string,
    category: string,
    url: string,
    description: string
  ): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "submit",
        args: [contributor, title, category, url, description],
        value: BigInt(0),
      });
      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });
      return receipt as TransactionReceipt;
    } catch (err) {
      console.error("Error submitting:", err);
      throw new Error("Failed to submit contribution");
    }
  }

  async evaluate(submissionId: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "evaluate",
        args: [submissionId],
        value: BigInt(0),
      });
      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 48,
        interval: 5000,
      });
      return receipt as TransactionReceipt;
    } catch (err) {
      console.error("Error evaluating:", err);
      throw new Error("Failed to evaluate submission");
    }
  }

  async challenge(
    submissionId: string,
    challenger: string,
    reason: string,
    stake: number
  ): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "challenge",
        args: [submissionId, challenger, reason, BigInt(stake)],
        value: BigInt(0),
      });
      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 48,
        interval: 5000,
      });
      return receipt as TransactionReceipt;
    } catch (err) {
      console.error("Error challenging:", err);
      throw new Error("Failed to submit challenge");
    }
  }
}

export default VeriDict;
