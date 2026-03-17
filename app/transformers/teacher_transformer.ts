import { BaseTransformer } from '@adonisjs/core/transformers'
import type Teacher from '#models/teacher'
import UserTransformer from '#transformers/user_transformer'

export default class TeacherTransformer extends BaseTransformer<Teacher> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'hourlyRate']),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user))?.depth(6),
    }
  }
}
