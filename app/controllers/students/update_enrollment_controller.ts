import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StudentHasLevel from '#models/student_has_level'
import StudentPayment from '#models/student_payment'
import Contract from '#models/contract'
import Scholarship from '#models/scholarship'
import Level from '#models/level'
import ContractPaymentDay from '#models/contract_payment_day'
import { updateEnrollmentValidator } from '#validators/student_enrollment'

const UNPAID_STATUSES = ['NOT_PAID', 'PENDING', 'OVERDUE'] as const

export default class UpdateEnrollmentController {
  async handle({ params, request, response }: HttpContext) {
    const { id: studentId, enrollmentId } = params
    const payload = await request.validateUsing(updateEnrollmentValidator)

    const enrollment = await StudentHasLevel.query()
      .where('id', enrollmentId)
      .where('studentId', studentId)
      .firstOrFail()

    enrollment.merge(payload)

    // Se não tem contractId, pega do Level
    if (!enrollment.contractId && enrollment.levelId) {
      const level = await Level.find(enrollment.levelId)
      if (level?.contractId) {
        enrollment.contractId = level.contractId
      }
    }

    await enrollment.save()

    // Propagar alterações para pagamentos futuros não pagos
    await this.updateFuturePayments(enrollment)

    // Reload with relations
    await enrollment.load('academicPeriod')
    await enrollment.load('contract')
    await enrollment.load('scholarship')
    await enrollment.load('level')
    await enrollment.load('class')

    return response.ok(enrollment)
  }

  private async updateFuturePayments(enrollment: StudentHasLevel) {
    if (!enrollment.contractId) return

    const contract = await Contract.find(enrollment.contractId)
    if (!contract) return

    const scholarship = enrollment.scholarshipId
      ? await Scholarship.find(enrollment.scholarshipId)
      : null

    const paymentDay = await this.getPaymentDay(enrollment, contract)
    const discountPercentage = scholarship?.discountPercentage ?? 0

    // Buscar pagamentos futuros não pagos vinculados a essa matrícula
    const futurePayments = await StudentPayment.query()
      .where('studentHasLevelId', enrollment.id)
      .whereIn('status', [...UNPAID_STATUSES])
      .where('type', '!=', 'ENROLLMENT')
      .orderBy('dueDate', 'asc')

    if (futurePayments.length === 0) return

    if (contract.paymentType === 'UPFRONT') {
      await this.updateUpfrontPayments(
        enrollment,
        contract,
        futurePayments,
        paymentDay,
        discountPercentage
      )
    } else {
      await this.updateMonthlyPayments(
        contract,
        futurePayments,
        paymentDay,
        discountPercentage
      )
    }
  }

  private async updateUpfrontPayments(
    enrollment: StudentHasLevel,
    contract: Contract,
    futurePayments: StudentPayment[],
    paymentDay: number,
    discountPercentage: number
  ) {
    const installments = enrollment.installments ?? contract.installments ?? 1
    const totalAmount = contract.ammount
    const installmentAmount = Math.floor(totalAmount / installments)
    const discountedAmount = Math.round(installmentAmount * (1 - discountPercentage / 100))

    const desiredCount = installments
    // Pago + cancelado não são tocados, então contamos quantas parcelas existem no total
    const allPayments = await StudentPayment.query()
      .where('studentHasLevelId', enrollment.id)
      .where('type', '!=', 'ENROLLMENT')
      .orderBy('installmentNumber', 'asc')

    const paidPayments = allPayments.filter(
      (p) => !UNPAID_STATUSES.includes(p.status as (typeof UNPAID_STATUSES)[number])
    )
    const paidCount = paidPayments.length
    const remainingNeeded = Math.max(0, desiredCount - paidCount)

    // Atualizar as parcelas não pagas existentes
    const toUpdate = futurePayments.slice(0, remainingNeeded)
    for (let i = 0; i < toUpdate.length; i++) {
      const payment = toUpdate[i]
      const installmentNumber = paidCount + i + 1
      const dueDate = DateTime.fromJSDate(new Date(String(payment.dueDate))).set({
        day: Math.min(paymentDay, 28),
      })

      payment.amount = discountedAmount
      payment.totalAmount = installmentAmount
      payment.discountPercentage = discountPercentage
      payment.installments = installments
      payment.installmentNumber = installmentNumber
      payment.contractId = contract.id
      payment.dueDate = dueDate
      await payment.save()
    }

    // Se precisa de mais parcelas, criar as que faltam
    if (toUpdate.length < remainingNeeded) {
      const lastPayment = toUpdate.length > 0
        ? toUpdate[toUpdate.length - 1]
        : paidPayments[paidPayments.length - 1]

      const lastDueDate = lastPayment
        ? DateTime.fromJSDate(new Date(String(lastPayment.dueDate)))
        : DateTime.now()

      for (let i = toUpdate.length; i < remainingNeeded; i++) {
        const installmentNumber = paidCount + i + 1
        const dueDate = lastDueDate.plus({ months: i - toUpdate.length + 1 }).set({
          day: Math.min(paymentDay, 28),
        })

        await StudentPayment.create({
          studentId: enrollment.studentId,
          studentHasLevelId: enrollment.id,
          contractId: contract.id,
          type: 'COURSE',
          amount: discountedAmount,
          totalAmount: installmentAmount,
          month: dueDate.month,
          year: dueDate.year,
          dueDate,
          installments,
          installmentNumber,
          status: 'PENDING',
          discountPercentage,
        })
      }
    }

    // Se sobram parcelas não pagas (reduziu o número de parcelas), cancelar
    const toCancel = futurePayments.slice(remainingNeeded)
    for (const payment of toCancel) {
      payment.status = 'CANCELLED'
      payment.metadata = {
        ...(payment.metadata || {}),
        cancelReason: 'Número de parcelas reduzido na edição da matrícula',
      }
      await payment.save()
    }
  }

  private async updateMonthlyPayments(
    contract: Contract,
    futurePayments: StudentPayment[],
    paymentDay: number,
    discountPercentage: number
  ) {
    const monthlyAmount = contract.ammount
    const discountedAmount = Math.round(monthlyAmount * (1 - discountPercentage / 100))

    for (const payment of futurePayments) {
      const dueDate = DateTime.fromJSDate(new Date(String(payment.dueDate))).set({
        day: Math.min(paymentDay, 28),
      })

      payment.amount = discountedAmount
      payment.totalAmount = monthlyAmount
      payment.discountPercentage = discountPercentage
      payment.contractId = contract.id
      payment.dueDate = dueDate
      await payment.save()
    }
  }

  private async getPaymentDay(
    enrollment: StudentHasLevel,
    contract: Contract
  ): Promise<number> {
    if (enrollment.paymentDay) {
      return enrollment.paymentDay
    }

    const paymentDay = await ContractPaymentDay.query()
      .where('contractId', contract.id)
      .orderBy('day', 'asc')
      .first()

    return paymentDay?.day ?? 5
  }
}
