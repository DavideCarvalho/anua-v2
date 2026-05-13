import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import ProcessWhatsAppWebhookJob from '#jobs/whatsapp/process_whatsapp_webhook_job'
import logger from '@adonisjs/core/services/logger'

export default class WhatsAppWebhookController {
  async handle({ request, response }: HttpContext) {
    const expectedToken = env.get('ARARA_WEBHOOK_TOKEN')
    const receivedToken = request.input('secret', '')

    if (expectedToken && receivedToken !== expectedToken) {
      logger.warn({ receivedToken }, 'Invalid webhook token')
      return response.status(401).json({ error: 'Invalid webhook token' })
    }

    const event = request.input('event', '')
    const data = request.input('data', {})

    await ProcessWhatsAppWebhookJob.dispatch({ event, data })

    return response.noContent()
  }
}
