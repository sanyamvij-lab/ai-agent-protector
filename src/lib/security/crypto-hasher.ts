// AI Protector - Local Cryptographic File Integrity Engine
// Calculates standard SHA-256 and SHA-512 hashes 100% on-device using Web Crypto API.
// File contents never leave the user's browser.

import { FileHashResult } from '../types';

export class CryptoHasher {
  /**
   * Computes cryptographic hashes for a client-side File or ArrayBuffer.
   */
  public static async hashFile(
    file: File,
    comparisonHash?: string
  ): Promise<FileHashResult> {
    const arrayBuffer = await file.arrayBuffer();

    // 1. Compute SHA-256 using native Web Crypto API
    const sha256Buffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const sha256Hex = this.bufferToHex(sha256Buffer);

    // 2. Compute SHA-512
    const sha512Buffer = await crypto.subtle.digest('SHA-512', arrayBuffer);
    const sha512Hex = this.bufferToHex(sha512Buffer);

    // 3. Comparison Check
    let isMatch: boolean | undefined = undefined;
    if (comparisonHash && comparisonHash.trim().length > 0) {
      const cleanExpected = comparisonHash.trim().toLowerCase();
      isMatch = sha256Hex.toLowerCase() === cleanExpected || sha512Hex.toLowerCase() === cleanExpected;
    }

    return {
      fileName: file.name,
      fileSizeBytes: file.size,
      fileType: file.type || 'application/octet-stream',
      sha256: sha256Hex,
      sha512: sha512Hex,
      comparisonHash: comparisonHash?.trim(),
      isMatch,
      calculatedAt: new Date().toISOString(),
      explanation: isMatch === true
        ? 'Verification Match: The calculated hash perfectly matches your authorized reference hash. This confirms byte-level integrity (the file is unmodified from that reference).'
        : isMatch === false
        ? 'Mismatch Warning: The calculated hash does NOT match the reference hash. The file may have been altered, corrupted during transfer, or represents a different version.'
        : 'Integrity Hash Calculated: Save or compare this checksum with the publisher\'s release notes to ensure your copy is unmodified.',
      privacyNotice: 'Zero-Upload Guarantee: This calculation occurred strictly inside your browser using the Web Crypto API. Not a single byte of your file was uploaded to any remote server.',
    };
  }

  /**
   * Helper to format an ArrayBuffer into lowercase hex string.
   */
  private static bufferToHex(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer);
    let hex = '';
    for (let i = 0; i < byteArray.length; i++) {
      hex += byteArray[i].toString(16).padStart(2, '0');
    }
    return hex;
  }
}
