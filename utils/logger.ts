import fs from 'fs/promises';
import path from 'path';

const LOG_FILE = path.resolve(process.cwd(), 'paypal-webhook.log');
 
export async function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  await fs.appendFile(LOG_FILE, line, 'utf8');
} 