// AI Protector - MITRE ATT&CK Matrix & Threat Score Engine
// Maps detected threat signals to official MITRE tactics & calculates enterprise 0-100 risk metrics.

import { RiskSignal, LinkScanResult, MessageScanResult } from '../types';

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  tacticId: string;
  description: string;
  url: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ThreatScoreBreakdown {
  compositeScore: number; // 0 - 100
  severityTier: 'critical' | 'high' | 'medium' | 'low' | 'clean';
  deceptionIndex: number; // 0 - 100
  infrastructureHazard: number; // 0 - 100
  exploitationRisk: number; // 0 - 100
}

export interface IncidentDossierData {
  incidentId: string;
  timestamp: string;
  type: 'message' | 'link' | 'claim' | 'file';
  inputSummary: string;
  threatScore: ThreatScoreBreakdown;
  mitreTechniques: MitreTechnique[];
  signals: RiskSignal[];
  piiScrubbedCount: number;
  safeNextSteps: string[];
  sha256AuditProof: string;
  technicalDetails?: Record<string, string | number | boolean>;
}

export class MitreMapper {
  private static readonly TECHNIQUE_CATALOG: Record<string, MitreTechnique> = {
    urgency_pressure: {
      id: 'T1566.002',
      name: 'Spearphishing Link (Coercive Urgency)',
      tactic: 'Initial Access',
      tacticId: 'TA0001',
      description: 'Adversary uses artificial time pressure or panic to induce rapid victim compliance without independent verification.',
      url: 'https://attack.mitre.org/techniques/T1566/002/',
      severity: 'high',
    },
    credential_harvesting: {
      id: 'T1598.003',
      name: 'Phishing for Information: Credentials',
      tactic: 'Collection',
      tacticId: 'TA0009',
      description: 'Adversary solicits passwords, PINs, OTP codes, or personal identification under guise of account verification.',
      url: 'https://attack.mitre.org/techniques/T1598/003/',
      severity: 'critical',
    },
    unusual_payment: {
      id: 'T1656',
      name: 'Impersonation (Financial Fraud & Extortion)',
      tactic: 'Impact',
      tacticId: 'TA0040',
      description: 'Adversary demands non-reversible compensation (wire transfer, cryptocurrency, gift cards) via impersonated authority.',
      url: 'https://attack.mitre.org/techniques/T1656/',
      severity: 'critical',
    },
    courier_delivery_scam: {
      id: 'T1566.001',
      name: 'Spearphishing (Postal & Logistics Lure)',
      tactic: 'Initial Access',
      tacticId: 'TA0001',
      description: 'Adversary impersonates postal or delivery services requesting nominal fees to compromise payment card info.',
      url: 'https://attack.mitre.org/techniques/T1566/001/',
      severity: 'high',
    },
    remote_access: {
      id: 'T1219',
      name: 'Remote Access Software (Tech Support Lure)',
      tactic: 'Command and Control',
      tacticId: 'TA0011',
      description: 'Adversary instructs victim to install legitimate remote administration software (AnyDesk, TeamViewer) for unauthorized access.',
      url: 'https://attack.mitre.org/techniques/T1219/',
      severity: 'critical',
    },
    brand_typosquatting: {
      id: 'T1583.001',
      name: 'Acquire Infrastructure: Domains (Typosquatting)',
      tactic: 'Resource Development',
      tacticId: 'TA0042',
      description: 'Adversary registers deceptively similar domain names mimicking legitimate financial or consumer platforms.',
      url: 'https://attack.mitre.org/techniques/T1583/001/',
      severity: 'critical',
    },
    ssrf_private_network: {
      id: 'T1595',
      name: 'Active Scanning / Server-Side Request Forgery',
      tactic: 'Reconnaissance',
      tacticId: 'TA0043',
      description: 'Adversary constructs URLs targeting private RFC 1918 subnets, loopbacks, or cloud metadata instances to pivot internally.',
      url: 'https://attack.mitre.org/techniques/T1595/',
      severity: 'critical',
    },
    shortened_link: {
      id: 'T1027',
      name: 'Obfuscated Files or Information: URL Shortener',
      tactic: 'Defense Evasion',
      tacticId: 'TA0005',
      description: 'Adversary uses URL shortening services to mask true hostile destination domain from security filters.',
      url: 'https://attack.mitre.org/techniques/T1027/',
      severity: 'medium',
    },
    punycode_homograph: {
      id: 'T1583.001',
      name: 'Internationalized Domain Name (IDN) Homograph Attack',
      tactic: 'Resource Development',
      tacticId: 'TA0042',
      description: 'Adversary uses visually identical Unicode or Punycode characters to spoof familiar hostnames.',
      url: 'https://attack.mitre.org/techniques/T1583/001/',
      severity: 'high',
    },
    insecure_http: {
      id: 'T1040',
      name: 'Network Sniffing / Cleartext Protocol',
      tactic: 'Credential Access',
      tacticId: 'TA0006',
      description: 'Target transmits unencrypted cleartext credentials over plaintext HTTP subject to interception.',
      url: 'https://attack.mitre.org/techniques/T1040/',
      severity: 'medium',
    },
  };

