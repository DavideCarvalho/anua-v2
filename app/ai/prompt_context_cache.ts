import School from '#models/school'
import User from '#models/user'

// Cache em memória pros lookups de School e User feitos a cada turno do chat.
// O hot path do streamText/buildPromptContext caía em 2 round-trips no Postgres
// pra fetchar metadata que muda raramente; cachear por 60s elimina isso sem
// segurar versões antigas demais.
//
// Por processo — em deploy multi-worker (PM2 cluster) cada worker tem sua
// cópia. Tudo bem: o usuário usualmente fica preso a um worker via sticky
// session, e mesmo sem sticky o pior caso é cache miss = 1 fetch normal.
//
// Bound de tamanho via eviction simples (mais antiga sai quando passa de N).
// Não é LRU verdadeiro porque não vale a complexidade pra ~centenas de chaves.

const TTL_MS = 60_000
const MAX_ENTRIES = 500

type Entry<T> = { value: T | null; expiresAt: number }

class TtlCache<T> {
  private store = new Map<string, Entry<T>>()

  get(key: string): T | null | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key)
      return undefined
    }
    return entry.value
  }

  set(key: string, value: T | null): void {
    if (this.store.size >= MAX_ENTRIES) {
      const oldest = this.store.keys().next().value
      if (oldest !== undefined) this.store.delete(oldest)
    }
    this.store.set(key, { value, expiresAt: Date.now() + TTL_MS })
  }

  invalidate(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}

const schoolCache = new TtlCache<School>()
const userCache = new TtlCache<User>()

export async function getCachedSchool(id: string): Promise<School | null> {
  const hit = schoolCache.get(id)
  if (hit !== undefined) return hit
  const value = await School.find(id)
  schoolCache.set(id, value)
  return value
}

export async function getCachedUser(id: string): Promise<User | null> {
  const hit = userCache.get(id)
  if (hit !== undefined) return hit
  const value = await User.find(id)
  userCache.set(id, value)
  return value
}

export function invalidateSchoolCache(id: string): void {
  schoolCache.invalidate(id)
}

export function invalidateUserCache(id: string): void {
  userCache.invalidate(id)
}
