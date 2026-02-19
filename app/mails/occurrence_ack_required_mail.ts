import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

interface OccurrenceAckRequiredMailProps {
  to: string
  responsibleName: string
  studentName: string
  occurrenceTypeLabel: string
  occurrenceText: string
  occurrenceDate: string
  actionUrl: string
  isReminder?: boolean
}

export default class OccurrenceAckRequiredMail extends BaseMail {
  from = env.get('SMTP_FROM_EMAIL')
  subject: string

  constructor(private props: OccurrenceAckRequiredMailProps) {
    super()
    this.subject = props.isReminder
      ? 'Lembrete: registro diario pendente de reconhecimento'
      : 'Novo registro diario para reconhecimento'
  }

  prepare() {
    const intro = this.props.isReminder
      ? 'Este e um lembrete para reconhecer o registro diario abaixo.'
      : 'Um novo registro diario foi criado e precisa do seu reconhecimento.'

    this.message.to(this.props.to)
    this.message.html(`
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">${this.subject}</h2>
        <p>Ola, ${this.props.responsibleName}.</p>
        <p>${intro}</p>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin: 16px 0;">
          <p style="margin: 0 0 6px;"><strong>Aluno:</strong> ${this.props.studentName}</p>
          <p style="margin: 0 0 6px;"><strong>Tipo:</strong> ${this.props.occurrenceTypeLabel}</p>
          <p style="margin: 0 0 6px;"><strong>Data:</strong> ${this.props.occurrenceDate}</p>
          <p style="margin: 0;"><strong>Descricao:</strong> ${this.props.occurrenceText}</p>
        </div>
        <p>Acesse no app: <strong>${this.props.actionUrl}</strong></p>
        <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">Equipe Anua</p>
      </div>
    `)
  }
}
