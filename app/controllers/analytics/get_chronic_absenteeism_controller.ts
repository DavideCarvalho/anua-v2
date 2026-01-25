import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getChronicAbsenteeismValidator } from '#validators/analytics'

interface ChronicStudentRow {
  id: string
  name: string
  email: string
  school_name: string
  total_records: string
  absent_count: string
  absence_rate: string
}

export default class GetChronicAbsenteeismController {
  async handle({ request, response }: HttpContext) {
    const {
      schoolId,
      schoolChainId,
      threshold = 20,
    } = await request.validateUsing(getChronicAbsenteeismValidator)

    let schoolFilter = ''
    const params: Record<string, string | number> = { threshold }

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    } else if (schoolChainId) {
      schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
      params.schoolChainId = schoolChainId
    }

    const chronicStudentsResult = await db.rawQuery(
      `
      SELECT
        st.id,
        u.name,
        u.email,
        s.name as school_name,
        COUNT(*) as total_records,
        COUNT(CASE WHEN sha.status = 'ABSENT' THEN 1 END) as absent_count,
        ROUND(
          (COUNT(CASE WHEN sha.status = 'ABSENT' THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100,
          1
        ) as absence_rate
      FROM "Student" st
      JOIN "User" u ON st.id = u.id
      JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
      JOIN "School" s ON uhs."schoolId" = s.id
      LEFT JOIN "StudentHasAttendance" sha ON st.id = sha."studentId"
      WHERE st."enrollmentStatus" = 'REGISTERED'
      AND u."deletedAt" IS NULL
      ${schoolFilter}
      GROUP BY st.id, u.name, u.email, s.name
      HAVING (COUNT(CASE WHEN sha.status = 'ABSENT' THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100 >= :threshold
      ORDER BY absence_rate DESC
      LIMIT 50
      `,
      params
    )

    const students = (chronicStudentsResult.rows as ChronicStudentRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      schoolName: row.school_name,
      totalRecords: Number(row.total_records),
      absentCount: Number(row.absent_count),
      absenceRate: Number(row.absence_rate),
    }))

    return response.ok({
      threshold,
      totalChronicStudents: students.length,
      students,
    })
  }
}
