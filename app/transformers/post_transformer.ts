import { BaseTransformer } from '@adonisjs/core/transformers'
import type Post from '#models/post'
import UserTransformer from '#transformers/user_transformer'
import SchoolTransformer from '#transformers/school_transformer'
import CommentTransformer from '#transformers/comment_transformer'

export default class PostTransformer extends BaseTransformer<Post> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'uuid',
        'content',
        'userId',
        'schoolId',
        'createdAt',
        'updatedAt',
      ]),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user)),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      comments: CommentTransformer.transform(this.whenLoaded(this.resource.comments)),
    }
  }
}
