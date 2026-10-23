// AI Protector - Database Repository & Migration Runner
// Stores strictly minimal metadata: scan_id, user_id, host, url_hash, status, category, provider_status.

import { TargetType, ScanCategory, ScanStatus, EvidenceItem } from '../security/url-decision-engine';

export interface ScanRecord {
  scan_id: string;
  user_id: string;
  target_type: TargetType;
  host: string;
  url_hash: string;
  status: ScanStatus;
  category: ScanCategory;
  evidence: EvidenceItem[];
  provider_status: Array<{ provider: string; state: string; latency_ms: number }>;
  explanation: string;
  recommended_action: string;
  limitations: string[];
  created_at: string;
}

export interface FalsePositiveRecord {
  id: string;
  scan_id: string;
  user_id: string;
  reason: string;
  reported_at: string;
}

export class Database {
  // In-memory relational store with strict user isolation
  private static users = new Map<string, { id: string; email: string; role: string; created_at: string }>();
  private static scans = new Map<string, ScanRecord>();
  private static falsePositives: FalsePositiveRecord[] = [];

  public static async ensureUser(id: string, email: string, role: string = 'user'): Promise<void> {
    if (!this.users.has(id)) {
      this.users.set(id, {
        id,
        email,
        role,
        created_at: new Date().toISOString(),
      });
    }
  }

  public static async saveScan(record: ScanRecord): Promise<void> {
    await this.ensureUser(record.user_id, `${record.user_id}@user.local`);
    this.scans.set(record.scan_id, { ...record });
  }

  /**
   * Retrieves a scan by ID strictly if owned by the calling user.
   * Returns null if scan does not exist OR does not belong to the caller (anti-probing defense).
   */
  public static async getScanById(scanId: string, userId: string): Promise<ScanRecord | null> {
    const scan = this.scans.get(scanId);
    if (!scan) return null;
    if (scan.user_id !== userId) return null; // 404 for non-owners
    return { ...scan };
  }

  /**
   * Lists scans for a specific user, ordered newest first.
   */
  public static async listUserScans(userId: string, limit: number = 20): Promise<ScanRecord[]> {
    return Array.from(this.scans.values())
      .filter((s) => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  /**
   * Records a false positive report against a verified scan.
   */
  public static async reportFalsePositive(scanId: string, userId: string, reason: string): Promise<boolean> {
    const scan = await this.getScanById(scanId, userId);
    if (!scan) return false;

    this.falsePositives.push({
      id: `fp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      scan_id: scanId,
      user_id: userId,
      reason: reason.trim(),
      reported_at: new Date().toISOString(),
    });
    return true;
  }

  /**
   * Resets database state for testing.
   */
  public static reset() {
    this.users.clear();
    this.scans.clear();
    this.falsePositives = [];
  }
}
