import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import locks from '@adonisjs/lock/services/main'
import User from '#models/user'
import {
  clearVerificationState,
  createVerificationCode,
  hasRecentCode,
} from '#services/otp_service'
import OtpCodeMail from '#mails/otp_code_mail'
import { sendCodeValidator } from '#validators/auth'

export default class SendCodeController {
  async handle({ request, response }: HttpContext) {
    try {
      const { email } = await request.validateUsing(sendCodeValidator)
      const normalizedEmail = email.toLowerCase().trim()

      const genericSuccessMessage =
        'Se o e-mail estiver cadastrado, enviaremos um codigo de acesso.'

      // Check if user exists (without account enumeration)
      const user = await User.findBy('email', normalizedEmail)

      if (!user || !user.active) {
        return response.ok({
          message: genericSuccessMessage,
        })
      }

      const lock = locks.createLock(`otp-send:${normalizedEmail}`, '10s')
      const [executed, code] = await lock.run(async () => {
        const hasRecent = await hasRecentCode(normalizedEmail)
        if (hasRecent) {
          return null
        }

        return createVerificationCode(normalizedEmail)
      })

      if (!executed) {
        return response.tooManyRequests({
          message: 'Aguarde alguns segundos e tente novamente.',
        })
      }

      if (!code) {
        return response.tooManyRequests({
          message: 'Aguarde um minuto antes de solicitar outro codigo.',
        })
      }

      // Send email with code
      try {
        console.log(`[OTP] Sending code to ${normalizedEmail}`)
        await mail.send(new OtpCodeMail(normalizedEmail, code))
        console.log(`[OTP] Email sent successfully to ${normalizedEmail}`)
      } catch (mailError) {
        await clearVerificationState(normalizedEmail)
        throw mailError
      }

      return response.ok({
        message: genericSuccessMessage,
      })
    } catch (error) {
      console.error('[OTP] Error sending code:', error)
      return response.internalServerError({
        message: 'Erro ao enviar codigo. Tente novamente.',
      })
    }
  }
}
