import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'
import { resolveSelfResponsibleContext } from '#services/self_responsible_context'

async function makeStudentUser(seed: string, isSelfResponsible: boolean) {
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
    isSelfResponsible,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })
  await user.load('role')
  return user
}

test.group('resolveSelfResponsibleContext', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('aluno autorresponsável → isSelfResponsible true + studentId', async ({ assert }) => {
    const user = await makeStudentUser('ctx-1', true)
    const ctx = await resolveSelfResponsibleContext(user)
    assert.isTrue(ctx.isSelfResponsible)
    assert.equal(ctx.studentId, user.id)
  })

  test('aluno comum → isSelfResponsible false', async ({ assert }) => {
    const user = await makeStudentUser('ctx-2', false)
    const ctx = await resolveSelfResponsibleContext(user)
    assert.isFalse(ctx.isSelfResponsible)
    assert.equal(ctx.studentId, user.id)
  })

  test('não-aluno → tudo nulo/false', async ({ assert }) => {
    const role = await Role.firstOrCreate(
      { name: 'STUDENT_RESPONSIBLE' },
      { name: 'STUDENT_RESPONSIBLE' }
    )
    const user = await User.create({
      name: 'Resp',
      slug: 'resp-ctx',
      email: 'resp-ctx@example.com',
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      roleId: role.id,
    })
    await user.load('role')
    const ctx = await resolveSelfResponsibleContext(user)
    assert.isFalse(ctx.isSelfResponsible)
    assert.isNull(ctx.studentId)
    assert.isNull(ctx.segment)
  })
})
