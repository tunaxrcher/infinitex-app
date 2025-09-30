// Simple in-memory rate limiter for login attempts
// In production, use Redis or database for persistence

interface RateLimitStore {
  [key: string]: {
    attempts: number
    lastAttempt: number
    blockedUntil?: number
  }
}

const store: RateLimitStore = {}

const MAX_ATTEMPTS = 5
const BLOCK_DURATION = 15 * 60 * 1000 // 15 minutes
const RESET_WINDOW = 60 * 60 * 1000 // 1 hour

export function checkRateLimit(identifier: string): {
  allowed: boolean
  remainingAttempts: number
  blockedUntil?: Date
} {
  const now = Date.now()
  const record = store[identifier]

  // No previous attempts
  if (!record) {
    store[identifier] = { attempts: 1, lastAttempt: now }
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 }
  }

  // Check if still blocked
  if (record.blockedUntil && now < record.blockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: new Date(record.blockedUntil),
    }
  }

  // Reset if window expired
  if (now - record.lastAttempt > RESET_WINDOW) {
    store[identifier] = { attempts: 1, lastAttempt: now }
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 }
  }

  // Increment attempts
  record.attempts++
  record.lastAttempt = now

  // Block if too many attempts
  if (record.attempts >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: new Date(record.blockedUntil),
    }
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - record.attempts,
  }
}

export function resetRateLimit(identifier: string): void {
  delete store[identifier]
}
