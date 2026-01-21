import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getGradeDistributionValidator } from '#validators/grades'

export default class GetGradeDistributionController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, schoolChainId, classId, subjectId } = await request.validateUsing(
      getGradeDistributionValidator
    )

    // Build filters
    let filters = ''
    const params: Record<string, string> = {}

    if (schoolId) {
      filters += ' AND s.id = :schoolId'
      params.schoolId = schoolId
    }
    if (schoolChainId) {
      filters += ' AND s."schoolChainId" = :schoolChainId'
      params.schoolChainId = schoolChainId
    }
    if (classId) {
      filters += ' AND c.id = :classId'
      params.classId = classId
    }
    if (subjectId) {
      filters += ' AND thc."subjectId" = :subjectId'
      params.subjectId = subjectId
    }

    // Get all graded submissions with percentages
    const gradesResult = await db.rawQuery(
      `
      SELECT
        CASE
          WHEN a.grade > 0
          THEN (sha.grade::float / a.grade::float) * 100
          ELSE 0
        END as percentage
      FROM "StudentHasAssignment" sha
      JOIN "Assignment" a ON sha."assignmentId" = a.id
      JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
      JOIN "Class" c ON thc."classId" = c.id
      JOIN "School" s ON c."schoolId" = s.id
      WHERE sha.grade IS NOT NULL
      ${filters}
      `,
      params
    )

    const percentages: number[] = gradesResult.rows.map((row: any) => Number(row.percentage))

    // Create distribution ranges
    const ranges = [
      { label: '0-20%', min: 0, max: 20, count: 0 },
      { label: '20-40%', min: 20, max: 40, count: 0 },
      { label: '40-60%', min: 40, max: 60, count: 0 },
      { label: '60-80%', min: 60, max: 80, count: 0 },
      { label: '80-100%', min: 80, max: 100, count: 0 },
    ]

    // Distribute grades into ranges
    percentages.forEach((percentage) => {
      for (const range of ranges) {
        if (percentage >= range.min && percentage < range.max) {
          range.count += 1
          break
        }
      }
      // Special case for exactly 100%
      if (percentage === 100) {
        ranges[ranges.length - 1]!.count += 1
      }
    })

    const total = percentages.length
    const distribution = ranges.map((range) => ({
      range: range.label,
      count: range.count,
      percentage: total > 0 ? Math.round((range.count / total) * 100 * 10) / 10 : 0,
    }))

    // Calculate statistics
    const average = total > 0 ? percentages.reduce((sum, p) => sum + p, 0) / total : 0
    const sortedPercentages = [...percentages].sort((a, b) => a - b)
    const median = total > 0 ? sortedPercentages[Math.floor(total / 2)] ?? 0 : 0

    // Calculate standard deviation
    const variance =
      total > 0
        ? percentages.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / total
        : 0
    const standardDeviation = Math.sqrt(variance)

    return response.ok({
      distribution,
      totalGrades: total,
      average: Math.round(average * 10) / 10,
      median: Math.round(median * 10) / 10,
      standardDeviation: Math.round(standardDeviation * 10) / 10,
      min: total > 0 ? Math.round(Math.min(...percentages) * 10) / 10 : 0,
      max: total > 0 ? Math.round(Math.max(...percentages) * 10) / 10 : 0,
    })
  }
}
