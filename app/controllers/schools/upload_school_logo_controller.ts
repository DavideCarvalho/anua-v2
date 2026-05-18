import type { HttpContext } from '@adonisjs/core/http'
import { v4 as uuidV4 } from 'uuid'
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
import { getSignedAssetUrl } from '#lib/storage'
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

    // Deleta logo antigo se existir.
    // `logoUrl` agora guarda a key do storage (ex: "schools/abc/logo-xyz.jpg"),
    // mas back-compat aceita URLs legadas (extraímos a key da URL).
    if (school.logoUrl) {
      const oldKey = school.logoUrl
        .replace(/^\/uploads\//, '')
        .replace(/^https?:\/\/storage\.googleapis\.com\/[^/]+\//, '')
        .replace(/^https?:\/\/[^/]+\/uploads\//, '')

      if (!oldKey.includes('..') && !oldKey.startsWith('/') && !oldKey.startsWith('http')) {
        try {
          await drive.use().delete(oldKey)
        } catch {
          // Ignora erro ao deletar arquivo antigo
        }
      }
    }

    // Gera nome único e seguro
    const key = `schools/${school.id}/logo-${uuidV4()}.${sanitizedExt}`

    await logo.moveToDisk(key)

    // Guarda a KEY no banco. URL assinada é gerada on-demand via getSignedAssetUrl().
    school.logoUrl = key
    await school.save()

    const signedUrl = await getSignedAssetUrl(key)

    return response.ok({ url: signedUrl })
  }
}
