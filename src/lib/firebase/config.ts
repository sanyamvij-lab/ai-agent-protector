import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics, logEvent } from 'firebase/analytics';

// Firebase configuration for nexgen-ai-protector
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCwhA9Y4sS4iOYV2QX2A-JfRaox6kXTi1M',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'nexgen-ai-protector.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nexgen-ai-protector',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'nexgen-ai-protector.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '511151282353',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:511151282353:web:855628aab03e12d119ea90',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-F0N0VBF19X',
};

// Initialize Firebase app singleton (safe for Next.js SSR and Hot Reloading)
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let analyticsInstance: Analytics | null = null;

/**
 * Safely initializes and retrieves Firebase Analytics on the client side.
 * Returns null in Node.js, SSR, or unsupported browser environments.
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (analyticsInstance) {
    return analyticsInstance;
  }

  try {
    const supported = await isSupported();
    if (supported) {
      analyticsInstance = getAnalytics(app);
      return analyticsInstance;
    }
  } catch (err) {
    console.warn('[Firebase] Analytics not supported in current environment:', err);
  }

  return null;
}

/**
 * Privacy-preserving event logging wrapper.
 * Invariant: Never log raw messages, full URLs, passwords, or PII.
 */
export async function logFirebaseEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) {
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  } catch {
    // Fail silently in environments where telemetry is blocked or offline
  }
}
