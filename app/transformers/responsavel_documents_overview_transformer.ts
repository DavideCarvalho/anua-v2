import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentDocumentSubmission from '#models/student_document_submission'
import type ContractDocument from '#models/contract_document'

/**
 * Visão consolidada de documentos pra um aluno na perspectiva do responsável.
 * Devolve:
 *   - lista de submissions já feitas (com files, status, motivo de rejeição)
 *   - documentos contratuais ainda não submetidos
 *   - summary com contagens pro eixo Documentação
 */
export interface ResponsavelDocumentsOverviewResource {
  submissions: StudentDocumentSubmission[]
  missingDocuments: ContractDocument[]
  reviewerNamesById: Map<string, string>
}

export default class ResponsavelDocumentsOverviewTransformer extends BaseTransformer<ResponsavelDocumentsOverviewResource> {
  toObject() {
    const { submissions, missingDocuments, reviewerNamesById } = this.resource

    const submissionsOut = submissions.map((sub) => ({
      id: sub.id,
      contractDocumentId: sub.contractDocumentId,
      status: sub.status,
      rejectionReason: sub.rejectionReason,
      reviewedAt: sub.reviewedAt?.toISO() ?? null,
      reviewerName: sub.reviewedBy ? (reviewerNamesById.get(sub.reviewedBy) ?? null) : null,
      submittedAt: sub.submittedAt?.toISO() ?? null,
      createdAt: sub.createdAt.toISO(),
      documentType: sub.contractDocument
        ? {
            id: sub.contractDocument.id,
            name: sub.contractDocument.name,
            description: sub.contractDocument.description,
            isRequired: sub.contractDocument.required,
          }
        : null,
      files: (sub.files ?? []).map((f) => ({
        id: f.id,
        fileName: f.fileName,
        fileUrl: f.fileUrl,
        mimeType: f.mimeType,
        size: f.size,
        ord: f.ord,
      })),
    }))

    const missingOut = missingDocuments.map((cd) => ({
      id: cd.id,
      name: cd.name,
      description: cd.description,
      isRequired: cd.required,
    }))

    const total = submissions.length
    const pending = submissions.filter((s) => s.status === 'PENDING').length
    const approved = submissions.filter((s) => s.status === 'APPROVED').length
    const rejected = submissions.filter((s) => s.status === 'REJECTED').length
    const requiredMissing = missingDocuments.filter((d) => d.required).length

    return {
      submissions: submissionsOut,
      missingDocuments: missingOut,
      summary: {
        total,
        pending,
        approved,
        rejected,
        requiredMissing,
      },
    }
  }
}
