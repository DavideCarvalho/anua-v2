import type { HttpContext } from '@adonisjs/core/http'
import ContractDocument from '#models/contract_document'
import { ContractDocumentDto } from '#models/dto/contract_document.dto'

export default class ListContractDocumentsController {
  async handle({ request }: HttpContext) {
    const { contractId, schoolId } = request.qs()

    const query = ContractDocument.query().preload('school').orderBy('createdAt', 'desc')

    if (contractId) {
      query.where('contractId', contractId)
    }

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    const contractDocuments = await query

    return ContractDocumentDto.fromArray(contractDocuments)
  }
}
