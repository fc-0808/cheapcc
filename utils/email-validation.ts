// utils/email-validation.ts

export interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface EmailValidationOptions {
  checkDisposable?: boolean;
  checkCommonDomains?: boolean;
  checkTypo?: boolean;
  allowPlusSign?: boolean;
  maxLength?: number;
}

// Common email providers for domain validation
const COMMON_EMAIL_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com',
  'icloud.com', 'me.com', 'mac.com', 'aol.com', 'protonmail.com',
  'yandex.com', 'mail.ru', 'zoho.com', 'fastmail.com', 'tutanota.com'
];

// Disposable email domains (common ones)
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
  'temp-mail.org', 'throwaway.email', 'getnada.com', 'maildrop.cc',
  'sharklasers.com', 'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info',
  'guerrillamail.net', 'guerrillamail.org', 'guerrillamailblock.com',
  'pokemail.net', 'spam4.me', 'bccto.me', 'chacuo.net', 'dispostable.com',
  'mailnesia.com', 'mailcatch.com', 'inboxalias.com', 'mailmetrash.com',
  'trashmail.net', 'trashmail.com', 'trashmail.org', 'trashmail.ws',
  'trashmail.de', 'trashmail.fr', 'trashmail.it', 'trashmail.es',
  'trashmail.pt', 'trashmail.ru', 'trashmail.jp', 'trashmail.cn',
  'trashmail.in', 'trashmail.co.uk', 'trashmail.ca', 'trashmail.com.au'
];

// Common typos and their corrections
const COMMON_EMAIL_TYPOS: Record<string, string[]> = {
  'gmial.com': ['gmail.com'],
  'gmai.com': ['gmail.com'],
  'gmail.co': ['gmail.com'],
  'gmail.cm': ['gmail.com'],
  'yahooo.com': ['yahoo.com'],
  'yaho.com': ['yahoo.com'],
  'yahoo.co': ['yahoo.com'],
  'outlok.com': ['outlook.com'],
  'outlook.co': ['outlook.com'],
  'hotmial.com': ['hotmail.com'],
  'hotmai.com': ['hotmail.com'],
  'hotmail.co': ['hotmail.com'],
  'live.co': ['live.com'],
  'icloud.co': ['icloud.com'],
  'iclod.com': ['icloud.com'],
  'aol.co': ['aol.com'],
  'aol.cm': ['aol.com']
};

/**
 * Comprehensive email validation function
 */
