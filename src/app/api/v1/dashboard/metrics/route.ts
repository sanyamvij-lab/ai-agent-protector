import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/gateway/middleware-helpers';

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const searchParams = req.nextUrl.searchParams;
  const period = searchParams.get('period') || '30d';

  // Multiplier or baseline adjustments based on requested time period
  const multiplier = period === '7d' ? 0.25 : period === '90d' ? 2.8 : period === '1y' ? 11.4 : 1.0;

  const totalUsersBase = Math.round(13384 * multiplier);
  const prevUsersBase = Math.round(11720 * multiplier);
  const userGrowthPct = (((totalUsersBase - prevUsersBase) / prevUsersBase) * 100).toFixed(1);

  const totalBlocks = Math.round(4120 * multiplier);
  const prevBlocks = Math.round(3470 * multiplier);
  const blocksGrowthPct = (((totalBlocks - prevBlocks) / prevBlocks) * 100).toFixed(1);

  const metricsResponse = {
    request_id: requestId,
    timestamp: new Date().toISOString(),
    period,
    kpis: {
      total_users: {
        id: 'total_users',
        label: 'Total Users',
        current_value: totalUsersBase,
        formatted_value: totalUsersBase.toLocaleString(),
        previous_value: prevUsersBase,
        change_percentage: `+${userGrowthPct}%`,
        trend: 'up',
        timeframe: period === '7d' ? 'vs past 7 days' : period === '90d' ? 'vs previous quarter' : 'vs last month',
        tooltip: 'Total active users and verified identities monitored across AI Protector defense network.',
        sparkline: [45, 40, 55, 30, 10, 28, 20, 15, 25, 18],
      },
      revenue_growth: {
        id: 'revenue_growth',
        label: 'Revenue Growth',
        current_value: 53,
        formatted_value: '53%',
        previous_value: 48,
        change_percentage: '+5.0%',
        trend: 'up',
        timeframe: 'quarter-over-quarter',
        tooltip: 'Operational efficiency & threat mitigation success index for subscriber tier operations.',
        progress_ring_pct: 25,
        sparkline: [50, 48, 35, 15, 2, 12, 28, 42, 30, 20],
      },
      new_subscriptions: {
        id: 'new_subscriptions',
        label: 'New Subscriptions',
        current_value: totalBlocks,
        formatted_value: totalBlocks.toLocaleString(),
        previous_value: prevBlocks,
        change_percentage: `+${blocksGrowthPct}%`,
        trend: 'up',
        timeframe: 'new enterprise nodes added',
        tooltip: 'Newly provisioned client telemetry nodes and active subscriber protections.',
        grouped_bars: [
          { month: 'Jan', valueA: 30, valueB: 45 },
          { month: 'Feb', valueA: 50, valueB: 70 },
          { month: 'Mar', valueA: 25, valueB: 40 },
          { month: 'Apr', valueA: 45, valueB: 60 },
          { month: 'May', valueA: 65, valueB: 85 },
          { month: 'Dec', valueA: 55, valueB: 75 },
        ],
      },
      retention_rate: {
        id: 'retention_rate',
        label: 'Retention Rate',
        current_value: 430,
        formatted_value: '430',
        sub_label: 'value',
        previous_value: 412,
        change_percentage: '+4.3%',
        trend: 'up',
        timeframe: '98.6% enterprise renewal score',
        tooltip: 'Security posture continuity score measuring zero false-negatives and system trust.',
        gauge_percentage: 89,
      },
    },
    analytics_overview: {
      series_names: ['Total Inquiries', 'Neutralized Vectors'],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      points: [
        { month: 'Jan', lineA: 50, lineB: 80, threats: 120, blocked: 35 },
        { month: 'Feb', lineA: 180, lineB: 140, threats: 210, blocked: 62 },
        { month: 'Mar', lineA: 260, lineB: 310, threats: 320, blocked: 88 },
        { month: 'Apr', lineA: 210, lineB: 230, threats: 245, blocked: 71 },
        { month: 'May', lineA: 220, lineB: 200, threats: 230, blocked: 65 },
        { month: 'Jun', lineA: 340, lineB: 340, threats: 410, blocked: 118 },
        { month: 'Aug', lineA: 410, lineB: 320, threats: 460, blocked: 142 },
        { month: 'Sep', lineA: 380, lineB: 280, threats: 395, blocked: 104 },
        { month: 'Oct', lineA: 220, lineB: 210, threats: 250, blocked: 78 },
        { month: 'Nov', lineA: 290, lineB: 270, threats: 315, blocked: 94 },
        { month: 'Dec', lineA: 390, lineB: 360, threats: 430, blocked: 130 },
      ],
    },
    source_distribution: [
      { id: 'web_risk', label: 'Top Sources', percentage: 35, color: '#8B5CF6', detail: 'Web Exploit & Phishing URLs' },
      { id: 'sms_smishing', label: 'Legend', percentage: 17, color: '#A78BFA', detail: 'SMS Smishing & OTP Scams' },
      { id: 'malware_hashes', label: 'Legend', percentage: 5, color: '#6366F1', detail: 'Payloads & Malware Signatures' },
      { id: 'internal_heuristics', label: 'Other Vectors', percentage: 43, color: '#312E81', detail: 'Deterministic Heuristics & SSRF' },
    ],
    active_projects: [
      {
        id: 'proj-1',
        name: 'Auth & SSO Gateway',
        category: 'API Security',
        progress: 75,
        status: 'Operational',
        indicators: ['verified', 'online', 'active'],
        targetTab: 'link',
        lastUpdated: '2 mins ago',
      },
      {
        id: 'proj-2',
        name: 'SMS Smishing Defense',
        category: 'Message Pipeline',
        progress: 60,
        status: 'Investigating',
        indicators: ['alert', 'online', 'active'],
        targetTab: 'message',
        lastUpdated: '14 mins ago',
      },
      {
        id: 'proj-3',
        name: 'Firmware & Hash Vault',
        category: 'File Integrity',
        progress: 90,
        status: 'Protected',
        indicators: ['verified', 'online', 'active'],
        targetTab: 'file',
        lastUpdated: '1 hour ago',
      },
      {
        id: 'proj-4',
        name: 'Neural Copilot Stream',
        category: 'Gemini Threat AI',
        progress: 45,
        status: 'Protected',
        indicators: ['verified', 'verified', 'online'],
        targetTab: 'claim',
        lastUpdated: '3 hours ago',
      },
    ],
    team_activity: [
      { label: 'Jn', base: 45, top: 25, total: 70 },
      { label: 'Fe', base: 55, top: 30, total: 85 },
      { label: 'Ar', base: 60, top: 35, total: 95 },
      { label: 'Ar', base: 40, top: 28, total: 68 },
      { label: 'Hi', base: 65, top: 40, total: 105 },
      { label: 'Lo', base: 50, top: 35, total: 85 },
    ],
    regional_nodes: [
      { id: 'us-west', name: 'San Francisco, US', x: 19, y: 38, throughput: '14.2k/s', ping: '18ms', status: 'optimal' },
      { id: 'us-east', name: 'New York, US', x: 26, y: 35, throughput: '19.8k/s', ping: '24ms', status: 'optimal' },
      { id: 'eu', name: 'Frankfurt / London', x: 50, y: 30, throughput: '26.4k/s', ping: '12ms', status: 'optimal' },
      { id: 'india', name: 'Bengaluru / Mumbai', x: 68, y: 52, throughput: '42.1k/s', ping: '8ms', status: 'high_traffic' },
      { id: 'ea', name: 'Tokyo / Singapore', x: 82, y: 44, throughput: '31.5k/s', ping: '21ms', status: 'optimal' },
      { id: 'sa', name: 'São Paulo, BR', x: 33, y: 72, throughput: '8.4k/s', ping: '65ms', status: 'normal' },
      { id: 'aus', name: 'Sydney, AU', x: 88, y: 76, throughput: '6.7k/s', ping: '54ms', status: 'normal' },
    ],
  };

  return NextResponse.json(metricsResponse, {
    status: 200,
    headers: {
      'x-request-id': requestId,
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
    },
  });
}
