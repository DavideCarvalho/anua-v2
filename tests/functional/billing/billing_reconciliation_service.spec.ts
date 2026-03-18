import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import BillingReconciliationService from '#services/payments/billing_reconciliation_service'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import StudentPayment from '#models/student_payment'
import AcademicPeriod from '#models/academic_period'
import Level from '#models/level'
import Contract from '#models/contract'
import School from '#models/school'
import User from '#models/user'
import Role from '#models/role'
import Course from '#models/course'
import Class_ from '#models/class'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import Invoice from '#models/invoice'

async function createTestRoles() {
  const rolesToCreate = ['STUDENT']
  for (const roleName of rolesToCreate) {
    await Role.firstOrCreate({ name: roleName }, { name: roleName })
  }
}

async function createBillingFixtures(
  school: School,
  options?: { isActive?: boolean; deletedAt?: DateTime }
) {
  const now = DateTime.now()
  const startDate = now.minus({ days: 30 })
  const endDate = options?.isActive === false ? now.minus({ months: 2 }) : now.plus({ years: 1 })

  const academicPeriod = await AcademicPeriod.create({
    schoolId: school.id,
    name: `Period Test ${Date.now()}`,
    startDate,
    endDate,
    enrollmentStartDate: startDate,
    enrollmentEndDate: endDate,
    isActive: options?.isActive !== false,
    segment: 'ELEMENTARY',
    isClosed: false,
    deletedAt: options?.deletedAt,
  })

  const course = await Course.create({
    schoolId: school.id,
    name: `Course Test ${Date.now()}`,
    version: 1,
  })

  const contract = await Contract.create({
    schoolId: school.id,
    academicPeriodId: academicPeriod.id,
    name: `Contract Test ${Date.now()}`,
    description: null,
    endDate: endDate,
    enrollmentValue: 10000,
    ammount: 50000,
    paymentType: 'MONTHLY',
    enrollmentValueInstallments: 1,
    enrollmentPaymentUntilDays: 30,
    installments: 12,
    flexibleInstallments: true,
    isActive: true,
    hasInsurance: false,
  })

  const level = await Level.create({
    schoolId: school.id,
    contractId: contract.id,
    name: `Level Test ${Date.now()}`,
    order: 1,
    isActive: true,
  })

  const courseHasAcademicPeriod = await CourseHasAcademicPeriod.create({
    courseId: course.id,
    academicPeriodId: academicPeriod.id,
  })

  const levelAssignment = await LevelAssignedToCourseHasAcademicPeriod.create({
    levelId: level.id,
    courseHasAcademicPeriodId: courseHasAcademicPeriod.id,
    isActive: true,
  })

  const classEntity = await Class_.create({
    schoolId: school.id,
    levelId: level.id,
    name: `Class Test ${Date.now()}`,
    isArchived: false,
  })

  await ClassHasAcademicPeriod.create({
    classId: classEntity.id,
    academicPeriodId: academicPeriod.id,
  })

  return {
    academicPeriod,
    course,
    contract,
    level,
    classEntity,
    levelAssignment,
  }
}

