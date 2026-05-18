import { BaseTransformer } from '@adonisjs/core/transformers'
import type School from '#models/school'
import type AcademicPeriod from '#models/academic_period'
import type Course from '#models/course'
import type Level from '#models/level'
import type Contract from '#models/contract'
import type ContractDocument from '#models/contract_document'

/**
 * Resposta combinada da rota pública de matrícula online —
 * mostra o que o responsável precisa ver pra iniciar a matrícula
 * em um curso de uma escola num período letivo específico.
 *
 * Esta é a única resposta dessa forma, por isso transformer dedicado.
 */
export interface SchoolEnrollmentInfoResource {
  school: School
  academicPeriod: AcademicPeriod
  course: Course
  level: Level
  contract: Contract | null
  requiredDocuments: ContractDocument[]
}

export default class SchoolEnrollmentInfoTransformer extends BaseTransformer<SchoolEnrollmentInfoResource> {
  toObject() {
    const { school, academicPeriod, course, level, contract, requiredDocuments } = this.resource

    return {
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        logoUrl: school.logoUrl,
        // Indica se a escola tem gateway de pagamento online ativo. Quando
        // false, o form público pula a etapa de seleção de pagamento e a
        // escola entra em contato pra combinar a forma de pagamento.
        hasOnlinePayment: school.paymentConfigStatus === 'ACTIVE',
      },
      academicPeriod: {
        id: academicPeriod.id,
        name: academicPeriod.name,
        slug: academicPeriod.slug,
        segment: academicPeriod.segment,
        startDate: academicPeriod.startDate?.toISO() ?? null,
        endDate: academicPeriod.endDate?.toISO() ?? null,
        enrollmentStartDate: academicPeriod.enrollmentStartDate?.toISO() ?? null,
        enrollmentEndDate: academicPeriod.enrollmentEndDate?.toISO() ?? null,
      },
      course: {
        id: course.id,
        name: course.name,
        slug: course.slug,
      },
      level: {
        id: level.id,
        name: level.name,
      },
      contract: contract
        ? {
            id: contract.id,
            enrollmentValue: contract.enrollmentValue,
            amount: contract.ammount,
            paymentType: contract.paymentType,
            enrollmentValueInstallments: contract.enrollmentValueInstallments,
            enrollmentPaymentUntilDays: contract.enrollmentPaymentUntilDays,
            installments: contract.installments,
          }
        : null,
      requiredDocuments: requiredDocuments.map((doc) => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        required: doc.required,
      })),
    }
  }
}
