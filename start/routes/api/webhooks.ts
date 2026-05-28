import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { throttleWebhook } from '#start/limiter'

export function registerAutentiqueWebhookApiRoutes() {
  router
    .post('/webhooks/autentique', [controllers.webhooks.AutentiqueWebhook])
    .as('webhooks.autentique')
    .use(throttleWebhook)
}
