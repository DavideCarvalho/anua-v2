import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'
import StudentDocumentSubmission from '#models/student_document_submission'
import ContractDocument from '#models/contract_document'
import Student from '#models/student'
import User from '#models/user'
import AppException from '#exceptions/app_exception'
import ResponsavelDocumentsOverviewTransformer from '#transformers/responsavel_documents_overview_transformer'
import { getSignedAssetUrl } from '#lib/storage'

export default class GetStudentDocumentsController {
  async handle({ params, effectiveUser, response, serialize }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params

    // Garante que o usuário logado é responsável por este aluno (IDOR prevention)
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()
    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver os documentos deste aluno')
    }

    const student = await Student.find(studentId)
    if (!student) {
      throw AppException.notFound('Aluno não encontrado')
    }

    const submissions = await StudentDocumentSubmission.query()
      .where('studentId', studentId)
      .preload('contractDocument')
      .preload('files', (q) => q.orderBy('ord', 'asc'))
      .orderBy('createdAt', 'desc')

    // Resolve key → signed URL nos arquivos antes de devolver
    for (const sub of submissions) {
      for (const file of sub.files) {
        file.fileUrl = (await getSignedAssetUrl(file.fileUrl)) ?? file.fileUrl
      }
    }

    // Documentos requeridos pelo contrato que ainda não foram submetidos
    const missingDocuments = student.contractId
      ? await ContractDocument.query()
          .where('contractId', student.contractId)
          .whereNotIn(
            'id',
            submissions.map((s) => s.contractDocumentId)
          )
          .orderBy('required', 'desc')
          .orderBy('name', 'asc')
      : []

    // Reviewer names em batch (evita N+1 sem preload pesado)
    const reviewerIds = Array.from(
      new Set(submissions.map((s) => s.reviewedBy).filter((id): id is string => !!id))
    )
    const reviewerNamesById = new Map<string, string>()
    if (reviewerIds.length > 0) {
      const reviewers = await User.query().whereIn('id', reviewerIds).select(['id', 'name'])
      for (const r of reviewers) {
        reviewerNamesById.set(r.id, r.name)
      }
    }

    return response.ok(
      await serialize(
        ResponsavelDocumentsOverviewTransformer.transform({
          submissions,
          missingDocuments,
          reviewerNamesById,
        })
      )
    )
  }
}
