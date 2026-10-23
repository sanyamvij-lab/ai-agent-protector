'use client';

import React, { useState } from 'react';
import {
  FileCheck2,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ShieldCheck,
  Info,
  RotateCcw,
  FileCode,
  Globe,
} from 'lucide-react';
import { FileHashResult } from '@/lib/types';
import { CryptoHasher } from '@/lib/security/crypto-hasher';

interface FileIntegrityTabProps {
  onRecordScan: (riskLevel: string, piiCount: number, type?: 'message' | 'link' | 'claim' | 'file', summary?: string) => void;
}

export const FileIntegrityTab: React.FC<FileIntegrityTabProps> = ({ onRecordScan }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comparisonHash, setComparisonHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [isQueryingVt, setIsQueryingVt] = useState(false);
  const [hashResult, setHashResult] = useState<FileHashResult | null>(null);
  const [copiedSha256, setCopiedSha256] = useState(false);

  const queryVirusTotal = async (sha256: string, compHash?: string): Promise<any> => {
    try {
      setIsQueryingVt(true);
      const res = await fetch('/api/v1/files/compare-hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculated_hash: sha256,
          reference_hash: compHash || sha256,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.virus_total || null;
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsQueryingVt(false);
    }
    return null;
  };

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setIsHashing(true);

    try {
      const result = await CryptoHasher.hashFile(file, comparisonHash);
      setHashResult(result);
      onRecordScan(result.isMatch === false ? 'high_risk' : 'low', 0, 'file', `${file.name} (SHA-256 check)`);

      // Query global VirusTotal multi-AV intelligence using only the 32-byte cryptographic digest
      const vt = await queryVirusTotal(result.sha256, comparisonHash);
      if (vt) {
        setHashResult((prev) => (prev ? { ...prev, virusTotal: vt } : null));
        if (vt.stats?.malicious > 0) {
          onRecordScan('high_risk', 0, 'file', `${file.name} (VirusTotal: ${vt.stats.malicious} AV flags)`);
        }
      }
    } catch (err) {
      console.error('Hashing failure', err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleRecompare = async () => {
    if (!selectedFile) return;
    setIsHashing(true);
    try {
      const result = await CryptoHasher.hashFile(selectedFile, comparisonHash);
      setHashResult(result);

      const vt = await queryVirusTotal(result.sha256, comparisonHash);
      if (vt) {
        setHashResult((prev) => (prev ? { ...prev, virusTotal: vt } : null));
      }
    } finally {
      setIsHashing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSha256(true);
    setTimeout(() => setCopiedSha256(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <span>AI-Assisted File Integrity & Checksum Verification</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compute SHA-256 hashes 100% on-device via Web Crypto. Verify byte-level equality against authorized reference hashes.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero File Upload Guarantee</span>
        </div>
      </div>

      {/* Drag & Drop File Zone */}
      <div className="glass-card p-6 border-dashed border-2 border-slate-700/80 hover:border-emerald-500/50 transition text-center space-y-3">
        <input
          type="file"
          id="file-input"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        <label
          htmlFor="file-input"
          className="cursor-pointer block space-y-3"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            {isHashing ? (
              <RotateCcw className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <span className="text-sm font-semibold text-white hover:text-emerald-300 transition">
              {selectedFile ? selectedFile.name : 'Click to select a file or drag and drop here'}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Supports software binaries, PDFs, documents, media, or archives (any size). Processed completely in local memory.
            </p>
          </div>
        </label>
      </div>

      {/* Comparison Reference Input */}
      <div className="glass-card p-5 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Optional: Compare with Publisher Reference SHA-256 Checksum
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={comparisonHash}
            onChange={(e) => setComparisonHash(e.target.value)}
            placeholder="Paste expected 64-character SHA-256 hash from software release notes..."
            className="glass-input flex-1 px-4 py-2.5 text-xs font-mono"
          />
          <button
            onClick={handleRecompare}
            disabled={!selectedFile || isHashing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 disabled:opacity-50 transition cursor-pointer"
          >
            Compare
          </button>
        </div>
      </div>

      {/* Hash Results Display */}
      {hashResult && (
        <div className="glass-card p-6 space-y-6 border-slate-700/60 animate-in fade-in duration-200">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              {hashResult.isMatch === true ? (
                <div className="px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-2 bg-emerald-950/60 border-emerald-500/40 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Hash Match Confirmed</span>
                </div>
              ) : hashResult.isMatch === false ? (
                <div className="px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-2 bg-rose-950/60 border-rose-500/40 text-rose-300">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Integrity Mismatch Detected</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-2 bg-cyan-950/60 border-cyan-500/40 text-cyan-300">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span>SHA-256 Generated</span>
                </div>
              )}

              <span className="text-xs text-slate-400 font-mono">
                {(hashResult.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>

            <span className="text-xs text-slate-500">
              Computed: {new Date(hashResult.calculatedAt).toLocaleTimeString()}
            </span>
          </div>

          {/* Explanation */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {hashResult.explanation}
          </div>

          {/* Computed Hashes */}
          <div className="space-y-4">
            {/* SHA-256 */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">SHA-256 Checksum</span>
                <button
                  onClick={() => copyToClipboard(hashResult.sha256)}
                  className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-cyan-300 cursor-pointer"
                >
                  {copiedSha256 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSha256 ? 'Copied' : 'Copy Hash'}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-slate-200 break-all select-all bg-slate-950 p-2.5 rounded border border-slate-800">
                {hashResult.sha256}
              </div>
            </div>

            {/* SHA-512 */}
            {hashResult.sha512 && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SHA-512 Checksum</span>
                <div className="font-mono text-[11px] text-slate-400 break-all select-all bg-slate-950 p-2.5 rounded border border-slate-800">
                  {hashResult.sha512}
                </div>
              </div>
            )}
          </div>

          {/* VirusTotal Global Antivirus Intelligence Card */}
          {isQueryingVt && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3 text-xs text-cyan-400">
              <RotateCcw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Querying VirusTotal 70+ Antivirus Engines with SHA-256 digest...</span>
            </div>
          )}

          {hashResult.virusTotal && (
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    VirusTotal Multi-Antivirus Intelligence
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  hashResult.virusTotal.status === 'malicious'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                    : hashResult.virusTotal.status === 'suspicious'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                    : hashResult.virusTotal.status === 'clean'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30'
                }`}>
                  {hashResult.virusTotal.status === 'clean'
                    ? '0 Detections (Clean)'
                    : hashResult.virusTotal.status === 'not_found'
                    ? 'Unindexed Hash'
                    : hashResult.virusTotal.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">AV Engines</span>
                  <span className="text-sm font-bold text-white font-mono">{hashResult.virusTotal.totalEngines}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-rose-400 uppercase block">Malicious Detections</span>
                  <span className={`text-sm font-bold font-mono ${hashResult.virusTotal.stats.malicious > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {hashResult.virusTotal.stats.malicious}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block">Suspicious Signs</span>
                  <span className={`text-sm font-bold font-mono ${hashResult.virusTotal.stats.suspicious > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {hashResult.virusTotal.stats.suspicious}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">Harmless / Clean</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {hashResult.virusTotal.stats.harmless}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p>
                  {hashResult.virusTotal.status === 'clean'
                    ? '✓ Verified Clean: 70+ global AV vendors (Bitdefender, CrowdStrike, Kaspersky, Microsoft Defender) report zero threats for this hash.'
                    : hashResult.virusTotal.status === 'malicious'
                    ? '⚠ Warning: One or more global antivirus vendors have identified this cryptographic checksum as malware or malicious payload.'
                    : 'ℹ Unindexed Hash: This file hash has not been previously uploaded to VirusTotal public intelligence registries.'}
                </p>
                <p className="text-slate-500 text-[10px]">
                  Zero File Upload Guarantee: Only the mathematical SHA-256 hash was queried. Your actual file never leaves your browser.
                </p>
              </div>
            </div>
          )}

          {/* Security & Cryptography Boundary Warning */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-400 space-y-1">
            <div className="flex items-center space-x-2 text-cyan-300 font-semibold">
              <Info className="w-4 h-4" />
              <span>Cryptographic Integrity vs. Malware Verdicts</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              A matching hash proves byte-level equality with a reference file; it does not independently prove the file is free of malicious intent. An unknown hash indicates the file has not been compared against a verified baseline, not that it is unsafe.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
