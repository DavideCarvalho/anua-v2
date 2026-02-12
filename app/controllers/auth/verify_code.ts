import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import { verifyCode } from '#services/otp_service'
import { verifyCodeValidator } from '#validators/auth'
import AppException from '#exceptions/app_exception'

export default class VerifyCodeController {
  async handle({ request, response, auth }: HttpContext) {
    try {
      const { email, code } = await request.validateUsing(verifyCodeValidator)

      // Verify the code using cache
      const isValid = await verifyCode(email, code)

      if (!isValid) {
        throw AppException.invalidOrExpiredCode()
      }

      // Find the user and log them in
      const user = await User.findBy('email', email)

      if (!user) {
        throw AppException.invalidOrExpiredCode()
      }

      if (!user.active) {
        throw AppException.forbidden('Sua conta está inativa.')
      }

      await auth.use('web').login(user)

      // Set emailVerifiedAt on first OTP verification (proves email ownership)
      if (!user.emailVerifiedAt) {
        user.emailVerifiedAt = DateTime.now()
        await user.save()
      }

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
      if (error instanceof AppException) {
        throw error
      }

      console.error('[OTP] Error verifying code:', error)
      throw error
    }
  }
}
