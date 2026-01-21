import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import CommentLike from '#models/comment_like'
import { randomUUID } from 'node:crypto'

export default class LikeCommentController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const comment = await Comment.find(id)

    if (!comment) {
      return response.notFound({ message: 'Comment not found' })
    }

    // Check if already liked
    const existingLike = await CommentLike.query()
      .where('commentId', id)
      .where('userId', auth.user!.id)
      .first()

    if (existingLike) {
      return response.badRequest({ message: 'You already liked this comment' })
    }

    await CommentLike.create({
      id: randomUUID(),
      commentId: id,
      userId: auth.user!.id,
    })

    // Get updated like count
    const likesCount = await CommentLike.query().where('commentId', id).count('* as total')

    return response.ok({
      message: 'Comment liked successfully',
      likesCount: Number(likesCount[0].$extras.total),
    })
  }
}
