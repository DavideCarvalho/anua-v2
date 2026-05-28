import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Student from '#models/student'

export default class RequireSelfResponsibleMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.effectiveUser ?? ctx.auth.user

    let allowed = false
    if (user) {
      const student = await Student.find(user.id)
      allowed = student?.isSelfResponsible === true
    }

    if (!allowed) {
      return ctx.response.redirect('/aluno')
    }

    return next()
  }
}
