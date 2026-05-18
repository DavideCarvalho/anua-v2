import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'
import { throttleWebhook } from '#start/limiter'

export function registerAsaasWebhookApiRoutes() {
  router
    .post('/asaas/webhook', [controllers.asaas.AsaasWebhook])
    .as('asaas.webhook')
    .use(throttleWebhook)
}

export function registerAsaasSubaccountApiRoutes() {
  router
    .group(() => {
      router
        .post('/asaas/subaccounts', [controllers.asaas.CreateAsaasSubaccount])
        .as('asaas.subaccounts.create')
      router
        .get('/asaas/subaccounts/status', [controllers.asaas.GetAsaasPaymentConfig])
        .as('asaas.subaccounts.status')
    })
    .use([middleware.auth(), middleware.impersonation(), middleware.requireSchool()])
}
