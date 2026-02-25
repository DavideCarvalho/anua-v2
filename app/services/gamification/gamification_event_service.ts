import GamificationEvent from '#models/gamification_event'
import ProcessGamificationEventJob from '#jobs/gamification/process_gamification_event_job'

export type GamificationEventType =
  | 'ASSIGNMENT_COMPLETED'
  | 'ATTENDANCE_MARKED'
  | 'ATTENDANCE_PRESENT'
  | 'ATTENDANCE_LATE'
  | 'GRADE_RECEIVED'
  | 'GRADE_EXCELLENT'
  | 'GRADE_GOOD'
  | 'STORE_PURCHASE'
  | 'POINTS_MANUAL_ADD'
  | 'POINTS_MANUAL_REMOVE'

export interface CreateEventInput {
  type: GamificationEventType
  entityType: string
  entityId: string
  studentId: string
  metadata?: Record<string, unknown>
}

export class GamificationEventService {
  async createEvent(input: CreateEventInput): Promise<string> {
    const event = await GamificationEvent.create({
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      studentId: input.studentId,
      metadata: input.metadata || {},
      processed: false,
    })

    // Enqueue for processing
    await ProcessGamificationEventJob.dispatch({ eventId: event.id })

    return event.id
  }

  async emitAssignmentCompleted(params: {
    assignmentId: string
    studentId: string
    grade?: number
    maxGrade?: number
    subjectId?: string
    subjectName?: string
  }): Promise<string> {
    return this.createEvent({
      type: 'ASSIGNMENT_COMPLETED',
      entityType: 'Assignment',
      entityId: params.assignmentId,
      studentId: params.studentId,
      metadata: {
        assignmentId: params.assignmentId,
        grade: params.grade,
        maxGrade: params.maxGrade,
        subjectId: params.subjectId,
        subjectName: params.subjectName,
        completedAt: new Date().toISOString(),
      },
    })
  }

  async emitAttendanceMarked(params: {
    attendanceId: string
    studentId: string
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'JUSTIFIED'
    date: string
    classId?: string
    className?: string
  }): Promise<string> {
    const eventType =
      params.status === 'PRESENT'
        ? 'ATTENDANCE_PRESENT'
        : params.status === 'LATE'
          ? 'ATTENDANCE_LATE'
          : 'ATTENDANCE_MARKED'

    return this.createEvent({
      type: eventType,
      entityType: 'Attendance',
      entityId: params.attendanceId,
      studentId: params.studentId,
      metadata: {
        attendanceId: params.attendanceId,
        date: params.date,
        status: params.status,
        classId: params.classId,
        className: params.className,
      },
    })
  }

  async emitGradeReceived(params: {
    gradeId: string
    studentId: string
    value: number
    maxValue: number
    subjectId?: string
    subjectName?: string
    evaluationName?: string
  }): Promise<string> {
    const percentage = (params.value / params.maxValue) * 10
    let eventType: GamificationEventType = 'GRADE_RECEIVED'

    if (percentage >= 9) {
      eventType = 'GRADE_EXCELLENT'
    } else if (percentage >= 7) {
      eventType = 'GRADE_GOOD'
    }

    return this.createEvent({
      type: eventType,
      entityType: 'Grade',
      entityId: params.gradeId,
      studentId: params.studentId,
      metadata: {
        gradeId: params.gradeId,
        value: params.value,
        maxValue: params.maxValue,
        subjectId: params.subjectId,
        subjectName: params.subjectName,
        evaluationName: params.evaluationName,
        date: new Date().toISOString(),
      },
    })
  }

  async emitStorePurchase(params: {
    orderId: string
    studentId: string
    orderNumber: string
    totalPrice: number
    totalPoints: number
    totalMoney: number
    items?: Array<{ name: string; quantity: number; pointsPaid: number }>
  }): Promise<string> {
    return this.createEvent({
      type: 'STORE_PURCHASE',
      entityType: 'StoreOrder',
      entityId: params.orderId,
      studentId: params.studentId,
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        totalPrice: params.totalPrice,
        totalPoints: params.totalPoints,
        totalMoney: params.totalMoney,
        items: params.items,
      },
    })
  }

  async emitManualPointsChange(params: {
    studentId: string
    points: number
    adminId: string
    adminName?: string
    reason: string
  }): Promise<string> {
    const eventType = params.points > 0 ? 'POINTS_MANUAL_ADD' : 'POINTS_MANUAL_REMOVE'

    return this.createEvent({
      type: eventType,
      entityType: 'Manual',
      entityId: `manual-${Date.now()}`,
      studentId: params.studentId,
      metadata: {
        adminId: params.adminId,
        adminName: params.adminName,
        reason: params.reason,
        points: params.points,
      },
    })
  }

  async retryEvent(eventId: string): Promise<void> {
    const event = await GamificationEvent.findOrFail(eventId)

    await event
      .merge({
        processed: false,
        processedAt: null,
        error: null,
      })
      .save()

    await ProcessGamificationEventJob.dispatch({ eventId: event.id })
  }
}

export const gamificationEventService = new GamificationEventService()