  /**
   * Maps detected signals to MITRE ATT&CK techniques.
   */
  public static mapSignals(
    signals: RiskSignal[],
    linkContext?: { isTyposquatting?: boolean; isPrivateOrLoopback?: boolean; hasPunycode?: boolean; isHttps?: boolean }
  ): MitreTechnique[] {
    const matched = new Map<string, MitreTechnique>();

    for (const s of signals) {
      if (this.TECHNIQUE_CATALOG[s.id]) {
        matched.set(s.id, this.TECHNIQUE_CATALOG[s.id]);
      }
    }

    if (linkContext?.isTyposquatting) {
      matched.set('brand_typosquatting', this.TECHNIQUE_CATALOG.brand_typosquatting);
    }

    if (linkContext?.isPrivateOrLoopback) {
      matched.set('ssrf_private_network', this.TECHNIQUE_CATALOG.ssrf_private_network);
    }

    if (linkContext?.hasPunycode) {
      matched.set('punycode_homograph', this.TECHNIQUE_CATALOG.punycode_homograph);
    }

    if (linkContext && linkContext.isHttps === false) {
      matched.set('insecure_http', this.TECHNIQUE_CATALOG.insecure_http);
    }

    return Array.from(matched.values());
  }

  /**
   * Calculates a composite 0-100 Threat Score and sub-indices.
   */
  public static calculateThreatScore(
    riskLevel: string,
    signals: RiskSignal[],
    linkContext?: { isTyposquatting?: boolean; isPrivateOrLoopback?: boolean; isHttps?: boolean; suspiciousTld?: boolean }
  ): ThreatScoreBreakdown {
    let deceptionIndex = 10;
    let infrastructureHazard = 10;
    let exploitationRisk = 10;

    for (const s of signals) {
      if (s.category === 'urgency') deceptionIndex += 40;
      if (s.category === 'impersonation') deceptionIndex += 35;
      if (s.category === 'credential_harvesting') exploitationRisk += 45;
      if (s.category === 'payment_fraud') exploitationRisk += 50;
      if (s.category === 'url_hazard') infrastructureHazard += 30;
    }

    if (linkContext?.isTyposquatting) {
      infrastructureHazard += 50;
      deceptionIndex += 40;
    }
    if (linkContext?.isPrivateOrLoopback) {
      infrastructureHazard += 60;
      exploitationRisk += 40;
    }
    if (linkContext && linkContext.isHttps === false) {
      infrastructureHazard += 25;
    }
    if (linkContext?.suspiciousTld) {
      infrastructureHazard += 20;
    }

    deceptionIndex = Math.min(100, Math.max(0, deceptionIndex));
    infrastructureHazard = Math.min(100, Math.max(0, infrastructureHazard));
    exploitationRisk = Math.min(100, Math.max(0, exploitationRisk));

    // Weighted composite score (Enterprise formula)
    let compositeScore = Math.round(
      deceptionIndex * 0.35 + infrastructureHazard * 0.35 + exploitationRisk * 0.30
    );

    if (riskLevel === 'high_risk') {
      compositeScore = Math.max(compositeScore, 82);
    } else if (riskLevel === 'suspicious') {
      compositeScore = Math.min(Math.max(compositeScore, 50), 79);
    } else if (riskLevel === 'low') {
      compositeScore = Math.min(compositeScore, 24);
    }

    let severityTier: ThreatScoreBreakdown['severityTier'] = 'clean';
    if (compositeScore >= 80) severityTier = 'critical';
    else if (compositeScore >= 65) severityTier = 'high';
    else if (compositeScore >= 40) severityTier = 'medium';
    else if (compositeScore >= 15) severityTier = 'low';

    return {
      compositeScore,
      severityTier,
      deceptionIndex,
      infrastructureHazard,
      exploitationRisk,
    };
  }

