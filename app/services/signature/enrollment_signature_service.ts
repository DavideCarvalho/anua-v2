import { DateTime } from 'luxon'
import StudentHasLevel from '#models/student_has_level'
import Contract from '#models/contract'
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

export type StartSignatureOutcome =
  | { status: 'STARTED'; submissionId: string; signatureLink: string | null }
  | { status: 'SKIPPED'; reason: string }
  | { status: 'FAILED'; error: string }

/**
 * Inicia o fluxo de assinatura pra uma matrícula (StudentHasLevel):
 *  1. Carrega contrato + responsáveis financeiros
 *  2. Verifica se o contrato tem template de assinatura
 *  3. Gera PDF preenchido (datas) via @pdfme/generator
 *  4. Chama provider (Autentique) com posições + signers
 *  5. Persiste signatureSubmissionId + signatureStatus='PENDING' no StudentHasLevel
 *
 * Não lança em erro — retorna outcome estruturado pra caller decidir.
 */
export async function startEnrollmentSignature(
  studentHasLevelId: string
): Promise<StartSignatureOutcome> {
  try {
    const shl = await StudentHasLevel.query()
      .where('id', studentHasLevelId)
      .preload('student', (q) => {
        q.preload('responsibles', (rq) => {
          rq.where('isFinancial', true).preload('responsible')
        })
        q.preload('user')
      })
      .first()

    if (!shl) {
      return { status: 'FAILED', error: `StudentHasLevel ${studentHasLevelId} não encontrado` }
    }

    const contractId = await shl.getEffectiveContractId()
    if (!contractId) {
      return { status: 'SKIPPED', reason: 'Matrícula sem contrato vinculado' }
    }

    const contract = await Contract.find(contractId)
    if (!contract) {
      return { status: 'SKIPPED', reason: 'Contrato não encontrado' }
    }

    if (!contract.signatureTemplatePdfKey || !contract.signatureTemplateSchemas) {
      return {
        status: 'SKIPPED',
        reason: 'Contrato não tem template de assinatura configurado',
      }
    }

    const financialResponsibles = shl.student.responsibles
      .filter((r) => r.responsible && r.responsible.email)
      .map((r) => r.responsible)

    if (financialResponsibles.length === 0) {
      return {
        status: 'SKIPPED',
        reason: 'Aluno sem responsável financeiro com e-mail cadastrado',
      }
    }

    const pdfBuffer = await generateSignaturePdf({
      pdfKey: contract.signatureTemplatePdfKey,
      schemas: contract.signatureTemplateSchemas,
    })

    const positions = templateSchemasToPositions(contract.signatureTemplateSchemas)
    if (positions.length === 0) {
      return { status: 'SKIPPED', reason: 'Template sem campos de assinatura' }
    }

    // Autentique não aceita email + phone no mesmo signer.
    // Preferimos email (mais confiável); phone só como fallback.
    // CPF só é enviado se válido (11 dígitos) — em muitos cadastros o campo
    // documentNumber guarda RG/outros.
    const signers: SignerInput[] = financialResponsibles.map((user) => {
      const cpf =
        user.documentNumber && isValidCpf(user.documentNumber)
          ? user.documentNumber.replace(/\D/g, '')
          : undefined
      if (user.email) {
        return {
          name: user.name,
          email: user.email,
          cpf,
          action: 'SIGN',
          deliveryMethod: 'EMAIL',
          positions,
        }
      }
      const phoneDigits = (user.phone ?? '').replace(/\D/g, '')
      return {
        name: user.name,
        phone: phoneDigits || undefined,
        cpf,
        action: 'SIGN',
        deliveryMethod: 'WHATSAPP',
        positions,
      }
    })

    const provider = resolveSignatureProvider()
    const documentName = `${contract.name} — ${shl.student.user?.name ?? 'Aluno'}`

    const result = await provider.createDocument({
      name: documentName,
      file: pdfBuffer,
      fileName: `${documentName.replace(/[^\w-]/g, '_')}.pdf`,
      signers,
    })

    shl.signatureSubmissionId = result.documentId
    shl.signatureStatus = 'PENDING'
    await shl.save()

    const firstLink = result.signatures.find((s) => s.signatureLink)?.signatureLink ?? null

    logger.info(
      { studentHasLevelId, documentId: result.documentId, signers: signers.length },
      'Documento de assinatura criado no provider'
    )

    return {
      status: 'STARTED',
      submissionId: result.documentId,
      signatureLink: firstLink,
    }
  } catch (error) {
    logger.error({ studentHasLevelId, error }, 'Falha ao iniciar assinatura da matrícula')
    return {
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Atualiza status da matrícula a partir de evento do provider.
 * Chamado pelo webhook handler.
 */
export async function applySignatureWebhook(
  submissionId: string,
  status: 'SIGNED' | 'DECLINED' | 'EXPIRED'
): Promise<{ updated: boolean; studentHasLevelId: string | null }> {
  const shl = await StudentHasLevel.query().where('signatureSubmissionId', submissionId).first()

  if (!shl) {
    logger.warn({ submissionId }, 'Webhook recebido para submissionId desconhecido')
    return { updated: false, studentHasLevelId: null }
  }

  shl.signatureStatus = status
  if (status === 'SIGNED') {
    shl.documentSignedAt = DateTime.now()
  }
  await shl.save()

  return { updated: true, studentHasLevelId: shl.id }
}
