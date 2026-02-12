import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import AppException from '#exceptions/app_exception'

export default class ShowPostController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const post = await Post.query()
      .where('id', id)
      .preload('user')
      .preload('school')
      .preload('comments', (query) => {
        query.preload('user').withCount('likes').orderBy('createdAt', 'asc')
      })
      .withCount('likes')
      .withCount('comments')
      .first()

    if (!post) {
      throw AppException.notFound('Post não encontrado')
    }

    // Check if current user liked the post
    const userLiked = await post.related('likes').query().where('userId', auth.user!.id).first()

    return response.ok({
      ...post.toJSON(),
      isLikedByCurrentUser: !!userLiked,
    })
  }
}
