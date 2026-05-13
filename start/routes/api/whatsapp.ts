import router from '@adonisjs/core/services/router'

const WhatsAppWebhookController = () => import('#controllers/whatsapp/whatsapp_webhook_controller')

export function registerWhatsappApiRoutes() {
  router.post('/whatsapp/webhook', [WhatsAppWebhookController]).as('whatsapp.webhook')
}
