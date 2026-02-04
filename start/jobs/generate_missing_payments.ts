import logger from '@adonisjs/core/services/logger'
import StudentHasLevel from '#models/student_has_level'
import GenerateStudentPaymentsJob from '#jobs/payments/generate_student_payments_job'

interface GenerateMissingPaymentsOptions {
  schoolId?: string
  inline?: boolean
}

/**
 * Job agendado para gerar pagamentos faltantes.
 * Executa diariamente e verifica se há alunos matriculados em períodos ativos
 * que ainda não têm pagamentos gerados.
 * Aceita schoolId opcional para filtrar por escola.
 * Aceita inline para executar direto sem despachar na fila.
 */
export default class GenerateMissingPayments {
  static async handle(options: GenerateMissingPaymentsOptions = {}) {
    const startTime = Date.now()
    const { schoolId, inline = false } = options

    logger.info('[SCHEDULER] Starting missing payments generation', {
      schoolId: schoolId ?? 'all',
      inline,
    })

    try {
      const query = StudentHasLevel.query()
        .whereNull('deletedAt')
        .whereNotNull('contractId')
        .whereHas('academicPeriod', (periodQuery) => {
          periodQuery.where('isActive', true).whereNull('deletedAt')
        })
        .whereDoesntHave('studentPayments', (paymentQuery) => {
          paymentQuery.whereIn('type', ['TUITION', 'COURSE', 'ENROLLMENT'])
        })
        .preload('student', (q) => {
          q.preload('user')
        })

      if (schoolId) {
        query.whereHas('level', (levelQuery) => {
          levelQuery.where('schoolId', schoolId)
        })
      }

      const studentLevelsWithoutPayments = await query

      logger.info(
        `[SCHEDULER] Found ${studentLevelsWithoutPayments.length} students without payments`
      )

      if (studentLevelsWithoutPayments.length === 0) {
        logger.info('[SCHEDULER] No missing payments to generate')
        return { total: 0, dispatched: 0, errors: 0 }
      }

      let dispatched = 0
      let errors = 0

      if (inline) {
        for (const studentLevel of studentLevelsWithoutPayments) {
          try {
            const job = new GenerateStudentPaymentsJob({ studentHasLevelId: studentLevel.id })
            await job.execute()
            dispatched++

            logger.info('[SCHEDULER] Generated payments inline:', {
              studentHasLevelId: studentLevel.id,
              studentName: studentLevel.student?.user?.name,
            })
          } catch (error) {
            errors++
            logger.error('[SCHEDULER] Error generating payments:', {
              studentHasLevelId: studentLevel.id,
              error: error instanceof Error ? error.message : String(error),
            })
          }
        }
      } else {
        for (const studentLevel of studentLevelsWithoutPayments) {
          try {
            await GenerateStudentPaymentsJob.dispatch({
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
      }

      const duration = Date.now() - startTime
      logger.info('[SCHEDULER] Missing payments generation completed:', {
        dispatched,
        errors,
        duration: `${duration}ms`,
      })

      return { total: studentLevelsWithoutPayments.length, dispatched, errors }
    } catch (error) {
      logger.error('[SCHEDULER] Error in missing payments generation:', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}
