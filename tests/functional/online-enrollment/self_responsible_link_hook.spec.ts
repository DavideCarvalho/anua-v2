import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import { ensureSelfResponsibleLink } from '#services/self_responsible_link'

test.group('Matrícula online — hook self-link', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('aluno autorresponsável criado na matrícula ganha self-link', async ({ assert }) => {
    const role = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })
    const user = await User.create({
      name: 'Aluno Técnico',
      slug: 'aluno-tecnico-hook',
      email: 'aluno-tecnico-hook@example.com',
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      roleId: role.id,
    })
    const student = await Student.create({
      id: user.id,
      classId: null,
      descountPercentage: 0,
      monthlyPaymentAmount: 0,
      isSelfResponsible: true,
      paymentDate: null,
      contractId: null,
      canteenLimit: null,
      balance: 0,
      enrollmentStatus: 'PENDING_DOCUMENT_REVIEW',
    })

    await ensureSelfResponsibleLink(student)

    const link = await StudentHasResponsible.query()
      .where('studentId', student.id)
      .where('responsibleId', student.id)
      .first()
    assert.isNotNull(link)
  })
})
