import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import PostTransformer from '#transformers/post_transformer'
import { listPostsValidator } from '#validators/post'

export default class ListPostsController {
  async handle({ request, serialize }: HttpContext) {
    const filters = await request.validateUsing(listPostsValidator)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20

    const query = Post.query()
      .preload('user')
      .preload('school')
      .withCount('likes')
      .withCount('comments')

    if (filters.schoolId) {
      query.where('schoolId', filters.schoolId)
    }

    // Validator provides authorId, model uses userId
    if (filters.authorId) {
      query.where('userId', filters.authorId)
    }

    if (filters.type) {
      query.where('type', filters.type)
    }

    if (filters.visibility) {
      query.where('visibility', filters.visibility)
    }

    const posts = await query.orderBy('createdAt', 'desc').paginate(page, limit)

    const items = posts.all()
    const metadata = posts.getMeta()

    return serialize(PostTransformer.paginate(items, metadata))
  }
}
