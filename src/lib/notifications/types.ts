// AI Protector - Security Notification System Types
// Reusable, evidence-grounded notification contract with explicit uncertainty states.

export type NotificationSeverity =
  | 'critical'
  | 'high_risk'
  | 'medium_risk'
  | 'informational'
  | 'resolved'
  | 'inconclusive';

export interface SecurityNotification {
  id: string;
  severity: NotificationSeverity;
  title: string;
  explanation: string;
  evidence: string[];
  recommendedAction: string;
  timestamp: string; // ISO-8601
  source: string; // e.g., "URL Deep Inspector", "Message Analyzer", "DPDP Guard"
  target?: string; // Host, message snippet, or hash
  dismissible: boolean;
  isBlocked?: boolean; // Engages defensive protective barrier for confirmed threats
  status: 'active' | 'dismissed' | 'resolved';
}

export interface DismissalPreferences {
  autoDismissInformational: boolean;
  minDismissibleSeverity: 'medium_risk' | 'informational';
}
