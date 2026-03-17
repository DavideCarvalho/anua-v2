import { BaseTransformer } from '@adonisjs/core/transformers'
import type LeaderboardEntry from '#models/leaderboard_entry'
import StudentTransformer from '#transformers/student_transformer'

export default class LeaderboardEntryTransformer extends BaseTransformer<LeaderboardEntry> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'leaderboardId',
        'studentId',
        'score',
        'rank',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
    }
  }
}
