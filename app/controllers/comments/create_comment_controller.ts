import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import Comment from '#models/comment'
import { createCommentValidator } from '#validators/post'
import { randomUUID } from 'node:crypto'

export default class CreateCommentController {
  async handle({ params, request, response, auth }: HttpContext) {
    const { postId } = params
    const data = await request.validateUsing(createCommentValidator)

    const post = await Post.find(postId)

    if (!post) {
      return response.notFound({ message: 'Post not found' })
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
