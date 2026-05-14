import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { personaFromRole } from '#ai/chat_role'
import { computeChatScope } from '#ai/chat_scope'
import { resolveNamesValidator } from '#validators/ai'

/**
 * Resolve UUIDs em nomes legíveis pra exibir nos cards de aprovação de
 * action tools. Sem isso, o AiActionApprovalCard só mostra "Nota: 7,5"
 * solta — o usuário precisa confiar no texto que a IA escreveu antes,
 * o que é frágil.
 *
 * Autorização: cada kind filtra pelo scope do usuário (mesma lógica do
 * computeChatScope que rege as tools). Um responsável não consegue
 * resolver studentId de um aluno que não é filho dele, professor não
 * resolve exam de turma que não dá aula, etc. IDs fora do scope
 * simplesmente não aparecem no resultado — não dá pra distinguir entre
 * "não existe" e "você não tem acesso".
 */

type ResolvedStudent = { id: string; name: string }
type ResolvedExam = { id: string; name: string; subjectName: string | null }
type ResolvedClass = { id: string; name: string; levelName: string | null }

type ResolveResponse = {
  students: Record<string, ResolvedStudent>
  exams: Record<string, ResolvedExam>
  classes: Record<string, ResolvedClass>
}

const EMPTY: ResolveResponse = { students: {}, exams: {}, classes: {} }

export default class ResolveNamesController {
  async handle({ request, response, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user!
    const schoolId = user.schoolId
    if (!schoolId) return response.ok(EMPTY)

    if (!user.$preloaded.role) await user.load('role')
    const role = personaFromRole(user.role?.name)
    if (!role) return response.ok(EMPTY)

    const {
      studentIds = [],
      examIds = [],
      classIds = [],
    } = await request.validateUsing(resolveNamesValidator)

    if (studentIds.length === 0 && examIds.length === 0 && classIds.length === 0) {
      return response.ok(EMPTY)
    }

    const scope = await computeChatScope({ role, userId: user.id, schoolId })

    const [students, exams, classes] = await Promise.all([
      this.resolveStudents(studentIds, scope.role, scope, schoolId, user.id),
      this.resolveExams(examIds, scope.role, scope, schoolId, user.id),
      this.resolveClasses(classIds, scope.role, scope, schoolId, user.id),
    ])

    return response.ok({ students, exams, classes })
  }

  private async resolveStudents(
    ids: string[],
    role: string,
    scope: { studentIds: string[] },
    schoolId: string,
    _userId: string
  ): Promise<Record<string, ResolvedStudent>> {
    if (ids.length === 0) return {}

    // Pra gestor: qualquer aluno da escola. Pros outros papéis: só os do
    // scope pré-computado (que já considera responsavel/coord/professor).
    type Row = { id: string; name: string }
    let rows: Row[] = []
    if (role === 'gestor') {
      const { rows: r } = await db.rawQuery<{ rows: Row[] }>(
        `
          SELECT s.id, u.name
          FROM "Student" s
          JOIN "User" u ON u.id = s.id
          WHERE s.id = ANY(:ids)
            AND u."schoolId" = :schoolId
            AND u."deletedAt" IS NULL
        `,
        { ids, schoolId }
      )
      rows = r
    } else {
      const allowed = ids.filter((id) => scope.studentIds.includes(id))
      if (allowed.length === 0) return {}
      const { rows: r } = await db.rawQuery<{ rows: Row[] }>(
        `
          SELECT s.id, u.name
          FROM "Student" s
          JOIN "User" u ON u.id = s.id
          WHERE s.id = ANY(:ids)
            AND u."deletedAt" IS NULL
        `,
        { ids: allowed }
      )
      rows = r
    }

    return Object.fromEntries(rows.map((r) => [r.id, { id: r.id, name: r.name }]))
  }

  private async resolveExams(
    ids: string[],
    role: string,
    scope: { classIds: string[] },
    schoolId: string,
    _userId: string
  ): Promise<Record<string, ResolvedExam>> {
    if (ids.length === 0) return {}

    type Row = { id: string; name: string; subjectName: string | null; classId: string }
    const { rows } = await db.rawQuery<{ rows: Row[] }>(
      `
        SELECT e.id,
               e.name,
               sub.name AS "subjectName",
               thc."classId" AS "classId"
        FROM "Exam" e
        JOIN "TeacherHasClass" thc ON thc.id = e."teacherHasClassId"
        LEFT JOIN "Subject" sub ON sub.id = thc."subjectId"
        JOIN "Class" c ON c.id = thc."classId"
        WHERE e.id = ANY(:ids)
          AND c."schoolId" = :schoolId
      `,
      { ids, schoolId }
    )

    // Gestor vê todos da escola; resto filtra por classIds do scope.
    const allowed =
      role === 'gestor' ? rows : rows.filter((r) => scope.classIds.includes(r.classId))

    return Object.fromEntries(
      allowed.map((r) => [r.id, { id: r.id, name: r.name, subjectName: r.subjectName }])
    )
  }

  private async resolveClasses(
    ids: string[],
    role: string,
    scope: { classIds: string[] },
    schoolId: string,
    _userId: string
  ): Promise<Record<string, ResolvedClass>> {
    if (ids.length === 0) return {}

    type Row = { id: string; name: string; levelName: string | null }
    const { rows } = await db.rawQuery<{ rows: Row[] }>(
      `
        SELECT c.id, c.name, l.name AS "levelName"
        FROM "Class" c
        LEFT JOIN "Level" l ON l.id = c."levelId"
        WHERE c.id = ANY(:ids)
          AND c."schoolId" = :schoolId
      `,
      { ids, schoolId }
    )

    const allowed = role === 'gestor' ? rows : rows.filter((r) => scope.classIds.includes(r.id))

    return Object.fromEntries(allowed.map((r) => [r.id, r]))
  }
}
