import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import { listPostsValidator } from '#validators/post'

export default class ListPostsController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(listPostsValidator)
    const page = data.page ?? 1
    const limit = data.limit ?? 20

    const query = Post.query()
      .preload('user')
      .preload('school')
      .withCount('likes')
      .withCount('comments')

    if (data.schoolId) {
      query.where('schoolId', data.schoolId)
    }

    // Validator provides authorId, model uses userId
    if (data.authorId) {
      query.where('userId', data.authorId)
    }

    if (data.type) {
      query.where('type', data.type)
    }

    if (data.visibility) {
      query.where('visibility', data.visibility)
    }

    const posts = await query.orderBy('createdAt', 'desc').paginate(page, limit)

    return response.ok(posts)
  }
}
