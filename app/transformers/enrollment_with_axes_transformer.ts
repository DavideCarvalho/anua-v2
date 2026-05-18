import { BaseTransformer } from '@adonisjs/core/transformers'

export type DocsAxisStatus = 'COMPLETE' | 'PENDING' | 'REJECTED'
export type SignatureAxisStatus =
  | 'PENDING'
  | 'PARTIALLY_SIGNED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DECLINED'
  | 'NOT_APPLICABLE'
export type PaymentAxisStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'NOT_APPLICABLE'
export type ClassAxisStatus = 'ALLOCATED' | 'PENDING'

export interface EnrollmentRow {
  id: string
  studentId: string
  studentName: string
  studentEmail: string | null
  levelId: string | null
  levelName: string | null
  academicPeriodId: string | null
  academicPeriodName: string | null
  scholarshipId: string | null
  scholarshipName: string | null
  scholarshipDiscount: number | null
  paymentMethod: string | null
  createdAt: string
  axes: {
    docs: {
      status: DocsAxisStatus
      approved: number
      rejected: number
      pending: number
      required: number
    }
    signature: { status: SignatureAxisStatus }
    payment: { status: PaymentAxisStatus }
    classAllocation: { status: ClassAxisStatus }
  }
  isComplete: boolean
}

/**
 * Lista de matrículas com os 4 eixos pré-computados pela query agregada
 * (ver list_enrollments_controller.ts). Cada linha é totalmente self-contained:
 * UI renderiza badges direto sem precisar de N+1.
 */
export default class EnrollmentWithAxesTransformer extends BaseTransformer<EnrollmentRow> {
  toObject() {
    return this.resource
  }
}
