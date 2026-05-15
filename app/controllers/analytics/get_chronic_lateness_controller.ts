import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getChronicLatenessValidator } from '#validators/analytics'

interface ChronicLatenessStudentRow {
  id: string
  name: string
  email: string
  school_name: string
  total_records: string
  late_count: string
  lateness_rate: string
}

export default class GetChronicLatenessController {
  async handle({ request, response }: HttpContext) {
    const {
      schoolId,
      schoolChainId,
      threshold = 20,
    } = await request.validateUsing(getChronicLatenessValidator)

    let schoolFilter = ''
    const params: Record<string, string | number> = { threshold }

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    } else if (schoolChainId) {
      schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
      params.schoolChainId = schoolChainId
    }

    // Atrasos crônicos: aluno chegou, mas chega tarde com frequência.
    // Sintoma diferente de absenteísmo (que é não vir). Aqui o aluno tá
    // presente — só desorganizado, transporte ruim, problema em casa, etc.
    // Vale alerta porque atraso recorrente vira evasão se não tratar.
    const chronicLatenessResult = await db.rawQuery(
      `
      SELECT
        st.id,
        u.name,
        u.email,
        s.name as school_name,
        COUNT(*) as total_records,
        COUNT(CASE WHEN sha.status = 'LATE' THEN 1 END) as late_count,
        ROUND(
          (COUNT(CASE WHEN sha.status = 'LATE' THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100,
          1
        ) as lateness_rate
      FROM "Student" st
      JOIN "User" u ON st.id = u.id
      JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
      JOIN "School" s ON uhs."schoolId" = s.id
      LEFT JOIN "StudentHasAttendance" sha ON st.id = sha."studentId"
      WHERE st."enrollmentStatus" = 'REGISTERED'
      AND u."deletedAt" IS NULL
      ${schoolFilter}
      GROUP BY st.id, u.name, u.email, s.name
      HAVING (COUNT(CASE WHEN sha.status = 'LATE' THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100 >= :threshold
      ORDER BY lateness_rate DESC
      LIMIT 50
      `,
      params
    )

    const students = (chronicLatenessResult.rows as ChronicLatenessStudentRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      schoolName: row.school_name,
      totalRecords: Number(row.total_records),
      lateCount: Number(row.late_count),
      latenessRate: Number(row.lateness_rate),
    }))

    return response.ok({
      threshold,
      totalChronicLatenessStudents: students.length,
      students,
    })
  }
}
