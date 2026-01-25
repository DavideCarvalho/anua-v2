import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import db from '@adonisjs/lucid/services/db'

interface SlotInput {
  teacherHasClassId: string | null
  classWeekDay: number
  startTime: string
  endTime: string
}

export default class SaveClassScheduleController {
  async handle({ params, request, response }: HttpContext) {
    const classId = params.classId
    const { academicPeriodId, slots } = request.body() as {
      academicPeriodId: string
      slots: SlotInput[]
    }

    if (!academicPeriodId) {
      return response.badRequest({ error: 'academicPeriodId is required' })
    }

    if (!slots || !Array.isArray(slots)) {
      return response.badRequest({ error: 'slots array is required' })
    }

    try {
      await db.transaction(async (trx) => {
        // Find or create calendar
        let calendar = await Calendar.query({ client: trx })
          .where('classId', classId)
          .where('academicPeriodId', academicPeriodId)
          .where('isActive', true)
          .where('isCanceled', false)
          .first()

        if (!calendar) {
          calendar = await Calendar.create(
            {
              id: randomUUID(),
              classId,
              academicPeriodId,
              name: 'Grade de Horários',
              isActive: true,
              isCanceled: false,
              isApproved: false,
            },
            { client: trx }
          )
        }

        // Delete existing slots
        await CalendarSlot.query({ client: trx }).where('calendarId', calendar.id).delete()

        // Create new slots
        for (const slot of slots) {
          await CalendarSlot.create(
            {
              id: randomUUID(),
              calendarId: calendar.id,
              teacherHasClassId: slot.teacherHasClassId,
              classWeekDay: slot.classWeekDay,
              startTime: slot.startTime,
              endTime: slot.endTime,
              minutes: calculateMinutes(slot.startTime, slot.endTime),
              isBreak: false,
            },
            { client: trx }
          )
        }
      })

      return response.ok({ success: true })
    } catch (error) {
      console.error('Error saving schedule:', error)
      return response.internalServerError({ error: 'Failed to save schedule' })
    }
  }
}

function calculateMinutes(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  return endH * 60 + endM - (startH * 60 + startM)
}
