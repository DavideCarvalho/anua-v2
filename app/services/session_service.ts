/**
 * Session Service
 *
 * Gerencia sessões de usuários usando @adonisjs/cache (BentoCache)
 * Inclui suporte para impersonation (personificação de usuários)
 */

import cache from '@adonisjs/cache/services/main'
import { randomBytes } from 'node:crypto'

/**
 * Interface para dados de sessão
 */
export interface SessionData {
  userId: string
  createdAt: number
  expiresAt: number
  impersonatingUserId?: string | null
}

/**
 * Retorna namespace para sessões
 */
function getSessionsNamespace() {
  return cache.namespace('session')
}

/**
 * Gera um token de sessão seguro
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * Cria uma nova sessão para um usuário
 *
 * @param userId - ID do usuário
 * @param expiresInDays - Dias até expiração (padrão: 30)
 * @returns Token da sessão
 */
export async function createSession(userId: string, expiresInDays: number = 30): Promise<string> {
  const sessions = getSessionsNamespace()
  const token = generateSessionToken()
  const ttl = expiresInDays * 24 * 60 * 60 // segundos
  const now = Date.now()

  const sessionData: SessionData = {
    userId,
    createdAt: now,
    expiresAt: now + ttl * 1000,
  }

  await sessions.set({
    key: token,
    value: sessionData,
    ttl: `${ttl}s`,
  })

  console.log(`[SESSION] Created session for user ${userId}, expires in ${expiresInDays} days`)

  return token
}

/**
 * Valida um token de sessão e retorna os dados
 *
 * @param token - Token da sessão
 * @returns SessionData se válido, null se inválido ou expirado
 */
export async function validateSession(token: string): Promise<SessionData | null> {
  const sessions = getSessionsNamespace()

  const sessionData = await sessions.get<SessionData>({ key: token })

  if (!sessionData) {
    return null
  }

  // Verificar se sessão expirou
  if (Date.now() > sessionData.expiresAt) {
    console.log(`[SESSION] Session ${token.substring(0, 8)}... has expired`)
    await sessions.delete({ key: token })
    return null
  }

  return sessionData
}

/**
 * Invalida uma sessão
 *
 * @param token - Token da sessão
 */
export async function invalidateSession(token: string): Promise<void> {
  const sessions = getSessionsNamespace()
  await sessions.delete({ key: token })
  console.log(`[SESSION] Invalidated session: ${token.substring(0, 8)}...`)
}

/**
 * Renova o TTL de uma sessão
 *
 * @param token - Token da sessão
 * @param expiresInDays - Novos dias até expiração
 */
export async function renewSession(token: string, expiresInDays: number = 30): Promise<boolean> {
  const sessions = getSessionsNamespace()
  const ttl = expiresInDays * 24 * 60 * 60 // segundos

  const sessionData = await sessions.get<SessionData>({ key: token })

  if (!sessionData) {
    return false
  }

  sessionData.expiresAt = Date.now() + ttl * 1000

  await sessions.set({
    key: token,
    value: sessionData,
    ttl: `${ttl}s`,
  })

  console.log(`[SESSION] Renewed session ${token.substring(0, 8)}... for ${expiresInDays} days`)
  return true
}

// ====================================
// IMPERSONATION
// ====================================

/**
 * Ativa impersonation para uma sessão
 * Permite que admins vejam o sistema como outro usuário
 *
 * @param token - Token da sessão do admin
 * @param impersonatingUserId - ID do usuário a ser personificado
 */
export async function setImpersonation(
  token: string,
  impersonatingUserId: string
): Promise<boolean> {
  const sessions = getSessionsNamespace()

  const sessionData = await sessions.get<SessionData>({ key: token })

  if (!sessionData) {
    return false
  }

  // Atualiza com impersonation
  sessionData.impersonatingUserId = impersonatingUserId

  // Calcula TTL restante
  const remainingMs = sessionData.expiresAt - Date.now()
  const remainingSeconds = Math.floor(remainingMs / 1000)

  if (remainingSeconds > 0) {
    await sessions.set({
      key: token,
      value: sessionData,
      ttl: `${remainingSeconds}s`,
    })

    console.log(`[SESSION] User ${sessionData.userId} is now impersonating ${impersonatingUserId}`)

    return true
  }

  return false
}

/**
 * Remove impersonation de uma sessão
 *
 * @param token - Token da sessão
 */
export async function clearImpersonation(token: string): Promise<boolean> {
  const sessions = getSessionsNamespace()

  const sessionData = await sessions.get<SessionData>({ key: token })

  if (!sessionData) {
    return false
  }

  // Remove impersonation
  delete sessionData.impersonatingUserId

  // Calcula TTL restante
  const remainingMs = sessionData.expiresAt - Date.now()
  const remainingSeconds = Math.floor(remainingMs / 1000)

  if (remainingSeconds > 0) {
    await sessions.set({
      key: token,
      value: sessionData,
      ttl: `${remainingSeconds}s`,
    })

    console.log(`[SESSION] Cleared impersonation for user ${sessionData.userId}`)

    return true
  }

  return false
}

/**
 * Retorna o status de impersonation de uma sessão
 *
 * @param token - Token da sessão
 */
export async function getImpersonationStatus(
  token: string
): Promise<{ isImpersonating: boolean; impersonatingUserId: string | null }> {
  const sessionData = await validateSession(token)

  if (!sessionData) {
    return { isImpersonating: false, impersonatingUserId: null }
  }

  return {
    isImpersonating: !!sessionData.impersonatingUserId,
    impersonatingUserId: sessionData.impersonatingUserId ?? null,
  }
}
