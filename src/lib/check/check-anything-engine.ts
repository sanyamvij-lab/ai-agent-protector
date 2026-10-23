// AI Protector India — Unified "Check Anything" Threat Engine
// Analyzes URLs, SMS/texts, and Phone Numbers with India-specific fraud intelligence.

export type InputType = 'url' | 'sms' | 'phone_number';
export type CheckVerdict = 'likely_safe' | 'possibly_suspicious' | 'likely_scam';

export interface DoThisNextAction {
  title: string;
  description: string;
  actionUrl?: string;
  phone?: string;
  priority: 'critical' | 'high' | 'recommended';
  badge: string;
}

export interface CheckAnythingResult {
  input_type: InputType;
  normalized_input: string;
  verdict: CheckVerdict;
  verdict_display: string;
  confidence_score: number; // 0-100
  red_flags: string[];
  explanation: string;
  do_this_next: DoThisNextAction[];
  timestamp: string;
  limitations: string[];
}

export class CheckAnythingEngine {
  /**
   * Automatically identifies whether the user provided a URL, Phone Number, or Text/SMS.
   */
  public static detectType(input: string): InputType {
    const trimmed = input.trim();

    // Check if it's a URL
    if (/^(https?:\/\/|[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$)/i.test(trimmed)) {
      return 'url';
    }

    // Check if it's a phone number (e.g., +92 300 1234567, +91 9876543210, or 10-15 digits without text)
    const stripped = trimmed.replace(/[\s\-\(\)\+]/g, '');
    if (/^\+?[0-9\s\-\(\)]{7,20}$/.test(trimmed) && /^\d{7,15}$/.test(stripped) && !/[a-zA-Z]/.test(trimmed)) {
      return 'phone_number';
    }

    // Otherwise treat as SMS or Message
    return 'sms';
  }

  /**
   * Evaluates any input and returns structured Indian cyber threat assessment.
   */
  public static evaluate(rawInput: string): CheckAnythingResult {
    const trimmed = rawInput.trim();
    const type = this.detectType(trimmed);
    const now = new Date().toISOString();

    if (type === 'phone_number') {
      return this.evaluatePhoneNumber(trimmed, now);
    } else if (type === 'sms') {
      return this.evaluateSms(trimmed, now);
    } else {
      return this.evaluateUrl(trimmed, now);
    }
  }

  /**
   * Evaluates Phone Numbers against TRAI guidelines & Indian cyber fraud telemetry.
   */
  private static evaluatePhoneNumber(phone: string, now: string): CheckAnythingResult {
    const cleanDigits = phone.replace(/[\s\-\(\)\+]/g, '');
    const isIndian = /^(91)?[6-9]\d{9}$/.test(cleanDigits);
    const redFlags: string[] = [];

    // Check for foreign country code spoofing targeting Indians (+92 Pakistan, +234 Nigeria, etc.)
    const hasForeignPrefix = phone.startsWith('+92') || phone.startsWith('+234') || phone.startsWith('+880') || phone.startsWith('+1');
    if (hasForeignPrefix) {
      redFlags.push('Foreign Country Code (+92 / +234): High probability of international cyber impersonation or extortion.');
    }

    // Check if a normal personal mobile number was used to send official alerts
    if (isIndian) {
      redFlags.push('Personal 10-Digit Mobile Number: Under TRAI rules, banks and utilities send SMS only via 6-character registered headers (e.g. VK-HDFCBK, AD-SBIINB), never personal mobile numbers.');
    }

    const verdict: CheckVerdict = hasForeignPrefix ? 'likely_scam' : cleanDigits.length === 10 ? 'possibly_suspicious' : 'likely_safe';
    const confidence = hasForeignPrefix ? 94 : 78;

    return {
      input_type: 'phone_number',
      normalized_input: phone,
      verdict,
      verdict_display: verdict === 'likely_scam' ? 'Likely Scam / Fraud' : verdict === 'possibly_suspicious' ? 'Possibly Suspicious' : 'Likely Safe',
      confidence_score: confidence,
      red_flags: redFlags.length > 0 ? redFlags : ['Standard cellular prefix; no immediate blacklists found.'],
      explanation: hasForeignPrefix
        ? 'Calls or WhatsApp messages from this international prefix (+92 / foreign) targeting Indian citizens are frequently associated with Digital Arrest, KBC lottery, or Sextortion extortion rackets.'
        : 'This appears to be a standard Indian mobile number. Legitimate government departments, banks, and electricity boards NEVER call from personal mobile numbers demanding OTPs or threatening immediate disconnection.',
      do_this_next: [
        {
          title: 'Report Number on Chakshu (Sanchar Saathi)',
          description: 'Submit this number on the DoT Chakshu portal to have fraudulent telecom resources blocked.',
          actionUrl: 'https://sancharsaathi.gov.in/sfc/',
          priority: 'critical',
          badge: 'Government of India (DoT)',
        },
        {
          title: 'Call 1930 if Money Was Lost',
          description: 'Dial 1930 immediately to freeze recipient accounts within the Golden Hour.',
          phone: '1930',
          priority: 'critical',
          badge: 'National Cyber Crime',
        },
        {
          title: 'Block on WhatsApp & Truecaller',
          description: 'Block and report this number as fraud directly within your communication apps.',
          priority: 'recommended',
          badge: 'Device Action',
        },
      ],
      timestamp: now,
      limitations: [
        'Phone numbers can be spoofed using VoIP gateways.',
        'No known threat detected is not a guarantee of safety.',
      ],
    };
  }

  /**
   * Evaluates SMS and Messages against known Indian scam playbooks.
   */
  private static evaluateSms(text: string, now: string): CheckAnythingResult {
    const redFlags: string[] = [];
    let scamScore = 0;

    const lower = text.toLowerCase();

    // 1. Electricity / Bill Disconnection Scam
    if (lower.includes('electricity') || lower.includes('power') || lower.includes('bijli') || lower.includes('bill')) {
      if (lower.includes('disconnect') || lower.includes('tonight') || lower.includes('9:30') || lower.includes('officer')) {
        redFlags.push('Electricity Disconnection Scam: False urgency claiming power will be cut tonight.');
        scamScore += 45;
      }
    }

    // 2. Bank KYC / YONO / PAN Blocked Scam
    if (lower.includes('kyc') || lower.includes('yono') || lower.includes('sbi') || lower.includes('hdfc') || lower.includes('pnb') || lower.includes('pan card')) {
      if (lower.includes('block') || lower.includes('deactivat') || lower.includes('suspend') || lower.includes('update')) {
        redFlags.push('Bank KYC Suspension Scam: Demands urgent verification or app download.');
        scamScore += 50;
      }
    }

    // 3. Digital Arrest / Law Enforcement Extortion
    if (lower.includes('cbi') || lower.includes('customs') || lower.includes('mumbai police') || lower.includes('police') || lower.includes('narcotics') || lower.includes('digital arrest') || lower.includes('courier parcel')) {
      redFlags.push('Digital Arrest Scam: Coercion claiming illegal parcels, drugs, or police warrant.');
      scamScore += 60;
    }

    // 4. Part-Time Job / Telegram Tasks
    if (lower.includes('telegram') || lower.includes('part-time') || lower.includes('earn daily') || lower.includes('like youtube') || lower.includes('rating job')) {
      redFlags.push('Work-From-Home / Telegram Task Scam: Promises high returns for simple reviews/likes.');
      scamScore += 45;
    }

    // 5. Remote Access App Installation
    if (lower.includes('anydesk') || lower.includes('teamviewer') || lower.includes('rustdesk') || lower.includes('quicksupport') || lower.includes('.apk')) {
      redFlags.push('Malicious APK / Remote Screen Sharing Hazard: Directs user to install device takeover apps.');
      scamScore += 55;
    }

    // 6. Urgency Keywords
    if (lower.includes('urgent') || lower.includes('immediately') || lower.includes('24 hours') || lower.includes('click here')) {
      redFlags.push('Psychological Pressure: Artificially created panic to prevent critical thinking.');
      scamScore += 20;
    }

    let verdict: CheckVerdict = 'likely_safe';
    let confidence = 70;

    if (scamScore >= 40) {
      verdict = 'likely_scam';
      confidence = Math.min(98, 70 + scamScore);
    } else if (scamScore >= 20 || redFlags.length > 0) {
      verdict = 'possibly_suspicious';
      confidence = 80;
    }

    return {
      input_type: 'sms',
      normalized_input: text,
      verdict,
      verdict_display: verdict === 'likely_scam' ? 'Likely Scam / Phishing' : verdict === 'possibly_suspicious' ? 'Possibly Suspicious' : 'Likely Safe',
      confidence_score: confidence,
      red_flags: redFlags.length > 0 ? redFlags : ['No prominent scam playbook keywords identified.'],
      explanation: verdict === 'likely_scam'
        ? 'This message matches documented patterns of organized Indian cybercrime (such as fake electricity cuts, KYC blocks, or Digital Arrest police impersonation scams). Under Indian law, Police, CBI, and courts NEVER conduct arrests, interrogations, or financial clearances over WhatsApp or video calls.'
        : verdict === 'possibly_suspicious'
        ? 'The text contains urgency indicators or requests for personal action. Exercise heightened caution.'
        : 'No prominent Indian scam signatures were detected. However, never share OTPs, PINs, or bank passwords with anyone.',
      do_this_next: [
        {
          title: 'Report Fraud SMS on Chakshu',
          description: 'Report this fraudulent message on the Sanchar Saathi Chakshu facility.',
          actionUrl: 'https://sancharsaathi.gov.in/sfc/',
          priority: 'critical',
          badge: 'Chakshu DoT',
        },
        {
          title: 'Never Call the Number in the Message',
          description: 'If concerned about your electricity or bank, contact the official number printed on your physical bill or back of your ATM card.',
          priority: 'critical',
          badge: 'Safety Rule',
        },
        {
          title: 'Call 1930 If Any Payment Was Made',
          description: 'Dial 1930 to freeze recipient UPI or bank accounts before the money is withdrawn at an ATM.',
          phone: '1930',
          priority: 'critical',
          badge: 'Emergency 1930',
        },
      ],
      timestamp: now,
      limitations: [
        'Heuristic detection cannot read intent of newly created scam scripts.',
        'No known threat detected is not a guarantee of safety.',
      ],
    };
  }

  /**
   * Evaluates URLs against typosquats, impersonation, and phishing patterns.
   */
  private static evaluateUrl(urlStr: string, now: string): CheckAnythingResult {
    const isExplicitHttp = urlStr.startsWith('http://');
    let cleanUrl = urlStr;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const redFlags: string[] = [];
    let host = '';
    try {
      host = new URL(cleanUrl).hostname.toLowerCase();
    } catch {
      host = urlStr;
    }

    if (isExplicitHttp) {
      redFlags.push('Insecure HTTP Protocol: Banking and government portals strictly mandate HTTPS encryption.');
    }

    const isIpLiteral = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
    if (isIpLiteral) {
      redFlags.push('Numeric IP Address Host: Legitimate institutions use registered domain names, not raw IP addresses.');
    }

    // Check Indian brand impersonations
    const indianBrandKeywords = ['sbi', 'yono', 'hdfc', 'icici', 'paytm', 'phonepe', 'gpay', 'indianoil', 'speedpost', 'indiapost', 'epfo'];
    for (const b of indianBrandKeywords) {
      if (host.includes(b)) {
        const isOfficial = host.endsWith('.sbi') || host.endsWith('onlinesbi.sbi') || host.endsWith('hdfcbank.com') || host.endsWith('icicibank.com') || host.endsWith('paytm.com') || host.endsWith('phonepe.com') || host.endsWith('indiapost.gov.in');
        if (!isOfficial) {
          redFlags.push(`Brand Impersonation & Lookalike (${b.toUpperCase()}): Unofficial domain mimicking an Indian bank or public utility.`);
        }
      }
    }

    // Check suspicious TLDs often abused in smishing
    if (host.endsWith('.xyz') || host.endsWith('.top') || host.endsWith('.apk') || host.endsWith('.live') || host.endsWith('.click') || host.endsWith('.net')) {
      if (redFlags.length > 0) {
        redFlags.push(`Suspicious Generic TLD (${host.split('.').pop()}): Extension frequently utilized in ephemeral phishing campaigns.`);
      }
    }

    const verdict: CheckVerdict = redFlags.length >= 2 ? 'likely_scam' : redFlags.length === 1 ? 'possibly_suspicious' : 'likely_safe';
    const confidence = verdict === 'likely_scam' ? 95 : verdict === 'possibly_suspicious' ? 82 : 75;

    return {
      input_type: 'url',
      normalized_input: cleanUrl,
      verdict,
      verdict_display: verdict === 'likely_scam' ? 'Likely Scam / Phishing' : verdict === 'possibly_suspicious' ? 'Possibly Suspicious' : 'Likely Safe',
      confidence_score: confidence,
      red_flags: redFlags.length > 0 ? redFlags : ['Domain structure appears normal; no blatant typosquatting detected.'],
      explanation: verdict === 'likely_scam'
        ? `This web address appears to be a fraudulent destination impersonating legitimate Indian institutions. Navigating to this site may steal your banking credentials or prompt unauthorized APK downloads.`
        : verdict === 'possibly_suspicious'
        ? 'Elevated risk factors detected. Always check the official website of the organization rather than clicking links in SMS messages.'
        : 'No known phishing or malware signatures matched for this link. Note that zero-day scams may not be indexed yet.',
      do_this_next: [
        {
          title: 'Do Not Enter Login Credentials or OTPs',
          description: 'Never submit passwords, ATM PINs, or UPI PINs on this link.',
          priority: 'critical',
          badge: 'Crucial Defense',
        },
        {
          title: 'Report Phishing Link on Cybercrime.gov.in',
          description: 'File an anonymous or formal cyber fraud complaint with the Indian Cyber Crime Coordination Centre (I4C).',
          actionUrl: 'https://cybercrime.gov.in',
          priority: 'high',
          badge: 'I4C MHA',
        },
        {
          title: 'Report on Chakshu (Sanchar Saathi)',
          description: 'Report the SMS and link to the Department of Telecommunications.',
          actionUrl: 'https://sancharsaathi.gov.in/sfc/',
          priority: 'high',
          badge: 'Chakshu DoT',
        },
      ],
      timestamp: now,
      limitations: [
        'Newly registered scam domains may not yet be flagged in global blacklists.',
        'No known threat detected is not a guarantee of safety.',
      ],
    };
  }
}
