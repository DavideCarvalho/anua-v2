import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerPrintRequestApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.printRequests.ListPrintRequests])
        .as('print_requests.list_print_requests')
      router
        .post('/', [controllers.printRequests.CreatePrintRequest])
        .as('print_requests.create_print_request')
      router
        .get('/:id', [controllers.printRequests.ShowPrintRequest])
        .as('print_requests.show_print_request')
      router
        .patch('/:id/approve', [controllers.printRequests.ApprovePrintRequest])
        .as('print_requests.approve_print_request')
      router
        .patch('/:id/reject', [controllers.printRequests.RejectPrintRequest])
        .as('print_requests.reject_print_request')
      router
        .patch('/:id/review', [controllers.printRequests.ReviewPrintRequest])
        .as('print_requests.review_print_request')
      router
        .patch('/:id/printed', [controllers.printRequests.MarkPrintRequestPrinted])
        .as('print_requests.mark_print_request_printed')
    })
    .prefix('/print-requests')
    .use(middleware.auth())
}
