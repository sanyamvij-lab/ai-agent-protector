'use client';

import React, { useEffect } from 'react';
import { getFirebaseAnalytics, logFirebaseEvent } from '@/lib/firebase/config';

interface FirebaseAnalyticsProviderProps {
  children: React.ReactNode;
}

export function FirebaseAnalyticsProvider({ children }: FirebaseAnalyticsProviderProps) {
  useEffect(() => {
    // Initialize analytics safely in the browser on client mount
    getFirebaseAnalytics().then((analytics) => {
      if (analytics) {
        logFirebaseEvent('app_initialized', {
          platform: 'ai-protector-web',
        });
      }
    });
  }, []);

  return <>{children}</>;
}
