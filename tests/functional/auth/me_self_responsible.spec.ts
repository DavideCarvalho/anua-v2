import { test } from '@japa/runner'
import '@japa/api-client'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'

async function makeSelfResponsibleStudent(seed: string) {
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
  await Student.create({
    id: user.id,
    classId: null,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible: true,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })
  return user
}

test.group('GET me — campos de autorresponsável', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('retorna isSelfResponsible/studentId pro aluno autorresponsável', async ({
    client,
    assert,
  }) => {
    const user = await makeSelfResponsibleStudent('me-1')
    const response = await client.get('/api/v1/auth/me').loginAs(user)
    response.assertStatus(200)
    const body = response.body()
    assert.isTrue(body.isSelfResponsible)
    assert.equal(body.studentId, user.id)
    assert.isNull(body.segment)
  })
})
