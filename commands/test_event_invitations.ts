import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import SendEventInvitationsJob from '#jobs/events/send_event_invitations_job'

export default class TestEventInvitations extends BaseCommand {
  static commandName = 'test:event-invitations'
  static description =
    'Roda SendEventInvitationsJob síncrono pra testar criação de consents + notificações'

  static options: CommandOptions = { startApp: true }

  @args.string({ description: 'Event ID' })
  declare eventId: string

  async run() {
    await SendEventInvitationsJob.dispatch({
      eventId: this.eventId,
      source: 'test:event-invitations',
    })
    this.logger.success('Job despachado pra fila')
  }
}
