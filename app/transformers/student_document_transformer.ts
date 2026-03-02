import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentDocument from '#models/student_document'
import ContractDocumentTransformer from '#transformers/contract_document_transformer'
import StudentTransformer from '#transformers/student_transformer'
import UserTransformer from '#transformers/user_transformer'

export default class StudentDocumentTransformer extends BaseTransformer<StudentDocument> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'fileName',
        'fileUrl',
        'mimeType',
        'size',
        'status',
        'reviewedBy',
        'reviewedAt',
        'rejectionReason',
        'contractDocumentId',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
      reviewer: UserTransformer.transform(this.whenLoaded(this.resource.reviewer)),
      contractDocument: ContractDocumentTransformer.transform(
        this.whenLoaded(this.resource.contractDocument)
      ),
    }
  }
}
