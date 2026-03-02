import type { HttpContext } from '@adonisjs/core/http'
import ContractDocument from '#models/contract_document'
import ContractDocumentTransformer from '#transformers/contract_document_transformer'
import { listContractDocumentsValidator } from '#validators/contract'

export default class ListContractDocumentsController {
  async handle({ request, serialize }: HttpContext) {
    const filters = await request.validateUsing(listContractDocumentsValidator)
    const contractId = filters.contractId
    const schoolId = filters.schoolId
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20

    const query = ContractDocument.query().preload('school').orderBy('createdAt', 'desc')

    if (contractId) {
      query.where('contractId', contractId)
    }

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    const contractDocuments = await query.paginate(page, limit)
    const data = contractDocuments.all()
    const metadata = contractDocuments.getMeta()

    return serialize(ContractDocumentTransformer.paginate(data, metadata))
  }
}
