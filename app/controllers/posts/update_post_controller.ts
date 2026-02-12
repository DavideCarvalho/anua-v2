import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Post from '#models/post'
import PostDto from '#models/dto/post.dto'
import { updatePostValidator } from '#validators/post'
import AppException from '#exceptions/app_exception'

export default class UpdatePostController {
  async handle({ params, request, response, auth }: HttpContext) {
    const { id } = params
    const data = await request.validateUsing(updatePostValidator)

    const post = await Post.find(id)

    if (!post) {
      throw AppException.notFound('Post não encontrado')
    }

    // Only author can update their post - model uses userId not authorId
    if (post.userId !== auth.user!.id) {
      throw AppException.forbidden('Você só pode editar seus próprios posts')
    }

    const updatedPost = await db.transaction(async (trx) => {
      post.merge({
        content: data.content ?? post.content,
      })
      await post.useTransaction(trx).save()
      return post
    })

    // Model uses user relationship, not author
    await updatedPost.load('user')
    await updatedPost.load('school')

    return response.ok(new PostDto(updatedPost))
  }
}
