import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import User from '#models/user'
import { createVerificationCode, hasRecentCode } from '#services/otp_service'
import OtpCodeMail from '#mails/otp_code_mail'
import { sendCodeValidator } from '#validators/auth'

export default class SendCodeController {
  async handle({ request, response }: HttpContext) {
    try {
      const { email } = await request.validateUsing(sendCodeValidator)

      // Check rate limit
      const hasRecent = await hasRecentCode(email)
      if (hasRecent) {
        return response.tooManyRequests({
          message: 'Aguarde um minuto antes de solicitar outro código.',
        })
      }

      // Check if user exists
      const user = await User.findBy('email', email)

      if (!user) {
        return response.notFound({
          message: 'Não encontramos uma conta com esse e-mail.',
        })
      }

      if (!user.active) {
        return response.forbidden({
          message: 'Sua conta está inativa. Entre em contato com o suporte.',
        })
      }

      // Generate OTP code using cache
      const code = await createVerificationCode(email)

      // Send email with code
      console.log(`[OTP] Sending code to ${email}`)
      await mail.send(new OtpCodeMail(email, code))
      console.log(`[OTP] Email sent successfully to ${email}`)

      return response.ok({
        message: 'Código enviado para seu e-mail!',
      })
    } catch (error) {
      console.error('[OTP] Error sending code:', error)
      return response.internalServerError({
        message: 'Erro ao enviar código. Tente novamente.',
      })
    }
  }
}
