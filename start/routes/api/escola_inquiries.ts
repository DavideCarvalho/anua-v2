import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerEscolaInquiriesApiRoutes() {
  router
    .group(() => {
      router.get('/inquiries', [controllers.escola.ListInquiries]).as('inquiries.list')
      router.get('/inquiries/:inquiryId', [controllers.escola.ShowInquiry]).as('inquiries.show')
      router
        .post('/inquiries/:inquiryId/messages', [controllers.escola.CreateInquiryMessage])
        .as('inquiries.messages.create')
      router
        .post('/inquiries/:inquiryId/resolve', [controllers.escola.ResolveInquiry])
        .as('inquiries.resolve')
      router
        .post('/inquiries/:inquiryId/mark-read', [controllers.escola.MarkInquiryRead])
        .as('inquiries.mark-read')
    })
    .prefix('/escola')
    .use([middleware.auth(), middleware.impersonation(), middleware.requireSchool()])
    .as('escola.inquiries')
}
