import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import StudentHasLevel from '#models/student_has_level'

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  SIGNED: 1,
  DECLINED: 2,
  EXPIRED: 3,
}

export default class GetSignatureStatsController {
  async handle({ params, response }: HttpContext) {
    const contract = await Contract.query()
      .where('id', params.contractId)
      .preload('studentHasLevels', (query) => {
        query.preload('student', (studentQuery) => studentQuery.preload('user'))
        query.preload('levelAssignedToCourseAcademicPeriod', (lapQuery) => {
          lapQuery.preload('level')
          lapQuery.preload('courseHasAcademicPeriod', (capQuery) => {
            capQuery.preload('course')
            capQuery.preload('academicPeriod')
          })
        })
      })
      .first()

    if (!contract) {
      return response.ok({
        total: 0,
        signed: 0,
        pending: 0,
        declined: 0,
        expired: 0,
        notConfigured: 0,
        students: [],
      })
    }

    const students = (contract.studentHasLevels || [])
      .filter((shl: StudentHasLevel) => !!shl.levelAssignedToCourseAcademicPeriod)
      .map((shl: StudentHasLevel) => {
        const levelAssignment = shl.levelAssignedToCourseAcademicPeriod
        const coursePeriod = levelAssignment?.courseHasAcademicPeriod

        return {
          id: shl.id,
          studentName: shl.student?.user?.name ?? 'Aluno',
          studentEmail: shl.student?.user?.email ?? '',
          courseName: coursePeriod?.course?.name ?? '-',
          levelName: levelAssignment?.level?.name ?? '-',
          academicPeriod: coursePeriod?.academicPeriod?.name ?? '-',
          signatureStatus: shl.docusealSignatureStatus ?? 'PENDING',
          signedAt: shl.documentSignedAt ? shl.documentSignedAt.toISODate() : null,
          submissionId: shl.docusealSubmissionId,
        }
      })

    const stats = {
      total: students.length,
      signed: students.filter((s) => s.signatureStatus === 'SIGNED').length,
      pending: students.filter((s) => s.signatureStatus === 'PENDING').length,
      declined: students.filter((s) => s.signatureStatus === 'DECLINED').length,
      expired: students.filter((s) => s.signatureStatus === 'EXPIRED').length,
      notConfigured: students.filter((s) => !s.submissionId).length,
    }

    const sortedStudents = [...students].sort((a, b) => {
      const aOrder = STATUS_ORDER[a.signatureStatus] ?? 4
      const bOrder = STATUS_ORDER[b.signatureStatus] ?? 4
      return aOrder - bOrder
    })

    return response.ok({
      ...stats,
      students: sortedStudents,
    })
  }
}
