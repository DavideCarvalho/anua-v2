import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import CommentLike from '#models/comment_like'
import { randomUUID } from 'node:crypto'
import AppException from '#exceptions/app_exception'

export default class LikeCommentController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const comment = await Comment.find(id)

    if (!comment) {
      throw AppException.notFound('Comentário não encontrado')
    }

    // Check if already liked
    const existingLike = await CommentLike.query()
      .where('commentId', id)
      .where('userId', auth.user!.id)
      .first()

    if (existingLike) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    await CommentLike.create({
      id: randomUUID(),
      commentId: id,
      userId: auth.user!.id,
    })

    // Get updated like count
    const likesCount = await CommentLike.query().where('commentId', id).count('* as total')

    return response.ok({
      message: 'Comentário curtido com sucesso',
      likesCount: Number(likesCount[0].$extras.total),
    })
  }
}
