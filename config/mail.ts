import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const smtpHost = env.get('SMTP_HOST')
const resendKey = env.get('RESEND_API_KEY')

const mailConfig = defineConfig({
  default: resendKey ? 'resend' : 'smtp',

  mailers: {
    ...(smtpHost
      ? {
          smtp: transports.smtp({
            host: smtpHost,
            port: env.get('SMTP_PORT'),
            secure: true,
            auth: {
              type: 'login',
              user: env.get('SMTP_USER'),
              pass: env.get('SMTP_PASSWORD'),
            },
          }),
        }
      : {}),

    ...(resendKey
      ? {
          resend: transports.resend({
            key: resendKey,
            baseUrl: 'https://api.resend.com',
          }),
        }
      : {}),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
