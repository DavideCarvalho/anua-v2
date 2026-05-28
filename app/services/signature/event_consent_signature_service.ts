import { DateTime } from 'luxon'
import EventParentalConsent from '#models/event_parental_consent'
import logger from '@adonisjs/core/services/logger'
import { resolveSignatureProvider } from './resolve_signature_provider.js'
import { generateSignaturePdf } from './signature_pdf_generator.js'
import { templateSchemasToPositions } from './template_to_positions.js'
import type { SignerInput } from './signature_provider.js'

function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i)
  let check = (sum * 10) % 11
  if (check >= 10) check = 0
  if (check !== Number(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i)
  check = (sum * 10) % 11
  if (check >= 10) check = 0
  return check === Number(digits[10])
}

export type StartConsentSignatureOutcome =
  | { status: 'STARTED'; submissionId: string; signatureLink: string | null }
  | { status: 'SKIPPED'; reason: string }
  | { status: 'FAILED'; error: string }

/**
 * Inicia o fluxo de assinatura digital pra um EventParentalConsent:
 *  1. Verifica se evento tem template configurado
 *  2. Gera PDF preenchido com data atual via @pdfme/generator
 *  3. Chama provider (Autentique) com o responsável como signer
 *  4. Persiste signatureSubmissionId no consent
 *
 * Não lança em erro — retorna outcome estruturado.
 */
export async function startConsentSignature(
  consentId: string
): Promise<StartConsentSignatureOutcome> {
  try {
    const consent = await EventParentalConsent.query()
      .where('id', consentId)
      .preload('event')
      .preload('student', (q) => q.preload('user'))
      .preload('responsible')
      .first()

    if (!consent) {
      return { status: 'FAILED', error: `Consent ${consentId} não encontrado` }
    }

    if (consent.signatureSubmissionId) {
      return {
        status: 'SKIPPED',
        reason: `Já existe submission ${consent.signatureSubmissionId} pra esse consent`,
      }
    }

    const event = consent.event
    if (!event.signatureTemplatePdfKey || !event.signatureTemplateSchemas) {
      return {
        status: 'SKIPPED',
        reason: 'Evento não tem template de assinatura — fluxo light (click)',
      }
    }

    const responsible = consent.responsible
    if (!responsible?.email) {
      return {
        status: 'SKIPPED',
        reason: 'Responsável sem e-mail cadastrado',
      }
    }

    const pdfBuffer = await generateSignaturePdf({
      pdfKey: event.signatureTemplatePdfKey,
      schemas: event.signatureTemplateSchemas,
    })

    const positions = templateSchemasToPositions(event.signatureTemplateSchemas)
    if (positions.length === 0) {
      return { status: 'SKIPPED', reason: 'Template sem campos de assinatura' }
    }

    const cpf =
      responsible.documentNumber && isValidCpf(responsible.documentNumber)
        ? responsible.documentNumber.replace(/\D/g, '')
        : undefined

    const signers: SignerInput[] = [
      {
        name: responsible.name,
        email: responsible.email,
        cpf,
        action: 'SIGN',
        deliveryMethod: 'EMAIL',
        positions,
      },
    ]

    const provider = resolveSignatureProvider()
    const studentName = consent.student.user?.name ?? 'Aluno'
    const documentName = `${event.title} — ${studentName}`

    const result = await provider.createDocument({
      name: documentName,
      file: pdfBuffer,
      fileName: `${documentName.replace(/[^\w-]/g, '_')}.pdf`,
      signers,
    })

    consent.signatureSubmissionId = result.documentId
    consent.emailSentAt = DateTime.now()
    await consent.save()

    const firstLink = result.signatures.find((s) => s.signatureLink)?.signatureLink ?? null

    logger.info(
      { consentId, eventId: event.id, documentId: result.documentId },
      '[event-consent] Documento de assinatura criado no provider'
    )

    return {
      status: 'STARTED',
      submissionId: result.documentId,
      signatureLink: firstLink,
    }
  } catch (error) {
    logger.error({ consentId, error }, '[event-consent] Falha ao iniciar assinatura')
    return {
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Aplica evento do provider no EventParentalConsent.
 * Chamado pelo webhook handler quando o submissionId pertence a um consent (não a uma matrícula).
 */
export async function applyConsentSignatureWebhook(
  submissionId: string,
  status: 'SIGNED' | 'DECLINED' | 'EXPIRED'
): Promise<{ updated: boolean; consentId: string | null }> {
  const consent = await EventParentalConsent.query()
    .where('signatureSubmissionId', submissionId)
    .first()

  if (!consent) {
    return { updated: false, consentId: null }
  }

  if (status === 'SIGNED') {
    consent.status = 'APPROVED'
    consent.respondedAt = DateTime.now()
  } else if (status === 'DECLINED') {
    consent.status = 'DENIED'
    consent.respondedAt = DateTime.now()
    consent.denialReason = 'Assinatura recusada no provider'
  } else if (status === 'EXPIRED') {
    consent.status = 'EXPIRED'
  }

  await consent.save()
  return { updated: true, consentId: consent.id }
}
