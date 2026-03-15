import { test } from '@japa/runner'
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

async function createResponsavelDashboardFixture(seed: string, isFinancial: boolean) {
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

  return { responsible }
}

test.group('Responsável dashboard tabs (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('hides finance tab for non-financial responsible', async ({ visit, browserContext }) => {
    const fixture = await createResponsavelDashboardFixture(`${Date.now()}-non-fin`, false)
    await browserContext.loginAs(fixture.responsible)

    const page = await visit('/responsavel')
    await page.assertPath('/responsavel')
    await page.assertExists('button:has-text("Pedagógico")')
    await page.assertNotExists('button:has-text("Financeiro")')
  })

  test('shows finance tab for financial responsible', async ({ visit, browserContext }) => {
    const fixture = await createResponsavelDashboardFixture(`${Date.now()}-fin`, true)
    await browserContext.loginAs(fixture.responsible)

    const page = await visit('/responsavel')
    await page.assertPath('/responsavel')
    await page.assertExists('button:has-text("Pedagógico")')
    await page.assertExists('button:has-text("Financeiro")')
  })
})
