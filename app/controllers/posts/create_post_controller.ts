import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import { createPostValidator } from '#validators/post'
import { randomUUID } from 'node:crypto'

export default class CreatePostController {
  async handle({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(createPostValidator)

    const post = await Post.create({
      id: randomUUID(),
      ...data,
      authorId: auth.user!.id,
      visibility: data.visibility ?? 'SCHOOL_ONLY',
    })

    await post.load('author')
    await post.load('school')

    return response.created(post)
  }
}
