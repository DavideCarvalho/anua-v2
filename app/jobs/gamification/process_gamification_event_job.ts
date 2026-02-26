import { Job } from '@boringnode/queue'
import { DateTime } from 'luxon'
import GamificationEvent from '#models/gamification_event'
import StudentGamification from '#models/student_gamification'
import Achievement from '#models/achievement'
import Student from '#models/student'
import db from '@adonisjs/lucid/services/db'

interface ProcessEventPayload {
  eventId: string
}

export default class ProcessGamificationEventJob extends Job<ProcessEventPayload> {
  static readonly jobName = 'ProcessGamificationEventJob'

  static options = {
    queue: 'gamification',
    maxRetries: 3,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    const { eventId } = this.payload
    const startTime = Date.now()

    console.log('[WORKER] Starting gamification event processing:', {
      eventId,
      timestamp: new Date().toISOString(),
    })

    try {
      const result = await db.transaction(async (trx) => {
        const event = await GamificationEvent.query({ client: trx })
          .where('id', eventId)
          .forUpdate()
          .first()

        if (!event) {
          console.warn(`[WORKER] Event ${eventId} not found - skipping`)
          return { achievementsUnlocked: 0, pointsAwarded: 0 }
        }

        if (event.processed) {
          console.log(`[WORKER] Event ${eventId} already processed, skipping`)
          return { achievementsUnlocked: 0, pointsAwarded: 0 }
        }

        let studentGamification = await StudentGamification.query({ client: trx })
          .where('studentId', event.studentId)
          .forUpdate()
          .first()

        if (!studentGamification) {
          studentGamification = await StudentGamification.create(
            {
              studentId: event.studentId,
              totalPoints: 0,
              currentLevel: 1,
              levelProgress: 0,
              streak: 0,
              longestStreak: 0,
            },
            { client: trx }
          )
        }

        const student = await Student.query({ client: trx })
          .where('id', event.studentId)
          .preload('user')
          .first()

        const schoolId = student?.user?.schoolId

        const achievementsQuery = Achievement.query({ client: trx }).where('isActive', true)

        if (schoolId) {
          achievementsQuery.where((builder) => {
            builder.whereNull('schoolId').orWhere('schoolId', schoolId)
          })
        } else {
          achievementsQuery.whereNull('schoolId')
        }

        const achievements = await achievementsQuery
        console.log('[WORKER] Found achievements:', { eventId, total: achievements.length })

        let achievementsUnlocked = 0
        let pointsAwarded = 0

        for (const achievement of achievements) {
          const criteria = achievement.criteria as {
            eventType?: string
            conditions?: Record<string, unknown>
          }

          if (criteria.eventType && criteria.eventType !== event.type) {
            continue
          }

          const alreadyUnlocked = await trx
            .from('StudentAchievement')
            .where('studentGamificationId', studentGamification.id)
            .where('achievementId', achievement.id)
            .first()

          if (alreadyUnlocked) {
            continue
          }

          if (achievement.maxUnlocks) {
            const maxUnlocksReached = await trx
              .from('StudentAchievement')
              .where('achievementId', achievement.id)
              .count('* as total')
              .first()

            if (Number(maxUnlocksReached?.total || 0) >= achievement.maxUnlocks) {
              continue
            }
          }

          await trx.table('StudentAchievement').insert({
            id: crypto.randomUUID(),
            studentGamificationId: studentGamification.id,
            achievementId: achievement.id,
            unlockedAt: DateTime.now().toSQL(),
            progress: 100,
          })

          achievementsUnlocked++

          if (achievement.points > 0) {
            const newTotalPoints = studentGamification.totalPoints + achievement.points
            const { level: newLevel, progress: newProgress } = this.calculateLevel(newTotalPoints)

            studentGamification.totalPoints = newTotalPoints
            studentGamification.currentLevel = newLevel
            studentGamification.levelProgress = newProgress
            studentGamification.useTransaction(trx)
            await studentGamification.save()

            await trx.table('PointTransaction').insert({
              id: crypto.randomUUID(),
              studentGamificationId: studentGamification.id,
              points: achievement.points,
              balanceAfter: newTotalPoints,
              type: 'EARNED',
              reason: `Achievement unlocked: ${achievement.name}`,
              relatedEntityType: 'Achievement',
              relatedEntityId: achievement.id,
              createdAt: DateTime.now().toSQL(),
            })

            pointsAwarded += achievement.points
          }
        }

        event.processed = true
        event.processedAt = DateTime.now()
        event.error = null
        event.useTransaction(trx)
        await event.save()

        return { achievementsUnlocked, pointsAwarded }
      })

      const duration = Date.now() - startTime
      console.log('[WORKER] Processing completed:', {
        eventId,
        achievementsUnlocked: result.achievementsUnlocked,
        pointsAwarded: result.pointsAwarded,
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
