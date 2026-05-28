import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import { backfillSelfResponsibleLinks } from '#commands/backfill_self_responsible_links'

async function makeStudent(seed: string, isSelfResponsible: boolean) {
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

test.group('backfill:self-responsible-links', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('cria links pros autorresponsáveis sem vínculo e ignora os demais', async ({ assert }) => {
    const selfA = await makeStudent('bf-a', true)
    const selfB = await makeStudent('bf-b', true)
    await makeStudent('bf-c', false)

    const stats = await backfillSelfResponsibleLinks()

    assert.equal(stats.processed, 2)
    assert.equal(stats.created, 2)
    for (const s of [selfA, selfB]) {
      const link = await StudentHasResponsible.query()
        .where('studentId', s.id)
        .where('responsibleId', s.id)
        .first()
      assert.isNotNull(link)
    }
  })

  test('é idempotente', async ({ assert }) => {
    await makeStudent('bf-idem', true)
    await backfillSelfResponsibleLinks()
    const stats = await backfillSelfResponsibleLinks()
    assert.equal(stats.processed, 1)
    assert.equal(stats.created, 0)
  })
})
