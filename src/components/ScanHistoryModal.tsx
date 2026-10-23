'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  X,
  Trash2,
  Download,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  MessageSquare,
  Globe,
  Scale,
  FileCheck,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export interface ScanHistoryRecord {
  id: string;
  timestamp: string;
  type: 'message' | 'link' | 'claim' | 'file';
  summary: string;
  riskLevel: 'low' | 'suspicious' | 'high_risk' | 'unverified';
  piiScrubbed: number;
}

const STORAGE_KEY = 'ai_protector_scan_history';

export class LocalHistoryStore {
  public static getHistory(): ScanHistoryRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static addRecord(record: Omit<ScanHistoryRecord, 'id' | 'timestamp'>): ScanHistoryRecord {
    const fullRecord: ScanHistoryRecord = {
      ...record,
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      try {
        const history = this.getHistory();
        const updated = [fullRecord, ...history].slice(0, 50); // Keep last 50
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore quota errors
      }
    }
    return fullRecord;
  }

  public static removeRecord(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const history = this.getHistory().filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore
    }
  }

  public static clearAll(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

interface ScanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCleared: () => void;
}

export const ScanHistoryModal: React.FC<ScanHistoryModalProps> = ({
  isOpen,
  onClose,
  onCleared,
}) => {
  const [records, setRecords] = useState<ScanHistoryRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRecords(LocalHistoryStore.getHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeleteItem = (id: string) => {
    LocalHistoryStore.removeRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAll = () => {
    LocalHistoryStore.clearAll();
    setRecords([]);
    onCleared();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ai-protector-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getTypeIcon = (type: ScanHistoryRecord['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-400" />;
      case 'link':
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
      case 'claim':
        return <Scale className="w-3.5 h-3.5 text-amber-400" />;
      case 'file':
        return <FileCheck className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const getRiskBadge = (level: ScanHistoryRecord['riskLevel']) => {
    switch (level) {
      case 'high_risk':
        return (
          <Badge variant="high" className="text-[10px] py-0 px-2 flex items-center space-x-1">
            <ShieldAlert className="w-3 h-3 mr-1" />
            <span>High Risk</span>
          </Badge>
        );
      case 'suspicious':
        return (
          <Badge variant="suspicious" className="text-[10px] py-0 px-2 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 mr-1" />
            <span>Suspicious</span>
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="success" className="text-[10px] py-0 px-2 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 mr-1" />
            <span>Low Risk</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className="text-[10px] py-0 px-2">
            <span>Unverified</span>
          </Badge>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Local Scan Audit Log</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/20 text-[10px] font-semibold flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5 mr-0.5" />
                  <span>100% Client-Side</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved in your browser&apos;s private storage. Zero data is retained on AI Protector servers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        {records.length > 0 && (
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900/50 border-b border-slate-800/80 text-xs">
            <span className="text-slate-400">
              Showing <strong className="text-white">{records.length}</strong> recorded inspection(s)
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                className="text-xs py-1 h-7 border-slate-700"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export JSON
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleClearAll}
                className="text-xs py-1 h-7"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Purge All
              </Button>
            </div>
          </div>
        )}

        {/* Body / List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {records.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <History className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300">No Scan History Found</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Completed scans will be logged here strictly inside your private browser session.
              </p>
            </div>
          ) : (
            records.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-slate-600/50 transition-all text-xs"
              >
                <div className="space-y-1 pr-3 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] uppercase">
                      {getTypeIcon(item.type)}
                      <span className="ml-1">{item.type}</span>
                    </span>
                    {getRiskBadge(item.riskLevel)}
                    {item.piiScrubbed > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 text-[10px] font-semibold border border-cyan-500/20">
                        {item.piiScrubbed} PII scrubbed
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 truncate font-medium text-[11px] pt-0.5">
                    {item.summary}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors ml-2 flex-shrink-0"
                  title="Delete record"
                  aria-label="Delete this scan record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 bg-slate-900/60">
          <span className="flex items-center space-x-1">
            <Lock className="w-3 h-3 text-emerald-400 mr-1" />
            <span>Guaranteed zero telemetry transfer</span>
          </span>
          <Button variant="secondary" size="sm" onClick={onClose} className="h-7 text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
