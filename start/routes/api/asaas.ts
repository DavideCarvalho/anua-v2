import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { throttleWebhook } from '#start/limiter'

// Asaas
const AsaasWebhookController = () => import('#controllers/asaas/asaas_webhook_controller')
const CreateAsaasSubaccountController = () =>
  import('#controllers/asaas/create_asaas_subaccount_controller')
const GetAsaasPaymentConfigController = () =>
  import('#controllers/asaas/get_asaas_payment_config_controller')

export function registerAsaasWebhookApiRoutes() {
  router.post('/asaas/webhook', [AsaasWebhookController]).as('asaas.webhook').use(throttleWebhook)
}

export function registerAsaasSubaccountApiRoutes() {
  router
    .group(() => {
      router
        .post('/asaas/subaccounts', [CreateAsaasSubaccountController])
        .as('asaas.subaccounts.create')
      router
        .get('/asaas/subaccounts/status', [GetAsaasPaymentConfigController])
        .as('asaas.subaccounts.status')
    })
    .use([middleware.auth(), middleware.impersonation(), middleware.requireSchool()])
}
