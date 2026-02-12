import router from '@adonisjs/core/services/router'
import { throttleWebhook } from '#start/limiter'

// Asaas
const AsaasWebhookController = () => import('#controllers/asaas/asaas_webhook_controller')

export function registerAsaasWebhookApiRoutes() {
  router.post('/asaas/webhook', [AsaasWebhookController]).as('asaas.webhook').use(throttleWebhook)
}
