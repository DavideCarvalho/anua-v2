import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import Comment from '#models/comment'
import { listCommentsValidator } from '#validators/post'

export default class ListPostCommentsController {
  async handle({ params, request, response }: HttpContext) {
    const { postId } = params
    const { page = 1, limit = 20 } = await request.validateUsing(listCommentsValidator)

    const post = await Post.find(postId)

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    // Get comments for the post
    const comments = await Comment.query()
      .where('postId', post.id)
      .preload('user')
      .withCount('likes')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok(comments)
  }
}
