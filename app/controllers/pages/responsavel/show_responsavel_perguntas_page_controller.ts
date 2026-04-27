import type { HttpContext } from '@adonisjs/core/http'
import ParentInquiry from '#models/parent_inquiry'
import StudentHasResponsible from '#models/student_has_responsible'
import AppException from '#exceptions/app_exception'

export default class ShowResponsavelPerguntasPageController {
  async handle({ inertia, request, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const studentSlug = request.qs().aluno as string | undefined
    let latestInquiryId: string | null = null

    if (studentSlug) {
      const responsibleLink = await StudentHasResponsible.query()
        .where('responsibleId', user.id)
        .preload('student', (studentQuery) => {
          studentQuery.preload('user')
        })
        .whereHas('student', (studentQuery) => {
          studentQuery.whereHas('user', (userQuery) => {
            userQuery.where('slug', studentSlug)
          })
        })
        .first()

      if (responsibleLink) {
        const latestInquiry = await ParentInquiry.query()
          .where('studentId', responsibleLink.studentId)
          .where('createdByResponsibleId', user.id)
          .orderBy('updatedAt', 'desc')
          .first()

        if (latestInquiry) {
          latestInquiryId = latestInquiry.id
        } else {
          const schoolId = responsibleLink.student?.user?.schoolId

          if (schoolId) {
            const createdInquiry = await ParentInquiry.create({
              studentId: responsibleLink.studentId,
              createdByResponsibleId: user.id,
              schoolId,
              subject: 'Conversa',
              status: 'OPEN',
            })

            latestInquiryId = createdInquiry.id
          }
        }
      }
    } else {
      const latestInquiry = await ParentInquiry.query()
        .where('createdByResponsibleId', user.id)
        .orderBy('updatedAt', 'desc')
        .first()

      latestInquiryId = latestInquiry?.id ?? null
    }

    if (latestInquiryId) {
      return inertia.render('responsavel/chat', {
        inquiryId: latestInquiryId,
      })
    }

    return inertia.render('responsavel/perguntas', {})
  }
}
