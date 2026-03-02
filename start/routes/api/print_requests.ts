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
      router.get('/', [ListPrintRequestsController]).as('print_requests.list_print_requests')
      router.post('/', [CreatePrintRequestController]).as('print_requests.create_print_request')
      router.get('/:id', [ShowPrintRequestController]).as('print_requests.show_print_request')
      router
        .patch('/:id/approve', [ApprovePrintRequestController])
        .as('print_requests.approve_print_request')
      router
        .patch('/:id/reject', [RejectPrintRequestController])
        .as('print_requests.reject_print_request')
      router
        .patch('/:id/review', [ReviewPrintRequestController])
        .as('print_requests.review_print_request')
      router
        .patch('/:id/printed', [MarkPrintRequestPrintedController])
        .as('print_requests.mark_print_request_printed')
    })
    .prefix('/print-requests')
    .use(middleware.auth())
}
