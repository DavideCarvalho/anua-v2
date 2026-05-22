import type { HttpContext } from '@adonisjs/core/http'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'
import StudentPayment from '#models/student_payment'
import Class_ from '#models/class'
import AppException from '#exceptions/app_exception'
import { computeAxesStatus } from '#services/enrollment_axes_service'

/**
 * Retorna os 4 eixos + dados básicos de uma matrícula específica pra um
 * responsável. Usado pela página `/responsavel/matricula/:id` (Wave 6).
 */
export default class GetEnrollmentAxesController {
  async handle({ params, effectiveUser, response }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const matricula = await StudentHasLevel.query()
      .where('id', params.matriculaId)
      .whereNull('deletedAt')
      .preload('student', (q) => q.preload('user'))
      .preload('level')
      .preload('academicPeriod')
      .preload('contract')
      .first()

    if (!matricula) {
      throw AppException.notFound('Matrícula não encontrada')
    }

    // Autoriza: responsável precisa estar vinculado a este aluno
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', matricula.studentId)
      .first()
    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver esta matrícula')
    }

    const axes = await computeAxesStatus(matricula.id)
    if (!axes) {
      throw AppException.notFound('Não foi possível calcular o status da matrícula')
    }

    // Pagamento da taxa de matrícula — pra renderizar inline na seção Pagamento
    const enrollmentPayment = matricula.enrollmentPaymentId
      ? await StudentPayment.find(matricula.enrollmentPaymentId)
      : null

    // Nome da turma alocada — pra renderizar inline na seção Alocação de turma
    const allocatedClass = matricula.classId ? await Class_.find(matricula.classId) : null

    // Prazo de matrícula: o usuário tem até essa data pra concluir tudo.
    // Fonte única — AcademicPeriod.enrollmentEndDate (mesma que get_school_enrollment_info usa).
    const enrollmentDeadline = matricula.academicPeriod?.enrollmentEndDate?.toISO() ?? null

    return response.ok({
      id: matricula.id,
      studentId: matricula.studentId,
      studentName: matricula.student?.user?.name ?? null,
      levelName: matricula.level?.name ?? null,
      academicPeriodName: matricula.academicPeriod?.name ?? null,
      academicPeriodSegment: matricula.academicPeriod?.segment ?? null,
      enrollmentDeadline,
      contract: matricula.contract
        ? {
            id: matricula.contract.id,
            name: matricula.contract.name,
            enrollmentValue: matricula.contract.enrollmentValue,
            enrollmentPaymentUntilDays: matricula.contract.enrollmentPaymentUntilDays,
          }
        : null,
      enrollmentPayment: enrollmentPayment
        ? {
            id: enrollmentPayment.id,
            amount: enrollmentPayment.amount,
            totalAmount: enrollmentPayment.totalAmount,
            status: enrollmentPayment.status,
            dueDate: enrollmentPayment.dueDate?.toISO() ?? null,
            paidAt: enrollmentPayment.paidAt?.toISO() ?? null,
            invoiceUrl: enrollmentPayment.invoiceUrl ?? null,
          }
        : null,
      allocatedClass: allocatedClass ? { id: allocatedClass.id, name: allocatedClass.name } : null,
      createdAt: matricula.createdAt.toISO(),
      axes,
    })
  }
}
