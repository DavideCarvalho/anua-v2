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

    // Get top-level comments with replies
    const comments = await Comment.query()
      .where('postId', postId)
      .whereNull('parentCommentId')
      .preload('author')
      .preload('replies', (query) => {
        query.preload('author').withCount('likes').orderBy('createdAt', 'asc')
      })
      .withCount('likes')
      .withCount('replies')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok(comments)
  }
}
