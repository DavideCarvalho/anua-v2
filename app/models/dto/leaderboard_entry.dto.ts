import { BaseModelDto } from '@adocasts.com/dto/base'
import type LeaderboardEntry from '#models/leaderboard_entry'
import StudentDto from './student.dto.js'

export default class LeaderboardEntryDto extends BaseModelDto {
  declare id: string
  declare leaderboardId: string
  declare studentId: string
  declare score: number
  declare rank: number
  declare createdAt: Date
  declare updatedAt: Date
  declare student?: StudentDto

  constructor(leaderboardEntry?: LeaderboardEntry) {
    super()

    if (!leaderboardEntry) return

    this.id = leaderboardEntry.id
    this.leaderboardId = leaderboardEntry.leaderboardId
    this.studentId = leaderboardEntry.studentId
    this.score = leaderboardEntry.score
    this.rank = leaderboardEntry.rank
    this.createdAt = leaderboardEntry.createdAt.toJSDate()
    this.updatedAt = leaderboardEntry.updatedAt.toJSDate()
    this.student = leaderboardEntry.student ? new StudentDto(leaderboardEntry.student) : undefined
  }
}
