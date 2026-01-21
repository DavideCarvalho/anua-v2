import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Leaderboard, { type LeaderboardType, type LeaderboardPeriod } from '#models/leaderboard'
import { createLeaderboardValidator } from '#validators/gamification'

// Map validator enum values to model enum values
const typeMap: Record<string, LeaderboardType> = {
  POINTS: 'POINTS',
  ACHIEVEMENTS: 'ASSIGNMENTS_COMPLETED',
  STREAK: 'STREAK_DAYS',
  CUSTOM: 'BEHAVIOR_SCORE',
}

const periodMap: Record<string, LeaderboardPeriod> = {
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

    // Map validator fields to model fields
    const leaderboardData = {
      schoolId: data.schoolId,
      name: data.name,
      type: typeMap[data.type] ?? ('POINTS' as LeaderboardType),
      period: periodMap[data.period] ?? ('ALL_TIME' as LeaderboardPeriod),
      isActive: data.isActive ?? true,
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ year: 1 }),
      // Map scope to appropriate relationships
      classId: data.scope === 'CLASS' ? data.scopeId : null,
      subjectId: data.scope === 'LEVEL' ? data.scopeId : null,
    }

    const leaderboard = await Leaderboard.create(leaderboardData)

    return response.created(leaderboard)
  }
}
