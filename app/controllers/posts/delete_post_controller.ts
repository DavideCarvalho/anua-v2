import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import AppException from '#exceptions/app_exception'

export default class DeletePostController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const post = await Post.find(id)

    if (!post) {
      throw AppException.notFound('Post não encontrado')
    }

    // Only author can delete their post (or admin - could add role check here)
    if (post.userId !== auth.user!.id) {
      throw AppException.forbidden('Você só pode excluir seus próprios posts')
    }

    await post.delete()

    return response.ok({ message: 'Post excluído com sucesso' })
  }
}
