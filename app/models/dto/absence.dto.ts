import { BaseModelDto } from '@adocasts.com/dto/base'
import type Absence from '#models/absence'
import type { AbsenceReason, AbsenceStatus } from '#models/absence'
import type { DateTime } from 'luxon'

export default class AbsenceDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare date: Date
  declare reason: AbsenceReason
  declare status: AbsenceStatus
  declare description: string | null
  declare rejectionReason: string | null
  declare isExcused: boolean
  declare timesheetEntryId: string | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(absence?: Absence) {
    super()

    if (!absence) return

    this.id = absence.id
    this.userId = absence.userId
    this.date = absence.date.toJSDate()
    this.reason = absence.reason
    this.status = absence.status
    this.description = absence.description
    this.rejectionReason = absence.rejectionReason
    this.isExcused = absence.isExcused
    this.timesheetEntryId = absence.timesheetEntryId
    this.createdAt = absence.createdAt.toJSDate()
    this.updatedAt = absence.updatedAt.toJSDate()
  }
}
