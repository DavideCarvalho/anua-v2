import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import { updatePostValidator } from '#validators/post'

export default class UpdatePostController {
  async handle({ params, request, response, auth }: HttpContext) {
    const { id } = params
    const data = await request.validateUsing(updatePostValidator)

    const post = await Post.find(id)

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    // Only author can update their post - model uses userId not authorId
    if (post.userId !== auth.user!.id) {
      return response.forbidden({ message: 'You can only edit your own posts' })
    }

    post.merge(data)
    await post.save()

    // Model uses user relationship, not author
    await post.load('user')
    await post.load('school')

    return response.ok(post)
  }
}
