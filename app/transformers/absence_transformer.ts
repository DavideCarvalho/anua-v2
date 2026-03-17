import { BaseTransformer } from '@adonisjs/core/transformers'
import type Absence from '#models/absence'

export default class AbsenceTransformer extends BaseTransformer<Absence> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'userId',
        'date',
        'reason',
        'status',
        'description',
        'rejectionReason',
        'isExcused',
        'timesheetEntryId',
        'createdAt',
        'updatedAt',
      ]),
    }
  }
}
