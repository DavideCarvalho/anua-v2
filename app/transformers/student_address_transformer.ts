import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentAddress from '#models/student_address'

export default class StudentAddressTransformer extends BaseTransformer<StudentAddress> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'studentId',
      'street',
      'number',
      'complement',
      'neighborhood',
      'city',
      'state',
      'zipCode',
      'latitude',
      'longitude',
      'location',
    ])
  }
}
