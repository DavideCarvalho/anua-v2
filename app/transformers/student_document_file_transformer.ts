import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentDocumentFile from '#models/student_document_file'

export default class StudentDocumentFileTransformer extends BaseTransformer<StudentDocumentFile> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'submissionId',
        'fileName',
        'fileUrl',
        'mimeType',
        'size',
        'ord',
        'createdAt',
      ]),
    }
  }
}
