import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import Canteen from '#models/canteen'
import CanteenItem from '#models/canteen_item'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import { createEnrollmentFixtures } from '#tests/helpers/enrollment_fixtures'

async function createPdvFiadoFixtures() {
  const { user: director, school } = await createEscolaAuthUser()
  const enrollment = await createEnrollmentFixtures(school)

  const studentRole = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })
  const uniqueSeed = Date.now()
  const studentName = `Aluno Browser Cantina ${uniqueSeed}`

  const studentUser = await User.create({
    name: studentName,
    slug: `aluno-browser-cantina-${uniqueSeed}`,
    email: `aluno-browser-cantina-${uniqueSeed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: studentRole.id,
    schoolId: school.id,
  })

  const student = await Student.create({
    id: studentUser.id,
    contractId: enrollment.contract.id,
    classId: enrollment.classEntity.id,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
    monthlyPaymentAmount: enrollment.contract.ammount,
    isSelfResponsible: false,
    paymentDate: 5,
    descountPercentage: 0,
  })

  const studentHasLevel = await StudentHasLevel.create({
    studentId: student.id,
    levelAssignedToCourseAcademicPeriodId: enrollment.levelAssignment.id,
    academicPeriodId: enrollment.academicPeriod.id,
    levelId: enrollment.level.id,
    classId: enrollment.classEntity.id,
    contractId: enrollment.contract.id,
    paymentDay: 5,
  })

  const canteen = await Canteen.create({
    name: `Cantina Browser Teste ${uniqueSeed}`,
    schoolId: school.id,
    responsibleUserId: director.id,
  })

  const item = await CanteenItem.create({
    canteenId: canteen.id,
    name: `Coxinha Browser ${uniqueSeed}`,
    description: 'Item para teste browser de fiado no PDV',
    price: 900,
    category: 'SALGADOS',
    isActive: true,
  })

  return {
    director,
    student,
    studentName,
    studentHasLevel,
    canteen,
    item,
    totalAmount: item.price,
    now: DateTime.now(),
  }
}

test.group('PDV fiado flow (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('creates fiado sale and verifies purchases + invoices endpoints', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const fixtures = await createPdvFiadoFixtures()

    await browserContext.loginAs(fixtures.director)

    const page = await visit('/escola/cantina/pdv')
    await page.waitForTimeout(1500)

    await page.assertExists('text=Ponto de Venda')
    await page.assertExists('text=Forma de Pagamento')

    await page.fill(
      'input[placeholder="Nome, email ou documento do aluno..."]',
      fixtures.studentName
    )
    await page.waitForTimeout(800)
    await page.click(`button:has-text("${fixtures.studentName}")`)

    await page.click(`button:has-text("${fixtures.item.name}")`)
    await page.click('button:has-text("Fiado (fatura)")')
    await page.click('button:has-text("Finalizar Venda")')

    await page.assertExists('text=Venda registrada com sucesso')

    const purchasesBody = await page.evaluate(
      async ({ canteenId, studentId }) => {
        const query = new URLSearchParams({
          canteenId,
          userId: studentId,
          paymentMethod: 'ON_ACCOUNT',
          page: '1',
          limit: '20',
        })
        const response = await fetch(`/api/v1/canteen-purchases?${query.toString()}`)
        return response.json()
      },
      { canteenId: fixtures.canteen.id, studentId: fixtures.student.id }
    )

    assert.isArray((purchasesBody as any).data)
    assert.equal((purchasesBody as any).data.length, 1)

    const purchase = (purchasesBody as any).data[0]
    assert.equal(purchase.paymentMethod, 'ON_ACCOUNT')
    assert.equal(purchase.status, 'PENDING')
    assert.equal(purchase.totalAmount, fixtures.totalAmount)
    assert.isString(purchase.studentPaymentId)

    await ReconcilePaymentInvoiceJob.dispatch({
      paymentId: purchase.studentPaymentId,
      triggeredBy: { id: fixtures.director.id, name: fixtures.director.name },
      source: 'tests.canteen-fiado.browser',
    }).with('sync')

    const invoicesBody = await page.evaluate(
      async ({ studentId, month, year }) => {
        const query = new URLSearchParams({
          studentId,
          month: String(month),
          year: String(year),
          page: '1',
          limit: '20',
        })
        const response = await fetch(`/api/v1/invoices?${query.toString()}`)
        return response.json()
      },
      {
        studentId: fixtures.student.id,
        month: fixtures.now.month,
        year: fixtures.now.year,
      }
    )

    assert.isArray((invoicesBody as any).data)
    assert.equal((invoicesBody as any).data.length, 1)

    const invoice = (invoicesBody as any).data[0]
    assert.equal(invoice.studentId, fixtures.student.id)
    assert.equal(invoice.totalAmount, fixtures.totalAmount)
    assert.equal(invoice.baseAmount, fixtures.totalAmount)
    assert.isArray(invoice.payments)
    assert.equal(invoice.payments.length, 1)
    assert.equal(invoice.payments[0].id, purchase.studentPaymentId)
    assert.equal(invoice.payments[0].type, 'CANTEEN')
  })
})
