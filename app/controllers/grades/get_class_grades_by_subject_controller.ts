import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'
import TeacherHasClass from '#models/teacher_has_class'
import StudentHasAssignment from '#models/student_has_assignment'
import { getStudents } from '#services/class_students_service'

interface StudentGradeData {
  id: string
  name: string
  finalGrade: number
  gradedCount: number
  totalCount: number
  maxPossibleGrade: number
  grades: {
    assignment: {
      id: string
      name: string
      maxGrade: number
    }
    grade: number | null
  }[]
}

export default class GetClassGradesBySubjectController {
  async handle({ params, request, response }: HttpContext) {
    const classId = params.classId
    const subjectId = params.subjectId
    const courseId = request.input('courseId')
    const academicPeriodId = request.input('academicPeriodId')

    if (!courseId || !academicPeriodId) {
      return response.badRequest({ message: 'courseId e academicPeriodId são obrigatórios' })
    }

    // Get the school's calculation algorithm
    const teacherHasClass = await TeacherHasClass.query()
      .where('classId', classId)
      .where('subjectId', subjectId)
      .preload('class', (q) => q.preload('school'))
      .first()

    if (!teacherHasClass) {
      return response.notFound({ message: 'Matéria não encontrada para esta turma' })
    }

    const school = teacherHasClass.class?.school
    const calculationAlgorithm = school?.calculationAlgorithm ?? 'AVERAGE'

    // Get all assignments for this subject in this class
    const assignments = await Assignment.query()
      .whereHas('teacherHasClass', (q) => {
        q.where('classId', classId).where('subjectId', subjectId)
      })
      .orderBy('createdAt', 'asc')

    // Get students in this class using StudentHasLevel with course+period context
    const studentsInClass = await getStudents({ classId, courseId, academicPeriodId })
    const students = studentsInClass.map((s) => ({
      id: s.studentId,
      user: s.student.user,
    }))

    // Get all student submissions for these assignments
    const assignmentIds = assignments.map((a) => a.id)
    const studentIds = students.map((s) => s.id)

    const allSubmissions = assignmentIds.length > 0 && studentIds.length > 0
      ? await StudentHasAssignment.query()
          .whereIn('assignmentId', assignmentIds)
          .whereIn('studentId', studentIds)
      : []

    // Calculate max possible grade based on algorithm
    const maxPossibleGrade =
      calculationAlgorithm === 'SUM'
        ? assignments.reduce((sum, a) => sum + a.grade, 0)
        : assignments.length > 0
          ? assignments.reduce((sum, a) => sum + a.grade, 0) / assignments.length
          : 0

    // Build response data
    const data: StudentGradeData[] = students.map((student) => {
      // Get this student's submissions
      const studentSubmissions = allSubmissions.filter((s) => s.studentId === student.id)

      // Map all assignments with student's grades
      const studentGrades = assignments.map((assignment) => {
        const submission = studentSubmissions.find((s) => s.assignmentId === assignment.id)
        return {
          assignment: {
            id: assignment.id,
            name: assignment.name,
            maxGrade: assignment.grade,
          },
          grade: submission?.grade ?? null,
        }
      })

      // Calculate final grade
      const gradedAssignments = studentGrades.filter((g) => g.grade !== null)
      let finalGrade = 0

      if (gradedAssignments.length > 0) {
        if (calculationAlgorithm === 'SUM') {
          finalGrade = gradedAssignments.reduce((sum, g) => sum + (g.grade ?? 0), 0)
        } else {
          const sum = gradedAssignments.reduce((sum, g) => sum + (g.grade ?? 0), 0)
          finalGrade = sum / gradedAssignments.length
        }
      }

      return {
        id: student.id,
        name: student.user?.name ?? 'Nome não disponível',
        finalGrade: parseFloat(finalGrade.toFixed(1)),
        gradedCount: gradedAssignments.length,
        totalCount: assignments.length,
        maxPossibleGrade: parseFloat(maxPossibleGrade.toFixed(1)),
        grades: studentGrades,
      }
    })

    // Sort by name
    data.sort((a, b) => a.name.localeCompare(b.name))

    return response.ok({ data })
  }
}
