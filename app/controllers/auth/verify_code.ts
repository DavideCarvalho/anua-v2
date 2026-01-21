import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { verifyCode } from '#services/otp_service'
import { verifyCodeValidator } from '#validators/auth'

export default class VerifyCodeController {
  async handle({ request, response, auth }: HttpContext) {
    try {
      const { email, code } = await request.validateUsing(verifyCodeValidator)

      // Verify the code using cache
      const isValid = await verifyCode(email, code)

      if (!isValid) {
        return response.badRequest({
          message: 'Código inválido ou expirado.',
        })
      }

      // Find the user and log them in
      const user = await User.findByOrFail('email', email)

      if (!user.active) {
        return response.forbidden({
          message: 'Sua conta está inativa.',
        })
      }

      await auth.use('web').login(user)

      return response.ok({
        message: 'Login realizado com sucesso!',
        user: await User.query()
          .where('id', user.id)
          .preload('role')
          .preload('school')
          .preload('schoolChain')
          .firstOrFail(),
      })
    } catch (error) {
      console.error('[OTP] Error verifying code:', error)
      return response.internalServerError({
        message: 'Erro ao verificar código. Tente novamente.',
      })
    }
  }
}
