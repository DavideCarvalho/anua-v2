/**
 * OTP (One-Time Password) Service
 *
 * Gerencia códigos de verificação usando @adonisjs/cache (BentoCache)
 * Inspirado no school-super-app
 */

import cache from '@adonisjs/cache/services/main'
import { randomInt } from 'node:crypto'

interface VerificationCodeData {
  code: string
  email: string
  createdAt: number
}

/**
 * Gera um código OTP de 6 dígitos
 */
function generateOTPCode(): string {
  return randomInt(100000, 1000000).toString()
}

/**
 * Retorna namespace para códigos de verificação
 */
function getVerificationCodesNamespace() {
  return cache.namespace('verification')
}

/**
 * Retorna namespace para rate limiting de códigos
 */
function getRateLimitNamespace() {
  return cache.namespace('verification-rate')
}

/**
 * Cria e salva um código de verificação com TTL automático
 *
 * @param email - Email do usuário
 * @param expiresInMinutes - Minutos até expiração (padrão: 10)
 * @returns Código gerado
 */
export async function createVerificationCode(
  email: string,
  expiresInMinutes: number = 10
): Promise<string> {
  const codes = getVerificationCodesNamespace()
  const rateLimit = getRateLimitNamespace()

  const code = generateOTPCode()
  const ttl = expiresInMinutes * 60 // Converter para segundos
  const normalizedEmail = email.toLowerCase().trim()

  const codeData: VerificationCodeData = {
    code,
    email: normalizedEmail,
    createdAt: Date.now(),
  }

  // Salva o código com TTL automático
  await codes.set({
    key: normalizedEmail,
    value: codeData,
    ttl: `${ttl}s`,
  })

  // Marca rate limit (1 minuto) para evitar spam
  await rateLimit.set({
    key: normalizedEmail,
    value: true,
    ttl: '60s',
  })

  console.log(
    `[OTP] Created code for ${normalizedEmail}, expires in ${expiresInMinutes} minutes`
  )

  return code
}

/**
 * Verifica se um código é válido para determinado email
 * Remove o código após verificação bem-sucedida (uso único)
 *
 * @param email - Email do usuário
 * @param code - Código fornecido
 * @returns true se válido, false se inválido ou expirado
 */
export async function verifyCode(email: string, code: string): Promise<boolean> {
  const codes = getVerificationCodesNamespace()
  const normalizedEmail = email.toLowerCase().trim()

  const codeData = await codes.get<VerificationCodeData>({
    key: normalizedEmail,
  })

  if (!codeData) {
    console.log(`[OTP] No code found for ${normalizedEmail}`)
    return false
  }

  // Verifica se o código está correto
  if (codeData.code !== code) {
    console.log(`[OTP] Invalid code for ${normalizedEmail}`)
    return false
  }

  // Código válido - remove para que não possa ser reutilizado
  await codes.delete({ key: normalizedEmail })

  console.log(`[OTP] Code verified and deleted for ${normalizedEmail}`)
  return true
}

/**
 * Verifica se um email tem um código pendente recente
 * Útil para rate limiting (evitar spam de códigos)
 *
 * @param email - Email do usuário
 * @returns true se existe código recente
 */
export async function hasRecentCode(email: string): Promise<boolean> {
  const rateLimit = getRateLimitNamespace()
  const normalizedEmail = email.toLowerCase().trim()

  const hasRecent = await rateLimit.get<boolean>({ key: normalizedEmail })

  return !!hasRecent
}
