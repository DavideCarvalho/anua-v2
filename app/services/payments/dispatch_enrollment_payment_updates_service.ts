import StudentHasLevel from '#models/student_has_level'
import { getQueueManager } from '#services/queue_service'
import UpdateEnrollmentPaymentsJob from '#jobs/payments/update_enrollment_payments_job'

interface TriggeredByPayload {
  id: string
  name: string
}

interface DispatchEnrollmentPaymentUpdatesInput {
  academicPeriodId: string
  levelContracts: Map<string, string | null>
  triggeredBy?: TriggeredByPayload | null
}

export async function dispatchEnrollmentPaymentUpdatesForLevelContracts({
  academicPeriodId,
  levelContracts,
  triggeredBy,
}: DispatchEnrollmentPaymentUpdatesInput) {
  if (levelContracts.size === 0) {
    return
  }

  const levelIds = Array.from(levelContracts.keys())

  const enrollments = await StudentHasLevel.query()
    .where('academicPeriodId', academicPeriodId)
    .whereIn('levelId', levelIds)
    .whereNull('deletedAt')

  if (enrollments.length === 0) {
    return
  }

  const enrollmentIdsToUpdate: string[] = []

  for (const enrollment of enrollments) {
    if (!enrollment.levelId) {
      continue
    }

    const nextContractId = levelContracts.get(enrollment.levelId)
    if (nextContractId === undefined || enrollment.contractId === nextContractId) {
      continue
    }

    enrollment.contractId = nextContractId
    await enrollment.save()
    enrollmentIdsToUpdate.push(enrollment.id)
  }

  if (enrollmentIdsToUpdate.length === 0) {
    return
  }

  await getQueueManager()

  for (const enrollmentId of enrollmentIdsToUpdate) {
    await UpdateEnrollmentPaymentsJob.dispatch({
      enrollmentId,
      triggeredBy,
    })
  }
}
