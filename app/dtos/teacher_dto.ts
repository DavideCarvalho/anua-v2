import { BaseDto } from '@adocasts.com/dto/base'

interface TeacherUser {
  id: string
  name: string
  email: string | null
  active: boolean
}

interface TeacherSubject {
  id: string
  name: string
}

interface TeacherData {
  id: string
  hourlyRate: number | null
  user: TeacherUser
  subjects: TeacherSubject[]
}

export class TeacherDto extends BaseDto {
  declare id: string
  declare hourlyRate: number | null
  declare user: TeacherUser
  declare subjects: TeacherSubject[]

  constructor(teacher: TeacherData) {
    super()
    this.id = teacher.id
    this.hourlyRate = teacher.hourlyRate
    this.user = teacher.user
    this.subjects = teacher.subjects
  }
}

interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
}

export class TeacherListDto extends BaseDto {
  declare data: TeacherDto[]
  declare meta: PaginationMeta

  constructor(teachers: TeacherData[], meta: PaginationMeta) {
    super()
    this.data = teachers.map((t) => new TeacherDto(t))
    this.meta = meta
  }
}
