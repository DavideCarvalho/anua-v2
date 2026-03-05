import { BaseModelDto } from '@adocasts.com/dto/base'
import type Class_ from '#models/class'
import LevelDto from './level.dto.js'
import TeacherDto from './teacher.dto.js'
import TeacherHasClassDto from './teacher_has_class.dto.js'
import StudentDto from './student.dto.js'

export default class ClassDetailDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare schoolId: string
  declare levelId: string | null
  declare isArchived: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare level?: LevelDto
  declare students?: StudentDto[]
  declare teachers?: TeacherDto[]
  declare teacherClasses: TeacherHasClassDto[]

  constructor(model?: Class_) {
    super()

    if (!model) return

    this.id = model.id
    this.name = model.name
    this.slug = model.slug
    this.schoolId = model.schoolId
    this.levelId = model.levelId
    this.isArchived = model.isArchived
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()

    this.level = model.level ? new LevelDto(model.level) : undefined
    this.students = model.students ? StudentDto.fromArray(model.students) : undefined
    this.teachers = model.teachers ? TeacherDto.fromArray(model.teachers) : undefined
    this.teacherClasses = model.teacherClasses
      ? TeacherHasClassDto.fromArray(model.teacherClasses)
      : []
  }
}
