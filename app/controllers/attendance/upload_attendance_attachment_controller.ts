import type { HttpContext } from '@adonisjs/core/http'
import { attachmentManager } from '@jrmc/adonis-attachment'
import StudentHasAttendance from '#models/student_has_attendance'
import AttendanceAttachment from '#models/attendance_attachment'
import AppException from '#exceptions/app_exception'
import {
  validateFileMagicNumber,
  getSafeExtension,
  isAllowedExtension,
  ALLOWED_ATTACHMENT_TYPES,
  ALLOWED_ATTACHMENT_EXTENSIONS,
  MAX_FILE_SIZES,
} from '#lib/file_security'

const MAX_ATTACHMENTS_PER_ATTENDANCE = 5

export default class UploadAttendanceAttachmentController {
  async handle({ params, request, response, auth, effectiveUser, serialize }: HttpContext) {
    const studentAttendance = await StudentHasAttendance.find(params.id)
    if (!studentAttendance) {
      throw AppException.notFound('Registro de presença não encontrado')
    }

    // Anexo só faz sentido pra justificar falta ou contextualizar atraso.
    // Faltou + atestado → JUSTIFIED. Chegou tarde + atestado → LATE.
    // Pra PRESENT/ABSENT cru, não tem o que anexar.
    if (studentAttendance.status !== 'JUSTIFIED' && studentAttendance.status !== 'LATE') {
      throw AppException.badRequest(
        'Anexos só podem ser enviados para registros JUSTIFICADO ou ATRASADO'
      )
    }

    const existingCount = await AttendanceAttachment.query()
      .where('studentHasAttendanceId', studentAttendance.id)
      .count('* as total')
      .first()
    const total = Number(existingCount?.$extras.total ?? 0)
    if (total >= MAX_ATTACHMENTS_PER_ATTENDANCE) {
      throw AppException.badRequest(
        `Limite de ${MAX_ATTACHMENTS_PER_ATTENDANCE} anexos por registro atingido`
      )
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

    // Validação extra de magic number: garante que extensão bate com conteúdo.
    // attachment-manager não faz isso por padrão.
    const detectedType = validateFileMagicNumber(fileBuffer, ALLOWED_ATTACHMENT_TYPES)
    if (!detectedType) {
      throw AppException.badRequest('Conteúdo do arquivo não corresponde à extensão')
    }

    const uploaderId = (effectiveUser ?? auth.user)?.id ?? null

    const attachment = new AttendanceAttachment()
    attachment.studentHasAttendanceId = studentAttendance.id
    attachment.fileName = file.clientName
    attachment.mimeType = detectedType
    attachment.fileSizeBytes = file.size
    attachment.uploadedById = uploaderId
    attachment.file = await attachmentManager.createFromFile(file)
    await attachment.save()

    return response.created(
      await serialize({
        id: attachment.id,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        fileSizeBytes: attachment.fileSizeBytes,
        fileUrl: attachment.file?.url ?? null,
        uploadedBy: uploaderId ? { id: uploaderId } : null,
        createdAt: attachment.createdAt.toISO(),
      })
    )
  }
}
