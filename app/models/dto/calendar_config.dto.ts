import { BaseModelDto } from '@adocasts.com/dto/base'
import type CalendarConfig from '#models/calendar_config'

export default class CalendarConfigDto extends BaseModelDto {
  declare id: string
  declare classesConfig: Record<string, unknown> | null
  declare classesClashConfig: Record<string, unknown> | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(calendarConfig?: CalendarConfig) {
    super()

    if (!calendarConfig) return

    this.id = calendarConfig.id
    this.classesConfig = calendarConfig.classesConfig
    this.classesClashConfig = calendarConfig.classesClashConfig
    this.createdAt = calendarConfig.createdAt.toJSDate()
    this.updatedAt = calendarConfig.updatedAt.toJSDate()
  }
}
