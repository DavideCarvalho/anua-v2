import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import AppException from '#exceptions/app_exception'

export default class DeleteCommentController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const comment = await Comment.find(id)

    if (!comment) {
      throw AppException.notFound('Comentário não encontrado')
    }

    // Only author can delete their comment
    if (comment.userId !== auth.user!.id) {
      throw AppException.forbidden('Você só pode excluir seus próprios comentários')
    }

    // Delete the comment
    await comment.delete()

    return response.ok({ message: 'Comentário excluído com sucesso' })
  }
}
