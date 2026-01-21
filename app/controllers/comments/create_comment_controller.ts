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

    // If replying to a comment, verify it exists and belongs to the same post
    if (data.parentCommentId) {
      const parentComment = await Comment.query()
        .where('id', data.parentCommentId)
        .where('postId', postId)
        .first()

      if (!parentComment) {
        return response.notFound({ message: 'Parent comment not found' })
      }
    }

    const comment = await Comment.create({
      id: randomUUID(),
      content: data.content,
      postId,
      authorId: auth.user!.id,
      parentCommentId: data.parentCommentId ?? null,
    })

    await comment.load('author')

    return response.created(comment)
  }
}
