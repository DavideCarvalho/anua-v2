import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import School from '#models/school'
import {
  validateFileMagicNumber,
  sanitizeFilename,
  getSafeExtension,
  isAllowedExtension,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_TYPES,
} from '#lib/file_security'
import AppException from '#exceptions/app_exception'

export default class UploadSchoolLogoController {
  async handle({ params, request, response, selectedSchoolIds }: HttpContext) {
    // Verifica se escola está no contexto do usuário (IDOR prevention)
    const school = await School.query()
      .where('id', params.id)
      .whereIn('id', selectedSchoolIds ?? [])
      .first()

    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    const logo = request.file('logo', {
      size: '2mb',
      extnames: ALLOWED_IMAGE_EXTENSIONS,
    })

    if (!logo) {
      throw AppException.badRequest('Nenhum arquivo enviado')
    }

    if (!logo.isValid) {
      throw AppException.badRequest(logo.errors[0]?.message || 'Arquivo inválido')
    }

    // Valida extensão
    const ext = getSafeExtension(logo.clientName)
    if (!isAllowedExtension(ext, ALLOWED_IMAGE_EXTENSIONS)) {
      throw AppException.badRequest(
        `Tipo de arquivo não permitido. Use: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
      )
    }

    // Lê o buffer do arquivo para validar magic number
    const tmpPath = logo.tmpPath!
    const fs = await import('node:fs/promises')
    const fileBuffer = await fs.readFile(tmpPath)

    // Valida conteúdo real do arquivo (magic number)
    const detectedType = validateFileMagicNumber(fileBuffer, ALLOWED_IMAGE_TYPES)
    if (!detectedType) {
      throw AppException.badRequest('Conteúdo do arquivo não corresponde à extensão')
    }

    // Sanitiza nome do arquivo
    const sanitizedExt = sanitizeFilename(ext || 'jpg')

    // Deleta logo antigo se existir
    if (school.logoUrl) {
      const oldPath = school.logoUrl
        .replace(/^\/uploads\//, '')
        .replace(/^https:\/\/storage\.googleapis\.com\/[^/]+\//, '')

      // Valida path para prevenir path traversal
      if (!oldPath.includes('..') && !oldPath.startsWith('/')) {
        try {
          await drive.use().delete(oldPath)
        } catch {
          // Ignora erro ao deletar arquivo antigo
        }
      }
    }

    // Gera nome único e seguro
    const filename = `schools/${school.id}/logo-${cuid()}.${sanitizedExt}`

    // Upload para o drive
    await logo.moveToDisk(filename)

    // Obtém URL pública
    const url = await drive.use().getUrl(filename)

    // Atualiza escola
    school.logoUrl = url
    await school.save()

    return response.ok({
      url: school.logoUrl,
    })
  }
}
