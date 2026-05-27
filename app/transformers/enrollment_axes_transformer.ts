import type StudentHasLevel from '#models/student_has_level'
import type StudentPayment from '#models/student_payment'
import type Class_ from '#models/class'
import type { AxesStatus } from '#services/enrollment_axes_service'

interface TransformInput {
  matricula: StudentHasLevel
  axes: AxesStatus
  enrollmentPayment: StudentPayment | null
  allocatedClass: Class_ | null
  enrollmentDeadline: string | null
}

export default class EnrollmentAxesTransformer {
  static transform(input: TransformInput) {
    const { matricula, axes, enrollmentPayment, allocatedClass, enrollmentDeadline } = input

    return {
      id: matricula.id,
      studentId: matricula.studentId,
      studentName: matricula.student?.user?.name ?? null,
      levelName: matricula.level?.name ?? null,
      academicPeriodName: matricula.academicPeriod?.name ?? null,
      academicPeriodSegment: matricula.academicPeriod?.segment ?? null,
      enrollmentDeadline,
      contract: matricula.contract
        ? {
            id: matricula.contract.id,
            name: matricula.contract.name,
            enrollmentValue: matricula.contract.enrollmentValue,
            enrollmentPaymentUntilDays: matricula.contract.enrollmentPaymentUntilDays,
          }
        : null,
      enrollmentPayment: enrollmentPayment
        ? {
            id: enrollmentPayment.id,
            amount: enrollmentPayment.amount,
            totalAmount: enrollmentPayment.totalAmount,
            status: enrollmentPayment.status,
            dueDate: enrollmentPayment.dueDate?.toISO() ?? null,
            paidAt: enrollmentPayment.paidAt?.toISO() ?? null,
            invoiceUrl: enrollmentPayment.invoiceUrl ?? null,
          }
        : null,
      allocatedClass: allocatedClass ? { id: allocatedClass.id, name: allocatedClass.name } : null,
      createdAt: matricula.createdAt.toISO(),
      axes,
    }
  }
}
