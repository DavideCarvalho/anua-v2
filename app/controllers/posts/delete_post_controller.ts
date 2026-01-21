import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'

export default class DeletePostController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const post = await Post.find(id)

    if (!post) {
      return response.notFound({ message: 'Post not found' })
    }

    // Only author can delete their post (or admin - could add role check here)
    if (post.authorId !== auth.user!.id) {
      return response.forbidden({ message: 'You can only delete your own posts' })
    }

    await post.delete()

    return response.ok({ message: 'Post deleted successfully' })
  }
}
