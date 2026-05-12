import { Job } from '@adonisjs/queue'
import AcademicSubPeriod from '#models/academic_sub_period'
import Assignment from '#models/assignment'
import Exam from '#models/exam'

interface ReconcileSubPeriodAssignmentsPayload {
  academicPeriodId: string
}

export default class ReconcileSubPeriodAssignmentsJob extends Job<ReconcileSubPeriodAssignmentsPayload> {
  static readonly jobName = 'ReconcileSubPeriodAssignmentsJob'

  static options = {
    queue: 'default',
    maxRetries: 3,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    const { academicPeriodId } = this.payload

    const subPeriods = await AcademicSubPeriod.query()
      .where('academicPeriodId', academicPeriodId)
      .whereNull('deletedAt')
      .orderBy('order', 'asc')

    if (subPeriods.length === 0) return

    for (const subPeriod of subPeriods) {
      const subStart = subPeriod.startDate.toISO()
      const subEnd = subPeriod.endDate.toISO()
      if (!subStart || !subEnd) continue

      await Assignment.query()
        .where('academicPeriodId', academicPeriodId)
        .where('dueDate', '>=', subStart)
        .where('dueDate', '<=', subEnd)
        .update({ subPeriodId: subPeriod.id })

      await Exam.query()
        .where('academicPeriodId', academicPeriodId)
        .where('examDate', '>=', subStart)
        .where('examDate', '<=', subEnd)
        .update({ subPeriodId: subPeriod.id })
    }
  }
}
