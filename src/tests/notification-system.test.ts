import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { notificationStore } from '../lib/notifications/notification-store';
import { SecurityNotification } from '../lib/notifications/types';

describe('Security Notification System Test Suite (Phase 3)', () => {
  beforeEach(() => {
    notificationStore.resetForTesting();
  });

  describe('1. Priority Ordering & Severity Arbitration', () => {
    it('should prioritize CRITICAL threats over medium_risk and informational alerts', () => {
      // 1. Emit informational notification
      notificationStore.notify({
        severity: 'informational',
        title: 'Background Sync Complete',
        explanation: 'Local rules updated.',
        evidence: ['Local database synchronized'],
        recommendedAction: 'None',
        source: 'System',
        dismissible: true,
      });

      // 2. Emit medium_risk notification
      notificationStore.notify({
        severity: 'medium_risk',
        title: 'Unusual Redirect Chain',
        explanation: 'Observed 3 redirects.',
        evidence: ['Hop 1 to Hop 2'],
        recommendedAction: 'Verify URL',
        source: 'URL Inspector',
        dismissible: true,
      });

      // 3. Emit critical notification
      notificationStore.notify({
        severity: 'critical',
        title: 'Active Phishing Barrier Engaged',
        explanation: 'Target domain matches known credential harvester.',
        evidence: ['VirusTotal 12 AV flags', 'Homograph lookalike'],
        recommendedAction: 'Do not proceed',
        source: 'URL Inspector',
        target: 'evil-bank-login.xyz',
        dismissible: false,
        isBlocked: true,
      });

      const active = notificationStore.getActiveNotifications();
      assert.ok(active.length >= 3);
      assert.strictEqual(active[0].severity, 'critical', 'Top alert must be critical');
      assert.strictEqual(active[1].severity, 'medium_risk', 'Second alert must be medium_risk');
      assert.strictEqual(active[2].severity, 'informational', 'Third alert must be informational');
    });

    it('should prioritize INCONCLUSIVE states above medium_risk to enforce fail-closed behavior', () => {
      notificationStore.notify({
        severity: 'medium_risk',
        title: 'Suspicious Domain Age',
        explanation: 'Domain registered 2 days ago.',
        evidence: ['WHOIS record'],
        recommendedAction: 'Caution',
        source: 'URL Inspector',
        dismissible: true,
      });

      notificationStore.notify({
        severity: 'inconclusive',
        title: 'Security Telemetry Timed Out',
        explanation: 'External vendor was unreachable. No safety guarantee made.',
        evidence: ['HTTP 504 from Threat Intel Provider'],
        recommendedAction: 'Exercise extreme caution.',
        source: 'Network Scanner',
        dismissible: true,
      });

      const active = notificationStore.getActiveNotifications();
      assert.strictEqual(active[0].severity, 'inconclusive', 'Inconclusive check must rank above medium_risk');
    });
  });

  describe('2. Deduplication & Anti-Flooding Controls', () => {
    it('should deduplicate recurring alerts with identical source, target, and severity', () => {
      const initial = notificationStore.notify({
        severity: 'high_risk',
        title: 'Credential Harvesting Detected',
        explanation: 'Password input on plain HTTP connection.',
        evidence: ['Insecure form submission'],
        recommendedAction: 'Close tab',
        source: 'Form Guard',
        target: 'http://insecure-form.test/login',
        dismissible: false,
      });

      // Emit identical alert again
      const duplicate = notificationStore.notify({
        severity: 'high_risk',
        title: 'Credential Harvesting Detected',
        explanation: 'Password input on plain HTTP connection.',
        evidence: ['Form action mismatch'],
        recommendedAction: 'Close tab',
        source: 'Form Guard',
        target: 'http://insecure-form.test/login',
        dismissible: false,
      });

      const active = notificationStore.getActiveNotifications();
      const matching = active.filter((n) => n.target === 'http://insecure-form.test/login');
      assert.strictEqual(matching.length, 1, 'Duplicate alert should be merged into single active item');
      assert.ok(matching[0].evidence.includes('Insecure form submission'));
      assert.ok(matching[0].evidence.includes('Form action mismatch'), 'Evidence from both events must be unified');
    });
  });

  describe('3. Dismissal Policy & Acknowledgment Barriers', () => {
    it('should permit dismissal of informational and medium_risk notifications', () => {
      const infoNotif = notificationStore.notify({
        severity: 'informational',
        title: 'Rule Cache Cleared',
        explanation: 'In-memory cache reset.',
        evidence: ['Manual trigger'],
        recommendedAction: 'None',
        source: 'System',
        dismissible: true,
      });

      const dismissed = notificationStore.dismiss(infoNotif.id);
      assert.strictEqual(dismissed, true);
      assert.ok(!notificationStore.getActiveNotifications().some((n) => n.id === infoNotif.id));
    });

    it('should REJECT casual dismissal of unacknowledged CRITICAL threats without force override', () => {
      const criticalNotif = notificationStore.notify({
        severity: 'critical',
        title: 'Banking Trojan Signature',
        explanation: 'Malicious payload in download link.',
        evidence: ['YARA match'],
        recommendedAction: 'Quarantine immediately',
        source: 'Malware Engine',
        dismissible: false,
        isBlocked: true,
      });

      // Regular casual dismissal must be blocked
      const dismissed = notificationStore.dismiss(criticalNotif.id, false);
      assert.strictEqual(dismissed, false, 'Critical threat must not be dismissed without confirmation');
      assert.ok(notificationStore.getActiveNotifications().some((n) => n.id === criticalNotif.id));

      // Explicit forced override or resolution must succeed
      const forcedDismiss = notificationStore.dismiss(criticalNotif.id, true);
      assert.strictEqual(forcedDismiss, true, 'Forced override must succeed');
    });
  });

  describe('4. Uncertainty Invariant: Never Promise 100% Safety', () => {
    it('should ensure safe completion never promises guaranteed safety', () => {
      const completionNotif = notificationStore.notify({
        severity: 'resolved',
        title: 'Check Completed: No Known Threat Found',
        explanation: 'All configured deterministic and threat-intel engines answered with no malicious match.',
        evidence: ['0 AV detections on VirusTotal', 'Domain age > 10 years'],
        recommendedAction: 'Proceed with normal awareness. Absence of evidence is not proof of safety.',
        source: 'Scan Engine',
        dismissible: true,
      });

      assert.ok(!completionNotif.title.toLowerCase().includes('guaranteed safe'));
      assert.ok(!completionNotif.explanation.toLowerCase().includes('100% safe'));
      assert.ok(completionNotif.recommendedAction.includes('Absence of evidence is not proof of safety'));
    });
  });

  describe('5. Persistent History & Audit Trail', () => {
    it('should record all events in chronological history archive', () => {
      notificationStore.notify({
        severity: 'informational',
        title: 'Scan 1 Started',
        explanation: 'Inspecting link.',
        evidence: ['DNS resolved'],
        recommendedAction: 'Wait',
        source: 'Scanner',
        dismissible: true,
      });

      notificationStore.notify({
        severity: 'medium_risk',
        title: 'Scan 2 Suspicious',
        explanation: 'Urgency flag.',
        evidence: ['Text match'],
        recommendedAction: 'Verify',
        source: 'Scanner',
        dismissible: true,
      });

      const history = notificationStore.getHistory();
      assert.ok(history.length >= 2);
      assert.strictEqual(history[0].title, 'Scan 2 Suspicious');
      assert.strictEqual(history[1].title, 'Scan 1 Started');
    });
  });
});
