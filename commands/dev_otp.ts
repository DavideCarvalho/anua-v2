import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { createVerificationCode } from '#services/otp_service'

export default class DevOtp extends BaseCommand {
  static commandName = 'dev:otp'
  static description = 'Gera OTP para um email e printa no terminal (apenas DEV)'

  static options: CommandOptions = { startApp: true }

  @args.string({ description: 'Email do usuário' })
  declare email: string

  async run() {
    const code = await createVerificationCode(this.email, 30)
    this.logger.success(`OTP para ${this.email}: ${code}`)
  }
}
