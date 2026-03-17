import { BaseTransformer } from '@adonisjs/core/transformers'

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

export interface SidebarClassData {
  id: string
  name: string
  slug: string
  course: CourseInfo
  academicPeriod: AcademicPeriodInfo
  level: LevelInfo
}

export default class SidebarClassTransformer extends BaseTransformer<SidebarClassData[]> {
  toObject() {
    return {
      data: this.resource,
    }
  }
}
