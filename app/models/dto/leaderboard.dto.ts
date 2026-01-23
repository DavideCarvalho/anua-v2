import { BaseModelDto } from '@adocasts.com/dto/base'
import type Leaderboard from '#models/leaderboard'
import type { LeaderboardType, LeaderboardPeriod } from '#models/leaderboard'
import type { DateTime } from 'luxon'

export default class LeaderboardDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare type: LeaderboardType
  declare period: LeaderboardPeriod
  declare startDate: DateTime
  declare endDate: DateTime
  declare schoolId: string | null
  declare classId: string | null
  declare subjectId: string | null
  declare isActive: boolean
  declare createdAt: DateTime

  constructor(leaderboard?: Leaderboard) {
    super()

    if (!leaderboard) return

    this.id = leaderboard.id
    this.name = leaderboard.name
    this.type = leaderboard.type
    this.period = leaderboard.period
    this.startDate = leaderboard.startDate
    this.endDate = leaderboard.endDate
    this.schoolId = leaderboard.schoolId
    this.classId = leaderboard.classId
    this.subjectId = leaderboard.subjectId
    this.isActive = leaderboard.isActive
    this.createdAt = leaderboard.createdAt
  }
}
