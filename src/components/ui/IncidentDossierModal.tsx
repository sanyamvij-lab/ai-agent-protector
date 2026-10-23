'use client';

import React, { useState } from 'react';
import {
  FileText,
  X,
  Download,
  Copy,
  Check,
  Printer,
  ShieldAlert,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Button } from './Button';
import { IncidentDossierData, MitreMapper } from '@/lib/security/mitre-mapper';

interface IncidentDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: IncidentDossierData | null;
}

export const IncidentDossierModal: React.FC<IncidentDossierModalProps> = ({
  isOpen,
  onClose,
  dossier,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !dossier) return null;

  const handleDownloadHtml = () => {
    const htmlContent = MitreMapper.generateDossierHtml(dossier);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-dossier-${dossier.incidentId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const htmlContent = MitreMapper.generateDossierHtml(dossier);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleCopyMarkdown = () => {
    const md = `# SECURITY INCIDENT DOSSIER // AI PROTECTOR
**Incident ID**: ${dossier.incidentId}
**Timestamp**: ${dossier.timestamp}
**Threat Level**: ${dossier.threatScore.severityTier.toUpperCase()} (${dossier.threatScore.compositeScore}/100)
**Vector**: ${dossier.type.toUpperCase()}
**PII Redacted**: ${dossier.piiScrubbedCount} entities

## Incident Summary
${dossier.inputSummary}

## MITRE ATT&CK Matrix
${dossier.mitreTechniques.map((t) => `- [${t.id}] ${t.name} (${t.tactic}) - ${t.url}`).join('\n')}

## Flagged Technical Signals
${dossier.signals.map((s) => `- [${s.severity.toUpperCase()}] ${s.label}: ${s.description}`).join('\n')}

## Recommended Remediation Steps
${dossier.safeNextSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

---
*Cryptographic Seal (SHA-256): ${dossier.sha256AuditProof}*
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Security Incident Dossier</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-950 text-red-400 border border-red-500/30">
                  {dossier.threatScore.severityTier} RISK
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Reference ID: {dossier.incidentId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dossier Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-300">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Vector</span>
              <span className="text-white font-semibold">{dossier.type.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Score</span>
              <span className="text-red-400 font-semibold">{dossier.threatScore.compositeScore} / 100</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">PII Scrubbed</span>
              <span className="text-cyan-400 font-semibold">{dossier.piiScrubbedCount} entities</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Policy</span>
              <span className="text-emerald-400 font-semibold">Zero Storage</span>
            </div>
          </div>

          {/* Incident Summary */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              1. Incident Summary
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 leading-relaxed font-sans text-slate-200">
              {dossier.inputSummary}
            </div>
          </div>

          {/* MITRE ATT&CK Matrix */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>2. MITRE ATT&CK® Adversary Mapping</span>
              <span className="text-[10px] text-slate-500 font-normal">Official Threat Taxonomy</span>
            </h4>
            <div className="space-y-2">
              {dossier.mitreTechniques.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-500">
                  No adversary techniques flagged.
                </div>
              ) : (
                dossier.mitreTechniques.map((tech) => (
                  <div
                    key={tech.id}
                    className="p-3 rounded-xl bg-slate-900/80 border-l-4 border-l-red-500 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-red-400">[{tech.id}]</span>
                        <span className="font-semibold text-white">{tech.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-800">
                          {tech.tactic}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {tech.description}
                      </p>
                    </div>
                    <a
                      href={tech.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-white p-1 transition"
                      title="View MITRE technique spec"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Flagged Signals */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              3. Forensic Indicators
            </h4>
            <div className="space-y-1.5">
              {dossier.signals.map((sig, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start space-x-2.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">{sig.label}</span>
                    <span className="text-[10px] font-mono text-slate-500 ml-2">
                      [{sig.severity.toUpperCase()}]
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{sig.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remediation Next Steps */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              4. Immediate Containment Checklist
            </h4>
            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
              {dossier.safeNextSteps.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-red-900/60 text-red-400 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Seal */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-500 break-all">
            <span className="text-slate-400 font-semibold block mb-1">Cryptographic Audit Seal:</span>
            SHA-256: {dossier.sha256AuditProof}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMarkdown}
              className="border-slate-700 hover:border-slate-500 text-xs flex items-center space-x-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-slate-700 hover:border-slate-500 text-xs flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </Button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadHtml}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download HTML Dossier</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
