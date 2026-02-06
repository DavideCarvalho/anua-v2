import type { HttpContext } from '@adonisjs/core/http'
import StudentHasExtraClass from '#models/student_has_extra_class'
import StudentHasExtraClassAttendance from '#models/student_has_extra_class_attendance'
import ExtraClassAttendance from '#models/extra_class_attendance'

export default class GetExtraClassAttendanceSummaryController {
  async handle({ params, response }: HttpContext) {
    const extraClassId = params.id

    // Get all enrolled students
    const enrollments = await StudentHasExtraClass.query()
      .where('extraClassId', extraClassId)
      .whereNull('cancelledAt')
      .preload('student', (q) => q.preload('user'))

    // Get total attendance records for this class
    const totalAttendances = await ExtraClassAttendance.query()
      .where('extraClassId', extraClassId)
      .count('* as total')

    const totalClasses = Number(totalAttendances[0].$extras.total)

    // Get attendance stats per student
    const summary = []

    for (const enrollment of enrollments) {
      const studentAttendances = await StudentHasExtraClassAttendance.query()
        .where('studentId', enrollment.studentId)
        .whereHas('extraClassAttendance', (q) => {
          q.where('extraClassId', extraClassId)
        })

      const present = studentAttendances.filter((a) => a.status === 'PRESENT').length
      const absent = studentAttendances.filter((a) => a.status === 'ABSENT').length
      const late = studentAttendances.filter((a) => a.status === 'LATE').length
      const justified = studentAttendances.filter((a) => a.status === 'JUSTIFIED').length
      const total = studentAttendances.length
      const percentage = total > 0 ? Math.round(((present + late + justified) / total) * 100) : 0

      summary.push({
        studentId: enrollment.studentId,
        studentName: enrollment.student?.user?.name ?? '-',
        enrolledAt: enrollment.enrolledAt,
        totalClasses,
        present,
        absent,
        late,
        justified,
        attendancePercentage: percentage,
      })
    }

    return response.ok({ data: summary })
  }
}
