import logger from '@adonisjs/core/services/logger'
import StudentHasLevel from '#models/student_has_level'
import GenerateStudentPaymentsJob from '#jobs/payments/generate_student_payments_job'
import { getQueueManager } from '#services/queue_service'

/**
 * Job agendado para gerar pagamentos faltantes.
 * Executa diariamente e verifica se há alunos matriculados em períodos ativos
 * que ainda não têm pagamentos gerados.
 */
export default class GenerateMissingPayments {
  static async handle() {
    const startTime = Date.now()
    logger.info('[SCHEDULER] Starting missing payments generation')

    try {

      // Find all StudentHasLevel records in active academic periods
      // that have contracts but no payments (only active enrollments)
      const studentLevelsWithoutPayments = await StudentHasLevel.query()
        .whereNull('deletedAt')
        .whereNotNull('contractId')
        .whereHas('academicPeriod', (periodQuery) => {
          periodQuery.where('isActive', true).whereNull('deletedAt')
        })
        .whereDoesntHave('studentPayments', (paymentQuery) => {
          paymentQuery.whereIn('type', ['TUITION', 'COURSE', 'ENROLLMENT'])
        })
        .preload('student', (query) => {
          query.preload('user')
        })

      logger.info(
        `[SCHEDULER] Found ${studentLevelsWithoutPayments.length} students without payments`
      )

      if (studentLevelsWithoutPayments.length === 0) {
        logger.info('[SCHEDULER] No missing payments to generate')
        return
      }

      const queueManager = await getQueueManager()
      let dispatched = 0
      let errors = 0

      for (const studentLevel of studentLevelsWithoutPayments) {
        try {
          await queueManager.dispatch(GenerateStudentPaymentsJob, {
            studentHasLevelId: studentLevel.id,
          })
          dispatched++

          logger.info('[SCHEDULER] Dispatched payment generation:', {
            studentHasLevelId: studentLevel.id,
            studentName: studentLevel.student?.user?.name,
          })
        } catch (error) {
          errors++
          logger.error('[SCHEDULER] Error dispatching job:', {
            studentHasLevelId: studentLevel.id,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }

      const duration = Date.now() - startTime
      logger.info('[SCHEDULER] Missing payments generation completed:', {
        dispatched,
        errors,
        duration: `${duration}ms`,
      })
    } catch (error) {
      logger.error('[SCHEDULER] Error in missing payments generation:', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}
