import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import UserLikedPost from '#models/user_liked_post'

export default class UnlikePostController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const post = await Post.find(id)

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    const like = await UserLikedPost.query()
      .where('postId', id)
      .where('userId', auth.user!.id)
      .first()

    if (!like) {
      return response.badRequest({ message: 'You have not liked this post' })
    }

    await like.delete()

    // Get updated like count
    const likesCount = await UserLikedPost.query().where('postId', id).count('* as total')

    return response.ok({
      message: 'Post unliked successfully',
      likesCount: Number(likesCount[0].$extras.total),
    })
  }
}
