// AI Protector — English & Hindi Translation Dictionary with Elder Mode Support
// Designed for Indian citizens, students, and senior citizens.

export type SupportedLanguage = 'en' | 'hi';

export interface Translations {
  appName: string;
  tagline: string;
  trustNotice: string;
  otpWarning: string;
  whatHappensToInput: string;
  whatHappensExplanation: string;
  elderMode: string;
  languageSelect: string;
  
  // Navigation Tabs
  tabCheckAnything: string;
  tabBreach: string;
  tabPassword: string;
  tabPolicy: string;
  tabAppScore: string;
  tabDpdp: string;
  tabEmergency: string;
  tabLearn: string;
  tabDashboard: string;

  // Check Anything Box
  checkInputPlaceholder: string;
  checkButton: string;
  checkingStatus: string;
  verdictSafe: string;
  verdictSuspicious: string;
  verdictScam: string;
  neverHundredPercent: string;
  confidenceLabel: string;
  redFlagsLabel: string;
  explanationLabel: string;
  doThisNextTitle: string;

  // Indian Remediation Actions
  action1930: string;
  action1930Desc: string;
  actionChakshu: string;
  actionChakshuDesc: string;
  actionCyberCrimeGov: string;
  actionCyberCrimeGovDesc: string;
  actionContactBank: string;
  actionContactBankDesc: string;
  actionChangePasswords: string;
  actionChangePasswordsDesc: string;

  // Breach & Passwords
  breachTitle: string;
  breachPlaceholder: string;
  checkBreachBtn: string;
  breachSafeNotice: string;
  breachFoundNotice: string;
  passwordTitle: string;
  passwordPlaceholder: string;
  passwordKAnonymityNotice: string;

  // DPDP Rights
  dpdpTitle: string;
  dpdpNotice2027: string;
  generateLetterBtn: string;
  daysRemainingLabel: string;

  // Emergency Mode
  emergencyBannerTitle: string;
  emergencyStep1: string;
  emergencyStep2: string;
  emergencyStep3: string;
  downloadDisputeLetterBtn: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'AI Protector India',
    tagline: 'Your trusted companion to check links, messages, numbers, apps & leaked data safely.',
    trustNotice: 'Evidence-based warnings, honestly labelled. No account needed. Zero tracking.',
    otpWarning: '🔒 AI Protector will NEVER ask for your OTP, UPI PIN, Bank Password, Aadhaar or PAN card number.',
    whatHappensToInput: 'What happens to your input?',
    whatHappensExplanation: 'Your query is processed in-memory in real time to detect fraud patterns. We never store raw messages, passwords, or personal identity numbers on our servers. All history stays strictly in your browser local storage.',
    elderMode: 'Elder Mode (Large Text)',
    languageSelect: 'Language / भाषा',

    tabCheckAnything: 'Check Anything',
    tabBreach: 'Data Breaches',
    tabPassword: 'Password Safety',
    tabPolicy: 'Policy Summarizer',
    tabAppScore: 'App Privacy Score',
    tabDpdp: 'DPDP Rights',
    tabEmergency: '🚨 Money-Lost Help (1930)',
    tabLearn: 'Scam Playbooks & Simulator',
    tabDashboard: 'My Privacy Dashboard',

    checkInputPlaceholder: 'Paste any link (URL), SMS/message, or 10-digit Indian phone number...',
    checkButton: 'Check for Threats',
    checkingStatus: 'Analyzing against Indian cybercrime telemetry & threat intelligence...',
    verdictSafe: 'Likely Safe (No Known Threat)',
    verdictSuspicious: 'Possibly Suspicious',
    verdictScam: 'Likely Scam / Phishing Hazard',
    neverHundredPercent: '⚠️ No system can guarantee 100% safety. Always stay vigilant with unexpected messages.',
    confidenceLabel: 'Confidence Level',
    redFlagsLabel: 'Identified Red Flags & Warning Signs',
    explanationLabel: 'Plain Language Explanation',
    doThisNextTitle: 'Do This Next (Official India Steps)',

    action1930: 'Call 1930 Immediately',
    action1930Desc: 'National Cyber Crime Helpline for immediate financial fraud account freeze (Golden Hour).',
    actionChakshu: 'Report on Chakshu (Sanchar Saathi)',
    actionChakshuDesc: 'Department of Telecommunications portal to block suspected fraud numbers & smishing senders.',
    actionCyberCrimeGov: 'File on Cybercrime.gov.in',
    actionCyberCrimeGovDesc: 'Official Government of India portal for formal FIR / complaint registration.',
    actionContactBank: 'Contact Your Bank',
    actionContactBankDesc: 'Freeze affected cards, UPI IDs, and net banking immediately.',
    actionChangePasswords: 'Change Passwords',
    actionChangePasswordsDesc: 'Update passwords and enable 2-Factor Authentication (App-based authenticator preferred).',

