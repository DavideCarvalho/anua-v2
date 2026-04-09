import { test } from '@japa/runner'
import '@japa/api-client'
import '#config/auth'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

import Contract from '#models/contract'
import Role from '#models/role'
import Student from '#models/student'
import StudentPayment from '#models/student_payment'
import User from '#models/user'
import { createEscolaAuthUser, createTestRoles } from '#tests/helpers/escola_auth'

test.group('Escola insights - late payment history', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('uses paidAt vs dueDate history and exposes late/total counts', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    await createTestRoles()
    const studentRole = await Role.findByOrFail({ name: 'STUDENT' })

    const contract = await Contract.create({
      schoolId: school.id,
      name: 'Contrato Teste Insights',
      ammount: 100000,
      paymentType: 'MONTHLY',
      installments: 12,
      enrollmentValueInstallments: 1,
      flexibleInstallments: true,
      isActive: true,
      hasInsurance: false,
    })

    const createStudentWithUser = async (suffix: string) => {
      const studentUser = await User.create({
        name: `Aluno ${suffix}`,
        slug: `aluno-${suffix}-${Date.now()}`,
        email: `aluno-${suffix}-${Date.now()}@example.com`,
        active: true,
        whatsappContact: false,
        grossSalary: 0,
        roleId: studentRole.id,
        schoolId: school.id,
      })

      const student = await Student.create({
        id: studentUser.id,
        descountPercentage: 0,
        monthlyPaymentAmount: 0,
        isSelfResponsible: false,
        balance: 0,
      })

      return { student, studentUser }
    }

    const { student: recurringStudent } = await createStudentWithUser('recorrente')
    const { student: nonRecurringStudent } = await createStudentWithUser('nao-recorrente')

    const now = DateTime.now()

    await StudentPayment.createMany([
      {
        studentId: recurringStudent.id,
        contractId: contract.id,
        type: 'TUITION',
        amount: 10000,
        totalAmount: 10000,
        month: 1,
        year: now.year,
        dueDate: now.minus({ months: 3 }).startOf('day'),
        status: 'PAID',
        paidAt: now.minus({ months: 3 }).plus({ days: 3 }).startOf('day'),
      },
      {
        studentId: recurringStudent.id,
        contractId: contract.id,
        type: 'TUITION',
        amount: 10000,
        totalAmount: 10000,
        month: 2,
        year: now.year,
        dueDate: now.minus({ months: 2 }).startOf('day'),
        status: 'PAID',
        paidAt: now.minus({ months: 2 }).plus({ days: 2 }).startOf('day'),
      },
      {
        studentId: recurringStudent.id,
        contractId: contract.id,
        type: 'TUITION',
        amount: 10000,
        totalAmount: 10000,
        month: 3,
        year: now.year,
        dueDate: now.minus({ months: 1 }).startOf('day'),
        status: 'PAID',
        paidAt: now.minus({ months: 1 }).minus({ days: 1 }).startOf('day'),
      },
      {
        studentId: recurringStudent.id,
        contractId: contract.id,
        type: 'TUITION',
        amount: 10000,
        totalAmount: 10000,
        month: now.month,
        year: now.year,
        dueDate: now.plus({ days: 3 }).startOf('day'),
        status: 'PENDING',
      },
      {
        studentId: nonRecurringStudent.id,
        contractId: contract.id,
        type: 'TUITION',
        amount: 10000,
        totalAmount: 10000,
        month: 1,
        year: now.year,
        dueDate: now.minus({ months: 2 }).startOf('day'),
        status: 'OVERDUE',
      },
      {
        studentId: nonRecurringStudent.id,
        contractId: contract.id,
        type: 'TUITION',
        amount: 10000,
        totalAmount: 10000,
        month: now.month,
        year: now.year,
        dueDate: now.plus({ days: 3 }).startOf('day'),
        status: 'PENDING',
      },
    ])

    const response = await client.get('/api/v1/escola/insights').loginAs(user)
    response.assertStatus(200)

    const body = response.body() as any
    const recurring = body.insights.find((insight: any) => insight.id === 'chronic-late-payers')
    const risky = body.insights.find((insight: any) => insight.id === 'risky-upcoming-due-dates')

    assert.equal(recurring?.value, 1)
    assert.deepEqual(recurring?.metadata?.latePaymentStats, [
      {
        studentId: recurringStudent.id,
        latePaidInvoices: 2,
        totalPaidInvoices: 3,
      },
    ])

    assert.equal(risky?.value, 1)
    assert.equal(risky?.metadata?.studentIds?.length, 1)
    assert.equal(risky?.metadata?.studentIds?.[0], recurringStudent.id)
  })
})