test.group('BillingReconciliationService', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('resolveTargetInvoice returns null for payment from orphan enrollment', async ({
    assert,
  }) => {
    await createTestRoles()
    const studentRole = await Role.findByOrFail({ name: 'STUDENT' })

    const school = await School.create({ name: 'Test School', slug: 'test-school-orphan' })
    const user = await User.create({
      name: 'Test Student',
      slug: 'test-student-orphan',
      email: 'test@test.com',
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      schoolId: school.id,
      roleId: studentRole.id,
    })

    const student = await Student.create({
      id: user.id,
      descountPercentage: 0,
      monthlyPaymentAmount: 0,
      isSelfResponsible: false,
      balance: 0,
    })

    const {
      academicPeriod: period,
      level,
      contract,
      levelAssignment,
    } = await createBillingFixtures(school, {
      isActive: false,
      deletedAt: DateTime.now().minus({ months: 1 }),
    })

    const enrollment = await StudentHasLevel.create({
      studentId: student.id,
      levelId: level.id,
      academicPeriodId: period.id,
      contractId: contract.id,
      levelAssignedToCourseAcademicPeriodId: levelAssignment.id,
    })

    const payment = await StudentPayment.create({
      studentId: student.id,
      studentHasLevelId: enrollment.id,
      contractId: contract.id,
      type: 'TUITION',
      amount: 10000,
      totalAmount: 10000,
      month: DateTime.now().month,
      year: DateTime.now().year,
      dueDate: DateTime.now().plus({ days: 10 }),
      status: 'PENDING',
    })

    const invoice = await BillingReconciliationService['resolveTargetInvoice'](payment)

    assert.isNull(invoice, 'Should return null for orphan enrollment payment')
  })

  test('resolveTargetInvoice creates separate invoices for different enrollments', async ({
    assert,
  }) => {
    await createTestRoles()
    const studentRole = await Role.findByOrFail({ name: 'STUDENT' })

    const school = await School.create({
      name: 'Test School 2',
      slug: 'test-school-separate',
    })
    const user = await User.create({
      name: 'Test Student 2',
      slug: 'test-student-separate',
      email: 'test2@test.com',
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      schoolId: school.id,
      roleId: studentRole.id,
    })

    const student = await Student.create({
      id: user.id,
      descountPercentage: 0,
      monthlyPaymentAmount: 0,
      isSelfResponsible: false,
      balance: 0,
    })

    const {
      academicPeriod: period,
      level,
      levelAssignment,
    } = await createBillingFixtures(school, {
      isActive: true,
    })

    const contract1 = await Contract.create({
      schoolId: school.id,
      name: 'Test Contract 1',
      ammount: 100000,
      paymentType: 'MONTHLY',
      installments: 12,
      enrollmentValueInstallments: 1,
      flexibleInstallments: true,
      isActive: true,
      hasInsurance: false,
    })
    const contract2 = await Contract.create({
      schoolId: school.id,
      name: 'Test Contract 2',
      ammount: 200000,
      paymentType: 'MONTHLY',
      installments: 12,
      enrollmentValueInstallments: 1,
      flexibleInstallments: true,
      isActive: true,
      hasInsurance: false,
    })

    const enrollment1 = await StudentHasLevel.create({
      studentId: student.id,
      levelId: level.id,
      academicPeriodId: period.id,
      contractId: contract1.id,
      levelAssignedToCourseAcademicPeriodId: levelAssignment.id,
    })

    const enrollment2 = await StudentHasLevel.create({
      studentId: student.id,
      levelId: level.id,
      academicPeriodId: period.id,
      contractId: contract2.id,
      levelAssignedToCourseAcademicPeriodId: levelAssignment.id,
    })

    const month = DateTime.now().month
    const year = DateTime.now().year

    const payment1 = await StudentPayment.create({
      studentId: student.id,
      studentHasLevelId: enrollment1.id,
      contractId: contract1.id,
      type: 'TUITION',
      amount: 10000,
      totalAmount: 10000,
      month,
      year,
      dueDate: DateTime.now().plus({ days: 10 }),
      status: 'PENDING',
    })

    const payment2 = await StudentPayment.create({
      studentId: student.id,
      studentHasLevelId: enrollment2.id,
      contractId: contract2.id,
      type: 'TUITION',
      amount: 20000,
      totalAmount: 20000,
      month,
      year,
      dueDate: DateTime.now().plus({ days: 10 }),
      status: 'PENDING',
    })

    const invoice1 = await BillingReconciliationService['resolveTargetInvoice'](payment1)
    const invoice2 = await BillingReconciliationService['resolveTargetInvoice'](payment2)

    assert.isNotNull(invoice1)
    assert.isNotNull(invoice2)
    assert.notEqual(invoice1!.id, invoice2!.id, 'Should create separate invoices')
    assert.equal(invoice1!.studentHasLevelId, enrollment1.id)
    assert.equal(invoice2!.studentHasLevelId, enrollment2.id)
  })

  test('cleanupOrphanPayments deletes unpaid payments from deleted period', async ({ assert }) => {
    await createTestRoles()
    const studentRole = await Role.findByOrFail({ name: 'STUDENT' })

    const school = await School.create({
      name: 'Test School 3',
      slug: 'test-school-orphan-payments',
    })
    const user = await User.create({
      name: 'Test Student 3',
      slug: 'test-student-orphan-payments',
      email: 'test3@test.com',
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      schoolId: school.id,
      roleId: studentRole.id,
    })

    const student = await Student.create({
      id: user.id,
      descountPercentage: 0,
      monthlyPaymentAmount: 0,
      isSelfResponsible: false,
      balance: 0,
    })

    const {
      academicPeriod: period,
      level,
      contract,
      levelAssignment,
    } = await createBillingFixtures(school, {
      isActive: false,
      deletedAt: DateTime.now().minus({ months: 1 }),
    })

    const enrollment = await StudentHasLevel.create({
      studentId: student.id,
      levelId: level.id,
      academicPeriodId: period.id,
      contractId: contract.id,
      levelAssignedToCourseAcademicPeriodId: levelAssignment.id,
    })

    const paidPayment = await StudentPayment.create({
      studentId: student.id,
      studentHasLevelId: enrollment.id,
      contractId: contract.id,
      type: 'TUITION',
      amount: 10000,
      totalAmount: 10000,
      month: DateTime.now().minus({ months: 3 }).month,
      year: DateTime.now().year,
      dueDate: DateTime.now().minus({ months: 3 }),
      status: 'PAID',
    })

    const unpaidPayment = await StudentPayment.create({
      studentId: student.id,
      studentHasLevelId: enrollment.id,
      contractId: contract.id,
      type: 'TUITION',
      amount: 10000,
      totalAmount: 10000,
      month: DateTime.now().plus({ months: 1 }).month,
      year: DateTime.now().year,
      dueDate: DateTime.now().plus({ months: 1 }),
      status: 'PENDING',
    })

    await BillingReconciliationService['cleanupOrphanPayments'](student.id)

    await paidPayment.refresh()

    const deletedUnpaid = await StudentPayment.find(unpaidPayment.id)

    assert.equal(paidPayment.status, 'PAID', 'Paid payment should remain PAID')
    assert.isNull(deletedUnpaid, 'Unpaid payment should be deleted')
  })

  test('cleanupOrphanPayments keeps unpaid payments before period close when option enabled', async ({
    assert,
  }) => {
    await createTestRoles()
    const studentRole = await Role.findByOrFail({ name: 'STUDENT' })

    const school = await School.create({
      name: 'Test School 4',
      slug: 'test-school-keep-unpaid',
    })
    const user = await User.create({
      name: 'Test Student 4',
      slug: 'test-student-keep-unpaid',
      email: 'test4@test.com',
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      schoolId: school.id,
      roleId: studentRole.id,
    })

    const student = await Student.create({
      id: user.id,
      descountPercentage: 0,
      monthlyPaymentAmount: 0,
      isSelfResponsible: false,
      balance: 0,
    })

    const periodClosedAt = DateTime.now().minus({ days: 15 })

    const period = await AcademicPeriod.create({
      name: 'Closed Period',
      startDate: DateTime.now().minus({ months: 6 }),
      endDate: DateTime.now().minus({ months: 1 }),
      schoolId: school.id,
      isActive: false,
      deletedAt: periodClosedAt,
      segment: 'ELEMENTARY',
    })

    const contract = await Contract.create({
      schoolId: school.id,
      academicPeriodId: period.id,
      name: 'Test Contract Keep Unpaid',
      ammount: 50000,
      paymentType: 'MONTHLY',
      installments: 12,
      enrollmentValueInstallments: 1,
      flexibleInstallments: true,
      isActive: true,
      hasInsurance: false,
    })

    const level = await Level.create({
      schoolId: school.id,
      contractId: contract.id,
      name: 'Level Test Keep Unpaid',
      order: 1,
      isActive: true,
    })

    const course = await Course.create({
      schoolId: school.id,
      name: `Course Test Keep Unpaid ${Date.now()}`,
      version: 1,
    })

    const courseHasAcademicPeriod = await CourseHasAcademicPeriod.create({
      courseId: course.id,
      academicPeriodId: period.id,
    })

    const levelAssignment = await LevelAssignedToCourseHasAcademicPeriod.create({
      levelId: level.id,
      courseHasAcademicPeriodId: courseHasAcademicPeriod.id,
      isActive: true,
    })

    const enrollment = await StudentHasLevel.create({
      studentId: student.id,
      levelId: level.id,
      academicPeriodId: period.id,
      contractId: contract.id,
      levelAssignedToCourseAcademicPeriodId: levelAssignment.id,
    })

    const paymentBeforeClose = await StudentPayment.create({
      studentId: student.id,
      studentHasLevelId: enrollment.id,
      contractId: contract.id,
      type: 'TUITION',
      amount: 10000,
      totalAmount: 10000,
      month: DateTime.now().minus({ months: 1 }).month,
      year: DateTime.now().year,
      dueDate: periodClosedAt.minus({ days: 5 }),
      status: 'PENDING',
    })

    const paymentAfterClose = await StudentPayment.create({
      studentId: student.id,
      studentHasLevelId: enrollment.id,
      contractId: contract.id,
      type: 'TUITION',
      amount: 10000,
      totalAmount: 10000,
      month: DateTime.now().plus({ months: 1 }).month,
      year: DateTime.now().year,
      dueDate: periodClosedAt.plus({ days: 5 }),
      status: 'PENDING',
    })

    await BillingReconciliationService['cleanupOrphanPayments'](student.id, {
      keepUnpaidBeforePeriodClose: true,
    })

    await paymentBeforeClose.refresh()

    const deletedPaymentAfterClose = await StudentPayment.find(paymentAfterClose.id)

    assert.equal(paymentBeforeClose.status, 'PENDING', 'Payment before close should be kept')
    assert.isNull(deletedPaymentAfterClose, 'Payment after close should be deleted')
  })

  test('cleanupOrphanPayments deletes orphan invoices', async ({ assert }) => {
    await createTestRoles()
    const studentRole = await Role.findByOrFail({ name: 'STUDENT' })

    const school = await School.create({
      name: 'Test School 5',
      slug: 'test-school-orphan-invoice',
    })
    const user = await User.create({
      name: 'Test Student 5',
      slug: 'test-student-orphan-invoice',
      email: 'test5@test.com',
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      schoolId: school.id,
      roleId: studentRole.id,
    })

    const student = await Student.create({
      id: user.id,
      descountPercentage: 0,
      monthlyPaymentAmount: 0,
      isSelfResponsible: false,
      balance: 0,
    })

    const period = await AcademicPeriod.create({
      name: 'Deleted Period',
      startDate: DateTime.now().minus({ months: 6 }),
      endDate: DateTime.now().minus({ months: 2 }),
      schoolId: school.id,
      isActive: false,
      deletedAt: DateTime.now().minus({ months: 1 }),
      segment: 'ELEMENTARY',
    })

    const contract = await Contract.create({
      schoolId: school.id,
      academicPeriodId: period.id,
      name: 'Test Contract Orphan Invoice',
      ammount: 50000,
      paymentType: 'MONTHLY',
      installments: 12,
      enrollmentValueInstallments: 1,
      flexibleInstallments: true,
      isActive: true,
      hasInsurance: false,
    })

    const level = await Level.create({
      schoolId: school.id,
      contractId: contract.id,
      name: 'Level Test Orphan Invoice',
      order: 1,
      isActive: true,
    })

    const course = await Course.create({
      schoolId: school.id,
      name: `Course Test Orphan Invoice ${Date.now()}`,
      version: 1,
    })

    const courseHasAcademicPeriod = await CourseHasAcademicPeriod.create({
      courseId: course.id,
      academicPeriodId: period.id,
    })

    const levelAssignment = await LevelAssignedToCourseHasAcademicPeriod.create({
      levelId: level.id,
      courseHasAcademicPeriodId: courseHasAcademicPeriod.id,
      isActive: true,
    })

    const enrollment = await StudentHasLevel.create({
      studentId: student.id,
      levelId: level.id,
      academicPeriodId: period.id,
      contractId: contract.id,
      levelAssignedToCourseAcademicPeriodId: levelAssignment.id,
    })

    const payment = await StudentPayment.create({
      studentId: student.id,
      studentHasLevelId: enrollment.id,
      contractId: contract.id,
      type: 'TUITION',
      amount: 10000,
      totalAmount: 10000,
      month: DateTime.now().plus({ months: 1 }).month,
      year: DateTime.now().year,
      dueDate: DateTime.now().plus({ months: 1 }),
      status: 'PENDING',
    })

    const invoice = await Invoice.create({
      studentId: student.id,
      studentHasLevelId: enrollment.id,
      type: 'MONTHLY',
      month: payment.month,
      year: payment.year,
      dueDate: payment.dueDate,
      status: 'OPEN',
      baseAmount: 10000,
      totalAmount: 10000,
      discountAmount: 0,
      fineAmount: 0,
      interestAmount: 0,
    })

    payment.invoiceId = invoice.id
    await payment.save()

    await BillingReconciliationService['cleanupOrphanPayments'](student.id)

    const deletedInvoice = await Invoice.query().where('id', invoice.id).first()
    assert.isNull(deletedInvoice, 'Orphan invoice should be deleted')
  })
})
