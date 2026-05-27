import { createHmac, timingSafeEqual } from 'node:crypto'
import env from '#start/env'

const ALGO = 'sha256'

function getSecret(): string {
  return env.get('APP_KEY')
}

export default class CalendarTokenService {
  static generate(studentId: string, userId: string): string {
    const payload = `${userId}:${studentId}`
    const sig = createHmac(ALGO, getSecret()).update(payload).digest('hex')
    return Buffer.from(`${payload}:${sig}`).toString('base64url')
  }

  static verify(token: string): { userId: string; studentId: string } | null {
    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf-8')
      const parts = decoded.split(':')
      if (parts.length !== 3) return null

      const [userId, studentId, sig] = parts
      const expected = createHmac(ALGO, getSecret()).update(`${userId}:${studentId}`).digest('hex')

      const sigBuf = Buffer.from(sig, 'hex')
      const expectedBuf = Buffer.from(expected, 'hex')

      if (sigBuf.length !== expectedBuf.length) return null
      if (!timingSafeEqual(sigBuf, expectedBuf)) return null

      return { userId, studentId }
    } catch {
      return null
    }
  }
}
