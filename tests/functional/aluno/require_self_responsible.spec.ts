import { test } from '@japa/runner'
import '@japa/api-client'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'

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
  return user
}

test.group('Rota adulta /aluno/financeiro exige autorresponsável', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('aluno comum é redirecionado pra /aluno', async ({ client }) => {
    const user = await makeStudent('guard-common', false)
    const response = await client.get('/aluno/financeiro').loginAs(user).redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/aluno')
  })

  test('autorresponsável acessa a página', async ({ client }) => {
    const user = await makeStudent('guard-self', true)
    const response = await client
      .get('/aluno/financeiro')
      .header('X-Inertia', 'true')
      .header('X-Inertia-Version', '1')
      .loginAs(user)
    response.assertStatus(200)
  })
})
