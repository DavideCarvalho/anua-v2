import { BaseDto } from '@adocasts.com/dto/base'

interface CourseInfo {
  id: string
  name: string
  slug: string
}

interface AcademicPeriodInfo {
  id: string
  name: string
  slug: string
  isActive: boolean
}

interface LevelInfo {
  id: string
  name: string
  slug: string
  order: number | null
}

interface SidebarClassData {
  id: string
  name: string
  slug: string
  course: CourseInfo
  academicPeriod: AcademicPeriodInfo
  level: LevelInfo
}

export class SidebarClassDto extends BaseDto {
  declare id: string
  declare name: string
  declare slug: string
  declare course: CourseInfo
  declare academicPeriod: AcademicPeriodInfo
  declare level: LevelInfo

  constructor(data: SidebarClassData) {
    super()
    this.id = data.id
    this.name = data.name
    this.slug = data.slug
    this.course = data.course
    this.academicPeriod = data.academicPeriod
    this.level = data.level
  }
}

export class SidebarClassListDto extends BaseDto {
  declare data: SidebarClassDto[]

  constructor(classes: SidebarClassData[]) {
    super()
    this.data = classes.map((c) => new SidebarClassDto(c))
  }
}
