import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentHasResponsible from '#models/student_has_responsible'
import StudentTransformer from '#transformers/student_transformer'
import UserTransformer from '#transformers/user_transformer'

export default class StudentHasResponsibleTransformer extends BaseTransformer<StudentHasResponsible> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'responsibleId',
        'isPedagogical',
        'isFinancial',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
      responsible: UserTransformer.transform(this.whenLoaded(this.resource.responsible)),
    }
  }
}