    breachTitle: 'Check if Your Email was Leaked in a Data Breach',
    breachPlaceholder: 'Enter your email address (e.g. name@gmail.com)...',
    checkBreachBtn: 'Check Leaks',
    breachSafeNotice: 'Good news! This email address does not appear in known public data breaches.',
    breachFoundNotice: 'Warning: This email address appeared in known breach databases.',
    passwordTitle: 'Client-Side Password Pwned Checker',
    passwordPlaceholder: 'Enter password to test if compromised...',
    passwordKAnonymityNotice: '🔒 Privacy Guarantee: Your password is NEVER sent over the internet. Only the first 5 characters of its SHA-1 hash are checked using k-anonymity.',

    dpdpTitle: 'India DPDP Act 2023 Rights Toolkit',
    dpdpNotice2027: 'ℹ️ Legal Note: The Digital Personal Data Protection Act 2023 is enacted; detailed procedural rules phase in towards 13 May 2027. Verify all notices against official gazetted text.',
    generateLetterBtn: 'Generate Data Deletion Request Letter',
    daysRemainingLabel: 'Statutory Grievance Countdown (90 Days)',

    emergencyBannerTitle: '🚨 Lost Money to Cyber Fraud? Act in the "Golden Hour"',
    emergencyStep1: 'Step 1: Dial 1930 right now. Have your bank account number and transaction ID / UTR ready.',
    emergencyStep2: 'Step 2: Note down the Acknowledgement Number given by the 1930 operator.',
    emergencyStep3: 'Step 3: Submit our generated dispute letter to your bank manager within 24 hours to claim zero-liability under RBI circular.',
    downloadDisputeLetterBtn: 'Generate Bank Dispute & Liability Letter',
  },
  hi: {
    appName: 'एआई प्रोटेक्टर इंडिया',
    tagline: 'लिंक, संदेश, फोन नंबर, ऐप्स और लीक हुए डेटा की सुरक्षित जांच के लिए आपका भरोसेमंद साथी।',
    trustNotice: 'तथ्यों पर आधारित चेतावनियां। किसी खाते की आवश्यकता नहीं। शून्य ट्रैकिंग।',
    otpWarning: '🔒 एआई प्रोटेक्टर कभी भी आपका ओटीपी (OTP), यूपीआई पिन, बैंक पासवर्ड, आधार या पैन कार्ड नंबर नहीं मांगता।',
    whatHappensToInput: 'आपके इनपुट का क्या होता है?',
    whatHappensExplanation: 'आपके संदेश या लिंक की जांच सीधे मेमोरी में की जाती है। हम कभी भी आपके निजी संदेश, पासवर्ड या पहचान पत्र हमारे सर्वर पर सुरक्षित नहीं रखते। सारा इतिहास केवल आपके ब्राउज़र में रहता है।',
    elderMode: 'बुजुर्ग मोड (बड़ा टेक्स्ट)',
    languageSelect: 'भाषा / Language',

    tabCheckAnything: 'कुछ भी जांचें (Check Anything)',
    tabBreach: 'डेटा लीक जांच',
    tabPassword: 'पासवर्ड सुरक्षा',
    tabPolicy: 'प्राइवेसी पॉलिसी सार',
    tabAppScore: 'ऐप प्राइवेसी स्कोर',
    tabDpdp: 'DPDP अधिकार टूलकिट',
    tabEmergency: '🚨 पैसे कट गए? आपातकालीन सहायता (1930)',
    tabLearn: 'स्कैम सीखें और कॉल सिम्युलेटर',
    tabDashboard: 'मेरी प्राइवेसी डैशबोर्ड',

    checkInputPlaceholder: 'कोई भी लिंक (URL), एसएमएस/संदेश या 10 अंकों का मोबाइल नंबर यहां पेस्ट करें...',
    checkButton: 'जांच शुरू करें',
    checkingStatus: 'भारतीय साइबर अपराध डाटाबेस और सुरक्षा तंत्र से जांच जारी है...',
    verdictSafe: 'सुरक्षित प्रतीत होता है (कोई ज्ञात खतरा नहीं)',
    verdictSuspicious: 'संदेहास्पद (सावधानी बरतें)',
    verdictScam: 'संभावित धोखाधड़ी / स्कैम (Likely Scam)',
    neverHundredPercent: '⚠️ कोई भी प्रणाली 100% सुरक्षा की गारंटी नहीं दे सकती। अनजान संदेशों पर हमेशा सतर्क रहें।',
    confidenceLabel: 'विश्वास स्तर (Confidence)',
    redFlagsLabel: 'पकड़े गए खतरे और संदिग्ध संकेत',
    explanationLabel: 'सरल भाषा में व्याख्या',
    doThisNextTitle: 'अब आगे क्या करें (आधिकारिक भारतीय कदम)',

    action1930: 'तुरंत 1930 पर कॉल करें',
    action1930Desc: 'वित्तीय धोखाधड़ी रोकने और पैसे फ्रीज कराने के लिए राष्ट्रीय साइबर हेल्पलाइन।',
    actionChakshu: 'चक्षु (संचार साथी) पर शिकायत करें',
    actionChakshuDesc: 'धोखाधड़ी वाले नंबरों और फर्जी एसएमएस को ब्लॉक कराने के लिए दूरसंचार विभाग का पोर्टल।',
    actionCyberCrimeGov: 'cybercrime.gov.in पर रिपोर्ट दर्ज करें',
    actionCyberCrimeGovDesc: 'औपचारिक कानूनी शिकायत या एफआईआर (FIR) के लिए भारत सरकार का राष्ट्रीय पोर्टल।',
    actionContactBank: 'अपने बैंक से तुरंत संपर्क करें',
    actionContactBankDesc: 'प्रभावित बैंक कार्ड, यूपीआई आईडी और नेट बैंकिंग को तत्काल ब्लॉक करवाएं।',
    actionChangePasswords: 'पासवर्ड बदलें',
    actionChangePasswordsDesc: 'अपने महत्वपूर्ण खातों के पासवर्ड बदलें और टू-फैक्टर ऑथेंटिकेशन (2FA) चालू करें।',

    breachTitle: 'जांचें कि क्या आपका ईमेल किसी डेटा लीक में आया है',
    breachPlaceholder: 'अपना ईमेल दर्ज करें (जैसे name@gmail.com)...',
    checkBreachBtn: 'लीक जांचें',
    breachSafeNotice: 'अच्छी खबर! आपका ईमेल किसी भी ज्ञात सार्वजनिक डेटा लीक में नहीं मिला।',
    breachFoundNotice: 'चेतावनी: यह ईमेल ज्ञात डेटा लीक में पाया गया है। तुरंत पासवर्ड बदलें।',
    passwordTitle: 'सुरक्षित पासवर्ड जांच (क्लाइंट-साइड)',
    passwordPlaceholder: 'जांचने के लिए पासवर्ड दर्ज करें...',
    passwordKAnonymityNotice: '🔒 प्राइवेसी गारंटी: आपका पूरा पासवर्ड कभी इंटरनेट पर नहीं भेजा जाता। k-anonymity तकनीक द्वारा केवल हैश के पहले 5 अक्षर जांचे जाते हैं।',

    dpdpTitle: 'भारत डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023',
    dpdpNotice2027: 'ℹ️ कानूनी सूचना: DPDP अधिनियम पारित हो चुका है; विस्तृत प्रक्रियात्मक नियम 13 मई 2027 तक लागू होंगे। हमेशा आधिकारिक राजपत्र से पुष्टि करें।',
    generateLetterBtn: 'डेटा डिलीट करने का कानूनी आवेदन पत्र बनाएं',
    daysRemainingLabel: 'शिकायत निवारण उलटी गिनती (90 दिन)',

    emergencyBannerTitle: '🚨 साइबर ठगी में पैसे कट गए? "गोल्डन ऑवर" में तुरंत कदम उठाएं',
    emergencyStep1: 'कदम 1: तुरंत 1930 डायल करें। अपना खाता नंबर और ट्रांजेक्शन आईडी/UTR तैयार रखें।',
    emergencyStep2: 'कदम 2: 1930 ऑपरेटर से मिले एक्नॉलेजमेंट नंबर (Complaint ID) को संभाल कर रखें।',
    emergencyStep3: 'कदम 3: आरबीआई (RBI) नियमों के तहत रिफंड पाने के लिए 24 घंटे के भीतर अपने बैंक में हमारा विवाद पत्र जमा करें।',
    downloadDisputeLetterBtn: 'बैंक विवाद और शून्य-देयता पत्र तैयार करें',
  },
};
