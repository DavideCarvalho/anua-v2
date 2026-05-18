import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerSubscriptionPlanApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.subscriptionPlans.ListSubscriptionPlans])
        .as('subscription_plans.index')
      router
        .post('/', [controllers.subscriptionPlans.CreateSubscriptionPlan])
        .as('subscription_plans.store')
      router
        .get('/:id', [controllers.subscriptionPlans.ShowSubscriptionPlan])
        .as('subscription_plans.show')
      router
        .put('/:id', [controllers.subscriptionPlans.UpdateSubscriptionPlan])
        .as('subscription_plans.update')
      router
        .delete('/:id', [controllers.subscriptionPlans.DeleteSubscriptionPlan])
        .as('subscription_plans.destroy')
    })
    .prefix('/subscription-plans')
    .use(middleware.auth())
}

export function registerSubscriptionApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.subscriptions.ListSubscriptions]).as('subscriptions.index')
      router.post('/', [controllers.subscriptions.CreateSubscription]).as('subscriptions.store')
      router.get('/:id', [controllers.subscriptions.ShowSubscription]).as('subscriptions.show')
      router.put('/:id', [controllers.subscriptions.UpdateSubscription]).as('subscriptions.update')
      router
        .post('/:id/cancel', [controllers.subscriptions.CancelSubscription])
        .as('subscriptions.cancel')
      router
        .post('/:id/pause', [controllers.subscriptions.PauseSubscription])
        .as('subscriptions.pause')
      router
        .post('/:id/reactivate', [controllers.subscriptions.ReactivateSubscription])
        .as('subscriptions.reactivate')
    })
    .prefix('/subscriptions')
    .use(middleware.auth())

  // School subscription route
  router
    .group(() => {
      router
        .get('/:schoolId/subscription', [controllers.subscriptions.GetSchoolSubscription])
        .as('schools.subscription')
    })
    .prefix('/schools')
    .use(middleware.auth())

  // School chain subscription route
  router
    .group(() => {
      router
        .get('/:schoolChainId/subscription', [controllers.subscriptions.GetChainSubscription])
        .as('school_chains.subscription')
    })
    .prefix('/school-chains')
    .use(middleware.auth())
}

export function registerSubscriptionInvoiceApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.subscriptionInvoices.ListSubscriptionInvoices])
        .as('subscription_invoices.index')
      router
        .post('/', [controllers.subscriptionInvoices.CreateSubscriptionInvoice])
        .as('subscription_invoices.store')
      router
        .get('/:id', [controllers.subscriptionInvoices.ShowSubscriptionInvoice])
        .as('subscription_invoices.show')
      router
        .put('/:id', [controllers.subscriptionInvoices.UpdateSubscriptionInvoice])
        .as('subscription_invoices.update')
      router
        .post('/:id/mark-paid', [controllers.subscriptionInvoices.MarkInvoicePaid])
        .as('subscription_invoices.mark_paid')
    })
    .prefix('/subscription-invoices')
    .use(middleware.auth())
}
