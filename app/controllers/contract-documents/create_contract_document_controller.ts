import type { HttpContext } from '@adonisjs/core/http'
import { createContractDocumentValidator } from '#validators/contract'
import ContractDocument from '#models/contract_document'
import ContractDocumentTransformer from '#transformers/contract_document_transformer'

export default class CreateContractDocumentController {
  async handle({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createContractDocumentValidator)

    const contractDocument = await ContractDocument.create(payload)

    await contractDocument.load('school')
    await contractDocument.load('contract')

    return serialize(ContractDocumentTransformer.transform(contractDocument))
  }
}
