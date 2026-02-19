import type { HttpContext } from '@adonisjs/core/http'
import StudentHasLevel from '#models/student_has_level'
import Level from '#models/level'
import StudentHasLevelDto from '#models/dto/student_has_level.dto'
import { updateEnrollmentValidator } from '#validators/student_enrollment'
import { getQueueManager } from '#services/queue_service'
import UpdateEnrollmentPaymentsJob from '#jobs/payments/update_enrollment_payments_job'
import db from '@adonisjs/lucid/services/db'
import IndividualDiscount from '#models/individual_discount'

export default class UpdateEnrollmentController {
  async handle(ctx: HttpContext) {
    const { params, request, response } = ctx
    const { id: studentId, enrollmentId } = params
    const payload = await request.validateUsing(updateEnrollmentValidator)

    const enrollment = await StudentHasLevel.query()
      .where('id', enrollmentId)
      .where('studentId', studentId)
      .preload('academicPeriod')
      .preload('contract')
      .preload('scholarship')
      .preload('level')
      .preload('class')
      .firstOrFail()

    const { individualDiscount, ...enrollmentPayload } = payload

    enrollment.merge(enrollmentPayload)

    // Se não tem contractId, pega do Level
    if (!enrollment.contractId && enrollment.levelId) {
      const level = await Level.find(enrollment.levelId)
      if (level?.contractId) {
        enrollment.contractId = level.contractId
      }
    }

    await enrollment.save()

    // Business rule: scholarship and individual discounts are mutually exclusive
    if (payload.scholarshipId) {
      await IndividualDiscount.query()
        .where('studentHasLevelId', enrollment.id)
        .where('isActive', true)
        .whereNull('deletedAt')
        .update({ isActive: false })
    }

    if (individualDiscount !== undefined) {
      const schoolId = enrollment.academicPeriod?.schoolId ?? ctx.auth.user?.schoolId
      if (!schoolId || !ctx.auth.user) {
        return response.badRequest({
          message: 'Não foi possível identificar a escola para aplicar o desconto individual',
        })
      }

      await IndividualDiscount.query()
        .where('studentHasLevelId', enrollment.id)
        .where('isActive', true)
        .whereNull('deletedAt')
        .update({ isActive: false })

      if (individualDiscount) {
        await IndividualDiscount.create({
          name: individualDiscount.name || 'Desconto personalizado',
          description: 'Configurado na edição de pagamento',
          discountType: individualDiscount.discountType,
          discountPercentage:
            individualDiscount.discountType === 'PERCENTAGE'
              ? (individualDiscount.discountPercentage ?? 0)
              : null,
          enrollmentDiscountPercentage: 0,
          discountValue:
            individualDiscount.discountType === 'FLAT'
              ? (individualDiscount.discountValue ?? 0)
              : null,
          enrollmentDiscountValue: null,
          isActive: true,
          schoolId,
          studentId: enrollment.studentId,
          studentHasLevelId: enrollment.id,
          createdById: ctx.auth.user!.id,
        })

        enrollment.scholarshipId = null
        await enrollment.save()
      }
    }

    // Dispara job para atualizar pagamentos
    const user = ctx.auth?.user
    try {
      await getQueueManager()
      console.log(`[UPDATE_ENROLLMENT] QueueManager ready, dispatching...`)

      const dispatcher = UpdateEnrollmentPaymentsJob.dispatch({
        enrollmentId: enrollment.id,
        triggeredBy: user ? { id: user.id, name: user.name ?? 'Unknown' } : null,
      })

      // Explicitly call run() instead of relying on thenable
      const result = await dispatcher.run()
      console.log(`[UPDATE_ENROLLMENT] Job dispatched with ID: ${result.jobId}`)

      // Verify with direct DB query
      const jobs = await db.from('queue_jobs').select('id', 'status').where('queue', 'payments')
      console.log(`[UPDATE_ENROLLMENT] Jobs in DB after dispatch: ${JSON.stringify(jobs)}`)
    } catch (error) {
      console.error('[UPDATE_ENROLLMENT] Failed to dispatch job:', error)
    }

    return response.ok(new StudentHasLevelDto(enrollment))
  }
}
