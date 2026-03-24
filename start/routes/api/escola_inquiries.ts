import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ListInquiriesController = () => import('#controllers/escola/list_inquiries_controller')
const ShowInquiryController = () => import('#controllers/escola/show_inquiry_controller')
const CreateInquiryMessageController = () =>
  import('#controllers/escola/create_inquiry_message_controller')
const ResolveInquiryController = () => import('#controllers/escola/resolve_inquiry_controller')

export function registerEscolaInquiriesApiRoutes() {
  router
    .group(() => {
      router.get('/inquiries', [ListInquiriesController]).as('inquiries.list')
      router.get('/inquiries/:inquiryId', [ShowInquiryController]).as('inquiries.show')
      router
        .post('/inquiries/:inquiryId/messages', [CreateInquiryMessageController])
        .as('inquiries.messages.create')
      router
        .post('/inquiries/:inquiryId/resolve', [ResolveInquiryController])
        .as('inquiries.resolve')
    })
    .prefix('/escola')
    .use([middleware.auth(), middleware.impersonation(), middleware.requireSchool()])
    .as('escola.inquiries')
}
