/**
 * Security Utils Tests
 * 
 * Tests for PII redaction and attribute sanitization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeAttributes,
  redactPII,
  validateMessage,
  addAllowedAttributeKey,
  getAllowedAttributeKeys,
} from './SecurityUtils';

describe('SecurityUtils', () => {
  describe('sanitizeAttributes', () => {
    it('should only allow whitelisted attribute keys', () => {
      const input = {
        action: 'test_action', // allowed
        password: 'secret123', // not allowed
        event_type: 'click', // allowed
        user_id: '12345', // not allowed
        count: 42, // allowed
      };

      const result = sanitizeAttributes(input);

      expect(result).toEqual({
        action: 'test_action',
        event_type: 'click',
        count: 42,
      });
      expect(result.password).toBeUndefined();
      expect(result.user_id).toBeUndefined();
    });

    it('should redact PII from string values', () => {
      const input = {
        action: 'login_attempt',
        screen: 'LoginScreen',
        email: 'user@example.com', // will be redacted
      };

      // Add email to allowed keys for testing
      addAllowedAttributeKey('email');

      const result = sanitizeAttributes(input);

      expect(result.action).toBe('login_attempt');
      expect(result.screen).toBe('LoginScreen');
      expect(result.email).toBe('[REDACTED]');
    });

    it('should preserve boolean and number values', () => {
      const input = {
        success: true,
        count: 100,
        duration_ms: 1500.5,
      };

      const result = sanitizeAttributes(input);

      expect(result).toEqual({
        success: true,
        count: 100,
        duration_ms: 1500.5,
      });
    });

    it('should skip complex objects', () => {
      const input = {
        action: 'test',
        complex_object: { nested: 'value' },
        array_value: [1, 2, 3],
      };

      const result = sanitizeAttributes(input);

      expect(result).toEqual({
        action: 'test',
      });
      expect(result.complex_object).toBeUndefined();
      expect(result.array_value).toBeUndefined();
    });
  });

  describe('redactPII', () => {
    it('should redact email addresses', () => {
      const text = 'User email: user@example.com sent to admin@company.org';
      const result = redactPII(text);
      expect(result).toBe('User email: [REDACTED] sent to [REDACTED]');
    });

    it('should redact credit card numbers', () => {
      const text = 'Payment with card 1234 5678 9012 3456';
      const result = redactPII(text);
      expect(result).toBe('Payment with card [REDACTED]');
    });

    it('should redact IBAN numbers', () => {
      const text = 'Transfer to DE89 3704 0044 0532 0130 00';
      const result = redactPII(text);
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('3704 0044 0532 0130');
    });

    it('should redact US SSN', () => {
      const text = 'SSN: 123-45-6789';
      const result = redactPII(text);
      expect(result).toBe('SSN: [REDACTED]');
    });

    it('should redact common secret keywords', () => {
      const inputs = [
        'token: abc123',
        'password: secret',
        'key: xyz789',
        'bearer: jwt_token',
        'auth=credentials123',
      ];

      inputs.forEach(input => {
        const result = redactPII(input);
        expect(result).toContain('[REDACTED]');
      });
    });

    it('should redact IP addresses', () => {
      const text = 'Request from 192.168.1.1 to 10.0.0.1';
      const result = redactPII(text);
      expect(result).toBe('Request from [REDACTED] to [REDACTED]');
    });

    it('should not modify text without PII', () => {
      const text = 'Normal log message without sensitive data';
      const result = redactPII(text);
      expect(result).toBe(text);
    });
  });

  describe('validateMessage', () => {
    it('should validate clean messages', () => {
      const message = 'User clicked button on home screen';
      const result = validateMessage(message);
      
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should detect email addresses', () => {
      const message = 'Login failed for user@example.com';
      const result = validateMessage(message);
      
      expect(result.isValid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('Potential PII detected');
    });

    it('should detect multiple PII types', () => {
      const message = 'User user@test.com from IP 192.168.1.1 with token abc123';
      const result = validateMessage(message);
      
      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(1);
    });
  });

  describe('addAllowedAttributeKey', () => {
    beforeEach(() => {
      // Reset to default state - this is a simplified approach
      // In a real implementation, you might want a reset function
    });

    it('should add new allowed keys', () => {
      const initialKeys = getAllowedAttributeKeys();
      addAllowedAttributeKey('custom_key');
      
      const updatedKeys = getAllowedAttributeKeys();
      expect(updatedKeys).toContain('custom_key');
      expect(updatedKeys.length).toBeGreaterThan(initialKeys.length);
    });

    it('should handle case insensitive keys', () => {
      addAllowedAttributeKey('UPPER_CASE');
      
      const input = { UPPER_CASE: 'value' };
      const result = sanitizeAttributes(input);
      
      expect(result.UPPER_CASE).toBe('value');
    });
  });

  describe('getAllowedAttributeKeys', () => {
    it('should return sorted array of allowed keys', () => {
      const keys = getAllowedAttributeKeys();
      
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(0);
      
      // Check if sorted
      const sorted = [...keys].sort();
      expect(keys).toEqual(sorted);
    });

    it('should include default allowed keys', () => {
      const keys = getAllowedAttributeKeys();
      
      const expectedKeys = [
        'action',
        'screen',
        'component',
        'event_type',
        'success',
        'count',
      ];
      
      expectedKeys.forEach(key => {
        expect(keys).toContain(key);
      });
    });
  });
});