import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import School from '#models/school'

export default class UploadSchoolLogoController {
  async handle({ params, request }: HttpContext) {
    const school = await School.findOrFail(params.id)

    const logo = request.file('logo', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
    })

    if (!logo) {
      throw new Error('Nenhum arquivo enviado')
    }

    if (!logo.isValid) {
      throw new Error(logo.errors[0]?.message || 'Arquivo inválido')
    }

    // Delete old logo if exists
    if (school.logoUrl) {
      // Extract path from URL (works for both local /uploads/ and GCS URLs)
      const oldPath = school.logoUrl
        .replace(/^\/uploads\//, '') // local fs
        .replace(/^https:\/\/storage\.googleapis\.com\/[^/]+\//, '') // GCS
      try {
        await drive.use().delete(oldPath)
      } catch {
        // Ignore errors when deleting old file
      }
    }

    // Generate unique filename
    const filename = `schools/${school.id}/logo-${cuid()}.${logo.extname}`

    // Upload to drive
    await logo.moveToDisk(filename)

    // Get the public URL
    const url = await drive.use().getUrl(filename)

    // Update school
    school.logoUrl = url
    await school.save()

    return {
      url: school.logoUrl,
    }
  }
}
