import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import Role from '#models/role'
import School from '#models/school'
import User from '#models/user'
import UserHasSchool from '#models/user_has_school'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import Canteen from '#models/canteen'
import CanteenPurchase from '#models/canteen_purchase'
import StudentBalanceTransaction from '#models/student_balance_transaction'

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

async function createResponsavelCantinaFixtures(seed: string) {
  const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })

  const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-responsible`)
  const studentUser = await createUserWithRole('STUDENT', `${seed}-student`)
  const canteenManager = await createUserWithRole('SCHOOL_DIRECTOR', `${seed}-canteen-manager`)

  await UserHasSchool.create({ userId: responsible.id, schoolId: school.id, isDefault: true })
  await UserHasSchool.create({ userId: canteenManager.id, schoolId: school.id, isDefault: false })

  const student = await Student.create({
    id: studentUser.id,
    classId: null,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible: false,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 3000,
    enrollmentStatus: 'REGISTERED',
  })

  await StudentHasResponsible.create({
    studentId: student.id,
    responsibleId: responsible.id,
    isPedagogical: true,
    isFinancial: true,
  })

  const canteen = await Canteen.create({
    name: `Cantina ${seed}`,
    schoolId: school.id,
    responsibleUserId: canteenManager.id,
  })

  await CanteenPurchase.create({
    userId: student.id,
    canteenId: canteen.id,
    totalAmount: 1800,
    paymentMethod: 'PIX_MACHINE',
    status: 'PAID',
    paidAt: null,
    studentPaymentId: null,
    monthlyTransferId: null,
  })

  await CanteenPurchase.create({
    userId: student.id,
    canteenId: canteen.id,
    totalAmount: 1200,
    paymentMethod: 'ON_ACCOUNT',
    status: 'PENDING',
    paidAt: null,
    studentPaymentId: null,
    monthlyTransferId: null,
  })

  await StudentBalanceTransaction.create({
    studentId: student.id,
    amount: 5000,
    type: 'TOP_UP',
    status: 'COMPLETED',
    description: 'Recarga teste',
    previousBalance: 0,
    newBalance: 5000,
    canteenPurchaseId: null,
    storeOrderId: null,
    responsibleId: null,
    paymentGatewayId: null,
    paymentMethod: 'PIX',
  })

  await StudentBalanceTransaction.create({
    studentId: student.id,
    amount: 2000,
    type: 'CANTEEN_PURCHASE',
    status: 'COMPLETED',
    description: 'Compra cantina',
    previousBalance: 5000,
    newBalance: 3000,
    canteenPurchaseId: null,
    storeOrderId: null,
    responsibleId: null,
    paymentGatewayId: null,
    paymentMethod: 'BALANCE',
  })

  return {
    responsible,
    studentSlug: studentUser.slug,
  }
}

test.group('Cantina responsável (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('opens cantina page and shows balance and purchases with normalized payment labels', async ({
    visit,
    browserContext,
  }) => {
    const seed = `${Date.now()}-responsavel-cantina`
    const fixture = await createResponsavelCantinaFixtures(seed)

    await browserContext.loginAs(fixture.responsible)

    const page = await visit(`/responsavel/cantina?aluno=${fixture.studentSlug}`, {
      timeout: 60_000,
    })

    await page.waitForResponse((response) => {
      return (
        response.request().method() === 'GET' &&
        response.url().includes('/api/v1/responsavel/stats') &&
        response.status() === 200
      )
    })

    await page.waitForResponse((response) => {
      return (
        response.request().method() === 'GET' &&
        response.url().includes('/api/v1/responsavel/students/') &&
        response.url().includes('/canteen-purchases') &&
        response.status() === 200
      )
    })

    await page.assertExists('text=Cantina')
    await page.assertExists('text=Saldo da Cantina')
    await page.assertExists('text=Histórico de Compras da Cantina')
    await page.assertExists('text=PIX (máquina)')
    await page.assertExists('text=Fiado')
  })
})
