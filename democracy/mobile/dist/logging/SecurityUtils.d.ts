/**
 * PII Redaction and Security Utilities
 *
 * Implements OWASP guidelines for preventing sensitive data in logs.
 * Uses whitelist approach for allowed attributes.
 */
/**
 * Sanitizes log attributes by filtering allowed keys and redacting PII
 */
export declare function sanitizeAttributes(attributes: Record<string, unknown>): Record<string, unknown>;
/**
 * Redacts PII patterns from text
 */
export declare function redactPII(text: string): string;
/**
 * Validates that a message doesn't contain obvious PII
 * Used for static analysis and testing
 */
export declare function validateMessage(message: string): {
    isValid: boolean;
    violations: string[];
};
/**
 * Adds a custom allowed attribute key (for testing or configuration)
 */
export declare function addAllowedAttributeKey(key: string): void;
/**
 * Gets the current set of allowed attribute keys
 */
export declare function getAllowedAttributeKeys(): readonly string[];
//# sourceMappingURL=SecurityUtils.d.ts.map