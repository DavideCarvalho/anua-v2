import { Job } from '@boringnode/queue'
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import locks from '@adonisjs/lock/services/main'
import StudentHasLevel from '#models/student_has_level'
import StudentPayment from '#models/student_payment'
import Contract from '#models/contract'
import ContractPaymentDay from '#models/contract_payment_day'

interface GenerateStudentPaymentsPayload {
  studentHasLevelId: string
}

/**
 * Job para gerar os pagamentos de um aluno baseado no seu StudentHasLevel.
 * Deve ser chamado após a matrícula do aluno.
 */
export default class GenerateStudentPaymentsJob extends Job<GenerateStudentPaymentsPayload> {
  static readonly jobName = 'GenerateStudentPaymentsJob'

  static options = {
    queue: 'payments',
    maxRetries: 3,
  }

  async execute(): Promise<void> {
    const { studentHasLevelId } = this.payload

    const lock = locks.createLock(`payment-gen:${studentHasLevelId}`, '60s')
    const [executed] = await lock.run(async () => {
      const startTime = Date.now()

      console.log('[WORKER] Starting payment generation:', {
        studentHasLevelId,
        timestamp: new Date().toISOString(),
      })

      try {
        const studentHasLevel = await StudentHasLevel.query()
          .where('id', studentHasLevelId)
          .preload('contract', (query) => {
            query.preload('paymentDays')
          })
          .preload('scholarship')
          .preload('academicPeriod')
          .preload('student', (query) => {
            query.preload('user')
          })
          .first()

        if (!studentHasLevel) {
          console.warn(`[WORKER] StudentHasLevel ${studentHasLevelId} not found - skipping`)
          return
        }

        if (studentHasLevel.deletedAt) {
          console.warn(`[WORKER] StudentHasLevel ${studentHasLevelId} was soft-deleted - skipping`)
          return
        }

        if (!studentHasLevel.contractId) {
          console.warn(`[WORKER] StudentHasLevel ${studentHasLevelId} has no contract - skipping`)
          return
        }

        const contract = studentHasLevel.contract
        if (!contract) {
          console.warn(`[WORKER] Contract not found for StudentHasLevel ${studentHasLevelId}`)
          return
        }

        const academicPeriod = studentHasLevel.academicPeriod
        if (!academicPeriod) {
          console.warn(
            `[WORKER] Academic period not found for StudentHasLevel ${studentHasLevelId}`
          )
          return
        }

        // Check if payments already exist for this StudentHasLevel
        const existingPayments = await StudentPayment.query()
          .where('studentHasLevelId', studentHasLevelId)
          .where('type', 'TUITION')

        if (existingPayments.length > 0) {
          console.log(
            `[WORKER] Payments already exist for StudentHasLevel ${studentHasLevelId} - skipping`
          )
          return
        }

        // Generate payments based on contract type
        if (contract.paymentType === 'UPFRONT') {
          await this.generateUpfrontPayments(studentHasLevel, contract)
        } else {
          await this.generateMonthlyPayments(studentHasLevel, contract, academicPeriod)
        }

        const duration = Date.now() - startTime
        console.log('[WORKER] Payment generation completed:', {
          studentHasLevelId,
          studentName: studentHasLevel.student?.user?.name,
          duration: `${duration}ms`,
        })
      } catch (error) {
        console.error('[WORKER] Payment generation error:', {
          studentHasLevelId,
          error: error instanceof Error ? error.message : String(error),
        })
        throw error
      }
    })

    if (!executed) {
      console.warn(`[WORKER] Lock não adquirido para ${studentHasLevelId} - pulando`)
    }
  }

