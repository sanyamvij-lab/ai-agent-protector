// AI Protector India — Scam Playbooks & Interactive Fake Call Simulator
// Curated defensive guides for India's 5 most prevalent cyber fraud schemes.

export interface ScamPlaybook {
  id: string;
  title: string;
  hindiTitle: string;
  badge: string;
  modality: 'Phone / Video Call' | 'SMS / WhatsApp' | 'Telegram' | 'Remote App';
  howItWorks: string;
  psychologicalTrigger: string;
  redFlags: string[];
  goldenRule: string;
}

export interface SimulatorDialogueChoice {
  text: string;
  isSafe: boolean;
  feedback: string;
}

export interface SimulatorStep {
  callerVoice: string;
  callerStatement: string;
  choices: SimulatorDialogueChoice[];
}

export const SCAM_PLAYBOOKS: ScamPlaybook[] = [
  {
    id: 'digital_arrest',
    title: 'Digital Arrest Scam',
    hindiTitle: 'डिजिटल अरेस्ट ठगी',
    badge: 'Critical National Hazard',
    modality: 'Phone / Video Call',
    howItWorks: 'Criminals posing as CBI, Mumbai Police, or Customs officers video-call the victim against a fake police station backdrop. They claim a parcel containing narcotics or illegal passports was found linked to the victim\'s Aadhaar, and threaten immediate imprisonment unless funds are transferred to a "RBI verification account".',
    psychologicalTrigger: 'Fear of criminal prosecution and public humiliation.',
    redFlags: [
      'Caller demands that you stay isolated in a room on video call for hours ("Digital Arrest").',
      'Threatens you with arrest warrants signed by fake Supreme Court judges.',
      'Demands that you transfer your entire bank savings to a "government clearance" bank account.',
    ],
    goldenRule: 'INDIAN LAW HAS NO CONCEPT OF "DIGITAL ARREST". Police, CBI, and Customs NEVER conduct arrests, interrogations, or financial clearances over WhatsApp or Skype video calls.',
  },
  {
    id: 'electricity_kyc',
    title: 'Electricity Bill Disconnection Scam',
    hindiTitle: 'बिजली बिल कटने का फर्जी संदेश',
    badge: 'High Frequency',
    modality: 'SMS / WhatsApp',
    howItWorks: 'Victims receive an SMS stating: "Dear Consumer, your electricity will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Call electricity officer at 98xxxx immediately."',
    psychologicalTrigger: 'Panic of sudden darkness and household disruption.',
    redFlags: [
      'Sent from an ordinary 10-digit mobile number instead of an official utility header (e.g., AD-BSES, VM-MSEDCL).',
      'Provides a personal mobile number to call rather than an official sub-station helpline.',
      'Caller instructs you to download an app (QuickSupport / AnyDesk) or pay a nominal ₹10 fee via a suspicious link.',
    ],
    goldenRule: 'Discoms give physical 15-day notice before disconnection. Never call mobile numbers given in SMS.',
  },
  {
    id: 'part_time_job',
    title: 'Part-Time Telegram Task Scam',
    hindiTitle: 'टेलीग्राम पार्ट-टाइम जॉब फ्रॉड',
    badge: 'Common Student Trap',
    modality: 'Telegram',
    howItWorks: 'Scammers offer ₹3,000 to ₹8,000 per day for liking YouTube videos, rating Google Maps hotels, or reviewing apps. Initially, small payouts (₹200–₹500) are credited to build trust. Then, the victim is added to a VIP Telegram group and pressured to deposit ₹50,000+ for "high-return crypto tasks", after which all withdrawals are frozen.',
    psychologicalTrigger: 'Greed and lure of easy side income.',
    redFlags: [
      'Unsolicited job offer sent via WhatsApp from foreign (+1 / +62 / +234) numbers.',
      'Requires communication strictly on Telegram groups.',
      'Demands you pay money or "recharge" before you can withdraw your earned commission.',
    ],
    goldenRule: 'A real job PAYS you; it never asks you to DEPOSIT your own money to unlock tasks.',
  },
  {
    id: 'sextortion',
    title: 'Sextortion Video Call Blackmail',
    hindiTitle: 'सेक्सटॉर्शन वीडियो कॉल ब्लैकमेल',
    badge: 'Severe Extortion',
    modality: 'Phone / Video Call',
    howItWorks: 'An unknown number makes a video call showing an explicit video feed. The victim\'s face is recorded and spliced onto pornographic clips. Minutes later, imposter "Cyber Crime Inspectors" or "YouTube Removal Officers" call, threatening to publish the video to all family contacts unless ransom is paid.',
    psychologicalTrigger: 'Panic, shame, and fear of family reputation loss.',
    redFlags: [
      'Video call from an unknown WhatsApp number.',
      'Threat calls from someone claiming to be a "Crime Branch Inspector" demanding money to delete a YouTube link.',
      'Refusal to send an official written legal summon.',
    ],
    goldenRule: 'Disconnect immediately. Never pay a single rupee (extortion never stops after payment). Dial 1930 and file a complaint on cybercrime.gov.in.',
  },
  {
    id: 'anydesk_remote',
    title: 'Fake Customer Care Remote Access Scam',
    hindiTitle: 'फर्जी कस्टमर केयर व स्क्रीन शेयरिंग फ्रॉड',
    badge: 'High Financial Loss',
    modality: 'Remote App',
    howItWorks: 'When searching Google for customer care numbers for banks, food delivery, or couriers, victims find fraudulent search ads. The imposter executive asks the victim to install AnyDesk, TeamViewer, or RustDesk to "process refund", steals screen access, and empties bank balances while watching the user enter OTPs.',
    psychologicalTrigger: 'Urgency to get a refund or resolve a transaction issue.',
    redFlags: [
      'Customer support asks you to install AnyDesk, RustDesk, or QuickSupport on your mobile phone.',
      'Asks you to open your mobile banking or enter your UPI PIN to "receive" money.',
    ],
    goldenRule: 'UPI PIN IS ONLY NEEDED TO SEND MONEY, NEVER TO RECEIVE MONEY. Never install screen-sharing apps on caller instructions.',
  },
];

export const SIMULATOR_SCENARIO: SimulatorStep[] = [
  {
    callerVoice: 'Inspector Sharma, Cyber Cell / Customs Mumbai',
    callerStatement: 'Attention! A DHL courier parcel booked with your Aadhaar ID containing 5 illegal passports and 150 grams of MDMA drugs has been confiscated at Mumbai Airport. You are under digital arrest. Stay on camera or police will arrive at your door in 15 minutes!',
    choices: [
      {
        text: 'Sir please forgive me! I have not done anything. Which bank account should I transfer my money into for clearance?',
        isSafe: false,
        feedback: '❌ Vulnerable! The scammer has triggered fear. By asking where to transfer money, you fell into their trap. Remember: Indian law does not have "Digital Arrest". Police never demand funds over video calls.',
      },
      {
        text: 'Police never conduct arrests or interrogations over WhatsApp video calls. I am disconnecting, calling 1930, and reporting this to my local police station.',
        isSafe: true,
        feedback: '✅ Safe response! You correctly identified that Indian law enforcement NEVER arrests anyone digitally or asks for bank transfers. Calling 1930 and visiting the police station is the exact right protocol.',
      },
      {
        text: 'Let me show you my bank statement on camera so you can verify I am an honest citizen.',
        isSafe: false,
        feedback: '❌ Hazardous! Showing bank balances or private documents allows the scammer to gauge how much money they can extort from you. Never share financial details on video calls.',
      },
    ],
  },
];
