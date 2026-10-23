import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import { CheckAnythingEngine } from '../lib/check/check-anything-engine';
import { PrivacyBreachEngine } from '../lib/privacy/k-anonymity-pwned';
import { PolicyAnalyzerEngine } from '../lib/privacy/policy-analyzer';
import { AppPrivacyScorer } from '../lib/privacy/app-privacy-scorer';
import { DpdpToolkit } from '../lib/india/dpdp-toolkit';
import { EmergencyFlowEngine } from '../lib/india/emergency-flow';
import { SCAM_PLAYBOOKS, SIMULATOR_SCENARIO } from '../lib/learn/scam-playbooks';

describe('HackerWrath 3.0: Digital Security & Privacy Module Tests', () => {
  // Feature 1 & 2: Check Anything Box & Do This Next Panel
  describe('1 & 2. Check Anything Engine & India Do This Next Action Panel', () => {
    it('should classify electricity bill cutoff SMS as likely_scam with India-specific actions', () => {
      const sms = 'Dear Consumer, Your electricity power will be disconnected tonight at 9:30 PM from the power station because your previous month bill was not updated. Please immediately call electric officer at 9876543210.';
      const res = CheckAnythingEngine.evaluate(sms);

      assert.strictEqual(res.input_type, 'sms');
      assert.strictEqual(res.verdict, 'likely_scam');
      assert.ok(res.confidence_score >= 80);
      assert.ok(res.red_flags.length > 0);
      assert.ok(res.explanation.toLowerCase().includes('electricity') || res.explanation.toLowerCase().includes('disconnection'));
      
      // Never say "100% safe" or absolute guarantee
      assert.ok(!res.explanation.includes('100% safe'));

      // Check Do This Next Panel actions (1930, Chakshu, Cybercrime)
      assert.ok(res.do_this_next.some((a) => a.phone === '1930' || a.title.includes('1930')));
      assert.ok(res.do_this_next.some((a) => a.title.toLowerCase().includes('chakshu') || a.description.toLowerCase().includes('chakshu')));
    });

    it('should classify Digital Arrest / Police impersonation threat as likely_scam', () => {
      const msg = 'This is DCP Crime Branch Mumbai. A parcel containing narcotics and illegal passports in your Aadhaar name has been intercepted. You are placed under digital arrest on Skype video call. Transfer funds to RBI verification escrow.';
      const res = CheckAnythingEngine.evaluate(msg);

      assert.strictEqual(res.verdict, 'likely_scam');
      assert.ok(res.red_flags.some((f) => f.includes('Digital Arrest')));
      assert.ok(res.explanation.includes('Supreme Court') || res.explanation.includes('Police') || res.explanation.includes('Digital Arrest'));
    });

    it('should classify SBI KYC phishing URL as likely_scam with cybercrime report step', () => {
      const url = 'http://sbi-yono-kyc-verify.net/pan-update.php';
      const res = CheckAnythingEngine.evaluate(url);

      assert.strictEqual(res.input_type, 'url');
      assert.strictEqual(res.verdict, 'likely_scam');
      assert.ok(res.red_flags.some((f) => f.includes('Lookalike') || f.includes('HTTP')));
      assert.ok(res.do_this_next.some((a) => a.actionUrl?.includes('cybercrime.gov.in')));
    });

    it('should flag international scam numbers (+92) calling Indian citizens', () => {
      const phone = '+92 300 1234567';
      const res = CheckAnythingEngine.evaluate(phone);

      assert.strictEqual(res.input_type, 'phone_number');
      assert.strictEqual(res.verdict, 'likely_scam');
      assert.ok(res.red_flags.some((f) => f.includes('+92')));
      assert.ok(res.do_this_next.some((a) => a.title.includes('Chakshu') || a.description.includes('Chakshu')));
    });

    it('should label reputable official domains as likely_safe with cautious disclaimer', () => {
      const cleanUrl = 'https://www.incometax.gov.in/iec/foportal/';
      const res = CheckAnythingEngine.evaluate(cleanUrl);

      assert.strictEqual(res.verdict, 'likely_safe');
      // Must include limitation notice
      assert.ok(res.limitations.some((l) => l.includes('No known threat detected is not a guarantee of safety')));
      assert.ok(!res.explanation.includes('100%'));
    });
  });

  // Feature 3: Breach Checker via Have I Been Pwned model
  describe('3. Email Breach Checker (HIBP & Post-Leak Checklist)', () => {
    it('should find verified breach records for compromised email with remediations', async () => {
      const email = 'test@example.com';
      const result = await PrivacyBreachEngine.checkEmail(email);

      assert.strictEqual(result.isBreached, true);
      assert.ok(result.breachCount >= 1);
      assert.ok(result.breaches.some((b) => b.title.includes('BigBasket')));
      assert.ok(result.postLeakChecklist.length >= 3);
      assert.ok(result.postLeakChecklist.some((c) => c.toLowerCase().includes('password')));
    });

    it('should report no known leaks for unbreached clean email address', async () => {
      const cleanEmail = 'uncompromised.citizen.2026@securemail.gov.in';
      const result = await PrivacyBreachEngine.checkEmail(cleanEmail);

      assert.strictEqual(result.isBreached, false);
      assert.strictEqual(result.breachCount, 0);
      assert.strictEqual(result.breaches.length, 0);
      assert.ok(result.postLeakChecklist.length > 0); // Still offers proactive hygiene checklist
    });
  });

  // Feature 4: Client-side Password Check (K-Anonymity)
  describe('4. Client-Side Password Check (K-Anonymity Hash Prefix)', () => {
    it('should compute exact 5-character SHA-1 prefix for password', () => {
      // SHA-1('password') = 5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8 -> prefix 5BAA6
      const hash = crypto.createHash('sha1').update('password').digest('hex').toUpperCase();
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);

      assert.strictEqual(prefix, '5BAA6');
      assert.strictEqual(suffix, '1E4C9B93F3F0682250B6CF8331B7EE68FD8');
    });

    it('should compute exact 5-character SHA-1 prefix for 123456', () => {
      // SHA-1('123456') = 7c4a8d09ca3762af61e59520943dc26494f8941b -> prefix 7C4A8
      const hash = crypto.createHash('sha1').update('123456').digest('hex').toUpperCase();
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);

      assert.strictEqual(prefix, '7C4A8');
      assert.strictEqual(suffix, 'D09CA3762AF61E59520943DC26494F8941B');
    });
  });

  // Feature 5: Privacy Policy Summarizer
  describe('5. Privacy Policy Summarizer (Clause Extraction & AI Disclaimers)', () => {
    it('should extract collected, shared, retention, and deletion clauses quoting original text', () => {
      const samplePolicy = `
        Privacy Policy:
        We collect your personal information including your full name, location, contact number, and browsing activity.
        We share collected data with third party advertising partners and affiliates.
        We retain your personal data for up to 5 years following your last account activity.
        You may request deletion of your personal data at any time by contacting our privacy team.
      `;

      const summary = PolicyAnalyzerEngine.summarize(samplePolicy);
      assert.ok(summary.collected.length > 0);
      assert.ok(summary.shared_with.length > 0);
      assert.ok(summary.retention.length > 0);
      assert.ok(summary.how_to_delete.length > 0);

      // Verify exact clause quotation
      assert.ok(summary.collected[0].exactQuote.length > 10);
      assert.ok(summary.how_to_delete[0].exactQuote.toLowerCase().includes('deletion'));

      // Verify AI fallibility disclaimer
      assert.ok(summary.disclaimer.toLowerCase().includes('ai can make errors') || summary.disclaimer.includes('verify'));
    });
  });

  // Feature 6: App Privacy Score
  describe('6. App Privacy Score (Transparent 0-100 Deduction Engine)', () => {
    it('should assign high score to privacy-respecting calculator app', () => {
      const score = AppPrivacyScorer.calculate('Simple Calculator Offline', [], []);

      assert.strictEqual(score.score, 100);
      assert.strictEqual(score.grade, 'A+');
      assert.strictEqual(score.totalDeductions, 0);
    });

    it('should heavily penalize predatory instant-loan apps requesting SMS and Contacts', () => {
      const score = AppPrivacyScorer.calculate(
        'QuickCash Instant 5-Min Loan',
        ['READ_SMS', 'READ_CONTACTS', 'ACCESS_FINE_LOCATION', 'CAMERA', 'SYSTEM_ALERT_WINDOW'],
        ['facebook_ads', 'inmobi', 'appsflyer']
      );

      assert.ok(score.score <= 30);
      assert.strictEqual(score.riskRating, 'Hazardous');
      assert.ok(score.permissionsEvaluated.some((p) => p.id === 'READ_SMS'));
      assert.ok(score.permissionsEvaluated.some((p) => p.id === 'READ_CONTACTS'));
      assert.ok(score.scoringFormula.includes('Base: 100 pts'));
    });
  });

  // Feature 7: DPDP Rights Toolkit
  describe('7. DPDP Rights Toolkit (Statutory Deletion Letters & 90-day Clock)', () => {
    it('should generate legally compliant DPDP Act 2023 deletion request letter', () => {
      const res = DpdpToolkit.generateLetter({
        requestType: 'deletion',
        companyName: 'Swiggy / Bundl Technologies Pvt Ltd',
        grievanceOfficerEmail: 'grievance@swiggy.in',
        userName: 'Aarav Sharma',
        userPhone: '9876543210',
        userEmail: 'aarav.sharma@example.com',
        serviceAccountId: 'Phone 9876543210',
        specificDataToErase: 'Saved credit cards, past addresses, delivery phone numbers',
      });

      assert.ok(res.formattedLetter.includes('Digital Personal Data Protection Act, 2023'));
      assert.ok(res.formattedLetter.includes('Section 12(3)'));
      assert.ok(res.formattedLetter.includes('Swiggy / Bundl Technologies Pvt Ltd'));
      assert.strictEqual(res.statutoryClockDays, 90);
      // Check required May 13 2027 statutory rule notice
      assert.ok(res.phaseInNotice.includes('13 May 2027'));
      assert.ok(res.escalationSteps.some((s) => s.title.includes('Data Protection Board of India')));
    });
  });

  // Feature 8: Money-Lost Emergency Mode
  describe('8. Money-Lost Emergency Mode (1930 & RBI Zero-Liability Dispute Letter)', () => {
    it('should generate formal RBI Zero-Liability dispute letter citing Circular DBR.No.Leg.BC.78/09.07.005/2017-18', () => {
      const guide = EmergencyFlowEngine.generateDispute({
        bankName: 'State Bank of India',
        victimName: 'Aarav Sharma',
        victimPhone: '9876543210',
        victimEmail: 'aarav.sharma@example.com',
        accountNumber: 'XXXX123456',
        fraudType: 'unauthorized_upi',
        transactionIdOrUtr: 'UPI/2026/894729184729',
        amountLost: 48500,
        fraudDateTime: '23-Oct-2026 10:15 AM',
        cybercrimeComplaintAckNumber: 'NCRP-2026-98124578',
      });

      assert.ok(guide.disputeLetter.includes('DBR.No.Leg.BC.78/09.07.005/2017-18'));
      assert.ok(guide.disputeLetter.includes('Zero Customer Liability') || guide.disputeLetter.includes('Customer Protection'));
      assert.ok(guide.disputeLetter.includes('NCRP-2026-98124578'));
      assert.ok(guide.disputeLetter.includes('State Bank of India'));
      assert.ok(guide.steps.some((s) => s.action.includes('1930')));
      assert.ok(guide.evidenceChecklist.length >= 3);
    });
  });

  // Feature 9: Learn Section (Scam Playbooks & Simulator)
  describe('9. Scam Playbooks & Interactive Fake Call Simulator', () => {
    it('should contain all 5 major Indian cyber fraud playbooks', () => {
      assert.ok(SCAM_PLAYBOOKS.length >= 5);
      const ids = SCAM_PLAYBOOKS.map((p) => p.id);
      assert.ok(ids.includes('digital_arrest'));
      assert.ok(ids.includes('electricity_kyc'));
      assert.ok(ids.includes('part_time_job'));
      assert.ok(ids.includes('sextortion'));
      assert.ok(ids.includes('anydesk_remote'));
    });

    it('should support interactive call simulator with correct safe decision paths', () => {
      assert.ok(SIMULATOR_SCENARIO.length >= 1);
      const firstStep = SIMULATOR_SCENARIO[0];
      assert.ok(firstStep.callerVoice.includes('Inspector'));
      assert.ok(firstStep.choices.some((c) => c.isSafe === true));
      assert.ok(firstStep.choices.some((c) => c.isSafe === false));
    });
  });
});
