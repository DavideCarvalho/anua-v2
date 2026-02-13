import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import Comment from '#models/comment'
import { createCommentValidator } from '#validators/post'
import { randomUUID } from 'node:crypto'
import AppException from '#exceptions/app_exception'

export default class CreateCommentController {
  async handle({ params, request, response, auth }: HttpContext) {
    const { postId } = params
    const data = await request.validateUsing(createCommentValidator)

    const post = await Post.find(postId)

    if (!post) {
      throw AppException.notFound('Post não encontrado')
    }

    const comment = await Comment.create({
      uuid: randomUUID(),
      comment: data.content,
      postId: post.id,
      userId: auth.user!.id,
    })

    await comment.load('user')

    return response.created(comment)
  }
}
