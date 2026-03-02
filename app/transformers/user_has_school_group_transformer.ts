import { BaseTransformer } from '@adonisjs/core/transformers'
import type UserHasSchoolGroup from '#models/user_has_school_group'
import UserTransformer from '#transformers/user_transformer'
import SchoolGroupTransformer from '#transformers/school_group_transformer'

export default class UserHasSchoolGroupTransformer extends BaseTransformer<UserHasSchoolGroup> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'userId', 'schoolGroupId', 'createdAt', 'updatedAt']),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user)),
      schoolGroup: SchoolGroupTransformer.transform(this.whenLoaded(this.resource.schoolGroup)),
    }
  }
}
