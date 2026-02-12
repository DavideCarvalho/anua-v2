import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import AcademicPeriod from '#models/academic_period'
import Course from '#models/course'
import Level from '#models/level'
import Contract from '#models/contract'
import ContractDocument from '#models/contract_document'
import AppException from '#exceptions/app_exception'

export default class GetSchoolEnrollmentInfoController {
  async handle({ params, response }: HttpContext) {
    const { schoolSlug, academicPeriodSlug, courseSlug } = params

    // Find school by slug
    const school = await School.query().where('slug', schoolSlug).first()

    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    // Find academic period by slug
    const academicPeriod = await AcademicPeriod.query()
      .where('slug', academicPeriodSlug)
      .where('schoolId', school.id)
      .first()

    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
    }

    // Check if enrollment is open
    const now = new Date()
    if (academicPeriod.enrollmentStartDate && academicPeriod.enrollmentStartDate.toJSDate() > now) {
      throw AppException.badRequest('Matrículas ainda não foram abertas para este período')
    }
    if (academicPeriod.enrollmentEndDate && academicPeriod.enrollmentEndDate.toJSDate() < now) {
      throw AppException.badRequest('Matrículas encerradas para este período')
    }

    // Find course by slug
    const course = await Course.query()
      .where('slug', courseSlug)
      .where('schoolId', school.id)
      .first()

    if (!course) {
      throw AppException.notFound('Curso não encontrado')
    }

    // Get initial level for this course in this academic period
    const levels = await Level.query().where('courseId', course.id).orderBy('order', 'asc')

    if (levels.length === 0) {
      throw AppException.badRequest('Nenhum nível disponível para este curso')
    }

    const initialLevel = levels[0]

    // Get contract for this level
    const contract = await Contract.query()
      .where('levelId', initialLevel.id)
      .where('academicPeriodId', academicPeriod.id)
      .first()

    // Get required documents
    const requiredDocuments = contract
      ? await ContractDocument.query().where('contractId', contract.id)
      : []

    return response.ok({
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        logoUrl: school.logoUrl,
      },
      academicPeriod: {
        id: academicPeriod.id,
        name: academicPeriod.name,
        slug: academicPeriod.slug,
        startDate: academicPeriod.startDate?.toISO(),
        endDate: academicPeriod.endDate?.toISO(),
      },
      course: {
        id: course.id,
        name: course.name,
      },
      level: {
        id: initialLevel.id,
        name: initialLevel.name,
      },
      contract: contract
        ? {
            id: contract.id,
            enrollmentValue: contract.enrollmentValue,
            amount: contract.ammount,
            paymentType: contract.paymentType,
            enrollmentValueInstallments: contract.enrollmentValueInstallments,
            installments: contract.installments,
          }
        : null,
      requiredDocuments: requiredDocuments.map((doc) => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        required: doc.required,
      })),
    })
  }
}
