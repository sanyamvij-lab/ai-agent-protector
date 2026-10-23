// AI Protector — Common Scan Engine Adapter Interface (§6.1)
// Standardizes engine lifecycle, versioning, input limits, and normalized evidence output.

import { TargetType, EvidenceItem, ScorecardPosture } from '../url-decision-engine';

export interface BoundedInput {
  targetType: TargetType;
  /**
   * Raw bytes, text, or identifier (e.g. repo URL, file buffer, skill archive bytes).
   * Untrusted input: never executed, imported, compiled, or installed.
   */
  content: string | Buffer;
  mimeType?: string;
  sizeBytes: number;
}

export interface EngineLimits {
  timeoutMs: number;
  maxSizeBytes: number;
  maxExecutionTimeMs: number;
}

export interface EngineResult {
  engineId: string;
  engineVersion: string;
  rulesetId: string | null;
  executedAt: string;
  evidence: EvidenceItem[];
  posture?: ScorecardPosture | null;
  latencyMs: number;
  error?: string;
}

export interface ScanEngine {
  /**
   * Unique identifier for the engine (e.g. "scorecard", "yara-x", "skillspector").
   */
  readonly id: string;

  /**
   * Returns the exact version string of the underlying engine binary or library.
   */
  version(): Promise<string>;

  /**
   * Verifies if this engine supports analyzing the requested target type.
   */
  supports(targetType: TargetType): boolean;

  /**
   * Executes analysis within strict sandboxed limits (§6.2).
   */
  scan(input: BoundedInput, limits: EngineLimits): Promise<EngineResult>;
}
