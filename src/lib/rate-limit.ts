interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const MAX_REQUESTS_PER_HOUR = 30;
const ONE_HOUR_MS = 60 * 60 * 1000;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; error?: string } {
  const now = Date.now();
  const cleanIp = ip.trim() || 'unknown';

  let record = rateLimitMap.get(cleanIp);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(cleanIp, record);
  }

  // Filter timestamps within the last hour
  record.timestamps = record.timestamps.filter(ts => now - ts < ONE_HOUR_MS);

  if (record.timestamps.length >= MAX_REQUESTS_PER_HOUR) {
    return {
      allowed: false,
      remaining: 0,
      error: `Limite de ${MAX_REQUESTS_PER_HOUR} anúncios por hora atingido para este IP. Tente novamente mais tarde.`,
    };
  }

  record.timestamps.push(now);
  const remaining = MAX_REQUESTS_PER_HOUR - record.timestamps.length;

  return {
    allowed: true,
    remaining,
  };
}

export function resetRateLimits(): void {
  rateLimitMap.clear();
}