  private async generateUpfrontPayments(
    studentHasLevel: StudentHasLevel,
    contract: Contract
  ): Promise<void> {
    const now = DateTime.now()
    const installments = studentHasLevel.installments ?? contract.installments ?? 1
    const paymentDay = await this.getPaymentDay(studentHasLevel, contract)
    const discountPercentage = studentHasLevel.scholarship?.discountPercentage ?? 0

    // Calculate installment amount
    const totalAmount = contract.ammount
    const installmentAmount = Math.floor(totalAmount / installments)
    const discountedAmount = Math.round(installmentAmount * (1 - discountPercentage / 100))

    console.log('[WORKER] Generating upfront payments:', {
      studentHasLevelId: studentHasLevel.id,
      installments,
      installmentAmount,
      discountedAmount,
    })

    // Generate enrollment payment (first payment)
    const enrollmentValue = contract.enrollmentValue ?? installmentAmount
    const enrollmentDiscountPercentage =
      studentHasLevel.scholarship?.enrollmentDiscountPercentage ?? 0
    const discountedEnrollmentValue = Math.round(
      enrollmentValue * (1 - enrollmentDiscountPercentage / 100)
    )

    await StudentPayment.create({
      id: uuidv7(),
      studentId: studentHasLevel.studentId,
      studentHasLevelId: studentHasLevel.id,
      contractId: contract.id,
      type: 'ENROLLMENT',
      amount: discountedEnrollmentValue,
      totalAmount: enrollmentValue,
      month: now.month,
      year: now.year,
      dueDate: now,
      installments,
      installmentNumber: 1,
      status: 'PENDING',
      discountPercentage: enrollmentDiscountPercentage,
    })

    // Generate remaining installments
    for (let i = 1; i < installments; i++) {
      const dueDate = now.plus({ months: i }).set({ day: paymentDay })

      await StudentPayment.create({
        id: uuidv7(),
        studentId: studentHasLevel.studentId,
        studentHasLevelId: studentHasLevel.id,
        contractId: contract.id,
        type: 'COURSE',
        amount: discountedAmount,
        totalAmount: installmentAmount,
        month: dueDate.month,
        year: dueDate.year,
        dueDate: dueDate,
        installments,
        installmentNumber: i + 1,
        status: 'PENDING',
        discountPercentage,
      })
    }

    console.log('[WORKER] Generated upfront payments:', {
      total: installments,
    })
  }

  private async generateMonthlyPayments(
    studentHasLevel: StudentHasLevel,
    contract: Contract,
    academicPeriod: { startDate: DateTime; endDate: DateTime }
  ): Promise<void> {
    const now = DateTime.now()
    const paymentDay = await this.getPaymentDay(studentHasLevel, contract)
    const discountPercentage = studentHasLevel.scholarship?.discountPercentage ?? 0

    const monthlyAmount = contract.ammount
    const discountedAmount = Math.round(monthlyAmount * (1 - discountPercentage / 100))

    // Determine start date (either now or academic period start, whichever is later)
    const startDate =
      now < academicPeriod.startDate ? academicPeriod.startDate : now.startOf('month')
    const endDate = academicPeriod.endDate

    // Calculate number of months
    const monthsDiff = Math.ceil(endDate.diff(startDate, 'months').months)

    console.log('[WORKER] Generating monthly payments:', {
      studentHasLevelId: studentHasLevel.id,
      monthsDiff,
      monthlyAmount,
      discountedAmount,
      startDate: startDate.toISODate(),
      endDate: endDate.toISODate(),
    })

    for (let i = 0; i < monthsDiff; i++) {
      const paymentMonth = startDate.plus({ months: i })
      const dueDate = paymentMonth.set({
        day: Math.min(paymentDay, paymentMonth.daysInMonth ?? 28),
      })

      // Check if payment already exists for this month
      const existingPayment = await StudentPayment.query()
        .where('studentHasLevelId', studentHasLevel.id)
        .where('month', dueDate.month)
        .where('year', dueDate.year)
        .where('type', 'TUITION')
        .first()

      if (existingPayment) {
        continue
      }

      await StudentPayment.create({
        id: uuidv7(),
        studentId: studentHasLevel.studentId,
        studentHasLevelId: studentHasLevel.id,
        contractId: contract.id,
        type: 'TUITION',
        amount: discountedAmount,
        totalAmount: monthlyAmount,
        month: dueDate.month,
        year: dueDate.year,
        dueDate: dueDate,
        installments: 1,
        installmentNumber: 1,
        status: 'PENDING',
        discountPercentage,
      })
    }

    console.log('[WORKER] Generated monthly payments:', {
      total: monthsDiff,
    })
  }

  private async getPaymentDay(
    studentHasLevel: StudentHasLevel,
    contract: Contract
  ): Promise<number> {
    // Priority: StudentHasLevel.paymentDay > Contract.paymentDays[0] > default 5
    if (studentHasLevel.paymentDay) {
      return studentHasLevel.paymentDay
    }

    const paymentDays = await ContractPaymentDay.query()
      .where('contractId', contract.id)
      .orderBy('day', 'asc')
      .first()

    return paymentDays?.day ?? 5
  }
}
