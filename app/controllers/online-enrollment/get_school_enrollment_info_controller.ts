import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import AcademicPeriod from '#models/academic_period'
import Course from '#models/course'
import Level from '#models/level'
import Contract from '#models/contract'
import ContractDocument from '#models/contract_document'
import AppException from '#exceptions/app_exception'
import SchoolEnrollmentInfoTransformer from '#transformers/school_enrollment_info_transformer'
import { getSignedAssetUrl } from '#lib/storage'

export default class GetSchoolEnrollmentInfoController {
  async handle({ params, response, serialize }: HttpContext) {
    const { schoolSlug, academicPeriodSlug, courseSlug } = params

    const school = await School.query().where('slug', schoolSlug).first()
    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    const academicPeriod = await AcademicPeriod.query()
      .where('slug', academicPeriodSlug)
      .where('schoolId', school.id)
      .first()
    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
    }

    // Janela de matrícula precisa estar aberta — única fonte da verdade
    // pra "esse link ainda funciona ou já fechou"
    const now = new Date()
    if (academicPeriod.enrollmentStartDate && academicPeriod.enrollmentStartDate.toJSDate() > now) {
      throw AppException.badRequest('Matrículas ainda não foram abertas para este período')
    }
    if (academicPeriod.enrollmentEndDate && academicPeriod.enrollmentEndDate.toJSDate() < now) {
      throw AppException.badRequest('Matrículas encerradas para este período')
    }

    const course = await Course.query()
      .where('slug', courseSlug)
      .where('schoolId', school.id)
      .first()
    if (!course) {
      throw AppException.notFound('Curso não encontrado')
    }

    // Level pertence ao Course via CourseHasAcademicPeriod → LevelAssignedToCourseHasAcademicPeriod
    const levels = await Level.query()
      .whereHas('levelAssignments', (lq) => {
        lq.whereHas('courseHasAcademicPeriod', (cq) => {
          cq.where('courseId', course.id).where('academicPeriodId', academicPeriod.id)
        })
      })
      .orderBy('order', 'asc')
    if (levels.length === 0) {
      throw AppException.badRequest('Nenhum nível disponível para este curso')
    }
    const initialLevel = levels[0]

    // Contract pertence ao Level (Level.contractId), não ao academic period
    const contract = initialLevel.contractId
      ? await Contract.query().where('id', initialLevel.contractId).first()
      : null

    const requiredDocuments = contract
      ? await ContractDocument.query().where('contractId', contract.id)
      : []

    school.logoUrl = await getSignedAssetUrl(school.logoUrl)

    return response.ok(
      await serialize(
        SchoolEnrollmentInfoTransformer.transform({
          school,
          academicPeriod,
          course,
          level: initialLevel,
          contract,
          requiredDocuments,
        })
      )
    )
  }
}
