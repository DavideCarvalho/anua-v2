import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { v4 as uuidV4 } from 'uuid'
import drive from '@adonisjs/drive/services/main'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'
import StudentDocumentSubmission from '#models/student_document_submission'
import StudentDocumentFile from '#models/student_document_file'
import {
  validateFileMagicNumber,
  getSafeExtension,
  isAllowedExtension,
  ALLOWED_ATTACHMENT_TYPES,
  ALLOWED_ATTACHMENT_EXTENSIONS,
  MAX_FILE_SIZES,
} from '#lib/file_security'
import { uploadStudentDocumentParamsValidator } from '#validators/student_document'
import StudentDocumentSubmissionTransformer from '#transformers/student_document_submission_transformer'
import { getSignedAssetUrl } from '#lib/storage'
import AppException from '#exceptions/app_exception'

/**
 * Upload de um arquivo pra uma Submissão de Documento de Matrícula.
 *
 * Semântica de status:
 * - PENDING  → arquivo é apenas anexado à lista (múltiplos arquivos permitidos)
 * - REJECTED → primeira upload após rejeição **substitui** todos os arquivos
 *              antigos e reseta status pra PENDING. Próximos uploads dessa
 *              sessão apenas anexam. (Ver ADR-0003.)
 * - APPROVED → upload é rejeitado; documento já foi aprovado.
 */
export default class UploadStudentDocumentController {
  async handle({ params, request, effectiveUser, response, serialize }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId, submissionId } = await uploadStudentDocumentParamsValidator.validate(params)

    // Autorização: usuário logado precisa ser responsável por este aluno
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()
    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para enviar documentos deste aluno')
    }

    const submission = await StudentDocumentSubmission.query()
      .where('id', submissionId)
      .where('studentId', studentId)
      .first()
    if (!submission) {
      throw AppException.notFound('Submissão de documento não encontrada')
    }

    if (submission.status === 'APPROVED') {
      throw AppException.badRequest('Este documento já foi aprovado e não pode ser substituído')
    }

    const file = request.file('file', {
      size: MAX_FILE_SIZES.document,
      extnames: ALLOWED_ATTACHMENT_EXTENSIONS,
    })

    if (!file) {
      throw AppException.badRequest('Nenhum arquivo enviado')
    }

    if (!file.isValid) {
      throw AppException.badRequest(file.errors[0]?.message || 'Arquivo inválido')
    }

    const ext = getSafeExtension(file.clientName)
    if (!isAllowedExtension(ext, ALLOWED_ATTACHMENT_EXTENSIONS)) {
      throw AppException.badRequest(
        `Tipo de arquivo não permitido. Use: ${ALLOWED_ATTACHMENT_EXTENSIONS.join(', ')}`
      )
    }

    const tmpPath = file.tmpPath!
    const fs = await import('node:fs/promises')
    const fileBuffer = await fs.readFile(tmpPath)

    const detectedType = validateFileMagicNumber(fileBuffer, ALLOWED_ATTACHMENT_TYPES)
    if (!detectedType) {
      throw AppException.badRequest('Conteúdo do arquivo não corresponde à extensão')
    }

    const wasRejected = submission.status === 'REJECTED'

    // Se foi rejeitado, primeiro upload da sessão limpa os arquivos antigos
    // e reseta o status (ver ADR-0003).
    let nextOrd = 0
    await db.transaction(async (trx) => {
      submission.useTransaction(trx)

      if (wasRejected) {
        const oldFiles = await StudentDocumentFile.query({ client: trx }).where(
          'submissionId',
          submission.id
        )
        for (const oldFile of oldFiles) {
          if (oldFile.fileUrl && !oldFile.fileUrl.includes('..')) {
            try {
              await drive.use().delete(oldFile.fileUrl)
            } catch {
              // Ignora erro ao deletar — arquivo pode já não existir no storage
            }
          }
        }
        await StudentDocumentFile.query({ client: trx })
          .where('submissionId', submission.id)
          .delete()

        submission.status = 'PENDING'
        submission.rejectionReason = null
        submission.reviewedBy = null
        submission.reviewedAt = null
      } else {
        // Pega o próximo ord disponível
        const lastFile = await StudentDocumentFile.query({ client: trx })
          .where('submissionId', submission.id)
          .orderBy('ord', 'desc')
          .first()
        nextOrd = lastFile ? lastFile.ord + 1 : 0
      }

      submission.submittedAt = DateTime.now()
      await submission.save()

      // Guarda no storage com key controlada (path por aluno + submission)
      const safeExt = ext || 'pdf'
      const key = `students/${studentId}/submissions/${submission.id}/${uuidV4()}.${safeExt}`
      await file.moveToDisk(key)

      const newFile = new StudentDocumentFile()
      newFile.useTransaction(trx)
      newFile.submissionId = submission.id
      newFile.fileName = file.clientName
      newFile.fileUrl = key
      newFile.mimeType = detectedType
      newFile.size = file.size
      newFile.ord = nextOrd
      await newFile.save()
    })

    // Recarrega submission com files pra response
    await submission.load('files', (q) => q.orderBy('ord', 'asc'))

    // Resolve key → signed URL nos arquivos
    for (const f of submission.files) {
      f.fileUrl = (await getSignedAssetUrl(f.fileUrl)) ?? f.fileUrl
    }

    return response.ok(await serialize(StudentDocumentSubmissionTransformer.transform(submission)))
  }
}
