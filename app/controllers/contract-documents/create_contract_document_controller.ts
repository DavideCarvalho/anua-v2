import type { HttpContext } from '@adonisjs/core/http'
import { createContractDocumentValidator } from '#validators/contract'
import ContractDocument from '#models/contract_document'
import { ContractDocumentDto } from '#models/dto/contract_document.dto'

export default class CreateContractDocumentController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(createContractDocumentValidator)

    const contractDocument = await ContractDocument.create(payload)

    await contractDocument.load('school')
    await contractDocument.load('contract')

    return new ContractDocumentDto(contractDocument)
  }
}
