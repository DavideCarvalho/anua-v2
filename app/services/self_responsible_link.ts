import { v7 as uuidv7 } from 'uuid'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'

/**
 * Garante que um aluno autorresponsável tenha uma linha StudentHasResponsible
 * apontando pra si mesmo (studentId === responsibleId), desbloqueando a checagem
 * IDOR dos controllers /responsavel. Idempotente. Retorna true se criou a linha.
 */
export async function ensureSelfResponsibleLink(
  student: Student,
  trx?: TransactionClientContract
): Promise<boolean> {
  if (!student.isSelfResponsible) return false

  const existing = await StudentHasResponsible.query({ client: trx })
    .where('studentId', student.id)
    .where('responsibleId', student.id)
    .first()
  if (existing) return false

  await StudentHasResponsible.create(
    {
      id: uuidv7(),
      studentId: student.id,
      responsibleId: student.id,
      isPedagogical: true,
      isFinancial: true,
    },
    { client: trx }
  )
  return true
}
