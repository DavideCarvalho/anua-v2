import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerPurchaseRequestApiRoutes() {
  router
    .group(() => {
      // CRUD
      router
        .get('/', [controllers.purchaseRequests.ListPurchaseRequests])
        .as('purchase_requests.index')
      router
        .post('/', [controllers.purchaseRequests.CreatePurchaseRequest])
        .as('purchase_requests.store')
      router
        .get('/:id', [controllers.purchaseRequests.ShowPurchaseRequest])
        .as('purchase_requests.show')
      router
        .put('/:id', [controllers.purchaseRequests.UpdatePurchaseRequest])
        .as('purchase_requests.update')
      router
        .delete('/:id', [controllers.purchaseRequests.DeletePurchaseRequest])
        .as('purchase_requests.destroy')

      // Status actions
      router
        .post('/:id/approve', [controllers.purchaseRequests.ApprovePurchaseRequest])
        .as('purchase_requests.approve')
      router
        .post('/:id/reject', [controllers.purchaseRequests.RejectPurchaseRequest])
        .as('purchase_requests.reject')
      router
        .post('/:id/mark-bought', [controllers.purchaseRequests.MarkAsBought])
        .as('purchase_requests.mark_bought')
      router
        .post('/:id/mark-arrived', [controllers.purchaseRequests.MarkAsArrived])
        .as('purchase_requests.mark_arrived')
    })
    .prefix('/purchase-requests')
    .use(middleware.auth())
}