export function validateEmail(
  email: string, 
  options: EmailValidationOptions = {}
): EmailValidationResult {
  const {
    checkDisposable = true,
    checkCommonDomains = true,
    checkTypo = true,
    allowPlusSign = true,
    maxLength = 254
  } = options;

  const result: EmailValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Basic checks
  if (!email || typeof email !== 'string') {
    result.isValid = false;
    result.errors.push('Email address is required');
    return result;
  }

  // Trim whitespace
  const trimmedEmail = email.trim();
  
  if (trimmedEmail !== email) {
    result.warnings.push('Email address has been trimmed of whitespace');
  }

  // Length check
  if (trimmedEmail.length === 0) {
    result.isValid = false;
    result.errors.push('Email address cannot be empty');
    return result;
  }

  if (trimmedEmail.length > maxLength) {
    result.isValid = false;
    result.errors.push(`Email address is too long (maximum ${maxLength} characters)`);
    return result;
  }

  // Basic format validation
  const emailRegex = allowPlusSign 
    ? /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    : /^[a-zA-Z0-9.!#$%&'*=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmedEmail)) {
    result.isValid = false;
    result.errors.push('Invalid email format');
    return result;
  }

  // Split email into local and domain parts
  const [localPart, domain] = trimmedEmail.split('@');
  
  if (!localPart || !domain) {
    result.isValid = false;
    result.errors.push('Invalid email format');
    return result;
  }

  // Local part validation
  if (localPart.length > 64) {
    result.isValid = false;
    result.errors.push('Local part of email is too long (maximum 64 characters)');
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    result.isValid = false;
    result.errors.push('Local part cannot start or end with a dot');
  }

  if (localPart.includes('..')) {
    result.isValid = false;
    result.errors.push('Local part cannot contain consecutive dots');
  }

  // Domain validation
  if (domain.length > 253) {
    result.isValid = false;
    result.errors.push('Domain part is too long (maximum 253 characters)');
  }

  if (domain.startsWith('.') || domain.endsWith('.')) {
    result.isValid = false;
    result.errors.push('Domain cannot start or end with a dot');
  }

  if (domain.includes('..')) {
    result.isValid = false;
    result.errors.push('Domain cannot contain consecutive dots');
  }

  // Check for valid TLD
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    result.isValid = false;
    result.errors.push('Domain must have at least one dot and valid TLD');
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    result.isValid = false;
    result.errors.push('Top-level domain must be at least 2 characters');
  }

  // Check for common typos
  if (checkTypo) {
    const lowerDomain = domain.toLowerCase();
    if (COMMON_EMAIL_TYPOS[lowerDomain]) {
      result.warnings.push('Possible typo detected in email domain');
      result.suggestions.push(...COMMON_EMAIL_TYPOS[lowerDomain].map(suggestion => 
        `${localPart}@${suggestion}`
      ));
    }
  }

  // Check for disposable email domains
  if (checkDisposable) {
    const lowerDomain = domain.toLowerCase();
    if (DISPOSABLE_EMAIL_DOMAINS.includes(lowerDomain)) {
      result.warnings.push('This appears to be a disposable email address');
      result.suggestions.push('Please use a permanent email address for account security');
    }
  }

  // Check for common email providers
  if (checkCommonDomains) {
    const lowerDomain = domain.toLowerCase();
    if (COMMON_EMAIL_PROVIDERS.includes(lowerDomain)) {
      // This is a common provider, which is good
      result.suggestions.push('Email address looks good!');
    }
    // Removed warning for less common email providers
  }

  // Additional business email checks removed

  return result;
}

/**
 * Quick email validation for basic checks only
 */
export function isValidEmail(email: string): boolean {
  const result = validateEmail(email, {
    checkDisposable: false,
    checkCommonDomains: false,
    checkTypo: false,
    allowPlusSign: true
  });
  return result.isValid;
}

/**
 * Validate Adobe-specific email requirements
 */
export function validateAdobeEmail(email: string): EmailValidationResult {
  const result = validateEmail(email, {
    checkDisposable: true,
    checkCommonDomains: true,
    checkTypo: true,
    allowPlusSign: true,
    maxLength: 254
  });

  // Adobe-specific validations
  if (result.isValid) {
    const domain = email.split('@')[1]?.toLowerCase();
    
    // Check if it's already an Adobe domain (shouldn't be)
    if (domain && (domain.includes('adobe.com') || domain.includes('adobe'))) {
      result.warnings.push('This appears to be an Adobe employee email');
      result.suggestions.push('Please use your personal email address, not your Adobe work email');
    }

    // Check for very short domains (might be suspicious)
    if (domain && domain.length < 4) {
      result.warnings.push('Very short domain detected');
    }

    // Check for suspicious patterns
    if (email.includes('+') && email.split('+')[1]?.includes('@')) {
      result.warnings.push('Email contains plus sign - make sure this is intentional');
    }
  }

  return result;
}

/**
 * Get user-friendly error message for email validation
 */
export function getEmailErrorMessage(validationResult: EmailValidationResult): string {
  if (validationResult.isValid) {
    return '';
  }

  if (validationResult.errors.length > 0) {
    return validationResult.errors[0];
  }

  if (validationResult.warnings.length > 0) {
    return validationResult.warnings[0];
  }

  return 'Invalid email address';
}

/**
 * Get suggestions for email validation
 */
export function getEmailSuggestions(validationResult: EmailValidationResult): string[] {
  return validationResult.suggestions || [];
}