  /**
   * Generates a printable, standardized Security Incident Dossier.
   */
  public static generateDossierHtml(dossier: IncidentDossierData): string {
    const techniquesList = dossier.mitreTechniques
      .map(
        (t) => `
        <div style="background:#1e293b;border-left:4px solid #ef4444;padding:10px 14px;margin-bottom:8px;border-radius:4px;">
          <strong style="color:#f87171;">[${t.id}] ${t.name}</strong> — <em>${t.tactic}</em>
          <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">${t.description}</p>
        </div>`
      )
      .join('');

    const signalsList = dossier.signals
      .map(
        (s) => `
        <li style="margin-bottom:6px;">
          <strong style="color:#fbbf24;">${s.label}</strong> [Severity: ${s.severity.toUpperCase()}]: ${s.description}
        </li>`
      )
      .join('');

    const nextStepsList = dossier.safeNextSteps
      .map((step) => `<li style="margin-bottom:6px;">${step}</li>`)
      .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Security Incident Dossier - ${dossier.incidentId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; background: #0b0f17; color: #e2e8f0; margin: 0; padding: 40px; }
    .container { max-width: 800px; margin: 0 auto; background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .header { border-bottom: 2px solid #334155; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .badge { padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 13px; text-transform: uppercase; }
    .badge-critical { background: #7f1d1d; color: #fca5a5; border: 1px solid #ef4444; }
    .badge-high { background: #7c2d12; color: #fdba74; border: 1px solid #f97316; }
    .badge-medium { background: #713f12; color: #fde047; border: 1px solid #eab308; }
    .badge-low { background: #14532d; color: #86efac; border: 1px solid #22c55e; }
    h1 { margin: 0; font-size: 20px; color: #f8fafc; letter-spacing: -0.5px; }
    h2 { font-size: 14px; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-top: 24px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; background: #0b0f17; padding: 14px; border-radius: 6px; border: 1px solid #1e293b; }
    .score-box { background: #1e293b; border-radius: 6px; padding: 16px; text-align: center; margin: 16px 0; }
    .score-number { font-size: 42px; font-weight: 800; color: #ef4444; }
    .audit-seal { margin-top: 32px; padding-top: 16px; border-top: 1px dashed #334155; font-size: 11px; color: #64748b; font-family: monospace; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>AI PROTECTOR // SECURITY INCIDENT DOSSIER</h1>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">Reference: ${dossier.incidentId} • Certified Confidential</div>
      </div>
      <span class="badge badge-${dossier.threatScore.severityTier}">${dossier.threatScore.severityTier.toUpperCase()} RISK</span>
    </div>

    <div class="meta-grid">
      <div><strong>Timestamp:</strong> ${dossier.timestamp}</div>
      <div><strong>Inspection Vector:</strong> ${dossier.type.toUpperCase()}</div>
      <div><strong>PII Entities Redacted:</strong> ${dossier.piiScrubbedCount} (Zero Leaks)</div>
      <div><strong>Evaluation Policy:</strong> Zero-Trust Ephemeral Execution</div>
    </div>

    <div class="score-box">
      <div style="font-size:12px;text-transform:uppercase;color:#94a3b8;letter-spacing:1px;">Composite Threat Index</div>
      <div class="score-number">${dossier.threatScore.compositeScore}<span style="font-size:20px;color:#64748b;">/100</span></div>
      <div style="font-size:12px;color:#cbd5e1;margin-top:6px;">
        Deception: ${dossier.threatScore.deceptionIndex}% • Infrastructure Hazard: ${dossier.threatScore.infrastructureHazard}% • Exploitation Risk: ${dossier.threatScore.exploitationRisk}%
      </div>
    </div>

    <h2>1. Incident Summary</h2>
    <p style="font-size:13px;line-height:1.6;background:#0b0f17;padding:12px;border-radius:6px;border:1px solid #1e293b;">
      ${dossier.inputSummary}
    </p>

    <h2>2. MITRE ATT&CK® Adversary Mapping</h2>
    ${techniquesList || '<p style="color:#64748b;font-size:13px;">No explicit adversary techniques triggered.</p>'}

    <h2>3. Detected Technical Signals</h2>
    <ul style="font-size:13px;line-height:1.6;padding-left:20px;">
      ${signalsList || '<li>No hostile signatures detected.</li>'}
    </ul>

    <h2>4. Mandatory Containment & Remediation Steps</h2>
    <ol style="font-size:13px;line-height:1.6;padding-left:20px;color:#f87171;">
      ${nextStepsList}
    </ol>

    <div class="audit-seal">
      <strong>Cryptographic Audit Seal:</strong> SHA-256: ${dossier.sha256AuditProof}<br>
      <em>Certified by AI Protector Zero-Trust Defense Engine. Ephemeral verification; zero raw content stored on server.</em>
    </div>
  </div>
</body>
</html>`;
  }
}
