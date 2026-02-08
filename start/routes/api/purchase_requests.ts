import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Purchase Requests
const ListPurchaseRequestsController = () =>
  import('#controllers/purchase_requests/list_purchase_requests_controller')
const ShowPurchaseRequestController = () =>
  import('#controllers/purchase_requests/show_purchase_request_controller')
const CreatePurchaseRequestController = () =>
  import('#controllers/purchase_requests/create_purchase_request_controller')
const UpdatePurchaseRequestController = () =>
  import('#controllers/purchase_requests/update_purchase_request_controller')
const DeletePurchaseRequestController = () =>
  import('#controllers/purchase_requests/delete_purchase_request_controller')
const ApprovePurchaseRequestController = () =>
  import('#controllers/purchase_requests/approve_purchase_request_controller')
const RejectPurchaseRequestController = () =>
  import('#controllers/purchase_requests/reject_purchase_request_controller')
const MarkAsBoughtController = () =>
  import('#controllers/purchase_requests/mark_as_bought_controller')
const MarkAsArrivedController = () =>
  import('#controllers/purchase_requests/mark_as_arrived_controller')

export function registerPurchaseRequestApiRoutes() {
  router
    .group(() => {
      // CRUD
      router.get('/', [ListPurchaseRequestsController]).as('purchaseRequests.index')
      router.post('/', [CreatePurchaseRequestController]).as('purchaseRequests.store')
      router.get('/:id', [ShowPurchaseRequestController]).as('purchaseRequests.show')
      router.put('/:id', [UpdatePurchaseRequestController]).as('purchaseRequests.update')
      router.delete('/:id', [DeletePurchaseRequestController]).as('purchaseRequests.destroy')

      // Status actions
      router.post('/:id/approve', [ApprovePurchaseRequestController]).as('purchaseRequests.approve')
      router.post('/:id/reject', [RejectPurchaseRequestController]).as('purchaseRequests.reject')
      router.post('/:id/mark-bought', [MarkAsBoughtController]).as('purchaseRequests.markBought')
      router.post('/:id/mark-arrived', [MarkAsArrivedController]).as('purchaseRequests.markArrived')
    })
    .prefix('/purchase-requests')
    .use(middleware.auth())
}
