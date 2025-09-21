/**
 * PII Redaction and Security Utilities
 * 
 * Implements OWASP guidelines for preventing sensitive data in logs.
 * Uses whitelist approach for allowed attributes.
 */

// Whitelist of allowed attribute keys
const ALLOWED_ATTRIBUTE_KEYS = new Set([
  'action',
  'screen',
  'component',
  'event_type',
  'duration_ms',
  'success',
  'error_code',
  'status_code',
  'count',
  'size',
  'level',
  'category',
  'feature',
  'version',
  'platform',
  'device_type',
  'locale',
]);

// Patterns for PII detection
const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
  /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, // Credit card numbers
  /\b[A-Z]{2}\d{2}(?:\s?\d{4}){4}(?:\s?\d{2})?\b/g, // IBAN - more flexible pattern
  /\b\d{3}-\d{2}-\d{4}\b/g, // US SSN
  /\b(?:token|password|pwd|secret|key|auth|bearer)\s*[:\=]\s*\S+/gi, // Common secret keywords
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, // IP addresses
];

/**
 * Sanitizes log attributes by filtering allowed keys and redacting PII
 */
export function sanitizeAttributes(attributes: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(attributes)) {
    // Check if key is in whitelist
    if (!ALLOWED_ATTRIBUTE_KEYS.has(key.toLowerCase())) {
      continue;
    }

    // Redact PII from string values
    if (typeof value === 'string') {
      sanitized[key] = redactPII(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else {
      // Skip complex objects to avoid accidental PII logging
      continue;
    }
  }

  return sanitized;
}

/**
 * Redacts PII patterns from text
 */
export function redactPII(text: string): string {
  let redacted = text;
  
  for (const pattern of PII_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  
  return redacted;
}

/**
 * Validates that a message doesn't contain obvious PII
 * Used for static analysis and testing
 */
export function validateMessage(message: string): { isValid: boolean; violations: string[] } {
  const violations: string[] = [];
  
  for (const pattern of PII_PATTERNS) {
    const matches = message.match(pattern);
    if (matches) {
      violations.push(`Potential PII detected: ${pattern.toString()}`);
    }
  }
  
  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Adds a custom allowed attribute key (for testing or configuration)
 */
export function addAllowedAttributeKey(key: string): void {
  ALLOWED_ATTRIBUTE_KEYS.add(key.toLowerCase());
}

/**
 * Gets the current set of allowed attribute keys
 */
export function getAllowedAttributeKeys(): readonly string[] {
  return Array.from(ALLOWED_ATTRIBUTE_KEYS).sort();
}