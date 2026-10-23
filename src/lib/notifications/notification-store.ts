// AI Protector - Security Notification Store & Lifecycle Governor
// Manages alert priority, deduplication, persistent history, and threat blocking barriers.

import { SecurityNotification, NotificationSeverity } from './types';

const STORAGE_KEY = 'ai_protector_notification_history';
const PREFS_KEY = 'ai_protector_notification_prefs';

const SEVERITY_PRIORITY: Record<NotificationSeverity, number> = {
  critical: 5,
  high_risk: 4,
  inconclusive: 3,
  medium_risk: 2,
  informational: 1,
  resolved: 0,
};

type Listener = (notifications: SecurityNotification[]) => void;

class NotificationStore {
  private notifications: SecurityNotification[] = [];
  private history: SecurityNotification[] = [];
  private listeners: Set<Listener> = new Set();
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initFromStorage();
    }
  }

  private initFromStorage() {
    if (this.isInitialized) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch {
      this.history = [];
    }
    this.isInitialized = true;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getActiveNotifications());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const active = this.getActiveNotifications();
    this.listeners.forEach((l) => l(active));
  }

  public getActiveNotifications(): SecurityNotification[] {
    return [...this.notifications].sort((a, b) => {
      const pDiff = (SEVERITY_PRIORITY[b.severity] || 0) - (SEVERITY_PRIORITY[a.severity] || 0);
      if (pDiff !== 0) return pDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  public getHistory(): SecurityNotification[] {
    this.initFromStorage();
    return [...this.history];
  }

  /**
   * Dispatches a new evidence-based security notification with strict deduplication.
   */
  public notify(params: Omit<SecurityNotification, 'id' | 'timestamp' | 'status'>): SecurityNotification {
    this.initFromStorage();

    // Deduplication key: source + target/title + severity
    const dedupKey = `${params.source}:${params.target || params.title}:${params.severity}`;
    const existingIndex = this.notifications.findIndex(
      (n) => `${n.source}:${n.target || n.title}:${n.severity}` === dedupKey && n.status === 'active'
    );

    const notification: SecurityNotification = {
      ...params,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      status: 'active',
      isBlocked: params.isBlocked ?? (params.severity === 'critical' || params.severity === 'high_risk'),
    };

    if (existingIndex >= 0) {
      // Update existing rather than creating visual alert spam
      this.notifications[existingIndex] = {
        ...this.notifications[existingIndex],
        timestamp: notification.timestamp,
        explanation: notification.explanation,
        evidence: Array.from(new Set([...this.notifications[existingIndex].evidence, ...notification.evidence])),
      };
    } else {
      this.notifications.unshift(notification);
    }

    // Persist to history
    this.archiveNotification(notification);
    this.notifyListeners();
    return notification;
  }

  /**
   * Dismisses an active notification if policy allows.
   */
  public dismiss(id: string, force = false): boolean {
    const target = this.notifications.find((n) => n.id === id);
    if (!target) return false;

    // Critical/High-risk notifications require explicit user resolution or forced override
    if (!target.dismissible && !force && (target.severity === 'critical' || target.severity === 'high_risk')) {
      return false;
    }

    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.updateHistoryStatus(id, 'dismissed');
    this.notifyListeners();
    return true;
  }

  /**
   * Resolves an alert (e.g., threat mitigated, false positive acknowledged).
   */
  public resolve(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.updateHistoryStatus(id, 'resolved');
    this.notifyListeners();
  }

  public clearAllDismissible(): void {
    this.notifications = this.notifications.filter((n) => !n.dismissible && (n.severity === 'critical' || n.severity === 'high_risk'));
    this.notifyListeners();
  }

  public clearHistory(): void {
    this.history = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }

  public resetForTesting(): void {
    this.notifications = [];
    this.history = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    this.notifyListeners();
  }

  private archiveNotification(notification: SecurityNotification) {
    this.history.unshift(notification);
    this.history = this.history.slice(0, 50); // Keep last 50
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
      } catch {}
    }
  }

  private updateHistoryStatus(id: string, status: 'dismissed' | 'resolved') {
    const item = this.history.find((h) => h.id === id);
    if (item) {
      item.status = status;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
        } catch {}
      }
    }
  }
}

export const notificationStore = new NotificationStore();
