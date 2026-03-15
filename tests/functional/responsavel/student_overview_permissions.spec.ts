import { test } from '@japa/runner'
import '@japa/api-client'
import db from '@adonisjs/lucid/services/db'

import Role from '#models/role'
import School from '#models/school'
import User from '#models/user'
import UserHasSchool from '#models/user_has_school'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'

async function createUserWithRole(roleName: string, seed: string) {
  const role = await Role.firstOrCreate({ name: roleName }, { name: roleName })

  return User.create({
    name: `${roleName} ${seed}`,
    slug: `${roleName.toLowerCase()}-${seed}`,
    email: `${roleName.toLowerCase()}-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })
}

async function createOverviewFixture(seed: string, isFinancial: boolean) {
  const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })

  const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-responsible`)
  const studentUser = await createUserWithRole('STUDENT', `${seed}-student`)

  await UserHasSchool.create({ userId: responsible.id, schoolId: school.id, isDefault: true })

  const student = await Student.create({
    id: studentUser.id,
    classId: null,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible: false,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })

  await StudentHasResponsible.create({
    studentId: student.id,
    responsibleId: responsible.id,
    isPedagogical: true,
    isFinancial,
  })

  return { responsible, student }
}

test.group('Responsável student overview permissions API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('does not return financial overview for non-financial responsible', async ({
    client,
    assert,
  }) => {
    const { responsible, student } = await createOverviewFixture(`${Date.now()}-no-fin`, false)

    const response = await client
      .get(`/api/v1/responsavel/students/${student.id}/overview`)
      .loginAs(responsible)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.permissions.financial, false)
    assert.isNull(body.financial)
  })

  test('returns financial overview for financial responsible', async ({ client, assert }) => {
    const { responsible, student } = await createOverviewFixture(`${Date.now()}-fin`, true)

    const response = await client
      .get(`/api/v1/responsavel/students/${student.id}/overview`)
      .loginAs(responsible)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.permissions.financial, true)
    assert.isObject(body.financial)
    assert.property(body.financial, 'recentPayments')
    assert.property(body.financial, 'totalPending')
  })
})
