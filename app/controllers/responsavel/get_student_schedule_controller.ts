import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'

export default class GetStudentScheduleController {
  async handle({ params, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId } = params

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', user.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.forbidden({
        message: 'Voce nao tem permissao para ver o horario deste aluno',
      })
    }

    // Get student's class info
    const studentInfo = await db.rawQuery(
      `
      SELECT
        s.id as student_id,
        s.class_id,
        c.name as class_name,
        c.calendar_id
      FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE s.id = :studentId
      `,
      { studentId }
    )

    if (studentInfo.rows.length === 0) {
      return response.notFound({ message: 'Aluno nao encontrado' })
    }

    const student = studentInfo.rows[0]

    // Get the weekly schedule
    const schedule = await db.rawQuery(
      `
      SELECT
        cs.id,
        cs.day_of_week,
        cs.name as slot_name,
        cs.start_time,
        cs.end_time,
        cs.order,
        cs.type,
        sub.id as subject_id,
        sub.name as subject_name,
        u.name as teacher_name
      FROM calendar_slots cs
      LEFT JOIN class_schedules csch ON csch.calendar_slot_id = cs.id AND csch.class_id = :classId
      LEFT JOIN subjects sub ON csch.subject_id = sub.id
      LEFT JOIN teachers t ON csch.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE cs.calendar_id = :calendarId
      ORDER BY
        CASE cs.day_of_week
          WHEN 'MONDAY' THEN 1
          WHEN 'TUESDAY' THEN 2
          WHEN 'WEDNESDAY' THEN 3
          WHEN 'THURSDAY' THEN 4
          WHEN 'FRIDAY' THEN 5
          WHEN 'SATURDAY' THEN 6
          WHEN 'SUNDAY' THEN 7
        END,
        cs.order,
        cs.start_time
      `,
      { classId: student.class_id, calendarId: student.calendar_id }
    )

    // Group schedule by day
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    const dayLabels: Record<string, string> = {
      MONDAY: 'Segunda-feira',
      TUESDAY: 'Terca-feira',
      WEDNESDAY: 'Quarta-feira',
      THURSDAY: 'Quinta-feira',
      FRIDAY: 'Sexta-feira',
      SATURDAY: 'Sabado',
      SUNDAY: 'Domingo',
    }

    const scheduleByDay = days.reduce(
      (acc, day) => {
        const daySchedule = schedule.rows
          .filter((row: any) => row.day_of_week === day)
          .map((row: any) => ({
            id: row.id,
            slotName: row.slot_name,
            startTime: row.start_time,
            endTime: row.end_time,
            type: row.type,
            subject: row.subject_id
              ? {
                  id: row.subject_id,
                  name: row.subject_name,
                }
              : null,
            teacherName: row.teacher_name,
          }))

        if (daySchedule.length > 0) {
          acc[day] = {
            label: dayLabels[day],
            slots: daySchedule,
          }
        }

        return acc
      },
      {} as Record<string, any>
    )

    // Get unique subjects for this student's class
    const subjects = await db.rawQuery(
      `
      SELECT DISTINCT
        sub.id,
        sub.name,
        u.name as teacher_name
      FROM class_schedules csch
      JOIN subjects sub ON csch.subject_id = sub.id
      LEFT JOIN teachers t ON csch.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE csch.class_id = :classId
      ORDER BY sub.name
      `,
      { classId: student.class_id }
    )

    return response.ok({
      className: student.class_name,
      scheduleByDay,
      subjects: subjects.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        teacherName: row.teacher_name,
      })),
    })
  }
}
