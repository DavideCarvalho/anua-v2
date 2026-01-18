import type { HttpContext } from '@adonisjs/core/http'
import Leaderboard, { type LeaderboardMetricType, type LeaderboardPeriodType } from '#models/leaderboard'
import { createLeaderboardValidator } from '#validators/gamification'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Map validator enum values to model enum values
const metricTypeMap: Record<string, LeaderboardMetricType> = {
  POINTS: 'POINTS',
  ACHIEVEMENTS: 'ASSIGNMENTS_COMPLETED',
  STREAK: 'STREAK_DAYS',
  CUSTOM: 'BEHAVIOR_SCORE',
}

const periodTypeMap: Record<string, LeaderboardPeriodType> = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  SEMESTER: 'ACADEMIC_PERIOD',
  ANNUAL: 'ACADEMIC_PERIOD',
  ALL_TIME: 'ALL_TIME',
}

export default class CreateLeaderboardController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createLeaderboardValidator)

    const slug = generateSlug(data.name)

    // Map validator fields to model fields
    const leaderboardData = {
      schoolId: data.schoolId,
      name: data.name,
      description: data.description,
      metricType: metricTypeMap[data.type] ?? 'POINTS',
      periodType: periodTypeMap[data.period] ?? 'ALL_TIME',
      isActive: data.isActive ?? true,
      // Map scope to appropriate relationships
      classId: data.scope === 'CLASS' ? data.scopeId : null,
      subjectId: data.scope === 'LEVEL' ? data.scopeId : null,
    }

    const leaderboard = await Leaderboard.create(leaderboardData)

    return response.created({ ...leaderboard.serialize(), slug })
  }
}
