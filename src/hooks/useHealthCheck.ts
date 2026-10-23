'use client';

import { useState, useEffect } from 'react';

export interface SystemHealthData {
  status: 'healthy' | 'degraded';
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  memoryMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  providers: {
    localHeuristics: {
      status: string;
      latencyMs: number;
      mode: string;
    };
    cloudAiGateway: {
      status: string;
      provider: string;
      requiresConsent: boolean;
    };
  };
  securityControls: {
    antiSsrfGuard: string;
    piiRedactor: string;
    locationTracking: string;
    serverRetention: string;
  };
}

export function useHealthCheck(pollIntervalMs = 15000) {
  const [data, setData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: SystemHealthData = await res.json();
      setData(json);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Health check unreachable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, pollIntervalMs);
    return () => clearInterval(interval);
  }, [pollIntervalMs]);

  return { data, loading, error, refetch: checkHealth };
}
