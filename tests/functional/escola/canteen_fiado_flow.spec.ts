import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import Canteen from '#models/canteen'
import CanteenItem from '#models/canteen_item'
import CanteenPurchase from '#models/canteen_purchase'
import CanteenItemPurchased from '#models/canteen_item_purchased'
import StudentPayment from '#models/student_payment'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import { createEnrollmentFixtures } from '#tests/helpers/enrollment_fixtures'

async function createCanteenFiadoFixtures() {
  const { user: director, school } = await createEscolaAuthUser()
  const enrollment = await createEnrollmentFixtures(school)

  const studentRole = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })

  const uniqueSeed = Date.now()
  const studentUser = await User.create({
    name: `Aluno Cantina ${uniqueSeed}`,
    slug: `aluno-cantina-${uniqueSeed}`,
    email: `aluno-cantina-${uniqueSeed}@example.com`,
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
    paymentDay: 28,
  })

  const canteen = await Canteen.create({
    name: `Cantina Teste ${uniqueSeed}`,
    schoolId: school.id,
    responsibleUserId: director.id,
  })

  const item = await CanteenItem.create({
    canteenId: canteen.id,
    name: 'Coxinha Teste',
    description: 'Item para teste funcional do fiado',
    price: 750,
    category: 'SALGADOS',
    isActive: true,
  })

  return {
    director,
    student,
    studentHasLevel,
    canteen,
    item,
    totalAmount: item.price * 2,
    now: DateTime.now(),
  }
}

