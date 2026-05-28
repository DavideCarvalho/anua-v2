import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import { ensureSelfResponsibleLink } from '#services/self_responsible_link'

async function createSelfResponsibleStudent(seed: string, isSelfResponsible: boolean) {
  const role = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })
  const user = await User.create({
    name: `Student ${seed}`,
    slug: `student-${seed}`,
    email: `student-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })
  return Student.create({
    id: user.id,
    classId: null,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })
}

test.group('ensureSelfResponsibleLink', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('cria self-link quando aluno é autorresponsável', async ({ assert }) => {
    const student = await createSelfResponsibleStudent('self-1', true)
    const created = await ensureSelfResponsibleLink(student)
    assert.isTrue(created)
    const link = await StudentHasResponsible.query()
      .where('studentId', student.id)
      .where('responsibleId', student.id)
      .first()
    assert.isNotNull(link)
    assert.isTrue(link!.isPedagogical)
    assert.isTrue(link!.isFinancial)
  })

  test('é idempotente — segunda chamada não duplica', async ({ assert }) => {
    const student = await createSelfResponsibleStudent('self-2', true)
    await ensureSelfResponsibleLink(student)
    const createdAgain = await ensureSelfResponsibleLink(student)
    assert.isFalse(createdAgain)
    const count = await StudentHasResponsible.query()
      .where('studentId', student.id)
      .where('responsibleId', student.id)
      .count('* as total')
    assert.equal(Number(count[0].$extras.total), 1)
  })

  test('não cria link quando aluno não é autorresponsável', async ({ assert }) => {
    const student = await createSelfResponsibleStudent('self-3', false)
    const created = await ensureSelfResponsibleLink(student)
    assert.isFalse(created)
    const link = await StudentHasResponsible.query()
      .where('studentId', student.id)
      .where('responsibleId', student.id)
      .first()
    assert.isNull(link)
  })
})
