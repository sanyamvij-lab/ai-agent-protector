// AI Protector - Core Type Definitions
// Private by design. Trust by intelligence.

export type RiskLevel = 'low' | 'info' | 'suspicious' | 'high_risk' | 'unverified';

export type ProcessingMode = 'local' | 'hybrid' | 'cloud';

export interface DetectedEntity {
  type: 'email' | 'phone' | 'credit_card' | 'ssn' | 'api_key' | 'jwt' | 'ip_address' | 'password' | 'aadhaar' | 'pan' | 'upi_id';
  original: string;
  masked: string;
  index: number;
}

export interface RedactionResult {
  redactedText: string;
  entitiesFound: DetectedEntity[];
  hasSensitiveData: boolean;
}

export interface RiskSignal {
  id: string;
  label: string;
  category: 'urgency' | 'credential_harvesting' | 'payment_fraud' | 'impersonation' | 'url_hazard' | 'misinformation' | 'inconsistency';
  severity: 'low' | 'medium' | 'high';
  description: string;
  matchedText?: string;
}

export interface ScanResultBase {
  id: string;
  timestamp: string;
  processingMode: ProcessingMode;
  riskLevel: RiskLevel;
  confidenceScore: number; // 0.0 - 1.0
  summary: string;
  signals: RiskSignal[];
  limitations: string;
  safeNextSteps: string[];
  externalSources?: { title: string; url: string; relevance: string }[];
  privacyReceipt: {
    processedLocally: boolean;
    piiScrubbedCount: number;
    networkTransferred: boolean;
  };
}

export interface MessageScanResult extends ScanResultBase {
  originalLength: number;
  redactedSnippet: string;
  category: 'phishing' | 'financial_scam' | 'impersonation' | 'spam' | 'benign' | 'unclassified';
}

export interface VirusTotalStats {
  malicious: number;
  suspicious: number;
  undetected: number;
  harmless: number;
  timeout?: number;
}

export interface VirusTotalReport {
  status: 'clean' | 'suspicious' | 'malicious' | 'not_found' | 'quota_exceeded' | 'unavailable' | 'unconfigured';
  totalEngines: number;
  stats: VirusTotalStats;
  reputation?: number;
  categories?: Record<string, string>;
  lastAnalysisDate?: string;
  permalink?: string;
  tags?: string[];
  source: 'virustotal_v3';
}

export interface LinkScanResult extends ScanResultBase {
  submittedUrl: string;
  canonicalUrl: string;
  domain: string;
  isHttps: boolean;
  isPrivateOrLoopback: boolean;
  hasPunycode: boolean;
  decodedPunycode?: string;
  isTyposquatting: boolean;
  targetBrandMatched?: string;
  suspiciousTld: boolean;
  redirectWarning?: string;
  virusTotal?: VirusTotalReport;
}

export interface ClaimVerifyResult extends ScanResultBase {
  claimStatement: string;
  verdict: 'supported' | 'unsupported' | 'misleading' | 'lacks_context' | 'unverified';
  factualClaims: string[];
  subjectiveSentiments: string[];
  verificationGuidance: string[];
}

export interface FileHashResult {
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  sha256: string;
  sha512?: string;
  comparisonHash?: string;
  isMatch?: boolean;
  calculatedAt: string;
  explanation: string;
  privacyNotice: string;
  virusTotal?: VirusTotalReport;
}

export interface PrivacyAuditReport {
  geolocationStatus: 'disabled_by_default' | 'not_requested';
  cameraMicrophoneStatus: 'not_requested';
  localHistoryCount: number;
  currentProcessingMode: ProcessingMode;
  cloudConsentGranted: boolean;
}
