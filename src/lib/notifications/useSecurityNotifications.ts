'use client';

import { useState, useEffect, useCallback } from 'react';
import { SecurityNotification } from './types';
import { notificationStore } from './notification-store';

export function useSecurityNotifications() {
  const [activeNotifications, setActiveNotifications] = useState<SecurityNotification[]>([]);
  const [history, setHistory] = useState<SecurityNotification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationStore.subscribe((notifs) => {
      setActiveNotifications(notifs);
      setHistory(notificationStore.getHistory());
    });
    return unsubscribe;
  }, []);

  const notify = useCallback(
    (params: Omit<SecurityNotification, 'id' | 'timestamp' | 'status'>) => {
      return notificationStore.notify(params);
    },
    []
  );

  const dismiss = useCallback((id: string, force = false) => {
    return notificationStore.dismiss(id, force);
  }, []);

  const resolve = useCallback((id: string) => {
    notificationStore.resolve(id);
  }, []);

  const clearHistory = useCallback(() => {
    notificationStore.clearHistory();
    setHistory([]);
  }, []);

  return {
    activeNotifications,
    topNotification: activeNotifications[0] || null,
    history,
    notify,
    dismiss,
    resolve,
    clearHistory,
  };
}
