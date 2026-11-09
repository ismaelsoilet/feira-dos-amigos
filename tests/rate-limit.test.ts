import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimits } from '../src/lib/rate-limit';

describe('Task 2: Rate Limiting & Anti-Spam', () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it('should allow requests within the 15 req/hour limit', () => {
    const ip = '192.168.1.100';
    for (let i = 0; i < 15; i++) {
      const result = checkRateLimit(ip);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(14 - i);
    }
  });

  it('should block requests when exceeding 15 req/hour from same IP', () => {
    const ip = '192.168.1.200';
    for (let i = 0; i < 15; i++) {
      checkRateLimit(ip);
    }
    const blocked = checkRateLimit(ip);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.error).toContain('Limite');
  });

  it('should track limits independently per IP', () => {
    const ip1 = '10.0.0.1';
    const ip2 = '10.0.0.2';

    for (let i = 0; i < 15; i++) {
      checkRateLimit(ip1);
    }
    expect(checkRateLimit(ip1).allowed).toBe(false);
    expect(checkRateLimit(ip2).allowed).toBe(true);
  });
});
