import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'

export default class GetStudentDocumentsController {
  async handle({ params, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId } = params

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', user.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.forbidden({
        message: 'Voce nao tem permissao para ver os documentos deste aluno',
      })
    }

    // Get student's documents with contract document info
    const documents = await db.rawQuery(
      `
      SELECT
        sd.id,
        sd.file_name,
        sd.file_url,
        sd.mime_type,
        sd.size,
        sd.status,
        sd.rejection_reason,
        sd.reviewed_at,
        sd.created_at,
        cd.id as contract_document_id,
        cd.name as document_type_name,
        cd.description as document_type_description,
        cd.is_required,
        u.name as reviewer_name
      FROM student_documents sd
      JOIN contract_documents cd ON sd.contract_document_id = cd.id
      LEFT JOIN users u ON sd.reviewed_by = u.id
      WHERE sd.student_id = :studentId
      ORDER BY sd.created_at DESC
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
        cd.is_required
      FROM contract_documents cd
      JOIN students s ON s.contract_id = cd.contract_id
      WHERE s.id = :studentId
        AND cd.id NOT IN (
          SELECT contract_document_id
          FROM student_documents
          WHERE student_id = :studentId
        )
      ORDER BY cd.is_required DESC, cd.name
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
      FROM student_documents
      WHERE student_id = :studentId
      `,
      { studentId }
    )

    // Count required missing documents
    const requiredMissing = missingDocuments.rows.filter((d: any) => d.is_required).length

    return response.ok({
      documents: documents.rows.map((row: any) => ({
        id: row.id,
        fileName: row.file_name,
        fileUrl: row.file_url,
        mimeType: row.mime_type,
        size: Number(row.size),
        status: row.status,
        rejectionReason: row.rejection_reason,
        reviewedAt: row.reviewed_at,
        createdAt: row.created_at,
        documentType: {
          id: row.contract_document_id,
          name: row.document_type_name,
          description: row.document_type_description,
          isRequired: row.is_required,
        },
        reviewerName: row.reviewer_name,
      })),
      missingDocuments: missingDocuments.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        isRequired: row.is_required,
      })),
      summary: {
        total: Number(summary.rows[0]?.total || 0),
        pending: Number(summary.rows[0]?.pending || 0),
        approved: Number(summary.rows[0]?.approved || 0),
        rejected: Number(summary.rows[0]?.rejected || 0),
        requiredMissing,
      },
    })
  }
}
