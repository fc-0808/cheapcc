import crypto from 'crypto';

// In-memory cache for PayPal certificates
const certCache = new Map<string, string>();

/**
 * Download and cache the PayPal certificate in memory.
 * @param url - The URL of the certificate.
 * @returns The certificate PEM string.
 */
async function downloadAndCacheCert(url: string): Promise<string> {
  // Check if the certificate is already in the cache
  if (certCache.has(url)) {
    return certCache.get(url)!;
  }

  // If not in cache, download it
  // Using global fetch (available in Node.js >= 18 and Next.js environments)
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download PayPal certificate from ${url}. Status: ${response.status}`);
  }
  const certPem = await response.text();

  // Store it in the cache
  // For simplicity, no TTL is implemented here, but you could add one if needed.
  // Certificates are typically valid for a long time.
  certCache.set(url, certPem);

  return certPem;
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
  headers: Headers // Assuming using the global Headers type
): Promise<boolean> {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const transmissionId = headers.get('paypal-transmission-id');
    const transmissionTime = headers.get('paypal-transmission-time');
    const certUrl = headers.get('paypal-cert-url');
    const transmissionSig = headers.get('paypal-transmission-sig');
    // const authAlgo = headers.get('paypal-auth-algo'); // PayPal uses SHA256withRSA by default

    if (!webhookId || !transmissionId || !transmissionTime || !certUrl || !transmissionSig) {
      console.error('Missing required PayPal webhook headers. Cannot verify signature.');
      return false;
    }

    // Construct the signed message string
    // The CRC32 calculation should use the raw request body.
    const crc = crc32Decimal(requestBody);
    const message = `${transmissionId}|${transmissionTime}|${webhookId}|${crc}`;

    // Download and cache the certificate
    const certPem = await downloadAndCacheCert(certUrl);

    // Create buffer from base64-encoded signature
    const signatureBuffer = Buffer.from(transmissionSig, 'base64');

    // Create a verification object
    const verifier = crypto.createVerify('SHA256'); // Standard algorithm is SHA256withRSA
    verifier.update(message);
    // verifier.end(); // Not needed for verifier.verify

    const isValid = verifier.verify(certPem, signatureBuffer);
    if (!isValid) {
      console.warn('PayPal webhook signature verification failed. Message:', message, 'Cert URL:', certUrl);
    }
    return isValid;
  } catch (error) {
    console.error('Error verifying PayPal webhook signature:', error);
    return false;
  }
}

/**
 * Create a CRC32 checksum of the request body (hex string format)
 * This function seems unused by verifyPayPalWebhookSignature if crc32Decimal is preferred.
 * Keeping it for completeness if it's used elsewhere, otherwise it could be removed.
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

