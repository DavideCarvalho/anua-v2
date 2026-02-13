import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import { updateCommentValidator } from '#validators/post'
import AppException from '#exceptions/app_exception'

export default class UpdateCommentController {
  async handle({ params, request, response, auth }: HttpContext) {
    const { id } = params
    const data = await request.validateUsing(updateCommentValidator)

    const comment = await Comment.find(id)

    if (!comment) {
      throw AppException.notFound('Comentário não encontrado')
    }

    // Only author can update their comment
    if (comment.userId !== auth.user!.id) {
      throw AppException.forbidden('Você só pode editar seus próprios comentários')
    }

    comment.comment = data.content
    await comment.save()

    await comment.load('user')

    return response.ok(comment)
  }
}
