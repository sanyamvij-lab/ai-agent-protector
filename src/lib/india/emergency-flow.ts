// AI Protector India — Money-Lost Emergency Mode & Bank Dispute Engine
// Implements the Golden Hour 1930 response protocol and RBI Zero-Liability dispute letter generator.

export interface BankDisputeParams {
  victimName: string;
  victimPhone: string;
  victimEmail: string;
  bankName: string;
  accountNumber: string;
  fraudType: 'unauthorized_upi' | 'phishing_netbanking' | 'debit_card_skim' | 'remote_access_apk' | 'digital_arrest_extortion';
  transactionIdOrUtr: string;
  amountLost: number;
  fraudDateTime: string;
  cybercrimeComplaintAckNumber?: string;
}

export interface EmergencyGuideResult {
  steps: Array<{ step: number; title: string; action: string; contact?: string; urgency: string }>;
  evidenceChecklist: string[];
  disputeLetter: string;
}

export class EmergencyFlowEngine {
  /**
   * Generates formal RBI Zero-Liability Bank Dispute Letter & 1930 Golden Hour Checklist.
   */
  public static generateDispute(params: BankDisputeParams): EmergencyGuideResult {
    const today = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const disputeLetter = `Date: ${today}

To,
The Branch Manager / Nodal Grievance Redressal Officer,
${params.bankName}
Branch Location / Corporate Office

SUBJECT: Urgent Dispute & Reversal Claim for Unauthorized Electronic Transaction under RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18

Respected Sir / Madam,

1. ACCOUNT HOLDER PARTICULARS
I, ${params.victimName}, hold an active savings/current account with your branch:
- Bank Account Number: ${params.accountNumber}
- Registered Mobile Number: ${params.victimPhone}
- Registered Email: ${params.victimEmail}

2. PARTICULARS OF THE FRAUDULENT INCIDENT
On ${params.fraudDateTime}, an unauthorized electronic financial transaction occurred on my account without my valid voluntary authorization:
- Transaction Reference / UTR Number: ${params.transactionIdOrUtr}
- Amount Debited: ₹${params.amountLost.toLocaleString('en-IN')}
- Incident Nature: ${params.fraudType.replace(/_/g, ' ').toUpperCase()}
- National Cyber Crime (1930) Acknowledgement No: ${params.cybercrimeComplaintAckNumber || 'Reported via Helpline 1930'}

3. IMMEDIATE MITIGATION & REPORTING UNDER RBI GUIDELINES
In accordance with Reserve Bank of India (RBI) Circular DBR.No.Leg.BC.78/09.07.005/2017-18 dated July 6, 2017 on "Customer Protection – Limiting Liability of Customers in Unauthorised Electronic Banking Transactions":
- I have notified the incident immediately within the stipulated 3-day timeline.
- The transaction was engineered through criminal deception / unauthorized third-party breach.
- I hereby request you to freeze the beneficiary account to which the funds were routed, initiate an inter-bank chargeback/recall, and credit the shadow balance/reversal to my account within 10 working days as mandated under paragraph 9 of the circular.

4. POLICE COMPLAINT ATTACHED
A formal report has been lodged with the National Cyber Crime Reporting Portal (cybercrime.gov.in) and Helpline 1930.

I request you to provide a written acknowledgement of this dispute letter with a formal complaint reference number.

Yours sincerely,

${params.victimName}
Phone: ${params.victimPhone}
`;

    return {
      steps: [
        {
          step: 1,
          title: 'Dial 1930 Immediately (The Golden Hour)',
          action: 'Call National Cyber Crime Helpline 1930 right now. Operators immediately coordinate with payment gateways and beneficiary banks to freeze the stolen funds before cash is withdrawn at an ATM.',
          contact: '1930',
          urgency: 'CRITICAL (Do within 2 hours)',
        },
        {
          step: 2,
          title: 'Freeze Your Bank Account & UPI ID',
          action: 'Call your bank\'s 24x7 emergency helpline or use your mobile banking app to temporarily lock your debit card, UPI access, and net-banking to prevent secondary debits.',
          urgency: 'IMMEDIATE',
        },
        {
          step: 3,
          title: 'File Formal Incident on cybercrime.gov.in',
          action: 'Submit an online complaint on cybercrime.gov.in. Save the PDF acknowledgement and Complaint Reference ID.',
          contact: 'https://cybercrime.gov.in',
          urgency: 'Within 24 Hours',
        },
        {
          step: 4,
          title: 'Submit RBI Zero-Liability Dispute Letter',
          action: 'Print or email our generated Bank Dispute Letter to your branch manager. Under RBI rules, reporting within 3 working days protects you with Zero Liability.',
          urgency: 'Within 3 Days',
        },
      ],
      evidenceChecklist: [
        'Transaction Reference Number (UTR / Bank Ref Number / UPI Transaction ID)',
        'Screenshot of the debit SMS / Bank statement entry showing exact timestamp',
        'Screenshot of the fraudster\'s message, call log, or fake website link',
        'National Cyber Crime 1930 Acknowledgement / Complaint Reference Number',
        'Beneficiary UPI ID or account number (if visible in transaction history)',
      ],
      disputeLetter,
    };
  }
}
