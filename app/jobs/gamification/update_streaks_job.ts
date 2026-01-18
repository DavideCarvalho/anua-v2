import { Job } from '@boringnode/queue'
import { DateTime } from 'luxon'
import StudentGamification from '#models/student_gamification'

export default class UpdateStreaksJob extends Job<void> {
  static readonly jobName = 'UpdateStreaksJob'

  static options = {
    queue: 'gamification',
    maxRetries: 3,
  }

  async execute(): Promise<void> {
    const startTime = Date.now()

    console.log('[STREAKS] Starting streak update:', {
      timestamp: new Date().toISOString(),
    })

    let streaksReset = 0

    try {
      // Get all students with activity
      const students = await StudentGamification.query()
        .whereNotNull('lastActivityDate')
        .select(['id', 'studentId', 'streakDays', 'lastActivityDate'])

      const totalStudents = students.length

      console.log('[STREAKS] Students found:', { total: totalStudents })

      const today = DateTime.now().startOf('day')
      const yesterday = today.minus({ days: 1 })

      for (const student of students) {
        if (!student.lastActivityDate) continue

        const lastActivityDay = student.lastActivityDate.startOf('day')

        // If last activity was today or yesterday, keep streak
        if (lastActivityDay >= yesterday) {
          continue
        }

        // If last activity was before yesterday, reset streak
        if (lastActivityDay < yesterday) {
          student.streakDays = 0
          await student.save()

          streaksReset++

          console.log('[STREAKS] Resetting streak:', {
            studentId: student.studentId,
          })
        }
      }

      const duration = Date.now() - startTime

      console.log('[STREAKS] Update completed:', {
        totalStudents,
        streaksReset,
        duration: `${duration}ms`,
      })
    } catch (error) {
      console.error('[STREAKS] Update error:', {
        error: error instanceof Error ? error.message : String(error),
      })

      throw error
    }
  }
}
