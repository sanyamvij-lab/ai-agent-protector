// AI Protector India — App Privacy Scorer (0-100)
// Transparent scoring rubric evaluating Android/iOS runtime permissions and embedded trackers.

export interface PermissionDetail {
  id: string;
  name: string;
  category: 'critical' | 'high' | 'medium' | 'low';
  deduction: number;
  plainDescription: string;
  whyDangerous: string;
}

export interface TrackerDetail {
  name: string;
  category: 'advertising' | 'analytics' | 'profiling';
  deduction: number;
  owner: string;
  description: string;
}

export interface AppEvaluationPreset {
  appName: string;
  category: string;
  packageId: string;
  permissions: string[];
  trackers: string[];
}

export const PERMISSION_DATABASE: Record<string, PermissionDetail> = {
  READ_SMS: {
    id: 'READ_SMS',
    name: 'Read SMS / Text Messages',
    category: 'critical',
    deduction: 18,
    plainDescription: 'Allows the app to read all text messages on your device.',
    whyDangerous: 'Unscrupulous loan apps and malware use this to read your confidential bank OTPs and financial balance messages.',
  },
  READ_CONTACTS: {
    id: 'READ_CONTACTS',
    name: 'Read Contacts & Address Book',
    category: 'critical',
    deduction: 15,
    plainDescription: 'Allows the app to copy all phone numbers and names stored in your phone.',
    whyDangerous: 'Fraudulent instant loan apps steal your family contact list to harass and blackmail relatives when extorting payments.',
  },
  ACCESS_FINE_LOCATION: {
    id: 'ACCESS_FINE_LOCATION',
    name: 'Precise GPS Location',
    category: 'high',
    deduction: 14,
    plainDescription: 'Tracks your exact real-time physical coordinates.',
    whyDangerous: 'Can pinpoint your exact home address, workplace, and daily travel routines for commercial profiling.',
  },
  CAMERA: {
    id: 'CAMERA',
    name: 'Take Pictures & Record Video',
    category: 'high',
    deduction: 12,
    plainDescription: 'Can activate the front and rear cameras.',
    whyDangerous: 'Malicious apps can silently capture snapshots or use your face image for unauthorized biometric matching.',
  },
  RECORD_AUDIO: {
    id: 'RECORD_AUDIO',
    name: 'Microphone & Audio Recording',
    category: 'high',
    deduction: 12,
    plainDescription: 'Allows continuous background audio capture.',
    whyDangerous: 'Can listen to surrounding conversations and acoustic environment without visible notification.',
  },
  SYSTEM_ALERT_WINDOW: {
    id: 'SYSTEM_ALERT_WINDOW',
    name: 'Display Over Other Apps (Overlay)',
    category: 'critical',
    deduction: 16,
    plainDescription: 'Allows the app to display floating windows on top of any active screen.',
    whyDangerous: 'Used by banking trojans to project fake login screens over legitimate banking apps to steal passwords.',
  },
  BIND_ACCESSIBILITY_SERVICE: {
    id: 'BIND_ACCESSIBILITY_SERVICE',
    name: 'Accessibility Service Control',
    category: 'critical',
    deduction: 25,
    plainDescription: 'Complete operating system access to inspect all screen contents and simulate button presses.',
    whyDangerous: 'Grants total device takeover. Malware uses this to bypass security checks, grant its own permissions, and transfer funds without user consent.',
  },
};

export const TRACKER_DATABASE: Record<string, TrackerDetail> = {
  facebook_ads: {
    name: 'Meta / Facebook Audience Network',
    category: 'advertising',
    deduction: 7,
    owner: 'Meta Platforms Inc.',
    description: 'Tracks cross-app behavioral activity to deliver targeted behavioral advertisements.',
  },
  appsflyer: {
    name: 'AppsFlyer Attribution',
    category: 'profiling',
    deduction: 6,
    owner: 'AppsFlyer Ltd.',
    description: 'Fingerprints device hardware and ad engagement to track user acquisition channels.',
  },
  inmobi: {
    name: 'InMobi Ad SDK',
    category: 'advertising',
    deduction: 6,
    owner: 'InMobi (India)',
    description: 'Harvests device location and demographic markers to auction ad inventory in real time.',
  },
  google_analytics_firebase: {
    name: 'Google Firebase Analytics',
    category: 'analytics',
    deduction: 4,
    owner: 'Google LLC',
    description: 'Aggregates in-app button clicks, session duration, and feature engagement metrics.',
  },
};

export const SAMPLE_APP_PRESETS: AppEvaluationPreset[] = [
  {
    appName: 'Predatory Instant Loan App (Typical Fraud Pattern)',
    category: 'Finance / Instant Credit',
    packageId: 'com.fastcredit.quickcash.india',
    permissions: ['READ_SMS', 'READ_CONTACTS', 'ACCESS_FINE_LOCATION', 'CAMERA', 'SYSTEM_ALERT_WINDOW'],
    trackers: ['facebook_ads', 'inmobi', 'appsflyer'],
  },
  {
    appName: 'National UPI / Banking App (Standard Security Model)',
    category: 'Banking / Payments',
    packageId: 'in.org.npci.upiapp',
    permissions: ['READ_SMS', 'ACCESS_FINE_LOCATION'],
    trackers: ['google_analytics_firebase'],
  },
  {
    appName: 'Privacy-First Calculator / Tool',
    category: 'Utilities',
    packageId: 'org.foss.privacycalc',
    permissions: [],
    trackers: [],
  },
];

export interface AppScoreResult {
  appName: string;
  score: number; // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  riskRating: 'Exceptional' | 'Standard' | 'Elevated Risk' | 'Hazardous';
  totalDeductions: number;
  permissionsEvaluated: PermissionDetail[];
  trackersEvaluated: TrackerDetail[];
  scoringFormula: string;
}

export class AppPrivacyScorer {
  /**
   * Calculates a transparent 0-100 privacy score based on selected permissions and trackers.
   */
  public static calculate(
    appName: string,
    permissionIds: string[],
    trackerIds: string[]
  ): AppScoreResult {
    let score = 100;
    const permissionsEvaluated: PermissionDetail[] = [];
    const trackersEvaluated: TrackerDetail[] = [];

    for (const pid of permissionIds) {
      const perm = PERMISSION_DATABASE[pid];
      if (perm) {
        permissionsEvaluated.push(perm);
        score -= perm.deduction;
      }
    }

    for (const tid of trackerIds) {
      const tracker = TRACKER_DATABASE[tid];
      if (tracker) {
        trackersEvaluated.push(tracker);
        score -= tracker.deduction;
      }
    }

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'A+';
    let riskRating: 'Exceptional' | 'Standard' | 'Elevated Risk' | 'Hazardous' = 'Exceptional';

    if (score >= 90) {
      grade = 'A+';
      riskRating = 'Exceptional';
    } else if (score >= 80) {
      grade = 'A';
      riskRating = 'Standard';
    } else if (score >= 65) {
      grade = 'B';
      riskRating = 'Elevated Risk';
    } else if (score >= 50) {
      grade = 'C';
      riskRating = 'Elevated Risk';
    } else if (score >= 35) {
      grade = 'D';
      riskRating = 'Hazardous';
    } else {
      grade = 'F';
      riskRating = 'Hazardous';
    }

    return {
      appName,
      score,
      grade,
      riskRating,
      totalDeductions: 100 - score,
      permissionsEvaluated,
      trackersEvaluated,
      scoringFormula: 'Base: 100 pts. Critical Permissions: -15 to -25 pts. Ad Trackers: -6 to -7 pts. Analytics: -4 pts.',
    };
  }
}
