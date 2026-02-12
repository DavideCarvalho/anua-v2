import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'
import {
  StudentDocumentsResponseDto,
  StudentDocumentDto,
  DocumentTypeDto,
  MissingDocumentDto,
  DocumentsSummaryDto,
} from '#models/dto/student_documents_response.dto'
import AppException from '#exceptions/app_exception'

interface DocumentRow {
  id: string
  fileName: string
  fileUrl: string
  mimeType: string
  size: string | number
  status: string
  rejectionReason: string | null
  reviewedAt: string | null
  createdAt: string
  contractDocumentId: string
  documentTypeName: string
  documentTypeDescription: string | null
  required: boolean
  reviewerName: string | null
}

interface MissingDocumentRow {
  id: string
  name: string
  description: string | null
  required: boolean
}

interface SummaryRow {
  total: string | number
  pending: string | number
  approved: string | number
  rejected: string | number
}

export default class GetStudentDocumentsController {
  async handle({ params, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver os documentos deste aluno')
    }

    // Get student's documents with contract document info
    const documents = await db.rawQuery(
      `
      SELECT
        sd.id,
        sd."fileName",
        sd."fileUrl",
        sd."mimeType",
        sd.size,
        sd.status,
        sd."rejectionReason",
        sd."reviewedAt",
        sd."createdAt",
        cd.id as "contractDocumentId",
        cd.name as "documentTypeName",
        cd.description as "documentTypeDescription",
        cd.required,
        u.name as "reviewerName"
      FROM "StudentDocument" sd
      JOIN "ContractDocument" cd ON sd."contractDocumentId" = cd.id
      LEFT JOIN "User" u ON sd."reviewedBy" = u.id
      WHERE sd."studentId" = :studentId
      ORDER BY sd."createdAt" DESC
      `,
      { studentId }
    )

    // Get required documents that haven't been uploaded yet
    const missingDocuments = await db.rawQuery(
      `
      SELECT
        cd.id,
        cd.name,
        cd.description,
        cd.required
      FROM "ContractDocument" cd
      JOIN "Student" s ON s."contractId" = cd."contractId"
      WHERE s.id = :studentId
        AND cd.id NOT IN (
          SELECT "contractDocumentId"
          FROM "StudentDocument"
          WHERE "studentId" = :studentId
        )
      ORDER BY cd.required DESC, cd.name
      `,
      { studentId }
    )

    // Get summary stats
    const summary = await db.rawQuery(
      `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected
      FROM "StudentDocument"
      WHERE "studentId" = :studentId
      `,
      { studentId }
    )

    // Count required missing documents
    const missingRows = missingDocuments.rows as MissingDocumentRow[]
    const requiredMissing = missingRows.filter((d) => d.required).length

    const documentsList = (documents.rows as DocumentRow[]).map(
      (row) =>
        new StudentDocumentDto({
          id: row.id,
          fileName: row.fileName,
          fileUrl: row.fileUrl,
          mimeType: row.mimeType,
          size: Number(row.size),
          status: row.status,
          rejectionReason: row.rejectionReason,
          reviewedAt: row.reviewedAt,
          createdAt: row.createdAt,
          documentType: new DocumentTypeDto({
            id: row.contractDocumentId,
            name: row.documentTypeName,
            description: row.documentTypeDescription,
            isRequired: row.required,
          }),
          reviewerName: row.reviewerName,
        })
    )

    const missingDocumentsList = missingRows.map(
      (row) =>
        new MissingDocumentDto({
          id: row.id,
          name: row.name,
          description: row.description,
          isRequired: row.required,
        })
    )

    const summaryRow = summary.rows[0] as SummaryRow | undefined
    const summaryData = new DocumentsSummaryDto({
      total: Number(summaryRow?.total || 0),
      pending: Number(summaryRow?.pending || 0),
      approved: Number(summaryRow?.approved || 0),
      rejected: Number(summaryRow?.rejected || 0),
      requiredMissing,
    })

    return new StudentDocumentsResponseDto({
      documents: documentsList,
      missingDocuments: missingDocumentsList,
      summary: summaryData,
    })
  }
}
