export interface AchievementCriteria {
  eventType?: string
  conditions?: Record<string, unknown>
  [key: string]: unknown
}

export interface EventContext {
  type: string
  metadata: Record<string, unknown>
  studentId: string
}

export class CriteriaEvaluator {
  async evaluate(event: EventContext, criteria: AchievementCriteria): Promise<boolean> {
    // Check if event type matches criteria type
    if (criteria.eventType && !this.matchesEventType(event.type, criteria.eventType)) {
      return false
    }

    // Check additional conditions from metadata
    if (criteria.conditions) {
      for (const [key, value] of Object.entries(criteria.conditions)) {
        if (event.metadata[key] !== value) {
          return false
        }
      }
    }

    return true
  }

  private matchesEventType(eventType: string, criteriaType: string): boolean {
    // Exact match
    if (eventType === criteriaType) return true

    // Pattern matching (e.g., "ATTENDANCE_*" matches "ATTENDANCE_PRESENT", "ATTENDANCE_LATE", etc.)
    if (criteriaType.endsWith('*')) {
      const prefix = criteriaType.slice(0, -1)
      return eventType.startsWith(prefix)
    }

    return false
  }

  async evaluateAttendanceCriteria(
    event: EventContext,
    criteria: AchievementCriteria
  ): Promise<boolean> {
    if (!event.type.startsWith('ATTENDANCE')) return false

    if (criteria.conditions?.status && event.metadata.status !== criteria.conditions.status) {
      return false
    }

    return true
  }

  async evaluateGradeCriteria(
    event: EventContext,
    criteria: AchievementCriteria
  ): Promise<boolean> {
    if (!event.type.startsWith('GRADE')) return false

    const value = event.metadata.value as number
    const maxValue = event.metadata.maxValue as number
    const percentage = (value / maxValue) * 10

    if (
      criteria.conditions?.minPercentage &&
      percentage < (criteria.conditions.minPercentage as number)
    ) {
      return false
    }

    if (
      criteria.conditions?.maxPercentage &&
      percentage > (criteria.conditions.maxPercentage as number)
    ) {
      return false
    }

    return true
  }
}

export const criteriaEvaluator = new CriteriaEvaluator()
