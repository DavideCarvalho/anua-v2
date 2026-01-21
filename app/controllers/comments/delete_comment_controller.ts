import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'

export default class DeleteCommentController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const comment = await Comment.find(id)

    if (!comment) {
      return response.notFound({ message: 'Comment not found' })
    }

    // Only author can delete their comment
    if (comment.authorId !== auth.user!.id) {
      return response.forbidden({ message: 'You can only delete your own comments' })
    }

    // Delete all replies first
    await Comment.query().where('parentCommentId', id).delete()

    // Delete the comment
    await comment.delete()

    return response.ok({ message: 'Comment deleted successfully' })
  }
}
