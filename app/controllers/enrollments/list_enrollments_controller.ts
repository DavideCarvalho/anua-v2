import type { HttpContext } from '@adonisjs/core/http'
import StudentHasLevel from '#models/student_has_level'
import { listEnrollmentsValidator } from '#validators/enrollment'

export default class ListEnrollmentsController {
  async handle({ request, response }: HttpContext) {
    const {
      schoolId,
      academicPeriodId,
      status,
      levelId,
      page = 1,
      limit = 20,
    } = await request.validateUsing(listEnrollmentsValidator)

    const query = StudentHasLevel.query()
      .preload('student', (studentQuery) => {
        studentQuery.preload('user').preload('documents', (docQuery) => {
          docQuery.preload('contractDocument')
        })
      })
      .preload('level')
      .preload('academicPeriod')
      .preload('scholarship')
      .whereHas('student', (studentQuery) => {
        studentQuery.whereHas('user', (userQuery) => {
          userQuery.whereHas('userHasSchools', (schoolQuery) => {
            schoolQuery.where('schoolId', schoolId)
          })
        })
        if (status) {
          studentQuery.where('enrollmentStatus', status)
        }
      })
      .orderBy('createdAt', 'desc')

    if (academicPeriodId) {
      query.where('academicPeriodId', academicPeriodId)
    }

    if (levelId) {
      query.where('levelId', levelId)
    }

    const enrollments = await query.paginate(page, limit)

    const formattedEnrollments = enrollments.all().map((enrollment) => ({
      id: enrollment.id,
      studentId: enrollment.studentId,
      student: {
        id: enrollment.student.id,
        name: enrollment.student.user.name,
        email: enrollment.student.user.email,
        enrollmentStatus: enrollment.student.enrollmentStatus,
        documents: enrollment.student.documents.map((doc) => ({
          id: doc.id,
          fileName: doc.fileName,
          status: doc.status,
          rejectionReason: doc.rejectionReason,
          contractDocument: doc.contractDocument
            ? {
                id: doc.contractDocument.id,
                name: doc.contractDocument.name,
              }
            : null,
        })),
      },
      level: enrollment.level
        ? {
            id: enrollment.level.id,
            name: enrollment.level.name,
          }
        : null,
      academicPeriod: enrollment.academicPeriod
        ? {
            id: enrollment.academicPeriod.id,
            name: enrollment.academicPeriod.name,
          }
        : null,
      scholarship: enrollment.scholarship
        ? {
            id: enrollment.scholarship.id,
            name: enrollment.scholarship.name,
            discountPercentage: enrollment.scholarship.discountPercentage,
          }
        : null,
      paymentMethod: enrollment.paymentMethod,
      docusealSignatureStatus: enrollment.docusealSignatureStatus,
      createdAt: enrollment.createdAt.toISO(),
    }))

    return response.ok({
      data: formattedEnrollments,
      meta: {
        total: enrollments.total,
        page: enrollments.currentPage,
        lastPage: enrollments.lastPage,
        perPage: enrollments.perPage,
      },
    })
  }
}
