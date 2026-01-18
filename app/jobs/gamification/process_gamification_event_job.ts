import { Job } from '@boringnode/queue'
import { DateTime } from 'luxon'
import GamificationEvent from '#models/gamification_event'
import StudentGamification from '#models/student_gamification'
import Achievement from '#models/achievement'
import db from '@adonisjs/lucid/services/db'

interface ProcessEventPayload {
  eventId: string
}

export default class ProcessGamificationEventJob extends Job<ProcessEventPayload> {
  static readonly jobName = 'ProcessGamificationEventJob'

  static options = {
    queue: 'gamification',
    maxRetries: 3,
  }

  async execute(): Promise<void> {
    const { eventId } = this.payload
    const startTime = Date.now()

    console.log('[WORKER] Starting gamification event processing:', {
      eventId,
      timestamp: new Date().toISOString(),
    })

    try {
      // 1. Find the event
      const event = await GamificationEvent.query()
        .where('id', eventId)
        .preload('student', (query) => {
          query.preload('user')
        })
        .first()

      if (!event) {
        console.warn(`[WORKER] Event ${eventId} not found - skipping`)
        return
      }

      // Check if already processed
      if (event.status === 'PROCESSED') {
        console.log(`[WORKER] Event ${eventId} already processed, skipping`)
        return
      }

      // Update status to PROCESSING
      event.status = 'PROCESSING'
      await event.save()

      // 2. Get or create StudentGamification
      let studentGamification = await StudentGamification.query()
        .where('studentId', event.studentId)
        .first()

      if (!studentGamification) {
        studentGamification = await StudentGamification.create({
          studentId: event.studentId,
          points: 0,
          level: 1,
          experience: 0,
          streakDays: 0,
          totalAssignmentsCompleted: 0,
          totalExamsTaken: 0,
          averageGrade: 0,
          attendancePercentage: 0,
        })
      }

      // 3. Get student's school ID
      const studentWithClass = await db
        .from('students')
        .join('users', 'students.user_id', 'users.id')
        .where('students.id', event.studentId)
        .select('users.school_id as schoolId')
        .first()

      const schoolId = studentWithClass?.schoolId

      // 4. Find active achievements
      const achievementsQuery = Achievement.query()
        .where('isActive', true)

      if (schoolId) {
        achievementsQuery.where((builder) => {
          builder.whereNull('schoolId').orWhere('schoolId', schoolId)
        })
      } else {
        achievementsQuery.whereNull('schoolId')
      }

      const achievements = await achievementsQuery

      console.log('[WORKER] Found achievements:', {
        eventId,
        total: achievements.length,
      })

      let achievementsUnlocked = 0
      let pointsAwarded = 0

      // 5. Evaluate each achievement
      for (const achievement of achievements) {
        try {
          const criteria = achievement.criteria as { eventType?: string; conditions?: Record<string, unknown> }

          // Check if event type matches
          if (criteria.eventType !== event.eventType) {
            continue
          }

          // Check if already unlocked (for non-repeatable)
          if (!achievement.isRepeatable) {
            const alreadyUnlocked = await db
              .from('student_achievements')
              .where('student_gamification_id', studentGamification.id)
              .where('achievement_id', achievement.id)
              .first()

            if (alreadyUnlocked) {
              continue
            }
          }

          // 6. Unlock achievement
          await db.table('student_achievements').insert({
            id: crypto.randomUUID(),
            student_gamification_id: studentGamification.id,
            achievement_id: achievement.id,
            unlocked_at: DateTime.now().toSQL(),
            created_at: DateTime.now().toSQL(),
            updated_at: DateTime.now().toSQL(),
          })

          achievementsUnlocked++

          console.log('[WORKER] Achievement unlocked:', {
            eventId,
            achievementId: achievement.id,
            achievementName: achievement.name,
            points: achievement.pointsReward,
          })

          // 7. Award points
          if (achievement.pointsReward > 0) {
            const newTotalPoints = studentGamification.points + achievement.pointsReward
            const { level: newLevel, progress: newProgress } = this.calculateLevel(newTotalPoints)

            // Update streak
            const today = DateTime.now().startOf('day')
            const lastActivity = studentGamification.lastActivityDate
            let newStreakDays = studentGamification.streakDays

            if (lastActivity) {
              const lastActivityDay = lastActivity.startOf('day')
              const daysDiff = today.diff(lastActivityDay, 'days').days

              if (daysDiff === 1) {
                newStreakDays++
              } else if (daysDiff > 1) {
                newStreakDays = 1
              }
            } else {
              newStreakDays = 1
            }

            // Update StudentGamification
            studentGamification.points = newTotalPoints
            studentGamification.level = newLevel
            studentGamification.experience = newProgress
            studentGamification.streakDays = newStreakDays
            studentGamification.lastActivityDate = today
            await studentGamification.save()

            pointsAwarded += achievement.pointsReward
          }
        } catch (error) {
          console.error(`[WORKER] Error processing achievement ${achievement.id}:`, error)
        }
      }

      // 8. Mark event as processed
      event.status = 'PROCESSED'
      event.processedAt = DateTime.now()
      await event.save()

      const duration = Date.now() - startTime

      console.log('[WORKER] Processing completed:', {
        eventId,
        achievementsUnlocked,
        pointsAwarded,
        duration: `${duration}ms`,
      })
    } catch (error) {
      console.error('[WORKER] Processing error:', {
        eventId,
        error: error instanceof Error ? error.message : String(error),
      })

      // Mark event as failed
      await GamificationEvent.query()
        .where('id', eventId)
        .update({
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : String(error),
          retryCount: db.raw('retry_count + 1'),
        })

      throw error
    }
  }

  private calculateLevel(totalPoints: number): { level: number; progress: number } {
    let level = 1
    let pointsNeeded = 100
    let remainingPoints = totalPoints

    while (remainingPoints >= pointsNeeded) {
      remainingPoints -= pointsNeeded
      level++
      pointsNeeded = level * 100
    }

    const progress = Math.floor((remainingPoints / pointsNeeded) * 100)
    return { level, progress }
  }
}
