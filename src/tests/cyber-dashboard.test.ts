import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('CyberDashboard Metrics, Analytics & Vector Filters', () => {
  it('should compute overview threat metrics accurately', () => {
    const overviewData = [
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
    ];

    const totalThreats = overviewData.reduce((acc, d) => acc + d.threats, 0);
    const totalBlocked = overviewData.reduce((acc, d) => acc + d.blocked, 0);

    assert.ok(totalThreats > 3000, 'Total threats analyzed should exceed 3,000');
    assert.ok(totalBlocked > 900, 'Total threats blocked should exceed 900');

    // Peak month verification (Jun has 410, Aug has 460)
    const peakMonth = overviewData.reduce((max, d) => (d.threats > max.threats ? d : max), overviewData[0]);
    assert.strictEqual(peakMonth.month, 'Aug');
    assert.strictEqual(peakMonth.threats, 460);
  });

  it('should correctly sum donut chart top source percentages to 100%', () => {
    const sourcesData = [
      { label: 'Top Sources', pct: 35 },
      { label: 'Legend (SMS)', pct: 17 },
      { label: 'Legend (Malware)', pct: 5 },
      { label: 'Other Vectors', pct: 43 },
    ];

    const totalPct = sourcesData.reduce((acc, s) => acc + s.pct, 0);
    assert.strictEqual(totalPct, 100, 'Top sources donut percentages must sum to 100%');
  });

  it('should correctly filter active projects based on search queries', () => {
    const initialProjects = [
      { id: 'proj-1', name: 'Auth & SSO Gateway', category: 'API Security' },
      { id: 'proj-2', name: 'SMS Smishing Defense', category: 'Message Pipeline' },
      { id: 'proj-3', name: 'Firmware & Hash Vault', category: 'File Integrity' },
      { id: 'proj-4', name: 'Neural Copilot Stream', category: 'Gemini Threat AI' },
    ];

    const filter = (query: string) => {
      const q = query.toLowerCase().trim();
      if (!q) return initialProjects;
      return initialProjects.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    };

    assert.strictEqual(filter('auth').length, 1);
    assert.strictEqual(filter('auth')[0].name, 'Auth & SSO Gateway');

    assert.strictEqual(filter('defense').length, 1);
    assert.strictEqual(filter('defense')[0].id, 'proj-2');

    assert.strictEqual(filter('security').length, 1);
    assert.strictEqual(filter('nonexistent').length, 0);
  });

  it('should have properly bounded radar beacon coordinates within 0-100% viewport', () => {
    const radarLocations = [
      { id: 'us-west', name: 'San Francisco, US', x: 19, y: 38 },
      { id: 'us-east', name: 'New York, US', x: 26, y: 35 },
      { id: 'eu', name: 'Frankfurt / London', x: 50, y: 30 },
      { id: 'india', name: 'Bengaluru / Mumbai', x: 68, y: 52 },
      { id: 'ea', name: 'Tokyo / Singapore', x: 82, y: 44 },
      { id: 'sa', name: 'São Paulo, BR', x: 33, y: 72 },
      { id: 'aus', name: 'Sydney, AU', x: 88, y: 76 },
    ];

    for (const loc of radarLocations) {
      assert.ok(loc.x >= 0 && loc.x <= 100, `Beacon ${loc.id} x coordinate out of bounds`);
      assert.ok(loc.y >= 0 && loc.y <= 100, `Beacon ${loc.id} y coordinate out of bounds`);
    }
  });

  it('should scale telemetry metric baselines correctly across time periods', () => {
    const getMultiplier = (period: string) => {
      return period === '7d' ? 0.25 : period === '90d' ? 2.8 : period === '1y' ? 11.4 : 1.0;
    };

    assert.strictEqual(getMultiplier('7d'), 0.25);
    assert.strictEqual(getMultiplier('30d'), 1.0);
    assert.strictEqual(getMultiplier('90d'), 2.8);
    assert.strictEqual(getMultiplier('1y'), 11.4);

    const baseUsers = 13384;
    const users7d = Math.round(baseUsers * getMultiplier('7d'));
    const users30d = Math.round(baseUsers * getMultiplier('30d'));
    const users90d = Math.round(baseUsers * getMultiplier('90d'));

    assert.ok(users7d < users30d, '7-day users should be less than 30-day users');
    assert.ok(users90d > users30d, '90-day users should exceed 30-day users');
  });

  it('should sort active projects by progress and name accurately', () => {
    const projects = [
      { name: 'Beta', progress: 40 },
      { name: 'Alpha', progress: 90 },
      { name: 'Gamma', progress: 60 },
    ];

    const sortedByProgressDesc = [...projects].sort((a, b) => b.progress - a.progress);
    assert.strictEqual(sortedByProgressDesc[0].name, 'Alpha');
    assert.strictEqual(sortedByProgressDesc[2].name, 'Beta');

    const sortedByNameAsc = [...projects].sort((a, b) => a.name.localeCompare(b.name));
    assert.strictEqual(sortedByNameAsc[0].name, 'Alpha');
    assert.strictEqual(sortedByNameAsc[2].name, 'Gamma');
  });
});

