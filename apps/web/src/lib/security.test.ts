import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkPasswordStrength,
  sanitizeInput,
  sanitizeObject,
  generateSecureToken,
  signRequest,
  verifyRequestSignature,
} from '@/lib/security';

describe('Security Utilities', () => {
  describe('checkPasswordStrength', () => {
    it('returns weak score for short passwords', () => {
      const result = checkPasswordStrength('abc');
      expect(result.score).toBeLessThan(3);
      expect(result.isStrong).toBe(false);
    });

    it('returns strong score for complex passwords', () => {
      const result = checkPasswordStrength('MyP@ssw0rd123!');
      expect(result.score).toBeGreaterThanOrEqual(3);
      expect(result.isStrong).toBe(true);
    });

    it('provides feedback for missing requirements', () => {
      const result = checkPasswordStrength('password');
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('detects common passwords', () => {
      const result = checkPasswordStrength('password123');
      expect(result.score).toBe(0);
      expect(result.feedback).toContain('Evita contraseñas comunes');
    });
  });

  describe('sanitizeInput', () => {
    it('removes HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('removes javascript: protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeInput(input);
      expect(result).not.toContain('javascript:');
    });

    it('removes event handlers', () => {
      const input = 'onclick=alert("xss")';
      const result = sanitizeInput(input);
      expect(result).not.toContain('onclick=');
    });

    it('trims whitespace', () => {
      const input = '  hello  ';
      const result = sanitizeInput(input);
      expect(result).toBe('hello');
    });
  });

  describe('sanitizeObject', () => {
    it('sanitizes string values', () => {
      const obj = {
        name: '<script>alert("xss")</script>',
        description: 'Normal text',
      };
      const result = sanitizeObject(obj);
      expect(result.name).not.toContain('<script>');
      expect(result.description).toBe('Normal text');
    });

    it('recursively sanitizes nested objects', () => {
      const obj = {
        user: {
          name: '<b>John</b>',
          email: 'john@example.com',
        },
      };
      const result = sanitizeObject(obj);
      expect(result.user.name).not.toContain('<b>');
    });

    it('preserves non-string values', () => {
      const obj = {
        count: 42,
        active: true,
        tags: ['tag1', 'tag2'],
      };
      const result = sanitizeObject(obj);
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
    });
  });

  describe('generateSecureToken', () => {
    it('generates token of specified length', () => {
      const token = generateSecureToken(32);
      expect(token).toHaveLength(64); // hex encoding doubles length
    });

    it('generates different tokens each time', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('Request Signing', () => {
    const secret = 'test-secret';
    const payload = 'test-payload';

    it('signs requests consistently', () => {
      const signature1 = signRequest(payload, secret);
      const signature2 = signRequest(payload, secret);
      expect(signature1).toBe(signature2);
    });

    it('verifies valid signatures', () => {
      const signature = signRequest(payload, secret);
      const isValid = verifyRequestSignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it('rejects invalid signatures', () => {
      const signature = signRequest(payload, secret);
      const isValid = verifyRequestSignature(payload, 'wrong-signature', secret);
      expect(isValid).toBe(false);
    });

    it('rejects signatures with wrong secret', () => {
      const signature = signRequest(payload, secret);
      const isValid = verifyRequestSignature(payload, signature, 'wrong-secret');
      expect(isValid).toBe(false);
    });
  });
});
