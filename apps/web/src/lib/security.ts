import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

/**
 * CSRF Token validation
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, expected: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expected)
  );
}

/**
 * Content Security Policy headers
 */
export function getCSPHeaders(): Record<string, string> {
  const nonce = crypto.randomBytes(16).toString('base64');
  
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' wss: ws:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  return {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'nonce': nonce,
  };
}

/**
 * Input sanitization
 */
export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value);
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
}

/**
 * SQL Injection prevention helpers
 */
export function escapeSQLString(str: string): string {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case '\0': return '\\0';
      case '\x08': return '\\b';
      case '\x09': return '\\t';
      case '\x1a': return '\\z';
      case '\n': return '\\n';
      case '\r': return '\\r';
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char;
      default:
        return char;
    }
  });
}

/**
 * Password strength validation
 */
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length < 8) {
    feedback.push('La contraseña debe tener al menos 8 caracteres');
  }

  // Character variety
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Incluye letras minúsculas');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Incluye letras mayúsculas');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Incluye números');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Incluye caracteres especiales');

  // Common patterns
  if (/^[0-9]+$/.test(password)) {
    score = Math.min(score, 1);
    feedback.push('Evita usar solo números');
  }

  if (/^[a-zA-Z]+$/.test(password)) {
    score = Math.min(score, 2);
    feedback.push('Combina letras con números y símbolos');
  }

  // Common passwords
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    score = 0;
    feedback.push('Evita contraseñas comunes');
  }

  const finalScore = Math.min(score, 4);

  return {
    score: finalScore,
    feedback,
    isStrong: finalScore >= 3,
  };
}

/**
 * Request signing and verification
 */
export function signRequest(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

export function verifyRequestSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = signRequest(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

/**
 * Secure random token generation
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * IP address extraction
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

/**
 * Secure headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  const securityHeaders = getCSPHeaders();
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (key !== 'nonce') {
      response.headers.set(key, value);
    }
  });
  
  return response;
}

/**
 * CORS configuration
 */
export function getCORSHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    process.env.NEXTAUTH_URL || 'http://localhost:3000',
  ];

  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}