test.group('Canteen fiado flow API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('creates ON_ACCOUNT purchase and exposes consistent data in purchases + invoices endpoints', async ({
    client,
    assert,
  }) => {
    const fixtures = await createCanteenFiadoFixtures()

    const createResponse = await client
      .post('/api/v1/canteen-purchases')
      .json({
        userId: fixtures.student.id,
        canteenId: fixtures.canteen.id,
        paymentMethod: 'ON_ACCOUNT',
        studentHasLevelId: fixtures.studentHasLevel.id,
        items: [
          {
            type: 'item',
            canteenItemId: fixtures.item.id,
            quantity: 2,
          },
        ],
      })
      .loginAs(fixtures.director)

    createResponse.assertStatus(201)
    const createdPurchase = createResponse.body()

    assert.equal(createdPurchase.userId, fixtures.student.id)
    assert.equal(createdPurchase.canteenId, fixtures.canteen.id)
    assert.equal(createdPurchase.paymentMethod, 'ON_ACCOUNT')
    assert.equal(createdPurchase.status, 'PENDING')
    assert.equal(createdPurchase.totalAmount, fixtures.totalAmount)
    assert.isString(createdPurchase.studentPaymentId)

    const purchasesResponse = await client
      .get('/api/v1/canteen-purchases')
      .qs({
        canteenId: fixtures.canteen.id,
        userId: fixtures.student.id,
        paymentMethod: 'ON_ACCOUNT',
        page: 1,
        limit: 20,
      })
      .loginAs(fixtures.director)

    purchasesResponse.assertStatus(200)
    const purchasesBody = purchasesResponse.body()
    assert.isArray(purchasesBody.data)
    assert.equal(purchasesBody.data.length, 1)
    assert.equal(purchasesBody.data[0].id, createdPurchase.id)
    assert.equal(purchasesBody.data[0].studentPaymentId, createdPurchase.studentPaymentId)
    assert.equal(purchasesBody.data[0].totalAmount, fixtures.totalAmount)
    assert.isArray(purchasesBody.data[0].itemsPurchased)
    assert.equal(purchasesBody.data[0].itemsPurchased.length, 1)
    assert.equal(purchasesBody.data[0].itemsPurchased[0].canteenItemId, fixtures.item.id)
    assert.equal(purchasesBody.data[0].itemsPurchased[0].quantity, 2)
    assert.equal(purchasesBody.data[0].itemsPurchased[0].unitPrice, fixtures.item.price)
    assert.equal(purchasesBody.data[0].itemsPurchased[0].totalPrice, fixtures.totalAmount)

    const paymentsResponse = await client
      .get(`/api/v1/students/${fixtures.student.id}/payments`)
      .qs({ page: 1, limit: 20 })
      .loginAs(fixtures.director)

    paymentsResponse.assertStatus(200)
    const paymentsBody = paymentsResponse.body()
    assert.isArray(paymentsBody.data)
    assert.equal(paymentsBody.data.length, 1)
    assert.equal(paymentsBody.data[0].id, createdPurchase.studentPaymentId)
    assert.equal(paymentsBody.data[0].type, 'CANTEEN')
    assert.include(['NOT_PAID', 'OVERDUE'], paymentsBody.data[0].status)
    assert.equal(paymentsBody.data[0].totalAmount, fixtures.totalAmount)

    await ReconcilePaymentInvoiceJob.dispatch({
      paymentId: createdPurchase.studentPaymentId,
      triggeredBy: { id: fixtures.director.id, name: fixtures.director.name },
      source: 'tests.canteen-fiado.functional',
    }).with('sync')

    const invoicesResponse = await client
      .get('/api/v1/invoices')
      .qs({
        studentId: fixtures.student.id,
        month: fixtures.now.month,
        year: fixtures.now.year,
        page: 1,
        limit: 20,
      })
      .loginAs(fixtures.director)

    invoicesResponse.assertStatus(200)
    const invoicesBody = invoicesResponse.body()
    assert.isArray(invoicesBody.data)
    assert.equal(invoicesBody.data.length, 1)

    const invoice = invoicesBody.data[0]
    assert.equal(invoice.studentId, fixtures.student.id)
    assert.equal(invoice.totalAmount, fixtures.totalAmount)
    assert.equal(invoice.baseAmount, fixtures.totalAmount)
    assert.equal(invoice.status, 'OPEN')
    assert.isArray(invoice.payments)
    assert.equal(invoice.payments.length, 1)
    assert.equal(invoice.payments[0].id, createdPurchase.studentPaymentId)
    assert.equal(invoice.payments[0].type, 'CANTEEN')
    assert.include(['NOT_PAID', 'OVERDUE'], invoice.payments[0].status)
  })

  test('manual payment creates only canteen purchase and does not create student payment nor invoice entry', async ({
    client,
    assert,
  }) => {
    const fixtures = await createCanteenFiadoFixtures()

    const createResponse = await client
      .post('/api/v1/canteen-purchases')
      .json({
        userId: fixtures.student.id,
        canteenId: fixtures.canteen.id,
        paymentMethod: 'CASH',
        items: [
          {
            type: 'item',
            canteenItemId: fixtures.item.id,
            quantity: 1,
          },
        ],
      })
      .loginAs(fixtures.director)

    createResponse.assertStatus(201)
    const createdPurchase = createResponse.body()
    assert.equal(createdPurchase.paymentMethod, 'CASH')
    assert.equal(createdPurchase.status, 'PAID')
    assert.isNull(createdPurchase.studentPaymentId)

    const studentPayments = await StudentPayment.query()
      .where('studentId', fixtures.student.id)
      .where('type', 'CANTEEN')
    assert.equal(studentPayments.length, 0)

    const invoicesResponse = await client
      .get('/api/v1/invoices')
      .qs({
        studentId: fixtures.student.id,
        month: fixtures.now.month,
        year: fixtures.now.year,
        page: 1,
        limit: 20,
      })
      .loginAs(fixtures.director)

    invoicesResponse.assertStatus(200)
    assert.deepEqual(invoicesResponse.body().data, [])
  })

  test('rolls back fiado flow when item-purchased creation fails (atomicity)', async ({
    client,
    assert,
  }) => {
    const fixtures = await createCanteenFiadoFixtures()

    const originalSave = CanteenItemPurchased.prototype.save
    CanteenItemPurchased.prototype.save = async function patchedSave() {
      throw new Error('forced item creation failure')
    } as typeof CanteenItemPurchased.prototype.save

    try {
      const response = await client
        .post('/api/v1/canteen-purchases')
        .json({
          userId: fixtures.student.id,
          canteenId: fixtures.canteen.id,
          paymentMethod: 'ON_ACCOUNT',
          studentHasLevelId: fixtures.studentHasLevel.id,
          items: [
            {
              type: 'item',
              canteenItemId: fixtures.item.id,
              quantity: 1,
            },
          ],
        })
        .loginAs(fixtures.director)

      response.assertStatus(500)
    } finally {
      CanteenItemPurchased.prototype.save = originalSave
    }

    const canteenPurchases = await CanteenPurchase.query().where('canteenId', fixtures.canteen.id)
    const studentPayments = await StudentPayment.query()
      .where('studentId', fixtures.student.id)
      .where('type', 'CANTEEN')

    assert.equal(canteenPurchases.length, 0)
    assert.equal(studentPayments.length, 0)
  })

  test('rejects duplicate checkout with identical payload and keeps a single purchase', async ({
    client,
    assert,
  }) => {
    const fixtures = await createCanteenFiadoFixtures()

    const payload = {
      userId: fixtures.student.id,
      canteenId: fixtures.canteen.id,
      paymentMethod: 'ON_ACCOUNT',
      studentHasLevelId: fixtures.studentHasLevel.id,
      items: [
        {
          type: 'item',
          canteenItemId: fixtures.item.id,
          quantity: 1,
        },
      ],
    }

    const firstResponse = await client
      .post('/api/v1/canteen-purchases')
      .json(payload)
      .loginAs(fixtures.director)

    firstResponse.assertStatus(201)

    const secondResponse = await client
      .post('/api/v1/canteen-purchases')
      .json(payload)
      .loginAs(fixtures.director)

    secondResponse.assertStatus(409)

    const purchases = await CanteenPurchase.query().where('canteenId', fixtures.canteen.id)
    const studentPayments = await StudentPayment.query()
      .where('studentId', fixtures.student.id)
      .where('type', 'CANTEEN')

    assert.equal(purchases.length, 1)
    assert.equal(studentPayments.length, 1)
  })
})
