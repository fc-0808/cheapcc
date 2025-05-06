import crypto from 'crypto';
import fs from 'fs/promises';
import fetch from 'node-fetch';

/**
 * Download and cache the PayPal certificate
 */
async function downloadAndCacheCert(url: string, cacheKey?: string): Promise<string> {
  if (!cacheKey) {
    cacheKey = url.replace(/\W+/g, '-');
  }
  const filePath = `.paypal_cert_cache_${cacheKey}`;
  // Try to read from cache
  const cachedData = await fs.readFile(filePath, 'utf-8').catch(() => null);
  if (cachedData) return cachedData;
  // Download and cache
  const response = await fetch(url);
  const data = await response.text();
  await fs.writeFile(filePath, data);
  return data;
}

/**
 * Calculate CRC32 checksum (decimal) of the raw body
 */
function crc32Decimal(str: string): number {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Verify the PayPal webhook signature (async)
 * @param requestBody - The raw body of the webhook request
 * @param headers - Headers from the webhook request
 * @returns boolean indicating if the signature is valid
 */
export async function verifyPayPalWebhookSignature(
  requestBody: string,
  headers: Headers
): Promise<boolean> {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const transmissionId = headers.get('paypal-transmission-id');
    const transmissionTime = headers.get('paypal-transmission-time');
    const certUrl = headers.get('paypal-cert-url');
    const transmissionSig = headers.get('paypal-transmission-sig');
    // Note: PayPal may use SHA256withRSA
    // const authAlgo = headers.get('paypal-auth-algo');

    if (!webhookId || !transmissionId || !transmissionTime || !certUrl || !transmissionSig) {
      console.error('Missing required PayPal webhook headers');
      return false;
    }

    // Construct the signed message string
    const crc = crc32Decimal(requestBody);
    const message = `${transmissionId}|${transmissionTime}|${webhookId}|${crc}`;

    // Download and cache the certificate
    const certPem = await downloadAndCacheCert(certUrl);

    // Create buffer from base64-encoded signature
    const signatureBuffer = Buffer.from(transmissionSig, 'base64');

    // Create a verification object
    const verifier = crypto.createVerify('SHA256');
    verifier.update(message);
    verifier.end();

    const isValid = verifier.verify(certPem, signatureBuffer);
    if (!isValid) {
      console.error('PayPal webhook signature verification failed');
    }
    return isValid;
  } catch (error) {
    console.error('Error verifying PayPal webhook signature:', error);
    return false;
  }
}

/**
 * Create a CRC32 checksum of the request body (hex string format)
 */
export function crc32(str: string): string {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }

  let crc = 0xffffffff;
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xff];
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16);
}

