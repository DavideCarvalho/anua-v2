import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Subscription Plans
const ListSubscriptionPlansController = () =>
  import('#controllers/subscription_plans/list_subscription_plans_controller')
const ShowSubscriptionPlanController = () =>
  import('#controllers/subscription_plans/show_subscription_plan_controller')
const CreateSubscriptionPlanController = () =>
  import('#controllers/subscription_plans/create_subscription_plan_controller')
const UpdateSubscriptionPlanController = () =>
  import('#controllers/subscription_plans/update_subscription_plan_controller')
const DeleteSubscriptionPlanController = () =>
  import('#controllers/subscription_plans/delete_subscription_plan_controller')

// Subscriptions
const ListSubscriptionsController = () =>
  import('#controllers/subscriptions/list_subscriptions_controller')
const ShowSubscriptionController = () =>
  import('#controllers/subscriptions/show_subscription_controller')
const CreateSubscriptionController = () =>
  import('#controllers/subscriptions/create_subscription_controller')
const UpdateSubscriptionController = () =>
  import('#controllers/subscriptions/update_subscription_controller')
const CancelSubscriptionController = () =>
  import('#controllers/subscriptions/cancel_subscription_controller')
const PauseSubscriptionController = () =>
  import('#controllers/subscriptions/pause_subscription_controller')
const ReactivateSubscriptionController = () =>
  import('#controllers/subscriptions/reactivate_subscription_controller')
const GetSchoolSubscriptionController = () =>
  import('#controllers/subscriptions/get_school_subscription_controller')
const GetChainSubscriptionController = () =>
  import('#controllers/subscriptions/get_chain_subscription_controller')

// Subscription Invoices
const ListSubscriptionInvoicesController = () =>
  import('#controllers/subscription_invoices/list_subscription_invoices_controller')
const ShowSubscriptionInvoiceController = () =>
  import('#controllers/subscription_invoices/show_subscription_invoice_controller')
const CreateSubscriptionInvoiceController = () =>
  import('#controllers/subscription_invoices/create_subscription_invoice_controller')
const UpdateSubscriptionInvoiceController = () =>
  import('#controllers/subscription_invoices/update_subscription_invoice_controller')
const MarkInvoicePaidController = () =>
  import('#controllers/subscription_invoices/mark_invoice_paid_controller')

export function registerSubscriptionPlanApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListSubscriptionPlansController]).as('subscriptionPlans.index')
      router.post('/', [CreateSubscriptionPlanController]).as('subscriptionPlans.store')
      router.get('/:id', [ShowSubscriptionPlanController]).as('subscriptionPlans.show')
      router.put('/:id', [UpdateSubscriptionPlanController]).as('subscriptionPlans.update')
      router.delete('/:id', [DeleteSubscriptionPlanController]).as('subscriptionPlans.destroy')
    })
    .prefix('/subscription-plans')
    .use(middleware.auth())
}

export function registerSubscriptionApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListSubscriptionsController]).as('subscriptions.index')
      router.post('/', [CreateSubscriptionController]).as('subscriptions.store')
      router.get('/:id', [ShowSubscriptionController]).as('subscriptions.show')
      router.put('/:id', [UpdateSubscriptionController]).as('subscriptions.update')
      router.post('/:id/cancel', [CancelSubscriptionController]).as('subscriptions.cancel')
      router.post('/:id/pause', [PauseSubscriptionController]).as('subscriptions.pause')
      router
        .post('/:id/reactivate', [ReactivateSubscriptionController])
        .as('subscriptions.reactivate')
    })
    .prefix('/subscriptions')
    .use(middleware.auth())

  // School subscription route
  router
    .group(() => {
      router
        .get('/:schoolId/subscription', [GetSchoolSubscriptionController])
        .as('schools.subscription')
    })
    .prefix('/schools')
    .use(middleware.auth())

  // School chain subscription route
  router
    .group(() => {
      router
        .get('/:schoolChainId/subscription', [GetChainSubscriptionController])
        .as('schoolChains.subscription')
    })
    .prefix('/school-chains')
    .use(middleware.auth())
}

export function registerSubscriptionInvoiceApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListSubscriptionInvoicesController]).as('subscriptionInvoices.index')
      router.post('/', [CreateSubscriptionInvoiceController]).as('subscriptionInvoices.store')
      router.get('/:id', [ShowSubscriptionInvoiceController]).as('subscriptionInvoices.show')
      router.put('/:id', [UpdateSubscriptionInvoiceController]).as('subscriptionInvoices.update')
      router.post('/:id/mark-paid', [MarkInvoicePaidController]).as('subscriptionInvoices.markPaid')
    })
    .prefix('/subscription-invoices')
    .use(middleware.auth())
}
