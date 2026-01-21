import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import { listPostsValidator } from '#validators/post'

export default class ListPostsController {
  async handle({ request, response }: HttpContext) {
    const {
      schoolId,
      classId,
      authorId,
      type,
      visibility,
      page = 1,
      limit = 20,
    } = await request.validateUsing(listPostsValidator)

    const query = Post.query()
      .preload('author')
      .preload('school')
      .withCount('likes')
      .withCount('comments')

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    if (classId) {
      query.where('classId', classId)
    }

    if (authorId) {
      query.where('authorId', authorId)
    }

    if (type) {
      query.where('type', type)
    }

    if (visibility) {
      query.where('visibility', visibility)
    }

    const posts = await query
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok(posts)
  }
}
