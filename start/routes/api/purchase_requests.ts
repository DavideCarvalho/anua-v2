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
      router.get('/', [ListPurchaseRequestsController]).as('purchase_requests.index')
      router.post('/', [CreatePurchaseRequestController]).as('purchase_requests.store')
      router.get('/:id', [ShowPurchaseRequestController]).as('purchase_requests.show')
      router.put('/:id', [UpdatePurchaseRequestController]).as('purchase_requests.update')
      router.delete('/:id', [DeletePurchaseRequestController]).as('purchase_requests.destroy')

      // Status actions
      router
        .post('/:id/approve', [ApprovePurchaseRequestController])
        .as('purchase_requests.approve')
      router.post('/:id/reject', [RejectPurchaseRequestController]).as('purchase_requests.reject')
      router.post('/:id/mark-bought', [MarkAsBoughtController]).as('purchase_requests.mark_bought')
      router
        .post('/:id/mark-arrived', [MarkAsArrivedController])
        .as('purchase_requests.mark_arrived')
    })
    .prefix('/purchase-requests')
    .use(middleware.auth())
}
