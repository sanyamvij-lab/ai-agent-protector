// AI Protector India — DPDP Act 2023 Rights & Grievance Toolkit
// Generates legally structured Data Erasure and Correction notices under Section 12 & 13 of India's DPDP Act.

export interface DpdpLetterParams {
  userName: string;
  userEmail: string;
  userPhone?: string;
  serviceAccountId?: string;
  companyName: string;
  grievanceOfficerEmail: string;
  requestType: 'deletion' | 'correction' | 'nomination';
  specificDataToErase?: string;
}

export interface DpdpLetterResult {
  subject: string;
  formattedLetter: string;
  statutoryClockDays: number;
  phaseInNotice: string;
  escalationSteps: Array<{ step: number; title: string; instruction: string; officialLink?: string }>;
}

export class DpdpToolkit {
  /**
   * Generates a formal legal notice compliant with the Digital Personal Data Protection Act, 2023.
   */
  public static generateLetter(params: DpdpLetterParams): DpdpLetterResult {
    const today = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const isDeletion = params.requestType === 'deletion';
    const specificScope = params.specificDataToErase || 'all personal data, telemetry, and behavioral profiles';

    const subject = isDeletion
      ? `Notice for Erasure of Personal Data under Section 12(3) of DPDP Act 2023 — ${params.userName}`
      : `Request for Correction and Updating of Personal Data under Section 12(1) of DPDP Act 2023 — ${params.userName}`;

    const formattedLetter = `Date: ${today}

To,
The Data Protection Officer / Grievance Redressal Officer,
${params.companyName}
Contact Email: ${params.grievanceOfficerEmail}

SUBJECT: ${subject}

Dear Grievance Officer,

1. IDENTIFICATION OF DATA PRINCIPAL
I, ${params.userName}, am a Data Principal residing in India. My registered account identifier associated with your services is:
- Registered Email: ${params.userEmail}
- Registered Phone: ${params.userPhone || 'Not provided'}
- Account / Customer ID: ${params.serviceAccountId || 'N/A'}

2. STATUTORY BASIS OF THIS NOTICE
Under Section 12(3) and Section 12(4) of the Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023), a Data Principal has the right to the erasure of personal data that is no longer necessary for the purpose for which it was processed, unless retention is mandated by applicable law.

3. REQUISITION FOR ACTION
I hereby formally request you, as the Data Fiduciary, to:
${
  isDeletion
    ? `a) Permanently erase ${specificScope} maintained across all your production systems, backups, and third-party data processors.\nb) Cease further processing of my personal data for marketing, commercial profiling, and third-party distribution.`
    : `a) Correct and update the specified personal data attributes on your systems to reflect accurate records.\nb) Provide written confirmation of the updated data record.`
}

4. TIMELINE AND STATUTORY GRIEVANCE ESCALATION
Under Section 13 of the DPDP Act 2023, you are obligated to maintain an effective grievance redressal mechanism and respond within the statutory timeframe (90 days).

Please acknowledge receipt of this notice within 48 hours and confirm the completion of this request. In the event of non-compliance, unjustified delay, or rejection, I reserve the right to escalate this matter to the Data Protection Board of India (DPBI) for statutory inquiry and penalty proceedings under Section 27 of the Act.

Yours faithfully,

${params.userName}
Email: ${params.userEmail}
`;

    const phaseInNotice =
      'ℹ️ Statutory Implementation Notice: The Digital Personal Data Protection Act 2023 has received Presidential Assent. Subordinate procedural rules, grievance mechanisms, and DPBI inquiry guidelines phase in progressively towards 13 May 2027. Always verify statutory notices against the latest official Gazette notifications published by MeitY (Ministry of Electronics and Information Technology).';

    const escalationSteps = [
      {
        step: 1,
        title: 'Transmit Notice via Email',
        instruction: `Send this formal notice directly to ${params.companyName}'s official Grievance Officer email address (${params.grievanceOfficerEmail}). Keep a dated PDF or sent-copy screenshot.`,
      },
      {
        step: 2,
        title: 'Monitor 90-Day Statutory Window',
        instruction: 'Companies must address your grievance. If they require identity verification, provide basic confirmation without sharing confidential passwords or OTPs.',
      },
      {
        step: 3,
        title: 'Escalate to Data Protection Board of India (DPBI)',
        instruction: 'If the company fails to respond within 90 days or gives an unsatisfactory response, file an online complaint with the Data Protection Board of India.',
        officialLink: 'https://meity.gov.in/data-protection-framework',
      },
      {
        step: 4,
        title: 'National Consumer Helpline (NCH) Alternative',
        instruction: 'If the data dispute involves commercial deficiency of service or unauthorized billing, register a grievance on consumerhelpline.gov.in (Toll-Free 1915).',
        officialLink: 'https://consumerhelpline.gov.in',
      },
    ];

    return {
      subject,
      formattedLetter,
      statutoryClockDays: 90,
      phaseInNotice,
      escalationSteps,
    };
  }
}
