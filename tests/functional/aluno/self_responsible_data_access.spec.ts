import { test } from '@japa/runner'
import '@japa/api-client'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'
import { ensureSelfResponsibleLink } from '#services/self_responsible_link'

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
    enrollmentStatus: 'REGISTERED',
  })
  return { user, student }
}

test.group('Acesso do aluno autorresponsável aos próprios dados', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('com self-link, acessa os próprios dados (200)', async ({ client }) => {
    const { user, student } = await makeSelfResponsibleStudent('acc-self')
    await ensureSelfResponsibleLink(student)
    const response = await client
      .get(`/api/v1/responsavel/students/${student.id}/balance`)
      .loginAs(user)
    response.assertStatus(200)
  })

  test('não acessa dados de OUTRO aluno (403)', async ({ client }) => {
    const { user, student } = await makeSelfResponsibleStudent('acc-a')
    await ensureSelfResponsibleLink(student)
    const other = await makeSelfResponsibleStudent('acc-b')
    const response = await client
      .get(`/api/v1/responsavel/students/${other.student.id}/balance`)
      .loginAs(user)
    response.assertStatus(403)
  })
})
