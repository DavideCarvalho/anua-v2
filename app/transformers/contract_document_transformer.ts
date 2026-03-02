import { BaseTransformer } from '@adonisjs/core/transformers'
import type ContractDocument from '#models/contract_document'
import SchoolTransformer from '#transformers/school_transformer'
import ContractTransformer from '#transformers/contract_transformer'
import StudentDocumentTransformer from '#transformers/student_document_transformer'

export default class ContractDocumentTransformer extends BaseTransformer<ContractDocument> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'description',
        'required',
        'schoolId',
        'contractId',
        'createdAt',
        'updatedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      contract: ContractTransformer.transform(this.whenLoaded(this.resource.contract)),
      studentDocuments: StudentDocumentTransformer.transform(
        this.whenLoaded(this.resource.studentDocuments)
      ),
    }
  }
}
