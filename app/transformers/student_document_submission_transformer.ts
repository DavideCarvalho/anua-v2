import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentDocumentSubmission from '#models/student_document_submission'
import ContractDocumentTransformer from '#transformers/contract_document_transformer'
import StudentTransformer from '#transformers/student_transformer'
import UserTransformer from '#transformers/user_transformer'
import StudentDocumentFileTransformer from '#transformers/student_document_file_transformer'

export default class StudentDocumentSubmissionTransformer extends BaseTransformer<StudentDocumentSubmission> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'contractDocumentId',
        'studentId',
        'status',
        'rejectionReason',
        'reviewedBy',
        'reviewedAt',
        'submittedAt',
        'createdAt',
        'updatedAt',
      ]),
      contractDocument: ContractDocumentTransformer.transform(
        this.whenLoaded(this.resource.contractDocument)
      ),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
      reviewer: UserTransformer.transform(this.whenLoaded(this.resource.reviewer)),
      files: StudentDocumentFileTransformer.transform(this.whenLoaded(this.resource.files)),
    }
  }
}
