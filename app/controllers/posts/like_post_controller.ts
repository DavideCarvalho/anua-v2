import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import UserLikedPost from '#models/user_liked_post'
import { randomUUID } from 'node:crypto'

export default class LikePostController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const post = await Post.find(id)

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    // Check if already liked
    const existingLike = await UserLikedPost.query()
      .where('postId', id)
      .where('userId', auth.user!.id)
      .first()

    if (existingLike) {
      return response.badRequest({ message: 'You already liked this post' })
    }

    await UserLikedPost.create({
      id: randomUUID(),
      postId: id,
      userId: auth.user!.id,
    })

    // Get updated like count
    const likesCount = await UserLikedPost.query().where('postId', id).count('* as total')

    return response.ok({
      message: 'Post liked successfully',
      likesCount: Number(likesCount[0].$extras.total),
    })
  }
}
