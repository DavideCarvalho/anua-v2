import { BaseModelDto } from '@adocasts.com/dto/base'

export type StudentCalendarSourceType = 'assignment' | 'exam' | 'event'

export class StudentCalendarItemDto extends BaseModelDto {
  declare id: string
  declare sourceType: StudentCalendarSourceType
  declare sourceId: string
  declare title: string
  declare description: string | null
  declare startAt: string
  declare endAt: string | null
  declare allDay: boolean
  declare className: string | null
  declare subjectName: string | null
  declare status: string | null
  declare colorToken: StudentCalendarSourceType

  constructor(data: {
    id: string
    sourceType: StudentCalendarSourceType
    sourceId: string
    title: string
    description: string | null
    startAt: string
    endAt: string | null
    allDay: boolean
    className: string | null
    subjectName: string | null
    status: string | null
    colorToken: StudentCalendarSourceType
  }) {
    super()
    this.id = data.id
    this.sourceType = data.sourceType
    this.sourceId = data.sourceId
    this.title = data.title
    this.description = data.description
    this.startAt = data.startAt
    this.endAt = data.endAt
    this.allDay = data.allDay
    this.className = data.className
    this.subjectName = data.subjectName
    this.status = data.status
    this.colorToken = data.colorToken
  }
}

export class StudentCalendarResponseDto extends BaseModelDto {
  declare items: StudentCalendarItemDto[]
  declare meta: {
    studentId: string
    view: 'list' | 'week' | 'month'
    from: string
    to: string
    timezone: string
  }

  constructor(data: {
    items: StudentCalendarItemDto[]
    meta: {
      studentId: string
      view: 'list' | 'week' | 'month'
      from: string
      to: string
      timezone: string
    }
  }) {
    super()
    this.items = data.items
    this.meta = data.meta
  }
}
