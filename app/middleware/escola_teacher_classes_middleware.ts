import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class EscolaTeacherClassesMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, request, response } = ctx
    const user = ctx.effectiveUser ?? auth.user

    if (!user) {
      return next()
    }

    if (user.roleId && !user.$preloaded.role) {
      await user.load('role')
    }

    if (user.role?.name !== 'SCHOOL_TEACHER') {
      return next()
    }

    const method = request.method().toUpperCase()
    const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)

    if (!isWriteMethod) {
      return next()
    }

    return response.forbidden({ message: 'Professor não tem permissão para alterar turmas' })
  }
}
