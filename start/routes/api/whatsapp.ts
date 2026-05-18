import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

export function registerWhatsappApiRoutes() {
  router.post('/whatsapp/webhook', [controllers.whatsapp.WhatsappWebhook]).as('whatsapp.webhook')
}
