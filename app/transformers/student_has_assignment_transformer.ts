import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentHasAssignment from '#models/student_has_assignment'
import StudentTransformer from '#transformers/student_transformer'
import AssignmentTransformer from '#transformers/assignment_transformer'

export default class StudentHasAssignmentTransformer extends BaseTransformer<StudentHasAssignment> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'assignmentId',
        'grade',
        'submittedAt',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
      assignment: AssignmentTransformer.transform(this.whenLoaded(this.resource.assignment)),
    }
  }
}
