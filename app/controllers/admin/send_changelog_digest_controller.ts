import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import SendChangelogDigestJob from '#jobs/notifications/send_changelog_digest_job'

const validator = vine.compile(
  vine.object({
    entries: vine.array(
      vine.object({
        title: vine.string(),
        items: vine.array(
          vine.object({
            text: vine.string(),
            audience: vine.enum(['responsavel', 'escola', 'admin', 'all']),
          })
        ),
      })
    ),
  })
)

export default class SendChangelogDigestController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(validator)

    await SendChangelogDigestJob.dispatch({ entries: payload.entries })

    return response.accepted({
      message:
        'Digest de novidades enfileirado. A IA vai gerar um texto personalizado pra cada perfil e os emails serão enviados em background.',
    })
  }
}
