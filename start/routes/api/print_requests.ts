import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

export function registerPrintRequestApiRoutes() {
  const ListPrintRequestsController = () =>
    import('#controllers/print_requests/list_print_requests_controller')
  const CreatePrintRequestController = () =>
    import('#controllers/print_requests/create_print_request_controller')
  const ShowPrintRequestController = () =>
    import('#controllers/print_requests/show_print_request_controller')
  const ApprovePrintRequestController = () =>
    import('#controllers/print_requests/approve_print_request_controller')
  const RejectPrintRequestController = () =>
    import('#controllers/print_requests/reject_print_request_controller')
  const ReviewPrintRequestController = () =>
    import('#controllers/print_requests/review_print_request_controller')
  const MarkPrintRequestPrintedController = () =>
    import('#controllers/print_requests/mark_print_request_printed_controller')

  router
    .group(() => {
      router.get('/', [ListPrintRequestsController]).as('printRequests.listPrintRequests')
      router.post('/', [CreatePrintRequestController]).as('printRequests.createPrintRequest')
      router.get('/:id', [ShowPrintRequestController]).as('printRequests.showPrintRequest')
      router
        .patch('/:id/approve', [ApprovePrintRequestController])
        .as('printRequests.approvePrintRequest')
      router
        .patch('/:id/reject', [RejectPrintRequestController])
        .as('printRequests.rejectPrintRequest')
      router
        .patch('/:id/review', [ReviewPrintRequestController])
        .as('printRequests.reviewPrintRequest')
      router
        .patch('/:id/printed', [MarkPrintRequestPrintedController])
        .as('printRequests.markPrintRequestPrinted')
    })
    .prefix('/print-requests')
    .use(middleware.auth())
}
