import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import { updateCommentValidator } from '#validators/post'

export default class UpdateCommentController {
  async handle({ params, request, response, auth }: HttpContext) {
    const { id } = params
    const data = await request.validateUsing(updateCommentValidator)

    const comment = await Comment.find(id)

    if (!comment) {
      return response.notFound({ message: 'Comment not found' })
    }

    // Only author can update their comment
    if (comment.authorId !== auth.user!.id) {
      return response.forbidden({ message: 'You can only edit your own comments' })
    }

    comment.content = data.content
    await comment.save()

    await comment.load('author')

    return response.ok(comment)
  }
}
