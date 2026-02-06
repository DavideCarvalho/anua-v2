import { BaseModelDto } from '@adocasts.com/dto/base'

export class ScheduleSubjectDto extends BaseModelDto {
  declare id: string
  declare name: string

  constructor(data: { id: string; name: string }) {
    super()
    this.id = data.id
    this.name = data.name
  }
}

export class ScheduleSlotDto extends BaseModelDto {
  declare id: string
  declare startTime: string
  declare endTime: string
  declare isBreak: boolean
  declare subject: ScheduleSubjectDto | null
  declare teacherName: string | null

  constructor(data: {
    id: string
    startTime: string
    endTime: string
    isBreak: boolean
    subject: ScheduleSubjectDto | null
    teacherName: string | null
  }) {
    super()
    this.id = data.id
    this.startTime = data.startTime
    this.endTime = data.endTime
    this.isBreak = data.isBreak
    this.subject = data.subject
    this.teacherName = data.teacherName
  }
}

export class ScheduleDayDto extends BaseModelDto {
  declare label: string
  declare slots: ScheduleSlotDto[]

  constructor(data: { label: string; slots: ScheduleSlotDto[] }) {
    super()
    this.label = data.label
    this.slots = data.slots
  }
}

export class SubjectWithTeacherDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare teacherName: string | null

  constructor(data: { id: string; name: string; teacherName: string | null }) {
    super()
    this.id = data.id
    this.name = data.name
    this.teacherName = data.teacherName
  }
}

export class StudentScheduleResponseDto extends BaseModelDto {
  declare className: string | null
  declare scheduleByDay: Record<string, ScheduleDayDto>
  declare subjects: SubjectWithTeacherDto[]
  declare message?: string

  constructor(data: {
    className: string | null
    scheduleByDay: Record<string, ScheduleDayDto>
    subjects: SubjectWithTeacherDto[]
    message?: string
  }) {
    super()
    this.className = data.className
    this.scheduleByDay = data.scheduleByDay
    this.subjects = data.subjects
    this.message = data.message
  }
}
