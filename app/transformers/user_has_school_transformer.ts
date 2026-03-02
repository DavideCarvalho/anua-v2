import { BaseTransformer } from '@adonisjs/core/transformers'
import type UserHasSchool from '#models/user_has_school'
import UserTransformer from '#transformers/user_transformer'
import SchoolTransformer from '#transformers/school_transformer'

export default class UserHasSchoolTransformer extends BaseTransformer<UserHasSchool> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'userId',
        'schoolId',
        'isDefault',
        'createdAt',
        'updatedAt',
      ]),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user)),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
    }
  }
}
