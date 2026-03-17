import { BaseTransformer } from '@adonisjs/core/transformers'
import type Leaderboard from '#models/leaderboard'
import SchoolTransformer from '#transformers/school_transformer'
import LeaderboardEntryTransformer from '#transformers/leaderboard_entry_transformer'

export default class LeaderboardTransformer extends BaseTransformer<Leaderboard> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'type',
        'period',
        'startDate',
        'endDate',
        'schoolId',
        'classId',
        'subjectId',
        'isActive',
        'createdAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      entries: LeaderboardEntryTransformer.transform(this.whenLoaded(this.resource.entries)),
    }
  }
}
