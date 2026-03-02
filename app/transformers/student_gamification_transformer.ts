import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentGamification from '#models/student_gamification'
import StudentTransformer from '#transformers/student_transformer'

export default class StudentGamificationTransformer extends BaseTransformer<StudentGamification> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'totalPoints',
        'currentLevel',
        'levelProgress',
        'streak',
        'longestStreak',
        'lastActivityAt',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
    }
  }
}
