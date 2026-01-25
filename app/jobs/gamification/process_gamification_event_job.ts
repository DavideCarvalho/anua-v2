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
      if (event.processed) {
        console.log(`[WORKER] Event ${eventId} already processed, skipping`)
        return
      }

      // 2. Get or create StudentGamification
      let studentGamification = await StudentGamification.query()
        .where('studentId', event.studentId)
        .first()

      if (!studentGamification) {
        studentGamification = await StudentGamification.create({
          studentId: event.studentId,
          totalPoints: 0,
          currentLevel: 1,
        })
      }

      // 3. Get student's school ID
      const studentWithClass = await db
        .from('"Student"')
        .join('"User"', '"Student".id', '"User".id')
        .where('"Student".id', event.studentId)
        .select('"User"."schoolId" as schoolId')
        .first()

      const schoolId = studentWithClass?.schoolId

      // 4. Find active achievements
      const achievementsQuery = Achievement.query().where('isActive', true)

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
          const criteria = achievement.criteria as {
            eventType?: string
            conditions?: Record<string, unknown>
          }

          // Check if event type matches
          if (criteria.eventType !== event.type) {
            continue
          }

          // Check if already unlocked (for ONCE recurrence period)
          if (achievement.recurrencePeriod === 'ONCE') {
            const alreadyUnlocked = await db
              .from('"StudentAchievement"')
              .where('studentGamificationId', studentGamification.id)
              .where('achievementId', achievement.id)
              .first()

            if (alreadyUnlocked) {
              continue
            }
          }

          // 6. Unlock achievement
          await db.table('"StudentAchievement"').insert({
            id: crypto.randomUUID(),
            studentGamificationId: studentGamification.id,
            achievementId: achievement.id,
            unlockedAt: DateTime.now().toSQL(),
            createdAt: DateTime.now().toSQL(),
            updatedAt: DateTime.now().toSQL(),
          })

          achievementsUnlocked++

          console.log('[WORKER] Achievement unlocked:', {
            eventId,
            achievementId: achievement.id,
            achievementName: achievement.name,
            points: achievement.points,
          })

          // 7. Award points
          if (achievement.points > 0) {
            const newTotalPoints = studentGamification.totalPoints + achievement.points
            const { level: newLevel } = this.calculateLevel(newTotalPoints)

            // Update StudentGamification
            studentGamification.totalPoints = newTotalPoints
            studentGamification.currentLevel = newLevel
            await studentGamification.save()

            pointsAwarded += achievement.points
          }
        } catch (error) {
          console.error(`[WORKER] Error processing achievement ${achievement.id}:`, error)
        }
      }

      // 8. Mark event as processed
      event.processed = true
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
          processed: false,
          error: error instanceof Error ? error.message : String(error),
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
