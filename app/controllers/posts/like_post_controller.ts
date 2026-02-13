import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import UserLikedPost from '#models/user_liked_post'
import { randomUUID } from 'node:crypto'
import AppException from '#exceptions/app_exception'

export default class LikePostController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const post = await Post.find(id)

    if (!post) {
      throw AppException.notFound('Post não encontrado')
    }

    // Check if already liked
    const existingLike = await UserLikedPost.query()
      .where('postId', id)
      .where('userId', auth.user!.id)
      .first()

    if (existingLike) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    await UserLikedPost.create({
      id: randomUUID(),
      postId: id,
      userId: auth.user!.id,
    })

    // Get updated like count
    const likesCount = await UserLikedPost.query().where('postId', id).count('* as total')

    return response.ok({
      message: 'Post curtido com sucesso',
      likesCount: Number(likesCount[0].$extras.total),
    })
  }
}
