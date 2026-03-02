import { BaseTransformer } from '@adonisjs/core/transformers'
import type Comment from '#models/comment'
import UserTransformer from '#transformers/user_transformer'
import PostTransformer from '#transformers/post_transformer'

export default class CommentTransformer extends BaseTransformer<Comment> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'uuid',
        'postId',
        'comment',
        'userId',
        'createdAt',
        'updatedAt',
      ]),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user)),
      post: PostTransformer.transform(this.whenLoaded(this.resource.post)),
    }
  }
}
